---
description: Complete reference for SLOP built-in functions - type conversion, math, strings, collections, pipelines, utilities. SLOP內置函數完整參考，含類型轉換、數學、字符串、集合、管道、工具函數。Use when: looking up function signatures, checking available builtins, pipeline/collection operations.
---

# SLOP Built-in Functions Reference

SLOP全部內置函數完整參考。

---

## Type Functions

### type(value)
返回值的類型名稱（字符串）。

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
類型檢查謂詞。

```python
is_int(42)       # true
is_float(3.14)   # true
is_string("hi")  # true
is_bool(true)    # true
```

### is_list(value), is_map(value), is_set(value)
集合類型檢查。

```python
is_list([1,2,3])  # true
is_map({a: 1})    # true
is_set({1,2,3})   # true
```

### is_none(value)
檢查none值。

```python
is_none(none)  # true
is_none(0)     # false
is_none("")    # false
```

### int(value), float(value), string(value), bool(value)
類型轉換函數。

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
絕對值。

```python
abs(-5)    # 5
abs(5)     # 5
abs(-3.14) # 3.14
```

### min(a, b, ...) / max(a, b, ...)
最小值/最大值。

```python
min(1, 2, 3)     # 1
max(1, 2, 3)     # 3
min([5, 2, 8])   # 2 (with list)
max([5, 2, 8])   # 8 (with list)
```

### pow(base, exponent)
冪運算。

```python
pow(2, 3)   # 8
pow(10, 2)  # 100
```

### sqrt(number)
平方根。

```python
sqrt(16)  # 4.0
sqrt(2)   # 1.414...
```

### round(number, digits=0)
四捨五入至指定小數位。

```python
round(3.7)       # 4
round(3.14159, 2)  # 3.14
```

### floor(number) / ceil(number)
向下/向上取整。

```python
floor(3.7)  # 3
ceil(3.2)   # 4
```

### sum(list)
求和。

```python
sum([1, 2, 3, 4])  # 10
```

---

## String Functions

### len(value)
字符串、列表、映射或集合的長度。

```python
len("hello")   # 5
len([1,2,3])   # 3
len({a:1,b:2}) # 2
```

### upper(string) / lower(string)
大小寫轉換。

```python
upper("hello")  # "HELLO"
lower("HELLO")  # "hello"
```

### strip(string) / lstrip(string) / rstrip(string)
去除空白。

```python
strip("  hello  ")   # "hello"
lstrip("  hello")    # "hello"
rstrip("hello  ")    # "hello"
```

### split(string, delimiter=" ")
分割字符串為列表。

```python
split("a,b,c", ",")     # ["a", "b", "c"]
split("hello world")     # ["hello", "world"]
```

### join(list, delimiter="")
連接列表元素為字符串。

```python
join(["a", "b", "c"], ",")  # "a,b,c"
join(["hello", "world"], " ")  # "hello world"
```

### replace(string, old, new)
替換出現項。

```python
replace("hello world", "world", "SLOP")  # "hello SLOP"
```

### startswith(string, prefix) / endswith(string, suffix)
檢查字符串邊界。

```python
startswith("hello", "he")  # true
endswith("hello", "lo")    # true
```

### contains(string, substring)
檢查是否含子串。

```python
contains("hello world", "world")  # true
```

### find(string, substring)
查找子串索引（未找到返回-1）。

```python
find("hello", "ll")  # 2
find("hello", "x")   # -1
```

### format(template, args...)
字符串格式化。

```python
format("Hello, {}!", "World")  # "Hello, World!"
format("{} + {} = {}", 1, 2, 3)  # "1 + 2 = 3"
```

### repeat(string, count)
重複字符串。

```python
repeat("ab", 3)  # "ababab"
```

---

## List Functions

### append(list, item)
在列表末尾添加元素（返回新列表）。

```python
append([1, 2], 3)  # [1, 2, 3]
```

### prepend(list, item)
在列表頭部添加元素。

