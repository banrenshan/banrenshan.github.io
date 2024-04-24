---
title: AutoSys
date: 2021-09-11 19:38:05
tags:
 - AutoSys
categories:
 - 任务
---

## job 类型

* Command job: 命令作业是单个命令或可执行文件、windows 批处理文件或 unix 脚本/powershell 脚本/shell 脚本（脚本语言）。
* File Watcher job: 监听文件的变动
* Box (box jobs): AutoSys box 作业是包含其他作业的容器。 AutoSys 中的 box 作业用于控制和组织流程。

## 依赖条件

job之间可以相互依赖， 使用关键字condition表示。 

### 简单依赖

```shell
/ *** EOD_post *** /
insert_job: EOD_post
job_type: cmd
machine: prod
condition: s(EOD_watch)
command: $HOME/POST
```
以上我们定了一个名为`EOD_POST`的cmd作业，它的依赖关系为 `s(EOD_watch)`, 即依赖于`EOD_watch`作业的成功。换句话说，只有`EOD_watch`这个作业的完成状态为`success`，`EOD_POST`才会被启动。

### 回看条件


我们还可以在作业的依赖关系中添加时间限制，即回看条件(look-back condition):

```shell
insert_job: test_sample_04
job_type: cmd
machine: localhost
command: sleep 10
condition: s(test_sample_01,12.00) AND f(test_sample_02,24.00) AND
s(test_sample_03)
```

只有`condition`中所有条件时满足时，命令作业`test_sample_04`才会被启动，即满足：

* 最近一次运行的`test_sample_01`的完成状态为`success`, 且完成时间在过去12小时内。
* 最近一次运行的`test_sample_02`的完成状态为`failure`, 且完成时间在过去24小时内。
小时。
* 最近一次运行`test_sample_03`为成功即可（对其结束时间没有限制，可以是任意时间）


回看条件的时间依赖的表示方法为` HH.MM` （HH为小时数，MM为分钟数) 


look-back condition还有有一种特殊用法:`condition : s(dep_job, 0)`。我们先定义一个cmd作业test_sample_05：

```shell
insert_job: test_sample_05
job_type: cmd
machine: localhost
command: sleep 10
condition: s(test_sample_04)
```

它只要检测到`test_sample_04`完成并具有`success`状态就会启动。

然后我们更新它的`condition`依赖条件：
```shell
update_job: test_sample_05
condition: s(test_sample_04, 0)
```
这里我们在`condition`中增加了回看条件依赖0，此时，autosys会先检测`test_sample_05`上一次的完成时间，比如昨天11点, 然后它会去检测`test_sample_05`所依赖的`test_sample_04`的完成时间，只有`test_sample_04`最后一次的完成时间在`test_sample_05`上一次的完成之间之后，新的`test_sample_05`才会被启动。
例如，上一次`test_sample_05`完成时间是11点，而最近一次`test_sample_04`的完成时间是昨天10点，则其条件不满足。再比如，最近一次`test_sample_04`的完成时间是昨天11点05分，晚于上一次`test_sample_05`完成时间(11点)，则其条件满足，`test_sample_05`会被启动。


## job 运行状态

* `INACTIVE`：	JOB 未运行
* `STARTING`：	JOB初始化中
* `RUNNING`：	JOB运行中
* `SUCCESS`：	JOB运行成功
* `FAILURE`：	JOB运行失败
* `TERMINATED`：	JOB 在running时被kill
* `RESTART	`:其它硬件或者应用问题导致的job需要被重启
* `QUE_WAIT	`:job达到启动条件，但由于其它原因导致暂时无法启动时的状态
* `ACTIVATED`:	适用于box job, 指box已经在`RUNNING`，但是job还未能启动
* `ON HOLD`：暂停
  1. 表示作业处于暂停状态，并且在我们将其取消Hold之前无法运行。
  2. 当作业处于ON `HOLD`状态时，所有依赖于此作业的作业都不会运行 (即作业的下游不会运行)。
  3. `ON_HOLD`的作业，如果在其`ON_HOLD`期间曾经满足过运行条件，那么当它收到`JOB_OFF_HOLD`后，该作业会被立即执行
  
