# 线程本地存储

[浅析 .NET 中 AsyncLocal 的实现原理](https://www.cnblogs.com/eventhorizon/p/12240767.html)

![image.png](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/20230912132548.png)



AsyncLocal<T> 为我们提供了两个功能

- 通过 Value 属性存取值
- 通过构造函数注册回调函数监听任意线程中对值做出的改动

```csharp
public sealed class AsyncLocal<T> : IAsyncLocal
{
    private readonly Action<AsyncLocalValueChangedArgs<T>>? m_valueChangedHandler;
    
    // 无参构造
    public AsyncLocal()
    {
    }
    
    // 可以注册回调的构造函数，当 Value 在任意线程被改动，将调用回调
    public AsyncLocal(Action<AsyncLocalValueChangedArgs<T>>? valueChangedHandler)
    {
        m_valueChangedHandler = valueChangedHandler;
    }
    
    [MaybeNull]
    public T Value
    {
        get
        {
            // 从 ExecutionContext 中以自身为 Key 获取值
            object? obj = ExecutionContext.GetLocalValue(this);
            return (obj == null) ? default : (T)obj;
        }
        // 是否注册回调将回影响到 ExecutionContext 是否保存其引用
        set => ExecutionContext.SetLocalValue(this, value, m_valueChangedHandler != null);
    }
    
    // 在 ExecutionContext 如果判断到值发生了变化，此方法将被调用
    void IAsyncLocal.OnValueChanged(object? previousValueObj, object? currentValueObj, bool contextChanged)
    {
        Debug.Assert(m_valueChangedHandler != null);
        T previousValue = previousValueObj == null ? default! : (T)previousValueObj;
        T currentValue = currentValueObj == null ? default! : (T)currentValueObj;
        m_valueChangedHandler(new AsyncLocalValueChangedArgs<T>(previousValue, currentValue, contextChanged));
    }
}

internal interface IAsyncLocal
{
    void OnValueChanged(object? previousValue, object? currentValue, bool contextChanged);
}
```

ExecutionContext是真实的存取对象，每个线程都关联着一个执行上下文Thread.CurrentThread.ExecutionContext

在同一个线程中，所有 **AsyncLocal** 所保存的 **Value** 都保存在 **ExecutionContext** 的 **m_localValues** 字段上

```cshar
public class ExecutionContext
{
    private readonly IAsyncLocalValueMap m_localValues;
}
```

随着 ExecutionContext 所关联的 AsyncLocal 数量的增加，IAsyncLocalValueMap 的实现将会在ExecutionContext的SetLocalValue方法中被**不断替换**。查询的**时间复杂度和空间复杂度依次递增**。代码的实现与 AsyncLocal 同属于 一个文件。当然元素数量减少时也会替换成之前的实现。

```csharp
if (current != null)
{
    newValues = current.m_localValues.Set(local, newValue, treatNullValueAsNonexistent: !needChangeNotifications);
}
else
{
    newValues = AsyncLocalValueMap.Create(local, newValue, treatNullValueAsNonexistent: !needChangeNotifications);
}
```

![image-20230912135856570](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/image-20230912135856570.png)

![image-20230912135830655](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/image-20230912135830655.png)



