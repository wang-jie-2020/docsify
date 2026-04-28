# 微服务

## Nacos

GitHub 上的 README：[Nacos-Config](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-config) [Nacos-Discovery](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-discovery)

### Config

配置文件默认三个而不是 wiki 中的两个，当然 `${spring.application.name}` 不必要：

1. `${spring.application.name}`
2. `${spring.application.name}.${file-extension:properties}`
3. `${spring.application.name}-${profile}.${file-extension:properties}`

(1) 本地目录中 bootstrap 是基础设施配置，不考虑顺序之类的问题；程序配置的优先级理所当然的是 REMOTE > LOCAL，想不到有例外场景。

(2) 配置 Refresh（非 CLOUD 下不再尝试了，意义不大）：

- `@RefreshScope` 注解，Target 是 TYPE 或 METHOD，如果是 FIELD 放在 TYPE 下就行
- `@Component` 中再 `@RefreshScope` 是不对的

### Discovery

(1) `register-enabled` 在本地代码调试时 FALSE，不影响部署结构节点（网关会转发请求）

(2) `ip`、`port` 实例服务的终结点，部署时若是容器必要修改

---

## Gateway

### 一、Route

路由包含 ID、目标 URI、谓词集合和过滤器集合。谓词可以理解成匹配 HTTP 请求任何内容的名词。

路由示例：

```yaml
- id: xxx
  uri: xxx
  predicates:
    - Path=/system/**
  filters:
    - StripPrefix=1
```

请求 URL 中满足 PATH 匹配条件的，经过 StripPrefix 过滤（1 指的是网页分段 index，比如 /system/user 即请求 uri /user）。

#### (1) Route Predicate

built-in route predicate factories：

```yaml
Datetime       - After=2021-02-23T14:20:00.000+08:00[Asia/Shanghai]   Before、Between
Cookie         - Cookie=loginname, ruoyi
Header         - Header=X-Request-Id, \d+
Host           - Host=**.somehost.org,**.anotherhost.org
Method         - Method=GET,POST
Path           - Path=/system/**
Query          - Query=username, abc.
RemoteAddr     - RemoteAddr=192.168.10.1/0
Weight         - Weight=group1, 2
XForwardedRemoteAddr - XForwardedRemoteAddr=192.168.1.1/24
```

