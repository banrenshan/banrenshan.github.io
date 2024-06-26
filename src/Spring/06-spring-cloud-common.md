---
title: Spring-CLoud-Common
date: 2024-04-20
categories:
  - java
  - spring
tags:
  - spring-cloud
---

`spring Cloud`构建在`Spring Boot`之上，提供了两个基础库:`Spring Cloud Context`和`Spring Cloud Commons`。

- `Spring Cloud Context`为`Spring Cloud`应用程序的`ApplicationContext`提供了实用程序和特殊服务，例如：引导上下文、加密、刷新 Scope 和 Env端点
- `Spring Cloud Commons`为不同的`Spring Cloud`实现提供抽象规范 ，例如`Spring Cloud Netflix`和`Spring Cloud Consul`

## Spring Cloud Context

`spring boot` 在spring基础上构建应用程序，例如约定俗成的文件配置规则、通用的端点管理和任务监控。`spring cloud`在此基础上新添加了一些基础组件。

### Bootstrap Context

spring cloud 启动时先创建`bootstrap `上下文，然后创建 `application `上下文。`bootstrap`会加载例如git等外部数据源上的配置信息，这些配置优先级比较高，无法被`application`配置的属性覆盖，但是`bootstrap`(包括bootstrap-profile.yaml)文件中配置的属性优先级比较低，会被`application`文件中同属性覆盖。

> - 一般情况下，我们会在bootstrap文件中配置`spring.application.name`和`spring.profiles.active`
> - 跟日志配置相关的属性，最好也放在这个文件中

下面是**bootstrap.yml**的示例文件：

```yaml
spring:
  application:
    name: foo
  cloud:
    config:
      uri: ${SPRING_CONFIG_URI:http://localhost:8888}
```

如果你使用`SpringApplication` 或`SpringApplicationBuilder`构建 `app context`，`Bootstrap `会是该`context`的父级`context`。`子级context`继承`父级context`的属性。

你可以使用`spring.cloud.bootstrap.name`修改bootstrap文件的名称，使用`spring.cloud.bootstrap.location`或`spring.cloud.bootstrap.additional-location`指定bootstrap文件的位置。

禁用`bootstrap`上下文：

```properties
spring.cloud.bootstrap.enabled=false
```



通过bootstrap加载的远程属性默认具有高优先级，本地无法覆盖他们，设置`spring.cloud.config.allowOverride=true`可以修改此行为，注意该属性必须是远程的，本地无效。设定该属性后，还有配套的两个属性可以更精细化的控制覆盖行为：

- `spring.cloud.config.overrideNone=true`:从任何本地属性源覆盖。
- `spring.cloud.config.overrideSystemProperties=false`:只有系统属性，命令行参数和环境变量才能覆盖远程设置，本地配置文件不行。

### CachedRandomPropertySource

Spring Cloud Context提供了一个`PropertySource`，用于缓存基于键的随机值。除了缓存功能之外，它的工作原理与Spring Boot的`RandomValuePropertySource`相同。如果您想要一个即使在Spring应用程序上下文重新启动后也是一致的随机值，那么这个随机值可能会很有用。属性值采用`cachedrandom.[yourkey].[type]`的形式。类型值可以是Spring Boot的RandomValuePropertySource支持的任何类型。

```properties
myrandom=${cachedrandom.appname.value}
```

### 自定义外部属性源

bootstrap默认的外部属性源是Spring Cloud Config Server，但是您可以通过将类型为`PropertySourceLocator`的bean添加到bootstrap上下文(通过`spring.factories`)来添加其他源。例如，您可以从其他服务器或数据库读取属性。

```java
@Configuration
public class CustomPropertySourceLocator implements PropertySourceLocator {

    @Override
    public PropertySource<?> locate(Environment environment) {
        return new MapPropertySource("customProperty",
                Collections.<String, Object>singletonMap("property.from.sample.custom.source", "worked as intended"));
    }

}
```

