---
title: Helm 指南
date: 2024-04-24
tags: 
 - Helm 
 - Kubernates
categories:
 - Kubernates
---



# 三大概念

* Chart 代表着 Helm 包。它由 Kubernetes 资源（service,configmap等）组合而成。

* Repository（仓库） 是用来存放和共享 charts 的地方。

* Release 是运行在 Kubernetes 集群中的 chart 的实例。

# 快速入门

当您已经安装好了Helm之后，需要添加一个chart 仓库。

```shell
$ helm repo add bitnami https://charts.bitnami.com/bitnami
```

>  [Artifact Hub](https://artifacthub.io/packages/search?kind=0)中查找有效的Helm chart仓库。

您将可以在仓库中搜索软件：

```shell
$ helm search repo bitnami
NAME                             	CHART VERSION	APP VERSION  	DESCRIPTION
bitnami/bitnami-common           	0.0.9        	0.0.9        	DEPRECATED Chart with custom templates 
bitnami/airflow                  	8.0.2        	2.0.0        	Apache Airflow is a platform to 
bitnami/apache                   	8.2.3        	2.4.46       	Chart for Apache HTTP Server
bitnami/aspnet-core              	1.2.3        	3.1.9        	ASP.NET Core is an open-source 
# ... and many more
```

安装指定的软件：

```shell
$ helm repo update              # 确定我们可以拿到最新的charts列表
$ helm install bitnami/mysql --generate-name
NAME: mysql-1612624192
LAST DEPLOYED: Sat Feb  6 16:09:56 2021
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

> 每当您执行 `helm install` 的时候，都会创建一个新的发布版本。 所以一个chart在同一个集群里面可以被安装多次，每一个都可以被独立的管理和升级。

查看软件信息：

```shell
PS C:\Users\13675\Desktop> helm show chart bitnami/mysql
annotations:
  category: Database
  images: |
    - name: mysql
      image: docker.io/bitnami/mysql:8.0.35-debian-11-r0
    - name: mysqld-exporter
      image: docker.io/bitnami/mysqld-exporter:0.15.0-debian-11-r71
    - name: os-shell
      image: docker.io/bitnami/os-shell:11-debian-11-r91
```

查看安装了那些软件：

```shell
$ helm list
NAME            	NAMESPACE	REVISION	UPDATED                             	STATUS  	CHART      	APP VERSION
mysql-1612624192	default  	1       	2021-02-06 16:09:56.283059 +0100 CET	deployed	mysql-8.3.0	8.0.23
```

卸载软件：

```shell
$ helm uninstall mysql-1612624192
release "mysql-1612624192" uninstalled
```

> 该命令会从Kubernetes卸载 `mysql-1612624192`， 它将删除和该版本相关的所有相关资源（service、deployment、 pod等等）甚至版本历史。提供 `--keep-history` 选项， Helm将会保存版本历史

查看软件的安装状态：

```shell
$ helm status mysql-1612624192
Status: UNINSTALLED
...
```

