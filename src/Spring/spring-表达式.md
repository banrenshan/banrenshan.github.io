---
title: Spring 表达式
date: 2024-04-27
categories:
  - Spring
tags:
  - Spring
  - el
---

Spring Expression Language(简称SpEL)是一种强大的表达式语言，支持在运行时查询和操作对象图。语言语法类似于Unified EL，但提供了额外的功能，特别是方法调用和基本的字符串模板功能。

虽然还有其他几种Java表达式语言可用 - OGNL，MVEL和JBoss EL等。创建Spring表达式语言是为了向Spring社区提供单一支持良好的表达式语言，可用于Spring产品。

虽然SpEL是Spring表达式evaluation的基础，但它并不直接与Spring结合，可以独立使用。为了自成一体，本章中的许多示例都使用SpEL，就好像它是独立的表达式语言一样。这需要创建一些引导基础结构类，比如parser。大多数Spring用户不需要处理这个基础设施，只需要创建表达式字符串进行evaluation。这种典型用法的一个例子是将SpEL集成到创建XML或基于注释的bean定义中。

## Evaluation

本节介绍使用SpEL接口及其表达式语言。 以下代码引入了SpEL API来evaluate 字符串表达式`Hello World`。

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("'Hello World'");
String message = (String) exp.getValue();
```

message变量的值是。

SpEL类和接口位于包`org.springframework.expression`及其子包中。 `ExpressionParser`接口负责解析表达式字符串。 在这个例子中，表达式字符串是由**单引号**括起来的字符串文字。接口`Expression`负责evaluate先前定义的表达式字符串。当分别调用`parser.parseExpression`和`exp.getValue`时，可能会抛出两个异常，`ParseException`和`EvaluationException`。

SpEL支持很多功能，例如调用方法，访问属性和调用构造函数。

作为方法调用的一个例子，我们在字符串文字上调用concat方法。

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("'Hello World'.concat('!')");
String message = (String) exp.getValue();
```

message 的值是"Hello World!"

作为调用JavaBean属性的示例，可以调用String属性Bytes，如下所示。

```java
ExpressionParser parser = new SpelExpressionParser();

// invokes 'getBytes()'
Expression exp = parser.parseExpression("'Hello World'.bytes");
byte[] bytes = (byte[]) exp.getValue();
```

SpEL还支持使用**点符号**的嵌套属性，即`prop1.prop2.prop3`和属性值的设置

```java
ExpressionParser parser = new SpelExpressionParser();

// invokes 'getBytes().length'
Expression exp = parser.parseExpression("'Hello World'.bytes.length");
int length = (Integer) exp.getValue();
```

可以调用String的构造函数，而不是使用字符串文字。

```java
ExpressionParser parser = new SpelExpressionParser();
Expression exp = parser.parseExpression("new String('hello world').toUpperCase()");
String message = exp.getValue(String.class);
```

请注意使用泛型方法`public <T> T getValue(Class <T> desiredResultType)`。 使用此方法不需要将表达式的值转换为所需的结果类型。 如果值不能转换为类型T或使用注册类型转换器转换，则会抛出`EvaluationException`。

SpEL更常见的用法是提供一个针对特定对象实例(称为根对象)进行评估的表达式字符串。 该示例演示如何从`Inventor`类的实例中检索`name`属性或创建布尔条件：

```java
// Create and set a calendar
GregorianCalendar c = new GregorianCalendar();
c.set(1856, 7, 9);

// The constructor arguments are name, birthday, and nationality.
Inventor tesla = new Inventor("Nikola Tesla", c.getTime(), "Serbian");

ExpressionParser parser = new SpelExpressionParser();

Expression exp = parser.parseExpression("name");
String name = (String) exp.getValue(tesla);
// name == "Nikola Tesla"

exp = parser.parseExpression("name == 'Nikola Tesla'");
boolean result = exp.getValue(tesla, Boolean.class);
// result == true
```

### EvaluationContext

评估一个表达式来解析属性、方法或字段并帮助执行类型转换时，将使用接口`EvaluationContext`。 有两个开箱即用的实现：