```python
prepend([2, 3], 1)  # [1, 2, 3]
```

### pop(list)
移除並返回最後一個元素。

```python
pop([1, 2, 3])  # 3 (list becomes [1, 2])
```

### index(list, item)
查找元素索引（未找到返回-1）。

```python
index([1, 2, 3], 2)  # 1
index([1, 2, 3], 5)  # -1
```

### slice(list, start, end=none)
獲取子列表。

```python
slice([1, 2, 3, 4], 1, 3)  # [2, 3]
slice([1, 2, 3, 4], 2)     # [3, 4]
```

### reverse(list)
反轉列表。

```python
reverse([1, 2, 3])  # [3, 2, 1]
```

### sort(list, key=none, reverse=false)
排序列表。

```python
sort([3, 1, 2])                    # [1, 2, 3]
sort([3, 1, 2], reverse=true)      # [3, 2, 1]
sort(users, key=u -> u.age)        # Sort by age
```

### unique(list)
去除重複項（保留順序）。

```python
unique([1, 2, 2, 3, 3, 3])  # [1, 2, 3]
```

### flatten(list)
展開嵌套列表。

```python
flatten([[1, 2], [3, 4]])  # [1, 2, 3, 4]
```

### concat(list1, list2, ...)
連接列表。

```python
concat([1, 2], [3, 4])  # [1, 2, 3, 4]
```

---

## Map Functions

### keys(map)
獲取鍵列表。

```python
keys({a: 1, b: 2})  # ["a", "b"]
```

### values(map)
獲取值列表。

```python
values({a: 1, b: 2})  # [1, 2]
```

### items(map)
獲取`[key, value]`對列表。

```python
items({a: 1, b: 2})  # [["a", 1], ["b", 2]]
```

### get(map, key, default=none)
帶默認值獲取。

```python
get({a: 1}, "a", 0)  # 1
get({a: 1}, "b", 0)  # 0
```

### has(map, key)
檢查鍵是否存在。

```python
has({a: 1}, "a")  # true
has({a: 1}, "b")  # false
```

### merge(map1, map2, ...)
合並映射（後者值覆蓋前者）。

```python
merge({a: 1}, {b: 2})       # {a: 1, b: 2}
merge({a: 1}, {a: 2})       # {a: 2}
```

### remove(map, key)
移除鍵（返回新映射）。

```python
remove({a: 1, b: 2}, "a")  # {b: 2}
```

---

## Set Functions

### add(set, item)
向集合添加元素（返回新集合）。

```python
add({1, 2}, 3)  # {1, 2, 3}
```

### remove(set, item)
從集合移除元素。

```python
remove({1, 2, 3}, 2)  # {1, 3}
```

### union(set1, set2)
集合並集。

```python
union({1, 2}, {2, 3})  # {1, 2, 3}
```

### intersection(set1, set2)
集合交集。

```python
intersection({1, 2, 3}, {2, 3, 4})  # {2, 3}
```

### difference(set1, set2)
集合差集。

```python
difference({1, 2, 3}, {2, 3})  # {1}
```

### is_subset(set1, set2)
檢查set1是否為set2子集。

```python
is_subset({1, 2}, {1, 2, 3})  # true
```

---

## Pipeline Functions

### map(iterable, func)
轉換每個元素。

```python
map([1, 2, 3], x -> x * 2)  # [2, 4, 6]

# In pipeline
[1, 2, 3] | map(x -> x * 2)  # [2, 4, 6]
```

### filter(iterable, predicate)
保留匹配謂詞的元素。

```python
filter([1, 2, 3, 4], x -> x > 2)  # [3, 4]

# In pipeline
[1, 2, 3, 4] | filter(x -> x > 2)  # [3, 4]
```

### reduce(iterable, func, initial=none)
歸約為單值。

```python
reduce([1, 2, 3, 4], (acc, x) -> acc + x, 0)  # 10

# In pipeline
[1, 2, 3, 4] | reduce((acc, x) -> acc + x, 0)  # 10
```

