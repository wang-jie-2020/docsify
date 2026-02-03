## 一、发布订阅过程

创建一个 `DiagnosticSource`, 必须填入诊断器名称, 必须填入事件名称.

```csharp
// 定义一个发布(类名不需在意, DiagnosticListener 继承了 DiagnosticSource)
protected static readonly DiagnosticListener _diagnosticListener = new DiagnosticListener(BizDiagnosticConsts.Listener);

if (_diagnosticListener.IsEnabled(BizDiagnosticConsts.StartEvent))
{
    _diagnosticListener.Write(BizDiagnosticConsts.StartEvent, act);
}
```

订阅时的第一个过程是 筛选诊断器名称, 第二个过程是筛选事件名称, 这里都是简单的实现, 参数上前者是`IObserver<DiagnosticListener>`, 后者是

`IObserver<KeyValuePair<string, object?>>`

```csharp
DiagnosticListener.AllListeners.Subscribe(new BizDiagnosticProcessorObserver());

class BizDiagnosticProcessorObserver : IObserver<DiagnosticListener>
{
    public void OnCompleted()
    {

    }

    public void OnError(Exception error)
    {

    }

    public void OnNext(DiagnosticListener value)
    {
        // 判断诊断器名称是否符合订阅要求
        if (value.Name == BizDiagnosticConsts.Listener)
        {
            //value.Subscribe(new BizDiagnosticObserver());
            //value.Subscribe(new BizDiagnosticObserver(), (name, _, _) => name == startEventName);

            //虽然提供了重载, 但似乎不太必要, 因为Adapter已经根据注解存在与否判断是否Enabled
            value.SubscribeWithAdapter(new BizDiagnosticAdapter());
            //value.SubscribeWithAdapter(new BizDiagnosticAdapter(), (name, _, _) => name == endEventName);
        }
    }
}
```

`Microsoft.Extensions.DiagnosticAdapter` 可以简化这个过程, 内部实现还是有点东西的. 需要注意的是参数必须和发布时一致

```csharp
class BizDiagnosticObserver : IObserver<KeyValuePair<string, object?>>
{
    public void OnCompleted()
    {

    }

    public void OnError(Exception error)
    {

    }

    public void OnNext(KeyValuePair<string, object?> value)
    {
        Console.WriteLine(value.Key + ": " + value.Value);
    }
}

class BizDiagnosticAdapter
{
    [DiagnosticName(BizDiagnosticConsts.StartEvent)]
    public void StartEvent()
    {

    }

    [DiagnosticName(BizDiagnosticConsts.EndEvent)]
    public void EndEvent()
    {

    }
}
```

## 二、AspNetCore的Http请求记录

[DiagnosticSourceUsersGuide](https://github.com/dotnet/runtime/blob/main/src/libraries/System.Diagnostics.DiagnosticSource/src/DiagnosticSourceUsersGuide.md)

1. https://github.com/dotnet/aspnetcore/blob/main/src/Hosting/Hosting/src/Internal/HostingApplication.cs#L18

2. https://github.com/dotnet/aspnetcore/blob/v9.0.10/src/Hosting/Hosting/src/Internal/HostingApplicationDiagnostics.cs

![image-20251020133046593](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20251020133046593.png)

![image-20251020133114952](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20251020133114952.png)



一些理解:

1. Activity 作为贯穿的记录, 由 `ActivitySource` 创建, 由 `HttpContext`流转, 它的各种设计覆盖了很多方面...
2. TraceId 是标记上下文的唯一Id, 它会由Activity 的方法进行联通赋值...
3. Http请求过程的记录是繁杂的, 其他组件的记录可能相对容易一些, 但是Trace的流转也不是那么好切入的...



## 三、Skyapm的实现思路(简要)

背景是 增强启动, https://www.cnblogs.com/wucy/p/14013622.html

"ASPNETCORE_HOSTINGSTARTUPASSEMBLIES": "SkyAPM.Agent.AspNetCore"



注册 `IHostedService`(InstrumentationHostedService), 程序启动时启用订阅过程 和 发送过程.

```csharp
 public class InstrumentStartup : IInstrumentStartup
 {
     private readonly TracingDiagnosticProcessorObserver _observer;
     private readonly IEnumerable<IExecutionService> _services;
     private readonly ILogger _logger;

     public InstrumentStartup(TracingDiagnosticProcessorObserver observer, IEnumerable<IExecutionService> services, ILoggerFactory loggerFactory)
     {
         _observer = observer;
         _services = services;
         _logger = loggerFactory.CreateLogger(typeof(InstrumentStartup));
     }

     public async Task StartAsync(CancellationToken cancellationToken = default(CancellationToken))
     {
         _logger.Information("Initializing ...");
         foreach (var service in _services)
             await service.StartAsync(cancellationToken);
         DiagnosticListener.AllListeners.Subscribe(_observer);
         _logger.Information("Started SkyAPM .NET Core Agent.");
     }

     public async Task StopAsync(CancellationToken cancellationToken = default(CancellationToken))
     {
         foreach (var service in _services)
             await service.StopAsync(cancellationToken);
         _logger.Information("Stopped SkyAPM .NET Core Agent.");
         // ReSharper disable once MethodSupportsCancellation
         await Task.Delay(TimeSpan.FromSeconds(2));
     }
 }
```



```csharp
public class TracingDiagnosticProcessorObserver : IObserver<DiagnosticListener>
{
    // _tracingDiagnosticProcessors 即内部接口, 实际就是adapter的变化, 对发布者进行订阅
    foreach (var diagnosticProcessor in _tracingDiagnosticProcessors.Distinct(x => x.ListenerName))
    {
        if (listener.Name == diagnosticProcessor.ListenerName)
        {
            Subscribe(listener, diagnosticProcessor);
            _logger.Information(
                $"Loaded diagnostic listener [{diagnosticProcessor.ListenerName}].");
        }
    }
}
```



![image-20251020135630610](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20251020135630610.png)