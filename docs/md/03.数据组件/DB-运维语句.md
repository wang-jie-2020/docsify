## MYSQL

```sql
-- 显示环境配置:
show variables like "%connection%";
show variables like "%timeout%";

-- 创建只读账号:
CREATE USER 'readonly'@'%' IDENTIFIED BY 'Qwer1234!@#$';
GRANT SELECT ON *.* TO 'readonly'@'%' ;
FLUSH PRIVILEGES;
```



## ORACLE

```SQL
SELECT * FROM V$SESSION;

-- 允许最大进程数、连接数
select name,value from v$parameter where name in('processes' ,'sessions');

-- 当前进程数、连接数
select count(1) from v$session;
select count(1) from v$process;


/*
	IDLE_TIME：限制每个会话所允许的最长连续空闲时间，超过这个时间会话将自动断开。（参数值是一个整数，单位是分钟，UNLIMITED 不限制）
	CONNECT_TIME：限制指定会话的总运行时间限制，超过这个时间会话将自动断开。（参数值是一个整数，单位是分钟，UNLIMITED 不限制）
*/
SELECT resource_name,resource_type,LIMIT FROM dba_profiles 
WHERE resource_Name IN ( 'IDLE_TIME', 'CONNECT_TIME' ) AND PROFILE='DEFAULT' ;

-- 修改空闲超时时间10分钟
ALTER PROFILE DEFAULT LIMIT IDLE_TIME 10;

```



## SQLSERVER

### 自增ID

```sql
SELECT SCOPE_IDENTITY() --返回插入到同一作用域中的 IDENTITY 列内的最后一个 IDENTITY 值。
SELECT @@IDENTITY   --返回插入到当前会话中任何作用域内的最后一个 IDENTITY 列值
```

一个作用域就是一个模块——存储过程、触发器、函数或批处理。因此，如果两个语句处于同一个存储过程、函数或批处理中，则它们位于相同的作用域中。

```sql
SELECT IDENT_CURRENT('TbName')--不受作用域和会话的限制，而受限于指定的表。
IDENT_CURRENT 返回为任何会话和作用域中的特定表所生成的值。
```

对于马上使用的刚才插入的新记录ID用SCOPE_IDENTITY()是最合适的;

对于想要得到一系列的操作中最后得到的那个自增的ID最好用@@IDENTITY;

对于想要得到一个表中的最后一个插入操作所产生的ID的最好用IDENT_CURRENT('TBName');

```sql
DECLARE   @TMP_ID   INT  
SET   @TMP_ID   =   IDENT_CURRENT('BID_EvaluateItem')  
IF   ((@TMP_ID   IS   NOT   NULL)   AND   (@TMP_ID   >0))  
BEGIN  
--其它的操作  
END
```