- `SimpleEvaluationContext`：展示了一些重要的SpEL语言功能和配置选项的子集。示例包括但不限于数据绑定表达式，基于属性的过滤器等
- `StandardEvaluationContext`：展示全套SpEL语言功能和配置选项。您可以使用它来指定默认的根对象并配置每个可用的评估相关策略。

`SimpleEvaluationContext`被设计为仅支持SpEL语言语法的一个子集。它不包括Java类型引用，构造函数和bean引用。它还要求明确选择对表达式中属性和方法的支持级别。默认情况下，create()静态工厂方法只启用对属性的读访问权限。 您还可以获取构建器以配置所需的确切支持级别，并将目标设置为以下一项或多项组合： 

* 仅限自定义PropertyAccessor(不反射) 
* 用于只读访问的数据绑定属性 
* 用于读取和写入的数据绑定属性

### 类型转换

默认情况下，SpEL使用Spring核心中可用的转换服务(`org.springframework.core.convert.ConversionService`)。这种转换服务附带了许多内置的转换器，可以进行常规转换，也可以完全扩展，因此可以添加类型之间的自定义转换。此外，它具有泛型意识。 这意味着，当在表达式中使用泛型类型时，SpEL将尝试转换以维护其遇到的任何对象的类型正确性。

这在实践中意味着什么？ 假设正在使用setValue()进行赋值来设置List属性。 该属性的类型实际上是`List <Boolean>`。 SpEL将认识到列表中的元素在被设置之前需要转换为布尔值。 一个简单的例子：

```java
class Simple {
    public List<Boolean> booleanList = new ArrayList<Boolean>();
}

Simple simple = new Simple();
simple.booleanList.add(true);

EvaluationContext context = SimpleEvaluationContext().forReadOnlyDataBinding().build();

// false is passed in here as a string. SpEL and the conversion service will
// correctly recognize that it needs to be a Boolean and convert it
parser.parseExpression("booleanList[0]").setValue(context, simple, "false");

// b will be false
Boolean b = simple.booleanList.get(0);
```

### Parser配置

可以使用解析器配置对象(`org.springframework.expression.spel.SpelParserConfiguration`)来配置SpEL表达式解析器。配置对象控制一些表达式组件的行为。例如，如果索引到数组或集合中，并且指定索引处的元素为空，则可以自动创建该元素。当使用由一系列属性引用组成的表达式时，这非常有用。 如果索引到数组或列表中并指定超出数组或列表当前大小末尾的索引，则可以自动增大数组或列表以适应该索引。

```java
class Demo {
    public List<String> list;
}

// Turn on:
// - auto null reference initialization
// - auto collection growing
SpelParserConfiguration config = new SpelParserConfiguration(true,true);

ExpressionParser parser = new SpelExpressionParser(config);

Expression expression = parser.parseExpression("list[3]");

Demo demo = new Demo();

Object o = expression.getValue(demo);

// demo.list will now be a real collection of 4 entries
// Each entry is a new empty String
```

### SpEL编译

Spring Framework 4.1包含一个基本的表达式编译器。 表达式通常在评估过程中被解释,这提供了很大的动态灵活性，但不能提供最佳性能。 对于偶然的表达用法，这很好，但是当像Spring Integration这样的其他组件使用时，性能可能非常重要，并且并不需要动态性。

SpEL编译器旨在解决此需求。编译器将在评估过程中动态生成一个真正的Java类，以体现表达式行为并使用它来实现更快的表达式评估。由于缺少表达式的类型，编译器在执行编译时使用在表达式的解释评估期间收集的信息。例如，它不完全知道表达式的属性引用的类型，但是在第一次解释评估期间，它将查明它是什么。当然，如果各种表达式元素的类型随着时间的推移而变化，那么基于这些信息的编译可能会在稍后造成麻烦。出于这个原因，编译最适合于在重复评估时其类型信息不会改变的表达式。 对于像这样的基本表达式：

```
someArray[0].someProperty.someOtherProperty < 0.1
```

其中涉及数组访问，某些属性取消引用和数字操作，性能增益可能非常明显。 在50000次迭代的示例微基准测试中，仅使用解释器评估75ms，使用表达式的编译版本仅评估3ms。

#### 编译器配置

编译器默认情况下未打开，但有两种方法可以打开它。 可以使用前面讨论过的解析器配置过程打开它，或者当SpEL用法嵌入到另一个组件内时使用系统属性打开它。 本节讨论这两个选项。

