---
title: Spring Http Interface
date: 2024-05-01
categories:
  - Spring
tags:
  - Spring
  - http
---

`Spring `允许您使用`@HttpExchange`将HTTP服务定义为`Java`接口。您可以将这样的接口传递给`HttpServiceProxyFactory`，以创建一个代理，该代理通过`HTTP`客户端（如`RestClient`或`WebClient`）执行请求。您还可以将`@Controller`实现当作服务器请求处理的接口。

```java
interface RepositoryService {

	@GetExchange("/repos/{owner}/{repo}")
	Repository getRepository(@PathVariable String owner, @PathVariable String repo);

	// more HTTP exchange methods...

}
```

现在，您可以创建一个代理，在调用方法时执行请求:

RestClient:

```java
RestClient restClient = RestClient.builder().baseUrl("https://api.github.com/").build();
RestClientAdapter adapter = RestClientAdapter.create(restClient);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

RepositoryService service = factory.createClient(RepositoryService.class);
```

WebClient:

```java
WebClient webClient = WebClient.builder().baseUrl("https://api.github.com/").build();
WebClientAdapter adapter = WebClientAdapter.create(webClient);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

RepositoryService service = factory.createClient(RepositoryService.class);
```

RestTemplate:

```java
RestTemplate restTemplate = new RestTemplate();
restTemplate.setUriTemplateHandler(new DefaultUriBuilderFactory("https://api.github.com/"));
RestTemplateAdapter adapter = RestTemplateAdapter.create(restTemplate);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

RepositoryService service = factory.createClient(RepositoryService.class);
```

@HttpExchange 可以标注在类型级别上：

```java
@HttpExchange(url = "/repos/{owner}/{repo}", accept = "application/vnd.github.v3+json")
interface RepositoryService {

	@GetExchange
	Repository getRepository(@PathVariable String owner, @PathVariable String repo);

	@PatchExchange(contentType = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
	void updateRepository(@PathVariable String owner, @PathVariable String repo,
			@RequestParam String name, @RequestParam String description, @RequestParam String homepage);

}
```

## 方法参数

