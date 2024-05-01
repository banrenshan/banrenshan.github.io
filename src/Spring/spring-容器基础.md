---
title: Spring 容器基础
date: 2024-04-28
categories:
  - Spring
tags:
  - Spring
  - 容器
---

## IoC容器和beans

本章介绍Spring Framework实现控制反转（IoC）的原理。 IoC也被称为依赖注入（DI）。通过构造函数、工厂方法创建对象，对象被创建后设置属性等方法构建依赖的过程。容器在创建bean时会注入这些依赖关系。这个过程从根本上来说是相反的，因此名为控制反转（IoC），bean本身通过使用类的直接构造或诸如Service Locator模式之类的机制来控制其依赖关系的实例化。

`org.springframework.beans`和`org.springframework.context`包是Spring Framework的IoC容器的基础。`BeanFactory`接口提供了一种能够管理任何类型对象的高级配置机制。 `ApplicationContext`是`BeanFactory`的一个子接口，它增加了与Spring的AOP功能的集成、消息资源处理（用于国际化）、事件发布以及Web应用程序上下文功能。

简而言之，`BeanFactory`提供了配置框架和基本功能，而`ApplicationContext`添加了更多的企业特定功能。 `ApplicationContext`是`BeanFactory`的一个完整的超集。

在Spring中，构成应用程序主干和由Spring IoC容器管理的对象称为bean。bean是一个由Spring IoC实例化，组装并被容器管理的对象。 Bean和它们之间的依赖关系反映在容器使用的配置元数据中。

## 容器概览

接口`org.springframework.context.ApplicationContext`表示Spring IoC容器，并负责实例化，配置和组装上述`Bean`。容器通过读取配置元数据获取有关要实例化，配置和组装的对象的指示信息。 配置元数据用可以用`XML`，`Java注释`或`Java代码`表示，它表示组成应用程序的对象以及这些对象之间的相互依赖关系。

Spring提供了几个`ApplicationContext`接口的实现。 在独立应用程序中，通常创建`ClassPathXmlApplicationContext`或`FileSystemXmlApplicationContext`的实例。虽然XML是用于定义配置元数据的传统格式，但您可以通过提供少量的XML配置来指示容器使用Java注释或代码作为元数据格式，以声明的方式支持其他元数据格式。

在大多数应用场景中，用户不需要显式的实例化`Spring IoC`容器的一个或多个实例。例如，在Web应用程序场景中，应用程序的`web.xml`文件中的简单八行就可以构建整个上下文。

### 配置元数据

配置元数据告诉`Spring`容器实例化，配置和组装对象。传统上，配置元数据是以简单直观的`XML`格式提供的，这是本章的大部分内容用来传达Spring IoC容器的关键概念和功能。此外还有其他的配置方式：

- 基于注解配置：Spring 2.5引入了对基于注释配置元数据的支持。
- 基于java代码配置：从Spring 3.0开始，`Spring Java Config`项目提供的许多功能成为核心Spring Framework的一部分。 因此，您可以使用Java而不是XML文件来定义应用程序类外部的Bean。 要使用这些新功能，请参阅@Configuration，@Bean，@Import和@DependsOn注释。

基于XML的配置元数据将这些bean配置为顶级`<beans/>`元素内的`<bean/>`元素。Java配置通常在`@Configuration`类中使用`@Bean`注释的方法。

这些`bean`定义对应于组成应用程序的实际对象。通常，您可以定义服务层对象，数据访问对象（DAO），Struts Action实例等表示对象，Hibernate SessionFactories等基础结构对象，JMS队列等。通常，不会在容器中配置细粒度的域对象，因为创建和加载域对象通常是DAO和业务逻辑的责任。但是，您可以使用`Spring`与`AspectJ`的集成来配置在IoC容器控制之外创建的对象。参考 `Using AspectJ to dependency-inject domain objects with Spring`

以下示例显示了基于XML的配置元数据的基本结构：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="..." class="...">
        <!-- collaborators and configuration for this bean go here -->
    </bean>

    <bean id="..." class="...">
        <!-- collaborators and configuration for this bean go here -->
    </bean>

    <!-- more bean definitions go here -->

</beans>
```

`id`属性是一个字符串，用于标识单个`bean`定义。 `class`属性定义了`bean`的类型并使用完全限定的类名。

### 初始化容器

实例化`Spring IoC`容器很简单。 提供给`ApplicationContext`构造函数的位置路径（实际上是资源字符串），它允许容器从各种外部资源（例如本地文件系统，Java CLASSPATH等等）加载配置元数据。

```java
ApplicationContext context = new ClassPathXmlApplicationContext("services.xml", "daos.xml");
```

以下示例显示服务层对象（services.xml）配置文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <!-- services -->

    <bean id="petStore" class="org.springframework.samples.jpetstore.services.PetStoreServiceImpl">
        <property name="accountDao" ref="accountDao"/>
        <property name="itemDao" ref="itemDao"/>
        <!-- additional collaborators and configuration for this bean go here -->
    </bean>

    <!-- more bean definitions for services go here -->

</beans>
```

以下示例显示数据访问对象daos.xml文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="accountDao"
        class="org.springframework.samples.jpetstore.dao.jpa.JpaAccountDao">
        <!-- additional collaborators and configuration for this bean go here -->
    </bean>

    <bean id="itemDao" class="org.springframework.samples.jpetstore.dao.jpa.JpaItemDao">
        <!-- additional collaborators and configuration for this bean go here -->
    </bean>

    <!-- more bean definitions for data access objects go here -->

</beans>
```

在前面的示例中，服务层由`PetStoreServiceImpl`类和两个类型为`JpaAccountDao`和`JpaItemDao`的数据访问对象（基于JPA对象/关系映射标准）组成。 属性名称元素引用了`JavaBean`属性的名称，`ref`元素引用另一个`bean`定义的名称。 `id`和`ref`元素之间的这种联系表示协作对象之间的依赖关系。

#### 编写基于XML的配置元数据

让`bean`定义跨越多个`XML`文件可能很有用。 通常，每个单独的`XML`配置文件都代表了架构中的逻辑层或模块。您可以使用应用程序上下文构造函数从所有这些`XML`片段中加载`bean`定义。这个构造函数有多个资源位置，如前一节所示。 或者，使用一个或多个`<import />`元素从另一个或多个文件加载`bean`定义。 例如：

```xml
<beans>
    <import resource="services.xml"/>
    <import resource="resources/messageSource.xml"/>
    <import resource="/resources/themeSource.xml"/>

    <bean id="bean1" class="..."/>
    <bean id="bean2" class="..."/>
