## 泛型

### 1.语法通配符

<?> 无限制通配符 
<? extends E> extends 关键字声明了类型的上界，表示参数化的类型可能是所指定的类型，或者是此类型的子类
<? super E> super 关键字声明了类型的下界，表示参数化的类型可能是指定的类型，或者是此类型的父类

```java
private static <E extends Comparable<? super E>> E max(List<? extends E> e1) {
    if (e1 == null) {
        return null;
    }
    //迭代器返回的元素属于 E 的某个子类型
    Iterator<? extends E> iterator = e1.iterator();
    E result = iterator.next();
    while (iterator.hasNext()) {
        E next = iterator.next();
        if (next.compareTo(result) > 0) {
            result = next;
        }
    }

    return result;
}
```

```java
public static void upLower() {

    ArrayList<Integer> list1 = new ArrayList<>();
    ArrayList<Number> list2 = new ArrayList<>();

    ArrayList<? super Number> list3 = new ArrayList<>(); // WRITE
    ArrayList<? extends Number> list4 = new ArrayList<>(); // READ

    list1.add(1);
    Integer a = list1.get(0);

    list2.add(1);
    Number b = list2.get(0);

    list3.add(1);
    Number c = list3.get(0);    // error

    list4.add(1);               // error
    Number d = list4.get(0);
}
```

>和面向对象的extends、super不同，读（消费）extends，写（生产）super

### 2.泛型的擦除(Type Erasure)

![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-basic-generic-1.png)



![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-basic-generic-2.png)



![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/java-basic-generic-3.png)

### 3.泛型的桥接方法

如果在泛型擦除的过程中存在类型的不一致，比如泛型<T>擦除到Object，但泛型类的实际类型被指定Date；

形参不会从Object变为Date，而是重载方法签名；所以看似重写，底层却是重载（jvm）；

### 4.参数类型

```java
ArrayList<String> genericType = new ArrayList<String>() {};
Type superclass = genericType.getClass().getGenericSuperclass();
Type type = ((ParameterizedType) superclass).getActualTypeArguments()[0];
System.out.println(type);//class java.lang.String
```



>1. 泛型的概念一致
>2. 都有逆变、协变的特性
>3. 都有泛型擦除,但擦除行为逻辑明显不一致



