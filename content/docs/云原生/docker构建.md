---
title: docker构建

---
# 快速入门

示例项目是一个客户端-服务器应用程序。github地址： 项目的结构如下：

```shell
.
├── Dockerfile
├── cmd
│   ├── client
│   │   ├── main.go
│   │   ├── request.go
│   │   └── ui.go
│   └── server
│       ├── main.go
│       └── translate.go
├── go.mod
└── go.sum
```

cmd目录包含两个组件：client 和 server.客户端是用于编写、发送和接收消息的用户界面。服务器接收来自客户端的消息，对其进行翻译，然后将其发送回客户端。



## DockerFile

### 基本示例

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.20-alpine
ENV GO111MODULE=on \
    GOPROXY=https://goproxy.cn,direct
WORKDIR /src
COPY . .
RUN go mod download
RUN go build -o /bin/client ./cmd/client
RUN go build -o /bin/server ./cmd/server
ENTRYPOINT [ "/bin/server" ]
```

> `# syntax=docker/dockerfile:1`此注释是Dockerfile解析器指令。它指定要使用哪个版本的Dockerfile语法。该文件使用`dockerfile:1`语法，这是最佳实践：它确保您可以访问最新的Docker构建功能。

> `RUN go mod download` 将必要的Go模块下载到容器中。Go模块是Go编程语言的依赖管理工具，类似于JavaScript的npm安装或Python的pip安装。

执行下面的命令构建镜像：

```shell
docker build --tag=buildme .
```

执行下面的命令启动容器：

```shell
PS E:\workspace\buildme> docker run --name=buildme --rm --detach buildme  
904d4beb06deb24bb1df86e529dc1fc2ce0eb699580b2ff6de9cc38d69215880
```

> --detach : 容器后台运行并打印出容器ID
>
> --rm: 容器退出时自动删除

客户端发送请求：

```shell
docker exec -it buildme /bin/client
```

关闭容器：

```shell
docker stop buildme
```

### 容器的层

Dockerfile指令的顺序很重要。Docker构建由一系列有序的构建指令组成。Dockerfile中的每条指令都大致转换为一个图像层。下图说明了Dockerfile如何转换为容器映像中的层堆栈：

![From Dockerfile to layers](./images/layers.png)

build时，会尝试重用先前生成中的层。如果镜像的某个层未更改，则构建器会从构建缓存中拾取该层。如果某个图层自上次生成以来发生了更改，则必须重新生成该层以及随后的所有层。



上一节中的Dockerfile将所有项目文件复制到容器中（`COPY . .`），然后在下面的步骤中下载应用程序依赖项（`RUN go mod download`）。如果要更改任何项目文件，则会使COPY层的缓存无效。这将使后面所有层的缓存无效。

由于Dockerfile指令的当前顺序，构建器必须再次下载Go模块，尽管自上次以来没有任何包发生更改。



Go使用两个名为`go.mod`和`go.sum`的文件来跟踪项目的依赖关系。为了了解要下载的依赖项，您需要将`go.mod`和`go.sum`文件复制到容器中。在`RUN go mod download` 之前添加另一条COPY指令，这次只复制go.mod和go.sum文件。

```dockerfile
  # syntax=docker/dockerfile:1
  FROM golang:1.20-alpine
  WORKDIR /src
- COPY . .
+ COPY go.mod go.sum .
  RUN go mod download
+ COPY . .
  RUN go build -o /bin/client ./cmd/client
  RUN go build -o /bin/server ./cmd/server
  ENTRYPOINT [ "/bin/server" ]
```

现在，如果您编辑源代码，构建图像不会导致构建器每次都下载依赖项。

### 多阶段构建

本节探讨多阶段构建。您想要使用多阶段构建的主要原因有两个：

* 它们允许您并行运行构建步骤，使您的构建管道更快、更高效。
* 它们允许您创建一个占地面积较小的最终镜像，只包含运行程序所需的内容。

在Dockerfile中，构建阶段由FROM指令表示。**使用多阶段构建，您可以选择为构建和运行时环境使用不同的基本映像。您可以将构建工件从构建阶段复制到运行时阶段。**

