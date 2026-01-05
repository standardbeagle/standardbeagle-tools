#!/usr/bin/env python3
"""
Quality Checker - Run linting, tests, and LCI evaluation.

This script orchestrates quality checks for code changes made during
task execution.
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional


def detect_project_type(project_dir: Path) -> dict:
    """Detect the project type based on config files."""
    types = []

    if (project_dir / "package.json").exists():
        types.append("javascript")
        if (project_dir / "tsconfig.json").exists():
            types.append("typescript")

    if (project_dir / "go.mod").exists():
        types.append("go")

    if (project_dir / "pyproject.toml").exists() or (project_dir / "setup.py").exists():
        types.append("python")

    if (project_dir / "Cargo.toml").exists():
        types.append("rust")

    return {
        "types": types,
        "primary": types[0] if types else "unknown"
    }


def run_command(cmd: list, cwd: Optional[Path] = None) -> dict:
    """Run a command and return result."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        return {
            "success": result.returncode == 0,
            "exit_code": result.returncode,
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "exit_code": -1,
            "error": "Command timed out after 5 minutes"
        }
    except Exception as e:
        return {
            "success": False,
            "exit_code": -1,
            "error": str(e)
        }


def run_linting(project_dir: Path, project_type: str) -> dict:
    """Run linting for the project type."""
    results = {
        "type": "linting",
        "project_type": project_type,
        "passed": True,
        "checks": []
    }

    if project_type in ["javascript", "typescript"]:
        # ESLint
        eslint_result = run_command(
            ["npx", "eslint", ".", "--ext", ".js,.jsx,.ts,.tsx", "--max-warnings", "0"],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "eslint",
            **eslint_result
        })
        if not eslint_result["success"]:
            results["passed"] = False

        # Prettier check
        prettier_result = run_command(
            ["npx", "prettier", "--check", "."],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "prettier",
            **prettier_result
        })
        # Prettier warnings don't fail the check

    elif project_type == "go":
        # golangci-lint
        lint_result = run_command(
            ["golangci-lint", "run", "./..."],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "golangci-lint",
            **lint_result
        })
        if not lint_result["success"]:
            results["passed"] = False

        # go vet
        vet_result = run_command(
            ["go", "vet", "./..."],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "go vet",
            **vet_result
        })
        if not vet_result["success"]:
            results["passed"] = False

    elif project_type == "python":
        # Ruff
        ruff_result = run_command(
            ["ruff", "check", "."],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "ruff",
            **ruff_result
        })
        if not ruff_result["success"]:
            results["passed"] = False

        # Black check
        black_result = run_command(
            ["black", "--check", "."],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "black",
            **black_result
        })
        # Black formatting issues are warnings

    elif project_type == "rust":
        # Clippy
        clippy_result = run_command(
            ["cargo", "clippy", "--", "-D", "warnings"],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "clippy",
            **clippy_result
        })
        if not clippy_result["success"]:
            results["passed"] = False

    return results


def run_tests(project_dir: Path, project_type: str) -> dict:
    """Run tests for the project type."""
    results = {
        "type": "testing",
        "project_type": project_type,
        "passed": True,
        "checks": []
    }

    if project_type in ["javascript", "typescript"]:
        # npm test
        test_result = run_command(
            ["npm", "test", "--", "--passWithNoTests"],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "npm test",
            **test_result
        })
        if not test_result["success"]:
            results["passed"] = False

    elif project_type == "go":
        # go test
        test_result = run_command(
            ["go", "test", "-v", "./..."],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "go test",
            **test_result
        })
        if not test_result["success"]:
            results["passed"] = False

    elif project_type == "python":
        # pytest
        test_result = run_command(
            ["pytest", "-v"],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "pytest",
            **test_result
        })
        if not test_result["success"]:
            results["passed"] = False

    elif project_type == "rust":
        # cargo test
        test_result = run_command(
            ["cargo", "test"],
            cwd=project_dir
        )
        results["checks"].append({
            "tool": "cargo test",
            **test_result
        })
        if not test_result["success"]:
            results["passed"] = False

    return results


def check_quality(project_dir: str, checks: Optional[list] = None) -> dict:
    """Run quality checks on the project."""
    project_path = Path(project_dir)

    if not project_path.exists():
        return {
            "success": False,
            "error": f"Project directory not found: {project_dir}"
        }

    project_info = detect_project_type(project_path)

    if project_info["primary"] == "unknown":
        return {
            "success": False,
            "error": "Could not detect project type"
        }

    checks_to_run = checks or ["lint", "test"]
    results = {
        "project_dir": str(project_path),
        "project_type": project_info,
        "overall_passed": True,
        "results": []
    }

    if "lint" in checks_to_run:
        lint_results = run_linting(project_path, project_info["primary"])
        results["results"].append(lint_results)
        if not lint_results["passed"]:
            results["overall_passed"] = False

    if "test" in checks_to_run:
        test_results = run_tests(project_path, project_info["primary"])
        results["results"].append(test_results)
        if not test_results["passed"]:
            results["overall_passed"] = False

    return results


def main():
    """CLI interface for quality checker."""
    if len(sys.argv) < 2:
        print(json.dumps({
            "error": "Usage: quality_checker.py <project_dir> [checks...]"
        }))
        sys.exit(1)

    project_dir = sys.argv[1]
    checks = sys.argv[2:] if len(sys.argv) > 2 else None

    try:
        result = check_quality(project_dir, checks)
        print(json.dumps(result, indent=2))

        if not result.get("overall_passed", False):
            sys.exit(1)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
