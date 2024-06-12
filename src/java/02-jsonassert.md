---
title: JSONassert指南
tags:
  - java
  - JSONassert
categories:
  - 测试
  - java
date: 2022-12-02 13:01:55
---

JSONassert是一款轻量级的Java库，用于简化测试中的JSON数据断言。它可以让你轻松地验证JSON响应是否符合预期的结果。

## 比较模式

JSONassert有如下4种比较模式，这些不同的模式为JSON的测试比较定义了不同的行为。每个模式封装了两个底层行为:`可扩展性`和`严格排序`

* `LENIENT`：宽容模式，即实际JSON包含扩展字段，数组顺序不一致也可以通过测试
* `STRICT`：严格模式，即实际JSON不可扩展，数组严格排序才可以通过测试
* `NON_EXTENSIBLE`：非扩展模式，即实际JSON不可扩展，数组顺序不一致也可以通过测试
* `STRICT_ORDER`：严格排序模式，即实际JSON可扩展，但数组严格排序才可以通过测试

Ex:宽容模式

```java
String source = """
{
  "name":"zzq",
  "age":30
}
""";
String target = """
{
  "age":30,
  "name":"zzq",
  "addr":"shandong"
}
""";
JSONAssert.assertEquals(source, target, JSONCompareMode.LENIENT); //pass
```

> addr就是扩展字段，表示多余的。

## 断言

### 验证数组大小

```java
    String names = "{\"names\":[\"Alex\", \"Barbera\", \"Charlie\", \"Xavier\"]}";
    //{names:[4]}指定预期数组大小为4
    JSONAssert.assertEquals(
            "{names:[4]}",
            names,
            new ArraySizeComparator(JSONCompareMode.LENIENT));
    //{names:[3,5]}指定预期数组大小为3和5之间
    JSONAssert.assertEquals(
            "{names:[3,5]}",
            names,
            new ArraySizeComparator(JSONCompareMode.LENIENT));
```

### 正则匹配

```java
String expectedStr = "{entry:{id:x}}";
String actualStr = "{entry:{id:1, id:2}}";
Customization customization = new Customization("entry.id", new RegularExpressionValueMatcher<>("\\d"));
JSONAssert.assertEquals(expectedStr, actualStr, new CustomComparator(JSONCompareMode.STRICT, customization));
```





