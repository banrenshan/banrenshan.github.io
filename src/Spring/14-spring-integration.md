---
title: Spring Integration 指南
date: 2024-04-20
categories:
  - java
  - spring
tags:
  - Spring Integration
---



Spring Integration 将spring 的编程模型扩展到消息领域。 它支持消息的路由和转换，以便可以集成不同的传输和不同的数据格式。 换句话说，框架来处理消息传递和集成问题。 业务组件与基础架构进一步隔离，开发人员可以减轻复杂的整合职责。

# 主要组件

从垂直的角度来看，分层架构有助于分离关注点，而在层之间的基于接口的合同促进了松散的耦合。 spring 和其衍生框架通常基于这种最佳实践。消息驱动的体系结构增加了水平观点， 正如“分层体系结构”是一种非常通用和抽象的范式一样，消息传递系统通常遵循类似的抽象“管道和过滤器”模型。 “过滤器”代表能够产生或消费消息的任何组件，“管道”在过滤器之间传输消息，以使组件本身保持松散耦合。 重要的是要注意，这两个高级范式不是相互排斥的。 支持“管道”的基础消息架构仍应封装在其合同被定义为接口的层中。 同样，“过滤器”应在应用程序的服务层上方的层中进行管理，并通过接口与这些服务交互方式，与Web层的方式相同。


## 消息

消息主要有payload和header组成。 payload可以是任何类型， header通常包含一些通用信息，例如时间戳，id等。 

![Message](images\message.jpg)

## 消息通道

消息通道表示 管道-过滤器架构中的管道， 生产者将消息发送到管道，消费者从管道接收消息。 消息通道可以拦截消息和监听消息。

![消息通道](images\channel.jpg)

消息通道可以遵循点对点或发布订阅语义。 使用点对点频道，不超过一个消费者可以接收到该通道的消息。 Publish-Subscribe频道尝试向频道上的所有用户广播每条消息。

还有另一个重要的考虑因素：通道是否应该缓冲消息？ 在 spring Integration 中，pollable通道能够在队列内缓冲消息。 缓冲的优点是，它允许对入站消息进行限制，从而防止消费者过载。 但是， 这也增加了一些复杂性，因为消费者只能在配置poller的情况下从该通道中接收消息。 另一方面，连接到可订阅通道的消费者仅是消息驱动的。


## 消息端点

Spring Integration的主要目标之一是通过控制反转来简化企业集成解决方案的开发。 这意味着您不必直接实现消费者和生产者，甚至不必在消息频道上构建消息并调用发送或接收操作。 相反，您应该能够通过基于普通对象的实现来专注于特定域模型。 然后，通过提供声明性配置，您可以将特定于域的代码“连接”到Spring Integration提供的消息基础结构。 负责这些连接的组件是消息端点。

这并不意味着您应该直接连接现有的应用程序代码。 任何现实世界中的企业集成解决方案都需要一定数量的代码，这些代码侧重于集成问题，例如路由和转换。 重要的是要实现集成逻辑与业务逻辑之间关注的分离。 换句话说，与用于Web应用程序的模型视图控制器（MVC）范式一样，目标应该是提供一个薄但专用的层，将入站请求转化为服务层调用，然后将服务层返回值转换为外站回复。 


# 消息端点

消息端点代表管道和过滤器架构的“过滤器”。 如前所述，端点的主要角色是将应用程序代码连接到消息框架，并以非侵入性方式进行。 换句话说，理想情况下，应用程序代码应该对消息对象或消息频道没有意识。这类似于控制器在MVC范式中的作用。 就像控制器处理HTTP请求一样，消息端点也处理消息。 正如控制器映射到URL模式一样，消息端点将映射到消息频道。 在两种情况下，目标都是相同的：从基础架构中隔离应用程序代码。 


## 消息转化器

消息转换器负责转换消息的内容或结构并返回修改后的消息。 最常见的转换器类型可能是将消息的payload从一种格式转换为另一种格式（例如从xml到java.lang.string）。 同样，转换器可以添加，删除或修改消息的header。

## 消息过滤器

消息过滤器决定是否应该将消息传递给输出通道。 这仅需要一种布尔测试方法，该方法可能会检查特定的有效负载内容类型，属性值，header或其他条件。 如果消息被接受，则将其发送到输出通道。 如果没有，它将被删除（或者，对于更严重的实现，可能会抛出一个异常）。 消息过滤器通常与Publish-Subscriber频道结合使用，在该通道中，多个消费者可能会收到相同的消息并使用过滤器来缩小要处理的消息集。

## 消息路由器

消息路由器负责决定下一个频道应接收消息。 通常，该决定基于可用的消息的内容或消息标题中可用的元数据。 消息路由器通常用作动态配置输出通道。

![Router](images\router.jpg)

## 消息拆分器

其责任是从其输入通道中接受消息，将该消息分为多个消息，然后将它们发送到其输出频道。

## 消息聚合器

它接收多个消息并将它们组合到单个消息中。 实际上，聚合器通常是包括分离器的管道中的下游消费者。 从技术上讲，聚合器比分离器更复杂，因为它必须维护状态（要汇总的消息），决定何时聚合，并在必要时进行超时。此外，在超时的情况下，聚合器需要知道是否发送部分结果，丢弃它们或将其发送到单独的频道。 Spring Integration提供了一个相关性策略。

## 服务激活器

