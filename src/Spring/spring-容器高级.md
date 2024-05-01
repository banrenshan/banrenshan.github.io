---
title: Spring 容器高级
date: 2024-05-01
categories:
  - Spring
tags:
  - Spring
  - 容器
---

## bean定义的集成

一个bean定义可以包含很多配置信息，包括构造函数参数，属性值和特定于容器的信息，例如初始化方法，静态工厂方法名称等等。子bean定义从父定义继承配置数据。 根据需要，子定义可以覆盖一些值或添加其他值。 使用父子bean定义可以节省大量的输入。 实际上，这是一种模板形式。

子Bean定义由`ChildBeanDefinition`类表示。在使用基于XML的配置元数据时，通过使用parent属性指定父bean作为此属性的值。

```xml
<bean id="inheritedTestBean" abstract="true"
        class="org.springframework.beans.TestBean">
    <property name="name" value="parent"/>
    <property name="age" value="1"/>
</bean>

<bean id="inheritsWithDifferentClass"
        class="org.springframework.beans.DerivedTestBean"
        parent="inheritedTestBean" init-method="initialize">
    <property name="name" value="override"/>
    <!-- the age property value of 1 will be inherited from parent -->
</bean>
```

如果没有指定，则子bean定义使用父定义中的bean类，但也可以覆盖它。 在后一种情况下，子Bean类必须与父类兼容，也就是说，它必须接受父类的属性值。

子bean定义继承了父级的范围，构造函数参数值，属性值和方法重写，并且可以添加新值。 您指定的任何范围，初始化方法，销毁方法和/或静态工厂方法设置都将覆盖相应的父设置。其余设置始终从子定义中获取：依赖，自动装配模式，依赖关系检查，单例，延迟初始化。

前面的示例通过使用abstract属性将父bean定义显式标记为抽象。 如果父定义没有指定类，则需要将父类定义显式标记为抽象，如下所示：

```xml
<bean id="inheritedTestBeanWithoutClass" abstract="true">
    <property name="name" value="parent"/>
    <property name="age" value="1"/>
</bean>

<bean id="inheritsWithClass" class="org.springframework.beans.DerivedTestBean"
        parent="inheritedTestBeanWithoutClass" init-method="initialize">
    <property name="name" value="override"/>
    <!-- age will inherit the value of 1 from the parent bean definition-->
</bean>
```

父bean不能自行实例化，因为它是不完整的，并且它也明确标记为抽象。当定义像这样抽象时，它只能用作纯模板bean定义，作为子定义的父定义。试图单独使用这样一个抽象的父bean，通过将其称为另一个bean的`ref`属性或使用父bean id执行显式的`getBean`调用返回一个错误。同样，容器的内部`preInstantiateSingletons`方法也会忽略定义为抽象的bean定义。

## 容器扩展点

通常，应用程序开发人员不需要继承ApplicationContext实现类。 相反，Spring IoC容器可以通过插入特殊集成接口的实现来扩展。 接下来的几节将介绍这些集成接口。

### 使用BeanPostProcessor定制bean

`BeanPostProcessor`接口定义了您可以实现的回调方法，以提供您自己的（或覆盖容器的默认值）实例化逻辑，依赖关系解析逻辑等等。如果你想在`Spring`容器完成实例化，配置和初始化`bean`之后实现一些定制逻辑，你可以插入一个或多个`BeanPostProcessor`实现。

您可以配置多个`BeanPostProcessor`实例，并且可以通过设置`order`属性来控制这些`BeanPostProcessors`执行的顺序。只有`BeanPostProcessor`实现`Ordered`接口时，才可以设置此属性;如果你编写自己的`BeanPostProcessor`，你应该考虑实现`Ordered`接口。

`BeanPostProcessors`对`bean`（或对象）实例进行操作; 也就是说，`Spring IoC`容器实例化一个`bean`实例后,`BeanPostProcessors`开始执行他们的操作。

`BeanPostProcessors`作用域是容器。这只有在使用容器层次结构时才有意义。如果你在一个容器中定义了一个`BeanPostProcessor`，它只会在该容器中后处理这些`bean`。 换句话说，在一个容器中定义的`bean`不会被另一个容器中定义的`BeanPostProcessor`进行后处理，即使两个容器都是同一层次结构的一部分。

要更改实际的`bean`定义，您需要使用`BeanFactoryPostProcessor`，如使用`BeanFactoryPostProcessor`定制配置元数据中所述。

`org.springframework.beans.factory.config.BeanPostProcessor`接口恰好包含两个回调方法。 当这样的类被注册为容器的后处理器时，对于由容器创建的每个bean实例，后处理器都会在容器初始化方法（如`InitializingBean`的`afterPropertiesSet`之前和容器 声明的`init`方法）以及任何`bean`初始化回调之后被调用。后处理器可以对`bean`实例执行任何操作，包括完全忽略回调。一个`bean`后处理器通常检查回调接口，或者可能用一个代理包装一个`bean`。 一些Spring `AOP`基础设施类被实现为`bean`后处理器，以提供代理包装逻辑。

`ApplicationContext`自动检测在配置元数据中实现`BeanPostProcessor`接口的任何`bean`。`ApplicationContext`将这些`bean`注册为后处理器，以便稍后在创建`bean`时调用它们。 `Bean`后处理器可以像任何其他`bean`一样部署在容器中。

请注意，在配置类中使用`@Bean`工厂方法声明`BeanPostProcessor`时，工厂方法的返回类型应该是实现类本身，或者至少是`org.springframework.beans.factory.config.BeanPostProcessor`接口，清楚地指示 该`bean`的后处理器特性。 否则，在完全创建它之前，`ApplicationContext`将无法按类型自动检测它。 由于`BeanPostProcessor`需要尽早实例化以适用于上下文中其他`bean`的初始化，因此这种早期类型检测非常重要。

以下示例显示如何在`ApplicationContext`中编写，注册和使用`BeanPostProcessors`。

`Hello World, BeanPostProcessor-style*` 这第一个例子说明了基本用法。该示例显示了一个自定义`BeanPostProcessor`实现，该实现调用每个`bean`的`toString`方法，因为它是由容器创建的，并将结果字符串打印到系统控制台:

```java
package scripting;

import org.springframework.beans.factory.config.BeanPostProcessor;

public class InstantiationTracingBeanPostProcessor implements BeanPostProcessor {

    // simply return the instantiated bean as-is
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        return bean; // we could potentially return any object reference here...
    }

    public Object postProcessAfterInitialization(Object bean, String beanName) {
        System.out.println("Bean '" + beanName + "' created : " + bean.toString());
        return bean;
    }
}
```

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:lang="http://www.springframework.org/schema/lang"
    xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/lang
        http://www.springframework.org/schema/lang/spring-lang.xsd">

    <lang:groovy id="messenger"
            script-source="classpath:org/springframework/scripting/groovy/Messenger.groovy">
        <lang:property name="message" value="Fiona Apple Is Just So Dreamy."/>
    </lang:groovy>

    <!--
    when the above bean (messenger) is instantiated, this custom
    BeanPostProcessor implementation will output the fact to the system console
    -->
    <bean class="scripting.InstantiationTracingBeanPostProcessor"/>

</beans>
```

注意`InstantiationTracingBeanPostProcessor`是如何定义的。 它甚至没有名称，因为它是一个`bean`，它可以像其他任何`bean`一样依赖注入。

**RequiredAnnotationBeanPostProcessor** 将回调接口或注释与自定义`BeanPostProcessor`实现结合使用是扩展Spring IoC容器的常用方法。Spring的`RequiredAnnotationBeanPostProcessor`就是一个例子，它是Spring发行版中的一个`BeanPostProcessor`实现，它确保标记有（任意）注释的`bean`的`JavaBean`属性实际（配置为）依赖注入一个值。

### 使用BeanFactoryPostProcessor定制配置元数据

下一个我们将看到的扩展点是`org.springframework.beans.factory.config.BeanFactoryPostProcessor`。这个接口的语义与`BeanPostProcessor`相似，主要区别在于：`BeanFactoryPostProcessor`在bean配置元数据上运行; 也就是说，Spring IoC容器允许`BeanFactoryPostProcessor`读取配置元数据并在容器实例化除`BeanFactoryPostProcessor`之外的任何Bean之前对其进行更改。

您可以配置多个`BeanFactoryPostProcessors`，并且您可以通过设置`order`属性来控制这些`BeanFactoryPostProcessors`执行的顺序。但是，如果`BeanFactoryPostProcessor`实现`Ordered`接口，则只能设置此属性。如果你编写你自己的`BeanFactoryPostProcessor`，你应该考虑实现`Ordered`接口。

如果您想更改实际的bean实例（即从配置元数据创建的对象），则需要使用`BeanPostProcessor`。 虽然技术上可以在`BeanFactoryPostProcessor`中使用bean实例（例如，使用`BeanFactory.getBean`），但这样做会导致`bean`过早实例化，从而违反标准容器生命周期。 这可能会导致负面影响，如绕过`bean`后处理。

另外，`BeanFactoryPostProcessors`的范围是每个容器。这只有在使用容器层次结构时才有意义。如果您在一个容器中定义了一个`BeanFactoryPostProcessor`，它将只应用于该容器中的`bean`定义。一个容器中的Bean定义将不会由另一个容器中的`BeanFactoryPostProcessors`进行后处理，即使这两个容器都是同一层次结构的一部分。

一个bean工厂后处理器在`ApplicationContext`中声明时会自动执行，以便将更改应用于定义容器的配置元数据。Spring包含许多预定义的bean工厂后处理器，例如`PropertyOverrideConfigurer`和`PropertyPlaceholderConfigurer`。 例如，自定义`BeanFactoryPostProcessor`也可用于注册自定义属性编辑器。

ApplicationContext自动检测部署到其中的实现`BeanFactoryPostProcessor`接口的任何Bean。 它在适当的时候使用这些bean作为bean工厂后处理器。 您可以像任何其他bean一样部署这些后处理器bean。

**实例：类名替换PropertyPlaceholderConfigurer**

您可以使用`PropertyPlaceholderConfigurer`，通过使用标准的Java属性格式在一个单独的文件中将Bean定义的属性值进行外部化。通过这样做，部署应用程序的人员可以自定义特定于环境的属性，如数据库URL和密码，而无需修改容器主XML定义文件。

考虑以下基于XML的配置元数据片段，其中定义了包含占位符值的`DataSource`。 该示例显示了从外部属性文件配置的属性。 在运行时，一个`PropertyPlaceholderConfigurer`被应用于将取代`DataSource`的一些属性的元数据。 要替换的值被指定为遵循`Ant / log4j / JSP EL`样式的`$ {property-name}`形式的占位符。

```xml
<bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
    <property name="locations" value="classpath:com/foo/jdbc.properties"/>
</bean>

<bean id="dataSource" destroy-method="close"
        class="org.apache.commons.dbcp.BasicDataSource">
    <property name="driverClassName" value="${jdbc.driverClassName}"/>
    <property name="url" value="${jdbc.url}"/>
    <property name="username" value="${jdbc.username}"/>
    <property name="password" value="${jdbc.password}"/>
