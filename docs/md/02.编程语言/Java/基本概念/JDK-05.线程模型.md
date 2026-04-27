# 线程模型

![image](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-juc-overview-1-u.png)



## 线程模型和线程池模型

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-stpe-1.png)

> 某些基本概念, 但是不太必要细节描述:
>
> (1) 基本的Thread模型, 单线程, 通常会通过匿名Lambda表达式输出一个线程任务
>
> (2) Executor只是一个根接口, 没什么实际用途
>
> (3) ExecutorService(它是个接口,什么鬼命名)是一个次级接口, 实现类基本在它的基础上做, 有非常多的实现而不是只有下面列举的实现...

### ThreadPoolExecutor

ThreadPoolExecutor 才是在项目中真正需要考虑的实现类, ScheduledThreadPoolExecutor 继承于它

(1) init (2) submit (3) shutdown

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

*在某些包中对其中有封装, 比如java.util.concurrent.Executors 或者 apache.common, 似乎不推荐...*



### CompletableFuture

>在项目中, Executor只要统一配置或者CP就可以, 相对不太有难点.
>
>而Future, 才真正解决问题, 它的基本接口实现是这样的:
>
>```java
>public interface Future<V> {
>    boolean cancel(boolean mayInterruptIfRunning);
>    boolean isCancelled();
>    boolean isDone();
>    V get() throws InterruptedException, ExecutionException;
>    V get(long timeout, TimeUnit unit)
>        throws InterruptedException, ExecutionException, TimeoutException;
>}
>```
>
>![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-juc-futuretask-1.png)
>
>```java
> Future<Integer> future = executor.submit(task);
> Integer result = future.get(5, TimeUnit.SECONDS);	//超时
> future.cancel();	//中断
>```
>
>太过简单毫无实际意义...重点还是在CompletableFuture



![img](https://raw.gitcode.com/qq_36179938/images/raw/main/2784584-20250330122203924-1650091534.png)

1. 默认由公共线程池执行, 需要指定线程池时使用重载方法传递*Executor*参数. 

2. 组合任务时的方法有同步和异步的两类签名(**Async*), 区别在是否有线程切换(对于这点存疑)

3. 在阻塞语句上*catch*是能够捕捉错误的, 如果非阻塞任务可以考虑在*exceptionally*、*handle*、*whenComplete*处理错误(它们都有*Throwable*形参).



```java
List<CompletableFuture<Void>> futures = new ArrayList<>();
...
...
try {
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[futures.size()])).join();
} catch (Exception e) {
    log.error("未知错误:{}", e.getMessage());
}
```

