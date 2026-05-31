## 连接字符串

### csharp

- MYSQL

  ```bash
  server=127.0.0.1;userid=root;password=123456;database=xxxx;Allow User Variables=true;SslMode=none;allowPublicKeyRetrieval=true;pooling=true;
  ```

- SQLSERVER

  ```bash
  Data Source=127.0.0.1;Initial Catalog=xxx;Persist Security Info=True;User ID=sa;Password=123456;Connect Timeout=500;MultipleActiveResultSets=true;
  ```

- ORACLE

  ```bash
  Data Source=127.0.0.1:1521/galileo;User ID=xxx;Password=xxx
  ```

- POSTGRESQL

  ```bash
  "PostgreSQL": "Host=10.201.17.14;Port=15400;Database=ess;Username=root;Password=123456;"
  ```

  

### java

- MYSQL

  ```bash
  jdbc:mysql://127.0.0.1:3306/xxx?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
  ```

- POSTGRESQL

  ```bash
  jdbc:postgresql://10.201.17.14:15400/ess?useUnicode=true&characterEncoding=utf8&serverTimezone=GMT%2B8
  ```

  