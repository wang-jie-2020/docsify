**Git Hooks 就是 Git 的事件触发器** —— 在你执行某些 Git 操作时，自动运行你预设的脚本。



## Git Hooks 在哪里

每个 Git 仓库里都有一个 `.git/hooks/` 目录：

```
your-project/.git/hooks/
├── pre-commit
├── commit-msg
├── post-commit
```



## 常用的 Git Hooks

| Hook          | 触发时机               | 典型用途                                          |
| ------------- | ---------------------- | ------------------------------------------------- |
| `pre-commit`  | **commit 之前**        | 运行 linter、格式化代码、跑单元测试               |
| `commit-msg`  | 编辑 commit message 后 | 检查 commit message 格式（如是否以 `feat:` 开头） |
| `post-commit` | commit 完成后          | 发送通知、记录日志                                |
| `pre-push`    | **push 之前**          | 跑完整测试套件，防止 broken code 上库             |
| `post-merge`  | merge 完成后           | 自动运行 `npm install`（依赖可能变了）            |
| `pre-rebase`  | rebase 之前            | 阻止对受保护分支的 rebase                         |



#### 例子 1：`pre-commit` 自动跑 lint

`.git/hooks/pre-commit`：

```bash
#!/bin/bash
echo "Running linter..."
npx eslint src/
if [ $? -ne 0 ]; then
  echo "❌ Lint failed, commit aborted!"
  exit 1   # 返回非0，Git 会中止 commit
fi
```

**效果：** 代码有 lint 错误时，`git commit` 直接失败，强迫你先修代码。



#### 例子 2：`commit-msg` 强制 commit message 格式

`.git/hooks/commit-msg`：

```bash
#!/bin/bash
msg=$(cat $1)
if ! echo "$msg" | grep -qE "^(feat|fix|chore|docs):"; then
  echo "❌ Commit message must start with feat:|fix:|chore:|docs:"
  exit 1
fi
```

**效果：** commit message 不符合规范时，提交被拒绝。



## Husky相关

用 [Husky](https://github.com/typicode/husky) —— 把 hooks 配置写到项目里，随代码一起提交，团队共享

```bash
# Husky 让 Git Hooks 可以版本化管理
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

