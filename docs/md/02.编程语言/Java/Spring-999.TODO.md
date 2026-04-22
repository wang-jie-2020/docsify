## WebMvcConfigurer

| 方法                                 | 描述                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `configurePathMatch`                 | 帮助配置 `HandlerMapping` 路径匹配选项，例如是否使用已解析的 `PathPatterns` 或与 `PathMatcher` 匹配的字符串模式，是否匹配尾部斜杠等。 |
| `configureContentNegotiation`        | 配置内容协商选项。                                           |
| `configureAsyncSupport`              | 配置异步请求处理选项。                                       |
| `configureDefaultServletHandling`    | 配置处理器以通过转发到 Servlet 容器的 “default” servlet 来委派未处理的请求。一个常见的用例是当 `DispatcherServlet` 映射到 `""` 从而覆盖 Servlet 容器对静态资源的默认处理时。 |
| `addFormatters`                      | 除了默认注册的 `Converter` 和 `Formatter` 之外，再添加其他的 |
| `addInterceptors`                    | 添加 Spring MVC 生命周期拦截器，用于控制器方法调用和资源处理器请求的预处理和后处理。可以注册拦截器以应用于所有请求或仅限于 URL 模式的子集。 |
| `addResourceHandlers`                | 添加处理器以从 Web 应用程序根目录、类路径等的特定位置提供静态资源，例如图像、js 和 css 文件。 |
| `addCorsMappings`                    | 配置“全局”跨域请求处理。配置的 CORS 映射适用于带注解的控制器、功能端点和静态资源。 带注解的控制器可以通过 `@CrossOrigin` 进一步声明更细粒度的配置。在这种情况下，此处声明的“全局” CORS 配置与控制器方法上定义的本地 CORS 配置相结合。 |
| `addViewControllers`                 | 配置预先配置有响应状态代码或视图的简单自动化控制器以呈现响应正文。这在不需要自定义控制器逻辑的情况下很有用——例如呈现主页、执行简单的站点 URL 重定向、返回带有 HTML 内容的 404 状态、无内容的 204 状态等等。 |
| `configureViewResolvers`             | 配置视图解析器以将从控制器返回的基于字符串的视图名称转换为具体的 `org.springframework.web.servlet.View` 实现以执行渲染。 |
| `addArgumentResolvers`               | 添加解析器以支持自定义控制器方法参数类型。这不会覆盖对解析处理器方法参数的内置支持。要自定义对参数解析的内置支持，请直接配置 `RequestMappingHandlerAdapter` |
| `addReturnValueHandlers`             | 添加处理程序以支持自定义控制器方法返回值类型。使用此选项不会覆盖对处理返回值的内置支持。要自定义处理返回值的内置支持，请直接配置 `RequestMappingHandlerAdapter` |
| `configureMessageConverters`         | 配置 `HttpMessageConverter` 以读取请求正文和写入响应正文。 默认情况下，只要类路径中存在相应的三方库（例如 Jackson JSON、JAXB2 等），就会配置所有内置转换器。 注意使用此方法会关闭默认转换器注册。或者，使用 `extendMessageConverters(List)` 修改该默认转换器列表。 |
| `extendMessageConverters`            | 使用默认列表配置或初始化后，扩展或修改转换器列表。 请注意，转换器注册的顺序很重要。特别是在客户端接受 `org.springframework.http.MediaType.ALL` 的情况下，之前配置的转换器将是首选。 |
| `configureHandlerExceptionResolvers` | 配置异常解析器。 给定的列表开始为空。如果它留空，框架会配置一组默认的解析器，请参阅 `WebMvcConfigurationSupport.addDefaultHandlerExceptionResolvers(List, org.springframework.web.accept.ContentNegotiationManager)` 。或者，如果将任何异常解析器添加到列表中，则应用程序有效地接管并且必须提供完全初始化的异常解析器。 或者，您可以使用 `extendHandlerExceptionResolvers(List)` ，它允许您扩展或修改默认配置的异常解析器列表。 |
| `extendHandlerExceptionResolvers`    | 扩展或修改默认配置的异常解析器列表。这对于插入自定义异常解析器而不干扰默认异常解析器很有用。 |
| `getValidator`                       | 提供自定义验证器，而不是默认创建的验证器。假设 JSR-303 在类路径上，默认实现是：`org.springframework.validation.beanvalidation.OptionalValidatorFactoryBean` 。 将返回值保留为 `null` 以保持默认值。 |
| `getMessageCodesResolver`            | 提供自定义 `MessageCodesResolver` 用于从数据绑定和验证错误代码构建消息代码。 将返回值保留为 `null` 以保持默认值。 |



