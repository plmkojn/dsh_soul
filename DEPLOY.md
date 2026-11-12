# 大肥鱼（dsh-soul）部署指南

这是一份可直接部署的 DeepSeek Harness 插件完整包：一个住在 DSH 里的常驻伙伴，带独立桌面窗口（Windows）、聊天面板、日记、人格和自主活动。

- 插件名：`dsh-soul`
- 版本：0.1.0
- 适用：DeepSeek Harness `>= 0.2.2-rc.1`
- 平台：Windows 10/11（独立桌宠窗口依赖 WPF；插件本体在其它平台也能加载，只是没有桌面窗口）

---

## 1. 目录结构

```
dsh-soul-package/
├─ package.json          # 插件清单（dsh.bundle / dsh.client 声明）
├─ index.js              # Host 半：Agent、状态、日记、/soul-api、桌宠进程管理
├─ client.js             # Web 半：面板、小球、设置、桌宠开关
├─ cordis.patch.yml      # bundle 补丁（把插件插入 DSH 组合树）
├─ icon.svg              # 插件图标
├─ locale/
│  ├─ en.json
│  └─ zh.json
├─ pet/
│  └─ pet-window.ps1     # 独立桌面窗口（WPF + Windows PowerShell 5.1）
├─ README.md / README.zh-CN.md
├─ CHANGELOG.md
└─ LICENSE
```

> `pet/pet-window.ps1` 必须随包保留，`index.js` 会按“插件目录/pet/pet-window.ps1”去找它。

---

## 2. 环境要求

| 项目 | 要求 |
| --- | --- |
| 操作系统 | Windows 10/11（桌宠窗口）；其它平台仅面板 |
| DeepSeek Harness | `>= 0.2.2-rc.1`（`engines.dsh`） |
| 模型 | 已在 DSH 里配置可用的默认模型 |
| 运行时 | Windows PowerShell 5.1（系统自带）；WPF（.NET Framework 4.8 组件） |
| 网络 | 无需公网端口；面板 API 只监听 `127.0.0.1` |

---

## 3. 安装

### 方式 A：插件管理器（推荐）

1. 打开 DSH → **插件 / Plugin Manager**。
2. 选择 **安装 bundle（Install bundle）**。
3. 选中本文件夹 `dsh-soul-package`（或解压后的目录）。
4. 安装完成后按提示刷新页面（`Ctrl+R`）。

安装会在当前 profile 里登记：

```json
"dependencies": { "dsh-soul": "link:<本文件夹绝对路径>" }
```

并通过 `cordis.patch.yml` 把插件挂进运行树。

### 方式 B：命令行安装（等价）

在 DSH profile 目录执行（把路径换成实际路径）：

```powershell
cd "$env:USERPROFILE\.dsh\profiles\desktop"
pnpm add "link:C:\path\to\dsh-soul-package"
```

然后在 `package.json` 的 `dsh.profile.bundles` 里加入 `dsh-soul`，重启 DSH。

> 说明：`link:` 安装指向源目录，**不要在安装后删除或移动这个文件夹**，否则插件会失效。

### 安装后检查