服务激活器是将服务实例连接到消息系统的通用端点。 必须配置输入消息通道，并且，如果要调用的服务方法能够返回值，则还可以提供输出消息频道。

> 输出通道是可选的，因为每条消息还可以提供自己的“返回地址”标头。 该规则适用于所有消费者端点。

服务激活器调用某些服务对象上的操作来处理请求消息，提取请求消息的有效负载和转换。 每当服务对象的方法存在返回值时，如果有必要，该返回值同样会转换为答复消息。 该回复消息发送到输出频道。 如果未配置输出频道，则该答复将发送到消息的“返回地址”中指定的频道（如果有）。

Request-Reply服务激活器端点将目标对象的方法连接到输入和输出消息通道。

![处理程序端点](images\handler-endpoint.jpg)


如前所述，在消息渠道中，通道可以是可拉取的或可订阅的。 在上图中，这是由“时钟”符号和实心箭头（可拉取）和虚线箭头（订阅）描述的。

## 通道适配器

通道适配器是将消息通道连接到其他系统或传输的端点。 通道适配器可以是入站或出站。 通常，频道适配器在消息之间进行一些映射。 根据传输，通道适配器还可以填充或提取消息标头值。 

![源端点](images\source-endpoint.jpg)



![目标端点](images\target-endpoint.jpg)


## 端点的bean 名称

消费端点（带有输入通道的任何东西）由两个bean组成，即消费者和消息处理程序。 消费者对消息处理程序有引用，并在消息到达时调用它。 如下面的xml配置：

```xml

<int:service-activator id = "someService" ... />

```
* 消费者: someService (the id)
* 消息处理器: someService.handler

使用企业集成模式（EIP）注释时，名称取决于几个因素。 考虑以下注释POJO的示例：

```java
@Component
public class SomeComponent {

    @ServiceActivator(inputChannel = ...)
    public String someMethod(...) {
        ...
    }

}
```

* Consumer: someComponent.someMethod.serviceActivator 

* Handler: someComponent.someMethod.serviceActivator.handler

从版本5.0.4开始，您可以使用@endpointID注释修改这些名称，如下示例显示：

```java

@Component
public class SomeComponent {

    @EndpointId("someService")
    @ServiceActivator(inputChannel = ...)
    public String someMethod(...) {
        ...
    }

}
```

* Consumer: someService
* Handler: someService.handler

@EndPointID创建由ID属性指定的bean名称。 考虑以下注释bean的示例：

```java
@Configuration
public class SomeConfiguration {

    @Bean
    @ServiceActivator(inputChannel = ...)
    public MessageHandler someHandler() {
        ...
    }

}
````

* Consumer: someConfiguration.someHandler.serviceActivator
* Handler: someHandler (the @Bean name)

从版本5.0.4开始，您可以使用@endpointID注释修改这些名称，如下示例显示：

```java
@Configuration
public class SomeConfiguration {

    @Bean("someService.handler")             
    @EndpointId("someService")               
    @ServiceActivator(inputChannel = ...)
    public MessageHandler someHandler() {
        ...
    }

}

```

* Handler: someService.handler (the bean name)
* Consumer: someService (the endpoint ID)

@EndpointId 创建bean 名称(如xml配置中id属性的值) ， 只要你遵守 在 @Bean 追加 .handler的约定

在一个特殊情况下，创建了第三个bean：出于架构原因，如果MessageHandler @BEAN没有定义AbstractractractroploducingMessageHandler，则该框架将提供的Bean包装在ReplyProducingMessageHandlerWrapper中。 该包装器支持请求处理程序建议处理，并发出正常的“未答复”调试日志消息。 它的bean名称是处理程序bean name plus .wrapper（有@EndPointID时 - 否则，它是普通生成的处理程序名称）。

# 核心消息

本节介绍Spring Integration中核心消息传递API的所有方面。它包括消息、消息通道和消息端点。它还涵盖了许多企业集成模式，如过滤器、路由器、转换器、服务激活器、拆分器和聚合器。

## 消息通道

虽然`Message`在封装数据方面发挥着关键作用，但将消息生产者与消息消费者分离开来的是`MessageChannel`。

### MessageChannel 接口

```java
public interface MessageChannel {

    boolean send(Message message);

    boolean send(Message message, long timeout);
}
```

发送消息时，如果消息发送成功，则返回值为`true`。如果发送调用超时或被中断，它将返回`false`。

##### `PollableChannel`

由于消息通道可能会缓冲消息，下面的清单显示了`PollableChannel`接口的定义：

```java
public interface PollableChannel extends MessageChannel {

    Message<?> receive();

    Message<?> receive(long timeout);

}
```

与`send`方法一样，当接收到消息时，在超时或中断的情况下，返回值为 null。

##### `SubscribableChannel`

`SubscribableChannel`接口是通过将消息直接发送到其订阅的`MessageHandler`实例的通道来实现的。因此，它们不提供用于轮询的接收方法。相反，他们定义了管理这些订阅者的方法。下面的清单显示了`SubscribableChannel`接口的定义：

```java
public interface SubscribableChannel extends MessageChannel {

    boolean subscribe(MessageHandler handler);

    boolean unsubscribe(MessageHandler handler);

}
```

### MessageChannel 实现

Spring 集成提供了几种不同的消息通道实现方式





### Channel 拦截器



### MessagingTemplate





### 配置消息通道



### 特殊通道

