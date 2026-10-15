# Architecture / 架构

## Runtime boundaries

- `index.server.ts` registers the versioned `appearance` settings document. No file scanning, shell commands, provider mutations, or external services.
- `index.client.tsx` delegates registrations to `client/register.tsx`.
- `client/runtime.ts` observes the public `status.plugin_settings_changed` stream and reads the installation-scoped official settings RPC. A new subscription snapshot re-reads settings after reconnect. A generation counter ignores stale results and responses after cleanup.
- `client/agent-state.ts` uses public agent handles to read workspace identity and the actual `fast_mode` toggle value. Rendered Claude rows share reference-counted subscriptions only while composer styling is enabled. Removal, failed initial reads and disposal clear state; a late refresh cannot overwrite a newer subscription event. It never writes provider configuration.
- Defaults, invalid settings, and read errors do not intercept messages. A non-native selection registers transformers; skin changes replace registrations to invalidate the host's projection cache. Other preferences rerender through a per-installation external store.
- `shared/` is runtime neutral. Message rendering and settings use public SDK modules and React Native primitives, without private host imports. Browser-only declarations and the opt-in DOM/CSS adapter are isolated in `client/web.ts`; native platforms do not access the DOM.

## Rendering

`model.ts` returns `undefined` for unsupported source items, preserving native rendering. Supported messages are projected into a versioned Zod-validated row. Streaming uses the full accumulated source text and Paseo's `useRevealedText`; no chat records are rewritten. Code and assistant copy buttons copy the original plain text, not a reconstructed version.

Only plain shell tools without provider metadata are claimed. Unknown tools, edits, notifications, errors, and approval UI remain native. Failures show their supplied error details. No fabricated counts, durations, permissions or model actions.

The small Markdown implementation deliberately does not handle rich attachments, tables, HTML, footnotes or citation actions. Recognized rich syntax stays native. Unsupported syntax that is not excluded stays readable as source. Limits are 60,000 text characters and 40,000 shell-detail characters; larger items remain native rather than being truncated.

## Settings

`defineSettings` + `registerSettings` + `useSettings` supply validation, atomic persistence, revision conflicts and host push events. Saving requires the currently displayed revision. A failed save is shown and does not falsely apply the selected style. Appearance reset restores display defaults, including native rendering, while preserving the selected settings-page language. Invalid-document recovery resets the whole document to defaults, including English. Configurations are host-wide, not per-device. The UI uses host Settings components; preview content is explicitly illustrative and uses the production row component.

## Skin boundary

Fonts, spacing, bubble shapes and code corners are owned within replacement rows. Colors derive from the active host theme. The plugin does not modify global theme selection, provider configuration or application chrome. The separately enabled composer adapter can change verified composer geometry. Codex and Claude Code differ in spacing and code corners; Codex additionally transforms supported user messages. Claude user messages stay native pending a supplied reference.

## Compatibility and interactions

Other timeline transformers may win first; do not disable another plugin automatically. Native mode means this plugin contributes no transformations, not that every other plugin is disabled. Replacement rows can lose native-only actions, so native mode remains available. Exceptions in a rendered component go through the host's error boundary, not an invented automatic native fallback.

## Verification scope

The public repository provides strict TypeScript checking. Automated test source and internal QA records are not distributed. Typechecking alone does not prove installation, rendering fidelity, accessibility, streaming behavior, multi-client synchronization or platform compatibility. Latest settings-page visual checks, dark/compact/mobile layouts, long-history search and native-only message actions remain areas for further validation.

## Settings localization (schema v3)

`language` supports `en`, `zh-CN`, and `hi`, defaulting to English. The v1/v2 migration parses the existing document with the expanded schema, preserving skin/size/spacing/expansion fields and existing language, and adding `composerStyling: false`. Server initialization reads once to perform validation/migration even before the settings page opens; invalid data is retained.

`client/i18n/settings.ts` holds typed, key-complete page copy and stable choice IDs. `client/i18n/rows.ts` supplies labels only to the settings preview through an explicit React context. Live chat content and existing live control language are not translated. The menu title is a fixed `Chat Skins Settings` constant. Preview details use local disclosure state, separate from persisted preferences. All copies include the author link through Paseo's public `ExternalLink`; no raw HTML in the settings page.

## Experimental desktop composer adapter

`composerStyling` defaults to false. On web, `installComposerStyling` subscribes to the installation runtime. It binds the host ID from public settings/timeline surface props, checks the active workspace route, a desktop media query (900px, hover and fine pointer), and each composer width (620px). A newly loaded installation without a mounted surface stays inactive until host binding is available. A second host binding or multiple adapter instances in the same window fails closed.