修改上面的dockerfile:

```dockerfile
  # syntax=docker/dockerfile:1
  FROM golang:1.20-alpine
  WORKDIR /src
  COPY go.mod go.sum .
  RUN go mod download
  COPY . .
  RUN go build -o /bin/client ./cmd/client
  RUN go build -o /bin/server ./cmd/server
+
+ FROM scratch
+ COPY --from=0 /bin/client /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

> 编译之后，你可以对比之前的镜像，看看大小是否发生了变化



下面的修改，可以支持并行构建：

```dockerfile
  # syntax=docker/dockerfile:1
- FROM golang:1.20-alpine
+ FROM golang:1.20-alpine AS base
  WORKDIR /src
  COPY go.mod go.sum .
  RUN go mod download
  COPY . .
+
+ FROM base AS build-client
  RUN go build -o /bin/client ./cmd/client
+
+ FROM base AS build-server
  RUN go build -o /bin/server ./cmd/server

  FROM scratch
- COPY --from=0 /bin/client /bin/server /bin/
+ COPY --from=build-client /bin/client /bin/
+ COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```



最终的图像现在很小，您可以使用并行性高效地构建它。但这个图像有点奇怪，因为它在同一个图像中同时包含客户端和服务器二进制文件。这不应该是两个不同的图像吗？

使用单个Dockerfile可以创建多个不同的图像。您可以使用--target标志指定生成的目标阶段。将未命名的`FROM scratch`阶段替换为名为client和server的两个独立阶段。

```dockerfile
  # syntax=docker/dockerfile:1
  FROM golang:1.20-alpine AS base
  WORKDIR /src
  COPY go.mod go.sum .
  RUN go mod download
  COPY . .

  FROM base AS build-client
  RUN go build -o /bin/client ./cmd/client

  FROM base AS build-server
  RUN go build -o /bin/server ./cmd/server

- FROM scratch
- COPY --from=build-client /bin/client /bin/
- COPY --from=build-server /bin/server /bin/
- ENTRYPOINT [ "/bin/server" ]

+ FROM scratch AS client
+ COPY --from=build-client /bin/client /bin/
+ ENTRYPOINT [ "/bin/client" ]

+ FROM scratch AS server
+ COPY --from=build-server /bin/server /bin/
+ ENTRYPOINT [ "/bin/server" ]
```

现在，您可以将客户端和服务器程序构建为单独的Docker映像（标记）：
```shell
docker build --tag=buildme-client --target=client .
docker build --tag=buildme-server --target=server .
docker images buildme 
REPOSITORY       TAG       IMAGE ID       CREATED          SIZE
buildme-client   latest    659105f8e6d7   20 seconds ago   4.25MB
buildme-server   latest    666d492d9f13   5 seconds ago    4.2MB
```

此更改还避免了每次都必须同时构建两个二进制文件。当选择构建客户端目标时，Docker只构建通向该目标的阶段。跳过 build-server和服server阶段。

### 挂载

本节介绍如何在Docker构建中使用缓存装载和绑定装载。

通过缓存装载，可以指定要在生成过程中使用的持久包缓存。持久缓存有助于加快构建步骤，尤其是涉及使用包管理器安装包的步骤。拥有包的持久缓存意味着，即使重建层，也只会下载新的或更改过的包。

缓存装载是使用`--mount`标志和Dockerfile中的RUN指令创建的。要使用缓存装载，标志的格式为`--mount=type=cache，target=<path>`，其中`<path>`是要装载到容器中的缓存目录的位置。

用于缓存装载的目标路径取决于您正在使用的包管理器。本指南中的应用程序示例使用Go模块。这意味着缓存装载的目标目录是Go模块缓存被写入的目录。默认位置是 `$GOPATH/pkg/mod(默认为/go/pkg/mod)`。

更新下载软件包和编译程序步骤，以将/go/pkg/mod目录作为缓存装载：

```dockerfile
  # syntax=docker/dockerfile:1
  FROM golang:1.20-alpine AS base
  WORKDIR /src
  COPY go.mod go.sum .
