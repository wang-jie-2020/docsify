---
description: 极简快速提交并推送到 main（无检查）
argument-hint: "<提交信息>"
---

使用 $ARGUMENTS 作为提交信息。

直接执行，不做额外检查：
1) git add .
2) git commit -m "$ARGUMENTS"
3) git push origin main

最后只返回：
- commit hash
- 提交文件列表
- push 结果
