## C# NPGSQL驱动问题

(1) 在ORACLE迁移OPENGAUSS时，NVARCHAR2的类型无法迁移(不存在此类型)

https://stackoverflow.com/questions/24014147/how-to-convert-string-to-unicode-using-postgresql/24015093#24015093

在JAVA中，通过JDBC正常可以通过查询语句得到ResultSet，而在Net中，报错‘System.Object’‘nvarchar2’....



(2) NPGSQL 9.0版本, 间隔连接数据库时第一次失败, 第二次成功(造成大量定时任务失败)

问题表现有些类似于: https://github.com/npgsql/npgsql/issues/6274

解决方式:(1) 还原到5版本(issue中说从6有问题) (2) 仍旧使用9,但是在连接字符串中增加'SSL Mode=Disable'