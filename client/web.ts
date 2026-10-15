import { Platform } from "react-native";
import type { SkinRuntime } from "./runtime";
import type { AgentAppearanceState } from "./agent-state";

/** Opt-in DOM adapter for Paseo 0.11.2's existing desktop composer.
 * Native inputs, React state and provider settings are not replaced.
 * The opt-in effort slider delegates a committed choice to a verified native menu option.
 * All browser-only declarations and CSS stay in this module. */
interface Style {
  getPropertyValue(name: string): string;
  getPropertyPriority(name: string): string;
  setProperty(name: string, value: string, priority?: string): void;
  removeProperty(name: string): void;
}
interface Element {
  nodeType: number; parentElement: Element | null; children: ArrayLike<Element>; isConnected: boolean;
  style: Style; textContent: string | null; value?: string;
  dispatchEvent(event: UIEvent): boolean;
  click(): void; focus(options?: { preventScroll?: boolean }): void;
  addEventListener(name: string, callback: Listener): void;
  removeEventListener(name: string, callback: Listener): void;
  matches(selector: string): boolean; closest(selector: string): Element | null;
  contains(node: Element): boolean;
  querySelector(selector: string): Element | null;
  querySelectorAll(selector: string): ArrayLike<Element>;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void; removeAttribute(name: string): void;
  appendChild(child: Element): void; remove(): void;
  getBoundingClientRect(): { width: number; height: number; left: number; right: number; top: number; bottom: number };
}
interface Media {
  matches: boolean;
  addEventListener(type: "change", callback: () => void): void;
  removeEventListener(type: "change", callback: () => void): void;
}
interface UIEvent {
  type: string; target: Element | null; relatedTarget?: Element | null; key?: string; detail?: number;
  pointerType?: string; pointerId?: number; clientX?: number; clientY?: number;
  preventDefault(): void; stopPropagation(): void; stopImmediatePropagation(): void;
}
type Listener = (event: UIEvent) => void;
interface Mutation { target: Element; type: string; addedNodes: ArrayLike<Element>; removedNodes: ArrayLike<Element> }
declare const document: {
  body: Element; head: Element; documentElement: Element; activeElement: Element | null;
  querySelectorAll(selector: string): ArrayLike<Element>; createElement(tag: string): Element; createElementNS(namespace: string, tag: string): Element;
  addEventListener(name: string, callback: Listener, capture?: boolean): void;
  removeEventListener(name: string, callback: Listener, capture?: boolean): void;
};
interface Coordinator { next: number; owners: Map<number, () => void> }
declare const window: {
  location: { pathname: string }; innerWidth: number; innerHeight: number;
  matchMedia(query: string): Media; getComputedStyle(element: Element): Style;
  setTimeout(callback: () => void, ms: number): number; clearTimeout(id: number): void;
  requestAnimationFrame(callback: () => void): number; cancelAnimationFrame(id: number): void;
  addEventListener(name: string, callback: Listener, capture?: boolean): void; removeEventListener(name: string, callback: Listener, capture?: boolean): void;
  __serraChatSkinsComposerV1?: Coordinator;
};
declare const MutationObserver: new (callback: (records: Mutation[]) => void) => {
  observe(target: Element, options: { subtree?: boolean; childList?: boolean; characterData?: boolean; attributes?: boolean; attributeFilter?: string[] }): void;
  disconnect(): void;
};
declare const KeyboardEvent: new (type: string, options: { key: string; bubbles: boolean; cancelable: boolean }) => UIEvent;
declare const FocusEvent: new (type: string, options: { bubbles: boolean }) => UIEvent;
declare const MouseEvent: new (type: string, options: { bubbles: boolean; cancelable: boolean; relatedTarget: null; clientX?: number; clientY?: number }) => UIEvent;
declare const PointerEvent: new (type: string, options: { bubbles: boolean; cancelable: boolean; relatedTarget: null; clientX?: number; clientY?: number; pointerType?: string; pointerId?: number }) => UIEvent;
declare const ResizeObserver: new (callback: () => void) => { observe(element: Element): void; disconnect(): void };