Custom-Predicate：[AbstractRoutePredicateFactory](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#developer-guide)

#### (2) Route Filter

built-in route filter factories：

```yaml
# GatewayFilter
CircuitBreaker        - 熔断降级
CacheRequestBody      - 缓存请求体
RequestRateLimiter    - 限流
StripPrefix           - 路径裁剪，类似 Nginx 的 Location
SetPath               - 路径重写，与 StripPrefix 类似
AddRequestHeader      - 添加请求头
AddResponseHeader     - 添加响应头
DedupeResponseHeader  - 响应头去重
Retry                 - 重试
```

范围上全局过滤器、特定过滤器，函数签名类似，`AbstractGatewayFilterFactory` vs `GlobalFilter`。

参考：
- https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#writing-custom-gatewayfilter-factories
- https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#writing-custom-global-filters

在 Pre、Post 两个阶段进行过滤：

```java
@Override
public GatewayFilter apply(Config config) {
    return (exchange, chain) -> {
        // custom pre-processing
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            // custom post-processing
        }));
    };
}
```

#### (3) Custom-Route

(1) `RouteLocator` + `RouteDefinitionLocator` 进行路由自定义，如果已经有配置中心集成此处意义不大

(2) `RouterFunction` 不是 Gateway 包下的，效果能够理解但其 API 还是不熟悉的

#### (4) ExceptionHandler

实现 `ErrorWebExceptionHandler` 进行全局处理，但注意这只是网关异常处理，服务异常仍旧需要自行处理。

### 二、实践问题

#### (1) 有些包装需要了解

```java
ServerWebExchange exchange;

// 写响应
DataBuffer dataBuffer = response.bufferFactory()
    .wrap(JSON.toJSONString(result).getBytes());
exchange.getResponse().writeWith(Mono.just(dataBuffer));

// 读请求路径
exchange.getRequest().getURI().getPath();

// 修改请求头
ServerHttpRequest request = exchange.getRequest();
ServerHttpRequest.Builder mutate = request.mutate();
return chain.filter(exchange.mutate().request(mutate.build()).build());
```

#### (2) Request、Response 的修改

Response 似乎关系不大，`exchange.getResponse()` 可以直接进行。

Request 的读（Body）和写有限制：

```java
ServerHttpRequest request = exchange.getRequest();   // header 可读，不写
ServerHttpRequest.Builder mutate = request.mutate();  // 通过 Builder 修改
return chain.filter(exchange.mutate().request(mutate.build()).build());
```

读取 Body 需要用 `CacheRequestBody` 过滤器缓存。

#### (3) 熔断降级 CircuitBreaker

`spring-cloud-starter-circuitbreaker-reactor-resilience4j`

框架选型对比：

| 维度 | Hystrix | Sentinel | Resilience4j |
|------|---------|----------|--------------|
| 状态 | ❌ 停止更新 | ✅ 持续更新 | ✅ 持续更新 |
| 流量控制 | ❌ 仅基础隔离 | ✅ QPS/并发/热点/集群流控 | ✅ RateLimiter |
| 隔离策略 | 线程池（开销大）/ 信号量 | 并发线程数 | 信号量 / Bulkhead |
| 动态配置 | ❌ 依赖 Archaius | ✅ 控制台实时推送 | ✅ 需编码实现 |
| 性能开销 | 高 | 低 | 极低（纯函数式） |
| 推荐场景 | 遗留系统 | Java 高并发首选 | 云原生 / 响应式首选 |

Resilience4j 集成示例：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: xxx
          uri: lb://xxx
          predicates:
            - Path=/xxx/**
          filters:
            - name: CircuitBreaker
              args:
                name: default
                fallbackUri: "forward:/fallback"
```

```java
@Bean
public Customizer<ReactiveResilience4JCircuitBreakerFactory> customizer() {
    return factory -> factory.configureDefault(id -> new Resilience4JConfigBuilder(id)
        .timeLimiterConfig(TimeLimiterConfig.custom()
            .timeoutDuration(Duration.ofSeconds(3)).build())
        .circuitBreakerConfig(CircuitBreakerConfig.ofDefaults())
        .build());
}
```

#### (4) 限流 RequestRateLimiter

限流算法：

**计数器**：每个单位时间能通过的请求数固定，超过阈值直接拒绝。

通过维护一个单位时间内的计数器，每次请求计数器加 1，当单位时间内计数器累加到大于设定的阈值，则之后的请求都被拒绝，直到单位时间过去，再将计数器重置为零。

**漏桶算法**：维持一个队列，所有请求先进队列，然后从队列取出请求的速率是固定。【保护请求】

漏桶算法可以很好地限制容量池的大小，从而防止流量暴增。可以看作是一个带有常量服务时间的单服务器队列，如果漏桶溢出，那么数据包会被丢弃。在网络中，漏桶算法可以控制端口的流量输出速率，平滑网络上的突发流量，实现流量整形。

漏桶算法需要通过两个变量进行控制：一个是桶的大小（支持流量突发增多时可以存多少的水），另一个是水桶漏洞的大小（从队列取出请求）。

**令牌桶算法**：按一定额定的速率产生令牌，存入令牌桶，桶有最大容量（应该为微服务最大承载）；服务过来时需要请求到一个令牌才可以进入服务执行；服务里就可以保持基本不会超过承载值。【保护服务】

令牌桶算法是对漏桶算法的一种改进，桶算法能够限制请求调用的速率，而令牌桶算法能够在限制调用的平均速率的同时还允许一定程度的突发调用。如果桶中一直有大量的可用令牌，这时进来的请求就可以直接拿到令牌执行，所以只有桶中没有令牌时，请求才会进行等待，最后相当于以一定的速率执行。

具体实现逻辑在 `RequestRateLimiterGatewayFilterFactory` 类中，基于 Redis + Lua 脚本实现：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: xxx
          uri: lb://xxx
          predicates:
            - Path=/xxx/**
          filters:
            - name: RequestRateLimiter
              args:
                key-resolver: "#{@ipKeyResolver}"
                redis-rate-limiter.replenishRate: 1    # 令牌生成速率（个/秒）
                redis-rate-limiter.burstCapacity: 1    # 令牌桶容量
```

```java
@Bean
public KeyResolver ipKeyResolver() {
    return exchange -> Mono.just(
        exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
    );
}
```

Redis 中存储两个 Key：
- `request_rate_limiter.{id}.tokens` — 剩余令牌数
- `request_rate_limiter.{id}.timestamp` — 上次刷新时间戳

#### (5) Sentinel 流控和降级

Sentinel（阿里开源，Java 高并发场景首选）

---

## OpenFeign

### 一、简单集成

#### (1) 包 - @EnableFeignClients

核心包 `spring-cloud-starter-openfeign` 毫无疑问，能够通过包含其他 pom 来增强（定义了一个文件包含可集成的 Bean 名，如果能够在上下文中找到就可以进行增强），常见的如：

- `spring-cloud-starter-loadbalancer`
- `spring-cloud-starter-circuitbreaker-resilience4j`（或 `spring-cloud-starter-alibaba-sentinel`）

上述的意思是，比如断路器，除了 `feign.circuitbreaker.enabled=true`，还必需引入包 circuitbreaker，但只引包即可。

okhttp、httpclient5 同样的模式。

#### (2) FeignClient

```java
public @interface FeignClient {
    // value 和 name 的作用一样，如果没有配置 url 那么配置的值将作为服务名称，用于服务发现
    @AliasFor("name")
    String value() default "";

    @AliasFor("value")
    String name() default "";

    // 相当于 name/value + contextId 需要唯一
    // 同一个 name 包含的是整个实例，但其中可能存在不同模块，
    // 指定不同的 contextId 这样就不会冲突了
    String contextId() default "";

    // qualifier 对应的是 @Qualifier 注解，一般场景直接 @Autowired 即可
    String qualifier() default "";

    // url 用于配置指定服务的地址，相当于直接请求这个服务，不经过服务发现。
    // 像调试等场景可以使用
    String url() default "";

    // 当调用请求发生 404 错误时，decode404 为 true 会执行 decoder 解码，否则抛出异常
    boolean decode404() default false;

    // 配置 Feign 配置类，可自定义 Encoder、Decoder、LogLevel、Contract 等
    Class<?>[] configuration() default {};

    // 定义容错的处理类（回退逻辑），fallback 类必须实现 Feign Client 的接口，
    // 但无法知道熔断的异常信息
    Class<?> fallback() default void.class;

    // 也是容错的处理，可以知道熔断的异常信息（推荐使用）
    Class<?> fallbackFactory() default void.class;

    String path() default "";

    // primary 对应 @Primary 注解，默认 true。
    // 当 Feign 实现了 fallback 后，容器中存在多个相同 Bean，
    // @Primary 注解决定注入优先级
    boolean primary() default true;
}
```

结合 MVC 的 API 注解，通过接口描述远端地址：

```java
@FeignClient(name = "samples", url = "http://127.0.0.1:10001",
             fallbackFactory = RemoteSampleFallbackFactory.class)
public interface RemoteSampleService {

    @RequestMapping(method = RequestMethod.GET, value = "/get")
    String get();

    @GetMapping("/anything/{anything}?page=1&size={size}")
    String getAnything(@PathVariable("anything") String name, @RequestParam("size") Long size);

    @PostMapping(value = "/anything")
    String postAnything(@RequestBody User user, @RequestHeader("X-Csrf-Token") String token);

    @PostMapping(value = "/status/500")
    String status500();
}
```

#### (3) 拦截器和断路器

**拦截器**，通过 `RequestInterceptor` 接口实现注册 Bean 即可（@Component 或 RequestInterceptor Bean 二选一），单向拦截：

```java
@Bean
public RequestInterceptor requestInterceptor() {
    return new FeignRequestInterceptor();
}
```

```java
@Component
public class FeignRequestInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate requestTemplate) {
        ServletRequestAttributes attributes = (ServletRequestAttributes)
            RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        Map<String, String> headers = new LinkedCaseInsensitiveMap<>();
        Enumeration<String> enumeration = request.getHeaderNames();
        if (enumeration != null) {
            while (enumeration.hasMoreElements()) {
                String key = enumeration.nextElement();
                String value = request.getHeader(key);
                headers.put(key, value);
            }
        }

        requestTemplate.header("Authorization", "Bearer xyz");
        requestTemplate.header("X-Forwarded-For", "127.0.0.1");
    }
}
```

**断路器**，通过 `FallbackFactory` 接口实现注册 Bean 即可：

```java
@Component
public class RemoteSampleFallbackFactory implements FallbackFactory<RemoteSampleService> {
    private static final Logger log = LoggerFactory.getLogger(RemoteSampleService.class);

    @Override
    public RemoteSampleService create(Throwable throwable) {
        return new RemoteSampleService() {
            @Override
            public String status500() {
                log.error("Feign调用失败", throwable);
                return "服务调用失败";
            }
        };
    }
}
```

> `fallback` 只能返回默认值，无法获取异常信息；`fallbackFactory` 可以拿到 `Throwable`，推荐使用后者

### 二、一些实际问题

#### (1) 理解思路

Feign 是一个声明式 Web 服务客户端，通过注解的方式描述如何进行 web 请求。它为每个指定客户端创建了一个上下文，通过全局配置和客户端配置，结合 Spring Web 中的默认（比如编码器、解码器，HttpMessageConverters 等等）实现远程过程调用。提供拦截和回退（spring circuitbreaker），提供负载均衡（spring loadbalancer）。Feign 客户端可以由注解创建或者 Builder 创建，每一个客户端都可以实现完全控制。

默认提供了 Decoder、Encoder、Logger、Contract、Client 等等 Bean 对象，也有 Metrics 相关 Bean（未了解）。

#### (2) 全局配置和个性配置

配置项有这些（略，参考官方文档）。

全局修改可以通过配置文件或者 Bean 模式：

```yaml
feign:
  client:
    config:
      default:        # 全局配置
        connect-timeout: 5000   # 连接超时（毫秒）
        read-timeout: 10000     # 读取超时（毫秒）
        logger-level: BASIC     # 日志级别

      product-service:           # 针对特定服务的配置
        connect-timeout: 3000
        read-timeout: 5000
        logger-level: FULL
```

个性配置的方式包括 `@FeignClient` 附加配置或配置文件中的扩展：

```java
@FeignClient(name = "user2", url = "http://127.0.0.1:9201",
             configuration = RemoteUserFeignConfig.class)
```

⚠️ **注意：FeignClient 的 configuration 类不需要 @Configuration 或 @Component，否则会将其作为全局默认。需要 @Bean 注解来描述配置项修改**

#### (3) 超时和重试

默认值（不同版本可能不同，以下为常见值）：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `connect-timeout` | 10s / 2s | 连接超时 |
| `read-timeout` | 60s / 5s | 读取超时 |

OpenFeign 默认**不重试**（默认的 `Retryer.NEVER_RETRY`）。

自定义重试：

```java
@Bean
public Retryer feignRetryer() {
    // period=100ms, maxPeriod=1s, maxAttempts=3（第1次+重试2次）
    return new Retryer.Default(100, 1000, 3);
}
```

⚠️ **注意：非幂等接口（如 POST）不应配置重试，否则可能导致重复提交**

#### (4) 日志配置

| 级别 | 说明 |
|------|------|
| `NONE` | 无日志（默认） |
| `BASIC` | 仅记录请求方法和 URL + 响应状态码和耗时 |
| `HEADERS` | BASIC + 请求和响应头 |
| `FULL` | HEADERS + 请求和响应体（含元数据） |

```yaml
# 配置文件方式
feign:
  client:
    config:
      default:
        logger-level: FULL

# 同时需要配置 feign 包的日志级别
logging:
  level:
    com.example.feign: debug
```

```java
// Bean 方式
@Bean
public Logger.Level feignLoggerLevel() {
    return Logger.Level.FULL;
}
```

⚠️ **生产环境一般不开启 FULL 日志，仅排查问题时临时开启**

#### (5) 连接池

OpenFeign 默认使用 `HttpURLConnection`，**不支持连接池**，高并发场景性能差。

| HTTP 客户端 | 连接池 | 推荐 |
|------------|--------|------|
| HttpURLConnection | ❌ | 默认 |
| Apache HttpClient 5 | ✅ | 传统项目 |
| OKHttp | ✅ | 新项目推荐 |

```xml
<!-- 引入 OKHttp -->
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
</dependency>
```

```yaml
feign:
  okhttp:
    enabled: true
  httpclient:
    enabled: false
```

#### (6) Decode 的问题

在默认情况会以 SpringDecoder、HttpMessageConverters 进行 JSON 解码，这其中会出现一个项目间的差别，比如日期格式的 Format 问题：

```java
@Bean
public feign.codec.Decoder userServiceDecoder() {
    ObjectMapper objectMapper = new ObjectMapper();

    SimpleModule module = new SimpleModule();
    module.addDeserializer(Date.class, new MultiFormatDateDeserializer());
    module.addDeserializer(LocalDateTime.class, new MultiFormatLocalDateTimeDeserializer());
    objectMapper.registerModule(module);

    return new ResponseEntityDecoder(
            new SpringDecoder(() -> new HttpMessageConverters(
                    new MappingJackson2HttpMessageConverter(objectMapper)
            ))
    );
}
```

### 三、常见坑

(1) **Gateway 与 Spring Web 冲突** — Spring Cloud Gateway 基于 WebFlux（响应式），必须排除 `spring-boot-starter-web`，否则启动报错

(2) **Feign 拦截器中获取 Request 为 null** — 异步线程中调用 Feign 时，`RequestContextHolder.getRequestAttributes()` 可能返回 null。解决：配置 `RequestContextHolder.setRequestAttributes(attributes, true)` 开启可继承模式

(3) **超时时间设置不当** — 连接超时/读取超时设置过大会导致线程长时间阻塞，高并发时可能引发服务雪崩。建议：读取超时 < 断路器超时 < Hystrix/Resilience4j 超时

(4) **fallback 中无法获取异常原因** — 使用 `fallback` 属性时只能返回默认值，需要获取异常信息请改用 `fallbackFactory`

(5) **Feign 配置类被全局化** — `@FeignClient(configuration=...)` 指定的配置类**不要**加 `@Configuration` 或 `@Component`，否则会被 Spring 全局扫描到，影响所有 Feign 客户端

(6) **相同 name 的 FeignClient 冲突** — 多个 `@FeignClient` 使用相同 name 时需要通过 `contextId` 区分

(7) **限流 Key 解析返回空 Key** — Gateway 限流默认 `denyEmptyKey=true`，空 Key 直接返回 403。可通过配置 `denyEmptyKey: false` 放行

(8) **熔断超时设置** — 需根据下游服务 P99 响应时间设置，避免误触发熔断
