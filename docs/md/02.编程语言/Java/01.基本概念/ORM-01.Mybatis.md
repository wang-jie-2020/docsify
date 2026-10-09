## 一、配置概述

SpringBoot集成步骤略过, 在项目配置中通常包含如下的配置和MapperScan注解:

```yaml
mybatis:
  typeAliasesPackage: com.example.**.domain	# typeAliases 类型别名, 仅与 XML 配置相关，其存在的唯一目的是为了减少重复输入完全限定类名。
  mapperLocations: classpath*:mapper/**/*Mapper.xml
  configLocation: classpath:mybatis/mybatis-config.xml
```



整个配置模块中包含了太多细节, 通常以默认即可, 相对在理解上需要注意的是:

| name                     | desc                                                         |
| ------------------------ | ------------------------------------------------------------ |
| useGeneratedKeys         | 允许 JDBC 支持自动生成主键，需要数据库驱动支持。如果设置为 true，将强制使用自动生成主键。 |
| mapUnderscoreToCamelCase | 实现从经典数据库列名 A_COLUMN 到驼峰式经典 Java 属性名 aColumn 的自动映射。 |
| defaultExecutorType      | 配置默认执行器。SIMPLE 执行器不执行任何特殊操作。REUSE 执行器重用预处理语句。BATCH 执行器重用语句并批量处理更新。默认SIMPLE。 |
| defaultEnumTypeHandler   | 指定 Enum 使用的默认 `TypeHandler` 。默认org.apache.ibatis.type.EnumTypeHandler。 |
| logImpl                  | 指定 MyBatis 所用日志的具体实现，未指定时将自动查找。如果指定的是slf4j就会由Spring管理(日志级别问题) |



### (1) 类型处理机制