export type ComposerStatus = "off" | "waiting" | "active" | "unsupported" | "conflict";
export interface ComposerStyling {
  bindHost(id: string): void;
  watchAgent(id: string): () => void;
  getSnapshot(): ComposerStatus;
  subscribe(listener: () => void): () => void;
  dispose(): void;
}
const ROOT = '[data-testid="message-input-root"]';
const OWNER = "data-chat-skins-composer";
const ROLE = "data-chat-skins-composer-part";
const SKIN = "data-chat-skins-composer-skin";
const CONTROL = "data-chat-skins-control";
const CLAUDE_LAYOUT = "data-chat-skins-claude-layout";
const CLAUDE_PART = "data-chat-skins-claude-part";
const CLAUDE_MENU = "data-chat-skins-claude-model-menu";
const CLAUDE_FOOTER = "data-chat-skins-claude-menu-footer";
const CLAUDE_SUBMENU = "data-chat-skins-claude-effort-menu";
const CLAUDE_SUBLAYER = "data-chat-skins-claude-sub-layer";
const CLAUDE_EFFORT_SOURCE = "data-chat-skins-claude-effort-source";
const POPUP = '[data-testid="combobox-desktop-container"]';
const EFFORT_MENU = "data-chat-skins-effort-menu";
const FAST_SOURCE = "data-chat-skins-fast-source";
const FAST_MENU = "data-chat-skins-fast-menu";
const EFFORT_PANEL = "data-chat-skins-effort-panel";
const EFFORT_TRIGGER = '[data-testid="agent-thinking-selector"]';
const MODE_TRIGGER = '[data-testid="mode-control"]';
const PERMISSION_MENU = "data-chat-skins-permission-menu";
const MODEL_TRIGGER = '[data-testid="combined-model-selector"]';
const normalize = (value: string | null) => (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
const isDisabled = (element: Element) => element.getAttribute("aria-disabled") === "true" || element.getAttribute("disabled") !== null;
// Only known ordered effort labels. Unknown or ambiguous menus remain fully native.
const effortRanks = new Map([
  ["none", 0], ["minimal", 1], ["low", 2], ["medium", 3], ["high", 4], ["extra high", 5], ["max", 6], ["ultra", 7],
  ["无", 0], ["最低", 1], ["低", 2], ["中", 3], ["高", 4], ["极高", 5], ["最大", 6], ["超高", 7],
]);
const sliderCopy = {
  en: { label: "Thinking effort", help: "Drag to choose. Arrow keys adjust; Enter applies." },
  "zh-CN": { label: "思考强度", help: "拖动选择；方向键调整，回车确认。" },
  hi: { label: "विचार स्तर", help: "चुनने के लिए खींचें। तीर कुंजियों से बदलें; Enter से लागू करें।" },
};
interface EffortOption { button: Element; label: string; rank: number }
function readEffortOptions(popup: Element, trigger: Element): { options: EffortOption[]; selected: number } | null {
  if (popup.querySelector('input:not([data-chat-skins-effort-range]), textarea')) return null;
  const buttons = Array.from(popup.querySelectorAll('button, [role="button"]')).filter((button) => !button.closest(`[${EFFORT_PANEL}]`));
  if (buttons.length < 2 || buttons.length > 8) return null;
  const options: EffortOption[] = [];
  for (const button of buttons) {
    const label = (button.getAttribute("aria-label") ?? button.textContent ?? "").trim();
    const rank = effortRanks.get(normalize(label));
    if (rank === undefined || isDisabled(button) || options.some((option) => option.rank === rank)) return null;
    options.push({ button, label, rank });
  }
  options.sort((a, b) => a.rank - b.rank);
  const selected = options.findIndex((option) => normalize(option.label) === normalize(trigger.textContent));
  return selected < 0 ? null : { options, selected };
}
interface Parts {
  root: Element; surface: Element; editor: Element; toolbar: Element;
  left: Element; right: Element; controls: Element; input: Element;
}
function branch(parent: Element, leaf: Element): Element | null {
  let current: Element | null = leaf;
  while (current && current.parentElement !== parent) current = current.parentElement;
  return current;
}
/** Exact relationships fail closed when host markup changes. */
function identify(root: Element): Parts | null {
  const inputs = Array.from(root.querySelectorAll("textarea"));
  if (inputs.length !== 1 || root.querySelector('[data-testid="composer-readonly-content"]')) return null;
  const input = inputs[0]!;
  const attach = root.querySelector('[data-testid="message-input-attach-button"]');
  const model = root.querySelector('[data-testid="combined-model-selector"]');
  if (!attach || !model || input.closest(ROOT) !== root || root.getBoundingClientRect().width < 620) return null;
  const surface = branch(root, input);
  if (!surface || !surface.contains(attach) || !surface.contains(model)) return null;
  const editor = branch(surface, input);
  const toolbar = branch(surface, attach);
  if (!editor || !toolbar || toolbar === editor || !toolbar.contains(model) || toolbar.children.length !== 2) return null;
  const left = branch(toolbar, attach);
  if (!left || !left.contains(model)) return null;
  const right = Array.from(toolbar.children).find((child) => child !== left);
  const controls = branch(left, model);
  if (!right || !right.querySelector('button, [role="button"]') || !controls || controls.contains(attach)) return null;
  return { root, surface, editor, toolbar, left, right, controls, input };
}

function css(owner: string): string {
  const root = `[${OWNER}="${owner}"]`;
  const part = (name: string) => `${root} [${ROLE}="${name}"]`;
  const codex = `${root}[${SKIN}="codex"]`;
  const claude = `${root}[${SKIN}="claude-code"]`;
  const claudeInline = `${claude}[${CLAUDE_LAYOUT}="inline"]`;
  const menu = `[${EFFORT_MENU}="${owner}"]`;
  const panel = `${menu} [${EFFORT_PANEL}]`;
  const fastMenu = `[${FAST_MENU}="${owner}"]`;
  const permissions = `[${PERMISSION_MENU}="${owner}"]`;
  const claudeModel = `[${CLAUDE_MENU}="${owner}"][data-testid="combobox-desktop-container"]`;
  const claudeFooter = `[${CLAUDE_FOOTER}="${owner}"]`;
  const claudeEffort = `[${CLAUDE_SUBMENU}="${owner}"]`;
  const claudeOption = `${claudeEffort} [${CLAUDE_PART}="effort-option"]`;
  // No generic textarea/button selectors outside the verified composer root.
  return `
${part("surface")} { box-sizing: border-box; transition: none !important; }
${part("toolbar")} { margin-left: 0 !important; margin-right: 0 !important; align-items: center !important; gap: 8px !important; }
${part("left")} { min-width: 0 !important; flex: 1 1 auto !important; align-items: center !important; }
${part("right")} { flex-shrink: 0 !important; align-items: center !important; gap: 8px !important; }
${part("controls")} { min-width: 0 !important; flex: 1 1 auto !important; justify-content: flex-end !important; }
${part("input")} { padding-left: 0 !important; padding-right: 0 !important; }
${root} [data-testid="combined-model-selector"],
${root} [data-testid="agent-thinking-selector"],
${root} [data-testid="mode-control"] { border-radius: 12px !important; }
${root} [data-testid="message-input-attach-button"] { border-radius: 50% !important; }
${codex} [${ROLE}="surface"] { border-radius: 24px !important; padding: 12px 14px 10px !important; gap: 6px !important; background: var(--chat-skins-composer-paper) !important; box-shadow: 0 2px 10px rgb(0 0 0 / 4%); }
${codex} [${ROLE}="toolbar"] { min-height: 32px !important; }
${codex} [${ROLE}="controls"] { gap: 2px !important; }
/* Keep the host handler/ref alive, but remove its duplicate toolbar affordance
   and tab stop. A 1px anchor avoids breaking native popup measurement. */
${codex} [${FAST_SOURCE}="${owner}"], ${claudeInline} [${FAST_SOURCE}="${owner}"], ${claudeInline} [${CLAUDE_EFFORT_SOURCE}="${owner}"] { position: absolute !important; width: 1px !important; min-width: 0 !important; height: 1px !important; padding: 0 !important; margin: 0 !important; overflow: hidden !important; opacity: 0 !important; pointer-events: none !important; clip-path: inset(50%) !important; }
${fastMenu} { visibility: hidden !important; pointer-events: none !important; }
${codex} [data-chat-skins-fast="normal"], ${codex} [data-chat-skins-fast="normal"] * { color: #8b8b8b !important; }
${codex} [data-chat-skins-fast="fast"], ${codex} [data-chat-skins-fast="fast"] * { color: var(--chat-skins-composer-blue) !important; }
${codex} [data-chat-skins-fast] svg[stroke]:not([stroke="none"]), ${codex} [data-chat-skins-fast] svg [stroke]:not([stroke="none"]) { stroke: currentColor !important; }
${codex} [${CONTROL}="mode-group"] { order: -2; }
${codex} [${CONTROL}="model-group"] { order: 1; margin-left: auto !important; }
${codex} [${CONTROL}="effort-group"] { order: 2; }
${codex} [data-testid="combined-model-selector"], ${codex} [data-testid="combined-model-selector"] * { color: var(--chat-skins-composer-ink) !important; }
${codex} [data-testid="agent-thinking-selector"], ${codex} [data-testid="agent-thinking-selector"] * { color: var(--chat-skins-composer-blue) !important; }
${codex} [data-testid="mode-control"], ${codex} [data-testid="mode-control"] * { color: var(--chat-skins-composer-ink) !important; }
${codex} [data-testid="mode-control"][data-chat-skins-access="default"] svg,
${codex} [data-testid="mode-control"][data-chat-skins-access="default"] svg * { color: var(--chat-skins-composer-blue) !important; stroke: var(--chat-skins-composer-blue) !important; }
${permissions} [role="button"][aria-label="Full access" i] svg, ${permissions} button[aria-label="Full access" i] svg,
${permissions} [role="button"][aria-label="完全访问"] svg, ${permissions} [role="button"][aria-label="完全访问权限"] svg { color: var(--chat-skins-composer-warning) !important; stroke: var(--chat-skins-composer-warning) !important; }
${permissions} [role="button"][aria-label="Default permissions" i] svg, ${permissions} button[aria-label="Default permissions" i] svg,
${permissions} [role="button"][aria-label="默认权限"] svg { color: var(--chat-skins-composer-blue) !important; stroke: var(--chat-skins-composer-blue) !important; }
${permissions} svg [stroke]:not([stroke="none"]) { stroke: currentColor !important; }
${codex} [data-chat-skins-access="full"], ${codex} [data-chat-skins-access="full"] * { color: var(--chat-skins-composer-warning) !important; }
${codex} [data-testid="combined-model-selector"] svg, ${codex} [data-testid="agent-thinking-selector"] svg, ${codex} [data-testid="mode-control"] svg { color: inherit !important; }
${codex} [data-testid="combined-model-selector"] svg [fill]:not([fill="none"]) { fill: currentColor !important; }
${codex} [data-testid="agent-thinking-selector"] svg [stroke]:not([stroke="none"]), ${codex} [data-testid="mode-control"] svg [stroke]:not([stroke="none"]),
${codex} [data-testid="agent-thinking-selector"] svg[stroke]:not([stroke="none"]), ${codex} [data-testid="mode-control"] svg[stroke]:not([stroke="none"]) { stroke: currentColor !important; }
${codex} [data-chat-skins-action="send"], ${codex} [data-chat-skins-action="voice"] { background: var(--chat-skins-composer-primary) !important; color: var(--chat-skins-composer-primary-ink) !important; border-radius: 50% !important; width: 32px !important; height: 32px !important; min-width: 32px !important; }
${codex} [data-chat-skins-action] svg { color: var(--chat-skins-composer-primary-ink) !important; }
${codex} [data-chat-skins-action] svg[stroke]:not([stroke="none"]), ${codex} [data-chat-skins-action] svg [stroke]:not([stroke="none"]) { stroke: var(--chat-skins-composer-primary-ink) !important; }
${codex} [data-chat-skins-action] svg [fill]:not([fill="none"]) { fill: var(--chat-skins-composer-primary-ink) !important; }
${menu} { min-width: 0 !important; width: min(260px, calc(100vw - 32px)) !important; border-radius: 18px !important; }
${menu} > :not([${EFFORT_PANEL}]) { display: none !important; }
${menu}[data-chat-skins-persistent-picker] { position: fixed; z-index: 2147483000; box-sizing: border-box; background: var(--chat-skins-composer-paper); border: 1px solid var(--chat-skins-composer-border); box-shadow: 0 8px 28px rgb(0 0 0 / 10%); }
${panel}[data-saving] [data-part="fast"]:disabled { opacity: .55; }
${panel}[data-saving] [data-part="fast"][data-active="true"]:disabled { opacity: 1; }
${panel} { box-sizing: border-box; display: flex; flex-direction: column; gap: 3px; padding: 12px 12px 10px; position: relative; color: var(--chat-skins-composer-ink); font: 13px -apple-system, BlinkMacSystemFont, sans-serif; }
${panel} [data-part="value"] { text-align: center; color: var(--chat-skins-composer-blue); font-size: 14px; line-height: 20px; font-weight: 600; }
${panel} [data-part="model"] { text-align: center; color: var(--chat-skins-composer-ink); opacity: .64; line-height: 18px; }
${panel} [data-part="track"] { position: relative; margin: 8px 0 0; height: 30px; }
${panel} [data-part="rail"] { pointer-events: none; position: absolute; box-sizing: border-box; top: 3px; left: 0; width: 100%; height: 24px; border: 1px solid rgb(128 128 128 / 18%); border-radius: 14px; background: linear-gradient(to right, #3b82f6 var(--chat-skins-effort-fill), var(--chat-skins-composer-surface) var(--chat-skins-effort-fill)); background-clip: padding-box; }
${panel} input { appearance: none; -webkit-appearance: none; box-sizing: border-box; position: relative; z-index: 2; margin: 3px 0; padding: 0; width: 100%; height: 24px; outline: none !important; border: 0 !important; border-radius: 14px; background: transparent !important; box-shadow: none !important; cursor: pointer; }
${panel} input::-webkit-slider-runnable-track { appearance: none; -webkit-appearance: none; height: 24px; border: 0 !important; border-radius: 14px; background: transparent !important; box-shadow: none !important; }
${panel} input::-moz-range-track, ${panel} input::-moz-range-progress { height: 24px; border: 0 !important; border-radius: 14px; background: transparent !important; box-shadow: none !important; }
${panel} input::-webkit-slider-thumb { appearance: none; margin-top: -2px; width: 28px; height: 28px; border-radius: 50%; background: #fff; border: 1px solid #dedede; box-shadow: 0 1px 3px rgb(0 0 0 / 12%); position: relative; z-index: 2; }
${panel} input::-moz-range-thumb { width: 26px; height: 26px; border-radius: 50%; background: #fff; border: 1px solid #dedede; }
${panel} input:focus { outline: none !important; }
${panel}[data-keyboard] input:focus-visible::-webkit-slider-thumb { outline: 2px solid var(--chat-skins-composer-blue); outline-offset: 2px; }
${panel}[data-keyboard] input:focus-visible::-moz-range-thumb { outline: 2px solid var(--chat-skins-composer-blue); outline-offset: 2px; }
${panel}[data-ultra] [data-part="value"] { color: #9254e8; }
${panel}[data-ultra] [data-part="rail"] { background: radial-gradient(circle at 12% 40%, #ffffff88 0 1px, transparent 1.5px), radial-gradient(circle at 37% 65%, #ffffff88 0 1px, transparent 1.5px), radial-gradient(circle at 62% 35%, #ffffff88 0 1px, transparent 1.5px), linear-gradient(110deg, #4f46e5, #a66bff 48%, #9850ef 76%, #6550e8); }
${panel}[data-ultra] [data-part="ticks"] i { background: #ffffff80; transform: scale(.7); }
${panel}[data-ultra] [data-part="ticks"] i:nth-child(even) { transform: translateY(-4px) scale(.7); }
${panel} [data-part="ticks"] { pointer-events: none; position: absolute; inset: 0 13px; display: flex; justify-content: space-between; align-items: center; }
${panel} [data-part="ticks"] i { width: 3px; height: 3px; border-radius: 50%; background: rgb(128 128 128 / 45%); }
${panel} [data-part="fast"] { position: absolute; top: 9px; left: 9px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 6px; background: transparent; color: var(--chat-skins-composer-ink); opacity: .55; width: 24px; height: 24px; padding: 4px; cursor: pointer; }
${panel} [data-part="fast"][data-active="true"] { color: var(--chat-skins-composer-blue); opacity: 1; }
${panel} [data-part="fast"][data-active="true"] path { fill: currentColor; stroke: currentColor; }
${panel} [data-part="particles"] { display: none; pointer-events: none; position: absolute; top: 3px; left: 0; width: var(--chat-skins-effort-fill); height: 24px; overflow: hidden; border-radius: 14px; }
${panel}[data-fast-active] [data-part="particles"] { display: block; }
${panel}[data-fast-active] [data-part="particles"] i { position: absolute; inset: 0; animation: chat-skins-flow-${owner} 1.9s linear infinite; }
${panel} [data-part="particles"] i::before { content: ""; position: absolute; left: 0; top: var(--particle-y); width: 2px; height: 2px; border-radius: 50%; background: rgb(255 255 255 / 85%); }
${panel} [data-part="particles"] i:nth-child(1) { --particle-y: 25%; animation-delay: -.2s; }
${panel} [data-part="particles"] i:nth-child(2) { --particle-y: 65%; animation-delay: -.8s; animation-duration: 2.3s; }
${panel} [data-part="particles"] i:nth-child(3) { --particle-y: 42%; animation-delay: -1.4s; animation-duration: 1.7s; }
${panel} [data-part="particles"] i:nth-child(4) { --particle-y: 78%; animation-delay: -.4s; }
${panel} [data-part="particles"] i:nth-child(5) { --particle-y: 18%; animation-delay: -1.2s; animation-duration: 2.3s; }
${panel} [data-part="particles"] i:nth-child(6) { --particle-y: 52%; animation-delay: -1.7s; }
@keyframes chat-skins-flow-${owner} { 0% { transform: translateX(-4%); opacity: 0; } 12%, 78% { opacity: .9; } 100% { transform: translateX(104%); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { ${panel}[data-fast-active] [data-part="particles"] { display: none; } ${panel}[data-fast-active] [data-part="particles"] i { animation: none; } }
${panel} [data-part="fast"]:disabled { cursor: default; opacity: .35; }
${panel} [data-part="fast"]:hover { opacity: 1; background: rgb(128 128 128 / 10%); }
${panel} [data-part="fast"]:focus-visible { outline: 2px solid var(--chat-skins-composer-blue); outline-offset: 2px; }
${codex} [${ROLE}="editor"] { margin-bottom: 0 !important; }
${claude} [${ROLE}="surface"] { background: transparent !important; border-width: 0 !important; border-radius: 0 !important; padding: 0 !important; box-shadow: none !important; }
${claude} [${ROLE}="editor"] { box-sizing: border-box; border: 1px solid var(--chat-skins-composer-border) !important; border-radius: 14px !important; background: var(--chat-skins-composer-surface) !important; padding: 12px 14px !important; }
${claude} [${ROLE}="toolbar"] { margin-top: 6px !important; padding: 0 4px !important; }
/* A grid positions existing elements without moving them out of React's tree.
   The editor paints the input box; attachments/actions share its grid row. */
${claudeInline} [${ROLE}="surface"] { display: grid !important; position: relative !important; grid-template-columns: 42px minmax(0, 1fr) auto; grid-template-rows: auto auto auto; gap: 0 !important; }
${claudeInline} [${ROLE}="editor"] { grid-row: 2; grid-column: 1 / -1; min-width: 0 !important; padding: 0 112px 0 44px !important; border-radius: 14px !important; background: var(--chat-skins-composer-paper) !important; box-shadow: 0 2px 12px rgb(0 0 0 / 4%); }
${claudeInline} [${ROLE}="input"] { box-sizing: border-box !important; padding-top: 12px !important; padding-bottom: 12px !important; }
${claudeInline} [${ROLE}="toolbar"], ${claudeInline} [${ROLE}="left"] { display: contents !important; }
${claudeInline} [${CLAUDE_PART}="attachments"] { grid-row: 1; grid-column: 1 / -1; margin-bottom: 6px; }
${claudeInline} [${CLAUDE_PART}="attach"] { grid-row: 2; grid-column: 1; align-self: center; justify-self: center; z-index: 1; margin: 0 !important; }
${claudeInline} [${ROLE}="right"] { position: static !important; grid-row: 2; grid-column: 3; align-self: center; justify-self: end; gap: 6px !important; min-height: 28px; margin: 0 12px 0 0 !important; z-index: 1; }
${claudeInline} [${CLAUDE_PART}="context"] { position: absolute !important; right: 10px !important; bottom: 2px !important; margin: 0 !important; }
${claudeInline} [${CLAUDE_PART}="primary"] { order: 2; }
${claudeInline} [${CLAUDE_PART}="dictation"] { order: 3; }
${claudeInline} [${ROLE}="controls"] { grid-row: 3; grid-column: 1 / -1; display: flex !important; flex-direction: row !important; align-items: center !important; min-height: 32px !important; min-width: 0 !important; gap: 2px !important; margin-top: 6px !important; padding: 0 40px 0 4px !important; }
${claudeInline} [${CONTROL}="mode-group"] { order: 0; }
${claudeInline} [${CONTROL}="model-group"] { order: 10; margin-left: auto !important; }
${claudeInline} [${CONTROL}="effort-group"] { order: 11; }
${claudeInline} [${CONTROL}="fast-group"] { order: 12; }
${claudeInline} [data-testid="combined-model-selector"], ${claudeInline} [data-testid="agent-thinking-selector"] { padding-left: 4px !important; padding-right: 4px !important; border-radius: 7px !important; }
${claudeInline} [data-testid="combined-model-selector"] *, ${claudeInline} [data-testid="agent-thinking-selector"] * { color: var(--chat-skins-composer-ink) !important; }
${claudeInline} [data-testid="agent-thinking-selector"] { opacity: .7; }
${claudeInline} [${CLAUDE_PART}="glyph"], ${claudeInline} [${CLAUDE_PART}="focus-hint"] { display: none !important; }
${claudeInline}[${CLAUDE_MENU}="${owner}"] [${CONTROL}="model-group"], ${claudeInline}[${CLAUDE_MENU}="${owner}"] [${CONTROL}="effort-group"] { background: var(--chat-skins-composer-surface); border-radius: 7px; }
${claudeModel} { border-radius: 12px !important; }
${claudeFooter} { flex: 0 0 auto; padding: 4px 8px 8px; border-top: 1px solid var(--chat-skins-composer-border); background: var(--chat-skins-composer-paper); color: var(--chat-skins-composer-ink); font: 14px -apple-system, BlinkMacSystemFont, sans-serif; }
${claudeFooter} button { appearance: none; display: flex; align-items: center; gap: 8px; width: 100%; min-height: 36px; padding: 6px 8px; border: 0; border-radius: 7px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
${claudeFooter} button[hidden] { display: none; }
${claudeFooter} button:hover { background: var(--chat-skins-composer-surface); }
${claudeFooter} button:focus-visible { outline: 2px solid var(--chat-skins-composer-blue); outline-offset: -2px; }
${claudeFooter} button:disabled { cursor: default; opacity: .6; }
${claudeFooter} [data-part="effort-value"] { margin-left: auto; opacity: .65; }
${claudeFooter} [data-part="switch-track"] { position: relative; margin-left: auto; width: 28px; height: 16px; border-radius: 9px; background: #c7c7c7; }
${claudeFooter} [data-part="switch-track"] i { position: absolute; left: 2px; top: 2px; width: 12px; height: 12px; border-radius: 50%; background: white; }
${claudeFooter} [aria-checked="true"] [data-part="switch-track"] { background: var(--chat-skins-composer-blue); }
${claudeFooter} [aria-checked="true"] [data-part="switch-track"] i { transform: translateX(12px); }
${claudeEffort} [${CLAUDE_PART}="glyph"] { display: none !important; }
[${CLAUDE_SUBLAYER}="${owner}"] { pointer-events: none !important; }
/* The host floating frame can retain a fixed/minimum height or opposite inset.
   Reset the frame, not the native option handlers, so the menu hugs its rows. */
${claudeEffort} { pointer-events: auto !important; position: fixed !important; transform: none !important; left: var(--chat-skins-sub-left) !important; top: var(--chat-skins-sub-top) !important; right: auto !important; bottom: auto !important; box-sizing: border-box !important; width: 228px !important; min-width: 0 !important; max-width: calc(100vw - 16px) !important; height: auto !important; min-height: 0 !important; max-height: calc(100vh - 16px) !important; flex: 0 1 auto !important; padding: 6px !important; border: 1px solid var(--chat-skins-composer-border) !important; border-radius: 12px !important; background: var(--chat-skins-composer-paper) !important; color: var(--chat-skins-composer-ink); box-shadow: 0 6px 22px rgb(0 0 0 / 12%) !important; overflow: hidden; }
${claudeEffort} [${CLAUDE_PART}="effort-flow"] { flex: 0 1 auto !important; height: auto !important; min-height: 0 !important; padding: 0 !important; }
${claudeOption} { box-sizing: border-box !important; min-height: 32px !important; height: auto !important; flex: 0 0 auto !important; padding: 6px 10px !important; margin: 0 !important; gap: 8px !important; border: 0 !important; border-radius: 7px !important; color: var(--chat-skins-composer-ink) !important; font: 14px/20px -apple-system, BlinkMacSystemFont, sans-serif !important; outline: none !important; }
${claudeOption} * { font-size: inherit !important; line-height: inherit !important; }
${claudeOption}:hover:not([aria-disabled="true"]):not(:disabled), ${claudeOption}[data-chat-skins-selected="true"] { background: var(--chat-skins-composer-surface) !important; }
${claudeOption}[data-chat-skins-selected="true"] svg { color: var(--chat-skins-composer-blue) !important; stroke: var(--chat-skins-composer-blue) !important; }
${claudeOption}[data-chat-skins-selected="true"] svg [stroke]:not([stroke="none"]) { stroke: currentColor !important; }
${claudeEffort}[data-chat-skins-sub-keyboard="true"] [${CLAUDE_PART}="effort-option"]:focus-visible { outline: 2px solid var(--chat-skins-composer-blue) !important; outline-offset: -2px !important; }

${claudeInline} [data-chat-skins-action="send"] { background: transparent !important; color: var(--chat-skins-composer-ink) !important; width: 28px !important; height: 28px !important; min-width: 28px !important; }
${claudeInline} [data-chat-skins-action="send"] svg, ${claudeInline} [data-chat-skins-action="send"] svg * { color: var(--chat-skins-composer-ink) !important; }
${claudeInline} [data-chat-skins-action="send"] svg[stroke]:not([stroke="none"]), ${claudeInline} [data-chat-skins-action="send"] svg [stroke]:not([stroke="none"]) { stroke: currentColor !important; }
${claudeInline} [data-chat-skins-claude-send-icon="return"] { position: relative !important; }
${claudeInline} [data-chat-skins-claude-send-icon="return"] svg { visibility: hidden; }
${claudeInline} [data-chat-skins-claude-send-icon="return"]::after { content: ""; position: absolute; left: 4px; top: 4px; width: 20px; height: 20px; pointer-events: none; background: var(--chat-skins-composer-ink); -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 6v7H6m0 0 4-4m-4 4 4 4' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 6v7H6m0 0 4-4m-4 4 4 4' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat; }


${root} [data-testid="combined-model-selector"]:focus-visible,
${root} [data-testid="agent-thinking-selector"]:focus-visible,
${root} [data-testid="mode-control"]:focus-visible,
${root} [data-testid="message-input-attach-button"]:focus-visible { outline: 2px solid var(--chat-skins-composer-ink); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { ${part("surface")} { transition: none !important; } }
`;
}

const FAST_TRIGGER = '[data-testid="agent-feature-service_tier"]';
const CONTEXT_METER = '[data-testid="context-window-meter"]';
function fastState(trigger: Element | null): "normal" | "fast" | null {
  const label = normalize(trigger?.getAttribute("aria-label") ?? null);
  if (["speed: normal", "速度: 正常", "速度：正常"].includes(label)) return "normal";
  if (["speed: fast", "速度: 快速", "速度：快速"].includes(label)) return "fast";
  return null;
}
/** Color only the permission menu opened from this verified Codex composer. */
function createPermissionMenuStyling(owner: string, enabled: () => boolean, schedule: () => void) {
  type Pending = { root: Element; trigger: Element; path: string; existing: Set<Element>; until: number };
  let pending: Pending | null = null;
  let popup: Element | null = null;
  let restores: (() => void)[] = [];
  const clear = () => {
    if (popup?.getAttribute(PERMISSION_MENU) === owner) popup.removeAttribute(PERMISSION_MENU);
    for (const restore of restores) restore(); restores = []; popup = null; pending = null;
  };
  const click: Listener = (event) => {
    const trigger = event.target?.closest?.(MODE_TRIGGER); if (!trigger) return;
    clear();
    const root = trigger.closest(ROOT);
    if (!enabled() || !root || root.getAttribute(OWNER) !== owner || isDisabled(trigger)) return;
    pending = { root, trigger, path: window.location.pathname, existing: new Set(Array.from(document.querySelectorAll(POPUP))), until: Date.now() + 1500 }; schedule();
  };
  document.addEventListener("click", click, true);
  return {
    clear,
    update() {
      const p = pending; if (!p) return;
      if (!enabled() || !p.root.isConnected || !p.trigger.isConnected || p.root.getAttribute(OWNER) !== owner || window.location.pathname !== p.path) { clear(); return; }
      if (popup) { if (!popup.isConnected) clear(); return; }
      if (Date.now() > p.until) { clear(); return; }
      const candidates = Array.from(document.querySelectorAll(POPUP)).filter((element) => !p.existing.has(element));
      if (!candidates.length) return;
      if (candidates.length !== 1) { clear(); return; }
      const menu = candidates[0]!;
      const labels = Array.from(menu.querySelectorAll('button, [role="button"]')).map((button) => normalize(button.getAttribute("aria-label") ?? button.textContent));
      if (!labels.some((label) => ["full access", "完全访问", "完全访问权限"].includes(label)) ||
          !labels.some((label) => ["default permissions", "默认权限"].includes(label))) { clear(); return; }
      if (menu.getAttribute(PERMISSION_MENU) !== null) { clear(); return; }
      const colors = window.getComputedStyle(p.root);
      for (const name of ["--chat-skins-composer-blue", "--chat-skins-composer-warning"]) {
        const previous = menu.style.getPropertyValue(name), priority = menu.style.getPropertyPriority(name), value = colors.getPropertyValue(name);
        menu.style.setProperty(name, value);
        restores.push(() => { if (menu.style.getPropertyValue(name) === value) { if (previous) menu.style.setProperty(name, previous, priority); else menu.style.removeProperty(name); } });
      }
      popup = menu; popup.setAttribute(PERMISSION_MENU, owner);
    },
    dispose() { clear(); document.removeEventListener("click", click, true); },
  };
}

/** Keep the real host card mounted after deliberate activation. Never clone its
 * data/controls, poll its state, or repeatedly reopen a card that has closed. */
function installContextClickOnly(owner: string) {
  const DETAILS = '[data-testid="context-window-details"]';
  const CARD_OWNER = "data-chat-skins-context-card";
  type Pinned = { trigger: Element; root: Element; path: string; existing: Set<Element>; card: Element | null; previousMark: string | null; timer: number | null };
  let pinned: Pinned | null = null, invoking = false, openingByClick = false;
  const triggerFor = (target: Element | null) => {
    if (!target?.closest) return null;
    const button = target.closest('button, [role="button"]');
    const meter = button?.querySelector(CONTEXT_METER);
    // Compact/native uses its own pressable meter. Leave that path untouched.
    const root = meter?.closest(ROOT);
    return button && meter && meter !== button && root?.getAttribute(OWNER) === owner ? button : null;
  };
  const inside = (target: Element | null | undefined, p = pinned) => !!p && !!target &&
    (p.trigger.contains(target) || !!p.card?.contains(target));
  const release = () => {
    const p = pinned; pinned = null;
    if (!p) return;
    if (p.timer !== null) window.clearTimeout(p.timer);
    if (p.card?.getAttribute(CARD_OWNER) === owner) {
      if (p.previousMark === null) p.card.removeAttribute(CARD_OWNER);
      else p.card.setAttribute(CARD_OWNER, p.previousMark);
    }
  };
  const nativeKey = (trigger: Element, key: string) => {
    invoking = true;
    try { trigger.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })); }
    finally { invoking = false; }
  };
  const close = () => {
    const p = pinned; release();
    if (p?.trigger.isConnected) nativeKey(p.trigger, "Escape");
  };
  const sync = () => {
    const p = pinned; if (!p) return;
    if (!p.trigger.isConnected || p.root.getAttribute(OWNER) !== owner || window.location.pathname !== p.path) { close(); return; }
    if (p.card) { if (!p.card.isConnected) release(); return; }
    const candidates = Array.from(document.querySelectorAll(DETAILS)).filter((card) => !p.existing.has(card));
    if (candidates.length > 1) { release(); return; }
    if (candidates[0]) {
      p.card = candidates[0]; p.previousMark = p.card.getAttribute(CARD_OWNER);
      if (p.previousMark !== null) { release(); return; }
      p.card.setAttribute(CARD_OWNER, owner);
      if (p.timer !== null) window.clearTimeout(p.timer); p.timer = null;
    }
  };
  const arm = (trigger: Element) => {
    sync(); if (pinned?.trigger === trigger) return;
    if (pinned) close();
    const root = trigger.closest(ROOT); if (!root) return;
    const p: Pinned = { trigger, root, path: window.location.pathname, existing: new Set(Array.from(document.querySelectorAll(DETAILS))), card: null, previousMark: null, timer: null };
    pinned = p;
    p.timer = window.setTimeout(() => { if (pinned === p && !p.card) release(); }, 1500);
  };
  const hover: Listener = (event) => { if (triggerFor(event.target)) event.stopPropagation(); };
  const enterFromElsewhere: Listener = (event) => {
    const next = triggerFor(event.relatedTarget ?? null);
    if (!next || next === triggerFor(event.target)) return;
    // React can synthesize entry from the previous node's pointerout.
    event.stopPropagation();
    if (!event.target) return;
    const options = { bubbles: true, cancelable: true, relatedTarget: null, clientX: event.clientX ?? 0, clientY: event.clientY ?? 0 };
    if (event.type === "pointerout" && typeof PointerEvent !== "undefined") {
      event.target.dispatchEvent(new PointerEvent("pointerout", { ...options, pointerType: event.pointerType ?? "mouse", pointerId: event.pointerId ?? 0 }));
    } else if (typeof MouseEvent !== "undefined") event.target.dispatchEvent(new MouseEvent(event.type, options));
  };
  const leavePinned: Listener = (event) => {
    sync();
    // The trigger's onPointerLeave starts a close timer even when entering
    // the card. Keep internal card-button hover/leave handlers untouched.
    if (pinned && event.target && pinned.trigger.contains(event.target) &&
        (!event.relatedTarget || !pinned.trigger.contains(event.relatedTarget))) event.stopPropagation();
  };
  // The host's safe-zone tracker listens at document bubble. Guard there,
  // AFTER target/React handlers, not at capture: card controls, text selection
  // and local pointer handlers keep working. Outside pointerdown closes first.
  const pointerMoved: Listener = (event) => { sync(); if (pinned?.card) event.stopImmediatePropagation(); };
  const leftWindow: Listener = (event) => { sync(); if (pinned?.card && event.relatedTarget === null) event.stopImmediatePropagation(); };
  const focus: Listener = (event) => {
    const trigger = triggerFor(event.target);
    if (trigger && !(openingByClick && pinned?.trigger === trigger)) event.stopPropagation();
  };
  const focusLeft: Listener = (event) => {
    sync(); if (!inside(event.target)) return;
    if (event.relatedTarget && !inside(event.relatedTarget)) close();
    else if (!event.relatedTarget) event.stopPropagation(); // e.g. a Refresh button becomes disabled
  };
  const outside: Listener = (event) => { sync(); if (pinned && !inside(event.target)) close(); };
  const click: Listener = (event) => {
    const trigger = triggerFor(event.target); if (!trigger) return;
    sync();
    if (pinned?.trigger === trigger) { close(); return; }
    arm(trigger);
    // Use the host's real focus-open path only for this explicit click. Unlike
    // synthetic Enter, it does not schedule autofocus into an unpositioned card
    // (which can scroll the page and immediately close the native HoverCard).
    openingByClick = true;
    try { trigger.focus({ preventScroll: true }); trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true })); }
    finally { openingByClick = false; }
    sync();
  };
  const key: Listener = (event) => {
    if (invoking) return;
    sync();
    if (event.key === "Escape" && pinned && inside(event.target)) { event.preventDefault(); event.stopPropagation(); close(); return; }
    const trigger = triggerFor(event.target);
    if (trigger && ["Enter", " ", "ArrowDown"].includes(event.key ?? "")) arm(trigger);
  };
  const observer = new MutationObserver(sync);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: [OWNER, "data-testid"] });
  const bindings: [string, Listener, boolean][] = [
    ...["pointerover", "pointerenter", "mouseover", "mouseenter"].map((name): [string, Listener, boolean] => [name, hover, true]),
    ...["pointerout", "mouseout"].map((name): [string, Listener, boolean] => [name, enterFromElsewhere, true]),
    ...["pointerout", "mouseout", "pointerleave", "mouseleave"].map((name): [string, Listener, boolean] => [name, leavePinned, true]),
    ["pointermove", pointerMoved, false], ["focusin", focus, true], ["focusout", focusLeft, true],
    ["pointerdown", outside, true], ["click", click, true], ["keydown", key, true],
  ];
  for (const [name, handler, capture] of bindings) document.addEventListener(name, handler, capture);
  window.addEventListener("pointerout", leftWindow);
  for (const name of ["blur", "resize", "popstate", "hashchange"]) window.addEventListener(name, close);
  return () => {
    close(); observer.disconnect();
    for (const [name, handler, capture] of bindings) document.removeEventListener(name, handler, capture);
    window.removeEventListener("pointerout", leftWindow);
    for (const name of ["blur", "resize", "popstate", "hashchange"]) window.removeEventListener(name, close);
  };
}

