---
title: Spring 类型转换
date: 2024-04-27
categories:
  - Spring
tags:
  - Spring
  - 类型转换
---

将验证视为业务逻辑有利也有弊，`Spring`提供了一种验证和数据绑定的设计，不排除其中任何一种。具体来说，验证不应与`web`层绑定，并且应该易于本地化，并且可以插入任何可用的验证器。考虑到这些问题，`Spring`提供了一个`Validator`契约，该契约在应用程序的每一层受到支持。

数据绑定有助于将用户输入动态绑定到应用程序的域模型（或用于处理用户输入的任何对象）。Spring提供了`DataBinder`来做到这一点。`Validator`和`DataBinder`组成`validation`包，主要用于但不限于web层。

`BeanWrapper`是`Spring`框架中的一个基本概念，在很多地方都有使用。但是，您可能不需要直接使用`BeanWrapper`。

`Spring`的`DataBinder`和较低级别的`BeanWrapper`都使用`PropertyEditorSupport`实现来解析和格式化属性值。`PropertyEditor`和`PropertyEditorSupport`类型是`JavaBeans`规范的一部分，也将在本章中进行解释。Spring的`core.covert`包提供了一个通用的类型转换工具，以及用于格式化UI字段值的更高级别的`format`包。您可以使用这些包作为`PropertyEditorSupport`实现的替代方案。

`Spring`通过配置基础设施和Spring自己的`Validator`合约的适配器来支持`JavaBean`验证。应用程序可以全局启用Bean验证，如Java Bean Validation中所述，并专门用于所有验证需求。在web层中，应用程序可以进一步为每个`DataBinder`注册控制器本地Spring `Validator`实例，如配置`DataBinder`中所述，这对于插入自定义验证逻辑非常有用。

## 使用Spring的Validator接口

Spring提供了一个Validator接口，您可以使用它来验证对象。 Validator接口使用Errors对象工作，以便在验证时验证器可以将验证失败报告给Errors对象。