| 方法参数            | 描述                                                         |
| :------------------ | :----------------------------------------------------------- |
| `URI`               | 动态设置请求的URL，覆盖注解的URL属性。                       |
| `UriBuilderFactory` | 提供 `UriBuilderFactory`以展开URI模板和URI变量。实际上，将替换基础客户端的`UriBuilderFactory`（及其基本URL）。 |
| `HttpMethod`        | 动态设置请求的HTTP方法，覆盖注释的 `method `属性             |
| `@RequestHeader`    | 添加一个或多个请求标头。`Map<String, ?>` or `MultiValueMap<String, ?>`用于多个请求头；  `Collection<?>` 用于单个请求头。非字符串值支持类型转换。 |
| `@PathVariable`     | 添加一个变量以展开请求URL中的占位符。参数可以是`Map<String, ?>` 具有多个变量或单个值。非字符串值支持类型转换。 |
| `@RequestAttribute` | 提供一个`Object`作为请求属性添加。仅受`WebClient`支持。      |
| `@RequestBody`      | 将请求的主体提供为要序列化的对象，或反应流发布器，如`Mono`、`Flux`，或通过配置的`ReactiveAdapterRegistry`支持的任何其他异步类型。 |
| `@RequestParam`     | 添加一个或多个请求参数。参数可以是多个参数的`Map<String，？>`或`MultiValueMap<String，？>`或单个参数的`Collection<？>`。非字符串值支持类型转换。当内容类型设置为`application/x-www-form-urlencoded`时，请求参数将编码在请求正文中。否则，它们将作为URL查询参数添加。 |
| `@RequestPart`      | 添加一个请求部分，它可以是String（表单字段）、`Resource`（文件部分）、Object（要编码的实体，例如JSON）、`HttpEntity`（部分内容和标题）、Spring `part`或以上任何一种的Reactive Streams `Publisher`。 |
| `MultipartFile`     | 从MultipartFile添加一个请求部分，该部分通常用于Spring MVC控制器，表示上传的文件。 |
| `@CookieValue`      | 添加一个或多个cookie。参数可以是多个参数的` Map<String，？>`或`MultiValueMap<字符串，？>`，单个参数的``Collection<？>`。非字符串值支持类型转换。 |

## 返回值

支持的返回值取决于基础客户端。适用于`HttpExchangeAdapter`的客户端，如`RestClient`和`RestTemplate`，支持同步返回值：

| Method return value    | Description                                |
| :--------------------- | :----------------------------------------- |
| `void`                 | 执行给定的请求                             |
| `HttpHeaders`          | 执行给定的请求并返回响应头                 |
| `<T>`                  | 执行给定的请求并返回响应体                 |
| `ResponseEntity<Void>` | 执行给定的请求并返回响应体`ResponseEntity` |
| `ResponseEntity<T>`    | 执行给定的请求并返回响应体`ResponseEntity` |

适用于`ReactorHttpExchangeAdapter`的客户端，如`WebClient`，支持上述所有功能以及反应式变体。下表显示了反应器类型，但您也可以使用`ReactiveAdapterRegistry`支持的其他反应器类型：

| Method return value            | Description                                                  |
| :----------------------------- | :----------------------------------------------------------- |
| `Mono<Void>`                   | 执行给定的请求，并丢弃响应内容（如果有的话）。               |
| `Mono<HttpHeaders>`            | 执行给定的请求，丢弃响应内容（如果有的话），并返回响应头。   |
| `Mono<T>`                      | 执行给定的请求，返回响应体                                   |
| `Flux<T>`                      | 执行给定的请求，并将响应内容解码为声明的元素类型的流。       |
| `Mono<ResponseEntity<Void>>`   | 执行给定的请求，丢弃响应内容（如果有），并返回带有状态和标头的“ResponseEntity”。 |
| `Mono<ResponseEntity<T>>`      | 执行给定的请求，将响应内容解码为声明的返回类型，并返回带有状态、标头和解码正文的“ResponseEntity”。 |
| `Mono<ResponseEntity<Flux<T>>` | 执行给定的请求，将响应内容解码为声明的元素类型的流，并返回带有状态、标头和解码的响应体流的“ResponseEntity”。 |

默认情况下，`ReactorHttpExchangeAdapter`同步返回值的超时取决于底层HTTP客户端的配置方式。您也可以在适配器级别设置`blockTimeout`值，但我们建议依赖底层HTTP客户端的超时设置，后者在较低级别运行，并提供更多控制。

## 错误处理

要自定义错误响应处理，您需要配置底层HTTP客户端。
对于`RestClient`：默认情况下，`RestClient`会为`4xx`和`5xx `HTTP状态代码引发`RestClientException`。要进行自定义，请注册一个响应状态处理程序，该处理程序适用于通过客户端执行的所有响应：

```java
RestClient restClient = RestClient.builder()
		.defaultStatusHandler(HttpStatusCode::isError, (request, response) -> ...)
		.build();

RestClientAdapter adapter = RestClientAdapter.create(restClient);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
```

对于WebClient：
默认情况下，`WebClient`会为`4xx`和`5xx `HTTP状态代码引发`WebClientResponseException`。要进行自定义，请注册一个响应状态处理程序，该处理程序适用于通过客户端执行的所有响应：

```java
WebClient webClient = WebClient.builder()
		.defaultStatusHandler(HttpStatusCode::isError, resp -> ...)
		.build();

WebClientAdapter adapter = WebClientAdapter.create(webClient);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builder(adapter).build();
```

对于RestTemplate：
默认情况下，`RestTemplate`会为`4xx`和`5xx `HTTP状态代码引发`RestClientException`。要进行自定义，请注册一个错误处理程序，该错误处理程序适用于通过客户端执行的所有响应：

```java
RestTemplate restTemplate = new RestTemplate();
restTemplate.setErrorHandler(myErrorHandler);

RestTemplateAdapter adapter = RestTemplateAdapter.create(restTemplate);
HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
```