### take(iterable, n)
取前n個元素。

```python
take([1, 2, 3, 4, 5], 3)  # [1, 2, 3]

# In pipeline
[1, 2, 3, 4, 5] | take(3)  # [1, 2, 3]
```

### drop(iterable, n)
丟棄前n個元素。

```python
drop([1, 2, 3, 4, 5], 2)  # [3, 4, 5]

# In pipeline
[1, 2, 3, 4, 5] | drop(2)  # [3, 4, 5]
```

### first(iterable, default=none)
獲取第一個元素。

```python
first([1, 2, 3])  # 1
first([])         # none
first([], 0)      # 0
```

### last(iterable, default=none)
獲取最後一個元素。

```python
last([1, 2, 3])  # 3
last([])         # none
```

### any(iterable, predicate=none)
檢查是否有元素匹配。

```python
any([false, true, false])    # true
any([1, 2, 3], x -> x > 2)   # true
```

### all(iterable, predicate=none)
檢查是否所有元素匹配。

```python
all([true, true, true])      # true
all([1, 2, 3], x -> x > 0)   # true
```

### count(iterable, predicate=none)
計數元素（可選匹配謂詞）。

```python
count([1, 2, 3])             # 3
count([1, 2, 3], x -> x > 1) # 2
```

### find(iterable, predicate)
查找第一個匹配元素。

```python
find([1, 2, 3, 4], x -> x > 2)  # 3
find([1, 2], x -> x > 5)        # none
```

### group_by(iterable, key_func)
按鍵分組元素。

```python
users = [{name: "a", age: 20}, {name: "b", age: 20}, {name: "c", age: 30}]
group_by(users, u -> u.age)
# {20: [{name: "a", age: 20}, {name: "b", age: 20}], 30: [{name: "c", age: 30}]}
```

### partition(iterable, predicate)
分為匹配與不匹配兩組。

```python
partition([1, 2, 3, 4], x -> x > 2)  # [[3, 4], [1, 2]]
```

---

## Generator Functions

### range(stop) / range(start, stop) / range(start, stop, step)
生成數字序列。

```python
range(5)        # 0, 1, 2, 3, 4
range(2, 5)     # 2, 3, 4
range(0, 10, 2) # 0, 2, 4, 6, 8
```

### enumerate(iterable)
生成(索引, 值)對。

```python
for i, item in enumerate(["a", "b", "c"]):
    emit(i, item)  # 0 "a", 1 "b", 2 "c"
```

### zip(iterable1, iterable2, ...)
並行迭代。

```python
for a, b in zip([1, 2], ["x", "y"]):
    emit(a, b)  # 1 "x", 2 "y"
```

### repeat(value, times=none)
重複值。

```python
list(repeat("x", 3))  # ["x", "x", "x"]
```

---

## Utility Functions

### print(values...)
輸出（用於調試）。

```python
print("Debug:", value)
```

### len(value)
字符串、列表、映射或集合的長度。

```python
len([1, 2, 3])  # 3
```

### copy(value)
深複製值。

```python
copy({a: [1, 2]})  # Independent copy
```

### assert(condition, message="Assertion failed")
斷言條件為真。

```python
assert(x > 0, "x must be positive")
```

### error(message)
拋出錯誤。

```python
error("Something went wrong")
```

---

## Control Functions

### validate(value, schema)
按模式校驗值。

```python
validate(data, {name: string, age: int})
# Raises error if validation fails
```

### default(value, fallback)
值為none時返回fallback。

```python
default(none, "fallback")  # "fallback"
default("value", "fallback")  # "value"
```

---

## JSON Functions

### json_encode(value)
將值轉為JSON字符串。

```python
json_encode({a: 1, b: [2, 3]})  # '{"a":1,"b":[2,3]}'
```

### json_decode(string)
解析JSON字符串為值。

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
