## Nacos

GITHUB上的README: [Nacos-Config](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-config?spm=5238cd80.1a2b85b1.0.0.35c07e841Lsjgn) [Nacos-Discovery](https://github.com/alibaba/spring-cloud-alibaba/wiki/Nacos-discovery?spm=5238cd80.1a2b85b1.0.0.35c07e841Lsjgn)



### Config

配置文件 默认三个而不是wiki中的两个, 当然`${spring.application.name}`不必要

 	`${spring.application.name}` 

 	`${spring.application.name}.${file-extension:properties}` 

 	`${spring.application.name}-${profile}.${file-extension:properties}` 

(1) 本地目录中bootstrap是基础设施配置, 不考虑顺序之类的问题; 程序配置的优先级理所当然的是REMOTE>LOCAL, 想不到有例外场景

(2) 配置Refesh(非CLOUD下不再尝试了意义不大)

- @RefreshScope注解, Target是TYPE或METHOD, 如果是FILED放在TYPE下就行
- @Component中再@RefreshScope是不对的



### Discovery

(1) `register-enabled` 在本地代码调试时FALSE, 不影响部署结构节点(网关会转发请求)

(2) `ip`、`port` 实例服务的终结点, 部署时若是容器必要修改



## Gateway

### 一、Route

路由包含 ID、目标 URI、谓词集合和过滤器集合。谓词可以理解成匹配HTTP请求任何内容的名词。路由示例比如: 

```yml
- id: xxx
  uri: xxx
  predicates:
    - Path=/system/**
  filters:
    - StripPrefix=1
```

请求URL中满足PATH匹配条件的，经过StripPrefix过滤（1指的是网页分段index，比如/system/user即请求uri/user）

#### (1) Route Predicate

built-in route predicate factories:

```yml
Datetime - After=2021-02-23T14:20:00.000+08:00[Asia/Shanghai]   Before、Between
Cookie   - Cookie=loginname, ruoyi
Header   - Header=X-Request-Id, \d+
Host     - Host=**.somehost.org,**.anotherhost.org
Method   - Method=GET,POST
Path     - Path=/system/**
Query    - Query=username, abc.
RemoteAddr  - RemoteAddr=192.168.10.1/0
Weight  - Weight=group1, 2
XForwardedRemoteAddr=192.168.1.1/24
```

Custom-Prrdicate: [AbstractRoutePredicateFactory](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#developer-guide)



#### (2) Route Filter

built-in route filter factories:

```yml
# GatewayFilter
CircuitBreaker		- todo
CacheRequestBody    - todo
RequestRateLimiter  - todo
StripPrefix			- StripPrefix 有些类似于Nginx的Location, SetPath 和它有些类似
```



范围上全局过滤器、特定过滤器, 函数签名类似, AbstractGatewayFilterFactory vs GlobalFilter

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#writing-custom-gatewayfilter-factories

https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/#writing-custom-global-filters



在Pre、Post两个阶段进行过滤如下:

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

(1) `RouteLocator` + `RouteDefinitionLocator` 进行路由自定义, 如果已经有配置中心集成此处意义不大

(2) `RouterFunction` 不是Gateway包下的, 效果能够理解但其api还是不熟悉的



#### (4) ExceptionHandler

实现`ErrorWebExceptionHandler`进行全局处理, 但注意这只是网关异常处理, 服务异常仍旧需要自行处理



### 二、实践问题

#### (1) 有些包装需要了解

​	ServerWebExchange

​		DataBuffer dataBuffer = response.bufferFactory().wrap(JSON.toJSONString(result).getBytes());

​		exchange.getResponse().writeWith(Mono.just(dataBuffer));



​		exchange.getRequest().getURI().getPath()

​		ServerHttpRequest request = exchange.getRequest();

​		ServerHttpRequest.Builder mutate = request.mutate();

​	reactor.core.publisher.Mono

​		Mono.error(ex)

#### (2) Request 、Response 的修改

​	Response 似乎关系不大, exchange.getResponse() 可以直接进行

​	Request 的读(Body)和写有限制

​		ServerHttpRequest request = exchange.getRequest();	// header可读, 不写

​		ServerHttpRequest.Builder mutate = request.mutate();  // 这样

​		return chain.filter(exchange.mutate().request(mutate.build()).build());



​		CacheRequestBody

​		

​		xss中进行了Body的修改, 代码不贴了



#### (3) 熔断降级 CircuitBreaker

`spring-cloud-starter-circuitbreaker-reactor-resilience4j`



#### (4) 限流 RequestRateLimiter

限流算法:
**计数器: 每个单位时间能通过的请求数固定，超过阈值直接拒绝。**

通过维护一个单位时间内的计数器，每次请求计数器加1，当单位时间内计数器累加到大于设定的阈值，则之后的请求都被绝，直到单位时间已经过去，再将计数器重置为零。

**漏桶算法: 维持一个队列，所有请求先进队列，然后从队列取出请求的速率是固定。【保护请求】**

漏桶算法可以很好地限制容量池的大小，从而防止流量暴增。漏桶可以看作是一个带有常量服务时间的单服务器队列，如果漏桶（包缓存）溢出，那么数据包会被丢弃。 在网络中，漏桶算法可以控制端口的流量输出速率，平滑网络上的突发流量，实现流量整形，从而为网络提供一个稳定的流量。

漏桶算法需要通过两个变量进行控制：一个是桶的大小，支持流量突发增多时可以存多少的水（burst），另一个是水桶漏洞的大小（rate）（从队列取出请求）

**令牌桶算法: 按一定额定的速率产生令牌，存入令牌桶，桶有最大容量（应该为微服务最大承载）；服务过来时需要请求到一个令牌才可以进入服务执行；服务里就可以保持基本不会超过承载值。【保护服务】**

令牌桶算法是对漏桶算法的一种改进，桶算法能够限制请求调用的速率，而令牌桶算法能够在限制调用的平均速率的同时还允许一定程度的突发调用。在令牌桶算法中，存在一个桶，用来存放固定数量的令牌。算法中存在一种机制，以一定的速率往桶中放令牌。每次请求调用需要先获取令牌，只有拿到令牌，才有机会继续执行，否则选择选择等待可用的令牌、或者直接拒绝。放令牌这个动作是持续不断的进行，如果桶中令牌数达到上限，就丢弃令牌，所以就存在这种情况，桶中一直有大量的可用令牌，这时进来的请求就可以直接拿到令牌执行，比如设置qps为100，那么限流器初始化完成一秒后，桶中就已经有100个令牌了，这时服务还没完全启动好，等启动完成对外提供服务时，该限流器可以抵挡瞬时的100个请求。所以，只有桶中没有令牌时，请求才会进行等待，最后相当于以一定的速率执行。



具体实现逻辑在RequestRateLimiterGatewayFilterFactory类中, lua脚本 ![img](https://img-blog.csdnimg.cn/img_convert/e2e8184e3b6ac5091722414e44fd7fee.png)



#### (5) Sentinel 流控和降级

Sentinel



## OpenFeign

### 一、简单集成

#### (1) 包 - @EnableFeignClients

​	核心包 spring-cloud-starter-openfeign 毫无疑问, 能够通过包含其他pom来增强(定义了一个文件包含可集成的Bean名, 如果能够在上下文中找到就可以进行增强), 常见的如:

​	spring-cloud-starter-loadbalancer

​	spring-cloud-starter-circuitbreaker-resilience4j (或 spring-cloud-starter-alibaba-sentinel)

上述的意思是, 比如断路器, 除了 feign.circuitbreaker.enabled=true, 还必需引入包circuitbreaker, 但只引包即可

okhttp、httpclient5 同样的模式

#### (2) FeignClient

```java
public @interface FeignClient {
    
    // value和name的作用一样，如果没有配置url那么配置的值将作为服务名称，用于服务发现。反之只是一个名称。
    @AliasFor("name")
    String value() default "";	

    @AliasFor("value")
    String name() default "";
    
    // 相当于 name/value + contextId 需要唯一
    // 同一个name包含的是整个实例, 但其中可能存在不同模块，指定不同的contextId这样就不会冲突了。
    String contextId() default "";	

    // qualifier对应的是@Qualifier注解，使用场景跟上面的primary关系很淡，一般场景直接@Autowired直接注入就可以了。
    String qualifier() default "";

    // url用于配置指定服务的地址，相当于直接请求这个服务，不经过Ribbon的服务选择。像调试等场景可以使用。
    String url() default "";

    // 当调用请求发生404错误时，decode404的值为true，那么会执行decoder解码，否则抛出异常。
    boolean decode404() default false;

    // configuration是配置Feign配置类，在配置类中可以自定义Feign的Encoder、Decoder、LogLevel、Contract等。
    Class<?>[] configuration() default {};

    // 定义容错的处理类，也就是回退逻辑，fallback的类必须实现Feign Client的接口，无法知道熔断的异常信息。
    Class<?> fallback() default void.class;

    // 也是容错的处理，可以知道熔断的异常信息。
    Class<?> fallbackFactory() default void.class;

    String path() default "";
	
    //primary对应的是@Primary注解，默认为true，官方这样设置也是有原因的。
    //当我们的Feign实现了fallback后，也就意味着Feign Client有多个相同的Bean在Spring容器中，当我们在使用@Autowired进行注入的时候，不知道注入哪个，所以我们需要设置一个优先级高的，@Primary注解就是干这件事情的。
    boolean primary() default true;
}
```

结合mvc的api注解, 通过接口描述远端地址, 例子:

```java
@FeignClient(name = "samples", url = "http://127.0.0.1:10001", fallbackFactory = RemoteSampleFallbackFactory.class)
// @FeignClient(name = "samples", fallbackFactory = RemoteSampleFallbackFactory.class)
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

#### (3) 拦截器 和 断路器

1. 拦截器, 通过RequestInterceptor接口实现注册Bean即可(@Component 或 RequestInterceptor Bean二选一的意思), 单向拦截

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
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();

        Map<String, String> headers = new LinkedCaseInsensitiveMap<>();

        Enumeration<String> enumeration = request.getHeaderNames();
        if (enumeration != null)
        {
            while (enumeration.hasMoreElements())
            {
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



2. 断路器, 通过FallbackFactory接口实现注册Bean即可

```java
@Component
public class RemoteSampleFallbackFactory implements FallbackFactory<RemoteSampleService>
{
    private static final Logger log = LoggerFactory.getLogger(RemoteSampleService.class);

    @Override
    public RemoteSampleService create(Throwable throwable)
    {
        return new RemoteSampleService()
        {
            @Override
            public String status500()
            {
                return ("服务调用失败");
            }
        };
    }
}
```



### 二、一些实际问题

#### (1) 理解思路

​	Feign是一个声明式Web服务客户端, 通过注解的方式描述如何进行web请求. 它为每个指定客户端创建了一个上下文(此处有疑问), 通过全局配置和客户端配置,

结合Spring Web中的默认(比如编码器、解码器, HttpMessageConverters等等)实现远程过程调用. 提供拦截和回退(spring circuitbreaker), 提供负载

均衡(spring loadbalancer). Feign客户端 可以由注解创建或者Builder创建, 每一个客户端都可以实现完全控制.

​	默认提供了Decoder、Encoder、Logger、Contract、Client等等Bean对象, 也有Metrics相关Bean(未了解)

#### (2) 全局配置 和 个性配置

配置项有这些: 

![在这里插入图片描述](https://raw.gitcode.com/qq_36179938/images/raw/main/2e2f8b1d1e1d16b463044cea9a537e6f.png)



![在这里插入图片描述](https://raw.gitcode.com/qq_36179938/images/raw/main/2a3d98e6d3f59365fdaed38a4be17497.png)

当然可以通过配置文件或者Bean的模式进行全局修改, 比如:

![image-20251216134726173](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20251216134726173.png)



个性配置的方式包括 @FeignClient 附加配置 或者 配置文件中的拓展, 后者通过默认的结构实现对每一个客户端的配置, 比如

​	feign.client.config.feignName: xxx 下即可对Name是xxx的客户端进行配置(spring.cloud.openfeign 点不出来??)

@FeignClient 附加配置的形式如:

```java
@FeignClient(name = "user2", url = "http://127.0.0.1:9201", configuration = RemoteUserFeignConfig.class)
```

注意: 不需要 @Configuration 或者 @Component 进行注释, 否则会将其作为默认全局. 需要@Bean注解来描述配置项修改.

#### (3) Decode的问题

在默认情况会以SpringDecoder、HttpMessageConverters进行json解码, 这其中会出现一个项目间的差别, 比如日期格式的Format问题

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



































