---
title: Docker
date: 2024-08-24
tags: 
 - docker
categories:
 - docker
---



# Ubuntu 安装 Docker

## 卸载老版本

```shell
 sudo apt-get remove docker docker-engine docker.io containerd runc
```

## 更新apt包索引

```shell
 sudo apt-get update
```

## 安装必要工具包

```shell
 sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
```

## 添加Docker GPG秘钥

```shell
sudo curl -fsSL https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
```

## 配置仓库源

```shell
sudo add-apt-repository \
      "deb [arch=amd64] https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu \
      $(lsb_release -cs) \
      stable"
```

## 安装Docker Engine

```shell
# 更新apt包索引
sudo apt-get update

# 安装docker
sudo apt-get install docker-ce docker-ce-cli containerd.io

```

## 启动docker

```shell
sudo systemctl enable docker
sudo systemctl start docker
```

# 设置国内镜像源

```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
 	"https://dockerpull.com",
	"https://docker.1panel.live",
	"https://dockerproxy.cn",
	"https://docker.hpcloud.cloud"
  ]
}
EOF
```

重启：

```shell
sudo systemctl daemon-reload
sudo systemctl restart docker
```

查看是否换源成功:

```shell
docker info
```

