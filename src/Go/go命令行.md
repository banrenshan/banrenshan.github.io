---
title: Go 命令行
date: 2024-04-24
tags: 
 - Go
categories:
 - Go
---



# go build

编译go文件

## 指定输出的可执行文件的名称

```
 $ go build -o name.exe main.go 
 $ ls name*
 Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        2023/12/23     16:33        1897984 name.exe
```

## 多文件编译

当我由两个main包时，如下：

```
.
├── main.go
└── main2.go
```

main2.go文件的内容：

```go
package main

import "fmt"

func TestMain2() {
	fmt.Println("main2...")
}

```

main.go文件的内容：

```go
package main

func main() {
	TestMain2()
}

```

此时执行下面的命令会出错：

```shell
$ go build main.go    
.\main.go:4:2: undefined: TestMain2
```

这是因为编译的时候，go没有加载到完整的main包，我们应该使用下面的命令进行修正：

```shell
go build main.go main2.go
```

当文件多了的时候，这种方式明显有些凡人，我们指定包来进行整体编译

```shell
go build .
```

> `.`表示main包所在的目录，你可以使用具体的目录替代。

> 需要注意的时，如果你使用包的方式进行编译，生成的可执行的文件名称和包的名称相同。否则和main函数所在文件的名称相同。

# go clean

`go clean`命令可以移除当前源码包和关联源码包里面编译生成的文件，这些文件包括以下几种：

* 执行`go build`命令时在当前目录下生成的与包名或者 Go 源码文件同名的可执行文件。
* 执行`go test`命令并加入`-c`标记时在当前目录下生成的以包名加“.test”后缀为名的文件。
* 执行`go install`命令安装当前代码包时产生的结果文件。如果当前代码包中只包含库源码文件，则结果文件指的就是在工作区 pkg 目录下相应的归档文件。如果当前代码包中只包含一个命令源码文件，则结果文件指的就是在工作区 bin 目录下的可执行文件。
* 在编译 Go 或 C 源码文件时遗留在相应目录中的文件或目录 。包括：“_obj”和“_test”目录，名称为“_testmain.go”、“test.out”、“build.out”或“a.out”的文件，名称以“.5”、“.6”、“.8”、“.a”、“.o”或“.so”为后缀的文件。这些目录和文件是在执行`go build`命令时生成在临时目录中的。

`go clean`命令就像 [Java](https://c.biancheng.net/java/) 中的`maven clean`命令一样，会清除掉编译过程中产生的一些文件。

```shell
$ go clean -i -n
cd awesomeProject
rm -f awesomeProject awesomeProject.exe awesomeProject awesomeProject.exe awesomeProject.test awesomeProject.test.exe awesomeProject.test awesomeProject.test.exe main main.exe main2 main2.exe
rm awesomeProject.exe
```

对应的参数的含义如下所示：

- -i 清除关联的安装的包和可运行文件，也就是通过`go install`安装的文件；
- -n 把需要执行的清除命令打印出来，但是不执行，这样就可以很容易的知道底层是如何运行的；
- -r 循环的清除在 import 中引入的包；
- -x 打印出来执行的详细命令，其实就是 -n 打印的执行版本；
- -cache 删除所有`go build`命令的缓存
- -testcache 删除当前包所有的测试结果

实际开发中`go clean`命令使用的可能不是很多，一般都是利用`go clean`命令清除编译文件，然后再将源码递交到 github 上，方便对于源码的管理。

# go run

`go run`命令会编译源码，并且直接执行源码的 main() 函数，不会在当前目录留下可执行文件，可执行文件被放在临时文件中被执行。

`go run`不能使用`go run 包目录`的方式进行编译

# go install

`go install` 命令的功能和`go build` 命令类似。go install 只是将编译的中间文件放在 GOPATH 的 pkg 目录下，以及固定地将编译结果放在 GOPATH 的 bin 目录下。

这个命令在内部实际上分成了两步操作：第一步是生成结果文件（可执行文件或者 .a 包），第二步会把编译好的结果移到 `$GOPATH/pkg 或者` `$GOPATH/bin`。

go install 的编译过程有如下规律：

- go install 是建立在 GOPATH 上的，无法在独立的目录里使用 go install。
- GOPATH 下的 bin 目录放置的是使用 go install 生成的可执行文件，可执行文件的名称来自于编译时的包名。
- go install 输出目录始终为 GOPATH 下的 bin 目录，无法使用`-o`附加参数进行自定义。
- GOPATH 下的 pkg 目录放置的是编译期间的中间文件。
- 执行完go install 后，当前目录不会存在可执行文件，这个区别于 `go build`

# go get

go get 命令可以借助代码管理工具通过远程拉取或更新代码包及其依赖包，并自动完成编译和安装。整个过程就像安装一个 App 一样简单。

这个命令可以动态获取远程代码包，目前支持的有 BitBucket、GitHub、Google Code 和 Launchpad。在使用 go get 命令前，需要安装与远程包匹配的代码管理工具，如 Git、SVN、HG 等，参数中需要提供一个包名。

这个命令在内部实际上分成了两步操作：第一步是下载源码包，第二步是执行 go install。下载源码包的 go 工具会自动根据不同的域名调用不同的源码工具。

参数介绍：

- -d 只下载不安装
- -f 只有在你包含了 -u 参数的时候才有效，不让 -u 去验证 import 中的每一个都已经获取了，这对于本地 fork 的包特别有用
- -fix 在获取源码之后先运行 fix，然后再去做其他的事情
- -t 同时也下载需要为运行测试所需要的包
- -u 强制使用网络去更新包和它的依赖包
- -v 显示执行的命令

# go generate

当运行该命令时，它将扫描与当前包相关的源代码文件，找出所有包含`//go:generate`的特殊注释，提取并执行该特殊注释后面的命令。

使用`go generate`命令时有以下几点需要注意：

- 该特殊注释必须在 .go 源码文件中；
- 每个源码文件可以包含多个 generate 特殊注释；
- 运行`go generate`命令时，才会执行特殊注释后面的命令；
- 当`go generate`命令执行出错时，将终止程序的运行；
- 特殊注释必须以`//go:generate`开头，双斜线后面没有空格。

我们会使用`go generate`命令：

- yacc：从 .y 文件生成 .go 文件；
- protobufs：从 protocol buffer 定义文件（.proto）生成 .pb.go 文件；
- Unicode：从 UnicodeData.txt 生成 Unicode 表；
- HTML：将 HTML 文件嵌入到 go 源码；
- bindata：将形如 JPEG 这样的文件转成 go 代码中的字节数组。

```GO
//go:generate go version
func main() {
	TestMain2()
}
```

# go test

go test 命令，会自动读取源码目录下面名为 *_test.go 的文件，生成并运行测试用的可执行文件。

# go pprof 

Go语言工具链中的 go pprof 可以帮助开发者快速分析及定位各种性能问题，如 CPU 消耗、内存分配及阻塞分析。

性能分析首先需要使用 runtime.pprof 包嵌入到待分析程序的入口和结束处。runtime.pprof 包在运行时对程序进行每秒 100 次的采样，最少采样 1 秒。然后将生成的数据输出，让开发者写入文件或者其他媒介上进行分析。

go pprof 工具链配合 Graphviz 图形化工具可以将 runtime.pprof 包生成的数据转换为 PDF 格式，以图片的方式展示程序的性能分析结果。