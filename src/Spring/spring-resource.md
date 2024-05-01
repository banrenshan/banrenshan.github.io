---

title: Spring 资源处理
date: 2024-04-27
categories:
  - Spring
tags:
  - Spring
  - resource
---

# 资源

仅仅使用 JAVA 的 `java.net.URL` 和针对不同 URL 前缀的标准处理器，并不能满足我们对各种底 层资源的访问，比如：我们就不能通过 URL 的标准实现来访问类路径或者相对 `ServletContext` 的各种资源。虽然我们可以针对特定的 URL 前缀来注册一个新的`URLStreamHandler`（和现有的针对各种特定前缀的处理器类似，比如 `http：`），然而这往往会是 一件比较麻烦的事情(要求了解 url 的实现机制等），而且 url 接口也缺少了部分基本的方法，如 检查当前资源是否存在的方法。

##  Resource 接口

相对标准 url 访问机制，spring 的 Resource 接口对抽象底层资源的访问提供了一套更好的机制。

```java
public interface Resource extends InputStreamSource {

    boolean exists();

    boolean isOpen();

    URL getURL() throws IOException;

    File getFile() throws IOException;

    Resource createRelative(String relativePath) throws IOException;

    String getFilename();

    String getDescription();
}

public interface InputStreamSource {

    InputStream getInputStream() throws IOException;

}
```

- `getInputStream()`: 定位并且打开当前资源，返回当前资源的 `InputStream`。每一次 调用都会返回一个新的 `InputStream`，因此关闭当前输出流就成为了调用者的责任。
- `exists()`: 返回一个` boolean`，表示当前资源是否真的存在。
- `isOpen()`: 返回一个 boolean，表示当前资源是否已打开的输入流。如果结果为 true， 返回的 `InputStream` 不能多次读取，只能是一次性读取之后，就关闭 `InputStream`，以防 止内存泄漏。除了 `InputStreamResource`，其他常用 Resource 实现都会返回 false。
- `getDescription()`: 返回当前资源的描述，当处理资源出错时，资源的描述会用于错误信息的 输出。一般来说，资源的描述是一个完全限定的文件名称，或者是当前资源的真实 url。

Resource 接口里的其他方法可以让你获得代表当前资源的 URL 或 File 对象（前提是底层实现可 兼容的，也支持该功能）。

Resource抽象在Spring本身被广泛使用，作为许多方法签名中的参数类型。 某些 Spring API中的方法（例如各种`ApplicationContext`实现的构造函数）接受一个以特定前缀形式或简单的形式String参数，用于创建适用于该上下文实现的资源。

> **Resource 接口（实现）不仅可以被 spring 大量的应用，其也非常适合在你编程过程中作为访问资源的辅助工具类**。需要注意的是 Resource 实现并没有去重新发明轮子，而是尽可能地采用封装。举个例子， UrlResource 里就封装了一个 URL 对象，在其内的逻辑就是通过封装的 URL 对象来完成的。

## 内置的Resource实现

### UrlResource

`UrlResource `封装了一个 `java.net.URL` 对象，用来访问 URL 类型的对象，比如 本地文件、 HTTP 、 FTP等。所有的 URL 都可以用一个标准化的字符串来 表示。例如：用于访问文件系统路径 的`file:`,通过 http 协议访问资源的 `http:`,通过 ftp 协议访问资源的 `ftp:` 。

可以显式化地使用 `UrlResource `构造函数来创建一个 `UrlResource`，不过通常我们可以在调用一 个 api 方法是，使用一个代表路径的 String 参数来隐式创建一个 `UrlResource`。对于后一种情 况，会由一个 javabean `PropertyEditor `来决定创建哪一种 Resource。如果路径里包含某一个 通用的前缀（如 classpath:),`PropertyEditor `会根据这个通用的前缀来创建恰当的 `Resource`；反之，**如果 `PropertyEditor `无法识别这个前缀，会把这个路径作为一个标准的 URL 来创建一个 `UrlResource`**。

### ClassPathResource

`ClassPathResource `可以从类==路径==上加载资源，**其可以使用线程上下文加载器、指定加载器或指定 的 class 类型中的任意一个来加载资源**。

