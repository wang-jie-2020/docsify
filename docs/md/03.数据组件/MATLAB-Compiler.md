背景需求: MATLAB编译程序集、JAR包, 在其他地方使用



在MATLAB COMPILE阶段:

(1) 通过DEPLOYTOOL命令唤出窗口, 选择算法m文件, 一路点击即可

(2) 打JAR包时, 通过图形操作的报错信息是不全的, 命令窗口中直接mcc才会有具体信息.

​	GKB编码问题(有中文注释), 通过 JAVA_TOOL_OPTIONS = -Dfile.encoding=UTF-8 进行解决



在DOTNET、JAVA阶段:

(1) 需要MATLAB_RUNTIME支持

(2) DOTNET中的必要依赖: C:\Program Files\MATLAB\MATLAB Runtime\R2024a\toolbox\dotnetbuilder\bin\win64\netstandard2.0\MWArray.dll

(3) JAVA中的必要依赖: C:\Program Files\MATLAB\R2024a\toolbox\javabuilder\jar\javabuilder.jar

(4) JAVA项目打包可以考虑放在MAVEN仓库或者SYSTEMPATH, 打包命令有些配置(参考MAVEN配置)