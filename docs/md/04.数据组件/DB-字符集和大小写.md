## 字符集和排序规则(Collation)

| **数据库**     | **默认大小写敏感性**                      | **核心机制与配置**                                           | **常用字符集**                             | **管理与调整要点**                                           |
| :------------- | :---------------------------------------- | :----------------------------------------------------------- | :----------------------------------------- | :----------------------------------------------------------- |
| **MySQL**      | **字符值不敏感**；表名（Unix类系统）敏感  | **排序规则（Collation）**。由后缀`_ci`(不敏感)/`_cs`(敏感)/`_bin`(二进制)控制。 | `utf8mb4`（推荐）、`utf8`、`gbk`、`latin1` | 用`CHARACTER SET`与`COLLATE`设置库/表/列；用`lower_case_table_names`控制系统级表名大小写。 |
| **SQL Server** | **由实例排序规则决定**                    | **实例级/列级排序规则**。后缀`CI`(不敏感)/`CS`(敏感)。       | 随Windows区域设置，如`Chinese_PRC_CI_AS`。 | 实例排序规则影响全局；可在查询中用`COLLATE`子句临时覆盖。    |
| **Oracle**     | **字符值默认敏感**；表名**默认不敏感**    | **国家语言支持（NLS）参数**和`COLLATE`子句。                 | `AL32UTF8`（UTF-8）、`ZHS16GBK`            | 通过`NLS_SORT`等参数设置语言排序行为；用`COLLATE`子句修改查询行为。 |
| **PostgreSQL** | **字符值默认敏感**；标识符**默认不区分大小写**（未加引号时折叠为小写），加双引号后才区分大小写 | **运行时排序规则**与`CITEXT`扩展类型。                       | `UTF8`                                     | 标识符大小写用**双引号**保护；字符串比较可用`CITEXT`类型、`ILIKE`操作符或`lower()`函数。 |

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

### MySQL 切换大小写敏感性

大小写敏感性由**排序规则(Collation)**决定：后缀 `_ci` 不敏感、`_bin`/`_cs` 敏感。

```sql
-- 查看当前列的排序规则
SHOW FULL COLUMNS FROM users;

-- 原不敏感(_ci) → 改为敏感：将列或比较改为 _bin / _cs 排序规则
ALTER TABLE users MODIFY username VARCHAR(50) COLLATE utf8mb4_bin;
SELECT * FROM users WHERE username COLLATE utf8mb4_bin = 'admin'; -- 查不到 'Admin'

-- 原敏感(_bin/_cs) → 改为不敏感：使用 _ci 排序规则
SELECT * FROM users WHERE username COLLATE utf8mb4_general_ci = 'admin'; -- 可查到 'Admin'
```

> 表名大小写由系统变量 `lower_case_table_names` 控制（0=敏感，1=不敏感），是服务启动参数；MySQL 8.0 只能在初始化服务器时设置。

### SQL Server 切换大小写敏感性

大小写敏感性由**排序规则**决定：后缀 `CI` 不敏感、`CS` 敏感。

```sql
-- 查看当前列的排序规则
SELECT name, collation_name FROM sys.columns WHERE object_id = OBJECT_ID('users');

-- 原不敏感(CI) → 改为敏感(CS)
ALTER TABLE users ALTER COLUMN username NVARCHAR(50) COLLATE SQL_Latin1_General_CP1_CS_AS;
SELECT * FROM users WHERE username COLLATE SQL_Latin1_General_CP1_CS_AS = 'admin'; -- 查不到 'Admin'

-- 原敏感(CS) → 改为不敏感(CI)
SELECT * FROM users WHERE username COLLATE SQL_Latin1_General_CP1_CI_AS = 'admin'; -- 可查到 'Admin'
```

### PostgreSQL 切换大小写敏感性

字符值默认敏感，且没有 MySQL/SQL Server 那种全局"排序规则开关"，改为不敏感常用以下方式：

```sql
-- 原敏感 → 改为不敏感：lower() / ILIKE
SELECT * FROM users WHERE lower(username) = lower('admin'); -- 可查到 'Admin'
SELECT * FROM users WHERE username ILIKE 'admin'; -- 可查到 'Admin'

-- 类型级：改为 CITEXT 后，= 比较即不区分大小写
CREATE EXTENSION IF NOT EXISTS citext;
ALTER TABLE users ALTER COLUMN username TYPE CITEXT;

-- 或使用不区分大小写的 ICU 排序规则（需数据库以 ICU 为排序提供者，`und-u-ks-level2` 表示 level 2：不区分大小写）
SELECT * FROM users WHERE username COLLATE "und-u-ks-level2" = 'admin'; -- 可查到 'Admin'

-- 恢复敏感：用普通 = 比较即可（不采用上述方式即默认敏感）
SELECT * FROM users WHERE username = 'admin'; -- 查不到 'Admin'
```

> 标识符（表名/列名）：未加引号时统一折叠为小写；需区分大小写时用双引号，如 `"Users"`。

### Oracle 反向切换（不敏感 → 恢复敏感）

上面的例子是 敏感 → 不敏感（`NLS_COMP=LINGUISTIC` + `NLS_SORT=BINARY_CI`）。恢复默认敏感只需还原为二进制比较：

```plsql
ALTER SESSION SET NLS_COMP = BINARY;
ALTER SESSION SET NLS_SORT = BINARY;
SELECT * FROM users WHERE username = 'admin'; -- 查不到 'Admin'
```

> 注意：若只设 `NLS_SORT = BINARY_CI` 而 `NLS_COMP` 仍为 `BINARY`，等值 `=` 比较仍区分大小写（`NLS_SORT` 仅影响 `ORDER BY` 等排序），必须两者配合。

