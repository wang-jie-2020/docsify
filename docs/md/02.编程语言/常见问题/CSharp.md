## nginx之Forward头

http规范里对请求头的定义、兼容废弃等标志的很清楚, 按需再查吧.

这里针对的是经过Nginx转发之后的Scheme、Host等进行标识和转存, NetCore中已有相关集成

    proxy_set_header X-Forwarded-Host $the_host/onlyoffice;
    proxy_set_header X-Forwarded-Proto $the_scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;



## C# signalR底板

底板针对的也就是连接数量太多增加了集群负载均衡之后进行的多server同步发送，但似乎有点难以处理逻辑（指的是由自主控制的）


一种比较简单的做法是客户端直连数据中间件，比如MQ、Redis...

通常的demo中都是混合api和hub的，通信通过HubContext，这种方式似乎耦合性高而且也很难继续优化，提供的如redis底板方案最终的落地还是要考虑负载均衡

如果将hub-server从逻辑中拿走，可能效果更好，思路大概如下：

1. 客户端http请求api-server，得到hub-server的url，通过某种算法持久

2. 客户端连接hub-server，持久化连接

3. api-server通过httpClient请求hub-server，传输消息

4. hub-server向客户端输出

   

## C# 使用PYTHON

1. C++的动态库链接(套个中间层)

2. IronPython   

   https://github.com/IronLanguages/ironpython3

   https://github.com/IronLanguages/ironpython3/blob/master/Documentation/package-compatibility.md

3. Pythonnet

   https://github.com/pythonnet/pythonnet



## C# TransactionScope

select for update

select with tablelock

select with nolock

```csharp
 using (var scope = new TransactionScope(TransactionScopeOption.Suppress)) {}

 using (var scope = new TransactionScope(
     TransactionScopeOption.Required, 
     new TransactionOptions { IsolationLevel = IsolationLevel.ReadUncommitted })) {}
```



## C# WCF

以往基本都是单工模式, 偶然遇到了双工模式的例子, 服务端提供了ServiceContract和CallBackContract, 客户端实现了CallBackContract



## C# NPGSQL驱动问题

(1) 在ORACLE迁移OPENGAUSS时，NVARCHAR2的类型无法迁移(不存在此类型)

https://stackoverflow.com/questions/24014147/how-to-convert-string-to-unicode-using-postgresql/24015093#24015093

在JAVA中，通过JDBC正常可以通过查询语句得到ResultSet，而在Net中，报错‘System.Object’‘nvarchar2’....



(2) NPGSQL 9.0版本, 间隔连接数据库时第一次失败, 第二次成功(造成大量定时任务失败)

问题表现有些类似于: https://github.com/npgsql/npgsql/issues/6274

解决方式:(1) 还原到5版本(issue中说从6有问题) (2) 仍旧使用9,但是在连接字符串中增加'SSL Mode=Disable'



## C# URI和URL编码

`Uri.EscapeDataString`

​	用于对URI的数据部分进行编码,将所有非字母数字字符（包括空格）转换为其百分号编码形式

​	和JS中的`encodeURIComponent`一致

`Uri.EscapeUriString`

​	对整个URI进行编码,保留URI中的保留字符（如`?`、`/`、`#`等），不对它们进行编码

​	**和浏览器行为一致,但它被标记为弃用了**

​	和JS中的`encodeURI`一致：encodeURIComponent(proxy.$base64.encode(encodeURI(row.fileUrl)));



## C# 自包含部署

[.NET CLI 发布 .NET 应用](https://learn.microsoft.com/zh-cn/dotnet/core/deploying/deploy-with-cli)

```bash
dotnet publish -c Release -r win10-x64 -o %outPut% --self-contained true

dotnet publish -c Release -r linux-x64 --self-contained true
```



## C# Linux中绘图组件问题

System.Drawing验证码The type initializer for 'Gdip' threw an exception.

Linux部署时由于System.Drawing.Common的路线问题会出现如上错误，这个错误的官方释疑：

https://learn.microsoft.com/zh-cn/dotnet/core/compatibility/core-libraries/6.0/system-drawing-common-windows-only

补充阅读 https://devblogs.microsoft.com/dotnet/net-core-image-processing/

目前可以查询到有些包依赖于此，比如EPPlus的较旧版本。



目前比较合适的nuget：https://gitee.com/pojianbing/lazy-captcha

imageSharp许可证有问题，SkiaSharp也许是最合适目前的（在Linux上可能需要再依赖于官方提供的其他依赖）



## C# jwt

默认错误--userid写在'sub'字段,认证中间件失效

sub 字段作为唯一标识符在各个方面都没有问题,,,微软为什么要强制mapping很长一串的标准值而不是直接的字符 ???



## C# [ApiController]自动模型验证且不经过模型绑定检查

如题,这种问题有点二.

see https://learn.microsoft.com/zh-cn/aspnet/core/web-api/?view=aspnetcore-9.0#apicontroller-attribute

see https://learn.microsoft.com/zh-cn/dotnet/api/microsoft.aspnetcore.mvc.apibehavioroptions?view=aspnetcore-9.0



## C# Http请求处理管道

![img](https://raw.gitcode.com/qq_36179938/images/raw/main/900440-20230430112047263-366313603.png)