/** The visible picker is plugin-owned and persistent. Native menus are short-
 * lived, hidden action bridges only; their close/open cycle never remounts UI. */
function createPersistentPicker(owner: string, language: () => "en" | "zh-CN" | "hi", enabled: () => boolean, schedule: () => void) {
  type Context = { root: Element; trigger: Element; path: string; model: string; existing: Set<Element>; until: number };
  type NativeMenu = { popup: Element; layer: Element; trigger: Element; kind: "effort" | "fast"; used: boolean; restore(): void };
  type Operation = { kind: "effort" | "fast"; target: string; trigger: Element; phase: "menu" | "applied"; existing: Set<Element>; menu?: NativeMenu };
  type View = { popup: Element; panel: Element; range: Element; bolt: Element | null; options: EffortOption[]; confirmed: string; preview(index: number): void; dispose(): void };
  let context: Context | null = null, view: View | null = null, operation: Operation | null = null;
  let timer: number | null = null, invoking = false, restoringFocus = false;
  let lastFocus: Element | null = null, ignoreClick: Element | null = null;
  const menus = new Set<NativeMenu>(), nativeFallbacks = new WeakSet<Element>();
  const stopTimer = () => { if (timer !== null) window.clearTimeout(timer); timer = null; };
  const valid = (c: Context) => enabled() && c.root.isConnected && c.trigger.isConnected && !isDisabled(c.trigger) &&
    c.root.getAttribute(OWNER) === owner && c.root.getAttribute(SKIN) === "codex" && window.location.pathname === c.path &&
    normalize(c.root.querySelector(MODEL_TRIGGER)?.textContent ?? "") === c.model;
  const restoreFocus = () => {
    if (!view || restoringFocus) return;
    const target = lastFocus?.isConnected ? lastFocus : view.range;
    restoringFocus = true; try { target.focus({ preventScroll: true }); } finally { restoringFocus = false; }
  };
  const closeNative = () => {
    for (const menu of menus) if (menu.popup.isConnected) {
      menu.layer.removeAttribute("inert");
      menu.popup.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    }
  };
  const clear = (focusTrigger = false, keepNative = false) => {
    const trigger = context?.trigger;
    context = null; operation = null; ignoreClick = null; stopTimer();
    const oldView = view; view = null; lastFocus = null;
    if (!keepNative) closeNative();
    oldView?.dispose();
    for (const menu of menus) menu.restore(); menus.clear();
    if (focusTrigger && trigger?.isConnected) trigger.focus({ preventScroll: true });
  };
  const nativeFallback = () => {
    const speed = context?.root.querySelector(FAST_TRIGGER); if (speed) nativeFallbacks.add(speed);
    clear(false, true); schedule();
  };
  const mask = (popup: Element, trigger: Element, kind: NativeMenu["kind"]): NativeMenu => {
    const parent = popup.parentElement;
    const layer = parent && parent !== document.body && !parent.contains(context!.root) && parent.querySelectorAll(POPUP).length === 1 ? parent : popup;
    const previous = [FAST_MENU, "aria-hidden", "inert"].map((name) => [name, layer.getAttribute(name)] as const);
    layer.setAttribute(FAST_MENU, owner); layer.setAttribute("aria-hidden", "true"); layer.setAttribute("inert", "");
    const record: NativeMenu = { popup, layer, trigger, kind, used: false, restore: () => {
      for (const [name, value] of previous) {
        const owned = name === FAST_MENU ? owner : name === "aria-hidden" ? "true" : "";
        if (layer.getAttribute(name) !== owned) continue;
        if (value === null) layer.removeAttribute(name); else layer.setAttribute(name, value);
      }
    } };
    menus.add(record); return record;
  };
  const nativeClick = (menu: NativeMenu, button: Element) => {
    menu.used = true; menu.layer.removeAttribute("inert");
    try { button.click(); } finally { if (menu.layer.isConnected) menu.layer.setAttribute("inert", ""); }
    restoreFocus();
  };
  const position = () => {
    if (!context || !view) return;
    const anchor = context.trigger.getBoundingClientRect(), bounds = view.popup.getBoundingClientRect();
    const width = bounds.width || 260, height = bounds.height || 108;
    view.popup.style.setProperty("left", `${Math.max(8, Math.min(window.innerWidth - width - 8, anchor.right - width))}px`);
    const above = anchor.top - height - 8;
    view.popup.style.setProperty("top", `${above >= 8 ? above : Math.min(window.innerHeight - height - 8, anchor.bottom + 8)}px`);
  };
  const render = (resetPreview = false) => {
    if (!context || !view) return;
    const palette = window.getComputedStyle(context.root);
    for (const name of ["surface", "ink", "blue", "paper", "border"]) {
      const key = `--chat-skins-composer-${name}`, value = palette.getPropertyValue(key);
      if (view.popup.style.getPropertyValue(key) !== value) view.popup.style.setProperty(key, value);
    }
    const actual = normalize(context.trigger.textContent);
    const index = view.options.findIndex((option) => normalize(option.label) === actual);
    if (index < 0) { nativeFallback(); return; }
    if (resetPreview || actual !== view.confirmed) { view.preview(index); view.confirmed = actual; }
    if (operation) { view.panel.setAttribute("aria-busy", "true"); view.panel.setAttribute("data-saving", ""); view.range.setAttribute("disabled", ""); }
    else { view.panel.removeAttribute("aria-busy"); view.panel.removeAttribute("data-saving"); view.range.removeAttribute("disabled"); }
    const source = context.root.querySelector(FAST_TRIGGER), speed = fastState(source);
    if (speed === "fast") view.panel.setAttribute("data-fast-active", ""); else view.panel.removeAttribute("data-fast-active");
    if (view.bolt) {
      view.bolt.setAttribute("data-active", String(speed === "fast")); view.bolt.setAttribute("aria-pressed", String(speed === "fast"));
      view.bolt.setAttribute("aria-label", source?.getAttribute("aria-label") ?? "Speed");
      if (!speed) view.bolt.setAttribute("hidden", ""); else view.bolt.removeAttribute("hidden");
      if (operation || !source || !speed || isDisabled(source)) view.bolt.setAttribute("disabled", ""); else view.bolt.removeAttribute("disabled");
    }
    position();
  };
  const perform = (op: Operation, menu: NativeMenu) => {
    if (!context || !valid(context) || !view || !menu.popup.isConnected || isDisabled(op.trigger)) { clear(); return; }
    let target: Element | undefined;
    if (op.kind === "effort") {
      const fresh = readEffortOptions(menu.popup, context.trigger);
      if (!fresh || fresh.options.length !== view.options.length || fresh.options.some((option, i) => normalize(option.label) !== normalize(view!.options[i]!.label))) { nativeFallback(); return; }
      target = fresh.options.find((option) => normalize(option.label) === op.target)?.button;
    } else {
      const buttons = Array.from(menu.popup.querySelectorAll('button, [role="button"]'));
      if (!buttons.length) return;
      const search = Array.from(menu.popup.querySelectorAll("input"));
      const normal = buttons.find((button) => ["normal", "正常"].includes(normalize(button.getAttribute("aria-label") ?? button.textContent)));
      const fast = buttons.find((button) => ["fast", "快速"].includes(normalize(button.getAttribute("aria-label") ?? button.textContent)));
      if (buttons.length !== 2 || !normal || !fast || buttons.some(isDisabled) || menu.popup.querySelector("textarea") || search.length > 1 ||
          search.some((input) => !["text", "search"].includes(input.getAttribute("type") ?? "text") || (input.value ?? "").trim())) { nativeFallback(); return; }
      target = op.target === "fast" ? fast : normal;
    }
    if (!target || isDisabled(target)) { nativeFallback(); return; }
    op.phase = "applied"; op.menu = menu;
    try { nativeClick(menu, target); } catch { operation = null; stopTimer(); render(true); }
    schedule();
  };
  const request = (kind: Operation["kind"], target: string) => {
    if (!context || !view || operation) return;
    if (!valid(context)) { clear(); return; }
    const trigger = kind === "effort" ? context.trigger : context.root.querySelector(FAST_TRIGGER);
    if (!trigger || isDisabled(trigger)) return;
    const actual = kind === "effort" ? normalize(trigger.textContent) : fastState(trigger);
    if (actual === target) { render(true); return; }
    const op: Operation = { kind, target, trigger, phase: "menu", existing: new Set(Array.from(document.querySelectorAll(POPUP))) };
    operation = op; render(); stopTimer();
    timer = window.setTimeout(() => {
      timer = null;
      if (operation !== op) return;
      operation = null; closeNative();
      for (const menu of menus) menu.restore(); menus.clear();
      render(true); restoreFocus(); // Host error toasts remain authoritative.
    }, 3500);
    const reusable = [...menus].find((menu) => menu.kind === kind && menu.popup.isConnected && !menu.used);
    if (reusable) perform(op, reusable);
    else { invoking = true; try { trigger.click(); } finally { invoking = false; } schedule(); }
  };
  const build = (source: { options: EffortOption[]; selected: number }) => {
    const c = context!;
    const popup = document.createElement("div"); popup.setAttribute(EFFORT_MENU, owner); popup.setAttribute("data-chat-skins-persistent-picker", "");
    popup.setAttribute("role", "dialog"); popup.setAttribute("aria-label", sliderCopy[language()].label);
    const panel = document.createElement("div"); panel.setAttribute(EFFORT_PANEL, owner);
    const palette = window.getComputedStyle(c.root);
    for (const name of ["surface", "ink", "blue", "paper", "border"]) popup.style.setProperty(`--chat-skins-composer-${name}`, palette.getPropertyValue(`--chat-skins-composer-${name}`));
    const title = document.createElement("div"); title.setAttribute("data-part", "value");
    const model = document.createElement("div"); model.setAttribute("data-part", "model"); model.textContent = c.root.querySelector(MODEL_TRIGGER)?.textContent ?? "";
    const track = document.createElement("div"); track.setAttribute("data-part", "track");
    const rail = document.createElement("div"); rail.setAttribute("data-part", "rail"); rail.setAttribute("aria-hidden", "true");
    const particles = document.createElement("div"); particles.setAttribute("data-part", "particles"); particles.setAttribute("aria-hidden", "true");
    for (let n = 0; n < 6; n++) particles.appendChild(document.createElement("i"));
    const ticks = document.createElement("div"); ticks.setAttribute("data-part", "ticks"); ticks.setAttribute("aria-hidden", "true");
    for (const _option of source.options) ticks.appendChild(document.createElement("i"));
    const range = document.createElement("input"); range.setAttribute("type", "range"); range.setAttribute("data-chat-skins-effort-range", "");
    range.setAttribute("min", "0"); range.setAttribute("max", String(source.options.length - 1)); range.setAttribute("step", "1");
    range.setAttribute("aria-label", sliderCopy[language()].label); range.setAttribute("title", sliderCopy[language()].help);
    const speed = c.root.querySelector(FAST_TRIGGER);
    const bolt = speed && fastState(speed) ? document.createElement("button") : null;
    if (bolt) {
      bolt.setAttribute("type", "button"); bolt.setAttribute("data-part", "fast");
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg"); icon.setAttribute("viewBox", "0 0 24 24"); icon.setAttribute("width", "17"); icon.setAttribute("height", "17"); icon.setAttribute("aria-hidden", "true");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", "M13 2 3 14h8l-1 8 11-12h-8l1-8Z"); path.setAttribute("fill", "none"); path.setAttribute("stroke", "currentColor"); path.setAttribute("stroke-width", "1.5"); path.setAttribute("stroke-linejoin", "round"); icon.appendChild(path); bolt.appendChild(icon);
    }
    const preview = (index: number) => {
      const option = source.options[index]; if (!option || !Number.isInteger(index)) return;
      range.value = String(index); title.textContent = option.label; range.setAttribute("aria-valuetext", option.label);
      if (option.rank === 7) panel.setAttribute("data-ultra", ""); else panel.removeAttribute("data-ultra");
      const fill = `${index / (source.options.length - 1) * 100}%`; range.style.setProperty("--chat-skins-effort-fill", fill); track.style.setProperty("--chat-skins-effort-fill", fill);
    };
    const input: Listener = () => preview(Number(range.value));
    const change: Listener = () => { const option = source.options[Number(range.value)]; if (option) request("effort", normalize(option.label)); };
    const toggle: Listener = () => { const value = fastState(c.root.querySelector(FAST_TRIGGER)); if (value) request("fast", value === "fast" ? "normal" : "fast"); };
    const pointer: Listener = () => panel.removeAttribute("data-keyboard");
    range.addEventListener("input", input); range.addEventListener("change", change); range.addEventListener("pointerdown", pointer); bolt?.addEventListener("click", toggle);
    track.appendChild(rail); track.appendChild(particles); track.appendChild(ticks); track.appendChild(range);
    panel.appendChild(title); panel.appendChild(model); panel.appendChild(track); if (bolt) panel.appendChild(bolt); popup.appendChild(panel);
    view = { popup, panel, range, bolt, options: source.options, confirmed: normalize(c.trigger.textContent), preview,
      dispose: () => { range.removeEventListener("input", input); range.removeEventListener("change", change); range.removeEventListener("pointerdown", pointer); bolt?.removeEventListener("click", toggle); popup.remove(); } };
    preview(source.selected); document.body.appendChild(popup); render(); lastFocus = range; restoreFocus();
  };
  const click: Listener = (event) => {
    if (invoking || !enabled()) return;
    const trigger = event.target?.closest?.(EFFORT_TRIGGER); if (!trigger) return;
    if (ignoreClick === trigger) { ignoreClick = null; event.stopPropagation(); return; }
    if (view) { clear(); event.stopPropagation(); return; }
    clear();
    const root = trigger.closest(ROOT);
    if (!root || !enabled() || root.getAttribute(OWNER) !== owner || isDisabled(trigger) || document.querySelectorAll(POPUP).length) return;
    context = { root, trigger, path: window.location.pathname, model: normalize(root.querySelector(MODEL_TRIGGER)?.textContent ?? ""), existing: new Set(), until: Date.now() + 1500 }; schedule();
  };
  const outside: Listener = (event) => {
    if (!view || !event.target || view.popup.contains(event.target)) return;
    const ignored = event.target.closest?.(EFFORT_TRIGGER) ?? null; clear(); ignoreClick = ignored;
  };
  const focus: Listener = (event) => {
    if (!view || restoringFocus || !event.target) return;
    if (view.popup.contains(event.target)) { lastFocus = event.target; return; }
    if ([...menus].some((menu) => menu.layer.contains(event.target!)) || event.target === context?.trigger || event.target === context?.root.querySelector(FAST_TRIGGER)) restoreFocus();
  };
  const key: Listener = (event) => {
    if (!view) return;
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); clear(true); return; }
    if (!event.target || !view.popup.contains(event.target)) return;
    if (event.key === "Tab") { event.preventDefault(); event.stopPropagation(); view.panel.setAttribute("data-keyboard", ""); const next = event.target === view.range && view.bolt && !isDisabled(view.bolt) ? view.bolt : view.range; next.focus({ preventScroll: true }); return; }
    if (event.target === view.bolt && ["Enter", " "].includes(event.key ?? "")) { event.preventDefault(); event.stopPropagation(); if (!isDisabled(view.bolt!)) view.bolt!.click(); return; }
    if (event.target !== view.range || isDisabled(view.range)) return;
    const name = event.key ?? "";
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown", "Enter"].includes(name)) return;
    event.preventDefault(); event.stopPropagation(); view.panel.setAttribute("data-keyboard", "");
    if (name === "Enter") { const option = view.options[Number(view.range.value)]; if (option) request("effort", normalize(option.label)); return; }
    let next = Number(view.range.value);
    if (name === "Home") next = 0; else if (name === "End") next = view.options.length - 1; else next += ["ArrowLeft", "ArrowDown", "PageDown"].includes(name) ? -1 : 1;
    view.preview(Math.max(0, Math.min(view.options.length - 1, next)));
  };
  document.addEventListener("click", click, true); document.addEventListener("pointerdown", outside, true); document.addEventListener("focusin", focus, true); window.addEventListener("keydown", key, true);
  return {
    needsNative(trigger: Element) { return nativeFallbacks.has(trigger); },
    clear,
    update() {
      for (const menu of menus) if (!menu.popup.isConnected) { menu.restore(); menus.delete(menu); }
      const c = context; if (!c) return;
      if (!valid(c)) { clear(); return; }
      if (!view) {
        if (Date.now() > c.until) { clear(); return; }
        const candidates = Array.from(document.querySelectorAll(POPUP)).filter((popup) => !c.existing.has(popup));
        if (!candidates.length) return;
        if (candidates.length !== 1) { nativeFallback(); return; }
        const native = candidates[0]!, source = readEffortOptions(native, c.trigger);
        if (!source) { nativeFallback(); return; }
        mask(native, c.trigger, "effort"); build(source);
      }
      const op = operation;
      if (op) {
        if (!op.trigger.isConnected || isDisabled(op.trigger)) { operation = null; stopTimer(); render(true); return; }
        if (op.phase === "menu") {
          const candidates = Array.from(document.querySelectorAll(POPUP)).filter((popup) => !op.existing.has(popup));
          if (candidates.length > 1) { nativeFallback(); return; }
          if (candidates[0]) { const candidate = candidates[0]; perform(op, [...menus].find((menu) => menu.popup === candidate) ?? mask(candidate, op.trigger, op.kind)); }
        } else {
          const actual = op.kind === "effort" ? normalize(c.trigger.textContent) : fastState(op.trigger);
          if (actual === op.target && !op.menu?.popup.isConnected) { operation = null; stopTimer(); render(true); restoreFocus(); }
        }
      }
      render();
    },
    dispose() { clear(); document.removeEventListener("click", click, true); document.removeEventListener("pointerdown", outside, true); document.removeEventListener("focusin", focus, true); window.removeEventListener("keydown", key, true); },
  };
}

