# Chat Skins

Bring familiar Codex and Claude Code chat styles to Paseo, with customizable message appearance, code blocks, tool/reasoning details and reading preferences.

## Install and use

```bash
paseo plugin add devserra/chat-skins
```

Open **Settings → Plugins → Chat Skins → ⋯ → Chat Skins Settings**, then select **Codex** or **Claude Code**. New installations default to **Paseo native**. Changes save automatically and are shared by clients connected to the same host.

Enable **Composer styling** separately for the optional desktop input adaptation. Codex offers a rounded input and a guarded effort slider with Fast control. Claude Code offers a compact input and a combined model/Effort/Fast menu. Context details open deliberately rather than on hover. These controls invoke real native behavior; selecting a skin does not change the underlying agent, model or permissions.

Settings and previews support **English, Simplified Chinese and Hindi**. Paseo 0.11.2 or later is required on both the host and connected app. Experimental composer styling targets the 0.11.2 desktop/web layout and falls back on unsupported sizes or markup. Sidebar/window replacement and full pixel parity are not included. Unsupported rich content and tools remain native; another message-rendering plugin may take precedence.

See the [English guide](./README.md) or [中文使用指南](./README.zh-CN.md) for setup, settings, screenshots, updates and limitations. Marketplace installations use the reviewed registry revision, which may lag behind this repository.

Created by [serra](https://serra.dev). Chat Skins does not send conversation data to external services.
