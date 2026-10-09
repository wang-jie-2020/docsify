# Spring MVC 补充

## WebMvcConfigurer

| 方法                                 | 描述                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `configurePathMatch`                 | 帮助配置 `HandlerMapping` 路径匹配选项，例如是否使用已解析的 `PathPatterns` 或与 `PathMatcher` 匹配的字符串模式，是否匹配尾部斜杠等。 |
| `configureContentNegotiation`        | 配置内容协商选项。                                           |
| `configureAsyncSupport`              | 配置异步请求处理选项。                                       |
| `configureDefaultServletHandling`    | 配置处理器以通过转发到 Servlet 容器的 "default" servlet 来委派未处理的请求。一个常见的用例是当 `DispatcherServlet` 映射到 `""` 从而覆盖 Servlet 容器对静态资源的默认处理时。 |
| `addFormatters`                      | 除了默认注册的 `Converter` 和 `Formatter` 之外，再添加其他的 |
| `addInterceptors`                    | 添加 Spring MVC 生命周期拦截器，用于控制器方法调用和资源处理器请求的预处理和后处理。可以注册拦截器以应用于所有请求或仅限于 URL 模式的子集。 |
| `addResourceHandlers`                | 添加处理器以从 Web 应用程序根目录、类路径等的特定位置提供静态资源，例如图像、js 和 css 文件。 |
| `addCorsMappings`                    | 配置"全局"跨域请求处理。配置的 CORS 映射适用于带注解的控制器、功能端点和静态资源。带注解的控制器可以通过 `@CrossOrigin` 进一步声明更细粒度的配置。 |
| `addViewControllers`                 | 配置预先配置有响应状态代码或视图的简单自动化控制器以呈现响应正文。这在不需要自定义控制器逻辑的情况下很有用——例如呈现主页、执行简单的站点 URL 重定向、返回带有 HTML 内容的 404 状态、无内容的 204 状态等等。 |
| `configureViewResolvers`             | 配置视图解析器以将从控制器返回的基于字符串的视图名称转换为具体的 `org.springframework.web.servlet.View` 实现以执行渲染。 |
| `addArgumentResolvers`               | 添加解析器以支持自定义控制器方法参数类型。这不会覆盖对解析处理器方法参数的内置支持。 |
| `addReturnValueHandlers`             | 添加处理程序以支持自定义控制器方法返回值类型。这不会覆盖对处理返回值的内置支持。 |
| `configureMessageConverters`         | 配置 `HttpMessageConverter` 以读取请求正文和写入响应正文。注意使用此方法会关闭默认转换器注册。 |
| `extendMessageConverters`            | 扩展或修改转换器列表（保留默认）。注意，转换器注册的顺序很重要。 |
| `configureHandlerExceptionResolvers` | 配置异常解析器。给定的列表开始为空。如果添加了任何异常解析器，则应用程序必须提供完全初始化的异常解析器。 |
| `extendHandlerExceptionResolvers`    | 扩展或修改默认配置的异常解析器列表，不干扰默认异常解析器。 |
| `getValidator`                       | 提供自定义验证器，返回 `null` 以保持默认值。 |
| `getMessageCodesResolver`            | 提供自定义 `MessageCodesResolver`，返回 `null` 以保持默认值。 |

> `configureMessageConverters` 会**清空**默认的所有 Converter，需要自己全部重建；`extendMessageConverters` 在现有基础上修改，更安全。

---

## WebMvcConfigurer 实现如何影响 Spring MVC 配置

`WebMvcConfigurationSupport` 类中定义了所有与 `WebMvcConfigurer` 接口完全相同的 `protected` 方法，但是又没有实现接口的关系，容易造成迷惑。

`DelegatingWebMvcConfiguration` 继承 `WebMvcConfigurationSupport` 类，并包含字段 `WebMvcConfigurerComposite configurers`，将这两者联系起来了。

`WebMvcConfigurerComposite` 包含字段 `List delegates`，用来组合容器中所有的 `WebMvcConfigurer` 实现。

`WebMvcConfigurationSupport` 类中定义的 `@Bean` 方法会调用与 `WebMvcConfigurer` 接口完全相同的 `protected` 方法进行配置，`DelegatingWebMvcConfiguration` 继承这些 `protected` 方法，并委托给 `WebMvcConfigurerComposite configurers`，所以容器中定义的 `WebMvcConfigurer` 实现会参与到 `WebMvcConfigurationSupport` 类中定义的 `@Bean` 方法定义，从而影响 Spring MVC 配置。

Spring Boot 自动配置默认提供了 1 个 `WebMvcConfigurer` 实现：`WebMvcAutoConfiguration.WebMvcAutoConfigurationAdapter`

将 `WebMvcConfigurer` 接口的实现类放入 `DelegatingWebMvcConfiguration#configurers` 的时机：

