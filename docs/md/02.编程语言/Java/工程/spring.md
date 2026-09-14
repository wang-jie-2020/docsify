## 项目骨架

1. 包的结构、pom依赖、Maven的原理
2. 日志、配置
3. 运行环境切换?
4. api (Swagger / OpenAPI)
5. 全局包装、全局异常
6. 参数校验
7. Mybatis
8. RBAC认证、鉴权
9. 密码加密
10. 当前用户上下文
11. 文件上传 / 下载
12. Excel 导入 / 导出，EasyExcel 或类似工具
13. 拦截器 / 过滤器
14. 树形结构处理（递归 / 树结构组装）
15. Redis 缓存
16. AOP日志





## Java Spring

1. ApplicationContext: 直接通过注解ApplicationContext类型 或者 实现 ApplicationContextAware接口

2. 配置文件加载的优先级（由高到低）

   bootstrap.properties

   bootstrap.yml

   application.properties

   application.yml

3. 测试时指定参数

```java
@SpringBootTest(classes = ConfigurationExampleApplication.class, 
                properties = {"--mail.enabled=true","--spring.profiles.active=dev,extra"})
```

4. 注释中的链接 {@link SensitiveJsonSerializer}

5. @Import 注解

   src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports

6. springboot2.6 + swagger, spring.mvc.pathmatch.strategy=*ant_path_matcher*

7. Lombok @RequiredArgsConstructor

8. HttpContext

```java
// 通过请求参数中获取 Request 对象；  
public void index(HttpServletRequest request) { }	

// 通过 RequestContextHolder 获取 Request 对象；
ServletRequestAttributes servletRequestAttributes = (ServletRequestAttributes)RequestContextHolder.getRequestAttributes();
HttpServletRequest request = servletRequestAttributes.getRequest();

// 通过自动注入获取 Request 对象;
@Autowired
private HttpServletRequest request; // 自动注入 request 对象
```



## Java Spring Cloud

1. 配置刷新 @RefreshScope

2. 服务注册 spring.cloud.nacos.discovery.register-enabled=false

3. mbp配置在naocs时, 本地控制日志输出

   --mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.slf4j.Slf4jImpl

4. Feign-APPLICATION_FORM_URLENCODED_VALUE 由 MultiValueMap 生成比较好

5. Fiegn-APPLICATION_FORM_URLENCODED_VALUE & @RequestParam 虽然也是body形式但是仍旧会被截断

6. Fiegn-JSON & 请求压缩时会有非法字符错误

   https://blog.csdn.net/qq_33286757/article/details/147768083 





1. mybatis-plus java8 最高是3.5.7，虽然有3.5.8+的兼容方案但是似乎并不太合适；3.5.3.2是一个特殊版本，之后包含了大量了Utils丢失，并且这个版本mapper没有批量操作。

   

1. feign中的default 超时配置无法通过命令行参数覆盖，只能修改nacos；但是如果是具名的client就可以覆盖

feign.client.config.default.read-timeout no

feign.client.config.xxx.read-timeout  yes



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



