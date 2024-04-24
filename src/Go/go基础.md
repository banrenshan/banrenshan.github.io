---
title: Go 基础
date: 2024-04-24
tags: 
 - Go
categories:
 - Go
---



# 数据类型

## 变量声明

```go
var 变量名 类型 = 表达式
```

Go语言中定义的变量必须使用，否则无法编译通过。

Go语言具有类型推导功能，所以不需要刻意地指定变量的类型：

```go
var i = 10
```

你也可以一次声明多个变量，把要声明的多个变量放到一个括号中即可:

```go
var (
  i int = 0 
  k int = 1
)
```

在`方法中`还可以进一步简化变量声明：

```go
i:=10
```

## 简单变量类型

基础类型有整型、浮点型、布尔型和字符串. 空对象应 `nil` 表示

### 整型

* 有符号整型：如`int`、`int8`、`int16`、`int32`和`int64`。

* 无符号整型：如`uint`、`uint8`、`uint16`、`uint32`和`uint64`

> 有符号整型表示的数值可以为负数、零和正数，而无符号整型只能为零和正数。

除了有用`位(bit)大小`表示的整型外，还有`int`和`uint`这两个没有具体位大小的整型，它们的大小可能是32位，也可能是64位，与硬件设备CPU有关。在整型中，如果能确定int的位就选择比较明确的int类型，因为这会让你的程序具备很好的可移植性。

在Go语言中，还有一种`字节(byte)类型`，它其实等价于uint8类型，可以理解为uint8类型的别名，用于定义一个字节，所以字节(byte)类型也属于整型。

### 浮点型

Go语言提供了两种精度的浮点数，分别是`float32`和 `float64`。项目中最常用的是f loat64，因为它的精度高，浮点计算的结果相比f loat32误差会更小。

### 布尔型

布尔型的值只有两种：true和false ，使用关键字`bool`定义

布尔值可以用于一元操作符`!`，该操作符表示逻辑非的意思，也可以用于二元操作符`&&`和`||`，它们分别表示逻辑与和逻辑或。

### 字符串

字符串使用双引号包裹。使用`string`关键字定义 。`+` 拼接字符串 

### 零值

在Go语言中，如果我们声明了一个变量，但是没有对其进行初始化，那么Go语言会自动将其值初始化为对应类型的零值。比如数字类型的零值是0，布尔型的零值是false，字符串的零值是空字符串(`""`)等。

## 复杂变量类型

### 指针

指针的值就是变量的内存地址。通过＆可以获取一个变量的地址，也就是指针。

在以下代码中，pi就是指向变量i的指针。要想获得指针pi指向的变量值，使用*pi这个表达式即可。尝试运行这段程序，会看到输出结果与变量i的值一样。

```go
pi:=&i
fmt.Println(*pi)
```



### 数组

声明数组：

```go
var arr [5]int
fmt.Println(arr)
// 输出结果：
[0 0 0 0 0]
```

声明并初始化数组：

```go
	var arr2 [3]int = [3]int{1, 2, 3}
	fmt.Println(arr2) // [1 2 3]

	arr3 := [3]int{1, 2, 3}
	fmt.Println(arr3) //[1 2 3]

	arr4 := [...]int{1, 2, 3} // 自动推导数组长度
	fmt.Println(arr4)//[1 2 3]

	arr5 := [3]int{1: 2, 2: 3} //指定索引位初始化
	fmt.Println(arr5)//[0 2 3]
```



可以使用传统的for循环遍历数组， 但是go 提供了更简单的 `for range` 语法

```go
	arr5 := [3]int{1: 2, 2: 3}
	for index, value := range arr5 {
		fmt.Println(index, ":", value)
	}
```

### 切片

切片(Slice)与数组类似，可以把它理解为动态数组。切片是基于数组实现的，它的底层就是数组。切片是一个具备三个字段的数据结构，分别是指向数组的指针data、长度len和容量cap。

#### 基于数组创建切片

```go
slice:=array[start:end] //左闭右开
```

如果省略start，那么start的值默认为0，如果省略end，那么end的默认值为数组的长度

```go
	arr4 := [...]int{1, 2, 3, 4, 5, 6}
	a := arr4[1:3]
	fmt.Println(a) //[2 3]
	a[1] = 10
	fmt.Println(arr4) //[1 2 10 4 5 6]
```

基于数组的切片使用的底层数组还是原来的数组，一旦修改切片的元素值，那么底层数组对应的值也会被修改。

> 在创建新切片的时候，最好是让新切片的长度和容量一样，这样在追加操作的时候就会生成新的底层数组，从而与原有数组分离，就不会因为共用底层数组，导致修改内容的时候影响多个切片。

#### 切片的声明

