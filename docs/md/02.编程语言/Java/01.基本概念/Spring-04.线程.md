# 线程模型与任务调度

![image](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-juc-overview-1-u.png)

---

## 线程模型和线程池模型

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-stpe-1.png)

> 某些基本概念，但不必要细节描述：
>
> 1. 基本的 Thread 模型，单线程，通常会通过匿名 Lambda 表达式输出一个线程任务
> 2. Executor 只是一个根接口，没什么实际用途
> 3. ExecutorService（它是个接口，什么鬼命名）是一个次级接口，实现类基本在它的基础上做，有非常多的实现而不是只有下面列举的...

### ThreadPoolExecutor

ThreadPoolExecutor 才是在项目中真正需要考虑的实现类，ScheduledThreadPoolExecutor 继承于它。

流程：(1) init → (2) submit → (3) shutdown

```java
@Service
public class TaskServiceMocking {

    private ExecutorService executor;

    @PostConstruct
    public void initExecutor() {
        executor = new ThreadPoolExecutor(
                5,
                5,
                60L, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(),
                new ThreadPoolExecutor.CallerRunsPolicy() // 任务满时，提交者线程执行（限流）
        );
    }

    @PreDestroy
    public void shutdownExecutor() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
        }
    }
}
```

*在某些包中对其中有封装，比如 java.util.concurrent.Executors 或者 apache.common，似乎不推荐...*

### Future

> 在项目中，Executor 只要统一配置或者 CP 就可以，相对不太有难点。
>
> 而 Future，才真正解决问题，它的基本接口实现是这样的：
>
> ```java
> public interface Future<V> {
>     boolean cancel(boolean mayInterruptIfRunning);
>     boolean isCancelled();
>     boolean isDone();
>     V get() throws InterruptedException, ExecutionException;
>     V get(long timeout, TimeUnit unit)
>         throws InterruptedException, ExecutionException, TimeoutException;
> }
> ```
>
> ![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-juc-futuretask-1.png)
>
> ```java
> Future<Integer> future = executor.submit(task);
> Integer result = future.get(5, TimeUnit.SECONDS);    // 超时
> future.cancel();    // 中断
> ```
>
> 太过简单毫无实际意义...重点还是在 CompletableFuture

### CompletableFuture

![img](https://raw.gitcode.com/qq_36179938/images/raw/main/2784584-20250330122203924-1650091534.png)

1. 默认由公共线程池执行，需要指定线程池时使用重载方法传递 *Executor* 参数
2. 组合任务时的方法有同步和异步的两类签名（\*\*Async\*），区别在是否有线程切换（对于这点存疑）
3. 在阻塞语句上 *catch* 是能够捕捉错误的，如果非阻塞任务可以考虑在 *exceptionally*、*handle*、*whenComplete* 处理错误（它们都有 *Throwable* 形参）

```java
List<CompletableFuture<Void>> futures = new ArrayList<>();
// ...
// ...
try {
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[futures.size()])).join();
} catch (Exception e) {
    log.error("未知错误:{}", e.getMessage());
}
```

---

## Spring 异步任务

### Spring 做了什么

1. 将线程 Executor 封装为 Bean，可以装配
2. 提供 @Async 注解，标记异步任务

步骤都类似：

1. 在某个 Configuration 中注解 @EnableAsync
2. 配置一个 TaskExecutor 的 Bean（这个步骤中有建议实现 AsyncConfigurer 或继承 AsyncConfigurerSupport，未去再细查）
3. 将多线程执行的方法与调用类隔离，注解 @Async（留空或者具名执行器名称）

注意点：

*@EnableAsync 注解是必要的，必须显式声明。但某些资料中所述它非全局标志是不对的（v2.5+），也许是版本升级*

*@Async 注解的限制如同 Aspect（如代理等），它会影响代码结构，现在再看若依方式似乎更好*

*"@Async 注解默认 SimpleAsyncTaskExecutor" 的说法是过去时，AI 给的回答是 2.1 之后默认是 ThreadPoolTaskExecutor，打印线程名时还是 [task-%d] 存疑*

### ThreadPoolTaskExecutor（Spring 封装）

Spring ThreadPoolTaskExecutor 和 JDK ThreadPoolExecutor：

前者是 Spring 在 `org.springframework.scheduling.concurrent` 包下的重新封装，实际是对 `java.util.concurrent.Executor` 的扩展。

配置方式：

```yaml
spring:
  task:
    execution:
      thread-name-prefix: xxx
      pool:
        max-size: 6
        core-size: 3
        keep-alive: 30s
        queue-capacity: 500
```

编码方式：

```java
@Bean(name = "threadPoolTaskExecutor")
public ThreadPoolTaskExecutor threadPoolTaskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setMaxPoolSize(200);
    executor.setCorePoolSize(50);
    executor.setQueueCapacity(1000);
    executor.setKeepAliveSeconds(300);
    // 线程池对拒绝任务（无线程可用）的处理策略
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    return executor;
}
```

### ThreadPoolTaskExecutor vs ThreadPoolExecutor

| 对比 | ThreadPoolTaskExecutor（Spring） | ThreadPoolExecutor（JDK） |
|------|-------------------------------|--------------------------|
| 来源 | `org.springframework.scheduling.concurrent` | `java.util.concurrent` |
| 线程创建 | 默认创建非守护线程 | 需要配置 ThreadFactory |
| 关闭方式 | 实现了 DisposableBean，Spring 容器关闭时自动执行 | 需手动 shutdown |
| 配置方式 | 支持 yml 配置 + Bean 配置 | 仅代码配置 |
| Spring 集成 | 可被 @Async、@Scheduled 直接引用 | 需要适配 |
| 命名 | 线程名可配置前缀 | 默认 pool-N-thread-M |

```java
// JDK 方式（Spring 中未进行封装）
ScheduledExecutorService executor = Executors.newScheduledThreadPool(10);
ScheduledFuture<?> future = executor.schedule();
ScheduledFuture<?> future = executor.scheduleAtFixedRate();
ScheduledFuture<?> future = executor.scheduleWithFixedDelay();

// Spring 方式
// 和 Spring 中 ThreadPoolTaskExecutor 对比
ExecutorService executor = Executors.newFixedThreadPool(1);
Future<Integer> future = executor.submit(task);
```
