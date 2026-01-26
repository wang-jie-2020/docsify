## ORACLE

### 字符集/大小写

- **数据库/表名**：默认不敏感, 且默认都会转大写
- **数据内容**：默认敏感

虽然Oracle默认区分大小写，但有一个**会话级参数 `NLS_COMP` 和 `NLS_SORT`** 可以在当前连接中临时改变这一行为。

```plsql
# 查看当前设置
SELECT SYS_CONTEXT('USERENV', 'NLS_COMP') AS NLS_COMP,
       SYS_CONTEXT('USERENV', 'NLS_SORT') AS NLS_SORT
FROM DUAL;

ALTER SESSION SET NLS_COMP = LINGUISTIC;
ALTER SESSION SET NLS_SORT = BINARY_CI; -- `_CI` 后缀表示 Case-Insensitive
-- 设置后，当前会话中的字符串比较将不区分大小写
SELECT * FROM users WHERE username = 'admin'; -- 现在可以查到 'Admin'
```



### 常用运维语句

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



### 函数

| 类别         | 核心功能                                                     | 官方文档（Oracle 19c）                                       |
| :----------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **单行函数** | 对每一行数据操作并返回一个结果，包含字符、数值、日期、转换等。 | [SQL Functions](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Functions.html) |
| **聚合函数** | 对多行数据进行汇总计算，返回单个统计值。                     | [Aggregate Functions](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Aggregate-Functions.html) |
| **分析函数** | 在分组基础上，对组内数据进行排序、排名、移动计算等高级分析。 | [Analytic Functions](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Analytic-Functions.html) |

#### 1.1 字符函数

| 函数                                              | 功能描述                                                 | 简单示例                                   |
| :------------------------------------------------ | :------------------------------------------------------- | :----------------------------------------- |
| **`UPPER(str)`**                                  | 将字符串转换为大写。                                     | `UPPER('hello')` → `'HELLO'`               |
| **`LOWER(str)`**                                  | 将字符串转换为小写。                                     | `LOWER('HELLO')` → `'hello'`               |
| **`INITCAP(str)`**                                | 使每个单词的首字母大写。                                 | `INITCAP('hello world')` → `'Hello World'` |
| **`CONCAT(str1, str2)`**                          | 连接两个字符串。                                         | `CONCAT('A', 'B')` → `'AB'`                |
| **`SUBSTR(str, start, [len])`**                   | 从 `start` 位置（从1开始计数）截取子串，`len` 指定长度。 | `SUBSTR('Hello', 2, 3)` → `'ell'`          |
| **`LENGTH(str)`**                                 | 返回字符串的字符长度。                                   | `LENGTH('Hello')` → `5`                    |
| **`INSTR(str, substr)`**                          | 返回子串 `substr` 在字符串 `str` 中首次出现的位置。      | `INSTR('Hello', 'e')` → `2`                |
| **`TRIM([LEADING|TRAILING|BOTH] 'c' FROM str)`**  | 去除字符串首尾的指定字符（默认为空格）。                 | `TRIM(' Hello ')` → `'Hello'`              |
| **`LTRIM(str)` / `RTRIM(str)`**                   | 去除字符串左侧/右侧的空格。                              | `LTRIM(' Hello')` → `'Hello'`              |
| **`LPAD(str, len, 'c')` / `RPAD(str, len, 'c')`** | 将字符串用指定字符向左/右填充至指定长度 `len`。          | `LPAD('Hi', 5, '*')` → `'***Hi'`           |

#### 1.2 数值函数

| 函数                | 功能描述                                                     | 简单示例                       |
| :------------------ | :----------------------------------------------------------- | :----------------------------- |
| **`ROUND(n, [m])`** | 四舍五入。`m` 为正数则保留 `m` 位小数，为负数则对小数点前 `abs(m)` 位进行四舍五入。 | `ROUND(457.628, 2)` → `457.63` |
| **`TRUNC(n, [m])`** | 截断数值。`m` 为正数则保留 `m` 位小数，为负数则将小数点前 `abs(m)` 位替换为0。 | `TRUNC(457.628, -1)` → `450`   |
| **`CEIL(n)`**       | 向上取整，返回大于等于 `n` 的最小整数。                      | `CEIL(3.2)` → `4`              |
| **`FLOOR(n)`**      | 向下取整，返回小于等于 `n` 的最大整数。                      | `FLOOR(3.9)` → `3`             |
| **`ABS(n)`**        | 返回绝对值。                                                 | `ABS(-10)` → `10`              |
| **`MOD(m, n)`**     | 返回 `m` 除以 `n` 的余数。                                   | `MOD(10, 3)` → `1`             |
| **`POWER(m, n)`**   | 返回 `m` 的 `n` 次幂。                                       | `POWER(2, 3)` → `8`            |
| **`SQRT(n)`**       | 返回平方根。                                                 | `SQRT(9)` → `3`                |

