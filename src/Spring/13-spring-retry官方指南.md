---
title: Spring Retry 指南
date: 2024-04-20
categories:
  - java
  - spring
tags:
  - spring-retry
---

# 快速入门

spring retry有两种使用方式: 声明式和非声明式.


## 声明式

```java
	@Configuration
	@EnableRetry
	public class Application {

	}

	@Service
	class Service {
	    @Retryable(RemoteAccessException.class)
	    public void service() {
	        // ... do something
	    }
	    @Recover
	    public void recover(RemoteAccessException e) {
	       // ... panic
	    }
	}
```

> 当调用service方法发生`RemoteAccessException`错误的时候,会发生重试(默认重试三次), 如果仍然处于失败状态, 则调用`recover`方法.

@Retryable属性中有很多选项，例如: 包括和排除异常类型，重试次数、回退策略。


> 使用前面显示的 @Retryable注释应用重试处理, 需要引入`spring-aop`包

## 非声明式

```java

	RetryTemplate template = RetryTemplate.builder()
					.maxAttempts(3)
					.fixedBackoff(1000)
					.retryOn(RemoteAccessException.class)
					.build();

	template.execute(ctx -> {
	    // ... do something
	});
```

# 特性和API

## 使用RetryTemplate

RetryOperations 接口如下:

```java
public interface RetryOperations {
    <T> T execute(RetryCallback<T> retryCallback) throws Exception;
    <T> T execute(RetryCallback<T> retryCallback, RecoveryCallback<T> recoveryCallback)
        throws Exception;
    <T> T execute(RetryCallback<T> retryCallback, RetryState retryState)
        throws Exception, ExhaustedRetryException;
    <T> T execute(RetryCallback<T> retryCallback, RecoveryCallback<T> recoveryCallback,
        RetryState retryState) throws Exception;
}
```

RetryCallback 一个简单的接口，可让您插入一些可能需要重试的业务逻辑：

```java
public interface RetryCallback<T> {
    T doWithRetry(RetryContext context) throws Throwable;
}
```


RetryTemplate 是 RetryOperations  的实现, 下面展示了如何使用:

```java

RetryTemplate template = new RetryTemplate();

TimeoutRetryPolicy policy = new TimeoutRetryPolicy();
policy.setTimeout(30000L);

template.setRetryPolicy(policy);

Foo result = template.execute(new RetryCallback<Foo>() {

    public Foo doWithRetry(RetryContext context) {
        // Do stuff that might fail, e.g. webservice operation
        return result;
    }

});
```

在前面的示例中，我们执行Web服务调用并将结果返回给用户。 如果该呼叫失败，则将重新进行直至到达超时。

我们也可以使用 Builder API构建代码:

```java

RetryTemplate.builder()
      .maxAttempts(10)
      .exponentialBackoff(100, 2, 10000)
      .retryOn(IOException.class)
      .traversingCauses()
      .build();

RetryTemplate.builder()
      .fixedBackoff(10)
      .withinMillis(3000)
      .build();

RetryTemplate.builder()
      .infiniteRetry()
      .retryOn(IOException.class)
      .uniformRandomBackoff(1000, 3000)
      .build();

```


## 使用 RetryContext 


重试的方法参数是RetryContext。 许多回调忽略了上下文。 但是，如有必要，您可以将其用作属性袋，以存储迭代期间的数据。

如果在同一线程中有嵌套的重试，则RetryContext具有父上下文。 父上下文有时对于存储需要在执行呼叫之间共享的数据很有用。

## 使用 RecoveryCallback

当重试耗尽时，重试可以将控件传递给其他回调：recoveryCallback。 要使用此功能，客户端可以将回调传递给相同的方法，如以下示例所示：

```java
Foo foo = template.execute(new RetryCallback<Foo>() {
    public Foo doWithRetry(RetryContext context) {
        // business logic here
    },
  new RecoveryCallback<Foo>() {
    Foo recover(RetryContext context) throws Exception {
          // recover logic here
    }
};
```

如果业务逻辑在模板决定中止之前没有成功，则会有机会通过恢复回调进行一些替代处理。


# 无状态重试

在最简单的情况下，重试只是一个段循环：RetryTemplate 可以继续尝试，直到成功或失败为止。RetryContext 包含一些状态，以确定是重试还是流产。 但是，这种状态在堆栈上，并且无需在全局任何地方存储它。 因此，我们称之为“无状态重试”。 RetryPolicy 包含无状态和状态重试之间的区别（重试将两者都可以处理）。 **在无状态重试时，回调始终与重试失败时相同的线程执行**。


# 有状态重试

如果失败导致事务性资源变得无效,则需要一些特殊的考量. 因为这做了数据库更新,尤其在使用Hibernate时.在这种情况下, 重新抛出异常使事务失效回滚,然后开启新的.

