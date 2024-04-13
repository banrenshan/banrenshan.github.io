---
title: My First Post
subtitle:
date: 2024-04-13T13:56:04+08:00
slug: 583bc6c
draft: true
author:
  name:
  link:
  email:
  avatar:
description:
keywords:
license:
comment: false
weight: 0
tags:
  - draft
categories:
  - draft
hiddenFromHomePage: false
hiddenFromSearch: false
hiddenFromRss: false
hiddenFromRelated: false
summary:
resources:
  - name: featured-image
    src: featured-image.jpg
  - name: featured-image-preview
    src: featured-image-preview.jpg
toc: true
math: false
lightgallery: false
password:
message:
repost:
  enable: true
  url:

# See details front matter: https://fixit.lruihao.cn/documentation/content-management/introduction/#front-matter
---

当你在物理机或虚拟机上配置 `JVM` 参数时，你可以选择 `-Xmx/-Xms`来指定 `Java` 堆大小。但这种固定 JVM 大小的方式，转移到 `Kubernetes Pod` 中时，就会限定 `K8S` 本身的垂直扩容能力。**如果我把** `**Pod**` **的内存从** `**8G**` **增长到** `**16G**`**，JVM 如何感知到呢****？**

```java
resources:
  requests:
    cpu: 2
memory: 4Gi
  limits:
    cpu: 2
    memory: 4Gi
```

