## MYSQL

### 1.1 数学函数

数学函数用于执行数学计算。

- ‌**绝对值**‌：`ABS(x)` 返回 x 的绝对值。‌
- ‌**取余**‌：`MOD(x, y)` 或 `x % y` 返回 x 除以 y 的余数。‌
- ‌**向下取整**‌：`FLOOR(x)` 返回小于或等于 x 的最大整数。‌
- ‌**向上取整**‌：`CEIL(x)` 或 `CEILING(x)` 返回大于或等于 x 的最小整数。‌
- ‌**四舍五入**‌：`ROUND(x, d)` 返回 x 四舍五入后保留 d 位小数的结果。‌
- ‌**截断**‌：`TRUNCATE(x, d)` 返回 x 截断到 d 位小数的结果，不进行四舍五入。‌
- ‌**随机数**‌：`RAND()` 返回一个 0 到 1 之间的随机浮点数。‌
- ‌**圆周率**‌：`PI()` 返回圆周率 π 的值。‌

### 1.2 字符串函数

字符串函数用于处理文本数据。

- ‌**大小写转换**‌：`UPPER(str)` 或 `UCASE(str)` 将字符串转换为大写；`LOWER(str)` 或 `LCASE(str)` 将字符串转换为小写。‌
- ‌**长度计算**‌：`LENGTH(str)` 返回字符串的字节长度；`CHAR_LENGTH(str)` 返回字符串的字符个数。‌
- ‌**字符串拼接**‌：`CONCAT(str1, str2, ...)` 将多个字符串连接成一个字符串。‌
- ‌**子串截取**‌：`SUBSTR(str, start, length)` 或 `SUBSTRING(str, start, length)` 从字符串 str 的第 start 位开始截取长度为 length 的子串（索引从1开始）。‌
- ‌**字符串比较**‌：`strcmp(str1, str2)` 比较两个字符串，返回0表示相等，返回1表示 str1 > str2，返回-1表示 str1 < str2。‌
- ‌**查找子串**‌：`INSTR(str, substr)` 返回子串 substr 在字符串 str 中第一次出现的起始位置（索引从1开始），如果未找到则返回0。‌
- ‌**去除空格/字符**‌：`TRIM([remstr FROM] str)` 去掉字符串 str 前后的空格（或指定的字符 remstr）。‌
- **在由逗号分隔的字符串列表中查找指定值的位置**: `FIND_IN_SET(str, strlist)`

### 1.3 日期函数

日期函数用于处理日期和时间数据。

- ‌**获取当前日期时间**‌：`NOW()` 返回当前日期和时间；`CURDATE()` 返回当前日期；`CURTIME()` 返回当前时间。‌

  *有三个时间函数用来获取当前的时间，分别是now()、current_timestamp() 和 sysdate()*

- ‌**日期格式化**‌：`DATE_FORMAT(date, format)` 将日期按照指定格式转换为字符串。‌

- ‌**字符串转日期**‌：`STR_TO_DATE(str, format)` 将符合格式的字符串解析为日期。‌

- ‌**日期差**‌：`DATEDIFF(date1, date2)` 计算两个日期之间的天数差（date1 - date2）。‌

- ‌**提取日期部分**‌：`YEAR(date)`、`MONTH(date)`、`DAY(date)` 分别返回日期的年、月、日部分。‌

- ‌**提取时间部分**‌：`HOUR(time)`、`MINUTE(time)`、`SECOND(time)` 分别返回时间的时、分、秒部分。‌

### 1.4 流程控制函数

流程控制函数允许在 SQL 中实现条件逻辑。

- ‌**IF 函数**‌：`IF(condition, value_if_true, value_if_false)` 如果 condition 为真，返回 value_if_true，否则返回 value_if_false。‌

- ‌CASE 结构:

  等值判断:

  ```mysql
  CASE expression
      WHEN value1 THEN result1
      WHEN value2 THEN result2
      ...
      ELSE resultN
  END
  ```

  区间判断‌：类似于多重 if 语句。

  ```mysql
  CASE
      WHEN condition1 THEN result1
      WHEN condition2 THEN result2
      ...
      ELSE resultN
  END
  ```



## ORACLE

| 类别         | 核心功能                                                     | 官方文档（Oracle 19c）                                       |
| :----------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **单行函数** | 对每一行数据操作并返回一个结果，包含字符、数值、日期、转换等。 | [SQL Functions](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Functions.html) |
| **聚合函数** | 对多行数据进行汇总计算，返回单个统计值。                     | [Aggregate Functions](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Aggregate-Functions.html) |
| **分析函数** | 在分组基础上，对组内数据进行排序、排名、移动计算等高级分析。 | [Analytic Functions](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Analytic-Functions.html) |

### 1.1 字符函数

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

### 1.2 数值函数

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

### 1.3 日期函数