## **`WebMvcConfigurer` 实现是怎么影响 Spring MVC 配置的**



**`WebMvcConfigurationSupport` 类中定义了所有与 `WebMvcConfigurer` 接口完全相同的 `protected` 方法，但是又没有实现接口的关系，容易造成迷惑**



`DelegatingWebMvcConfiguration` 继承 `WebMvcConfigurationSupport` 类，并包含字段 `WebMvcConfigurerComposite configurers` ，将这两者联系起来了。



`WebMvcConfigurerComposite` 包含字段 `List delegates` ，用来组合容器中所有的 `WebMvcConfigurer` 实现。



`WebMvcConfigurationSupport` 类中定义的 `@Bean` 方法会调用与 `WebMvcConfigurer` 接口完全相同的 `protected` 方法进行配置，`DelegatingWebMvcConfiguration` 继承这些 `protected` 方法，并委托给 `WebMvcConfigurerComposite configurers` ，所以容器中定义的 `WebMvcConfigurer` 实现会参与到 `WebMvcConfigurationSupport` 类中定义的 `@Bean` 方法定义，从而影响 Spring MVC 配置

Spring Boot 自动配置默认提供了 1 个 `WebMvcConfigurer` 实现

+ `WebMvcAutoConfiguration.WebMvcAutoConfigurationAdapter`

将 `WebMvcConfigurer` 接口的实现类放入 `DelegatingWebMvcConfiguration#configurers` 的时机

+ 实例化配置类 `WebMvcAutoConfiguration.EnableWebMvcConfiguration` 时
+ 继承了配置类 `DelegatingWebMvcConfiguration`
+ 属性赋值 `DelegatingWebMvcConfiguration#setConfigurers` ，将 `WebMvcConfigurer` 接口的实现类添加到 `WebMvcConfigurerComposite configurers`





## RequestMappingHandlerMapping

>RequestMappingHandlerMapping是Spring MVC中的一个请求映射处理器，它负责将HTTP请求映射到特定的@RequestMapping注解的方法上。允许你使用简单的注解（如@GetMapping、@PostMapping、@RequestMapping等）来定义请求路径和HTTP方法。
>工作机制：
>
>* 当Spring MVC的DispatcherServlet接收到一个HTTP请求时，它会查找一个合适的HandlerMapping来处理这个请求。
>* RequestMappingHandlerMapping会检查它的映射注册表，该注册表包含了所有使用@RequestMapping注解的方法的映射信息。
>* 如果找到了一个匹配的映射，那么RequestMappingHandlerMapping会返回一个HandlerExecutionChain，它包含了要执行的处理器（通常是HandlerMethod，代表一个@Controller中的方法）和任何与之关联的拦截器。
>  与其他组件的关系：
>* RequestMappingHandlerMapping与HandlerAdapter（如RequestMappingHandlerAdapter）紧密合作。一旦RequestMappingHandlerMapping找到了一个匹配的处理器，它会将这个处理器传递给HandlerAdapter，后者负责调用处理器并执行相应的逻辑。
>* RequestMappingHandlerMapping还可能与HandlerInterceptor一起使用，以在请求处理过程中添加额外的逻辑（如日志记录、身份验证等）。

