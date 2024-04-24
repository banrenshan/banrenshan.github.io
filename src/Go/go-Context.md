---
title: Go Context
date: 2024-04-24
tags: 
 - Go
categories:
 - Go
---



Go语言中的上下文（Context）是一种用于在 Goroutines 之间传递取消信号、截止时间和其他请求范围值的标准方式。`context` 包提供了 `Context` 类型和一些相关的函数，用于在并发程序中有效地传递上下文信息。

在Go语言中，上下文通常用于以下场景：

1.请求的传递：当一个请求从客户端发送到服务器时，可以使用上下文来携带与该请求相关的数据。这些数据可以是用户的身份信息、请求的元数据或其他与请求相关的信息。通过将上下文传递给处理该请求的goroutine，可以确保在整个处理过程中访问这些数据。

2.取消操作：上下文可以用于取消正在进行的操作。当用户或其他代码发送取消信号时，可以将该信号传递给正在执行操作的goroutine。goroutine在接收到取消信号后，可以根据需要执行清理操作并退出。

3.截止时间：有时候需要在一段时间后终止正在进行的操作。通过将截止时间与上下文一起传递给goroutine，可以确保在超过截止时间后执行适当的清理操作并退出。4.跨多个服务通信：当在分布式系统中使用Go语言时，上下文可以用于跨不同的服务之间传递请求数据、取消信号和截止时间。通过使用上下文，可以确保在整个系统中的各个服务之间保持一致的上下文和请求生命周期管理。



# Context接口

```go
type Context interface {
    Deadline() (deadline time.Time, ok bool)
    Done() <-chan struct{}
    Err() error
    Value(key any) any
}
```

* Deadline 方法 返回`Context` 的截止时间，表示在这个时间点之后，`Context` 会被自动取消。如果 `Context` 没有设置截止时间，该方法返回一个零值 `time.Time` 和一个布尔值 `false`

  ```go
  deadline, ok := ctx.Deadline()
  if ok {
      // Context 有截止时间
  } else {
      // Context 没有截止时间
  }
  ```

* `Done()` 方法返回一个只读通道，当 `Context` 被取消时，该通道会被关闭。你可以通过监听这个通道来检测 `Context` 是否被取消。如果 `Context` 永不取消，则返回 `nil`。

  ```go
  select {
  case <-ctx.Done():
      // Context 已取消
  default:
      // Context 尚未取消
  }
  ```

* `Err()` 方法返回一个 `error` 值，表示 `Context` 被取消时产生的错误。如果 `Context` 尚未取消，该方法返回 `nil`。

  ```go
  if err := ctx.Err(); err != nil {
      // Context 已取消，处理错误
  }
  ```

* `Value(key any) any` 方法返回与 `Context` 关联的键值对，一般用于在 `Goroutine` 之间传递请求范围内的信息。如果没有关联的值，则返回 `nil`。

  ```go
  value := ctx.Value(key)
  if value != nil {
      // 存在关联的值
  }
  ```

  

# Context 的创建方式

* `context.Background()` 函数返回一个非 `nil` 的空 `Context`，它没有携带任何的值，也没有取消和超时信号。通常作为根 `Context` 使用。

* `context.TODO()` 函数返回一个非 `nil` 的空 `Context`，它没有携带任何的值，也没有取消和超时信号。虽然它的返回结果和 `context.Background()` 函数一样，但是它们的使用场景是不一样的，如果不确定使用哪个上下文时，可以使用 `context.TODO()`。

* `context.WithValue(parent Context, key, val any)` 函数接收一个父 `Context` 和一个键值对 `key`、`val`，返回一个新的子 `Context`，并在其中添加一个 `key-value` 数据对。

* `context.WithCancel(parent Context) (ctx Context, cancel CancelFunc)` 函数接收一个父 `Context`，返回一个新的子 `Context` 和一个取消函数，当取消函数被调用时，子 `Context` 会被取消，同时会向子 `Context` 关联的 `Done()` 通道发送取消信号，届时其衍生的子孙 `Context` 都会被取消。这个函数适用于手动取消操作的场景。

  ```go
  ctx, cancelFunc := context.WithCancel(parentCtx)  
  defer cancelFunc()
  ```

* `context.WithCancelCause(parent Context) (ctx Context, cancel CancelCauseFunc)` 函数是 `Go 1.20` 版本才新增的，其功能类似于 `context.WithCancel()`，但是它可以设置额外的取消原因，也就是 `error` 信息，返回的 `cancel` 函数被调用时，需传入一个 `error` 参数。

  ```go
  ctx, cancelFunc := context.WithCancelCause(parentCtx)
  defer cancelFunc(errors.New("原因"))
  ```

* `context.Cause(c Context) error` 函数用于返回取消 `Context` 的原因，即错误值 `error`。如果是通过 `context.WithCancelCause()` 函数返回的取消函数 `cancelFunc(myErr)` 进行的取消操作，我们可以获取到 `myErr` 的值。否则，我们将得到与 `c.Err()` 相同的返回值。如果 `Context` 尚未被取消，将返回 `nil`。

* `context.WithDeadline(parent Context, d time.Time) (Context, CancelFunc)` 函数接收一个父 `Context` 和一个截止时间作为参数，返回一个新的子 `Context`。当截止时间到达时，子 `Context` 其衍生的子孙 `Context` 会被自动取消。这个函数适用于需要在特定时间点取消操作的场景。

  ```go
  deadline := time.Now().Add(time.Second * 2)
  ctx, cancelFunc := context.WithTimeout(parentCtx, deadline)
  defer cancelFunc()
  ```

