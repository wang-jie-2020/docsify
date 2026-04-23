# 线程模型

![image](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-juc-overview-1-u.png)

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-stpe-1.png)

## 线程模型和线程池模型







## 线程和执行器

(1) 线程模型Thread,interrupt()

(2) 线程池模型ThreadPoolExecutor、ScheduledThreadPoolExecutor

(3) 线程的执行任务模型Runnable以及Callable

(4) 异步结果模型Future



通过匿名或者Lambda表达式指定Thread任务:

```csharp
new Thread(new Runnable() {
    @Override
    public void run() {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        System.out.println("runnable method");
    }
}).start();
```



![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-juc-executors-1.png)



通过Executos指定线程池复用线程:

```java
public interface Executor {
    void execute(Runnable command);
}
```

```java
public interface ExecutorService extends Executor {
    <T> Future<T> submit(Callable<T> task);

    <T> Future<T> submit(Runnable task, T result);

    Future<?> submit(Runnable task);

    <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)
        throws InterruptedException;

    <T> T invokeAny(Collection<? extends Callable<T>> tasks)
        throws InterruptedException, ExecutionException;

    <T> T invokeAny(Collection<? extends Callable<T>> tasks,
                    long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
    
    void shutdown();
    
    boolean awaitTermination(long timeout, TimeUnit unit)
        throws InterruptedException;
    
    List<Runnable> shutdownNow();
}
```

1. 通常不会new出线程池对象而是

   ExecutorService executor = java.util.concurrent.Executors.newSingleThreadExecutor();

   ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);

2. Executor必须显式的停止

   ```java
   try {
       executor.shutdown();
       executor.awaitTermination(5, TimeUnit.SECONDS);
   } catch (InterruptedException e) {
   
   } finally {
       if (!executor.isTerminated()) {
   
       }
       executor.shutdownNow();
   }
   ```

### FutureTask

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-juc-futuretask-1.png)

```java
public interface Future<V> {
    boolean cancel(boolean mayInterruptIfRunning);
    boolean isCancelled();
    boolean isDone();
    V get() throws InterruptedException, ExecutionException;
    V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

```java
 Future<Integer> future = executor.submit(task);
 Integer result = future.get(5, TimeUnit.SECONDS);	//超时
 future.cancel();	//中断
```

