# PowerShell

## 一、配置的位置

```
notepad $PROFILE
```



二、配置

1. alias

   ```bash
   New-Alias -Name ll -Value "ls"
   ```

2. quick-start

   ```bash
   function docs {
       if ($args) {
           Set-Location "D:\Doc\docsify\docs\$args"
       } else {
           Set-Location "D:\Doc\docsify\docs"
       }
   }
   ```

   