</beans>
```

在前面的示例中，从三个文件加载外部`bean`定义：`services.xml`，`messageSource.xml`和`themeSource.xml`。 所有位置路径都与导入的定义文件相关，因此`services.xml`必须位于与导入文件相同的目录或类路径位置，而`messageSource.xml`和`themeSource.xml`必须位于`resource`位置下面。正如你所看到的，一个前导斜线被忽略，但是*鉴于这些路径是相对的*，最好不要使用斜线。 根据Spring架构，正在导入的文件（包括顶层`<beans/>`元素）的内容必须是有效的`XML `bean定义。

> 可能但不推荐使用相对的`../`路径引用父目录中的文件。这样做会创建对当前应用程序外部的文件的依赖关系。特别是，不建议将此引用用于`classpath：`（例如`classpath：../ services.xml`），其中运行时解析过程选择“最近”的类路径根，然后查看其父目录。类路径配置更改可能会导致选择不同的、不正确的目录。

`import`指令是由`bean`名称空间本身提供的一项功能。除了普通`bean`定义以外的其他配置特性可用于由Spring提供的一系列`XML`名称空间，例如， `context`和`util`命名空间。

### 使用容器

`ApplicationContext`是高级工厂的接口，能够维护不同`Bean`及其依赖项的注册表。 使用方法`T getBean(String name，Class <T> requiredType)`，可以检索bean的实例。

`ApplicationContext`使您可以读取`bean`实例并按如下方式访问它们：

```java
// create and configure beans
ApplicationContext context = new ClassPathXmlApplicationContext("services.xml", "daos.xml");

// retrieve configured instance
PetStoreService service = context.getBean("petStore", PetStoreService.class);

// use configured instance
List<String> userList = service.getUsernameList();
```

`ApplicationContext`接口还有其他一些检索`bean`的方法，但理想情况下，应用程序代码不应该使用它们。 事实上，你的应用程序代码根本不应该调用`getBean`方法。 例如，`Spring`与`Web`框架的集成为各种`Web`框架组件（如控制器和JSF管理的Bean）提供了依赖注入，允许您通过元数据（例如自动装配注释）声明对特定`Bean`的依赖关系。

## Bean概述

`Spring IoC`容器管理一个或多个`bean`。 这些`bean`是使用您提供给容器的配置元数据创建的，例如，以`XML <bean/>`定义的形式。

在容器本身中，这些`bean`定义表示为`BeanDefinition`对象，其中包含以下元数据：

- 包限定的类名称：通常是所定义的`bean`的实际实现类。
- `Bean`行为配置元素，它说明`bean`在容器中的行为（范围，生命周期,回调等等）。
- 引用其他`bean`为其工作的`bean`; 这些引用也称为协作者或依赖关系。
- 在新创建的对象中设置的其他配置属性，例如，用于管理连接池的`Bean`的连接数量或池的大小限制。

| 属性                     | 描述             |
| ------------------------ | ---------------- |
| class                    | 实例化bean       |
| name                     | 命名bean         |
| scope                    | Bean范围         |
| constructor arguments    | 依赖注入         |
| properties               | 依赖注入         |
| autowiring mode          | 自动装配依赖关系 |
| lazy-initialization mode | 懒惰初始化bean   |
| initialization method    | 初始化回调       |
| destruction method       | 销毁回调         |

除了包含有关如何创建特定`bean`的信息之外，`ApplicationContext`实现还允许用户注册在容器外部创建的现有对象。这是通过`getBeanFactory`方法访问`ApplicationContext`的`BeanFactory`来完成的，该方法返回`BeanFactory`实现的`DefaultListableBeanFactory`。 `DefaultListableBeanFactory`通过方法`registerSingleton`和`registerBeanDefinition`来支持这种注册。 但是，典型的应用程序应该只通过元数据来定义`bean`。

> Bean元数据和手动提供的单例实例需要尽早注册，以便容器在自动装配和其他自省步骤中正确推理它们。虽然重写现有的元数据和现有的单例实例在某种程度上受到支持，但在运行时注册新的Bean并未得到正式支持，并且可能导致并发访问异常或bean容器中的状态不一致。

### 命名bean

每个`bean`都有一个或多个标识符。 这些标识符在托管`bean`的容器内必须是唯一的。一个`bean`通常只有一个标识符，但是如果它需要多个标识符，额外的标识符可以被认为是`别名`。

在基于XML的配置元数据中，您使用`id`和`name`属性来指定`bean`标识符。`id`属性允许你指定一个`id`。通常，这些名称是`字母数字`，但也可能包含特殊字符。如果要将别名引入到`bean`中，还可以在`name`属性中指定它们，并用逗号、分号或空格分隔。

您不需要为`bean`提供名称或标识。 如果没有显式提供名称或标识，容器为该`bean`生成一个唯一名称。但是，如果您想通过名称引用该`bean`，即通过使用`ref`元素或`Service Locator`样式查找，您必须提供一个名称。 

在命名`bean`时使用标准`Java`约定作为实例名称。也就是说，`bean`名称以小写字母开头，并且以驼峰命名基础。 这样的名字的例子是`accountManager`，`accountService`，`userDao`，`loginController`等等。

#### 定义别名

在bean定义本身中，可以通过使用由`id`属性指定的最多一个名称和`name`属性中的任意数量的其他名称的组合来为`bean`提供多个名称。 这些名称可以等同于同一个`bean`的别名，并且对于某些情况很有用，例如允许应用程序中的每个组件通过使用特定于该组件本身的`bean`名称来引用公共依赖项。

然而，指定`bean`实际定义的所有别名并不总是足够的。 有时候需要为其他地方定义的bean引入一个别名。 在大型系统中，通常是这种情况，其中配置分布在每个子系统中，每个子系统都有自己的一组对象定义。 在基于XML的配置元数据中，您可以使用`<alias />`元素来完成此操作。

```xml
<alias name="fromName" alias="toName"/>
```

例如，子系统A的配置元数据可以通过名称`subsystemA-dataSource`引用数据源。子系统B的配置元数据可以通过名称`subsystemB-dataSource`引用数据源。在编写使用这两个子系统的主应用程序时，主应用程序通过名称`myApp-dataSource`引用数据源。要让所有三个名称都引用您添加到MyApp配置元数据中的同一对象，请使用以下别名定义：

```xml
<alias name="subsystemA-dataSource" alias="subsystemB-dataSource"/>
<alias name="subsystemA-dataSource" alias="myApp-dataSource" />
```

现在，每个组件和主应用程序都可以通过一个唯一的名称来引用`dataSource`，并保证不会与任何其他定义冲突（有效地创建名称空间），但它们引用同一个`bean`。

> 如果您正在使用Java配置，则可以使用@Bean注释来提供别名，请参阅使用@Bean注释以获取详细信息

### 实例化bean

`bean`定义本质上是创建一个或多个对象的配方。容器在被询问时查看命名`bean`的配方，并使用由该`bean`定义封装的配置元数据来创建（或获取）实际对象。

如果您使用基于XML的配置元数据，则可以指定要在`<bean/>`元素的`class`属性中实例化的对象的类型（或类）。这个类属性在内部是一个`BeanDefinition`实例的`Class`属性，通常是强制性的。您可以通过以下两种方式之一使用`Class`属性： 

* 通常，在容器通过反射性调用其构造函数直接创建`bean`的情况下，指定要构建的`bean`类，这与使用`new`运算符的Java代码有些相同。 
* 指定静态工厂方法的实际类，那调用静态工厂方法以创建Bean。 从调用静态工厂方法返回的对象类型可以是完全相同的类或另一个类。

> 如果要为静态嵌套类配置一个`bean`定义，则必须使用嵌套类的二进制名称。例如，如果在`com.example`包中有一个名为`Foo`的类，并且此`Foo`类具有一个名为`Bar`的静态嵌套类，那么`bean`定义上`class`属性的值将是`com.example.Foo$Bar`,注意在名称中使用`$`字符将嵌套类名与外部类名分开

#### 用构造函数实例化

当您通过构造函数方法创建一个`bean`时，所有普通类都可以被Spring使用并兼容。也就是说，正在开发的类不需要实现任何特定的接口或以特定的方式编码。只需指定`bean`类就足够了。但是，根据您用于特定`bean`的IoC`类型`，您可能需要一个空参数的构造函数。

`Spring IoC`容器几乎可以管理任何您想要管理的类。 大多数`Spring`用户更喜欢实际的`JavaBeans`，它只有一个默认的无参数构造函数，以及`setter`和`getter`。 您也可以在容器中使用更具异国情调的非Bean风格的类。例如，如果您需要使用绝对不符合`JavaBean`规范的传统连接池，`Spring`也可以管理它。 使用基于`XML`的配置元数据，您可以按如下方式指定您的`bean`类：

```xml
<bean id="exampleBean" class="examples.ExampleBean"/>

