---
name: Update Rules
description: This skill should be used when the user asks to "update rules", "add a rule", "edit a rule", "remove a rule", "manage rules", or "add rules for a new module". Provides guidance for viewing, adding, modifying, and removing project rules in `.claude/rules/`.
---

# Update Rules

Manage the project's development rules in `.claude/rules/`. Support adding, modifying, and removing rule files, including glob-scoped rules for specific modules or directories.

## Step 1 -- Scan Existing Rules

Read the `.claude/rules/` directory and list every rule file with its metadata.

For each file found:

1. Read the file contents
2. Extract the frontmatter (if present) to determine the `paths` glob pattern
3. Extract the first heading or the `description` frontmatter field

Present a summary table to the user:

```
Current rules in .claude/rules/:

  File                    Glob Scope          Description
  version-control.md      (always loaded)     Version control standards
  typescript.md           **/*.ts, **/*.tsx    TypeScript guidelines
  testing.md              **/*.test.*, ...     Testing standards
  ...
```

If `.claude/rules/` does not exist or is empty, report that no rules are configured and ask if the user wants to run `/setup-project` first.

## Step 2 -- Ask What Operation to Perform

Ask the user which operation to perform:

- **Add** a new rule
- **Modify** an existing rule
- **Remove** an existing rule

Wait for the answer before proceeding.

## Step 3 -- Add a New Rule

If the user chose "add":

### 3a -- Determine Rule Scope

Ask what the rule covers. Examples:

- A new language or framework (e.g., "GraphQL", "React", "Terraform")
- A new module or directory (e.g., "our new payments service in `services/payments/`")
- A cross-cutting concern (e.g., "logging standards", "error handling")
- A team convention (e.g., "naming conventions for our API layer")

### 3b -- Determine Glob Pattern

Based on the scope, suggest an appropriate glob pattern for the rule's `paths` frontmatter. Ask the user to confirm or adjust.

Guidelines for glob patterns:

- Language rules: `**/*.ext` (e.g., `**/*.graphql`, `**/*.tf`)
- Module rules: `path/to/module/**` (e.g., `services/payments/**`)
- Test rules: `**/*.test.*`, `**/*.spec.*`, `**/*_test.*`
- Always-loaded rules: omit the `paths` field entirely
- Multiple patterns: use YAML list format in frontmatter

### 3c -- Determine Content

Ask what specific standards, guidelines, or constraints the rule should encode. Prompt with focused questions:

1. What patterns should be preferred in this scope?
2. What patterns should be avoided?
3. Are there specific libraries, tools, or approaches to enforce?
4. Are there error handling or testing requirements specific to this scope?

### 3d -- Generate the Rule File

Create the rule file at `.claude/rules/<rule-name>.md` with this structure:

```markdown
---
paths:
  - "<glob-pattern>"
description: "<one-line description>"
---

# <Rule Title>

<Rule content organized into clear sections>
```

Choose a kebab-case filename that matches the scope (e.g., `graphql.md`, `payments-service.md`, `logging.md`).

### 3e -- Check for Template

Check if a matching template exists at `${CLAUDE_PLUGIN_ROOT}/assets/templates/rules/`. If one exists, offer to use it as a starting point. If not, generate from the user's answers.

## Step 4 -- Modify an Existing Rule

If the user chose "modify":

### 4a -- Select Rule

If the user did not specify which rule, present the list from Step 1 and ask which rule to modify.

### 4b -- Show Current Content

Read and display the full content of the selected rule file.

### 4c -- Ask What to Change

Ask the user what to change. Common modifications:

- Add a new section or guideline
- Update an existing section
- Change the glob pattern scope
- Remove a section that no longer applies
- Merge content from another rule

### 4d -- Apply Changes

Edit the rule file with the requested changes. Preserve the existing structure and frontmatter unless the user explicitly asks to change them.

Show the user a summary of what changed.

## Step 5 -- Remove a Rule

If the user chose "remove":

### 5a -- Select Rule

If the user did not specify which rule, present the list from Step 1 and ask which rule to remove.

### 5b -- Confirm Deletion

Show the rule's description and glob scope. Ask the user to confirm deletion. Warn that this cannot be undone (unless version-controlled).

### 5c -- Delete the File

Delete the rule file from `.claude/rules/`.

Report the deletion to the user.

## Step 6 -- Repeat or Finish

After completing an operation, ask if the user wants to perform another operation (add, modify, or remove another rule) or finish.

If finishing, present the updated summary table from Step 1 showing the current state of all rules.
