import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as a,c as s,a as t}from"./app-Crw0g0C7.js";const e={},o=t(`<p>JSONassert是一款轻量级的Java库，用于简化测试中的JSON数据断言。它可以让你轻松地验证JSON响应是否符合预期的结果。</p><h2 id="比较模式" tabindex="-1"><a class="header-anchor" href="#比较模式"><span>比较模式</span></a></h2><p>JSONassert有如下4种比较模式，这些不同的模式为JSON的测试比较定义了不同的行为。每个模式封装了两个底层行为:<code>可扩展性</code>和<code>严格排序</code></p><ul><li><code>LENIENT</code>：宽容模式，即实际JSON包含扩展字段，数组顺序不一致也可以通过测试</li><li><code>STRICT</code>：严格模式，即实际JSON不可扩展，数组严格排序才可以通过测试</li><li><code>NON_EXTENSIBLE</code>：非扩展模式，即实际JSON不可扩展，数组顺序不一致也可以通过测试</li><li><code>STRICT_ORDER</code>：严格排序模式，即实际JSON可扩展，但数组严格排序才可以通过测试</li></ul><p>Ex:宽容模式</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token class-name">String</span> source <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
{
  &quot;name&quot;:&quot;zzq&quot;,
  &quot;age&quot;:30
}
&quot;&quot;&quot;</span><span class="token punctuation">;</span>
<span class="token class-name">String</span> target <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
{
  &quot;age&quot;:30,
  &quot;name&quot;:&quot;zzq&quot;,
  &quot;addr&quot;:&quot;shandong&quot;
}
&quot;&quot;&quot;</span><span class="token punctuation">;</span>
<span class="token class-name">JSONAssert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>source<span class="token punctuation">,</span> target<span class="token punctuation">,</span> <span class="token class-name">JSONCompareMode</span><span class="token punctuation">.</span><span class="token constant">LENIENT</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">//pass</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>addr就是扩展字段，表示多余的。</p></blockquote><h2 id="断言" tabindex="-1"><a class="header-anchor" href="#断言"><span>断言</span></a></h2><h3 id="验证数组大小" tabindex="-1"><a class="header-anchor" href="#验证数组大小"><span>验证数组大小</span></a></h3><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code>    <span class="token class-name">String</span> names <span class="token operator">=</span> <span class="token string">&quot;{\\&quot;names\\&quot;:[\\&quot;Alex\\&quot;, \\&quot;Barbera\\&quot;, \\&quot;Charlie\\&quot;, \\&quot;Xavier\\&quot;]}&quot;</span><span class="token punctuation">;</span>
    <span class="token comment">//{names:[4]}指定预期数组大小为4</span>
    <span class="token class-name">JSONAssert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>
            <span class="token string">&quot;{names:[4]}&quot;</span><span class="token punctuation">,</span>
            names<span class="token punctuation">,</span>
            <span class="token keyword">new</span> <span class="token class-name">ArraySizeComparator</span><span class="token punctuation">(</span><span class="token class-name">JSONCompareMode</span><span class="token punctuation">.</span><span class="token constant">LENIENT</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//{names:[3,5]}指定预期数组大小为3和5之间</span>
    <span class="token class-name">JSONAssert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>
            <span class="token string">&quot;{names:[3,5]}&quot;</span><span class="token punctuation">,</span>
            names<span class="token punctuation">,</span>
            <span class="token keyword">new</span> <span class="token class-name">ArraySizeComparator</span><span class="token punctuation">(</span><span class="token class-name">JSONCompareMode</span><span class="token punctuation">.</span><span class="token constant">LENIENT</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="正则匹配" tabindex="-1"><a class="header-anchor" href="#正则匹配"><span>正则匹配</span></a></h3><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token class-name">String</span> expectedStr <span class="token operator">=</span> <span class="token string">&quot;{entry:{id:x}}&quot;</span><span class="token punctuation">;</span>
<span class="token class-name">String</span> actualStr <span class="token operator">=</span> <span class="token string">&quot;{entry:{id:1, id:2}}&quot;</span><span class="token punctuation">;</span>
<span class="token class-name">Customization</span> customization <span class="token operator">=</span> <span class="token keyword">new</span> <span class="token class-name">Customization</span><span class="token punctuation">(</span><span class="token string">&quot;entry.id&quot;</span><span class="token punctuation">,</span> <span class="token keyword">new</span> <span class="token class-name">RegularExpressionValueMatcher</span><span class="token generics"><span class="token punctuation">&lt;</span><span class="token punctuation">&gt;</span></span><span class="token punctuation">(</span><span class="token string">&quot;\\\\d&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token class-name">JSONAssert</span><span class="token punctuation">.</span><span class="token function">assertEquals</span><span class="token punctuation">(</span>expectedStr<span class="token punctuation">,</span> actualStr<span class="token punctuation">,</span> <span class="token keyword">new</span> <span class="token class-name">CustomComparator</span><span class="token punctuation">(</span><span class="token class-name">JSONCompareMode</span><span class="token punctuation">.</span><span class="token constant">STRICT</span><span class="token punctuation">,</span> customization<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,12),p=[o];function c(l,i){return a(),s("div",null,p)}const d=n(e,[["render",c],["__file","02-jsonassert.html.vue"]]),m=JSON.parse('{"path":"/java/02-jsonassert.html","title":"JSONassert指南","lang":"zh-CN","frontmatter":{"title":"JSONassert指南","tags":["java","JSONassert"],"categories":["测试","java"],"date":"2022-12-02T13:01:55.000Z","description":"JSONassert是一款轻量级的Java库，用于简化测试中的JSON数据断言。它可以让你轻松地验证JSON响应是否符合预期的结果。 比较模式 JSONassert有如下4种比较模式，这些不同的模式为JSON的测试比较定义了不同的行为。每个模式封装了两个底层行为:可扩展性和严格排序 LENIENT：宽容模式，即实际JSON包含扩展字段，数组顺序不一致也...","head":[["meta",{"property":"og:url","content":"https://banrenshan.github.io/java/02-jsonassert.html"}],["meta",{"property":"og:site_name","content":"心之所向，素履以往"}],["meta",{"property":"og:title","content":"JSONassert指南"}],["meta",{"property":"og:description","content":"JSONassert是一款轻量级的Java库，用于简化测试中的JSON数据断言。它可以让你轻松地验证JSON响应是否符合预期的结果。 比较模式 JSONassert有如下4种比较模式，这些不同的模式为JSON的测试比较定义了不同的行为。每个模式封装了两个底层行为:可扩展性和严格排序 LENIENT：宽容模式，即实际JSON包含扩展字段，数组顺序不一致也..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-12T07:52:04.000Z"}],["meta",{"property":"article:author","content":"banrenshan"}],["meta",{"property":"article:tag","content":"java"}],["meta",{"property":"article:tag","content":"JSONassert"}],["meta",{"property":"article:published_time","content":"2022-12-02T13:01:55.000Z"}],["meta",{"property":"article:modified_time","content":"2024-06-12T07:52:04.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"JSONassert指南\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2022-12-02T13:01:55.000Z\\",\\"dateModified\\":\\"2024-06-12T07:52:04.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"banrenshan\\",\\"url\\":\\"https://github.com/banrenshan\\"}]}"]]},"headers":[{"level":2,"title":"比较模式","slug":"比较模式","link":"#比较模式","children":[]},{"level":2,"title":"断言","slug":"断言","link":"#断言","children":[{"level":3,"title":"验证数组大小","slug":"验证数组大小","link":"#验证数组大小","children":[]},{"level":3,"title":"正则匹配","slug":"正则匹配","link":"#正则匹配","children":[]}]}],"git":{"createdTime":1713692103000,"updatedTime":1718178724000,"contributors":[{"name":"banrenshan","email":"CP_zhaozhiqiang@163.com","commits":1}]},"readingTime":{"minutes":1.21,"words":363},"filePathRelative":"java/02-jsonassert.md","localizedDate":"2022年12月2日","excerpt":"<p>JSONassert是一款轻量级的Java库，用于简化测试中的JSON数据断言。它可以让你轻松地验证JSON响应是否符合预期的结果。</p>\\n<h2>比较模式</h2>\\n<p>JSONassert有如下4种比较模式，这些不同的模式为JSON的测试比较定义了不同的行为。每个模式封装了两个底层行为:<code>可扩展性</code>和<code>严格排序</code></p>\\n<ul>\\n<li><code>LENIENT</code>：宽容模式，即实际JSON包含扩展字段，数组顺序不一致也可以通过测试</li>\\n<li><code>STRICT</code>：严格模式，即实际JSON不可扩展，数组严格排序才可以通过测试</li>\\n<li><code>NON_EXTENSIBLE</code>：非扩展模式，即实际JSON不可扩展，数组顺序不一致也可以通过测试</li>\\n<li><code>STRICT_ORDER</code>：严格排序模式，即实际JSON可扩展，但数组严格排序才可以通过测试</li>\\n</ul>","autoDesc":true}');export{d as comp,m as data};