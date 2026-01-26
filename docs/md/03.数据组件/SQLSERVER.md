## SQLSERVER

### 字符集/大小写

- SQL Server默认不区分大小写，但可以通过设置排序规则精确控制

字符集校对规则:

- **_CI**：Case-Insensitive，不区分大小写。

- **_CS**：Case-Sensitive，区分大小写。

  

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



### 函数

#### **一、字符串函数**

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

#### **二、日期和时间函数**

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

#### **三、数学函数**

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

#### 四、类型转换函数

用于转换数据类型。

| 函数                                       | 功能描述                                               | 示例                                            |
| :----------------------------------------- | :----------------------------------------------------- | :---------------------------------------------- |
| `CAST(expression AS data_type)`            | 将表达式显式转换为另一种数据类型。                     | `CAST('123' AS INT)` → 123                      |
| `CONVERT(data_type, expression [, style])` | 转换数据类型，常用于日期/时间的格式化（`style`参数）。 | `CONVERT(VARCHAR, GETDATE(), 112)` → '20231209' |
