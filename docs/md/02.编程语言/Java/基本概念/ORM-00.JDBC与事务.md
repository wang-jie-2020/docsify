# JDBC 与 ORM 概述

ORM 包括相关的封装包的概念性内容都是容易掌握的, 容易混淆的是在描述概念时的不同细度的api描述, 如果全都从最底层封装解释是毫无必要的.

JAVA中的最底层对象是JDBC, 和ADO类比, 只不过ADO由统一设计提供, 在语言支持上更好一点而已.

> 连接驱动 → 连接对象 → 语句封装 → 结果封装
>
> ado: driver → connection → command → dataTable
>
> jdbc: driver → connection → statement → resultSet

## 一、JDBC 核心

核心对象：

- DriverManager（驱动）
- Connection（包括 DataSource）
- Statement（包括 PreparedStatement, CallableStatement）
- ResultSet

### Connection

```java
String driver = "com.mysql.cj.jdbc.Driver";
String connectionString = "jdbc:mysql://...";

Properties info = new Properties();
info.put("user", "");
info.put("password", "");

// DriveClass 驱动, 通过驱动 getConnection
Class.forName(driver);
return DriverManager.getConnection(connectionString, info);
```

### Statement、ResultSet

```java
PreparedStatement statement = conn.prepareStatement("select * from sys_user where user_id=?");
statement.setObject(1, 1);

ResultSet resultSet = statement.executeQuery();
ResultSetMetaData resultSetMetaData = statement.getMetaData();
int columnCount = resultSetMetaData.getColumnCount();

List<LinkedHashMap<String, Object>> list = new ArrayList<LinkedHashMap<String, Object>>();
while (resultSet.next()) {

    LinkedHashMap<String, Object> row = new LinkedHashMap<>();

    for (int i = 1; i <= columnCount; i++) {
        String columnName = resultSetMetaData.getColumnName(i);     
        String columnLabel = resultSetMetaData.getColumnLabel(i); 
        row.put(columnLabel, resultSet.getObject(i));
    }

    list.add(row);
}
```

### Transaction

```java
try {
    conn.setAutoCommit(false);

    PreparedStatement statement = conn.prepareStatement("insert into example(`name`,`birthday`,`classId`) values (?,?,?)");

    for (int i = 0; i < 100; i++) {
        statement.setString(1, String.valueOf(i));
        statement.setObject(2, LocalDateTime.of(2020, 1, 1, 1, 1));
        statement.setInt(3, i % 3);

        statement.addBatch();
        if (i % 10 == 0) {
            statement.executeBatch();
        }

        if (i % 50 == 0) {
            throw new RuntimeException("手动错误");
        }
    }

    conn.commit();
} catch (SQLException e) {
    conn.rollback();
} finally {
    conn.close();
}
```

*JDBC事务管理: setAutoCommit(false) → commit() → rollback(), 事务基于连接级别*



## 二、Spring-JDBC

Spring-JDBC 进行了基础封装, 引入了重用连接池HikariDataSource, 主要改动点还是在重复代码的简化上:

(1) 通过JdbcTemplate的访问可以忽略连接打开关闭, 通过关系绑定进行ObjectMapping

```java
@Autowired
private JdbcTemplate jdbcTemplate;

jdbcTemplate.query("select * from example", (rs, rowNum) -> {
    Example example = new Example();
    example.setId(rs.getInt("id"));
    example.setName(rs.getString("name"));
    example.setBirthday((Date) rs.getObject("birthday"));
    example.setClassId(rs.getInt("classId"));
    return example;
});

jdbcTemplate.update("update example set name='1' where id = 1");
```

(2) 通过PlatformTransactionManager 和 TransactionTemplate忽略重复回滚提交

```java
@Autowired
private PlatformTransactionManager transactionManager;  // 实际注入 JdbcTransactionManager

TransactionStatus txStatus = transactionManager.getTransaction(new DefaultTransactionDefinition());

try {
    jdbcTemplate.update("update example set name='1' where id = 1");
    jdbcTemplate.update("update example set name='2' where id = 2");
} catch (Exception e) {
    transactionManager.rollback(txStatus);
    throw e;
}
transactionManager.commit(txStatus);
```

```java
TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);

transactionTemplate.execute((status) -> {
    jdbcTemplate.update("update example set name='1' where id = 1");
    jdbcTemplate.update("update example set name='2' where id = 2");
    return 1;
});
```

其中TransactionTemplate的构造函数实际就是:

```java
public TransactionTemplate(PlatformTransactionManager transactionManager) {
    this.transactionManager = transactionManager;
}
```

**事务同步回调**:

```java
TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
    @Override
    public void afterCommit() {
        // 事务提交后执行
    }
});
```



## 三、事务管理

### JDBC事务

基于连接级别，大致翻过, 仍旧是一些隔离行为和事务范围的封装, 深入了解的意义不太大

### Spring事务管理

新建的`Spring Boot`项目中，一般都会引用`spring-boot-starter`或者`spring-boot-starter-web`，而这两个起步依赖中都已经包含了对于`spring-boot-starter-jdbc`或`spring-boot-starter-data-jpa`的依赖。当我们使用了这两个依赖的时候，框架会自动默认分别注入`DataSourceTransactionManager`或`JpaTransactionManager`。所以不需要任何额外配置就可以用`@Transactional`注解进行事务的使用。