在这些情况下，无状态重试还不够好，因为re-throw和回滚必定会离开重试（Execute）方法，并可能失去堆栈上的上下文。为了避免失去上下文，我们必须引入一种存储策略，以将其从堆栈中提取，并将其（至少）放入堆存储中。 为此，Spring Retry提供了一种称为`RetryContextCache`的存储策略，您可以将其注入`RetryTemplate`。

`RetryContextCache`的默认用Map实现。 它具有严格执行的最大容量，以避免内存泄漏，但没有任何高级缓存功能（例如Live的时间）。 您应该考虑注入具有这些功能的Map，如果需要这些功能。 对于在集群环境中具有多个进程的高级用法，您还可以考虑使用某种类型的集群缓存实现`RenryContextCache`。


重试的部分责任是确认失败的操作在新执行中（通常包裹在新的事务中）时。 为了促进这一点，Spring Retry 提供了`RetryState `抽象。 

通过在重试的多个调用中识别状态来确定失败的操作。 为了识别状态，您可以提供一个负责返回标识该项目的唯一密钥的重试对象。 标识符用作`RetryContextCache`中的键。

# 重试策略

`RetryTemplate `中,决定重试还是失败是由`RetryPolicy `决定的, 这也是`RetryContext`的工厂. `RetryTemplate`使用当前策略创建`RetryContext`并将其传入到`RetryCallback `方法上. 回调失败后, `RetryTemplate `必须要求 `RetryPolicy `更新状态(存储在`RetryContext`中).然后，它询问该策略是否可以进行另一次尝试。如果无法进行另一次尝试（例如，由于已经达到了限制或已检测到超时），则该策略还负责确定耗尽的状态 - 但不能用于处理异常。 在没有 `recover`方法的情况下, `retrytemplate`抛出原始异常。 在这种情况下，它会引发`RenryexhaustedException`。 您还可以在`RetryTemplate`中设置标志，以使其无条件地从回调中抛出原始异常。

Spring Renry提供了一些简单的通用实现，对无状态重试Policy（例如Simpleretrypolicy）和前面示例中使用的`TimeOutreTryPoLicy`。

`SimplereTryPolicy`允许在任何命名的异常类型列表中固定次数的重试。 以下示例显示了如何使用它：

```java
// Set the max attempts including the initial attempt before retrying
// and retry on all exceptions (this is the default):
SimpleRetryPolicy policy = new SimpleRetryPolicy(5, Collections.singletonMap(Exception.class, true));

// Use the policy...
RetryTemplate template = new RetryTemplate();
template.setRetryPolicy(policy);
template.execute(new RetryCallback<Foo>() {
    public Foo doWithRetry(RetryContext context) {
        // business logic here
    }
});
```

还有一个更灵活的实现，称为exceptClassifierRetryPolicy。 它使您可以通过异常classifier抽象, 为不同的异常类型配置不同的重试行为。 该策略是通过调用分类器将异常转换为委托的Retrypolicy。


# 回退策略

在失败后重试时，通常会先等待一会儿，然后再尝试。 如果重试再次失败，则可以再延长点时间重试。 以下列表显示了`BackoffPolicy`接口的定义：

```java

public interface BackoffPolicy {

    BackOffContext start(RetryContext context);

    void backOff(BackOffContext backOffContext)
        throws BackOffInterruptedException;

}
```

`BackoffPolicy`可以用任何方式实现,spring retry 使用`Object.wait()` 实现. 一个常见的用例是逐步增加等待期，以避免两次重试抢锁和两者都失败. 对此,spring 提供了 `ExponentialBackoffPolicy `. spring 还提供了延时策略的随机版本.

# 监听器

RetryTemplate 可以注册 RetryListener  实列, RetryListener接口如下:

```java
public interface RetryListener {

    void open(RetryContext context, RetryCallback<T> callback);

    void onSuccess(RetryContext context, T result);

    void onError(RetryContext context, RetryCallback<T> callback, Throwable e);

    void close(RetryContext context, RetryCallback<T> callback, Throwable e);

}

```


```java

template.registerListener(new MethodInvocationRetryListenerSupport() {
      @Override
      protected <T, E extends Throwable> void doClose(RetryContext context,
          MethodInvocationRetryCallback<T, E> callback, Throwable throwable) {
        monitoringTags.put(labelTagName, callback.getLabel());
        Method method = callback.getInvocation()
            .getMethod();
        monitoringTags.put(classTagName,
            method.getDeclaringClass().getSimpleName());
        monitoringTags.put(methodTagName, method.getName());

        // register a monitoring counter with appropriate tags
        // ...

        @Override
        protected <T, E extends Throwable> void doOnSuccess(RetryContext context,
                MethodInvocationRetryCallback<T, E> callback, T result) {

            Object[] arguments = callback.getInvocation().getArguments();

            // decide whether the result for the given arguments should be accepted
            // or retried according to the retry policy
        }

      }
    });
```