<bean name="anotherExample" class="examples.ExampleBeanTwo"/>
```

有关在构造对象后向参数提供参数（如果需要）和设置对象实例属性的机制的详细信息，请参阅注入依赖项。

#### 使用静态工厂方法实例化

在定义一个使用静态工厂方法创建的`bean`时，可以使用`class`属性来指定包含静态工厂方法的类和名为`factory-method`的属性，以指定工厂方法本身的名称。你应该能够调用此方法（使用后面介绍的可选参数）并返回一个活动对象，随后将其视为通过构造函数创建的对象。 这种`bean`定义的一个用途是在传统代码中调用静态工厂。

以下`bean`定义指定将通过调用工厂方法来创建该`bean`。该定义没有指定返回对象的类型（类），而只指定了包含工厂方法的类。在这个例子中，`createInstance`方法必须是一个静态方法。

```xml
<bean id="clientService"
    class="examples.ClientService"
    factory-method="createInstance"/>
```

```java
public class ClientService {
    private static ClientService clientService = new ClientService();
    private ClientService() {}

    public static ClientService createInstance() {
        return clientService;
    }
}
```

有关在从工厂返回对象之后向工厂方法提供（可选）参数和设置对象实例属性的机制的详细信息，请参阅依赖关系和详细配置。

#### 使用实例工厂方法实例化

与通过静态工厂方法实例化类似，使用实例工厂方法从容器调用现有`bean`的非静态方法来创建新的`bean`。要使用此机制，请将类属性保留为空，并在`factory-bean`属性中指定当前（或父/祖代）容器中包含要调用以创建对象的实例方法的`bean`的名称。使用`factory-method`属性设置工厂方法本身的名称。

```xml
<!-- the factory bean, which contains a method called createInstance() -->
<bean id="serviceLocator" class="examples.DefaultServiceLocator">
    <!-- inject any dependencies required by this locator bean -->
</bean>

<!-- the bean to be created via the factory bean -->
<bean id="clientService"
    factory-bean="serviceLocator"
    factory-method="createClientServiceInstance"/>
```

```java
public class DefaultServiceLocator {

    private static ClientService clientService = new ClientServiceImpl();

    public ClientService createClientServiceInstance() {
        return clientService;
    }
}
```

一个工厂类也可以拥有多个工厂方法，如下所示：

```xml
<bean id="serviceLocator" class="examples.DefaultServiceLocator">
    <!-- inject any dependencies required by this locator bean -->
</bean>

<bean id="clientService"
    factory-bean="serviceLocator"
    factory-method="createClientServiceInstance"/>

<bean id="accountService"
    factory-bean="serviceLocator"
    factory-method="createAccountServiceInstance"/>
```

```java
public class DefaultServiceLocator {

    private static ClientService clientService = new ClientServiceImpl();

    private static AccountService accountService = new AccountServiceImpl();

    public ClientService createClientServiceInstance() {
        return clientService;
    }