>@Transactional注解只能应用到public可见度的方法上，可以被应用于接口定义和接口方法，方法会覆盖类上面声明的事务。因为Spring的默认的事务规则是遇到运行异常（RuntimeException）和程序错误（Error）才会回滚。如果想针对检查异常进行事务回滚，可以在@Transactional注解里使用 rollbackFor属性明确指定异常。

#### @Transactional 属性

| 属性 | 说明 |
|------|------|
| propagation | 事务的传播行为，默认值为 REQUIRED |
| isolation | 事务的隔离度，默认值采用 DEFAULT |
| timeout | 事务的超时时间（秒），默认值为-1（不超时）|
| read-only | 是否为只读事务，默认 false；读操作设为 true 可优化 |
| rollbackFor | 指定触发回滚的异常类型，如 Exception.class |
| noRollbackFor | 指定不触发回滚的异常类型 |

#### 传播行为

| 常量 | 含义 |
|------|------|
| **REQUIRED**（默认） | 有事务则加入，无事务则新建 |
| **REQUIRES_NEW** | 总是新建事务，挂起当前事务 |
| SUPPORTS | 有事务则加入，无事务则非事务运行 |
| NOT_SUPPORTED | 非事务运行，挂起当前事务 |
| NEVER | 非事务运行，有事务则抛异常 |
| MANDATORY | 必须在事务中运行，无事务则抛异常 |
| NESTED | 嵌套事务（有事务则嵌套，无则同 REQUIRED） |

> 事务的传播机制是指如果在开始当前事务之前，一个事务上下文已经存在，此时有若干选项可以指定一个事务性方法的执行行为。

#### 多数据源注意事项

> - 同一个事务下是无法切换数据源
> - 禁止父方法使用`@Transactional`创建事务，子方法使用`@DataSource`切换数据源
> - 正确用法: 子方法单独创建事务或父方法使用`@Transactional(propagation = Propagation.REQUIRES_NEW)`为所有子方法创建新事务

#### Mybatis事务管理器

Mybatis中有两种类型的事务管理器（type=JDBC|MANAGED）：

- JDBC — 直接使用JDBC的提交和回滚，依赖从数据源获得的连接来管理事务作用域。默认关闭连接时启用自动提交
- MANAGED — 几乎不做任何事，不提交也不回滚，让容器（如Spring）来管理事务生命周期

> Spring会使用自带的事务管理器来覆盖MyBatis自己的配置（实际上仍旧基于JDBC做的）

#### 常见坑

(1) **内部调用失效** — 同一个类中，非事务方法调用事务方法，事务不生效（AOP代理限制）

```java
// ❌ 事务不生效（this调用绕过代理）
public void methodA() {
    this.methodB();  // 直接调用，不走代理
}

@Transactional
public void methodB() { ... }

// ✅ 解决1：注入自身
@Autowired
private UserService self;
public void methodA() { self.methodB(); }

// ✅ 解决2：拆到另一个Bean
```

(2) **非public方法** — @Transactional 只能应用于 public 方法，private/protected/final/static 均不生效

(3) **rollback默认只针对RuntimeException** — 检查异常（如 IOException）不会触发回滚

```java
// ❌ IOException 不会回滚
@Transactional
public void method() throws IOException { ... }

// ✅ 显式指定
@Transactional(rollbackFor = Exception.class)
public void method() throws IOException { ... }
```

(4) **异常被catch吞掉** — 方法内部catch了异常但未重新抛出，Spring无法感知异常，不会回滚

```java
// ❌ 异常被吞，不回滚
@Transactional
public void method() {
    try {
        // ...
    } catch (Exception e) {
        log.error("error", e);  // 只记录，未抛出
    }
}

// ✅ 重新抛出或手动标记回滚
@Transactional
public void method() {
    try {
        // ...
    } catch (Exception e) {
        log.error("error", e);
        TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
    }
}
```



## 四、Mybatis

SQL-XML Based ORM 概括是不全面的, 但是理解它的难度不高

## 五、其他

### Hibernate(spring-data-jpa)

它的特点是通过注解标记以及语义化的方法名自动进行SQL语句构建, 思路也许太超前了

```java
// jpa
@Entity
@Table(name = "user")
@Id
@Column(name = "id")
@Column(name = "name")

// JpaRepository 就是一个动态生成SQL的仓储
public interface IUserDao extends JpaRepository<User, Integer> {
}

// 语义化的方法, 通过方法名约定自动构建语句
userDao.findAll()
```

### Apache DBUtils

https://commons.apache.org/proper/commons-dbutils/examples.html

核心类QueryRunner提供的方法解决了代码重复的问题，通过数据源解决了数据库连接等资源管理的问题。

核心接口RestSetHandler主要是结果集的处理，用户自行定义拓展。

```java
QueryRunner queryRunner = ApacheDBUtils.getQueryRuner();
ResultSetHandler<User> resultSetHandler = new BeanHandler<User>(User.class);

List<User> userList = queryRunner.execute("select * from user where id = ?", resultSetHandler, 101);
```
