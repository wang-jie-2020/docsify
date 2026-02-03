语言国际化的背景:

(1) 语言地区的概念是不同于时区, 地区和语言之间有联系(当然这和代码实现关联不大)

​	地区	  语言	   语言根

​	zh-CN -> zh-Hans -> zh

​	zh-HK -> zh-Hant -> zh

​	zh-SG -> zh-Hans -> zh

(2) 时区的概念同样有联系, 但是标准不同

语言标准中实际上未进行全量实现, 而是依赖OS去做了关系.



## 一、AspnetCore中的语言标记

CultureInfo 对象中描述的是地区和其OS输出的格式, 在代码中当然不必考虑非常多的视觉修改, 需要知道的是:

(1) 线程本地存储(更具体一点是AsyncLocal)

(2) 在HttpContext中再包裹了RequestCulture提供如Default之类的东西

(3) app.UseRequestLocalization() 会附带责任链模式的CultureProvider, 从Query、Cookie、Header、Route等等中匹配(有默认名称)

​	"Accept-Language" 可以理解, 其他的比如"culture"

```csharp
public async Task Invoke(HttpContext context)
{
    if (context == null)
    {
        throw new ArgumentNullException(nameof(context));
    }

    var requestCulture = _options.DefaultRequestCulture;

    IRequestCultureProvider? winningProvider = null;

    if (_options.RequestCultureProviders != null)
    {
        foreach (var provider in _options.RequestCultureProviders)
        {
            //这里是个核心点，从不同的位置拿到当前请求的Culture
            var providerResultCulture = await provider.DetermineProviderCultureResult(context);
            .....
			.....
            var result = new RequestCulture(cultureInfo, uiCultureInfo);
            requestCulture = result;
            winningProvider = provider;
            break;
        }
    }

    //todo 这里 
    context.Features.Set<IRequestCultureFeature>(new RequestCultureFeature(requestCulture, winningProvider));

    //todo 这里
    SetCurrentThreadCulture(requestCulture);

    if (_options.ApplyCurrentCultureToResponseHeaders)
    {
        var headers = context.Response.Headers;
        headers.ContentLanguage = requestCulture.UICulture.Name;
    }

    await _next(context);
}
```



![img](https://cdn.nlark.com/yuque/0/2024/png/1294764/1715842318795-ce6095d8-a816-4ebf-8cb5-8c100a3e1502.png)



## 二、默认语言处理器和改造

默认提供的语言处理器资源是基于嵌入资源resx的, 这基本等于毫无作用, 官方文档中提到了以json和db存储的扩展:

https://learn.microsoft.com/zh-cn/aspnet/core/fundamentals/localization-extensibility?view=aspnetcore-8.0



简单来说,通过 IStringLocalizer 、IStringLocalizerFactory 翻译, 

```csharp
public interface IStringLocalizerFactory
{
    IStringLocalizer Create(Type resourceSource);
    IStringLocalizer Create(string baseName, string location);
}

public interface IStringLocalizer
{
    LocalizedString this[string name] { get; }
    LocalizedString this[string name, params object[] arguments] { get; }
    IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures);
}

public interface IStringLocalizer<out T> : IStringLocalizer
{
}
```



泛型的IStringLocalizer实际上并没有特殊，只不过是在查找资源时对资源路径范围有个约束。

默认有StringLocalizer<T>的实现，而并没有StringLocalizer的实现。

```csharp
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Shared;

namespace Microsoft.Extensions.Localization;

public class StringLocalizer<TResourceSource> : IStringLocalizer<TResourceSource>
{
    private readonly IStringLocalizer _localizer;
    
    public StringLocalizer(IStringLocalizerFactory factory)
    {
        ArgumentNullThrowHelper.ThrowIfNull(factory);

        _localizer = factory.Create(typeof(TResourceSource));
    }

    public virtual LocalizedString this[string name]
    {
        get
        {
            ArgumentNullThrowHelper.ThrowIfNull(name);

            return _localizer[name];
        }
    }

    public virtual LocalizedString this[string name, params object[] arguments]
    {
        get
        {
            ArgumentNullThrowHelper.ThrowIfNull(name);

            return _localizer[name, arguments];
        }
    }

    public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) =>
        _localizer.GetAllStrings(includeParentCultures);
}
```
