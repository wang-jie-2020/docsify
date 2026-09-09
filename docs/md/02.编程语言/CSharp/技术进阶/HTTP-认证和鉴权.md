## Authentication

```csharp
services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
	.....
});
```



在中间件中，通过Scheme指定的handler尝试获取Request中的identity（通过AuthenticationService）

![img](https://cdn.nlark.com/yuque/0/2023/png/1294764/1695347920574-07f5d1c8-0c79-4f2c-9a8f-624933088eb0.png)



通过schme 得到具体的 handler

![img](https://cdn.nlark.com/yuque/0/2023/png/1294764/1695349155476-328ca2a3-50a8-4a00-97aa-1d4204054ea7.png)



jwt hander：

![img](https://cdn.nlark.com/yuque/0/2023/png/1294764/1695349468912-94cc6968-d149-4525-a1b9-ec9ff6dcad70.png)![img](https://cdn.nlark.com/yuque/0/2023/png/1294764/1695349535014-adb30d0e-ef9d-48ee-a616-72d334b1aa34.png)

最终到HttpContext.Principal，中间件继续流向AuthorizationMiddleware



## Authorization

### AuthorizationMiddleware

在中间件中主要执行的思路：

1. 在终结点EndPoint上找到认证元数据
2. 通过认证元数据找到认证Provider
3. 执行认证

```csharp
public async Task Invoke(HttpContext context)
{
    /*
        1.找到EndPoint
    */
    var endpoint = context.GetEndpoint();
	// ....

    /*
        2.在EndPoint找Metadata，通过Metadata、AuthorizationPolicy找到对应的Policy
              public class AuthorizeAttribute : Attribute, IAuthorizeData
    */
    // IMPORTANT: Changes to authorization logic should be mirrored in MVC's AuthorizeFilter
    var authorizeData = endpoint?.Metadata.GetOrderedMetadata<IAuthorizeData>() ?? Array.Empty<IAuthorizeData>();
    var policy = await AuthorizationPolicy.CombineAsync(_policyProvider, authorizeData);
    if (policy == null)
    {
        await _next(context);
        return;
    }

    // Policy evaluator has transient lifetime so it fetched from request services instead of injecting in constructor
    var policyEvaluator = context.RequestServices.GetRequiredService<IPolicyEvaluator>();

    /*
        3.认证鉴权
    */
    var authenticateResult = await policyEvaluator.AuthenticateAsync(policy, context);

    // Allow Anonymous skips all authorization
    if (endpoint?.Metadata.GetMetadata<IAllowAnonymous>() != null)
    {
        await _next(context);
        return;
    }

    // Note that the resource will be null if there is no matched endpoint
    var authorizeResult = await policyEvaluator.AuthorizeAsync(policy, authenticateResult, context, resource: endpoint);

	// ......

    await _next(context);
}
```

IPolicyEvaluator 不是一个具体处理器，它是一个装饰或者适配作用。

```csharp
//实现IPolicyEvaluator.AuthorizeAsync()
public virtual async Task<PolicyAuthorizationResult> AuthorizeAsync(AuthorizationPolicy policy, AuthenticateResult authenticationResult, HttpContext context, object? resource)
{
    ArgumentNullException.ThrowIfNull(policy);

    //这里是鉴权的实际过程
    var result = await _authorization.AuthorizeAsync(context.User, resource, policy);
    if (result.Succeeded)
    {
        return PolicyAuthorizationResult.Success();
    }

    // If authentication was successful, return forbidden, otherwise challenge
    return (authenticationResult.Succeeded)
        ? PolicyAuthorizationResult.Forbid(result.Failure)
        : PolicyAuthorizationResult.Challenge();
}
```

IAuthorizationService 是最终的鉴权服务入口

```csharp
public class DefaultAuthorizationService : IAuthorizationService
{
    public virtual async Task<AuthorizationResult> AuthorizeAsync(ClaimsPrincipal user, object? resource, IEnumerable<IAuthorizationRequirement> requirements)
    {
        ArgumentNullThrowHelper.ThrowIfNull(requirements);

        var authContext = _contextFactory.CreateContext(requirements, user, resource);
        var handlers = await _handlers.GetHandlersAsync(authContext).ConfigureAwait(false);
        foreach (var handler in handlers)
        {
            await handler.HandleAsync(authContext).ConfigureAwait(false);
            if (!_options.InvokeHandlersAfterFailure && authContext.HasFailed)
            {
                break;
            }
        }

        var result = _evaluator.Evaluate(authContext);
        if (result.Succeeded)
        {
            _logger.UserAuthorizationSucceeded();
        }
        else
        {
            _logger.UserAuthorizationFailed(result.Failure);
        }
        return result;
    }

    /*
        policyName -> IAuthorizationRequirement
    */
    public virtual async Task<AuthorizationResult> AuthorizeAsync(ClaimsPrincipal user, object? resource, string policyName)
    {
        ArgumentNullThrowHelper.ThrowIfNull(policyName);

        var policy = await _policyProvider.GetPolicyAsync(policyName).ConfigureAwait(false);
        if (policy == null)
        {
            throw new InvalidOperationException($"No policy found: {policyName}.");
        }
        return await this.AuthorizeAsync(user, resource, policy).ConfigureAwait(false);
    }
}
```

### AuthorizeFilter

```csharp
public class AuthorizeFilter : IAsyncAuthorizationFilter, IFilterFactory
{
    internal async Task<AuthorizationPolicy> GetEffectivePolicyAsync(AuthorizationFilterContext context)
    {
        
        var endpoint = context.HttpContext.GetEndpoint();
        if (endpoint != null)
        {
            var policyProvider = PolicyProvider ?? context.HttpContext.RequestServices.GetRequiredService<IAuthorizationPolicyProvider>();
            var endpointAuthorizeData = endpoint.Metadata.GetOrderedMetadata<IAuthorizeData>() ?? Array.Empty<IAuthorizeData>();

            var endpointPolicy = await AuthorizationPolicy.CombineAsync(policyProvider, endpointAuthorizeData);
            if (endpointPolicy != null)
            {
                builder.Combine(endpointPolicy);
            }
        }

        return builder.Build();
    }

    public virtual async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (context == null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        if (!context.IsEffectivePolicy(this))
        {
            return;
        }

        // IMPORTANT: Changes to authorization logic should be mirrored in security's AuthorizationMiddleware
        var effectivePolicy = await GetEffectivePolicyAsync(context);
        if (effectivePolicy == null)
        {
            return;
        }

        var policyEvaluator = context.HttpContext.RequestServices.GetRequiredService<IPolicyEvaluator>();

        var authenticateResult = await policyEvaluator.AuthenticateAsync(effectivePolicy, context.HttpContext);

        // Allow Anonymous skips all authorization
        if (HasAllowAnonymous(context))
        {
            return;
        }

        var authorizeResult = await policyEvaluator.AuthorizeAsync(effectivePolicy, authenticateResult, context.HttpContext, context);

        if (authorizeResult.Challenged)
        {
            context.Result = new ChallengeResult(effectivePolicy.AuthenticationSchemes.ToArray());
        }
        else if (authorizeResult.Forbidden)
        {
            context.Result = new ForbidResult(effectivePolicy.AuthenticationSchemes.ToArray());
        }
    }
}
```

### 中间件 or 过滤器 ？

通常会在项目两者都会使用，中间件鉴权的顺序当然会先于过滤器（也就是说会执行两次鉴权过程，但其结果是兼容的），默认情况下不会有鉴权全局过滤器，但是会在服务注册中单独添加。

```csharp
namespace Microsoft.AspNetCore.Mvc.ApplicationModels;

internal sealed class AuthorizationApplicationModelProvider : IApplicationModelProvider
{
    private readonly MvcOptions _mvcOptions;
    private readonly IAuthorizationPolicyProvider _policyProvider;

    public AuthorizationApplicationModelProvider(
        IAuthorizationPolicyProvider policyProvider,
        IOptions<MvcOptions> mvcOptions)
    {
        _policyProvider = policyProvider;
        _mvcOptions = mvcOptions.Value;
    }

    public int Order => -1000 + 10;

    public void OnProvidersExecuted(ApplicationModelProviderContext context)
    {
        // Intentionally empty.
    }

    public void OnProvidersExecuting(ApplicationModelProviderContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        if (_mvcOptions.EnableEndpointRouting)
        {
            // When using endpoint routing, the AuthorizationMiddleware does the work that Auth filters would otherwise perform.
            // Consequently we do not need to convert authorization attributes to filters.
            return;
        }

        foreach (var controllerModel in context.Result.Controllers)
        {
            var controllerModelAuthData = controllerModel.Attributes.OfType<IAuthorizeData>().ToArray();
            if (controllerModelAuthData.Length > 0)
            {
                controllerModel.Filters.Add(GetFilter(_policyProvider, controllerModelAuthData));
            }
            foreach (var attribute in controllerModel.Attributes.OfType<IAllowAnonymous>())
            {
                controllerModel.Filters.Add(new AllowAnonymousFilter());
            }

            foreach (var actionModel in controllerModel.Actions)
            {
                var actionModelAuthData = actionModel.Attributes.OfType<IAuthorizeData>().ToArray();
                if (actionModelAuthData.Length > 0)
                {
                    actionModel.Filters.Add(GetFilter(_policyProvider, actionModelAuthData));
                }

                foreach (var _ in actionModel.Attributes.OfType<IAllowAnonymous>())
                {
                    actionModel.Filters.Add(new AllowAnonymousFilter());
                }
            }
        }
    }

    public static AuthorizeFilter GetFilter(IAuthorizationPolicyProvider policyProvider, IEnumerable<IAuthorizeData> authData)
    {
        // The default policy provider will make the same policy for given input, so make it only once.
        // This will always execute synchronously.
        if (policyProvider.GetType() == typeof(DefaultAuthorizationPolicyProvider))
        {
            var policy = AuthorizationPolicy.CombineAsync(policyProvider, authData).GetAwaiter().GetResult()!;
            return new AuthorizeFilter(policy);
        }
        else
        {
            return new AuthorizeFilter(policyProvider, authData);
        }
    }
}
```

Net8下代码略有不通，但思路一致的。

### jwt

在验证jwt有效性之后还是上述逻辑的一个具体实现，在通常意义上JwtBearerEvents中暴露的切入过程已经足够。

## Policy

![image.png](https://cdn.nlark.com/yuque/0/2020/png/1294764/1590370758329-a34dd13b-1470-4e45-896b-22ee466127a8.png?x-oss-process=image%2Fformat%2Cwebp)

### Requirements & Handler

IAuthorizationRequirement 实际上就是一个空接口，标注强类型的策略需求。比如一个string类型的权限许可：

```csharp
public class PermissionRequirement: IAuthorizationRequirement
{
    public string PermissionName { get; }

    public PermissionRequirement([NotNull] string permissionName)
    {
        Check.NotNull(permissionName, nameof(permissionName));

        PermissionName = permissionName;
    }

    public override string ToString()
    {
        return $"PermissionRequirement: {PermissionName}";
    }
}
```

在预构建的逻辑中有一些常见的权限需求，比如RequireUserName、RequireRole、RequireClaim，也可以组合多项。

一个 Requirement 可以有多个 Handler，如果一个 Handler 返回 Succeed，而其他的都没有返回 Fail，那么这个 Requirement 就被满足了。

![image.png](https://cdn.nlark.com/yuque/0/2024/png/1294764/1715248190523-1db7920e-977c-4d31-851e-c8fa95476fd8.png?x-oss-process=image%2Fformat%2Cwebp)

```csharp
public class PermissionRequirementHandler : AuthorizationHandler<PermissionRequirement>
{
    // 自定义的checker
    private readonly IPermissionChecker _permissionChecker;

    public PermissionRequirementHandler(IPermissionChecker permissionChecker)
    {
        _permissionChecker = permissionChecker;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (await _permissionChecker.IsGrantedAsync(context.User, requirement.PermissionName))
        {
            context.Succeed(requirement);
        }
    }
}
```

### AuthorizationPolicyProvider

Default情况下从Options中配置，稍微拓展：

```csharp
public class LiteralAuthorizationPolicyProvider : DefaultAuthorizationPolicyProvider, ITransientDependency
{
    public LiteralAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
    {
    }

    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        var policy = await base.GetPolicyAsync(policyName);
        if (policy != null)
        {
            return policy;
        }
        
        var policyBuilder = new AuthorizationPolicyBuilder(Array.Empty<string>());
        policyBuilder.Requirements.Add(new PermissionRequirement(policyName));
        return policyBuilder.Build();
    }
}
```

