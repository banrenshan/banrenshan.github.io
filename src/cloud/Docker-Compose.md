---
title: Docker Compose 
date: 2024-08-24
tags: 
 - docker
 - docker compose 
categories:
 - docker
---

Compose 简化了对整个应用程序堆栈的控制，使您可以在单个易于理解的 YAML 配置文件中轻松管理服务、网络和卷。然后，使用单个命令，您可以从配置文件创建并启动所有服务。

> Docker Compose 是一个用于定义和运行多容器应用程序的工具

Compose 适用于所有环境；生产、开发、测试以及 CI 工作流程。它还具有用于管理应用程序整个生命周期的命令：

- 启动、停止和重建服务
- 查看正在运行的服务的状态
- 流式传输正在运行的服务的日志输出
- 在服务上运行一次性命令

# 安装

获取 Docker Compose 最简单且推荐的方法是安装 Docker Desktop。 Docker Desktop 包括 Docker Compose 以及 Docker Engine 和 Docker CLI。

但是如果您已经安装了 Docker Engine 和 Docker CLI，你可以单独安装Compose 插件，下面的就是插件安装的方式。

## ubtuntu安装

```shell
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose


chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose
docker compose version
```

# 快速入门

## 1. 新建示例项目

创建测试目录：

```shell
mkdir composetest && cd composetest
```

在项目目录中创建一个名为`app.py`的文件:

```python
import time

import redis
from flask import Flask

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)

def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)

@app.route('/')
def hello():
    count = get_hit_count()
    return 'Hello World! I have been seen {} times.\n'.format(count)
```

在项目目录中创建一个名为`requirements.txt`的文件:

```
flask
redis
```

在项目目录中创建一个名为`Dockerfile`的文件:

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.10-alpine
WORKDIR /code
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
RUN apk add --no-cache gcc musl-dev linux-headers
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
EXPOSE 5000
COPY . .
CMD ["flask", "run", "--debug"]
```

## 2. 创建compose配置文件

在项目目录中创建一个名为`compose.yaml`的文件：

```yaml
services:
  web:
    build: . #当前目录构建为web项目
    ports:
      - "8000:5000"
  redis:
    image: "redis:alpine"
```

该 Compose 文件定义了两个服务：`web`和`redis` 。

## 3. 测试

运行项目：

```shell
docker compose up
```

停止应用程序:

可以通过`docker compose down` ，也可以通过 `CTRL+C`来停止。

## 4. Watch 文件变动

修改 `compose.yaml` 文件:

```yaml
services:
  web:
    build: .
    ports:
      - "8000:5000"
    develop:
      watch:
        - action: sync
          path: .
          target: /code
  redis:
    image: "redis:alpine"
```

每当文件发生更改时，Compose 都会将文件同步到容器内的`/code`位置。复制后，捆绑程序将更新正在运行的应用程序，而无需重新启动。

使用下面的命令重新启动：

```shell
docker compose watch # docker compose up --watch
```

