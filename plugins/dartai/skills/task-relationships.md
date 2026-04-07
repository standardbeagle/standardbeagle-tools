---
name: task-relationships
description: Manage dart-query task relationships - subtasks, blockers, blocking, duplicates, related tasks with full replacement semantics
---

# Task Relationships with dart-query

dart-query supports 5 relationship types between tasks. All use **full replacement semantics** - you must send the complete desired array on every update.

> **Access Pattern**: Always call dart-query through slop-mcp:
> ```yaml
> tool: mcp__plugin_slop-mcp_slop-mcp__execute_tool
> params:
>   mcp_name: "dart-query"
>   tool_name: "update_task"  # or "get_task", "create_task"
>   parameters: { ... }
> ```
> See the `dart-query-reference` skill for the full slop-mcp invocation pattern.

## Relationship Types

```yaml
subtask_ids:
  meaning: "Tasks that are children of this task"
  direction: "Parent → Children"
  use_when: "Breaking a task into smaller work items"
  inverse: "parent_task field on child"

blocker_ids:
  meaning: "Tasks that block THIS task from starting/completing"
  direction: "Other → This (incoming blocks)"
  use_when: "This task can't proceed until blockers are done"
  inverse: "blocking_ids on the blocking task"

blocking_ids:
  meaning: "Tasks that THIS task is blocking"
  direction: "This → Other (outgoing blocks)"
  use_when: "Other tasks are waiting on this one"
  inverse: "blocker_ids on the blocked task"

duplicate_ids:
  meaning: "Tasks that are duplicates of this task"
  direction: "Bidirectional"
  use_when: "Same work described in multiple tasks"

related_ids:
  meaning: "Tasks loosely connected to this task"
  direction: "Bidirectional"
  use_when: "Tasks share context but aren't dependent"
```

## Full Replacement Semantics - CRITICAL

```yaml
RULE: "Relationship arrays are REPLACED, not appended"

# If task has blocker_ids: ["A", "B"]
# And you update with blocker_ids: ["C"]
# Result: blocker_ids: ["C"]  -- A and B are GONE

add_pattern:
  # Single call — fetches current, merges, deduplicates automatically
  update_task:
    dart_id: "task_X"
    add_to: { blocker_ids: ["new_blocker"] }

remove_pattern:
  # Single call — fetches current, filters out specified IDs
  update_task:
    dart_id: "task_X"
    remove_from: { blocker_ids: ["resolved_blocker"] }

clear_all:
  # Direct replacement with empty array
  update_task:
    dart_id: "task_X"
    blocker_ids: []

# NOTE: add_to/remove_from cannot be combined with direct field on the same relationship.
# You CAN combine add_to on one field with remove_from on another.
```

---

## Subtask Management

### Create Parent with Subtasks

```yaml
# Option 1: Create parent first, then subtasks with parent_task
create_task:
  title: "Implement user authentication"
  dartboard: "Sprint 5"
  # Returns dart_id: "parent_123"

create_task:
  title: "Add login endpoint"
  dartboard: "Sprint 5"
  parent_task: "parent_123"

create_task:
  title: "Add logout endpoint"
  dartboard: "Sprint 5"
  parent_task: "parent_123"

# Option 2: Create all tasks, then link via subtask_ids
create_task:
  title: "Add login endpoint"
  dartboard: "Sprint 5"
  # Returns: "child_1"

create_task:
  title: "Add logout endpoint"
  dartboard: "Sprint 5"
  # Returns: "child_2"

update_task:
  dart_id: "parent_123"
  subtask_ids: ["child_1", "child_2"]
```

### Query Subtasks

```yaml
# Get top-level tasks only (exclude subtasks)
list_tasks:
  dartboard: "Sprint 5"
  has_parent: false

# Get subtasks only
list_tasks:
  dartboard: "Sprint 5"
  has_parent: true

# Get subtasks of a specific parent
get_task:
  dart_id: "parent_123"
  include_relationships: true
  expand_relationships: true  # Gets subtask titles
```

### Add Subtask to Existing Parent

```yaml
# Step 1: Create new subtask
create_task:
  title: "Add password reset"
  dartboard: "Sprint 5"
  parent_task: "parent_123"
  # Returns: dart_id: "child_3"

# Step 2: Add to parent's subtask list (automatic merge)
update_task:
  dart_id: "parent_123"
  add_to: { subtask_ids: ["child_3"] }
```

### Remove Subtask

```yaml
update_task:
  dart_id: "parent_123"
  remove_from: { subtask_ids: ["child_2"] }
```

---

## Blocker Management

### Set Blockers on a Task

```yaml
# Task B is blocked by Task A
update_task:
  dart_id: "task_B"
  blocker_ids: ["task_A"]

# Equivalently, Task A is blocking Task B
update_task:
  dart_id: "task_A"
  blocking_ids: ["task_B"]
```

### Add Blocker to Task with Existing Blockers

```yaml
update_task:
  dart_id: "task_C"
  add_to: { blocker_ids: ["task_B"] }
  comment: "Added task_B as blocker"
```

### Resolve Blocker (Remove from List)

