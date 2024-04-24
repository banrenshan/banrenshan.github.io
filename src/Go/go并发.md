---
title: Go 并发
date: 2024-04-24
tags: 
 - Go
categories:
 - Go
---



# 协程

一个程序启动，就会有对应的进程被创建，同时进程也会启动一个线程，这个线程叫作主线程。如果主线程结束，那么整个程序就退出了。有了主线程，就可以从主线程里启动很多其他线程，也就有了多线程的并发。

Go语言中没有线程的概念，只有协程，也称为goroutine。相比线程来说，协程更加轻量，一个程序可以随意启动成千上万个goroutine。

Go语言的并发是由Go自己调度的，自己决定同时执行多少个goroutine、什么时候执行哪几个。这些对于我们开发者来说完全透明，只需要在编码的时候告诉Go语言要启动几个goroutine，至于如何调度执行，我们不用关心。

要启动一个goroutine非常简单，Go语言为我们提供了go关键字，相比其他编程语言简化了很多：

```go
import "fmt"
import "time"

func main() {
	go func() {
		fmt.Println("hello go routing")
	}()
	fmt.Println("hello main")
	time.Sleep(time.Second)
}
```

从输出结果也可以看出，程序是并发的，go关键字启动的goroutine并不阻塞main 的执行。

# 管道

那么如果启动了多个goroutine，它们之间该如何通信呢？这就是Go语言提供的channel要解决的问题。

在Go语言中，声明一个管道非常简单，使用内置的make函数即可：

```go
ch:=make(chan string)
```

chan是关键字，标识channel类型，string 表示channel里面的数据类型。

> 通过channel的声明也可以看到，chan是一个集合类型。

定义好chan后，就可以使用它了，chan的操作只有两种：

* 接收：获取chan中的值，操作符为`<-chan`。
* 发送：向chan发送值，把值放在chan中，操作符为`chan<-`。

```go
func main() {
	ch := make(chan string)

	go func() {
		fmt.Println("go routing")
		ch <- "go routing msg"
	}()

	fmt.Println("main ...")

	data := <-ch
	fmt.Println(data)
}
```

结果打印：

```shell
main ...
go routing
go routing msg
```

> 在上面的示例中，我们在新启动的goroutine中向变量ch发送值；在main goroutine中，从变量ch接收值；如果ch中没有值，则**阻塞等待**，直到ch中有值可以接收为止。



管道使用完毕后，需要关闭。如果一个管道被关闭，就不能向里面发送数据了，如果发送的话，会引起panic异常。但是我们还可以接收管道里的数据，如果管道里没有数据的话，接收的数据是元素类型的零值。

```go
func main() {
	ch := make(chan int, 5)

	go func() {
		fmt.Println("go routing")
		close(ch)
	}()

	fmt.Println("main ...")
	data := <-ch
	fmt.Println("data:", data)
}

```

打印结果：

```go
main ...
go routing
data: 0
```

## 管道分类

### **无缓冲管道**

在上面的示例中，使用make创建的chan就是一个无缓冲管道，它的容量是0，不能存储任何数据。所以无缓冲管道只起到传输数据的作用，数据并不会在管道中做任何停留。这也意味着，无缓冲管道的发送和接收操作是同时进行的，它也可以称为同步管道。

### **有缓冲管道**

有缓冲管道类似一个可阻塞的队列，内部的元素先进先出。通过make函数的第二个参数可以指定管道容量的大小，进而创建一个有缓冲管道：

```go
	ch := make(chan string, 5)
```

> 我创建了一个容量为5的管道，内部的元素类型是int，也就是说这个管道内部最多可以存放5个类型为int的元素

有缓冲管道具备以下特点:

* 内部有一个缓冲队列
* 发送操作是向队列的尾部插入元素，如果队列已满，则阻塞等待，直到另一个goroutine执行，接收操作释放队列的空间
* 接收操作是从队列的头部获取元素并把它从队列中删除，如果队列为空，则阻塞等待，直到另一个goroutine执行，发送操作插入新的元素。

因为有缓冲管道类似一个队列，所以可以获取它的容量和里面元素的个数。如下面的代码所示：