理解编译器可以运行的几种模式非常重要(`org.springframework.expression.spel.SpelCompilerMode`)。 模式如下：

- `OFF `- 编译器关闭; 这是默认值。
- `IMMEDIATE `- 在即时模式下，尽快编译表达式。 这通常是在第一次解释评估之后。 如果编译的表达式失败(通常是由于类型改变，如上所述)，则表达式评估的调用者将收到异常。
- `MIXED `- 在混合模式下，表达式会随着时间的推移在解释模式和编译模式之间无声切换。经过一些解释运行后，它们将切换到编译形式，并且如果编译形式出现问题(如类型改变，如上所述)，则表达式将自动切换回解释形式。稍后它可能会生成另一个编译表单并切换到它。 基本上，用户进入`IMMEDIATE`模式的异常是在内部处理的。

`IMMEDIATE`模式之所以存在，因为`MIXED`模式可能会导致有副作用的表达式。如果编译后的表达式在部分成功后爆炸，它可能已经做了一些影响系统状态的事情。如果发生这种情况，调用者可能不希望它以解释模式重新运行，因为部分表达式可能会运行两次。

选择模式后，使用`SpelParserConfiguration`配置解析器：

```java
SpelParserConfiguration config = new SpelParserConfiguration(SpelCompilerMode.IMMEDIATE,
    this.getClass().getClassLoader());

SpelExpressionParser parser = new SpelExpressionParser(config);

Expression expr = parser.parseExpression("payload");

MyMessage message = new MyMessage();

Object payload = expr.getValue(message);
```

指定编译器模式时，也可以指定一个类加载器(允许传递null)。 编译的表达式将在所提供的任何子类下创建的子类加载器中定义。确保是否指定类加载器很重要，它可以查看表达式评估过程中涉及的所有类型。 如果没有指定，则将使用默认的类加载器(通常是表达式评估期间运行的线程的上下文类加载器)。

配置编译器的第二种方式是在SpEL嵌入到其他组件中时使用，并且可能无法通过配置对象进行配置。在这些情况下，可以使用系统属性。属性`spring.expression.compiler.mode`可以设置为SpelCompilerMode枚举值(off，immediate或mixed)。

#### 编译器限制

自Spring Framework 4.1以来，基本的编译框架已经到位。 但是，该框架还不支持编译各种表达式。 最初的重点是可能用于性能关键环境的常用表达式。 以下几种表达方式目前无法编译：

- Expressions involving assignment
- Expressions relying on the conversion service
- Expressions using custom resolvers or accessors
- Expressions using overloaded operators
- Expressions using array construction syntax
- Expressions using selection or projection

越来越多类型的表达将在未来可编译。

## bean定义中使用表达式

SpEL表达式可以用于XML或基于注解的配置元数据来定义`BeanDefinitions`。 在这两种情况下，定义表达式的语法都是`#{<表达式字符串>}`的形式。

### XML配置

可以使用如下所示的表达式来设置属性或构造函数参数值。

```java
<bean id="numberGuess" class="org.spring.samples.NumberGuess">
    <property name="randomNumber" value="#{ T(java.lang.Math).random() * 100.0 }"/>

    <!-- other properties -->
</bean>
```

变量systemProperties是预定义的，所以你可以在你的表达式中使用它，如下所示。 请注意，您不必在此上下文中将预定义变量与`#`符号相加。

```java
<bean id="taxCalculator" class="org.spring.samples.TaxCalculator">
    <property name="defaultLocale" value="#{ systemProperties['user.region'] }"/>

    <!-- other properties -->
</bean>
```

例如，您也可以通过名称引用其他bean属性。

```xml
<bean id="numberGuess" class="org.spring.samples.NumberGuess">
    <property name="randomNumber" value="#{ T(java.lang.Math).random() * 100.0 }"/>

    <!-- other properties -->
</bean>

<bean id="shapeGuess" class="org.spring.samples.ShapeGuess">
    <property name="initialShapeSeed" value="#{ numberGuess.randomNumber }"/>

    <!-- other properties -->
</bean>
```

### 注解配置

`@Value`注释可以放在字段，方法和构造函数参数上以指定默认值。

以下是设置字段变量的默认值的示例。

