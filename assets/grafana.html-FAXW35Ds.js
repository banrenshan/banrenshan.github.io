import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as t,c as a,a as n}from"./app-CD92BIt9.js";const i="/assets/1668304038121-434cae35-8522-458e-9637-711294f8905b-DJ3y5hsi.png",r="/assets/1668305302334-75b945f8-103f-4f74-8c5e-8e082ac498c2-Dav9LBjN.png",s="/assets/1668389433444-808609a7-3036-44b2-8db4-5d469f338912-CqkM78mo.png",l="/assets/1668392747106-c54816b5-11aa-42b5-9a7a-b4ad723878b1-D_r2VzJA.png",d="/assets/1668392799937-77a177d8-fd6c-46c4-9fa4-7d47ad33ac1c-DFAzp_k3.png",o="/assets/1668393578460-1e5ceb49-cc71-4097-b7aa-8bc53293ea83-BCH9iCEj.png",p={},u=n('<h1 id="报警" tabindex="-1"><a class="header-anchor" href="#报警"><span>报警</span></a></h1><figure><img src="'+i+`" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p><strong>警报规则</strong></p><p>设置评估标准，确定警报实例是否触发。警报规则由一个或多个查询表达式、条件、求值频率以及满足条件的持续时间（可选）组成。</p><p>Grafana支持多维警报，这意味着每个警报规则可以创建多个警报实例。如果您在一个表达式中观察多个序列，这是非常强大的。</p><p>一旦创建了警报规则，它们将经历各种状态和转换。</p><p><strong>命名空间</strong></p><p>创建 Grafana 管理的规则时，该文件夹可用于访问控制。</p><p><strong>组</strong></p><p>组内的所有规则都以相同的时间间隔进行评估。</p><p>组中的警报规则和记录规则将始终按顺序进行评估。</p><p><strong>警报实例</strong></p><p>Grafana 支持多维度警报。每个警报规则可以创建多个警报实例。如果您在单个表达式中观察多个序列，这将非常强大。</p><p>请考虑以下 PromQL 表达式：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>sum by(cpu) (
  rate(node_cpu_seconds_total{mode!=&quot;idle&quot;}[1m])
)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>使用此表达式的规则将创建与第一次评估后观察到的 CPU 数量一样多的警报实例，从而允许单个规则报告每个 CPU 的状态。</p><figure><img src="`+r+`" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p><strong>标签</strong></p><p>将警报规则及其实例与通知策略和静默相匹配。它们还可以用于按严重程度对警报进行分组。</p><p><strong>通知策略</strong></p><p>设置警报路由的地点、时间和方式。每个通知策略都指定一组标签匹配器，以指示它们负责哪些警报。通知策略有一个分配给它的联络点，该联络点由一个或多个联系人组成。</p><p><strong>联络点</strong></p><p>定义警报触发时如何通知联系人。支持多种ChatOps工具。</p><p><strong>注解</strong></p><p>注释是键值对，提供有关警报的附加元信息。您可以使用以下注释：description、summary、runbook_url、alertId、dashboardUid和panelId。例如，description、summary和runbook URL。这些将显示在规则和警报详细信息的UI上，并且可以在联系人消息模板中使用。</p><p><strong>标签</strong></p><p>标签是键值对，包含有关警报的信息，用于唯一标识警报。警报的标签集将在整个警报评估生成并添加到通知进程中。</p><p>在Grafana中，可以像在Prometheus中那样使用模板注释和标签。以前使用过Prometheus的人应该熟悉<code>$labels</code>变量，它保存警报实例的标签键/值对，以及<code>$value</code>变量，它保持警报实例的评估值。</p><p>在Grafana中，即使您的警报不使用Prometheus数据源，也可以使用来自Promethes的相同变量来模板注释和标签。</p><p>例如，假设我们想在Grafana中创建一个警报，当我们的一个实例停机超过5分钟时通知我们。就像在普罗米修斯中一样，我们可以添加一个摘要注释来显示已关闭的实例：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>Instance {{ $labels.instance }} has been down for more than 5 minutes
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>对于我们还想知道警报触发时的值，我们可以使用$labels和$value变量添加更多信息摘要：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>{{ $labels.instance }} has a 95th percentile request latency above 1s: {{ $value }})
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>Grafana和Prometheus的一个区别是，Prometheus使用$value来同时保存警报触发时的标签和条件值。例如 下面的 $value 内容：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>[ var=&#39;B&#39; labels={instance=http_server} value=10 ]
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果警报规则有两个或多个查询，或者使用reduce和数学表达式，则可以使用$values变量对每个查询和表达式的简化结果进行模板化。该变量保存每个简化查询的标签和值，以及任何数学表达式的结果。但是，它不保存每个查询的样本。</p><figure><img src="`+s+`" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>如果此规则创建警报实例，$values将保存reduce表达式B和数学表达式C的结果。它将不会保存查询A返回的结果，因为查询A不会返回单个值，而是会随时间返回一系列值。</p><p>如果我们要编写摘要注释，例如：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>{{ $labels.instance }} has a 95th percentile request latency above 1s: {{ $value }})
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>我们会发现，由于警报的条件，数学表达式C必须是布尔比较，它必须返回0或1。我们需要的是归约表达式B的第95个百分位：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>{{ $labels.instance }} has a 95th percentile request latency above 1s: {{ $values.B }})
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>我们还可以显示B的标签，但是由于此警报规则只有一个查询，因此B的标签相当于$labels：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>{{ $values.B.Labels.instance }} has a 95th percentile request latency above 1s: {{ $values.B }})
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>No data and execution errors or timeouts</p><p>如果查询A未返回任何数据，则缩减表达式B也将不返回任何数据。这意味着｛｛$values.B｝｝将为零。为了确保即使查询没有返回数据，注释和标签仍然可以模板化，我们可以使用if语句检查$values.B：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>{{ if $values.B }}{{ $labels.instance }} has a 95th percentile request latency above 1s: {{ $values.B }}){{ end }}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果规则使用经典条件而不是reduce和数学表达式，则$values包含refID和条件位置的组合。例如，<code>{{ $values.A0 }} and {{ $values.A1 }}</code>。 展开注释和标签时，以下模板变量可用:</p><table><thead><tr><th><strong>Name</strong></th><th><strong>Description</strong></th></tr></thead><tbody><tr><td>$labels</td><td>查询或条件中的标签。例如，｛｛$labels.instance｝｝和｛｛$labels.job｝｝｝。当规则使用经典条件时，此选项不可用</td></tr><tr><td>$values</td><td>为此警报规则计算的所有reduce表达式和数学表达式的值。例如，｛｛$values.A｝｝、｛｛$values.A.Labels｝和｛｛$values.A.Value｝｝｝，其中A是reduce或数学表达式的refID。如果规则使用经典条件而不是reduce和数学表达式，则$values包含refID和条件位置的组合。</td></tr><tr><td>$value</td><td>警报实例的值字符串。例如: [ var=&#39;A&#39; labels={instance=foo} value=10 ]。</td></tr></tbody></table><p>使用标签和标签匹配器将警报规则链接到通知策略和静默。这允许一种非常灵活的方式来管理警报实例，指定应该处理它们的策略，以及静默哪些警报。</p><p>标签匹配器由3个不同的部分组成：标签、值和运算符。</p><ul><li>标签字段是要匹配的标签的名称。它必须与标签名称完全匹配。</li><li>值字段与指定标签名称的相应值匹配。它的匹配方式取决于Operator。</li><li>运算符字段是与标签值匹配的运算符。可用的运算符有：</li></ul><table><thead><tr><th><strong>Operator</strong></th><th><strong>Description</strong></th></tr></thead><tbody><tr><td>=</td><td>等于</td></tr><tr><td>!=</td><td>不等于</td></tr><tr><td>=~</td><td>正则匹配</td></tr><tr><td>!~</td><td>正则不匹配</td></tr></tbody></table><p>如果使用多个标签匹配器，则使用AND逻辑运算符将它们组合起来。这意味着所有匹配器必须匹配才能将规则链接到策略。</p><p>有三个关键组件：警报规则状态、警报实例状态和警报规则运行状况。尽管相互关联，但每个组件传递的信息都有细微的不同。</p><p>警报规则状态：</p><table><thead><tr><th><strong>State</strong></th><th><strong>Description</strong></th></tr></thead><tbody><tr><td><strong>Normal</strong></td><td>评估引擎返回的时间序列均未处于待定或触发状态。</td></tr><tr><td><strong>Pending</strong></td><td>评估引擎返回的至少一个时间序列处于待定状态。</td></tr><tr><td><strong>Firing</strong></td><td>评估引擎返回的至少一个时间序列处于firing状态。</td></tr></tbody></table><p>警报将首先转换为挂起，然后触发，因此在触发警报之前至少需要两个评估周期。</p><p>警报实例状态:</p><table><thead><tr><th><strong>State</strong></th><th><strong>Description</strong></th></tr></thead><tbody><tr><td><strong>Normal</strong></td><td>警报的状态既不触发也不挂起，一切正常工作。</td></tr><tr><td><strong>Pending</strong></td><td>处于活动状态的警报的状态小于配置的阈值持续时间。</td></tr><tr><td><strong>Alerting</strong></td><td>活动时间超过配置阈值持续时间的警报的状态。</td></tr><tr><td><strong>NoData</strong></td><td>在配置的时间窗口内未收到任何数据。</td></tr><tr><td><strong>Error</strong></td><td>尝试评估警报规则时发生的错误。</td></tr></tbody></table><p>警报规则运行状况:</p><table><thead><tr><th><strong>State</strong></th><th><strong>Description</strong></th></tr></thead><tbody><tr><td><strong>Ok</strong></td><td>评估警报规则时没有错误。</td></tr><tr><td><strong>Error</strong></td><td>评估警报规则时出错。</td></tr><tr><td><strong>NoData</strong></td><td>在规则评估期间返回的至少一个时间序列中缺少数据。</td></tr></tbody></table><p>当警报规则的评估产生状态NoData或Error时，Grafana alerting将生成具有以下附加标签的警报实例：</p><table><thead><tr><th><strong>Label</strong></th><th><strong>Description</strong></th></tr></thead><tbody><tr><td><strong>alertname</strong></td><td>Either DatasourceNoData or DatasourceError depending on the state.</td></tr><tr><td><strong>datasource_uid</strong></td><td>The UID of the data source that caused the state.</td></tr></tbody></table><h2 id="配置联系人" tabindex="-1"><a class="header-anchor" href="#配置联系人"><span>配置联系人</span></a></h2><p>通过联系点发送的通知是使用消息模板生成的。Grafana的默认模板基于Go模板系统，其中一些字段被计算为文本，而另一些字段被评估为HTML（这可能会影响转义）。默认模板，在default_template.go中定义，可以参考其写法：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>{{ define &quot;__subject&quot; }}[{{ .Status | toUpper }}{{ if eq .Status &quot;firing&quot; }}:{{ .Alerts.Firing | len }}{{ if gt (.Alerts.Resolved | len) 0 }}, RESOLVED:{{ .Alerts.Resolved | len }}{{ end }}{{ end }}] {{ .GroupLabels.SortedPairs.Values | join &quot; &quot; }} {{ if gt (len .CommonLabels) (len .GroupLabels) }}({{ with .CommonLabels.Remove .GroupLabels.Names }}{{ .Values | join &quot; &quot; }}{{ end }}){{ end }}{{ end }}
{{ define &quot;__text_values_list&quot; }}{{ $len := len .Values }}{{ if $len }}{{ $first := gt $len 1 }}{{ range $refID, $value := .Values -}}
{{ $refID }}={{ $value }}{{ if $first }}, {{ end }}{{ $first = false }}{{ end -}}
{{ else }}[no value]{{ end }}{{ end }}
{{ define &quot;__text_alert_list&quot; }}{{ range . }}
Value: {{ template &quot;__text_values_list&quot; . }}
Labels:
{{ range .Labels.SortedPairs }} - {{ .Name }} = {{ .Value }}
{{ end }}Annotations:
{{ range .Annotations.SortedPairs }} - {{ .Name }} = {{ .Value }}
{{ end }}{{ if gt (len .GeneratorURL) 0 }}Source: {{ .GeneratorURL }}
{{ end }}{{ if gt (len .SilenceURL) 0 }}Silence: {{ .SilenceURL }}
{{ end }}{{ if gt (len .DashboardURL) 0 }}Dashboard: {{ .DashboardURL }}
{{ end }}{{ if gt (len .PanelURL) 0 }}Panel: {{ .PanelURL }}
{{ end }}{{ end }}{{ end }}
{{ define &quot;default.title&quot; }}{{ template &quot;__subject&quot; . }}{{ end }}
{{ define &quot;default.message&quot; }}{{ if gt (len .Alerts.Firing) 0 }}**Firing**
{{ template &quot;__text_alert_list&quot; .Alerts.Firing }}{{ if gt (len .Alerts.Resolved) 0 }}
{{ end }}{{ end }}{{ if gt (len .Alerts.Resolved) 0 }}**Resolved**
{{ template &quot;__text_alert_list&quot; .Alerts.Resolved }}{{ end }}{{ end }}
{{ define &quot;__teams_text_alert_list&quot; }}{{ range . }}
Value: {{ template &quot;__text_values_list&quot; . }}
Labels:
{{ range .Labels.SortedPairs }} - {{ .Name }} = {{ .Value }}
{{ end }}
Annotations:
{{ range .Annotations.SortedPairs }} - {{ .Name }} = {{ .Value }}
{{ end }}
{{ if gt (len .GeneratorURL) 0 }}Source: [{{ .GeneratorURL }}]({{ .GeneratorURL }})
{{ end }}{{ if gt (len .SilenceURL) 0 }}Silence: [{{ .SilenceURL }}]({{ .SilenceURL }})
{{ end }}{{ if gt (len .DashboardURL) 0 }}Dashboard: [{{ .DashboardURL }}]({{ .DashboardURL }})
{{ end }}{{ if gt (len .PanelURL) 0 }}Panel: [{{ .PanelURL }}]({{ .PanelURL }})
{{ end }}
{{ end }}{{ end }}
{{ define &quot;teams.default.message&quot; }}{{ if gt (len .Alerts.Firing) 0 }}**Firing**
{{ template &quot;__teams_text_alert_list&quot; .Alerts.Firing }}{{ if gt (len .Alerts.Resolved) 0 }}
{{ end }}{{ end }}{{ if gt (len .Alerts.Resolved) 0 }}**Resolved**
{{ template &quot;__teams_text_alert_list&quot; .Alerts.Resolved }}{{ end }}{{ end }}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以下示例演示如何使用默认模板在Slack中呈现警报消息。消息标题包含正在触发或已解决的警报计数。消息正文列出了警报及其状态:</p><figure><img src="`+l+'" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>下面的示例显示了如何使用自定义模板：</p><figure><img src="'+d+`" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>模板嵌套</p><p>您可以在其他模板中嵌入模板。例如，您可以使用define关键字定义模板片段：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>{{ define &quot;mytemplate&quot; }}
  {{ len .Alerts.Firing }} firing. {{ len .Alerts.Resolved }} resolved.
{{ end }}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>然后，可以使用template关键字将自定义模板嵌入此片段中。例如：</p><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><pre class="language-plain"><code>Alert summary:
{{ template &quot;mytemplate&quot; . }}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>您可以使用以下任何内置模板选项嵌入自定义模板:</p><table><thead><tr><th>default.title</th><th>显示高级状态信息。</th></tr></thead><tbody><tr><td>default.message</td><td>提供触发和已解决警报的格式化摘要。</td></tr><tr><td>teams.default.message</td><td>类似于default.messsage。为Microsoft Teams格式化。</td></tr></tbody></table><p>通知策略决定如何将警报路由到联系点。策略具有树结构，其中每个策略可以有一个或多个子策略。除根策略外，每个策略还可以匹配特定的警报标签。每个警报由根策略评估，然后由每个子策略评估。如果为特定策略启用了“继续匹配后续同级节点”选项，则即使在一个或多个匹配之后，评估也会继续。当没有任何子策略匹配时，命中根策略。</p><figure><img src="`+o+'" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>分组是Grafana Alerting的一个新的关键概念，它将类似性质的警报通知分类为单个漏斗。这样，当系统的许多部分同时发生故障，导致大量警报同时触发时，您可以在较大的停机期间正确地路由警报通知。</p><p>例如，假设您有100个服务连接到不同环境中的数据库。这些服务通过标签env=environmentname进行区分。有一个警报规则，用于监视您的服务是否可以访问名为alertname=DatabaseUnreach的数据库。</p><p>当出现网络分区时，一半的服务将无法再访问数据库。结果，会触发50个不同的警报（假设您的服务有一半）。对于这种情况，您希望收到一个带有受影响环境列表的单页通知（而不是50页）。</p><p>您可以将分组配置为group_by:[alertname]（请注意，省略了env标签）。有了这个配置，Grafana会发送一个紧凑的通知，其中包含此警报规则的所有受影响环境。</p><p>Grafana还有一个名为<code>…</code>的特殊标签，您可以使用它按所有标签对所有警报进行分组（有效地禁用分组），因此每个警报都将进入自己的组。它不同于默认的group_by:null，其中所有警报都进入一个组。</p><p>静音定时是警告重复发送的时间间隔。使用它们可以防止警报在特定的重复周期内触发。</p><p>与静音类似，静音计时不会阻止评估警报规则，也不会阻止警报实例在用户界面中显示。它们仅阻止创建通知。</p><p>使用静音停止来自一个或多个警报规则的通知。静默不会阻止评估警报规则。它们也不会停止警告实例在用户界面中显示。静音仅阻止创建通知。沉默只持续一段特定的时间。</p><ul><li></li></ul>',89),c=[u];function g(m,v){return t(),a("div",null,c)}const f=e(p,[["render",g],["__file","grafana.html.vue"]]),_=JSON.parse('{"path":"/post/grafana.html","title":"grafana2","lang":"zh-CN","frontmatter":{"title":"grafana2","tags":["grafana","监控"],"categories":["中间件"],"date":"2022-11-27T19:49:23.000Z","description":"报警 imgimg 警报规则 设置评估标准，确定警报实例是否触发。警报规则由一个或多个查询表达式、条件、求值频率以及满足条件的持续时间（可选）组成。 Grafana支持多维警报，这意味着每个警报规则可以创建多个警报实例。如果您在一个表达式中观察多个序列，这是非常强大的。 一旦创建了警报规则，它们将经历各种状态和转换。 命名空间 创建 Grafana 管...","head":[["meta",{"property":"og:url","content":"https://banrenshan.github.io/post/grafana.html"}],["meta",{"property":"og:site_name","content":"心之所向，素履以往"}],["meta",{"property":"og:title","content":"grafana2"}],["meta",{"property":"og:description","content":"报警 imgimg 警报规则 设置评估标准，确定警报实例是否触发。警报规则由一个或多个查询表达式、条件、求值频率以及满足条件的持续时间（可选）组成。 Grafana支持多维警报，这意味着每个警报规则可以创建多个警报实例。如果您在一个表达式中观察多个序列，这是非常强大的。 一旦创建了警报规则，它们将经历各种状态和转换。 命名空间 创建 Grafana 管..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-21T09:35:03.000Z"}],["meta",{"property":"article:author","content":"banrenshan"}],["meta",{"property":"article:tag","content":"grafana"}],["meta",{"property":"article:tag","content":"监控"}],["meta",{"property":"article:published_time","content":"2022-11-27T19:49:23.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-21T09:35:03.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"grafana2\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2022-11-27T19:49:23.000Z\\",\\"dateModified\\":\\"2024-04-21T09:35:03.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"banrenshan\\",\\"url\\":\\"https://github.com/banrenshan\\"}]}"]]},"headers":[{"level":2,"title":"配置联系人","slug":"配置联系人","link":"#配置联系人","children":[]}],"git":{"createdTime":1713091835000,"updatedTime":1713692103000,"contributors":[{"name":"banrenshan","email":"CP_zhaozhiqiang@163.com","commits":4}]},"readingTime":{"minutes":10.85,"words":3255},"filePathRelative":"post/grafana.md","localizedDate":"2022年11月27日","excerpt":"\\n<figure><figcaption>img</figcaption></figure>\\n<p><strong>警报规则</strong></p>\\n<p>设置评估标准，确定警报实例是否触发。警报规则由一个或多个查询表达式、条件、求值频率以及满足条件的持续时间（可选）组成。</p>\\n<p>Grafana支持多维警报，这意味着每个警报规则可以创建多个警报实例。如果您在一个表达式中观察多个序列，这是非常强大的。</p>\\n<p>一旦创建了警报规则，它们将经历各种状态和转换。</p>\\n<p><strong>命名空间</strong></p>\\n<p>创建 Grafana 管理的规则时，该文件夹可用于访问控制。</p>","autoDesc":true}');export{f as comp,_ as data};
