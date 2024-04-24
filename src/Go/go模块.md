---
title: Go 模块
date: 2024-04-24
tags: 
 - Go
categories:
 - Go
---



# GO 模块化的历史

在Go 1.11版本之前，几乎所有的包管理工具都绕不开`GOPATH`这个环境变量。其主要用来放置项目依赖包的源代码。

`GOPATH`不区分项目，代码中任何import的路径均从GOPATH根目录开始；当有多个项目时，不同项目对于依赖库的版本需求不一致时，无法在一个GOPATH下面放置不同版本的依赖项。

典型的例子：当有多项目时候，A项目依赖C 1.0.0，B项目依赖C 2.0.0，由于没有依赖项版本的概念，C 1.0.0和C 2.0.0无法同时在GOPATH下共存，解决办法是分别为A项目和B项目设置GOPATH，将不同版本的C源代码放在两个GOPATH中，彼此独立（编译时切换），或者C 1.0.0和C 2.0.0两个版本更改包名。无论哪种解决方法，都需要人工判断更正，不具备便利性。

此外，在Go Modules之前，没有任何语义化的数据可以知道当前项目的所有依赖项，需要手动找出所有依赖。对项目而言，需要将所有的依赖项全部放入源代码控制中。如果剔除某个依赖，需要在源代码中手工确认某个依赖是否剔除。

为了解决GOPATH的缺陷，Go官方和社区推出许多解决方案，比如godep、govendor、glide等，这些工具要么未彻底解决GOPATH存在的问题要么使用起来繁冗，这才催生了Go Modules的出现。



# 模块管理

## 创建模块

在你的模块根目录下执行命令：

```shell
go mod init github.com/robteix/testmod
```

> github.com/robteix/testmod 是github 仓库的目录，你也可以指定别的地址。

该命令会在目录下生成go.mod文件，内容如下：

```shell
module github.com/robteix/testmod

go 1.13
```

## 下载模块

在将代码推送至Github之后，其他人可以使用如下命令下载到`testmod`:

```shell
go get github.com/robteix/testmod
```

默认情况下，`go get`将会下载master分支。上面我们说过，Go Modules具有语义化版本管理功能的，所以可以使用`go get`下载特定版本的包：

```shell
go get github.com/robteix/testmod@vX.X.X #下载模块并将依赖信息添加到go.mod文件
```

> Go在查找包版本时使用git仓库的tags功能



## 更新模块

默认情况下，出于构建中的可预测性和稳定性考虑，Go不会自动更新模块，需要手动更新依赖。可以使用如下方式更新依赖包： 

1. 使用`go get -u`，更新到修订版本或次要版本，即从v1.0.0更新到v1.0.1，如果v1.1.0可用，则更新到v1.1.0
1. 使用`go get -u=path`，更新到修订版本，即从v1.0.0更新到v1.0.1。 
1. 使用`go get package-path@vX.X.X`更新到特定版本。

使用上述任一方式更新之后，go.mod中的依赖记录都会被更新。

## 依赖本地包

有一种可能出现的情况：项目的某个依赖包并不在Github或者其他代码托管网站上，而是在本地，此时需要修改`go.mod`文件引入本地依赖包。

```text
require (
    3rd/module/testmod v0.0.0
)

replace 3rd/module/testmod => /usr/local/go/testmod
```

代码中以`3rd/module/testmod`作为导入路径，编译时会根据`replace`找到真实代码目录。



## 无网络构建

有一种现实情况是：内部构建系统是无网络环境的，也就是说所有的依赖项都需要纳入内部版本控制中，Go Modules提供了此功能：

```text
go mod vendor
```

该命令会将在当前项目根目录下创建vendor目录，然后将项目所有依赖项缓存此目录中。在默认情况下go build将忽略vendor目录，如果要从vendor目录开始构建：

```text
go build -mod vendor
```

## 依赖管理

列出了当前模块所有的依赖项:

```shell
go list -m all 
```

移除模块中没有用到的依赖项:

```shell
go mod tidy 
```

## go install 

`go install` 和 `go get` 都是 Go 语言的工具命令，但它们之间有一些区别。

- `go get`：用于从远程代码存储库（如 GitHub）中下载或更新 Go 代码包。它会下载代码包并将其存储在 `$GOPATH/src` 目录下对应的位置，并编译代码包中的程序和库。如果目标包之前已经被下载过了，那么 `go get` 会尝试更新到最新版本，并重新编译程序和库文件。在更新完代码包后，`go get` 还会自动把下载的代码包的可执行文件复制到 `$GOPATH/bin` 目录下，以方便直接使用该可执行文件。
- `go install`：用于编译并安装 Go 代码包，并将其生成的可执行程序或库文件存储到 `$GOPATH/bin` 或者 `$GOPATH/pkg` 目录下。如果你在项目目录下执行 `go install`，它将会编译并安装当前项目的代码，生成可执行文件并将其保存到 `$GOPATH/bin` 目录下（如果项目是一个库，则生成的是 `.a` 文件，并将其存储到 `$GOPATH/pkg` 目录下）。

因此，`go get` 用于下载和更新代码包，并产生对应的可执行程序，而 `go install` 用于将一个 Go 代码包转化为可执行程序或库文件，并安装到系统路径以供直接使用。