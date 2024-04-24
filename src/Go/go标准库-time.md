---
title: Go Time
date: 2024-04-24
tags: 
 - Go
categories:
 - Go
---



# 时间函数基础

## Time结构体

time包封装了go所有的事件操作，其中time.Time结构体用于表示时间：

```GO
type Time struct {
    wall uint64
    ext  int64
    loc *Location
}
```

- wall：表示距离公元 1 年 1 月 1 日 00:00:00UTC 的秒数；
- ext：表示纳秒；
- loc：代表时区，主要处理偏移量，不同的时区，对应的时间不一样。



## 时间创建函数

### Demo:获取当前时间

```GO
	now := time.Now()
	fmt.Println("当前时间：", now)

	fmt.Println("当前时间戳:(秒)", now.Unix())
	fmt.Println("当前时间戳:(毫秒)", now.UnixMilli())
	fmt.Println("当前时间戳:(微秒)", now.UnixMicro())
	fmt.Println("当前时间戳:(纳秒)", now.UnixNano())
```

输出结果：

```GO
当前时间： 2023-12-24 09:49:18.2931769 +0800 CST m=+0.001933901
当前时间戳:(秒) 1703382558
当前时间戳:(毫秒) 1703382558293
当前时间戳:(纳秒) 1703382558293176900
当前时间戳:(微秒) 1703382558293176
```

### Demo：构造时间

```GO
	location, _ := time.LoadLocation("Asia/Shanghai")
	date := time.Date(2011, 12, 12, 12, 12, 12, 12, location)
	fmt.Println("直接构造时间：", date)

	unix := time.Unix(date.Unix(), 12)
	fmt.Println("时间戳构造：", unix)
```

输出结果：

```GO
直接构造时间： 2011-12-12 12:12:12.000000012 +0800 CST
时间戳构造： 2011-12-12 12:12:12.000000012 +0800 CST
```



### Demo: 查询时间相关的字段

```GO
	now := time.Now()

	fmt.Println("年：", now.Year())
	fmt.Println("月：", now.Month())
	fmt.Printf("月(数字)：%d \n", now.Month())
	fmt.Println("日：", now.Day())
	fmt.Println("时：", now.Hour())
	fmt.Println("分：", now.Minute())
	fmt.Println("秒：", now.Second())
	fmt.Println("星期：", now.Weekday())
	fmt.Println("一年中对应的第几天：", now.YearDay())
	fmt.Println("时区：", now.Location())
	fmt.Println("本地时区输出：", now.Local())
	fmt.Println("GoString时间格式输出：", now.GoString())
	fmt.Println("UTC时间格式输出：", now.UTC())

	year, month, day := now.Date()
	fmt.Printf("year = %v\n", year)
	fmt.Printf("month = %d\n", month)
	fmt.Printf("day = %v\n", day)
```

输出结果：

```GO
年： 2023
月： December
月(数字)：12
日： 24
时： 10
分： 3
秒： 23
星期： Sunday
一年中对应的第几天： 358
时区： Local
本地时区输出： 2023-12-24 10:03:23.2819162 +0800 CST
GoString时间格式输出： time.Date(2023, time.December, 24, 10, 3, 23, 281916200, time.Local)
UTC时间格式输出： 2023-12-24 02:03:23.2819162 +0000 UTC
year = 2023
month = 12
day = 24
```



## 时间转换函数

Go语言的格式化布局规则，比较特殊，**不是使用常规的 Y-m-d H:M:S，而是使用 2006-01-02 15:04:05.000**

**含义说明**：

- 2006：年（Y）
- 01：月（m）
- 02：日（d）
- 15：时（H）。若想表示12小时制则写为03，并且后面加上PM
- 04：分（M）
- 05：秒（S）
- 特殊：小数部分想保留指定位数就写0，如果想省略末尾可能的0就写 9

### 模式选项

| Type     | Options                                              |
| -------- | ---------------------------------------------------- |
| Year     | 06  2006                                             |
| Month    | 01  1  Jan  January                                  |
| Day      | 02  2  _2    (width two, right justified)            |
| Weekday  | Mon  Monday                                          |
| Hours    | 03  3  15                                            |
| Minutes  | 04  4                                                |
| Seconds  | 05  5                                                |
| ms μs ns | .000  .000000  .000000000                            |
| ms μs ns | .999  .999999  .999999999   (trailing zeros removed) |
| am/pm    | PM  pm                                               |
| Timezone | MST                                                  |
| Offset   | -0700  -07  -07:00  Z0700  Z07:00                    |

### Demo: 时间转字符串

