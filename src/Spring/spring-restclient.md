---
title: Spring RestClient
date: 2024-05-01
categories:
  - Spring
tags:
  - Spring
  - http
---

`RestClient`是一个同步的`HTTP`客户端，它提供了一个现代的、流畅的API。

## 创建RestClient

`RestClient`使用静态的`create`方法创建。您还可以使用`builder`方法来定制更多配置项，例如: 指定要使用的`HTTP`库和要使用的消息转换器，设置默认URI、默认路径变量、默认请求头或`uriBuilderFactory`，或者注册拦截器和初始化器。一旦创建了`RestClient`，多个线程就可以安全地使用它。

以下示例显示了如何创建默认的`RestClient`，以及如何构建自定义的`RestClient`：

```java
RestClient defaultClient = RestClient.create();

RestClient customClient = RestClient.builder()
  .requestFactory(new HttpComponentsClientHttpRequestFactory())
  .messageConverters(converters -> converters.add(new MyCustomMessageConverter()))
  .baseUrl("https://example.com")
  .defaultUriVariables(Map.of("variable", "foo"))
  .defaultHeader("My-Header", "Foo")
  .requestInterceptor(myCustomInterceptor)
  .requestInitializer(myCustomInitializer)
  .build();
```

## 使用 RestClient

当使用`RestClient`发出`HTTP`请求时，首先要指定使用哪种`HTTP`方法。这可以用`method(HttpMethod)`或`get`、`head`、`post`等来完成。

### 请求URL

接下来，可以使用`uri`方法指定请求`URI`，如果`RestClient`配置了默认`URI`，则可以跳过此步骤。`URL`通常指定为字符串，并带有可选的`URI`模板变量。字符串`URL`默认情况下是编码的，但这可以通过使用自定义`uriBuilderFactory`构建客户端来更改。

URL也可以由函数或`java.net.URI`提供，两者都未编码。有关使用和编码URI的更多详细信息，请参阅[URI](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-uri-building.html)。

### 请求头和请求体

可以通过 `header(String,String)`、`headers(Consumer<HttpHeaders>`)或`accept(MediaType…)`, `acceptCharset(Charset…) `等等操作请求头。

对于可以包含正文(`POST`、`PUT`和`PATCH`)的`HTTP`请求，可以使用其他方法：`contentType(MediaType)`和`contentLength(long)`。

请求体本身可以由 `body(Object)`设置，该主体在内部使用`HTTP`消息转换器进行转换。或者，可以使用`ParameterizedTypeReference`设置请求主体，从而允许您使用泛型。最后，可以将主体设置为一个回调函数，该函数写入`OutputStream`。

### 获取响应体

一旦设置了请求，就会通过调用`retrieve()`来访问`HTTP`响应。对于返回结果是列表等参数化类型，可以使用`body(Class)`或`body(ParameterizedTypeReference)`来访问响应正文。`body`方法将响应内容转换为各种类型——例如，`Byte`可以转换为`String`，`JSON`可以使用`Jackson`转换为对象。响应也可以转换为`ResponseEntity`，从而可以访问响应头和正文。

**Demo: 简单的GET请求**

```java
String result = restClient.get() 
  .uri("https://example.com") 
  .retrieve() 
  .body(String.class); 

System.out.println(result); 
```

**Demo: 通过ResponseEntity提供对响应状态代码和标头的访问**

```java
ResponseEntity<String> result = restClient.get() 
  .uri("https://example.com") 
  .retrieve()
  .toEntity(String.class); 

System.out.println("Response status: " + result.getStatusCode()); 
System.out.println("Response headers: " + result.getHeaders()); 
System.out.println("Contents: " + result.getBody());
```

RestClient可以使用Jackson库将JSON转换为对象。请注意此示例中URI变量的使用情况，Accept头被设置为JSON；

```java
int id = ...;
Pet pet = restClient.get()
  .uri("https://petclinic.example.com/pets/{id}", id) 
  .accept(APPLICATION_JSON) 
  .retrieve()
  .body(Pet.class); 
```

RestClient用于执行包含JSON的POST请求，该请求体再次使用Jackson进行转换。

```java
Pet pet = ... 
ResponseEntity<Void> response = restClient.post() 
  .uri("https://petclinic.example.com/pets/new") 
  .contentType(APPLICATION_JSON) 
  .body(pet) 
  .retrieve()
  .toBodilessEntity(); 
```

### 错误处理

默认情况下，`RestClient`对`4xx`或`5xx`状态代码抛出`RestClientException`子类。可以使用`onStatus`方法覆盖此行为:

```java
String result = restClient.get() 
  .uri("https://example.com/this-url-does-not-exist") 
  .retrieve()
  .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> { 
      throw new MyCustomRuntimeException(response.getStatusCode(), response.getHeaders()) 
  })
  .body(String.class);
```

### Exchange

