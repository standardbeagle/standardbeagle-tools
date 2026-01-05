---
name: config
description: Configure dartai settings for the current project
---

# Configure DartAI

Set up project-specific configuration for the dartai plugin.

## Process

### 1. Check Current Config

Look for `.claude/dartai.local.md`:
```
Use Read tool to check if config exists
```

### 2. Interactive Configuration

Guide user through settings:

#### Default Dartboard
```
Available dartboards:
1. Personal/standardbeagle-tools
2. General/SB Tasks
3. [other dartboards from Dart MCP]

Select default dartboard (1-N):
```

#### Quality Pipeline Settings
```
Configure quality checks:
- Run linting? (yes/no) [default: yes]
- Run tests? (yes/no) [default: yes]
- LCI evaluation? (yes/no) [default: yes]
- Deprecated cleanup? (yes/no) [default: yes]
- Auto-refactor? (yes/no) [default: no]
```

#### Documentation Settings
```
Documentation updates:
- Update CHANGELOG? (yes/no) [default: yes]
- Update README? (yes/no) [default: no]
- Add Dart comments? (yes/no) [default: yes]
```

#### Loop Settings
```
Ralph Wiggum loop settings:
- Max consecutive tasks: [default: unlimited]
- Pause between tasks: (yes/no) [default: no]
- Auto-commit changes: (yes/no) [default: no]
```

### 3. Write Configuration

Create `.claude/dartai.local.md`:

```markdown
# DartAI Configuration

## Default Dartboard
[selected dartboard name]

## Quality Pipeline
- linting: true
- testing: true
- lci_evaluation: true
- deprecated_cleanup: true
- auto_refactor: false

## Documentation
- changelog: true
- readme: false
- dart_comments: true

## Loop Settings
- max_tasks: unlimited
- pause_between: false
- auto_commit: false

## Custom Commands
### Linting
`npm run lint` or `go vet ./...`

### Testing
`npm test` or `go test ./...`

### Build
`npm run build` or `go build ./...`
```

### 4. Add to .gitignore

Ensure `.claude/dartai.local.md` is in `.gitignore`:
```
.claude/*.local.md
```

## Usage

```
/dartai:config
```

## Configuration File Location

Config is stored at: `.claude/dartai.local.md`

This file is local and should not be committed (add to .gitignore).