- RUN go mod download
+ RUN --mount=type=cache,target=/go/pkg/mod/ \
+     go mod download -x
  COPY . .

  FROM base AS build-client
- RUN go build -o /bin/client ./cmd/client
+ RUN --mount=type=cache,target=/go/pkg/mod/ \
+     go build -o /bin/client ./cmd/client

  FROM base AS build-server
- RUN go build -o /bin/server ./cmd/server
+ RUN --mount=type=cache,target=/go/pkg/mod/ \
+     go build -o /bin/server ./cmd/server

  FROM scratch AS client
  COPY --from=build-client /bin/client /bin/
  ENTRYPOINT [ "/bin/client" ]

  FROM scratch AS server
  COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

> -x标志将打印下载过程。添加此标志可以让您了解在下一步中如何使用缓存装载。

在重新生成映像之前，请清除构建缓存。这可以确保您从头开始，从而更容易地了解构建的具体内容。

```shell
$ docker builder prune -af
```

现在是重建图像的时候了。调用build命令，这次调用--progress=plain标志，同时将输出重定向到日志文件。

```shell
$ docker build --target=client --progress=plain . 2> log1.txt
```

构建完成后，检查log1.txt文件。日志显示Go模块是如何作为构建的一部分下载的:

```shell
awk '/proxy.golang.org/' log1.txt
#11 0.168 # get https://proxy.golang.org/github.com/charmbracelet/lipgloss/@v/v0.6.0.mod
#11 0.168 # get https://proxy.golang.org/github.com/aymanbagabas/go-osc52/@v/v1.0.3.mod
#11 0.168 # get https://proxy.golang.org/github.com/atotto/clipboard/@v/v0.1.4.mod
#11 0.168 # get https://proxy.golang.org/github.com/charmbracelet/bubbletea/@v/v0.23.1.mod
#11 0.169 # get https://proxy.golang.org/github.com/charmbracelet/bubbles/@v/v0.14.0.mod
#11 0.218 # get https://proxy.golang.org/github.com/charmbracelet/bubbles/@v/v0.14.0.mod: 200 OK (0.049s)
#11 0.218 # get https://proxy.golang.org/github.com/aymanbagabas/go-osc52/@v/v1.0.3.mod: 200 OK (0.049s)
#11 0.218 # get https://proxy.golang.org/github.com/containerd/console/@v/v1.0.3.mod
#11 0.218 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.0.mod
#11 0.219 # get https://proxy.golang.org/github.com/charmbracelet/bubbletea/@v/v0.23.1.mod: 200 OK (0.050s)
#11 0.219 # get https://proxy.golang.org/github.com/atotto/clipboard/@v/v0.1.4.mod: 200 OK (0.051s)
#11 0.219 # get https://proxy.golang.org/github.com/charmbracelet/lipgloss/@v/v0.6.0.mod: 200 OK (0.051s)
...
```

现在，为了查看缓存装载是否正在使用，请更改程序导入的Go模块之一的版本。通过更改模块版本，您将强制Go在下次构建时下载依赖项的新版本。如果您不使用缓存装载，您的系统将重新下载所有模块。但是，由于您添加了缓存装载，Go可以重用大多数模块，并且只下载/Go/pkg/mod目录中不存在的软件包版本。



更新应用程序的服务器组件使用的chi包的版本：

```shell
docker run -v $PWD:$PWD -w $PWD golang:1.20-alpine \
    go get github.com/go-chi/chi/v5@v5.0.8
```

现在，运行另一个生成，然后再次将生成日志重定向到日志文件：

```shell
$ docker build --target=client --progress=plain . 2> log2.txt
```

现在，如果你检查log2.txt文件，你会发现只有被更改的chi包被下载了：

```shell
awk '/proxy.golang.org/' log2.txt
#10 0.143 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.mod
#10 0.190 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.mod: 200 OK (0.047s)
#10 0.190 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.info
#10 0.199 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.info: 200 OK (0.008s)
#10 0.201 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.zip
#10 0.209 # get https://proxy.golang.org/github.com/go-chi/chi/v5/@v/v5.0.8.zip: 200 OK (0.008s)
```

