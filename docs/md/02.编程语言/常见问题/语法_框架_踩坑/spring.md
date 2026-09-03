
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