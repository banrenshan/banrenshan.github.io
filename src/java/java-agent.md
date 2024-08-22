---
title: 类加载
tags:
  - java
  - jvm
  - agent
categories:
  - java
  - jvm
date: 2024-08-22
---

Java Agent 是一种可以在 Java 程序运行时动态修改其字节码的技术。它允许在不修改原始应用程序代码的情况下，实现对应用程序的监控、性能分析、调试等功能。

## 运行方式

1. 启动时注入：静态加载入口方法为 `premain`，如 `java -javaagent:my-agent.jar -jar app.jar`，在启动 Jar 包时指定要加载的 agent路径，权限较高。
2. 运行时注入：动态加载入口方法为 `agentmain`, 已经通过 `java -jar app.jar` 等方式运行的 JVM，可以动态 Attach 后加载 Agent，权限较低，如无法新增属性、方法等。



两个方法定义如下（定义放在哪个类中都可以，下面会在 `MANIFEST.MF` 文件中声明）：

```java
public class Launcher {
    public static void premain(String agentArgs, Instrumentation inst) {}
    public static void agentmain(String agentArgs, Instrumentation inst) {}
}
```

- 参数中的 `agentArgs` 是传递给 Agent 的参数。例如这样调用 `java -javaagent:my-agent.jar=my-agent-args app.jar`，参数的值是 `"my-agent-args"`。
- 参数中的 `Instrumentation` 是 Java 提供的修改字节码的 API. 通常 Java Agent 作者的任务，就是利用 `Instrumentation` 定位到希望修改的类并做出修改。

> 调用 `Instrumentation.addTransformer` 添加的 transformer 默认只对**未来加载的类** 才会生效。而动态加载(`agentmain`)通常是在应用程序启动后才加载，就会出现添加的 transformer 不生效的情况。对静态加载(`premain`)则一般不会有这个问题，因为它是在 `main` 函数之前加载的，
>
> 动态加载(`agentmain`) 如果想修改 `main` 中就已经加载的类，则需要在添加 transformer 再调用`Instrumentation#retransformClasses` 对已加载的类执行转换才能生效。

### MANIFEST

上面提到 `premain` 和 `agentmain` 可以定义在任何类中，那 JVM 怎么知道去哪找呢？我们需要在 jar 包的 `MANIFEST.MF` 文件中指定 agent 的入口类是什么，以及 agent 会有哪些能力. `src/main/resources/META-INF/MANIFEST.MF:`

```
Premain-Class: me.lotabout.Launcher # 静态加载(premain) Agent 时的入口类
Agent-Class: me.lotabout.Launcher   # 动态加载(agentmain) Agent 时的入口类
Can-Redefine-Classes: true          # 该 Agent 能否重新定义类
Can-Retransform-Classes: true       # 该 Agent 能否修改已有类
Can-Set-Native-Method-Prefix: true  # 是否允许修改 Native 方法的前缀
```

> 是否允许修改 Native 方法的前缀。Native 方法不是字节码实现的，Agent 修改不了它的逻辑。通常修改 Native 是Proxy 的做法，把原有的 Native 方法重命名，新建同名的 Java 方法来调用老方法。此时需要修改 Native 方法前缀的能力。

### 动态加载 Attach