</bean>
```

通过Spring 2.5中引入的上下文命名空间，可以使用专用的配置元素来配置属性占位符。 一个或多个位置可以作为location属性中的逗号分隔列表提供。

```xml
<context:property-placeholder location="classpath:com/foo/jdbc.properties"/>
```

`PropertyPlaceholderConfigurer`不仅在您指定的属性文件中查找属性。 默认情况下，它也检查`Java`系统属性，如果它无法在指定的属性文件中找到属性。 您可以通过使用以下三个支持的整数值之一来设置`configurer`的`systemPropertiesMode`属性来自定义此行为：

- never （0）：从不检查系统属性
- fallback （1）：如果不能在指定的属性文件中解析，请检查系统属性。 这是默认设置。
- override（2）：在尝试指定的属性文件之前，首先检查系统属性。 这允许系统属性覆盖任何其他属性源。

您可以使用`PropertyPlaceholderConfigurer`来替换类名，当您必须在运行时选择特定的实现类时，这有时很有用。 例如：

```xml
<bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
    <property name="locations">
        <value>classpath:com/foo/strategy.properties</value>
    </property>
    <property name="properties">
        <value>custom.strategy.class=com.foo.DefaultStrategy</value>
    </property>
</bean>

<bean id="serviceStrategy" class="${custom.strategy.class}"/>
```

如果无法在运行时将类解析为有效的类，那么当它即将创建时，bean的解析失败，这是在非惰性初始化Bean的`ApplicationContext`的`preInstantiateSingletons`阶段期间。

**实例：PropertyOverrideConfigurer** 

`PropertyOverrideConfigurer`是另一个bean工厂后处理器，类似于`PropertyPlaceholderConfigurer`，但与后者不同，原始定义对于bean属性可以具有默认值或根本没有值。 如果重写的属性文件没有某个bean属性的条目，则使用默认的上下文定义。

请注意，bean定义并不知道被重写，所以从XML定义文件中不会立即明显地看到正在使用覆盖配置器。在为同一个bean属性定义不同值的多个PropertyOverrideConfigurer实例的情况下，由于重载机制，最后一个获胜。

```
dataSource.driverClassName=com.mysql.jdbc.Driver
dataSource.url=jdbc:mysql:mydb
```

这个示例文件可以与容器定义一起使用，该容器定义包含一个名为dataSource的bean，该bean具有driver和url属性。

只要路径中除最终属性被重写的每个组件都已经非空（可能由构造函数初始化），也支持复合属性名称。 在这个例子中…

```
foo.fred.bob.sammy=123
```

foo bean的fred属性的bob属性的sammy属性被设置为标量值123。 使用Spring 2.5中引入的上下文命名空间，可以使用专用配置元素配置属性覆盖：

```xml
<context:property-override location="classpath:override.properties"/>
```

### 使用FactoryBean定制实例化逻辑

为自己工厂的对象实现`org.springframework.beans.factory.FactoryBean`接口。

`FactoryBean`接口是Spring IoC容器实例化逻辑的可插入点。 如果你有复杂的初始化代码，用Java可以更好地表达，而不是（可能）冗长的XML，你可以创建自己的`FactoryBean`，在该类中写入复杂的初始化，然后将自定义的`FactoryBean`插入到容器中。

FactoryBean接口提供三种方法：

- `Object getObject`：返回此工厂创建的对象的实例。 该实例可能是共享的，具体取决于该工厂是返回单例还是原型。
- `boolean isSingleton`：如果此FactoryBean返回单例，则返回true，否则返回false。
- `Class getObjectType`：返回`getObject`方法返回的对象类型，如果事先未知类型，则返回null。

`FactoryBean`的概念和接口用于Spring框架的许多地方; `FactoryBean`接口的50多个实现与Spring本身一起提供。当你需要`FactoryBean`实例本身而不是它产生的`bean`时，在调用`ApplicationContext`的`getBean`方法时，用`＆`符号。因此，对于具有`myBean`标识的给定FactoryBean，在容器上调用`getBean("myBean")`将返回`FactoryBean`的产品; 而调用`getBean("＆myBean")`则返回`FactoryBean`实例本身。

## 基于注解的容器配置

###  Required

`@Required`注释适用于bean属性的setter方法，如下例所示：

```java
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Required
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }
}
```

这个注解主要作用是提醒容器在配置bean的时候，必须装配必要的属性，否则在项目启动的时候抛出异常。仍然建议您将断言放入`bean`类本身，例如，放入`init`方法中。 这样做即使在容器外部使用该类时也会强制执行检查那些必需的引用和值。

### Autowired

构造方法上使用

```java
public class MovieRecommender {

    private final CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    public MovieRecommender(CustomerPreferenceDao customerPreferenceDao) {
        this.customerPreferenceDao = customerPreferenceDao;
    }
}
```

> 从Spring Framework 4.3开始，如果目标bean只定义了一个构造函数，那么这种构造函数上的@Autowired注释就不再需要了。但是，如果有几个构造函数可用，则必须至少注明一个构造函数来告诉容器使用哪一个。

在setter方法上使用

```java
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Autowired
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }
}
```

具有任意名称或多个参数的方法：

```java
public class MovieRecommender {

    private MovieCatalog movieCatalog;

    private CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    public void prepare(MovieCatalog movieCatalog,
            CustomerPreferenceDao customerPreferenceDao) {
        this.movieCatalog = movieCatalog;
        this.customerPreferenceDao = customerPreferenceDao;
    }
}
```

您也可以将`@Autowired`应用于`field`，甚至可以将其与构造函数混合使用：

```java
public class MovieRecommender {

    private final CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    private MovieCatalog movieCatalog;

    @Autowired
    public MovieRecommender(CustomerPreferenceDao customerPreferenceDao) {
        this.customerPreferenceDao = customerPreferenceDao;
    }
}
```

对于通过类路径扫描找到的`XML`定义的`bean`或组件类，容器通常会预先知道具体类型。 但是，对于`@Bean`工厂方法，您需要确保声明的返回足够表达类型信息。对于实现多个接口的组件或可能由其实现类型引用的组件，请考虑在工厂方法中声明最具体的返回类型（至少按照注入点对bean引用的要求）。

通过将`@Autowired`添加到数组字段或方法，可以从ApplicationContext获取特定类型的所有Bean：

```java
public class MovieRecommender {

    @Autowired
    private MovieCatalog[] movieCatalogs;
}
```

对集合同样适用

```java
public class MovieRecommender {

    private Set<MovieCatalog> movieCatalogs;

    @Autowired
    public void setMovieCatalogs(Set<MovieCatalog> movieCatalogs) {
        this.movieCatalogs = movieCatalogs;
    }

}
```

> 如果希望数组或列表中的项目按特定顺序排序,您的目标bean可以实现`org.springframework.core.Ordered`接口，或者使用`@Order`或标准`@Priority`注释。 否则，他们的顺序将遵循容器中相应目标`bean`定义的注册顺序。

Map类型也可以自动注入。 Map值将包含期望类型的所有bean，并且键将包含相应的bean名称：

```java
public class MovieRecommender {

    private Map<String, MovieCatalog> movieCatalogs;

    @Autowired
    public void setMovieCatalogs(Map<String, MovieCatalog> movieCatalogs) {
        this.movieCatalogs = movieCatalogs;
    }
}
```

默认情况下，自动注入的bean不存在容器中则依赖注入失败。该注解标注的方法、字段、构造函数必须注入相关依赖项，可以改变该行为：

```java
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Autowired(required = false)
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }
}
```

建议使用`@Required`注解来标记`@Autowired`的`required`属性。`Autowired`的属性如果不能自动装配，则该属性将被忽略。但`@Required`更强大，因为它强制执行。 如果没有值被注入，则会引发相应的异常。

或者，您可以通过Java 8的`java.util.Optional`表达特定依赖项的非必需性质：

```java
public class SimpleMovieLister {

    @Autowired
    public void setMovieFinder(Optional<MovieFinder> movieFinder) {
    }
}
```

从Spring Framework 5.0开始，您还可以使用`@Nullable`注释：

```java
public class SimpleMovieLister {

    @Autowired
    public void setMovieFinder(@Nullable MovieFinder movieFinder) {
        ...
    }
}
```

您还可以使用`@Autowired`在众所周知的可解析依赖项的接口：`BeanFactory`，`ApplicationContext`，`Environment`，`ResourceLoader`，`ApplicationEventPublisher`和`MessageSource`。 这些接口及其扩展接口（如`ConfigurableApplicationContext`或`ResourcePatternResolver`）会自动解析，无需进行特殊设置。

```java
public class MovieRecommender {

    @Autowired
    private ApplicationContext context;

    public MovieRecommender() {
    }

}
```

`@Autowired`，`@Inject`，`@Resource`和`@Value`注解由Spring `BeanPostProcessor`实现处理，这意味着您不能在您自己的`BeanPostProcessor`或`BeanFactoryPostProcessor`类型（如果有）中应用这些注释。 这些类型必须通过`XML`或使用Spring `@Bean`方法声明。

### Primary

由于按类型自动装配可能会导致多个候选人，因此通常需要对选择过程有更多的控制权。 一种方法是使用Spring的`@Primary`注解。 `@Primary`表示当多个bean可以被自动装配成单值依赖项时，应该给予一个特定的bean优先。 如果候选人中只有一个`primary` bean，它将是自动装配的值。

```java
@Configuration
public class MovieConfiguration {

    @Bean
    @Primary
    public MovieCatalog firstMovieCatalog() { ... }

    @Bean
    public MovieCatalog secondMovieCatalog() { ... }

}
```

```java
public class MovieRecommender {

    @Autowired
    private MovieCatalog movieCatalog;

}
```

### Qualifiers

您可以将`qualifiers`与特定参数相关联，缩小匹配类型的集合，以便为每个参数选择特定的bean

```java
public class MovieRecommender {

    @Autowired
    @Qualifier("main")
    private MovieCatalog movieCatalog;

}
```

`@Qualifier`注解也可以在单独的构造函数参数或方法参数中指定：

```java
public class MovieRecommender {

    private MovieCatalog movieCatalog;

    private CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    public void prepare(@Qualifier("main")MovieCatalog movieCatalog,
            CustomerPreferenceDao customerPreferenceDao) {
        this.movieCatalog = movieCatalog;
        this.customerPreferenceDao = customerPreferenceDao;
    }

}
```

### 使用泛型作为自动装配限定符

除了`@Qualifier`注释之外，还可以使用Java通用类型作为隐式的限定条件。 例如，假设您有以下配置：

```java
@Configuration
public class MyConfiguration {

    @Bean
    public StringStore stringStore() {
        return new StringStore();
    }

    @Bean
    public IntegerStore integerStore() {
        return new IntegerStore();
    }
}
```

假设上面的Bean实现了一个通用接口，即`Store <String>`和Store `<Integer>`，您可以`@Autowire` Store接口并且泛型将用作限定符：

```java
@Autowired
private Store<String> s1; // <String> qualifier, injects the stringStore bean

@Autowired
private Store<Integer> s2; // <Integer> qualifier, injects the integerStore bean
```

自动装配列表，Map和List时也适用通用限定符：

```java
// 只要具有<Integer>泛型，就可以注入所有Store Bean
// Store<String> 不会出现在列表中
@Autowired
private List<Store<Integer>> s;
```

如果`@Qualifier`注解中没有指定限定名称,`spring`会指定`bean`的id作为限定名称.需要注意的是,`@Autowired`注解是先匹配所有的类型,然后再根据 `@Qualifier`选定具体的`bean`的,不要以为我们可以直接通过限定名就可以自动注入.

`@Qualifier`注解也可以使用在集合上,这种情况下,所有匹配的bean会被注入.

注入点上的`@Qualifier`注解不是必须的,spring在注入的时候如果发现有很多匹配项,会使用参数的名称作为限定值.

JSR-250 `@Resource`注解是完全根据限定名来匹配的,不管注入的类型是否和需要的一致.

`@Autowired`适用于字段，构造函数和多参数方法，允许在参数级别缩小限定范围。 相比之下，`@Resource`仅支持`field`和具有单个参数的`setter`方法。 因此，如果注射目标是构造函数或多参数方法，则应该使用`@Qualifier`。

您可以创建自定义限定符注解。 如以下示例所示：

```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Qualifier
public @interface Genre {

