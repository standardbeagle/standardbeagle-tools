---
name: Add Skill
description: This skill should be used when the user asks to "add a skill", "create a skill", "new skill", "codify a pattern", or "make a reusable workflow". Provides guidance for creating project-specific skills in `.claude/skills/`.
---

# Add Skill

Create a new project-specific skill in `.claude/skills/` that codifies a recurring pattern into a reusable workflow.

## Step 1 -- Identify the Pattern

Ask the user what recurring task or pattern the skill should codify. Prompt with examples:

- "Adding a new API endpoint with tests and validation"
- "Creating a new React component with styles, tests, and storybook entry"
- "Setting up a new microservice with boilerplate"
- "Running a specific code review checklist"
- "Performing a database migration with rollback plan"

If the user is unsure, ask: "What task do you find yourself explaining to Claude repeatedly? That is a good candidate for a skill."

Wait for the answer before proceeding.

## Step 2 -- Gather Skill Details

Ask the user the following questions. Collect all answers before generating.

### 2a -- Name and Triggers

Ask what to name the skill (kebab-case). Suggest a name based on the pattern described.

Ask what phrases should trigger this skill. The description frontmatter must list these trigger phrases so Claude activates the skill at the right time. Suggest 3-5 triggers based on the pattern.

### 2b -- Steps and Structure

Ask the user to describe the steps involved. Probe with:

1. What is the first thing to do? (e.g., scan existing code, ask a question, read a file)
2. What files or directories are created or modified?
3. Are there validation checks or quality gates?
4. What does "done" look like?

### 2c -- References and Scripts

Ask if the skill needs:

- **Reference files** (e.g., example code, templates, schemas) -- stored in `references/` subdirectory
- **Scripts** (e.g., shell scripts for automation, validation) -- stored in `scripts/` subdirectory

If neither is needed, skip subdirectory creation.

## Step 3 -- Validate Conventions

Before generating, verify the skill follows these conventions:

- **Filename**: `.claude/skills/<skill-name>/SKILL.md`
- **Frontmatter `name`**: Title Case, concise
- **Frontmatter `description`**: Third-person form ("This skill should be used when the user asks to..."), lists trigger phrases in quotes
- **Body**: Imperative form ("Read the file", "Ask the user", "Create the directory")
- **Length**: Under 2000 words total
- **Steps**: Numbered with `##` headings, use `--` separator (e.g., `## Step 1 -- Description`)
- **Sub-steps**: Lettered with `###` headings (e.g., `### 3a -- Detail`)
- **No placeholders left behind**: All generated content must be concrete and usable

Report any convention violations to the user before writing.

## Step 4 -- Generate the SKILL.md

Create the skill file at `.claude/skills/<skill-name>/SKILL.md` with this structure:

```markdown
---
name: <Skill Name>
description: This skill should be used when the user asks to "<trigger 1>", "<trigger 2>", "<trigger 3>". Provides guidance for <what the skill does>.
---

# <Skill Name>

<One-sentence summary of what this skill does.>

## Step 1 -- <First Step>

<Instructions in imperative form.>

## Step 2 -- <Second Step>

<Instructions in imperative form.>

...additional steps...
```

Write the file only after the user confirms the generated content looks correct. If the user requests changes, revise and re-present before writing.

## Step 5 -- Create Supporting Directories

If the skill needs reference files or scripts (identified in Step 2c):

1. Create `.claude/skills/<skill-name>/references/` and populate with reference files
2. Create `.claude/skills/<skill-name>/scripts/` and populate with script files
3. Mark scripts as executable

## Step 6 -- Verify and Report

After writing:

1. Read back the generated file to confirm it was written correctly
2. Count the words -- warn if approaching the 2000-word limit
3. Verify frontmatter parses correctly (name, description with triggers)
4. Verify all `##` step headings use the `Step N -- Description` format

Report the result:

```
Skill created:

  File:        .claude/skills/<skill-name>/SKILL.md
  Triggers:    "<trigger 1>", "<trigger 2>", ...
  Steps:       N steps
  Word count:  NNN / 2000
  References:  [list or "none"]
  Scripts:     [list or "none"]
```
