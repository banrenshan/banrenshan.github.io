---
title: Spring RestTemplate
date: 2024-05-01
categories:
  - Spring
tags:
  - Spring
  - http
---

> RestClient为同步HTTP访问提供了更现代的API。对于异步和流式场景，请考虑响应式WebClient。

## 方法

`RestTemplate`以经典`Spring Template`类的形式提供了一个高级的 `HTTP`客户端库。它公开了以下几组重载方法：

| 方法组            | 描述                                                         |
| :---------------- | :----------------------------------------------------------- |
| `getForObject`    | GET请求                                                      |
| `getForEntity`    | 使用GET检索 ResponseEntity（包含状态、标头和正文）。         |
| `headForHeaders`  | 使用HEAD检索资源的所有标头。                                 |
| `postForLocation` | 使用POST创建一个新资源，并从响应中返回 Location 标头。       |
| `postForObject`   | 使用POST创建一个新资源，并从响应中返回表示形式。             |
| `postForEntity`   | 使用POST创建一个新资源，并从响应中返回表示形式。             |
| `put`             | 使用PUT创建或更新资源。                                      |
| `patchForObject`  | 使用PATCH更新资源，并从响应中返回表示。请注意，JDK HttpURLConnection不支持PATCH，但Apache HttpComponents和其他组件支持。 |
| `delete`          | 使用DELETE删除指定URI处的资源。                              |
| `optionsForAllow` | 使用ALLOW检索资源的允许HTTP方法。                            |
| `exchange`        | 前面方法的更通用的版本，在需要时提供额外的灵活性。它接受 RequestEntity（包括HTTP方法、URL、头和正文作为输入）并返回 ResponseEntity。这些方法允许使用 ParameterizedTypeReference 而不是Class来指定具有泛型的响应类型。 |
| `execute`         | 执行请求的最通用方式，通过回调接口完全控制请求准备和响应提取。 |

## 初始化

`RestTemplate`使用与`RestClient`相同的`HTTP`库抽象。默认情况下，它使用`SimpleClientHttpRequestFactory`，但这可以通过构造函数进行更改。

## Body

传递到`RestTemplate`方法和从`RestTemplate`方法返回的对象在`HttpMessageConverter`的帮助下转换为HTTP消息和从HTTP消息转换而来。

## 从RestTemplate迁移到RestClient

下表显示了RestTemplate方法的RestClient等效项。它可以用于从后者迁移到前者:

