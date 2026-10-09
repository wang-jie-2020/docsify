## scope

compile（默认值）：
这是默认的作用域。如果没有指定 scope，则依赖会被视作 compile 作用域。
在编译、运行和测试阶段都可用。

provided：
表示该依赖项在编译时需要，但在运行时由容器或运行环境提供（例如 Servlet API）。
适用于 JDK 提供的类库、服务器提供的类库等。

runtime：
该依赖项在编译时不需要，但在运行时需要（如 JDBC 驱动）。
适用于那些在编译时不要求的库，但是在运行时需要导入。

test：
该依赖项仅在测试编译和运行中使用，不会被包含在最终的可执行 JAR 或 WAR 文件中。
适用于 JUnit 和 Mockito 等测试框架。

system：
表示该依赖项是由用户提供的，并且需要提供其系统路径。使用此作用域时，必须提供 systemPath 属性，使 Maven 知道此依赖项的具体位置。
适用于不在 Maven 中央仓库中的 JAR 文件。

import（仅适用于依赖管理）：

这种作用域主要用于管理 BOM（Bill of Materials）依赖。在 dependencyManagement 段落中使用，导入其他项目的依赖定义。



### system scope

(1) 示例

```xml
<dependency>
            <groupId>com.mathworks</groupId>
            <artifactId>javabuilder</artifactId>
            <version>1.0.0</version>
            <scope>system</scope>
            <systemPath>${project.basedir}/lib/javabuilder.jar</systemPath>
        </dependency>

        <dependency>
            <groupId>com.mathworks</groupId>
            <artifactId>faliure_pre</artifactId>
            <version>1.0.0</version>
            <scope>system</scope>
            <systemPath>${project.basedir}/lib/faliure_pre.jar</systemPath>
        </dependency>
```

(2) 打包问题, 在默认情况下不会打包systemPath下的包, 如果是SpringBoot项目在plugin中配置:

```xml
 <configuration>
     <includeSystemScope>true</includeSystemScope>
</configuration>
```



