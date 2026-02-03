## 字符集和排序规则(Collation)

| **数据库**     | **默认大小写敏感性**                      | **核心机制与配置**                                           | **常用字符集**                             | **管理与调整要点**                                           |
| :------------- | :---------------------------------------- | :----------------------------------------------------------- | :----------------------------------------- | :----------------------------------------------------------- |
| **MySQL**      | **字符值不敏感**；表名（Unix类系统）敏感  | **排序规则（Collation）**。由后缀`_ci`(不敏感)/`_cs`(敏感)/`_bin`(二进制)控制。 | `utf8mb4`（推荐）、`utf8`、`gbk`、`latin1` | 用`CHARACTER SET`与`COLLATE`设置库/表/列；用`lower_case_table_names`控制系统级表名大小写。 |
| **SQL Server** | **由实例排序规则决定**                    | **实例级/列级排序规则**。后缀`CI`(不敏感)/`CS`(敏感)。       | 随Windows区域设置，如`Chinese_PRC_CI_AS`。 | 实例排序规则影响全局；可在查询中用`COLLATE`子句临时覆盖。    |
| **Oracle**     | **字符值默认敏感**；表名**默认不敏感**    | **国家语言支持（NLS）参数**和`COLLATE`子句。                 | `AL32UTF8`（UTF-8）、`ZHS16GBK`            | 通过`NLS_SORT`等参数设置语言排序行为；用`COLLATE`子句修改查询行为。 |
| **PostgreSQL** | **字符值和标识符（表名/列名）默认都敏感** | **运行时排序规则**与`CITEXT`扩展类型。                       | `UTF8`                                     | 标识符大小写用**双引号**保护；字符串比较可用`CITEXT`类型、`ILIKE`操作符或`lower()`函数。 |

- 字符集

  - MySQL 偶尔会有utf8、utf8mb4的问题
  - SQL Server 

  

### ORACLE会话级参数 `NLS_COMP` 和 `NLS_SORT`

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

