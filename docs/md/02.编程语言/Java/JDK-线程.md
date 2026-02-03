# 多线程

概念性东西会比较引起误解,类似的有描述异步任务、线程执行器的相应封装.

![image](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-juc-overview-1-u.png)

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

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-thread-x-stpe-1.png)

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

## 线程同步

1. **synchronized** 关键字,修饰方法,修饰代码块
2. Wait()、Notify()	Object方法，类似于ManualResetEvent，信号模式
3. **ReentrantLock** 互斥锁 lock()
4. Condition await() signal()

| 比较项目       | wait             | await            | sleep          | yield        | join             |
| -------------- | ---------------- | ---------------- | -------------- | ------------ | ---------------- |
| 是否释放持有锁 | 释放             | 释放             | 不释放         | 不释放       | t1不释放         |
| 谁的方法       | Object           | Condition        | Thread         | Thread       | 线程对象         |
| 唤醒方法       | nogify/nogifyAll | signal/signalAll | 指定时间后     | 自动唤醒     | t2执行完自动唤醒 |
| 何时就绪       | 唤醒后就绪       | 唤醒后就绪       | 指定时间后就绪 | 立刻进入就绪 | t2完成后进入就绪 |
| 执行环境       | 同步代码块       | 同步代码快       | 任意位置       | 任意位置     | 任意位置         |

## 数据结构

ThreadLocal

InheritableThreadLocal

TransmittableThreadLocal



## 其他

juc ... java.utils.concurrnet 

**AtomicInteger**

**Collections.sychronizedList()**