您还可以实现一些小的优化来改进Dockerfile。目前，它使用COPY指令在下载模块之前拉入go.mod和go.sum文件。您可以使用绑定装载，而不是将这些文件复制到容器的文件系统。绑定装载可使文件直接从主机提供给容器。此更改完全消除了对附加COPY指令（和层）的需要。

```shell
  # syntax=docker/dockerfile:1
  FROM golang:1.20-alpine AS base
  WORKDIR /src
- COPY go.mod go.sum .
  RUN --mount=type=cache,target=/go/pkg/mod/ \
+     --mount=type=bind,source=go.sum,target=go.sum \
+     --mount=type=bind,source=go.mod,target=go.mod \
      go mod download -x
  COPY . .

  FROM base AS build-client
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      go build -o /bin/client ./cmd/client

  FROM base AS build-server
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      go build -o /bin/server ./cmd/server

  FROM scratch AS client
  COPY --from=build-client /bin/client /bin/
  ENTRYPOINT [ "/bin/client" ]

  FROM scratch AS server
  COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

同样，您也可以使用相同的技术来消除对第二条COPY指令的需要。在生成客户端和生成服务器阶段中指定用于装载当前工作目录的绑定装载。

```shell
  # syntax=docker/dockerfile:1
  FROM golang:1.20-alpine AS base
  WORKDIR /src
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,source=go.sum,target=go.sum \
      --mount=type=bind,source=go.mod,target=go.mod \
      go mod download -x
- COPY . .

  FROM base AS build-client
  RUN --mount=type=cache,target=/go/pkg/mod/ \
+     --mount=type=bind,target=. \
      go build -o /bin/client ./cmd/client

  FROM base AS build-server
  RUN --mount=type=cache,target=/go/pkg/mod/ \
+     --mount=type=bind,target=. \
      go build -o /bin/server ./cmd/server

  FROM scratch AS client
  COPY --from=build-client /bin/client /bin/
  ENTRYPOINT [ "/bin/client" ]

  FROM scratch AS server
  COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

### 构建参数

构建参数是为构建增加灵活性的好方法。您可以在构建时传递构建参数，也可以指定默认值。

构建参数的一个实际用例是为构建阶段指定运行时版本。您的图像使用golang:1.20-alpine图像作为基础图像。但是，如果有人想使用不同版本的Go来构建应用程序，该怎么办？他们可以在Dockerfile中更新版本号，但这很不方便，因为这会使版本之间的切换变得更加乏味。构建参数让生活变得更轻松：

```shell
  # syntax=docker/dockerfile:1
- FROM golang:1.20-alpine AS base
+ ARG GO_VERSION=1.20
+ FROM golang:${GO_VERSION}-alpine AS base
  WORKDIR /src
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,source=go.sum,target=go.sum \
      --mount=type=bind,source=go.mod,target=go.mod \
      go mod download -x

  FROM base AS build-client
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,target=. \
      go build -o /bin/client ./cmd/client

  FROM base AS build-server
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,target=. \
      go build -o /bin/server ./cmd/server

  FROM scratch AS client
  COPY --from=build /bin/client /bin/
  ENTRYPOINT [ "/bin/client" ]

  FROM scratch AS server
  COPY --from=build /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

ARG关键字插入FROM指令中的图像名称中。GO_VERSION构建参数的默认值设置为1.20。如果构建没有接收到GO_VERSION构建参数，FROM指令将解析为golang:1.20-alpine。

请尝试使用`--build-arg`标志为build命令设置不同版本的Go以用于构建：

```shell
$ docker build --build-arg="GO_VERSION=1.19" .
```



您还可以在构建时使用构建参数来修改程序源代码中的值。这对于动态注入信息、避免硬编码值非常有用。使用Go，在构建时使用-ldflags来引用外部值。

```go
// cmd/server/main.go
var version string

