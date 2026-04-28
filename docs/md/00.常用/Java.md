## Java Jar包参数

```bash
@echo off
echo.
echo [信息] 使用Jar命令运行Gateway工程。
echo.

cd %~dp0
cd ../ruoyi-gateway/target

set JAVA_OPTS=-Xms512m -Xmx1024m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m

java -Dfile.encoding=utf-8 %JAVA_OPTS% -jar ruoyi-gateway.jar

cd bin
pause
```

-Xms分配堆最小内存，默认为物理内存的1/64；-Xmx分配最大内存，默认为物理内存的1/4。
非堆内存分配用-XX:PermSize和-XX:MaxPermSize

-XX:PermSize分配非堆最小内存，默认为物理内存的1/64；-XX:MaxPermSize分配最大内存，默认为物理内存的1/4。



实际运行参数:

```bash
  -XX:+UseContainerSupport -XX:InitialRAMPercentage=60.0
  -XX:MaxRAMPercentage=60.0 -XX:MetaspaceSize=256M
  -XX:MaxMetaspaceSize=256M -XX:NewRatio=1 -XX:SurvivorRatio=4
  -XX:NativeMemoryTracking=summary -XX:+PrintGCDetails
  -XX:+PrintGCDateStamps -XX:+PrintGCCause -XX:+UseGCLogFileRotation 
  -XX:+PrintHeapAtGC -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=20M 
  -Xloggc:/app/logs/gc-%t.log -XX:+HeapDumpOnOutOfMemoryError 
  -XX:HeapDumpPath=/app/logs/
```



```bash
# 1. 查找目标Java进程PID
jps -l

# 2. 使用jmap导出
jmap -dump:live,format=b,file=heap.hprof <PID>

# 3. 压缩文件（可选）
gzip heap.hprof


## jcmd <PID> GC.heap_dump <文件路径>
## curl -X POST http://localhost:8080/actuator/heapdump -o heapdump.hprof
```




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