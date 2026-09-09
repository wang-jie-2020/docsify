1. mybatis-plus java8 最高是3.5.7，虽然有3.5.8+的兼容方案但是似乎并不太合适；3.5.3.2是一个特殊版本，之后包含了大量了Utils丢失，并且这个版本mapper没有批量操作。
2. Python uvicorn 项目在Pycharm调试配置

![img](https://raw.gitcode.com/qq_36179938/images/raw/main/1780895497938-2fba53ff-c024-4b98-9720-2fbcd0aa0ded.png)

1. feign中的default 超时配置无法通过命令行参数覆盖，只能修改nacos；但是如果是具名的client就可以覆盖

feign.client.config.default.read-timeout no

feign.client.config.xxx.read-timeout  yes





1. 前端工程里的 monorepo 指的是：把多个前端项目、组件库、工具库等放在同一个 Git 仓库里统一管理。

它的全称是 monolithic repository，中文常叫“单仓库”或“多项目单仓库”。

1. Maven Wrapper（mvnw、mvnw.cmd），项目中固定并自动使用指定版本的 Maven

问题记录：Feign 配置的超时时间

（1）代码中 FeignClient 的 Configuration.Class 无效，但是 LogLevel 生效

（2）通过覆盖 nacos 中的 default 配置解决问题





1. 前端工程里的 monorepo 指的是：把多个前端项目、组件库、工具库等放在同一个 Git 仓库里统一管理。

它的全称是 monolithic repository，中文常叫“单仓库”或“多项目单仓库”。

1. Maven Wrapper（mvnw、mvnw.cmd），项目中固定并自动使用指定版本的 Maven
2. 问题记录：Feign 配置的超时时间

（1）代码中 FeignClient 的 Configuration.Class 无效，但是 LogLevel 生效

（2）通过覆盖 nacos 中的 default 配置解决问题

```yml
feign:
  client:
    config:
      default:
        connectTimeout: 100000
        readTimeout: 600000
  compression:
    request:
      enabled: false    # 关闭请求压缩
    response:
      enabled: false    # 关闭响应压缩
```