func main() {
	if version != "" {
		log.Printf("Version: %s", version)
	}
```

以下示例将APP_VERSION生成参数添加到build-server阶段。Go编译器使用构建参数的值来设置代码中变量的值。

```shell
  # syntax=docker/dockerfile:1
  ARG GO_VERSION=1.20
  FROM golang:${GO_VERSION}-alpine AS base
  WORKDIR /src
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,source=go.sum,target=go.sum \
      --mount=type=bind,source=go.mod,target=go.mod \
      go mod download -x

  FROM base AS build-client
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,target=. \
      go build -o /bin/client ./cmd/client

  FROM base AS build-server
+ ARG APP_VERSION="v0.0.0+unknown"
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,target=. \
-     go build -o /bin/server ./cmd/server
+     go build -ldflags "-X main.version=$APP_VERSION" -o /bin/server ./cmd/server

  FROM scratch AS client
  COPY --from=build-client /bin/client /bin/
  ENTRYPOINT [ "/bin/client" ]

  FROM scratch AS server
  COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
```

现在服务器的版本在构建二进制文件时，无需更新源代码。为了验证这一点，您可以使用docker运行服务器目标并启动一个容器。服务器在启动时输出0.0.1版本。

```shell
docker build --target=server --build-arg="APP_VERSION=v0.0.1" --tag=buildme-server .
docker run buildme-server
2023/04/06 08:54:27 Version: v0.0.1
2023/04/06 08:54:27 Starting server...
2023/04/06 08:54:27 Listening on HTTP port 3000
```

### 导出二进制

你知道吗，你可以使用Docker将你的应用程序构建成独立的二进制文件？有时，您不希望将应用程序打包并分发为Docker映像。使用Docker构建应用程序，并使用exporter将输出保存到磁盘。

docker构建的默认输出格式是容器映像。该映像会自动加载到本地映像存储中，在那里您可以从该映像运行容器，或者将其推送到注册中心。在引擎盖下，它使用默认的导出器，称为docker导出器。

若要将生成结果导出为文件，可以使用local导出器。local导出程序将构建容器的文件系统保存到主机上的指定目录中。

要使用local导出器，请将--output选项传递给docker build命令。--output标志采用一个参数：要保存文件的目录。

以下命令将服务器目标的文件导出到主机文件系统上的当前工作目录：

```shell
$ docker build --output=. --target=server .
```

运行此命令将在处创建一个二进制文件/bin/server。它是在bin/目录下创建的。

```shell
ls -l ./bin
total 14576
-rwxr-xr-x  1 user  user  7459368 Apr  6 09:27 server
```

如果你想创建一个导出两个二进制文件的构建，你可以在Dockerfile中创建另一个构建阶段，从每个构建阶段复制两个二进制代码：

```shell
  # syntax=docker/dockerfile:1
  ARG GO_VERSION=1.20
  FROM golang:${GO_VERSION}-alpine AS base
  WORKDIR /src
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,source=go.sum,target=go.sum \
      --mount=type=bind,source=go.mod,target=go.mod \
      go mod download -x

  FROM base as build-client
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,target=. \
      go build -o /bin/client ./cmd/client

  FROM base as build-server
  ARG APP_VERSION="0.0.0+unknown"
  RUN --mount=type=cache,target=/go/pkg/mod/ \
      --mount=type=bind,target=. \
      go build -ldflags "-X main.version=$APP_VERSION" -o /bin/server ./cmd/server

  FROM scratch AS client
  COPY --from=build-client /bin/client /bin/
  ENTRYPOINT [ "/bin/client" ]

  FROM scratch AS server
  COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]
