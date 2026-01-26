# 线程上下文

>尝试阅读线程存储时遇到的记录，线程上下文：SynchronizationContext、ExectionContext
>
>SynchronizationContext UI线程，浅析即可，比较少场景需要考虑

## SynchronizationContext（SC）

[SynchronizationContext](https://www.cnblogs.com/BigBrotherStone/p/12237433.html)

[Understanding SynchronizationContext](https://www.codeproject.com/Articles/31971/Understanding-SynchronizationContext-Part-I)

有这样描述它的：“在不同线程中进行通讯的一个类”，这种定义很单薄。

一个很显然的证据是它的派生都是关于UI或者控件的，博客上的例子大都是winform，在web项目或者控制台项目或者Task.Run下，通过SynchronizationContext.Current拿到的都是空对象。

这也就意味着，它主要解决的问题是UI线程非阻塞，允许将耗时任务交由线程池执行，但只允许UI线程更新UI，具体做法是向UI线程注册委托事件。

>SynchronizationContext只是一个抽象，它表示你想要在其中做一些工作的特定环境。
>
>对于在 ThreadPool 线程上运行代码，并且需要将工作封送回 UI 以便此工作可以与 UI 控件混在一起的情况，Windows 窗体提供了 Control.BeginInvoke 方法。
>
>WPF 具有与 Windows 窗体相同的 UI 线程约束，但它具有不同的机制来封送回 UI 线程：不是在与正确线程关联的控件上使用 Control.BeginInvoke，而是在与正确线程关联的调度程序实例上使用 Dispatcher.BeginInvoke（或 InvokeAsync）。
>
>Windows Forms 提供 WindowsFormSynchronizationContext 类型，该类型覆盖 Post 以调用 Control.BeginInvoke。WPF 提供 DispatcherSynchronizationContext 类型，该类型重写 Post 以调用 Dispatcher.BeginInvoke。等等。
>
>
>
>async 和 await 关键字背后的框架支持会自动与 ExecutionContext 和 SynchronizationContext 交互。
>
>每当代码等待一个等待者说它尚未完成（即等待者的 IsCompleted 返回 false）时，该方法需要挂起，并且它将通过等待者的延续来恢复。这是我之前提到的异步点之一，因此，ExecutionContext 需要从发出 await 的代码流向继续委托的执行。这是由框架自动处理的。当异步方法即将挂起时，基础结构会捕获执行上下文。传递给等待者的委托具有对此 ExecutionContext 实例的引用，并将在恢复该方法时使用它。这就是使 ExecutionContext 表示的重要“环境”信息能够跨等待流的原因。
>
>该框架还支持SynchronizationContext。上述对 ExecutionContext 的支持内置于表示异步方法的“构建器”中（例如 System.Runtime.CompilerServices.AsyncTaskMethodBuilder），这些构建器确保 ExecutionContext 流经等待点，无论使用哪种等待点。相比之下，对 SynchronizationContext 的支持内置于对等待任务和任务<TResult>的支持中。自定义等待者可以自己添加类似的逻辑，但它们不会自动获取;这是设计使然，因为能够自定义何时以及如何调用延续是自定义等待者有用的部分原因。
>
>当您等待任务时，默认情况下，等待程序将捕获当前的同步上下文，如果有，当任务完成时，它会将提供的继续委托发布回该上下文，而不是在任务完成的任何线程上运行委托，而不是计划它在线程池上运行。如果开发人员不需要这种封送处理行为，可以通过更改使用的可等待/等待来控制它。虽然在等待任务或任务<TResult>时始终使用此行为，但您可以改为等待调用任务的结果。ConfigureAwait（...）.ConfigureAwait 方法返回一个 awaitable，该对象允许禁止此默认封送处理行为。是否抑制由传递给 ConfigureAwait 方法的布尔值控制。如果 continueOnCapturedContext 为 true，则您将获得默认行为;如果为 false，则等待者不会检查同步上下文，假装没有同步上下文。（请注意，当等待的任务完成时，无论 ConfigureAwait 如何，运行时都可能会检查恢复线程上的当前上下文，以确定是否可以在那里同步运行延续，或者是否必须从该点异步计划延续。
>
>请注意，虽然 ConfigureAwait 为更改与 SynchronizationContext 相关的行为提供了显式的、与等待相关的编程模型支持，但没有与等待相关的编程模型支持来抑制 ExecutionContext 流。这是故意的。ExecutionContext不是编写异步代码的开发人员应该担心的事情;它是基础设施级别的支持，有助于在异步世界中模拟同步语义（即 TLS）。大多数人可以而且应该完全忽略它的存在（并且应该避免使用ExecutionContext.SuppressFlow方法，除非他们真的知道你在做什么）。相比之下，代码运行的位置是开发人员应该认识到的，因此 SynchronizationContext 上升到值得显式编程模型支持的水平。（事实上，正如我在其他帖子中所说，大多数库实现者应该考虑在任务的每个等待中使用 ConfigureAwait（false）。

## ExectionContext（EC）

[ExecutionContext](https://www.cnblogs.com/BigBrotherStone/p/12316599.html)

[ExecutionContext vs SynchronizationContext](https://devblogs.microsoft.com/pfxteam/executioncontext-vs-synchronizationcontext/)

>ExecutionContext实际上只是一个状态包，可用于从一个线程捕获所有这些状态，然后在逻辑控制流继续的同时将其还原到另一个线程上。
>
>.NET Framework 中所有分叉异步工作的方法都以这样的方式捕获和还原 ExecutionContext（也就是说，除了那些以单词“Unsafe”为前缀的方法之外的所有方法，这些方法都是不安全的，因为它们明确不流动 ExecutionContext）。例如，当您使用 Task.Run 时，对 Run 的调用会从调用线程捕获 ExecutionContext，并将该 ExecutionContext 实例存储到 Task 对象中。当提供给 Task.Run 的委托稍后作为该任务执行的一部分被调用时，它是通过使用存储的上下文通过 ExecutionContext.Run 完成的。对于 Task.Run、ThreadPool.QueueUserWorkItem、Delegate.BeginInvoke、Stream.BeginRead、DispatcherSynchronizationContext.Post 以及您能想到的任何其他异步 API 都是如此。它们都捕获 ExecutionContext，存储它，然后稍后在调用某些代码期间使用存储的上下文。
>
>
>
>当您流动 ExecutionContext 时，您将从一个线程捕获状态，然后还原该状态，使其在提供的委托执行期间处于环境状态。当您捕获和使用同步上下文时，不会发生这种情况。捕获部分是相同的，因为您从当前线程中获取数据，但随后以不同的方式使用该状态。在调用委托期间，您不是使该状态处于当前状态，而是 SynchronizationContext.Post 只是使用该捕获的状态来调用委托。委托的运行位置、时间和方式完全取决于 Post 方法的实现。
>
>
>
>当您调用公共 ExecutionContext.Capture（） 方法时，它会检查当前的 SynchronizationContext，如果有，它会将其存储到返回的 ExecutionContext 实例中。然后，当使用公共 ExecutionContext.Run 方法时，捕获的 SynchronizationContext 将在执行提供的委托期间恢复为当前。
>
>为什么会有问题？作为 ExecutionContext 一部分的 Flow SynchronizationContext 会更改 SynchronizationContext.Current 的含义。SynchronizationContext.Current 应该是您可以访问的内容，以返回到您访问 Current 时当前所处的环境，因此如果 SynchronizationContext 在另一个线程上流动为当前，则不能信任 SynchronizationContext.Current 的含义。在这种情况下，它可以是返回到当前环境的方法，也可以是返回到流中先前某个时间点发生的某个环境的方法。

ExecutionContext 随着线程流动的状态包，通过静态 Capture 方法捕获：

```csharp
ExecutionContext ec = ExecutionContext.Capture（）;
```

在调用委托期间通过静态 run 方法还原它：

```csharp
ExecutionContext.Run(
    ec
    , s => { //这里的代码会将 ec 的状态视为 ambient }
    , null);
```

当谈论"流动执行上下文"时，谈论的正是这样一个过程，即获取一个线程上的环境状态，并在稍后的某个时间点将该状态还原到线程上，同时该线程执行提供的委托。

比如在Task中的:

```csharp
private void ExecuteWithThreadLocal(ref Task? currentTaskSlot, Thread? threadPoolThread = null)
        {
           	......
            try
            {
                // place the current task into TLS.
                currentTaskSlot = this;

                // Execute the task body
                try
                {
                    ExecutionContext? ec = CapturedContext;
                    if (ec == null)
                    {
                        // No context, just run the task directly.
                        InnerInvoke();
                    }
                    else
                    {
                        // Invoke it under the captured ExecutionContext
                        if (threadPoolThread is null)
                        {
                            ExecutionContext.RunInternal(ec, s_ecCallback, this);
                        }
                        else
                        {
                            ExecutionContext.RunFromThreadPoolDispatchLoop(threadPoolThread, ec, s_ecCallback, this);
                        }
                    }
                }
				....
            }
        }
```

其他地方也是类似的，最终在ExectionContext执行的方法：

ExecutionContext.RunInternal(ec, s_ecCallback, this);

ExecutionContext.RunFromThreadPoolDispatchLoop(threadPoolThread, ec, s_ecCallback, this);

ExectionContext 与 SynchronizationContext 的纠缠有点迷糊，好消息是通常不必考虑。

最终的效果：`使其在提供的委托执行期间处于环境状态`

```csharp
public void Index2()
{
    var ec = ExecutionContext.Capture();

    new Thread(() =>
               {
                   Thread.Sleep(1000);
                   var ec1 = Thread.CurrentThread.ExecutionContext;
                   Console.WriteLine($"thread ec1 == ec ? {ec == ec1}"); //true
               }).Start();

    Task.Run(() =>
             {
                 Thread.Sleep(1000);
                 var ec1 = ExecutionContext.Capture();
                 Console.WriteLine($"task ec1 == ec ? {ec == ec1}"); //true
             });
}
```