```go
func main() {
	ch := make(chan string, 5)

	go func() {
		fmt.Println("go routing")
		ch <- "go routing msg1"
		ch <- "go routing msg2"
		ch <- "go routing msg3"
	}()

	fmt.Println("main ...")
	fmt.Println("chan 容量", cap(ch), "chan 当前大小", len(ch))
	data := <-ch
	fmt.Println("chan 容量", cap(ch), "chan 当前大小", len(ch))
	fmt.Println(data)
}
```

输出结果：

```go
main ...
chan 容量 5 chan 当前大小 0
go routing
chan 容量 5 chan 当前大小 2
go routing msg1
```

### 单向管道

有时候，我们有一些特殊的业务需求，比如限制一个管道只可以接收但是不能发送，或者限制一个管道只能发送但不能接收，这种管道称为单向管道。单向管道的声明也很简单，只需要在声明的时候带上`<-`操作符即可，如下面的代码所示：

```go
	onlySend := make(chan<- int, 5)
	onlyReceive := make(<-chan int, 5)
```

在函数或者方法的参数中，使用单向管道的较多，这样可以防止一些操作对管道的影响。



## select

假设要从网上下载一个文件，我启动了3个goroutine进行下载，并把结果发送到3个channel（管道）中。其中，哪个先下载好，就会使用哪个channel的结果。在这种情况下，如果我们尝试获取第一个channel的结果，程序就会被阻塞，无法获取剩下两个channel的结果，也无法判断哪个先下载好。这个时候就需要用到多路复用操作了，在Go语言中，通过select语句可以实现多路复用：

```go
func main() {
	first := make(chan int, 5)
	sencond := make(chan int, 5)
	three := make(chan int, 5)

	go func() {
		time.Sleep(time.Duration(1))
		first <- 1
	}()
	go func() {
		time.Sleep(time.Duration(1))
		sencond <- 2
	}()
	go func() {
		three <- 3
	}()

	select {
	case d1 := <-first:
		fmt.Println("data:", d1)
	case d1 := <-sencond:
		fmt.Println("data:", d1)
	case d1 := <-three:
		fmt.Println("data:", d1)
	}

	time.Sleep(time.Duration(10))
}
```

结果打印：

```go
data: 3
```

> 多路复用可以简单地理解为，在N个channel中，任意一个channel有数据产生，select都可以监听到，然后执行相应的分支，接收数据并处理。



其整体结构与switch结构类似，都有case和default，只不过select的case是一个个可以操作的channel。

```go
func main() {
	first := make(chan int, 5)
	sencond := make(chan int, 5)
	three := make(chan int, 5)

	go func() {
		time.Sleep(time.Duration(1))
		first <- 1
	}()
	go func() {
		time.Sleep(time.Duration(1))
		sencond <- 2
	}()
	go func() {
		three <- 3
	}()

	select {
	case d1 := <-first:
		fmt.Println("data:", d1)
	case d1 := <-sencond:
		fmt.Println("data:", d1)
	case d1 := <-three:
		fmt.Println("data:", d1)
	default:
		fmt.Println("data:", 0)
	}

	time.Sleep(time.Duration(10))

}
```

此时的输出结果变成了0。



# 同步

channel为什么是并发安全的呢？因为channel内部使用了互斥锁来保证并发的安全。在Go语言中，不仅有channel这类比较易用且高级的同步机制，还有sync.Mutex、sync.WaitGroup等比较原始的同步机制。

## 互斥锁（sync.Mutex）

```go
var (
	sum   = 0
	mutex sync.Mutex // 为啥不初始化
)

func main() {

	for i := 0; i < 100; i++ {
		go func() {
			add(1)
		}()
	}
	time.Sleep(time.Minute)

	fmt.Println(sum)

}

func add(num int) {
	mutex.Lock()
	defer mutex.Unlock()
	time.Sleep(time.Microsecond)
	sum += num
}

```

## 读写锁（sync.RWMutex）

1. 写的时候不能同时读，因为这个时候读取的话可能读到脏数据（不正确的数据）。

2. 读的时候不能同时写，因为也可能产生不可预料的结果。
3. 读的时候可以同时读，因为数据不会改变，所以不管多少个goroutine在读都是并发安全的。

