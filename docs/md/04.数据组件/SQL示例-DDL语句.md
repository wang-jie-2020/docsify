## 不同DB间的UPDATE语句

- MYSQL

  ```sql
  UPDATE A JOIN B ON A.id = B.a_id SET A.column = B.column;
  ```

- SQLSERVER

  ```sql
  UPDATE a SET a.column = b.column FROM a JOIN b ON a.id = b.a_id;
  ```

- POSTGRESQL

  ```sql
  UPDATE a SET a.column = b.column FROM b WHERE a.id = b.id;
  
  UPDATE a SET a.column = c.column FROM b INNER JOIN c ON b.c_id = c.id WHERE a.b_id = b.id;
  ```

- ORACLE

  **不支持** `UPDATE ... FROM ... JOIN` 语法，需要通过**子查询**或**`MERGE`**语句实现。

  **方法一：使用关联子查询（最通用）**

  ```sql
  UPDATE employees e
  SET e.dept_name = (
      SELECT d.dept_name
      FROM departments d
      WHERE d.dept_id = e.dept_id -- 关联条件写在子查询内
  )
  WHERE EXISTS (                 -- 此WHERE确保只更新有匹配项的行
      SELECT 1
      FROM departments d
      WHERE d.dept_id = e.dept_id
  );
  ```

  **方法二：使用`MERGE`语句（功能强大）**
  `MERGE`语句特别适合复杂的同步逻辑

  ```sql
  MERGE INTO employees e
  USING departments d
  ON (e.dept_id = d.dept_id)
  WHEN MATCHED THEN
      UPDATE SET e.dept_name = d.dept_name;
  ```



## ORACLE窗口函数示例

```sql
WITH SRC AS (
	SELECT  * FROM SPM_WORKFLOW sw WHERE 
	1 = 1
--	AND CREATETIME > TO_DATE('2024-05-01 00:00:00', 'yyyy-mm-dd hh24:mi:ss') 
--	AND CREATETIME < TO_DATE('2024-11-01 00:00:00', 'yyyy-mm-dd hh24:mi:ss')
	ORDER BY APPLYID ,CREATETIME 
),
VM AS (
	SELECT 
	APPLYID,
	CREATETIME,
	REMARK,
	APPLYFLOWSTATUS,
    LEAD(SRC.CREATETIME, 1, null) OVER(PARTITION BY SRC.APPLYID ORDER BY SRC.CREATETIME) AS NEXT_CREATETIME,
    LEAD(SRC.CREATETIME, 1, SYSDATE) OVER(PARTITION BY SRC.APPLYID ORDER BY SRC.CREATETIME) AS NEXTORNOW,
	LEAD(SRC.APPLYFLOWSTATUS, 1, NULL) OVER(PARTITION BY SRC.APPLYID ORDER BY SRC.CREATETIME) AS NEXT_APPLYFLOWSTATUS
	FROM SRC
),
FILTER AS (
	SELECT 
		VM.*,
		(VM.NEXTORNOW - VM.CREATETIME) AS ElapsedTime
	FROM VM
	WHERE VM.APPLYFLOWSTATUS = 5 AND (VM.NEXT_APPLYFLOWSTATUS = 6 OR VM.NEXT_APPLYFLOWSTATUS = 9 OR VM.NEXT_APPLYFLOWSTATUS IS NULL )
)

-- SELECT * FROM FILTER

SELECT 
	APPLYID,
	MIN(CREATETIME) AS StartTime,
	(SELECT MAX(NEXT_CREATETIME) FROM FILTER c WHERE c.APPLYID = FILTER.APPLYID AND c.NEXT_APPLYFLOWSTATUS = 9) AS EndTime,
	SUM(ElapsedTime) AS SumedElapsedTime
FROM FILTER 
WHERE APPLYID IN ( '0005E725E3C446578BC89CBDF239A801','001B08834EA3462FA47FCCC32F22F26D')
GROUP BY APPLYID

SELECT 
    APPLYID,
    MIN(CREATETIME) AS StartTime,
    -- 使用条件聚合来获取EndTime
    MAX(CASE WHEN NEXT_APPLYFLOWSTATUS = 9 THEN NEXT_CREATETIME ELSE NULL END) AS EndTime,
    -- 使用条件聚合来设置istrue
    MAX(CASE WHEN NEXT_APPLYFLOWSTATUS = 9 THEN 1 ELSE 0 END) AS istrue,
    SUM(ElapsedTime) AS SummedElapsedTime
FROM FILTER
WHERE APPLYID IN ( '0005E725E3C446578BC89CBDF239A801','001B08834EA3462FA47FCCC32F22F26D')
GROUP BY APPLYID;
```



## 时间聚合

豆包整理了下:

| 数据库     | 按日统计（截断时分秒）                               | 按月统计（截断到月份）                                       | 空值填充函数 | 补全维度表核心函数            |
| ---------- | ---------------------------------------------------- | ------------------------------------------------------------ | ------------ | ----------------------------- |
| Oracle     | `TRUNC(create_time)`                                 | `TRUNC(create_time, 'MM')`                                   | `NVL()`      | 层级查询（CONNECT BY）        |
| MySQL      | `DATE(create_time)`                                  | `DATE_FORMAT(create_time, '%Y-%m')`                          | `IFNULL()`   | 自定义联合查询（UNION ALL）   |
| SQL Server | `CAST(create_time AS DATE)`                          | `FORMAT(create_time, 'yyyy-MM')`/`CONVERT()`                 | `ISNULL()`   | 递归 CTE（WITH + UNION ALL）  |
| PostgreSQL | `create_time::date`/`DATE_TRUNC('day', create_time)` | `DATE_TRUNC('month', create_time)`/`TO_CHAR(create_time, 'yyyy-mm')` | `COALESCE()` | `generate_series()`（最简洁） |



某些场景考虑字符串格式化也可以, 

PostgreSQL、ORACLE: TO_CHAR(create_time, 'yyyy-mm')

