---
title: Byte Buddy 
tags:
  - java
  - 代理
categories:
  - java
date: 2022-12-02 13:01:55
---

Byte Buddy 是一个代码生成和操作库，用于在Java应用程序运行时创建和修改Java类，而无需编译器的帮助。除了Java类库附带的代码生成实用程序外，Byte Buddy还允许创建任意类，并且不限于实现用于创建运行时代理的接口。此外，Byte Buddy提供了一种方便的API，可以使用Java代理或在构建过程中手动更改类。Byte Buddy 相比其他字节码操作库有如下优势：

- 无需理解字节码格式，即可操作，简单易行的 API 能很容易操作字节码。
- 支持 Java 任何版本，库轻量，仅依赖Java字节代码解析器库ASM的访问者API。
- 比起JDK动态代理、cglib、Javassist，Byte Buddy在性能上具有优势。

# Hello World

```java
Class<?> dynamicType = new ByteBuddy()
  .subclass(Object.class) //扩展 Object 类 
  .method(ElementMatchers.named("toString")) // 要重写的方法由所谓的 ElementMatcher 标识
  .intercept(FixedValue.value("Hello World!")) // 重写其 toString 方法
  .make()
  .load(getClass().getClassLoader()) //指定类加载器
  .getLoaded();
 
assertThat(dynamicType.newInstance().toString(), is("Hello World!"));
```

使用默认 `ByteBuddy` 配置, 生成最新版本的class文件。