---
title: SPI机制 
tags:
  - java
categories:
  - java
date: 2024-08-22
---

`Java SPI`（Service Provider Interface）是Java官方提供的一种`服务发现机制`，它允许在`运行时动态地加载实现`了特定接口的类，而不需要在代码中显式地指定该类，从而实现`解耦和灵活性`。

## 实现原理

> Java SPI 的实现原理基于 Java 类加载机制和反射机制。

当使用 `ServiceLoader.load(Class<T> service)` 方法加载服务时，会检查 `META-INF/services` 目录下是否存在以接口全限定名命名的文件。如果存在，则读取文件内容，获取实现该接口的类的全限定名，并通过 `Class.forName()` 方法加载对应的类。在加载类之后，`ServiceLoader `会通过反射机制创建对应类的实例，并将其缓存起来。

当我们调用 `ServiceLoader.load(Class<T> service)` 方法时，并不会立即将所有实现了该接口的类都加载进来，而是返回一个懒加载迭代器。**只有在使用迭代器遍历时，才会按需加载对应的类并创建其实例。**

`java.util.ServiceLoader`类的源码如下：

```java
public final class ServiceLoader<S> implements Iterable<S>{
  
  public static <S> ServiceLoader<S> load(Class<S> service,ClassLoader loader){
    return new ServiceLoader<>(Reflection.getCallerClass(), service, loader);
  }
  
  public static <S> ServiceLoader<S> load(Class<S> service) {
    ClassLoader cl = Thread.currentThread().getContextClassLoader();
    return new ServiceLoader<>(Reflection.getCallerClass(), service, cl);
  }
}
```

`cl` 就是**线程上下文类加载器**（Thread Context ClassLoader）。这是每个线程持有的类加载器，JDK 的设计允许应用程序或容器设置这个类加载器，以便应用程序类库能够通过它来加载。线程上下文类加载器默认情况下是应用程序类加载器（Application ClassLoader），它负责加载 classpath 上的类。

## 应用场景

* 数据库驱动程序加载: `JDBC`为了实现`可插拔`的数据库驱动，在Java.sql.Driver接口中定义了一组标准的API规范，而具体的数据库厂商则需要实现这个接口，以提供自己的数据库驱动程序。在Java中，JDBC驱动程序的加载就是通过SPI机制实现的。
* 日志框架的实现: 流行的`开源日志框架`，如`Log4j、SLF4J和Logback`等，都采用了SPI机制。用户可以根据自己的需求选择合适的日志实现，而不需要修改代码。
* Spring框架: `Spring框架`中的Bean加载机制就使用了SPI思想，通过读取classpath下的`META-INF/spring.factories`文件来`加载各种自定义的Bean`。

## 使用步骤

1. 定义接口：首先需要定义一个接口，所有实现该接口的类都将被注册为`服务提供者`。

2. 创建实现类：创建一个或多个实现上述接口的类，这些类将作为服务提供者。

3. 配置文件：在 `META-INF/services` 目录下创建一个以`接口全限定名`命名的文件，文件内容为`实现该接口的类的全限定名`，每个类名占一行。

4. 加载使用服务：使用 `java.util.ServiceLoader` 类的静态方法` load(Class service)` 加载服务，默认情况下会加载 `classpath `中所有符合条件的提供者。调用 `ServiceLoader `实例的 `iterator()` 方法获取迭代器，遍历迭代器即可获取所有实现了该接口的类的实例。

使用 Java SPI 时，需要注意以下几点：

* 接口必须是公共的，且只能包含抽象方法。

* 实现类必须有一个无参构造函数。

* 配置文件中指定的类必须是实现了相应接口的非抽象类。