environment是将要创建的ApplicationContext的环境，可以通过他来获取bootstrap配置文件中的属性等。

此外，还需要在`META-INF/spring.factories`文件中配置如下内容：

```properties
org.springframework.cloud.bootstrap.BootstrapConfiguration=sample.custom.CustomPropertySourceLocator
```

> 添加自定义BootstrapConfiguration时，请注意您添加的类不会被@ComponentScanned错误地添加到您的“主”应用程序上下文中，因为这些类可能不需要。为引导配置类使用单独的包名称，并确保该名称尚未被@ComponentScan或@SpringBootApplication注释的配置类覆盖。

从Spring Cloud 2022.0.3开始，Spring Cloud现在将调用PropertySourceLocators两次。第一次提取将检索不包含任何profiles文件的任何属性源。这些属性源将有机会使用`spring.profiles.active`激活配置文件。在主应用程序上下文启动后，将再次调用`PropertySourceLocators`，这一次使用任何active的profile文件，允许PropertySourceLocator定位具有profiles文件的任何其他PropertySources。

### 刷新配置

当远程属性源发生变化时，会发送`EnvironmentChangeEvent`事件，你可以监听这些事件来：

- 重新绑定`@ConfigurationProperties` bean
- 修改`logger`级别

请注意，默认情况下，Spring Cloud Config Client 不会轮询环境中的更改。 通常，我们不建议使用这种方法来检测更改（尽管您可以使用 @Scheduled 注释进行设置）。 如果您有横向扩展的客户端应用程序，最好将 `EnvironmentChangeEvent `广播到所有实例，而不是让它们轮询更改（例如，通过使用 Spring Cloud Bus）。

当配置发生变化时，标记为`@RefreshScope` 的 Spring `@Bean` 会得到刷新处理。 需要注意的是`@RefreshScope` 是懒加载的，在使用它们时（即调用方法时）进行初始化，作用域充当初始化值的缓存。要在下一个方法调用中强制bean重新初始化，必须使其缓存项无效。

RefreshScope是上下文中的一个bean，它有一个public的refreshAll方法，通过清除目标缓存来刷新作用域中的所有bean。/refresh端点公开此功能（通过HTTP或JMX）。要按名称刷新单个bean，还有一个refresh(String)方法。

```yaml
management:
  endpoints:
    web:
      exposure:
        include: refresh
```

@RefreshScope（从技术上讲）适用于@Configuration类，但它可能会导致令人惊讶的行为。例如，这并不意味着该类中定义的所有@Beans本身都在@RefreshScope中。具体来说，任何依赖于这些bean的其他bean都不会被更新，除非它本身在@RefreshScope中。在这种情况下，会在刷新时重新构建它，并重新注入它的依赖项。此时，它们将从刷新的@Configuration中重新初始化）。

> 对于不存在的值，没办法刷新。对于存在的值，刷新操作也不能执行删除的逻辑

> Spring AOT转换和本机映像不支持上下文刷新。对于AOT和本机映像，spring.cloud.refresh.enabled需要设置为false。

重新启动时无缝刷新bean对于使用JVM检查点还原运行的应用程序（如Project CRaC）尤其有用。为了实现这一功能，我们现在实例化一个`RefreshScopeLifecycle `bean，该bean在重新启动时触发上下文刷新，从而重新绑定配置属性并刷新任何用`@RefreshScope`注释的bean。您可以通过将`spring.cloud.refresh.on-restart.enabled`设置为false来禁用此行为。

### 加密和解密

Spring Cloud有一个环境预处理器，用于在本地解密属性值。它遵循与Spring Cloud Config Server相同的规则，并通过`encrypt.*`具有相同的外部配置。因此，您可以使用`{cipher}*`形式的加密值，只要有有效的密钥，它们就会在主应用程序上下文获得`Environment`设置之前解密。要在应用程序中使用加密功能，您需要在类路径中`org.springframework.security:spring-security-rsa`,并且您还需要JVM中的全强度JCE扩展。



