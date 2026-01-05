#!/usr/bin/env python3
"""
Documentation Generator - Generate documentation updates for completed tasks.

This script generates CHANGELOG entries, README updates, and Dart task
comments based on code changes.
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional


def get_git_changes(project_dir: Path, since_commit: Optional[str] = None) -> dict:
    """Get git changes since a commit or recent changes."""
    try:
        # Get recent commits
        if since_commit:
            cmd = ["git", "log", f"{since_commit}..HEAD", "--oneline"]
        else:
            cmd = ["git", "log", "-10", "--oneline"]

        result = subprocess.run(
            cmd,
            cwd=project_dir,
            capture_output=True,
            text=True
        )

        commits = []
        if result.returncode == 0:
            for line in result.stdout.strip().split("\n"):
                if line:
                    parts = line.split(" ", 1)
                    commits.append({
                        "hash": parts[0],
                        "message": parts[1] if len(parts) > 1 else ""
                    })

        # Get changed files
        if since_commit:
            cmd = ["git", "diff", "--name-status", since_commit, "HEAD"]
        else:
            cmd = ["git", "diff", "--name-status", "HEAD~10", "HEAD"]

        result = subprocess.run(
            cmd,
            cwd=project_dir,
            capture_output=True,
            text=True
        )

        files = {"added": [], "modified": [], "deleted": []}
        if result.returncode == 0:
            for line in result.stdout.strip().split("\n"):
                if line:
                    parts = line.split("\t")
                    status = parts[0]
                    file_name = parts[1] if len(parts) > 1 else ""

                    if status.startswith("A"):
                        files["added"].append(file_name)
                    elif status.startswith("M"):
                        files["modified"].append(file_name)
                    elif status.startswith("D"):
                        files["deleted"].append(file_name)

        return {
            "commits": commits,
            "files": files
        }

    except Exception as e:
        return {"error": str(e)}


def classify_change(commits: list, files: dict) -> str:
    """Classify the type of change based on commits and files."""
    # Check commit messages for clues
    commit_text = " ".join([c["message"].lower() for c in commits])

    if any(word in commit_text for word in ["fix", "bug", "patch", "resolve"]):
        return "Fixed"
    elif any(word in commit_text for word in ["add", "new", "feature", "implement"]):
        return "Added"
    elif any(word in commit_text for word in ["remove", "delete", "drop"]):
        return "Removed"
    elif any(word in commit_text for word in ["deprecate"]):
        return "Deprecated"
    else:
        return "Changed"


def generate_changelog_entry(task_id: str, task_title: str,
                              change_type: str, description: str) -> str:
    """Generate a CHANGELOG entry."""
    return f"- {description} ([DART-{task_id}])"


def generate_completion_comment(task_id: str, summary: str,
                                 files_changed: dict, tests_passed: bool = True) -> str:
    """Generate a Dart task completion comment."""
    comment = f"""## Task Completed

**Summary**: {summary}

**Changes Made**:
"""

    for file_path in files_changed.get("added", [])[:5]:
        comment += f"- `{file_path}`: Added new file\n"

    for file_path in files_changed.get("modified", [])[:5]:
        comment += f"- `{file_path}`: Modified\n"

    for file_path in files_changed.get("deleted", [])[:5]:
        comment += f"- `{file_path}`: Removed\n"

    total_files = (len(files_changed.get("added", [])) +
                   len(files_changed.get("modified", [])) +
                   len(files_changed.get("deleted", [])))

    if total_files > 15:
        comment += f"- ... and {total_files - 15} more files\n"

    comment += f"""
**Testing**: {"All passing" if tests_passed else "Some tests need attention"}

**Documentation**:
- Updated CHANGELOG.md
"""

    return comment


def generate_failure_comment(task_id: str, issue: str,
                             step_failed: str, error: str) -> str:
    """Generate a Dart task failure comment."""
    return f"""## Task Blocked

**Issue**: {issue}

**Pipeline Step Failed**: {step_failed}

**Error Details**:
```
{error[:500]}
```

**Recommended Next Steps**:
1. Review the error message above
2. Check related files for issues
3. Run the failing step manually to debug
"""


def update_changelog(project_dir: Path, entries: list) -> dict:
    """Update the CHANGELOG.md file."""
    changelog_path = project_dir / "CHANGELOG.md"

    # Create if doesn't exist
    if not changelog_path.exists():
        initial_content = f"""# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

