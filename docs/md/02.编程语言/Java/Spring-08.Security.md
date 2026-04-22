## 前置

通过`DelegatingFilterProxy` 嵌入 `SecurityFilterChain`

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/v2-e8db1153feba42975920dc7d1c33661f_720w.webp)

## 处理链路

### 认证过程

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/v2-700d7fdce90099c6f2d4c9873eaa5259_720w.webp)

上述过程:

1. 请求经过Chain中过滤器, 构建出了一个Authentication(相当于Principal)
2. AuthenticationManager 校验Authentication是否合法
3. Success时保存到SecurityContextHolder,执行成功处理
4. Failure时,执行失败处理



详细的过程如下(默认,实际上目前的主流是从jwt中直接以token的方式避免掉多余的认证过程):

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/a9c87d1851a94259ac2c603e75c39b2c.png)





AuthenticationManager如下:

![在这里插入图片描述](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/a7013f51aa6d4cc88468e4d1ab93c888.png)

也就是说具体的认证过程实际是在 UserDetailsService. 如果认证通过, 信息会存入SecurityContextHolder 

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/v2-ccd782380492892f01fcdca08a5eebd7_720w.webp)

Authentication 即认证结果,类似于Identity,最终存于 `SecurityContextHolder`

```java
public interface Authentication extends Principal, Serializable {
    Collection<? extends GrantedAuthority> getAuthorities();

    Object getCredentials();

    Object getDetails();

    Object getPrincipal();

    boolean isAuthenticated();

    void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException;
}

Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
Identity identity = (Identity) authentication.getPrincipal();
```

## 鉴权

@preAuthorize

![image-20230925140657233](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/image-20230925140657233.png)

| **表达式**                     | **描述**                                                     |
| ------------------------------ | ------------------------------------------------------------ |
| hasRole([role])                | 当前用户是否拥有指定角色。                                   |
| hasAnyRole([role1,role2])      | 多个角色是一个以逗号进行分隔的字符串。如果当前用户拥有指定角色中的任意一个则返回true。 |
| hasAuthority([auth])           | 等同于hasRole                                                |
| hasAnyAuthority([auth1,auth2]) | 等同于hasAnyRole                                             |
| Principle                      | 代表当前用户的principle对象                                  |
| authentication                 | 直接从SecurityContext获取的当前Authentication对象            |
| permitAll                      | 总是返回true，表示允许所有的                                 |
| denyAll                        | 总是返回false，表示拒绝所有的                                |
| isAnonymous()                  | 当前用户是否是一个匿名用户                                   |
| isRememberMe()                 | 表示当前用户是否是通过Remember-Me自动登录的                  |
| isAuthenticated()              | 表示当前用户是否已经登录认证成功了。                         |
| isFullyAuthenticated()         | 如果当前用户既不是一个匿名用户，同时又不是通过Remember-Me自动登录的，则返回true。 |

实际项目直接基于Role的鉴权结构比较少,通常都是限定权限常量是否包含在授权列表中(更细节一些).

hasAuthority、hasPermission实际上都是从Authentication中的Authorities中判断.

RuoYi中考虑的是方法级的认证,通过注解启用@preAuthorize

`@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)`

```java
@PreAuthorize("@ss.hasPermi('system:menu:list')")

// 其中的ss即指定命名的Bean
@Service("ss")
public class PermissionService {
    ....
}
```

## JWT

大致逻辑是: filterChain中嵌入自定义tokenFilter(UsernamePasswordAuthenticationFilter之前), 通过token拿到信息包装之后即可.

在这个过程之前的登录 可以通过实现UserDetailsService来进行验证过程(这不是强制必要的)

## 跨域

在spring-mvc中的WebMvcConfigurer.addCorsMappings()中可以做到跨域

但一旦和SpringSecurity结合使用就不能正常运行,这个结果是因为SpringSecurity注册的过滤器拦截了跨域的预检请求(到不了spring中)

1.不使用mvc的配置,而是通过CorsFilter的Bean 

2.httpSecurity.addFilterBefore(corsFilter, JwtAuthenticationTokenFilter.class);



