+
+ FROM scratch AS binaries
+ COPY --from=build-client /bin/client /
+ COPY --from=build-server /bin/server /
```

现在，您可以使用--output选项来导出客户端和服务器二进制文件，从而构建二进制文件目标:

```shell
$ docker build --output=bin --target=binaries .
$ ls -l ./bin
total 29392
-rwxr-xr-x  1 user  user  7581933 Apr  6 09:33 client
-rwxr-xr-x  1 user  user  7459368 Apr  6 09:33 server
```

### 多平台支持

直到本指南中的这一点，您已经构建了Linux二进制文件。本节介绍如何通过仿真和交叉编译使用多平台构建来支持其他操作系统和体系结构。

开始构建多个平台的最简单方法是使用仿真。通过仿真，您可以将应用程序构建到多个体系结构，而无需对Dockerfile进行任何更改。您所需要做的就是将--platform标志传递给build命令，指定要为其构建的操作系统和体系结构。

以下命令为linux/arm/v7平台构建服务器映像：

```shell
$ docker build --target=server --platform=linux/arm/v7 .
```

您还可以同时为多个平台生成输出。但是，默认的构建驱动程序不支持并发的多平台构建。因此，首先，您需要切换到另一个构建器，该构建器使用支持并发多平台构建的驱动程序。

要切换到使用不同的驱动程序，您需要使用Docker Buildx。Buildx是下一代构建客户端，它提供了与您习惯的常规docker构建命令类似的用户体验，同时支持其他功能。

#### 安装 Buildx

Buildx与Docker Desktop绑定，您可以使用Docker Buildx命令调用此构建客户端。无需任何额外设置。如果您手动安装Docker Engine，则可能需要单独安装Buildx插件。

验证Buildx客户端是否已安装在您的系统上，并且您能够运行它：
```shell
$ docker buildx version
github.com/docker/buildx v0.10.3 79e156beb11f697f06ac67fa1fb958e4762c0fab
```

接下来，创建一个使用docker容器的构建器:

```shell
$ docker buildx create --driver=docker-container --name=container
```

这将创建一个具有名称为container的新生成器。你可以用docker buildx ls列出可用的构建器：

```shell
$ docker buildx ls
NAME/NODE           DRIVER/ENDPOINT               STATUS
container           docker-container
  container_0       unix:///var/run/docker.sock   inactive
default *           docker
  default           default                       running
desktop-linux       docker
  desktop-linux     desktop-linux                 running
```

状态为非活动状态。没关系，因为你还没有开始使用它。



开始编译：

```shell
$ docker buildx build \
    --target=binaries \
    --output=bin \
    --builder=container \
    --platform=linux/amd64,linux/arm64,linux/arm/v7 .
```

此命令使用仿真运行同一构建四次，每个平台一次。生成结果将导出到bin目录中：

```shell
bin
├── linux_amd64
│   ├── client
│   └── server
├── linux_arm64
│   ├── client
│   └── server
└── linux_arm_v7
    ├── client
    └── server
```

当您使用支持多平台构建的构建器进行构建时，该构建器会在您指定的每个平台的仿真下运行所有构建步骤。有效地将构建分叉为两个并发进程。

![Build pipelines using emulation](./images/emulation.png)

然而，使用仿真运行多平台构建有一些缺点：

* 如果您尝试运行上面的命令，您可能已经注意到它花了很长时间才完成。对于CPU密集型任务，仿真可能比本机执行慢得多。
* 只有当您正在使用的基本映像支持体系结构时，仿真才能工作。本指南中的示例使用了golang映像的Alpine Linux版本，这意味着对于有限的CPU体系结构，您只能以这种方式构建Linux映像，而无需更改基本映像。

作为模拟的替代方案，下一步将探讨交叉编译。交叉编译使多平台构建更加快速和通用。

您需要做的第一件事是固定构建器，使其使用节点的本地体系结构作为构建平台。这是为了防止模仿。然后，从节点的本地体系结构，构建器将应用程序交叉编译到许多其他目标平台。

这种方法包括使用一些预定义的构建参数，您可以在Docker构建中访问这些参数：`BUILDPLATFORM`和`TARGETPLATFORM`（以及像TARGETOS这样的衍生物）。这些构建参数反映了传递给--platform的值。例如，如果使用--platform=linux/aamd64调用构建，则构建参数解析为：

- `TARGETPLATFORM=linux/amd64`
- `TARGETOS=linux`
- `TARGETARCH=amd64`

当您向平台标志传递多个值时，使用预定义平台参数的构建阶段会自动为每个平台分叉。这与在仿真下运行的构建形成了对比，在仿真中，整个构建管道按平台运行。

![Build pipelines using cross-compilation](./images/cross-compilation.png)

要使用交叉编译技术构建应用程序，请按如下方式更新Dockerfile：

* 将--platform=$BUILDPORM添加到初始基础阶段的FROM指令中，固定golang映像的平台以匹配主机的体系结构。
* 为Go编译阶段添加ARG指令，使TARGETOS和TARGETARCH构建参数可用于此阶段的命令。
* 将GOOS和GOARCH环境变量设置为TARGETOS和TARGETARCH的值。Go编译器使用这些变量进行交叉编译。

```shell
  # syntax=docker/dockerfile:1
  ARG GO_VERSION=1.20
  ARG GOLANGCI_LINT_VERSION=v1.52
