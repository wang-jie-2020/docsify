## Linux 系统级别环境变量设置指南

| 级别                     | 作用范围               | 配置文件                                | 生效方式               |
| ------------------------ | ---------------------- | --------------------------------------- | ---------------------- |
| **当前进程**             | 仅当前终端会话         | `export` 命令                           | 立即生效，关闭终端失效 |
| **当前用户**             | 该用户所有会话         | `~/.bashrc` / `~/.zshrc`                | 重新登录或 `source`    |
| **系统级别**             | **所有用户、所有进程** | `/etc/environment` 或 `/etc/profile.d/` | 重新登录或重启         |
| **系统级别（需管理员）** | 所有用户，最后加载     | `/etc/profile` / `/etc/bash.bashrc`     | 重新登录               |

系统级环境变量优先用 `/etc/profile.d/*.sh`，干净、不会冲突、支持完整 shell 语法。简单场景用 `/etc/environment`。

#### 方法一：`/etc/environment`（推荐）

最标准的系统级环境变量配置方式，被 PAM 模块读取，**对所有用户、所有登录方式（SSH、GUI、TTY）生效**：

```bash
# 编辑文件
sudo nano /etc/environment

# 添加环境变量（注意：这里用 key=value 格式，不要加 export）
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
JAVA_HOME="/usr/lib/jvm/java-17"
MY_VAR="hello world"
```

> ⚠️ `/etc/environment` **不支持变量展开和 shell 语法**，不能写 `$HOME` 或 `export`。

在 `/etc/profile.d/` 下创建独立 `.sh` 脚本，`/etc/profile` 会自动加载该目录下所有可执行脚本：

```bash
# 创建一个独立的配置文件（推荐，方便管理）
sudo tee /etc/profile.d/my-env.sh << 'EOF'
export JAVA_HOME="/usr/lib/jvm/java-17"
export PATH="$JAVA_HOME/bin:$PATH"
export MY_VAR="hello world"
EOF

# 赋予执行权限（必须！否则不会加载）
sudo chmod +x /etc/profile.d/my-env.sh
```

> ✅ 支持 `export`、变量展开、条件判断等完整 shell 语法。适合包管理器（如 Node.js、Go）自动配置。