```go

var	mutex sync.RWMutex
 
mutex.RLock() //读锁
mutex.Lock() //写锁
```

## sync.WaitGroup

相信你注意到了`time.Sleep(2*time.Second)`这段代码，这是为了防止主函数main返回，一旦main函数返回了，程序也就退出了。

所以存在一个问题，如果这100个协程在两秒内执行完毕，main函数本该提前返回，但是偏偏要等两秒才能返回，就会产生性能问题。有没有办法监听所有协程的执行，一旦全部执行完毕，程序马上退出。

channel可以解决这个问题，不过非常复杂，Go语言为我们提供了更简洁的解决办法，它就是sync.WaitGroup。

sync.WaitGroup的使用比较简单，一共分为三步：

1. 声明一个sync.WaitGroup，然后通过Add方法设置计数器的值，需要跟踪多少个协程就设置多少，这里是110。
2. 在每个协程执行完毕后调用Done方法，让计数器减1，告诉sync.WaitGroup该协程已经执行完毕。
3. 最后调用Wait方法一直等待，直到计数器值为0，也就是所有跟踪的协程都执行完毕。

```go
func main() {
	var group sync.WaitGroup
	group.Add(100)

	for i := 0; i < 100; i++ {
		go func() {
			fmt.Println("do work")
			group.Done()
		}()
	}
	group.Wait()
	fmt.Println("Done")
}

```

## sync.Once

在实际的工作中，你可能会有这样的需求：让代码只执行一次，哪怕是在高并发的情况下，比如创建一个单例。

```go
func main() {
	var group sync.WaitGroup
	group.Add(100)

	var one sync.Once

	for i := 0; i < 100; i++ {
		go func() {
			one.Do(func() {
				fmt.Println("only you")
			})
			fmt.Println("working ")
			group.Done()
		}()
	}
	group.Wait()

	fmt.Println("Done")

}

```

## sync.Cond

在Go语言中，sync.WaitGroup用于最终完成的场景，关键点在于一定要等待所有协程都执行完毕。而sync.Cond可以用于发号施令，一声令下所有协程都可以开始执行，关键点在于协程开始的时候是等待状态，要等待sync.Cond唤醒才能执行。

sync.Cond有三个方法，它们分别是：

1. Wait，阻塞当前协程，直到被其他协程通过调用Broadcast或者Signal方法唤醒，使用的时候需要加锁，使用sync.Cond中的锁即可，也就是L字段。
2. Signal，唤醒一个等待时间最长的协程。
3. Broadcast，唤醒所有等待的协程。

> 在调用Signal或者Broadcast之前，要确保目标协程处于Wait阻塞状态，不然会出现死锁问题。

```go
var done = false

func read(name string, c *sync.Cond) {
	c.L.Lock()
	for !done {
		c.Wait()
	}
	log.Println(name, "starts reading")
	c.L.Unlock()
}

func write(name string, c *sync.Cond) {
	log.Println(name, "starts writing")
	time.Sleep(time.Second)
	c.L.Lock()
	done = true
	c.L.Unlock()
	log.Println(name, "wakes all")
	c.Broadcast()
}

func main() {
	cond := sync.NewCond(&sync.Mutex{})

	go read("reader1", cond)
	go read("reader2", cond)
	go read("reader3", cond)
	write("writer", cond)

	time.Sleep(time.Second * 3)
}
```

运行结果：

```go
2021/01/14 23:18:20 writer starts writing
2021/01/14 23:18:21 writer wakes all
2021/01/14 23:18:21 reader2 starts reading
2021/01/14 23:18:21 reader3 starts reading
2021/01/14 23:18:21 reader1 starts reading
```

## sync.Map

sync.Map的使用和内置的map类型一样，只不过它是并发安全的。

Store：存储一对Key-Value值。Load：根据Key获取对应的Value，并且可以判断Key是否存在。3)LoadOrStore：如果Key对应的Value存在，则返回该Value；如果不存在，则存储相应的Value。4)Delete：删除一个Key-Value键值对。5)Range：循环迭代sync.Map，效果与for range一样

# 