    String value();
}
```

下面的代码告诉你如何使用:

```java
public class MovieRecommender {

    @Autowired
    @Genre("Action")
    private MovieCatalog actionCatalog;

    private MovieCatalog comedyCatalog;

    @Autowired
    public void setComedyCatalog(@Genre("Comedy") MovieCatalog comedyCatalog) {
        this.comedyCatalog = comedyCatalog;
    }
}
```

### 使用CustomAutowireConfigurer

`CustomAutowireConfigurer`是一个`BeanFactoryPostProcessor`，它允许您注册自己的自定义限定符注释类型，即使它们没有使用Spring的`@Qualifier`进行注释。 以下示例显示如何使用`CustomAutowireConfigurer`：

```java
<bean id="customAutowireConfigurer"
        class="org.springframework.beans.factory.annotation.CustomAutowireConfigurer">
    <property name="customQualifierTypes">
        <set>
            <value>example.CustomQualifier</value>
        </set>
    </property>
</bean>
```

`AutowireCandidateResolver`通过以下方式确定`autowire`候选者：

*  每个bean定义的autowire-candidate值 . `<beans />`元素上可用的任何`default-autowire`候选模式 . 
* 存在`@Qualifier`注释以及使用`CustomAutowireConfigurer`注册的任何自定义注释

当多个bean有资格作为autowire候选者时，`primary`的确定如下：如果候选者中只有一个bean定义的`primary`属性设置为true，则选择它。

### 使用@Resource注解

`@Resource`采用name属性。 默认情况下，Spring将该值解释为要注入的bean名称。 换句话说，它遵循按名称语义，如以下示例所示：

```java
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Resource(name="myMovieFinder")
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }
}
```

如果未明确指定名称，则默认名称是从字段名称或setter方法派生的。 如果是字段，则采用属性名称。 在setter方法的情况下，它采用bean属性名称。

`@Resource`先根据名称匹配,匹配不到再根据类型选择。

### 使用@PostConstruct和@PreDestroy

`CommonAnnotationBeanPostProcessor`不仅识别`@Resource`注释，还识别JSR-250生命周期注释：`javax.annotation.PostConstruct`和`javax.annotation.PreDestroy`。

```java
public class CachingMovieLister {

    @PostConstruct
    public void populateMovieCache() {
        // populates the movie cache upon initialization...
    }

    @PreDestroy
    public void clearMovieCache() {
        // clears the movie cache upon destruction...
    }
}
```

## 类路径扫描和组件管理

### @Component

`@Component` 是任何Spring管理组件的通用构造型。 `@Repository` ，` @Service` 和` @Controller` 是 `@Component`的特例化,作用是一样的,之所以这么做,是为了更好的区分组件.

### 使用元注解和注解组合

Spring提供的许多注解都可以在您自己的代码中用作元注解。 元注解是可以应用于另一个注解的注解。 例如，前面提到的`@Service`注解是使用`@Component`进行元注解的，如下例所示：

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Component
public @interface Service {

    // ....
}
```

您还可以创建组合注释。 例如，Spring MVC的`@RestController`注释由`@Controller`和`@ResponseBody`组成。

此外，组合注解可以选择从元注解重新声明属性以允许自定义。 当您只想公开元注解属性的子集时，这可能特别有用。 例如，Spring的`@SessionScope`注释将范围名称硬编码到`session`，但仍允许自定义`proxyMode`。 以下清单显示了`SessionScope`批注的定义：

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Scope(WebApplicationContext.SCOPE_SESSION)
public @interface SessionScope {

    /**
     * Alias for {@link Scope#proxyMode}.
     * <p>Defaults to {@link ScopedProxyMode#TARGET_CLASS}.
     */
    @AliasFor(annotation = Scope.class)
    ScopedProxyMode proxyMode() default ScopedProxyMode.TARGET_CLASS;

}
```

### 自动检测类并注册成Bean

spring可以自动检测被这些注解批注的类,并注册成容器管理的bean,例如:

```java
@Service
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Autowired
    public SimpleMovieLister(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }
}
@Repository
public class JpaMovieFinder implements MovieFinder {
    // implementation elided for clarity
}
```

要自动检测这些类并注册相应的bean，需要将`@ComponentScan`添加到`@Configuration`类，其中`basePackages`属性指定扫描的弗包。 （逗号或分号或空格分隔列表。）

```java
@Configuration
@ComponentScan(basePackages = "org.example")
public class AppConfig  {
    ...
}
```

此外，使用`component-scan`元素时，将隐式包含`AutowiredAnnotationBeanPostProcessor`和`CommonAnnotationBeanPostProcessor`。

### 使用过滤器自定义扫描

默认情况下，使用`@Component`，`@Repository`，`@Service`，`@Controller`注释的类或者基于上面的注解扩展的注解会被扫描然后注册成`Bean`。 但是，您可以通过应用自定义筛选器来修改和扩展此行为。`@ComponentScan`注释的`includeFilters`或`excludeFilters`参数来包含和排除. 每个`filter`元素都需要`type`和`expression`属性。 下表介绍了筛选选项：

| 类型                 | 示例表达式                 | 描述                 |
| :------------------- | :------------------------- | :------------------- |
| annotation (default) | org.example.SomeAnnotation | 出现在目标类上的注解 |
| assignable           | org.example.SomeClass      |                      |
| aspectj              | org.example..*Service+     |                      |
| regex                | org\.example\.Default.*    |                      |
| custom               | org.example.MyTypeFilter   |                      |

```java
@Configuration
@ComponentScan(basePackages = "org.example",
        includeFilters = @Filter(type = FilterType.REGEX, pattern = ".*Stub.*Repository"),
        excludeFilters = @Filter(Repository.class))
public class AppConfig {
    ...
}
```

### 在组件中定义Bean元数据

Spring组件还可以向容器提供`bean`定义元数据。 您可以使用`@Bean`注释来执行此操作。 以下示例显示了如何执行此操作：

```java
@Component
public class FactoryMethodComponent {

    @Bean
    @Qualifier("public")
    public TestBean publicInstance() {
        return new TestBean("publicInstance");
    }

    public void doWork() {
        // Component method implementation omitted
    }
}
@Component
public class FactoryMethodComponent {

    private static int i;

    @Bean
    @Qualifier("public")
    public TestBean publicInstance() {
        return new TestBean("publicInstance");
    }

    // use of a custom qualifier and autowiring of method parameters
    @Bean
    protected TestBean protectedInstance(
            @Qualifier("public") TestBean spouse,
            @Value("#{privateInstance.age}") String country) {
        TestBean tb = new TestBean("protectedInstance", 1);
        tb.setSpouse(spouse);
        tb.setCountry(country);
        return tb;
    }

    @Bean
    private TestBean privateInstance() {
        return new TestBean("privateInstance", i++);
    }

    @Bean
    @RequestScope
    public TestBean requestScopedInstance() {
        return new TestBean("requestScopedInstance", 3);
    }
}
```

### 被扫描到的Bean的命名规范

当组件被扫描到后,注册到bean容器中的名称由`BeanNameGenerator `策略提供支持,默认情况下,`@Component`, `@Repository`, `@Service`和 `@Controller`注解都受此规范约束.我们通过列子来做说明:

```java
@Repository
public class MovieFinderImpl implements MovieFinder {
    // ...
}
```

生成的`bean`名称是类名名称,但是首字母小写,例如上面的类生成的`bean`名称是`movieFinderImpl`

我们可以在注解上自定义该名称,例如:

```java
@Service("myMovieLister")
public class SimpleMovieLister {
    // ...
}
```

如果您不想依赖默认的bean命名策略，则可以提供自定义bean命名策略。 首先，实现`BeanNameGenerator`接口，并确保包含默认的无参数构造函数。 然后，在配置扫描程序时提供完全限定的类名，如以下示例注释和bean定义所示：

```java
@Configuration
@ComponentScan(basePackages = "org.example", nameGenerator = MyNameGenerator.class)
public class AppConfig {
    ...
}
```

> 需要注意的是,如果两个类的名称相同, spring容器在注入的时候就会出错,你可以通过注解分别给两个类指定不同的bean名称来避免

### 给自动扫描的注解指定scope

与Spring管理的组件一样，自动检测组件的默认和最常见的范围是 `singleton`。 但是，有时您需要一个可由`@Scope`注解指定的不同范围。 您可以在注释中提供范围的名称，如以下示例所示：

```java
@Scope("prototype")
@Repository
public class MovieFinderImpl implements MovieFinder {
    // ...
}
```

要为范围解析提供自定义策略而不是依赖基于注释的方法，可以实现`ScopeMetadataResolver`接口。 请确保包含默认的无参数构造函数。 然后，您可以在配置扫描程序时提供完全限定的类名，因为以下注释和bean定义示例显示：

```java
@Configuration
@ComponentScan(basePackages = "org.example", scopeResolver = MyScopeResolver.class)
public class AppConfig {
    ...
}
```

使用某些非单例作用域时，可能需要为作用域对象生成代理。 `component-scan`元素上提供了`scoped-proxy`属性。 三个可能的值是：`no`，`interfaces`和`targetClass`。 例如，以下配置是标准的JDK动态代理：

```java
@Configuration
@ComponentScan(basePackages = "org.example", scopedProxy = ScopedProxyMode.INTERFACES)
public class AppConfig {
    ...
}
```

### 给自动扫描的bean提供Qualifier

```java
@Component
@Qualifier("Action")
public class ActionMovieCatalog implements MovieCatalog {
    // ...
}
@Component
@Genre("Action")
public class ActionMovieCatalog implements MovieCatalog {
    // ...
}
@Component
@Offline
public class CachingMovieCatalog implements MovieCatalog {
    // ...
}
```

### 组件索引

虽然类路径扫描速度非常快，但可以通过在编译时创建候选的静态列表来提高大型应用程序的启动性能。 在此模式下，所有作为组件扫描目标的模块都必须使用此机制。

使用该特性,需要添加依赖:

```shell
dependencies {
    annotationProcessor "org.springframework:spring-context-indexer:5.1.9.RELEASE"
}
```

该过程生成的索引文件,包含在jar文件中的`META-INF/spring.components`文件。

在类路径上找到`META-INF/spring.components`时，将自动启用索引。 如果索引部分可用于某些库（或用例）但无法为整个应用程序构建，则可以通过将`spring.index.ignore`设置`true`,回退到常规类路径.

## 使用JSR 330标准注解

要使用这些注解,需要先引入jar包:

```java
<dependency>
    <groupId>javax.inject</groupId>
    <artifactId>javax.inject</artifactId>
    <version>1</version>
</dependency>
```

### 使用@Inject和@Named进行依赖注入

除了使用`@Autowired`,你还可以使用`@javax.inject.Inject`进行依赖注入,例如:

```java
import javax.inject.Inject;

public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    public void listMovies() {
        this.movieFinder.findMovies(...);
        ...
    }
}
```

你可以使用`@Inject`在字段级别,方法级别,构造参数级别.此外，您可以将注入点声明为`Provider`，允许按需访问较短范围的`bean`或通过`Provider.get`调用对其他bean的延迟访问。 以下示例提供了上述示例的变体：

```java
import javax.inject.Inject;
import javax.inject.Provider;

