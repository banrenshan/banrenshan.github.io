import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as n,c as i,a as s}from"./app-CQgLfo2K.js";const a={},d=s(`<p>Go语言内建对 JSON 的支持，使用内置的 encoding/json 标准库，开发人员可以轻松使用Go程序生成和解析 JSON 格式的数据。</p><h1 id="序列化" tabindex="-1"><a class="header-anchor" href="#序列化"><span>序列化</span></a></h1><p>将Go对象编码为JSON格式被称为marshaling。我们可以使用<code>Marshal</code> 函数来将 Go 对象转换为 JSON。<code>Marshal</code> 函数的语法如下:</p><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>func Marshal(v interface{}) ([]byte, error)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="demo-结构体转换成json字符串" tabindex="-1"><a class="header-anchor" href="#demo-结构体转换成json字符串"><span>Demo：结构体转换成Json字符串</span></a></h3><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>	list := []User{
		{&quot;zz1&quot;, 12, []string{&quot;a1&quot;, &quot;a2&quot;}},
		{&quot;zz2&quot;, 13, []string{&quot;aa1&quot;, &quot;aa2&quot;}},
	}
	bytes, _ := json.Marshal(list)
	fmt.Println(string(bytes))
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="demo-map-转换成json字符串" tabindex="-1"><a class="header-anchor" href="#demo-map-转换成json字符串"><span>Demo: map 转换成json字符串</span></a></h3><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>	m := map[string]interface{}{&quot;name&quot;: &quot;zzq&quot;, &quot;age&quot;: 23}
	marshal, _ := json.Marshal(m)
	fmt.Println(string(marshal))
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="demo-格式化输出" tabindex="-1"><a class="header-anchor" href="#demo-格式化输出"><span>Demo: 格式化输出</span></a></h3><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>	m := map[string]interface{}{&quot;name&quot;: &quot;zzq&quot;, &quot;age&quot;: 23}
	marshal, _ := json.MarshalIndent(m, &quot;&quot;, &quot;\\t&quot;)
	fmt.Println(string(marshal))
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="demo-将对象序列化到json文件中" tabindex="-1"><a class="header-anchor" href="#demo-将对象序列化到json文件中"><span>Demo：将对象序列化到json文件中</span></a></h3><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>package zzq

import (
	&quot;encoding/json&quot;
	&quot;fmt&quot;
	&quot;os&quot;
)

type User struct {
	Name string
	Age  int
	Addr []string
}

func Testout() {
	filePtr, err := os.Create(&quot;info.json&quot;)
	if err != nil {
		fmt.Println(&quot;文件创建失败&quot;, err.Error())
		return
	}
	defer filePtr.Close()

	list := []User{
		{&quot;zz1&quot;, 12, []string{&quot;a1&quot;, &quot;a2&quot;}},
		{&quot;zz2&quot;, 13, []string{&quot;aa1&quot;, &quot;aa2&quot;}},
	}

	encoder := json.NewEncoder(filePtr)
	encoder.Encode(list)
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>输出的JSON格式：</p><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>[
  {
    &quot;Name&quot;: &quot;zz1&quot;,
    &quot;Age&quot;: 12,
    &quot;Addr&quot;: [
      &quot;a1&quot;,
      &quot;a2&quot;
    ]
  },
  {
    &quot;Name&quot;: &quot;zz2&quot;,
    &quot;Age&quot;: 13,
    &quot;Addr&quot;: [
      &quot;aa1&quot;,
      &quot;aa2&quot;
    ]
  }
]

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="tags" tabindex="-1"><a class="header-anchor" href="#tags"><span>tags</span></a></h2><p>上面的json中，所有的key都是大写开头的，我们想在不修改代码的情况下，转换成小写，应该怎么办呢？这就是标签所做的事情。</p><p>修改上面的结构体：</p><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>type User struct {
	Name string   \`json:&quot;name,omitempty&quot;\`
	Age  int      \`json:&quot;age,omitempty&quot;\`
	Addr []string \`json:&quot;addr,omitempty&quot;\`
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>如果我们使用<code>json:&quot;-&quot;</code> 作为标签，相关的结构字段将不会被用于编码。另外，如果我们在结构标签名称字符串中使用<code>,omitempty</code> ，如果相关字段的值为空，则不会被用于编码。</p></blockquote><h2 id="自定义序列化的过程" tabindex="-1"><a class="header-anchor" href="#自定义序列化的过程"><span>自定义序列化的过程</span></a></h2><p>Go json包非常灵活，它提供了覆盖编码和解码过程的功能。</p><p>demo： 我们使用自定义序列化，隐藏user的addr信息，使用<code>**</code>代替结果输出。</p><p>只需要对应的结构体实现<code>MarshalJSON</code>接口，例如：</p><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>func (u *User) MarshalJSON() ([]byte, error) {
	type UserAlias User           // 创建User 别名
	return json.Marshal(&amp;struct { // 匿名结构体
		*UserAlias
		Addr []string \`json:&quot;addr&quot;\`
	}{ // 实例化结构体
		UserAlias: (*UserAlias)(u),
		Addr:      []string{strings.Repeat(&quot;*&quot;, 4)},
	})
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h1 id="反序列化" tabindex="-1"><a class="header-anchor" href="#反序列化"><span>反序列化</span></a></h1><p>在Go环境中，JSON文档的解码过程被称为unmarshaling。我们可以使用<code>Unmarshal</code> 函数来将JSON转换为Go对象。<code>Unmarshal</code> 函数的语法如下：</p><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>func Unmarshal(data []byte, v interface{}) error
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="demo-json转换成结构体" tabindex="-1"><a class="header-anchor" href="#demo-json转换成结构体"><span>Demo: json转换成结构体</span></a></h3><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>	j := \`
		{
				&quot;age&quot;: 23,
				&quot;name&quot;: &quot;zzq&quot;
		}
     \`
	var user User
	json.Unmarshal([]byte(j), &amp;user)
	fmt.Println(user)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="demo-json转换成map" tabindex="-1"><a class="header-anchor" href="#demo-json转换成map"><span>Demo: json转换成map</span></a></h3><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>	j := \`
		{
				&quot;age&quot;: 23,
				&quot;name&quot;: &quot;zzq&quot;
		}
     \`
	var user map[string]interface{}
	json.Unmarshal([]byte(j), &amp;user)
	fmt.Println(user)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="demo-文件json转换成结构体" tabindex="-1"><a class="header-anchor" href="#demo-文件json转换成结构体"><span>demo: 文件json转换成结构体</span></a></h3><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>func TestIn() {
	open, _ := os.Open(&quot;info.json&quot;)
	decoder := json.NewDecoder(open)
	var user []User
	decoder.Decode(&amp;user)
	fmt.Println(user)
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="自定义反序列化" tabindex="-1"><a class="header-anchor" href="#自定义反序列化"><span>自定义反序列化</span></a></h2><p>反序列化user的时候，age加1</p><div class="language-GO line-numbers-mode" data-ext="GO" data-title="GO"><pre class="language-GO"><code>func (u *User) UnmarshalJSON(data []byte) error {
	type UserAlias User
	s := struct { // 匿名结构体
		*UserAlias
		Age int \`json:&quot;age&quot;\`
	}{ // 实例化结构体
		UserAlias: (*UserAlias)(u),
	}

	if err := json.Unmarshal(data, &amp;s); err != nil {
		return err
	}
	u.Age = s.Age + 10
	return nil
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,36),t=[d];function l(r,o){return n(),i("div",null,t)}const m=e(a,[["render",l],["__file","go标准库-json.html.vue"]]),v=JSON.parse('{"path":"/Go/go%E6%A0%87%E5%87%86%E5%BA%93-json.html","title":"Go Json","lang":"zh-CN","frontmatter":{"title":"Go Json","date":"2024-04-24T00:00:00.000Z","tags":["Go"],"categories":["Go"],"description":"Go语言内建对 JSON 的支持，使用内置的 encoding/json 标准库，开发人员可以轻松使用Go程序生成和解析 JSON 格式的数据。 序列化 将Go对象编码为JSON格式被称为marshaling。我们可以使用Marshal 函数来将 Go 对象转换为 JSON。Marshal 函数的语法如下: Demo：结构体转换成Json字符串 Dem...","head":[["meta",{"property":"og:url","content":"https://banrenshan.github.io/Go/go%E6%A0%87%E5%87%86%E5%BA%93-json.html"}],["meta",{"property":"og:site_name","content":"心之所向，素履以往"}],["meta",{"property":"og:title","content":"Go Json"}],["meta",{"property":"og:description","content":"Go语言内建对 JSON 的支持，使用内置的 encoding/json 标准库，开发人员可以轻松使用Go程序生成和解析 JSON 格式的数据。 序列化 将Go对象编码为JSON格式被称为marshaling。我们可以使用Marshal 函数来将 Go 对象转换为 JSON。Marshal 函数的语法如下: Demo：结构体转换成Json字符串 Dem..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-24T08:19:31.000Z"}],["meta",{"property":"article:author","content":"banrenshan"}],["meta",{"property":"article:tag","content":"Go"}],["meta",{"property":"article:published_time","content":"2024-04-24T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-24T08:19:31.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Go Json\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-04-24T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-24T08:19:31.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"banrenshan\\",\\"url\\":\\"https://github.com/banrenshan\\"}]}"]]},"headers":[{"level":3,"title":"Demo：结构体转换成Json字符串","slug":"demo-结构体转换成json字符串","link":"#demo-结构体转换成json字符串","children":[]},{"level":3,"title":"Demo: map 转换成json字符串","slug":"demo-map-转换成json字符串","link":"#demo-map-转换成json字符串","children":[]},{"level":3,"title":"Demo: 格式化输出","slug":"demo-格式化输出","link":"#demo-格式化输出","children":[]},{"level":3,"title":"Demo：将对象序列化到json文件中","slug":"demo-将对象序列化到json文件中","link":"#demo-将对象序列化到json文件中","children":[]},{"level":2,"title":"tags","slug":"tags","link":"#tags","children":[]},{"level":2,"title":"自定义序列化的过程","slug":"自定义序列化的过程","link":"#自定义序列化的过程","children":[{"level":3,"title":"Demo: json转换成结构体","slug":"demo-json转换成结构体","link":"#demo-json转换成结构体","children":[]},{"level":3,"title":"Demo: json转换成map","slug":"demo-json转换成map","link":"#demo-json转换成map","children":[]},{"level":3,"title":"demo: 文件json转换成结构体","slug":"demo-文件json转换成结构体","link":"#demo-文件json转换成结构体","children":[]}]},{"level":2,"title":"自定义反序列化","slug":"自定义反序列化","link":"#自定义反序列化","children":[]}],"git":{"createdTime":1713946771000,"updatedTime":1713946771000,"contributors":[{"name":"banrenshan","email":"CP_zhaozhiqiang@163.com","commits":1}]},"readingTime":{"minutes":2.41,"words":723},"filePathRelative":"Go/go标准库-json.md","localizedDate":"2024年4月24日","excerpt":"<p>Go语言内建对 JSON 的支持，使用内置的 encoding/json 标准库，开发人员可以轻松使用Go程序生成和解析 JSON 格式的数据。</p>\\n<h1>序列化</h1>\\n<p>将Go对象编码为JSON格式被称为marshaling。我们可以使用<code>Marshal</code> 函数来将 Go 对象转换为 JSON。<code>Marshal</code> 函数的语法如下:</p>\\n<div class=\\"language-GO\\" data-ext=\\"GO\\" data-title=\\"GO\\"><pre class=\\"language-GO\\"><code>func Marshal(v interface{}) ([]byte, error)\\n</code></pre></div>","autoDesc":true}');export{m as comp,v as data};
