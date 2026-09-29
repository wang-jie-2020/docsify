## 项目结构

### 1. 运行环境

1. IDEA中的 项目结构-项目/模块 的语言级别
2. 未配JAVA_HOME时, AGENT运行测试(MVN命令)运行错误, 推荐JAVA_HOME满足最低要求(目前是8)
3. Maven(settings.xml) 配置时注意`<mirrorOf>central</mirrorOf>`
3. `mvnw`、`mvnw.cmd` = bash/cmd 脚本, 下载/安装 Maven
5. pom中指定SYSTEM SCOPE指本地依赖, 示例: `<systemPath>${project.basedir}/lib/faliure_pre.jar</systemPath>``
6. `maven-compiler-plugin` + `spring-boot-maven-plugin`

### 2. 配置

1. *Nacos > 运行参数 > application-{profile} > bootstrap-{profile} > default*

2. 到配置类前缀绑定对象: `@ConfigurationProperties(prefix = "")`

3. 附加读非默认路径文件: `@PropertySource(value = "classpath:extra.properties")`, XML格式 `@ImportResource`

4. 环境(spring.profiles)

   `spring.profiles.active` / `spring.config.activate.on-profile` / `@Profile("dev")`

5. 条件(@condition)

## mvc

1. 终结点
   1. 常见注解, @RestController
   2. @Controller @ResponseBody / ResponseEntity
   3. HttpServlet 对象直接操作


2. 参数绑定
   1. 单字段无注解时 = @RequestParam(required = false)
   2. 对象无注解时 = 平铺, 有@RequestParam注解时, 错误
   4. @RequestParam 大小写敏感
   5. @RequestParam 范围是 查询参数 / x-form请求体 / form参数
      1. 避免同名参数, `@RequestBody`、`@RequestPart("file")`可以指定绑定来源
      2. 有最大长度
   
3. 全局异常 `@ControllerAdvice`

4. 参数校验 `@Validated`

5. JSON
   1. 默认Jackson(jsr310、默认配置)
   2. 推荐`Jackson2ObjectMapperBuilderCustomizer`定制项目个性化, `MappingJackson2HttpMessageConverter`和`ObjectMapper`的重写会覆盖掉框架默认值
   3. 日期、JS精度、科学计数
   4. 枚举默认name, 但通常需`@JsonValue`指定到状态位
5. 注解MixIn不能操作到基本类型
   
6. 上下文

   (1) Bean的构造过程是: BeanDefinition -> BeanRegistry -> BeanFactory -> BeanInstance 
   
   (2) 实例Bean时的顺序:

​		构造函数 -> 

​		BeanPostProcessor(Before) -> 

​			@PostConstruct -> 

​			InitializingBean.afterPropertiesSet() ->

​		BeanPostProcessor(After)

​	(2) 线程上下文: ThreadLocal、InheritableThreadLocal、TransmittableThreadLocal(类似AsyncLocal)

​	(3) 请求上下文: `RequestContextHolder.getRequestAttributes()`

7. 静态资源

   (1) ClassUtils.getDefaultClassLoader()`  -> classpath, 类似的 `ResourceUtils`、`ClassPathResource

   (2) classpath的以下路径可直接访问: `/static`、`/public`、`/resources`、`/META-INF/resources`

   (3) 其他物理路径的mapping(比如本地OSS): `WebMvcConfigurer.addResourceHandlers()`

8. Oss

   (1) `MultipartFile`, 注意`spring.servlet.multipart.max-file-size` `spring.servlet.multipart.max-request-size`配置

   (2) 代理的转发头兼容, 通常 `server.forward-headers-strategy: framework`

9. 线程池 / Async

   (1) `@EnableAsync`、`@Async`: aop约束条件

   (2) `TaskExecutor` 配置默认实现`ThreadPoolTaskExecutor`(注意名称Task)

   (3) 池大小、队列类型&长度、拒绝策略等等

   (4) 短耗时的异步操作(例如`CompletableFuture`)、长期后台执行的任务是考虑范围, 周期性操作转移走合适

10. 过滤器、拦截器

11. 国际化

    1. Instant、OffsetDateTime
    2. LocalDateTime
    3. ZoneDateTime 不是能够保存的形式

## MYBATIS

*jdbc、jdbcTemplate、transactionTemplate、SqlSession*

*plus 3.x均支持jdk 8, jsqlparser5最低要求11; 故额外添`jsqlparser-4.9`(以往捆绑在一起,之后拆了)*

## 常见场景和包

MD5加盐、jasypt

jwt 令牌

EXCEL

kafka / rabbitmq / rocketmq

## CLOUD

1. nacos

   `@RefreshScope` 真动态?

   spring.cloud.nacos.discovery.register-enabled=false

## 实践和问题

1. 注释链接 `{@link SensitiveJsonSerializer}`

2. `@Builder` 配合空构造函数避免MyBatis无法输出

3. MyBatis日志 `--mybatis-plus.configuration.log-impl=org.apache.ibatis.logging.slf4j.Slf4jImpl`

4. @Import 和 META-INF/spring.factories

5. FEIGN

   1. Feign-APPLICATION_FORM_URLENCODED_VALUE 由 MultiValueMap 生成比较好

   2. 请求压缩时会有非法字符错误, https://blog.csdn.net/qq_33286757/article/details/147768083 

   3. default 超时配置无法通过命令行参数覆盖，只能修改nacos；但是如果是具名的client就可以覆盖

      feign.client.config.default.read-timeout no

      feign.client.config.xxx.read-timeout  yes

      Feign 配置的超时时间, 代码中 FeignClient 的 Configuration.Class 无效，但是 LogLevel 生效, 通过覆盖 nacos 中的 default 配置解决问题

9. 如果想查有哪些拦截器注册, 不可以通过InterceptorRegistry.class的bean去找, 它在mvc配置完成之后就被丢弃. 正确的做法是RequestMappingHandlerMapping

10. 默认 LocaleChangeInterceptor 是未注册的, 可以通过它去init一个, 或者做一个LocaleResolver的bean



