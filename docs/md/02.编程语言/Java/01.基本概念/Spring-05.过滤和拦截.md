## Servlet

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/spring-springframework-mvc-8.png)

**核心架构的具体流程步骤**如下：

1. **首先用户发送请求——>DispatcherServlet**，前端控制器收到请求后自己不进行处理，而是委托给其他的解析器进行 处理，作为统一访问点，进行全局的流程控制；
2. **DispatcherServlet——>HandlerMapping**， HandlerMapping 将会把请求映射为 HandlerExecutionChain 对象（包含一 个Handler 处理器（页面控制器）对象、多个HandlerInterceptor 拦截器）对象，通过这种策略模式，很容易添加新 的映射策略；
3. **DispatcherServlet——>HandlerAdapter**，HandlerAdapter 将会把处理器包装为适配器，从而支持多种类型的处理器， 即适配器设计模式的应用，从而很容易支持很多类型的处理器；
4. **HandlerAdapter——>处理器功能处理方法的调用**，HandlerAdapter 将会根据适配的结果调用真正的处理器的功能处 理方法，完成功能处理；并返回一个ModelAndView 对象（包含模型数据、逻辑视图名）；
5. **ModelAndView 的逻辑视图名——> ViewResolver**，ViewResolver 将把逻辑视图名解析为具体的View，通过这种策 略模式，很容易更换其他视图技术；
6. **View——>渲染**，View 会根据传进来的Model 模型数据进行渲染，此处的Model 实际是一个Map 数据结构，因此 很容易支持其他视图技术；
7. **返回控制权给DispatcherServlet**，由DispatcherServlet 返回响应给用户，到此一个流程结束。

## Filter和Interceptor

Filter 由 Servlet 标准定义，要求 Filter 需要在Servlet被调用之前调用，作用顾名思义，就是用来过滤请求。在Spring Web应用中，DispatcherServlet就是唯一的Servlet实现。

Interceptor 由 Spring 自己定义，由DispatcherServlet调用，可以定义在Handler调用前后的行为。这里的 Handler，在多数情况下，就是Controller中对应的方法。

![image-20230920135430393](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/image-20230920135430393.png)

![这里写图片描述](https://raw.gitcode.com/qq_36179938/images/raw/main/e85969bbe62a4906e5803225beb350d5.png)



### 过滤器

最简实现一个过滤器:

1. 实现`Filter`接口, 如下

```java
public class doImpFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        // 过滤链路, 需要传递出去, 否则会短路
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
```

2. 配置生效

```java
@Bean
public FilterRegistrationBean doFilterRegistration() {

    FilterRegistrationBean registration = new FilterRegistrationBean();
    registration.setFilter(new doImpFilter());
    registration.addUrlPatterns("/imp/*");
    registration.setName("doImpFilter");
    registration.setOrder(FilterRegistrationBean.LOWEST_PRECEDENCE);

    return registration;
}
```



`Filter` 包含三个方法: `init`、`doFilter`、`destory`:

- init(FilterConfig filterConfig)

  filterConfig 指的是定义过滤器时传递的参数, XML配置 或者 这样:

  ```java
  @Bean
  public FilterRegistrationBean doFilterRegistration() {
  
      FilterRegistrationBean registration = new FilterRegistrationBean();
      registration.setFilter(new doImpFilter());
      registration.addUrlPatterns("/imp/*");
      registration.setName("doImpFilter");
      registration.setOrder(FilterRegistrationBean.LOWEST_PRECEDENCE);
  
      Map<String, String> initParameters = new HashMap<String, String>();
      initParameters.put("param", "1,2,3");
      registration.setInitParameters(initParameters);
  
      return registration;
  }
  ```

  

  ```java
  @Override
  public void init(FilterConfig filterConfig) throws ServletException {
      Filter.super.init(filterConfig);
  
      String parameters = filterConfig.getInitParameter("param");
  }
  ```

  

- doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)

  通过参数 ServletRequest、ServletResponse 继续



过滤器虽然不会针对某个具体需求, 但大概率也会结合项目配置或者代码注解集合, 当需要Ioc容器相关内容的情况下, 以上的过滤器方式可以:

(1) 通过 'registration.setInitParameters()' 传递参数

(2) 通过 静态类

(3) 通过 api

```java
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

        ServletContext context = filterConfig.getServletContext();
        WebApplicationContext cxt = WebApplicationContextUtils.getWebApplicationContext(context);
    }
```

```java
HttpServletRequest request = (HttpServletRequest) servletRequest;
HttpServletResponse response = (HttpServletResponse) servletResponse;

WebApplicationContext cxt = WebApplicationContextUtils.getWebApplicationContext(request.getServletContext());
```



如此实现的过滤器并不在Spring的管理下(Filter 由 Servlet定义调用), 也存在一种代理链方式`DelegatingFilterProxy`, 相当于一个代理类，通过配置中的DelegatingFilterProxy对应的filter-name去spring的IOC容器中寻找id是filter-name的过滤器，也即是FilterChainProxy,找到之后执行DelegatingFilterProxy中对应的过滤逻辑。

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/v2-e8db1153feba42975920dc7d1c33661f_720w.webp)



![image-20250724100520393](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20250724100520393.png)

![image-20250724100609701](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20250724100609701.png)



执行这种方式时, 只需要修改下注册方式即可正常进行依赖注入

```java
@Bean
public DelegatingFilterProxy myServletFilter() {
    return new DelegatingFilterProxy("doImpFilterProxy");
}
```

或者

```java
@Bean
public FilterRegistrationBean<DelegatingFilterProxy> doImpFilterProxyRegistration() {
    FilterRegistrationBean<DelegatingFilterProxy> registrationBean = new FilterRegistrationBean<>();
    registrationBean.setFilter(new DelegatingFilterProxy("doImpFilterProxy"));
    registrationBean.addUrlPatterns("/imp/*");
    return registrationBean;
}
```


Spring当然有对过滤器的封装, 如:

- GenericFilterBean

  是 Spring 对 javax.servlet.Filter 接口的实现，提供基础功能（如初始化、销毁方法的默认实现）。
  需要开发者手动控制过滤逻辑的执行次数，无法自动确保每个请求只执行一次。
  适用于需要灵活控制执行次数的场景（如多次记录日志或动态处理请求）。

- OncePerRequestFilter

  继承自 GenericFilterBean，核心功能是确保每个 HTTP 请求的过滤逻辑仅执行一次。
  内部通过检查请求属性（如 javax.servlet._FILTERED）或 ThreadLocal 来跟踪请求是否已处理过。
  适用于需要严格保证单次执行的场景（如认证、鉴权、流量控制等）

### 拦截器

```java
/**
    {@link WebRequestHandlerInterceptorAdapter}
 */
@Component
public class doInterceptor implements HandlerInterceptor {

    /// 前置判断,相当于if条件
    /// handler -> 可以直接理解为Controller方法
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        System.out.println("Interceptor.preHandle");
        return true;
    }

    /// 正常响应处理,相当于try快
    /// modelAndView -> 视图,api项目是null
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable ModelAndView modelAndView) throws Exception {
        System.out.println("Interceptor.postHandle");
    }

    /// 最终处理,相当于finally块
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) throws Exception {
        System.out.println("Interceptor.afterCompletion");
    }
}
```

通过`WebMvcConfigurer`的`addInterceptors()`

```java
@Autowired
private doInterceptor doInterceptor;

@Override
public void addInterceptors(InterceptorRegistry registry)
{
    registry.addInterceptor(doInterceptor).addPathPatterns("/**");
}
```































