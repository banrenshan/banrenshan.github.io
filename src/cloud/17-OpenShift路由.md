---
title: OpenShift 路由
date: 2024-04-20
categories:
  - OpenShift
  - kubernates 
tags:
  - OpenShift 
---

##  配置

### 超时设置

`haproxy.router.openshift.io/timeout`: 设定超时时间

### cookie设置 

`haproxy.router.openshift.io/disable_cookies`:是否禁用cookie

`router.openshift.io/cookie_name`: 指定cookie的名称

`router.openshift.io/cookie-same-site`：数值是：

  - `Lax`：cookies 在访问的站点和第三方站点间进行传输。
  - `Strict`：cookies 仅限于访问的站点。
  - `None`：cookies 仅限于指定的站点。

### 连接限制

- `haproxy.router.openshift.io/pod-concurrent-connections`:设置路由支持的 pod 允许的最大连接数。如果有多个 pod，每个 pod 都有这些数量的连接。如果有多个路由器，它们之间没有协调关系，每个路由器都可能会多次连接。如果没有设置，或者将其设定为 0，则没有限制。
- `haproxy.router.openshift.io/rate-limit-connections`: 是否启用速率限制
- `haproxy.router.openshift.io/rate-limit-connections.concurrent-tcp`:限制通过同一源 IP 地址进行的并发 TCP 连接数。
- 流量限制:

  - `haproxy.router.openshift.io/rate-limit-connections.rate-http`:限制具有相同源 IP 地址的客户端可以发出 HTTP 请求的速率。
  - `haproxy.router.openshift.io/rate-limit-connections.rate-tcp`:限制具有相同源 IP 地址的客户端可以进行 TCP 连接的速率。

### ip限制 

`haproxy.router.openshift.io/ip_whitelist`: 为路由设置允许列表。允许列表（allowlist）是以空格分开的 IP 地址和 CIDR 范围列表，用来代表批准的源地址。不是来自允许列表中的 IP 地址的请求会被丢弃。

### 其他设置 

`router.openshift.io/haproxy.health.check.interval`:为后端健康检查设定间隔。

### 路径重写

`haproxy.router.openshift.io/rewrite-target`: 在后端中设置请求的重写路径。



## 安全路由

不支持保护密钥文件。要从密钥文件中删除密码，使用以下命令：

```
openssl rsa -in password_protected_tls.key -out tls.key
```

安全路由分为下面三种：

- `reencrypt`：是 edge 的一种变种。首先 router 上会使用一个证书做 TLS 终结，然后使用另外的证书再进行加密，然后发给后端 pod。因此，整个网络路径都是加密的。因此需要配置两个证书

 ```
 oc create route reencrypt --service=frontend --cert=tls.crt --key=tls.key --dest-ca-cert=destca.crt --ca-cert=ca.crt --hostname=www.example.com
 ```

- `edge`：TLS 在 router 上被终结，然后非SSL网络包被转发给后端 pod。因此需要在 router 上安装 TLS 证书。不安装的话，会使用 router 的默认证书。只需要配置一个证书。

- `passthrough `：加密网络包直接被发给 pod，router 上不做TLS 终结，因为不需要在 router 上配置证书或密钥。





