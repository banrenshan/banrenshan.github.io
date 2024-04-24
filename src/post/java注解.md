---
title: Java 注解
date: 2024-04-24
categories:
  - java
tags:
  - java
  - 注解 
---

## 重复注解

在 8 以前，同一个程序元素前最多只能有一个相同类型的注解；如果需要在同一个元素前使用多个相同类型的注解，则必须使用注解容器

```java
public @interface Authority {
     String role();
}
public @interface Authorities {     //@Authorities注解作为可以存储多个@Authority注解的容器

    Authority[] value();
}

public class RepeatAnnotationUseOldVersion {

    @Authorities({@Authority(role="Admin"),@Authority(role="Manager")})

    publicvoiddoSomeThing(){

    }
}
```

java8 新增了重复注解，其使用方式为：

```java
@Repeatable(Authorities.class)
public @interface Authority {
     String role();
}

public @interface Authorities {
    Authority[] value();
}

public class RepeatAnnotationUseNewVersion {
    @Authority(role="Admin")
    @Authority(role="Manager")
    publicvoiddoSomeThing(){ }
}
```

不同的地方是，创建重复注解`Authority`时，加上`@Repeatable`,指向存储注解`Authorities`，在使用时候，直接可以重复使用`Authority`注解。从上面例子看出，java 8里面做法更适合常规的思维，可读性强一点。但是，仍然需要定义容器注解。

两种方法获得的效果相同。重复注解知识一种简化写法，这种简化写法是一种假象：多个重复注解其实会被作为“容器”注解的value成员 的数组元素处理。

## 类型注解

Java8为`ElementType`枚举增加了`TYPE_PARAMETER`、`TYPE_USE`两个枚举值，从而可以使用`@Target(ElementType_TYPE_USE)`修饰注解定义，这种注解被称为类型注解，可以用在任何使用到类型的地方。

在java8以前，注解只能用在各种程序元素（定义类、定义接口、定义方法、定义成员变量…）上。从java8开始，类型注解可以用在任何使用到类型的地方。

1. `TYPE_PARAMETER`：表示该注解能写在类型参数的声明语句中。 类型参数声明如： `<T>`、`<T extends Person>`
2. `TYPE_USE`:表示注解可以在任何用到类型的地方使用，比如允许在如下位置使用：
   1. 创建对象（用new关键字创建）
   2. 类型转换
   3. 使用implements实现接口 .使用throws声明抛出异常

```java
@Target(ElementType.TYPE_USE)
@interface NotNull{ }
//定义类时使用
@NotNull
public class TypeAnnotationTest  implements Serializable    //在implements时使用
{
    //在方法形参中使用
 public static void main(@NotNull String [] args)  throws @NotNull  FileNotFoundException //在throws时使用
 {
       Object  obj="fkjava.org";
       //使用强制类型转换时使用
       String str=(@NotNull String) obj;
       //创建对象时使用
       Object win=new (@NotNull) JFrame("疯狂软件");
 }
  //泛型中使用
 public void foo(List<@NotNull String> info)  { }
}
```