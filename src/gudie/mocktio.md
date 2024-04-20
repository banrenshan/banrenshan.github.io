---
title: mocktio指南
date: 2024-04-20
categories:
  - java
  - 测试
tags:
  - mocktio
  - 单元测试
---

简单轻量级的做mocking测试的框架：

* mock对象：在测试期间用来作为真实对象的替代品；
* mock测试：在测试过程中，对那些不容易构建的对象用一个虚拟对象来代替测试的方法就叫mock测试；
* stub：打桩，就是为mock对象的方法指定返回值或抛出指定的异常；
* verify：行为验证，验证指定方法调用情况(是否被调用，调用次数等)

## Mock对象

```java
public static <T> T mock(Class<T> classToMock)
public static <T> T mock(Class<T> classToMock, String name) //1
public static <T> T mock(Class<T> classToMock, Answer defaultAnswer)//2
public static <T> T mock(Class<T> classToMock, MockSettings mockSettings)
```

> 1.一般来说，这个名字没啥用。不过，它在调试时可能会有所帮助，因为我们会使用 mock 的名字来追踪错误
>
> 2.Anser用于设定方法的默认返回值
>
> 3.MockSettings接口的方法支持多种自定义设置，例如使用 *invocationListeners* 为当前 mock 上的方法调用注册监听器、使用 *serializable* 配置序列化、使用 *spiedInstance* 指定要监视的实例、使用 *useConstructor* 配置 Mockito 在实例化 mock 时尝试使用构造函数等

### Mocking Static Methods

一般来说，有些人可能会说，在编写干净的面向对象代码时，我们不应该模拟静态类。这通常会暗示我们的应用程序中存在设计问题。为什么？首先，依赖于静态方法的类具有紧密耦合，其次，它几乎总是导致代码难以测试。理想情况下，类不应该负责获取其依赖项，如果可能的话，应该从外部注入它们。当然，这并不总是可能的，有时我们需要模拟静态方法。

```java
public static <T> MockedStatic<T> mockStatic(Class<T> classToMock) 
public static <T> MockedStatic<T> mockStatic(Class<T> classToMock, Answer defaultAnswer)
public static <T> MockedStatic<T> mockStatic(Class<T> classToMock, String name)
public static <T> MockedStatic<T> mockStatic(Class<T> classToMock, MockSettings mockSettings)
```

```java
    @Test
    public void test1() {
        MockedStatic<StringUtils> mocked = Mockito.mockStatic(StringUtils.class);
        mocked.when(() -> StringUtils.toLower("AA")).thenReturn("aa");
        Assertions.assertEquals("aa", StringUtils.toLower("AA"));
    }
```

## 方法打桩

### mock有返回值的方法

```java
Mockito.when(mocktioDemo.add(1, 2)).thenReturn(3);
int num = mocktioDemo.add(1, 2);
Assertions.assertEquals(3, num);
```

### mock方法执行异常

```java
Mockito.when(mocktioDemo.add(1, -1)).thenThrow(NullPointerException.class);
Assertions.assertThrows(NullPointerException.class, () -> mocktioDemo.add(1, -1));
```

### mock void方法

```java
Mockito.doThrow(NullPointerException.class).when(mocktioDemo).print();
Assertions.assertThrows(NullPointerException.class, () -> mocktioDemo.print());
```

```java
Mockito.doNothing().when(mocktioDemo).print();
mocktioDemo.print();
Mockito.verify(mocktioDemo).print();
```

### mock回调方法





## 参数匹配器

```java
doReturn("Flower").when(flowerService).analyze("poppy");
```

在上面的例子中，只有当`FlowerService`的`analyze`方法接收到字符串`poppy`时，才会返回字符串`Flower`。
但可能存在这样一种情况，即我们需要对更广泛的参数做出反应。在这些场景中，我们可以使用参数匹配器配置模拟方法：

