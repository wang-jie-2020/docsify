## 一、概述

增强Mybatis的单表api, 沿用mybatis中的核心思路, 通过注解简化需要XML配置的内容.

Mybatis的配置包含在内(换不换名字均可), 其他的配置基本保持默认即可.

```yml
mybatis-plus:
  typeAliasesPackage: com.example.**.domain
  mapperLocations: classpath*:mapper/**/*Mapper.xml
  # config-location: classpath:mybatis/mybatis-config.xml

  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```



## 二、单表场景概述

(1) 结果映射

​	@TableName("user")

​	@TableField(value = "")

(2) INSERT

​	ID: 默认的是自动赋值插入(根据主键类型uuid或雪花id), AUTO、ASSIGN_UUID、ASSIGN_ID、INPUT

​	自动填充: 标注@TableField(fill = FieldFill.INSERT), 重写 MetaObjectHandler.insertFill

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

(3) DELETE、UPDATE

​	逻辑删除: 全局配置 or @TableLogic, 不需要插件支持

​		db-config.logic-delete-field: deleted

​		db-config.logic-delete-value: 1

​		db-config.logic-not-delete-value: 0

​	拦截全表

​		interceptor.addInnerInterceptor(new BlockAttackInnerInterceptor());

(4) SELECT

​	Page: mbp的插件集成

​		// 如果配置多个插件, 切记分页最后添加, 如果有多数据源可以不配具体类型, 否则都建议配上具体的 DbType

​		(new PaginationInnerInterceptor(DbType.MYSQL)); 

​	OrderBy: @OrderBy

​	敏感字段: TableField(select = false), SELECT语句中忽略

(5) 枚举类型

​	@EnumValue 标记数据库字段值, 实际上是由Mybatis中的enumTypeHandler重写而来

(6) 乐观锁插件

​	谨慎考虑, 不是很全面的解决方式, 注解标记(@Version)在api中已经有不足了(先查再改的模式才正常), 失效场景比如wrapper更新, 比如直接update时的null字段, 何况会有更多的(如果在全局控制中强力拦截效果会好)

​	配合了解 @TableField(update="%s+1", updateStrategy = FieldStrategy.ALWAYS)

(7) TableField

​	condition、update  不写不用

​	insertStrategy、updateStrategy 不写不用



## 三、 工具包

### DbKit

一个类似于service层api风格的静态工具包, 本质上还是通过对象类型找到对应的mapper来执行具体逻辑

### simpleQuery

不能准确概括, 本来以为只是另一个简单的包封装

```java
 LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(User::getStatus, "active");

        Map<String, List<User>> userGroup = SimpleQuery.group(
                queryWrapper,
                User::getName,
                user -> System.out.println("Processing user: " + user.getName())
        );
```



## 四、条件构造

如同标题侧重于条件构造,字段值或范围匹配等而不是如聚合、分析, 略微实践下来实际上不如直接写SQL简便

getCustomSqlSegment() 方法可以返回Wrapper组织的SQL语句直接可以作为XML-SQL的参数使用

and、or 好理解,语法有点繁琐

```java
/// where (condition1 and condition2) or (condition3 and condition4)
wrapper = new LambdaQueryWrapper<SysUser>()
    .or(i -> i.and(j -> j.eq(SysUser::getUserName, "admin").eq(SysUser::getStatus, "0"))
        .or(j -> j.eq(SysUser::getUserName, "superadmin").eq(SysUser::getStatus, "0")));

log.info(wrapper.getCustomSqlSegment());

/// where (condition1 and condition2) and (condition3 and condition4)
wrapper = new LambdaQueryWrapper<SysUser>()
    .and(i -> i.and(j -> j.eq(SysUser::getUserName, "admin").eq(SysUser::getStatus, "1"))
         .and(j -> j.eq(SysUser::getUserName, "superadmin").eq(SysUser::getStatus, "1")));
log.info(wrapper.getCustomSqlSegment());
```

groupBy having

```java
/// 此处不适合LambdaQueryWrapper
QueryWrapper<SysUser> wrapper = new QueryWrapper<>();
        wrapper.groupBy("status").having("count(*) > 1")
                .select("status,count(*) as count");
```

apply 直接拼接的SQL

```java
 lambdaQueryWrapper.apply("date_format(dateColumn, '%Y-%m-%d') = '2008-08-08'");
```



## 五、其他业务插件

### 动态数据源dynamicDataSouce插件

`AbstractRoutingDataSource` 的封装包? 同个作者...

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>dynamic-datasource-spring-boot-starter</artifactId>
    <version>3.4.0</version>
</dependency>

<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-jsqlparser</artifactId>
    <version>3.5.12</version>
</dependency>
```

```yml
spring:
  datasource:
    dynamic:
      primary: master
      datasource:
        master:
          driver-class-name: 
          url: 
          username: 
          password: 
        slave:
          driver-class-name: 
          url: 
          username: 
          password: 
```

注解方式 @DS 或者 编码方式:

```
DynamicDataSourceContextHolder.push("master");
DynamicDataSourceContextHolder.clear();
```



### 多租户Tenant插件

1. 拦截HTTP, 请求中URL或者HEADER中拿到租户值
2. 实现TenantLineHandler, 赋值到其中getTenantId()方法

```java
// 需要添加到拦截器注册BEAN
@Component
public class CustomTenantHandler implements TenantLineHandler {

    @Override
    public Expression getTenantId() {
        String tenantId = TenantRequestContext.getTenantLocal();

        tenantId = tenantId == null || tenantId.isEmpty() ? "1001" : tenantId;

        return new StringValue(tenantId);
    }

    @Override
    public String getTenantIdColumn() {
        return "tenant_id";
    }

    @Override
    public boolean ignoreTable(String tableName) {
        return IGNORE_TENANT_TABLES.contains(tableName);
    }

    private static final List<String> IGNORE_TENANT_TABLES = new ArrayList<>();
}
```

```java
@Component
public class TenantUserInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String tenantId = request.getHeader("tenant_id");
        if (!StringUtils.isNullOrEmpty(tenantId)) {
            TenantRequestContext.setTenantLocal(tenantId);
            log.info("当前租户ID:" + tenantId);
        }
        return HandlerInterceptor.super.preHandle(request, response, handler);
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        TenantRequestContext.remove();
    }
}
```

```java
public class TenantRequestContext {
    private static ThreadLocal<String> tenantLocal = new ThreadLocal<>();

    public static void setTenantLocal(String tenantId) {
        tenantLocal.set(tenantId);
    }

    public static String getTenantLocal() {
        return tenantLocal.get();
    }

    public static void remove() {
        tenantLocal.remove();
    }
}
```



### JOIN

```xml
<dependency>
    <groupId>com.github.yulichang</groupId>
    <artifactId>mybatis-plus-join-boot-starter</artifactId>
    <version>1.5.5</version>
</dependency>
```

