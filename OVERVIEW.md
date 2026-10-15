# Chat Skins

Chat Skins adds Codex- and Claude Code-inspired message styles to Paseo, with configurable text size, spacing and tool/reasoning details. It changes presentation without rewriting conversations or changing the agent selected for a chat.

Paseo 0.11.2 or later is required on both the host and connected app. Open **Settings → Plugins → Chat Skins → ⋯ → Chat Skins Settings** and choose a style. New installations use Paseo native rendering. Settings and sample previews support English, Simplified Chinese and Hindi.

Supported messages include common Markdown and monospaced code blocks with copy actions. Supported shell commands and reasoning can be expanded; failed commands keep their error details visible. Rich attachments, unsupported content and specialized tools retain native rendering. Another message-rendering plugin may take precedence.

**Composer styling** is an optional, default-off desktop enhancement. Codex uses a rounded input and a compact effort slider with Fast control when actual native options are available. Claude Code uses a compact input with a combined model/Effort/Fast menu. Context details open deliberately rather than on hover. Controls retain their real provider behavior; unavailable or unverified features stay native. The composer adaptation targets the Paseo 0.11.2 desktop/web layout, requires a wide pane and fine pointer, and can fall back after host markup changes. It does not replace the sidebar or window layout. Light-mode macOS interfaces are visual references, not a promise of full pixel parity.

Appearance preferences are stored on the Paseo host and shared by its connected clients. The plugin reads supported chat content and public agent feature state to render the selected appearance. It does not send conversation data to external services. Choosing a skin does not change providers, models or permissions; explicitly using native configuration controls still applies the corresponding changes.

[English usage guide](./README.md) · [中文使用指南](./README.zh-CN.md) · [Created by serra](https://serra.dev)
