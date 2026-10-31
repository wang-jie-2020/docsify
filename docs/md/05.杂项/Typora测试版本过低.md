# Typora 测试版本过低

> Typora 0.11.18 (macOS) 「当前测试版本过低，请下载较新版本」强制退出 —— 排查与处理记录
>
> 日期：2026-10-31
机器：macOS，用户 `jie.wang`，Typora `0.11.18`（最后一个免费 beta）

## 1. 现象

启动 Typora 弹出：

- 中文：`当前测试版本过低，请下载较新版本`
- 英文：`This beta version of Typora is expired, please download and install a newer version.`

点确定后 App 直接退出（不是崩溃，是自己杀自己）。

## 2. 根因

`LicenseManager` 在启动时读 `~/Library/Preferences/abnerworks.Typora.plist` 中的 `verInitTime`（首次运行时间戳），
与当前系统时间比较，差值超过约 **200 天**（源码里是 `17280001` 秒 = 200 天 + 1 秒）即判定过期。

弹窗文案位于：

```
Typora.app/Contents/Resources/zh-Hans.lproj/Panel.strings
```

反编译 `-[LicenseManager showTrailEnd]` 的逻辑等价于：

```objc
NSAlert *alert = [NSAlert new];
[alert setMessageText:@"Error"];
[alert setInformativeText:@"This beta version of Typora is expired, ..."];
[[NSRunningApplication currentApplication] activateWithOptions:2];
[alert runModal];
[[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:@"https://typora.io/#download"]];
[[NSApplication sharedApplication] terminate:0];   // ← 强制退出的位置
```

与 macOS 版本、Apple Silicon / Intel 均无关，纯粹是「用满 200 天」。

## 3. 实际排查过程

本机实测值：

```
$ defaults read abnerworks.Typora verInitTime
2026-04-11 13:24:34 +0000
```

2026-04-11 → 2026-10-31 = **203 天**，正好越过 200 天阈值，症状对得上。

相关键：

| 键 | 值 | 作用 |
|---|---|---|
| `verInitTime` | `2026-04-11`（原始） | 过期计时的起点 |
| `initialize_ver` | `0.11.18` | 版本初始化标记，决定是否写 `verInitTime` |
| `SUEnableAutomaticChecks` | `0` | 自动检查更新（本来就是关的） |

## 4. 执行的修复

### 4.1 备份

```bash
cp ~/Library/Preferences/abnerworks.Typora.plist ~/Desktop/Typora.plist.bak
```

### 4.2 第一版尝试：删除键（不成功）

```bash
osascript -e 'quit app "Typora"'
defaults delete abnerworks.Typora verInitTime
killall cfprefsd
```

重启 Typora 后再读，键**没有重建**：

```
$ defaults read abnerworks.Typora verInitTime
The domain/default pair of (abnerworks.Typora, verInitTime) does not exist
```

退出 Typora（plist 被正常回写，mtime 更新、体积 2281 → 2591 字节）后再读，仍然不存在。
对比备份与新 plist 的完整 diff，唯一差异就是少了 `verInitTime`，没有新增任何键。

**结论：`verInitTime` 只在 `initialize_ver` 初始化那一次被写入**，不是每次启动重算。
所以「删掉让它自己重建」这条路走不通 —— 网上很多教程说要删 plist / 删键，实际不生效（至少 0.11.18 不生效）。

### 4.3 第二版尝试：直接写未来日期（采用）

```bash
defaults write abnerworks.Typora verInitTime -date "2035-01-01 00:00:00 +0000"
killall cfprefsd
```

验证：

```
$ defaults read abnerworks.Typora verInitTime
2035-01-01 00:00:00 +0000
```

`now - verInitTime` 为负数，永远到不了 200 天阈值，等于永久续命。

## 5. 当前状态

| 项 | 状态 |
|---|---|
| `verInitTime` | `2035-01-01 00:00:00 +0000` ✅ |
| `initialize_ver` | `0.11.18`（未改动） |
| 其他偏好（主题 Night、字体、最近目录、图片上传等） | 全部保留 |
| 备份 | `~/Desktop/Typora.plist.bak` |
| Typora 进程 | 启动后保持运行，未自行退出 |

**未完成验证**：本次是在终端里 `osascript activate` + `screencapture` 截图确认，Typora 始终没有到前台，
所以「弹窗是否消失」**没有通过画面确认**，需要手动点一下 Dock 里的 Typora 亲眼核对。
（理论上不会弹，因为判定值已变成未来时间。）

## 6. 回滚

```bash
osascript -e 'quit app "Typora"'
cp ~/Desktop/Typora.plist.bak ~/Library/Preferences/abnerworks.Typora.plist
killall cfprefsd
```

## 7. 其他被验证/考察过的方案

| 方案 | 说明 | 评价 |
|---|---|---|
| 改系统时间 | 调到两年前启动，进窗口后调回 | 副作用大（证书、iCloud、构建工具全线错乱），不推荐 |
| AppleScript 自动改时间再恢复 | 思路同上，包成 app | 依旧依赖系统时间，且直接打开 md 文件时仍可能弹窗 |
| 改二进制 | nop 掉 `showTrailEnd` 或 `terminate:` 调用，再 ad-hoc 重签 | 生效但侵入性最大；arm64 必须有签名（`codesign --force --deep -s -`），升级/系统更新后可能失效 |
| 买正版 1.x | ~$14.99 / 3 台 | 唯一无坑的路 |

## 8. 注意事项

- `~/Library/Preferences/*.plist` 的真源是 `cfprefsd` 的内存缓存，**直接 `rm` 文件常常无效**，
  随后会被旧值回写。要么走 `defaults delete/write`，要么删完再 `killall cfprefsd`。
- `verInitTime` 只在本文件里，`~/Library/Preferences/ByHost/` 下没有副本。
- 这套做法绕的是软件自身的时间校验，属于灰色地带，自行权衡。
- 升级到 1.x 后本文件与上述键均无意义，可删除。
