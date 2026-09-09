# HttpClientFactory

>尝试结合Refit、Nacos、Polly控制HttpClient，需要对HttpClientFactory的构造过程详细分析

## HttpClient

`HttpClient`隐藏了细节，它只是一个装饰，在内部实现中真正的处理由`HttpMessageInvoker`、`HttpMessageHandler`组成.

```csharp
public partial class HttpClient : HttpMessageInvoker
{
    // 1. 构造中限定了必须包含一个HttpMessageHandler，HttpClientHandler继承了HttpMessageHandler
    public HttpClient() : this(new HttpClientHandler())  
    {  
    }  

    public HttpClient(HttpMessageHandler handler) : this(handler, true)  
    {  
    }  

    public HttpClient(HttpMessageHandler handler, bool disposeHandler) : base(handler, disposeHandler)  
    {  
    }
    
    // 2. HttpClient中的GetAsync、SendAsync 最终转向 HttpMessageInvoker.SendAsync执行
    public Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, HttpCompletionOption completionOption, CancellationToken cancellationToken)
     {
         ...;
         response = await base.SendAsync(request, cts.Token).ConfigureAwait(false);
         ...;
     }
}

public class HttpMessageInvoker : IDisposable
{
    // 3. HttpMessageInvoker 也并不实现具体TCP，而是通过Hander的Pipeline实现
    public virtual Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)  
    {  
        return _handler.SendAsync(request, cancellationToken);   
    }
}
```

HttpClient.Send()实际是由HttpClientHandler具体实现的,即System.Net.Http.SocketsHttpHandler才是其内部真正的handler

```csharp
using HttpHandlerType = System.Net.Http.SocketsHttpHandler;

public partial class HttpClientHandler : HttpMessageHandler
{
    private HttpMessageHandler Handler
#if TARGET_BROWSER
            { get; }
#else
            => _underlyingHandler;
#endif
    
     public HttpClientHandler()
     {
          _underlyingHandler = new HttpHandlerType();
     }
    
    protected internal override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>	Handler.SendAsync(request, cancellationToken);
}
```

**Hander的Pipeline ** 在上述的过程中不明显，实现的实际含义往下看

## HttpClientFactory

### DI

通过Microsoft.Extensions.DependencyInjection中的扩展方法添加依赖注册

```csharp
IServiceCollection AddHttpClient(this IServiceCollection services)
IHttpClientBuilder AddHttpClient(this IServiceCollection services, string name);
IHttpClientBuilder AddHttpClient(this IServiceCollection services, string name, Action<IServiceProvider, HttpClient> configureClient)
```

其中核心是: `DefaultHttpClientFactory`、`DefaultHttpMessageHandlerBuilder`, 当然也有些方法重载.

```csharp
 public static IServiceCollection AddHttpClient(this IServiceCollection services)
 {
     services.TryAddSingleton<DefaultHttpClientFactory>();
     services.TryAddSingleton<IHttpClientFactory>(serviceProvider =>
                                                 serviceProvider.GetRequiredService<DefaultHttpClientFactory>());

     services.TryAddTransient<HttpMessageHandlerBuilder, DefaultHttpMessageHandlerBuilder>();
     services.TryAddSingleton<IHttpMessageHandlerFactory>(serviceProvider => 	
                                                         serviceProvider.GetRequiredService<DefaultHttpClientFactory>());

     services.TryAddTransient(s =>
                             {
                                 return s.GetRequiredService<IHttpClientFactory>().CreateClient(string.Empty);
                             });
 }

public static IHttpClientBuilder AddHttpClient(this IServiceCollection services, string name)
{
    AddHttpClient(services);
    return new DefaultHttpClientBuilder(services, name);
}
```

### DefaultHttpClientFactory

其中的配置项来自于 `HttpClientFactoryOptions`,在 `DefaultHttpClientFactory`的`CreateClient(string name)` 组装:

```csharp
internal class DefaultHttpClientFactory : IHttpClientFactory, IHttpMessageHandlerFactory
{
    private readonly IOptionsMonitor<HttpClientFactoryOptions> _optionsMonitor;
    
    public DefaultHttpClientFactory()
    {
         _entryFactory = (name) =>
                {
                    return new Lazy<ActiveHandlerTrackingEntry>(() =>
                    {
                        return CreateHandlerEntry(name);
                    }, LazyThreadSafetyMode.ExecutionAndPublication);
                };    
    }
    
    public HttpClient CreateClient(string name)
    {
        // ★ 创建handler
        HttpMessageHandler handler = CreateHandler(name);
        var client = new HttpClient(handler, disposeHandler: false);

        HttpClientFactoryOptions options = _optionsMonitor.Get(name);
        for (int i = 0; i < options.HttpClientActions.Count; i++)
        {
            options.HttpClientActions[i](client);
        }

        return client;
    }
    
    public HttpMessageHandler CreateHandler(string name)
    {
        ThrowHelper.ThrowIfNull(name);

        // ★ HashSet & Factory方法
        ActiveHandlerTrackingEntry entry = _activeHandlers.GetOrAdd(name, _entryFactory).Value;

        StartHandlerEntryTimer(entry);

        return entry.Handler;
    }
    
    internal ActiveHandlerTrackingEntry CreateHandlerEntry(string name)
    {
        IServiceProvider services = _services;
        var scope = (IServiceScope?)null;

        HttpClientFactoryOptions options = _optionsMonitor.Get(name);
        if (!options.SuppressHandlerScope)
        {
            scope = _scopeFactory.CreateScope();
            services = scope.ServiceProvider;
        }

        try
        {
            // ★ 这里很精彩
            HttpMessageHandlerBuilder builder = services.GetRequiredService<HttpMessageHandlerBuilder>();
            builder.Name = name;

            Action<HttpMessageHandlerBuilder> configure = Configure;
            for (int i = _filters.Length - 1; i >= 0; i--)
            {
                configure = _filters[i].Configure(configure);
            }

            configure(builder);

            var handler = new LifetimeTrackingHttpMessageHandler(builder.Build());

            return new ActiveHandlerTrackingEntry(name, handler, scope, options.HandlerLifetime);

            void Configure(HttpMessageHandlerBuilder b)
            {
                for (int i = 0; i < options.HttpMessageHandlerBuilderActions.Count; i++)
                {
                    options.HttpMessageHandlerBuilderActions[i](b);
                }

                foreach (Action<HttpMessageHandlerBuilder> action in options.LoggingBuilderActions)
                {
                    action(b);
                }
            }
        }
        catch
        {
            scope?.Dispose();
            throw;
        }
    }
}
```

到了逐渐清楚，`HttpMessageHandlerBuilder` 通过 `HttpClientFactoryOptions`中的HttpMessageHandlerBuilderActions 拓展, 典型的扩展方法比如注册PrimaryHander和AdditionAlHandler

![image-20250414141211362](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/image-20250414141211362.png)

![image-20250414141243088](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/image-20250414141243088.png)

![image-20250414141302873](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/image-20250414141302873.png)

### Handler CreateHandlerPipeline

最终的步骤中，通过Inner的链式构成了一个PipeLine

```csharp
internal sealed class DefaultHttpMessageHandlerBuilder : HttpMessageHandlerBuilder
{
    public override HttpMessageHandler Build()
    {
          HttpMessageHandlerBuilder.CreateHandlerPipeline(this.PrimaryHandler, (IEnumerable<DelegatingHandler>) this.AdditionalHandlers) 
    }
    
    protected internal static HttpMessageHandler CreateHandlerPipeline(HttpMessageHandler primaryHandler, IEnumerable<DelegatingHandler> additionalHandlers)
        {
            IReadOnlyList<DelegatingHandler> additionalHandlersList = additionalHandlers as IReadOnlyList<DelegatingHandler> ?? additionalHandlers.ToArray();

            HttpMessageHandler next = primaryHandler;
            for (int i = additionalHandlersList.Count - 1; i >= 0; i--)
            {
                DelegatingHandler handler = additionalHandlersList[i];
				
                ...

                handler.InnerHandler = next;
                next = handler;
            }

            return next;
        }
}
```



![image-20250526093033653](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20250526093033653.png)