public class SimpleMovieLister {

    private Provider<MovieFinder> movieFinder;

    @Inject
    public void setMovieFinder(Provider<MovieFinder> movieFinder) {
        this.movieFinder = movieFinder;
    }

    public void listMovies() {
        this.movieFinder.get().findMovies(...);
        ...
    }
}
```

如果你想为注入的依赖指定限定名称,你应该使用`@Name`注解,例如:

```java
import javax.inject.Inject;
import javax.inject.Named;

public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(@Named("main") MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...
}
```

与`@Autowired`一样，`@Inject`也可以与`java.util.Optional`或`@Nullable`一起使用。 这在这里更适用，因为`@Inject`没有`requied`的属性。 以下一对示例显示了如何使用`@Inject`和`@Nullable`：

```java
public class SimpleMovieLister {

    @Inject
    public void setMovieFinder(Optional<MovieFinder> movieFinder) {
        ...
    }
}
```

```java
public class SimpleMovieLister {

    @Inject
    public void setMovieFinder(@Nullable MovieFinder movieFinder) {
        ...
    }
}
```

### `@Named` and `@ManagedBean`:

等价于`@Component`注解

```java
import javax.inject.Inject;
import javax.inject.Named;

@Named("movieListener")  // @ManagedBean("movieListener") could be used as well
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...
}
```

在不指定组件名称的情况下使用`@Component`是很常见的。 `@Named`可以以类似的方式使用，如下例所示：

```java
import javax.inject.Inject;
import javax.inject.Named;

@Named
public class SimpleMovieLister {

    private MovieFinder movieFinder;

    @Inject
    public void setMovieFinder(MovieFinder movieFinder) {
        this.movieFinder = movieFinder;
    }

    // ...
}
```

使用`@Named`或`@ManagedBean`时，可以使用与使用Spring注释时完全相同的方式使用组件扫描，如以下示例所示：

```java
@Configuration
@ComponentScan(basePackages = "org.example")
public class AppConfig  {
    ...
}
```

### JSR-330注解的局限性

| spring注解          | jdk注解               | 局限                                                         |
| :------------------ | --------------------- | :----------------------------------------------------------- |
| @Autowired          | @Inject               | @Inject注解没有required属性,可以通过使用java8的Optional代替  |
| @Component          | @Named / @ManagedBean | 不能用于注解组合                                             |
| @Scope("singleton") | @Singleton            | JSR303默认的scope是prototype,为了与spring保持一致,spring应用中默认是单例 |
| @Qualifier          | @Qualifier / @Named   | javax.inject.Qualifier只是构建自定义限定符的元注释。 具体字符串限定符（如Spring的带有值的@Qualifier）可以通过javax.inject.Named关联。 |
| @Value              | -                     |                                                              |
| @Required           | -                     |                                                              |
| @Lazy               | -                     |                                                              |
| ObjectFactory       | Provider              | javax.inject.Provider是Spring的ObjectFactory的直接替代品，只有更短的get（）方法名称。 它也可以与Spring的@Autowired结合使用，也可以与非注释的构造函数和setter方法结合使用。 |

## 基于java代码的容器配置

### @Bean和@Configuration

`@Bean`注解的方法主要用来构建spring容器管理的`bean`,可以在该方法内配置bean.被bean注释的方法所在的类可以被`@Component`注解,但是一般是被`@Configuration`注解.

`@Configuration`注解来用来表明该类是配置类,此外，`@Configuration`类允许通过调用同一个类中的其他`@Bean`方法来定义bean间依赖关系。下面是一个简单的例子:

```java
@Configuration
public class AppConfig {

    @Bean
    public MyService myService() {
        return new MyServiceImpl();
    }
}
```

**Full @Configuration vs “lite” @Bean mode?**

如果`@Bean`注解的方法所在类没有被`@Configuration`注解,被称为 `lite模式`, 例如声明在`@Component`注解的类.这种模式下,不能使用`@Bean`注解的方法作为依赖。

在常见的场景中，`@Bean`方法将在`@Configuration`类中声明，确保始终使用“full”模式，并因此将交叉方法引用重定向到容器的生命周期管理。 这可以防止通过常规Java调用意外地调用相同的@Bean方法，这有助于减少在“lite”模式下操作时难以跟踪的细微错误。

### 使用AnnotationConfigApplicationContext实例化容器

这个多功能的`ApplicationContext`实现不仅能够接受`@Configuration`类作为输入，还能接受使用JSR-330元数据注解和`@Component`注解的类。

当`@Configuration`类作为输入提供时，`@Consfiguration`类本身被注册为bean定义，并且类中所有声明的`@Bean`方法也被注册为`bean`定义。

当提供`@Component`和JSR-330类时，它们被注册为bean定义，并且假设该类的实例需要依赖注入。

#### 简单的使用

```java
public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
    MyService myService = ctx.getBean(MyService.class);
    myService.doStuff();
}
```

如前所述，`AnnotationConfigApplicationContext`不限于使用`@Configuration`类。 任何`@Component`或JSR-330带注释的类都可以作为输入提供给构造函数，如以下示例所示：

```java
public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(MyServiceImpl.class, Dependency1.class, Dependency2.class);
    MyService myService = ctx.getBean(MyService.class);
    myService.doStuff();
}
```

#### 使用register(Class<?>…)构建容器

您可以使用no-arg构造函数实例化`AnnotationConfigApplicationContext`，然后使用`register`方法对其进行配置。 在以编程方式构建`AnnotationConfigApplicationContext`时，此方法特别有用。 以下示例显示了如何执行此操作：

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
    ctx.register(AppConfig.class, OtherConfig.class);
    ctx.register(AdditionalConfig.class);
    ctx.refresh();
    MyService myService = ctx.getBean(MyService.class);
    myService.doStuff();
}
```

#### 使用scan(String…)启用组件扫描

```java
public static void main(String[] args) {
    AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
    ctx.scan("com.acme");
    ctx.refresh();
    MyService myService = ctx.getBean(MyService.class);
}
```

#### 使用AnnotationConfigWebApplicationContext开启web支持

`AnnotationConfigWebApplicationContext`提供了对web的支持,配置Spring `ContextLoaderListener `servlet侦听器，Spring MVC `DispatcherServlet`等时，可以使用此实现。 以下web.xml代码段配置典型的Spring MVC Web应用程序（请注意`contextClass ``context-param`和`init-param`的使用）：

```xml
<web-app>
    <!-- Configure ContextLoaderListener to use AnnotationConfigWebApplicationContext
        instead of the default XmlWebApplicationContext -->
    <context-param>
        <param-name>contextClass</param-name>
        <param-value>
            org.springframework.web.context.support.AnnotationConfigWebApplicationContext
        </param-value>
    </context-param>

    <!-- Configuration locations must consist of one or more comma- or space-delimited
        fully-qualified @Configuration classes. Fully-qualified packages may also be
        specified for component-scanning -->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>com.acme.AppConfig</param-value>
    </context-param>

    <!-- Bootstrap the root application context as usual using ContextLoaderListener -->
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!-- Declare a Spring MVC DispatcherServlet as usual -->
    <servlet>
        <servlet-name>dispatcher</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!-- Configure DispatcherServlet to use AnnotationConfigWebApplicationContext
            instead of the default XmlWebApplicationContext -->
        <init-param>
            <param-name>contextClass</param-name>
            <param-value>
                org.springframework.web.context.support.AnnotationConfigWebApplicationContext
            </param-value>
        </init-param>
        <!-- Again, config locations must consist of one or more comma- or space-delimited
            and fully-qualified @Configuration classes -->
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>com.acme.web.MvcConfig</param-value>
        </init-param>
    </servlet>

    <!-- map all requests for /app/* to the dispatcher servlet -->
    <servlet-mapping>
        <servlet-name>dispatcher</servlet-name>
        <url-pattern>/app/*</url-pattern>
    </servlet-mapping>
</web-app>
```

### 使用@Bean注解

#### 声明bean

要声明`bean`，可以使用`@Bean`批注对方法进行批注。 方法的返回值是注册`bean`的类型。 默认情况下，`bean`名称与方法名称相同。 以下示例显示了`@Bean`方法声明：

```java
@Configuration
public class AppConfig {

    @Bean
    public TransferServiceImpl transferService() {
        return new TransferServiceImpl();
    }
}
```

#### bean依赖

`@Bean-annotated`方法可以有任意数量的参数来描述构建该bean所需的依赖项。 例如，如果我们的`TransferService`需要`AccountRepository`，我们可以使用方法参数来实现该依赖关系，如以下示例所示：

```java
@Configuration
public class AppConfig {

    @Bean
    public TransferService transferService(AccountRepository accountRepository) {
        return new TransferServiceImpl(accountRepository);
    }
}
```

#### 生命周期回调

```java
public class BeanOne {

    public void init() {
        // initialization logic
    }
}

public class BeanTwo {

    public void cleanup() {
        // destruction logic
    }
}

@Configuration
public class AppConfig {

    @Bean(initMethod = "init")
    public BeanOne beanOne() {
        return new BeanOne();
    }

    @Bean(destroyMethod = "cleanup")
    public BeanTwo beanTwo() {
        return new BeanTwo();
    }
}
```

对于前面注释中上面示例中的`BeanOne`，在构造期间直接调用`init`方法同样有效，如下例所示：

```java
@Configuration
public class AppConfig {

    @Bean
    public BeanOne beanOne() {
        BeanOne beanOne = new BeanOne();
        beanOne.init();
        return beanOne;
    }

    // ...
}
```

#### 指定bean的scope

默认范围是单例，但您可以使用`@Scope`批注覆盖它，如以下示例所示：

```java
@Configuration
public class MyConfiguration {

    @Bean
    @Scope("prototype")
    public Encryptor encryptor() {
        // ...
    }
}
```

使用`@Scope`上的`proxyMode`属性可以设置代理模式。 默认值为无代理（`ScopedProxyMode.NO`），但您可以指定`ScopedProxyMode.TARGET_CLASS`或`ScopedProxyMode.INTERFACES`。

#### 自定义bean的名称

默认情况下，配置类使用`@Bean`方法的名称作为结果bean的名称。 但是，可以使用name属性覆盖此功能，如以下示例所示：

```java
@Configuration
public class AppConfig {

    @Bean(name = "myThing")
    public Thing thing() {
        return new Thing();
    }
}
```

#### bean别名

正如Naming Beans中所讨论的，有时需要为单个bean提供多个名称，也称为bean别名。` @Bean`批注的`name`属性为此接受`String`数组。 以下示例显示如何为bean设置多个别名：

```java
@Configuration
public class AppConfig {

    @Bean({"dataSource", "subsystemA-dataSource", "subsystemB-dataSource"})
    public DataSource dataSource() {
        // instantiate, configure and return DataSource bean...
    }
}
```

####  Bean 描述

有时，提供更详细的bean文本描述会很有帮助。 当bean（可能通过JMX）进行监视时，这可能特别有用。

```java
@Configuration
public class AppConfig {

    @Bean
    @Description("Provides a basic example of a bean")
    public Thing thing() {
        return new Thing();
    }
}
```

### 使用@Configuration注解

#### bean依赖

当bean彼此依赖时，表达该依赖关系就像让一个bean方法调用另一个bean一样简单，如下例所示：

```java
@Configuration
public class AppConfig {

    @Bean
    public BeanOne beanOne() {
        return new BeanOne(beanTwo());
    }

    @Bean
    public BeanTwo beanTwo() {
        return new BeanTwo();
    }
}
```