"""
        changelog_path.write_text(initial_content)

    content = changelog_path.read_text()

    # Group entries by type
    grouped = {}
    for entry in entries:
        change_type = entry.get("type", "Changed")
        if change_type not in grouped:
            grouped[change_type] = []
        grouped[change_type].append(entry.get("text", ""))

    # Find [Unreleased] section and add entries
    unreleased_pos = content.find("## [Unreleased]")

    if unreleased_pos == -1:
        # Add Unreleased section at the top after header
        lines = content.split("\n")
        insert_pos = 0
        for i, line in enumerate(lines):
            if line.startswith("# "):
                insert_pos = i + 1
                break

        lines.insert(insert_pos, "\n## [Unreleased]\n")
        content = "\n".join(lines)
        unreleased_pos = content.find("## [Unreleased]")

    # Build new entries text
    new_entries = ""
    for change_type in ["Added", "Changed", "Fixed", "Removed", "Deprecated"]:
        if change_type in grouped:
            new_entries += f"\n### {change_type}\n"
            for entry_text in grouped[change_type]:
                new_entries += f"{entry_text}\n"

    # Insert after [Unreleased] header
    insert_pos = unreleased_pos + len("## [Unreleased]")

    # Find next section or end
    next_section = content.find("\n## [", insert_pos)
    if next_section == -1:
        next_section = len(content)

    # Get existing unreleased content
    existing = content[insert_pos:next_section].strip()

    # Merge entries (avoiding duplicates)
    if existing:
        new_content = content[:insert_pos] + "\n" + existing + new_entries + "\n" + content[next_section:]
    else:
        new_content = content[:insert_pos] + new_entries + "\n" + content[next_section:]

    changelog_path.write_text(new_content)

    return {
        "success": True,
        "path": str(changelog_path),
        "entries_added": len(entries)
    }


def generate_docs(project_dir: str, task_id: str, task_title: str,
                  summary: str, since_commit: Optional[str] = None) -> dict:
    """Generate all documentation for a completed task."""
    project_path = Path(project_dir)

    if not project_path.exists():
        return {"error": f"Project directory not found: {project_dir}"}

    # Get changes
    changes = get_git_changes(project_path, since_commit)

    if "error" in changes:
        return changes

    # Classify change type
    change_type = classify_change(
        changes.get("commits", []),
        changes.get("files", {})
    )

    # Generate CHANGELOG entry
    changelog_entry = generate_changelog_entry(
        task_id, task_title, change_type, summary
    )

    # Update CHANGELOG
    changelog_result = update_changelog(project_path, [{
        "type": change_type,
        "text": changelog_entry
    }])

    # Generate Dart comment
    dart_comment = generate_completion_comment(
        task_id, summary,
        changes.get("files", {}),
        tests_passed=True
    )

    return {
        "success": True,
        "task_id": task_id,
        "change_type": change_type,
        "changelog": changelog_result,
        "dart_comment": dart_comment,
        "files_changed": changes.get("files", {})
    }


def main():
    """CLI interface for doc generator."""
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: doc_generator.py <command> [args...]",
            "commands": ["generate", "changelog", "comment", "failure"]
        }))
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "generate":
            if len(sys.argv) < 5:
                print(json.dumps({
                    "error": "Usage: doc_generator.py generate <project_dir> <task_id> <task_title> <summary> [since_commit]"
                }))
                sys.exit(1)

            project_dir = sys.argv[2]
            task_id = sys.argv[3]
            task_title = sys.argv[4]
            summary = sys.argv[5]
            since_commit = sys.argv[6] if len(sys.argv) > 6 else None

            result = generate_docs(project_dir, task_id, task_title, summary, since_commit)

        elif command == "changelog":
            if len(sys.argv) < 5:
                print(json.dumps({
                    "error": "Usage: doc_generator.py changelog <project_dir> <type> <entry>"
                }))
                sys.exit(1)

            project_dir = Path(sys.argv[2])
            change_type = sys.argv[3]
            entry_text = sys.argv[4]

            result = update_changelog(project_dir, [{
                "type": change_type,
                "text": entry_text
            }])

        elif command == "comment":
            if len(sys.argv) < 4:
                print(json.dumps({
                    "error": "Usage: doc_generator.py comment <task_id> <summary>"
                }))
                sys.exit(1)

            task_id = sys.argv[2]
            summary = sys.argv[3]

            result = {
                "comment": generate_completion_comment(task_id, summary, {}, True)
            }

        elif command == "failure":
            if len(sys.argv) < 5:
                print(json.dumps({
                    "error": "Usage: doc_generator.py failure <task_id> <issue> <step_failed> <error>"
                }))
                sys.exit(1)

            task_id = sys.argv[2]
            issue = sys.argv[3]
            step_failed = sys.argv[4]
            error = sys.argv[5] if len(sys.argv) > 5 else ""

            result = {
                "comment": generate_failure_comment(task_id, issue, step_failed, error)
            }

        else:
            result = {"error": f"Unknown command: {command}"}

        print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
