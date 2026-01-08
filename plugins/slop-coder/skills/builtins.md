---
name: slop-builtins
description: Complete reference for SLOP built-in functions - type conversion, math, strings, collections, pipelines, and utilities
---

# SLOP Built-in Functions Reference

Complete reference for all built-in functions available in SLOP.

---

## Type Functions

### type(value)
Returns the type name of a value as a string.

```python
type(42)        # "int"
type(3.14)      # "float"
type("hello")   # "string"
type(true)      # "bool"
type(none)      # "none"
type([1,2,3])   # "list"
type({a: 1})    # "map"
type({1,2,3})   # "set"
```

### is_int(value), is_float(value), is_string(value), is_bool(value)
Type checking predicates.

```python
is_int(42)       # true
is_float(3.14)   # true
is_string("hi")  # true
is_bool(true)    # true
```

### is_list(value), is_map(value), is_set(value)
Collection type checking.

```python
is_list([1,2,3])  # true
is_map({a: 1})    # true
is_set({1,2,3})   # true
```

### is_none(value)
Check for none value.

```python
is_none(none)  # true
is_none(0)     # false
is_none("")    # false
```

### int(value), float(value), string(value), bool(value)
Type conversion functions.

```python
int("42")      # 42
int(3.7)       # 3
float("3.14")  # 3.14
float(42)      # 42.0
string(42)     # "42"
string(true)   # "true"
bool(1)        # true
bool(0)        # false
bool("")       # false
bool("text")   # true
```

---

## Math Functions

### abs(number)
Absolute value.

```python
abs(-5)    # 5
abs(5)     # 5
abs(-3.14) # 3.14
```

### min(a, b, ...) / max(a, b, ...)
Minimum/maximum of arguments.

```python
min(1, 2, 3)     # 1
max(1, 2, 3)     # 3
min([5, 2, 8])   # 2 (with list)
max([5, 2, 8])   # 8 (with list)
```

### pow(base, exponent)
Exponentiation.

```python
pow(2, 3)   # 8
pow(10, 2)  # 100
```

### sqrt(number)
Square root.

```python
sqrt(16)  # 4.0
sqrt(2)   # 1.414...
```

### round(number, digits=0)
Round to specified decimal places.

```python
round(3.7)       # 4
round(3.14159, 2)  # 3.14
```

### floor(number) / ceil(number)
Floor and ceiling.

```python
floor(3.7)  # 3
ceil(3.2)   # 4
```

### sum(list)
Sum all elements.

```python
sum([1, 2, 3, 4])  # 10
```

---

## String Functions

### len(value)
Length of string, list, map, or set.

```python
len("hello")   # 5
len([1,2,3])   # 3
len({a:1,b:2}) # 2
```

### upper(string) / lower(string)
Case conversion.

```python
upper("hello")  # "HELLO"
lower("HELLO")  # "hello"
```

### strip(string) / lstrip(string) / rstrip(string)
Remove whitespace.

```python
strip("  hello  ")   # "hello"
lstrip("  hello")    # "hello"
rstrip("hello  ")    # "hello"
```

### split(string, delimiter=" ")
Split string into list.

```python
split("a,b,c", ",")     # ["a", "b", "c"]
split("hello world")     # ["hello", "world"]
```

### join(list, delimiter="")
Join list elements into string.

```python
join(["a", "b", "c"], ",")  # "a,b,c"
join(["hello", "world"], " ")  # "hello world"
```

### replace(string, old, new)
Replace occurrences.

```python
replace("hello world", "world", "SLOP")  # "hello SLOP"
```

### startswith(string, prefix) / endswith(string, suffix)
Check string boundaries.

```python
startswith("hello", "he")  # true
endswith("hello", "lo")    # true
```

### contains(string, substring)
Check if string contains substring.

```python
contains("hello world", "world")  # true
```

### find(string, substring)
Find index of substring (-1 if not found).

```python
find("hello", "ll")  # 2
find("hello", "x")   # -1
```

### format(template, args...)
String formatting.

```python
format("Hello, {}!", "World")  # "Hello, World!"
format("{} + {} = {}", 1, 2, 3)  # "1 + 2 = 3"
```

### repeat(string, count)
Repeat string.

```python
repeat("ab", 3)  # "ababab"
```

---

## List Functions

### append(list, item)
Add item to end of list (returns new list).

```python
append([1, 2], 3)  # [1, 2, 3]
```

