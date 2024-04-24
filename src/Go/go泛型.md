---
title: Go泛型
date: 2024-04-24
tags: 
 - Go
categories:
 - Go
---



# 泛型

## 引出泛型

假如我们有个整数求大小的函数，如下:

```go
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
```

现在，需求进阶了，我们不仅要求int类型的最小值，还要求float32类型的最小值。为了满足需求，我们不得不再定义一个支持float32类型的函数。

对于这类重复度非常高的函数，我们最大的期望就是能声明一个通用函数，可以满足所有类型的求最小值。泛型就是为了解决这类问题的， 下面是用泛型扩展后的实现：

```go
func min2[V int | float32 | float64](a, b V) V {
	if a < b {
		return a
	}
	return b
}
```

函数名和小括号形参之间，多了一个方括号，用于声明类型参数。类型参数就是用于约束在实际调用这个min函数的时候，可以允许传什么类型的实参给min函数。

下面是调用示例：

```go
	fmt.Println(min2[int](1, 2))
	fmt.Println(min2[float32](1.2, 2.2))
```

> 在上面的示例中，传递了泛型的实际类型，实际上支持类型自动推断，可以写成如下形式：
>
> ```go
> 	fmt.Println(min2(1, 2))
> 	fmt.Println(min2(1.2, 2.2))
> ```

## 自定义类型约束

我在声明min泛型类型参数约束的时候，用了V int|float32|float64|int32这么一长串文本，是不是觉得太啰唆了，而且可读性也比较差。为了解决这个问题，Go语言为我们提供了自定义类型约束的能力:

```go
type Number interface {
	int | float32 | float64
}

func min3[V Number](a, b V) V {
	if a < b {
		return a
	}
	return b
}
```

为了使用方便，Go语言给我们内置了一些约束类型。在上面的示例中，我们定义的Number约束类型也可以换成constraints.Ordered，效果是一样的：

```go
import (
	"golang.org/x/exp/constraints"
)
func min4[V constraints.Ordered](a, b V) V {
	if a < b {
		return a
	}
	return b
```

### any约束

约束其实是一个interface，interface{}可以表示任何类型，但是每次都这么写也比较烦琐，所以Go SDK内置了一个any类型别名，这样就简单多了

```go
func Println [T interface{}](){}
func Println2 [T any](){}
```

# 反射