```GO
	now := time.Now()
	fmt.Println(now.Format("2006-01-02 15:04:05"))
	fmt.Println(now.Format("2006-01-02"))
	fmt.Println(now.Format("15:04:05"))
	fmt.Println(now.Format("2006-01-02 15:04:05.000"))
	fmt.Println(now.Format("2006-01-02 15:04:05.999"))
	fmt.Println("带上时区：", now.Format("2006-01-02 15:04:05.999 -0700"))
	fmt.Println("带上星期：", now.Format("2006-01-02 15:04:05.999 Monday -0700"))
	fmt.Println("带上星期（简写）：", now.Format("2006-01-02 15:04:05.999 Mon -0700"))

	fmt.Println("12小时制格式：", now.Format("2006-01-02 03:04:05.999"))
	fmt.Println("12小时制格式(AM/PM)：", now.Format("2006-01-02 03PM:04:05.999"))
	fmt.Println("Month大写：", now.Format("2006-January-02 15:04:05"))
	fmt.Println("Month简写：", now.Format("2006-Jan-02 15:04:05"))

```

输出：

```GO
2023-12-24 10:23:34
2023-12-24
10:23:34
2023-12-24 10:23:34.701
2023-12-24 10:23:34.701
带上时区： 2023-12-24 10:23:34.701 +0800
带上星期： 2023-12-24 10:23:34.701 Sunday +0800
带上星期（简写）： 2023-12-24 10:23:34.701 Sun +0800
12小时制格式： 2023-12-24 10:23:34.701
12小时制格式(AM/PM)： 2023-12-24 10AM:23:34.701
Month大写： 2023-December-24 10:23:34
Month简写： 2023-Dec-24 10:23:34
```

### Demo: 字符串转换成时间

```GO
	location, _ := time.LoadLocation("Asia/Shanghai")

	str := "2011-12-12 12:12:12"
	parse, _ := time.Parse("2006-01-02 15:04:05", str)
	fmt.Println("不带时区转换，默认使用UTC", parse)

	inLocation, _ := time.ParseInLocation("2006-01-02 15:04:05", str, location)
	fmt.Println("带时区转换", inLocation)
```

输出：

`````go
不带时区转换，默认使用UTC 2011-12-12 12:12:12 +0000 UTC
带时区转换 2011-12-12 12:12:12 +0800 CST
`````

## 时间计算函数

讲到日期的计算就不得不提 time 包提供的一种新的类型 Duration，源码是这样定义的：

```text
type Duration int64
```

底层类型是 int64，表示一段时间间隔，单位是 纳秒。



### Demo: 时间间隔计算

```go
	now := time.Now()
	fmt.Println("当前时间：", now)
	duration, _ := time.ParseDuration("1h0m0s")
	duration2, _ := time.ParseDuration("-1h0m0s")
	after := now.Add(duration)
	before := now.Add(duration2)
	fmt.Println("计算后时间：", after)
	fmt.Println("计算后时间：", before)
```

输出结果：

```go
当前时间： 2023-12-24 10:45:46.5057654 +0800 CST m=+0.002203801
计算后时间： 2023-12-24 11:45:46.5057654 +0800 CST m=+3600.002203801
计算后时间： 2023-12-24 09:45:46.5057654 +0800 CST m=-3599.997796199
```



### Demo: 时间间隔计数

```go
	now := time.Now()
	time.Sleep(1 * time.Second)
	duration := time.Since(now)
	fmt.Println("过去了多长时间：", duration.String())
	until := time.Until(time.Date(now.Year(), now.Month(), now.Day(), 23, 0, 0, 0, now.Location()))
	fmt.Println("还剩多长时间：", until.String())
```

输出：

```go
过去了多长时间： 1.0037178s
还剩多长时间： 12h7m13.8212262s
```



## 时间比较函数

```go
// 如果 t 代表的时间点在 u 之前，返回真；否则返回假。
func (t Time) Before(u Time) bool

// 如果 t 代表的时间点在 u 之后，返回真；否则返回假。
func (t Time) After(u Time) bool

// 比较时间是否相等，相等返回真；否则返回假。
func (t Time) Equal(u Time) bool
```



## 时区函数

默认使用本地时区,可以使用os包设置**环境变量TZ**更改时区.注意：

1.该设置一定要在time包使用之前，否则无效；

2.依赖当前系统的时区数据库，有则可以加载一个位置得到对应的时区，无则兜底使用UTC

例如下面的代码，时区根本没有发生变更：

```go
	now := time.Now()
	fmt.Println(now)
	os.Setenv("TZ", "America/New_York")
	now = time.Now()
	fmt.Println(now)
```

依赖当前系统的时区数据库，有则可以加载一个位置得到对应的时区，无则会返回一个error

```go
func main() {
  loc, err := time.LoadLocation("Asia/Shanghai")
  if err != nil {
    fmt.Println("LoadLocation error: " + err.Error())
    return
  }
  fmt.Println(time.Now().In(loc))
  fmt.Println(time.Now().In(loc).Location())
}
```

# 高级用法

## 定时器

使用`time.Tick(时间间隔)`来设置定时器，定时器的本质上是一个通道（channel）。可用于处理定时执行的任务

```go

```



## time.Sleep

