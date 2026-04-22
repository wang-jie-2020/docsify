## 程序静态资源

(1) org.springframework.util.ClassUtils

(2) org.springframework.core.io.ClassPathResource

(3) org.springframework.util.ResourceUtils

也许还有其他,,,



```java
InputStream resourceAsStream = ClassUtils.getDefaultClassLoader().getResourceAsStream("mail.properties");

ClassPathResource classPathResource = new ClassPathResource("mail.properties");
```



## web静态资源

默认情况下, 以下目录中的文件会自动匹配URL(按顺序):

​	classpath:/META-INF/resources/,

​	classpath:/resources/,   -> 默认的resources再新建resources目录

​	classpath:/static/,

​	classpath:/public/

虽然可以通过配置修改其默认指向位置, 但实际不会有如此场景而是通过增加路径映射,比如:

```java
    /**
     *  添加处理器以从 Web 应用程序根目录、类路径等的特定位置提供静态资源，例如图像、js 和 css 文件。
     */
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("files/**")
                .addResourceLocations("file:" + "D:/home/");
    }
```

