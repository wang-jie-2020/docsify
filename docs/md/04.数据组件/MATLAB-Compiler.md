Matlab Compiler 支持将算法文件编译为外部语言接口, 调用通过相应接口进行, 但最终由Matlab Runtime 运行.



在MATLAB COMPILE阶段:

(1) 主机安装语言包的[版本要求](https://ww2.mathworks.cn/support/requirements/language-interfaces.html)

(2) deploytool命令唤出窗口, m文件, 一路点击即可

(3) 注意点: 

​	1. 必要的m文件一起编译 

​	2. 打JAR包时通过图形操作的报错信息是不全的, 命令窗口中直接mcc才会有具体信息

​	3. GKB编码问题(有中文注释), 通过 JAVA_TOOL_OPTIONS = -Dfile.encoding=UTF-8 进行解决



在DOTNET、JAVA阶段:

(1) 需要MATLAB_RUNTIME支持, [安装](https://ww2.mathworks.cn/help/releases/R2024a/compiler/install-the-matlab-runtime.html)

(2) DOTNET中的必要依赖: C:\Program Files\MATLAB\MATLAB Runtime\R2024a\toolbox\dotnetbuilder\bin\win64\netstandard2.0\MWArray.dll

(3) JAVA中的必要依赖: C:\Program Files\MATLAB\R2024a\toolbox\javabuilder\jar\javabuilder.jar

(4) JAVA项目打包可以考虑放在MAVEN仓库或者SYSTEMPATH, 打包命令有些配置(参考MAVEN配置)



1. deploytool（会生成.prj文件，下次可以直接点击）
2. 选择语言类型，选择打包文件，修改类名、版本号

![image-20260310090607473](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20260310090607473.png)

3. 点击生成按钮