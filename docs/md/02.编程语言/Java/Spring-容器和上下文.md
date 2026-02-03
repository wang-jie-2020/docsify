# 容器和上下文

## 基本概念

> Spring 配置文件中每一个<bean>节点元素在 Spring 容器里都通过一个 BeanDefinition 对象表示，它描述了 Bean 的配置信息。而 BeanDefinitionRegistry 接口提供了向容器手工注册 BeanDefinition 对象的方法。
>
> 
>
> IoC容器的接口类是ApplicationContext，很显然它必然继承BeanFactory对Bean规范（最基本的ioc容器的实现）进行定义。而ApplicationContext表示的是应用的上下文，除了对Bean的管理外，还至少应该包含了
>
> - **访问资源**：对不同方式的Bean配置（即资源）进行加载。(实现ResourcePatternResolver接口)
> - **国际化**: 支持信息源，可以实现国际化。（实现MessageSource接口）
> - **应用事件**: 支持应用事件。(实现ApplicationEventPublisher接口)



**BeanDefinition：各种Bean对象及其相互的关系**

**BeanRegistry： 向IOC容器手工注册 BeanDefinition 对象的方法**

**BeanFactory： 工厂模式定义了IOC容器的基本功能规范**

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/spring-framework-ioc-source-71.png)



![image-20250722151214688](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20250722151214688.png)



## BeanRegistry & BeanFactory(Bean注册和Bean工厂)

<img src="https://cdn.jsdelivr.net/gh/wang-jie-2020/images/5e70bcb4ff1d43b19da823fbc6e2a6d9.png" alt="img"  />

![img](https://raw.gitcode.com/qq_36179938/images/raw/main/4961a9d23f81837712951a4208b196fb.png)



*不出意外的情况下大概率不会对 BeanDefinitionReader->BeanRegistry 的过程有改动, 在二者的空隙间有两个插槽可以进行一定程度的修改:*

(1) BeanDefinitionRegistryPostProcessor

```java
public interface BeanDefinitionRegistryPostProcessor extends BeanFactoryPostProcessor {

	/**
	 * Modify the application context's internal bean definition registry after its
	 * standard initialization. All regular bean definitions will have been loaded,
	 * but no beans will have been instantiated yet. This allows for adding further
	 * bean definitions before the next post-processing phase kicks in.
	 * @param registry the bean definition registry used by the application context
	 * @throws org.springframework.beans.BeansException in case of errors
	 */
	void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException;

}
```

(2) BeanFactoryPostProcessor 

```java
@FunctionalInterface
public interface BeanFactoryPostProcessor {

	/**
	 * Modify the application context's internal bean factory after its standard
	 * initialization. All bean definitions will have been loaded, but no beans
	 * will have been instantiated yet. This allows for overriding or adding
	 * properties even to eager-initializing beans.
	 * @param beanFactory the bean factory used by the application context
	 * @throws org.springframework.beans.BeansException in case of errors
	 */
	void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;

}
```



## Bean Instantiate(Bean实例化)

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/spring-framework-ioc-source-102.png)