### 扩展端点

- POST 到 `/actuator/env` 以更新环境并重新绑定 `@ConfigurationProperties`  bean和日志级别。 要启用此端点，您必须设置 `management.endpoint.env.post.enabled=true`。
- `/actuator/refresh` 重新加载引导程序上下文并刷新`@RefreshScope` bean。
- `/actuator/restart `关闭 `ApplicationContext `并重新启动它（默认情况下禁用）。
- `/actuator/pause `和 `/actuator/resume` 用于调用生命周期方法（`ApplicationContext `上的 `stop` 和 `start`）。

##  Spring Cloud Common

### 服务发现

Spring Cloud Commons 提供了 `@EnableDiscoveryClient` 注解。 这会在`META-INF/spring.factories`（`org.springframework.cloud.client.discovery.EnableDiscoveryClient=xxx` ）寻找 `DiscoveryClient` 或 `ReactiveDiscoveryClient` 接口的实现。 DiscoveryClient 实现的示例包括 Spring Cloud Netflix Eureka、Spring Cloud Consul Discovery 和 Spring Cloud Zookeeper Discovery。

启用的相关属性如下：

```properties
spring.cloud.discovery.blocking.enabled=false #禁用阻塞式客户端
spring.cloud.discovery.reactive.enabled=false #禁用响应式客户端
spring.cloud.discovery.enabled=false # 完全禁用
```

默认情况下， `DiscoveryClient `的实现会自动向远程发现服务器注册本地 Spring Boot 服务器。 可以通过在 `@EnableDiscoveryClient` 中设置 `autoRegister=false` 来禁用此行为。

> `@EnableDiscoveryClient`不需要显示声明，只要类路径上存在服务发现的类库，就会自动声明。

如果类路径中没有基于注册中心的DiscoveryClient，将使用 SimpleDiscoveryClient 实例，它使用属性来获取有关服务和实例的信息。配置信息如下：

```properties
pring.cloud.discovery.client.simple.instances.service1[0].uri=http://s11:8080
```



Spring 提供了一个 `ServiceRegistry `接口，该接口提供` register(Registration)` 和 `deregister(Registration)` 等方法，让您可以手动注册服务。 Registration是一个标记接口：

```java
@Configuration
@EnableDiscoveryClient(autoRegister=false)
public class MyConfiguration {
    private ServiceRegistry registry;

    public MyConfiguration(ServiceRegistry registry) {
        this.registry = registry;
    }

    // called through some external process, such as an event or a custom actuator endpoint
    public void register() {
        Registration registration = constructRegistration();
        this.registry.register(registration);
    }
}
```

每个 ServiceRegistry 实现都有自己的 Registry 实现:

- `ZookeeperRegistration` used with `ZookeeperServiceRegistry`
- `EurekaRegistration` used with `EurekaServiceRegistry`
- `ConsulRegistration` used with `ConsulServiceRegistry`

> 服务自动注册时将触发两个事件。 第一个事件称为 InstancePreRegisteredEvent，在注册服务之前触发。 第二个事件称为 InstanceRegisteredEvent，在注册服务后触发。 您可以注册一个 ApplicationListener(s) 来监听和响应这些事件。
>
> 如果 spring.cloud.service-registry.auto-registration.enabled 属性设置为 false，则不会触发这些事件。

actuator 端点`/service-registry` 可以查看服务注册的状态以及注册服务。

如果你的服务器存在多个ip的话，在注册服务的时候，可能想指定某些ip不能向注册中心注册：

```yaml
spring:
  cloud:
    inetutils:
      ignoredInterfaces:
        - docker0
        - veth.*
```

偏向使用某些ip：

```yaml
spring:
  cloud:
    inetutils:
      preferredNetworks:
        - 192.168
        - 10.0
```

使用回环地址：

```yaml
spring:
  cloud:
    inetutils:
      useOnlySiteLocalInterfaces: true
```