```java
when(flowerService.analyze(anyString())).thenReturn("Flower");
```

我们也可以自定义参数匹配器：

```java
public class MessageMatcher implements ArgumentMatcher<Message> {
    @Override
    public boolean matches(Message right) {
        return true;
    }
}
```

自定义参数匹配器和ArgumentCaptor这两种技术都可以用于确保某些参数被传递给mock。然而，如果我们需要ArgumentCaptor在参数值上断言以完成验证，或者我们的自定义参数匹配器不太可能被重用，那么它可能更适合。通过ArgumentMatcher的自定义参数匹配器通常更适合存根。

## 验证

验证方法被调用：

```java
mocktioDemo.add(1, 1);
Mockito.verify(mocktioDemo).add(1, 1);
Mockito.verify(mocktioDemo).add(1, 2); //failed
```

验证方法被调用的次数：

```java
mocktioDemo.add(1, 1);
mocktioDemo.add(1, 1);
Mockito.verify(mocktioDemo,Mockito.times(2)).add(1, 1);
```

```java
mocktioDemo.add(1, 1);
mocktioDemo.add(1, 1);
Mockito.verify(mocktioDemo,Mockito.atLeast(1)).add(1, 1);
```

```java
mocktioDemo.add(1, 1);
mocktioDemo.add(1, 1);
Mockito.verify(mocktioDemo,Mockito.atMost(2)).add(1, 1);
```

```java
Mockito.verify(mocktioDemo,Mockito.never()).add(1);
```

验证方法没有被调用：

```java
Mockito.verifyNoInteractions(mocktioDemo);
```

验证方法调用的次序：

```java
mocktioDemo.add(1, 1);
mocktioDemo.add(1, 2);
InOrder inOrder = Mockito.inOrder(mocktioDemo);
inOrder.verify(mocktioDemo).add(1,1);
inOrder.verify(mocktioDemo).add(1,2);
```

验证与确切参数的交互：

```java
mocktioDemo.add(1, 1);
Mockito.verify(mocktioDemo).add(1,1);
```

验证与灵活/任意参数的交互：

```java
mocktioDemo.add(1, 1);
Mockito.verify(mocktioDemo).add(Mockito.anyInt(),Mockito.anyInt());
```

```java
mocktioDemo.add(1, 1);
// Mockito.verify(mocktioDemo).add(Mockito.anyInt(),1); failed
Mockito.verify(mocktioDemo).add(Mockito.anyInt(),Mockito.eq(1));
```

使用参数捕获验证交互：

```java
mocktioDemo.add(1, 1);
ArgumentCaptor<Integer> argumentCaptor = ArgumentCaptor.forClass(Integer.class);
Mockito.verify(mocktioDemo).add(argumentCaptor.capture(), argumentCaptor.capture());

List<Integer> allValues = argumentCaptor.getAllValues();
Object[] array = allValues.toArray();
Assertions.assertArrayEquals(array, new Object[]{1, 1});
```

## 常用注解

使用注解之前，需要先启用。有两种方式：

* **在JUnit 上设置 MockitoJUnitRunner**
* 调用 **MockitoAnnotations.openMocks()** 方法

在下面讲解具体注解的时候，会使用上面的方式一一演示。下面是被测试的类：

```java
public class MocktioDemo {

    private List<Integer> list;

    public int add(int a, int b) {
        return a + b;
    }

    public boolean add(int a) {
        return list.add(a);
    }
}
```

### @Mock

*@Mock* 是 Mockito 中用的最多的注解，我们用它来创建并注入mock对象，而不用手动调用 *Mockito.mock* 方法

```java
@ExtendWith(MockitoExtension.class)
public class MocktioDemoTest1 {

    @Mock
    MocktioDemo mocktioDemo;

    @Test
    public void test1() {
        Mockito.when(mocktioDemo.add(1, 1)).thenReturn(2);
        int num = mocktioDemo.add(1, 1);
        Assertions.assertEquals(2, num);
    }
}
```

