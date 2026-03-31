## 一、部署

1. 旧版中推荐额外部署ZooKeeper保持一致性， 现在的版本推荐KRaft

2. 旧版中可能缺少ApiVersion协商

3. 有SSL、PLAINTEXT两种配置文本，PLAINTEST代表不进行加密，实际含义不想深究

4. Listener的配置有内部、外部的差别，目前的理解是默认集群内互相通过9092端口，可以配置外部监听端口供服务调用

   1. LISTENERS
   2. ADVERTISED_LISTENERS

   

## 二、工作模式

### 2.1 Broker、Partition

当KAFKA集群建立时, Broker数量、Partition数量实际上是已经固定的. 唯一可能的考点大概是怎么调整每个Broker下的Partition数量, 有配置项默认是1, 这个配置项也会影响Topic的Partiton数量.

### 2.2 Topic和消息写入

​	当创建一个Topic时，如果没有通过 `--partitions` 参数明确指定分区数量，就会使用`num.partitions` 配置值作为默认值。

​	![image-20230105205811432](https://raw.gitcode.com/qq_36179938/images/raw/main/1315495-20230127175944619-1682168655.png)

​	**有 Key 的消息**：对 Key 做哈希，确保相同 Key 的消息进入同一分区，以保证消息的顺序。默认分区器：`DefaultPartitioner`

​	**无 Key 的消息**：采用**轮询（Round-Robin）** 策略，将消息依次、均匀地分配到所有分区上。

​	![image-20230109192754084](https://raw.gitcode.com/qq_36179938/images/raw/main/1315495-20230127175946591-1396890648.png)



### 2.3 消费和位移

通常我们会使用**消费者组**（`subscribe`）让 Kafka 自动分配分区，实现负载均衡和故障转移。

**同一消费者组内**，每个分区最多只能被一个消费者消费。**消费者数量不能超过订阅主题的分区总数**，否则多余的消费者将处于空闲状态，无法分配到分区。消费者数量少于分区数时，部分消费者会消费多个分区，实现并行处理。提供多种分区分配策略（如 Range、RoundRobin、Sticky），决定消费者如何分配分区。分配后，当消费者增减时，会触发 **Rebalance**，重新分配分区，期间消费会短暂暂停。



至于位移offset，概念是分区内消息的唯一递增序号，标记消费位置。通常只会考虑（1）消费时的自动提交、手动提交（自动+1）（2）重置策略latest、earliest、none （3）手动定位的情况似乎有点少



## 三、消息确认

### 消费发送的异步模型

发送消息时默认是**异步**的, 消息被放入内存缓冲区, 由I/O线程实际发送真正的确认来自Broker的响应。

>`flush()` 是 Kafka 生产者（`KafkaProducer`）的核心方法，**作用是强制将生产者客户端缓冲区（Buffer）中所有待发送的消息，立即发送到 Kafka 服务端，并阻塞等待这批消息发送完成**。目的是为了**提高吞吐量**，不会发一条消息就立刻传输一次，而是：
>
>1. 把消息先攒在**本地内存缓冲区**；
>
>2. 满足以下任一条件时，才自动批量发送：
>
>   - 缓冲区攒够 `batch.size`（默认 16KB）；
>   - 达到 `linger.ms` 等待时间（默认 0ms）；
>   - 缓冲区满了 / 调用了 `flush()`。

对上述的理解是produce()只是向内存缓冲区标记待发送消息，会有专门的执行线程进行发送。



### 投递确认

发送确认机制主要通过 **`acks` 配置 **和 **回调函数** 来实现，`acks` 参数决定了生产者在收到多少副本确认后才认为消息发送成功。它直接影响可靠性和延迟。

| acks 值           | 含义                                                         | 可靠性                      | 典型场景                                   |
| :---------------- | :----------------------------------------------------------- | :-------------------------- | :----------------------------------------- |
| **0**             | 生产者不等待任何确认，消息发送出去即认为成功。               | 最低（可能丢失）            | 对数据丢失不敏感的日志收集，追求极致吞吐。 |
| **1**             | 等待 Leader 副本确认写入成功，不等待 Follower 同步。         | 中等（Leader 宕机可能丢失） | 默认配置，兼顾吞吐和一定可靠性。           |
| **all** 或 **-1** | 等待 Leader 副本确认，并且所有 ISR（同步副本集）中的副本都已同步写入。 | 最高（不丢失）              | 金融交易、订单等严格不丢数据场景。         |



同步确认即阻塞线程，阻塞Future 或者 await Task。批量同步？也许指的是类似Task.WhenAll（）?

异步确认即通过回调, 

```java
producer.send(record, (metadata, exception) -> {

});
```

```csharp
void Produce(TopicPartition topicPartition, Message<TKey, TValue> message, Action<DeliveryReport<TKey, TValue>> deliveryHandler = null);
```



### 3.2 消费确认

消费确认的核心是**提交消费偏移量（Offset）**，通过两种模式实现：**自动提交**与**手动提交**

```java
while (true) {
    ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
    for (ConsumerRecord<String, String> record : records) {
        // 1. 执行业务逻辑（DB/调用）
        process(record);
    }
    // 2. 批量处理完，同步提交
    consumer.commitSync();
}
```

```java
consumer.commitAsync((offsets, exception) -> {
    if (exception != null) {
        log.error("提交失败: {}", offsets, exception);
        // 可降级：重试/告警/持久化待提交
    }
});
```



## 四、事务

**1.分布式环境下多个消息操作的原子性 **

​	跨主题、夸分区的作为一个原子单元提交，这里涉及协调器，执行类似“两阶段提交”的协议

**2.流处理中的精确一次语义（Exactly-Once）**

​	这是我不太理解的一个点，大致过程是这样的：

​		正常以事务模式发送消息1

​		消费者执行消息1的消费逻辑，将消息1的位移、消息逻辑执行结果消息作为消息2再次以事务模式发送

​	类比数据库事务就很简单了，初始状态0表示一个待执行任务，在任务执行的事务中包裹对状态=1的操作...不就这个意思么...



## 五、其他细节

### 指定分区

常见用途：

- 将具有相同业务逻辑的消息路由到同一分区，保证顺序性。
- 基于业务字段（如用户ID）进行显式分区，以便后续按分区消费。

指定分区的操作分为两个主要场景：**生产者发送消息时指定分区**，以及**消费者手动分配分区**。

生产者发送消息时，可以通过 `ProducerRecord` 的构造函数直接指定目标分区。

```java
// 方式一：指定分区号
ProducerRecord<String, String> record = new ProducerRecord<>(
    "topic-name",     // 主题名
    2,                // 分区号（此处指定分区2）
    "key",            // 消息键（可选）
    "value"           // 消息值
);
producer.send(record);
```

消费者手动指定要消费的分区。

```java
TopicPartition partition0 = new TopicPartition("topic-name", 0);
TopicPartition partition1 = new TopicPartition("topic-name", 1);
consumer.assign(Arrays.asList(partition0, partition1));

// 从指定偏移量开始消费
consumer.seek(partition0, 100);  // 从分区0的偏移量100开始
consumer.seekToBeginning(partition1); // 从分区1的起始开始
```

一旦使用 `assign()` 手动分配分区，该消费者就不再属于任何消费者组，`subscribe()` 方式会自动失效，且不会触发组再均衡。位移提交需要手动管理（或通过事务）