```java
public static class FieldValueTestBean

    //@Value("#{systemProperties['user.region'] }")
    private String defaultLocale;

    public void setDefaultLocale(String defaultLocale) {
        this.defaultLocale = defaultLocale;
    }

    public String getDefaultLocale() {
        return this.defaultLocale;
    }

}
```

下面显示了等价但属性setter方法。

```java
public static class PropertyValueTestBean

    private String defaultLocale;

    //@Value("#{ systemProperties['user.region'] }")
    public void setDefaultLocale(String defaultLocale) {
        this.defaultLocale = defaultLocale;
    }

    public String getDefaultLocale() {
        return this.defaultLocale;
    }

}
```

自动装配的方法和构造函数也可以使用@Value注解。

```java
public class SimpleMovieLister {

    private MovieFinder movieFinder;
    private String defaultLocale;

    @Autowired
    public void configure(MovieFinder movieFinder,
            @Value("#{ systemProperties['user.region'] }") String defaultLocale) {
        this.movieFinder = movieFinder;
        this.defaultLocale = defaultLocale;
    }

    // ...
}
public class MovieRecommender {

    private String defaultLocale;

    private CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    public MovieRecommender(CustomerPreferenceDao customerPreferenceDao,
            @Value("#{systemProperties['user.country']}") String defaultLocale) {
        this.customerPreferenceDao = customerPreferenceDao;
        this.defaultLocale = defaultLocale;
    }

    // ...
}
```

## 语言参考

### 文字表达式

支持的文字表达式的类型是字符串，数值(int，real，hex)，布尔值和null。 字符串由**单引号**分隔。 **要将单引号本身放入字符串中，请使用两个单引号字符**。

下面的清单显示了文字的简单用法。 通常，它们不会像这样孤立地使用，而是作为更复杂表达式的一部分，例如在逻辑比较运算符的一侧使用文字。

```java
ExpressionParser parser = new SpelExpressionParser();

// evals to "Hello World"
String helloWorld = (String) parser.parseExpression("'Hello World'").getValue();

double avogadrosNumber = (Double) parser.parseExpression("6.0221415E+23").getValue();

// evals to 2147483647
int maxValue = (Integer) parser.parseExpression("0x7FFFFFFF").getValue();

boolean trueValue = (Boolean) parser.parseExpression("true").getValue();

Object nullValue = parser.parseExpression("null").getValue();
```

数字支持使用负号，指数表示法和小数点。 默认情况下，实数使用Double.parseDouble()进行分析。

### Properties, Arrays, Lists, Maps, Indexers

使用属性引用进行浏览很容易：只需使用句点来指示嵌套的属性值。 

```java
// evals to 1856
int year = (Integer) parser.parseExpression("Birthdate.Year + 1900").getValue(context);

String city = (String) parser.parseExpression("placeOfBirth.City").getValue(context);
```

对于属性名称的第一个字母，不区分大小写。 数组和列表的内容使用方括号表示法获得。

```java
ExpressionParser parser = new SpelExpressionParser();
EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();

// Inventions Array

// evaluates to "Induction motor"
String invention = parser.parseExpression("inventions[3]").getValue(
        context, tesla, String.class);

// Members List

// evaluates to "Nikola Tesla"
String name = parser.parseExpression("Members[0].Name").getValue(
        context, ieee, String.class);

// List and Array navigation
// evaluates to "Wireless communication"
String invention = parser.parseExpression("Members[0].Inventions[6]").getValue(
        context, ieee, String.class);
```

通过指定括号内的文字键值来获得MAP的内容。 在这种情况下，因为Officer MAP的键是字符串，所以我们可以指定字符串文字。

```java
// Officer's Dictionary

Inventor pupin = parser.parseExpression("Officers['president']").getValue(
        societyContext, Inventor.class);

// evaluates to "Idvor"
String city = parser.parseExpression("Officers['president'].PlaceOfBirth.City").getValue(
        societyContext, String.class);

// setting values
parser.parseExpression("Officers['advisors'][0].PlaceOfBirth.Country").setValue(
        societyContext, "Croatia");
```

### 内联lists

列表可以使用`{}`表示法直接在表达式中表达。

