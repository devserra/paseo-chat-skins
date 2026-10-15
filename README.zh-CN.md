# Chat Skins for Paseo

[English (default)](./README.md) | **简体中文**

把熟悉的 **Codex** 和 **Claude Code** 聊天风格带到 Paseo。为支持的消息、代码块、工具详情和阅读偏好提供自定义外观，并可选择开启桌面输入框样式增强。

**换肤改变的是聊天外观，不是运行会话的引擎。** 你可以使用 Claude Code 风格，同时继续运行 Codex；反过来也一样。

[插件页面](https://paseo.sh/plugins/devserra/chat-skins) · [反馈问题](https://github.com/devserra/paseo-chat-skins/issues) · [由 serra 创作](https://serra.dev)

## 安装

宿主/守护进程与连接的客户端均需使用 **Paseo 0.11.2 或更高版本**。

在运行 Paseo 宿主的机器上执行：

```bash
paseo plugin add devserra/chat-skins
```

也可以在应用中安装：

1. 打开所用宿主的 **Settings → Plugins（设置 → 插件）**。
2. 在 **Plugin source** 中输入 `devserra/chat-skins`。
3. 点击 **Install plugin**，安装后确认 Chat Skins 已启用。

正常安装不需要手动打包或构建。插件属于受信任代码，启用前请审查来源。如果全局插件开关尚未开启，请先了解其权限，再自行在 **Settings → Plugins** 中开启。

> 短名称安装的是插件市场已审核的版本。本文介绍当前仓库的功能；`master` 上的新改动不会自动成为市场版本。缺少某个选项时，请查看[更新说明](#更新)。

## 开始使用

1. 打开 **Settings → Plugins**，找到 **Chat Skins**（安装 ID 为 `paseo-chat-skins`）。
2. 点击其 **⋯** 菜单，选择 **Chat Skins Settings**；也可以在 Command Center 中搜索此名称。
3. 在 **聊天样式 / Chat style** 中选择 **Codex** 或 **Claude Code**。新安装默认使用 **Paseo 原生**，因此安装后需要先选择皮肤才会改变外观。
4. 按需设置页面语言、正文字号、间距及详情默认展开方式。点击 **展开样式预览 / Show preview** 可查看示例消息，预览不是你的真实会话。
5. 如果还希望改变输入框，打开 **输入框 → 输入框样式增强 / Composer styling**。该功能属于实验性桌面增强，**默认关闭**。
6. 返回同一宿主的聊天即可查看。设置自动保存，不需要重启应用或新建会话。

设置由连接**同一宿主**的客户端共享，不是每台设备单独保存。语言选项只影响设置页及其预览，不翻译聊天内容，也不改变 Paseo 本身的界面语言。

## 插件有什么作用

| 区域 | 提供的功能 |
| --- | --- |
| Codex 消息样式 | 深色用户气泡、简洁助手正文和圆角代码块。 |
| Claude Code 消息样式 | 更轻量的阅读布局、低强调工具行和紧凑间距；用户消息保留 Paseo 原生渲染。 |
| Markdown 与复制 | 支持常用 Markdown、等宽代码块，以及真实的代码/消息复制操作。 |
| 工具详情 | 展开或收起支持的 shell 命令与思考内容；失败命令始终显示错误详情。 |
| 阅读偏好 | 三档字号，以及舒适/紧凑两种间距。 |
| 设置语言 | 英文、简体中文、印地语 Hindi；入口名称始终为 **Chat Skins Settings**。 |
| 可选输入框增强 | Codex 圆角输入框，或 Claude Code 紧凑输入框，操作连接真实宿主控件。 |

### 消息与设置预览

以下截图展示消息样式和设置页面。实验性输入框的交互方式见下一节。

| Codex | Claude Code | 设置页面 |
| --- | --- | --- |
| ![Codex 消息预览](./assets/screenshots/codex.png) | ![Claude Code 消息预览](./assets/screenshots/claude-code.png) | ![Chat Skins 设置](./assets/screenshots/settings.png) |

### 设置项速查

| 设置项 | 使用说明 | 默认值 |
| --- | --- | --- |
| **设置页面语言 / Settings language** | 为设置页及预览选择英文、简体中文或印地语。 | English |
| **聊天样式 / Chat style** | 选择 Paseo 原生、Codex 或 Claude Code。 | Paseo 原生 |
| **输入框样式增强 / Composer styling** | 开启可选的桌面输入框和工具栏适配。 | 关闭 |
| **正文字号 / Text size** | 小 · 14、参考 · 16、大 · 18。 | 参考 · 16 |
| **间距 / Spacing** | 为支持的消息内容选择舒适或紧凑排版。 | 舒适 |
| **默认展开命令详情 / Expand command details** | 默认展开支持的命令详情；失败详情不受此开关影响，始终展开。 | 关闭 |
| **默认展开思考 / Expand reasoning** | 展开提供商实际返回的思考内容，不会改变思考强度。 | 关闭 |
| **恢复默认 / Restore defaults** | 恢复原生渲染与默认显示选项，并关闭输入框增强；保留设置语言和聊天记录。 | — |

## 可选的桌面输入框增强

选择皮肤后，再打开 **输入框样式增强**。适配目标为 **Paseo 0.11.2 的桌面 Web 渲染输入框**，要求精确指针、至少 **900 CSS px** 的视口宽度，以及至少 **620 CSS px** 的输入框宽度。窄面板、原生移动端或无法识别的布局保留原生输入框。

### Codex 风格

- 圆角输入框，左侧放置权限，右侧放置模型和强度控件。
- 点击强度控件，在能识别原生选项时展示紧凑滑杆。拖动并松开，或用方向键调整后按 Enter，应用真实可用档位。
- 仅实际存在 **Ultra** 档位时显示紫色强调；无法识别的选项集保留原生列表。
- 滑杆左上角闪电切换真实的 **Normal/Fast** 模式：关闭时为灰色描边，开启时为蓝色实心。Fast 开启后增加轨道粒子，遵循系统减少动态效果设置。
- 切换强度或 Fast 后保持弹窗打开，点击外部或按 Esc 关闭。
- **Full access** 权限图标使用红色，**Default permissions** 使用蓝色；配色不会自动改变权限。

### Claude Code 风格

- 紧凑输入框，附件、听写、发送/停止操作位于框内。
- 权限位于输入框下方左侧；右侧只显示**模型名称**和原生上下文圆环，不重复显示强度文字。
- 点击**模型名称**打开统一菜单，包含真实模型列表、**Effort** 强度子菜单，以及状态可验证时的 **Fast mode** 开关。
- 修改 Effort/Fast 后保留主菜单；选择模型遵循原生行为。
- 空白且空闲时不伪造发送按钮；附件、消息排队、加载、语音可用性和停止操作仍由 Paseo 管理。

### 上下文窗口与真实功能

点击上下文圆环查看真实详情，鼠标悬停不会展开。明确点击展开后，鼠标移开不会关闭或重建弹窗；点击外部、再次点击圆环或按 Esc 可关闭。页面/视图变化、窗口失焦/缩放，以及宿主的外部滚动关闭行为仍保留。

模型、强度、Fast、语音和权限均使用 Paseo 的真实行为。选择皮肤不会改变它们，明确操作这些控件才会应用相应修改。提供商没有的能力不会被伪造；Fast 状态未知、新会话无法识别 Agent 或多面板归属不明确时，保留原生 Fast 入口，不显示假开关状态。

## 常见问题

### 已安装，但界面没有变化

- 在 **Settings → Plugins** 或 `paseo plugin ls` 中确认插件已启用，状态为 `running`。
- 打开 **Chat Skins Settings** 选择皮肤；默认的 **Paseo 原生** 不接管消息。
- 消息换肤与**输入框样式增强**是两个开关；希望改变输入区域时，需要额外开启后者。
- 输入框没有变化时，尝试加宽窗口/面板，并查看对应设置开关下方的状态说明。
- Beautiful Chat 等消息渲染插件可能优先接管消息。可以尝试同一时间仅启用一个消息渲染插件；Chat Skins 不会自动停用其他插件。

### 为什么使用 Claude Code 皮肤，模型菜单仍显示“Codex”？

皮肤与实际提供方互相独立。菜单保留真实提供方和模型名称：运行 GPT 模型的 Codex 会话，即使使用 Claude Code 外观，也仍然是 Codex。需要切换实际 Agent 时，请另行使用 Paseo 的提供方/模型控件。

### 如何恢复 Paseo 原生外观？

选择 **Paseo 原生**，撤销本插件的消息与输入框适配。只想恢复输入框、保留消息皮肤时，关闭**输入框样式增强**即可。**恢复默认**还会重置阅读和详情选项，但保留设置语言。也可以在 **Settings → Plugins** 中停用或移除插件。

### 这是整个应用的完整复刻吗？

不是。以 macOS 浅色界面为视觉参考，不承诺像素级完全一致；不替换侧栏、工作区树、窗口布局或提供商行为。配色适配 Paseo 主题，但深色/移动端还原度及全部输入流程尚未完整验证。

富附件、表格、不支持的工具、提供商专用元数据及超大内容保持原生。替换后的消息可能不包含全部宿主专用操作，使用消息回退等功能时请切回原生。输入框增强依赖有结构检查的 DOM/CSS 适配；宿主更新或其他适配器冲突时，可能回退为原生。详细范围见[架构与边界说明](./docs/architecture.md)。

## 更新

先检查更新，再查看并确认安装：

```bash
paseo plugin update paseo-chat-skins --check
paseo plugin update paseo-chat-skins
```

市场安装跟随的是**注册表审核通过的版本**，不是仓库每一次推送。`paseo plugin reload` 只重载已安装源码，**不会**下载或发布新版本。

如果明确希望直接安装仓库源码，而不是市场审核版本：

```bash
paseo plugin add git:devserra/paseo-chat-skins --ref master
```

这是开发源码，不等于市场版本。避免重复启用多个安装实例；改变现有安装来源时，请参考[官方插件指南](https://paseo.sh/docs/plugins.md)。

## 本地开发

使用 **Node.js 22.18+**（或 Node.js 24）及 npm：

```bash
git clone https://github.com/devserra/paseo-chat-skins.git
cd paseo-chat-skins
npm ci --ignore-scripts
npm run check
npm pack --dry-run
paseo plugin install "$(pwd)"
```

修改本地源码后：

```bash
npm run check
paseo plugin reload paseo-chat-skins
```

`check` 仅执行严格 TypeScript 检查，不代表运行或视觉验收。自动化测试源码、本地样本及内部 QA 产物按项目约定不纳入仓库和安装包。当前源码安装不需要手动生成 bundle，也不需要为了重载插件而重启守护进程。

- [架构与源码结构](./docs/architecture.md)
- [Paseo 插件接口](https://paseo.sh/docs/plugins/reference)
- [插件发布指南](https://paseo.sh/docs/plugins/publishing.md)

---

由 [serra](https://serra.dev) 创作。独立项目，与 OpenAI、Anthropic 无隶属关系，产品名称仅用于说明外观参考。插件不会将会话数据发送到外部服务，也不分发私人参考截图或原产品素材。