    public AccountService createAccountServiceInstance() {
        return accountService;
    }
}
```

这种方法表明，工厂bean本身可以通过依赖注入（DI）进行管理和配置。 详细信息请参阅依赖关系和配置。

## 依赖

### 依赖注入

#### 基于构造函数的依赖注入

基于构造器的`DI`通过容器调用具有多个参数的构造函数完成，每个参数表示一个依赖项。 调用具有特定参数的静态工厂方法来构造`bean`和它几乎是等价的。以下示例显示了只能通过构造函数注入进行依赖注入的类。请注意，这个类没有什么特别之处，它是一个`POJO`，它不依赖于容器特定的接口，基类或注释:

```java
public class SimpleMovieLister {

    // the SimpleMovieLister has a dependency on a MovieFinder
    private MovieFinder movieFinder;

    // a constructor so that the Spring container can inject a MovieFinder
    public SimpleMovieLister(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // business logic that actually uses the injected MovieFinder is omitted...
}
```

构造函数的参数是通过类型匹配的。如果构造函数中不存在发生歧义的参数列表，构造参数是按顺序注入的，但是，下面的例子：

```java
package x.y;

public class Foo {

    public Foo(Bar bar, Baz baz) {
        // ...
    }
}
```

假设Bar和Baz类没有继承关系，就不存在潜在的歧义。因此，以下配置可以正常工作，并且不需要在`<constructor-arg />`元素中显式指定构造函数参数索引和类型。

```xml
<beans>
    <bean id="foo" class="x.y.Foo">
        <constructor-arg ref="bar"/>
        <constructor-arg ref="baz"/>
    </bean>

    <bean id="bar" class="x.y.Bar"/>

    <bean id="baz" class="x.y.Baz"/>
</beans>
```

当引用另一个`bean`时，类型是已知的，并且可以发生匹配（就像前面的例子那样）。当使用简单类型时，例如`<value>true</value>`，Spring无法确定值的类型，因此无法在没有帮助的情况下按类型进行匹配。 考虑以下类：

```java
package examples;

public class ExampleBean {

    // Number of years to calculate the Ultimate Answer
    private int years;

    // The Answer to Life, the Universe, and Everything
    private String ultimateAnswer;

    public ExampleBean(int years, String ultimateAnswer) {
        this.years = years;
        this.ultimateAnswer = ultimateAnswer;
    }
}
```

在前面的场景中，如果使用type属性显式指定构造函数参数的类型，则容器可以使用简单类型的类型匹配

```xml
<bean id="exampleBean" class="examples.ExampleBean">
    <constructor-arg type="int" value="7500000"/>
    <constructor-arg type="java.lang.String" value="42"/>
</bean>
```

使用index属性明确指定构造函数参数的索引。 例如：

```xml
<bean id="exampleBean" class="examples.ExampleBean">
    <constructor-arg index="0" value="7500000"/>
    <constructor-arg index="1" value="42"/>
</bean>
```

除了解决多个简单值的歧义之外，指定索引还解决了构造函数具有两个相同类型参数的含糊问题。请注意，该索引是基于0的。 您也可以使用构造函数参数名称进行值消歧：

```xml
<bean id="exampleBean" class="examples.ExampleBean">
    <constructor-arg name="years" value="7500000"/>
    <constructor-arg name="ultimateAnswer" value="42"/>
</bean>
```

请记住，要使这项工作开箱即用，您的代码必须在启用了调试标志的情况下编译，以便Spring可以从构造函数中查找参数名称。 如果你不能用调试标志编译你的代码（或不想），你可以使用`@ConstructorProperties `来显式地命名你的构造函数参数。 示例类将不得不如下所示：

```java
package examples;

public class ExampleBean {

    // Fields omitted

    @ConstructorProperties({"years", "ultimateAnswer"})
    public ExampleBean(int years, String ultimateAnswer) {
        this.years = years;
        this.ultimateAnswer = ultimateAnswer;
    }
}
```

#### 基于Setter的依赖注入

在调用无参数构造函数或无参数静态工厂方法来实例化`bean`之后，基于`Setter`的`DI`通过调用`bean`的`setter`方法来完成。 以下示例显示了一个只能使用纯`setter`注入进行依赖注入的类。这个类是传统的Java。这是一个POJO，它不依赖于容器特定的接口，基类或注释:

```java
public class SimpleMovieLister {

    // the SimpleMovieLister has a dependency on the MovieFinder
    private MovieFinder movieFinder;