| 函数                               | 功能描述                                                     | 简单示例                                     |
| :--------------------------------- | :----------------------------------------------------------- | :------------------------------------------- |
| **`SYSDATE`**                      | 返回当前数据库服务器的系统日期和时间。                       | `SELECT SYSDATE FROM dual;`                  |
| **`ADD_MONTHS(date, n)`**          | 为日期增加（或减少，`n`为负）`n` 个月。                      | `ADD_MONTHS(SYSDATE, 1)`                     |
| **`MONTHS_BETWEEN(date1, date2)`** | 返回两个日期之间相差的月数（可为小数）。                     | `MONTHS_BETWEEN('2023-12-31', '2023-01-01')` |
| **`LAST_DAY(date)`**               | 返回指定日期所在月份的最后一天。                             | `LAST_DAY(SYSDATE)`                          |
| **`TRUNC(date, [format])`**        | 截断日期。`format` 如 `'YYYY'`、`'MM'`、`'DD'`，分别截断到年初、月初、日初。 | `TRUNC(SYSDATE, 'MM')`                       |
| **`ROUND(date, [format])`**        | 对日期进行四舍五入。                                         | `ROUND(SYSDATE, 'YYYY')`                     |

### 1.4 转换函数

| 函数                            | 功能描述                       | 简单示例                              |
| :------------------------------ | :----------------------------- | :------------------------------------ |
| **`TO_CHAR(date, 'format')`**   | 将日期按指定格式转换为字符串。 | `TO_CHAR(SYSDATE, 'YYYY-MM-DD')`      |
| **`TO_CHAR(number, 'format')`** | 将数字按指定格式转换为字符串。 | `TO_CHAR(55676, '99,999')`            |
| **`TO_DATE(char, 'format')`**   | 将字符串按指定格式转换为日期。 | `TO_DATE('2023-01-01', 'YYYY-MM-DD')` |
| **`TO_NUMBER(char, 'format')`** | 将字符串转换为数字。           | `TO_NUMBER('123.45')`                 |

### 1.5 通用与条件函数

| 函数                                               | 功能描述                                                     | 简单示例                                           |
| :------------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------- |
| **`NVL(expr1, expr2)`**                            | 若 `expr1` 为 `NULL`，则返回 `expr2`，否则返回 `expr1`。     | `NVL(comm, 0)`                                     |
| **`COALESCE(expr1, expr2, ..., exprn)`**           | 返回参数列表中第一个非 `NULL` 的值。                         | `COALESCE(comm, bonus, 0)`                         |
| **`DECODE(expr, search1, result1, ..., default)`** | 类似于简单的 `CASE`，若 `expr` 等于 `search1` 则返回 `result1`，以此类推，否则返回默认值。 | `DECODE(status, 'A', '激活', 'I', '失效', '未知')` |
| **`CASE ... WHEN ... THEN ... END`**               | 条件判断，功能比 `DECODE` 更强大。                           | `CASE WHEN score >= 90 THEN '优秀' END`            |

### 1.6 分析函数

| 函数                               | 功能描述                                                     | 简单示例（假设按部门`dept_id`分区，按薪水`salary`排序）      |
| :--------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **`ROW_NUMBER()`**                 | 为组内的每一行分配一个唯一的连续序号。                       | `ROW_NUMBER() OVER(PARTITION BY dept_id ORDER BY salary DESC)` |
| **`RANK()`**                       | 分配排名，并列时会留下空位（如：1, 2, 2, 4）。               | `RANK() OVER(PARTITION BY dept_id ORDER BY salary DESC)`     |
| **`DENSE_RANK()`**                 | 分配排名，并列时不留空位（如：1, 2, 2, 3）。                 | `DENSE_RANK() OVER(PARTITION BY dept_id ORDER BY salary DESC)` |
| **`SUM(col) OVER(...)`**           | 计算组内累计和、移动平均等。                                 | `SUM(salary) OVER(PARTITION BY dept_id ORDER BY hire_date)`  |
| **`AVG(col) OVER(...)`**           | 计算组内移动平均值。                                         | `AVG(salary) OVER(PARTITION BY dept_id ORDER BY hire_date ROWS 2 PRECEDING)` |
| **`LAG(col, n)`** / `LEAD(col, n)` | 访问组内当前行之前（`LAG`）或之后（`LEAD`）第 `n` 行的数据。 | `LAG(salary, 1) OVER(PARTITION BY dept_id ORDER BY hire_date)` |

### 1.7 补充

**cast(expr AS type_name):** 用于将某种数据类型的数据显式转换为另一种数据类型的数据。

**row_number() over (partition by col1 order by col2) :** 表示根据col1分区，在分组内部根据 col2排序，而这个值就表示每组内部排序后的



## SQLSERVER

### 1.1 字符串函数

用于处理文本数据，如截取、连接、查找和替换。

