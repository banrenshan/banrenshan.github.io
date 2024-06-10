---
title: git
date: 2023-10-08
categories:
  - git
tags:
  - git
  - 开发工具 
---

## .gitattributes 

当执行 git 动作时，`.gitattributes` 文件允许你指定 git 管理的文件或路径的属性。换句话说，每当有文件保存或者创建时，git 会根据指定的属性来自动地保存。

`.gitattributes `文件格式如下：

```
要匹配的文件模式 属性1 属性2 ...
在.gitattributes文件的一行中，一个属性（以text属性为例）可能有4种状态：
```

* 设置text
* 不设置-text
* 设置值text=string
* 未声明，通常不出现该属性即可；但是为了覆盖其他文件中的声明，也可以`!text`

### eol属性

 *eol*(end of line)，用于配置文件的结尾:

- eol=lf ，[回车] ：入库时将行尾规范为LF，检出时行尾不强制转换为 CRLF
- eol=crlf，[换行、回车] ：入库时将行尾规范为LF，检出时将行尾转换为CRLF

> 开发者使用的操作系统不同，默认的文件结尾行就会不同。在 Windows 上默认的是回车换行（Carriage Return Line Feed, CRLF），然而，在 Linux/MacOS 上则是换行（Line Feed, LF）。

### 示例

Demo1:

```
*           text=auto  
```

> 文件的行尾自动转换。如果是文本文件，则在文件入Git库时，行尾自动转换为LF。如果已经在入Git库中的文件的行尾是GRLF，则文件在入Git库时，不再转换为LF。 

Demo2:

```
*.txt       text  
```

> 对于`.txt`文件，标记为文本文件，并进行行尾规范化。

Demo3:

```
*.jpg       -text  
```

> 对于`.jpg`文件，标记为非文本文件

Demo4:

```
*.vcproj    text eol=crlf
```

> 对于`.vcproj`文件，标记为文本文件，在文件入Git库时进行规范化，行尾转换为LF。在检测到出工作目录时，行尾自动转换为GRLF。 

Demo5:

```
*.sh        text eol=lf  
```

> 对于sh文件，标记为文本文件，在文件入Git库时进行规范化，即行尾为LF。在检出到工作目录时，行尾也不会转换为CRLF（即保持LF）。 

Demo6:

```
*.py        eol=lf
```

> 对于py文件，只针对工作目录中的文件，行尾为LF

### 使用

确保仓库根目录下已经存在`.gitattributes`文件，下面的命令就会根据文件` .gitattributes` 中的定义，更新文件的结尾行:

```shell
git rm --cached -r
git reset --hard
```

#### 为所有Git库设置统一的.gitattributes文件：

```bash
git config --get core.attributesFile
git config --global --get core.attributesFile
```





