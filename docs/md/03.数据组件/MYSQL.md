## MYSQL

### 字符集/大小写

- **数据库/表名**：取决于操作系统和配置
- **字段名**：不区分大小写
- **数据内容**：取决于字符集校对规则
- **关键字**：不区分大小写

字符集校对规则:

- **_CI**：Case-Insensitive，不区分大小写。如 `utf8mb4_general_ci`

- **_CS**：Case-Sensitive，区分大小写。

  

### 常用运维语句

```sql
-- 显示环境配置:
show variables like "%connection%";
show variables like "%timeout%";

-- 创建只读账号:
CREATE USER 'readonly'@'%' IDENTIFIED BY 'Qwer1234!@#$';
GRANT SELECT ON *.* TO 'readonly'@'%' ;
FLUSH PRIVILEGES;
```



### 函数

#### 数学函数

数学函数用于执行数学计算。

- ‌**绝对值**‌：`ABS(x)` 返回 x 的绝对值。‌
- ‌**取余**‌：`MOD(x, y)` 或 `x % y` 返回 x 除以 y 的余数。‌
- ‌**向下取整**‌：`FLOOR(x)` 返回小于或等于 x 的最大整数。‌
- ‌**向上取整**‌：`CEIL(x)` 或 `CEILING(x)` 返回大于或等于 x 的最小整数。‌
- ‌**四舍五入**‌：`ROUND(x, d)` 返回 x 四舍五入后保留 d 位小数的结果。‌
- ‌**截断**‌：`TRUNCATE(x, d)` 返回 x 截断到 d 位小数的结果，不进行四舍五入。‌
- ‌**随机数**‌：`RAND()` 返回一个 0 到 1 之间的随机浮点数。‌
- ‌**圆周率**‌：`PI()` 返回圆周率 π 的值。‌

#### 字符串函数

字符串函数用于处理文本数据。

- ‌**大小写转换**‌：`UPPER(str)` 或 `UCASE(str)` 将字符串转换为大写；`LOWER(str)` 或 `LCASE(str)` 将字符串转换为小写。‌
- ‌**长度计算**‌：`LENGTH(str)` 返回字符串的字节长度；`CHAR_LENGTH(str)` 返回字符串的字符个数。‌
- ‌**字符串拼接**‌：`CONCAT(str1, str2, ...)` 将多个字符串连接成一个字符串。‌
- ‌**子串截取**‌：`SUBSTR(str, start, length)` 或 `SUBSTRING(str, start, length)` 从字符串 str 的第 start 位开始截取长度为 length 的子串（索引从1开始）。‌
- ‌**字符串比较**‌：`strcmp(str1, str2)` 比较两个字符串，返回0表示相等，返回1表示 str1 > str2，返回-1表示 str1 < str2。‌
- ‌**查找子串**‌：`INSTR(str, substr)` 返回子串 substr 在字符串 str 中第一次出现的起始位置（索引从1开始），如果未找到则返回0。‌
- ‌**去除空格/字符**‌：`TRIM([remstr FROM] str)` 去掉字符串 str 前后的空格（或指定的字符 remstr）。‌
- **在由逗号分隔的字符串列表中查找指定值的位置**: `FIND_IN_SET(str, strlist)`

#### 日期函数

日期函数用于处理日期和时间数据。

- ‌**获取当前日期时间**‌：`NOW()` 返回当前日期和时间；`CURDATE()` 返回当前日期；`CURTIME()` 返回当前时间。‌

   *有三个时间函数用来获取当前的时间，分别是now()、current_timestamp() 和 sysdate()*

- ‌**日期格式化**‌：`DATE_FORMAT(date, format)` 将日期按照指定格式转换为字符串。‌

- ‌**字符串转日期**‌：`STR_TO_DATE(str, format)` 将符合格式的字符串解析为日期。‌

- ‌**日期差**‌：`DATEDIFF(date1, date2)` 计算两个日期之间的天数差（date1 - date2）。‌

- ‌**提取日期部分**‌：`YEAR(date)`、`MONTH(date)`、`DAY(date)` 分别返回日期的年、月、日部分。‌

- ‌**提取时间部分**‌：`HOUR(time)`、`MINUTE(time)`、`SECOND(time)` 分别返回时间的时、分、秒部分。‌

#### 流程控制函数

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