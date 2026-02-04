![img](https://raw.gitcode.com/qq_36179938/images/raw/main/2784584-20250330122203924-1650091534.png)

一、执行线程池和线程切换

默认由公共线程池执行, 需要指定线程池时使用重载方法传递*Executor*参数. 

组合任务时的方法有同步和异步的两类签名(**Async*), 区别在是否有线程切换(对于这点存疑)



二、异常处理

在阻塞语句上*catch*是能够捕捉错误的, 如果非阻塞任务可以考虑在*exceptionally*、*handle*、*whenComplete*处理错误(它们都有*Throwable*形参).



三、简单例子

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

