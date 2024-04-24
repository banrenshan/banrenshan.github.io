import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as a,c as s,a as e}from"./app-g-OKA8ms.js";const t={},p=e(`<h1 id="接口" tabindex="-1"><a class="header-anchor" href="#接口"><span>接口</span></a></h1><p>在jdk8之后,我们可以在接口中写实现方法了,但是必须使用default或static修饰接口方法,例如:</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Lived</span> <span class="token punctuation">{</span>
    <span class="token keyword">default</span> <span class="token class-name">String</span> <span class="token function">getDescription</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;有生命的&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
<span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">Lived</span> <span class="token punctuation">{</span>
    <span class="token keyword">static</span> <span class="token keyword">boolean</span> <span class="token function">instanceOf</span><span class="token punctuation">(</span><span class="token class-name">Object</span> obj<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> obj <span class="token keyword">instanceof</span> <span class="token class-name">Lived</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>static修饰的方法使用类名.方法名() 调用，这跟以前的静态方法调用方式一样。</p><h2 id="接口重载问题" tabindex="-1"><a class="header-anchor" href="#接口重载问题"><span>接口重载问题</span></a></h2><h3 id="实例1" tabindex="-1"><a class="header-anchor" href="#实例1"><span>实例1</span></a></h3><p>接口A</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">A</span> <span class="token punctuation">{</span>
    <span class="token keyword">default</span> <span class="token class-name">String</span> <span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;A&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接口B</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">B</span> <span class="token punctuation">{</span>
    <span class="token keyword">default</span> <span class="token class-name">String</span> <span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;B&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接口C</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">C</span> <span class="token keyword">extends</span> <span class="token class-name">A</span><span class="token punctuation">,</span><span class="token class-name">B</span> <span class="token punctuation">{</span>

<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时,接口C是不能编译的,错误信息:</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>Error:(6, 8) java: 接口 tets.C从类型 tets.A 和 tets.B 中继承了say() 的不相关默认值
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>解决方案是C必须重载该默认方法,如下:</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">C</span> <span class="token keyword">extends</span> <span class="token class-name">A</span><span class="token punctuation">,</span><span class="token class-name">B</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">default</span> <span class="token class-name">String</span> <span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;C&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>由此得出,类或者接口不能继承或实现两个包含相同方法的接口,除非重写该方法.但是这种重写相当于在子接口定义了新的默认方法,其实我们更想指定继承A的默认方法,那么应该怎么做呢?</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">interface</span> <span class="token class-name">C</span> <span class="token keyword">extends</span> <span class="token class-name">A</span><span class="token punctuation">,</span><span class="token class-name">B</span> <span class="token punctuation">{</span>

    <span class="token annotation punctuation">@Override</span>
    <span class="token keyword">default</span> <span class="token class-name">String</span> <span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token class-name">A</span><span class="token punctuation">.</span><span class="token keyword">super</span><span class="token punctuation">.</span><span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>那么问题来了,当我们有类ZZ,分别实现C,B的时候,调用的是谁的方法呢?</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ZZ</span> <span class="token keyword">implements</span> <span class="token class-name">B</span><span class="token punctuation">,</span><span class="token class-name">C</span> <span class="token punctuation">{</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ZZ</span> zz<span class="token operator">=</span><span class="token keyword">new</span> <span class="token class-name">ZZ</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">String</span> say <span class="token operator">=</span> zz<span class="token punctuation">.</span><span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>err<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>say<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//A</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>打印出来的是A,由此得出,子类型的接口优先</p><p>当接口方法和类方法冲突的时候,又会出现什么样的情况呢?</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">D</span> <span class="token punctuation">{</span>
    <span class="token keyword">public</span> <span class="token class-name">String</span> <span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token string">&quot;D&quot;</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
<span class="token keyword">public</span> <span class="token keyword">class</span> <span class="token class-name">ZZ</span> extend <span class="token class-name">D</span> <span class="token keyword">implements</span> <span class="token class-name">B</span><span class="token punctuation">,</span><span class="token class-name">C</span> <span class="token punctuation">{</span>

    <span class="token keyword">public</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token class-name">String</span><span class="token punctuation">[</span><span class="token punctuation">]</span> args<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token class-name">ZZ</span> zz<span class="token operator">=</span><span class="token keyword">new</span> <span class="token class-name">ZZ</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token class-name">String</span> say <span class="token operator">=</span> zz<span class="token punctuation">.</span><span class="token function">say</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span><span class="token comment">//D</span>
        <span class="token class-name">System</span><span class="token punctuation">.</span>err<span class="token punctuation">.</span><span class="token function">println</span><span class="token punctuation">(</span>say<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>首先,没有出现像接口那种编译出错的情况.从打印结果看出,类优先于接口</p><p>总结一下:</p><ol><li>类优先于接口。 如果一个子类继承的父类和接口有相同的方法实现。 那么子类继承父类的方法</li><li>子类型中的方法优先于父类型中的方法。</li><li>如果以上条件都不满足， 则必须显示覆盖/实现其方法，或者声明成abstract。</li></ol>`,26),c=[p];function o(l,i){return a(),s("div",null,c)}const r=n(t,[["render",o],["__file","java接口.html.vue"]]),k=JSON.parse('{"path":"/post/java%E6%8E%A5%E5%8F%A3.html","title":"Java 接口","lang":"zh-CN","frontmatter":{"title":"Java 接口","date":"2024-04-24T00:00:00.000Z","categories":["java"],"tags":["java","接口"],"description":"接口 在jdk8之后,我们可以在接口中写实现方法了,但是必须使用default或static修饰接口方法,例如: static修饰的方法使用类名.方法名() 调用，这跟以前的静态方法调用方式一样。 接口重载问题 实例1 接口A 接口B 接口C 此时,接口C是不能编译的,错误信息: 解决方案是C必须重载该默认方法,如下: 由此得出,类或者接口不能继承或实...","head":[["meta",{"property":"og:url","content":"https://banrenshan.github.io/post/java%E6%8E%A5%E5%8F%A3.html"}],["meta",{"property":"og:site_name","content":"心之所向，素履以往"}],["meta",{"property":"og:title","content":"Java 接口"}],["meta",{"property":"og:description","content":"接口 在jdk8之后,我们可以在接口中写实现方法了,但是必须使用default或static修饰接口方法,例如: static修饰的方法使用类名.方法名() 调用，这跟以前的静态方法调用方式一样。 接口重载问题 实例1 接口A 接口B 接口C 此时,接口C是不能编译的,错误信息: 解决方案是C必须重载该默认方法,如下: 由此得出,类或者接口不能继承或实..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-24T12:16:57.000Z"}],["meta",{"property":"article:author","content":"banrenshan"}],["meta",{"property":"article:tag","content":"java"}],["meta",{"property":"article:tag","content":"接口"}],["meta",{"property":"article:published_time","content":"2024-04-24T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-24T12:16:57.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Java 接口\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-04-24T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-24T12:16:57.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"banrenshan\\",\\"url\\":\\"https://github.com/banrenshan\\"}]}"]]},"headers":[{"level":2,"title":"接口重载问题","slug":"接口重载问题","link":"#接口重载问题","children":[{"level":3,"title":"实例1","slug":"实例1","link":"#实例1","children":[]}]}],"git":{"createdTime":1713961017000,"updatedTime":1713961017000,"contributors":[{"name":"banrenshan","email":"CP_zhaozhiqiang@163.com","commits":1}]},"readingTime":{"minutes":1.89,"words":567},"filePathRelative":"post/java接口.md","localizedDate":"2024年4月24日","excerpt":"\\n<p>在jdk8之后,我们可以在接口中写实现方法了,但是必须使用default或static修饰接口方法,例如:</p>\\n<div class=\\"language-java\\" data-ext=\\"java\\" data-title=\\"java\\"><pre class=\\"language-java\\"><code><span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">interface</span> <span class=\\"token class-name\\">Lived</span> <span class=\\"token punctuation\\">{</span>\\n    <span class=\\"token keyword\\">default</span> <span class=\\"token class-name\\">String</span> <span class=\\"token function\\">getDescription</span><span class=\\"token punctuation\\">(</span><span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n        <span class=\\"token keyword\\">return</span> <span class=\\"token string\\">\\"有生命的\\"</span><span class=\\"token punctuation\\">;</span>\\n    <span class=\\"token punctuation\\">}</span>\\n<span class=\\"token punctuation\\">}</span>\\n<span class=\\"token keyword\\">public</span> <span class=\\"token keyword\\">interface</span> <span class=\\"token class-name\\">Lived</span> <span class=\\"token punctuation\\">{</span>\\n    <span class=\\"token keyword\\">static</span> <span class=\\"token keyword\\">boolean</span> <span class=\\"token function\\">instanceOf</span><span class=\\"token punctuation\\">(</span><span class=\\"token class-name\\">Object</span> obj<span class=\\"token punctuation\\">)</span> <span class=\\"token punctuation\\">{</span>\\n        <span class=\\"token keyword\\">return</span> obj <span class=\\"token keyword\\">instanceof</span> <span class=\\"token class-name\\">Lived</span><span class=\\"token punctuation\\">;</span>\\n    <span class=\\"token punctuation\\">}</span>\\n<span class=\\"token punctuation\\">}</span>\\n</code></pre></div>","autoDesc":true}');export{r as comp,k as data};