interface FastControl { trigger: Element; kind: "toggle" | "select"; value: boolean }
function readClaudeFast(root: Element, agents?: AgentAppearanceState): FastControl | null {
  const tier = root.querySelector(FAST_TRIGGER), speed = fastState(tier);
  if (tier && speed) return { trigger: tier, kind: "select", value: speed === "fast" };
  const toggle = root.querySelector('[data-testid="agent-feature-fast_mode"]');
  if (!toggle || !agents) return null;
  const workspaceId = /^\/h\/[^/]+\/workspace\/([^/]+)/.exec(window.location.pathname)?.[1];
  for (let parent = root.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
    if (parent.querySelectorAll(ROOT).length !== 1) return null;
    const ids = new Set(Array.from(parent.querySelectorAll('[data-testid^="chat-skins-agent-"]')).map((node) => node.getAttribute("data-testid")!.slice("chat-skins-agent-".length)));
    if (ids.size > 1) return null;
    if (ids.size === 1) {
      const state = agents.get([...ids][0]!);
      return state && workspaceId && state.workspaceId === workspaceId && typeof state.fastMode === "boolean" ? { trigger: toggle, kind: "toggle", value: state.fastMode } : null;
    }
  }
  return null;
}

/** Native models remain native. Only append real effort/Fast settings to that
 * picker; no reference-only model names, limits, recommendations or fake rows. */
