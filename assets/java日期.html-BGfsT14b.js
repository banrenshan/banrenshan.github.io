import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as a,c as s,a as t}from"./app-g-OKA8ms.js";const p={},e=t(`<h2 id="instant" tabindex="-1"><a class="header-anchor" href="#instant"><span>Instant</span></a></h2><p>表示精确的时间点,由从<code>1970-1-1 00:00:00</code>到现在的秒数和偏移该秒数的毫秒数组成.</p><h2 id="duration" tabindex="-1"><a class="header-anchor" href="#duration"><span>Duration</span></a></h2><p>Duration对象表示两个时间点之间的距离</p><h2 id="period" tabindex="-1"><a class="header-anchor" href="#period"><span>Period</span></a></h2><p>表示两个日期之间的距离</p><h2 id="localdate" tabindex="-1"><a class="header-anchor" href="#localdate"><span>LocalDate</span></a></h2><p>LocalDate 表示像 2017-01-01 这样的日期。它包含有年份、月份、当月天数，它不不包含一天中的时间，以及时区信息</p><h2 id="日期校正器temporaladjuster" tabindex="-1"><a class="header-anchor" href="#日期校正器temporaladjuster"><span>日期校正器TemporalAdjuster</span></a></h2><p>如果想找到某个月的第一个周五，或是某个月的最后一天，像这样的日期就可以使用TemporalAdjuster来进行日期调整。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">//2017-02-03的下一个星期五(包含当天)  2017-03-03</span>
<span class="token class-name">LocalDate</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">with</span><span class="token punctuation">(</span><span class="token class-name">TemporalAdjusters</span><span class="token punctuation">.</span><span class="token function">nextOrSame</span><span class="token punctuation">(</span><span class="token class-name">DayOfWeek</span><span class="token punctuation">.</span><span class="token constant">FRIDAY</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//2017-02-03的下一个星期五(不包含当天)  2017-02-10</span>
<span class="token class-name">LocalDate</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">with</span><span class="token punctuation">(</span><span class="token class-name">TemporalAdjusters</span><span class="token punctuation">.</span><span class="token function">next</span><span class="token punctuation">(</span><span class="token class-name">DayOfWeek</span><span class="token punctuation">.</span><span class="token constant">FRIDAY</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//2月中的第3个星期五  2017-02-17</span>
<span class="token class-name">LocalDate</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">with</span><span class="token punctuation">(</span><span class="token class-name">TemporalAdjusters</span><span class="token punctuation">.</span><span class="token function">dayOfWeekInMonth</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">,</span> <span class="token class-name">DayOfWeek</span><span class="token punctuation">.</span><span class="token constant">FRIDAY</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//2月中的最后一个星期五  2017-02-24</span>
<span class="token class-name">LocalDate</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">with</span><span class="token punctuation">(</span><span class="token class-name">TemporalAdjusters</span><span class="token punctuation">.</span><span class="token function">lastInMonth</span><span class="token punctuation">(</span><span class="token class-name">DayOfWeek</span><span class="token punctuation">.</span><span class="token constant">FRIDAY</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//下个月的第一天</span>
<span class="token class-name">LocalDate</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token keyword">with</span><span class="token punctuation">(</span><span class="token class-name">TemporalAdjusters</span><span class="token punctuation">.</span><span class="token function">firstDayOfNextMonth</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="localtime" tabindex="-1"><a class="header-anchor" href="#localtime"><span>LocalTime</span></a></h2><p>LocalTime表示一天中的某个时间，例如18:00:00。LocaTime与LocalDate类似，他们也有相似的API。</p><h2 id="localdatetime" tabindex="-1"><a class="header-anchor" href="#localdatetime"><span>LocalDateTime</span></a></h2><p>LocalDateTime表示一个日期和时间，它适合用来存储确定时区的某个时间点。不适合跨时区的问题。</p><h2 id="zoneddatetime" tabindex="-1"><a class="header-anchor" href="#zoneddatetime"><span>ZonedDateTime</span></a></h2><p>包含时区信息,格式是<code>2017-01-20T17:35:20.885+08:00[Asia/Shanghai]</code> .创建时区时间</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">//2017-01-20T17:35:20.885+08:00[Asia/Shanghai]</span>
<span class="token class-name">ZonedDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//2017-01-01T12:00+08:00[Asia/Shanghai]</span>
<span class="token class-name">ZonedDateTime</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">12</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> <span class="token class-name">ZoneId</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token string">&quot;Asia/Shanghai&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//使用一个准确的时间点来创建ZonedDateTime，下面这个代码会得到当前的UTC时间，会比北京时间早8个小时</span>
<span class="token class-name">ZonedDateTime</span><span class="token punctuation">.</span><span class="token function">ofInstant</span><span class="token punctuation">(</span><span class="token class-name">Instant</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token class-name">ZoneId</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token string">&quot;UTC&quot;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="datetimeformatter" tabindex="-1"><a class="header-anchor" href="#datetimeformatter"><span>DateTimeFormatter</span></a></h2><p><code>DateTimeFormatter</code>使用了三种格式化方法来打印日期和时间</p><p>预定义的标准格式</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">//2017-01-01</span>
<span class="token class-name">DateTimeFormatter</span><span class="token punctuation">.</span><span class="token constant">ISO_LOCAL_DATE</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token class-name">LocalDate</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
<span class="token comment">//20170101</span>
<span class="token class-name">DateTimeFormatter</span><span class="token punctuation">.</span><span class="token constant">BASIC_ISO_DATE</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token class-name">LocalDate</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//2017-01-01T09:10:00</span>
<span class="token class-name">DateTimeFormatter</span><span class="token punctuation">.</span><span class="token constant">ISO_LOCAL_DATE_TIME</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">9</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>语言环境相关的格式化风格</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">//2017年1月1日 星期日</span>
<span class="token class-name">DateTimeFormatter</span><span class="token punctuation">.</span><span class="token function">ofLocalizedDate</span><span class="token punctuation">(</span><span class="token class-name">FormatStyle</span><span class="token punctuation">.</span><span class="token constant">FULL</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token class-name">LocalDate</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">2017</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//上午09时10分00秒</span>
<span class="token class-name">DateTimeFormatter</span><span class="token punctuation">.</span><span class="token function">ofLocalizedTime</span><span class="token punctuation">(</span><span class="token class-name">FormatStyle</span><span class="token punctuation">.</span><span class="token constant">LONG</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token class-name">LocalTime</span><span class="token punctuation">.</span><span class="token function">of</span><span class="token punctuation">(</span><span class="token number">9</span><span class="token punctuation">,</span> <span class="token number">10</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">//2017-2-27 22:32:03</span>
<span class="token class-name">DateTimeFormatter</span><span class="token punctuation">.</span><span class="token function">ofLocalizedDateTime</span><span class="token punctuation">(</span><span class="token class-name">FormatStyle</span><span class="token punctuation">.</span><span class="token constant">MEDIUM</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面的方法都使用的是默认的语言环境，如果想改语言环境，需要使用withLocale方法来改变。</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token class-name">DateTimeFormatter</span><span class="token punctuation">.</span><span class="token function">ofLocalizedDateTime</span><span class="token punctuation">(</span><span class="token class-name">FormatStyle</span><span class="token punctuation">.</span><span class="token constant">MEDIUM</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">withLocale</span><span class="token punctuation">(</span><span class="token class-name">Locale</span><span class="token punctuation">.</span><span class="token constant">US</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>使用自定义模式格式化</p><div class="language-java line-numbers-mode" data-ext="java" data-title="java"><pre class="language-java"><code><span class="token comment">//2017-02-27 22:48:52</span>
<span class="token class-name">DateTimeFormatter</span><span class="token punctuation">.</span><span class="token function">ofPattern</span><span class="token punctuation">(</span><span class="token string">&quot;yyyy-MM-dd HH:mm:ss&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">format</span><span class="token punctuation">(</span><span class="token class-name">LocalDateTime</span><span class="token punctuation">.</span><span class="token function">now</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,28),o=[e];function c(l,u){return a(),s("div",null,o)}const r=n(p,[["render",c],["__file","java日期.html.vue"]]),m=JSON.parse('{"path":"/post/java%E6%97%A5%E6%9C%9F.html","title":"Java 日期 API","lang":"zh-CN","frontmatter":{"title":"Java 日期 API","date":"2024-04-24T00:00:00.000Z","categories":["java"],"tags":["java","日期API"],"description":"Instant 表示精确的时间点,由从1970-1-1 00:00:00到现在的秒数和偏移该秒数的毫秒数组成. Duration Duration对象表示两个时间点之间的距离 Period 表示两个日期之间的距离 LocalDate LocalDate 表示像 2017-01-01 这样的日期。它包含有年份、月份、当月天数，它不不包含一天中的时间，以及...","head":[["meta",{"property":"og:url","content":"https://banrenshan.github.io/post/java%E6%97%A5%E6%9C%9F.html"}],["meta",{"property":"og:site_name","content":"心之所向，素履以往"}],["meta",{"property":"og:title","content":"Java 日期 API"}],["meta",{"property":"og:description","content":"Instant 表示精确的时间点,由从1970-1-1 00:00:00到现在的秒数和偏移该秒数的毫秒数组成. Duration Duration对象表示两个时间点之间的距离 Period 表示两个日期之间的距离 LocalDate LocalDate 表示像 2017-01-01 这样的日期。它包含有年份、月份、当月天数，它不不包含一天中的时间，以及..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-24T12:16:57.000Z"}],["meta",{"property":"article:author","content":"banrenshan"}],["meta",{"property":"article:tag","content":"java"}],["meta",{"property":"article:tag","content":"日期API"}],["meta",{"property":"article:published_time","content":"2024-04-24T00:00:00.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-24T12:16:57.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Java 日期 API\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2024-04-24T00:00:00.000Z\\",\\"dateModified\\":\\"2024-04-24T12:16:57.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"banrenshan\\",\\"url\\":\\"https://github.com/banrenshan\\"}]}"]]},"headers":[{"level":2,"title":"Instant","slug":"instant","link":"#instant","children":[]},{"level":2,"title":"Duration","slug":"duration","link":"#duration","children":[]},{"level":2,"title":"Period","slug":"period","link":"#period","children":[]},{"level":2,"title":"LocalDate","slug":"localdate","link":"#localdate","children":[]},{"level":2,"title":"日期校正器TemporalAdjuster","slug":"日期校正器temporaladjuster","link":"#日期校正器temporaladjuster","children":[]},{"level":2,"title":"LocalTime","slug":"localtime","link":"#localtime","children":[]},{"level":2,"title":"LocalDateTime","slug":"localdatetime","link":"#localdatetime","children":[]},{"level":2,"title":"ZonedDateTime","slug":"zoneddatetime","link":"#zoneddatetime","children":[]},{"level":2,"title":"DateTimeFormatter","slug":"datetimeformatter","link":"#datetimeformatter","children":[]}],"git":{"createdTime":1713961017000,"updatedTime":1713961017000,"contributors":[{"name":"banrenshan","email":"CP_zhaozhiqiang@163.com","commits":1}]},"readingTime":{"minutes":2.07,"words":620},"filePathRelative":"post/java日期.md","localizedDate":"2024年4月24日","excerpt":"<h2>Instant</h2>\\n<p>表示精确的时间点,由从<code>1970-1-1 00:00:00</code>到现在的秒数和偏移该秒数的毫秒数组成.</p>\\n<h2>Duration</h2>\\n<p>Duration对象表示两个时间点之间的距离</p>\\n<h2>Period</h2>\\n<p>表示两个日期之间的距离</p>\\n<h2>LocalDate</h2>\\n<p>LocalDate 表示像 2017-01-01 这样的日期。它包含有年份、月份、当月天数，它不不包含一天中的时间，以及时区信息</p>\\n<h2>日期校正器TemporalAdjuster</h2>\\n<p>如果想找到某个月的第一个周五，或是某个月的最后一天，像这样的日期就可以使用TemporalAdjuster来进行日期调整。</p>","autoDesc":true}');export{r as comp,m as data};