### @Spy

@Spy注释用于创建一个真实对象并监视这个真实对象。@Spy对象能够调用所监视对象的所有方法，同时仍然跟踪每一次交互，就像我们使用mock一样，可以自己定义行为

```java
public class MocktioDemoTest2 {

    @Spy
    MocktioDemo mocktioDemo;

    @BeforeEach
    public void before() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void test1() {
        int num = mocktioDemo.add(1, 2);
        Assertions.assertEquals(3, num);
        Mockito.when(mocktioDemo.add(1, 2)).thenReturn(5);
        num = mocktioDemo.add(1, 2);
        Assertions.assertEquals(3, num); // expected: <3> but was: <5>
    }
}
```

### @Captor 

`@Captor`注释用于创建`ArgumentCaptor`实例，该实例用于捕获方法参数值，来用于进一步做断言验证。

```java
@ExtendWith(MockitoExtension.class)
public class MocktioDemoTest3 {
    @Spy
    MocktioDemo mocktioDemo;
    @Captor
    ArgumentCaptor<Integer> p1;
    @Captor
    ArgumentCaptor<Integer> p2;


    @Test
    public void test1() {
        mocktioDemo.add(2, 2);
        Mockito.verify(mocktioDemo).add(p1.capture(), p2.capture());
        Assertions.assertEquals(2, p1.getValue());
        Assertions.assertEquals(2, p2.getValue());
    }
}
```

### @InjectMocks

在mockito中，我们需要创建被测试的类对象，然后插入它的依赖项(mock)来完全测试行为。因此，我们要用到 **@InjectMocks** 注释。

`@InjectMocks` 标记了一个应该执行注入的字段。Mockito会按照下面优先级通过**构造函数注入**、**setter注入**或**属性注入**，来尝试注入你标识的mock。如果上面三种任何给定的注入策略注入失败了，Mockito不会报错。

```java
@ExtendWith(MockitoExtension.class)
public class MocktioDemoTest4 {
    @InjectMocks
    MocktioDemo mocktioDemo;

    @Mock
    List<Integer> list;

    @Test
    public void test1() {
        Mockito.when(list.add(1)).thenReturn(true);
        Mockito.when(list.add(2)).thenReturn(false);
        boolean r1 = mocktioDemo.add(1);
        boolean r2 = mocktioDemo.add(2);
        Assertions.assertEquals(true, r1);
        Assertions.assertEquals(false, r2);
    }
}
```

## BBD

BDD一词最早由Dan North于2006年创造。BDD鼓励用自然的、人类可读的语言编写测试，重点关注应用程序的行为。
它定义了一种结构清晰的测试编写方式，分为三个部分(预设、动作、断言）：

* 给定一些先决条件(Arrange）
* 当动作发生时(Act）
* 然后验证输出(Assert）

Mockito库附带了一个BDDMockito类，该类引入了BDD友好的API。这个API允许我们采用一种更加BDD友好的方法，使用given()安排我们的测试，并使用then()进行断言。
Mockito的使用方式是 *when(obj)*.*then\*()* ，然后使用 *verify()* 。BDDMockito为各种Mockito方法提供了BDD别名，因此我们可以使用***given\* (instead of \*when\*)**来编写Arrange步骤，同样，我们可以使用then(而不是验证）来编写Assert步骤。

传统方式：

```java
when(phoneBookRepository.contains(momContactName))
  .thenReturn(false);
 
phoneBookService.register(momContactName, momPhoneNumber);
 
verify(phoneBookRepository)
  .insert(momContactName, momPhoneNumber);
```

BBD方式：

```java
given(phoneBookRepository.contains(momContactName))
  .willReturn(false);
 
phoneBookService.register(momContactName, momPhoneNumber);
 
then(phoneBookRepository)
  .should()
  .insert(momContactName, momPhoneNumber);
```
