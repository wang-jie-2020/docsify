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