除了可以从一个数组得到切片外，还可以声明切片，比较简单的是使用make函数。

```go
	sli := make([]int, 4, 8) // 声明长度为4，容量为8的切片
	fmt.Println(sli) //[0 0 0 0]
```

当通过append函数往切片中追加元素的时候，会追加到空闲的内存上，当切片的长度要超过容量的时候会进行扩容。

切片不仅可以通过make函数声明，也可以通过字面量的方式声明和初始化：

```go
	cc := []int{1, 2, 3, 4, 5}
	fmt.Println(len(cc), cap(cc)) //5 5
```

通过字面量初始化的切片，其长度和容量相同。

#### 其他操作

切片的循环同数组一模一样，常用的也是for range方式

```go
	cc := []int{1, 2, 3, 4, 5}
	dd = append(cc, 12) // 添加元素  

	for i, v := range dd {
		fmt.Println(i, v)
	}
	fmt.Println(cc) //[1 2 3 4 5]

```



#### string和[]byte

字符串string也是一个不可变的字节序列，所以可以直接转为字节切片[]byte：

```go
	s := "我爱美女"
	bs := []byte(s)
	fmt.Println(bs)
	fmt.Println(len(bs)) //12
```

在UTF8编码下，一个汉字对应三个字节。如果你想把一个汉字当成一个长度计算，可以使用utf8.RuneCountInString函数：

```go
s := "我爱美女"
fmt.Println(utf8.RuneCountInString(s))
```

字符串也可以被 for range 循环：

```go
s := "我爱美女"	
for i, v := range s {
		fmt.Println(i, v)
}
```

> 上面的汉字不能被正常打印出来，v打印对应的Unicode码点





### Map

映射(Map)是一个无序的K-V（键值对）集合，结构为map[K]V。其中K对应Key，V对应Value。map中所有的Key必须具有相同的类型，Value也一样，但Key和Value的类型可以不同。此外，Key的类型必须支持`==`比较运算符，这样才可以判断它是否存在，并保证Key的唯一性。



#### 创建和初始化map

```go
	m := make(map[string]int) // make 函数创建
	m["name"] = 123
	fmt.Println(m)

	m2 := map[string]string{"name": "zzq"} // 字面量创建
	fmt.Println(m2)
```



map可以获取不存在的K-V键值对，如果Key不存在，返回的Value是该类型的零值。所以在很多时候，我们需要先判断map中的Key是否存在。

```go
	m2 := map[string]int{"name": 110}

	v, ok := m2["age"]
	if ok {
		fmt.Println(v)
	} else {
		fmt.Println("no value",v) // no value 0
	}

	m2["age"] = 0
	v2, ok := m2["age"]
	if ok {
		fmt.Println(v2) //  0
	}

```

换成字符串：

```go
	m2 := map[string]string{"name": "110"}

	v, ok := m2["age"]
	if ok {
		fmt.Println(v)
	} else {
		fmt.Println("no value", v)
	}

	m2["age"] = ""
	v2, ok := m2["age"]
	if ok { // 条件不成立
		fmt.Println(v2)
	}
```



map的遍历同样使用for range循环。需要注意的是map的遍历是无序的，也就是说每次遍历的键值对顺序可能会不一样。如果想按顺序遍历，可以先获取所有的Key，并对Key排序，然后根据排序好的Key获取对应的Value。





## 常量

常量的值是在编译期就确定好的，一旦确定好之后就不能被修改，这样可以防止在运行期被恶意篡改。

常量的定义和变量类似，只不过它的关键字是`const`

```go
	const i=10 
```

> 只允许布尔型、字符串、数字类型这些基础类型作为常量

### iota

iota是一个常量生成器，它可以用来初始化相似规则的常量，避免重复地初始化。假设我们要定义one、two、three和four四个常量，对应的值分别是1、2、3和4，如果不使用iota，则需要按照如下代码的方式定义：

```go
const (
 	one=1
  two=2
  three=3
  four=4
)
```

以上声明都要初始化，会比较烦琐，因为这些常量是有规律的（连续的数字），所以可以使用iota进行声明，如下所示：

```go
const (
	one = iota+1
  two
  three
  four
)
```

iota的初始值是0，它的能力就是在每一个有常量声明的行后面加1 。

## 类型转换

Go语言是强类型语言，也就是说不同类型的变量是无法相互使用和计算的。使用前，需要进行类型转换。

字符串和数字转换：

```go
	i := 10
	s := strconv.Itoa(i) // 数字转字符串
	i, _ = strconv.Atoi(s) //字符串转数字
```

字符串和bool转换：

```go
strconv.FormatBool(true)
	d, _ := strconv.ParseBool("false")
```

float和字符串转换：

