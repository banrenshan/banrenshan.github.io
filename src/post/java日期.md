---
title: Java 日期 API
date: 2024-04-24
categories:
  - java
tags:
  - java
  - 日期API 
---

## Instant

表示精确的时间点,由从`1970-1-1 00:00:00`到现在的秒数和偏移该秒数的毫秒数组成.

## Duration

Duration对象表示两个时间点之间的距离

## Period

表示两个日期之间的距离

## LocalDate

LocalDate 表示像 2017-01-01 这样的日期。它包含有年份、月份、当月天数，它不不包含一天中的时间，以及时区信息

## 日期校正器TemporalAdjuster

如果想找到某个月的第一个周五，或是某个月的最后一天，像这样的日期就可以使用TemporalAdjuster来进行日期调整。

```java
//2017-02-03的下一个星期五(包含当天)  2017-03-03
LocalDate.of(2017, 2, 3).with(TemporalAdjusters.nextOrSame(DayOfWeek.FRIDAY));
//2017-02-03的下一个星期五(不包含当天)  2017-02-10
LocalDate.of(2017, 2, 3).with(TemporalAdjusters.next(DayOfWeek.FRIDAY));
//2月中的第3个星期五  2017-02-17
LocalDate.of(2017, 2, 3).with(TemporalAdjusters.dayOfWeekInMonth(3, DayOfWeek.FRIDAY));
//2月中的最后一个星期五  2017-02-24
LocalDate.of(2017, 2, 3).with(TemporalAdjusters.lastInMonth(DayOfWeek.FRIDAY));
//下个月的第一天
LocalDate.of(2017, 2, 3).with(TemporalAdjusters.firstDayOfNextMonth());
```

## LocalTime

LocalTime表示一天中的某个时间，例如18:00:00。LocaTime与LocalDate类似，他们也有相似的API。

## LocalDateTime

LocalDateTime表示一个日期和时间，它适合用来存储确定时区的某个时间点。不适合跨时区的问题。

## ZonedDateTime

包含时区信息,格式是`2017-01-20T17:35:20.885+08:00[Asia/Shanghai]` .创建时区时间

```java
//2017-01-20T17:35:20.885+08:00[Asia/Shanghai]
ZonedDateTime.now();
//2017-01-01T12:00+08:00[Asia/Shanghai]
ZonedDateTime.of(2017, 1, 1, 12, 0, 0, 0, ZoneId.of("Asia/Shanghai"));
//使用一个准确的时间点来创建ZonedDateTime，下面这个代码会得到当前的UTC时间，会比北京时间早8个小时
ZonedDateTime.ofInstant(Instant.now(), ZoneId.of("UTC"));
```

## DateTimeFormatter

`DateTimeFormatter`使用了三种格式化方法来打印日期和时间

预定义的标准格式

```java
//2017-01-01
DateTimeFormatter.ISO_LOCAL_DATE.format(LocalDate.of(2017, 1, 1))
//20170101
DateTimeFormatter.BASIC_ISO_DATE.format(LocalDate.of(2017, 1, 1));
//2017-01-01T09:10:00
DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(LocalDateTime.of(2017, 1, 1, 9, 10, 0));
```

语言环境相关的格式化风格

```java
//2017年1月1日 星期日
DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL).format(LocalDate.of(2017, 1, 1));
//上午09时10分00秒
DateTimeFormatter.ofLocalizedTime(FormatStyle.LONG).format(LocalTime.of(9, 10, 0));
//2017-2-27 22:32:03
DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).format(LocalDateTime.now());
```

上面的方法都使用的是默认的语言环境，如果想改语言环境，需要使用withLocale方法来改变。

```java
DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM).withLocale(Locale.US).format(LocalDateTime.now());
```

使用自定义模式格式化

```java
//2017-02-27 22:48:52
DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(LocalDateTime.now())
```