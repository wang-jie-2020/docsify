## 语言国际化

(1) 语言资源文件的配置集成已经在web包中, 默认情况下在resources目录下messages**文件, 如messages_en_US.properties、messages_zh_CN.properties, 默认值见 `MessageSourceProperties`

(2) 语言资源的转换方法在见`MessageSource`

(3) 上述遇到的问题包括: 1.字符编码, IDEA默认properties文件编码是ISO 2.必须有messages.properties(空文件即可,存疑...) 3. 代码配置文件的命名如同zh_CN, Locale命名是zh-CN



## LOCALE 解析器和拦截

当接受到请求时，SpringMVC 会在上下文中查找一个本地化解析器（**LocalResolver**），找到后使用它获取请求所对应的本地化类型信息。

SpringMVC 还允许装配一个**动态更改本地化类型的拦截器**，这样通过指定一个请求参数就可以控制单个请求的本地化类型。



默认情况下，SpringMVC 根据 **Accept-Language** 参数判断客户端的本地化类型。 



*以为Header+Query的模式怎么都足够了，但是并不那么理想，原因是实际上拦截器方法也是通过LocalResolver做到的*

*BUT`AcceptHeaderLocaleResolver`的实现中不支持setLocale方法，所以还是得重写*

![image-20251223150946917](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20251223150946917.png)



*重写之前有个疑问，不能支持从多种策略同时解析么，比如query>header>cookie? 原因见下，大概是设计思路如此，Resolver只加载一个（name+class）。*

![image-20251223143833562](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20251223143833562.png)



```java
@Configuration
public class LocaleConfig implements WebMvcConfigurer {

    /// 默认情况下, LocaleResolver -> AcceptHeaderLocaleResolver {@link org.springframework.web.servlet.DispatcherServlet initLocaleResolver}
    /// LocaleChangeInterceptor 中实际上是通过localeResolver.setLocale() 做的, 而AcceptHeaderLocaleResolver 中该方法并不被支持
    /// LocaleChangeInterceptor 不是完整的设置方式, 所以得重写, 既然重写那么它也就不必要了

    /**
     * 拦截器，支持通过URL参数切换语言
     */
//    @Bean
//    public LocaleChangeInterceptor localeChangeInterceptor() {
//        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
//        interceptor.setParamName("lang"); // 通过?lang=zh_CN切换
//        return interceptor;
//    }

//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(localeChangeInterceptor());
//    }

    @Bean
    @ConditionalOnMissingBean({LocaleResolver.class})
    public LocaleResolver localeResolver() {
        return new CustomHeaderLocaleResolver();
    }

    public static class CustomHeaderLocaleResolver extends AcceptHeaderLocaleResolver {
        @Override
        public Locale resolveLocale(HttpServletRequest request) {
            // 1.参数
            String lang = request.getParameter("lang");
            if (lang != null && !lang.isEmpty()) {
                return Locale.forLanguageTag(lang);
            }

            // 2.Cookie
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("lang".equals(cookie.getName())) {
                        return Locale.forLanguageTag(cookie.getValue());
                    }
                }
            }

            // 3.Header
            return super.resolveLocale(request);
        }
    }
}
```

