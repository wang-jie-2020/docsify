## 一、 JBDC的事务管理

大致翻过, 仍旧是一些隔离行为 和 事务范围的封装, 深入了解的意义不太大

## 二、Spring中的事务管理

新建的`Spring Boot`项目中，一般都会引用`spring-boot-starter`或者`spring-boot-starter-web`，而这两个起步依赖中都已经包含了对于`spring-boot-starter-jdbc`或`spring-boot-starter-data-jpa`的依赖。 

当我们使用了这两个依赖的时候，框架会自动默认分别注入`DataSourceTransactionManager`或`JpaTransactionManager`。 所以我们不需要任何额外配置就可以用`@Transactional`注解进行事务的使用。

>@Transactional注解只能应用到public可见度的方法上，可以被应用于接口定义和接口方法，方法会覆盖类上面声明的事务。

因为`Spring`的默认的事务规则是遇到运行异常`（RuntimeException）`和程序错误`（Error）`才会回滚。如果想针对检查异常进行事务回滚，可以在`@Transactional`注解里使用 `rollbackFor`属性明确指定异常。如@Transactional(rollbackFor = Exception.class)

`Transactional`注解的常用属性表：

| 属性          | 说明                                                         |
| ------------- | ------------------------------------------------------------ |
| propagation   | 事务的传播行为，默认值为 REQUIRED。                          |
| isolation     | 事务的隔离度，默认值采用 DEFAULT                             |
| timeout       | 事务的超时时间，默认值为-1，不超时。如果设置了超时时间(单位秒)，那么如果超过该时间限制了但事务还没有完成，则自动回滚事务。 |
| read-only     | 指定事务是否为只读事务，默认值为 false；为了忽略那些不需要事务的方法，比如读取数据，可以设置 read-only 为 true。 |
| rollbackFor   | 用于指定能够触发事务回滚的异常类型，如果有多个异常类型需要指定，各类型之间可以通过逗号分隔。{xxx1.class, xxx2.class,……} |
| noRollbackFor | 抛出 no-rollback-for 指定的异常类型，不回滚事务。{xxx1.class, xxx2.class,……} |

>注意事项
>
>- 同一个事务下是无法切换数据源
>- 禁止父方法使用`@Transactional`创建事务，子方法使用`@DataSource`切换数据源
>- 正确用法: 子方法单独创建事务或父方法使用`@Transactional(propagation = Propagation.REQUIRES_NEW)`为所有子方法创建新事务
>
>提示
>
>事务的传播机制是指如果在开始当前事务之前，一个事务上下文已经存在，此时有若干选项可以指定一个事务性方法的执行行为。 即:在执行一个@Transactinal注解标注的方法时，开启了事务；当该方法还在执行中时，另一个人也触发了该方法；那么此时怎么算事务呢，这时就可以通过事务的传播机制来指定处理方式。

`TransactionDefinition`传播行为的常量：

| 常量                                            | 含义                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ |
| TransactionDefinition.PROPAGATION_REQUIRED      | 如果当前存在事务，则加入该事务；如果当前没有事务，则创建一个新的事务。这是默认值。 |
| TransactionDefinition.PROPAGATION_REQUIRES_NEW  | 创建一个新的事务，如果当前存在事务，则把当前事务挂起。       |
| TransactionDefinition.PROPAGATION_SUPPORTS      | 如果当前存在事务，则加入该事务；如果当前没有事务，则以非事务的方式继续运行。 |
| TransactionDefinition.PROPAGATION_NOT_SUPPORTED | 以非事务方式运行，如果当前存在事务，则把当前事务挂起。       |
| TransactionDefinition.PROPAGATION_NEVER         | 以非事务方式运行，如果当前存在事务，则抛出异常。             |
| TransactionDefinition.PROPAGATION_MANDATORY     | 如果当前存在事务，则加入该事务；如果当前没有事务，则抛出异常。 |
| TransactionDefinition.PROPAGATION_NESTED        | 如果当前存在事务，则创建一个事务作为当前事务的嵌套事务来运行；如果当前没有事务，则该取值等价于TransactionDefinition.PROPAGATION_REQUIRED。 |



Mybatis中有两种类型的事务管理器(type=JDBC|MANAGED):

​	JDBC-这个配置直接使用了JDBC的提交和回滚功能，它依赖从数据源获得的连接来管理事务的作用域。默认情况下，在关闭连接时启用自动提交

​	MANAGED-这个配置几乎没做什么。它从不提交或回滚一个连接，而是让容器来管理事务的整个生命周期。默认情况下，它会关闭连接。

Spring会使用自带的事务管理器来覆盖mybatis自己的配置(覆盖配置,实际上仍旧时基于JDBC做的)。



## 三、实践

注意@Transactional注解的问题(和其他Aspect一样):

1. 内部调用
2. 静态方法、final类或方法、private方法
3. rollback 默认只针对RuntimeException