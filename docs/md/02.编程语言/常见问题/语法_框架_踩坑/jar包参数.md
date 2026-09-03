## Java Jar包参数

```bash
@echo off
echo.
echo [信息] 使用Jar命令运行Gateway工程。
echo.

cd %~dp0
cd ../ruoyi-gateway/target

set JAVA_OPTS=-Xms512m -Xmx1024m -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=512m

java -Dfile.encoding=utf-8 %JAVA_OPTS% -jar ruoyi-gateway.jar

cd bin
pause
```

-Xms分配堆最小内存，默认为物理内存的1/64；-Xmx分配最大内存，默认为物理内存的1/4。
非堆内存分配用-XX:PermSize和-XX:MaxPermSize

-XX:PermSize分配非堆最小内存，默认为物理内存的1/64；-XX:MaxPermSize分配最大内存，默认为物理内存的1/4。



实际运行参数:

```bash
  -XX:+UseContainerSupport -XX:InitialRAMPercentage=60.0
  -XX:MaxRAMPercentage=60.0 -XX:MetaspaceSize=256M
  -XX:MaxMetaspaceSize=256M -XX:NewRatio=1 -XX:SurvivorRatio=4
  -XX:NativeMemoryTracking=summary -XX:+PrintGCDetails
  -XX:+PrintGCDateStamps -XX:+PrintGCCause -XX:+UseGCLogFileRotation 
  -XX:+PrintHeapAtGC -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=20M 
  -Xloggc:/app/logs/gc-%t.log -XX:+HeapDumpOnOutOfMemoryError 
  -XX:HeapDumpPath=/app/logs/
```



```bash
# 1. 查找目标Java进程PID
jps -l

# 2. 使用jmap导出
jmap -dump:live,format=b,file=heap.hprof <PID>

# 3. 压缩文件（可选）
gzip heap.hprof


## jcmd <PID> GC.heap_dump <文件路径>
## curl -X POST http://localhost:8080/actuator/heapdump -o heapdump.hprof
```