### prepend(list, item)
Add item to beginning of list.

```python
prepend([2, 3], 1)  # [1, 2, 3]
```

### pop(list)
Remove and return last item.

```python
pop([1, 2, 3])  # 3 (list becomes [1, 2])
```

### index(list, item)
Find index of item (-1 if not found).

```python
index([1, 2, 3], 2)  # 1
index([1, 2, 3], 5)  # -1
```

### slice(list, start, end=none)
Get sublist.

```python
slice([1, 2, 3, 4], 1, 3)  # [2, 3]
slice([1, 2, 3, 4], 2)     # [3, 4]
```

### reverse(list)
Reverse list.

```python
reverse([1, 2, 3])  # [3, 2, 1]
```

### sort(list, key=none, reverse=false)
Sort list.

```python
sort([3, 1, 2])                    # [1, 2, 3]
sort([3, 1, 2], reverse=true)      # [3, 2, 1]
sort(users, key=u -> u.age)        # Sort by age
```

### unique(list)
Remove duplicates (preserves order).

```python
unique([1, 2, 2, 3, 3, 3])  # [1, 2, 3]
```

### flatten(list)
Flatten nested lists.

```python
flatten([[1, 2], [3, 4]])  # [1, 2, 3, 4]
```

### concat(list1, list2, ...)
Concatenate lists.

```python
concat([1, 2], [3, 4])  # [1, 2, 3, 4]
```

---

## Map Functions

### keys(map)
Get list of keys.

```python
keys({a: 1, b: 2})  # ["a", "b"]
```

### values(map)
Get list of values.

```python
values({a: 1, b: 2})  # [1, 2]
```

### items(map)
Get list of [key, value] pairs.

```python
items({a: 1, b: 2})  # [["a", 1], ["b", 2]]
```

### get(map, key, default=none)
Get value with default.

```python
get({a: 1}, "a", 0)  # 1
get({a: 1}, "b", 0)  # 0
```

### has(map, key)
Check if key exists.

```python
has({a: 1}, "a")  # true
has({a: 1}, "b")  # false
```

### merge(map1, map2, ...)
Merge maps (later values override).

```python
merge({a: 1}, {b: 2})       # {a: 1, b: 2}
merge({a: 1}, {a: 2})       # {a: 2}
```

### remove(map, key)
Remove key from map (returns new map).

```python
remove({a: 1, b: 2}, "a")  # {b: 2}
```

---

## Set Functions

### add(set, item)
Add item to set (returns new set).

```python
add({1, 2}, 3)  # {1, 2, 3}
```

### remove(set, item)
Remove item from set.

```python
remove({1, 2, 3}, 2)  # {1, 3}
```

### union(set1, set2)
Union of sets.

```python
union({1, 2}, {2, 3})  # {1, 2, 3}
```

### intersection(set1, set2)
Intersection of sets.

```python
intersection({1, 2, 3}, {2, 3, 4})  # {2, 3}
```

### difference(set1, set2)
Difference of sets.

```python
difference({1, 2, 3}, {2, 3})  # {1}
```

### is_subset(set1, set2)
Check if set1 is subset of set2.

```python
is_subset({1, 2}, {1, 2, 3})  # true
```

---

## Pipeline Functions

### map(iterable, func)
Transform each element.

```python
map([1, 2, 3], x -> x * 2)  # [2, 4, 6]

# In pipeline
[1, 2, 3] | map(x -> x * 2)  # [2, 4, 6]
```

### filter(iterable, predicate)
Keep elements matching predicate.

```python
filter([1, 2, 3, 4], x -> x > 2)  # [3, 4]

# In pipeline
[1, 2, 3, 4] | filter(x -> x > 2)  # [3, 4]
```

### reduce(iterable, func, initial=none)
Reduce to single value.

```python
reduce([1, 2, 3, 4], (acc, x) -> acc + x, 0)  # 10

# In pipeline
[1, 2, 3, 4] | reduce((acc, x) -> acc + x, 0)  # 10
```

### take(iterable, n)
Take first n elements.

```python
take([1, 2, 3, 4, 5], 3)  # [1, 2, 3]

# In pipeline
[1, 2, 3, 4, 5] | take(3)  # [1, 2, 3]
```

### drop(iterable, n)
Drop first n elements.

```python
drop([1, 2, 3, 4, 5], 2)  # [3, 4, 5]

# In pipeline
[1, 2, 3, 4, 5] | drop(2)  # [3, 4, 5]
```