```java
@Override
public void afterPropertiesSet()
{
    RequestMappingHandlerMapping mapping = applicationContext.getBean(RequestMappingHandlerMapping.class);
    Map<RequestMappingInfo, HandlerMethod> map = mapping.getHandlerMethods();

    map.keySet().forEach(info -> {
        HandlerMethod handlerMethod = map.get(info);
        ...
    });
}
```

## 异常处理

@RestControllerAdvice

## 参数校验

@NotNull @NotBlank....   @Valid

@Validated

```java
@PostMapping("validation-error")
public void ThrowValidationError(@Validated @RequestBody ErrorInput input) {

}

@Data
public class ErrorInput {

    @NotNull(message = "not null")
    @NotBlank(message = "not blank")
    @Length(max = 5, message = "name <=5")
    private String name;
}

//如果需要分组时，定义空类EditValidationGroup、AddValidationGroup，感觉会很不好用
//@NotEmpty(message = "{user.msg.userId.notEmpty}", groups = {EditValidationGroup.class}) 
//@NotEmpty(message = "{user.msg.userId.notEmpty}", groups = {AddValidationGroup.class}) 
```

### 自定义注解校验

自定义`Xss`校验器，实现`ConstraintValidator`接口

```java
/**
 * 自定义xss校验注解实现
 * 
 * @author ruoyi
 */
public class XssValidator implements ConstraintValidator<Xss, String>
{
    private final String HTML_PATTERN = "<(\\S*?)[^>]*>.*?|<.*? />";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext constraintValidatorContext)
    {
        return !containsHtml(value);
    }

    public boolean containsHtml(String value)
    {
        Pattern pattern = Pattern.compile(HTML_PATTERN);
        Matcher matcher = pattern.matcher(value);
        return matcher.matches();
    }
}
```

新增`Xss`注解，设置自定义校验器`XssValidator.class`

```java
/**
 * 自定义xss校验注解
 * 
 * @author ruoyi
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(value = { ElementType.METHOD, ElementType.FIELD, ElementType.CONSTRUCTOR, ElementType.PARAMETER })
@Constraint(validatedBy = { XssValidator.class })
public @interface Xss
{
    String message()

    default "不允许任何脚本运行";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
```

如果是在方法里面校验整个实体，参考示例:

```java
@Autowired
protected Validator validator;

public void importUser(SysUser user)
{
    BeanValidators.validateWithException(validator, user);
}
```

## @InitBinder

请求中注册自定义参数的解析，从而达到自定义请求参数格式的目的

如果出现在全局的ControllerAdvide中则全局生效(个人理解上写在baseController中也许更好)

```java
@InitBinder
public void handleInitBinder(WebDataBinder dataBinder){
    dataBinder.registerCustomEditor(Date.class,
            new CustomDateEditor(new SimpleDateFormat("yyyy-MM-dd"), false));
}
```

## @ModelAttribute

预设全局参数，比如最典型的使用Spring Security时将添加当前登录的用户信息（UserDetails)作为参数

非必要了解

## Binding注解

在不注解时,默认当URL参数处理;当然form表单会有额外;

|            |                              |
| ---------- | ---------------------------- |
| FromQuery  | RequestParam (~~PathParam~~) |
| FromRoute  | PathVariable                 |
| FromHeader | RequestHeader                |
| FromBody   | RequestBody                  |
| FromForm   | RequestParam 或缺省?         |

## HttpContext

通过请求参数中获取 Request 对象；  

```java
public void index(HttpServletRequest request) { }
```



通过 RequestContextHolder 获取 Request 对象；

	ServletRequestAttributes servletRequestAttributes = (ServletRequestAttributes)RequestContextHolder.getRequestAttributes();
	HttpServletRequest request = servletRequestAttributes.getRequest();



通过自动注入获取 Request 对象;

```java
@Autowired
private HttpServletRequest request; // 自动注入 request 对象
```