* `ON ICE`：暂时删除	
  1. 表示作业已从作业流中删除，但定义仍然在 。该作业不会被启动， 它会保持`ON ICE`，直到它收到`JOB_OFF_ICE`命令时才能恢复运行
  2. 当作业状态为`ON ICE`时， 此作业将从所有condition中删除(定义仍然在，相当于判断condition时，跳过含有该作业的条件判断)。
  3. 当`ON_ICE`作业收到`JOB_OFF_ICE`时，就算它在`ON_ICE`期间满足过启动条件，作业也不会马上运行，需要等到条件再次满足才会运
  


## JIL语法

```shell
sub_command: job_name
attribute_keyword: value
```

* `sub_command`包含；
  * `insert_job`：增加一个新job
  * `insert_machine`：增加一个新machine
  * `update_job`：更新已存在的job
  * `delete_job`：从数据库删除job
  * `delete_box`：删除存在的box，包括所有在box里的job
  * `override_job`：覆盖job属性，下次运行时生效


job由许多不同属性构成, 最重要的三点:`when`, `where`, `if`

* `when `：指定开始时间，星期，　日历，watched file
* `where`：机器名，　指运行该job的机器
* `if `：运行条件，　SUCCESS

### 创建 Command Jobs

```shell
insert_job: XXXX_TES_RECON  job_type: c   
box_name: SG_TES_DATA_BX  
command: $SG_BIN_DIR/recon_dt.sh PAPRO SG  
machine: SG_TES_VM  
permission: gx,mx,me  
date_conditions: 1  
days_of_week: tu, we, th, fr, sa  
start_times: "05:00"  
condition: s(SG_TES_DATA_ROFILE)  
description: "genertate recon for ROFILE"  
std_out_file: $SG_TES_LOG_DIR/Autosys/$AUTO_JOB_NAME.out  
std_err_file: $SG_TES_LOG_DIR/Autosys/$AUTO_JOB_NAME.err  
alarm_if_fail: 1  
profile: /app/TES/SG/config/autosys.profile  
```

* 这个脚本将创建名为：XXXX_TES_RECON的job
* 运行时间： 每周二 至 周六 05：00启动，依赖条件 `SG_TES_DATA_ROFILE `SUCCESS
* 运行的机器：`SG_TES_VM`
* job 类型：`command`

### 创建 File Watcher Jobs

```shell
insert_job: XXXX_TES_UPD_LIST_WATCHER   job_type: f   
box_name: XXXX_TES_ID_BX  
machine: HK_TES_VM  
permission: gx,mx,me  
description: "File watcher for EEW data (UpdateList.csv)"  
term_run_time: 120  
watch_file: $SG_TES_INPUT_DIR/UpdateList.csv  
watch_interval: 60  
alarm_if_fail: 1  
profile: /app/TES/SG/config/autosys.profile  
```

### 创建Box Jobs

```shell
insert_job: XXXX_TES_ID_BX   job_type: b   
permission: gx,mx,me  
date_conditions: 1  
days_of_week: mo, tu, we, th, fr  
start_times: "22:30"  
condition: s(XXXX_DDD)  
description: "EOD job for update auth"  
alarm_if_fail: 1  
```

* job名：XXXX_TES_ID_BX
* 运行时间： 每周一 -- 周五 22:30启动，依赖条件 XXXX_DDD
* job 类型：b

## 注释

* 行备注， 采用#开始的整行
* 多行备注, 类似C语言， /*  xxxx  */

属性值带有冒号时， 应该是用转义字符`\`, 如`10:00 --> 10\:00`

## 命令

* 基本命令

```shell
sendevent -E FORCE_STARTJOB -J JobName
sendevent -E JOB_ON_ICE -J JobName
sendevent -E CHANGE_STATUS -s FAILURE -J JobName
sendevent -E CHANGE_STATUS -s SUCCESS -J JobName
```

* 管理job[创建、更新、删除]

```shell
jil < /path/JilFile.jil
```