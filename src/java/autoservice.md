---
title: Auto Service
tags:
  - java
  - SPI
categories:
  - java
date: 2024-08-22
---

在Java项目中，当需要实现SPI机制时，通常需要手动在`META-INF/services`目录下创建文件，并添加服务实现类的全限定类名。而AutoService通过注解的方式，在编译时自动创建或更新这些文件，无需手动操作。

### AutoService的使用

1. 添加依赖：在Gradle项目中，需要添加AutoService的依赖：

   ```kotlin
   annotationProcessor 'com.google.auto.service:auto-service-annotations:1.0-rc7'
   implementation 'com.google.auto.service:auto-service:1.0-rc7'
   ```

2. 使用`@AutoService`注解：在服务实现类上添加`@AutoService`注解，并指定服务接口。例如，如果有一个服务接口`MyService`，其实现类为`MyServiceImpl`，则可以在`MyServiceImpl`类上添加`@AutoService(MyService.class)`注解。

3. 编译项目：编译项目时，AutoService的注解处理器会自动扫描被`@AutoService`注解修饰的类，并生成或更新`META-INF/services`目录下的文件。