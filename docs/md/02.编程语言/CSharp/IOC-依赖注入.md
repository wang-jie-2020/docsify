# IOC

在采用了依赖注入的应用中，我们总是直接利用DI容器直接获取所需的服务实例，换句话说，DI容器起到了一个服务提供者的角色，它能够根据我们提供的服务描述信息提供一个可用的服务对象。ASP.NET Core中的DI容器体现为一个实现了IServiceProvider接口的对象。

作为一个服务的提供者，ASP.NET Core中的DI容器最终体现为一个IServiceProvider接口，我们将所有实现了该接口的类型及其实例统称为ServiceProvider。如下面的代码片段所示，该接口简单至极，它仅仅提供了唯一个GetService方法，该方法根据提供的服务类型为你提供对应的服务实例。

```csharp
  public interface IServiceProvider
  {
    object? GetService(Type serviceType);
  }
```

ASP.NET Core内部真正使用的是一个实现了IServiceProvider接口的内部类型（该类型的名称为“ServiceProvider”），我们不能直接创建该对象，只能间接地通过调用IServiceCollection接口的扩展方法BuildServiceProvider得到它。

IServiceCollection接口定义在“Microsoft.Extensions.DependencyInjection”命名空间下。 如下面的代码片段所示，IServiceCollection接口实际上代表一个元素为ServiceDescriptor对象的集合，它直接继承了另一个接口IList<ServiceDescriptor>，而ServiceCollection类实现了该接口。

```csharp
public static class ServiceCollectionExtensions
{
    public static IServiceProvider BuildServiceProvider(this IServiceCollection services);
}
 
public interface IServiceCollection : IList<ServiceDescriptor>
{
    
}
 
Public class ServiceCollection: IServiceCollection
{
  //省略成员
}
```

体现为DI容器的ServiceProvider之所以能够根据我们给定的服务类型（一般是一个接口类型）提供一个能够开箱即用的服务实例，是因为我们预先注册了相应的服务描述信息，这些指导ServiceProvider正确实施服务提供操作的服务描述体现为如下一个ServiceDescriptor类型。

```csharp
public class ServiceDescriptor
{
    public ServiceDescriptor(Type serviceType, object instance);
    public ServiceDescriptor(Type serviceType, Func<IServiceProvider, object> factory, ServiceLifetime lifetime);
    public ServiceDescriptor(Type serviceType, Type implementationType, ServiceLifetime lifetime);
 
    public Type                                ServiceType {  get; }
    public ServiceLifetime                     Lifetime {  get; }
 
     public Type                                ImplementationType {  get; }
     public object                              ImplementationInstance {  get; }
     public Func<IServiceProvider, object>      ImplementationFactory {  get; }      
}
```

ServiceDescriptor的ServiceType属性代表提供服务的生命类型，由于标准化的服务一般会定义成接口，所以在绝大部分情况下体现为一个接口类型。

类型为ServiceLifetime的属性Lifetime体现了ServiceProvider针对服务实例生命周期的控制方式。

ServiceLifetime是一个枚举类型，定义其中的三个选项（Singleton、Scoped和Transient）体现三种对服务对象生命周期的控制形式。对于ServiceDescriptor的其他三个属性来说，它们实际上是辅助ServiceProvider完成具体的服务实例提供。ImplementationType属性代表被提供服务实例的真实类型，属性ImplementationInstance则直接代表被提供的服务实例，ImplementationFactory则提供了一个创建服务实例的委托对象。

由于ASP.NET Core中的ServiceProvider是根据一个代表ServiceDescriptor集合的IServiceCollection对象创建的，当我们调用其GetService方法的时候，它会根据我们提供的服务类型找到对应的ServiceDecriptor对象。如果该ServiceDecriptor对象的ImplementationInstance属性返回一个具体的对象，该对象将直接用作被提供的服务实例。如果ServiceDecriptor对象的ImplementationFactory返回一个具体的委托，该委托对象将直接用作创建服务实例的工厂。

ASP.NET Core针对依赖注入的编程主要体现在两个方面：其一，创建一个ServiceCollection对象并将服务注册信息以ServiceDescriptor对象的形式添加其中；其二，针对ServiceCollection对象创建对应的ServiceProvider并利用它提供我们需要的服务实例。

在进行服务注册的时候，我们可以直接调用相应的构造函数创建ServiceDescriptor对象并将其添加到ServiceCollection对象之中。除此之外，IServiceCollection接口还具有如下三组扩展方法将这两个步骤合二为一。从下面给出的代码片段我们不难看出这三组扩展方法分别针对上面我们提及的三种针对服务实例的生命周期控制方式，泛型参数TService代表服务的声明类型，即ServiceDescriptor的ServiceType属性，至于ServiceDescriptor的其他属性，则通过方法相应的参数来提供。