# 声明式Retry


```java
@Configuration
@EnableRetry
public class Application {

    @Bean
    public Service service() {
        return new Service();
    }

    @Bean public RetryListener retryListener1() {
        return new RetryListener() {...}
    }

    @Bean public RetryListener retryListener2() {
        return new RetryListener() {...}
    }

}

@Service
class Service {
    @Retryable(RemoteAccessException.class)
    public service() {
        // ... do something
    }
}
```

@Retryable 中的属性可以控制 RetryPolicy 和 BackoffPolicy

```java
@Service
class Service {
    @Retryable(maxAttempts=12, backoff=@Backoff(delay=100, maxDelay=500))
    public service() {
        // ... do something
    }
}
```
前面的示例会在100到500毫秒之间创建一个随机的backoff，最多12次尝试。 还有一个stateful属性（默认值：false）可以控制重试是否是有状态的。 要使用状态重试，拦截的方法必须具有参数，因为它们用于构建状态的缓存key。

`@EnableRetry`注释还寻找`Sleeper `bean , RetryTemplate 和 拦截器中使用的其他策略，以控制运行时重试的行为。

`@EnableRetry`注释为 `@Retryable` Bean创建代理，并且代理（即应用程序中的Bean实例）具有Retryable的接口。 这纯粹是标记接口，但对于其他希望应用重试建议的工具可能很有用（如果Bean已经可以重试，通常不应该打扰）。

如果您想在重试耗尽时提供恢复方法。 方法应与 `@Retryable`实例同一类声明，并标记为`@recover`。 返回类型必须匹配 `@Retryable`方法。 恢复方法的参数可以选择抛出的异常，（可选）传递给原始可重试方法的参数（或其中的部分列表）。 以下示例显示了如何做到的：

```java

@Service
class Service {
    @Retryable(RemoteAccessException.class)
    public void service(String str1, String str2) {
        // ... do something
    }
    @Recover
    public void recover(RemoteAccessException e, String str1, String str2) {
       // ... error handling making use of original args if required
    }
}
```

存在多个recover方法时，您可以明确指定恢复方法名称。 以下示例显示了如何做到的：
```java

@Service
class Service {
    @Retryable(recover = "service1Recover", value = RemoteAccessException.class)
    public void service1(String str1, String str2) {
        // ... do something
    }

    @Retryable(recover = "service2Recover", value = RemoteAccessException.class)
    public void service2(String str1, String str2) {
        // ... do something
    }

    @Recover
    public void service1Recover(RemoteAccessException e, String str1, String str2) {
        // ... error handling making use of original args if required
    }

    @Recover
    public void service2Recover(RemoteAccessException e, String str1, String str2) {
        // ... error handling making use of original args if required
    }
}
```


1.3.2 ,支持方法返回值上的泛型:

```java
@Service
class Service {

    @Retryable(RemoteAccessException.class)
    public List<Thing1> service1(String str1, String str2) {
        // ... do something
    }

    @Retryable(RemoteAccessException.class)
    public List<Thing2> service2(String str1, String str2) {
        // ... do something
    }

    @Recover
    public List<Thing1> recover1(RemoteAccessException e, String str1, String str2) {
       // ... error handling for service1
    }

    @Recover
    public List<Thing2> recover2(RemoteAccessException e, String str1, String str2) {
       // ... error handling for service2
    }

}

````

版本1.2引入了对某些属性使用表达式的能力。 以下示例显示了如何使用表达式的方式：

```java

@Retryable(exceptionExpression="message.contains('this can be retried')")
public void service1() {
  ...
}

@Retryable(exceptionExpression="message.contains('this can be retried')")
public void service2() {
  ...
}

@Retryable(exceptionExpression="@exceptionChecker.shouldRetry(#root)",
    maxAttemptsExpression = "#{@integerFiveBean}",
  backoff = @Backoff(delayExpression = "#{1}", maxDelayExpression = "#{5}", multiplierExpression = "#{1.1}"))
public void service3() {
  ...
}

```

表达式可以包含属性占位符, 例如 `#{${max.delay}} 或 #{@exceptionChecker.${retry.method}(#root)}`, 下面的规则被应用:

* `exceptionExpression `将抛出的异常作为 #root对象
* `maxAttemptsExpression`和`@BackOff` 中的属性表达式再初始化时被评估一次, 他们没有根对象,根据引用的bean决定.

# XML 配置

```xml
<aop:config>
    <aop:pointcut id="transactional"
        expression="execution(* com..*Service.remoteCall(..))" />
    <aop:advisor pointcut-ref="transactional"
        advice-ref="retryAdvice" order="-1"/>
</aop:config>

<bean id="retryAdvice"
    class="org.springframework.retry.interceptor.RetryOperationsInterceptor"/>
```