#### Lookup Method Injection

Lookup Method Injection是一项很少使用的高级功能,一般用于一个单例bean依赖多例bean.我们来看使用示例:

```java
public abstract class CommandManager {
    public Object process(Object commandState) {
        // grab a new instance of the appropriate Command interface
        Command command = createCommand();
        // set the state on the (hopefully brand new) Command instance
        command.setState(commandState);
        return command.execute();
    }

    // okay... but where is the implementation of this method?
    protected abstract Command createCommand();
}
```

通过使用Java配置，您可以创建`CommandManager`的子类，其中抽象的`createCommand`方法被覆盖，以便查找新的（原型）命令对象。 以下示例显示了如何执行此操作：

```java
@Bean
@Scope("prototype")
public AsyncCommand asyncCommand() {
    AsyncCommand command = new AsyncCommand();
    // inject dependencies here as required
    return command;
}

@Bean
public CommandManager commandManager() {
    // return new anonymous implementation of CommandManager with createCommand()
    // overridden to return a new prototype Command object
    return new CommandManager() {
        protected Command createCommand() {
            return asyncCommand();
        }
    }
}
```

考虑以下示例，其中显示了一个@Bean注释的方法被调用两次：

```java
@Configuration
public class AppConfig {

	@Bean
	public ClientService clientService1() {
		ClientServiceImpl clientService = new ClientServiceImpl();
		clientService.setClientDao(clientDao());
		return clientService;
	}

	@Bean
	public ClientService clientService2() {
		ClientServiceImpl clientService = new ClientServiceImpl();
		clientService.setClientDao(clientDao());
		return clientService;
	}

	@Bean
	public ClientDao clientDao() {
		return new ClientDaoImpl();
	}
}
```

在`clientService1`和`clientService2`中分别调用了一次`clientDao`。由于此方法创建`ClientDaoImpl`的一个新实例并返回它，因此通常需要两个实例（每个服务一个）。这肯定会有问题：在Spring中，实例化的bean默认有一个singleton作用域。这就是神奇之处：所有`@Configuration`类在启动时都使用`CGLIB`进行子类化。在子类中，子方法在调用父方法并创建新实例之前，首先检查容器中是否有任何缓存（作用域）的bean。

> 没有必要将`CGLIB`添加到类路径中，因为`CGLIB`类在`org.springframework.CGLIB`包下，并直接包含在`spring-core.jar` 中。

由于`CGLIB`在启动时动态添加功能，因此存在一些限制。特别是，配置类不能是`final`类。但是，配置类上允许使用任何构造函数，包括使用`@Autowired`或单个非默认构造函数声明进行默认注入。

如果您希望避免任何`CGLIB`强加的限制，请考虑在非`@Configuration`类上声明您的`@Bean`方法（例如，改为在普通的`@Component`类上），或者用`@Configuration(proxyBeanMethods=false)`注释您的配置类。`@Bean`方法之间的跨方法调用不会被拦截，因此您必须完全依赖于构造函数或方法级别的依赖注入。













### 组合使用

#### 使用@Import注解

就像在Spring XML文件中使用`<import />`元素来帮助模块化配置一样，`@Immort`注释允许从另一个配置类加载`@Bean`定义，如下例所示：

```java
@Configuration
public class ConfigA {

    @Bean
    public A a() {
        return new A();
    }
}

@Configuration
@Import(ConfigA.class)
public class ConfigB {

    @Bean
    public B b() {
        return new B();
    }
}
```

现在，在实例化上下文时，不需要同时指定ConfigA.class和ConfigB.class，只需要显式提供ConfigB，如下例所示：

```java
public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(ConfigB.class);

    // now both beans A and B will be available...
    A a = ctx.getBean(A.class);
    B b = ctx.getBean(B.class);
}
```

> 从Spring Framework 4.2开始，`@Immort`还支持引用常规组件类，类似于`AnnotationConfigApplicationContext.register`方法。 如果要避免组件扫描，这一点特别有用，可以使用一些配置类作为明确定义所有组件的入口点。

前面的例子有效，但很简单。 在大多数实际情况中，bean跨配置类彼此依赖。 使用XML时，这不是问题，因为不涉及编译器，您可以声明`ref ="someBean"`。 使用`@Configuration`类时，Java编译器会对配置模型施加约束，因为对其他`bean`的引用必须是有效的`Java`语法。

幸运的是，解决这个问题很简单。 正如我们已经讨论过的，`@Bean`方法可以有任意数量的参数来描述bean的依赖关系。 考虑以下更多真实场景，其中包含几个`@Configuration`类，每个类都依赖于在其他类中声明的bean：

```java
@Configuration
public class ServiceConfig {

    @Bean
    public TransferService transferService(AccountRepository accountRepository) {
        return new TransferServiceImpl(accountRepository);
    }
}

@Configuration
public class RepositoryConfig {

    @Bean
    public AccountRepository accountRepository(DataSource dataSource) {
        return new JdbcAccountRepository(dataSource);
    }
}

@Configuration
@Import({ServiceConfig.class, RepositoryConfig.class})
public class SystemTestConfig {

    @Bean
    public DataSource dataSource() {
        // return new DataSource
    }
}

public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(SystemTestConfig.class);
    // everything wires up across configuration classes...
    TransferService transferService = ctx.getBean(TransferService.class);
    transferService.transfer(100.00, "A123", "C456");
}
```

还有另一种方法可以达到相同的效果。 请记住，`@Configuration`类最终只是容器中的另一个bean：这意味着它们可以利用`@Autowired`和`@Value`注入以及与任何其他bean相同的其他功能。如下面的例子:

```java
@Configuration
public class ServiceConfig {

    @Autowired
    private AccountRepository accountRepository;

    @Bean
    public TransferService transferService() {
        return new TransferServiceImpl(accountRepository);
    }
}

@Configuration
public class RepositoryConfig {

    private final DataSource dataSource;

    @Autowired
    public RepositoryConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Bean
    public AccountRepository accountRepository() {
        return new JdbcAccountRepository(dataSource);
    }
}

@Configuration
@Import({ServiceConfig.class, RepositoryConfig.class})
public class SystemTestConfig {

    @Bean
    public DataSource dataSource() {
        // return new DataSource
    }
}

public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(SystemTestConfig.class);
    // everything wires up across configuration classes...
    TransferService transferService = ctx.getBean(TransferService.class);
    transferService.transfer(100.00, "A123", "C456");
}
```

在前面的场景中，使用`@Autowired`可以很好地工作并提供所需的模块化，但确定声明自动装配的bean定义的确切位置仍然有些模棱两可。 例如，作为一名查看`ServiceConfig`的开发人员，您如何确切地知道`@Autowired AccountRepository `bean的声明位置？

```java
@Configuration
public class ServiceConfig {

    @Autowired
    private RepositoryConfig repositoryConfig;

    @Bean
    public TransferService transferService() {
        // navigate 'through' the config class to the @Bean method!
        return new TransferServiceImpl(repositoryConfig.accountRepository());
    }
}
```

在前面的情况中，定义`AccountRepository`是完全明确的。 但是，`ServiceConfig`现在与`RepositoryConfig`紧密耦合。 通过使用基于接口的或基于类的抽象`@Configuration`类，可以在某种程度上减轻这种紧密耦合。 请考虑以下示例：

```java
@Configuration
public class ServiceConfig {

    @Autowired
    private RepositoryConfig repositoryConfig;

    @Bean
    public TransferService transferService() {
        return new TransferServiceImpl(repositoryConfig.accountRepository());
    }
}

@Configuration
public interface RepositoryConfig {

    @Bean
    AccountRepository accountRepository();
}

@Configuration
public class DefaultRepositoryConfig implements RepositoryConfig {

    @Bean
    public AccountRepository accountRepository() {
        return new JdbcAccountRepository(...);
    }
}

@Configuration
@Import({ServiceConfig.class, DefaultRepositoryConfig.class})  // import the concrete config!
public class SystemTestConfig {

    @Bean
    public DataSource dataSource() {
        // return DataSource
    }

}

public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(SystemTestConfig.class);
    TransferService transferService = ctx.getBean(TransferService.class);
    transferService.transfer(100.00, "A123", "C456");
}
```

#### 有条件地包含@Configuration类或@Bean方法

有的时候，有条件地启用或禁用完整的`@Configuration`类甚至单个`@Bean`方法通常很有用。 一个常见的例子是，使用`@Profile`注释来激活bean。

`@Profile`注释实际上是通过使用更灵活的注释`@Conditional`实现的。 `@Conditional`注释表示在注册`@Bean`之前应该参考特定`org.springframework.context.annotation.Condition`的实现。

`Condition`接口的实现提供了一个返回`true`或`false`的`matches`方法。 例如，以下列表显示了用于`@Profile`的实际`Condition`实现：

```java
@Override
public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
    if (context.getEnvironment() != null) {
        // Read the @Profile annotation attributes
        MultiValueMap<String, Object> attrs = metadata.getAllAnnotationAttributes(Profile.class.getName());
        if (attrs != null) {
            for (Object value : attrs.get("value")) {
                if (context.getEnvironment().acceptsProfiles(((String[]) value))) {
                    return true;
                }
            }
            return false;
        }
    }
    return true;
}
```

#### 配置方式混合使用

##### xml为主,兼用@Configuration 配置的类

**将@Configuration类声明为普通的Spring `<bean />`元素**

请记住，`@Configuration`类最终是容器中的bean定义。 在本系列示例中，我们创建一个名为`AppConfig`的`@Configuration`类，并将其作为`<bean />`定义包含在`system-test-config.xml`中。 由于`<context：annotation-config />`已打开，容器会识别`@Configuration`批注并正确处理`AppConfig`中声明的`@Bean`方法。

```java
@Configuration
public class AppConfig {

    @Autowired
    private DataSource dataSource;

    @Bean
    public AccountRepository accountRepository() {
        return new JdbcAccountRepository(dataSource);
    }

    @Bean
    public TransferService transferService() {
        return new TransferService(accountRepository());
    }
}
```

```xml
<beans>
    <!-- enable processing of annotations such as @Autowired and @Configuration -->
    <context:annotation-config/>
    <context:property-placeholder location="classpath:/com/acme/jdbc.properties"/>

    <bean class="com.acme.AppConfig"/>

    <bean class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>
</beans>
```

```java
public static void main(String[] args) {
    ApplicationContext ctx = new ClassPathXmlApplicationContext("classpath:/com/acme/system-test-config.xml");
    TransferService transferService = ctx.getBean(TransferService.class);
    // ...
}
```

**使用`<context：component-scan />`来获取@Configuration类**

因为`@Configuration`是使用`@Component`进行元注释的，所以`@Configuration-annotated`类自动成为组件扫描的候选者。 使用与前一个示例中描述的相同的方案，我们可以重新定义`system-test-config.xml`以利用组件扫描。 请注意，在这种情况下，我们不需要显式声明`<context：annotation-config />`，因为`<context：component-scan />`启用相同的功能:

```xml
<beans>
    <!-- picks up and registers AppConfig as a bean definition -->
    <context:component-scan base-package="com.acme"/>
    <context:property-placeholder location="classpath:/com/acme/jdbc.properties"/>

    <bean class="org.springframework.jdbc.datasource.DriverManagerDataSource">
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>
</beans>
```

**@Configuration为主,兼用XML**