假设我们已经执行了 `java -jar app.jar`，希望加载 `my-agent.jar`，要怎么做？需要利用 [Attach API](https://docs.oracle.com/en/java/javase/21/docs/api/jdk.attach/module-summary.html)。

1. 先得到 `app.jar` 进程的 PID，并 attach 到 `VirtualMachine` 实例：`VirtualMachine vm = VirtualMachine.attach(PID);`
2. 调用 `VirtualMachine#loadAgent("my-agent.jar")` 让 `app.jar` 进程加载 agent

为了方便上述操作，我们可以把这段逻辑写到 `Launcher` 的 `main` 函数中：

```java
public static void main(String[] args)
    throws IOException, AttachNotSupportedException, AgentLoadException, AgentInitializationException {
    String pid = args[0];
    String path = Launcher.class.getProtectionDomain().getCodeSource().getLocation().getPath();
    VirtualMachine vm = VirtualMachine.attach(pid);
    try {
        vm.loadAgent(path);
    } finally {
        vm.detach();
    }
}
```

### Instrumentation API

[Instrumentation](https://docs.oracle.com/en/java/javase/21/docs/api/java.instrument/java/lang/instrument/Instrumentation.html) 的核心抽象是 [ClassFileTransformer](https://docs.oracle.com/en/java/javase/21/docs/api/java.instrument/java/lang/instrument/ClassFileTransformer.html) ，对字节码的修改逻辑都在这个接口中实现，而 Instrumentation 接口则是用来添加、删除 transformer 的。Instrumentation 常见的使用流程（伪代码）为:

```java
// 对于未加载的类，addTransformer 后就能生效
instrument.addTransformer(myTransformer, true);
// 对于已经加载的类，需要调用 retransformClasses 来触发修改
for (Class clazz: instrument.getAllLoadedClasses()) {
    if (needToTransform(clazz)) {
        instrument.retransformClasses(clazz);
    }
}
```

`Instrumentation` 的一些常用接口定义如下：

- `getAllLoadedClasses()` 获取所有加载的类，得到数组后我们可以自己筛选出关心的类
- `redefineClasses(ClassDefinition... definitions)` 使用参数中的类定义重新定义类
- `retransformClasses(Class<?>... classes)` 使用添加的 transformers 修改指定的类
- `addTransformer(ClassFileTransformer transformer)` 注册 `transformer`
- `removeTransformer(ClassFileTransformer transformer)` 注销 `transformer`

#### ClassFileTransformer

对字节码的修改逻辑需要定义在 [ClassFileTransformer](https://docs.oracle.com/en/java/javase/21/docs/api/java.instrument/java/lang/instrument/ClassFileTransformer.html) 的 `transform` 方法中，方法的签名如下：

```java
byte[] transform(ClassLoader loader,
                 String className,
                 Class<?> classBeingRedefined,
                 ProtectionDomain protectionDomain,
                 byte[] classfileBuffer)
    throws IllegalClassFormatException {
}
```

- 通常我们会使用各种信息来过滤掉不感兴趣的类（不想修改就直接直接返回原字节码）。
- 核心输入输出是 `class` 二进制流(`byte[]`)，即 transformer 假定字节码的修改是在二进制层面进行的。

直接修改类的二进制不是人能干的事，于是通常会使用一些库把 `byte[]` 转成一些库定义的结构，操作后再转回 `byte[]` 返回。下面是常用的一些库：

- [asm](https://asm.ow2.io/) JDK 内部也用了它，性能好，但 API 的抽象层度很低
- [javaassist](https://www.javassist.org/) API 的抽象比 ASM 更高，更适合普通用户，支持直接写 Java 源码
- [bytebuddy](https://bytebuddy.net/) API 抽象度更高，例如有专门的 builder 来创建 Agent



## 应用场景

1. 性能监控：可以在方法执行前后插入代码，记录方法的执行时间、调用次数等信息，用于分析程序的性能瓶颈。
   - 例如使用 Java Agent 实现一个简单的方法执行时间监控工具，在方法调用前记录开始时间，方法调用后计算并记录执行时长。
2. 日志记录：在特定的方法或类中自动添加日志记录逻辑，无需在原始代码中手动添加日志语句。
   - 比如在业务关键方法中自动记录输入参数和返回结果，方便后续的问题排查和审计。
3. 安全增强：可以对敏感方法进行访问控制和安全检查，防止未授权的访问。
   - 例如在涉及用户隐私数据的方法上添加访问验证逻辑，确保只有授权的代码才能访问这些数据。
4. 故障排查与调试：在生产环境中，当程序出现问题时，可以使用 Java Agent 动态地添加一些调试信息收集的代码，帮助开发人员快速定位问题。
   - 比如在发生异常的地方自动收集堆栈信息和相关变量的值，并将这些信息发送到监控系统。