```java
// evaluates to a Java list containing the four numbers
List numbers = (List) parser.parseExpression("{1,2,3,4}").getValue(context);

List listOfLists = (List) parser.parseExpression("{{'a','b'},{'x','y'}}").getValue(context);
```

`{}`本身意味着一个空的列表。 出于性能原因，如果列表本身完全由固定文字组成，则会创建一个常量列表来表示表达式，而不是在每个评估中创建一个新列表。

### 内联Maps

也可以使用`{key：value}`表示法在表达式中直接表示Map。

```java
// evaluates to a Java map containing the two entries
Map inventorInfo = (Map) parser.parseExpression("{name:'Nikola',dob:'10-July-1856'}").getValue(context);

Map mapOfMaps = (Map) parser.parseExpression("{name:{first:'Nikola',last:'Tesla'},dob:{day:10,month:'July',year:1856}}").getValue(context);
```

`{:}`本身意味着一张空白的Map。 出于性能原因，如果Map本身由固定文字或其他嵌套常量结构(列表或Map)组成，则将创建常量`Map`来表示表达式，而不是在每次评估中构建新`Map`。 `Map`键的引号是可选的，上面的例子没有使用带引号的键。

### Array构造

可以使用熟悉的Java语法构建数组，可以选择提供初始化程序以在构建时填充数组。

```java
int[] numbers1 = (int[]) parser.parseExpression("new int[4]").getValue(context);

// Array with initializer
int[] numbers2 = (int[]) parser.parseExpression("new int[]{1,2,3}").getValue(context);

// Multi dimensional array
int[][] numbers3 = (int[][]) parser.parseExpression("new int[4][5]").getValue(context);
```

在构建多维数组时，目前不允许提供初始化程序。

### 方法调用

使用典型的Java编程语法调用方法。 你也可以在文字上调用方法。 可变参数也被支持。

```java
// string literal, evaluates to "bc"
String bc = parser.parseExpression("'abc'.substring(1, 3)").getValue(String.class);

// evaluates to true
boolean isMember = parser.parseExpression("isMember('Mihajlo Pupin')").getValue(
        societyContext, Boolean.class);
```

### 运算符

#### 关系运算符

关系运算符： 等于，不等于，小于，小于或等于，大于，大于或等于使用标准操作符表示法支持。

```java
// evaluates to true
boolean trueValue = parser.parseExpression("2 == 2").getValue(Boolean.class);

// evaluates to false
boolean falseValue = parser.parseExpression("2 < -5.0").getValue(Boolean.class);

// evaluates to true
boolean trueValue = parser.parseExpression("'black' < 'block'").getValue(Boolean.class);
```

> 根据一个简单的规则，对空的比较大于/小于：null在这里被视为无(即不为零)。 因此，任何其他值总是大于空(X> null始终为真)，并且其他值永远不会小于(X <null总是为false)。如果您更喜欢数字比较，请避免基于数字的空比较，以便与零比较(例如，X> 0或X <0)。

除标准关系运算符外，SpEL还支持基于instanceof和正则表达式的匹配运算符。

```java
// evaluates to false
boolean falseValue = parser.parseExpression(
        "'xyz' instanceof T(Integer)").getValue(Boolean.class);

// evaluates to true
boolean trueValue = parser.parseExpression(
        "'5.00' matches '^-?\\d+(\\.\\d{2})?$'").getValue(Boolean.class);

//evaluates to false
boolean falseValue = parser.parseExpression(
        "'5.0067' matches '^-?\\d+(\\.\\d{2})?$'").getValue(Boolean.class);
```

> 注意原始类型，因为它们会立即装箱到包装类型，所以如预期的那样，1个instanceof T(int)的计算结果为false，而1个instanceof T(Integer)的计算结果为true。

每个符号运算符也可以被指定为纯粹的字母等值。 这避免了所使用的符号对嵌入表达式的文档类型(例如XML文档)具有特殊含义的问题。 文本等价物如下所示：lt(<)，gt(>)，le(⇐)，ge(> =)，eq(==)，ne(！=)，div(/)，mod(％) ，而不是(！)。 这些不区分大小写。

#### 逻辑运算符

