#!/usr/bin/env python3
"""
Code Reviewer - Analyze code changes for quality issues.

This script performs static analysis on code changes to identify
potential issues, patterns, and improvement opportunities.
"""

import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Optional


# Patterns to check for
REVIEW_PATTERNS = {
    "debug_statements": {
        "description": "Debug statements that should be removed",
        "severity": "error",
        "patterns": {
            "javascript": [
                r"console\.(log|debug|info|warn|error)\s*\(",
                r"debugger\s*;",
            ],
            "typescript": [
                r"console\.(log|debug|info|warn|error)\s*\(",
                r"debugger\s*;",
            ],
            "python": [
                r"^\s*print\s*\(",
                r"^\s*breakpoint\s*\(\s*\)",
                r"^\s*import\s+pdb",
                r"^\s*pdb\.set_trace\s*\(",
            ],
            "go": [
                r"fmt\.Print(ln|f)?\s*\(",
                r"log\.Print(ln|f)?\s*\(",
            ],
        }
    },
    "commented_code": {
        "description": "Commented out code blocks",
        "severity": "warning",
        "patterns": {
            "javascript": [
                r"//\s*(const|let|var|function|if|for|while|return)\s+",
            ],
            "typescript": [
                r"//\s*(const|let|var|function|if|for|while|return|interface|type)\s+",
            ],
            "python": [
                r"#\s*(def|class|if|for|while|return|import)\s+",
            ],
            "go": [
                r"//\s*(func|if|for|var|const|type|return)\s+",
            ],
        }
    },
    "todo_comments": {
        "description": "TODO/FIXME comments that may need attention",
        "severity": "info",
        "patterns": {
            "_all": [
                r"(TODO|FIXME|HACK|XXX|BUG)[\s:]+",
            ]
        }
    },
    "magic_numbers": {
        "description": "Magic numbers that should be constants",
        "severity": "warning",
        "patterns": {
            "_all": [
                r"[^0-9a-zA-Z_]([2-9]\d{2,}|1\d{3,})[^0-9a-zA-Z_]",  # Numbers > 100
            ]
        }
    },
    "long_lines": {
        "description": "Lines exceeding recommended length",
        "severity": "info",
        "max_length": 120
    },
    "security_issues": {
        "description": "Potential security concerns",
        "severity": "error",
        "patterns": {
            "_all": [
                r"(password|secret|api_key|apikey|auth_token)\s*=\s*['\"][^'\"]+['\"]",
                r"eval\s*\(",
                r"exec\s*\(",
            ]
        }
    }
}


def get_file_language(file_path: Path) -> Optional[str]:
    """Determine the language of a file by extension."""
    ext_map = {
        ".js": "javascript",
        ".jsx": "javascript",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".py": "python",
        ".go": "go",
        ".rs": "rust",
    }
    return ext_map.get(file_path.suffix.lower())


def check_patterns(content: str, patterns: list, file_path: str) -> list:
    """Check content against regex patterns."""
    issues = []
    lines = content.split("\n")

    for line_num, line in enumerate(lines, 1):
        for pattern in patterns:
            if re.search(pattern, line, re.IGNORECASE):
                issues.append({
                    "file": file_path,
                    "line": line_num,
                    "content": line.strip()[:100],
                    "pattern": pattern
                })

    return issues


def check_long_lines(content: str, file_path: str, max_length: int = 120) -> list:
    """Check for lines exceeding max length."""
    issues = []
    lines = content.split("\n")

    for line_num, line in enumerate(lines, 1):
        if len(line) > max_length:
            issues.append({
                "file": file_path,
                "line": line_num,
                "length": len(line),
                "max_allowed": max_length
            })

    return issues


def review_file(file_path: Path, checks: Optional[list] = None) -> dict:
    """Review a single file for issues."""
    if not file_path.exists():
        return {"error": f"File not found: {file_path}"}

    language = get_file_language(file_path)
    if not language:
        return {"skipped": True, "reason": "Unsupported file type"}

    try:
        content = file_path.read_text()
    except Exception as e:
        return {"error": f"Could not read file: {e}"}

    checks_to_run = checks or list(REVIEW_PATTERNS.keys())

    results = {
        "file": str(file_path),
        "language": language,
        "issues": [],
        "summary": {
            "errors": 0,
            "warnings": 0,
            "info": 0
        }
    }

    for check_name in checks_to_run:
        if check_name not in REVIEW_PATTERNS:
            continue

        check = REVIEW_PATTERNS[check_name]

        if check_name == "long_lines":
            issues = check_long_lines(content, str(file_path), check.get("max_length", 120))
            for issue in issues:
                issue["check"] = check_name
                issue["description"] = check["description"]
                issue["severity"] = check["severity"]
                results["issues"].append(issue)
                results["summary"][check["severity"]] += 1
        else:
            patterns = check.get("patterns", {})

            # Get patterns for this language or all languages
            lang_patterns = patterns.get(language, []) + patterns.get("_all", [])

            if lang_patterns:
                issues = check_patterns(content, lang_patterns, str(file_path))
                for issue in issues:
                    issue["check"] = check_name
                    issue["description"] = check["description"]
                    issue["severity"] = check["severity"]
                    results["issues"].append(issue)
                    results["summary"][check["severity"]] += 1

    return results


