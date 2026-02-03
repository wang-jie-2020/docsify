## 依赖注册时

无论如何都是`IMvcBuilder`的链式调用, 在链路上可以对Mvc模式的行为进行修改, 会有如下几种:

1. AddControllers()

2. AddControllersWithViews()

3. AddMvc()

范围从小到大而已, 代码片段如下:

```csharp
public static IMvcBuilder AddControllers(this IServiceCollection services)
{
    ArgumentNullException.ThrowIfNull(services);

    var builder = AddControllersCore(services);
    return new MvcBuilder(builder.Services, builder.PartManager);
}

public static IMvcBuilder AddControllersWithViews(this IServiceCollection services)
{
    ArgumentNullException.ThrowIfNull(services);

    var builder = AddControllersWithViewsCore(services);
    return new MvcBuilder(builder.Services, builder.PartManager);
}

private static IMvcCoreBuilder AddControllersWithViewsCore(IServiceCollection services)
{
    var builder = AddControllersCore(services)
        .AddViews()
        .AddRazorViewEngine()
        .AddCacheTagHelper();

    AddTagHelpersFrameworkParts(builder.PartManager);

    return builder;
}

public static IMvcBuilder AddMvc(this IServiceCollection services)
{
    ArgumentNullException.ThrowIfNull(services);

    services.AddControllersWithViews();
    return services.AddRazorPages();
}
```



## 中间件时

约定路由, 包括MapControllerRoute()、MapDefaultControllerRoute()

```csharp
// MapControllerRoute()的写法, MapDefaultControllerRoute实际上就是这个,只是写个Default而已.
endpoints.MapControllerRoute(
  name:"default",
  pattern:"{controller=Home}/{action=index}/{id?}"
);
```



特性路由, **MapControllers()**,不对约定路由做任何假设，也就是不使用约定路由，依赖用户的**特性路由**