- 插件页里能看到 `dsh-soul`，状态为启用/active。
- 浏览器或 DSH 窗口右下角出现小球（桌宠窗口运行时会隐藏它，见下）。
- 数据目录已生成：`%USERPROFILE%\.dsh-soul\`（`state.json`、`diaries\`、`home\`）。

---

## 4. 首次运行

1. 刷新 DSH 页面（`Ctrl+R`）。
2. 首次唤醒会创建伙伴的 Session、写初始日记，并在 `~/.dsh-soul/` 下建数据。
3. Windows 上会自动弹出**独立桌宠窗口**（右下角，透明置顶，不占任务栏）。
4. 如果桌宠窗口在跑，DSH 窗口里的那颗小球会隐藏——这是设计（面板已“搬到”桌面球上）；桌宠退出后小球会自动回来。

---

## 5. 使用

### 桌面球

- **单击**：打开/收起完整面板（状态、聊天、日记、设置）。
- **拖动**：移动位置，位置记在 `~/.dsh-soul/pet-window.json`。
- **右键**：打开面板 / 总在最前 / 切到 DSH 窗口 / 退出桌宠。

### 面板

- **顶部**：名字、状态、人格一句话；「设置 / 返回」切换设置页。
- **状态卡**：心情、精力、好感（带文字）、当前念头、正在做什么、爱好标签。
- **标签**：聊天 / 日记 / 新对话（只切换内容区，状态卡和标签保留）。
- **聊天**：消息气泡、时间、「主动」标记；输入框自动换行，回车发送，Shift+回车换行。
- **日记**：按时间列出每个人格的日记；「新对话」保留日记和状态。
- **设置**：
  - 人格：大肥鱼 / 小深 / 夜灯；点「自定义人格」才展开「名字 / 人设」。
  - 打开日记文件夹。
  - 自主活动、独处间隔（10/20/30/60/120 分钟）、夜里休息、工具审批、桌宠窗口开关。
  - 戳一下 TA（触发一次自主时刻）。
  - 模型 / 会话 / 房间 / 数据 / 日记目录信息。
  - 错误时显示提示与「重试」。

### DSH 内的面板

桌宠未运行时，DSH 窗口右下角的小球仍可打开同一套面板（共享状态、聊天、日记）。

---

## 6. 数据、备份与迁移

| 内容 | 位置 |
| --- | --- |
| 状态（心情/精力/好感/人格/设置） | `%USERPROFILE%\.dsh-soul\state.json` |
| 每个人格的日记 | `%USERPROFILE%\.dsh-soul\diaries\` |
| 伙伴的“房间”文件 | `%USERPROFILE%\.dsh-soul\home\` |
| 桌宠位置 | `%USERPROFILE%\.dsh-soul\pet-window.json` |
| 桌宠运行日志 | `%USERPROFILE%\.dsh-soul\pet-window.log`、`pet-spawn.log` |

> 如果 DSH 提供了 `DSH_PROFILE_DIR`，数据会放在 `%DSH_PROFILE_DIR%\soul\`。

备份：直接复制 `.dsh-soul` 目录。
迁移：新机器装好插件后，把 `.dsh-soul` 覆盖回去即可（Session 由 DSH 的会话存储另行保存）。

---

## 7. 升级

1. 停止 DSH（或至少关闭桌宠窗口）。
2. 用新版本覆盖本文件夹内容（保留 `pet/`）。
3. 插件管理器里对 `dsh-soul` 执行一次禁用→启用，或重启 DSH。
4. 刷新页面（`Ctrl+R`）。

> 只改前端（client.js）时，刷新页面即可；改 Host（index.js）需要插件重载/重启。

---

## 8. 卸载

1. 插件管理器 → `dsh-soul` → **移除（Remove）**。
2. 重启 DSH / 刷新页面。
3. 可选：删除 `%USERPROFILE%\.dsh-soul\`（会连同日记和记忆一起删除，谨慎）。
4. 可选：删除本文件夹。

---

## 9. 故障排查

**桌宠窗口不出现**
- 确认是 Windows，且系统里有 `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`。
- 看 `~/.dsh-soul/pet-spawn.log` 是否有 `spawned` / `child exit`；看 `pet-window.log` 是否有 `UI error`。
- 若日志里是 `找不到类型 [System.Windows.Forms.Cursor]` 之类的旧错误，说明运行的是旧脚本，重启插件。
- 关闭杀毒软件对 PowerShell 脚本的拦截，或把插件目录加入白名单。

**桌宠窗口在，但 DSH 里的小球没了**
- 正常：桌宠运行期间 DSH 内小球隐藏。右键桌宠 → 退出桌宠，或在面板设置里关掉「桌宠窗口」，小球会在 1~2 秒内回来。

**面板打不开 / 空白**
- 刷新页面；确认插件状态为 active。
- 检查 `~/.dsh-soul/state.json` 是否可读。

**端口/接口**
- 桌宠通过 `http://127.0.0.1:<DSH 端口>/soul-api` 访问，仅本机。端口随 DSH 重启变化，插件会自动把新端口传给桌宠。
- 如果手动改了端口或反向代理，请确保 `/soul-api` 可本机访问。

**安装时报 pnpm/registry 错误**
- 本插件通过 `link:` 安装，不下载依赖；若 profile 里其它依赖的 registry 证书过期，换用可用 registry 再装。

**数据看起来丢了**
- 先看 `~/.dsh-soul/state.json` 是否还在；卸载插件不会删除数据，只有手动删目录才会。

---

## 10. 安全与隐私

- 面板 API 只监听回环地址，不要将 DSH Web 暴露到公网/局域网。
- 伙伴的 Agent 默认 `approval = ask`；面板里可改，但改「不问」会放大风险。
- 插件读取/写入的范围：`~/.dsh-soul/`（状态、日记、房间）与自身安装目录；不会上传数据。
- 自主活动会周期性唤醒模型并消耗 token；可在设置里关闭或调间隔。
- 桌宠窗口是本地 WPF 进程，随插件启动/退出，不监听端口。

---

## 11. 分发

- 直接压缩整个 `dsh-soul-package` 文件夹分发；接收方解压后按第 3 节安装。
- 不要包含 `~/.dsh-soul/`（里面有聊天和日记）。
- 修改代码后请保留 `pet/pet-window.ps1` 的 UTF-8 BOM：Windows PowerShell 5.1 读取无 BOM 的中文脚本会解析失败。
- 提交到 Git 时建议忽略：`*.log`、`state.json`、`diaries/`、`pet-window.json`。

---

## 12. 版本与兼容

- DSH `0.2.2-rc.1` 上验证通过。
- 面板使用 Host 提供的 `/soul-api` 与 Slot API；DSH 大版本升级后如遇 client 报错，先看浏览器 Console 的 `client-modules` / `slots` 相关信息。