![img](https://raw.gitcode.com/qq_36179938/images/raw/main/7e70ea485aff193dcdadace6e895242c.jpeg)

### 1 实例化 Bean

对于`BeanFactory`容器来说，当用户向容器请求一个尚未初始化的 Bean 或初始化 Bean 的时候，如果需要注入另一个尚未初始化的依赖，容器就会调用`createBean`进行实例化；对于`ApplicationContext`容器来说，当容器启动结束后，便实例化所有的 Bean。

容器通过获取`BeanDefinition`对象中的信息进行实例化。并且这一步仅仅是简单的实例化，并未进行依赖注入。 实例化对象被包装在`BeanWrapper`对象中，`BeanWrapper`提供了设置对象属性的接口，从而避免了使用反射机制设置属性。

### 2 设置对象属性（依赖注入）

实例化后的对象被封装在`BeanWrapper`对象中，并且此时对象仍然是一个原生的状态，并没有进行依赖注入。 紧接着，Spring 根据`BeanDefinition`中的信息进行依赖注入，并且通过`BeanWrapper`提供的设置属性的接口完成依赖注入。

### 3 注入 Aware 接口

紧接着，Spring 会检测该对象是否实现了`xxxAware`接口，并将相关的`xxxAware`实例注入给 Bean：

- 如果 Bean 实现了`BeanNameAware`接口，Spring 将 Bean 的 ID 传递给`setBeanName()`方法。实现`BeanNameAware`主要是为了通过 Bean 的引用来获得 Bean 的 ID，一般业务中是很少有用到 Bean 的 ID 的。
- 如果 Bean 实现了`BeanFactoryAware`接口，Spring 将调用`setBeanDactory(BeanFactory bf)`方法并把`BeanFactory`容器实例作为参数传入。实现`BeanFactoryAware`主要目的是为了获取 Spring 容器，如 Bean 通过 Spring 容器发布事件等。
- 如果 Bean 实现了`ApplicationContextAware`接口，Spring 容器将调用`setApplicationContext(ApplicationContext ctx)`方法，把应用上下文作为参数传入，作用与`BeanFactory`类似都是为了获取 Spring 容器，不同的是 Spring 容器在调用`setApplicationContext`方法时会把它自己作为`setApplicationContext`的参数传入，而 Spring 容器在调用`setBeanDactory`前需要程序员自己指定（注入）`setBeanDactory`里的参数`BeanFactory`。

### 4 BeanPostProcessor

当经过上述几个步骤后，Bean 对象已经被正确构造，但如果你想要对象被使用前再进行一些自定义的处理，就可以通过`BeanPostProcessor`接口实现。 该接口提供了两个函数：

- `postProcessBeforeInitialzation(Object bean, String beanName)`当前正在初始化的 Bean 对象会被传递进来，我们就可以对这个 Bean 作任何处理。这个函数会先于`InitialzationBean`执行，因此称为前置处理。 所有`Aware`接口的注入就是在这一步完成的。
- `postProcessAfterInitialzation(Object bean, String beanName)`当前正在初始化的 Bean 对象会被传递进来，我们就可以对这个 Bean 作任何处理。这个函数会在`InitialzationBean`完成后执行，因此称为后置处理。

### 5 InitializingBean 与 init-method

当`BeanPostProcessor`的前置处理完成后就会进入本阶段。 `InitializingBean`接口只有一个函数：

- `afterPropertiesSet()`

这一阶段也可以在 Bean 正式构造完成前增加我们自定义的逻辑，但它与前置处理不同，由于该函数并不会把当前 Bean 对象传进来，因此在这一步没办法处理对象本身，只能增加一些额外的逻辑。 若要使用它，我们需要让 Bean 实现该接口，并把要增加的逻辑写在该函数中。然后，Spring 会在前置处理完成后检测当前 Bean 是否实现了该接口，并执行`afterPropertiesSet`函数。

当然，Spring 为了降低对客户代码的侵入性，给 Bean 的配置提供了`init-method`属性，该属性指定了在这一阶段需要执行的函数名。Spring 便会在初始化阶段执行我们设置的函数。`init-method`本质上仍然使用了`InitializingBean`接口。

*init-method 目前理解是通过xml配置bean时的一个用法,类似的还是destory*

### 6 DisposableBean 和 destroy-method

如果 Bean 实现了`DispostbleBean`接口，Spring 将调用它的`destory`方法，作用与在配置文件中对 Bean 使用`destory-method`属性的作用一样，都是在 Bean 实例销毁前执行的方法。

### 一些理解

(1) BeanDefinition -> Registry -> Factory -> BeanInstance, 其中的过程有提供一些覆写

​	Registry、Factory -> BeanDefinitionRegistryPostProcessor

​	BeanInstance -> BeanPostProcessor、InitializingBean、@PostConstruct

(2) **对于`ApplicationContext`容器来说，当容器启动结束后，便实例化所有的 Bean**

## Bean 配置注解和使用

Bean 配置的三种方式:(1)XML (2)JAVA配置 (3)注解

目前的主流方式是（3）+（2）配置

​	注解方式：Repository、Service、Controller、Component

​	JAVA配置：Configuration & Bean

通过注解方式使用:

1、@Autowired是Spring自带的，@Resource是JSR250规范实现的，@Inject是JSR330规范实现的

2、@Autowired、@Inject用法基本一样，不同的是@Inject没有required属性

3、@Autowired、@Inject是默认按照**类型**匹配的，@Resource是按照**名称**匹配的

4、@Autowired如果需要按照名称匹配需要和@Qualifier一起使用，@Inject和@Named一起使用，@Resource则通过name进行指定

5、其他注解

​	@Scope	需要在类上使用注解 @Scope，其 value 属性用于指定作用域（singleton、**prototype**、request）

​	@Value	需要在属性上使用注解 @Value，该注解的 value 属性用于指定要注入的值。

​	@PostConstruct	在方法上使用 @PostConstruct 相当于初始化

## 优先级和缓存

在解决嵌套依赖时有缓存相关的背景, 三级缓存, 如果有遇到就再补

优先级问题指的不同配置方式注入的对象不同问题:

(1) 仅有一对时, 按类型注入, 忽略名称

(2) 有多对时, 按类型+名称注入

(2) 有多对且标记@Primary时, 按@Primary注入, 但仅针对实例而言, 在配置阶段仍旧类型+名称

当然也有可能遇到集合类型, 直接注入会有些不合适, 以`ObjectProvider` 、 `ObjectFactory`更加合适











