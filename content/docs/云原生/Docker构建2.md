# 命令详解



## FROM指令

```dockerfile
FROM [--platform=<platform>] <image> [AS <name>]
FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]
FROM [--platform=<platform>] <image>[@<digest>] [AS <name>]
```

FROM指令初始化一个新的构建阶段，并为后续指令设置Base Image。因此，有效的Dockerfile必须以FROM指令开头。

* ARG是Dockerfile中唯一可以在FROM之前的指令。
* FROM可以在一个Dockerfile中多次出现，以创建多个映像，或者将一个构建阶段用作另一个的依赖项。只需在每条新的FROM指令之前记下提交输出的最后一个映像ID即可。每个FROM指令都会清除由以前的指令创建的任何状态。
* 通过在FROM指令中添加AS名称，可以为新的构建阶段指定一个名称（可选）。该名称可以在随后的FROM和COPY-FROM=<name>指令中使用，以引用在此阶段构建的图像。
* 标记值或摘要值是可选的。如果省略其中任何一个，则构建器默认情况下会采用最新的标记。如果构建器找不到标记值，则返回一个错误。

可选的--platform标志可用于在FROM引用多平台映像的情况下指定映像的平台。例如，linux/amd64、linux/arm64或windows/amd64。默认情况下，将使用构建请求的目标平台。全局构建参数可以用于该标志的值，例如，自动平台ARG允许您将阶段强制到本机构建平台（--platform=$BUILDPORM），并使用它在阶段内交叉编译到目标平台。

FROM指令支持由出现在第一个FROM之前的任何ARG指令声明的变量。

```shell
ARG  CODE_VERSION=latest
FROM base:${CODE_VERSION}
CMD  /code/run-app

FROM extras:${CODE_VERSION}
CMD  /code/run-extras
```

在FROM之前声明的ARG在构建阶段之外，因此不能在FROM之后的任何指令中使用。要使用在第一个FROM之前声明的ARG的默认值，请在构建阶段内使用不带值的ARG指令：

```dockerfile
ARG VERSION=latest
FROM busybox:$VERSION
ARG VERSION
RUN echo $VERSION > image_version
```





## 参数传递

### 构建时传递：ARG

```dockerfile
ARG <name>[=<default value>]
```

ARG指令定义了一个变量，用户可以在构建时通过使用`--build-arg <varname>=<value>`参数将该变量传递给构建器。**如果用户指定的构建参数未在Dockerfile中定义，则该构建将输出警告**：

```console
[Warning] One or more build-args [foo] were not consumed.
```

> 不要使用构建变量来传递GitHub密钥、用户凭据等信息。使用`docker history`命令，任何用户都可以看到构建时的变量值。

> ARG指令只定义在它的构建阶段。要在多个阶段中使用参数，每个阶段都必须包含ARG指令。

可以使用ARG或ENV指定RUN指令可用的变量。使用ENV指令定义的环境变量始终覆盖同名的ARG指令：

```dockerfile
FROM ubuntu
ARG CONT_IMG_VER
ENV CONT_IMG_VER=v1.0.0
RUN echo $CONT_IMG_VER
```

如果用下面的指令构建：

```console
$ docker build --build-arg CONT_IMG_VER=v2.0.1 .
```

在这种情况下，RUN指令使用v1.0.0，而不是用户传递的v2.0.1。这种行为类似于shell脚本，其中本地作用域变量覆盖作为参数传递或从环境继承的变量。

#### 预定的ARG变量

Docker有一组预定义的ARG变量，您可以在Dockerfile中使用这些变量，而无需相应的ARG指令。

- `HTTP_PROXY`
- `http_proxy`
- `HTTPS_PROXY`
- `https_proxy`
- `FTP_PROXY`
- `ftp_proxy`
- `NO_PROXY`
- `no_proxy`
- `ALL_PROXY`
- `all_proxy`

要使用这些，请在命令行中使用`--build-arg`标志传递它们，例如：
```dockerfile
$ docker build --build-arg HTTPS_PROXY=https://my-proxy.example.com .
```

### 运行时传递：ENV

```dockerfile
ENV <key>=<value> ...
```

环境变量的值会被持久化在镜像中，当容器运行时，这些环境变量会被设置。



你可以使用 `docker inspect` 查看环境变量， 使用 `docker run --env <key>=<value>` 修改环境变量

> 阶段继承其父阶段或任何祖先使用ENV设置的任何环境变量。

同时设置多个环境变量：

```dockerfile
ENV MY_NAME="John Doe" MY_DOG=Rex MY_CAT=fluffy
```



如果只在构建过程中需要环境变量，而不是在最终映像中，请考虑为单个命令设置一个值：

```dockerfile
RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get install -y ...
```

或者使用未在最终图像中持久化的ARG：

```dockerfile
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y ...
```



环境变量在Dockerfile中用`$variable_name`或`${variable_name}`表示。它们被同等对待，大括号语法通常用于解决没有空格的变量名的问题，比如`${foo}_bar`.

`${variable_name}`语法还支持下面指定的一些标准bash修饰符：

* `$｛variable:-word｝`表示如果设置了变量，则结果将是该值。若并没有设置变量，那个么结果就是word。
* `$｛variable:+word｝`表示如果设置了variable，则word将是结果，否则结果为空字符串。

Dockerfile中的以下指令列表支持环境变量：

- `ADD`
- `COPY`
- `ENV`
- `EXPOSE`
- `FROM`
- `LABEL`
- `STOPSIGNAL`
- `USER`
- `VOLUME`
- `WORKDIR`
- `ONBUILD` (与上面支持的指令之一结合使用时)



环境变量替换将在整个指令中为每个变量使用相同的值。换句话说，在本例中：

```shell
ENV abc=hello
ENV abc=bye def=$abc
ENV ghi=$abc
```

将导致def的值为hello，而不是bye。但是，ghi的值为bye，因为它不是将abc设置为bye的同一指令的一部分。



## 文件复制