```csharp
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddScoped<TService>(this IServiceCollection services) where TService: class;
   
    //其他AddScoped<TService>重载
 
    public static IServiceCollection AddSingleton<TService>(this IServiceCollection services) where TService: class;
   
    //其他AddSingleton<TService>重载
 
    public static IServiceCollection AddTransient<TService>(this IServiceCollection services) where TService: class;
    
    //其他AddTransient<TService>重载
}
```

对于用作DI容器的ServiceProvider对象来说，我们可以直接调用它的GetService方法根据指定的服务类型获得想用的服务实例。除此之外，服务的提供还可以通过IServiceProvider接口相应的扩展方法来完成。如下面的代码片段所示，扩展方法GetService<T>以泛型参数的形式指定服务的声明类型。至于另外两个扩展方法GetRequiredService和GetRequiredService<T>，如果ServiceProvider不能提供一个具体的服务实例，一个InvalidOperationException异常会被抛出来并提示相应的服务注册信息不足。

```csharp
public static class ServiceProviderExtensions
{ 
    public static T GetService<T>(this IServiceProvider provider);
    public static object GetRequiredService(this IServiceProvider provider, Type serviceType);
    public static T GetRequiredService<T>(this IServiceProvider provider);
}
```

如果我们在调用GetService方法的时候将服务类型指定为IEnumerable<T>，那么返回的结果将会是一个集合对象。除此之外， 我们可以直接调用IServiceProvider如下两个扩展方法GetServeces达到相同的目的。在这种情况下，ServiceProvider将会利用所有与指定服务类型相匹配的ServiceDescriptor来提供具体的服务实例，这些均会作为返回的集合对象的元素。如果所有的ServiceDescriptor均与指定的服务类型不匹配，那么最终返回的是一个空的集合对象。

```csharp
public static class ServiceProviderExtensions
{
    public static IEnumerable<T> GetServices<T>(this IServiceProvider provider);
    public static IEnumerable<object> GetServices(this IServiceProvider provider, Type serviceType);
}
```

ServiceProvider提供的服务实例不仅限于普通的类型，它对泛型服务类型同样支持。在针对泛型服务进行注册的时候，我们可以将服务类型设定为携带具体泛型参数的“关闭泛型类型”（比如IFoobar<IFoo,IBar>），除此之外服务类型也可以是包含具体泛型参数的“开放泛型类型”（比如IFoo<,>）。前者实际上还是将其视为非泛型服务来对待，后者才真正体现了“泛型”的本质。

比如我们注册了某个泛型服务接口IFoobar<,>与它的实现类Foobar<,>之间的映射关系，当我们指定一个携带具体泛型参数的服务接口类型IFoobar<IFoo,IBar>并调用ServiceProvider的GetService方法获取对应的服务实例时，ServiceProvider会针对指定的泛型参数类型(IFoo和IBar)来解析与之匹配的实现类型（可能是Foo和Baz）并得到最终的实现类型（Foobar<Foo,Baz>）。

我们同样利用一个简单的控制台应用来演示基于泛型的服务注册与提供方式。如下面的代码片段所示，我们定义了三个服务接口（IFoo、IBar和IFoobar<T1,T2>）和实现它们的三个服务类（Foo、Bar个Foobar<T1,T2>）,泛型接口具有两个泛型参数类型的属性（Foo和Bar），它们在实现类中以构造器注入的方式被初始化。

**如果ServiceProvider试图通过调用构造函数的方式来创建服务实例，传入构造函数的所有参数必须先被初始化，最终被选择出来的构造函数必须具备一个基本的条件：ServiceProvider能够提供构造函数的所有参数。**在所有合法的候选构造函数列表中，最终被选择出来的构造函数具有这么一个特征：每一个候选构造函数的参数类型集合都是这个构造函数参数类型集合的子集。如果这样的构造函数并不存在，一个类型为InvalidOperationException的异常会被跑出来。



生命周期管理决定了ServiceProvider采用怎样的方式创建和回收服务实例。ServiceProvider具有三种基本的生命周期管理模式，分别对应着枚举类型ServiceLifetime的三个选项（Singleton、Scoped和Transient）。对于ServiceProvider支持的这三种生命周期管理模式，Singleton和Transient的语义很明确，前者（Singleton）表示以“单例”的方式管理服务实例的生命周期，意味着ServiceProvider对象多次针对同一个服务类型所提供的服务实例实际上是同一个对象；而后者（Transient）则完全相反，对于每次服务提供请求，ServiceProvider总会创建一个新的对象。