### 负载平衡

依赖：`org.springframework.cloud:spring-cloud-starter-loadbalancer`

修改某个客户端的负载配置：

```java
@Configuration
@LoadBalancerClient(value = "stores", configuration = CustomLoadBalancerConfiguration.class)
public class MyConfiguration {

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }
}
```

修改多个客户端的负载配置：

```java
@Configuration
@LoadBalancerClients({@LoadBalancerClient(value = "stores", configuration = StoresLoadBalancerClientConfiguration.class), @LoadBalancerClient(value = "customers", configuration = CustomersLoadBalancerClientConfiguration.class)})
public class MyConfiguration {

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }
}
```

`ReactiveLoadBalancer`接口定义负载均衡器，Spring实现了两种：轮询和随机。默认实现是`RoundRobinLoadBalancer`。

`ServiceInstanceListSupplier `接口定义获取服务实例信息，基于服务发现的`DiscoveryClientServiceInstanceListSupplier`，下面接受的其他均衡器都是委托`DiscoveryClientServiceInstanceListSupplier`来获取服务列表，然后做进一步处理。

#### 负载算法

##### WeightedServiceInstanceListSupplier

我们使用WeightFunction来计算每个实例的权重。默认情况下，我们尝试从元数据映射中读取和解析权重。如果元数据映射中没有指定权重，则默认情况下此实例的权重为1。

您可以通过将`spring.cloud.loadbalancer.configurations`的值设置为`weighted`或通过提供自己的`ServiceInstanceListSupplier `bean来配置它:

```java
public class CustomLoadBalancerConfiguration {

	@Bean
	public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
			ConfigurableApplicationContext context) {
		return ServiceInstanceListSupplier.builder()
					.withDiscoveryClient()
					.withWeighted()
					.withCaching()
					.build(context);
	}
}
```

您还可以通过提供WeightFunction来自定义权重计算逻辑。

您可以使用此示例配置使所有实例具有随机权重：

```java
public class CustomLoadBalancerConfiguration {

	@Bean
	public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
			ConfigurableApplicationContext context) {
		return ServiceInstanceListSupplier.builder()
					.withDiscoveryClient()
					.withWeighted(instance -> ThreadLocalRandom.current().nextInt(1, 101))
					.withCaching()
					.build(context);
	}
}
```

##### SubsetServiceInstanceListSupplier

SubsetServiceInstanceListSupplier实现了一种确定的子集设置算法，以在ServiceInstanceListProvider委托层次结构中选择有限数量的实例:

```java
public class CustomLoadBalancerConfiguration {

	@Bean
	public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
			ConfigurableApplicationContext context) {
		return ServiceInstanceListSupplier.builder()
					.withDiscoveryClient()
					.withSubset()
					.withCaching()
					.build(context);
	    }
	}
```



##### CachingServiceInstanceListSupplier

`CachingServiceInstanceListSupplier`：基于缓存的服务实例列表

```properties
spring.cloud.loadbalancer.cache.ttl=35
spring.cloud.loadbalancer.cache.capacity=256
spring.cloud.loadbalancer.cache.enabled=false
```

尽管基本的非缓存实现对于原型设计和测试很有用，但它的效率远低于缓存版本，因此我们建议始终在生产中使用缓存版本。 如果缓存已由 `DiscoveryClient `实现完成，例如 `EurekaDiscoveryClient`，则应禁用负载平衡器缓存以防止双重缓存。

##### ZonePreferenceServiceInstanceListSupplier

`ZonePreferenceServiceInstanceListSupplier`:检测相同zone的服务实例列表

在应用中设置`eureka.instance.metadata-map.zone=xx`注册实例的zone信息，A调用B时，就会选择和A的zone相同的B,可以通过设置`spring.cloud.loadbalancer.zone`来调用特定zone的B。

