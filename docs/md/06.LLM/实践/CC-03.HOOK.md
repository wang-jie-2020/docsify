**Hooks（钩子）就是"事件触发器"** —— 在特定事件发生时，自动执行你预设的操作。

| 事件             | 触发时机          | 典型用途                   |
| ---------------- | ----------------- | -------------------------- |
| `SessionStart`   | 会话启动时        | 自动加载环境、打印欢迎信息 |
| `PreToolUse`     | 工具调用**前**    | 权限检查、参数验证         |
| `PostToolUse`    | 工具调用**后**    | 自动格式化、运行测试       |
| `PreCheckpoint`  | 创建检查点前      | 保存状态                   |
| `PostCheckpoint` | 创建检查点后      | 通知用户                   |
| `Stop`           | Claude 停止响应前 | 清理临时文件、发送摘要     |
| `SubagentStop`   | 子代理停止前      | 收集子代理结果             |
| `Notification`   | 有通知时          | 自定义通知逻辑             |
| `ExitPlanMode`   | 退出计划模式时    | 自动执行计划               |





例子 1：写完代码自动 lint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "tool": "Write",
        "command": "npx eslint --fix ${FILE_PATH}"
      }
    ]
  }
}
```

**效果：** Claude 每写完一个文件，自动跑 eslint 修复



例子 2：提交前自动运行测试

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "tool": "Bash",
        "command": "npm test",
        "if": "command contains 'git commit'"
      }
    ]
  }
}
```

**效果：** Claude 执行 `git commit` 之前，先跑测试，测试失败则阻止提交



例子 3：会话启动时自动加载项目上下文

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "cat ./PROJECT_CONTEXT.md"
      }
    ]
  }
}
```

**效果：** 每次打开 Claude Code，自动把项目背景读给 Claude 听



## Hook 的四种类型

| 类型       | 说明                 | 示例                        |
| ---------- | -------------------- | --------------------------- |
| `command`  | 执行 shell 命令      | `"command": "npm run lint"` |
| `http`     | 发送 HTTP 请求       | 调 webhook 通知外部系统     |
| `mcp_tool` | 调用 MCP 工具        | 连接外部服务                |
| `prompt`   | 向 Claude 发送提示词 | 动态修改 Claude 的行为      |



## 在 Plugin 中的 Hooks

当 Hooks 放在 Plugin 里时，结构是这样的：

```
my-plugin/
├── hooks/
│   └── hooks.json        ← Hook 定义在这里
└── scripts/
    └── auto-lint.sh      ← Hook 调用的脚本
```

`hooks.json` 内容：

```json
{
  "PostToolUse": [
    {
      "tool": "Write",
      "command": "${CLAUDE_PLUGIN_ROOT}/scripts/auto-lint.sh"
    }
  ]
}
```

**安装这个 Plugin 后，Hooks 自动生效**。