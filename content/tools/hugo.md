---
title: hugo使用
date: 2024-04-13T13:56:04+08:00
tags:
  - hugo
categories:
  - tool
toc: true
---



a

# 安装

```shell
scoop.cmd install hugo-extended
```

## 主题安装

参考：[快速上手 | FixIt (lruihao.cn)](https://fixit.lruihao.cn/zh-cn/documentation/getting-started/quick-start/)

1. 安装：

   ```shell
   hugo new site my-blog
   cd my-blog
   git init
   git submodule add https://github.com/hugo-fixit/FixIt.git themes/FixIt
   echo "theme = 'FixIt'" >> hugo.toml
   echo "defaultContentLanguage = 'zh-cn'" >> hugo.toml
   hugo server
   ```

2. 配置：

   ```shell
   echo "theme = 'FixIt'" >> hugo.toml
   ```

# 命令行使用

## 常用命令

创建文章：

```shell
# hugo new content [path] [flags]
hugo new  tools/hugo.md
Content "D:\\gtihub\\xx\\content\\tools\\hugo.md" created
```

启动server:

```shell
hugo server -D --disableFastRender
```

* `-D` 包含草稿内容
* `--disableFastRender` 实时预览你正在编辑的文章页面

## PowerShell 自动提示

1. 查看powershell个人配置文件的位置：

   ```shell
   PS C:\Users\13675> $PROFILE
   C:\Users\13675\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
   ```

2. 在文件中添加如下内容：

   ```shell
   hugo completion powershell | Out-String | Invoke-Expression
   ```