- FROM golang:${GO_VERSION}-alpine AS base
+ FROM --platform=$BUILDPLATFORM golang:${GO_VERSION}-alpine AS base
  WORKDIR /src
  RUN --mount=type=cache,target=/go/pkg/mod \
      --mount=type=bind,source=go.mod,target=go.mod \
      --mount=type=bind,source=go.sum,target=go.sum \
      go mod download -x

  FROM base AS build-client
+ ARG TARGETOS
+ ARG TARGETARCH
  RUN --mount=type=cache,target=/go/pkg/mod \
      --mount=type=bind,target=. \
-     go build -o /bin/client ./cmd/client
+     GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o /bin/client ./cmd/client

  FROM base AS build-server
+ ARG TARGETOS
+ ARG TARGETARCH
  RUN --mount=type=cache,target=/go/pkg/mod \
      --mount=type=bind,target=. \
-     go build -o /bin/server ./cmd/server
+     GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o /bin/server ./cmd/server

  FROM scratch AS client
  COPY --from=build-client /bin/client /bin/
  ENTRYPOINT [ "/bin/client" ]

  FROM scratch AS server
  COPY --from=build-server /bin/server /bin/
  ENTRYPOINT [ "/bin/server" ]

  FROM scratch AS binaries
  COPY --from=build-client /bin/client /
  COPY --from=build-server /bin/server /

  FROM golangci/golangci-lint:${GOLANGCI_LINT_VERSION} as lint
  WORKDIR /test
  RUN --mount=type=bind,target=. \
      golangci-lint run
```

现在唯一要做的就是运行实际的构建。要运行多平台构建，请设置--platform选项，并指定要为其构建的操作系统和体系结构的CSV字符串。以下命令说明如何为Mac（ARM64）、Windows和Linux构建和导出二进制文件：

```shell
$ docker buildx build \
  --target=binaries \
  --output=bin \
  --builder=container \
  --platform=darwin/arm64,windows/amd64,linux/amd64 .
```

构建完成后，您将在bin目录中找到所有选定平台的客户端和服务器二进制文件：

```shell
bin
├── darwin_arm64
│   ├── client
│   └── server
├── linux_amd64
│   ├── client
│   └── server
└── windows_amd64
    ├── client
    └── server
```



## 指令详解

Dokerfile指令不区分大小写。然而，惯例是他们要大写。

Docker按顺序运行Dockerfile中的指令。

Dockerfile必须以FROM指令开头。这可能是在解析器指令、注释和全局范围的ARG之后。

注释行在执行Dockerfile指令之前被删除。注释中不支持换行符。

### Parser指令

Parser指令是可选的，并影响Dockerfile中后续行的处理方式。Parser指令不会向构建中添加层，也不会显示为构建步骤。Parser指令是作为一种特殊类型的注释编写的，格式为#directive=value。单个指令只能使用一次。

支持以指令：

- `syntax`
- `escape`: 设置用于对Dockerfile中的字符进行转义的字符。如果未指定，则默认转义符为\。

示例：

```shell
# syntax=docker/dockerfile:1
FROM golang:1.20-alpine AS base
```

###  .dockerignore 文件

在docker CLI将上下文发送到docker守护进程之前，它会在上下文的根目录中查找名为.dokerignore的文件。如果此文件存在，CLI会修改上下文以排除与其中模式匹配的文件和目录。这有助于避免将不必要的大型或敏感文件和目录发送到守护进程，并在使用ADD或COPY将它们添加到映像中。

CLI将.dockerignore文件解释为一个换行的模式列表，类似于Unix shell的文件globs。为了进行匹配，上下文的根目录被视为工作目录和根目录。

```gitignore
# comment
*/temp*
*/*/temp*
temp?
```