```java
public class CustomLoadBalancerConfiguration {

    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        return ServiceInstanceListSupplier.builder()
                    .withDiscoveryClient()
                    .withZonePreference()
                    .withCaching()
                    .build(context);
    }
}
```

##### HealthCheckServiceInstanceListSupplier 

 定期检查DiscoveryClientServiceInstanceListSupplier返回的实例是否健康

> 这种机制在使用 SimpleDiscoveryClient 时特别有用。 对于由实际 Service Registry 支持的客户端，没有必要使用，因为我们在查询外部 ServiceDiscovery 后已经获得了健康的实例。

```properties
spring.cloud.loadbalancer.health-check.initialDelay=
spring.cloud.loadbalancer.health-check.interval=
spring.cloud.loadbalancer.health-check.path.default= /actuator/health(默认)
spring.cloud.loadbalancer.health-check.path.[SERVICE_ID]=
```

```java
public class CustomLoadBalancerConfiguration {

    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        return ServiceInstanceListSupplier.builder()
                    .withDiscoveryClient()
                    .withHealthChecks()
                    .build(context);
        }
    }
```

##### SameInstancePreferenceServiceInstanceListSupplier

直接选择先前的实例

```java
public class CustomLoadBalancerConfiguration {
    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        return ServiceInstanceListSupplier.builder()
                    .withDiscoveryClient()
                    .withSameInstancePreference()
                    .build(context);
        }
    }
```

##### RequestBasedStickySessionServiceInstanceListSupplier

 基于会话粘性，在cookie中存储了实例id，选择的时候，只要匹配实例id就是先前的实例。

```java
public class CustomLoadBalancerConfiguration {

    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        return ServiceInstanceListSupplier.builder()
                   .withDiscoveryClient()
                   .withRequestBasedStickySession()
                   .build(context);
        }
    }
```

##### HintBasedServiceInstanceListSupplier

选择命中的实例，用户可以在请求中指定选择那个实例

`eureka.instance.metadata-map.hit=xxx`设置实例的hit值，然后请求头`X-SC-LB-Hint`（`spring.cloud.loadbalancer.hint-header-name`修改此值）传递hit值。HintBasedServiceInstanceListSupplier会比较这两个值，选择具体的实例

```java
public class CustomLoadBalancerConfiguration {

    @Bean
    public ServiceInstanceListSupplier discoveryClientServiceInstanceListSupplier(
            ConfigurableApplicationContext context) {
        return ServiceInstanceListSupplier.builder()
                   .withDiscoveryClient()
                   .withHints()
                   .withCaching()
                   .build(context);
    }
}
```

####  拦截请求

您可以使用选定的 ServiceInstance 来转换负载均衡的 HTTP 请求。

对于 RestTemplate，需要实现和定义 LoadBalancerRequestTransformer 如下：

```java
@Bean
public LoadBalancerRequestTransformer transformer() {
    return new LoadBalancerRequestTransformer() {
        @Override
        public HttpRequest transformRequest(HttpRequest request, ServiceInstance instance) {
            return new HttpRequestWrapper(request) {
                @Override
                public HttpHeaders getHeaders() {
                    HttpHeaders headers = new HttpHeaders();
                    headers.putAll(super.getHeaders());
                    headers.add("X-InstanceId", instance.getInstanceId());
                    return headers;
                }
            };
        }
    };
}
```

对于WebClient，需要实现和定义LoadBalancerClientRequestTransformer如下：

```java
@Bean
public LoadBalancerClientRequestTransformer transformer() {
    return new LoadBalancerClientRequestTransformer() {
        @Override
        public ClientRequest transformRequest(ClientRequest request, ServiceInstance instance) {
            return ClientRequest.from(request)
                    .header("X-InstanceId", instance.getInstanceId())
                    .build();
        }
    };
}
```

如果定义了多个转换器，它们将按照定义 Bean 的顺序应用。 或者，您可以使用 `LoadBalancerRequestTransformer.DEFAULT_ORDER` 或 `LoadBalancerClientRequestTransformer.DEFAULT_ORDER `来指定顺序。

