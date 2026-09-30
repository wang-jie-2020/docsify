## 项目结构

### 运行环境

1. IDEA: 项目结构-项目/模块 - 语言
2. 建议JAVA_HOME满足最低要求, 否则AGENT运行测试(MVN命令)运行频繁错误
3. Maven(settings.xml) - `<mirrorOf>central</mirrorOf>`
4. Nacos > 运行参数 > application-{profile} > bootstrap-{profile} > default

### 项目配置

1. jackson
   1. 日期格式/js精度/科学计数
   2. 定制序列化
   3. Mixin
2. mvc
   1. MvcConfig: 本地存储 & 拦截器 & 国际化
   2. 本地存储: `MultipartFile` & `spring.servlet.multipart.max-file-size|max-request-size`
   3. 语言国际化: `spring.messages.basename: i18n/messages` & `LocaleResolver`
   4. 线程池
   5. LogAspect

### 常见场景

#### POM

1. SYSTEM SCOPE指本地依赖 - `<systemPath>${project.basedir}/lib/faliure_pre.jar</systemPath>`

#### 静态文件访问

1. classpath: ClassUtils.getDefaultClassLoader(), 类似的ResourceUtils、ClassPathResource
2. classpath的以下路径直接暴露: `/static`、`/public`、`/resources`、`/META-INF/resources`

#### Bean

1. @Import 和 META-INF/spring.factories

2. Bean实例过程顺序

   构造函数 -> BeanPostProcessor(Before) -> 

   @PostConstruct -> InitializingBean.afterPropertiesSet() -> BeanPostProcessor(After)

#### 上下文

1. 线程上下文: ThreadLocal、InheritableThreadLocal、TransmittableThreadLocal(类似AsyncLocal)

2. 请求上下文: `RequestContextHolder.getRequestAttributes()`
3. `RequestMappingHandlerMapping`

#### 线程池

1. `@EnableAsync`、`@Async`的默认实现有aop约束

#### Api


1. 全局异常 `@ControllerAdvice`

2. 参数校验 `@Validated`

3. 参数绑定

   1. 单字段无注解时 = @RequestParam(required = false)

   2. 对象无注解时 = 平铺, 有@RequestParam注解时, 错误

   3. @RequestParam 大小写敏感

   4. @RequestParam 范围是 查询参数 / x-form请求体 / form参数

      (1) 避免同名参数, `@RequestBody`、`@RequestPart("file")`可以指定绑定来源

      (2) 最大长度

4. 代理的*forward*: `server.forward-headers-strategy: framework`

## MYBATIS

1. *jdbc、jdbcTemplate、transactionTemplate、SqlSession*

2. *plus 3.x均支持jdk 8, jsqlparser5最低要求11; 故额外添`jsqlparser-4.9`(以往捆绑在一起,之后拆了)*

3. 日志: `--mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.slf4j.Slf4jImpl`













## TODO

1. 租户插件  游标  拦截
2. ==字段绑定(默认值), 对象绑定==
3. ==非默认路径文件==: `@PropertySource(value = "classpath:extra.properties")`, XML格式 `@ImportResource`

3. 多阶段配置? 
4. MD5加盐
5. jasypt
6. jwt 令牌
7. EXCEL
8. kafka / rabbitmq / rocketmq
9. 语言国际化是否可以转到DB
10. Redis/Redisession
11. http请求帮助
12. nacos`@RefreshScope` 真动态?

10. spring.cloud.nacos.discovery.register-enabled=false

1. FEIGN

   1. Feign-APPLICATION_FORM_URLENCODED_VALUE 由 MultiValueMap 生成比较好

   2. 请求压缩时会有非法字符错误, https://blog.csdn.net/qq_33286757/article/details/147768083 

   3. default 超时配置无法通过命令行参数覆盖，只能修改nacos；但是如果是具名的client就可以覆盖

      feign.client.config.default.read-timeout no

      feign.client.config.xxx.read-timeout  yes

      Feign 配置的超时时间, 代码中 FeignClient 的 Configuration.Class 无效，但是 LogLevel 生效, 通过覆盖 nacos 中的 default 配置解决问题

