## nginx之Forward头

http规范里对请求头的定义、兼容废弃等标志的很清楚, 按需再查吧.

这里针对的是经过Nginx转发之后的Scheme、Host等进行标识和转存

```nginx
proxy_set_header X-Forwarded-Host $the_host/onlyoffice;
proxy_set_header X-Forwarded-Proto $the_scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

已有相关集成

```csharp
services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    //新增如下两行
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

app.UseForwardedHeaders();
```