####  生命周期方法

`LoadBalancerLifecycle `bean 提供回调方法，名为 `onStart(Request request)`、`onStartRequest(Request request, Response lbResponse) `和 `onComplete(CompletionContext<RES, T, RC> completionContext)`，您应该实现这些方法 指定在负载平衡之前和之后应执行的操作。

我们提供了一个名为 `MicrometerStatsLoadBalancerLifecycle `的 `LoadBalancerLifecycle `bean，它使用 Micrometer 为负载平衡调用提供统计信息。

为了将此 bean 添加到您的应用程序上下文中，请将 `spring.cloud.loadbalancer.stats.micrometer.enabled `的值设置为 true 并使用 `MeterRegistry`（将 Spring Boot Actuator 添加到您的项目中）。`MicrometerStatsLoadBalancerLifecycle 在 MeterRegistry `中注册以下仪表：

- `loadbalancer.requests.active`：允许您监控任何服务实例的当前活动请求数量的量表（服务实例数据可通过标签获得）；
- `loadbalancer.requests.success`：一个计时器，用于测量已结束将响应传递给底层客户端的任何负载平衡请求的执行时间；
- `loadbalancer.requests.failed`：一个计时器，用于测量任何以异常结束的负载平衡请求的执行时间；
- `loadbalancer.requests.discard`：一个计数器，用于测量被丢弃的负载平衡请求的数量，即负载均衡器尚未检索到运行请求的服务实例的请求。

####  客户端

负载均衡帮助我们选定具体的实例，然后我们需要通过http的方式访问该示例，这个过程称为客户端调用。具体的客户端实现有RestTemplate，WebClient，openFeign等。

####  RestTemplate

```java
@Configuration
public class MyConfiguration {

    @LoadBalanced
    @Bean
    RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

public class MyClass {
    @Autowired
    private RestTemplate restTemplate;

    public String doOtherStuff() {
        String results = restTemplate.getForObject("http://stores/stores", String.class);
        return results;
    }
}
```

#### WebClient

```java
@Configuration
public class MyConfiguration {

    @Bean
    @LoadBalanced
    public WebClient.Builder loadBalancedWebClientBuilder() {
        return WebClient.builder();
    }
}

public class MyClass {
    @Autowired
    private WebClient.Builder webClientBuilder;

    public Mono<String> doOtherStuff() {
        return webClientBuilder.build().get().uri("http://stores/stores")
                        .retrieve().bodyToMono(String.class);
    }
}
```

Spring Cloud Commons 提供了用于创建 Apache HTTP 客户端 (`ApacheHttpClientFactory`) 和 OK HTTP 客户端 (`OkHttpClientFactory`) 的 bean。 只有当 OK HTTP jar 位于类路径上时，才会创建 `OkHttpClientFactory `bean。 此外，Spring Cloud Commons 提供 bean 来创建两个客户端使用的连接管理器：

- `ApacheHttpClientConnectionManagerFactory `用于 Apache HTTP 客户端
- `OkHttpClientConnectionPoolFactory `用于 OK HTTP 客户端。

如果您想自定义如何在下游项目中创建 HTTP 客户端，您可以提供您自己的这些 bean 的实现。

此外，如果您提供类型为 `HttpClientBuilder `或` OkHttpClient.Builder `的 bean，则默认工厂使用这些构建器作为构建的基础。

您还可以通过将 `spring.cloud.httpclientfactories.apache.enabled` 或 `spring.cloud.httpclientfactories.ok.enabled` 设置为 false 来禁用这些 bean 的创建。

> RestTemplate和openfiegn以及其他都是使用这些http客户端发送请求的。RestTemplate和openfiegn地位相同，使用loadbancer选择服务示例，loadbancer使用DiscoveryClient获取所有的服务信息。但凡涉及http请求的，底层都使用http客户端。但是不能保证他们使用了同一个http客户端实例？？？