function createClaudeMenu(owner: string, enabled: () => boolean, readFast: (root: Element) => FastControl | null, schedule: () => void) {
  type Context = { root: Element; model: Element; path: string; label: string; existing: Set<Element>; until: number };
  type Submenu = { popup: Element; layer: Element; restore(): void };
  let context: Context | null = null, popup: Element | null = null, footer: Element | null = null;
  let effortRow: Element | null = null, effortValue: Element | null = null, fastRow: Element | null = null;
  let submenu: Submenu | null = null;
  let subIntent: { existing: Set<Element>; until: number; keyboard: boolean } | null = null;
  let fastOp: { control: FastControl; target: boolean; existing: Set<Element>; selected: boolean; mask?: Submenu } | null = null;
  let invoking = false, timer: number | null = null;
  let cleanups: (() => void)[] = [];
  const nativeFastFallback = new WeakSet<Element>();
  const valid = (c: Context) => enabled() && c.root.isConnected && c.model.isConnected && c.root.getAttribute(OWNER) === owner &&
    c.root.getAttribute(SKIN) === "claude-code" && c.path === window.location.pathname && c.label === normalize(c.model.textContent);
  const stopTimer = () => { if (timer !== null) window.clearTimeout(timer); timer = null; };
  const closeSub = () => {
    if (submenu?.popup.isConnected) submenu.popup.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    submenu?.restore(); submenu = null; subIntent = null;
  };
  const clear = () => {
    closeSub(); stopTimer();
    if (fastOp?.mask) {
      if (fastOp.mask.popup.isConnected) fastOp.mask.popup.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      fastOp.mask.restore();
    }
    fastOp = null; footer?.remove();
    if (popup?.getAttribute(CLAUDE_MENU) === owner) popup.removeAttribute(CLAUDE_MENU);
    if (context?.root.getAttribute(CLAUDE_MENU) === owner) context.root.removeAttribute(CLAUDE_MENU);
    for (const cleanup of cleanups) cleanup(); cleanups = [];
    context = null; popup = null; footer = null; effortRow = null; effortValue = null; fastRow = null;
  };
  const decorate = (element: Element, key: string, value: string) => {
    const previous = element.getAttribute(key); element.setAttribute(key, value);
    return () => { if (element.getAttribute(key) === value) { if (previous === null) element.removeAttribute(key); else element.setAttribute(key, previous); } };
  };
  const copyPalette = (target: Element) => {
    if (!context) return () => {};
    const restores: (() => void)[] = [];
    const palette = window.getComputedStyle(context.root);
    for (const name of ["ink", "surface", "blue", "border", "paper"]) {
      const key = `--chat-skins-composer-${name}`, previous = target.style.getPropertyValue(key), priority = target.style.getPropertyPriority(key), value = palette.getPropertyValue(key);
      target.style.setProperty(key, value);
      restores.push(() => { if (target.style.getPropertyValue(key) === value) { if (previous) target.style.setProperty(key, previous, priority); else target.style.removeProperty(key); } });
    }
    return () => { for (const restore of restores) restore(); };
  };
  const positionSub = () => {
    if (!submenu || !popup || !effortRow) return;
    const main = popup.getBoundingClientRect(), row = effortRow.getBoundingClientRect(), bounds = submenu.popup.getBoundingClientRect();
    const right = main.right + 6;
    submenu.popup.style.setProperty("--chat-skins-sub-left", `${right + bounds.width <= window.innerWidth - 8 ? right : Math.max(8, main.left - bounds.width - 6)}px`);
    submenu.popup.style.setProperty("--chat-skins-sub-top", `${Math.max(8, Math.min(window.innerHeight - bounds.height - 8, row.bottom - bounds.height + 4))}px`);
  };
  const openEffort: Listener = (event) => {
    if (!context || !valid(context)) return;
    const trigger = context.root.querySelector(EFFORT_TRIGGER); if (!trigger || isDisabled(trigger)) return;
    if (submenu) { closeSub(); return; }
    subIntent = { existing: new Set(Array.from(document.querySelectorAll(POPUP))), until: Date.now() + 1500, keyboard: event.detail === 0 };
    invoking = true; try { trigger.click(); } finally { invoking = false; } schedule();
  };
  const toggleFast: Listener = () => {
    if (!context || !valid(context) || fastOp) return;
    const control = readFast(context.root); if (!control || isDisabled(control.trigger)) return;
    closeSub();
    fastOp = { control, target: !control.value, existing: new Set(Array.from(document.querySelectorAll(POPUP))), selected: control.kind === "toggle" };
    fastRow?.setAttribute("disabled", ""); fastRow?.setAttribute("aria-busy", "true");
    invoking = true; try { control.trigger.click(); } finally { invoking = false; }
    stopTimer(); timer = window.setTimeout(() => {
      timer = null;
      if (fastOp?.mask) { fastOp.mask.popup.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); fastOp.mask.restore(); }
      fastOp = null; schedule();
    }, 3500);
    schedule();
  };
  const click: Listener = (event) => {
    if (invoking) return;
    const effort = event.target?.closest?.(EFFORT_TRIGGER);
    if (effort) {
      const root = effort.closest(ROOT), model = root?.querySelector(MODEL_TRIGGER);
      if (enabled() && root?.getAttribute(OWNER) === owner && root.getAttribute(SKIN) === "claude-code" && model && !isDisabled(model)) {
        event.preventDefault(); event.stopPropagation(); model.click();
      }
      return;
    }
    const model = event.target?.closest?.(MODEL_TRIGGER); if (!model) return;
    clear();
    const root = model.closest(ROOT);
    if (!enabled() || !root || root.getAttribute(OWNER) !== owner || root.getAttribute(SKIN) !== "claude-code" || isDisabled(model)) return;
    context = { root, model, path: window.location.pathname, label: normalize(model.textContent), existing: new Set(Array.from(document.querySelectorAll(POPUP))), until: Date.now() + 1500 }; schedule();
  };
  const outside: Listener = (event) => {
    if (!submenu || !event.target) return;
    if (submenu.popup.contains(event.target)) submenu.popup.setAttribute("data-chat-skins-sub-keyboard", "false");
    else if (!effortRow?.contains(event.target)) closeSub();
  };
  const key: Listener = (event) => {
    if (submenu && event.target && submenu.popup.contains(event.target)) {
      if (["Tab", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key ?? "")) submenu.popup.setAttribute("data-chat-skins-sub-keyboard", "true");
      return; // Keep the host's keyboard navigation and selection authoritative.
    }
    if (!footer || !event.target || !footer.contains(event.target)) return;
    if (["Enter", " "].includes(event.key ?? "")) {
      const button = event.target.closest("button"); if (!button || isDisabled(button)) return;
      event.preventDefault(); event.stopPropagation(); button.click();
    }
  };
  const canCombine = (root: Element) => {
    const model = root.querySelector(MODEL_TRIGGER);
    return enabled() && !!model && !isDisabled(model) && !nativeFastFallback.has(root);
  };
  document.addEventListener("click", click, true); document.addEventListener("pointerdown", outside, true); window.addEventListener("keydown", key, true);
  return {
    canCombine,
    canHideFast: (root: Element) => canCombine(root) && !!readFast(root),
    clear,
    update() {
      const c = context; if (!c) return;
      if (!valid(c)) { clear(); return; }
      if (!popup) {
        if (Date.now() > c.until) { nativeFastFallback.add(c.root); clear(); schedule(); return; }
        const candidates = Array.from(document.querySelectorAll(POPUP)).filter((element) => !c.existing.has(element));
        if (!candidates.length) return;
        if (candidates.length !== 1 || candidates[0]!.getAttribute(CLAUDE_MENU) !== null) { nativeFastFallback.add(c.root); clear(); schedule(); return; }
        if (!candidates[0]!.querySelector('[data-testid="model-search-input"], [data-testid="model-search-all-input"], [data-testid^="model-row-"]')) {
          if (!nativeFastFallback.has(c.root)) { nativeFastFallback.add(c.root); schedule(); }
          return;
        }
        if (nativeFastFallback.delete(c.root)) schedule();
        popup = candidates[0]!; popup.setAttribute(CLAUDE_MENU, owner); c.root.setAttribute(CLAUDE_MENU, owner); cleanups.push(copyPalette(popup));
        footer = document.createElement("div"); footer.setAttribute(CLAUDE_FOOTER, owner);
        effortRow = document.createElement("button"); effortRow.setAttribute("type", "button"); effortRow.setAttribute("data-part", "effort-row");
        const label = document.createElement("span"); label.textContent = "Effort";
        effortValue = document.createElement("span"); effortValue.setAttribute("data-part", "effort-value");
        const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg"); chevron.setAttribute("viewBox", "0 0 24 24"); chevron.setAttribute("width", "16"); chevron.setAttribute("height", "16"); chevron.setAttribute("aria-hidden", "true");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", "m9 5 7 7-7 7"); path.setAttribute("fill", "none"); path.setAttribute("stroke", "currentColor"); path.setAttribute("stroke-width", "1.5"); chevron.appendChild(path);
        effortRow.appendChild(label); effortRow.appendChild(effortValue); effortRow.appendChild(chevron); effortRow.addEventListener("click", openEffort);
        fastRow = document.createElement("button"); fastRow.setAttribute("type", "button"); fastRow.setAttribute("role", "switch"); fastRow.setAttribute("data-part", "fast-row"); fastRow.setAttribute("aria-label", "Fast mode");
        const fastLabel = document.createElement("span"); fastLabel.textContent = "Fast mode";
        const track = document.createElement("span"); track.setAttribute("data-part", "switch-track"); track.setAttribute("aria-hidden", "true"); track.appendChild(document.createElement("i"));
        fastRow.appendChild(fastLabel); fastRow.appendChild(track); fastRow.addEventListener("click", toggleFast);
        const row = effortRow, toggle = fastRow;
        cleanups.push(() => { row.removeEventListener("click", openEffort); toggle.removeEventListener("click", toggleFast); });
        footer.appendChild(effortRow); footer.appendChild(fastRow); popup.appendChild(footer);
      }
      if (!popup.isConnected) { clear(); return; }
      const effort = c.root.querySelector(EFFORT_TRIGGER);
      if (effort) {
        effortRow!.removeAttribute("hidden"); const value = effort.textContent?.trim() ?? "";
        if (effortValue!.textContent !== value) effortValue!.textContent = value;
        effortRow!.setAttribute("aria-label", effort.getAttribute("aria-label") ?? "Effort");
        if (isDisabled(effort)) effortRow!.setAttribute("disabled", ""); else effortRow!.removeAttribute("disabled");
      } else effortRow!.setAttribute("hidden", "");
      const speed = readFast(c.root);
      if (speed) {
        fastRow!.removeAttribute("hidden"); fastRow!.setAttribute("aria-checked", String(speed.value));
        if (fastOp && speed.value === fastOp.target && (!fastOp.mask || !fastOp.mask.popup.isConnected)) { fastOp.mask?.restore(); fastOp = null; stopTimer(); }
        if (isDisabled(speed.trigger) || fastOp) fastRow!.setAttribute("disabled", ""); else { fastRow!.removeAttribute("disabled"); fastRow!.removeAttribute("aria-busy"); }
      } else fastRow!.setAttribute("hidden", "");
      if (!effort && !speed) footer!.setAttribute("hidden", ""); else footer!.removeAttribute("hidden");
      if (subIntent && !submenu) {
        const candidates = Array.from(document.querySelectorAll(POPUP)).filter((element) => !subIntent!.existing.has(element));
        if (Date.now() > subIntent.until || candidates.length > 1) subIntent = null;
        else if (candidates[0]) {
          const sub = candidates[0], layer = sub.parentElement ?? sub;
          const previousKeyboard = sub.getAttribute("data-chat-skins-sub-keyboard");
          const restores = [decorate(sub, CLAUDE_SUBMENU, owner), () => {
            // This flag changes as input modality changes, unlike static marks.
            if (sub.getAttribute(CLAUDE_SUBMENU) === owner && ["true", "false"].includes(sub.getAttribute("data-chat-skins-sub-keyboard") ?? "")) {
              if (previousKeyboard === null) sub.removeAttribute("data-chat-skins-sub-keyboard");
              else sub.setAttribute("data-chat-skins-sub-keyboard", previousKeyboard);
            }
          }, copyPalette(sub)];
          sub.setAttribute("data-chat-skins-sub-keyboard", String(subIntent.keyboard));
          const buttons = Array.from(sub.querySelectorAll('button, [role="button"]'));
          // Only the shared option ancestry loses flex expansion; no unrelated
          // popup or model-list layout is changed.
          for (let flow = buttons[0]?.parentElement; flow && flow !== sub; flow = flow.parentElement) {
            if (buttons.every((button) => flow!.contains(button))) restores.push(decorate(flow, CLAUDE_PART, "effort-flow"));
          }
          for (const button of buttons) {
            restores.push(decorate(button, CLAUDE_PART, "effort-option"));
            restores.push(decorate(button, "data-chat-skins-selected", String(normalize(button.getAttribute("aria-label") ?? button.textContent) === normalize(effort?.textContent ?? null))));
            const icon = button.querySelector("svg"), leading = icon && branch(button, icon);
            if (leading && leading === button.children[0] && !normalize(leading.textContent) && normalize(button.textContent)) restores.push(decorate(leading, CLAUDE_PART, "glyph"));
          }
          const restoreLayer = layer !== document.body ? decorate(layer, CLAUDE_SUBLAYER, owner) : () => {};
          submenu = { popup: sub, layer, restore() { restoreLayer(); for (const restore of restores.reverse()) restore(); sub.style.removeProperty("--chat-skins-sub-left"); sub.style.removeProperty("--chat-skins-sub-top"); } };
          subIntent = null;
        }
      }
      if (submenu) { if (!submenu.popup.isConnected) { submenu.restore(); submenu = null; } else positionSub(); }
      if (fastOp && fastOp.control.kind === "select" && !fastOp.selected) {
        const candidates = Array.from(document.querySelectorAll(POPUP)).filter((element) => !fastOp!.existing.has(element));
        if (candidates.length === 1) {
          const menu = candidates[0]!, buttons = Array.from(menu.querySelectorAll('button, [role="button"]'));
          if (!buttons.length) return;
          const normal = buttons.find((b) => ["normal", "正常"].includes(normalize(b.getAttribute("aria-label") ?? b.textContent)));
          const fast = buttons.find((b) => ["fast", "快速"].includes(normalize(b.getAttribute("aria-label") ?? b.textContent)));
          const inputs = Array.from(menu.querySelectorAll("input"));
          if (buttons.length !== 2 || !normal || !fast || buttons.some(isDisabled) || menu.querySelector("textarea") || inputs.length > 1 || inputs.some((input) => (input.value ?? "").trim() || !["text", "search"].includes(input.getAttribute("type") ?? "text"))) { fastOp = null; stopTimer(); return; }
          const parent = menu.parentElement, layer = parent && parent !== document.body && !parent.contains(c.root) ? parent : menu;
          const undo = decorate(layer, FAST_MENU, owner), undoAria = decorate(layer, "aria-hidden", "true");
          fastOp.mask = { popup: menu, layer, restore() { undo(); undoAria(); } }; fastOp.selected = true;
          (fastOp.target ? fast : normal).click(); schedule();
        }
      }
    },
    dispose() { clear(); document.removeEventListener("click", click, true); document.removeEventListener("pointerdown", outside, true); window.removeEventListener("keydown", key, true); },
  };
}