```java
// -- AND --

// evaluates to false
boolean falseValue = parser.parseExpression("true and false").getValue(Boolean.class);

// evaluates to true
String expression = "isMember('Nikola Tesla') and isMember('Mihajlo Pupin')";
boolean trueValue = parser.parseExpression(expression).getValue(societyContext, Boolean.class);

// -- OR --

// evaluates to true
boolean trueValue = parser.parseExpression("true or false").getValue(Boolean.class);

// evaluates to true
String expression = "isMember('Nikola Tesla') or isMember('Albert Einstein')";
boolean trueValue = parser.parseExpression(expression).getValue(societyContext, Boolean.class);

// -- NOT --

// evaluates to false
boolean falseValue = parser.parseExpression("!true").getValue(Boolean.class);

// -- AND and NOT --
String expression = "isMember('Nikola Tesla') and !isMember('Mihajlo Pupin')";
boolean falseValue = parser.parseExpression(expression).getValue(societyContext, Boolean.class);
```

#### 数学运算符

加法运算符可用于数字和字符串。 减法，乘法和除法只能用于数字。 其他支持的数学运算符是模数(％)和指数函数(^)。 标准运算符优先级被强制执行。

```java
// Addition
int two = parser.parseExpression("1 + 1").getValue(Integer.class);  // 2

String testString = parser.parseExpression(
        "'test' + ' ' + 'string'").getValue(String.class);  // 'test string'

// Subtraction
int four = parser.parseExpression("1 - -3").getValue(Integer.class);  // 4

double d = parser.parseExpression("1000.00 - 1e4").getValue(Double.class);  // -9000

// Multiplication
int six = parser.parseExpression("-2 * -3").getValue(Integer.class);  // 6

double twentyFour = parser.parseExpression("2.0 * 3e0 * 4").getValue(Double.class);  // 24.0

// Division
int minusTwo = parser.parseExpression("6 / -3").getValue(Integer.class);  // -2

double one = parser.parseExpression("8.0 / 4e0 / 2").getValue(Double.class);  // 1.0

// Modulus
int three = parser.parseExpression("7 % 4").getValue(Integer.class);  // 3

int one = parser.parseExpression("8 / 5 % 2").getValue(Integer.class);  // 1

// Operator precedence
int minusTwentyOne = parser.parseExpression("1+2-3*8").getValue(Integer.class);  // -21
```

### 赋值

属性的设置是通过使用赋值运算符完成的。 这通常是在对setValue的调用中完成的，但也可以在对getValue的调用中完成。

```java
Inventor inventor = new Inventor();
EvaluationContext context = SimpleEvaluationContext.forReadWriteDataBinding().build();

parser.parseExpression("Name").setValue(context, inventor, "Aleksandar Seovic");

// alternatively
String aleks = parser.parseExpression(
        "Name = 'Aleksandar Seovic'").getValue(context, inventor, String.class);
```

### 类型

特殊的T运算符可用于指定java.lang.Class(类型)的实例。也使用此运算符调用静态方法。`StandardEvaluationContext`使用`TypeLocator`来查找类型，并且可以通过理解java.lang包来构建`StandardTypeLocator`(可以替换它)。 这意味着T()对java.lang中类型的引用不需要完全限定，但所有其他类型引用必须是。

```java
Class dateClass = parser.parseExpression("T(java.util.Date)").getValue(Class.class);

Class stringClass = parser.parseExpression("T(String)").getValue(Class.class);

boolean trueValue = parser.parseExpression(
        "T(java.math.RoundingMode).CEILING < T(java.math.RoundingMode).FLOOR")
        .getValue(Boolean.class);
```

### 构造函数

可以使用new运算符调用构造函数。 除了基本类型和String(可以使用int，float等)之外，全限定类名应该用于所有类。

```java
Inventor einstein = p.parseExpression(
        "new org.spring.samples.spel.inventor.Inventor('Albert Einstein', 'German')")
        .getValue(Inventor.class);

//create new inventor instance within add method of List
p.parseExpression(
        "Members.add(new org.spring.samples.spel.inventor.Inventor(
            'Albert Einstein', 'German'))").getValue(societyContext);
```

### 变量

变量可以使用语法`#variableName`在表达式中引用。 在`EvaluationContext`实现上使用`setVariable`方法设置变量。

