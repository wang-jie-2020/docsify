# Aspect

![img](https://cdn.nlark.com/yuque/0/2024/png/1294764/1716183576554-76c1bdf0-dac0-48d8-8272-dd7f46afd488.png?x-oss-process=image%2Fformat%2Cwebp)



| 注解名称        | 解释                                                         |
| --------------- | ------------------------------------------------------------ |
| @Aspect         | 用来定义一个切面。                                           |
| @pointcut       | 用于定义切入点表达式。在使用时还需要定义一个包含名字和任意参数的方法签名来表示切入点名称，这个方法签名就是一个返回值为void，且方法体为空的普通方法。 |
| @Before         | 用于定义前置通知，相当于BeforeAdvice。在使用时，通常需要指定一个value属性值，该属性值用于指定一个切入点表达式(可以是已有的切入点，也可以直接定义切入点表达式)。 |
| @AfterReturning | 用于定义后置通知，相当于AfterReturningAdvice。在使用时可以指定pointcut / value和returning属性，其中pointcut / value这两个属性的作用一样，都用于指定切入点表达式。 |
| @Around         | 用于定义环绕通知，相当于MethodInterceptor。在使用时需要指定一个value属性，该属性用于指定该通知被植入的切入点。 |
| @After-Throwing | 用于定义异常通知来处理程序中未处理的异常，相当于ThrowAdvice。在使用时可指定pointcut / value和throwing属性。其中pointcut/value用于指定切入点表达式，而throwing属性值用于指定-一个形参名来表示Advice方法中可定义与此同名的形参，该形参可用于访问目标方法抛出的异常。 |
| @After          | 用于定义最终final 通知，不管是否异常，该通知都会执行。使用时需要指定一个value属性，该属性用于指定该通知被植入的切入点。 |
| @DeclareParents | 用于定义引介通知，相当于IntroductionInterceptor (不要求掌握)。 |

## Aspect

@Aspect 标记一个切片类(配合@Component)

@PointCut 切点,在切入点上执行的增强处理主要有五个注解：

​	@Before  在切点方法之前执行

​	@After  在切点方法之后执行

​	@AfterReturning 切点方法返回后执行

​	@AfterThrowing 切点方法抛异常执行

​	@Around 属于环绕增强，能控制切点执行前，执行后

> 注：查到博客上说顺序是@Around->@Before->@Around->@After->@AfterReturning->@AfterThrowing
>
> 2.6.3实测顺序是 @Around->@Before->@AfterReturning->@After->@Around  以及 @Around->@Before->@AfterReturning->@After->@Around
>
> 虽然这点知识很没用，还是记录一下吧。。。

### PointCut

execution执行表达式...

一些例子:

```java
// 任意公共方法的执行：
execution（public * *（..））

// 任何一个名字以“set”开始的方法的执行：
execution（* set*（..））

// AccountService接口定义的任意方法的执行：
execution（* com.xyz.service.AccountService.*（..））

// 在service包中定义的任意方法的执行：
execution（* com.xyz.service.*.*（..））

// 在service包或其子包中定义的任意方法的执行：
execution（* com.xyz.service..*.*（..））

// 在service包中的任意连接点（在Spring AOP中只是方法执行）：
within（com.xyz.service.*）

// 在service包或其子包中的任意连接点（在Spring AOP中只是方法执行）：
within（com.xyz.service..*）

// 实现了AccountService接口的代理对象的任意连接点 （在Spring AOP中只是方法执行）：
this（com.xyz.service.AccountService）// 'this'在绑定表单中更加常用

// 实现AccountService接口的目标对象的任意连接点 （在Spring AOP中只是方法执行）：
target（com.xyz.service.AccountService） // 'target'在绑定表单中更加常用

// 任何一个只接受一个参数，并且运行时所传入的参数是Serializable 接口的连接点（在Spring AOP中只是方法执行）
args（java.io.Serializable） // 'args'在绑定表单中更加常用; 请注意在例子中给出的切入点不同于 execution(* *(java.io.Serializable))： args版本只有在动态运行时候传入参数是Serializable时才匹配，而execution版本在方法签名中声明只有一个 Serializable类型的参数时候匹配。

// 目标对象中有一个 @Transactional 注解的任意连接点 （在Spring AOP中只是方法执行）
@target（org.springframework.transaction.annotation.Transactional）// '@target'在绑定表单中更加常用

// 任何一个目标对象声明的类型有一个 @Transactional 注解的连接点 （在Spring AOP中只是方法执行）：
@within（org.springframework.transaction.annotation.Transactional） // '@within'在绑定表单中更加常用

// 任何一个执行的方法有一个 @Transactional 注解的连接点 （在Spring AOP中只是方法执行）
@annotation（org.springframework.transaction.annotation.Transactional） // '@annotation'在绑定表单中更加常用

// 任何一个只接受一个参数，并且运行时所传入的参数类型具有@Classified 注解的连接点（在Spring AOP中只是方法执行）
@args（com.xyz.security.Classified） // '@args'在绑定表单中更加常用

// 任何一个在名为'tradeService'的Spring bean之上的连接点 （在Spring AOP中只是方法执行）
bean（tradeService）

// 任何一个在名字匹配通配符表达式'*Service'的Spring bean之上的连接点 （在Spring AOP中只是方法执行）
bean（*Service）
```

## 连接点

中继点,包含了切点指向的对象信息,通过proceed()方法继续放行.

```java
 private void explainProceedingJoinPoint(ProceedingJoinPoint point) {

     Object target = point.getTarget();
     System.out.println("target ==>" + target);

     Object[] args = point.getArgs();
     for (Object arg : args) {
         System.out.println("arg ==>" + arg);
     }

     Signature signature = point.getSignature();
     MethodSignature methodSignature = (MethodSignature) signature;
     Method method = methodSignature.getMethod();
     if (method != null) {
         Annotation[] annotations = method.getDeclaredAnnotations();
         for (Annotation annotation : annotations) {
             System.out.println("annotation ==>" + annotation);
         }
     }
 }
```

## 通过注解切入

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface AopAnnotation {
    boolean flag() default true;
}
```

```java
 @Pointcut("@annotation(learn.aop.AopAnnotation)")
public void aopPointCut(){
}

@Around("aopPointCut()")
public Object Around(ProceedingJoinPoint point) throws Throwable {

    //获取注解和注解的值
    AopAnnotation annotation = getAnnotation(point);
    if (annotation != null) {
        boolean flag = annotation.flag();
        System.out.println("注解flags的值:" + flag);
    }

    Object proceed = point.proceed();
    return proceed;
}

public AopAnnotation getAnnotation(ProceedingJoinPoint point) {
    Signature signature = point.getSignature();
    MethodSignature methodSignature = (MethodSignature) signature;
    Method method = methodSignature.getMethod();
    if (method != null){
        return method.getAnnotation(AopAnnotation.class);
    }
    return null;
}
```

## 例子

### LogAspect

```java
package learn.aop;

import java.lang.annotation.*;

/**
 * 自定义操作日志记录注解
 * 
 * @author ruoyi
 *
 */
@Target({ ElementType.PARAMETER, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface LogAnnotation
{
    /**
     * 模块
     */
    public String title() default "";
}

```

```java
package learn.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.NamedThreadLocal;
import org.springframework.stereotype.Component;

/**
 * 操作日志记录处理
 *
 * @author ruoyi
 */
@Aspect
@Component
public class LogAspect {
    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);

    /**
     * 处理请求前执行
     */
    @Before(value = "@annotation(controllerLog)")
    public void boBefore(JoinPoint joinPoint, LogAnnotation controllerLog) {
        log.info("@Before...{}", controllerLog.title());
    }

    /**
     * 处理完请求后执行
     *
     * @param joinPoint 切点
     */
    @AfterReturning(pointcut = "@annotation(controllerLog)", returning = "jsonResult")
    public void doAfterReturning(JoinPoint joinPoint, LogAnnotation controllerLog, Object jsonResult) {
        log.info("@doAfterReturning...{}...{}", controllerLog.title(), jsonResult);
    }

    /**
     * 拦截异常操作
     *
     * @param joinPoint 切点
     * @param e         异常
     */
    @AfterThrowing(value = "@annotation(controllerLog)", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, LogAnnotation controllerLog, Exception e) {
        log.info("@AfterThrowing...{}...{}", controllerLog.title(), e.getMessage());
    }
}
```

## 相关

 `@EnableAspectJAutoProxy(exposeProxy = true)` ,这个注解的作用是Enable切片功能(如果是SpringBoot项目即使不写也默认生效)

>springbootautoconfigure中包含了一个名为AopAutoConfiguration的类，该类的作用等同于在启动类上添加@EnableAspectJAutoProxy注解。因此，即使没有显式添加@EnableAspectJAutoProxy注解，AOP功能也可能因为AopAutoConfiguration类的存在而生效

## 常见失效场景

1. 内部调用

   如果有必要, 通过AopContext获取当前代理 UserService proxy = (UserService) AopContext.currentProxy()

2. 静态方法、final类或方法、private方法