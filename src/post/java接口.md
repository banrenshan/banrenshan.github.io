---
title: Java 接口
date: 2024-04-24
categories:
  - java
tags:
  - java
  - 接口
---

# 接口

在jdk8之后,我们可以在接口中写实现方法了,但是必须使用default或static修饰接口方法,例如:

```java
public interface Lived {
    default String getDescription() {
        return "有生命的";
    }
}
public interface Lived {
    static boolean instanceOf(Object obj) {
        return obj instanceof Lived;
    }
}
```

static修饰的方法使用类名.方法名() 调用，这跟以前的静态方法调用方式一样。

## 接口重载问题

### 实例1

接口A

```java
public interface A {
    default String say() {
        return "A";
    }
}
```

接口B

```java
public interface B {
    default String say() {
        return "B";
    }
}
```

接口C

```java
public interface C extends A,B {

}
```

此时,接口C是不能编译的,错误信息:

```
Error:(6, 8) java: 接口 tets.C从类型 tets.A 和 tets.B 中继承了say() 的不相关默认值
```

解决方案是C必须重载该默认方法,如下:

```java
public interface C extends A,B {

    @Override
    default String say() {
        return "C";
    }
}
```

由此得出,类或者接口不能继承或实现两个包含相同方法的接口,除非重写该方法.但是这种重写相当于在子接口定义了新的默认方法,其实我们更想指定继承A的默认方法,那么应该怎么做呢?

```java
public interface C extends A,B {

    @Override
    default String say() {
        return A.super.say();
    }
}
```

那么问题来了,当我们有类ZZ,分别实现C,B的时候,调用的是谁的方法呢?

```java
public class ZZ implements B,C {

    public static void main(String[] args) {
        ZZ zz=new ZZ();
        String say = zz.say();
        System.err.println(say); //A
    }
}
```

打印出来的是A,由此得出,子类型的接口优先

当接口方法和类方法冲突的时候,又会出现什么样的情况呢?

```java
public class D {
    public String say() {
        return "D";
    }
}
public class ZZ extend D implements B,C {

    public static void main(String[] args) {
        ZZ zz=new ZZ();
        String say = zz.say();//D
        System.err.println(say);
    }
}
```

首先,没有出现像接口那种编译出错的情况.从打印结果看出,类优先于接口

总结一下:

1. 类优先于接口。 如果一个子类继承的父类和接口有相同的方法实现。 那么子类继承父类的方法
2. 子类型中的方法优先于父类型中的方法。
3. 如果以上条件都不满足， 则必须显示覆盖/实现其方法，或者声明成abstract。