对于更高级的场景，`RestClient`通过`exchange()`方法提供对底层`HTTP`请求和响应的访问，该方法可以代替`retrieve()`使用。使用`exchange()`时不会使用状态处理程序，因为`exchange`函数已经提供了对完整响应的访问，允许您执行任何必要的错误处理。

```java
Pet result = restClient.get()
  .uri("https://petclinic.example.com/pets/{id}", id)
  .accept(APPLICATION_JSON)
  .exchange((request, response) -> { 
    if (response.getStatusCode().is4xxClientError()) { 
      throw new MyCustomRuntimeException(response.getStatusCode(), response.getHeaders()); 
    }
    else {
      Pet pet = convertResponse(response); 
      return pet;
    }
  });
```

### HTTP消息转换

`spring-web`模块包含`HttpMessageConverter`接口，用于通过`InputStream`和`OutputStream`读取HTTP请求主体和写入响应主体。`HttpMessageConverter`实例用于客户端(例如在RestClient中)和服务器端(例如在Spring MVC REST控制器中)。

框架中提供了主要媒体(`MIME`)类型的具体实现，默认情况下，这些实现在客户端的`RestClient`和`RestTemplate`以及服务器端的`RequestMappingHandlerAdapter`中注册。

`HttpMessageConverter`的几个实现如下所述。对于所有转换器，都使用默认的媒体类型，但您可以通过设置`supportedMediaTypes`属性来覆盖它。

| MessageConverter                         | 描述                                                         |
| :--------------------------------------- | :----------------------------------------------------------- |
| `StringHttpMessageConverter`             | 从HTTP请求和响应中读取和写入String实例。默认情况下，此转换器支持所有文本媒体类型（`text/*`），并使用`text/plain`的`Content Type`进行写入。 |
| `FormHttpMessageConverter`               | 从HTTP请求和响应中读取和写入表单数据。默认情况下，此转换器读取和写入`application/x-www-form-urlencoded`媒体类型。表单数据从`MultiValueMap<String，String>`中读取并写入。 |
| `ByteArrayHttpMessageConverter`          | 从HTTP请求和响应中读取和写入字节数组。默认情况下，此转换器支持所有媒体类型(`*/*`)，并使用`application/octet-stream` 格式进行写入。 |
| `MarshallingHttpMessageConverter`        | 通过使用`org.springframework.oxm`包中的Marshaller和Unmarshaller抽象来读取和写入XML。此转换器需要Marshaller和Unmarshaller才能使用。您可以通过构造函数或bean属性注入这些。默认情况下，此转换器支持`text/xml`和`application/xml`。 |
| `MappingJackson2HttpMessageConverter`    | 使用`Jackson`的`ObjectMapper`读取和写入`JSON`。通过使用Jackson提供的注释，您可以根据需要自定义JSON`映射`。当您需要进一步的控制时（对于需要为特定类型提供自定义JSON序列化程序/反序列化程序的情况），您可以通过`ObjectMapper`属性注入自定义的`ObjectMapper`。默认情况下，此转换器支持`application/json`。 |
| `MappingJackson2XmlHttpMessageConverter` | 使用Jackson XML读取和写入xml。您可以根据需要通过使用JAXB或Jackson提供的注释来定制XML映射。当需要进一步控制时（对于需要为特定类型提供自定义XML序列化程序/反序列化程序的情况），可以通过`ObjectMapper`属性注入自定义`XmlMapper`。默认情况下，此转换器支持`application/xml`。 |
| `SourceHttpMessageConverter`             | 一个可以读写`javax.xml.transform.Source`的`HttpMessageConverter`实现。仅支持`DOMSource`、`SAXSource`和`StreamSource`。默认情况下，此转换器支持`text/xml`和`application/xml`。 |

默认情况下，`RestClient`和`RestTemplate`注册所有内置的消息转换器，具体取决于类路径上底层库的可用性。您还可以通过在`RestClient`构建器上使用`messageConverters()`方法，或通过`RestTemplate`的`messageConverters`属性，将消息转换器设置为显式使用。

### Jackson JSON Views

要序列化对象属性的子集，可以指定Jackson JSON View，如下例所示：

```java
MappingJacksonValue value = new MappingJacksonValue(new User("eric", "7!jd#h23"));
value.setSerializationView(User.WithoutPasswordView.class);

ResponseEntity<Void> response = restClient.post() // or RestTemplate.postForEntity
  .contentType(APPLICATION_JSON)
  .body(value)
  .retrieve()
  .toBodilessEntity();
```

### Multipart

要发送多部分数据，您需要提供一个`MultiValueMap<String,Object>`，其值可能是部分内容的`Object`、文件部分的`Resource`或带有标头的部分内容的`HttpEntity`。例如

```java
MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();

parts.add("fieldPart", "fieldValue");
parts.add("filePart", new FileSystemResource("...logo.png"));
parts.add("jsonPart", new Person("Jason"));

HttpHeaders headers = new HttpHeaders();
headers.setContentType(MediaType.APPLICATION_XML);
parts.add("xmlPart", new HttpEntity<>(myBean, headers));

// send using RestClient.post or RestTemplate.postForEntity
```

