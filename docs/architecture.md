# Architecture / 架构

## Runtime boundaries

- `index.server.ts` registers the versioned `appearance` settings document. No file scanning, shell commands, provider mutations, or external services.
- `index.client.tsx` delegates registrations to `client/register.tsx`.
- `client/runtime.ts` observes the public `status.plugin_settings_changed` stream and reads the installation-scoped official settings RPC. A new subscription snapshot re-reads settings after reconnect. A generation counter ignores stale results and responses after cleanup.
- Defaults, invalid settings, and read errors do not intercept messages. A non-native selection registers transformers; skin changes replace registrations to invalidate the host's projection cache. Other preferences rerender through a per-installation external store.
- `shared/` is runtime neutral. The client uses public SDK modules and React Native primitives, without DOM injection or private host imports.

## Rendering

`model.ts` returns `undefined` for unsupported source items, preserving native rendering. Supported messages are projected into a versioned Zod-validated row. Streaming uses the full accumulated source text and Paseo's `useRevealedText`; no chat records are rewritten. Code and assistant copy buttons copy the original plain text, not a reconstructed version.

Only plain shell tools without provider metadata are claimed. Unknown tools, edits, notifications, errors, and approval UI remain native. Failures show their supplied error details. No fabricated counts, durations, permissions or model actions.

The small Markdown implementation deliberately does not handle rich attachments, tables, HTML, footnotes or citation actions. Recognized rich syntax stays native. Unsupported syntax that is not excluded stays readable as source. Limits are 60,000 text characters and 40,000 shell-detail characters; larger items remain native rather than being truncated.

## Settings

`defineSettings` + `registerSettings` + `useSettings` supply validation, atomic persistence, revision conflicts and host push events. Saving requires the currently displayed revision. A failed save is shown and does not falsely apply the selected style. Appearance reset restores display defaults, including native rendering, while preserving the selected settings-page language. Invalid-document recovery resets the whole document to defaults, including English. Configurations are host-wide, not per-device. The UI uses host Settings components; preview content is explicitly illustrative and uses the production row component.

## Skin boundary

Fonts, spacing, bubble shapes and code corners are owned within replacement rows. Colors derive from the active host theme. The plugin does not modify global theme selection, composer geometry, provider configuration or application chrome. Codex and Claude Code differ in spacing and code corners; Codex additionally transforms supported user messages. Claude user messages stay native pending a supplied reference.

## Compatibility and interactions

Other timeline transformers may win first; do not disable another plugin automatically. Native mode means this plugin contributes no transformations, not that every other plugin is disabled. Replacement rows can lose native-only actions, so native mode remains available. Exceptions in a rendered component go through the host's error boundary, not an invented automatic native fallback.

## Verification scope

The public repository provides strict TypeScript checking. Automated test source and internal QA records are not distributed. Typechecking alone does not prove installation, rendering fidelity, accessibility, streaming behavior, multi-client synchronization or platform compatibility. Latest settings-page visual checks, dark/compact/mobile layouts, long-history search and native-only message actions remain areas for further validation.

## Settings localization (schema v2)

`language` supports `en`, `zh-CN`, and `hi`, defaulting to English. The v1 migration parses the existing document with the expanded schema, preserving skin/size/spacing/expansion fields. Server initialization reads once to perform validation/migration even before the settings page opens; invalid data is retained.

`client/i18n/settings.ts` holds typed, key-complete page copy and stable choice IDs. `client/i18n/rows.ts` supplies labels only to the settings preview through an explicit React context. Live chat content and existing live control language are not translated. The menu title is a fixed `Chat Skins Settings` constant. Preview details use local disclosure state, separate from persisted preferences. All copies include the author link through Paseo's public `ExternalLink`; no raw HTML or DOM injection.
