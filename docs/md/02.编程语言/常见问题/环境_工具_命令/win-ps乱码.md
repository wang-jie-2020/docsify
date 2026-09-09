```bash
try {
	oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH\1_shell.omp.json" | Invoke-Expression
} catch {}

# 设置控制台代码页为 UTF-8
chcp 65001 > $null

# 同时设置 .NET 的输出编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Set-Alias -Name ll -Value "ls"
Set-Alias -Name cc -Value "claude"

function sk { Set-Location D:\Skills }
function doc { Set-Location D:\Doc\docsify; ii . }
```

