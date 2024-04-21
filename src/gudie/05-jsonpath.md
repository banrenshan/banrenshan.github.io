---
title: JsonPath 指南
date: 2024-04-20
categories:
  - java
  - 测试
tags:
  - JsonPath
  - json
---



## 语法


| JsonPath           | 说明                                                         |
| ------------------ | ------------------------------------------------------------ |
| `$`                | 文档根元素                                                   |
| `@`                | 当前元素                                                     |
| `.`或`[]`          | 匹配下级元素                                                 |
| `..`               | 递归匹配所有子元素                                           |
| `*`                | 通配符，匹配下级元素                                         |
| `[]`               | 下标运算符，根据索引获取元素，**XPath索引从1开始，JsonPath索引从0开始** |
| `[start:end:step]` | 数据切片操作，XPath不支持                                    |
| `?()`              | 过滤表达式                                                   |
| `()`               | 脚本表达式，使用底层脚本引擎，XPath不支持                    |

## 过滤器

过滤器是用于过滤数组的逻辑表达式，一个通常的表达式形如：`[?(@.age > 18)]`，可以通过逻辑表达式`&&`或`||`组合多个过滤器表达式，例如`[?(@.price < 10 && @.category == 'fiction')]`，字符串必须用单引号包围，例如`[?(@.color == 'blue')]`。

| 操作符 | 描述     |
| ------ | -------- |
| ==     |          |
| !=     |          |
| <      |          |
| <=     |          |
| >      |          |
| >=     |          |
| =~     | 正则匹配 |

## Demo

```json
{
	"store": {
		"book": [{
				"category": "reference",
				"author": "Nigel Rees",
				"title": "Sayings of the Century",
				"price": 8.95
			}, {
				"category": "fiction",
				"author": "Evelyn Waugh",
				"title": "Sword of Honour",
				"price": 12.99
			}, {
				"category": "fiction",
				"author": "Herman Melville",
				"title": "Moby Dick",
				"isbn": "0-553-21311-3",
				"price": 8.99
			}, {
				"category": "fiction",
				"author": "J. R. R. Tolkien",
				"title": "The Lord of the Rings",
				"isbn": "0-395-19395-8",
				"price": 22.99
			}
		],
		"bicycle": {
			"color": "red",
			"price": 19.95
		}
	}
}
```

| JsonPath                                   | Result                                   |
| ------------------------------------------ | ---------------------------------------- |
| `$.store.book[*].author`                   | 所有book的author节点                     |
| `$..author`                                | 所有author节点                           |
| `$.store.*`                                | store下的所有节点，book数组和bicycle节点 |
| `$.store..price`                           | store下的所有price节点                   |
| `$..book[2]`                               | 匹配第3个book节点                        |
| `$..book[(@.length-1)]`，或 `$..book[-1:]` | 匹配倒数第1个book节点                    |
| `$..book[0,1]`，或 `$..book[:2]`           | 匹配前两个book节点                       |
| `$..book[?(@.isbn)]`                       | 过滤含isbn字段的节点                     |
| `$..book[?(@.price<10)]`                   | 过滤`price<10`的节点                     |
| `$..*`                                     | 递归匹配所有子节点                       |