| `RestTemplate` method                                        | `RestClient` equivalent                                      |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| `getForObject(String,Class,Object…)`                         | `get().uri(String,Object…).retrieve().body(Class)`           |
| `getForObject(String,Class,Map)`                             | `get().uri(String,Map).retrieve().body(Class)`               |
| `getForObject(URI,Class)`                                    | `get().uri(URI).retrieve().body(Class)`                      |
| `getForEntity(String,Class,Object…)`                         | `get().uri(String,Object…).retrieve().toEntity(Class)`       |
| `getForEntity(String,Class,Map)`                             | `get().uri(String,Map).retrieve().toEntity(Class)`           |
| `getForEntity(URI,Class)`                                    | `get().uri(URI).retrieve().toEntity(Class)`                  |
| `headForHeaders(String,Object…)`                             | `head().uri(String,Object…).retrieve().toBodilessEntity().getHeaders()` |
| `headForHeaders(String,Map)`                                 | `head().uri(String,Map).retrieve().toBodilessEntity().getHeaders()` |
| `headForHeaders(URI)`                                        | `head().uri(URI).retrieve().toBodilessEntity().getHeaders()` |
| `postForLocation(String,Object,Object…)`                     | `post().uri(String,Object…).body(Object).retrieve().toBodilessEntity().getLocation()` |
| `postForLocation(String,Object,Map)`                         | `post().uri(String,Map).body(Object).retrieve().toBodilessEntity().getLocation()` |
| `postForLocation(URI,Object)`                                | `post().uri(URI).body(Object).retrieve().toBodilessEntity().getLocation()` |
| `postForObject(String,Object,Class,Object…)`                 | `post().uri(String,Object…).body(Object).retrieve().body(Class)` |
| `postForObject(String,Object,Class,Map)`                     | `post().uri(String,Map).body(Object).retrieve().body(Class)` |
| `postForObject(URI,Object,Class)`                            | `post().uri(URI).body(Object).retrieve().body(Class)`        |
| `postForEntity(String,Object,Class,Object…)`                 | `post().uri(String,Object…).body(Object).retrieve().toEntity(Class)` |
| `postForEntity(String,Object,Class,Map)`                     | `post().uri(String,Map).body(Object).retrieve().toEntity(Class)` |
| `postForEntity(URI,Object,Class)`                            | `post().uri(URI).body(Object).retrieve().toEntity(Class)`    |
| `put(String,Object,Object…)`                                 | `put().uri(String,Object…).body(Object).retrieve().toBodilessEntity()` |
| `put(String,Object,Map)`                                     | `put().uri(String,Map).body(Object).retrieve().toBodilessEntity()` |
| `put(URI,Object)`                                            | `put().uri(URI).body(Object).retrieve().toBodilessEntity()`  |
| `patchForObject(String,Object,Class,Object…)`                | `patch().uri(String,Object…).body(Object).retrieve().body(Class)` |
| `patchForObject(String,Object,Class,Map)`                    | `patch().uri(String,Map).body(Object).retrieve().body(Class)` |
| `patchForObject(URI,Object,Class)`                           | `patch().uri(URI).body(Object).retrieve().body(Class)`       |
| `delete(String,Object…)`                                     | `delete().uri(String,Object…).retrieve().toBodilessEntity()` |
| `delete(String,Map)`                                         | `delete().uri(String,Map).retrieve().toBodilessEntity()`     |
| `delete(URI)`                                                | `delete().uri(URI).retrieve().toBodilessEntity()`            |
| `optionsForAllow(String,Object…)`                            | `options().uri(String,Object…).retrieve().toBodilessEntity().getAllow()` |
| `optionsForAllow(String,Map)`                                | `options().uri(String,Map).retrieve().toBodilessEntity().getAllow()` |
| `optionsForAllow(URI)`                                       | `options().uri(URI).retrieve().toBodilessEntity().getAllow()` |
| `exchange(String,HttpMethod,HttpEntity,Class,Object…)`       | `method(HttpMethod).uri(String,Object…).headers(Consumer<HttpHeaders>).body(Object).retrieve().toEntity(Class)` [[1](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#_footnotedef_1)] |
| `exchange(String,HttpMethod,HttpEntity,Class,Map)`           | `method(HttpMethod).uri(String,Map).headers(Consumer<HttpHeaders>).body(Object).retrieve().toEntity(Class)` [[1](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#_footnotedef_1)] |
| `exchange(URI,HttpMethod,HttpEntity,Class)`                  | `method(HttpMethod).uri(URI).headers(Consumer<HttpHeaders>).body(Object).retrieve().toEntity(Class)` [[1](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#_footnotedef_1)] |
| `exchange(String,HttpMethod,HttpEntity,ParameterizedTypeReference,Object…)` | `method(HttpMethod).uri(String,Object…).headers(Consumer<HttpHeaders>).body(Object).retrieve().toEntity(ParameterizedTypeReference)` [[1](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#_footnotedef_1)] |
| `exchange(String,HttpMethod,HttpEntity,ParameterizedTypeReference,Map)` | `method(HttpMethod).uri(String,Map).headers(Consumer<HttpHeaders>).body(Object).retrieve().toEntity(ParameterizedTypeReference)` [[1](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#_footnotedef_1)] |
| `exchange(URI,HttpMethod,HttpEntity,ParameterizedTypeReference)` | `method(HttpMethod).uri(URI).headers(Consumer<HttpHeaders>).body(Object).retrieve().toEntity(ParameterizedTypeReference)` [[1](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#_footnotedef_1)] |
| `exchange(RequestEntity,Class)`                              | `method(HttpMethod).uri(URI).headers(Consumer<HttpHeaders>).body(Object).retrieve().toEntity(Class)` [[2](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#_footnotedef_2)] |
| `exchange(RequestEntity,ParameterizedTypeReference)`         | `method(HttpMethod).uri(URI).headers(Consumer<HttpHeaders>).body(Object).retrieve().toEntity(ParameterizedTypeReference)` [[2](https://docs.spring.io/spring-framework/reference/integration/rest-clients.html#_footnotedef_2)] |
| `execute(String,HttpMethod,RequestCallback,ResponseExtractor,Object…)` | `method(HttpMethod).uri(String,Object…).exchange(ExchangeFunction)` |
| `execute(String,HttpMethod,RequestCallback,ResponseExtractor,Map)` | `method(HttpMethod).uri(String,Map).exchange(ExchangeFunction)` |
| `execute(URI,HttpMethod,RequestCallback,ResponseExtractor)`  | `method(HttpMethod).uri(URI).exchange(ExchangeFunction)`     |

## Spring Boot支持

Spring Framework的`RestTemplate`类早于`RestClient`，是许多应用程序调用远程`REST`服务的经典方式。当您有不想迁移到`RestClient`的现有代码时，或者因为您已经熟悉`RestTemplate `API，您可以选择使用`RestTemplate`。

由于`RestTemplate`实例在使用之前通常需要进行自定义，因此Spring Boot不提供任何自动配置的`RestTemplate `bean。但是，会自动配置`RestTemplateBuilder`，该生成器可在需要时用于创建`RestTemplate`实例。自动配置的`RestTemplateBuilder`确保将合理的`HttpMessageConverters`和适当的`ClientHttpRequestFactory`应用于`RestTemplate`实例。

```java
@Service
public class MyService {

	private final RestTemplate restTemplate;

	public MyService(RestTemplateBuilder restTemplateBuilder) {
		this.restTemplate = restTemplateBuilder.build();
	}

	public Details someRestCall(String name) {
		return this.restTemplate.getForObject("/{name}/details", Details.class, name);
	}

}
```

`RestTemplateBuilder`包括许多有用的方法，可用于快速配置`RestTemplate`。例如，要添加`BASIC`身份验证支持，可以使用`builder.basicAuthentication("user"，"password").build()`。

### 自定义RestTemplate

`RestTemplate`自定义有三种主要方法，具体取决于您希望自定义应用的范围:

* 要使任何自定义的范围尽可能窄，引用自动配置的`RestTemplateBuilder`，然后根据需要调用其方法。每个方法调用都返回一个新的`RestTemplateBuilder`实例，因此只影响使用当前生成器的`RestTemplate`。
* 要进行应用程序范围的自定义，请使用`RestTemplateCustomizer `bean。所有这样的bean都会自动注册到自动配置的`RestTemplateBuilder`中，并应用于使用它构建的任何模板。以下示例显示了一个自定义程序，该自定义程序为192.168.0.5以外的所有主机配置代理的使用：

	```java
	public class MyRestTemplateCustomizer implements RestTemplateCustomizer {
	
	@Override
	public void customize(RestTemplate restTemplate) {
		HttpRoutePlanner routePlanner = new CustomRoutePlanner(new HttpHost("proxy.example.com"));
		HttpClient httpClient = HttpClientBuilder.create().setRoutePlanner(routePlanner).build();
		restTemplate.setRequestFactory(new HttpComponentsClientHttpRequestFactory(httpClient));
	}
	
	static class CustomRoutePlanner extends DefaultProxyRoutePlanner {
	
		CustomRoutePlanner(HttpHost proxy) {
			super(proxy);
		}
	
		@Override
		protected HttpHost determineProxy(HttpHost target, HttpContext context) throws HttpException {
			if (target.getHostName().equals("192.168.0.5")) {
				return null;
			}
			return super.determineProxy(target, context);
		}
	
	}

* 最后，您可以定义自己的`RestTemplateBuilder `bean。这样做将替换自动配置的生成器。如果您希望任何`RestTemplateCustomizer `bean应用于您的自定义生成器，就像自动配置一样，请使用`RestTemplateBuilderConfigurer`进行配置。以下示例公开了一个`RestTemplateBuilder`，它与Spring Boot的自动配置相匹配，但也指定了自定义连接和读取超时：

  ```java
  @Configuration(proxyBeanMethods = false)
  public class MyRestTemplateBuilderConfiguration {
  
  	@Bean
  	public RestTemplateBuilder restTemplateBuilder(RestTemplateBuilderConfigurer configurer) {
  		return configurer.configure(new RestTemplateBuilder())
  			.setConnectTimeout(Duration.ofSeconds(5))
  			.setReadTimeout(Duration.ofSeconds(2));
  	}
  
  }
  ```

> 最极端（也很少使用）的选项是在不使用配置程序的情况下创建自己的`RestTemplateBuilder `bean。除了替换自动配置的生成器外，这还可以防止使用任何`RestTemplateCustomizer `bean。

### RestTemplate SSL Support

如果您需要在`RestTemplate`上进行自定义SSL配置，可以将SSL绑定应用于`RestTemplateBuilder`，如本例所示：

```java
@Service
public class MyService {

	private final RestTemplate restTemplate;

	public MyService(RestTemplateBuilder restTemplateBuilder, SslBundles sslBundles) {
		this.restTemplate = restTemplateBuilder.setSslBundle(sslBundles.getBundle("mybundle")).build();
	}

	public Details someRestCall(String name) {
		return this.restTemplate.getForObject("/{name}/details", Details.class, name);
	}

}
```

### 底层客户端的选择

Spring Boot将根据应用程序类路径上可用的库自动检测要与`RestClient`和`RestTemplate`一起使用的HTTP客户端。按照首选项的顺序，支持以下客户端：

1. Apache HttpClient
2. Jetty HttpClient
3. OkHttp (deprecated)
4. Simple JDK client (`HttpURLConnection`)

如果类路径上有多个客户端可用，则将使用最首选的客户端。