通过typeHandlers(类型处理器)对 java type 和 jdbc type的关系进行处理，重写时实现或扩展均可(官网有说明), 在全局配置 或者 字段配置中标注(#{field, typeHandler=xxxx}).

其中有enumTypeHandler 枚举类型处理器(派生自typeHandlers), 默认提供枚举枚举和枚举项顺序, 当然可以再重写进行枚举的显示转换

```java
public class UserStatusTypeHandler extends EnumTypeHandler<UserStatus> {

    public UserStatusTypeHandler(Class<UserStatus> type) {
        super(type);
    }

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, UserStatus parameter, JdbcType jdbcType) throws SQLException {
        if (jdbcType == null) {
            ps.setString(i, parameter.name());
        } else {
            ps.setObject(i, parameter.name(), jdbcType.TYPE_CODE);
        }
    }

    @Override
    public UserStatus getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String s = rs.getString(columnName);
        // return (UserStatus)(s == null ? null : Enum.valueOf(UserStatus.class, s));
        return (UserStatus)(s == null ? null : UserStatus.getStatus(s));
    }

    @Override
    public UserStatus getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String s = rs.getString(columnIndex);
        // return (UserStatus)(s == null ? null : Enum.valueOf(UserStatus.class, s));
        return (UserStatus)(s == null ? null : UserStatus.getStatus(s));
    }

    @Override
    public UserStatus getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String s = cs.getString(columnIndex);
        // return (UserStatus)(s == null ? null : Enum.valueOf(UserStatus.class, s));
        return (UserStatus)(s == null ? null : UserStatus.getStatus(s));
    }
}
```



### (2) 拦截器机制

拦截器允许在映射语句执行过程中的某一点进行拦截调用。默认情况下，MyBatis 允许使用插件来拦截的方法调用包括：

- Executor (update, query, flushStatements, commit, rollback, getTransaction, close, isClosed)
- ParameterHandler (getParameterObject, setParameters)
- ResultSetHandler (handleResultSets, handleOutputParameters)
- StatementHandler (prepare, parameterize, batch, update, query)

```java
public interface Interceptor {
    /// 具体拦截方法
    // Object target = invocation.getTarget(); //被代理对象
    // Method method = invocation.getMethod(); //代理方法
    // Object[] args = invocation.getArgs(); //方法参数
    Object intercept(Invocation invocation) throws Throwable;

    /// 由拦截器的注解头 判断是否要拦截
    /// 如 @Intercepts({@Signature(type = StatementHandler.class, method = "prepare", args = {Connection.class, Integer.class})})
    default Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }
	
    /// 构造用
    default void setProperties(Properties properties) {
    }
}
```



### (3) XML语法

（insert and update）useGeneratedKeys keyProperty 对应数据库自增Id字段

parameterType resultmap resultset

动态SQL: if choose (when, otherwise) trim (where, set) foreach

@Param("userId") Long userId 修改参数名称

```xml
<if test="name != null">
</if>

 <choose>
     <when test="title != null">...</when>
     <otherwise>...</otherwise>
</choose>

<delete id="deletes" parameterType="Long">
    delete from sys_user where user_id in
    <foreach collection="array" item="userId" open="(" separator="," close=")">
        #{userId}
    </foreach>
</delete>

<insert id="insert" parameterType="SysUser" useGeneratedKeys="true" keyProperty="userId">
    insert into sys_user(
    <trim suffix="" suffixOverrides=",">
        <if test="userId != null and userId != 0">user_id,</if>
        <if test="deptId != null and deptId != 0">dept_id,</if>
        <if test="userName != null and userName != ''">user_name,</if>
        <if test="status != null and status != ''">status,</if>
        <if test="remark != null and remark != ''">remark,</if>
        <if test="createTime != null and createTime != ''">createTime,</if>
    </trim>

    )values(
    <trim suffix="" suffixOverrides=",">
        <if test="userId != null and userId != ''">#{userId},</if>
        <if test="deptId != null and deptId != ''">#{deptId},</if>
        <if test="userName != null and userName != ''">#{userName},</if>
        <if test="status != null and status != ''">#{status},</if>
        <if test="createTime != null and createTime != ''">#{createTime},</if>
    </trim>
    )
</insert>
```



### (4) dynamicSQL

由注解如@Select @Update等实现的, 和一个动态SQL的构造工具, 不做考虑



## 二、SqlSessionTemplate、TransactionTemplate

>每个线程都应该有自己的 SqlSession 实例。SqlSession 的实例不共享，并且不是线程安全的。因此，最佳作用域是请求或方法作用域。永远不要在静态字段甚至类的实例字段中保留对 SqlSession 实例的引用。永远不要在任何类型的托管作用域中保留对 SqlSession 的引用，例如 Servlet 框架的 HttpSession。如果您使用的是任何类型的 Web 框架，请考虑 SqlSession 遵循与 HTTP 请求类似的范围。换句话说，在收到 HTTP 请求时，您可以打开一个 SqlSession，然后在返回响应后，您可以关闭它。

在未实践时的理解类似于请求内单例, 比如线程Local中空-创建-返回的模式. 包括在查找的资料中也是一笔带过的. 但仔细想想其中有问题, 比如在事务中这样干似乎不合适. 浅写了代码得到的结果是从不同方式注入的SqlSession是一样的, 但这不代表上述理解完全错误, 在Spring下实际注入的类型是SqlSessionTemplate似乎仍旧保持了单例模式, 通过不同的拦截要求自动处理了SqlSession的创建和释放

```java
public class SqlSessionTemplate implements SqlSession, DisposableBean {

    public SqlSessionTemplate(SqlSessionFactory sqlSessionFactory,
                              ExecutorType executorType, 
                              PersistenceExceptionTranslator exceptionTranslator) {

        this.sqlSessionFactory = sqlSessionFactory;
        this.executorType = executorType;
        this.exceptionTranslator = exceptionTranslator;
        
        // here
        this.sqlSessionProxy = (SqlSession)Proxy.newProxyInstance(SqlSessionFactory.class.getClassLoader(), new Class[]{SqlSession.class}, new SqlSessionInterceptor());
    }
}
```

通过SqlSession, 进行直接的SQL使用以及其他的手动控制, 但需要注意的是默认的Executor是SimpleExecutor.

Transaction 中未查询到太多新东西, 还是transactionTemplate.execute()



### BatchExecutor

默认Executor是SimpleExecutor, 直接注入的sqlSession也指向它, 在Batch操作时如下:

```java
// 获取BATCH类型的SqlSession，false表示手动提交事务
try (SqlSession sqlSession = sqlSessionFactory.openSession(ExecutorType.BATCH, false)) {

    CrudMapper mapper = sqlSession.getMapper(CrudMapper.class);

    for (int i = 0; i < dataList.size(); i++) {
        mapper.insert(dataList.get(i));

        // 分批刷新，避免内存溢出
        if ((i + 1) % BATCH_SIZE == 0) {
            sqlSession.flushStatements(); // 刷新语句到数据库[citation:2]
        }
    }

    sqlSession.flushStatements(); // 刷新剩余的语句
    sqlSession.commit(); // 提交事务[citation:5]
}
```



## 三、高阶应用

### 关联查询问题

以XML描述的方式是最根本的解决, 在MyBatis的注解中也包含了相对应的方式, 但会存在N+1查询问题

```xml
<resultMap type="SysUser" id="SysUserResult">
    <id     property="userId"       column="user_id"      />
    <result property="userName"     column="user_name"    />
    <association property="dept"    javaType="SysDept"         resultMap="deptResult" />
    <collection  property="roles"   javaType="java.util.List"  resultMap="RoleResult" />
</resultMap>
```



### Page问题

通常配套使用PageHelper插件, 在使用时需要注意:

1. 每个查询都需要单独调用一次 `startPage()`，PageHelper 只对 **第一个查询生效**
2. 如果查询接口中有DTO转换，Count 字段要重新赋值

```yml
pagehelper:
  helperDialect: mysql
  supportMethodsArguments: true
  params: count=countSql
```



```java
PageHelper.startPage(1, 5, "user_id").setReasonable(true);
var page = mapper.selectUserList(new SysUser());
var total = PageInfo.of(page).getTotal();
```



通过Http请求参数进行Page操作的简短封装:

```java
public class PageUtils {
    public static void startPage() {

        Integer pageNum = Integer.parseInt(getParameter("pageNum"));
        Integer pageSize = Integer.parseInt(getParameter("pageSize"));
        String orderBy = getParameter("orderByColumn");
        String asc = getParameter("isAsc");

        if(orderBy == null || "".equals(orderBy)) {
            orderBy = "";
        }

        // Reasonable参数表示是否修正传入的页码和实际页码
        PageHelper.startPage(pageNum, pageSize, orderBy.toLowerCase() + " " + asc).setReasonable(true);
    }

    public static String getParameter(String name)
    {
        return getRequest().getParameter(name);
    }

    public static HttpServletRequest getRequest()
    {
        return getRequestAttributes().getRequest();
    }

    public static ServletRequestAttributes getRequestAttributes()
    {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        return (ServletRequestAttributes) attributes;
    }
}
```



### dynamic-DataSource

Spring中提供了通过`AbstractRoutingDataSource`可以动态的指定DataSource(也许这里写Connection), 简述过程是创建自己的路由实现进行重写:

```java
@Nullable
protected abstract Object determineCurrentLookupKey();
```

RuoYi 中也是如此, 在创建DynamicDataSource Bean时传入配置中的master、slave两个Connection信息

```java
public DynamicDataSource(DataSource defaultTargetDataSource, Map<Object, Object> targetDataSources)
```

重写上述方法以读TheadLocal变量来决定返回值, 通过aop 注解在具

体的Service中进行数据源切换



*待查的问题: 创建了 class DynamicDataSource extends AbstractRoutingDataSource, 通过@Configuration、@Bean的方式注册了DynamicDataSource Bean之后, DataBase这个Bean的实现就指向了DynamicDataSource....*



## 四、实践

1. join问题

   (1) 通过集成的注解或者XML元素可以实现1-1和1-多关联, 多-多关联不能直接支持(相当于两个1-多), 需要明确的是在这种情况下的N+1语句问题基本等于不可

   (2) SQL语句的方式太过笨重

2. 日志问题

   需要注意的是如果SLF4J时会有日志的LEVEL隔离, DEBUG; 或者直接控制台打印最直接; 日志打印不是个好主意

4. Id问题

   递增最简单的是 useGeneratedKeys & keyProperty, 虽然也有相关预防性设计但似乎不必了解?

5. Batch/Bulk问题

   foreach 可能存在SQL过长过大的问题






