def review_directory(dir_path: Path, checks: Optional[list] = None,
                     exclude_patterns: Optional[list] = None) -> dict:
    """Review all files in a directory."""
    if not dir_path.exists():
        return {"error": f"Directory not found: {dir_path}"}

    exclude = exclude_patterns or [
        "node_modules",
        ".git",
        "dist",
        "build",
        "__pycache__",
        ".venv",
        "vendor",
        "target"
    ]

    results = {
        "directory": str(dir_path),
        "files_reviewed": 0,
        "files_skipped": 0,
        "total_issues": {
            "errors": 0,
            "warnings": 0,
            "info": 0
        },
        "files": []
    }

    for file_path in dir_path.rglob("*"):
        if not file_path.is_file():
            continue

        # Check exclusions
        skip = False
        for exc in exclude:
            if exc in str(file_path):
                skip = True
                break

        if skip:
            continue

        file_result = review_file(file_path, checks)

        if file_result.get("skipped"):
            results["files_skipped"] += 1
            continue

        if file_result.get("error"):
            results["files_skipped"] += 1
            continue

        results["files_reviewed"] += 1

        if file_result["issues"]:
            results["files"].append(file_result)
            for key in ["errors", "warnings", "info"]:
                results["total_issues"][key] += file_result["summary"][key]

    return results


def get_changed_files(project_dir: Path) -> list:
    """Get list of changed files from git."""
    try:
        # Get staged and unstaged changes
        result = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            cwd=project_dir,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return []

        files = result.stdout.strip().split("\n")
        return [f for f in files if f]

    except Exception:
        return []


def review_changes(project_dir: str, checks: Optional[list] = None) -> dict:
    """Review only changed files in the project."""
    project_path = Path(project_dir)

    if not project_path.exists():
        return {"error": f"Project directory not found: {project_dir}"}

    changed_files = get_changed_files(project_path)

    if not changed_files:
        return {
            "message": "No changed files to review",
            "files_reviewed": 0
        }

    results = {
        "project_dir": str(project_path),
        "files_reviewed": 0,
        "total_issues": {
            "errors": 0,
            "warnings": 0,
            "info": 0
        },
        "files": []
    }

    for file_name in changed_files:
        file_path = project_path / file_name

        if not file_path.exists():
            continue

        file_result = review_file(file_path, checks)

        if file_result.get("skipped") or file_result.get("error"):
            continue

        results["files_reviewed"] += 1

        if file_result["issues"]:
            results["files"].append(file_result)
            for key in ["errors", "warnings", "info"]:
                results["total_issues"][key] += file_result["summary"][key]

    return results


def main():
    """CLI interface for code reviewer."""
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: code_reviewer.py <command> <path> [checks...]",
            "commands": ["file", "directory", "changes"]
        }))
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "file":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "File path required"}))
                sys.exit(1)
            file_path = Path(sys.argv[2])
            checks = sys.argv[3:] if len(sys.argv) > 3 else None
            result = review_file(file_path, checks)

        elif command == "directory":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Directory path required"}))
                sys.exit(1)
            dir_path = Path(sys.argv[2])
            checks = sys.argv[3:] if len(sys.argv) > 3 else None
            result = review_directory(dir_path, checks)

        elif command == "changes":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Project directory required"}))
                sys.exit(1)
            project_dir = sys.argv[2]
            checks = sys.argv[3:] if len(sys.argv) > 3 else None
            result = review_changes(project_dir, checks)

        else:
            result = {"error": f"Unknown command: {command}"}

        print(json.dumps(result, indent=2))

        # Exit with error if there are errors
        if isinstance(result, dict) and result.get("total_issues", {}).get("errors", 0) > 0:
            sys.exit(1)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
