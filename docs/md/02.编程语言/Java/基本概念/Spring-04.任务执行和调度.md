# 任务执行和调度

## Spring做了什么

(1) 将线程Executor封装Bean, 可以装配

(2) 提供@Async注解, 标记异步任务



步骤都类似:

1. 在某个Configuration中注解 @EnableAsync
2. 配置一个TaskExecutor的Bean (这个步骤中有建议实现AsyncConfigurer或继承AsyncConfigurerSupport, 未去再细查)
3. 将多线程执行的方法与调用类隔离, 注解@Async(留空 或者 具名执行器名称)

注意点:

*@EnableAsync 注解是必要的, 必须显式声明. 但某些资料中所述它非全局标志是不对的(v2.5+), 也许是版本升级*

*@Async 注解的限制如同Aspect(如代理等), 它会影响代码结构, 现在再看若依方式似乎更好*

*"@Async注解默认SimpleAsyncTaskExecutor" 的说法是过去时, AI给的回答是2.1之后默认是ThreadPoolTaskExecutor, 打印线程名时还是[task-%d]存疑*



### Executor

配置方式:

```yml
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

编码方式:

```java
@Bean(name = "threadPoolTaskExecutor")
public ThreadPoolTaskExecutor threadPoolTaskExecutor()
{
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setMaxPoolSize(200);
    executor.setCorePoolSize(50);
    executor.setQueueCapacity(1000);
    executor.setKeepAliveSeconds(300);
    // 线程池对拒绝任务(无线程可用)的处理策略
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    return executor;
}
```



## (Spring) ThreadPoolTaskExecutor 和 (jdk) ThreadPoolExecutor

前者是Spring在org.springframework.scheduling.concurrent 包下的重新封装, 实际是对java.util.concurrent.Executor的扩展.



基本语法如同: 

```java
// 和Spring中ThreadPoolTaskExecutor对比
ExecutorService executor = Executors.newFixedThreadPool(1);
Future<Integer> future = executor.submit(task);

// Spring中未进行封装
ScheduledExecutorService executor = Executors.newScheduledThreadPool(10);
ScheduledFuture<?> future = executor.schedule();
ScheduledFuture<?> future = executor.scheduleAtFixedRate();
ScheduledFuture<?> future = executor.scheduleWithFixedDelay();
```







