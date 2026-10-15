# Chat Skins

[English (default)](./README.md) | **简体中文**

以像素级还原的 Codex 和 Claude Code 样式焕新 Paseo 聊天界面，一键切换聊天皮肤。

> **v0.1 是消息皮肤，不是整个应用的复制品。** 以 macOS 浅色聊天界面为参考。输入框、模型/思考强度选择、权限、侧栏及窗口布局仍由 Paseo 管理，当前不声称完整像素级一致。

## 已实现

- 配置入口：**Settings → Plugins → paseo-chat-skins → 操作菜单 → Chat Skins Settings**，也可以通过 Command Center 打开。
- 可选 **Paseo 原生、Codex、Claude Code**。新安装默认原生，选择皮肤后才接管支持的消息。
- Codex 深色用户气泡；两套助手正文、思考内容和普通 shell 工具调用样式。
- 常用 Markdown：段落、标题、简单列表、引用、围栏代码、行内代码、强调及 HTTP(S) 链接。代码块与助手消息提供真实复制按钮。
- 字号、密度、命令/思考默认展开及恢复外观（保留设置页面语言）。失败命令始终显示错误详情。
- 通过宿主正式设置接口保存，带修订冲突检查，连接的客户端会同步更新，重载后保留；不修改模型、提供商、权限或聊天记录。

设置页支持 **English、简体中文、हिन्दी（印地语 Hindi）**。在页面顶部切换语言后，设置项、说明、预览和辅助标签同步切换；菜单和命令面板入口始终为 **Chat Skins Settings**。语言默认英文，随宿主共享保存，不翻译聊天内容，也不更改 Paseo 本身的语言。底部提供「由 serra 创作」署名并链接至 [serra.dev](https://serra.dev)。

## 边界与安全回退

- 设置由**连接同一宿主的客户端共享**，不是按用户或设备独立保存。
- 皮肤不切换应用全局主题，颜色取自 Paseo 当前主题。浅色为参考基线；深色只做适配，不保证与原产品一致。
- Claude Code 用户消息缺少对应参考，因此保留原生渲染。
- 识别出的图片/文件标记、表格、脚注、富嵌入内容、不支持的工具、带提供商专用元数据的工具及超大内容保留宿主渲染。未排除但不支持的 Markdown 语法会以文本显示；本版不是完整 Markdown 引擎。代码块支持等宽排版，暂不做语法高亮。
- 不提供假模型菜单、假 Effort、Fast mode、语音或权限按钮；不编造 Token 数、耗时，也不跨多条消息汇总“执行 N 个命令”。
- 选择 **Paseo 原生**、设置读取失败或停用插件，会撤销本插件的消息替换；其他已启用的渲染插件仍可能影响界面。
- Beautiful Chat 等时间线插件可能优先接管消息，建议同一时间只启用一个消息渲染插件。Chat Skins 不会自动停用其他插件。
- 替换后的消息不会自动继承全部原生操作；消息回退、专用文件处理等请切回原生。宿主搜索、文本选择和超长历史仍需专项回归。
- 组件运行异常由 Paseo 插件错误边界处理，不承诺所有渲染异常都会自动恢复原生行。

## 本地开发

使用 **Node.js 22.18+**（或 Node.js 24）及 npm。SDK 固定为 **0.11.2**，清单要求守护进程与连接的客户端均为 Paseo **>=0.11.2**。

```bash
npm ci --ignore-scripts
npm run check
npm pack --dry-run
```

`check` 仅执行严格 TypeScript 检查。本仓库不包含自动化测试源码和内部验证产物，类型检查不等于运行或视觉验收。最新设置页的语言切换布局、窄屏/移动端及深色外观仍需进一步视觉验证。

## 从 GitHub 安装

```bash
paseo plugin add git:devserra/paseo-chat-skins
```

也可以在 **Settings → Plugins → Plugin source** 中填写 `git:devserra/paseo-chat-skins`。这是直接从 Git 仓库安装，不代表已经通过 Paseo 插件市场审核。

## 本地安装

插件是受信任、无沙箱代码。先审查代码及依赖，未经宿主所有者同意，不应打开全局插件开关。

```bash
paseo plugin install /absolute/path/to/paseo-chat-skins
paseo plugin ls
```

打开插件操作菜单中的 **Chat Skins Settings**，选择样式即可自动保存并应用。选择 **Paseo 原生** 或点击 **恢复默认** 即可撤销皮肤；恢复外观不会重置所选语言。

修改源码后：

```bash
npm run check
paseo plugin reload paseo-chat-skins
```

不要为加载源码重启守护进程。包仍标记为 `private`，尚未发布至 npm 或 Paseo 插件市场。

## 项目结构

```text
index.client.tsx            客户端入口
index.server.ts             只注册宿主设置，不运行外部命令
paseo-plugin.json            插件标识与版本基线
client/register.tsx         扩展注册与资源清理
client/runtime.ts           每个安装实例独立的设置监听
client/settings/screen.tsx   精简配置页与可折叠示例预览
client/i18n/                 英文、中文、印地语页面和预览文案
client/skins/tokens.ts       结合宿主颜色的样式参数
client/timeline/model.ts     保守的源消息转换
client/timeline/markdown.ts  有限 Markdown 模型
client/timeline/row.tsx      React Native 消息渲染
shared/settings.ts          带版本的偏好设置定义
shared/skins.ts             样式目录
docs/architecture.md       架构与实现边界
```

运行时边界和待验证范围详见[架构说明](./docs/architecture.md)。

## 参考资料

[Paseo 插件接口](https://paseo.sh/docs/plugins/reference) · [SDK 接口](https://paseo.sh/docs/sdk/reference)

独立项目，与 OpenAI、Anthropic 无隶属关系。产品名称仅标识外观参考；插件不分发私人参考截图或原产品素材。

### 左侧栏的能力边界

公开主题配色可影响浅色侧栏；侧栏扩展接口只能增加入口，不能替换现有工作区树、间距与导航布局。本轮不改宿主侧栏，不注入私有 CSS，也不使用假侧栏覆盖真实工作区。
