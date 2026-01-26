![img](https://raw.gitcode.com/qq_36179938/images/raw/main/1720422663594-6499cc96-7ae2-42cb-a2e2-4aa829fd14e6.png)



一、RESET

不同的Option对于HEAD指针的重置都是一样的，不同的是对于工作区或暂存区的操作：

soft 保留工作区、暂存区，mixed 保留工作区，不保留暂存区(源文件在)，实际场景下可以认为是等效的，hard 丢弃全部

通常需要的是回滚同时保留修改，小乌龟的默认也是mixed

二、REVERT

和指针无关，以一次新的提交覆盖掉上次的提交，保留历史

可以针对某个提交中的某个文件选择性REVERT

三、REBASE

相比merge,提交线更清晰

![image-20250523144635119](https://raw.gitcode.com/qq_36179938/images/raw/main/image-20250523144635119.png)

git rebase (待) (目标)

选择太多难以全部理解...