1. 实例化配置类 `WebMvcAutoConfiguration.EnableWebMvcConfiguration`
2. 继承了配置类 `DelegatingWebMvcConfiguration`
3. 属性赋值 `DelegatingWebMvcConfiguration#setConfigurers`，将 `WebMvcConfigurer` 接口的实现类添加到 `WebMvcConfigurerComposite configurers`

---

## RequestMappingHandlerMapping

> RequestMappingHandlerMapping 是 Spring MVC 中的一个请求映射处理器，它负责将 HTTP 请求映射到特定的 @RequestMapping 注解的方法上。允许你使用简单的注解（如 @GetMapping、@PostMapping、@RequestMapping 等）来定义请求路径和 HTTP 方法。

工作机制：

1. DispatcherServlet 接收到一个 HTTP 请求时，查找一个合适的 HandlerMapping
2. RequestMappingHandlerMapping 检查它的映射注册表（所有 @RequestMapping 注解的方法的映射信息）
3. 如果找到匹配，返回 HandlerExecutionChain（包含 HandlerMethod + 关联的拦截器）

与其他组件的关系：RequestMappingHandlerMapping 与 HandlerAdapter（如 RequestMappingHandlerAdapter）紧密合作，还可能与 HandlerInterceptor 一起使用（日志记录、身份验证等）。

```java
@Override
public void afterPropertiesSet() {
    RequestMappingHandlerMapping mapping = applicationContext.getBean(RequestMappingHandlerMapping.class);
    Map<RequestMappingInfo, HandlerMethod> map = mapping.getHandlerMethods();

    map.keySet().forEach(info -> {
        HandlerMethod handlerMethod = map.get(info);
        // ...
    });
}
```

---

## 异常处理

### @RestControllerAdvice

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 处理 @RequestBody 参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleValidException(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return Result.fail(400, msg);
    }

    // 处理 @RequestParam / Service 层参数校验异常
    @ExceptionHandler(ConstraintViolationException.class)
    public Result handleConstraintViolation(ConstraintViolationException ex) {
        String msg = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("; "));
        return Result.fail(400, msg);
    }

    // 自定义业务异常
    @ExceptionHandler(BusinessException.class)
    public Result handleBusinessException(BusinessException ex) {
        return Result.fail(ex.getCode(), ex.getMessage());
    }

    // 404
    @ExceptionHandler(NoHandlerFoundException.class)
    public Result handle404(NoHandlerFoundException ex) {
        return Result.fail(404, "资源不存在");
    }

    // 兜底
    @ExceptionHandler(Exception.class)
    public Result handleException(Exception ex) {
        log.error("系统异常", ex);
        return Result.fail(500, "系统内部错误");
    }
}
```

常见异常类型：

| 异常类型 | 触发场景 | HTTP 状态码 |
|---------|---------|------------|
| `MethodArgumentNotValidException` | `@RequestBody` + `@Valid` / `@Validated` 校验失败 | 400 |
| `ConstraintViolationException` | `@RequestParam` 校验失败 / Service 层 `@Validated` 校验失败 | 400 |
| `BindException` | 表单参数绑定失败 | 400 |
| `BusinessException` | 自定义业务异常 | 自定义 |
| `NoHandlerFoundException` | 404 资源不存在 | 404 |
| `HttpMessageNotReadableException` | 请求体 JSON 格式错误 | 400 |
| `MissingServletRequestParameterException` | 缺少必需的请求参数 | 400 |
| `Exception` | 兜底异常 | 500 |

---

## 参数校验

### @Valid vs @Validated

| 维度 | @Valid | @Validated |
|------|--------|------------|
| 来源 | JSR-303/Jakarta 标准（`jakarta.validation.Valid`） | Spring 扩展（`org.springframework.validation.annotation.Validated`） |
| 分组校验 | ❌ | ✅ |
| 嵌套对象校验 | ✅ 可用于字段上 | ❌ 不能用于字段上 |
| 方法参数校验 | ❌ 仅 Controller 的 Bean 入参 | ✅ 支持类/方法/参数 |

### 常用校验注解

| 注解 | 作用 | 支持类型 |
|------|------|---------|
| `@NotNull` | 不能为 null | 所有类型 |
| `@NotBlank` | 不能为 null 且不能为空字符串 | String |
| `@NotEmpty` | 不能为 null 且不能为空（集合/数组/字符串） | String、Collection、Map、Array |
| `@Size(min, max)` | 长度/大小范围 | String、Collection、Map、Array |
| `@Min` / `@Max` | 数值范围 | 数值类型 |
| `@Pattern(regexp)` | 正则匹配 | String |
| `@Email` | 邮箱格式 | String |
| `@Past` / `@Future` | 过去/未来时间 | Date、LocalDate 等 |

### Controller 层校验

```java
// @RequestBody 校验：直接在参数前加 @Valid 或 @Validated
@PostMapping("create")
public void create(@Validated @RequestBody UserDTO dto) { }

