ORM 包括相关的封装包的概念性内容都是容易掌握的, 容易混淆的是在描述概念时的不同细度的api描述, 如果全都从最底层封装解释是毫无必要的.

JAVA中的最底层对象是JDBC, 和ADO类比, 只不过ADO由统一设计提供, 在语言支持上更好一点而已.



## 一、JDBC 核心

>连接驱动 -> 连接对象 -> 语句封装 -> 结果封装
>
>ado:  driver -> connection -> command -> dataTable
>
>jdbc: driver -> connection -> statement -> resultSet

- DriverManager (驱动)
- Connection (包括 DataSource)
- Statement (包括 PreparedStatement, CallableStatement)
- ResultSet



Connection:

```java
String driver = "com.mysql.cj.jdbc.Driver";
String connectionString = "jdbc:mysql://;

Properties info = new Properties();
info.put("user", "");
info.put("password", "");

/// DriveClass 驱动, 通过驱动getConnection
Class.forName(driver);
return DriverManager.getConnection(connectionString, info);
```



Statement、ResultSet:

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



transaction: 

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
private TransactionManager uselessTransactionManager;   // 空接口 -> JdbcTransactionManager

@Autowired
private PlatformTransactionManager transactionManager;  // +1层接口 -> JdbcTransactionManager

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



```java
TransactionSynchronizationManager.registerSynchronization(
)
```



## 三、Mybatis

SQL-XML Based ORM 概括是不全面的, 但是理解它的难度不高



## 四、其他

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
