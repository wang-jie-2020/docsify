## uv

### Linux 安装 uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### windows 安装 uv

```bash
winget install uv 

# 或者 irm https://astral.sh/uv/install.ps1 | iex
```



### uv 环境管理

#### 管理 Python 版本

```bash
uv python list

uv python install 3.12
uv python install 3.11.6

# 全局默认
uv python default 3.12
```

#### 管理虚拟环境

```bash
# 创建名为 .venv 的虚拟环境（默认）
uv venv

# 激活环境（macOS/Linux）
source .venv/bin/activate

# 激活环境（Windows）
.venv\Scripts\activate

# 为当前项目固定 Python 3.11
uv python pin 3.11
```

#### 包管理

```bash
# 安装最新版本
uv pip install requests

# 安装特定版本
uv pip install requests==2.31.0

# 从 requirements.txt 安装
uv pip install -r requirements.txt

# 导出当前环境的依赖
uv pip freeze > requirements.txt

# 导出生产环境依赖（排除开发依赖）
uv pip freeze --production > requirements.txt
```



### 项目管理

初始化一个新项目：

```bash
uv init my_project
cd my_project
```

这会创建基本的项目结构和 pyproject.toml 文件。

安装项目的依赖：

```bash
uv sync
```

这个命令会根据 pyproject.toml 和 requirements.txt 安装所有依赖，类似于 **pip install -e .** 但更高效。

> **说明：**
>
> uv sync 是一个依赖管理命令，它的作用类似于您可能更熟悉的 pip install -r requirements.txt，但更快、更强大、更可靠。
>
> 您可以把它理解为："一键安装这个项目正常运行所需的所有第三方软件包（依赖库）"。
>
> uv sync 如果安装太慢，可以设置国内镜像源 https://pypi.tuna.tsinghua.edu.cn/simple：
>
> 在项目根目录的 pyproject.toml 文件 [tool.uv] 处设置 index-url：
>
> ```bash
> [tool.uv]
> index-url = "https://pypi.tuna.tsinghua.edu.cn/simple"
> ```