```java
@Configuration
@ImportResource("classpath:/com/acme/properties-config.xml")
public class AppConfig {

    @Value("${jdbc.url}")
    private String url;

    @Value("${jdbc.username}")
    private String username;

    @Value("${jdbc.password}")
    private String password;

    @Bean
    public DataSource dataSource() {
        return new DriverManagerDataSource(url, username, password);
    }
}
```

```xml
<beans>
    <context:property-placeholder location="classpath:/com/acme/jdbc.properties"/>
</beans>
```

```java
public static void main(String[] args) {
    ApplicationContext ctx = new AnnotationConfigApplicationContext(AppConfig.class);
    TransferService transferService = ctx.getBean(TransferService.class);
    // ...
}
```

## 环境抽象

`Environment`接口是集成在容器中的抽象，它模拟了应用程序环境的两个关键方面：配置文件和属性。

### 使用@Profile

`@Profile`注释允许您指示当一个或多个指定的配置文件处于活动状态时，组件符合注册条件。 使用前面的示例，我们可以重写`dataSource`配置，如下所示：

```java
@Configuration
@Profile("development")
public class StandaloneDataConfig {

    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.HSQL)
            .addScript("classpath:com/bank/config/sql/schema.sql")
            .addScript("classpath:com/bank/config/sql/test-data.sql")
            .build();
    }
}
@Configuration
@Profile("production")
public class JndiDataConfig {

    @Bean(destroyMethod="")
    public DataSource dataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
    }
}
```

value支持表达式:

1. `!`: A logical “not” of the profile
2. `&`: A logical “and” of the profiles
3. `|`: A logical “or” of the profiles

如果使用`@Profile`标记`@Configuration`类，则除非一个或多个指定的配置文件处于活动状态，否则将绕过与该类关联的所有`@Bean`方法和`@Import`注释。 如果使用`@Profile({"p1"，"p2"})`标记`@Component`或`@Configuration`类，则除非已激活配置文件`p1`或`p2`，否则不会注册或处理该类。 如果给定的配置文件以`NOT`运算符（`！`）作为前缀，则仅在配置文件未激活时才注册带注释的元素。 例如，给定`@Profile({"p1"，"！p2"})`，如果配置文件“p1”处于活动状态或配置文件“p2”未激活，则会进行注册。

@Profile是一个元注解

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Profile("production")
public @interface Production {
}
```

prifle也可以被声明在方法级别:

```java
@Configuration
public class AppConfig {

    @Bean("dataSource")
    @Profile("development")
    public DataSource standaloneDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.HSQL)
            .addScript("classpath:com/bank/config/sql/schema.sql")
            .addScript("classpath:com/bank/config/sql/test-data.sql")
            .build();
    }

    @Bean("dataSource")
    @Profile("production")
    public DataSource jndiDataSource() throws Exception {
        Context ctx = new InitialContext();
        return (DataSource) ctx.lookup("java:comp/env/jdbc/datasource");
    }
}
```

#### 激活Profile

激活配置文件可以通过多种方式完成，但最直接的方法是以编程方式对可通过`ApplicationContext`提供的`Environment `API进行操作。 以下示例显示了如何执行此操作：

```java
AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
ctx.getEnvironment().setActiveProfiles("development");
ctx.register(SomeConfig.class, StandaloneDataConfig.class, JndiDataConfig.class);
ctx.refresh();
```

此外，您还可以通过`spring.profiles.active`属性声明性地激活配置文件，该属性可以通过系统环境变量，JVM系统属性，web.xml中的servlet上下文参数或甚至作为JNDI中的条目来指定。 在集成测试中，可以使用spring-test模块中的`@ActiveProfiles`批注声明激活配置文件（请参阅具有环境配置文件的上下文配置）。

请注意，配置文件不是“either-or”命题。 您可以一次激活多个配置文件。 以编程方式，您可以为`setActiveProfiles`方法提供多个配置文件名称，该方法接受`String … varargs`。 以下示例激活多个配置文件：

```java
ctx.getEnvironment().setActiveProfiles("profile1", "profile2");
```

`spring.profiles.active`属性接受以逗号分隔的列表:

```shell
-Dspring.profiles.active="profile1,profile2"
```

#### 默认Profile

表示默认启用的配置文件。 请考虑以下示例：

```java
@Configuration
@Profile("default")
public class DefaultDataConfig {

    @Bean
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.HSQL)
            .addScript("classpath:com/bank/config/sql/schema.sql")
            .build();
    }
}
```

如果没有激活配置文件，则创建`dataSource`。 您可以将此视为一种为一个或多个bean提供默认定义的方法。 如果启用了任何配置文件，则默认配置文件不适用。

您可以使用环境上的`setDefaultProfiles`或声明性地使用`spring.profiles.default`属性更改默认配置文件的名称。

### PropertySource 抽象

Spring的`Environment`抽象通过可配置的属性源层次结构提供搜索操作。 请考虑以下列表：

```java
ApplicationContext ctx = new GenericApplicationContext();
Environment env = ctx.getEnvironment();
boolean containsMyProperty = env.containsProperty("my-property");
System.out.println("Does my environment contain the 'my-property' property? " + containsMyProperty);
```

在前面的代码片段中，我们看到了一种向Spring询问my-property属性是否为当前环境定义的高级方法。 要回答此问题，`Environment`对象会对一组`PropertySource`对象执行搜索。 `PropertySource`是对任何键值对源的简单抽象，Spring的`StandardEnvironment`配置有两个`PropertySource`对象 - 一个表示JVM系统属性集(`System.getProperties()`)，另一个表示系统环境变量集（`System.getenv()`）。

具体地说，当您使用`StandardEnvironment`时，如果在运行时存在my-property系统属性或my-property环境变量，则对env.containsProperty（“my-property”）的调用将返回true。

执行的搜索是分层的。 默认情况下，系统属性优先于环境变量。 因此，如果在调用env.getProperty（“my-property”）期间碰巧在两个位置都设置了my-property属性，则系统属性值“wins”并返回。 请注意，属性值不会合并，而是由前面的条目完全覆盖。

对于常见的`StandardServletEnvironment`，完整层次结构如下，优先级从高往下：

1. ServletConfig参数（如果适用 - 例如，在DispatcherServlet上下文的情况下）
2. ServletContext参数（web.xml context-param条目）
3. JNDI环境变量（java：comp / env / entries）
4. JVM系统属性（-D命令行参数）
5. JVM系统环境（操作系统环境变量）

最重要的是，整个机制是可配置的。 您可能希望将自定义的属性源集成到此搜索中。 为此，请实现并实例化您自己的`PropertySource`，并将其添加到当前`Environment`的`PropertySource`集合中。 以下示例显示了如何执行此操作：

```java
ConfigurableApplicationContext ctx = new GenericApplicationContext();
MutablePropertySources sources = ctx.getEnvironment().getPropertySources();
sources.addFirst(new MyPropertySource());
```

在上面的代码中，`MyPropertySource`在搜索中添加了最高优先级。 如果它包含`my-property`属性，则检测并返回该属性，以支持任何其他`PropertySource`中的任何`my-property`属性。 `MutablePropertySources `API公开了许多方法，允许精确操作属性源集。

### 使用@PropertySource

`@PropertySource`注释提供了一种方便的声明式机制，用于向Spring的环境添加`PropertySource`。

给定一个名为`app.properties`的文件，其中包含键值对`testbean.name = myTestBean`，以下`@Configuration`类使用`@PropertySource`，以便调用`testBean.getName`返回`myTestBean`：

```java
@Configuration
@PropertySource("classpath:/com/myco/app.properties")
public class AppConfig {

    @Autowired
    Environment env;

    @Bean
    public TestBean testBean() {
        TestBean testBean = new TestBean();
        testBean.setName(env.getProperty("testbean.name"));
        return testBean;
    }
}
```

`@PropertySource`资源位置中存在的任何`$ {…}`占位符将根据已针对环境注册的属性源集进行解析，如以下示例所示：

```java
@Configuration
@PropertySource("classpath:/com/${my.placeholder:default/path}/app.properties")
public class AppConfig {

    @Autowired
    Environment env;

    @Bean
    public TestBean testBean() {
        TestBean testBean = new TestBean();
        testBean.setName(env.getProperty("testbean.name"));
        return testBean;
    }
}
```

假设`my.placeholder`存在于已注册的其中一个属性源中（例如，系统属性或环境变量），则占位符将解析为相应的值。 如果不是，则`/path`用作默认值。 如果未指定缺省值且无法解析属性，则抛出`IllegalArgumentException`。

## 注册LoadTimeWeaver

Spring使用LoadTimeWeaver在将类加载到Java虚拟机（JVM）时动态转换类。要启用加载时织入，可以将@EnableLoadTimeWeaving添加到其中一个@Configuration类中，如以下示例所示：

```java
@Configuration
@EnableLoadTimeWeaving
public class AppConfig {
}
```

xml配置方式:

```xml
<beans>
    <context:load-time-weaver/>
</beans>
```

一旦为`ApplicationContext`配置，该`ApplicationContext`中的任何bean都可以实现`LoadTimeWeaverAware`，从而接收对load-time weaver实例的引用。 这与Spring的JPA支持结合使用特别有用，其中JPA类转换可能需要加载时织入。 有关更多详细信息，请参阅`LocalContainerEntityManagerFactoryBean `javadoc。 有关AspectJ加载时织入的更多信息，请参阅Spring Framework中使用AspectJ的加载时编织。

## ApplicationContext的附加功能

正如在章节介绍中讨论的那样，`org.springframework.beans.factory`包提供了用于管理和操作bean的基本功能，包括以编程的方式。`org.springframework.context`包添加了`ApplicationContext`接口，该接口扩展了`BeanFactory`接口，还扩展其他接口以提供更多应用程序框架导向风格的附加功能。许多人以完全声明的方式使用`ApplicationContext`，甚至没有以编程方式创建它，而是依赖支持类（如`ContextLoader`）自动实例化`ApplicationContext`，作为Java EE Web应用程序正常启动过程的一部分。

为了以更加面向框架的风格增强BeanFactory功能，上下文包还提供了以下功能：

- 通过`MessageSource`接口以i18n风格访问消息。
- 通过`ResourceLoader`接口访问资源，如URL和文件。
- 通过使用`ApplicationEventPublisher`接口将事件发布到实现`ApplicationListener`接口的bean。
- 加载多个（分层）上下文，允许每个上下文通过`HierarchicalBeanFactory`接口集中在一个特定层上，例如应用程序的Web层。

### 使用MessageSource进行国际化

`ApplicationContext`接口扩展了一个名为`MessageSource`的接口，因此提供了国际化（i18n）功能。Spring还提供接口`HierarchicalMessageSource`，它可以分层解析消息。 这些接口一起为Spring消息解析提供了基础。 这些接口上定义的方法包括：

- `String getMessage(String code, Object[] args, String default, Locale loc)`:用于从`MessageSource`中检索消息的基本方法。如果未找到指定语言环境的消息，则使用默认消息。使用标准库提供的`MessageFormat`功能，传入的任何参数都将成为替换值。
- `String getMessage(String code, Object[] args, Locale loc)`:与前面的方法基本相同，但有一点不同：不能指定默认消息;如果消息无法找到，则抛出NoSuchMessageException。
- `String getMessage(MessageSourceResolvable resolvable, Locale locale)`:前面方法中使用的所有属性也都包含在一个名为MessageSourceResolvable的类中，您可以使用该方法。

当加载一个`ApplicationContext`时，它会自动搜索在上下文中定义的`MessageSource `bean。 该bean必须具有名称`messageSource`。 如果找到这样的一个bean，所有对前面方法的调用都被委托给`MessageSource`。如果找不到`MessageSource`，则`ApplicationContext`将尝试查找包含具有相同名称的bean的父代。 如果有，它将使用该Bean作为`MessageSource`。如果ApplicationContext找不到任何`MessageSource`，则会实例化一个空的`DelegatingMessageSource`，以便能够接受对上面定义的方法的调用。

Spring提供了两个`MessageSource`实现，`ResourceBundleMessageSource`和`StaticMessageSource`。 两者都实现`HierarchicalMessageSource`以进行嵌套消息传递。 `StaticMessageSource`很少使用，但提供了编程方式将消息添加到源代码中。 以下示例中显示了`ResourceBundleMessageSource`：

```xml
<beans>
    <bean id="messageSource"
            class="org.springframework.context.support.ResourceBundleMessageSource">
        <property name="basenames">
            <list>
                <value>format</value>
                <value>exceptions</value>
                <value>windows</value>
            </list>
        </property>
    </bean>
