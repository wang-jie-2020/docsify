*不得不吐槽巨硬的文档体系结构，不停的介绍构建在其基架上的各种兼容操作*

HTTP请求的模型绑定、验证配置都在MvcOptions

```csharp
public class MvcOptions : IEnumerable<ICompatibilitySwitch>, IEnumerable
  {
    public MvcOptions()
    {
      this.ModelBinderProviders = (IList<IModelBinderProvider>) new List<IModelBinderProvider>();
      this.ModelBindingMessageProvider = new DefaultModelBindingMessageProvider();
      this.ModelMetadataDetailsProviders = (IList<IMetadataDetailsProvider>) new List<IMetadataDetailsProvider>();
      this.ModelValidatorProviders = (IList<IModelValidatorProvider>) new List<IModelValidatorProvider>();
    }
	
    //指定如何进行绑定，比如数组、集合如何从http请求中获得对象
    public IList<IModelBinderProvider> ModelBinderProviders { get; }

	//一个被默认实现的提示信息获取器，它包含了一些Func，可以指定自己的错误信息
    public DefaultModelBindingMessageProvider ModelBindingMessageProvider { get; }

	/*
    	IBindingMetadataProvider	绑定元数据
        IDisplayMetadataProvider 	显示元数据           DefaultModelMetadata : ModelMetadata : IModelMetadataProvider
        IValidationMetadataProvider  验证数据
    */
    public IList<IMetadataDetailsProvider> ModelMetadataDetailsProviders { get; }
	
    //指定验证器，比如最常用的从特性中获取验证器
    public IList<IModelValidatorProvider> ModelValidatorProviders { get; }
  }
```

### IModelBinderProvider

```
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.BinderTypeModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.ServicesModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.BodyModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.HeaderModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.FloatingPointTypeModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.EnumTypeModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.DateTimeModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.SimpleTypeModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.CancellationTokenModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.ByteArrayModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.FormFileModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.FormCollectionModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.KeyValuePairModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.DictionaryModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.ArrayModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.CollectionModelBinderProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Binders.ComplexObjectModelBinderProvider
```

### ModelBindingMessageProvider

```
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.DefaultModelBindingMessageProvider
```

![img](https://cdn.nlark.com/yuque/0/2022/png/1294764/1670306446970-640f2e5b-b146-477f-9a8f-9440f6fdae7a.png)

### IMetadataDetailsProvider

```
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.ExcludeBindingMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.DefaultBindingMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.DefaultValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.BindingSourceMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.BindingSourceMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.BindingSourceMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.BindingSourceMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Metadata.BindingSourceMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.SuppressChildValidationMetadataProvider
Microsoft.AspNetCore.Mvc.DataAnnotations.DataAnnotationsMetadataProvider
Microsoft.AspNetCore.Mvc.ModelBinding.Validation.HasValidatorsValidationMetadataProvider
```

### IModelValidatorProvider

```
Microsoft.AspNetCore.Mvc.ModelBinding.Validation.DefaultModelValidatorProvider
Microsoft.AspNetCore.Mvc.DataAnnotations.DataAnnotationsModelValidatorProvider
```



![img](https://cdn.nlark.com/yuque/0/2022/jpeg/1294764/1670309243368-4fc1db23-d3ef-48ad-9c11-3448b61e7e26.jpeg)

## Net8 api项目中处理验证错误的i18n

通常在实施中不会将模型绑定错误暴露而是统一处理为内部错误：

```csharp
 Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = actionContext =>
            {
                var defaultLocalizer = actionContext.HttpContext.RequestServices.GetRequiredService<IStringLocalizer>();

                var errors = actionContext.ModelState
                    .Where(e => e.Value.Errors.Count > 0)
                    .ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray());

                var detailBuilder = new StringBuilder();
                detailBuilder.Append(defaultLocalizer["ValidationNarrativeErrorMessageTitle"]);
                foreach (var error in errors)
                {
                    detailBuilder.AppendLine(error.Value.JoinAsString(","));
                }

                var response = AjaxResult.Error(defaultLocalizer["ValidationErrorMessage"], detailBuilder.ToString());

                return new BadRequestObjectResult(response);
            };
        });
```

