import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{o as s,c as a,a as n}from"./app-DSYRoKiT.js";const i={},l=n(`<h2 id="job-类型" tabindex="-1"><a class="header-anchor" href="#job-类型"><span>job 类型</span></a></h2><ul><li>Command job: 命令作业是单个命令或可执行文件、windows 批处理文件或 unix 脚本/powershell 脚本/shell 脚本（脚本语言）。</li><li>File Watcher job: 监听文件的变动</li><li>Box (box jobs): AutoSys box 作业是包含其他作业的容器。 AutoSys 中的 box 作业用于控制和组织流程。</li></ul><h2 id="依赖条件" tabindex="-1"><a class="header-anchor" href="#依赖条件"><span>依赖条件</span></a></h2><p>job之间可以相互依赖， 使用关键字condition表示。</p><h3 id="简单依赖" tabindex="-1"><a class="header-anchor" href="#简单依赖"><span>简单依赖</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>/ *** EOD_post *** /
insert_job: EOD_post
job_type: cmd
machine: prod
condition: s<span class="token punctuation">(</span>EOD_watch<span class="token punctuation">)</span>
command: <span class="token environment constant">$HOME</span>/POST
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上我们定了一个名为<code>EOD_POST</code>的cmd作业，它的依赖关系为 <code>s(EOD_watch)</code>, 即依赖于<code>EOD_watch</code>作业的成功。换句话说，只有<code>EOD_watch</code>这个作业的完成状态为<code>success</code>，<code>EOD_POST</code>才会被启动。</p><h3 id="回看条件" tabindex="-1"><a class="header-anchor" href="#回看条件"><span>回看条件</span></a></h3><p>我们还可以在作业的依赖关系中添加时间限制，即回看条件(look-back condition):</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>insert_job: test_sample_04
job_type: cmd
machine: localhost
command: <span class="token function">sleep</span> <span class="token number">10</span>
condition: s<span class="token punctuation">(</span>test_sample_01,12.00<span class="token punctuation">)</span> AND f<span class="token punctuation">(</span>test_sample_02,24.00<span class="token punctuation">)</span> AND
s<span class="token punctuation">(</span>test_sample_03<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>只有<code>condition</code>中所有条件时满足时，命令作业<code>test_sample_04</code>才会被启动，即满足：</p><ul><li>最近一次运行的<code>test_sample_01</code>的完成状态为<code>success</code>, 且完成时间在过去12小时内。</li><li>最近一次运行的<code>test_sample_02</code>的完成状态为<code>failure</code>, 且完成时间在过去24小时内。 小时。</li><li>最近一次运行<code>test_sample_03</code>为成功即可（对其结束时间没有限制，可以是任意时间）</li></ul><p>回看条件的时间依赖的表示方法为<code> HH.MM</code> （HH为小时数，MM为分钟数)</p><p>look-back condition还有有一种特殊用法:<code>condition : s(dep_job, 0)</code>。我们先定义一个cmd作业test_sample_05：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>insert_job: test_sample_05
job_type: cmd
machine: localhost
command: <span class="token function">sleep</span> <span class="token number">10</span>
condition: s<span class="token punctuation">(</span>test_sample_04<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>它只要检测到<code>test_sample_04</code>完成并具有<code>success</code>状态就会启动。</p><p>然后我们更新它的<code>condition</code>依赖条件：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>update_job: test_sample_05
condition: s<span class="token punctuation">(</span>test_sample_04, <span class="token number">0</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>这里我们在<code>condition</code>中增加了回看条件依赖0，此时，autosys会先检测<code>test_sample_05</code>上一次的完成时间，比如昨天11点, 然后它会去检测<code>test_sample_05</code>所依赖的<code>test_sample_04</code>的完成时间，只有<code>test_sample_04</code>最后一次的完成时间在<code>test_sample_05</code>上一次的完成之间之后，新的<code>test_sample_05</code>才会被启动。 例如，上一次<code>test_sample_05</code>完成时间是11点，而最近一次<code>test_sample_04</code>的完成时间是昨天10点，则其条件不满足。再比如，最近一次<code>test_sample_04</code>的完成时间是昨天11点05分，晚于上一次<code>test_sample_05</code>完成时间(11点)，则其条件满足，<code>test_sample_05</code>会被启动。</p><h2 id="job-运行状态" tabindex="-1"><a class="header-anchor" href="#job-运行状态"><span>job 运行状态</span></a></h2><ul><li><p><code>INACTIVE</code>： JOB 未运行</p></li><li><p><code>STARTING</code>： JOB初始化中</p></li><li><p><code>RUNNING</code>： JOB运行中</p></li><li><p><code>SUCCESS</code>： JOB运行成功</p></li><li><p><code>FAILURE</code>： JOB运行失败</p></li><li><p><code>TERMINATED</code>： JOB 在running时被kill</p></li><li><p><code>RESTART </code>:其它硬件或者应用问题导致的job需要被重启</p></li><li><p><code>QUE_WAIT </code>:job达到启动条件，但由于其它原因导致暂时无法启动时的状态</p></li><li><p><code>ACTIVATED</code>: 适用于box job, 指box已经在<code>RUNNING</code>，但是job还未能启动</p></li><li><p><code>ON HOLD</code>：暂停</p><ol><li>表示作业处于暂停状态，并且在我们将其取消Hold之前无法运行。</li><li>当作业处于ON <code>HOLD</code>状态时，所有依赖于此作业的作业都不会运行 (即作业的下游不会运行)。</li><li><code>ON_HOLD</code>的作业，如果在其<code>ON_HOLD</code>期间曾经满足过运行条件，那么当它收到<code>JOB_OFF_HOLD</code>后，该作业会被立即执行</li></ol></li><li><p><code>ON ICE</code>：暂时删除</p><ol><li>表示作业已从作业流中删除，但定义仍然在 。该作业不会被启动， 它会保持<code>ON ICE</code>，直到它收到<code>JOB_OFF_ICE</code>命令时才能恢复运行</li><li>当作业状态为<code>ON ICE</code>时， 此作业将从所有condition中删除(定义仍然在，相当于判断condition时，跳过含有该作业的条件判断)。</li><li>当<code>ON_ICE</code>作业收到<code>JOB_OFF_ICE</code>时，就算它在<code>ON_ICE</code>期间满足过启动条件，作业也不会马上运行，需要等到条件再次满足才会运</li></ol></li></ul><h2 id="jil语法" tabindex="-1"><a class="header-anchor" href="#jil语法"><span>JIL语法</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>sub_command: job_name
attribute_keyword: value
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><code>sub_command</code>包含； <ul><li><code>insert_job</code>：增加一个新job</li><li><code>insert_machine</code>：增加一个新machine</li><li><code>update_job</code>：更新已存在的job</li><li><code>delete_job</code>：从数据库删除job</li><li><code>delete_box</code>：删除存在的box，包括所有在box里的job</li><li><code>override_job</code>：覆盖job属性，下次运行时生效</li></ul></li></ul><p>job由许多不同属性构成, 最重要的三点:<code>when</code>, <code>where</code>, <code>if</code></p><ul><li><code>when </code>：指定开始时间，星期，　日历，watched file</li><li><code>where</code>：机器名，　指运行该job的机器</li><li><code>if </code>：运行条件，　SUCCESS</li></ul><h3 id="创建-command-jobs" tabindex="-1"><a class="header-anchor" href="#创建-command-jobs"><span>创建 Command Jobs</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>insert_job: XXXX_TES_RECON  job_type: c   
box_name: SG_TES_DATA_BX  
command: <span class="token variable">$SG_BIN_DIR</span>/recon_dt.sh PAPRO SG  
machine: SG_TES_VM  
permission: gx,mx,me  
date_conditions: <span class="token number">1</span>  
days_of_week: tu, we, th, fr, sa  
start_times: <span class="token string">&quot;05:00&quot;</span>  
condition: s<span class="token punctuation">(</span>SG_TES_DATA_ROFILE<span class="token punctuation">)</span>  
description: <span class="token string">&quot;genertate recon for ROFILE&quot;</span>  
std_out_file: <span class="token variable">$SG_TES_LOG_DIR</span>/Autosys/<span class="token variable">$AUTO_JOB_NAME</span>.out  
std_err_file: <span class="token variable">$SG_TES_LOG_DIR</span>/Autosys/<span class="token variable">$AUTO_JOB_NAME</span>.err  
alarm_if_fail: <span class="token number">1</span>  
profile: /app/TES/SG/config/autosys.profile  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>这个脚本将创建名为：XXXX_TES_RECON的job</li><li>运行时间： 每周二 至 周六 05：00启动，依赖条件 <code>SG_TES_DATA_ROFILE </code>SUCCESS</li><li>运行的机器：<code>SG_TES_VM</code></li><li>job 类型：<code>command</code></li></ul><h3 id="创建-file-watcher-jobs" tabindex="-1"><a class="header-anchor" href="#创建-file-watcher-jobs"><span>创建 File Watcher Jobs</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>insert_job: XXXX_TES_UPD_LIST_WATCHER   job_type: f   
box_name: XXXX_TES_ID_BX  
machine: HK_TES_VM  
permission: gx,mx,me  
description: <span class="token string">&quot;File watcher for EEW data (UpdateList.csv)&quot;</span>  
term_run_time: <span class="token number">120</span>  
watch_file: <span class="token variable">$SG_TES_INPUT_DIR</span>/UpdateList.csv  
watch_interval: <span class="token number">60</span>  
alarm_if_fail: <span class="token number">1</span>  
profile: /app/TES/SG/config/autosys.profile  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="创建box-jobs" tabindex="-1"><a class="header-anchor" href="#创建box-jobs"><span>创建Box Jobs</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>insert_job: XXXX_TES_ID_BX   job_type: b   
permission: gx,mx,me  
date_conditions: <span class="token number">1</span>  
days_of_week: mo, tu, we, th, fr  
start_times: <span class="token string">&quot;22:30&quot;</span>  
condition: s<span class="token punctuation">(</span>XXXX_DDD<span class="token punctuation">)</span>  
description: <span class="token string">&quot;EOD job for update auth&quot;</span>  
alarm_if_fail: <span class="token number">1</span>  
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>job名：XXXX_TES_ID_BX</li><li>运行时间： 每周一 -- 周五 22:30启动，依赖条件 XXXX_DDD</li><li>job 类型：b</li></ul><h2 id="注释" tabindex="-1"><a class="header-anchor" href="#注释"><span>注释</span></a></h2><ul><li>行备注， 采用#开始的整行</li><li>多行备注, 类似C语言， /* xxxx */</li></ul><p>属性值带有冒号时， 应该是用转义字符<code>\\</code>, 如<code>10:00 --&gt; 10\\:00</code></p><h2 id="命令" tabindex="-1"><a class="header-anchor" href="#命令"><span>命令</span></a></h2><ul><li>基本命令</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>sendevent <span class="token parameter variable">-E</span> FORCE_STARTJOB <span class="token parameter variable">-J</span> JobName
sendevent <span class="token parameter variable">-E</span> JOB_ON_ICE <span class="token parameter variable">-J</span> JobName
sendevent <span class="token parameter variable">-E</span> CHANGE_STATUS <span class="token parameter variable">-s</span> FAILURE <span class="token parameter variable">-J</span> JobName
sendevent <span class="token parameter variable">-E</span> CHANGE_STATUS <span class="token parameter variable">-s</span> SUCCESS <span class="token parameter variable">-J</span> JobName
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>管理job[创建、更新、删除]</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>jil <span class="token operator">&lt;</span> /path/JilFile.jil
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,42),o=[l];function t(d,c){return s(),a("div",null,o)}const u=e(i,[["render",t],["__file","12-autosys.html.vue"]]),b=JSON.parse('{"path":"/gudie/12-autosys.html","title":"AutoSys","lang":"zh-CN","frontmatter":{"title":"AutoSys","date":"2021-09-11T19:38:05.000Z","tags":["AutoSys"],"categories":["任务"],"description":"job 类型 Command job: 命令作业是单个命令或可执行文件、windows 批处理文件或 unix 脚本/powershell 脚本/shell 脚本（脚本语言）。 File Watcher job: 监听文件的变动 Box (box jobs): AutoSys box 作业是包含其他作业的容器。 AutoSys 中的 box 作业用于控...","head":[["meta",{"property":"og:url","content":"https://banrenshan.github.io/gudie/12-autosys.html"}],["meta",{"property":"og:site_name","content":"心之所向，素履以往"}],["meta",{"property":"og:title","content":"AutoSys"}],["meta",{"property":"og:description","content":"job 类型 Command job: 命令作业是单个命令或可执行文件、windows 批处理文件或 unix 脚本/powershell 脚本/shell 脚本（脚本语言）。 File Watcher job: 监听文件的变动 Box (box jobs): AutoSys box 作业是包含其他作业的容器。 AutoSys 中的 box 作业用于控..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-04-24T06:29:19.000Z"}],["meta",{"property":"article:author","content":"banrenshan"}],["meta",{"property":"article:tag","content":"AutoSys"}],["meta",{"property":"article:published_time","content":"2021-09-11T19:38:05.000Z"}],["meta",{"property":"article:modified_time","content":"2024-04-24T06:29:19.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"AutoSys\\",\\"image\\":[\\"\\"],\\"datePublished\\":\\"2021-09-11T19:38:05.000Z\\",\\"dateModified\\":\\"2024-04-24T06:29:19.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"banrenshan\\",\\"url\\":\\"https://github.com/banrenshan\\"}]}"]]},"headers":[{"level":2,"title":"job 类型","slug":"job-类型","link":"#job-类型","children":[]},{"level":2,"title":"依赖条件","slug":"依赖条件","link":"#依赖条件","children":[{"level":3,"title":"简单依赖","slug":"简单依赖","link":"#简单依赖","children":[]},{"level":3,"title":"回看条件","slug":"回看条件","link":"#回看条件","children":[]}]},{"level":2,"title":"job 运行状态","slug":"job-运行状态","link":"#job-运行状态","children":[]},{"level":2,"title":"JIL语法","slug":"jil语法","link":"#jil语法","children":[{"level":3,"title":"创建 Command Jobs","slug":"创建-command-jobs","link":"#创建-command-jobs","children":[]},{"level":3,"title":"创建 File Watcher Jobs","slug":"创建-file-watcher-jobs","link":"#创建-file-watcher-jobs","children":[]},{"level":3,"title":"创建Box Jobs","slug":"创建box-jobs","link":"#创建box-jobs","children":[]}]},{"level":2,"title":"注释","slug":"注释","link":"#注释","children":[]},{"level":2,"title":"命令","slug":"命令","link":"#命令","children":[]}],"git":{"createdTime":1713940159000,"updatedTime":1713940159000,"contributors":[{"name":"banrenshan","email":"CP_zhaozhiqiang@163.com","commits":1}]},"readingTime":{"minutes":4.61,"words":1382},"filePathRelative":"gudie/12-autosys.md","localizedDate":"2021年9月11日","excerpt":"<h2>job 类型</h2>\\n<ul>\\n<li>Command job: 命令作业是单个命令或可执行文件、windows 批处理文件或 unix 脚本/powershell 脚本/shell 脚本（脚本语言）。</li>\\n<li>File Watcher job: 监听文件的变动</li>\\n<li>Box (box jobs): AutoSys box 作业是包含其他作业的容器。 AutoSys 中的 box 作业用于控制和组织流程。</li>\\n</ul>\\n<h2>依赖条件</h2>\\n<p>job之间可以相互依赖， 使用关键字condition表示。</p>\\n<h3>简单依赖</h3>\\n<div class=\\"language-bash\\" data-ext=\\"sh\\" data-title=\\"sh\\"><pre class=\\"language-bash\\"><code>/ *** EOD_post *** /\\ninsert_job: EOD_post\\njob_type: cmd\\nmachine: prod\\ncondition: s<span class=\\"token punctuation\\">(</span>EOD_watch<span class=\\"token punctuation\\">)</span>\\ncommand: <span class=\\"token environment constant\\">$HOME</span>/POST\\n</code></pre></div>","autoDesc":true}');export{u as comp,b as data};