| 函数                                           | 功能描述                                     | 示例                                 |
| :--------------------------------------------- | :------------------------------------------- | :----------------------------------- |
| `LEN(string)`                                  | 返回字符串长度（忽略尾部空格）。             | `LEN('Hello')` → 5                   |
| `SUBSTRING(expr, start, length)`               | 从指定位置截取子串（start从1开始）。         | `SUBSTRING('SQL', 2, 2)` → 'QL'      |
| `CONCAT(str1, str2, ...)`                      | 连接多个字符串（自动处理NULL）。             | `CONCAT('A', NULL, 'B')` → 'AB'      |
| `CHARINDEX(substr, string)`                    | 查找子串首次出现的位置，未找到则返回0。      | `CHARINDEX('L', 'HELLO')` → 3        |
| `REPLACE(string, old, new)`                    | 替换字符串中所有出现的指定子串。             | `REPLACE('A-B-C', '-', '')` → 'ABC'  |
| `UPPER(string) / LOWER(string)`                | 将字符串转换为全大写/全小写。                | `UPPER('sql')` → 'SQL'               |
| `LTRIM(string) / RTRIM(string)`                | 去除字符串左侧/右侧的空格。                  | `LTRIM(' test')` → 'test'            |
| `REVERSE(char_expr)`                           | 反转字符串。                                 | `REVERSE('123')` → '321'             |
| `STUFF(char_expr1, start, length, char_expr2)` | 删除指定长度的字符，并在该位置插入新字符串。 | `STUFF('ABCD', 2, 2, 'XY')` → 'AXYD' |

### 1.2 日期和时间函数

用于获取、计算和格式化日期时间。

| 函数                                     | 功能描述                                       | 示例                                             |
| :--------------------------------------- | :--------------------------------------------- | :----------------------------------------------- |
| `GETDATE()`                              | 返回当前系统日期和时间（`datetime`类型）。     | `GETDATE()` → `2023-12-09 10:30:00.123`          |
| `DATEADD(datepart, number, date)`        | 为日期添加一个时间间隔（如DAY, MONTH, YEAR）。 | `DATEADD(DAY, 5, '2023-01-01')` → `2023-01-06`   |
| `DATEDIFF(datepart, startdate, enddate)` | 返回两个日期之间的时间间隔。                   | `DATEDIFF(MONTH, '2023-01', '2023-03')` → 2      |
| `DATEPART(datepart, date)`               | 返回日期的指定部分（如年、月、日）。           | `DATEPART(YEAR, '2023-12-09')` → 2023            |
| `DATENAME(datepart, date)`               | 以字符串形式返回日期的指定部分（如星期几）。   | `DATENAME(WEEKDAY, '2023-12-09')` → 'Saturday'   |
| `YEAR(date) / MONTH(date) / DAY(date)`   | 返回日期的年份/月份/日。                       | `YEAR('2023-12-09')` → 2023                      |
| `EOMONTH(date)`                          | 返回指定日期所在月份的最后一天。               | `EOMONTH('2023-02-01')` → `2023-02-28`           |
| `CONVERT(data_type, date, style)`        | 将日期转换为指定样式的字符串。                 | `CONVERT(VARCHAR, GETDATE(), 23)` → '2023-12-09' |

### 1.3 数学函数

用于执行数值计算。

| 函数                          | 功能描述                                     | 示例                      |
| :---------------------------- | :------------------------------------------- | :------------------------ |
| `ABS(numeric_expr)`           | 返回数值的绝对值。                           | `ABS(-10.5)` → 10.5       |
| `ROUND(numeric_expr, length)` | 将数值四舍五入到指定精度。                   | `ROUND(3.1415, 2)` → 3.14 |
| `CEILING(numeric_expr)`       | 向上取整，返回大于等于该数的最小整数。       | `CEILING(3.2)` → 4        |
| `FLOOR(numeric_expr)`         | 向下取整，返回小于等于该数的最大整数。       | `FLOOR(3.9)` → 3          |
| `POWER(float_expr, y)`        | 返回指定数值的幂。                           | `POWER(2, 3)` → 8         |
| `SQRT(float_expr)`            | 返回数值的平方根。                           | `SQRT(9)` → 3             |
| `RAND([seed])`                | 返回一个0到1之间的随机浮点数（可指定种子）。 | `RAND()` → 0.7632         |

### 1.4 类型转换函数

用于转换数据类型。

| 函数                                       | 功能描述                                               | 示例                                            |
| :----------------------------------------- | :----------------------------------------------------- | :---------------------------------------------- |
| `CAST(expression AS data_type)`            | 将表达式显式转换为另一种数据类型。                     | `CAST('123' AS INT)` → 123                      |
| `CONVERT(data_type, expression [, style])` | 转换数据类型，常用于日期/时间的格式化（`style`参数）。 | `CONVERT(VARCHAR, GETDATE(), 112)` → '20231209' |