```go
// 第二参数， 指定转换的格式 ， f: 浮点型 ， e：科学计数法
// 第三个参数，指定转换的字符串精度
// 第四个参数可以是 32 或64 ，表示转换成 float32 还是 float64
strconv.FormatFloat(1.234, 'f', 5, 64) // 1.23400

m, _ := strconv.ParseFloat("1.234", 32) //第二个参数可以是 32 或64 ，表示转换成 float32 还是 float64
```

对于数字类型之间，则可以使用强制转换的方式：

```go
m:=float64(10)
n:=int(12.34)
```

采用强制转换的方式转换数字类型，可能会丢失一些精度，比如浮点型转为整型时，小数点部分会全部丢失







# 控制结构

## if语句

```go
	i := 10
	if i > 90 {
		fmt.Println("优秀")
	} else if i > 60 {
		fmt.Println("及格")
	} else {
		fmt.Println("垃圾")
	}
```

与其他编程语言不同，在Go语言的if语句中，可以有一个简单的表达式语句，并且该语句和条件语句之间使用分号分开

```go
	if i := 10; i > 90 {
		fmt.Println("优秀")
	} else if i > 60 {
		fmt.Println("及格")
	} else {
		fmt.Println("垃圾")
	}
```

> 注意：i的作用域仅限于整个 if else 控制结构

## swith语句

```go
	i := 10
	switch i {

	case 90:
		fmt.Println("优秀")
	case 60:
		fmt.Println("及格")
	default:
		fmt.Println("垃圾")

	}
```



switch语句也可以用一个简单的语句来做初始化，同样也是用分号分隔。每一个case就是一个分支，分支条件为true时该分支才会执行:

```go
	switch i := 10; {

	case i > 90:
		fmt.Println("优秀")
	case i > 60:
		fmt.Println("及格")
	default:
		fmt.Println("垃圾")

	}
```



在Go语言中，对switch的case从上到下逐一进行判断，一旦满足条件，就立即执行对应的分支并返回，其余分支不再做判断。也就是说在默认情况下，Go语言中switch的case最后自带break。



那么如果你的确需要执行下一个紧跟的case，该怎么办呢？Go语言也考虑到了，它提供了fallthrough关键字。

```go
	switch i := 10; {

	case i > 90:
		fmt.Println("优秀")
		fallthrough
	case i > 60:
		fmt.Println("及格")
	default:
		fmt.Println("垃圾")

	}
```



## for 循环语句

在Go语言中，同样支持使用continue、break来控制for循环：

* continue可以跳出本次循环，继续执行下一个循环。
* break可以跳出整个for循环，哪怕for循环没有执行完，也会强制终止。

```go
	sum := 0
	for i := 0; i <= 100; i++ {
		sum += i
	}
	fmt.Println(sum)
```



# 函数

函数的声明格式：

```go
func funcName(paramsList) resultList{
  body...
}
```

* 函数的参数params，用来定义形参的变量名和类型，可以有一个参数，也可以有多个，也可以没有。

* result用于定义返回值的类型，如果没有返回值，省略即可，也可以有多个返回值。



## 简单函数

```go
func sumInt(a int, b int) int {
	return a + b
}
```

参数类型一样的时候，可以简写：

```go
func sumInt2(a , b int) int {
	return a + b
}
```



多返回值：

```go
func swap(a,b int) (int,int){
	return b,a
}
```

返回值参数也可以定义名称：

```go
func swap2(a, b int) (m, n int) {
	m = a
	n = b
	return
}
```



## 可变参数

```go
func sumAll(a ...int) int {
	num := 0
	for _, v := range a {
		num += v
	}
	return num
}
```

## 包级别函数

* 函数名称首字母小写代表私有函数，只有在同一个包中才可以被调用。
* 函数名称首字母大写代表公有函数，在不同的包中也可以被调用。
* 任何一个函数都会从属于一个包。

## 匿名函数和闭包

匿名函数：

```go
	sum := func(a, b int) int {
		return a + b
	}
	fmt.Println(sum(1, 2))
```

有了匿名函数，就可以在函数中再定义函数（函数嵌套），定义的这个匿名函数也可以被称为内部函数。更重要的是，在函数内定义的内部函数，可以使用外部函数的变量等，这种方式也称为闭包:

```go
func returnFunc() func(int, int) int {

	v := 10
	return func(a, b int) int {
		return a + b + v
	}
}
```













# 工具包

## strings包

Go SDK为我们提供的一个标准包`strings`。它是用于处理字符串的工具包，里面有很多常用的函数，帮助我们对字符串进行操作，比如查找字符串、去除字符串的空格、拆分字符串、判断字符串是否有某个前缀或者后缀等