# build-own-redux

## v0.1

在改变状态后，能发出通知，使用发布订阅模式解决该问题。

## v0.2

两个问题：

1. 状态管理器的通用问题，现在只能管理count
2. 公共代码封装
3. 实现getState changeState subscribe

## v0.3

在上面实现的`changeState`中，我们不能限定更该数据的内容，比如我们可以将count修改为
'some string'字符串，这是不合理的。我们需要count按计划去改变：比如自增和自减。所以我们只对外提供两种改变count的方法。（这就是action啊～～）

在这里我们引入`reducer`的概念,reducer可以告诉store，我们要修改的是什么，并按照我们的计划修改。
