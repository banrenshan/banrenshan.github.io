import{_ as s}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as o,o as t,c as l,b as a,d as e,e as d,a as n}from"./app-CQgLfo2K.js";const c={},r=n(`<h1 id="go-build" tabindex="-1"><a class="header-anchor" href="#go-build"><span>go build</span></a></h1><p>编译go文件</p><h2 id="指定输出的可执行文件的名称" tabindex="-1"><a class="header-anchor" href="#指定输出的可执行文件的名称"><span>指定输出的可执行文件的名称</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code> $ go build -o name.exe main.go 
 $ ls name*
 Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----        2023/12/23     16:33        1897984 name.exe
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="多文件编译" tabindex="-1"><a class="header-anchor" href="#多文件编译"><span>多文件编译</span></a></h2><p>当我由两个main包时，如下：</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>.
├── main.go
└── main2.go
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>main2.go文件的内容：</p><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">import</span> <span class="token string">&quot;fmt&quot;</span>

<span class="token keyword">func</span> <span class="token function">TestMain2</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	fmt<span class="token punctuation">.</span><span class="token function">Println</span><span class="token punctuation">(</span><span class="token string">&quot;main2...&quot;</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>main.go文件的内容：</p><div class="language-go line-numbers-mode" data-ext="go" data-title="go"><pre class="language-go"><code><span class="token keyword">package</span> main

<span class="token keyword">func</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
	<span class="token function">TestMain2</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时执行下面的命令会出错：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>$ go build main.go    
.<span class="token punctuation">\\</span>main.go:4:2: undefined: TestMain2
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>这是因为编译的时候，go没有加载到完整的main包，我们应该使用下面的命令进行修正：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>go build main.go main2.go
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>当文件多了的时候，这种方式明显有些凡人，我们指定包来进行整体编译</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>go build <span class="token builtin class-name">.</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><blockquote><p><code>.</code>表示main包所在的目录，你可以使用具体的目录替代。</p></blockquote><blockquote><p>需要注意的时，如果你使用包的方式进行编译，生成的可执行的文件名称和包的名称相同。否则和main函数所在文件的名称相同。</p></blockquote><h1 id="go-clean" tabindex="-1"><a class="header-anchor" href="#go-clean"><span>go clean</span></a></h1><p><code>go clean</code>命令可以移除当前源码包和关联源码包里面编译生成的文件，这些文件包括以下几种：</p><ul><li>执行<code>go build</code>命令时在当前目录下生成的与包名或者 Go 源码文件同名的可执行文件。</li><li>执行<code>go test</code>命令并加入<code>-c</code>标记时在当前目录下生成的以包名加“.test”后缀为名的文件。</li><li>执行<code>go install</code>命令安装当前代码包时产生的结果文件。如果当前代码包中只包含库源码文件，则结果文件指的就是在工作区 pkg 目录下相应的归档文件。如果当前代码包中只包含一个命令源码文件，则结果文件指的就是在工作区 bin 目录下的可执行文件。</li><li>在编译 Go 或 C 源码文件时遗留在相应目录中的文件或目录 。包括：“_obj”和“_test”目录，名称为“_testmain.go”、“test.out”、“build.out”或“a.out”的文件，名称以“.5”、“.6”、“.8”、“.a”、“.o”或“.so”为后缀的文件。这些目录和文件是在执行<code>go build</code>命令时生成在临时目录中的。</li></ul>`,22),p=a("code",null,"go clean",-1),g={href:"https://c.biancheng.net/java/",target:"_blank",rel:"noopener noreferrer"},u=a("code",null,"maven clean",-1),m=n(`<div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>$ go clean <span class="token parameter variable">-i</span> <span class="token parameter variable">-n</span>
<span class="token builtin class-name">cd</span> awesomeProject
<span class="token function">rm</span> <span class="token parameter variable">-f</span> awesomeProject awesomeProject.exe awesomeProject awesomeProject.exe awesomeProject.test awesomeProject.test.exe awesomeProject.test awesomeProject.test.exe main main.exe main2 main2.exe
<span class="token function">rm</span> awesomeProject.exe
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>对应的参数的含义如下所示：</p><ul><li>-i 清除关联的安装的包和可运行文件，也就是通过<code>go install</code>安装的文件；</li><li>-n 把需要执行的清除命令打印出来，但是不执行，这样就可以很容易的知道底层是如何运行的；</li><li>-r 循环的清除在 import 中引入的包；</li><li>-x 打印出来执行的详细命令，其实就是 -n 打印的执行版本；</li><li>-cache 删除所有<code>go build</code>命令的缓存</li><li>-testcache 删除当前包所有的测试结果</li></ul><p>实际开发中<code>go clean</code>命令使用的可能不是很多，一般都是利用<code>go clean</code>命令清除编译文件，然后再将源码递交到 github 上，方便对于源码的管理。</p><h1 id="go-run" tabindex="-1"><a class="header-anchor" href="#go-run"><span>go run</span></a></h1><p><code>go run</code>命令会编译源码，并且直接执行源码的 main() 函数，不会在当前目录留下可执行文件，可执行文件被放在临时文件中被执行。</p><p><code>go run</code>不能使用<code>go run 包目录</code>的方式进行编译</p><h1 id="go-install" tabindex="-1"><a class="header-anchor" href="#go-install"><span>go install</span></a></h1><p><code>go install</code> 命令的功能和<code>go build</code> 命令类似。go install 只是将编译的中间文件放在 GOPATH 的 pkg 目录下，以及固定地将编译结果放在 GOPATH 的 bin 目录下。</p><p>这个命令在内部实际上分成了两步操作：第一步是生成结果文件（可执行文件或者 .a 包），第二步会把编译好的结果移到 <code>$GOPATH/pkg 或者</code> <code>$GOPATH/bin</code>。</p><p>go install 的编译过程有如下规律：</p><ul><li>go install 是建立在 GOPATH 上的，无法在独立的目录里使用 go install。</li><li>GOPATH 下的 bin 目录放置的是使用 go install 生成的可执行文件，可执行文件的名称来自于编译时的包名。</li><li>go install 输出目录始终为 GOPATH 下的 bin 目录，无法使用<code>-o</code>附加参数进行自定义。</li><li>GOPATH 下的 pkg 目录放置的是编译期间的中间文件。</li><li>执行完go install 后，当前目录不会存在可执行文件，这个区别于 <code>go build</code></li></ul><h1 id="go-get" tabindex="-1"><a class="header-anchor" href="#go-get"><span>go get</span></a></h1><p>go get 命令可以借助代码管理工具通过远程拉取或更新代码包及其依赖包，并自动完成编译和安装。整个过程就像安装一个 App 一样简单。</p><p>这个命令可以动态获取远程代码包，目前支持的有 BitBucket、GitHub、Google Code 和 Launchpad。在使用 go get 命令前，需要安装与远程包匹配的代码管理工具，如 Git、SVN、HG 等，参数中需要提供一个包名。</p><p>这个命令在内部实际上分成了两步操作：第一步是下载源码包，第二步是执行 go install。下载源码包的 go 工具会自动根据不同的域名调用不同的源码工具。</p><p>参数介绍：</p><ul><li>-d 只下载不安装</li><li>-f 只有在你包含了 -u 参数的时候才有效，不让 -u 去验证 import 中的每一个都已经获取了，这对于本地 fork 的包特别有用</li><li>-fix 在获取源码之后先运行 fix，然后再去做其他的事情</li><li>-t 同时也下载需要为运行测试所需要的包</li><li>-u 强制使用网络去更新包和它的依赖包</li><li>-v 显示执行的命令</li></ul><h1 id="go-generate" tabindex="-1"><a class="header-anchor" href="#go-generate"><span>go generate</span></a></h1><p>当运行该命令时，它将扫描与当前包相关的源代码文件，找出所有包含<code>//go:generate</code>的特殊注释，提取并执行该特殊注释后面的命令。</p><p>使用<code>go generate</code>命令时有以下几点需要注意：</p><ul><li>该特殊注释必须在 .go 源码文件中；</li><li>每个源码文件可以包含多个 generate 特殊注释；</li><li>运行<code>go generate</code>命令时，才会执行特殊注释后面的命令；</li><li>当<code>go generate</code>命令执行出错时，将终止程序的运行；</li><li>特殊注释必须以<code>//go:generate</code>开头，双斜线后面没有空格。</li></ul><p>我们会使用<code>go generate</code>命令：</p><ul><li>yacc：从 .y 文件生成 .go 文件；</li><li>protobufs：从 protocol buffer 定义文件（.proto）生成 .pb.go 文件；</li><li>Unicode：从 UnicodeData.txt 生成 Unicode 表；</li><li>HTML：将 HTML 文件嵌入到 go 源码；</li><li>bindata：将形如 JPEG 这样的文件转成 go 代码中的字节数组。</li></ul><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>//go:generate go version
func main() {
	TestMain2()
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="go-test" tabindex="-1"><a class="header-anchor" href="#go-test"><span>go test</span></a></h1><p>go test 命令，会自动读取源码目录下面名为 *_test.go 的文件，生成并运行测试用的可执行文件。</p><h1 id="go-pprof" tabindex="-1"><a class="header-anchor" href="#go-pprof"><span>go pprof</span></a></h1><p>Go语言工具链中的 go pprof 可以帮助开发者快速分析及定位各种性能问题，如 CPU 消耗、内存分配及阻塞分析。</p><p>性能分析首先需要使用 runtime.pprof 包嵌入到待分析程序的入口和结束处。runtime.pprof 包在运行时对程序进行每秒 100 次的采样，最少采样 1 秒。然后将生成的数据输出，让开发者写入文件或者其他媒介上进行分析。</p><p>go pprof 工具链配合 Graphviz 图形化工具可以将 runtime.pprof 包生成的数据转换为 PDF 格式，以图片的方式展示程序的性能分析结果。</p>`,31);function h(v,b){const i=o("ExternalLinkIcon");return t(),l("div",null,[r,a("p",null,[p,e("命令就像 "),a("a",g,[e("Java"),d(i)]),e(" 中的"),u,e("命令一样，会清除掉编译过程中产生的一些文件。")]),m])}const f=s(c,[["render",h],["__file","go命令行.html.vue"]]),_=JSON.parse('{"path":"/Go/go%E5%91%BD%E4%BB%A4%E8%A1%8C.html","title":"Go 命令行","lang":"zh-CN","frontmatter":{"title":"Go 命令行","date":"2024-04-24T00:00:00.000Z","tags":["Go"],"categories":["Go"],"description":"go build 编译go文件 指定输出的可执行文件的名称 多文件编译 当我由两个main包时，如下： main2.go文件的内容： main.go文件的内容： 此时执行下面的命令会出错： 这是因为编译的时候，go没有加载到完整的main包，我们应该使用下面的命令进行修正： 当文件多了的时候，这种方式明显有些凡人，我们指定包来进行整体编译 .表示mai...","head":[["meta",{"property":"og:url","content":"https://banrenshan.github.io/Go/go%E5%91%BD%E4%BB%A4%E8%A1%8C.html"}],["meta",{"property":"og:site_name","content":"心之所向，素履以往"}],["meta",{"property":"og:title","content":"Go 命令行"}],["meta",{"property":"og:description","content":"go build 编译go文件 指定输出的可执行文件的名称 多文件编译 当我由两个main包时，如下： main2.go文件的内容： main.go文件的内容： 此时执行下面的命令会出错： 这是因为编译的时候，go没有加载到完整的main包，我们应该使用下面的命令进行修正： 当文件多了的时候，这种方式明显有些凡人，我们指定包来进行整体编译 .表示mai..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-24T08:19:31.000Z"}],["meta",{"property":"article:author","content":"banrenshan"}],["meta",{"property":"article:tag","content":"Go"}],["meta",{"property":"article:published_time","content":"2024-04-24T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-24T08:19:31.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Go 命令行\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-04-24T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-24T08:19:31.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"banrenshan\\",\\"url\\":\\"https://github.com/banrenshan\\"}]}"]]},"headers":[{"level":2,"title":"指定输出的可执行文件的名称","slug":"指定输出的可执行文件的名称","link":"#指定输出的可执行文件的名称","children":[]},{"level":2,"title":"多文件编译","slug":"多文件编译","link":"#多文件编译","children":[]}],"git":{"createdTime":1713946771000,"updatedTime":1713946771000,"contributors":[{"name":"banrenshan","email":"CP_zhaozhiqiang@163.com","commits":1}]},"readingTime":{"minutes":6.31,"words":1893},"filePathRelative":"Go/go命令行.md","localizedDate":"2024年4月24日","excerpt":"\\n<p>编译go文件</p>\\n<h2>指定输出的可执行文件的名称</h2>\\n<div class=\\"language-text\\" data-ext=\\"text\\" data-title=\\"text\\"><pre class=\\"language-text\\"><code> $ go build -o name.exe main.go \\n $ ls name*\\n Mode                 LastWriteTime         Length Name\\n----                 -------------         ------ ----\\n-a----        2023/12/23     16:33        1897984 name.exe\\n</code></pre></div>","autoDesc":true}');export{f as comp,_ as data};
