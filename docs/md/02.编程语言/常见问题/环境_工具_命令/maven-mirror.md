## 本地指向内部Nexus,同时排除某些仓库

```xml
<mirror>  
    <id>nexus</id>  
    <mirrorOf>*,!cordys-public</mirrorOf>
    <name>maven-public</name>  
    <url>http://10.206.121.19:8082/repository/maven-public/</url>  
</mirror>
```