ServiceScope为某个ServiceProvider对象圈定了一个“作用域”，枚举类型ServiceLifetime中的Scoped选项指的就是这么一个ServiceScope。在依赖注入的应用编程接口中，ServiceScope通过一个名为IServiceScope的接口来表示。如下面的代码片段所示，继承自IDisposable接口的IServiceScope具有一个唯一的只读属性ServiceProvider返回确定这个服务范围边界的ServiceProvider。表示ServiceScope由它对应的工厂ServiceScopeFactory来创建，后者体现为具有如下定义的接口IServiceScopeFactory。

```csharp
public interface IServiceScope : IDisposable
{
    IServiceProvider ServiceProvider { get; }
}
 
public interface IServiceScopeFactory
{
    IServiceScope CreateScope();
}
```

若要充分理解ServiceScope和ServiceProvider之间的关系，我们需要简单了解一下ServiceProvider的层级结构。除了直接通过一个ServiceCollection对象创建一个独立的ServiceProvider对象之外，一个ServiceProvider还可以根据另一个ServiceProvider对象来创建，如果采用后一种创建方式，我们指定的ServiceProvider与创建的ServiceProvider将成为一种“父子”关系。

```csharp
internal class ServiceProvider : IServiceProvider, IDisposable
{
    private readonly ServiceProvider _root;
    internal ServiceProvider(ServiceProvider parent)
    {
        _root = parent._root;
    }
    //其他成员
}
```

虽然在ServiceProvider在创建过程中体现了ServiceProvider之间存在着一种树形化的层级结构，但是ServiceProvider对象本身并没有一个指向“父亲”的引用，它仅仅会保留针对根节点的引用。如上面的代码片段所示，针对根节点的引用体现为ServiceProvider类的字段_root。当我们根据作为“父亲”的ServiceProvider创建一个新的ServiceProvider的时候，父子均指向同一个“根”。我们可以将创建过程中体现的层级化关系称为“逻辑关系”，而将ServiceProvider对象自身的引用关系称为“物理关系”，右图清楚地揭示了这两种关系之间的转化。



