

枚举隐式继承自抽象类Enum，也就是说每个枚举是一个类，每个枚举项是该类的一个实例

```java
enum Day {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;

    private Day() {
        System.out.println("默认调用无参构造");	// 打印七次
    }
}
```



Enum中的name是标识符，ordinal指的是排序号而不是常量标志

```java
public abstract class Enum<E extends Enum<E>>
        implements Constable, Comparable<E>, Serializable {
    
    private final String name;
    public final String name() {
        return name;
    }
    
    private final int ordinal;
    public final int ordinal() {
        return ordinal;
    }
    
    protected Enum(String name, int ordinal) {
        this.name = name;
        this.ordinal = ordinal;
    }
}
```





