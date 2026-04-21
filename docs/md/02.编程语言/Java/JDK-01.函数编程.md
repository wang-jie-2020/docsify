## 函数式编程: 

只包含一个抽象方法的接口，称为**函数式接口**(@FunctionalInterface)。目的是传递函数，包装略显繁琐或者说概念略显抽象，比如js的function传递、python的def传递是直接的，C#的Action、Function是简洁的。问题不大，注意下语法不同即可。

简化函数传递(当然可以进行实现重写), 故通常都会以Lambda或者方法引用的形式出现。



示例常见接口:

| 内置核心函数式接口 | **方法**            | **用途**    |
| ------------------ | ------------------- | ----------- |
| Function<T,R>      | R apply(T t)        | 传入T返回R  |
| Consumer<T>        | void accept(T t)    | 消费T无返回 |
| Supplier<T>        | T get()             | 提供T型对象 |
| Predicate<T>       | Boolean test(T t)   | 断言判断    |
| UnaryOperator<T>   | T apply(T t)        | 一元运算    |
| BinaryOperator<T>  | T apply(T t1, T t2) | 二元运算    |

以上存在重载（参数个数、强类型）如BiConsumer、BiFunction，也有些如Comparator等接口。



### Lambda

() -> { } 



### 方法引用

| 引用方式     |                              |
| ------------ | ---------------------------- |
| 构造方法     | ClassName:: staticMethodName |
| 静态方法     | ClassName :: new             |
| 任意实例方法 | ClassName :: methodName      |
| 指定实例方法 | instance :: methodName       |

```java
// 静态方法
Function<String, Integer> func = Integer::parseInt;

// 实例方法
Consumer<String> printer = System.out::println;

// 任意对象方法
Function<String, String> upper = String::toUpperCase;

// 构造方法
Supplier<List<String>> listSupplier = ArrayList::new;
```
