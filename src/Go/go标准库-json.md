---
title: Go Json
date: 2024-04-24
tags: 
 - Go
categories:
 - Go
---



Go语言内建对 JSON 的支持，使用内置的 encoding/json 标准库，开发人员可以轻松使用Go程序生成和解析 JSON 格式的数据。

# 序列化

将Go对象编码为JSON格式被称为marshaling。我们可以使用`Marshal` 函数来将 Go 对象转换为 JSON。`Marshal` 函数的语法如下:

```GO
func Marshal(v interface{}) ([]byte, error)
```

### Demo：结构体转换成Json字符串

```GO
	list := []User{
		{"zz1", 12, []string{"a1", "a2"}},
		{"zz2", 13, []string{"aa1", "aa2"}},
	}
	bytes, _ := json.Marshal(list)
	fmt.Println(string(bytes))
```

### Demo: map 转换成json字符串

```GO
	m := map[string]interface{}{"name": "zzq", "age": 23}
	marshal, _ := json.Marshal(m)
	fmt.Println(string(marshal))
```

### Demo: 格式化输出

```GO
	m := map[string]interface{}{"name": "zzq", "age": 23}
	marshal, _ := json.MarshalIndent(m, "", "\t")
	fmt.Println(string(marshal))
```

### Demo：将对象序列化到json文件中

```GO
package zzq

import (
	"encoding/json"
	"fmt"
	"os"
)

type User struct {
	Name string
	Age  int
	Addr []string
}

func Testout() {
	filePtr, err := os.Create("info.json")
	if err != nil {
		fmt.Println("文件创建失败", err.Error())
		return
	}
	defer filePtr.Close()

	list := []User{
		{"zz1", 12, []string{"a1", "a2"}},
		{"zz2", 13, []string{"aa1", "aa2"}},
	}

	encoder := json.NewEncoder(filePtr)
	encoder.Encode(list)
}

```

输出的JSON格式：

```GO
[
  {
    "Name": "zz1",
    "Age": 12,
    "Addr": [
      "a1",
      "a2"
    ]
  },
  {
    "Name": "zz2",
    "Age": 13,
    "Addr": [
      "aa1",
      "aa2"
    ]
  }
]

```

## tags

上面的json中，所有的key都是大写开头的，我们想在不修改代码的情况下，转换成小写，应该怎么办呢？这就是标签所做的事情。

修改上面的结构体：

```GO
type User struct {
	Name string   `json:"name,omitempty"`
	Age  int      `json:"age,omitempty"`
	Addr []string `json:"addr,omitempty"`
}
```

> 如果我们使用`json:"-"` 作为标签，相关的结构字段将不会被用于编码。另外，如果我们在结构标签名称字符串中使用`,omitempty` ，如果相关字段的值为空，则不会被用于编码。

## 自定义序列化的过程

Go json包非常灵活，它提供了覆盖编码和解码过程的功能。

demo： 我们使用自定义序列化，隐藏user的addr信息，使用`**`代替结果输出。

只需要对应的结构体实现`MarshalJSON`接口，例如：

```GO
func (u *User) MarshalJSON() ([]byte, error) {
	type UserAlias User           // 创建User 别名
	return json.Marshal(&struct { // 匿名结构体
		*UserAlias
		Addr []string `json:"addr"`
	}{ // 实例化结构体
		UserAlias: (*UserAlias)(u),
		Addr:      []string{strings.Repeat("*", 4)},
	})
}
```



# 反序列化

在Go环境中，JSON文档的解码过程被称为unmarshaling。我们可以使用`Unmarshal` 函数来将JSON转换为Go对象。`Unmarshal` 函数的语法如下：

```GO
func Unmarshal(data []byte, v interface{}) error
```

### Demo: json转换成结构体

```GO
	j := `
		{
				"age": 23,
				"name": "zzq"
		}
     `
	var user User
	json.Unmarshal([]byte(j), &user)
	fmt.Println(user)
```

### Demo: json转换成map

```GO
	j := `
		{
				"age": 23,
				"name": "zzq"
		}
     `
	var user map[string]interface{}
	json.Unmarshal([]byte(j), &user)
	fmt.Println(user)
```

### demo: 文件json转换成结构体

```GO
func TestIn() {
	open, _ := os.Open("info.json")
	decoder := json.NewDecoder(open)
	var user []User
	decoder.Decode(&user)
	fmt.Println(user)
}
```



## 自定义反序列化

反序列化user的时候，age加1

```GO
func (u *User) UnmarshalJSON(data []byte) error {
	type UserAlias User
	s := struct { // 匿名结构体
		*UserAlias
		Age int `json:"age"`
	}{ // 实例化结构体
		UserAlias: (*UserAlias)(u),
	}

	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	u.Age = s.Age + 10
	return nil
}
```