### first(iterable, default=none)
Get first element.

```python
first([1, 2, 3])  # 1
first([])         # none
first([], 0)      # 0
```

### last(iterable, default=none)
Get last element.

```python
last([1, 2, 3])  # 3
last([])         # none
```

### any(iterable, predicate=none)
Check if any element matches.

```python
any([false, true, false])    # true
any([1, 2, 3], x -> x > 2)   # true
```

### all(iterable, predicate=none)
Check if all elements match.

```python
all([true, true, true])      # true
all([1, 2, 3], x -> x > 0)   # true
```

### count(iterable, predicate=none)
Count elements (optionally matching predicate).

```python
count([1, 2, 3])             # 3
count([1, 2, 3], x -> x > 1) # 2
```

### find(iterable, predicate)
Find first matching element.

```python
find([1, 2, 3, 4], x -> x > 2)  # 3
find([1, 2], x -> x > 5)        # none
```

### group_by(iterable, key_func)
Group elements by key.

```python
users = [{name: "a", age: 20}, {name: "b", age: 20}, {name: "c", age: 30}]
group_by(users, u -> u.age)
# {20: [{name: "a", age: 20}, {name: "b", age: 20}], 30: [{name: "c", age: 30}]}
```

### partition(iterable, predicate)
Split into matching and non-matching.

```python
partition([1, 2, 3, 4], x -> x > 2)  # [[3, 4], [1, 2]]
```

---

## Generator Functions

### range(stop) / range(start, stop) / range(start, stop, step)
Generate number sequence.

```python
range(5)        # 0, 1, 2, 3, 4
range(2, 5)     # 2, 3, 4
range(0, 10, 2) # 0, 2, 4, 6, 8
```

### enumerate(iterable)
Generate (index, value) pairs.

```python
for i, item in enumerate(["a", "b", "c"]):
    emit(i, item)  # 0 "a", 1 "b", 2 "c"
```

### zip(iterable1, iterable2, ...)
Parallel iteration.

```python
for a, b in zip([1, 2], ["x", "y"]):
    emit(a, b)  # 1 "x", 2 "y"
```

### repeat(value, times=none)
Repeat value.

```python
list(repeat("x", 3))  # ["x", "x", "x"]
```

---

## Utility Functions

### print(values...)
Print to output (for debugging).

```python
print("Debug:", value)
```

### len(value)
Length of string, list, map, or set.

```python
len([1, 2, 3])  # 3
```

### copy(value)
Deep copy value.

```python
copy({a: [1, 2]})  # Independent copy
```

### assert(condition, message="Assertion failed")
Assert condition is true.

```python
assert(x > 0, "x must be positive")
```

### error(message)
Raise an error.

```python
error("Something went wrong")
```

---

## Control Functions

### validate(value, schema)
Validate value against schema.

```python
validate(data, {name: string, age: int})
# Raises error if validation fails
```

### default(value, fallback)
Return fallback if value is none.

```python
default(none, "fallback")  # "fallback"
default("value", "fallback")  # "value"
```

---

## JSON Functions

### json_encode(value)
Convert value to JSON string.

```python
json_encode({a: 1, b: [2, 3]})  # '{"a":1,"b":[2,3]}'
```

### json_decode(string)
Parse JSON string to value.

```python
json_decode('{"a": 1}')  # {a: 1}
```

---

## Quick Reference Table

| Category | Functions |
|----------|-----------|
| Type | `type`, `is_*`, `int`, `float`, `string`, `bool` |
| Math | `abs`, `min`, `max`, `pow`, `sqrt`, `round`, `floor`, `ceil`, `sum` |
| String | `len`, `upper`, `lower`, `strip`, `split`, `join`, `replace`, `find`, `format` |
| List | `append`, `pop`, `index`, `slice`, `reverse`, `sort`, `unique`, `flatten`, `concat` |
| Map | `keys`, `values`, `items`, `get`, `has`, `merge`, `remove` |
| Set | `add`, `remove`, `union`, `intersection`, `difference`, `is_subset` |
| Pipeline | `map`, `filter`, `reduce`, `take`, `drop`, `first`, `last`, `any`, `all`, `find`, `group_by` |
| Generator | `range`, `enumerate`, `zip`, `repeat` |
| Control | `assert`, `error`, `validate`, `default` |
| JSON | `json_encode`, `json_decode` |
