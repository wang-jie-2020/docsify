# PowerShell

### windows-powershell vs powershell7

- 两者不是一个东西
- 配置不共享, 模块不一定兼容

- 推荐ps7
- 不能自动切换时, 考虑`pwsh`手动切换

### 乱码问题

```bashtry {
try {
	oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\1_shell.omp.json" | Invoke-Expression
} catch {}

# 设置控制台代码页为 UTF-8
chcp 65001 > $null

# 同时设置 .NET 的输出编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Set-Alias -Name ll -Value "ls"
Set-Alias -Name cc -Value "claude"

function doc { Set-Location D:\Doc\docsify; ii . }
```

### 配置文件

```bash
notepad $PROFILE	# 编辑配置

. $PROFILE	# 重载 , 相当于 source ~/.bashrc
```

### 设置快速启动

```bash
function docs {
    if ($args) {
        Set-Location "D:\Doc\docsify\docs\$args"
    } else {
        Set-Location "D:\Doc\docsify\docs"
    }
}
```

### 设置别名

```bash
New-Alias -Name ll -Value "ls"
```





