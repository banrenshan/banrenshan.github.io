import{_ as t}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as l,o as r,c as o,b as a,d as e,e as n,a as i}from"./app-CD92BIt9.js";const c="/assets/java-sourcesets-compilation-Cc6BUezG.png",p="/assets/java-sourcesets-process-resources-DX9iR__n.png",d={},u=i(`<h1 id="插件的生命周期" tabindex="-1"><a class="header-anchor" href="#插件的生命周期"><span>插件的生命周期</span></a></h1><p>Base插件提供了大多数构建通用的一些任务和约定，并为构建添加了一个结构，以提高它们运行方式的一致性。它最重要的贡献是一组生命周期任务，充当其他插件和具体任务的保护伞。</p><p>主要任务和声明周期:</p><ul><li>clean — Delete: 删除build目录及其子目录下的所有内容，即Project.getBuildDir（）项目属性指定的路径。</li><li>check — lifecycle task：插件和构建作者应使用<code>check.dependsOn(*task*)</code>将验证任务（例如运行测试的任务）附加到此生命周期任务。</li><li>assemble — lifecycle task：插件和构建作者应该将生成发行版和其他可消费工件的任务附加到此生命周期任务。例如，jar为Java库生成可消费的工件。使用<code>assemble.dependsOn(*task*)</code>将任务附加到此生命周期任务</li><li>build — lifecycle task：依赖<code>check</code>, <code>assemble</code>。旨在构建一切，包括运行所有测试、生成生产工件和生成文档。您可能很少直接将具体任务附加到构建中，因为assemble和check通常更合适。</li><li>buildConfiguration — task rule： 组装附加到命名配置的那些工件。例如，buildArchives将执行任务，将所有工件绑定到archives 配置。</li><li>cleanTask — task rule： 删除任务的输出，例如cleanJar将删除Java插件的JAR任务生成的JAR文件。</li></ul><p>base插件没有为依赖项添加配置，但它添加了以下配置：</p><ul><li><strong>default</strong>: 消费者项目使用的回退配置。假设您的项目B依赖于项目A。Gradle使用一些内部逻辑来确定项目A的哪些工件和依赖项添加到项目B的指定配置中。如果没有其他因素适用-您不必担心这些因素是什么-那么Gradle会回到使用项目A的默认配置中的所有内容。新版本和插件不应使用默认配置！由于向后兼容的原因，它仍然存在。</li><li><strong>archives</strong>: 项目生产工件的标准配置。</li></ul><p>base插件将base扩展添加到项目中。这允许在专用DSL块内配置以下属性:</p><div class="language-groovy line-numbers-mode" data-ext="groovy" data-title="groovy"><pre class="language-groovy"><code>base <span class="token punctuation">{</span>
    archivesName <span class="token operator">=</span> <span class="token interpolation-string"><span class="token string">&quot;gradle&quot;</span></span>
    distsDirectory <span class="token operator">=</span> layout<span class="token punctuation">.</span>buildDirectory<span class="token punctuation">.</span><span class="token function">dir</span><span class="token punctuation">(</span><span class="token string">&#39;custom-dist&#39;</span><span class="token punctuation">)</span>
    libsDirectory <span class="token operator">=</span> layout<span class="token punctuation">.</span>buildDirectory<span class="token punctuation">.</span><span class="token function">dir</span><span class="token punctuation">(</span><span class="token string">&#39;custom-libs&#39;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>archivesName : 默认**$project.name**</li><li>distsDirectory：默认**$buildDir/distributions** ：创建分发存档（即非JAR）的目录的默认名称。</li><li>libsDirectory： 默认**$buildDir/libs**： 创建库存档（即JAR）的目录的默认名称。</li></ul><p>该插件还为任何扩展AbstractArchiveTask的任务提供以下属性的默认值：</p><ul><li><strong>destinationDirectory</strong>：对于非JAR归档文件，默认为distsDirectory；对于JAR及其派生文件，例如WAR，默认为libsDirectory。</li><li>archiveVersion： 默认为$project.version或<strong>unspecified</strong>（如果项目没有版本）。</li><li>archiveBaseName： 默认值为$archivesBaseName。</li></ul><h1 id="构建java项目" tabindex="-1"><a class="header-anchor" href="#构建java项目"><span>构建java项目</span></a></h1><p>Gradle使用约定优于配置的方法来构建基于JVM的项目，该方法借鉴了Apache Maven的一些约定。特别是，它对源文件和资源使用相同的默认目录结构，并与Maven兼容的存储库一起工作。</p><h2 id="入门项目" tabindex="-1"><a class="header-anchor" href="#入门项目"><span>入门项目</span></a></h2><p>Java项目最简单的构建脚本 先从应用Java <em>Library</em> 插件开始，设置项目版本并选择要使用的Java工具链：</p><p><strong>build.gradle:</strong></p><div class="language-groovy line-numbers-mode" data-ext="groovy" data-title="groovy"><pre class="language-groovy"><code>plugins <span class="token punctuation">{</span>
    id <span class="token string">&#39;java-library&#39;</span>
<span class="token punctuation">}</span>

java <span class="token punctuation">{</span>
    toolchain <span class="token punctuation">{</span>
        languageVersion <span class="token operator">=</span> JavaLanguageVersion<span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">11</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

version <span class="token operator">=</span> <span class="token string">&#39;1.2.1&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>通过应用Java Library插件，您可以获得一整套功能：</p><ul><li>compileJava任务，编译src/main/java下的所有Java源文件</li><li>compileTestJava任务，编译src/test/java下的所有Java源文件</li><li>test 任务， 运行src/test/java下的测试用例</li><li>一个jar任务，将主要编译类（src/main/java下的类）和src/main/resources中的资源打包到一个名为<code>&lt;project&gt;-&lt;version&gt;.jar</code>的jar中</li><li>为主要类生成javadoc的javadoc任务</li></ul><blockquote><p>尽管示例中的属性是可选的，但我们建议您在项目中指定它们。工具链选项可防止使用不同Java版本构建的项目出现问题。版本字符串对于跟踪项目进度非常重要。默认情况下，项目版本也用于存档名称中。</p></blockquote><p>Java Library插件还将上述任务集成到标准Base插件生命周期任务中：</p><ul><li>jar 绑定到 assemble 生命周期</li><li>test 绑定到 check 生命周期</li></ul><h2 id="定义sourceset" tabindex="-1"><a class="header-anchor" href="#定义sourceset"><span>定义sourceSet</span></a></h2><p>源代码集主要思想是源文件和资源按类型进行逻辑分组，例如应用程序代码、单元测试和集成测试。每个逻辑组通常都有自己的文件依赖项集、类路径等。值得注意的是，形成源集的文件不必位于同一目录中！</p><p>源集是一个强大的概念，它将编译的几个方面联系在一起：</p><ul><li>源文件及其位置</li><li>编译类路径，包括任何必需的依赖项（通过Gradle配置）</li><li>编译的类文件所在的位置</li></ul><p>您可以在这个图表中看到它们是如何相互关联的：</p><figure><img src="`+c+'" alt="java sourcesets compilation" tabindex="0" loading="lazy"><figcaption>java sourcesets compilation</figcaption></figure><p>着色框表示源集本身的属性。除此之外，Java Library 插件会自动为您或插件定义的每个源集和几个依赖项配置创建一个编译任务（名为compileSourceSetJava）。</p><p>Java项目通常包括源文件以外的资源，例如属性文件，这些资源可能需要处理（例如，通过替换文件中的标记），并在最终JAR中打包。Java Library 插件通过为每个定义的源集自动创建一个专用任务来处理此问题，该任务称为processSourceSetResources（或main源集的processResources）。下图显示了源集如何适应此任务：</p><figure><img src="'+p+`" alt="java sourcesets process resources" tabindex="0" loading="lazy"><figcaption>java sourcesets process resources</figcaption></figure><p>如前所述，阴影框表示源集的属性，在本例中，源集包括资源文件的位置及其复制到的位置。</p><p>除了主源代码集之外，Java Library插件还定义了一个表示项目测试的测试源代码集。此源集由运行测试的测试任务使用。您可以在Java测试一章中了解有关此任务和相关主题的更多信息。</p><p>项目通常将此源集用于单元测试，但如果您愿意，也可以将其用于集成、验收和其他类型的测试。另一种方法是为每个其他测试类型定义一个新的源集，这通常是出于以下一个或两个原因：</p><ul><li>为了美观性和可管理性，您希望将测试彼此分开</li><li>不同的测试类型需要不同的编译或运行时类路径或设置中的一些其他差异</li></ul><h3 id="自定义sourceset的位置" tabindex="-1"><a class="header-anchor" href="#自定义sourceset的位置"><span>自定义sourceSet的位置</span></a></h3><p>假设您有一个遗留项目，它为生产代码使用src目录，为测试代码使用test。传统的目录结构不起作用，因此您需要告诉Gradle在哪里可以找到源文件。您可以通过源代码集配置来实现。</p><div class="language-groovy line-numbers-mode" data-ext="groovy" data-title="groovy"><pre class="language-groovy"><code>sourceSets <span class="token punctuation">{</span>
    main <span class="token punctuation">{</span>
         java <span class="token punctuation">{</span>
            srcDirs <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token string">&#39;src&#39;</span><span class="token punctuation">]</span>
         <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>

    test <span class="token punctuation">{</span>
        java <span class="token punctuation">{</span>
            srcDirs <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token string">&#39;test&#39;</span><span class="token punctuation">]</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在Gradle<strong>只会</strong>直接在src中搜索并测试相应的源代码。如果您不想重写约定，而只是想添加一个额外的源目录，也许其中包含一些您希望保持独立的第三方源代码，该怎么办？语法类似：</p><div class="language-groovy line-numbers-mode" data-ext="groovy" data-title="groovy"><pre class="language-groovy"><code>sourceSets <span class="token punctuation">{</span>
    main <span class="token punctuation">{</span>
        java <span class="token punctuation">{</span>
            srcDir <span class="token string">&#39;thirdParty/src/main/java&#39;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重要的是，我们在这里使用srcDir（）方法来附加目录路径，而设置srcDirs属性将替换任何现有值。这是Gradle中的一个常见约定：设置属性替换值，而相应的方法附加值。</p><h3 id="更改编译配置" tabindex="-1"><a class="header-anchor" href="#更改编译配置"><span>更改编译配置</span></a></h3><p>大多数编译器选项都可以通过相应的任务访问，例如compileJava和compileTestJava。这些任务属于JavaCompile类型，因此请阅读任务参考以获取最新和全面的选项列表。</p><p>例如，如果您希望为编译器使用单独的JVM进程，并防止编译失败导致生成失败，则可以使用以下配置：</p><div class="language-groovy line-numbers-mode" data-ext="groovy" data-title="groovy"><pre class="language-groovy"><code>compileJava <span class="token punctuation">{</span>
    options<span class="token punctuation">.</span>incremental <span class="token operator">=</span> <span class="token boolean">true</span>
    options<span class="token punctuation">.</span>fork <span class="token operator">=</span> <span class="token boolean">true</span>
    options<span class="token punctuation">.</span>failOnError <span class="token operator">=</span> <span class="token boolean">false</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="更改java的版本" tabindex="-1"><a class="header-anchor" href="#更改java的版本"><span>更改java的版本</span></a></h3><p>默认情况下，Gradle会将Java代码编译到运行Gradle的JVM的语言级别。通过使用Java工具链，您可以通过确保构建定义的给定Java版本用于编译、执行和文档来打破这一联系。然而，可以在任务级别重写一些编译器和执行选项。</p>`,47),v={href:"https://docs.gradle.org/current/dsl/org.gradle.api.tasks.compile.CompileOptions.html#org.gradle.api.tasks.compile.CompileOptions:release",target:"_blank",rel:"noopener noreferrer"},m=i(`<div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>compileJava {
    options.release = 7
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此选项优先于下面描述的属性。</p><p>Java编译器的历史选项仍然可用：</p><ul><li><strong>sourceCompatibility</strong>: 定义源文件应被视为哪种语言版本的Java。</li><li><strong>targetCompatibility</strong>: 定义代码应该运行的最小JVM版本，即它决定编译器生成的字节代码的版本。</li></ul><p>这些选项可以为每个JavaCompile任务设置，也可以在所有编译任务的<code>java｛｝</code>扩展上设置，使用具有相同名称的属性。</p><p>然而，这些选项并不能防止使用在以后的Java版本中引入的API。</p><h2 id="处理资源文件" tabindex="-1"><a class="header-anchor" href="#处理资源文件"><span>处理资源文件</span></a></h2><p>许多Java项目使用源文件以外的资源，如图像、配置文件和本地化数据。有时，这些文件打包时不变，有时需要作为模板文件或以其他方式处理。无论哪种方式，Java库插件都会为每个源集添加一个特定的复制任务，以处理其相关资源的处理。</p><p>任务的名称遵循processSourceSetResources（或主源集的processResources）的约定，它将自动将src/[sourceSet]/resources中的任何文件复制到将包含在生产JAR中的目录中。该目标目录也将包含在测试的运行时类路径中。</p><p>您可以通过WriteProperties任务轻松创建Java属性文件。每次都会生成一个唯一的文件，即使使用相同的属性和值，因为它在注释中包含时间戳。Gradle的WriteProperties任务在所有属性都未更改的情况下生成完全相同的输出字节。这是通过对属性文件的生成方式进行一些调整来实现的：</p><ul><li>没有时间戳注释添加到输出</li><li>行分隔符与系统无关，但可以显式配置（默认为“\\n”）</li><li>属性按字母顺序排序</li></ul><h1 id="构建jvm组件" tabindex="-1"><a class="header-anchor" href="#构建jvm组件"><span>构建JVM组件</span></a></h1><p>所有特定的JVM插件都构建在Java插件之上。上面的示例仅说明了这个基本插件提供的概念，并与所有JVM插件共享。 继续阅读以了解哪些插件适合哪个项目类型，因为建议选择特定的插件，而不是直接应用Java插件。</p><h2 id="构建java库" tabindex="-1"><a class="header-anchor" href="#构建java库"><span>构建java库</span></a></h2><p>库项目的独特之处在于它们被其他Java项目使用。这意味着与JAR文件一起发布的依赖元数据（通常以Maven POM的形式）至关重要。特别是，库的使用者应该能够区分两种不同类型的依赖关系：仅编译库所需的依赖关系和编译被消费者所需的依存关系。</p><p>Gradle通过Java Library插件管理这一区别，该插件除了本章介绍的实现之外，还引入了api配置。如果依赖项的类型出现在库的公共类的公共字段或方法中，则依赖项通过库的公共API公开，因此应添加到API配置中。否则，依赖项是一个内部实现细节，应该添加到<em>implementation</em>。</p><h2 id="构建java应用" tabindex="-1"><a class="header-anchor" href="#构建java应用"><span>构建java应用</span></a></h2><p>打包为JAR的Java应用程序不适合从命令行或桌面环境轻松启动。application插件通过创建一个包含生产JAR、其依赖项和类似Unix和Windows系统的启动脚本来启动应用。</p><h2 id="构建java-web应用" tabindex="-1"><a class="header-anchor" href="#构建java-web应用"><span>构建java web应用</span></a></h2><p>Java web应用程序可以以多种方式打包和部署，具体取决于您使用的技术。例如，您可以将Spring Boot与一个胖JAR或一个运行在Netty上的基于Reactive的系统一起使用。无论您使用什么技术，Gradle及其庞大的插件社区都将满足您的需求。然而，CoreGradle仅直接支持部署为WAR文件的传统基于Servlet的web应用程序。</p><p>该支持通过War插件提供，该插件自动应用Java插件并添加额外的打包步骤，该步骤执行以下操作：</p><ul><li>将src/main/webapp中的静态资源复制到WAR的根目录中</li><li>将编译的生产类复制到WAR的WEB-INF/classes子目录中</li><li>将库依赖项复制到WAR的WEB-INF/lib子目录中</li></ul><p>这是由war任务完成的，它有效地替换了jar任务（尽管该任务仍然存在），并附加到assemble生命周期任务。</p>`,23),g={id:"构建java-platforms",tabindex:"-1"},b={class:"header-anchor",href:"#构建java-platforms"},h={href:"https://docs.gradle.org/current/userguide/building_java_projects.html#sec:building_java_platform",target:"_blank",rel:"noopener noreferrer"},k=a("p",null,"Java平台表示一组依赖性声明和约束，这些声明和约束形成了一个用于消费项目的内聚单元。该平台没有自己的来源和人工制品。它在Maven世界中映射到BOM。",-1),j=a("p",null,"该支持通过Java平台插件提供，该插件设置了不同的配置和发布组件。",-1);function J(y,f){const s=l("ExternalLinkIcon");return r(),o("div",null,[u,a("p",null,[e("从版本9开始，Java编译器可以被配置为为较旧的Java版本生成字节码，同时确保代码不使用任何较新版本的API。Gradle现在直接在CompileOptions上支持此"),a("a",v,[e("release"),n(s)]),e("标志，用于Java编译:")]),m,a("h2",g,[a("a",b,[a("span",null,[e("构建JAVA "),a("a",h,[e("Platforms"),n(s)])])])]),k,j])}const x=t(d,[["render",J],["__file","gradle-java.html.vue"]]),D=JSON.parse('{"path":"/post/gradle-java.html","title":"gradle-java","lang":"zh-CN","frontmatter":{"title":"gradle-java","tags":["java","gradle"],"categories":["中间件"],"description":"插件的生命周期 Base插件提供了大多数构建通用的一些任务和约定，并为构建添加了一个结构，以提高它们运行方式的一致性。它最重要的贡献是一组生命周期任务，充当其他插件和具体任务的保护伞。 主要任务和声明周期: clean — Delete: 删除build目录及其子目录下的所有内容，即Project.getBuildDir（）项目属性指定的路径。 che...","head":[["meta",{"property":"og:url","content":"https://banrenshan.github.io/post/gradle-java.html"}],["meta",{"property":"og:site_name","content":"心之所向，素履以往"}],["meta",{"property":"og:title","content":"gradle-java"}],["meta",{"property":"og:description","content":"插件的生命周期 Base插件提供了大多数构建通用的一些任务和约定，并为构建添加了一个结构，以提高它们运行方式的一致性。它最重要的贡献是一组生命周期任务，充当其他插件和具体任务的保护伞。 主要任务和声明周期: clean — Delete: 删除build目录及其子目录下的所有内容，即Project.getBuildDir（）项目属性指定的路径。 che..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-20T07:19:17.000Z"}],["meta",{"property":"article:author","content":"banrenshan"}],["meta",{"property":"article:tag","content":"java"}],["meta",{"property":"article:tag","content":"gradle"}],["meta",{"property":"article:modified_time","content":"2024-04-20T07:19:17.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"gradle-java\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-04-20T07:19:17.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"banrenshan\\",\\"url\\":\\"https://github.com/banrenshan\\"}]}"]]},"headers":[{"level":2,"title":"入门项目","slug":"入门项目","link":"#入门项目","children":[]},{"level":2,"title":"定义sourceSet","slug":"定义sourceset","link":"#定义sourceset","children":[{"level":3,"title":"自定义sourceSet的位置","slug":"自定义sourceset的位置","link":"#自定义sourceset的位置","children":[]},{"level":3,"title":"更改编译配置","slug":"更改编译配置","link":"#更改编译配置","children":[]},{"level":3,"title":"更改java的版本","slug":"更改java的版本","link":"#更改java的版本","children":[]}]},{"level":2,"title":"处理资源文件","slug":"处理资源文件","link":"#处理资源文件","children":[]},{"level":2,"title":"构建java库","slug":"构建java库","link":"#构建java库","children":[]},{"level":2,"title":"构建java应用","slug":"构建java应用","link":"#构建java应用","children":[]},{"level":2,"title":"构建java web应用","slug":"构建java-web应用","link":"#构建java-web应用","children":[]},{"level":2,"title":"构建JAVA Platforms","slug":"构建java-platforms","link":"#构建java-platforms","children":[]}],"git":{"createdTime":1713091835000,"updatedTime":1713597557000,"contributors":[{"name":"banrenshan","email":"CP_zhaozhiqiang@163.com","commits":3}]},"readingTime":{"minutes":11.03,"words":3310},"filePathRelative":"post/gradle-java.md","localizedDate":"2024年4月14日","excerpt":"\\n<p>Base插件提供了大多数构建通用的一些任务和约定，并为构建添加了一个结构，以提高它们运行方式的一致性。它最重要的贡献是一组生命周期任务，充当其他插件和具体任务的保护伞。</p>\\n<p>主要任务和声明周期:</p>\\n<ul>\\n<li>clean — Delete: 删除build目录及其子目录下的所有内容，即Project.getBuildDir（）项目属性指定的路径。</li>\\n<li>check — lifecycle task：插件和构建作者应使用<code>check.dependsOn(*task*)</code>将验证任务（例如运行测试的任务）附加到此生命周期任务。</li>\\n<li>assemble — lifecycle task：插件和构建作者应该将生成发行版和其他可消费工件的任务附加到此生命周期任务。例如，jar为Java库生成可消费的工件。使用<code>assemble.dependsOn(*task*)</code>将任务附加到此生命周期任务</li>\\n<li>build — lifecycle task：依赖<code>check</code>, <code>assemble</code>。旨在构建一切，包括运行所有测试、生成生产工件和生成文档。您可能很少直接将具体任务附加到构建中，因为assemble和check通常更合适。</li>\\n<li>buildConfiguration — task rule： 组装附加到命名配置的那些工件。例如，buildArchives将执行任务，将所有工件绑定到archives 配置。</li>\\n<li>cleanTask — task rule： 删除任务的输出，例如cleanJar将删除Java插件的JAR任务生成的JAR文件。</li>\\n</ul>","autoDesc":true}');export{x as comp,D as data};
