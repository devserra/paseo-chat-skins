# Chat Skins

**English** | [简体中文](./README.zh-CN.md)

Transform Paseo's chat interface with pixel-faithful Codex and Claude Code styles. Switch between chat skins with a single click.

> **v0.1: message skins, not a complete app clone.** The reference targets are macOS light-mode chat interfaces. Paseo still owns the composer, model/effort selectors, permissions, sidebar, and window layout. Full pixel parity is not claimed.

## What works

- A settings page under **Settings → Plugins → paseo-chat-skins → Actions → Chat Skins Settings**, also available through Command Center.
- **Paseo native**, **Codex**, and **Claude Code** choices. New installations default to native; no messages are intercepted until a skin is selected.
- Codex-style dark user bubbles; both skins render supported assistant messages, reasoning, and plain shell tool calls.
- Common Markdown: paragraphs, headings, simple lists, quotes, fences, inline code, emphasis, and HTTP(S) links. Code blocks and assistant messages have working copy buttons.
- Font size, density, default tool/reasoning expansion, and appearance reset (preserves the settings language). Failed shell calls always expose their error details.
- Real host-managed settings with revision checks. Saves update connected clients, survive reloads, and do not change providers, models, permissions, or message history.

The settings page supports **English, 简体中文, and हिन्दी (Hindi)**. Choose **Settings language** at the top; the page and sample preview update together. The menu/Command Center label always stays **Chat Skins Settings**. Language is host-scoped, defaults to English, and does not translate chats or change Paseo’s own language. The footer links **Created by serra** to [serra.dev](https://serra.dev).

## Boundaries and safe fallback

- Settings apply to **all clients connected to the same host**, not separately per device or user.
- A skin does not select the global application theme. Colors derive from the active Paseo theme. Light mode is the reference; dark mode is adaptive, not a reference-matched skin.
- Claude Code user messages retain Paseo's renderer because that reference state was not supplied.
- Recognized image/file markup, tables, footnotes, rich embedded content, unsupported tool types, provider-specific tool metadata, and oversized content remain host-rendered. Unknown Markdown constructs that are not excluded remain visible as text; this is not a full Markdown engine. Code is monospaced but not syntax-highlighted in v0.1.
- There are no replacement controls for models, effort, Fast mode, voice, or permission approval. No invented token counts or durations. There is no aggregate “N commands” group.
- Selecting **Paseo native**, a failed settings read, or disabling the plugin removes this plugin's transforms. Other enabled rendering plugins may still affect the chat.
- Other timeline plugins (including Beautiful Chat) can claim messages first. Use one message-rendering plugin at a time. Chat Skins never disables another plugin automatically.
- Replacement rows do not inherit every built-in message action. Use native mode for host-specific actions such as message rewind or specialized file handling. Host search, selection, and long-history behavior still require dedicated regression testing.
- Runtime component failures are handled by Paseo's plugin error boundary; this is not a promise that every rendering exception automatically restores the native row.

## Develop

Use **Node.js 22.18+** (or Node.js 24) and npm. The plugin SDK is pinned to **0.11.2**, and the manifest requires Paseo **>=0.11.2** on both the daemon and connected app.

```bash
npm ci --ignore-scripts
npm run check
npm pack --dry-run
```

`check` runs strict TypeScript only. Automated test source and internal verification artifacts are not included in this repository. Typechecking is not runtime or visual acceptance. The latest settings-language layout, compact/mobile behavior and dark appearance still require further visual validation.

## Install from GitHub

```bash
paseo plugin add git:devserra/paseo-chat-skins
```

You can also enter `git:devserra/paseo-chat-skins` in **Settings → Plugins → Plugin source**. This uses the Git repository directly; it is not a claim of Paseo registry approval.

## Install locally

Plugins are trusted, unsandboxed code. Review the source and dependencies, and enable plugins only with the host owner's approval.

```bash
paseo plugin install /absolute/path/to/paseo-chat-skins
paseo plugin ls
```

Open the plugin's **Actions** menu and choose **Chat Skins Settings**. Select a skin; saving and application are automatic. To undo, choose **Paseo native** or **Restore defaults**. Restoring appearance keeps the selected settings language.

After editing source:

```bash
npm run check
paseo plugin reload paseo-chat-skins
```

Do not restart the daemon just to reload plugin code. The package remains `private`; it has not been published to npm or the Paseo registry.

## Structure

```text
index.client.tsx            Client entry
index.server.ts             Registers host-owned settings only
paseo-plugin.json            Plugin identity and version floor
client/register.tsx         Contributions and cleanup
client/runtime.ts           Per-installation settings observation
client/settings/screen.tsx   Compact configuration and collapsible preview
client/i18n/                 English, Chinese and Hindi settings/preview copy
client/skins/tokens.ts       Skin-specific metrics using host colors
client/timeline/model.ts     Conservative source-to-row transforms
client/timeline/markdown.ts  Bounded Markdown model
client/timeline/row.tsx      React Native message rendering
shared/settings.ts          Versioned preference schema
shared/skins.ts             Skin catalog
docs/architecture.md       Architecture and implementation boundaries
```

See [architecture](./docs/architecture.md) for runtime boundaries and the remaining validation areas.

## References

[Paseo plugin reference](https://paseo.sh/docs/plugins/reference) · [SDK reference](https://paseo.sh/docs/sdk/reference)

Independent project, not affiliated with OpenAI or Anthropic. Names identify appearance references. No private reference screenshots or original product assets are distributed with the plugin.

### Sidebar scope

Public theme palettes can recolor the light sidebar, but plugin sidebar contributions only add rows. They cannot replace the existing workspace tree, layout, or navigation. This update does not modify the sidebar or inject private CSS.