#### 1.3 日期函数

| 函数                               | 功能描述                                                     | 简单示例                                     |
| :--------------------------------- | :----------------------------------------------------------- | :------------------------------------------- |
| **`SYSDATE`**                      | 返回当前数据库服务器的系统日期和时间。                       | `SELECT SYSDATE FROM dual;`                  |
| **`ADD_MONTHS(date, n)`**          | 为日期增加（或减少，`n`为负）`n` 个月。                      | `ADD_MONTHS(SYSDATE, 1)`                     |
| **`MONTHS_BETWEEN(date1, date2)`** | 返回两个日期之间相差的月数（可为小数）。                     | `MONTHS_BETWEEN('2023-12-31', '2023-01-01')` |
| **`LAST_DAY(date)`**               | 返回指定日期所在月份的最后一天。                             | `LAST_DAY(SYSDATE)`                          |
| **`TRUNC(date, [format])`**        | 截断日期。`format` 如 `'YYYY'`、`'MM'`、`'DD'`，分别截断到年初、月初、日初。 | `TRUNC(SYSDATE, 'MM')`                       |
| **`ROUND(date, [format])`**        | 对日期进行四舍五入。                                         | `ROUND(SYSDATE, 'YYYY')`                     |

#### 1.4 转换函数

| 函数                            | 功能描述                       | 简单示例                              |
| :------------------------------ | :----------------------------- | :------------------------------------ |
| **`TO_CHAR(date, 'format')`**   | 将日期按指定格式转换为字符串。 | `TO_CHAR(SYSDATE, 'YYYY-MM-DD')`      |
| **`TO_CHAR(number, 'format')`** | 将数字按指定格式转换为字符串。 | `TO_CHAR(55676, '99,999')`            |
| **`TO_DATE(char, 'format')`**   | 将字符串按指定格式转换为日期。 | `TO_DATE('2023-01-01', 'YYYY-MM-DD')` |
| **`TO_NUMBER(char, 'format')`** | 将字符串转换为数字。           | `TO_NUMBER('123.45')`                 |

#### 1.5 通用与条件函数

| 函数                                               | 功能描述                                                     | 简单示例                                           |
| :------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------- |
| **`NVL(expr1, expr2)`**                            | 若 `expr1` 为 `NULL`，则返回 `expr2`，否则返回 `expr1`。     | `NVL(comm, 0)`                                     |
| **`COALESCE(expr1, expr2, ..., exprn)`**           | 返回参数列表中第一个非 `NULL` 的值。                         | `COALESCE(comm, bonus, 0)`                         |
| **`DECODE(expr, search1, result1, ..., default)`** | 类似于简单的 `CASE`，若 `expr` 等于 `search1` 则返回 `result1`，以此类推，否则返回默认值。 | `DECODE(status, 'A', '激活', 'I', '失效', '未知')` |
| **`CASE ... WHEN ... THEN ... END`**               | 条件判断，功能比 `DECODE` 更强大。                           | `CASE WHEN score >= 90 THEN '优秀' END`            |

#### 1.4 分析函数

| 函数                               | 功能描述                                                     | 简单示例（假设按部门`dept_id`分区，按薪水`salary`排序）      |
| :--------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **`ROW_NUMBER()`**                 | 为组内的每一行分配一个唯一的连续序号。                       | `ROW_NUMBER() OVER(PARTITION BY dept_id ORDER BY salary DESC)` |
| **`RANK()`**                       | 分配排名，并列时会留下空位（如：1, 2, 2, 4）。               | `RANK() OVER(PARTITION BY dept_id ORDER BY salary DESC)`     |
| **`DENSE_RANK()`**                 | 分配排名，并列时不留空位（如：1, 2, 2, 3）。                 | `DENSE_RANK() OVER(PARTITION BY dept_id ORDER BY salary DESC)` |
| **`SUM(col) OVER(...)`**           | 计算组内累计和、移动平均等。                                 | `SUM(salary) OVER(PARTITION BY dept_id ORDER BY hire_date)`  |
| **`AVG(col) OVER(...)`**           | 计算组内移动平均值。                                         | `AVG(salary) OVER(PARTITION BY dept_id ORDER BY hire_date ROWS 2 PRECEDING)` |
| **`LAG(col, n)`** / `LEAD(col, n)` | 访问组内当前行之前（`LAG`）或之后（`LEAD`）第 `n` 行的数据。 | `LAG(salary, 1) OVER(PARTITION BY dept_id ORDER BY hire_date)` |

#### 1.5 补充

**cast(expr AS type_name):** 用于将某种数据类型的数据显式转换为另一种数据类型的数据。

**row_number() over (partition by col1 order by col2) :** 表示根据col1分区，在分组内部根据 col2排序，而这个值就表示每组内部排序后的