在大多数情况下，不必为每个部分指定`Content-Type`。内容类型是根据选择用于序列化的`HttpMessageConverter`自动确定的，或者在`Resource`的情况下，根据文件扩展名自动确定的。如果需要，可以显式地为`MediaType`提供`HttpEntity`包装器。

一旦`MultiValueMap`准备好，就可以使用`RestClient.POST().body(parts)`(或`RestTemplate.postForObject`)将其用作`POST`请求的主体。
如果`MultiValueMap`至少包含一个非字符串值，则`FormHttpMessageConverter`会将内容类型设置为`multipart/form`数据。如果`MultiValueMap`具有字符串值，则内容类型默认为`application/x-www-form-urlencoded`。如有必要，还可以显式设置`Content-Type`。

### Client Request Factories

为了执行`HTTP`请求，`RestClient`使用客户端`HTTP`库。这些库通过`ClientRequestFactory`接口进行调整。有多种实现方式可供选择：

- `JdkClientHttpRequestFactory` for Java’s `HttpClient`
- `HttpComponentsClientHttpRequestFactory` for use with Apache HTTP Components `HttpClient`
- `JettyClientHttpRequestFactory` for Jetty’s `HttpClient`
- `ReactorNettyClientRequestFactory` for Reactor Netty’s `HttpClient`
- `SimpleClientHttpRequestFactory` as a simple default

如果在构建`RestClient`时没有指定请求工厂，那么它将使用`Apache`或`JettyHttpClient`(如果它们在类路径中可用)。否则，如果加载了`java.net.http`模块，它将使用`java`的`HttpClient`。最后，它将采用默认的`SimpleClientHttpRequestFactory`。

## Spring Boot支持

如果您的应用程序中没有使用Spring Web Flux或Project Reactor，我们建议您使用RestClient来调用远程REST服务。RestClient接口提供了一种功能风格的阻塞API。

Spring Boot创建并预配置原型(prototype)`RestClient.Builder`。强烈建议在组件中注入它，并使用它来创建`RestClient`实例。Spring Boot使用`HttpMessageConverters`和适当的`ClientHttpRequestFactory`配置该构建器。

```java
@Service
public class MyService {

	private final RestClient restClient;

	public MyService(RestClient.Builder restClientBuilder) {
		this.restClient = restClientBuilder.baseUrl("https://example.org").build();
	}

	public Details someRestCall(String name) {
		return this.restClient.get().uri("/{name}/details", name).retrieve().body(Details.class);
	}

}
```

### 自定义RestClient 

RestClient自定义有三种主要方法，具体取决于您希望自定义应用的范围。

* 要使任何自定义的范围尽可能窄，请注入自动配置`RestClient.Builder`，然后根据需要调用其方法。`RestClient.Builder`实例是有状态的：生成器上的任何更改都会反映在随后使用它创建的所有客户端中。如果您想使用同一生成器创建多个客户端，也可以考虑使用`RestClient.Builder other=Builder.clone()`；。
* 为了在应用程序范围内对所有`RestClient.Builder`进行定制。您可以声明`RestClientCustomizer `bean。
* 最后，您可以使用`RestClient.create`。在这种情况下，不会应用自动配置或`RestClientCustomizer`。

### RestClient SSL Support

如果您需要在`RestClient`使用的`ClientHttpRequestFactory`上进行自定义SSL配置，则可以注入一个`RestClientSsl`实例，该实例可以与构建器的`apply`方法一起使用。
`RestClientSsl`接口提供对您在`application.properties`或`application.yaml`文件中定义的任何SSL Bundle的访问。

```java
@Service
public class MyService {

	private final RestClient restClient;

	public MyService(RestClient.Builder restClientBuilder, RestClientSsl ssl) {
		this.restClient = restClientBuilder.baseUrl("https://example.org").apply(ssl.fromBundle("mybundle")).build();
	}

	public Details someRestCall(String name) {
		return this.restClient.get().uri("/{name}/details", name).retrieve().body(Details.class);
	}

}
```

如果除了SSL Bundle之外还需要应用其他自定义，则可以将`ClientHttpRequestFactorySettings`类与`ClientHttpRequestFactory`一起使用：
```java
@Service
public class MyService {

	private final RestClient restClient;

	public MyService(RestClient.Builder restClientBuilder, SslBundles sslBundles) {
		ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.DEFAULTS
			.withReadTimeout(Duration.ofMinutes(2))
			.withSslBundle(sslBundles.getBundle("mybundle"));
		ClientHttpRequestFactory requestFactory = ClientHttpRequestFactories.get(settings);
		this.restClient = restClientBuilder.baseUrl("https://example.org").requestFactory(requestFactory).build();
	}

	public Details someRestCall(String name) {
		return this.restClient.get().uri("/{name}/details", name).retrieve().body(Details.class);
	}

}
```



