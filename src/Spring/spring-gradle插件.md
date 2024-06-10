---
title: Spring Gradle 插件
date: 2024-04-27
categories:
  - Spring
tags:
  - Spring
  - gradle
---

Gradle插件支持的功能

* 打包，支持jar，war包
* 依赖管理

该插件单独应用，对项目几乎没有任何更改。相反，插件会检测何时应用某些其他插件，并做出相应的反应。例如，当应用`java`插件时，会自动配置用于构建可执行`jar`的任务。

## 依赖管理

依赖管理有两种方式：

* 使用插件：[`io.spring.dependency-management`](https://github.com/spring-gradle-plugins/dependency-management-plugin)
* 使用Gradle的原生bom支持

> 之前可以使用属性覆盖版本，后者可以更快速的构建

### 使用插件引入依赖

当引入`io.spring.dependency-management`插件时，底层会引入`spring-boot-dependencies` bom 文件。当使用此种方式，就可以省略版本号引入依赖：

```groovy
dependencies {
	implementation('org.springframework.boot:spring-boot-starter-web')
	implementation('org.springframework.boot:spring-boot-starter-data-jpa')
}
```

`SpringBootPlugin`类提供了一个`BOM_CORDINATES`常量，该常量可用于导入BOM，而无需知道其组ID、工件ID或版本:

```groovy
apply plugin: 'io.spring.dependency-management'

dependencyManagement {
	imports {
		mavenBom org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES
	}
}
```

`io.spring.dependency-management `插件也可以通过插件的方式单独引入，但是需要指定版本：

```groovy
plugins {
	java
	id("org.springframework.boot") version "3.3.0" apply false
	id("io.spring.dependency-management") version "1.1.5"
}

dependencyManagement {
	imports {
		mavenBom(org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES)
	}
}
```

#### 自定义版本号

若要自定义托管版本，请设置其相应的[属性](https://docs.spring.io/spring-boot/appendix/dependency-versions/properties.html)。例如，要自定义由`slf4j.version`属性控制的SLF4J的版本：

```groovy
ext['slf4j.version'] = '1.7.20'
```

### Gradle的原生bom支持

`Gradle`允许使用`bom`来管理项目的版本，方法是将其声明为`platform`或`enforcedPlatform`依赖项。`platform`依赖关系将`bom`中的版本视为建议，依赖关系图中的其他版本和约束可能会导致使用`bom`中声明的依赖关系被覆盖。`enforcedPlatform`依赖关系将`bom`中的版本视为需求，它们将覆盖依赖关系图中的任何其他版本。

```groovy
dependencies {
	implementation platform(org.springframework.boot.gradle.plugin.SpringBootPlugin.BOM_COORDINATES)
}
```

#### 自定义版本号

当使用Gradle的bom支持时，您不能使用`spring-boot-dependencies`中的属性来控制它管理的依赖项的版本。必须使用Gradle提供的机制。其中一个机制是解决策略。SLF4J的模块都在org.SLF4J组中，因此可以通过将该组中的每个依赖项配置为使用特定版本来控制其版本，如以下示例所示：

```groovy
configurations.all {
	resolutionStrategy.eachDependency { DependencyResolveDetails details ->
		if (details.requested.group == 'org.slf4j') {
			details.useVersion '1.7.20'
		}
	}
}
```

## 打包可执行包

该插件可以创建包含应用程序所有依赖项的可执行档案（jar文件和war文件），然后可以使用`java -jar`运行。

### 可执行jar

可执行`jar`可以使用`bootJar`任务构建。该任务是在应用`java`插件时自动创建的。`assemble`任务被自动配置为依赖于`bootJar`任务，因此运行`assemble`（或`build`）也将运行`bootJar`。



### 可执行War

可执行的`war`可以使用`bootWar`任务构建。该任务是在应用`war`插件时自动创建的。`assemble`任务自动配置为依赖于`bootWar`任务，因此运行运行`assemble`（或`build`）也将运行`bootWar`。



#### 打包可执行和可部署的War

`war`文件可以打包，这样它就可以使用`java -jar`执行并部署到外部容器中。为此，应将嵌入的servlet容器依赖项添加到`providedRuntime`配置中，例如：

```groovy
dependencies {
	implementation('org.springframework.boot:spring-boot-starter-web')
	providedRuntime('org.springframework.boot:spring-boot-starter-tomcat')
}
```

这确保了它们被打包在`war`文件的`WEB-INF/lib`目录中，在那里它们不会与外部容器自己的类冲突。

### 可执行文件和`Plain Archives`

默认情况下，当配置`bootJar`或`bootWar`任务时，`jar`或`war`任务被配置为使用`plain`作为其存档分类器的约定。这确保了`bootJar/jar`或`bootWar/war`具有不同的输出位置，从而允许同时构建可执行归档和普通归档。

如果您更喜欢可执行归档而不是普通归档，使用分类器，请按照以下`jar`和`bootJar`任务示例所示配置分类器：

```groovy
tasks.named("bootJar") {
	archiveClassifier = 'boot'
}

tasks.named("jar") {
	archiveClassifier = ''
}
```

或者，如果您希望根本不构建普通存档，请禁用其任务，如以下`jar`任务示例所示：

```java
tasks.named("jar") {
	enabled = false
}
```

### 配置可执行包

`BootJar`和`BootWar`任务分别是`Gradle`的`Jar`和`War`任务的子类。因此，在打包`jar`或`war`时可用的所有标准配置选项在打包可执行`jar`或`war`时也可用。还提供了许多特定于可执行`jar`和`war`的配置选项。

#### 配置Main Class

默认情况下，可执行归档文件的`main class`将通过在`main source set`的输出中查找具有`public static void main(String[])`方法的类来自动配置。

显式配置：

```groovy
tasks.named("bootJar") {
	mainClass = 'com.example.ExampleApplication'
}
```

或者，可以使用`Spring Boot DSL`的`mainClass`属性在项目范围内配置：

```groovy
springBoot {
	mainClass = 'com.example.ExampleApplication'
}
```

如果应用了`application`插件，则必须配置其`mainClass`属性，并且该属性可以用于相同的目的：

```java
application {
	mainClass = 'com.example.ExampleApplication'
}
```

最后，可以在任务的清单上配置`StartClass`属性：

```groovy
tasks.named("bootJar") {
	manifest {
		attributes 'Start-Class': 'com.example.ExampleApplication'
	}
}
```

#### 包含开发时依赖

默认情况下，`developmentOnly`配置中声明的所有依赖项都将从可执行`jar`或`war`中排除。
如果要将`developmentOnly`配置中声明的依赖项包括在存档中，请将其任务的类路径配置为包括该配置，如以下`bootWar`任务示例所示：

```groovy
tasks.named("bootWar") {
	classpath configurations.developmentOnly
}
```

#### 配置需要解包的库

可执行包中的依赖项大多数可以直接使用，但是有些可能会出现问题。例如，`JRuby`包含其自己的嵌套jar，这些jar假定`jruby-complete.jar`在文件系统上总是直接可用的。

为了处理任何有问题的库，可以配置可执行档案，以便在运行可执行档案时将特定的嵌套jar解压缩到临时目录。库可以被识别为需要使用与源jar文件的绝对路径匹配的Ant样式模式进行解包：

```groovy
tasks.named("bootJar") {
	requiresUnpack '**/jruby-complete-*.jar'
}
```

为了进行更多的控制，还可以使用闭包。闭包被传递一个FileTreeElement，并且返回一个布尔值，指示是否需要拆包。

#### 使归档可执行

Spring Boot提供了对完全可执行档案的支持。通过准备一个知道如何启动应用程序的shell脚本，可以使归档文件完全可执行。在类Unix平台上，此启动脚本允许归档文件像任何其他可执行文件一样直接运行，或者作为服务安装。

要使用此功能，必须启用包含启动脚本：

```groovy
tasks.named("bootJar") {
	launchScript()
}
```

这将把Spring Boot的默认启动脚本添加到存档中。默认启动脚本包括几个具有合理默认值的属性。可以使用properties属性自定义这些值：

```groovy
tasks.named("bootJar") {
	launchScript {
		properties 'logFilename': 'example-app.log'
	}
}
```

如果默认启动脚本不满足您的需要，则脚本属性可用于提供自定义启动脚本：

```groovy
tasks.named("bootJar") {
	launchScript {
		script = file('src/custom.script')
	}
}
```

#### 使用PropertiesLauncher

要使用`PropertiesLauncher`启动可执行jar或war，请配置任务的清单以设置Main Class属性：

```groovy
tasks.named("bootWar") {
	manifest {
		attributes 'Main-Class': 'org.springframework.boot.loader.launch.PropertiesLauncher'
	}
}
```

#### Packaging Layered Jar or War

默认情况下，`bootJar`任务构建一个档案，其中分别包含`BOOT-INF/classes`和`BOOT-INF/lib`中应用程序的类和依赖项。类似地，`bootWar`构建了一个档案，其中包含`WEB-INF/classes`中的应用程序类以及所提供的`WEB-INF/lib`和`WEB-INF/lib`中的依赖项。对于需要从`jar`的内容构建`docker`映像的情况，能够进一步分离这些目录以将它们写入不同的层是非常有用的。

分层的jar使用与常规引导打包的jar相同的布局，但包括一个额外的元数据文件来描述每一层。默认情况下，将定义以下图层：

* 项目依赖项，依赖项版本不包含SNAPSHOT。
* spring-boot-loader 用于jar 包加载类。
* 项目依赖项，依赖项版本包含SNAPSHOT。
* 项目依赖项、应用程序类和资源。

默认顺序是dependencies`, `spring-boot-loader`, `snapshot-dependencies`, `application。应首先添加最不可能更改的内容，然后添加有可能更改的图层。

要禁用此功能，可以按以下方式执行：

```groovy
tasks.named("bootJar") {
	layered {
		enabled = false
	}
}
```

当创建了一个分层的`jar`或`war`时，`spring-boot-jarmode-tools jar`将作为一个依赖项添加到您的归档中。有了类路径上的这个jar，可以提取层。如果您希望排除此依赖项，可以按以下方式执行：

```groovy
tasks.named("bootJar") {
	includeTools = false
}
```

##### 自定义层

您可能需要调整图层的创建方式并添加新图层。这可以使用描述如何将jar或war划分为多个层以及这些层的顺序的配置来完成。以下示例显示了如何明确定义上述默认顺序：

```java
tasks.named("bootJar") {
	layered {
		application {
			intoLayer("spring-boot-loader") {
				include "org/springframework/boot/loader/**"
			}
			intoLayer("application")
		}
		dependencies {
			intoLayer("application") {
				includeProjectDependencies()
			}
			intoLayer("snapshot-dependencies") {
				include "*:*:*SNAPSHOT"
			}
			intoLayer("dependencies")
		}
		layerOrder = ["dependencies", "spring-boot-loader", "snapshot-dependencies", "application"]
	}
}
```

分层DSL由三部分定义：

* application闭包定义了应用程序类和资源应该如何分层。
* 依赖关系闭包定义了应该如何对依赖关系进行分层。
* layerOrder方法定义了应该写入图层的顺序。

## 打包OCI镜像

该插件可以使用Cloud Native Buildpacks（CNB）从jar或war文件创建OCI映像。可以使用`bootBuildImage`任务构建图像。该任务是在应用java或war插件时自动创建的，并且是`BootBuildImage`的一个实例。

> OCI是一种镜像格式规范，相比于事实的Docker Image规范，OCI是为了制定统一的标准。
>
> [OCI 与容器镜像构建 - 掘金 (juejin.cn)](https://juejin.cn/post/7026551617407156255)
>
> [老树开新花 - Cloud Native Buildpacks – 陈少文的网站 (chenshaowen.com)](https://www.chenshaowen.com/blog/a-sample-intro-to-cloud-native-buildpacks.html)

### Docker Daemon

`bootBuildImage`任务需要访问`Docker`守护进程。该任务将检查本地`Docker CLI`配置文件以确定当前上下文，并使用上下文连接信息与`Docker`守护进程进行通信。如果无法确定当前上下文或上下文没有连接信息，则任务将使用默认的本地连接。这可以在所有支持的平台上与Docker引擎一起工作，无需配置。

可以设置环境变量，将`bootBuildImage`任务配置为使用备用本地或远程连接。下表显示了环境变量及其值：

| Environment variable | Description                                                  |
| :------------------- | :----------------------------------------------------------- |
| DOCKER_CONFIG        | Docker CLI配置文件的位置( `$HOME/.docker`)                   |
| DOCKER_CONTEXT       | 上下文的名称，用于从Docker CLI配置文件中检索主机信息(覆盖`DOCKER_HOST`) |
| DOCKER_HOST          | 包含Docker守护进程的主机和端口的URL- `tcp://192.168.99.100:2376` |
| DOCKER_TLS_VERIFY    | 设置为1时启用安全HTTPS协议（可选）                           |
| DOCKER_CERT_PATH     | HTTPS的证书和密钥文件的路径（如果`DOCKER_TLS_VERIFY=1'则为必需，否则忽略） |

Docker守护进程连接信息也可以使用插件配置中的Docker属性提供。下表总结了可用的属性：

| Property          | Description                                                  |
| :---------------- | :----------------------------------------------------------- |
| `context`         | 上下文的名称，用于从Docker CLI配置文件中检索主机信息         |
| `host`            | 包含Docker守护进程的主机和端口的URL- `tcp://192.168.99.100:2376` |
| `tlsVerify`       | 设置为true，开启Https协议                                    |
| `certPath`        | HTTPS的证书和密钥文件的路径（如果`DOCKER_TLS_VERIFY=1'则为必需，否则忽略） |
| bindHostToBuilder | 当true时，host属性的值将提供给为CNB生成器创建的容器（可选）  |

### Docker Registry

如果`builder`或`runImage`属性指定的Docker映像存储在需要身份验证的专用Docker Registry中，则可以使用`docker.builderRegistry`属性提供身份验证凭据。

如果生成的镜像发布到Docker Registry中，则可以使用`docker.publishRegistry`属性提供身份验证凭据。

下表列出了`docker.builderRegistry`和`docker.publishRegistry`可以指定的属性：

| Property   | Description                        |
| :--------- | :--------------------------------- |
| `username` | 用户名，使用用户认证时必需         |
| `password` | 密码，使用用户认证时必需           |
| `url`      | 注册中心的地址，使用用户认证时可选 |
| `email`    | 邮箱，使用用户认证时可选           |
| `token`    | 使用token认证时，必须要指定        |

### 镜像自定义

插件调用builder来生成镜像，builder包含多个buildpack。下表列出了配置属性可以影响镜像的构建：

| Property               | Command-line option      | Description                                                  | Default value                                                |
| :--------------------- | :----------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| `builder`              | `--builder`              | Builder使用的镜像                                            | `paketobuildpacks/builder-jammy-base:latest` or `paketobuildpacks/builder-jammy-tiny:latest` when [GraalVM Native Image plugin](https://graalvm.github.io/native-build-tools/0.10.2/gradle-plugin.html) is applied. |
| `runImage`             | `--runImage`             | Name of the run image to use.                                | No default value, indicating the run image specified in Builder metadata should be used. |
| `imageName`            | `--imageName`            | [Image name](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/buildpack/platform/docker/type/ImageReference.html#of-java.lang.String-) for the generated image. | `docker.io/library/${project.name}:${project.version}`       |
| `pullPolicy`           | `--pullPolicy`           | [Policy](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/buildpack/platform/build/PullPolicy.html) used to determine when to pull the builder and run images from the registry. Acceptable values are `ALWAYS`, `NEVER`, and `IF_NOT_PRESENT`. | `ALWAYS`                                                     |
| `environment`          |                          | Environment variables that should be passed to the builder.  | Empty or `['BP_NATIVE_IMAGE': 'true']` when [GraalVM Native Image plugin](https://graalvm.github.io/native-build-tools/0.10.2/gradle-plugin.html) is applied. |
| `buildpacks`           |                          | Buildpacks that the builder should use when building the image. Only the specified buildpacks will be used, overriding the default buildpacks included in the builder. Buildpack references must be in one of the following forms:Buildpack in the builder - `[urn:cnb:builder:]<buildpack ID>[@<version>]`Buildpack in a directory on the file system - `[file://]<path>`Buildpack in a gzipped tar (.tgz) file on the file system - `[file://]<path>/<file name>`Buildpack in an OCI image - `[docker://]<host>/<repo>[:<tag>][@<digest>]` | None, indicating the builder should use the buildpacks included in it. |
| `bindings`             |                          | [Volume bind mounts](https://docs.docker.com/storage/bind-mounts/) that should be mounted to the builder container when building the image. The bindings will be passed unparsed and unvalidated to Docker when creating the builder container. Bindings must be in one of the following forms:`<host source path>:<container destination path>[:<options>]``<host volume name>:<container destination path>[:<options>]`Where `<options>` can contain:`ro` to mount the volume as read-only in the container`rw` to mount the volume as readable and writable in the container`volume-opt=key=value` to specify key-value pairs consisting of an option name and its value |                                                              |
| `network`              | `--network`              | The [network driver](https://docs.docker.com/network/#network-drivers) the builder container will be configured to use. The value supplied will be passed unvalidated to Docker when creating the builder container. |                                                              |
| `cleanCache`           | `--cleanCache`           | Whether to clean the cache before building.                  | `false`                                                      |
| `verboseLogging`       |                          | Enables verbose logging of builder operations.               | `false`                                                      |
| `publish`              | `--publishImage`         | Whether to publish the generated image to a Docker registry. | `false`                                                      |
| `tags`                 |                          | A list of one or more additional tags to apply to the generated image. The values provided to the `tags` option should be **full** image references. See [the tags section](https://docs.spring.io/spring-boot/gradle-plugin/packaging-oci-image.html#build-image.customization.tags) for more details. |                                                              |
| `buildWorkspace`       |                          | A temporary workspace that will be used by the builder and buildpacks to store files during image building. The value can be a named volume or a bind mount location. | A named volume in the Docker daemon, with a name derived from the image name. |
| `buildCache`           |                          | A cache containing layers created by buildpacks and used by the image building process. The value can be a named volume or a bind mount location. | A named volume in the Docker daemon, with a name derived from the image name. |
| `launchCache`          |                          | A cache containing layers created by buildpacks and used by the image launching process. The value can be a named volume or a bind mount location. | A named volume in the Docker daemon, with a name derived from the image name. |
| `createdDate`          | `--createdDate`          | A date that will be used to set the `Created` field in the generated image’s metadata. The value must be a string in the ISO 8601 instant format, or `now` to use the current date and time. | A fixed date that enables [build reproducibility](https://buildpacks.io/docs/features/reproducibility/). |
| `applicationDirectory` | `--applicationDirectory` | The path to a directory that application contents will be uploaded to in the builder image. Application contents will also be in this location in the generated image. | `/workspace`                                                 |
| `securityOptions`      | `--securityOptions`      | [Security options](https://docs.docker.com/engine/reference/run/#security-configuration) that will be applied to the builder container, provided as an array of string values | `["label=disable"]` on Linux and macOS, `[]` on Windows      |

## 使用 Maven-publish 插件发布包

要发布您的Spring Boot jar或war，请使用`MavenPublication`上的`artifact`方法将其添加到`MavenPublication`中。例如，要发布默认bootJar任务生成的工件：

```groovy
publishing {
	publications {
		bootJava(MavenPublication) {
			artifact tasks.named("bootJar")
		}
	}
	repositories {
		maven {
			url 'https://repo.example.com'
		}
	}
}
```

### 使用application插件进行分发

当存在`application`插件时，将创建一个名为`boot`的分发。此发行版包含`bootJar`或`bootWar`任务生成的存档，以及在类`Unix`平台和`Windows`上启动它的脚本。`Zip`和`tar`分发版可以分别由`bootDistZip`和`bootDistTar`任务构建。若要使用application插件，必须使用应用程序主类的名称配置其`mainClassName`属性。

## 使用gradle运行项目

要在不首先构建存档的情况下运行应用程序，请使用bootRun任务：

```shell
$ ./gradlew bootRun
```

`bootRun`任务是`bootRun`的一个实例，它是`JavaExec`子类。因此，您可以使用Gradle中执行Java进程的所有常见配置选项。任务会自动配置为使用主源集的运行时类路径。

默认情况下，将通过在主源集的输出中查找具有`public static void main(String[])`方法的类来自动配置主类。

显式配置main class:

```groovy
tasks.named("bootRun") {
	mainClass = 'com.example.ExampleApplication'
}
```

你也可以使用下面的方式配置：

```groovy
springBoot {
	mainClass = 'com.example.ExampleApplication'
}
```

你还可以使用application 插件配置：

```groovy
application {
	mainClass = 'com.example.ExampleApplication'
}
```

默认情况下，bootRun将配置JVM以优化其启动，从而在开发过程中更快地启动。可以使用optimizedLaunch属性禁用此行为，如以下示例所示：

```groovy
tasks.named("bootRun") {
	optimizedLaunch = false
}
```

### 传递启动参数

与所有JavaExec任务一样，可以使用`--args='<arguments>'`从命令行将参数传递到bootRun。例如，要使用名为dev的profile运行应用程序，可以使用以下命令：

```shell
$ ./gradlew bootRun --args='--spring.profiles.active=dev'
```

### 传递系统属性

由于bootRun是一个标准的JavaExec任务，因此可以通过在构建脚本中指定系统属性来将系统属性传递给应用程序的JVM。要使系统属性的值可配置，请使用项目属性设置其值。若要允许项目属性是可选的，请使用findProperty引用它。这样做还允许使用 `?: Elvis`运算符，如以下示例所示：

```groovy
tasks.named("bootRun") {
	systemProperty 'com.example.property', findProperty('example') ?: 'default'
}
```

前面的示例将`com.example.properties`系统属性设置为示例项目属性的值。如果未设置示例项目属性，则系统属性的值将为默认值。

Gradle允许以多种方式设置项目属性，包括在命令行中使用`-P`标志，如以下示例所示：

```shell
$ ./gradlew bootRun -Pexample=custom
```

上例将示例项目属性的值设置为`custom`。bootRun将使用它作为com.example.properties系统属性的值。

### Reloading Resources

如果已经将`devtools`添加到您的项目中，它将自动监视应用程序的类路径是否发生更改。请注意，修改后的文件需要重新编译以更新类路径，从而触发使用`devtools`的重新加载。
或者，您可以配置bootRun，以便从其源位置加载应用程序的静态资源：

```gradle
tasks.named("bootRun") {
	sourceResources sourceSets.main
}
```

这使得它们可以在实时应用程序中重新加载，这在开发时很有帮助。

### Using a Test Main Class

除了`bootRun`，还注册了`bootTestRun`任务。与`bootRun`一样，`bootTestRun`是`bootRun`的一个实例，但它被配置为使用测试源集输出中的主类，而不是主源集。它还使用测试源集的运行时类路径，而不是主源集的执行时类路径。由于`bootTestRun`是`BootRun`的一个实例，上面为`BootRun`描述的所有配置选项也可以与`bootTestRun`一起使用。

## 和 Actuator 集成

### 生成Build 信息

Spring Boot Actuator的信息端点会在`META-INF/build-info.properties`文件的存在下自动发布有关构建的信息。提供了一个`BuildInfo`任务来生成此文件。使用该任务的最简单方法是通过插件的DSL：

```groovy
springBoot {
	buildInfo()
}
```

这将配置一个名为`bootBuildInfo`的`BuildInfo`任务，如果它存在，则使Java插件的`classes`任务依赖于它。该任务的目标目录是主源集资源（通常为build/resources/main）的输出目录中的META-INF。

默认情况下，生成的信息源自项目：

| Property         | Default value                                    |
| :--------------- | :----------------------------------------------- |
| `build.artifact` | The base name of the `bootJar` or `bootWar` task |
| `build.group`    | The group of the project                         |
| `build.name`     | The name of the project                          |
| `build.version`  | The version of the project                       |
| `build.time`     | The time at which the project is being built     |

```groovy
springBoot {
	buildInfo {
		properties {
			artifact = 'example-app'
			version = '1.2.3'
			group = 'com.example'
			name = 'Example application'
		}
	}
}
```

要从生成的信息中排除任何默认属性，请将其名称添加到排除中。例如，可以按以下方式排除时间特性：

```gradle
springBoot {
	buildInfo {
		excludes = ['time']
	}
}
```

build.time的默认值是生成项目的时刻。这样做的一个副作用是，任务永远不会是最新的。因此，由于需要执行更多的任务，包括项目的测试，构建将需要更长的时间。另一个副作用是，任务的输出总是会更改，因此，构建不会真正可重复。如果您对构建性能或可重复性的重视程度高于build.time属性的准确性，请排除前面示例中所示的时间属性。

还可以将其他属性添加到生成信息中：

```groovy
springBoot {
	buildInfo {
		properties {
			additional = [
				'a': 'alpha',
				'b': 'bravo'
			]
		}
	}
}
```

可以使用`Provider`延迟计算附加属性的值。

## Reacting to Other Plugins







可以很容易地将Spring Boot uber jar打包为docker映像。然而，复制和运行docker映像中的uber jar有各种缺点。当在不解压的情况下运行uber jar时，总是会有一定的开销，而在容器化环境中，这一点很明显。另一个问题是，将应用程序的代码及其所有依赖项放在Docker映像的一层中并不是最优的。由于重新编译代码的频率可能比升级所使用的Spring Boot版本的频率更高，因此通常最好多分离一些东西。如果您将jar文件放在应用程序类之前的层中，Docker通常只需要更改最底层，就可以从其缓存中提取其他文件。

为了更容易创建优化的Docker镜像，Spring Boot支持在jar中添加一个层索引文件。它提供了一个层列表以及应该包含在其中的jar部分。索引中的层列表是根据层应添加到Docker/OCI图像的顺序排列的。开箱即用，支持以下图层：

- `dependencies` (for regular released dependencies)
- `spring-boot-loader` (for everything under `org/springframework/boot/loader`)
- `snapshot-dependencies` (for snapshot dependencies)
- `application` (for application classes and resources)

以下显示了layers.idx文件的示例：

```shell
- "dependencies":
  - BOOT-INF/lib/library1.jar
  - BOOT-INF/lib/library2.jar
- "spring-boot-loader":
  - org/springframework/boot/loader/launch/JarLauncher.class
  - ... <other classes>
- "snapshot-dependencies":
  - BOOT-INF/lib/library3-SNAPSHOT.jar
- "application":
  - META-INF/MANIFEST.MF
  - BOOT-INF/classes/a/b/C.class
```

这种分层设计用于根据应用程序构建之间变化的可能性来分离代码。库代码不太可能在构建时发生变化，因此它被放置在自己的层中，以允许工具重用缓存中的层。应用程序代码更有可能在不同的构建之间发生变化，因此它被隔离在一个单独的层中。

Spring Boot还支持在layers.idx的帮助下对war文件进行分层。

虽然只需Dockerfile中的几行就可以将Spring Boot uber jar转换为docker映像，但我们将使用分层功能来创建优化的docker映像。当您创建一个包含层索引文件的jar时，spring boot jarmode tools jar将作为依赖项添加到您的jar中。有了类路径上的这个jar，您可以以一种特殊的模式启动应用程序，这种模式允许引导程序代码运行与应用程序完全不同的东西，例如提取层的东西。

以下是如何使用工具jar模式启动jar：

```shell
$ java -Djarmode=tools -jar my-app.jar
```

这将提供以下输出：

```shell
Usage:
  java -Djarmode=tools -jar my-app.jar

Available commands:
  extract      Extract the contents from the jar
  list-layers  List layers from the jar that can be extracted
  help         Help about any command
```

`extract`命令可用于轻松地将应用程序拆分为要添加到`dockerfile`中的层。下面是一个使用`jarmode`的`Dockerfile`示例:

```dockerfile
FROM bellsoft/liberica-runtime-container:jre-17-cds-slim-glibc as builder
WORKDIR /builder
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

FROM bellsoft/liberica-runtime-container:jre-17-cds-slim-glibc
WORKDIR /application
COPY --from=builder /builder/extracted/dependencies/ ./
COPY --from=builder /builder/extracted/spring-boot-loader/ ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/ ./
ENTRYPOINT ["java", "-jar", "application.jar"]
```



