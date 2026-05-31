## 一、工作模式

![img](https://raw.gitcode.com/qq_36179938/images/raw/main/24aee88f75a27196ed639b406d4e1d8b.png)

1. 图中的1和2都是工作队列(点对点)模式, 相当于队列的发布订阅和Exchange无关, 区别只是消费者数量(消费者竞争)
2. 图3是广播fanout模式, Exchange -> Queues, 不需要考虑RoutingKey
3. 图4是路由direct模式, Exchange -> RoutingKey -> Queues
4. 图5、图6不考虑



### 死信和延迟

两者都是上述的上述工作模式, 死信指的是在正常队列中出现消息过期、拒绝或者队列已满时将消息投递到新的队列而已, 而延迟是利用消息的过期TTL机制, 当到达TTL时间后将其投递到死信队列进行消费而已. 例如:

```csharp
// 死信交换机和队列
channel.ExchangeDeclare(exchange: "dlx_exchange", type: "direct");
channel.QueueBind(queue: "dlx_queue", exchange: "dlx_exchange", routingKey: "dlx_routing_key");

// 队列中队形绑定
var arguments = new Dictionary<string, object>
{
     { "x-dead-letter-exchange", "dlx_exchange" },
     { "x-dead-letter-routing-key", "dlx_routing_key" },
     { "x-message-ttl", 5000 } // 消息5秒后过期
};
channel.QueueDeclare(
    queue: normalQueue,
    durable: true,
    exclusive: false,
    autoDelete: false,
    arguments: arguments
);
```



## 二、消息确认

消息丢失大概分为三种情况：

1. **生产者问题**。因为应用程序故障，网络抖动等各种原因，生产者没有成功向 Broker 发送消息。

2. **消息中间件自身问题**。生产者成功发送给了 Broker，但是 Broker 没有把消息保存好，导致消息丢失。

3. **消费者问题**。Broker 发送消息到消费者，消费者在消费消息时，因为没有处理好，导致 Broker 将消费失败的消息从队列中删除了。

   

### 1.**投递确认**

basicPublish() 只是把消息写入到 **TCP** **缓冲区**，并不代表消息真的到达了 RabbitMQ 或被持久化。  

在 **Publisher Confirms 模式**(channel.ConfirmSelect())下，只有 `waitForConfirms()` 或 `waitForConfirmsOrDie()` 收到确认后，消息才算真正安全投递成功。



**事务机制：**我们在channel对象中可以看到 txSelect(),txCommit(),txrollback() 这些方法，分别对应着开启事务，提交事务，回滚。由于使用事务会造成生产者与Broker交互次数增加，造成性能资源的浪费，而且**事务机制是阻塞的**，在发送一条消息后需要等待RabbitMq回应，之后才能发送下一条，因此事务机制不提倡，大家在网上也很少看到RabbitMQ使用事务进行消息确认的。

>此处引申一下: **RabbitMQ的事务是“发送确认”，确保单条消息可靠到达Broker；**它的实现非常简单，是基于**单条Channel（连接通道）** 的。当你在一个Channel上开启事务后，发送的所有消息都会暂存，直到你提交事务。它不涉及跨节点协调，其巨大的性能损耗主要来自于将异步的发送过程强制变为同步的磁盘fsync操作 。只保证 “生产者发消息 → broker 落盘” 这一步原子性。官方都不推荐使用。

**单条确认/批量确认：**批量其实是一个节约资源的操作，但是在RabbitMq中我们使用批量操作会造成消息重复消费，原因是批量操作是使客户端程序定期或者消息达到一定量，来调用方法等待Broker返回，这样其实是一个提高效率的做法，但是如果出现消息重发的情况，当前这批次的消息都需要重发，这就**造成了重复消费**，因此批量确认的操作性能没有提高反而下降。

**异步确认：**异步确认虽然编程逻辑比上两个要复杂，但是性价比最高，无论是可靠性还是效率都没得说，他是利用回调函数来达到消息可靠性传递的。

| 方法                   | 是否阻塞 | 粒度   | 性能 | 异常处理          | 场景           |
| :--------------------- | :------- | :----- | :--- | :---------------- | :------------- |
| basicPublish()         | 否       | 不确认 | 高   | 无法检测失败      | 不关心可靠性时 |
| waitForConfirms()      | 是       | 单条   | 低   | 返回 false 或超时 | 高安全但低吞吐 |
| waitForConfirmsOrDie() | 是       | 批量   | 中   | 抛异常            | 批量发送       |
| addConfirmListener()   | 否       | 异步   | 高   | 回调处理          | 高吞吐系统     |

```csharp
channel.BasicAcks += (sender,e) = {}
channel.BasicNacks += (sender,e) = {}
```



### 2.消费确认

默认的autoAck = true自动确认, 改为手动确认即可

 basicAck 方法需要传递两个参数

- **deliveryTag（唯一标识 ID）**：当一个消费者向 RabbitMQ 注册后，会建立起一个 Channel ，RabbitMQ 会用 basic.deliver 方法向消费者推送消息，这个方法携带了一个 delivery tag， **它代表了 RabbitMQ 向该 Channel 投递的这条消息的唯一标识 ID**，是一个单调递增的正整数，delivery tag 的范围仅限于 Channel
- **multiple**：为了减少网络流量，手动确认可以被批处理，**当该参数为 true 时，则可以一次性确认 delivery_tag 小于等于传入值的所有消息**

basicNack方法需要传递三个参数

- **deliveryTag（唯一标识 ID）：**上面已经解释了。
- **multiple**：上面已经解释了。
- **requeue**： true ：重回队列，false ：丢弃，我们在nack方法中必须设置 false，否则重发没有意义。

basicReject方法需要传递两个参数

- **deliveryTag（唯一标识 ID）：**上面已经解释了。
- **requeue**：上面已经解释了，在reject方法里必须设置true。



## 三、集群

RabbitMQ的集群是这样的:

1. 在集群中, 元数据（交换机、绑定、用户、vhost）全局一致, 队列本身默认不跨节点复制
2. 无论连接的集群的任何节点, 都不会影响消息发布和消费
3. 有镜像队列（Mirror Queue）、仲裁队列（Quorum Queue）的拓展

通常, 消息积压的问题是由于单点消费者性能引起的, 在这种情况下集群并不能解决问题(反而会加重问题).