```java
Inventor tesla = new Inventor("Nikola Tesla", "Serbian");

EvaluationContext context = SimpleEvaluationContext.forReadWriteDataBinding().build();
context.setVariable("newName", "Mike Tesla");

parser.parseExpression("Name = #newName").getValue(context, tesla);
System.out.println(tesla.getName())  // "Mike Tesla"
```

##### `#this`和`#root`变量

变量`#this`总是指向当前评估对象(针对其解析了非限定参考)。 变量`#root`总是引用根上下文对象。 尽管`#this`可能会随着表达式组件的不同而变化，但`#root`总是指向根。

```java
// create an array of integers
List<Integer> primes = new ArrayList<Integer>();
primes.addAll(Arrays.asList(2,3,5,7,11,13,17));

// create parser and set variable 'primes' as the array of integers
ExpressionParser parser = new SpelExpressionParser();
EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataAccess();
context.setVariable("primes", primes);

// all prime numbers > 10 from the list (using selection ?{...})
// evaluates to [11, 13, 17]
List<Integer> primesGreaterThanTen = (List<Integer>) parser.parseExpression(
        "#primes.?[#this>10]").getValue(context);
```

### 函数

您可以通过注册可在表达式字符串内调用的用户定义函数来扩展SpEL。 该函数通过EvaluationContext进行注册。

```java
Method method = ...;

EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();
context.setVariable("myFunction", method);
```

例如，给定一个反转字符串的实用方法如下所示：

```java
public abstract class StringUtils {

    public static String reverseString(String input) {
        StringBuilder backwards = new StringBuilder(input.length());
        for (int i = 0; i < input.length(); i++)
            backwards.append(input.charAt(input.length() - 1 - i));
        }
        return backwards.toString();
    }
}
```

上述方法可以如下注册和使用：

```java
ExpressionParser parser = new SpelExpressionParser();

EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();
context.setVariable("reverseString",
        StringUtils.class.getDeclaredMethod("reverseString", String.class));

String helloWorldReversed = parser.parseExpression(
        "#reverseString('hello')").getValue(context, String.class);
```



### Bean 引用

如果已经使用bean解析器配置了评估上下文，则可以使用@符号从表达式中查找bean。

```java
ExpressionParser parser = new SpelExpressionParser();
StandardEvaluationContext context = new StandardEvaluationContext();
context.setBeanResolver(new MyBeanResolver());

// This will end up calling resolve(context,"foo") on MyBeanResolver during evaluation
Object bean = parser.parseExpression("@foo").getValue(context);
```

为了访问工厂bean本身，bean名称应该以一个＆符号为前缀。

```java
ExpressionParser parser = new SpelExpressionParser();
StandardEvaluationContext context = new StandardEvaluationContext();
context.setBeanResolver(new MyBeanResolver());

// This will end up calling resolve(context,"&foo") on MyBeanResolver during evaluation
Object bean = parser.parseExpression("&foo").getValue(context);
```

### 三元运算(If-Then-Else)

您可以使用三元运算符来执行表达式中的if-then-else条件逻辑。 一个最小的例子是：

```java
String falseString = parser.parseExpression(
        "false ? 'trueExp' : 'falseExp'").getValue(String.class);
```

在这种情况下，布尔值false将返回字符串值’falseExp'。 下面显示了一个更现实的例子。

```java
parser.parseExpression("Name").setValue(societyContext, "IEEE");
societyContext.setVariable("queryName", "Nikola Tesla");

expression = "isMember(#queryName)? #queryName + ' is a member of the ' " +
        "+ Name + ' Society' : #queryName + ' is not a member of the ' + Name + ' Society'";

String queryResultString = parser.parseExpression(expression)
        .getValue(societyContext, String.class);
// queryResultString = "Nikola Tesla is a member of the IEEE Society"
```

另请参阅下一节的Elvis运算符，以获取三元运算符的更简短的语法。

### The Elvis 运算

Elvis运算符缩短了三元运算符语法，并用于Groovy语言。 使用三元运算符语法，通常必须重复两次变量，例如：

```java
String name = "Elvis Presley";
String displayName = (name != null ? name : "Unknown");
```

相反，你可以使用Elvis操作符。

```java
ExpressionParser parser = new SpelExpressionParser();

String name = parser.parseExpression("name?:'Unknown'").getValue(String.class);
System.out.println(name);  // 'Unknown'
```