Matching uses `message-input-root`, `message-input-attach-button` and `combined-model-selector` test IDs plus exact textarea/toolbar/group ancestry, derived from Paseo 0.11.2 source. These DOM details are not a stable public API. Unknown structures remain native. The adapter adds owned data attributes and scoped CSS, caches the native palette and sets scoped CSS variables; no native nodes are moved, replaced or cloned. It does not write chat input values, selection, React handlers, models or permissions. The optional effort range owns its own focus, pointer and keyboard listeners. The context-card adapter suppresses only the verified meter’s hover/focus auto-open events and uses its native focus-open path for explicit clicks and Escape for closing. Codex uses CSS order to move permissions left and model/effort right; DOM/Tab order stays native. Native send/queue/voice labels identify the black Codex primary control, while stop/recording state remains untouched. Claude Code keeps configuration below the input but visually places native attachment, dictation and send/stop actions inside it; attachments and other host extras are not reimplemented.

Mutation/resize observers refresh only relevant structures or widths, with requestAnimationFrame coalescing. Composition events defer style application while IME input is active; switching off can still clean up immediately. Cleanup removes listeners, observers, pending frames, style tags, owned attributes and variables, preserving later third-party changes. Disconnected nodes are cleaned too. Native mode, errors, unsupported sizes and disposal restore the original surface. This does not guarantee compatibility with unrelated DOM-modifying plugins.

Validation includes local DOM lifecycle fixtures and a clean-source client/server compilation without project node_modules. Real macOS composer checks are separate from simulated tests; backend send/stop, real IME composition, attachments, dark mode, mobile and future host versions require additional acceptance. Never infer runtime acceptance from TypeScript alone.

### Codex effort slider and compact metrics

Only a user click on the verified Codex effort trigger arms the adapter. It must discover exactly one newly opened `combobox-desktop-container`, match the current label to 2–8 unique known effort levels, and find no search input. All labels and target elements come from that native popup, not a hardcoded provider configuration. Unknown/disabled options fail closed. The current host route, model, effort, trigger, option identities, availability and single-instance state are revalidated before every commit. Range preview changes no configuration; release/change or keyboard Enter calls the chosen native option's click handler. Native loading, error, persistence and closing behavior remain authoritative. Escape cancels through the native overlay. The slider has no list-switch control. Unknown or invalidated options automatically leave the native menu intact. Disposal, resizing, skin/host changes and invalidated options remove the extra panel, listeners, markers and scoped variables.

The popup is 260 CSS px wide, with 24px track and 28px thumb. Focus indication is on the thumb for keyboard users, not a thick rail outline after a pointer click. Only the recognized Ultra option has the purple gradient. Codex composer padding is 12/14/10px with a 6px gap and no added editor margin; textarea height/auto-growth is not overridden. A black primary action is styled only when a native send/queue/voice action exists; no fake empty-state voice control, automatic send or permission selection is introduced.

### Fast and Context window interactions

The upper-left lightning in the effort popup reads `agent-feature-service_tier`'s current label. It delegates to the native trigger and selects the opposite option only if the opened menu contains exactly the recognized Normal/Fast pair. Extra tiers, disabled state, changed route/model, foreign popup or unknown labels cancel the shortcut and leave native controls available. No speed option is invented; blue is derived from the native label, not optimistic state. The duplicate native toolbar lightning is visually hidden and removed from Tab/accessibility order while the popup replacement is available, but its original handler/ref remains alive. Unsupported cases restore the native control. The visible popup remains mounted through Fast and effort operations. Native speed/effort pickers are hidden, inert, temporary action bridges; a failed save continues to show the native previous value. No Fast option is toggled during development without explicit approval.

For the wide desktop Context window meter, capture listeners intercept pointer entry and focus-only auto-opening only on the verified wrapper around `context-window-meter`. An explicit click focuses that existing wrapper with preventScroll and permits a native focusin-open action; synthetic Enter is avoided for pointer clicks because its deferred autofocus can move focus before the card is positioned. Keyboard Enter/Space remains native. Compact pressable meters and all other hover cards/tooltips are untouched. This does not replace, copy or cache the context-window data. Unloading removes these listeners. Real desktop validation of these latest interaction refinements remains pending if computer-use access is unavailable.

### Stable visual lifecycle

The visible picker is now plugin-owned, fixed-position and anchored to the existing effort trigger. It is created once on opening and is not removed/recreated after a successful choice. Every change reacquires/validates native options and invokes their real handler. Temporary host menu layers are hidden, inert and excluded from accessibility; their source buttons and nodes are never reparented. Inert is lifted only during the synchronous native option activation, then reapplied until that layer is removed. This keeps host autofocus/backdrops from moving or flashing the visible panel. Focus returns to the same owned range/button. Native labels remain the displayed authority; pending controls are disabled, and a failed/unconfirmed write resets to native state without a false success indicator. Unknown option sets fall back to native UI. Outside pointer activation or Escape closes the owned picker; native-mode, host/model changes and disposal also restore all layers and attributes.

