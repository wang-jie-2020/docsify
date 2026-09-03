## GIT

```bash
git tag v1.0.0
git push origin v1.0.0

git worktree add ../test feature-test
```



### sub-module

```bash
git submodule add <url> <path>
git submodule update --init --recursive
# 更新子模块到主仓库记录的版本
# git submodule update --recursive
# 更新子模块到远程最新版本
# git submodule update --remote --recursive

# 删除子模块
# git submodule deinit -f <path>
# git rm -f <path>
# rm -rf .git/modules/<path>
```

