



# 指标

**指标**是在运行时捕获的服务的**度量**值。捕获测量值的时刻称为**度量事件**，它不仅包括测量值本身，还包括捕获测量值的时间和关联的元数据。

## `MeterProvider`、Meter 、Exporter 

`MeterProvider`是 `Meter`的工厂。在大多数应用程序中，`MeterProvider`初始化一次，其生命周期与应用程序的生命周期匹配。`MeterProvider`初始化还包括 Resource 和 Exporter 初始化。

Meter 创建 [metric instruments](https://opentelemetry.io/docs/concepts/signals/metrics/#metric-instruments), 在运行时捕获有关服务的度量值。

Metric Exporters 将指标数据发送给使用者。此使用者可以是开发过程中调试的标准输出、`OpenTelemetry `收集器或您选择的任何开源或供应商后端。

## Metric Instruments

在 `OpenTelemetry `中，测量值由**公制仪器**捕获。公制工具的定义如下：

- Name: 名字
- Kind: 类
- Unit: (optional) 单位（可选）
- Description: (optional) 描述（可选）

仪器类型为以下类型之一：

* **Counter**: 随着时间的推移而累积的值——你可以把它想象成汽车上的里程表;它只会上升。
* **`UpDownCounter`**：随着时间的推移而累积，但也可能再次下降。例如，队列长度会随着队列中的工作项数量而增加和减少。
* **Asynchronous Counter**: **异步计数器**，与**计数器**相同，**同步在每次操作后立即更新，异步则是在指定的间隔后更新**。
* **Asynchronous `UpDownCounter`**：与 **`UpDownCounter`** 相同，但每次导出都收集一次,但每次导出都收集一次。如果您无权访问连续增量，而只能访问聚合值，则可以使用此选项。
* **Gauge**：在读取电流值时测量电流值。一个例子是车辆中的燃油表。仪表是异步的。
* **Histogram**：值的客户端聚合，例如请求延迟。如果您对值统计信息感兴趣，直方图是一个不错的选择。例如：有多少个请求花费的时间少于 1 秒？



> 同步工具（例如[计数器](https://opentelemetry.io/docs/specs/otel/metrics/api/#counter)）旨在与应用程序/业务处理逻辑内联调用。例如，HTTP 客户端可以使用计数器来记录它已接收的字节数。同步仪器记录的[测量值](https://opentelemetry.io/docs/specs/otel/metrics/api/#measurement)可以与[上下文](https://opentelemetry.io/docs/specs/otel/context/)相关联。
>
> 异步工具（例如 [Asynchronous Gauge](https://opentelemetry.io/docs/specs/otel/metrics/api/#asynchronous-gauge)）为用户提供了一种注册回调函数的方法，并且回调函数只会在需求时调用。例如，一个嵌入式软件可以使用异步仪表每 15 秒从传感器收集一次温度，这意味着回调函数将每 15 秒调用一次。异步仪器记录的[测量值](https://opentelemetry.io/docs/specs/otel/metrics/api/#measurement)不能与[上下文](https://opentelemetry.io/docs/specs/otel/context/)相关联。

## Aggregation 

除了公制工具之外，**聚合**的概念也是一个需要理解的重要概念。聚合是一种技术，通过该技术，将大量测量值合并为有关在时间窗口内发生的度量事件的精确或估计统计信息。`OTLP `协议传输此类聚合指标。`OpenTelemetry API` 为每个工具提供默认聚合，可以使用视图覆盖该聚合。`OpenTelemetry `项目旨在提供可视化工具和遥测后端支持的默认聚合。







# 日志

## `LoggerProvider`、Logger 、Exporter 

`LoggerProvider`是 `Logger`的工厂。在大多数情况下，`LoggerProvider `初始化一次，其生命周期与应用程序的生命周期匹配。`LoggerProvider `初始化还包括 `Resource `和 `Exporter `初始化。

Logger 创建Log Record 。 log Exporter 将日志记录发送给使用者。此使用者可以是调试和开发时的标准输出、`OpenTelemetry Collector` 或您选择的任何开源或供应商后端。

## Log Record 

日志记录表示事件的记录。在 `OpenTelemetry `中，日志记录包含两种类型的字段：

* 具有特定类型和含义的命名顶级字段
* 任意值和类型的资源和属性字段

顶级字段包括：

| 字段名称                | Description 描述               |
| ----------------------- | ------------------------------ |
| `Timestamp `            | 事件发生的时间。               |
| `ObservedTimestamp`     | 观察到事件的时间。             |
| `TraceId`               |                                |
| `SpanId`                |                                |
| `TraceFlags `           | `W3C `跟踪标志。               |
| `SeverityText`          | 严重性文本（也称为日志级别）。 |
| `SeverityNumber`        | 严重性的数值。                 |
| `Body `                 | 日志记录的正文。               |
| `Resource`              | 描述日志的源。                 |
| `InstrumentationScope ` | 描述发出日志的作用域。         |
| `Attributes `           | 有关事件的其他信息。           |



# Baggage 

`Baggage`通常用于跟踪，以在服务之间传播其他数据。在 `OpenTelemetry `中，`Baggage `是位于上下文旁边的上下文信息。Baggage 是一个键值存储，这意味着它允许您将您喜欢的任何数据与[上下文](https://opentelemetry.io/docs/concepts/context-propagation/#context)一起[传播](https://opentelemetry.io/docs/concepts/context-propagation/#propagation)。

`Baggage `意味着您可以在服务和流程之间传递数据，从而可以将其添加到这些服务的[跟踪](https://opentelemetry.io/docs/concepts/signals/traces/)、[指标](https://opentelemetry.io/docs/concepts/signals/metrics/)或[日志](https://opentelemetry.io/docs/concepts/signals/logs/)中。

例如，假设您在请求开始时有一个 `clientId`，但您希望该 ID 在跟踪中的所有Span、另一个服务中的一些指标以及沿途的一些日志上可用。由于跟踪可能跨越多个服务，因此您需要某种方法来传播该数据，而无需在代码库中的许多位置复制 `clientId`。通过使用[上下文传播](https://opentelemetry.io/docs/concepts/signals/traces/#context-propagation)在这些服务之间传递`Baggage`，可以将 `clientId` 添加到任何其他Span、指标或日志中。此外，instrumentations 会自动为您传播`Baggage`。

关于 `baggage `需要注意的重要一点是，它是一个单独的键值存储，并且在未明确添加它们的情况下，不与Span、指标或日志上的属性关联。要将`baggage `条目添加到属性中，您需要明确读取`baggage `中的数据，并将其作为属性添加到您的span、指标或日志中。





# Trace

## 上下文

上下文是一个对象，其中包含发送和接收服务或执行单元的信息，用于将一个信号与另一个信号相关联。例如，如果服务 A 调用服务 B，在上下文中，服务 A 的 span 将用作在服务 B 中创建的下一个span 的父 span。上下文中的 trace ID 也将用于在服务 B 中创建的下一个 span，这意味着该span与服务 A 的 span 属于同一跟踪的一部分。

上下文传播是在服务和进程之间移动上下文的机制。它序列化或反序列化上下文对象，并提供要从一个服务传播到另一个服务的相关信息。

传播通常由检测库处理，对用户是透明的。如果需要手动传播上下文，可以使用传播器`API`。`OpenTelemetry `维护着几个官方传播器。默认传播器使用` W3C TraceContext` 规范指定的标头。

## `TracerProvider`、Tracer、Exporters

`TracerProvider`是 `Tracer`的工厂。在大多数应用程序中，`TracerProvider`初始化一次，其生命周期与应用程序的生命周期匹配。`TracerProvider `初始化还包括 `Resource `和 `Exporter `初始化。这通常是使用 `OpenTelemetry `进行跟踪的第一步。

`Tracer `创建的`Span`包含有关给定操作（例如服务中的请求）所发生情况的更多信息。`Tracer`是从`TracerProvider`创建的。

`Trace Exporters` 将 `Trace`发送给使用者。此使用者可以是调试和开发时的标准输出、`OpenTelemetry Collector `或您选择的任何开源或供应商后端。

## Span

### Context

Span context 是每个 span 上的不可变对象，其中包含以下内容：

* Trace ID
* Span ID
* Trace Flags: 一种二进制编码，包含有关跟踪的信息
* Trace State: 可以携带供应商特定跟踪信息的键值对列表

跨度上下文是跨度的一部分，它和[Baggage](https://opentelemetry.io/docs/concepts/signals/baggage)一起序列化和传播。由于 Span Context 包含跟踪 ID，因此在创建 [Span 链接](https://opentelemetry.io/docs/concepts/signals/traces/#span-links)时会使用它。

### Attributes

属性是包含元数据的键值对，您可以使用这些元数据来注释 `Span`，以携带有关它正在跟踪的操作的信息。

### Event

`Span Event `可以看作是 Span 上的结构化日志消息（或注释），通常用于表示 Span 持续时间内有意义的单一时间点。

> 如果操作完成的时间戳有意义或相关，请将数据附加到 span 事件。如果时间戳没有意义，请将数据附加为 span 属性。

### Link

链接可以将一个跨度与一个或多个跨度相关联，这意味着因果关系

例如一些操作的响应，会有一个其他操作排队等待执行，但其执行是异步的。我们希望将后续操作的`Span`与第一个`Span`相关联，但我们无法预测后续操作的开始时间。我们需要关联这两条`Span`，因此我们将使用 `span`链接。

您可以将第一个跟踪的最后一个Span链接到第二个跟踪中的第一个`Span`。现在，它们彼此之间有因果关系。

### Status

每个跨度都有一个状态。三个可能的值是：

- `Unset`, 默认值, 意味着它跟踪的操作已成功完成，且没有错误
- `Error`,跟踪的操作中发生了一些错误。例如，这可能是由于处理请求的服务器上的 HTTP 500 错误造成的。
- `Ok`, 意味着应用程序的开发人员明确将 span 标记为无错误。

> Unset 表示已完成且没有错误的跨度。`Ok `表示开发人员何时明确将跨度标记为成功。在大多数情况下，没有必要将跨度明确标记为 `Ok`。

### Kind

Kind有下面几类：

* Client
* Server
* Internal
* Producer 
* Consumer 

这种跨度类型为跟踪后端提供了有关如何组装跟踪的提示。根据 `OpenTelemetry `规范，服务器Span的父级通常是远程客户端`Span`，而客户端`Span`的子级通常是服务器`Span`。同样，消费者`Span`的父级始终是生产者，而生产者跨度`Span`的子级始终是消费者。如果未提供，则假定 `span `类型为`Internal`类型。

# `OpenTelemetry `Java

OpenTelemetry Java 由以下存储库组成：

* [opentelemetry-java](https://github.com/open-telemetry/opentelemetry-java)：用于手动检测的组件，包括 API 和 SDK 以及扩展。
* [opentelemetry-java-docs](https://github.com/open-telemetry/opentelemetry-java-docs#java-opentelemetry-examples)：手动检测示例。
* [opentelemetry-java-instrumentation](https://github.com/open-telemetry/opentelemetry-java-instrumentation)：构建在 opentelemetry-java 之上，提供 Java 代理 JAR，可以连接到任何 Java 8+ 应用程序，并动态注入字节码以从许多流行的库和框架中捕获遥测数据。
* [opentelemetry-java-contrib](https://github.com/open-telemetry/opentelemetry-java-contrib)：提供有用的库和基于 OpenTelemetry 的独立实用程序，这些实用程序不适合 OpenTelemetry Java 或 Java Instrumentation 项目的明确范围。例如，JMX 指标收集。
* [semantic-conventions-java](https://github.com/open-telemetry/semantic-conventions-java)：[OpenTelemetry语义约定](https://opentelemetry.io/docs/specs/semconv/)的 Java 实现。例如，`ResourceAttributes.SERVICE_NAME`。
* [opentelemetry-proto-java](https://github.com/open-telemetry/opentelemetry-proto-java)：[OpenTelemetry 协议 （OTLP）](https://opentelemetry.io/docs/specs/otlp/) 的 Java 绑定。



## 配置

> 任何可以使用系统属性配置的设置也可以使用环境变量进行配置。应用以下步骤将系统属性转换为环境变量：
>
> * 将名称转换为大写。
> * 将所有 `·` 和 `-` 字符替换为 `_`。
>
> 例如`，otel.sdk.enabled` 将转换为 `OTEL_SDK_ENABLED`。

[autoconfigure 模块](https://opentelemetry.io/docs/languages/java/instrumentation/#automatic-configuration) （`opentelemetry-sdk-extension-autoconfigure`） 允许您根据一组标准受支持的环境变量和系统属性自动配置 OpenTelemetry SDK。

### 调试相关

* `OTEL_JAVAAGENT_DEBUG`:
* `OTEL_JAVAAGENT_EXTENSIONS`:
* `OTEL_JAVAAGENT_LOGGING`：
  * simple: 代理将使用标准错误流打印出其日志。仅打印 `INFO` 或更高级别的日志。这是默认的 Java 代理日志记录模式。
  * none: 代理不会记录任何内容 - 甚至不会记录其自己的版本。
  * application: 代理将尝试将其自己的日志重定向到已插桩应用程序的 slf4j 记录器。这对于不使用多个类加载器的 单 jar 应用程序最有效;Spring Boot 应用程序也受支持。
* `OTEL_JAVAAGENT_ENABLED`:

### 常用的SDK配置

* `OTEL_SERVICE_NAME`
* `OTEL_RESOURCE_ATTRIBUTES`
* `OTEL_TRACES_SAMPLER`
  * `"always_on"`: `AlwaysOnSampler`
  * `"always_off"`: `AlwaysOffSampler`
  * `"traceidratio"`: `TraceIdRatioBased`
  * `"parentbased_always_on"`:默认， `ParentBased(root=AlwaysOnSampler)`
  * `"parentbased_always_off"`: `ParentBased(root=AlwaysOffSampler)`
  * `"parentbased_traceidratio"`: `ParentBased(root=TraceIdRatioBased)`
  * `"parentbased_jaeger_remote"`: `ParentBased(root=JaegerRemoteSampler)`
  * `"jaeger_remote"`: `JaegerRemoteSampler`
  * `"xray"`: [AWS X-Ray Centralized Sampling](https://docs.aws.amazon.com/xray/latest/devguide/xray-console-sampling.html) (*third party*)
* `OTEL_TRACES_SAMPLER_ARG`
* `OTEL_PROPAGATORS`： 默认 `tracecontext`,baggage
* `OTEL_TRACES_EXPORTER`: 默认 otlp
* `OTEL_METRICS_EXPORTER`：默认 otlp
* `OTEL_LOGS_EXPORTER`：默认 otlp
* `OTEL_JAVAAGENT_CONFIGURATION_FILE`：指定配置文件

### OTLP Exporter 配置

* `OTEL_EXPORTER_OTLP_ENDPOINT` ，默认 gRPC: `"http://localhost:4317"` ， HTTP: `"http://localhost:4318"`
  * `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`
  * `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`
  * `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`
* `OTEL_EXPORTER_OTLP_HEADERS`: 例如：api-key=key,other-config-value=value
  * `OTEL_EXPORTER_OTLP_TRACES_HEADERS`
  * `OTEL_EXPORTER_OTLP_METRICS_HEADERS`
  * `OTEL_EXPORTER_OTLP_LOGS_HEADERS`
* `OTEL_EXPORTER_OTLP_TIMEOUT`：默认 `10000` (10s)
  * `OTEL_EXPORTER_OTLP_TRACES_TIMEOUT`
  * `OTEL_EXPORTER_OTLP_METRICS_TIMEOUT`
  * `OTEL_EXPORTER_OTLP_LOGS_TIMEOUT`
* `OTEL_EXPORTER_OTLP_PROTOCOL`： `grpc`，`http/protobuf`，`http/json`
  * `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`
  * `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`
  * `OTEL_EXPORTER_OTLP_LOGS_PROTOCOL`

### SPI自定义配置

自动配置公开了 SPI [钩子，](https://github.com/open-telemetry/opentelemetry-java/tree/main/sdk-extensions/autoconfigure-spi/src/main/java/io/opentelemetry/sdk/autoconfigure/spi)用于根据需要以编程方式自定义行为。建议尽可能使用上述配置属性，仅实现 SPI 以添加默认情况下在 SDK 中找不到的功能。

```java
public interface AutoConfigurationCustomizer {


  AutoConfigurationCustomizer addPropagatorCustomizer(
      BiFunction<? super TextMapPropagator, ConfigProperties, ? extends TextMapPropagator>
          propagatorCustomizer);


  AutoConfigurationCustomizer addResourceCustomizer(
      BiFunction<? super Resource, ConfigProperties, ? extends Resource> resourceCustomizer);


  AutoConfigurationCustomizer addSamplerCustomizer(
      BiFunction<? super Sampler, ConfigProperties, ? extends Sampler> samplerCustomizer);


  AutoConfigurationCustomizer addSpanExporterCustomizer(
      BiFunction<? super SpanExporter, ConfigProperties, ? extends SpanExporter>
          exporterCustomizer);

 
  default AutoConfigurationCustomizer addSpanProcessorCustomizer(
      BiFunction<? super SpanProcessor, ConfigProperties, ? extends SpanProcessor>
          spanProcessorCustomizer) {
    return this;
  }


  AutoConfigurationCustomizer addPropertiesSupplier(
      Supplier<Map<String, String>> propertiesSupplier);


  default AutoConfigurationCustomizer addPropertiesCustomizer(
      Function<ConfigProperties, Map<String, String>> propertiesCustomizer) {
    return this;
  }


  default AutoConfigurationCustomizer addTracerProviderCustomizer(
      BiFunction<SdkTracerProviderBuilder, ConfigProperties, SdkTracerProviderBuilder>
          tracerProviderCustomizer) {
    return this;
  }


  default AutoConfigurationCustomizer addMeterProviderCustomizer(
      BiFunction<SdkMeterProviderBuilder, ConfigProperties, SdkMeterProviderBuilder>
          meterProviderCustomizer) {
    return this;
  }


  @SuppressWarnings("UnusedReturnValue")
  default AutoConfigurationCustomizer addMetricExporterCustomizer(
      BiFunction<? super MetricExporter, ConfigProperties, ? extends MetricExporter>
          exporterCustomizer) {
    return this;
  }


  @SuppressWarnings("UnusedReturnValue")
  default AutoConfigurationCustomizer addMetricReaderCustomizer(
      BiFunction<? super MetricReader, ConfigProperties, ? extends MetricReader> readerCustomizer) {
    return this;
  }


  default AutoConfigurationCustomizer addLoggerProviderCustomizer(
      BiFunction<SdkLoggerProviderBuilder, ConfigProperties, SdkLoggerProviderBuilder>
          loggerProviderCustomizer) {
    return this;
  }

  default AutoConfigurationCustomizer addLogRecordExporterCustomizer(
      BiFunction<? super LogRecordExporter, ConfigProperties, ? extends LogRecordExporter>
          exporterCustomizer) {
    return this;
  }


  default AutoConfigurationCustomizer addLogRecordProcessorCustomizer(
      BiFunction<? super LogRecordProcessor, ConfigProperties, ? extends LogRecordProcessor>
          logRecordProcessorCustomizer) {
    return this;
  }
}
```



## Jar包列表

[io.opentelemetry](https://javadoc.io/doc/io.opentelemetry)

[io.opentelemetry.instrumentation](https://javadoc.io/doc/io.opentelemetry.instrumentation)

[io.opentelemetry.javaagent](https://javadoc.io/doc/io.opentelemetry.javaagent)

[io.opentelemetry.contrib](https://javadoc.io/doc/io.opentelemetry.contrib)

## 注解

### @WithSpan

要创建与某个方法相对应的[跨度](https://opentelemetry.io/docs/concepts/signals/traces/#spans)，请使用 `@WithSpan` 注释该方法。

```java
import io.opentelemetry.instrumentation.annotations.WithSpan;

public class MyClass {
  @WithSpan
  public void myMethod() {
      <...>
  }
}
```

每次应用程序调用带注释的方法时，它都会创建一个跨度，该跨度表示其持续时间并提供任何引发的异常。默认情况下，span名称将为 `<className>.<methodName>`，除非使用注解的name属性指定。

### `@SpanAttribute`

带注释的方法创建[跨度](https://opentelemetry.io/docs/concepts/signals/traces/#spans)时，通过对方法参数进行`注释`，可以将方法调用的参数值自动[添加为属性](https://opentelemetry.io/docs/concepts/signals/traces/#attributes)到创建的跨度中。

```java
public class MyClass {

    @WithSpan
    public void myMethod(@SpanAttribute("parameter1") String parameter1,
        @SpanAttribute("parameter2") long parameter2) {
        <...>
    }
}
```