</beans>
```

在这个例子中，假设你在你的类路径中定义了三个名为`format`，`exceptions`和`windows`的资源包。 任何解析消息的请求都将以通过`ResourceBundles`解析消息的JDK标准方式进行处理。 出于示例的目的，假设上述两个资源包文件的内容是……

```
# in format.properties
message=Alligators rock!
# in exceptions.properties
argument.required=The {0} argument is required.
```

下一个示例中显示了执行`MessageSource`功能的程序。 请记住，所有`ApplicationContext`实现也都是`MessageSource`实现，因此可以转换为`MessageSource`接口。

```java
public static void main(String[] args) {
    MessageSource resources = new ClassPathXmlApplicationContext("beans.xml");
    String message = resources.getMessage("message", null, "Default", null);
    System.out.println(message);
}
```

从上述程序产生的输出将是…

```
Alligators rock!
```

总而言之，`MessageSource`被定义在名为`beans.xml`的文件中，该文件存在于您的类路径的根目录中。 `messageSource `bean定义通过其基本名称属性引用许多资源包。在列表中传递给基本名称属性的三个文件作为文件存在于类路径的根目录中，分别称为`format.properties`，`exceptions.properties`和`windows.properties`。

下一个示例显示传递给消息查找的参数; 这些参数将转换为字符串并插入查找消息中的占位符。

```xml
<beans>

    <!-- this MessageSource is being used in a web application -->
    <bean id="messageSource" class="org.springframework.context.support.ResourceBundleMessageSource">
        <property name="basename" value="exceptions"/>
    </bean>

    <!-- lets inject the above MessageSource into this POJO -->
    <bean id="example" class="com.foo.Example">
        <property name="messages" ref="messageSource"/>
    </bean>

</beans>

```

```java
public class Example {

    private MessageSource messages;

    public void setMessages(MessageSource messages) {
        this.messages = messages;
    }

    public void execute() {
        String message = this.messages.getMessage("argument.required",
            new Object [] {"userDao"}, "Required", null);
        System.out.println(message);
    }
}
```



调用`execute`方法的结果输出将是…

```shell
The userDao argument is required.
```

关于国际化（i18n），Spring的各种`MessageSource`实现遵循与标准JDK `ResourceBundle`相同的区域设置解析和回退规则。 简而言之，继续前面定义的`messageSource`示例，如果要根据英式（en-GB）语言环境解析消息，则需要分别创建名为`format_en_GB.properties`，`exceptions_en_GB.properties`和`windows_en_GB.properties`的文件。

通常，locale 设置解析由应用程序的周围环境管理。 在这个例子中，（英国）消息将被解析的地区是手动指定的。

```java
# in exceptions_en_GB.properties
argument.required=Ebagum lad, the {0} argument is required, I say, required.
public static void main(final String[] args) {
    MessageSource resources = new ClassPathXmlApplicationContext("beans.xml");
    String message = resources.getMessage("argument.required",
        new Object [] {"userDao"}, "Required", Locale.UK);
    System.out.println(message);
}
```

从上述程序运行得到的输出将是…

```
Ebagum lad, the 'userDao' argument is required, I say, required.
```

您还可以使用`MessageSourceAware`接口获取对已定义的任何`MessageSource`的引用。在创建和配置bean时，在实现`MessageSourceAware`接口的`ApplicationContext`中定义的任何bean都会注入应用程序上下文的`MessageSource`。

> 作为ResourceBundleMessageSource的替代方法，Spring提供了一个ReloadableResourceBundleMessageSource类。该变体支持相同的包文件格式，但比标准的基于JDK的ResourceBundleMessageSource实现更灵活。特别是，它允许从任何Spring资源位置（而不仅仅是从类路径）读取文件，并支持热重载bundle属性文件（同时有效地缓存它们）。 查看ReloadableResourceBundleMessageSource javadoc获取详细信息。

### 标准和自定义事件

`ApplicationContext`中的事件处理通过`ApplicationEvent`类和`ApplicationListener`接口提供。如果将实现`ApplicationListener`接口的bean部署到上下文中，则每次将`ApplicationEvent`发布到`ApplicationContext`时，都会通知该Bean。 实质上，这是标准`Observer`设计模式。

Spring提供了以下标准事件：

| Event                 | 描述                                                         |
| :-------------------- | ------------------------------------------------------------ |
| ContextRefreshedEvent | 在初始化或刷新ApplicationContext时触发，例如，在ConfigurableApplicationContext接口上使用refresh（）方法。这里的“初始化”意味着所有的Bean都被加载，检测并激活后处理器Bean，单例被预先实例化，并且ApplicationContext对象已准备好使用。只要上下文没有关闭，只要所选的ApplicationContext实际上支持这种“热”刷新，就可以多次触发刷新。例如，XmlWebApplicationContext支持热刷新，但GenericApplicationContext不支持。 |
| ContextStartedEvent   | 在ApplicationContext启动时触发，例如，在ConfigurableApplicationContext接口上使用start（）方法。“started”意味着所有生命周期bean都会收到明确的启动信号，通常这个信号用于在显式停止后重新启动bean，但也可能用于启动尚未配置为自动启动的组件，例如， 尚未开始初始化。 |
| ContextStoppedEvent   | 在ApplicationContext停止时发布，在ConfigurableApplicationContext接口上使用stop（）方法。这里“停止”意味着所有生命周期bean都会收到明确的停止信号。 停止的上下文可以通过start（）调用重新启动。 |
| ContextClosedEvent    | 在ApplicationContext关闭时发布，在ConfigurableApplicationContext接口上使用close（）方法。这里的“closed”意味着所有的单例bean被销毁。 封闭的环境达到其生命的尽头; 它不能被刷新或重新启动。 |
| RequestHandledEvent   | 一个特定于web的事件，告知所有bean------HTTP请求已被服务。此事件在请求完成后发布。该事件仅适用于使用Spring的DispatcherServlet的Web应用程序。 |

您还可以创建和发布自己的自定义事件。 这个例子演示了一个扩展Spring的ApplicationEvent基类的简单类：

```java
public class BlackListEvent extends ApplicationEvent {

    private final String address;
    private final String test;

    public BlackListEvent(Object source, String address, String test) {
        super(source);
        this.address = address;
        this.test = test;
    }

    // accessor and other methods...
}
```

要发布自定义`ApplicationEvent`，请在`ApplicationEventPublisher`上调用`publishEvent`方法。通常这是通过创建一个实现`ApplicationEventPublisherAware`并将其注册为Spring bean的类来完成的。 以下示例演示了这样一个类：

```java
public class EmailService implements ApplicationEventPublisherAware {

    private List<String> blackList;
    private ApplicationEventPublisher publisher;

    public void setBlackList(List<String> blackList) {
        this.blackList = blackList;
    }

    public void setApplicationEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void sendEmail(String address, String text) {
        if (blackList.contains(address)) {
            BlackListEvent event = new BlackListEvent(this, address, text);
            publisher.publishEvent(event);
            return;
        }
        // send email...
    }
}
```

在配置时，`Spring`容器将检测到该`EmailService`实现了`ApplicationEventPublisherAware`，并将自动调用`setApplicationEventPublisher`。 实际上，传入的参数将是Spring容器本身; 您只需通过其`ApplicationEventPublisher`接口与应用程序上下文进行交互。

要接收自定义`ApplicationEvent`，请创建一个实现`ApplicationListener`的类并将其注册为Spring bean。 以下示例演示了这样一个类：

```java
public class BlackListNotifier implements ApplicationListener<BlackListEvent> {

    private String notificationAddress;

    public void setNotificationAddress(String notificationAddress) {
        this.notificationAddress = notificationAddress;
    }

    public void onApplicationEvent(BlackListEvent event) {
        // notify appropriate parties via notificationAddress...
    }
}
```

请注意，`ApplicationListener`通常使用您的自定义事件`BlackListEvent`的类型进行参数化。这意味着`onApplicationEvent`方法可以保持类型安全，避免任何向下转换。您可以根据需要注册许多事件侦听器，但请注意，默认情况下事件侦听器会同步接收事件。这意味着`publishEvent`方法会阻塞，直到所有侦听器完成处理事件。这种同步和单线程方法的一个优点是，当侦听器接收到事件时，如果事务上下文可用，它将在发布者的事务上下文内部运行。如果需要另一个事件发布策略，请参考Spring的`ApplicationEventMulticaster`接口的javadoc。 以下示例显示了用于注册和配置上述每个类的bean定义：

```xml
<bean id="emailService" class="example.EmailService">
    <property name="blackList">
        <list>
            <value>known.spammer@example.org</value>
            <value>known.hacker@example.org</value>
            <value>john.doe@example.org</value>
        </list>
    </property>
</bean>

<bean id="blackListNotifier" class="example.BlackListNotifier">
    <property name="notificationAddress" value="blacklist@example.org"/>
</bean>
```

综合起来，当调用`emailService `bean的`sendEmail`方法时，如果有任何应被列入黑名单的电子邮件，则会发布`BlackListEvent`类型的自定义事件。 `blackListNotifier `bean被注册为一个`ApplicationListener`，并因此接收到`BlackListEvent`，此时它可以通知相关方。

> Spring的事件机制被设计为在同一个应用程序上下文中的Spring bean之间进行简单的通信。 然而，对于更复杂的企业集成需求，单独维护的Spring Integration项目为构建轻量级，面向模式的事件驱动架构提供完全支持，该架构基于着名的Spring编程模型。

#### 基于注释的事件监听器

从Spring 4.2开始，事件监听器可以通过`EventListener`注解在托管bean的任何公共方法上注册。 `BlackListNotifier`可以被重写如下：

```java
public class BlackListNotifier {

    private String notificationAddress;

    public void setNotificationAddress(String notificationAddress) {
        this.notificationAddress = notificationAddress;
    }