当类路径上资源存于文件系统中，ClassPathResource 支持以 java.io.File 的形式访问，当 类路径上的资源存于尚未解压(没有 被Servlet 引擎或其他可解压的环境解压）的 jar 包中， ClassPathResource 就不再支持以 java.io.File 的形式访问。鉴于上面所说这个问题， spring 中各式 Resource 实现都支持以 jave.net.URL 的形式访问。

可以显式使用 `ClassPathResource `构造函数来创建一个 `ClassPathResource `，不过通常我们 可以在调用一个 api 方法时，使用一个代表路径的 String 参数来隐式创建一个`ClassPathResource`。对于后一种情况，会由一个 javabean `PropertyEditor `来识别路径中` classpath: `前缀，从而创建一个 `ClassPathResource`。

### FileSystemResource

这是针对 java.io.File 提供的 `Resource `实现。显然，我们可以使用 `FileSystemResource `的 getFile() 函数获取 File 对象，使用 `getURL()` 获取 URL 对象。

### ServletContextResource

这是为了获取 web 根路径的 ServletContext 资源而提供的 Resource 实现。

`ServletContextResource `完全支持以流和 URL 的方式访问，可只有当 web 项目是已解压的(不 是以 war 等压缩包形式存在)且该 `ServletContext `资源存于文件系统里，`ServletContextResource `才支持以 java.io.File 的方式访问。至于说到，我们的 web 项目 是否已解压和相关的 `ServletContext `资源是否会存于文件系统里，这个取决于我们所使用的 Servlet 容器。若 Servlet 容器没有解压 web 项目，我们可以直接以 JAR 的形式的访问，或者 其他可以想到的方式（如访问数据库）等。

### InputStreamResource

给定`InputStream`的资源实现。 只有在没有特定的资源实现适用的情况下才能使用。 特别是，如果可能的话，首选`ByteArrayResource`或任何基于文件的资源实现。

与其他Resource实现相比，这是已打开资源的描述符 - 因此从isOpen（）返回true。 如果您需要将资源描述符保存在某处，或者您需要多次读取流，请不要使用它。

### ByteArrayResource

这是给定字节数组的一个资源实现。 它为给定的字节数组创建一个`ByteArrayInputStream`。

从任何给定的字节数组中加载内容是很有用的，而不必求助于一次性的`InputStreamResource`。

## ResourceLoader

实现ResourceLoader接口可以获取资源实例对象的引用。

```java
public interface ResourceLoader {

    Resource getResource(String location);
  }
```

所有的应用程序上下文都实现了`ResourceLoader`接口，因此所有的应用程序上下文都可以用来获取`Resource`实例。 当您在特定的应用程序上下文中调用`getResource`，并且指定的位置路径没有特定的前缀时，您将返回适合该特定应用程序上下文的资源类型。 例如，假设以下代码片段针对`ClassPathXmlApplicationContext`实例执行：

```java
Resource template = ctx.getResource("some/resource/path/myTemplate.txt");
```

返回将是一个`ClassPathResource`; 如果对`FileSystemXmlApplicationContext`实例执行相同的方法，则会返回`FileSystemResource`。 对于`WebApplicationContext`，您将返回一个`ServletContextResource`，等等。

因此，您可以以适合特定应用程序上下文的方式加载资源。

另一方面，通过指定特殊的`classpath:`前缀来强制使用`ClassPathResource`，而不管应用程序上下文类型如何。

```java
Resource template = ctx.getResource("classpath:some/resource/path/myTemplate.txt");
```

同样，可以通过指定任何标准的java.net.URL前缀来强制使用UrlResource：

```java
Resource template = ctx.getResource("file:///some/resource/path/myTemplate.txt");
Resource template = ctx.getResource("http://myhost.com/resource/path/myTemplate.txt");
```

下表总结了将字符串转换为资源的策略：

| Prefix     | 实例                                               | 说明                             |
| ---------- | -------------------------------------------------- | -------------------------------- |
| classpath: | classpath:com/myapp/config.xml                     | 从类路径加载。                   |
| file:      | [file:///data/config.xml](file:///data/config.xml) | 从文件系统加载为URL。            |
| http:      | http://myserver/logo.png                           | 加载为网址。                     |
| (none)     | /data/config.xml                                   | 取决于底层的ApplicationContext。 |

## ResourceLoaderAware接口

ResourceLoaderAware接口是一个特殊的标记接口，用于标识期望通过ResourceLoader引用提供的对象。

```java
public interface ResourceLoaderAware {

    void setResourceLoader(ResourceLoader resourceLoader);
}
```

当一个类实现了`ResourceLoaderAware`并且被部署到一个应用上下文中时（作为一个Spring管理的bean），它被应用上下文识别为`ResourceLoaderAware`。然后，应用程序上下文将调用`setResourceLoader（ResourceLoader）`，将自身作为参数提供（**请记住，Spring中的所有应用程序上下文实现ResourceLoader接口**）。

当然，由于`ApplicationContext`是一个`ResourceLoader`，bean也可以实现`ApplicationContextAware`接口并直接使用提供的应用程序上下文来加载资源，但通常情况下，最好使用专用的`ResourceLoader`接口（如果需要的话）。 该代码只会耦合到资源加载接口，该接口可以被认为是一个实用接口，而不是整个`Spring ApplicationContext`接口。

从Spring 2.5开始，可以依靠`ResourceLoader`的自动装配来替代实现`ResourceLoaderAware`接口。“传统”构造函数和byType自动装配模式（如自动装配协作者中所述）现在可以分别为构造函数参数或setter方法参数提供`ResourceLoader`类型的依赖关系。 为了获得更大的灵活性（包括自动装配字段和多个参数方法的能力），请考虑使用新的基于注释的自动装配功能。在这种情况下，只要字段，构造函数或方法携带`@Autowired`注释，`ResourceLoader`就会自动装入。

### Resources as dependencies

如果bean本身要通过某种动态过程来确定和提供资源路径，那么bean可能使用`ResourceLoader`接口来加载资源。 考虑加载某种模板的例子，其中需要的特定资源取决于用户的角色。 所有应用程序上下文都注册并使用一个特殊的JavaBeans `PropertyEditor`，它可以将String路径转换为Resource对象。因此，如果myBean具有Resource类型的模板属性，则可以使用该资源的简单字符串进行配置，如下所示：

```java
<bean id="myBean" class="...">
    <property name="template" value="some/resource/path/myTemplate.txt"/>
</bean>
```

请注意，资源路径没有前缀，因此应用上下文本身将用作`ResourceLoader`，资源本身将根据上下文的确切类型通过`ClassPathResource`，`FileSystemResource`或`ServletContextResource`（根据需要）加载。

如果需要强制使用特定的资源类型，则可以使用前缀。 以下两个示例显示如何强制`ClassPathResource`和`UrlResource`（后者用于访问文件系统文件）。

```java
<property name="template" value="classpath:some/resource/path/myTemplate.txt">
<property name="template" value="file:///some/resource/path/myTemplate.txt"/>
```

## Application contexts和Resource paths

### 构建应用程序上下文

应用程序上下文构造函数（针对特定应用程序上下文类型）通常需要一个字符串或字符串数组作为资源的位置路径，以构成上下文定义的XML文件。

当这样的位置路径没有前缀时，从该路径构建并用于加载bean定义的特定资源类型取决当前所使用的应用程序上下文。 例如，如果您按照以下方式创建`ClassPathXmlApplicationContext`：

```java
ApplicationContext ctx = new ClassPathXmlApplicationContext("conf/appContext.xml");
```

由于将使用`ClassPathResource`，因此将从类路径加载bean定义。 但是，如果您创建`FileSystemXmlApplicationContext`，如下所示：

```java
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("conf/appContext.xml");
```

bean定义将从文件系统位置加载，在这种情况下，相对于当前工作目录。 请注意，在位置路径中使用特殊类路径前缀或标准URL前缀将覆盖为加载定义而创建的默认类型的资源。 所以这个`FileSystemXmlApplicationContext`

```java
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("classpath:conf/appContext.xml");
```

实际上会从类路径中加载它的bean定义。 但是，它仍然是一个`FileSystemXmlApplicationContext`。 如果随后将其用作`ResourceLoader`，则任何前缀不固定的路径仍将被视为文件系统路径。

#### 构造ClassPathXmlApplicationContext实例 - 快捷方式

`ClassPathXmlApplicationContext`公开了许多构造函数以实现方便的实例化。 其基本思想是只提供一个字符串数组，它只包含XML文件本身的文件名（没有前导路径信息），另一个是提供一个Class; `ClassPathXmlApplicationContext`将从提供的类中派生路径信息。

有一个例子希望能够说清楚：

```
com/
  foo/
    services.xml
    daos.xml
    MessengerService.class
```

由`services.xml`和`daos.xml`中定义的bean组成的`ClassPathXmlApplicationContext`实例可以像这样被实例化:

```java
ApplicationContext ctx = new ClassPathXmlApplicationContext(
    new String[] {"services.xml", "daos.xml"}, MessengerService.class);
```

### 应用程序上下文构造器资源路径中的通配符

应用程序上下文构造函数值中的资源路径：

* 可能是一个简单的路径，它具有到目标资源的一对一映射，
* 或者可以包含特殊的`classpath *：`前缀或Ant-样式正则表达式（使用Spring的PathMatcher进行匹配）

#### Ant-style风格

当路径位置包含Ant样式时，例如：

```
/WEB-INF/*-context.xml
com/mycompany/**/applicationContext.xml
file:C:/some/path/*-context.xml
classpath:com/mycompany/**/applicationContext.xml
```

ant模式为最后一个非通配符段的路径生成一个资源，并从中获取一个URL。如果此URL不是`jar：URL`或特定于容器的变体（例如，WebLogic中的zip，WebSphere中的wsjar等），则从中获取`java.io.File`，并通过遍历文件系统来解析通配符。 在jar URL的情况下，解析器要么从中获取`java.net.JarURLConnection`，要么手动解析jar URL，然后遍历jar文件的内容来解析通配符。

#### `classpath*`前缀:

```java
ApplicationContext ctx =
	new ClassPathXmlApplicationContext("classpath*:conf/appContext.xml");
```

这个特殊的前缀指定必须获得与给定名称匹配的所有类路径资源(在内部，这基本上是通过调用`ClassLoader.getResources`) 然后合并以形成最终的应用上下文定义。

您还可以将`classpath*：`前缀与位置路径的其余部分中的`PathMatcher`模式组合在一起（例如，`classpath*∶META-INF/*-beans.xml`）。在这种情况下，解析策略相当简单：在最后一个非通配符路径段上使用ClassLoader.getResources调用来获取类加载器层次结构中的所有匹配资源，然后在每个资源之外，将前面描述的相同PathMatcher解析策略用于通配符子路径。

> 通配符类路径依赖于底层`ClassLoader`的`getResources`方法。由于现在大多数应用程序服务器都提供自己的`ClassLoader`实现，因此行为可能会有所不同，尤其是在处理jar文件时。检查`classpath*`是否有效的一个简单测试是使用`getClass().getClassLoader().getResources("<someFileInsideTheJar>")`从类路径上的jar中加载文件。请对具有相同名称但位于两个不同位置的文件进行此测试 — 例如，具有相同名称和路径但位于类路径上不同jar中的文件。如果返回不适当的结果，请查看应用程序服务器文档中可能影响`ClassLoader`行为的设置。

#### 其他有关通配符的说明

请注意，除非实际目标文件驻留在文件系统中，否则`classpath*:`与Ant样式模式结合使用时，只能在模式启动之前至少有一个根目录可靠地工作。这意味着`classpath*:*.xml`这样的模式可能不会从jar文件的根文件中检索文件，而只能从扩展目录的根文件中检索文件。

Spring检索类路径条目的能力来源于JDK的`ClassLoader.getResources`方法，该方法仅返回传入的空字符串的文件系统位置（指示要搜索的潜在根）。Spring会评估URLClassLoader运行时配置和jar文件中的“java.class.path”清单，但这并不保证会导致可移植行为。

使用classpath:和Ant样式模式：如果要在多个类路径位置中使用要搜索的根包，则无法保证资源能够找到匹配的资源。 这是因为资源如

```
com/mycompany/package1/service-context.xml
```

可能只在一个位置，但是当一条路径如

```
classpath:com/mycompany/**/service-context.xml
```

用于尝试解决它，解析器将处理由`getResource("com/mycompany")`;返回的（第一个）URL。如果此基础程序包节点存在于多个类加载程序位置中，则实际的最终资源可能不在其下。因此，最好在这种情况下使用具有相同Ant样式的`classpath *：`，它将搜索包含根包的所有类路径位置。

### FileSystemResource附加说明

未附加到FileSystemApplicationContext（即FileSystemApplicationContext不是实际的ResourceLoader）的FileSystemResource将按照您的预期处理绝对路径和相对路径。 相对路径是相对于当前工作目录的，而绝对路径是相对于文件系统的根。

但是，为了向后兼容（历史）原因，当FileSystemApplicationContext是ResourceLoader时会发生变化。FileSystemApplicationContext只是强制所有附加的FileSystemResource实例将所有位置路径视为相对，无论它们是否以一个前导斜杠开始。 实际上，这意味着以下内容是等同的：

```java
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("conf/context.xml");
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("/conf/context.xml");
```

如下所示：（尽管它们有所不同，但一种情况是相对的，另一种是绝对的）。

```java
FileSystemXmlApplicationContext ctx = ...;
ctx.getResource("some/resource/path/myTemplate.txt");
FileSystemXmlApplicationContext ctx = ...;
ctx.getResource("/some/resource/path/myTemplate.txt");
```

在实践中，如果需要真正的绝对文件系统路径，最好放弃使用FileSystemResource/FileSystemXmlApplicationContext的绝对路径，并通过使用`file:URL`前缀强制使用UrlResource。

```java
// actual context type doesn't matter, the Resource will always be UrlResource
ctx.getResource("file:///some/resource/path/myTemplate.txt");
// force this FileSystemXmlApplicationContext to load its definition via a UrlResource
ApplicationContext ctx =
    new FileSystemXmlApplicationContext("file:///conf/context.xml");
```