// @RequestParam 校验：必须在 Controller 类上加 @Validated
@Validated
@RestController
public class UserController {

    @GetMapping("get")
    public void get(@NotBlank(message = "ID不能为空") @RequestParam String id) { }
}
```

### 分组校验

同一个 DTO 在不同接口复用时，通过定义空的标记接口实现不同字段的校验：

```java
// 定义分组（空接口即可）
public interface CreateGroup {}
public interface UpdateGroup {}

// DTO 字段指定分组
@Data
public class UserDTO {
    @NotBlank(groups = UpdateGroup.class, message = "ID不能为空")
    private String id;

    @NotBlank(groups = CreateGroup.class, message = "名称不能为空")
    private String name;
}

// Controller 使用指定分组
@PostMapping("create")
public void create(@Validated(CreateGroup.class) @RequestBody UserDTO dto) { }

@PostMapping("update")
public void update(@Validated(UpdateGroup.class) @RequestBody UserDTO dto) { }
```

⚠️ **注意：未指定 groups 的字段，在触发分组校验时不会被校验**

### 嵌套对象校验

嵌套了其他 JavaBean 或 List 时，**必须在属性字段上显式添加 @Valid** 才能触发递归校验：

```java
@Data
public class OrderDTO {
    @NotBlank(message = "订单号不能为空")
    private String orderCode;

    @Valid  // 必须加，否则不会校验内部注解
    private OrderFileItem fileItem;

    @Valid  // List 同样必须加
    private List<OrderFileItem> fileList;
}
```

⚠️ **注意：@Validated 不能加在字段上，嵌套校验只能用 @Valid**

### Service 层校验

`@Valid` 无法触发 Service 层的方法参数校验，必须在 Service 类上添加 `@Validated`：

```java
@Service
@Validated  // 类上必须加
public class UserService {

    public void check(@NotBlank(message = "ID不能为空") String id) { }

    public void process(@Valid @NotNull UserDTO dto) { }
}
```

### 自定义校验注解

以 Xss 校验器为例：

```java
// 1. 实现校验器
public class XssValidator implements ConstraintValidator<Xss, String> {
    private static final String HTML_PATTERN = "<(\\S*?)[^>]*>.*?|<.*? />";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        return !containsHtml(value);
    }

    private boolean containsHtml(String value) {
        return Pattern.compile(HTML_PATTERN).matcher(value).matches();
    }
}

// 2. 定义注解
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.METHOD, ElementType.FIELD, ElementType.CONSTRUCTOR, ElementType.PARAMETER })
@Constraint(validatedBy = { XssValidator.class })
public @interface Xss {
    String message() default "不允许任何脚本运行";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

手动触发校验（方法内校验整个实体）：

```java
@Autowired
protected Validator validator;

public void importUser(SysUser user) {
    BeanValidators.validateWithException(validator, user);
}
```

### 常见坑

(1) `@RequestParam` 校验不生效 — 必须在 Controller **类上**加 `@Validated`

(2) 嵌套 List 校验失效 — List 字段前必须加 `@Valid`，否则元素内部注解不生效

(3) 分组校验漏检 — 未指定 groups 的字段不会参与校验，容易遗漏

(4) Spring Boot 3.x 包路径变更 — `javax.validation.Valid` → `jakarta.validation.Valid`

---

## @InitBinder

请求中注册自定义参数的解析，从而达到自定义请求参数格式的目的。

如果出现在全局的 ControllerAdvice 中则全局生效（个人理解上写在 BaseController 中也许更好）。

```java
@InitBinder
public void handleInitBinder(WebDataBinder dataBinder) {
    dataBinder.registerCustomEditor(Date.class,
            new CustomDateEditor(new SimpleDateFormat("yyyy-MM-dd"), false));
}
```

---

## @ModelAttribute

预设全局参数，比如最典型的使用 Spring Security 时将添加当前登录的用户信息（UserDetails）作为参数。

非必要了解。

---

## Binding 注解

在不注解时，默认当 URL 参数处理；当然 form 表单会有额外。

|            |                              |
| ---------- | ---------------------------- |
| FromQuery  | RequestParam（~~PathParam~~） |
| FromRoute  | PathVariable                 |
| FromHeader | RequestHeader                |
| FromBody   | RequestBody                  |
| FromForm   | RequestParam 或缺省?         |

---

## HttpContext

通过请求参数中获取 Request 对象：

```java
public void index(HttpServletRequest request) { }
```

通过 RequestContextHolder 获取 Request 对象：

```java
ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
HttpServletRequest request = attrs.getRequest();
```

通过自动注入获取 Request 对象：

```java
@Autowired
private HttpServletRequest request; // 自动注入 request 对象
```

⚠️ **注意：`RequestContextHolder.getRequestAttributes()` 可能为 null（非 HTTP 请求线程中调用时），使用前需判空**