    @EventListener
    public void processBlackListEvent(BlackListEvent event) {
        // notify appropriate parties via notificationAddress...
    }
}
```

正如您在上面看到的，方法签名再次声明它监听的事件类型，但是这次使用灵活的名称并且没有实现特定的监听器接口。事件类型也可以通过泛型进行缩小,只要实际事件类型在其实现层次结构中解析泛型参数.

如果你的方法应该监听几个事件，或者方法上根本没有参数，事件类型也可以在注释本身上指定：

```java
@EventListener({ContextStartedEvent.class, ContextRefreshedEvent.class})
public void handleContextStart() {
    ...
}
```

也可以通过注释的`condition`属性添加额外的运行时过滤，该属性定义了一个SpEL表达式，该表达式应匹配以实际调用特定事件的方法。

例如，如果事件的测试属性等于foo，我们的通知器可以被重写为仅被调用：

```java
@EventListener(condition = "#blEvent.test == 'foo'")
public void processBlackListEvent(BlackListEvent blEvent) {
    // notify appropriate parties via notificationAddress...
}
```

每个SpEL表达式再次评估一个专用上下文。 下表列出了可用于上下文的项目，以便可以将它们用于条件事件处理：

| Name            | Location           | Description                                                  | Example                                                      |
| --------------- | ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Event           | root object        | 实际的ApplicationEvent                                       | `#root.event`                                                |
| Arguments array | root object        | 用于调用目标的参数（如数组）                                 | `#root.args[0]`                                              |
| Argument name   | evaluation context | 任何方法参数的名称。 如果由于某些原因名称不可用（例如，没有调试信息），则参数名称也可在`#a <#arg>`下使用，其中`#arg`代表参数索引（从0开始） | `#blEvent` or `#a0` (one can also use` #p0` or `#p<#arg>` notation as an alias). |

请注意，`＃root.event`允许您访问基础事件，即使您的方法签名实际上引用了已发布的任意对象。

如果您需要发布一个事件作为处理另一个事件的结果，只需更改方法签名以返回应该发布的事件，如下所示：

```java
@EventListener
public ListUpdateEvent handleBlackListEvent(BlackListEvent event) {
    // notify appropriate parties via notificationAddress and
    // then publish a ListUpdateEvent...
}
```

这个新方法将为每个由上述方法处理的`BlackListEvent`发布一个新的`ListUpdateEvent`。 如果您需要发布多个事件，则只需返回一组事件。

#### 异步监听器

如果您希望特定的侦听器异步处理事件，只需重用常规的`@Async`支持即可：

```java
@EventListener
@Async
public void processBlackListEvent(BlackListEvent event) {
    // BlackListEvent is processed in a separate thread
}
```

使用异步事件时请注意以下限制：

- 如果事件侦听器抛出异常，它将不会传播给调用者，请检查`AsyncUncaughtExceptionHandler`以获取更多详细信息。
- 这种事件监听器不能发送回复。 如果您需要发送另一个事件作为处理结果，请注入`ApplicationEventPublisher`以手动发送事件。

#### 监听器的顺序

如果需要在另一个侦听器之前调用侦听器，只需将`@Order`注释添加到方法声明中即可：

```java
@EventListener
@Order(42)
public void processBlackListEvent(BlackListEvent event) {
    // notify appropriate parties via notificationAddress...
}
```

#### 泛型事件

您也可以使用泛型来进一步定义事件的结构。 考虑一个`EntityCreatedEvent <T>`，其中`T`是创建的实际实体的类型。 您可以创建以下侦听器定义以仅接收`Person`的`EntityCreatedEvent`：

```java
@EventListener
public void onPersonCreated(EntityCreatedEvent<Person> event) {
    ...
}
```

由于类型擦除，只有当被触发的事件解决了事件侦听器过滤的泛型参数时（这与类`PersonCreatedEvent `extends `EntityCreatedEvent <Person>` {…}）类似，才会起作用。

在某些情况下，如果所有事件都遵循相同的结构（这应该是上述事件的情况），则这可能变得非常乏味。在这种情况下，您可以实现`ResolvableTypeProvider`以引导框架超出运行时环境所提供的范围：

```java
public class EntityCreatedEvent<T>
        extends ApplicationEvent implements ResolvableTypeProvider {

    public EntityCreatedEvent(T entity) {
        super(entity);
    }

    @Override
    public ResolvableType getResolvableType() {
        return ResolvableType.forClassWithGenerics(getClass(),
                ResolvableType.forInstance(getSource()));
    }
}

```

### 方便地访问低级资源

为了最佳使用和理解应用程序上下文，用户通常应该熟悉Spring的资源抽象。

应用程序上下文是一个`ResourceLoader`，可用于加载资源。资源本质上是JDK类`java.net.URL`的功能更丰富的版本，实际上，`Resource`的实现在适当的情况下包装了`java.net.URL`的实例。`Resource `可以透明方式从几乎任何位置获取低级资源，包括从类路径，文件系统位置，任何可用标准URL描述的位置以及其他变体。 如果资源位置字符串是一个没有任何特殊前缀的简单路径，那么这些资源来自特定且适合实际应用程序上下文类型.

您可以配置一个部署到应用程序上下文中的bean来实现特殊的回调接口`ResourceLoaderAware`，该接口将在初始化时自动回调，同时应用程序上下文本身作为`ResourceLoader`传入。您还可以公开用于访问静态资源的`Resource`类型的属性;它们将像其他任何属性一样被注入到它中。您可以将这些资源属性指定为简单的String路径，并依赖由上下文自动注册的特殊JavaBean `PropertyEditor`，以便在部署Bean时将这些文本字符串转换为实际的`Resource`对象。

提供给`ApplicationContext`构造函数的位置路径或路径实际上是资源字符串，并且以简单形式适当地处理特定的上下文实现。`ClassPathXmlApplicationContext`将简单的位置路径视为类路径位置。 您还可以使用带有特殊前缀的位置路径（资源字符串）来强制从类路径或URL中加载定义，而不管实际的上下文类型如何。

### 方便的Web应用程序ApplicationContext实例化

您可以使用例如`ContextLoader`以声明方式创建`ApplicationContext`实例。当然，您也可以通过使用`ApplicationContext`实现之一以编程方式创建`ApplicationContext`实例。 您可以使用`ContextLoaderListener`注册一个`ApplicationContext`，如下所示：

```xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>/WEB-INF/daoContext.xml /WEB-INF/applicationContext.xml</param-value>
</context-param>

<listener>
    <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
</listener>
```

监听器检查`contextConfigLocation`参数。 如果该参数不存在，那么侦听器将默认使用`/WEB-INF/applicationContext.xml`.当参数确实存在时，侦听器使用预定义的分隔符（逗号，分号和空白）来分隔字符串，并将这些值用作应用程序上下文将被搜索的位置。 也支持Ant风格的路径模式。示例是`/WEB-INF/**Context.xml`，用于名称以“Context.xml”结尾，驻留在“WEB-INF”目录中的所有文件，以及`/WEB-INF/***/*Context.xml `这些文件位于“WEB-INF”的任何子目录中。

### 将Spring ApplicationContext部署为Java EE RAR文件

可以将Spring `ApplicationContext`部署为RAR文件，将上下文及其所有必需的bean类和库JAR封装到Java EE RAR部署单元中。这相当于引导了一个独立的`ApplicationContext`，它只是在Java EE环境中托管，能够访问Java EE服务器设施。RAR部署是部署无头WAR文件的场景中更自然的选择，实际上，WAR文件没有任何HTTP入口点，仅用于在Java EE环境中引导Spring `ApplicationContext`。

RAR部署非常适合不需要HTTP入口点但仅包含消息端点和预定作业的应用程序上下文.在这种情况下，Bean可以使用应用服务器资源，例如JTA事务管理器和JNDI绑定的JDBC DataSources和JMS ConnectionFactory实例，也可以通过Spring的标准事务管理和JNDI和JMX支持工具向平台的JMX服务器注册。 应用程序组件还可以通过Spring的TaskExecutor抽象与应用程序服务器的JCA `WorkManager`进行交互。

查看`SpringContextResourceAdapter`类的javadoc，了解RAR部署中涉及的配置详细信息。

要将Spring `ApplicationContext`简单部署为Java EE RAR文件：将所有应用程序类打包到RAR文件中，该文件是具有不同文件扩展名的标准JAR文件。将所有必需的库JAR添加到RAR归档的根目录中。 添加一个“META-INF /ra.xml”部署描述符（如SpringContextResourceAdapters javadoc所示）和相应的Spring XML bean定义文件（通常为“META-INF/applicationContext.xml”），并放弃生成的RAR文件 到您的应用程序服务器的部署目录。

> 这种RAR部署单元通常是独立的;它们不会将组件暴露给外部世界，甚至不会暴露给同一应用程序的其他模块。与基于RAR的ApplicationContext的交互通常通过与其他模块共享的JMS目标进行。 例如，基于RAR的ApplicationContext也可以调度一些作业，对文件系统中的新文件（或诸如此类）作出反应。 如果需要允许从外部进行同步访问，则可以导出RMI端点，这当然可以由同一台机器上的其他应用程序模块使用。

## BeanFactory

BeanFactory为Spring的IoC功能提供了基础，但它仅直接用于与其他第三方框架的集成，现在对于Spring的大多数用户来说本质上是历史性的。

BeanFactory和相关接口（如BeanFactoryAware，InitializingBean，DisposableBean）在Spring中仍然存在，目的是为了与大量与Spring集成的第三方框架向后兼容。 通常第三方组件不能使用更多的现代对等项目，例如@PostConstruct或@PreDestroy，以避免依赖JSR-250。

本节提供了BeanFactory和ApplicationContext之间差异的额外背景，以及如何通过经典的单例查找直接访问IoC容器。

### BeanFactory or ApplicationContext?

除非你有充分理由不这样做，否则使用ApplicationContext。

因为ApplicationContext包含了BeanFactory的所有功能，所以通常推荐使用BeanFactory，除了少数情况，例如在资源受限的设备上运行的嵌入式应用程序中，这些设备的内存消耗可能非常重要，少数多余的千字节可能会产生影响.但是，对于大多数典型的企业应用程序和系统，ApplicationContext就是您想要使用的。 Spring大量使用BeanPostProcessor扩展点（以实现代理等）。如果您只使用简单的BeanFactory，则相当数量的支持（如事务和AOP）不会生效，至少在您没有执行某些额外步骤的情况下不会生效。 这种情况可能会令人困惑，因为配置没有任何问题。

下表列出了BeanFactory和ApplicationContext接口和实现提供的功能。

| Feature                             | BeanFactory | ApplicationContext |      |
| ----------------------------------- | ----------- | ------------------ | ---- |
| Bean实例化/注入                     | Y           | Y                  |      |
| 自动注册BeanPostProcessor           | N           | Y                  |      |
| 自动注册BeanFactoryPostProcessor    | N           | Y                  |      |
| 便捷的MessageSource访问（针对i18n） | N           | Y                  |      |
| ApplicationEvent 发布               | N           |                    |      |

要使用BeanFactory实现显式注册Bean后处理器，您需要编写如下代码：

```java
DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
// populate the factory with bean definitions

// now register any needed BeanPostProcessor instances
MyBeanPostProcessor postProcessor = new MyBeanPostProcessor();
factory.addBeanPostProcessor(postProcessor);

// now start using the factory
```

要在使用BeanFactory实现时显式注册BeanFactoryPostProcessor，您必须编写如下代码：

```java
DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(factory);
reader.loadBeanDefinitions(new FileSystemResource("beans.xml"));

// bring in some property values from a Properties file
PropertyPlaceholderConfigurer cfg = new PropertyPlaceholderConfigurer();
cfg.setLocation(new FileSystemResource("jdbc.properties"));

// now actually do the replacement
cfg.postProcessBeanFactory(factory);
```

在这两种情况下，显式注册步骤都很不方便，这是为什么各种ApplicationContext实现比绝大多数Spring支持的应用程序中的纯BeanFactory实现更受欢迎的原因之一，尤其是在使用BeanFactoryPostProcessor和BeanPostProcessor时。 这些机制实现了重要的功能，如资源占位符替换和AOP。