下面是一个更复杂的例子

```java
ExpressionParser parser = new SpelExpressionParser();
EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();

Inventor tesla = new Inventor("Nikola Tesla", "Serbian");
String name = parser.parseExpression("Name?:'Elvis Presley'").getValue(context, tesla, String.class);
System.out.println(name);  // Nikola Tesla

tesla.setName(null);
name = parser.parseExpression("Name?:'Elvis Presley'").getValue(context, tesla, String.class);
System.out.println(name);
```

### 安全导航运算符

安全导航运算符用于避免NullPointerException，并且来自Groovy语言。 通常，当您访问对象时，可能需要在访问对象的方法或属性之前验证它是否为空。 为了避免这种情况，安全导航运算符将简单地返回null而不是抛出异常。

```java
ExpressionParser parser = new SpelExpressionParser();
EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();

Inventor tesla = new Inventor("Nikola Tesla", "Serbian");
tesla.setPlaceOfBirth(new PlaceOfBirth("Smiljan"));

String city = parser.parseExpression("PlaceOfBirth?.City").getValue(context, tesla, String.class);
System.out.println(city);  // Smiljan

tesla.setPlaceOfBirth(null);
city = parser.parseExpression("PlaceOfBirth?.City").getValue(context, tesla, String.class);
System.out.println(city);  // null - does not throw NullPointerException!!!
```

### 集合查询

选择是一种强大的表达式语言功能，允许您通过从条目中进行选择来将某个源集合转换为另一个源集合。 选择使用语法`.?[selectionExpression]`。 这将过滤集合并返回包含原始元素子集的新集合。 例如，选择可以让我们轻松获得塞尔维亚发明者名单：

```java
List<Inventor> list = (List<Inventor>) parser.parseExpression(
        "Members.?[Nationality == 'Serbian']").getValue(societyContext);
```

在列表和Map上都可以进行选择。 在前一种情况下，针对每个单独列表元素评估选择标准。Map针对每个映射条目(Java类型Map.Entry的对象)评估选择标准。 Map条目将其键和值作为用于选择的属性进行访问。

这个表达式将返回一个新的Map，该Map由入口值小于27的原始Map的那些元素组成。

```java
Map newMap = parser.parseExpression("map.?[value<27]").getValue();
```

除了返回所有选定的元素之外，还可以检索第一个或最后一个值。 要获得匹配选择的第一个条目，语法是：`^[selectionExpression]`，同时获得最后一个匹配选择的语法是`$[selectionExpression]`。

### 集合投影

投影允许集合驱动子表达式的评估，结果是一个新的集合。 投影的语法是`.![projectionExpression]`。 举例来说，最容易理解的是，假设我们有一个发明者名单，但想要他们出生的城市名单。 实际上，我们想要为发明人列表中的每个条目评估“placeOfBirth.city”。 使用投影：

```java
// returns ['Smiljan', 'Idvor' ]
List placesOfBirth = (List)parser.parseExpression("Members.![placeOfBirth.city]");
```

Map也可以用于驱动投影，在这种情况下，投影表达式将针对Map中的每个条目进行评估(表示为Java Map.Entry)。 在Map上投影的结果是一个列表，其中包含对每个Map项的投影表达式的评估。

### 表达式模板

表达式模板允许将文本文本与一个或多个评估块混合。 每个评估块都使用可定义的前缀和后缀字符进行分隔，常见的选择是使用`＃{}`作为分隔符。 例如:

```java
String randomPhrase = parser.parseExpression(
        "random number is #{T(java.lang.Math).random()}",
        new TemplateParserContext()).getValue(String.class);

// evaluates to "random number is 0.7038186818312008"
```

字符串通过将文本字符串’random number is’与评估表达式的结果进行评估，在这种情况下是调用random()方法的结果。 方法parseExpression()的第二个参数的类型是ParserContext。 ParserContext接口用于影响表达式如何解析以支持表达式模板功能。 TemplateParserContext的定义如下所示。

```java
public class TemplateParserContext implements ParserContext {

    public String getExpressionPrefix() {
        return "#{";
    }

    public String getExpressionSuffix() {
        return "}";
    }

    public boolean isTemplate() {
        return true;
    }
}
```















































































