### ADD

有两种格式：

```dockerfile
ADD [--chown=<user>:<group>] [--chmod=<perms>] [--checksum=<checksum>] <src>... <dest>
ADD [--chown=<user>:<group>] [--chmod=<perms>] ["<src>",... "<dest>"]
```

> 包含空格的路径需要后一种形式。

ADD指令从`<src>`复制 **文件**、**目录**或**远程文件URL**，并将它们添加到路径`<dest>`中。可以指定多个`＜src＞`资源。

每个＜src＞都可能包含通配符，匹配使用[Go的文件路径](https://golang.org/pkg/path/filepath#Match)。例如：

```dockerfile
ADD hom* /mydir/
ADD hom?.txt /mydir/
```

＜dest＞是一个绝对路径，或相对于WORKDIR的路径：

```dockerfile
ADD test.txt relativeDir/
ADD test.txt /absoluteDir/
```

ADD命令遵循以下约束：

* `＜src＞`路径必须在生成的上下文中；不能添加`/something/something`，因为docker构建的第一步是将上下文目录（和子目录）发送到docker守护进程。

* 如果`<src>`是一个URL，并且`<dest>`没有以斜杠结尾，则会从该URL下载一个文件并将其复制到`<dest>`。

* 如果`<src>`是一个URL，并且`<dest>`确实以斜杠结尾，则会从URL推断出文件名，并将文件下载到`<dest>/<filename>`。

* 如果`＜src＞`是一个目录，则会复制该目录的全部内容，包括文件系统元数据。

* 如果`<src>`是一个可识别压缩格式（identity、gzip、bzip2或xz）的本地tar存档，那么它将被解压缩为一个目录。来自远程URL的资源不能被解压缩。当一个目录被复制或解压缩时，它具有与`tar -x`相同的行为

  > 文件是否被识别为可识别的压缩格式完全取决于文件的内容，而不是文件的名称。例如，如果一个空文件恰好以.tar.gz结尾，那么它将不会被识别为压缩文件，也不会生成任何类型的解压缩错误消息，而是将文件简单地复制到目标。

* 如果＜src＞是任何其他类型的文件，则会将其与元数据一起单独复制。在这种情况下，如果＜dest＞以斜杠/结尾，它将被视为一个目录，＜src＞的内容将写入＜dest>/base（＜src＞）。
* 如果直接或由于使用通配符指定了多个<src>资源，则<dest>必须是一个目录，并且必须以斜线/结尾。
* 如果＜dest＞没有以斜杠结尾，则它将被视为一个常规文件，并且＜src＞的内容将写入＜dest>。
* 如果＜dest＞不存在，它将与路径中所有丢失的目录一起创建。

#### 文件所有者和权限

* 创建的所有新文件和目录的UID和GID都为0，除非可选的`--chown`标志指定了给定的用户名、组名或UID/GID组合。--chown标志的格式允许使用用户名和组名字符串，或者任意组合的直接整数UID和GID。

* 提供不带组名的用户名或不带GID的UID将使用与GID相同的数字UID。

* 如果提供了用户名或组名，则容器的根文件系统/etc/passwd和/etc/group文件将分别用于执行从名称到整数UID或GID的转换。以下示例显示了--chown标志的有效定义：

```dockerfile
ADD --chown=55:mygroup files* /somedir/
ADD --chown=bin files* /somedir/
ADD --chown=1 files* /somedir/
ADD --chown=10:11 files* /somedir/
ADD --chown=myuser:mygroup --chmod=655 files* /somedir/
```

如果容器根文件系统不包含/etc/passwd或/etc/group文件，并且--chown标志中使用了用户名或组名，则ADD操作将导致构建失败。使用数字ID不需要查找，也不依赖于容器根文件系统内容。



在`<src>`是远程文件URL的情况下，目标将具有600的权限。如果正在检索的远程文件具有`HTTP Last Modified`标头，则该标头中的时间戳将用于设置目标文件的`mtime`。然而，与ADD期间处理的任何其他文件一样，mtime将不包括在确定文件是否已更改以及是否应更新高速缓存中。

如果您的URL文件使用身份验证进行保护，则需要使用RUN wget、RUN curl或使用容器中的其他工具，因为ADD指令不支持身份验证。

> 如果通过STDIN（dockerbuild-<somefile）传递Dockerfile进行构建，则没有构建上下文，因此Dockerfile只能包含基于URL的ADD指令。您还可以通过STDIN:（docker-build-<archive.tar.gz）传递压缩的归档文件，归档文件根目录下的Dockerfile和归档文件的其余部分将用作构建的上下文。



#### 添加git仓库

直接将git存储库添加到映像中，而无需在映像中使用git命令：

```dockerfile
ADD [--keep-git-dir=<boolean>] <git ref> <dir>
```

示例：

```dockerfile
# syntax=docker/dockerfile:1
FROM alpine
ADD --keep-git-dir=true https://github.com/moby/buildkit.git#v0.10.1 /buildkit
```

`--keep-git-dir=true` 添加 `.git` 目录， 默认为false



要通过SSH添加私有repo，请使用以下格式创建Dockerfile：

```dockerfile
# syntax=docker/dockerfile:1
FROM alpine
ADD git@git.example.com:foo/bar.git /bar
```

这个Dockerfile可以用`docker build-ssh`或`buildctl build -ssh`构建，例如:

```dockerfile
$ docker build --ssh default
```

```dockerfile
$ buildctl build --frontend=dockerfile.v0 --local context=. --local dockerfile=. --ssh default
```

### COPY

COPY与ADD命令几乎完全相同，只是不支持解压。COPY有两种形式：

```dockerfile
COPY [--chown=<user>:<group>] [--chmod=<perms>] <src>... <dest>
COPY [--chown=<user>:<group>] [--chmod=<perms>] ["<src>",... "<dest>"]
```

包含空格的路径需要后一种形式

COPY（可选）接受一个标志`--from=<name>`，该标志可用于将源位置设置为将使用的上一个生成阶段（使用`from..AS <name>`创建），而不是用户发送的构建上下文。如果找不到具有指定名称的生成阶段，则尝试使用具有相同名称的映像。

#### —link

在COPY或ADD命令中启用此标志可以使您复制具有增强语义的文件，其中您的文件在其自己的层上保持独立，并且在前一层上的命令更改时不会失效。

当使用--link时，源文件将被复制到一个空的目标目录中。该目录将变成一个链接在先前状态之上的层。

```dockerfile
# syntax=docker/dockerfile:1
FROM alpine
COPY --link /foo /bar
```

相当于执行两个构建：

```dockerfile
FROM alpine
```

```dockerfile
FROM scratch
COPY /foo /bar
```

以及将两个图像的所有层合并在一起。

使用--link可以在后续构建中重用已构建的层，即使以前的层已经更改。这对于多阶段构建尤其重要，因为如果同一阶段中的任何先前命令发生更改，则`COPY --from`之前的语句将失效，从而需要再次重建中间阶段。使用--link，上一次生成的层将被重用并合并到新层的顶部。这也意味着，当基础图像收到更新时，您可以轻松地重新调整图像的基础，而无需再次执行整个构建。在支持它的后端，BuildKit可以执行此重新基准操作，而无需在客户端和注册中心之间推送或拉取任何层。BuildKit将检测到这种情况，并且只创建包含正确顺序的新层和旧层的新图像清单。

## 命令

### CMD

CMD指令有三种形式：

* CMD ["executable","param1","param2"] : exec形式，这是首选形式
* CMD ["param1","param2"]: 作为ENTRYPOINT的默认参数
* CMD command param1 param2: shell形式



一个Dockerfile中只能有一条CMD指令。如果列出多个CMD，则只有最后一个CMD才会生效。

**CMD的主要目的是为正在执行的容器提供默认值**。这些默认值可以包括可执行文件，也可以省略可执行文件，在这种情况下，还必须指定ENTRYPOINT指令。

如果CMD用于为ENTRYPOINT指令提供默认参数，则CMD和ENTRYPOINT指令都应使用JSON数组格式指定。

> exec 形式被解析为JSON数组，这意味着您必须在单词周围使用双引号（"），而不是单引号（‘）。



与shell形式不同，exec形式不调用命令shell。这意味着不会进行正常的shell处理。例如，`CMD [ "echo", "$HOME" ]`进行变量替换。如果需要shell处理，则使用shell形式或直接执行shell，例如：`CMD [ "sh", "-c", "echo $HOME" ]`。当使用exec形式并直接执行shell时，就像shell形式一样，是shell在进行环境变量扩展，而不是docker。

在shell或exec形式中使用时，CMD指令会设置运行映像时要执行的命令。

如果使用CMD的shell形式，则＜command＞将在`/bin/sh -c`中执行：

```dockerfile
FROM ubuntu
CMD echo "This is a test." | wc -
```

如果您想在没有shell的情况下运行＜command＞，则必须将该命令表示为JSON数组，并提供可执行文件的完整路径。此数组形式是CMD的首选格式。任何附加参数都必须在数组中单独表示为字符串：

```dockerfile
FROM ubuntu
CMD ["/usr/bin/wc","--help"]
```

如果您希望容器每次都运行相同的可执行文件，那么您应该考虑将ENTRYPOINT与CMD结合使用。

如果用户指定了要docker run的参数，那么它们将覆盖CMD中指定的默认值。

### ENTRYPOINT 

ENTRYPOINT 有两种 形式：

* exec形式（首选）： `ENTRYPOINT ["executable", "param1", "param2"]`

* shell 形式： `ENTRYPOINT command param1 param2`

ENTRYPOINT允许您配置将作为可执行文件运行的容器。例如，以下命令使用其默认内容启动nginx，在端口80上侦听：

```dockerfile
$ docker run -i -t --rm -p 80:80 nginx
```

`docker run <image>`的命令行参数将附加在exec形式 ENTRYPOINT中的所有元素之后，并将覆盖使用CMD指定的所有元素。这允许将参数传递到入口点，即`docker run <image> -d`将把-d参数传递到该入口点。您可以使用`docker run --ENTRYPOINT` 标志覆盖ENTRYPOINT指令。

shell形式防止使用任何CMD或`docker run`命令行参数，但缺点是ENTRYPOINT将作为`/bin/sh -c`的子命令启动，该子命令不传递信号。这意味着可执行文件将不是容器的PID 1，也不会接收Unix信号，因此您的可执行文件不会从`docker stop＜container＞`接收SIGTERM。

只有Dockerfile中的最后一条ENTRYPOINT指令才会生效。



#### exec 形式示例

您可以使用ENTRYPOINT的exec形式来设置固定默认命令和参数，然后使用CMD的任何一种形式来设置更可能更改的参数。

```dockerfile
FROM ubuntu
ENTRYPOINT ["top", "-b"]
CMD ["-c"]
```

当您运行容器时，您可以看到top是唯一的进程：

```shell
docker run -it --rm --name test  top -H

top - 08:25:00 up  7:27,  0 users,  load average: 0.00, 0.01, 0.05
Threads:   1 total,   1 running,   0 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.1 us,  0.1 sy,  0.0 ni, 99.7 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
KiB Mem:   2056668 total,  1616832 used,   439836 free,    99352 buffers
KiB Swap:  1441840 total,        0 used,  1441840 free.  1324440 cached Mem

  PID USER      PR  NI    VIRT    RES    SHR S %CPU %MEM     TIME+ COMMAND
    1 root      20   0   19744   2336   2080 R  0.0  0.1   0:00.04 top
```

要进一步检查结果，可以使用docker exec：
```shell
$ docker exec -it test ps aux

USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  2.6  0.1  19752  2352 ?        Ss+  08:24   0:00 top -b -H
root         7  0.0  0.1  15572  2164 ?        R+   08:25   0:00 ps aux
```

您可以使用`docker stop test` 来优雅地请求top关闭。



以下Dockerfile显示使用ENTRYPOINT在前台运行Apache（即，作为PID 1）：

```shell
FROM debian:stable
RUN apt-get update && apt-get install -y --force-yes apache2
EXPOSE 80 443
VOLUME ["/var/www", "/var/log/apache2", "/etc/apache2"]
ENTRYPOINT ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
```



如果您需要为单个可执行文件编写启动脚本，可以使用exec和gosu命令确保最终可执行文件接收Unix信号：

```shell
#!/usr/bin/env bash
set -e

if [ "$1" = 'postgres' ]; then
    chown -R postgres "$PGDATA"

    if [ -z "$(ls -A "$PGDATA")" ]; then
        gosu postgres initdb
    fi

    exec gosu postgres "$@"
fi

exec "$@"
```

最后，如果您需要在关闭时进行一些额外的清理（或与其他容器通信），或者正在协调多个可执行文件，您可能需要确保ENTRYPOINT脚本接收Unix信号，传递它们，然后再做一些工作：

```shell
#!/bin/sh
# Note: I've written this using sh so it works in the busybox container too

# USE the trap if you need to also do manual cleanup after the service is stopped,
#     or need to start multiple services in the one container
trap "echo TRAPed signal" HUP INT QUIT TERM

# start service in background here
/usr/sbin/apachectl start

echo "[hit enter key to exit] or run 'docker stop <container>'"
read

# stop service and clean up here
echo "stopping apache"
/usr/sbin/apachectl stop

echo "exited $0"
```

如果使用`docker run-it--rm-p 80:80 --name test apache`运行此映像，则可以使用docker exec或docker top检查容器的进程，然后要求脚本停止apache：

```shell
docker exec -it test ps aux

USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.1  0.0   4448   692 ?        Ss+  00:42   0:00 /bin/sh /run.sh 123 cmd cmd2
root        19  0.0  0.2  71304  4440 ?        Ss   00:42   0:00 /usr/sbin/apache2 -k start
www-data    20  0.2  0.2 360468  6004 ?        Sl   00:42   0:00 /usr/sbin/apache2 -k start
www-data    21  0.2  0.2 360468  6000 ?        Sl   00:42   0:00 /usr/sbin/apache2 -k start
root        81  0.0  0.1  15572  2140 ?        R+   00:44   0:00 ps aux

docker top test

PID                 USER                COMMAND
10035               root                {run.sh} /bin/sh /run.sh 123 cmd cmd2
10054               root                /usr/sbin/apache2 -k start
10055               33                  /usr/sbin/apache2 -k start
10056               33                  /usr/sbin/apache2 -k start

/usr/bin/time docker stop test

test
real	0m 0.27s
user	0m 0.03s
sys	0m 0.03s
```

与shell形式不同，exec形式不调用命令shell。这意味着不会进行正常的shell处理。例如，`CMD [ "echo", "$HOME" ]`进行变量替换。如果需要shell处理，则使用shell形式或直接执行shell，例如：`CMD [ "sh", "-c", "echo $HOME" ]`。当使用exec形式并直接执行shell时，就像shell形式一样，是shell在进行环境变量扩展，而不是docker。



#### shell形式示例

您可以为ENTRYPOINT指定一个纯字符串，它将在`/bin/sh -c`中执行。此形式将使用shell处理来替换shell环境变量，并将忽略任何CMD或docker run的命令行参数。为了确保docker stop将正确地向任何长时间运行的ENTRYPOINT可执行文件发出信号，您需要记住用exec启动它：

```shell
FROM ubuntu
ENTRYPOINT exec top -b
```

运行此映像时，您将看到单个PID 1进程：

```shell
docker run -it --rm --name test top

Mem: 1704520K used, 352148K free, 0K shrd, 0K buff, 140368121167873K cached
CPU:   5% usr   0% sys   0% nic  94% idle   0% io   0% irq   0% sirq
Load average: 0.08 0.03 0.05 2/98 6
  PID  PPID USER     STAT   VSZ %VSZ %CPU COMMAND
    1     0 root     R     3164   0%   0% top -b
```

执行 docker stop 退出：

```shell
/usr/bin/time docker stop test

test
real	0m 0.20s
user	0m 0.02s
sys	0m 0.04s
```

如果您忘记将exec添加到ENTRYPOINT的开头：
```
FROM ubuntu
ENTRYPOINT top -b
CMD -- --ignored-param1
```

然后，您可以运行它（为下一步命名）：

```shell
docker run -it --name test top --ignored-param2

top - 13:58:24 up 17 min,  0 users,  load average: 0.00, 0.00, 0.00
Tasks:   2 total,   1 running,   1 sleeping,   0 stopped,   0 zombie
%Cpu(s): 16.7 us, 33.3 sy,  0.0 ni, 50.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   1990.8 total,   1354.6 free,    231.4 used,    404.7 buff/cache
MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.   1639.8 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0    2612    604    536 S   0.0   0.0   0:00.02 sh
    6 root      20   0    5956   3188   2768 R   0.0   0.2   0:00.00 top
```

您可以从顶部的输出中看到，指定的ENTRYPOINT不是PID 1。

如果随后运行docker stop test，容器将不会干净地退出, stop命令将被迫在超时后发送SIGKILL：

```shell
docker exec -it test ps waux

USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.4  0.0   2612   604 pts/0    Ss+  13:58   0:00 /bin/sh -c top -b --ignored-param2
root         6  0.0  0.1   5956  3188 pts/0    S+   13:58   0:00 top -b
root         7  0.0  0.1   5884  2816 pts/1    Rs+  13:58   0:00 ps waux

/usr/bin/time docker stop test

test
real	0m 10.19s
user	0m 0.04s
sys	0m 0.03s
```

### 了解CMD和ENTRYPOINT如何交互

CMD和ENTRYPOINT指令都定义了在运行容器时执行的命令。下面的规则可以描述他们的合作：

* Dockerfile应至少指定CMD或ENTRYPOINT命令中的一个。
* 将容器用作可执行文件时，应定义ENTRYPOINT。
* CMD应该用作定义ENTRYPOINT命令的默认参数或在容器中执行特定命令的方法。
* 当使用替代参数运行容器时，CMD将被覆盖。

下表显示了针对不同ENTRYPOINT/CMD组合执行的命令：

|                                | No ENTRYPOINT              | ENTRYPOINT exec_entry p1_entry | ENTRYPOINT ["exec_entry", "p1_entry"]          |
| :----------------------------- | :------------------------- | :----------------------------- | ---------------------------------------------- |
| **No CMD**                     | *error, not allowed*       | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry                            |
| **CMD ["exec_cmd", "p1_cmd"]** | exec_cmd p1_cmd            | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry exec_cmd p1_cmd            |
| **CMD exec_cmd p1_cmd**        | /bin/sh -c exec_cmd p1_cmd | /bin/sh -c exec_entry p1_entry | exec_entry p1_entry /bin/sh -c exec_cmd p1_cmd |

> 如果CMD是从基本映像中定义的，则设置ENTRYPOINT会将CMD重置为空值。在这种情况下，必须在当前映像中定义CMD才能具有值。



## 用户和工作目录

### USER

```shell
USER <user>[:<group>]
USER <UID>[:<GID>]
```

USER指令设置用户名（或UID）和可选的用户组（或GID），用作当前阶段剩余部分的默认用户和组。指定的用户用于执行RUN指令，并在容器运行时运行相关的ENTRYPOINT和CMD命令。

> 请注意，为用户指定组时，用户将仅具有指定的组成员身份。任何其他配置的组成员身份都将被忽略。

当用户没有主组时，映像（或下一条指令）将与 root 组一起运行。
在Windows上，如果用户不是内置帐户，则必须首先创建该用户。这可以通过作为Dockerfile的一部分调用的net user命令来完成：

```shell
FROM microsoft/windowsservercore
# Create Windows user in the container
RUN net user /add patrick
# Set it for subsequent commands
USER patrick
```

### WORKDIR 

```dockerfile
WORKDIR /path/to/workdir
```

WORKDIR指令为Dockerfile中的任何RUN、CMD、ENTRYPOINT、COPY和ADD指令设置工作目录。如果WORKDIR不存在，即使它没有在任何后续的Dockerfile指令中使用，它也会被创建。如果未指定，则默认工作目录为/。在实践中，如果您不是从头开始构建Dockerfile（from scratch），那么WORKDIR可能是由您正在使用的基本映像设置的。因此，为了避免在未知目录中进行意外操作，最好显式设置WORKDIR。



WORKDIR指令可以在Dockerfile中多次使用。如果提供了一个相对路径，它将是相对于上一个WORKDIR指令的路径。例如：

```dockerfile
WORKDIR /a
WORKDIR b
WORKDIR c
RUN pwd
```

这个Dockerfile中的最后一个pwd命令的输出将是/a/b/c。

WORKDIR指令可以解析以前使用ENV设置的环境变量。您只能使用Dockerfile中显式设置的环境变量。例如：

```shell
ENV DIRPATH=/path
WORKDIR $DIRPATH/$DIRNAME
RUN pwd
```







## 挂载

```dockerfile
VOLUME ["/data"]
```

VOLUME指令创建一个具有指定名称的装载点，并将其标记为容纳来自本地主机或其他容器的外部装载卷。该值可以是JSON数组`VOLUME["/var/log/"]`，也可以是带有多个参数的纯字符串，如`VOLUME /var/log`或`VOLUME /var/log /var/db`。

docker run命令使用基本映像中指定位置初始化新创建的卷。例如，考虑以下Dockerfile片段：

```dockerfile
FROM ubuntu
RUN mkdir /myvol
RUN echo "hello world" > /myvol/greeting
VOLUME /myvol
```

这个Dockerfile会生成一个映像，该映像会导致docker run在/myvol上创建一个新的装载点，并将greeting文件复制到新创建的卷中。

关于Dockerfile中的卷，请记住以下几点:

* 基于Windows容器上的卷：使用基于Windows的容器时，容器内卷的目标必须是以下之一：
  * 不存在或为空的目录
  * 不能是 C: 盘
* 从Dockerfile中更改卷：如果任何构建步骤在声明卷后更改了卷中的数据，则这些更改将被丢弃。
* JSON格式：列表被解析为JSON数组。必须用双引号（"）而不是单引号（'）将单词括起来。
* 主机目录是在容器运行时声明的：主机目录（装入点）本质上依赖于主机。这是为了保持映像的可移植性，因为不能保证给定的主机目录在所有主机上都可用。因此，您无法从Dockerfile中装载主机目录。VOLUME指令不支持指定主机目录参数。创建或运行容器时，必须指定装入点。



## 其他

### ONBUILD

```dockerfile
ONBUILD <INSTRUCTION>
```

ONBUILD指令会在映像中添加一条触发器指令，以便稍后在映像用作另一个构建的基础时执行。触发器将在下游构建的上下文中执行，就好像它是在下游Dockerfile中的FROM指令之后立即插入的一样。

任何生成指令都可以注册为触发器。

如果您正在构建一个映像，该映像将用作构建其他映像的基础，例如应用程序构建环境或可以使用用户特定配置进行自定义的守护进程，那么这将非常有用。

例如，如果您的映像是一个可重用的Python应用程构建器，则需要将应用程序源代码添加到特定目录中，并且可能需要在之后调用构建脚本。现在不能只调用ADD和RUN，因为您还没有访问应用程序源代码的权限，而且每个应用程序构建的代码都会有所不同。您可以简单地为应用程序开发人员提供一个样板Dockerfile，将其复制粘贴到应用程序中，但这是低效的、容易出错的，而且很难更新，因为它与特定于应用程序的代码混合在一起。

解决方案是使用ONBUILD来注册高级指令，以便稍后在下一个构建阶段运行。下面是工作的原理：

1. 当遇到ONBUILD指令时，构建器会向正在构建的图像的元数据添加一个触发器。该指令不会影响当前生成。
2. 在构建结束时，所有触发器的列表都存储在映像清单中的OnBuild下。它们可以使用docker inspect命令进行检查。
3. 稍后，可以使用FROM指令将图像用作新构建的基础。作为处理FROM指令的一部分，下游构建器查找ONBUILD触发器，并按照它们注册的相同顺序执行它们。如果任何触发器失败，FROM指令将中止，从而导致构建失败。如果所有触发器都成功，则FROM指令将完成，构建将照常进行。
4. 触发器在执行后会从最终图像中清除。换句话说，它们不能被子孙构建继承的。

例如，您可以添加以下内容：
```shell
ONBUILD ADD . /app/src
ONBUILD RUN /usr/local/bin/python-build --dir /app/src
```



### STOPSIGNAL

```shell
STOPSIGNAL signal
```

STOPSSIGNAL指令 将发送退出信号 给容器。该信号可以是`SIG＜name＞`格式的信号名称，例如`SIGKILL`，也可以是与内核系统调用表中的位置匹配的无符号数字，例如 9。如果未定义，则默认值为`SIGTERM`。

可以在docker run 和docker create 时使用 `--stop-signal`标志来覆盖每个容器映像的默认stopsignal。



### HEALTHCHECK

HEALTHCHECK指令有两种形式：

* HEALTHCHECK [OPTIONS] CMD命令（通过在容器内运行命令来检查容器运行状况）
* HEALTHCHECK NONE（禁用从基本映像继承的任何健康检查）

HEALTHCHECK指令告诉Docker如何测试容器以检查它是否仍在工作。这可以检测到一些情况，例如web服务器陷入无限循环，无法处理新的连接，即使服务器进程仍在运行。

当容器指定了健康检查时，除了正常状态外，它还具有健康状态。此状态最初处于启动状态。只要健康检查通过，它就会变得健康（无论以前处于什么状态）。在一定数量的连续故障之后，它会变得不健康。

CMD之前可以显示的选项有：

- `--interval=DURATION` (default: `30s`)
- `--timeout=DURATION` (default: `30s`)
- `--start-period=DURATION` (default: `0s`)
- `--start-interval=DURATION` (default: `5s`)
- `--retries=N` (default: `3`)

运行状况检查将首先在容器启动后以秒为间隔运行，然后在每次上次检查完成后以秒的间隔再次运行。如果单次检查花费的时间超时，则认为检查失败。容器的运行状况检查连续失败需要重试才能被视为不正常。

启动周期（start-period）为需要时间引导的容器提供初始化时间。在此期间的探测失败将不会计入最大重试次数。但是，如果在启动期间运行状况检查成功，则认为容器已启动，并且所有连续的失败都将计入最大重试次数。

启动间隔（start-interval）是指在启动期间运行状况检查之间的时间。

Dockerfile中只能有一条HEALTHCHECK指令。如果您列出了多个，那么只有最后一个HEALTHCHECK才会生效。

CMD关键字后面的命令可以是shell命令（例如`HEALTHCHECK CMD /bin/check-running`）或exec数组。 命令的退出状态指示容器的运行状况。可能的值为：

* 0：成功-容器是健康的，可以使用
* 1：不健康-容器工作不正常
* 2：保留-不要使用此退出代码

例如，每隔五分钟左右检查一次web服务器是否能够在三秒内为网站主页提供服务：

```shell
HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

为了调试失败的探测，命令在stdout或stderr上写入的任何输出文本（UTF-8编码）都将存储在运行状况中，并且可以使用docker inspect进行查询。这样的输出应该保持简短（当前只存储前4096个字节）。

当容器的运行状况发生变化时，将生成具有新状态的health_status事件。

### SHELL 

```dockerfile
SHELL ["executable", "parameters"]
```

SHELL指令允许覆盖命令SHELL形式的默认SHELL。Linux上的默认shell为["/bin/sh"，"-c"]，Windows上的默认shell为["cmd"，"/S"，"/c"]。SHELL指令必须在Dockerfile中以JSON形式编写。

SHELL指令在Windows上特别有用，因为Windows中有两种常用且完全不同的原生SHELL：cmd和powershell，以及包括sh在内的备用SHELL。

SHELL指令可以出现多次。每个SHELL指令都会覆盖以前的所有SHELL指令，并影响所有后续指令。例如：

```shell
FROM microsoft/windowsservercore

# Executed as cmd /S /C echo default
RUN echo default

# Executed as cmd /S /C powershell -command Write-Host default
RUN powershell -command Write-Host default

# Executed as powershell -command Write-Host hello
SHELL ["powershell", "-command"]
RUN Write-Host hello

# Executed as cmd /S /C echo hello
SHELL ["cmd", "/S", "/C"]
RUN echo hello
```

当在Dockerfile中使用SHELL形式时，以下指令可能会受到SHELL指令的影响：RUN、CMD和ENTRYPOINT。

以下示例是Windows上常见的模式，可以使用SHELL指令进行精简：

```dockerfile
RUN powershell -command Execute-MyCmdlet -param1 "c:\foo.txt"
```

docker调用的命令将是：

```powershell
cmd /S /C powershell -command Execute-MyCmdlet -param1 "c:\foo.txt"
```

这效率低下有两个原因。首先，调用了一个不必要的cmd.exe命令处理器（又名shell）。其次，shell形式的每个RUN指令都需要一个额外的powershell命令作为命令的前缀。

为了提高效率，可以采用两种机制中的一种。一种是使用RUN命令的JSON形式，例如：

```dockerfile
RUN ["powershell", "-command", "Execute-MyCmdlet", "-param1 \"c:\\foo.txt\""]
```

虽然JSON格式是明确的，并且不使用不必要的cmd.exe，但它确实需要通过双引号和转义来提高详细程度。另一种机制是使用SHELL指令和SHELL形式，为Windows用户提供更自然的语法，尤其是与转义语法分析器指令结合使用时：

```dockerfile
# escape=`

FROM microsoft/nanoserver
SHELL ["powershell","-command"]
RUN New-Item -ItemType Directory C:\Example
ADD Execute-MyCmdlet.ps1 c:\example\
RUN c:\example\Execute-MyCmdlet -sample 'hello world'
```

### Here-documents

将后续Dockerfile行重定向到RUN或COPY命令的输入:

```dockerfile
# syntax=docker/dockerfile:1
FROM debian
RUN <<EOT bash
  set -ex
  apt-get update
  apt-get install -y vim
EOT
```

如果命令只包含只 herehere-document文档，则使用默认shell评估其内容：

```dockerfile
# syntax=docker/dockerfile:1
FROM debian
RUN <<EOT
  mkdir -p foo/bar
EOT
```

或者，shebang头可以用来定义解释器。

```shell
# syntax=docker/dockerfile:1
FROM python:3.6
RUN <<EOT
#!/usr/bin/env python
print("hello world")
EOT
```

更复杂的示例可能使用多个here文档:

```shell
# syntax=docker/dockerfile:1
FROM alpine
RUN <<FILE1 cat > file1 && <<FILE2 cat > file2
I am
first
FILE1
I am
second
FILE2
```





## 元数据

### LABEL 

```dockerfile
LABEL <key>=<value> <key>=<value> <key>=<value> ...
```

LABEL指令将元数据添加到图像中。LABEL是一个键值对。若要在LABEL值中包含空格，请像在命令行分析中一样使用引号和反斜杠。以下是一些用法示例：

```dockerfile
LABEL "com.example.vendor"="ACME Incorporated"
LABEL com.example.label-with-value="foo"
LABEL version="1.0"
LABEL description="This text illustrates \
that label-values can span multiple lines."
```

> 请务必使用双引号，而不是单引号。特别是当您使用字符串插值时（例如LABEL example="foo-$ENV_VAR"），单引号将按原样使用字符串，而无需拆包变量的值。

基本图像或父图像（FROM行中的图像）中包含的标签由图像继承。如果标签已经存在，但具有不同的值，则最近应用的值将覆盖以前设置的任何值。

要查看图像的标签，请使用docker image inspect命令。您可以使用--format选项来只显示标签；

```shell
$ docker image inspect --format='{{json .Config.Labels}}' myimage
```

## 端口暴漏 EXPOSE 

```dockerfile
EXPOSE <port> [<port>/<protocol>...]
```

EXPOSE指令通知Docker容器在运行时侦听指定的网络端口。您可以指定端口是侦听TCP还是UDP，如果未指定协议，则默认为TCP。

EXPOSE指令实际上并没有发布端口。它的作用是构建映像的人和运行容器的人之间的一种文档，说明要发布哪些端口。要在运行容器时实际发布端口，请在docker run中使用-p标志来发布和映射一个或多个端口，或者使用-p标志来发布所有公开的端口并将它们映射到高阶端口。

默认情况下，EXPOSE采用TCP。您也可以指定UDP:

```dockerfile
EXPOSE 80/udp
```

要在TCP和UDP上公开，请包括两行：

```dockerfile
EXPOSE 80/tcp
EXPOSE 80/udp
```

在这种情况下，如果在docker运行时使用-P，则TCP和UDP将分别暴露一次端口。请记住，-P在主机上使用短暂的高位主机端口，因此TCP和UDP的端口将不相同。

不管EXPOSE设置如何，都可以在运行时使用-p标志来覆盖它们。例如
```
$ docker run -p 80:80/tcp -p 80:80/udp ...
```

要在主机系统上设置端口重定向，请参阅使用-P flag。docker network命令支持创建用于容器之间通信的网络，而无需公开或发布特定端口，因为连接到网络的容器可以通过任何端口相互通信。



## RUN指令

run指令有两种形式：

* shell形式： `RUN <command>`
* exec 形式： `RUN ["executable", "param1", "param2"]`

RUN指令的缓存在下一次构建期间不会自动失效。`RUN apt-get dist-upgrade -y` 这样的指令的缓存将在下一次构建中重用。可以通过使用--no-cache标志 禁用缓存 。



### --mount

RUN —mount 允许您创建可以在构建时访问的文件系统装载。这可用于：

* 创建到主机文件系统或其他构建阶段的绑定装载
* 访问构建密钥或ssh代理套接字
* 使用持久包管理缓存加快构建速度

语法：

```shell
--mount=[type=<TYPE>][,option=<value>[,option=<value>]...]
```

挂载的类型：

| Type                                                         | Description                                                |
| ------------------------------------------------------------ | ---------------------------------------------------------- |
| [`bind`](https://docs.docker.com/engine/reference/builder/#run---mounttypebind) (default) | Bind-mount 上下文目录（只读）。                            |
| [`cache`](https://docs.docker.com/engine/reference/builder/#run---mounttypecache) | 装载临时目录以缓存编译器和包管理器的目录。                 |
| [`secret`](https://docs.docker.com/engine/reference/builder/#run---mounttypesecret) | 允许构建容器访问私钥等安全文件，而无需将它们复制到映像中。 |
| [`ssh`](https://docs.docker.com/engine/reference/builder/#run---mounttypessh) | 允许构建容器通过SSH代理访问SSH密钥，并支持passphrases。    |

#### type=bind

此装载类型允许将文件或目录绑定到构建容器。默认情况下，绑定装载是只读的。

| Option           | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `target`         | 挂载的路径                                                   |
| `source`         | Source path in the `from`. Defaults to the root of the `from`. |
| `from`           | Build stage or image name for the root of the source. Defaults to the build context. |
| `rw`,`readwrite` | Allow writes on the mount. Written data will be discarded.   |

#### type=cache

此装载类型允许构建容器缓存编译器和包管理器的目录。

| Option                                                       | Description                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| `id`                                                         | Optional ID to identify separate/different caches. Defaults to value of `target`. |
| `target`[1](https://docs.docker.com/engine/reference/builder/#fn:1) | Mount path.                                                  |
| `ro`,`readonly`                                              | Read-only if set.                                            |
| `sharing`                                                    | One of `shared`, `private`, or `locked`. Defaults to `shared`. A `shared` cache mount can be used concurrently by multiple writers. `private` creates a new mount if there are multiple writers. `locked` pauses the second writer until the first one releases the mount. |
| `from`                                                       | Build stage to use as a base of the cache mount. Defaults to empty directory. |
| `source`                                                     | Subpath in the `from` to mount. Defaults to the root of the `from`. |
| `mode`                                                       | File mode for new cache directory in octal. Default `0755`.  |
| `uid`                                                        | User ID for new cache directory. Default `0`.                |
| `gid`                                                        | Group ID for new cache directory. Default `0`.               |

缓存目录的内容在构建器调用之间保持不变，而不会使指令缓存无效。缓存装载只能用于提高性能。您的构建应该处理缓存目录的任何内容，因为另一个构建可能会覆盖文件，或者如果需要更多的存储空间，GC可能会清理它。

示例： 缓存go的构建包

```dockerfile
# syntax=docker/dockerfile:1
FROM golang
RUN --mount=type=cache,target=/root/.cache/go-build \
  go build ...
```

示例： 缓存apt的构建包

```shell
# syntax=docker/dockerfile:1
FROM ubuntu
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
  --mount=type=cache,target=/var/lib/apt,sharing=locked \
  apt update && apt-get --no-install-recommends install -y gcc
```

Apt需要对其数据进行独占访问，因此缓存使用shareing=locked选项，这将确保使用相同缓存装载的多个并行构建将相互等待，而不会同时访问相同的缓存文件。在这种情况下，如果您希望每个构建都创建另一个缓存目录，也可以使用sharing=private。

#### type=tmpfs

此装载类型允许在构建容器中装载tmpfs。

| Option                                                       | Description                                           |
| ------------------------------------------------------------ | ----------------------------------------------------- |
| `target`[1](https://docs.docker.com/engine/reference/builder/#fn:1) | Mount path.                                           |
| `size`                                                       | Specify an upper limit on the size of the filesystem. |

#### type=secret

这种装载类型允许构建容器访问私钥等安全文件，而无需将它们复制到映像中。

| Option     | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `id`       | ID of the secret. Defaults to basename of the target path.   |
| `target`   | Mount path. Defaults to `/run/secrets/` + `id`.              |
| `required` | If set to `true`, the instruction errors out when the secret is unavailable. Defaults to `false`. |
| `mode`     | File mode for secret file in octal. Default `0400`.          |
| `uid`      | User ID for secret file. Default `0`.                        |
| `gid`      | Group ID for secret file. Default `0`.                       |

示例：访问s3

```shell
# syntax=docker/dockerfile:1
FROM python:3
RUN pip install awscli
RUN --mount=type=secret,id=aws,target=/root/.aws/credentials \
  aws s3 cp s3://... ...
```

#### type=ssh

这种装载类型允许构建容器通过SSH代理访问SSH密钥，并支持密码短语。

| Option     | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| `id`       | ID of SSH agent socket or key. Defaults to "default".        |
| `target`   | SSH agent socket path. Defaults to `/run/buildkit/ssh_agent.${N}`. |
| `required` | If set to `true`, the instruction errors out when the key is unavailable. Defaults to `false`. |
| `mode`     | File mode for socket in octal. Default `0600`.               |
| `uid`      | User ID for socket. Default `0`.                             |
| `gid`      | Group ID for socket. Default `0`.                            |

示例：访问gitlib

```shell
# syntax=docker/dockerfile:1
FROM alpine
RUN apk add --no-cache openssh-client
RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan gitlab.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh \
  ssh -q -T git@gitlab.com 2>&1 | tee /hello
# "Welcome to GitLab, @GITLAB_USERNAME_ASSOCIATED_WITH_SSHKEY" should be printed here
# with the type of build progress is defined as `plain`.
```

```console
$ eval $(ssh-agent)
$ ssh-add ~/.ssh/id_rsa
(Input your passphrase here)
$ docker buildx build --ssh default=$SSH_AUTH_SOCK .
```

也可以直接在主机上指定*.pem文件的路径，而不是$SSH_AUTH_SOCK。但是，不支持带有密码短语的pem文件。

### --network

允许控制命令在哪个网络环境中运行。

语法： `--network=<TYPE>`

| Type                                                         | Description                            |
| ------------------------------------------------------------ | -------------------------------------- |
| [`default`](https://docs.docker.com/engine/reference/builder/#run---networkdefault) (default) | Run in the default network.            |
| [`none`](https://docs.docker.com/engine/reference/builder/#run---networknone) | Run with no network access.            |
| [`host`](https://docs.docker.com/engine/reference/builder/#run---networkhost) | Run in the host's network environment. |

####  --network=default

相当于根本不提供标志，该命令在构建的默认网络中运行。

#### --network=none

该命令在没有网络访问的情况下运行（lo仍然可用，但与该进程隔离）

示例： 隔离外部影响

```shell
# syntax=docker/dockerfile:1
FROM python:3.6
ADD mypackage.tgz wheels/
RUN --network=none pip install --find-links wheels mypackage
```

pip将只能安装tarfile中提供的包，而tarfile可以由早期的构建阶段控制。

####  --network=host

该命令在主机的网络环境中运行（类似于docker build--network=host，但基于每条指令）

### --security

#### --security=insecure

在--security=unsecurity的情况下，构建器在不安全模式下运行没有沙箱的命令，这允许运行需要提升权限的流（例如containerd）。这相当于运行 `docker run --privileged` 。

#### --security=sandbox

默认的沙箱模式可以通过--security=sandbox激活，但这是不允许的。