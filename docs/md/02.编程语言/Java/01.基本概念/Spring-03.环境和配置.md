# 环境和配置

## 配置源

1. 理解如下顺序(略过了些), @PropertySource -> 默认Config -> OS -> 命令行

2. 默认Config命名bootstrap > application, 默认Config格式properties > yml

3. 代码资源的其他配置项

   @PropertySource(value = "classpath:mail.properties")

   spring.config.import=optional:file:./dev.properties

4. Profile

   spring.profiles.active=

   spring.config.activate.on-profile=



## 装配

1. @Value("${property}"

2. Java Bean (@ConfigurationProperties)

其中@Value还能支持spEL表达式(在配置上如此感觉多余), 重要注解:

@ConfigurationProperties(prefix = "")

@Profile("dev")(spring.config.activate.on-profile=dev,spring.profiles.active=dev)



## 条件限定(Property Conditions)

@ConditionalOnProperty(prefix = "",name = "",havingValue="")

@ConditionalOnMissBean



## 注解

@ImportResource(XML的BEAN配置)

@PropertySource(指定引入properties文件,spring.config.import=optional:file:./dev.properties)

@ConfigurationProperties(prefix = "")



**@Conditional**	

指定的条件成立，才给容器中添加组件，配置配里面的所有内容才生效；

| @Conditional派生注解            | 作用（判断是否满足当前指定条件）                |
| ------------------------------- | ----------------------------------------------- |
| @ConditionalOnJava              | 系统的java版本是否符合要求                      |
| @ConditionalOnBean              | 容器中存在指定Bean                              |
| @ConditionalOnMissBean          | 容器中不存在指定Bean                            |
| @ConditionalOnExpression        | 满足spEL表达式                                  |
| @ConditionalOnClass             | 系统中有指定的类                                |
| @ConditionalOnMissClass         | 系统中没有指定的类                              |
| @ConditionalOnSingleCandidate   | 容器中只有一个指定的Bean,或者这个Bean是首选Bean |
| @ConditionalOnProperty          | 系统中指定的属性是否有指定的值                  |
| @ConditionalOnResource          | 类路径下是否存在指定的资源文件                  |
| @ConditionalOnWebApplication    | 当前是web环境                                   |
| @ConditionalOnNotWebApplication | 当前不是web环境                                 |
| @ConditionalOnJndi              | JNDI存在指定项                                  |



@Profile("dev")(spring.config.activate.on-profile=dev,spring.profiles.active=dev)

@ConditionalOnProperty(prefix = "",name = "",havingValue="")