export function installComposerStyling(runtime: SkinRuntime, agents?: AgentAppearanceState): ComposerStyling {
  let status: ComposerStatus = "off";
  const listeners = new Set<() => void>();
  const publish = (value: ComposerStatus) => {
    if (status === value) return;
    status = value; for (const listener of listeners) listener();
  };
  const base = {
    getSnapshot: () => status,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
  const requested = () => {
    const state = runtime.getSnapshot();
    return state.status === "ready" && state.values.composerStyling && state.values.skin !== "native";
  };
  if (Platform.OS !== "web" || typeof document === "undefined" || typeof window === "undefined" ||
      typeof MutationObserver === "undefined" || typeof ResizeObserver === "undefined") {
    const update = () => publish(requested() ? "unsupported" : "off");
    const unsubscribe = runtime.subscribe(update); update();
    return { ...base, bindHost: () => {}, watchAgent: () => () => {}, dispose: () => { unsubscribe(); listeners.clear(); } };
  }
  const media = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
  const coordinator = window.__serraChatSkinsComposerV1 ?? { next: 0, owners: new Map<number, () => void>() };
  window.__serraChatSkinsComposerV1 = coordinator;
  const ownerId = ++coordinator.next;
  const owner = `cs-${ownerId}`;
  const style = document.createElement("style"); style.setAttribute("data-chat-skins-composer-style", owner); style.textContent = css(owner);
  let boundHost: string | null = null;
  let bindingConflict = false;
  let disposed = false; let frame: number | null = null; let composing = false;
  type Lease = { element: Element; kind: "attribute" | "property"; key: string; previous: string | null; previousPriority: string; value: string };
  const leases = new Map<Element, Map<string, Lease>>();
  const seen = new Set<Lease>();
  let paletteRevision = 0;
  let palettes = new WeakMap<Element, { ink: string; revision: number; surface: string; border: string }>();
  let widths = new Map<Element, number>();
  const release = (lease: Lease) => {
    const { element, key, previous, value } = lease;
    if (lease.kind === "attribute") {
      if (element.getAttribute(key) !== value) return;
      if (previous === null) element.removeAttribute(key); else element.setAttribute(key, previous);
    } else {
      if (element.style.getPropertyValue(key) !== value || element.style.getPropertyPriority(key)) return;
      if (previous) element.style.setProperty(key, previous, lease.previousPriority); else element.style.removeProperty(key);
    }
  };
  const releaseUnused = () => {
    for (const [element, keys] of leases) {
      for (const [id, lease] of keys) if (!seen.has(lease)) { release(lease); keys.delete(id); }
      if (!keys.size) leases.delete(element);
    }
  };
  const restore = () => {
    seen.clear(); releaseUnused(); palettes = new WeakMap(); style.remove();
  };
  const own = (element: Element, kind: Lease["kind"], key: string, value: string) => {
    let keys = leases.get(element);
    if (!keys) { keys = new Map(); leases.set(element, keys); }
    const id = `${kind}:${key}`;
    const current = kind === "attribute" ? element.getAttribute(key) : element.style.getPropertyValue(key);
    const priority = kind === "property" ? element.style.getPropertyPriority(key) : "";
    let lease = keys.get(id);
    if (!lease) {
      lease = { element, kind, key, previous: current, previousPriority: priority, value };
      keys.set(id, lease);
    } else {
      // Remember a host update made while our enhancement was active.
      if (current !== lease.value || priority) { lease.previous = current; lease.previousPriority = priority; }
      lease.value = value;
    }
    seen.add(lease);
    if (current === value && !priority) return;
    if (kind === "attribute") element.setAttribute(key, value); else element.style.setProperty(key, value);
  };
  const mark = (element: Element, key: string, value: string) => own(element, "attribute", key, value);
  const variable = (element: Element, key: string, value: string) => own(element, "property", key, value);
  const readPalette = (parts: Parts, ink: string) => {
    const cached = palettes.get(parts.surface);
    if (cached && cached.ink === ink && cached.revision === paletteRevision) return cached;
    // Only initial application or an actual theme change needs a native palette
    // measurement. Never detach styles or remeasure native geometry on typing.
    const role = parts.surface.getAttribute(ROLE);
    if (role) parts.surface.removeAttribute(ROLE);
    try {
      const nativeStyle = window.getComputedStyle(parts.surface);
      const palette = { ink, revision: paletteRevision,
        surface: nativeStyle.getPropertyValue("background-color") || "Canvas",
        border: nativeStyle.getPropertyValue("border-top-color") || ink || "CanvasText" };
      palettes.set(parts.surface, palette); return palette;
    } finally { if (role) parts.surface.setAttribute(ROLE, role); }
  };
  const observe = () => {
    observer.observe(document.body, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["style", "class", "data-theme", "aria-label", "aria-disabled", "disabled", "data-testid"] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class", "data-theme"] });
  };
  const schedule = () => {
    if (!disposed && frame === null && (!composing || !requested())) frame = window.requestAnimationFrame(refresh);
  };
  const canEnhanceCodex = () => !disposed && !bindingConflict && requested() && media.matches && coordinator.owners.size === 1 && runtime.getSnapshot().values.skin === "codex";
  const picker = createPersistentPicker(owner, () => runtime.getSnapshot().values.language, canEnhanceCodex, schedule);
  const permissionMenu = createPermissionMenuStyling(owner, canEnhanceCodex, schedule);
  const canEnhanceClaude = () => !disposed && !bindingConflict && requested() && media.matches && coordinator.owners.size === 1 && runtime.getSnapshot().values.skin === "claude-code";
  const claudeMenu = createClaudeMenu(owner, canEnhanceClaude, (root) => readClaudeFast(root, agents), schedule);
  const removeContextClickOnly = installContextClickOnly(owner);
  const observer = new MutationObserver((records) => {
    if (records.some((record) => record.type === "attributes" && (record.target === document.body || record.target === document.documentElement))) paletteRevision++;
    const relevant = records.some((record) => {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (!target || target.closest(`[${EFFORT_PANEL}], [${CLAUDE_FOOTER}]`)) return false;
      if (target.closest(POPUP)) return true;
      if (record.type === "attributes") return target === document.body || target === document.documentElement ||
        (!target.matches("textarea") && !!target.closest(ROOT));
      if (target.closest(ROOT)) return !target.matches("textarea");
      return [...Array.from(record.addedNodes), ...Array.from(record.removedNodes)].some((node) => node.matches?.(`${ROOT}, ${POPUP}`) || node.querySelector?.(`${ROOT}, ${POPUP}`));
    });
    if (relevant) { picker.update(); schedule(); }
  });
  const resize = new ResizeObserver(() => {
    if ([...widths].some(([root, width]) => Math.abs(root.getBoundingClientRect().width - width) > 1)) schedule();
  });
  function refresh() {
    frame = null;
    if (disposed || (composing && requested())) return;
    observer.disconnect(); resize.disconnect();
    seen.clear(); widths = new Map();
    try {
      if (!requested()) { picker.clear(true); permissionMenu.clear(); claudeMenu.clear(); restore(); publish("off"); return; }
      if (bindingConflict || coordinator.owners.size !== 1) { picker.clear(true); permissionMenu.clear(); claudeMenu.clear(); restore(); publish("conflict"); return; }
      if (!media.matches) { picker.clear(true); permissionMenu.clear(); claudeMenu.clear(); restore(); publish("unsupported"); return; }
      const activeHost = /^\/h\/([^/]+)\/workspace\//.exec(window.location.pathname)?.[1];
      if (!boundHost || activeHost !== boundHost) { picker.clear(true); permissionMenu.clear(); claudeMenu.clear(); restore(); publish("waiting"); return; }
      const roots = Array.from(document.querySelectorAll(ROOT));
      if (!roots.length) { picker.clear(true); permissionMenu.clear(); claudeMenu.clear(); restore(); publish("waiting"); return; }
      if (!style.isConnected) document.head.appendChild(style);
      let applied = 0;
      for (const root of roots) {
        widths.set(root, root.getBoundingClientRect().width); resize.observe(root);
        const existingOwner = root.getAttribute(OWNER);
        if (existingOwner !== null && existingOwner !== owner) continue;
        const parts = identify(root); if (!parts) continue;
        const ink = window.getComputedStyle(parts.input).getPropertyValue("color");
        const palette = readPalette(parts, ink);
        variable(root, "--chat-skins-composer-surface", palette.surface);
        variable(root, "--chat-skins-composer-border", palette.border);
        variable(root, "--chat-skins-composer-ink", ink || "CanvasText");
        const light = (ink.match(/[\d.]+/g)?.slice(0, 3).reduce((a, v) => a + Number(v), 0) ?? 0) < 420;
        variable(root, "--chat-skins-composer-paper", light ? "#fff" : palette.surface);
        variable(root, "--chat-skins-composer-primary", light ? "#000" : "#fff");
        variable(root, "--chat-skins-composer-primary-ink", light ? "#fff" : "#000");
        variable(root, "--chat-skins-composer-blue", light ? "#2563eb" : "#93b4ff");
        variable(root, "--chat-skins-composer-warning", light ? "#cf302d" : "#ff8985");
        mark(root, OWNER, owner); mark(root, SKIN, runtime.getSnapshot().values.skin);
        const speedControl = root.querySelector(FAST_TRIGGER), speed = fastState(speedControl);
        if (speedControl && speed) mark(speedControl, "data-chat-skins-fast", speed);
        const model = root.querySelector(MODEL_TRIGGER), effort = root.querySelector(EFFORT_TRIGGER), mode = root.querySelector('[data-testid="mode-control"]');
        if (runtime.getSnapshot().values.skin === "codex" && speedControl && speed && effort &&
            !isDisabled(effort) && effortRanks.has(normalize(effort.textContent)) && !picker.needsNative(speedControl)) {
          mark(speedControl, FAST_SOURCE, owner); mark(speedControl, "aria-hidden", "true"); mark(speedControl, "tabindex", "-1");
        }
        const groups = [model && branch(parts.controls, model), effort && branch(parts.controls, effort), mode && branch(parts.controls, mode)];
        if (groups.every(Boolean) && new Set(groups).size === 3) {
          for (const [index, group] of groups.entries()) mark(group!, CONTROL, ["model-group", "effort-group", "mode-group"][index]!);
        }
        if (mode && ["full access", "完全访问", "完全访问权限"].includes(normalize(mode.textContent))) mark(mode, "data-chat-skins-access", "full");
        else if (mode && ["default permissions", "默认权限"].includes(normalize(mode.textContent))) mark(mode, "data-chat-skins-access", "default");
        if (runtime.getSnapshot().values.skin === "claude-code") {
          const attach = root.querySelector('[data-testid="message-input-attach-button"]');
          const attachGroup = attach && branch(parts.left, attach);
          const extras = Array.from(parts.surface.children).filter((child) => child !== parts.editor && child !== parts.toolbar);
          // Unknown wrappers/trays retain the previous conservative layout.
          if (attachGroup && attachGroup !== parts.controls && extras.length <= 1) {
            mark(root, CLAUDE_LAYOUT, "inline"); mark(attachGroup, CLAUDE_PART, "attach");
            for (const extra of extras) mark(extra, CLAUDE_PART, "attachments");
            const inputBranch = branch(parts.editor, parts.input);
            for (const child of Array.from(parts.editor.children)) {
              const text = child.textContent ?? "";
              if (child !== inputBranch && !child.querySelector('button, [role="button"], input, textarea') && /(⌘|Ctrl|Control)/i.test(text) && /(to focus|聚焦)/i.test(text)) mark(child, CLAUDE_PART, "focus-hint");
            }
            const context = parts.right.querySelector(CONTEXT_METER), contextGroup = context && branch(parts.right, context);
            if (contextGroup) mark(contextGroup, CLAUDE_PART, "context");
            if (effort && claudeMenu.canCombine(root)) {
              // Keep its native handler/ref as the menu's action bridge, but
              // show only the model label in the Claude footer.
              mark(effort, CLAUDE_EFFORT_SOURCE, owner); mark(effort, "aria-hidden", "true"); mark(effort, "tabindex", "-1");
              const group = groups[1];
              if (group && group !== effort && group.querySelectorAll('button, [role="button"]').length === 1) mark(group, CLAUDE_EFFORT_SOURCE, owner);
            }
            const feature = root.querySelector('[data-testid="agent-feature-fast_mode"]') ?? speedControl;
            if (feature && claudeMenu.canHideFast(root)) { mark(feature, FAST_SOURCE, owner); mark(feature, "aria-hidden", "true"); mark(feature, "tabindex", "-1"); }
            const featureGroup = feature && branch(parts.controls, feature);
            if (featureGroup && !groups.includes(featureGroup)) mark(featureGroup, CONTROL, "fast-group");
            // Remove decorative trigger glyphs only when a real label remains.
            for (const control of [model, effort]) if (control && normalize(control.textContent)) {
              for (const svg of Array.from(control.querySelectorAll("svg"))) {
                let glyph = svg;
                while (glyph.parentElement && glyph.parentElement !== control && !normalize(glyph.parentElement.textContent)) glyph = glyph.parentElement;
                mark(glyph, CLAUDE_PART, "glyph");
              }
            }
          }
        }
        // Native state decides whether send, queue, voice, or stop exists. Never
        // hide the stop button or derive sendability from textarea text alone.
        for (const button of Array.from(parts.right.querySelectorAll('button, [role="button"]'))) {
          const label = normalize(button.getAttribute("aria-label"));
          const isSend = ["send message", "send", "send and steer", "send and interrupt", "queue message", "发送消息", "发送", "发送并引导", "发送并中断", "消息排队"].includes(label);
          if (isSend) mark(button, "data-chat-skins-action", "send");
          else if (["enable voice mode", "启用语音模式"].includes(label)) mark(button, "data-chat-skins-action", "voice");
          if (runtime.getSnapshot().values.skin === "claude-code") {
            if (isSend && !isDisabled(button) && !normalize(button.textContent) && button.querySelector("svg") && !button.querySelector('[role="progressbar"]')) mark(button, "data-chat-skins-claude-send-icon", "return");
            const group = branch(parts.right, button);
            if (group && ["start dictation", "stop dictation", "开始听写", "停止听写"].includes(label)) mark(group, CLAUDE_PART, "dictation");
            else if (group && (isSend || ["stop agent", "interrupt agent", "停止 agent", "中断 agent"].includes(label))) mark(group, CLAUDE_PART, "primary");
          }
        }
        for (const [role, element] of Object.entries(parts)) if (role !== "root") mark(element, ROLE, role);
        applied++;
      }
      releaseUnused();
      if (!applied) style.remove();
      picker.update(); permissionMenu.update(); claudeMenu.update();
      publish(applied ? "active" : "unsupported");
    } catch {
      picker.clear(true); permissionMenu.clear(); claudeMenu.clear(); restore(); publish("unsupported");
    } finally {
      if (!disposed && requested()) observe();
    }
  }
  const startComposition: Listener = (event) => {
    if (event.target?.closest?.(ROOT)) composing = true;
  };
  const endComposition: Listener = () => { composing = false; schedule(); };
  coordinator.owners.set(ownerId, schedule);
  for (const changed of coordinator.owners.values()) changed();
  const unsubscribe = runtime.subscribe(schedule);
  const unsubscribeAgents = agents?.subscribe(schedule);
  media.addEventListener("change", schedule);
  window.addEventListener("resize", schedule);
  window.addEventListener("popstate", schedule);
  window.addEventListener("hashchange", schedule);
  document.addEventListener("pointerdown", schedule, true);
  document.addEventListener("keydown", schedule, true);
  document.addEventListener("compositionstart", startComposition, true);
  document.addEventListener("compositionend", endComposition, true);
  observe(); schedule();
  return { ...base, watchAgent: (id) => agents?.watch(id) ?? (() => {}), bindHost: (id) => {
    if (disposed || boundHost === id) return;
    // The host ID comes from public plugin surface props, never private React state.
    if (boundHost !== null) { bindingConflict = true; restore(); publish("conflict"); return; }
    boundHost = id; schedule();
  }, dispose: () => {
    disposed = true;
    if (frame !== null) window.cancelAnimationFrame(frame);
    unsubscribe(); unsubscribeAgents?.(); observer.disconnect(); resize.disconnect(); picker.dispose(); permissionMenu.dispose(); claudeMenu.dispose(); removeContextClickOnly();
    media.removeEventListener("change", schedule); window.removeEventListener("resize", schedule);
    window.removeEventListener("popstate", schedule); window.removeEventListener("hashchange", schedule);
    document.removeEventListener("pointerdown", schedule, true); document.removeEventListener("keydown", schedule, true);
    document.removeEventListener("compositionstart", startComposition, true); document.removeEventListener("compositionend", endComposition, true);
    restore(); widths.clear(); listeners.clear(); coordinator.owners.delete(ownerId);
    for (const changed of coordinator.owners.values()) changed();
    if (!coordinator.owners.size) delete window.__serraChatSkinsComposerV1;
  } };
}
