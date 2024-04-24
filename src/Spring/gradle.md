---
title: Gradle指南
date: 2023-10-08
categories:
  - java
tags:
  - Gradle
---



## 依赖声明

`Configuration`: 一个命名的依赖项集合，为特定的目标（如编译或运行模块）组织在一起。主要的类别：

* compileOnly ：用于编译，但不在运行时使用

* implementation ：用于编译和运行时

* runtimeOnly ： 用于运行时

* testCompileOnly 

* testImplementation 

* testRuntimeOnly 

* api ：非标准，需要 java-library 插件支持

  > JAVA库主要作为依赖提供给其他项目，其本身也会依赖其他JAVA库。那么其依赖项可以暴漏出来给消费者使用吗？为此，JAVA库插件提供了 `api`  Configuration。我们来看下面示例：
  >
  > ```groovy
  > dependencies {
  >     api 'org.apache.httpcomponents:httpclient:4.5.7'
  >     implementation 'org.apache.commons:commons-lang3:3.5'
  > }
  > ```
  >
  > api配置中的依赖项将被传递地暴露给库的使用者，因此将出现在使用者的编译类路径上。implementation 则不会。 

* compileOnlyApi ：非标准，需要 java-library 插件支持



## JAVA相关的插件

* Java插件支持 Java编译 、测试和build功能。它是许多其他JVM语言Gradle插件的基础。

* Java库插件通过提供有关Java库的特定知识来扩展Java插件（Java）的功能。例如API公开功能。

* application 插件用于创建可执行的JVM应用程序。它使得在开发过程中很容易在本地启动应用程序，并将应用程序打包为TAR或ZIP，包括特定于操作系统的启动脚本。其集成了java插件和[Distribution ](https://docs.gradle.org/current/userguide/distribution_plugin.html#distribution_plugin)插件

> Java平台插件提供了为Java生态系统声明平台的功能。一个平台可以用于不同的目的：
> * 一起发布的模块的描述（例如，共享同一版本）
> * 异构库的一组推荐版本。一个典型的例子包括Spring Boot BOM
> * 在子项目之间共享一组依赖关系版本
> 
> 平台是一种特殊的软件组件，不包含任何源码：它只用于引用其他库，组织依赖关系。





