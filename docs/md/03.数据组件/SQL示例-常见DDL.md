## MYSQL

```sql
UPDATE A
JOIN B ON A.id = B.a_id
SET A.column = B.value;
```



## SQLSERVER

```sql
UPDATE e
SET e.dept_name = d.dept_name
FROM employees e                 
JOIN departments d ON e.dept_id = d.dept_id;
```



## ORACLE

Oracle **不支持** `UPDATE ... FROM ... JOIN` 语法，需要通过**子查询**或**`MERGE`**语句实现。

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
`MERGE`语句特别适合复杂的同步逻辑。

```sql
MERGE INTO employees e
USING departments d
ON (e.dept_id = d.dept_id)
WHEN MATCHED THEN
    UPDATE SET e.dept_name = d.dept_name;
```



## POSTGRESQL

```sql
UPDATE table_a 
SET column1 = table_b.column1,
    column2 = table_b.column2
FROM table_b
WHERE table_a.id = table_b.id;



UPDATE table_a
SET 
    column1 = table_b.value,
    column2 = table_c.other_value
FROM table_b
INNER JOIN table_c 
    ON table_b.c_id = table_c.id
WHERE table_a.b_id = table_b.id;
```