Composer style ownership is incremental. A per-node property/attribute lease stores its original value and is updated only when necessary. Each refresh releases only unused leases, without removing the stylesheet or unmarking/re-measuring the input surface. Native palette measurement is cached except for actual theme changes. The toolbar reserves a 32px minimum height so the send action does not enlarge the surface on the first character. Range track painting uses an independent rail with transparent native WebKit/Firefox tracks to avoid residual accent borders.

Full access permission icons are red and Default permissions icons blue. Menu coloring is scoped to the verified mode picker opened from this composer and does not select any mode. Fast-on uses a solid lightning and six CSS-transform particles; animation is stopped when off, when the popup is removed, or under prefers-reduced-motion. No particle timer writes DOM per frame.

### Claude compact input and combined menu

A guarded CSS grid keeps native React nodes in their original tree: the editor paints a 14px-radius input box; attachment and action groups share its row; configuration remains in the footer. The textarea's value, selection, height and host auto-growth are not rewritten. Empty idle input gets no added send control. An enabled, icon-only native send action may receive a return-shaped glyph; stop, disabled and loading states retain their native icon. A verified noninteractive focus hint is hidden visually, not its keyboard shortcut. Unknown extra structure retains the conservative native arrangement.

The visible model trigger opens the native model popup. In the enhanced Claude footer, the duplicate effort trigger is visually hidden and removed from Tab/accessibility order; its original handler/ref remains available as the Effort submenu bridge. Unknown model-menu markup restores the native trigger. Only a popup containing official model search/row test IDs is enhanced. The actual model list/search/profile controls remain untouched; an owned footer adds Effort and Fast. Effort invokes the original selector and positions its native options beside the main menu; no provider levels, costs or recommendations are fabricated. Native model selection remains authoritative. Effort/Fast operations retain the main menu, and outside dismissal follows the native model popup.

For Claude's `fast_mode` toggle, a unique plugin-owned agent marker must match the active workspace and public SDK snapshot before exposing the custom switch. The marker is added only to enhanced Claude message rows; Codex and native rows are unchanged. Empty/new chats without a marker, multiple possible agents or unknown snapshots retain the native Fast entry. Codex-backed chats can instead use the verifiable `service_tier` Normal/Fast labels. The switch invokes the existing native trigger or real native menu option, disables while awaiting confirmation, and never displays an optimistic success. A failed/unconfirmed operation retains the actual previous state. No private React state is inspected. Unknown or unavailable controls are omitted rather than simulated.

Claude layout and menu delegation have DOM/SDK fixture coverage and isolated Chromium visual checks. These checks are not real Paseo/provider acceptance: actual keyboard/screen-reader traversal, provider round trips, IME, attachments and dark/narrow layouts still need dedicated live verification.


### Claude effort submenu metrics

The scoped native effort submenu resets inherited frame height/min-height and opposite insets, rather than retaining the generic 400px popup envelope. It uses a 228px width, content-driven height, 6px padding, 32px minimum option rows and 12px outer corners, constrained to the viewport. Shared option ancestry no longer flex-expands; model/profile menus are unaffected. Real option labels and callbacks remain native. The current effort label drives a quiet selected background; the existing native check uses blue. Pointer interaction does not show a browser-default green outline; keyboard interaction retains an inset blue focus ring. Palette, row/flow markers and focus-mode attributes are removed on close/off/unload, preserving native inline dimensions.


### Click-only context entry paths

Context activation filters both direct pointer/mouse entry and React's synthesized entry from the previous element's pointerout/mouseout relatedTarget. The latter is intercepted only when the destination is a verified owned desktop context trigger. A leave event with no destination is relayed to the previous control so its tooltip can still close, without synthesizing a new context entry. Unrequested focus-only opening remains suppressed; an explicit click permits the native focus-open action, closing invokes native Escape, and deliberate keyboard activation remains native. Compact meters, foreign composers and unrelated hover routes are left alone. Teardown removes every listener. No context contents, token figures or usage data are recreated.


### Persistent native context card

A click/keyboard intent binds only a newly created native context-details card to that trigger, host-owned composer and route. A pending intent expires if no card appears; existing foreign cards are not claimed or closed. The adapter keeps the original node and all handlers, never clones its contents or reopens it after removal.

The original trigger-leave close timer is suppressed across the trigger boundary, including moving into the card. While an owned card is pinned, the safe-zone document pointermove and window-exit paths are guarded at bubble phase after target/React handlers. This necessarily pauses later document-level pointermove observers while the card is open; local card controls, default text selection and target-level pointer handlers still run. Outside pointerdown releases the guard before the outside action proceeds. Internal card-button hover/leave is not intercepted. Escape, ring-toggle, outside activation, focus traversal out, route/off/unload and window blur/resize release the binding and invoke native close where possible. Native external-scroll dismissal remains authoritative; native removal releases the guard rather than remounting the card.