[![img](https://cdn.nlark.com/yuque/0/2024/png/1294764/1705889682925-f9bf15a6-5f79-4eb1-bde4-68174a1b7d64.png)](http://images2015.cnblogs.com/blog/19327/201604/19327-20160410212059968-271295359.png)

由于ServiceProvider自身是一个内部类型，我们不能采用调用构造函数的方式根据一个作为“父亲”的ServiceProvider创建另一个作为“儿子”的ServiceProvider，但是这个目的可以间接地通过创建ServiceScope的方式来完成。如下面的代码片段所示，我们首先创建一个独立的ServiceProvider并调用其GetService<T>方法获得一个ServiceScopeFactory对象，然后调用后者的CreateScope方法创建一个新的ServiceScope，它的ServiceProvider就是前者的“儿子”。

```csharp
class Program
{
    static void Main(string[] args)
    {
        IServiceProvider serviceProvider1 = new ServiceCollection().BuildServiceProvider();
        IServiceProvider serviceProvider2 = serviceProvider1.GetService<IServiceScopeFactory>().CreateScope().ServiceProvider;
 
        object root = serviceProvider2.GetType().GetField("_root", BindingFlags.Instance| BindingFlags.NonPublic).GetValue(serviceProvider2);
        Debug.Assert(object.ReferenceEquals(serviceProvider1, root));        
    }
}
```

如果希望进一步了解ServiceScope的创建以及它和ServiceProvider之间的关系，我们不妨先来看看作为IServiceScope接口默认实现的内部类型ServiceScope的定义。如下面的代码片段所示，ServiceScope仅仅是对一个ServiceProvider对象的简单封装而已。值得一提的是，当ServiceScope的Dispose方法被调用的时候，这个被封装的ServiceProvider的同名方法同时被执行。

```csharp
{
   private readonly ServiceProvider _scopedProvider;
   public ServiceScope(ServiceProvider scopedProvider)
   {
       this._scopedProvider = scopedProvider;
   }

   public void Dispose()
   {
      _scopedProvider.Dispose();
  }

  public IServiceProvider ServiceProvider
  {
      get {return _scopedProvider; }
  }
}
```

IServiceScopeFactory接口的默认实现类型是一个名为ServiceScopeFactory的内部类型。如下面的代码片段所示，ServiceScopeFactory的只读字段“_provider”表示当前的ServiceProvider。当CreateScope方法被调用的时候，这个ServiceProvider的“子ServiceProvider”被创建出来，并被封装成返回的ServiceScope对象。

```csharp
internal class ServiceScopeFactory : IServiceScopeFactory
{
    private readonly ServiceProvider _provider;
    public ServiceScopeFactory(ServiceProvider provider)
    {
        _provider = provider;
    }
 
    public IServiceScope CreateScope()
    {
        return new ServiceScope(new ServiceProvider(_provider));
    }
}
```

只有在充分了解ServiceScope的创建过程以及它与ServiceProvider之间的关系之后，我们才会对ServiceProvider支持的三种生命周期管理模式（Singleton、Scope和Transient）具有深刻的认识。就服务实例的提供方式来说，它们之间具有如下的差异：

Singleton：ServiceProvider创建的服务实例保存在作为根节点的ServiceProvider上，所有具有同一根节点的所有ServiceProvider提供的服务实例均是同一个对象。

Scoped：ServiceProvider创建的服务实例由自己保存，所以同一个ServiceProvider对象提供的服务实例均是同一个对象。

Transient：针对每一次服务提供请求，ServiceProvider总是创建一个新的服务实例。

ServiceProvider除了为我们提供所需的服务实例之外，对于由它提供的服务实例，它还肩负起回收之责。这里所说的回收与.NET自身的垃圾回收机制无关，仅仅针对于自身类型实现了IDisposable接口的服务实例，所谓的回收仅仅体现为调用它们的Dispose方法。ServiceProvider针对服务实例所采用的收受策略取决于服务注册时采用的生命周期管理模式，具体采用的服务回收策略主要体现为如下两点：

如果注册的服务采用Singleton模式，由某个ServiceProvider提供的服务实例的回收工作由作为根的ServiceProvider负责，后者的Dispose方法被调用的时候，这些服务实例的Dispose方法会自动执行。

如果注册的服务采用其他模式（Scope或者Transient），ServiceProvider自行承担由它提供的服务实例的回收工作，当它的Dispose方法被调用的时候，这些服务实例的Dispose方法会自动执行。具体来说，当我们在使用一个现有的ServiceProvider的时候，由于我们并不能直接对它实施回收（因为它同时会在其它地方被使用），如果直接使用它来提供我们所需的服务实例，由于这些服务实例可能会在很长一段时间得不到回收，进而导致一些内存泄漏的问题。如果所用的是一个与当前应用具有相同生命周期（ServiceProvider在应用终止的时候才会被回收）的ServiceProvider，而且提供的服务采用Transient模式，这个问题就更加严重了，这意味着每次提供的服务实例都是一个全新的对象，但是它永远得不到回收。

为了解决这个问题，我想很多人会想到一种解决方案，那就是按照如下所示的方式显式地对提供的每个服务实例实施回收工作。实际上这并不是一种推荐的编程方式，因为这样的做法仅仅确保了服务实例对象的Dispose方法能够被及时调用，但是ServiceProvider依然保持着对服务实例的引用，后者依然不能及时地被GC回收。

```csharp
public void DoWork(IServiceProvider serviceProvider)
{
    using (IFoobar foobar = serviceProvider.GetService<IFoobar>())
    {
        ...
    }
}

或者

public void DoWork(IServiceProvider serviceProvider)
{
    IFoobar foobar = serviceProvider.GetService<IFoobar>();
    try
    {
        ...
    }
    finally
    {
       (foobar as IDisposable)?.Dispose();
   }
}
```

由于提供的服务实例总是被某个ServiceProvider引用着[1]（直接提供服务实例的ServiceProvider或者是它的根），所以服务实例能够被GC从内存及时回收的前提是引用它的ServiceProvider及时地变成垃圾对象。要让提供服务实例的ServiceProvider成为垃圾对象，我们就必须创建一个新的ServiceProvider，通过上面的介绍我们知道ServiceProvider的创建可以通过创建ServiceScope的方式来实现。除此之外，为我们可以通过回收ServiceScope的方式来回收对应的ServiceProvider，进而进一步回收由它提供的服务实例（仅限Transient和Scoped模式）。下面的代码片段给出了正确的编程方式。

```csharp
public void DoWork(IServiceProvider serviceProvider)
{
    using (IServiceScope serviceScope = serviceProvider.GetService<IServiceScopeFactory>().CreateScope())
    {
        IFoobar foobar = serviceScope.ServiceProvider.GetService<IFoobar>();
        ...
    }
}
```