* `context.WithTimeout(parent Context, timeout time.Duration) (Context, CancelFunc)` 函数和 `context.WithDeadline()` 函数的功能是一样的，其底层会调用 `WithDeadline()` 函数，只不过其第二个参数接收的是一个超时时间，而不是截止时间。这个函数适用于需要在一段时间后取消操作的场景。

  ```go
  ctx, cancelFunc := context.WithTimeout(parentCtx, time.Second * 2)
  defer cancelFunc()
  ```



# 使用场景



## 传递共享数据

编写中间件函数，用于向 `HTTP` 处理链中添加处理请求 `ID` 的功能。

```go
type key int

const (
   requestIDKey key = iota
)

func WithRequestId(next http.Handler) http.Handler {
   return http.HandlerFunc(func(rw http.ResponseWriter, req *http.Request) {
      // 从请求中提取请求ID和用户信息
      requestID := req.Header.Get("X-Request-ID")

      // 创建子 context，并添加一个请求 Id 的信息
      ctx := context.WithValue(req.Context(), requestIDKey, requestID)

      // 创建一个新的请求，设置新 ctx
      req = req.WithContext(ctx)

      // 将带有请求 ID 的上下文传递给下一个处理器
      next.ServeHTTP(rw, req)
   })
}
```

首先，我们从请求的头部中提取请求 `ID`。然后使用 `context.WithValue` 创建一个子上下文，并将请求 `ID` 作为键值对存储在子上下文中。接着，我们创建一个新的请求对象，并将子上下文设置为新请求的上下文。最后，我们将带有请求 `ID` 的上下文传递给下一个处理器。 这样，通过使用 `WithRequestId` 中间件函数，我们可以在处理请求的过程中方便地获取和使用请求 `ID`，例如在 **日志记录、跟踪和调试等方面**。

## 传递取消信号，结束任务

启动一个工作协程，接收到取消信号就停止工作。

```go
package main

import (
   "context"
   "fmt"
   "time"
)

func main() {
   ctx, cancelFunc := context.WithCancel(context.Background())
   go Working(ctx)

   time.Sleep(3 * time.Second)
   cancelFunc()

   // 等待一段时间，以确保工作协程接收到取消信号并退出
   time.Sleep(1 * time.Second)
}

func Working(ctx context.Context) {
   for {
      select {
      case <-ctx.Done():
         fmt.Println("下班啦...")
         return
      default:
         fmt.Println("陈明勇正在工作中...")
      }
   }
}
```

在上面的示例中，我们创建了一个 `Working` 函数，它会不断执行工作任务。我们使用 `context.WithCancel` 创建了一个上下文 `ctx` 和一个取消函数 `cancelFunc`。然后，启动了一个工作协程，并将上下文传递给它。

在主函数中，需要等待一段时间（**3** 秒）模拟业务逻辑的执行。然后，调用取消函数 `cancelFunc`，通知工作协程停止工作。工作协程在每次循环中都会检查上下文的状态，一旦接收到取消信号，就会退出循环。

最后，等待一段时间（**1** 秒），以确保工作协程接收到取消信号并退出。

## 超时控制

模拟耗时操作，超时控制。

```go
package main

import (
   "context"
   "fmt"
   "time"
)

func main() {
   // 使用 WithTimeout 创建一个带有超时的上下文对象
   ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
   defer cancel()

   // 在另一个 goroutine 中执行耗时操作
   go func() {
      // 模拟一个耗时的操作，例如数据库查询
      time.Sleep(5 * time.Second)
      cancel()
   }()

   select {
   case <-ctx.Done():
      fmt.Println("操作已超时")
   case <-time.After(10 * time.Second):
      fmt.Println("操作完成")
   }
}
```

在上面的例子中，首先使用 `context.WithTimeout()` 创建了一个带有 **3** 秒超时的上下文对象 `ctx, cancel := context.WithTimeout(ctx, 3*time.Second)`。

接下来，在一个新的 `goroutine` 中执行一个模拟的耗时操作，例如等待 **5** 秒钟。当耗时操作完成后，调用 `cancel()` 方法来取消超时上下文。

最后，在主 `goroutine` 中使用 `select` 语句等待超时上下文的完成信号。如果在 **3** 秒内耗时操作完成，那么会输出 "操作完成"。如果超过了 **3** 秒仍未完成，超时上下文的 `Done()` 通道会被关闭，输出 "操作已超时"。



## **最佳实践**

 

context.Background 只应用在最高等级，作为所有派生 context 的根。

context.TODO 应用在不确定要使用什么的地方，或者当前函数以后会更新以便使用 context。

context 取消是建议性的，这些函数可能需要一些时间来清理和退出。

context.Value 应该很少使用，它不应该被用来传递可选参数。这使得 API 隐式的并且可以引起错误。取而代之的是，这些值应该作为参数传递。

不要将 context 存储在结构中，在函数中显式传递它们，最好是作为第一个参数。

永远不要传递不存在的 context 。相反，如果您不确定使用什么，使用一个 ToDo context。

Context 结构没有取消方法，因为只有派生 context 的函数才应该取消 context。