    // a setter method so that the Spring container can inject a MovieFinder
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // business logic that actually uses the injected MovieFinder is omitted...
}
```

### 详细的依赖和配置

#### 直接值

`<property />`元素的value属性将属性或构造函数参数指定为可读的字符串表示形式。`Spring`的转换服务用于将这些值从`String`转换为属性或参数的实际类型。

```xml
<bean id="myDataSource" class="org.apache.commons.dbcp.BasicDataSource" destroy-method="close">
    <!-- results in a setDriverClassName(String) call -->
    <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
    <property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
    <property name="username" value="root"/>
    <property name="password" value="masterkaoli"/>
</bean>
```

以下示例使用`p-namespace`进行更简洁的XML配置。

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:p="http://www.springframework.org/schema/p"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
    http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="myDataSource" class="org.apache.commons.dbcp.BasicDataSource"
        destroy-method="close"
        p:driverClassName="com.mysql.jdbc.Driver"
        p:url="jdbc:mysql://localhost:3306/mydb"
        p:username="root"
        p:password="masterkaoli"/>

</beans>
```

上面的`XML`虽然更简洁;然而，配置信息在运行时而不是设计时发现错字，除非您在创建`bean`定义时使用支持自动属性完成的IDE。 您还可以将`java.util.Properties`实例配置为：

```xml
<bean id="mappings"
    class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">

    <!-- typed as a java.util.Properties -->
    <property name="properties">
        <value>
            jdbc.driver.className=com.mysql.jdbc.Driver
            jdbc.url=jdbc:mysql://localhost:3306/mydb
        </value>
    </property>
</bean>
```

Spring容器通过使用JavaBeans `PropertyEditor`机制将`<value/>`元素内的文本转换为`java.util.Properties`实例。这是一个很好的捷径，它是Spring团队倾向于在value属性样式上使用嵌套的`<value/>`元素的几个地方之一。

idref元素只是一种防错的方式，可以将容器中另一个bean的id（字符串值 - 不是引用）传递给`<constructor-arg/>`或`<property />`元素。

```xml
<bean id="theTargetBean" class="..."/>

<bean id="theClientBean" class="...">
    <property name="targetName">
        <idref bean="theTargetBean"/>
    </property>
</bean>
```

上面的`bean`定义片段与下面的片段完全等价（在运行时）：

```xml
<bean id="theTargetBean" class="..." />

<bean id="client" class="...">
    <property name="targetName" value="theTargetBean"/>
</bean>
```

第一种形式比第二种形式要好，因为使用`idref`标签允许容器在部署时验证引用的命名`bean`实际存在。在第二种变体中，不会对传递给客户机bean的`targetName`属性的值执行验证。当客户端`bean`实际实例化时，才会发现bean（最可能致命的结果）。如果客户端bean是prototype bean，则此类型错误和生成的异常可能仅在部署容器后很长时间才能发现。

`ref`元素是`<constructor-arg />`或`<property />`定义元素中的最后一个元素。在这里，您将bean的指定属性的值设置为对容器管理的另一个bean（协作者）的引用。通过`<ref />`标签的bean属性指定目标bean是最通用的形式，并且允许创建对同一容器或父容器中的任何bean的引用，而不管它是否位于同一个`XML`文件中。bean属性的值可以与目标bean的id属性相同，或者作为目标bean的name属性中的一个值。

```xml
<ref bean="someBean"/>
```

通过`parent`属性指定目标bean将创建对当前容器的父容器中的bean的引用(他的目标bean必须位于父容器中。)。

```xml
<!-- in the parent context -->
<bean id="accountService" class="com.foo.SimpleAccountService">
    <!-- insert dependencies as required as here -->
</bean>
<!-- in the child (descendant) context -->
<bean id="accountService" <!-- bean name is the same as the parent bean -->
    class="org.springframework.aop.framework.ProxyFactoryBean">
    <property name="target">
        <ref parent="accountService"/> <!-- notice how we refer to the parent bean -->
    </property>
    <!-- insert other configuration and dependencies as required here -->
</bean>
```

#### 内部bean

`<property />`或`<constructor-arg />`元素中的`<bean />`元素定义了一个所谓的内部bean。

```xml
<bean id="outer" class="...">
    <!-- instead of using a reference to a target bean, simply define the target bean inline -->
    <property name="target">
        <bean class="com.example.Person"> <!-- this is the inner bean -->
            <property name="name" value="Fiona Apple"/>
            <property name="age" value="25"/>
        </bean>
    </property>
</bean>
```

内部`bean`定义不需要定义的id或名称; 如果指定，容器不使用这样的值作为标识符。容器在创建时也会忽略范围标志：内部`bean`始终是匿名的，并且它们始终使用外部`bean`创建。不可能将内部`bean`注入到除了封装`bean`之外的协作`bean`中，或者独立访问它们。

#### 集合注入

在`<list />`，`<set />`，`<map />`和`<props />`元素中，分别设置Java集合类型`List`，`Set`，`Map`和`Properties`的属性和参数。



### 使用 `depends-on`

如果一个`bean`是另一个`bean`的依赖项，这通常意味着一个`bean`被设置为另一个的属性。通常，您可以使用基于XML的配置元数据中的`＜ref/＞`元素来实现这一点。然而，有时`bean`之间的依赖关系并不那么直接。例如，当需要触发类中的静态初始值设定项时，例如数据库驱动程序注册。`dependent-on`属性可以显式地强制在初始化使用此元素的`bean`之前初始化一个或多个`bean`。以下示例使用`dependent-on`属性来表示对单个`bean`的依赖关系：

```xml
<bean id="beanOne" class="ExampleBean" depends-on="manager"/>
<bean id="manager" class="ManagerBean" />
```

要表达对多个bean的依赖关系，请提供一个bean名称列表作为依赖属性的值（逗号、空格和分号是有效的分隔符）：

```xml
<bean id="beanOne" class="ExampleBean" depends-on="manager,accountDao">
	<property name="manager" ref="manager" />
</bean>

<bean id="manager" class="ManagerBean" />
<bean id="accountDao" class="x.y.jdbc.JdbcAccountDao" />
```

dependent-on属性既可以指定初始化时依赖项，也可以指定相应的销毁时依赖项（仅在单例bean的情况下）。定义与给定bean的依赖关系的依赖bean首先被销毁，然后给定bean本身被销毁。

### bean 懒加载

默认情况下，`ApplicationContext`实现会在初始化过程中急切地创建和配置所有单例`bean`。通常，这种预实例化是可取的，因为配置或周围环境中的错误会立即被发现，而不是几小时甚至几天后。当这种行为不可取时，可以通过将bean定义标记为惰性初始化来防止单例bean的预实例化。lazy初始化的bean告诉IoC容器在第一次请求时创建bean实例，而不是在启动时。

在XML中，此行为由`<bean/>`元素上的`lazy-init`属性控制，如下例所示：

```xml
<bean id="lazy" class="com.something.ExpensiveToCreateBean" lazy-init="true"/>
<bean name="not.lazy" class="com.something.AnotherBean"/>
```

当`ApplicationContext`使用前面的配置时，当`ApplicationContext`启动时，惰性bean不会被急切地预实例化。
但是，当惰性初始化的bean是未惰性初始化的singleton bean的依赖项时，ApplicationContext会在启动时创建惰性初始化的bean，因为它必须满足singleton的依赖项。惰性初始化的bean被注入到其他未惰性初始化的singleton bean中。

您还可以通过在`＜beans/＞`元素上使用默认的惰性初始化属性来控制容器级别的惰性初始化，如下例所示：

```xml
<beans default-lazy-init="true">
	<!-- no beans will be pre-instantiated... -->
</beans>
```





## Bean scopes

Spring框架支持六个作用域，其中四个作用域只有在使用Web感知的ApplicationContext时才可用。

以下范围支持开箱即用。 您也可以创建自定义范围:

| singleton   | （默认）每个Spring IoC容器将单个bean定义作用于单个对象实例。 |
| ----------- | ------------------------------------------------------------ |
| prototype   | 单个bean定义用于将任何多个数量的对象实例的。                 |
| request     | 将单个bean定义作用于单个HTTP请求的生命周期; 也就是说，每个HTTP请求都有自己的实例，这个实例是在单个bean定义的背后创建的。 只有在Web感知的Spring ApplicationContext的上下文中才有效。 |
| session     | 在HTTP会话的生命周期中定义一个单一的bean定义。 只有在Web感知的Spring ApplicationContext的上下文中才有效。 |
| application | 将一个单独的bean定义作用于ServletContext的生命周期。 只有在Web感知的Spring ApplicationContext的上下文中才有效。 |
| websocket   | 在WebSocket的生命周期中定义一个单一的bean定义。 只有在Web感知的Spring ApplicationContext的上下文中才有效。 |

从Spring 3.0开始，添加了新的范围`thread `，但默认情况下未注册。 有关更多信息，请参阅SimpleThreadScope的文档。 有关如何注册此或任何其他自定义作用域的说明，请参阅使用自定义作用域。

### The singleton scope

只管理单个bean的一个共享实例，并且具有与该bean定义匹配的`id`。句话说，当你定义一个bean定义并且它的范围是一个singleton时，Spring IoC容器恰好创建了该bean定义定义的对象的一个实例。这个单实例存储在这些单例bean的缓存中，并且该命名bean的所有后续请求和引用都会返回缓存的对象。

singleton Spring单例的范围最好按容器和每个bean来描述。 这意味着如果您为单个Spring容器中的特定类定义一个bean，那么Spring容器将创建该bean定义所定义的类的一个且仅有的一个实例。 单例作用域是Spring中的默认作用域。 要将一个bean定义为XML中的单例，您可以编写，例如：

```xml
<bean id="accountService" class="com.foo.DefaultAccountService"/>

<!-- the following is equivalent, though redundant (singleton scope is the default) -->
<bean id="accountService" class="com.foo.DefaultAccountService" scope="singleton"/>
```

### The prototype scope

bean的部署的非单实例原型范围导致每次创建一个新的bean实例。也就是说，该bean被注入到另一个bean中，或者通过容器上的getBean方法调用来请求它都会创建新的实例。通常，为所有有状态bean使用原型作用域，无状态bean使用单例作用域。

```xml
<bean id="accountService" class="com.foo.DefaultAccountService" scope="prototype"/>
```

与其他范围相比，Spring不管理原型bean的完整生命周期：容器实例化，配置并以其他方式组装原型对象，并将其交给客户端，而不再记录该原型实例。因此，**尽管在所有对象上调用初始化生命周期回调方法而不管范围，但在原型的情况下，不调用配置的销毁生命周期回调**。客户端代码必须清理原型范围的对象并释放原型bean持有的昂贵资源。为了让Spring容器释放原型范围bean所拥有的资源，可以尝试使用一个自定义bean后处理器，该后处理器保存对需要清理的bean的引用。

在某些方面，Spring容器在原型范围bean方面的作用是Java new运算符的替代。 

### Singleton beans with prototype-bean dependencies

当你使用的单例`bean`中有`field`依赖`prototype`实例时，请注意，在实例化时解决了依赖关系。因此，如果您将原型范围的`bean`依赖注入到单例范围的`bean`中，一个新的原型`bean`被实例化，然后依赖注入到单例`bean`中。原型实例是提供给单例范围`bean`的唯一实例。

但是，假设您希望单例范围的`bean`在运行时重复获取原型范围的`bean`的新实例。你不能依赖注入一个原型范围的`bean`到你的单例`bean`中，因为这个注入只发生一次。如果您不止一次在运行时需要一个原型`bean`的新实例，请参阅方法注入。

### Request, session, application, and WebSocket scopes

### Custom scopes

## 自定义bean的本质

### 生命周期回调

要与容器管理的bean生命周期进行交互，可以实现Spring `InitializingBean`和`DisposableBean`接口。容器为前者调用`afterPropertiesSet`，为后者调用`destroy`以允许bean在初始化和销毁bean时执行某些操作。

> JSR-250 `@PostConstruct`和`@PreDestroy`注释通常被认为是在现代Spring应用程序中接收生命周期回调的最佳实践。 使用这些注释意味着你的`bean`没有耦合到`Spring`特定的接口。 有关详细信息，请参阅@PostConstruct和@PreDestroy。
>
> 如果您不想使用JSR-250注释，但仍想要移除耦合，请考虑使用`init-method`和`destroy-method`对象定义元数据。

在内部，Spring框架使用`BeanPostProcessor`实现来处理它可以找到的任何回调接口并调用适当的方法。如果您需要自定义功能或其他生命周期行为，Spring不提供开箱即用的功能，您可以自己实现`BeanPostProcessor`。 有关更多信息，请参阅容器扩展点。

除了初始化和销毁回调，Spring管理的对象还可以实现生命周期接口，以便这些对象可以参与由容器自身生命周期驱动的启动和关闭过程。

#### 初始化回调

`org.springframework.beans.factory.InitializingBean`接口允许bean的在所有必要属性已由容器设置后执行初始化工作。 `InitializingBean`接口指定一个方法：

```java
void afterPropertiesSet() throws Exception;
```

建议您不要使用`InitializingBean`接口，因为它不必要地将代码耦合到`Spring`。或者，使用`@PostConstruct`注释或指定一个`POJO`初始化方法。 对于基于`XML`的配置元数据，您可以使用`init-method`属性来指定具有void无参数签名的方法的名称。使用`Java`配置，您可以使用`@Bean`的`initMethod`属性，请参阅接收生命周期回调。 例如，以下内容：

```xml
<bean id="exampleInitBean" class="examples.ExampleBean" init-method="init"/>
```

```java
public class ExampleBean {

    public void init() {
        // do some initialization work
    }
}
```

等同于下面,但不会将代码耦合到Spring。：

```xml
<bean id="exampleInitBean" class="examples.AnotherExampleBean"/>
```

```java
public class AnotherExampleBean implements InitializingBean {

    public void afterPropertiesSet() {
        // do some initialization work
    }
}
```

#### 销毁回调

实现`org.springframework.beans.factory.DisposableBean`接口允许bean在包含它的容器被销毁时获得回调。 `DisposableBean`接口指定一个方法：

```java
void destroy() throws Exception;
```

建议您不要使用`DisposableBean`回调接口，因为它不必要地将代码耦合到`Spring`。 或者，使用`@PreDestroy`注释或指定bean定义支持的通用方法。 使用基于XML的配置元数据时，可以使用`<bean />`上的`destroy-method`属性。 使用Java配置，您可以使用@Bean的`destroyMethod`属性，请参阅接收生命周期回调。 例如，下面的定义：

```xml
<bean id="exampleInitBean" class="examples.ExampleBean" destroy-method="cleanup"/>
```

```java
public class ExampleBean {

    public void cleanup() {
        // do some destruction work (like releasing pooled connections)
    }
}
```

#### 默认初始化和销毁方法

当您编写不使用特定于Spring的`InitializingBean`和`DisposableBean`回调接口的初始化和销毁方法时，通常会使用诸如`init`，`initialize`，`dispose`等名称编写方法。 理想情况下，此类生命周期回调方法的名称在项目中标准化，以便所有开发人员使用相同的方法名称并确保一致性。

您可以配置`Spring`容器以查找方法名表示初始化或销毁每个`bean`上的回调方法。这意味着作为应用程序开发人员，您可以编写应用程序类并使用称为`init`的初始化回调，而无需为每个bean定义配置`init-method ="init"`属性。Spring IoC容器在创建bean时（并根据前面描述的标准生命周期回调协议）调用该方法。 此功能还为初始化和销毁方法回调强制执行一致的命名约定。

假设你的初始化回调方法被命名为`init`，并且销毁回调方法被命名为`destroy`。 在下面的例子中：

```java
public class DefaultBlogService implements BlogService {

    private BlogDao blogDao;

    public void setBlogDao(BlogDao blogDao) {
        this.blogDao = blogDao;
    }

    // this is (unsurprisingly) the initialization callback method
    public void init() {
        if (this.blogDao == null) {
            throw new IllegalStateException("The [blogDao] property must be set.");
        }
    }
}
```

```xml
<beans default-init-method="init">

    <bean id="blogService" class="com.foo.DefaultBlogService">
        <property name="blogDao" ref="blogDao" />
    </bean>

</beans>
```

顶层`<beans />`元素属性中`default-init-method`属性的存在会导致Spring IoC容器识别出一个名为`init`的方法作为初始化方法回调。当一个bean被创建和组装时，如果bean类有这样一个方法，它会在适当的时候被调用。

通过在顶级`<beans />`元素上使用`default-destroy-method`属性，可以类似地配置`destroy`方法回调（即在XML中）。

在现有bean类已经具有与惯例不同的回调方法的情况下，可以通过使用`<bean/>`的`init-method`和`destroy-method`属性指定方法名称（即XML中的方法名称）来覆盖。

==Spring容器保证了一个配置好的初始化回调函数在bean被提供了所有的依赖关系后立即被调用。因此初始化回调在原始`bean`引用上被调用，这意味着`AOP`拦截器等等还没有被应用到`bean`。==**目标bean首先被完全创建，然后应用带有拦截器链的AOP代理**。如果目标bean和代理是分别定义的，那么代码甚至可以绕过代理与原始目标bean进行交互。 因此，将拦截器应用于init方法会不一致，因为这样会将目标bean的生命周期与代理/拦截器耦合在一起，并在代码直接与原始目标bean交互时留下奇怪的语义。

#### 组合使用生命周期机制

从Spring 2.5开始，您有三个控制bean生命周期行为的选项：`InitializingBean`和`DisposableBean`回调接口; 自定义`init`和`destroy`方法; 和`@PostConstruct`和`@PreDestroy`注释。 你可以结合这些机制来控制给定的bean。

**如果为bean配置了多个生命周期机制，并且每个机制都配置了不同的方法名称，那么每个配置的方法都按照下面列出的顺序执行。但是，如果为这些生命周期机制中的多个生命周期机制配置了相同的方法名称（例如初始化方法的`init`），则该方法将执行一次，如前一部分所述。**

为相同的bean配置多种生命周期机制，使用不同的初始化方法，如下所示：

- Methods annotated with @PostConstruct
- afterPropertiesSet() as defined by the InitializingBean callback interface
- A custom configured init() method

#### Startup和shutdown回调

Lifecycle 接口为任何具有自己生命周期要求的对象（例如启动和停止一些后台进程）定义基本方法：

```java
public interface Lifecycle {

    void start();

    void stop();

    boolean isRunning();
}
```

任何Spring管理的对象都可以实现该接口。 然后，当`ApplicationContext`本身接收到启动和停止信号时，例如 对于运行时的停止、重新启动场景，它会将这些调用传递到在该上下文中定义的所有`Lifecycle`实现。 它通过委派给`LifecycleProcessor`来完成此操作：

```java
public interface LifecycleProcessor extends Lifecycle {

    void onRefresh();

    void onClose();
}
```

请注意，`LifecycleProcessor`本身就是生命周期接口的扩展。 它还添加了两种其他方法来对正在刷新和关闭的上下文作出反应。

请注意，常规`org.springframework.context.Lifecycle`接口只是显式启动/停止通知的普通协定，并不意味着在上下文刷新时自动启动.考虑实现`org.springframework.context.SmartLifecycle`，而不是对特定bean的自动启动（包括启动阶段）进行细粒度控制。此外，请注意，停止通知不保证在销毁之前发生：在正常关闭时，所有生命周期bean将在传播通用销毁回调之前首先收到停止通知;然而，在上下文的生命周期中的热刷新或中止刷新尝试时，只会调用销毁方法。

启动和关闭调用的顺序可能很重要。如果任何两个对象之间存在依赖关系，则依赖方将在其依赖关系之后启动，并且在其依赖关系之前停止。但是，有时直接依赖关系是未知的。 您可能只知道某种类型的对象应该在另一种类型的对象之前启动。在这些情况下，`SmartLifecycle`接口定义了另一个选项，即在父接口`Phased`上定义的`getPhase`方法。

```java
public interface Phased {

    int getPhase();
}
```

```java
public interface SmartLifecycle extends Lifecycle, Phased {

    boolean isAutoStartup();

    void stop(Runnable callback);
}
```

启动时，`Phased`最低的首先启动，停止时相反。因此，一个实现`SmartLifecycle`并且其`getPhase`方法返回`Integer.MIN_VALUE`的对象将成为第一个开始和最后一个停止的对象。

在考虑`Phase`的值时，了解任何未实现`SmartLifecycle`的“正常”生命周期对象的默认Phase为0也很重要。因此，任何负的`Phase`值都表示对象应在这些标准组件之前启动（并且 在它们之后停止），反之亦然，对于任何正的Phase值。

正如您所看到的，`SmartLifecycle`定义的stop方法接受回调。 任何实现必须在该实现的关闭过程完成后调用该回调的`run`方法。这可以在需要时进行异步关闭，因为`LifecycleProcessor`接口的默认实现`DefaultLifecycleProcessor`将等待对象组的超时值以调用该回调。

每个阶段的默认超时时间是30秒。 您可以通过在上下文中定义一个名为lifecycleProcessor的bean来覆盖默认的生命周期处理器实例。 如果您只想修改超时值，那么定义以下就足够了：

```xml
<bean id="lifecycleProcessor" class="org.springframework.context.support.DefaultLifecycleProcessor">
    <!-- timeout value in milliseconds -->
    <property name="timeoutPerShutdownPhase" value="10000"/>
</bean>
```

如前所述，`LifecycleProcessor`接口还定义了用于刷新和关闭上下文的回调方法。后者将简单地驱动关闭过程，就好像`stop`已被显式调用一样，但是当上下文关闭时会发生。另一方面，'刷新’回调启用了SmartLifecycle bean的另一个功能。 当上下文刷新时（在所有对象被实例化和初始化之后），该回调将被调用，并且此时默认生命周期处理器将检查每个SmartLifecycle对象的isAutoStartup方法返回的布尔值。如果为“true”，那么该对象将在那个时候启动，而不是等待显式调用上下文或自己的start方法（与上下文刷新不同，上下文启动不会自动执行标准上下文）。“阶段”值以及任何“依赖”关系将以与上述相同的方式确定启动顺序。

#### 在非web应用程序中正常关闭Spring IoC容器

如果您在非Web应用程序环境中使用Spring的IoC容器，例如，在富客户端桌面环境中;您使用JVM注册了一个关闭钩子。这样做可以确保正常关闭并在单例bean上调用相关的销毁方法，从而释放所有资源。 当然，您仍然必须正确配置和实施这些销毁回调。 要注册一个关闭挂钩，可以调用`ConfigurableApplicationContext`接口上声明的`registerShutdownHook`方法：

```java
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public final class Boot {

    public static void main(final String[] args) throws Exception {
        ConfigurableApplicationContext ctx = new ClassPathXmlApplicationContext("beans.xml");

        // add a shutdown hook for the above context...
        ctx.registerShutdownHook();

        // app runs here...

        // main method exits, hook is called prior to the app shutting down...
    }
}
```

### ApplicationContextAware 和 BeanNameAware

当一个`ApplicationContext`创建一个实现`org.springframework.context.ApplicationContextAware`接口的对象实例时，该实例提供了对该`ApplicationContext`的引用。

```java
public interface ApplicationContextAware {

    void setApplicationContext(ApplicationContext applicationContext) throws BeansException;
}
```

因此，bean可以通过`ApplicationContext`接口或通过将引用强制转换为此接口的已知子类（如`ConfigurableApplicationContext`）来创建它们，从而以编程方式操作`ApplicationContext`,该类提供了很多功能。一个用途是对其他bean的程序化检索。有时候这种能力是有用的;但是，通常你应该避免它，因为它将代码耦合到Spring，并且不遵循Inversion of Control风格，其中协作者被提供给bean作为属性。`ApplicationContext`的其他方法提供对文件资源的访问，发布应用程序事件以及访问`MessageSource`。 这些附加功能在`ApplicationContext`的附加功能中进行了介绍.

从Spring 2.5开始，自动装配是获得对`ApplicationContext`的引用的另一种方法。“传统”构造函数和byType自动装配模式（如自动装配协作者中所述）可以分别为构造函数参数或setter方法参数提供`ApplicationContext`类型的依赖关系.为了获得更大的灵活性，包括自动装配字段和多个参数方法的能力，请使用新的基于注释的自动装配功能。 如果这样做，则`ApplicationContext`会自动装入字段，构造函数参数或方法参数中，如果所涉及的字段，构造函数或方法携带`@Autowired`注释，则该参数将期望`ApplicationContext`类型。 有关更多信息，请参阅@Autowired。

当`ApplicationContext`创建一个实现`org.springframework.beans.factory.BeanNameAware`接口的类时，该类将提供对其关联对象定义中bean的名称的引用。

```java
public interface BeanNameAware {

    void setBeanName(String name) throws BeansException;
}
```

这个回调函数是在正常的bean属性填充之后，但在初始化回调(例如`InitializingBean afterPropertiesSet`或者一个自定义的init方法)之前调用的。

### 其他Aware接口

除了上面讨论的`ApplicationContextAware`和`BeanNameAware`之外，Spring提供了一系列`Aware`接口，允许bean向容器指示它们需要某种基础设施依赖性。 最重要的`Aware`接口总结如下：

| Name                           | 注入依赖                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| ApplicationContextAware        | 声明ApplicationContext                                       |
| ApplicationEventPublisherAware | 封装ApplicationContext的事件发布者                           |
| BeanClassLoaderAware           | 用于加载Bean类的类加载器。                                   |
| BeanFactoryAware               | 声明BeanFactory                                              |
| BeanNameAware                  | 声明bean的名称                                               |
| BootstrapContextAware          | 资源适配器BootstrapContext容器在其中运行。通常仅在支持JCA的ApplicationContexts中可用 |
| LoadTimeWeaverAware            | 定义编织器用于在加载时处理类定义                             |
| MessageSourceAware             | 用于解析消息的配置策略（支持参数化和国际化）                 |
| NotificationPublisherAware     | Spring JMX通知发布者                                         |
| ResourceLoaderAware            | 配置的加载器可以实现对资源的低级访问                         |
| ServletConfigAware             | 当前的ServletConfig容器运行。仅在Web感知的Spring ApplicationContext中有效 |
| ServletContextAware            | 容器运行的当前ServletContext。仅在Web感知的Spring ApplicationContext中有效 |

再次注意，这些接口的使用将您的代码绑定到Spring API，并且不遵循控制反转。 因此，它们被推荐用于需要对容器进行编程访问的基础架构bean。











