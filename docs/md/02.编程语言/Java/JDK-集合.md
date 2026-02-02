## JCF(Java Collections Framework)

| 接口名     | Java8新加入的方法                                            |
| ---------- | ------------------------------------------------------------ |
| Collection | removeIf() spliterator() stream() parallelStream() forEach() |
| List       | replaceAll() sort()                                          |
| Map        | getOrDefault() forEach() replaceAll() putIfAbsent() remove() replace() computeIfAbsent() computeIfPresent() compute() merge() |



### Stream

![Java_stream_Interfaces](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/939998-20170313215540823-221594903.png)

- **无存储**。*stream*不是一种数据结构，它只是某种数据源的一个视图，数据源可以是一个数组，Java容器或I/O channel等。
- **为函数式编程而生**。对*stream*的任何修改都不会修改背后的数据源，比如对*stream*执行过滤操作并不会删除被过滤的元素，而是会产生一个不包含被过滤元素的新*stream*。
- **惰式执行**。*stream*上的操作并不会立即执行，只有等到用户真正需要结果的时候才会执行。
- **可消费性**。*stream*只能被“消费”一次，一旦遍历过就会失效，就像容器的迭代器那样，想要再次遍历必须重新生成。

对*stream*的操作分为为两类，**中间操作(\*intermediate operations\*)和结束操作(\*terminal operations\*)**，二者特点是：

1. **中间操作总是会惰式执行**，调用中间操作只会生成一个标记了该操作的新*stream*，仅此而已。
2. **结束操作会触发实际计算**，计算发生时会把所有中间操作积攒的操作以*pipeline*的方式执行，这样可以减少迭代次数。计算完成之后*stream*就会失效。

| 操作类型 | 接口方法                                                     |
| -------- | ------------------------------------------------------------ |
| 中间操作 | concat() distinct() filter() flatMap() limit() map() peek() skip() sorted() parallel() sequential() unordered() |
| 结束操作 | allMatch() anyMatch() collect() count() findAny() findFirst() forEach() forEachOrdered() max() min() noneMatch() reduce() toArray() |



*filter* 函数原型为`Stream filter(Predicate predicate)`，作用是返回一个只包含满足`predicate`条件元素的`Stream`。

*map* 函数原型为` Stream map(Function mapper)`，作用是返回一个对当前所有元素执行执行`mapper`之后的结果组成的`Stream`。直观的说，就是对每个元素按照某种操作进行转换，转换前后`Stream`中元素的个数不会改变，但元素的类型取决于转换之后的类型。



*reduce*操作可以实现从一组元素中生成一个值，`sum()`、`max()`、`min()`、`count()`等都是*reduce*操作，将他们单独设为函数只是因为常用。`reduce()`的方法定义有三种重写形式：

- `Optional reduce(BinaryOperator accumulator)`
- `T reduce(T identity, BinaryOperator accumulator)`
- ` U reduce(U identity, BiFunction accumulator, BinaryOperator combiner)`



*collect*

`<R> R collect(Supplier<R> supplier, BiConsumer<R,? super T> accumulator, BiConsumer<R,R> combiner)`

`<R,A> R collect(Collector<? super T,A,R> collector)`

1. 目标容器是什么？是*ArrayList*还是*HashSet*，或者是个*TreeMap*。
2. 新元素如何添加到容器中？是`List.add()`还是`Map.put()`。

 如果并行的进行规约，还需要告诉*collect()* 3. 多个部分结果如何合并成一个。



![img](https://cdn.jsdelivr.net/gh/wang-jie-2020/images/939998-20170314192733276-1662918719.png)



```java
List<String> list2 = list.stream().map(String::toUpperCase)
    .collect(ArrayList::new, ArrayList::add, ArrayList::addAll); // (1)

List<String> list3 = list.stream().map(String::toUpperCase)
    .collect(Collectors.toList());    // (2)

ArrayList<String> arrayList = list.stream().map(String::toUpperCase)
    .collect(Collectors.toCollection(ArrayList::new));// (3)

HashSet<String> hashSet = list.stream().map(String::toUpperCase)
    .collect(Collectors.toCollection(HashSet::new));

Map<String, Integer> map = list.stream().map(String::toUpperCase)
    .collect(Collectors.toMap(Function.identity(), String::length));

```

```java
// 按gender分组
Map<String, List<User>> groupedByGender = users.stream()
    .collect(Collectors.groupingBy(User::getGender));

// 按gender分组，并取平均年龄
Map<String, Double> averageAgeByAgeGroup = users.stream()
    .collect(Collectors.groupingBy(User::getGender, Collectors.averagingInt(User::getAge)));

// 按gender分组，再按年龄分组
Map<String, Map<Integer, List<User>>> groupedByGenderAndAge = users.stream()
    .collect(Collectors.groupingBy(User::getGender, Collectors.groupingBy(User::getAge)));
```

