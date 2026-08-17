









jackson:

1. http 响应格式不标准时通过类字段注解JsonDeserializer<LocalDateTime>过于繁琐
2. 序列化数字类型时超过Js最大 和 科学计数法
   1. WRITE_BIGDECIMAL_AS_PLAIN
   2. ToStringSerializer.class

feign:

1. 非Nacos集群内也许它不合适
2. 拦截器 RequestHeader
3. @FeignClient(configuration=xx.Class) 的 xx 不需要@Configuration
4. Gzip 会引起莫名其妙的问题, 直接关闭
5. default 超时不能通过命令参数覆盖, 也不能通过代码覆盖, 命名的就可以

```yaml
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

oss:

1. minio-client
2. s3?

Mybatis-Plus

1. MetaObjectHandler
2. mapper.xml
3. Page
4. mpj join
5. 事务性
6. 日志和调试

WebMvcConfigurer

1. addCorsMappings

Controller:

1. 注解
2. MultipartProperties

Jobs:

com.aesc.ess.gate.service.impl.ProjectFatJobRunner

Lombok:

1. @Builder
2. 

Utils:

1. Beans Springs





1. nacos
2. 基类型和封装类型
3. 线程池
4. mbp
5. postgreSQL Partition问题
6. 线程同步
7. Future





鉴权

doc

pageQuery TableInfoBuild

mpbj





1. mybatis-plus java8 最高是3.5.7，虽然有3.5.8+的兼容方案但是似乎并不太合适；3.5.3.2是一个特殊版本，之后包含了大量了Utils丢失，并且这个版本mapper没有批量操作。