### 失败重试

负载均衡的 RestTemplate 可以配置为重试失败。 默认情况下，此逻辑被禁用。 您可以通过将 Spring Retry 添加到应用程序的类路径来启用它。 对于响 WebTestClient，您需要设置 `spring.cloud.loadbalancer.retry.enabled=true`。其他相关属性：

- `spring.cloud.loadbalancer.retry.maxRetriesOnSameServiceInstance` - 指示应在同一个 ServiceInstance 上重试请求的次数（为每个选定的实例单独计数）
- `spring.cloud.loadbalancer.retry.maxRetriesOnNextServiceInstance` - 指示应重试新选择的 ServiceInstance 请求的次数
- `spring.cloud.loadbalancer.retry.retryableStatusCodes `- 始终重试失败请求的状态代码。

对于反应式实现，您还可以设置：

- `spring.cloud.loadbalancer.retry.backoff.minBackof`f - 设置最小退避持续时间（默认为 5 毫秒）

- `spring.cloud.loadbalancer.retry.backoff.maxBackoff `- 设置 最大退避持续时间（默认情况下，最大长值毫秒）
- `spring.cloud.loadbalancer.retry.backoff.jitter` - 设置用于计算每次调用的实际退避持续时间的抖动（默认情况下，0.5）。

### 断路器

org.springframework.cloud:spring-cloud-starter-circuitbreaker-resilience4j

org.springframework.cloud:spring-cloud-starter-circuitbreaker-reactor-resilience4j

支持的断路器实现：

- [Resilience4J](https://gitee.com/link?target=https%3A%2F%2Fgithub.com%2Fresilience4j%2Fresilience4j)
- [Sentinel](https://gitee.com/link?target=https%3A%2F%2Fgithub.com%2Falibaba%2FSentinel)
- [Spring Retry](https://gitee.com/link?target=https%3A%2F%2Fgithub.com%2Fspring-projects%2Fspring-retry)

要在您的代码中创建断路器，您可以使用 `CircuitBreakerFactory `API。 当您在类路径中包含 Spring Cloud Circuit Breaker starter 时，会自动为您创建一个实现此 API 的 bean。 以下示例显示了如何使用此 API 的简单示例：

```java
@Service
public static class DemoControllerService {
    private RestTemplate rest;
    private CircuitBreakerFactory cbFactory;

    public DemoControllerService(RestTemplate rest, CircuitBreakerFactory cbFactory) {
        this.rest = rest;
        this.cbFactory = cbFactory;
    }

    public String slow() {
        return cbFactory.create("slow").run(() -> rest.getForObject("/slow", String.class), throwable -> "fallback");
    }

}
```

```java
@Service
public static class DemoControllerService {
	private ReactiveCircuitBreakerFactory cbFactory;
	private WebClient webClient;


	public DemoControllerService(WebClient webClient, ReactiveCircuitBreakerFactory cbFactory) {
		this.webClient = webClient;
		this.cbFactory = cbFactory;
	}

	public Mono<String> slow() {
		return webClient.get().uri("/slow").retrieve().bodyToMono(String.class).transform(
		it -> cbFactory.create("slow").run(it, throwable -> return Mono.just("fallback")));
	}
}
```

您可以通过创建Customizer类型的bean来配置断路器。Customizer界面有一个单独的方法（称为customize），用于对对象进行自定义。

一些CircuitBreaker实现，如Resilience4JCiruitBreaker，每次调用CircuitBreaker#run时都会调用自定义方法。它可能效率低下。在这种情况下，可以使用CircuitBreaker#once方法。在多次调用customize没有意义的情况下（例如，在消耗Resilience4j的事件的情况下），它是有用的。

```java
Customizer.once(circuitBreaker -> {
  circuitBreaker.getEventPublisher()
    .onStateTransition(event -> log.info("{}: {}", event.getCircuitBreakerName(), event.getStateTransition()));
}, CircuitBreaker::getName)
```







