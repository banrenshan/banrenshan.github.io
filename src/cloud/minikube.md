---
title: minikube 指南
date: 2024-04-24
tags: 
 - minikube
 - Kubernates
categories:
 - Kubernates
---

# 安装

## 安装前检查

检查你的操作系统是否支持虚拟化技术：

```shell
systeminfo
```

如果您看到下面的输出，则表示该 Windows 支持虚拟化技术:

```
Hyper-V Requirements:     VM Monitor Mode Extensions: Yes
                          Virtualization Enabled In Firmware: Yes
                          Second Level Address Translation: Yes
                          Data Execution Prevention Available: Yes
```

如果您看到下面的输出，则表示您的操作系统已经安装了 Hypervisor：

```
Hyper-V Requirements:  A hypervisor has been detected. Features required for Hyper-V will not be displayed.
```

如果你还没有安装 Hypervisor，请选择以下方式之一进行安装：

• [Hyper-V](https://msdn.microsoft.com/en-us/virtualization/hyperv_on_windows/quick_start/walkthrough_install)

• [VirtualBox](https://www.virtualbox.org/wiki/Downloads)

> Hyper-V 可以运行在三个版本的 Windows 10 上：企业版、专业版和教育版（Enterprise, Professional, Education）。

## 安装 minikube

1. 下载 [安装包](https://github.com/kubernetes/minikube/releases/latest/download/minikube-installer.exe) 完成后，双击安装

2. 安装并启动本地 Kubernetes 集群：

   ```shell
   minikube start --image-mirror-country=cn --memory=8g
   ```

3. 检查集群的状态：

   ```shell
   minikube status
   
   host: Running
   kubelet: Running
   apiserver: Running
   kubeconfig: Configured
   ```

4. 关闭集群

   ```shell
   minikube stop
   ```


# 常用命令













# FQA

如果您之前安装过 Minikube，并运行了：

```shell
minikube start
```

并且 `minikube start` 返回了一个错误：

```
machine does not exist
```

那么，你需要清理 minikube 的本地状态：

```shell
minikube delete
```