```yaml
update_task:
  dart_id: "task_C"
  remove_from: { blocker_ids: ["task_A"] }
  comment: "task_A resolved, unblocking"
```

### Find All Blocked Tasks

```yaml
# Get all tasks with full relationship data
list_tasks:
  dartboard: "Sprint 5"
  detail_level: full
  status: "Todo"

# Client-side: filter for tasks where blocker_ids is non-empty
# These are the blocked tasks
```

### Dependency Chain Pattern

```yaml
# Create dependency chain: A → B → C → D
# D depends on C, C depends on B, B depends on A

# Set B blocked by A
update_task:
  dart_id: "task_B"
  blocker_ids: ["task_A"]

# Set C blocked by B
update_task:
  dart_id: "task_C"
  blocker_ids: ["task_B"]

# Set D blocked by C
update_task:
  dart_id: "task_D"
  blocker_ids: ["task_C"]
```

---

## Duplicate Management

### Mark Tasks as Duplicates

```yaml
# Bidirectional: both tasks reference each other
update_task:
  dart_id: "task_1"
  duplicate_ids: ["task_2"]

# Often paired with closing one:
update_task:
  dart_id: "task_2"
  status: "Duplicate"
  duplicate_ids: ["task_1"]
```

### Find Duplicates

```yaml
# Search for similar tasks before creating new ones
search_tasks:
  query: '"login timeout"'
  dartboard: "My Project"
  include_completed: true  # Check done tasks too

# If duplicates found, link them
update_task:
  dart_id: "new_task"
  duplicate_ids: ["existing_task"]
```

---

## Related Tasks

### Link Related Tasks

```yaml
# Loosely connected tasks (shared context, not dependent)
update_task:
  dart_id: "frontend_task"
  related_ids: ["backend_task", "design_task"]
```

### Use Case: Feature Cluster

```yaml
# Group related tasks for a feature
# Frontend, backend, design, docs are related but independent

for_each_task_in_feature:
  update_task:
    dart_id: "${task_id}"
    related_ids: ["${all_other_task_ids_in_feature}"]
```

---

## Relationship Patterns in Batch Operations

### Clear All Blockers on Done Tasks

```yaml
batch_update_tasks:
  selector: "status = 'Done' AND dartboard = 'Sprint 5'"
  updates:
    blocker_ids: []
    blocking_ids: []
  dry_run: true
```

### Tag All Blocked Tasks

```yaml
# Step 1: Find all tasks with relationships
list_tasks:
  dartboard: "Sprint 5"
  detail_level: full
  status: "Todo"

# Step 2: Identify tasks with non-empty blocker_ids
# Step 3: Batch tag them
batch_update_tasks:
  selector: "status = 'Todo' AND dartboard = 'Sprint 5'"
  updates:
    tags: ["blocked_tag_id"]
  dry_run: true
# NOTE: DartQL can't filter by has_blockers directly
# May need client-side filtering + individual updates
```

---

## Relationship Visualization Pattern

### Build Dependency Graph

```yaml
# Step 1: Get all tasks with relationships
list_tasks:
  dartboard: "Sprint 5"
  detail_level: full
  has_parent: false

# Step 2: For tasks with subtasks, get expanded view
get_task:
  dart_id: "${parent_id}"
  include_relationships: true
  expand_relationships: true

# Step 3: Build graph
# - Nodes: tasks
# - Edges: blocker_ids (dependency arrows)
# - Groups: parent → subtask_ids (hierarchy)
# - Dotted: related_ids (loose connections)
# - X marks: duplicate_ids (redundancies)
```

### Execution Order from Dependencies

```yaml
# Find tasks with no blockers (ready to start)
algorithm:
  1: "Get all tasks with detail_level: full"
  2: "Filter: blocker_ids is empty AND status = Todo"
  3: "These are immediately actionable"
  4: "When one completes, re-check: any task whose only blocker was the completed task?"
  5: "Those are now unblocked"
```

---

## Common Mistakes

```yaml
mistake_1:
  what: "Updating blocker_ids without reading current value"
  result: "Overwrites existing blockers"
  fix: "Always GET first, then append/remove, then UPDATE"

mistake_2:
  what: "Setting blocker_ids AND blocking_ids on same task"
  result: "Confusion about direction"
  clarification: |
    blocker_ids = tasks blocking ME (incoming)
    blocking_ids = tasks I am blocking (outgoing)
    Usually set one side; dart-query manages the inverse

mistake_3:
  what: "Using subtask_ids without parent_task"
  result: "One-way relationship"
  fix: "Set parent_task on children OR subtask_ids on parent"

mistake_4:
  what: "Expecting append behavior"
  result: "Lost relationships"
  fix: "ALWAYS read-modify-write for relationship arrays"

mistake_5:
  what: "Wrapping fields in updates: {...} or using task_id/id instead of dart_id"
  result: "API error - update_task uses flat parameters"
  fix: "Pass fields directly: update_task(dart_id: X, blocker_ids: [Y]) not update_task(dart_id: X, updates: {blocker_ids: [Y]})"
```
