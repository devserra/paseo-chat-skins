import type { Preferences } from "../../shared/settings.ts";

export const SETTINGS_TITLE = "Chat Skins Settings";
export const languages = [
  { value: "en", label: "English" },
  { value: "zh-CN", label: "简体中文" },
  { value: "hi", label: "हिन्दी" },
] as const;
export type Language = typeof languages[number]["value"];

const en = {
  composer: "Composer", composerStyling: "Composer styling", composerHint: "Experimental · Desktop only. Styles the real input and controls. Codex’s effort slider uses Paseo’s available options.",
  composerOff: "Native composer styling is active.", composerWaiting: "Ready. Open a supported desktop chat to see the styling.", composerActive: "Applied to supported visible composers.", composerUnsupported: "This layout is not supported. The native composer is unchanged.", composerConflict: "Multiple Chat Skins instances share this window. Composer styling is paused to avoid conflicts.",
  credit: "Created by serra",
  intro: "Choose how supported chat messages look. Your model, permissions and conversation stay unchanged.",
  language: "Settings language", languageHint: "Applies to this page and its preview, not your chats or Paseo’s interface.",
  scope: "Saved automatically · Shared by clients connected to this host",
  appearance: "Appearance", skin: "Chat style", native: "Paseo native",
  nativeHint: "Keep Paseo’s original message rendering.", codexHint: "Dark user bubbles, open assistant replies and rounded code blocks.", claudeHint: "Quiet tool rows and a lighter, more compact reading rhythm.",
  saving: "Saving…", saved: "Saved", syncing: "Syncing settings…", syncError: "Sync failed. Native rendering is active.",
  preview: "Show preview", hidePreview: "Hide preview", previewHint: "Sample content, not your conversation. Uses the actual message renderer.",
  previewNative: "Choose Codex or Claude Code to preview a skin.",
  reading: "Reading", font: "Text size", small: "Small · 14", reference: "Reference · 16", large: "Large · 18",
  density: "Spacing", comfortable: "Comfortable", compact: "Compact", readingHint: "Available when a chat skin is selected.",
  details: "Message details", tools: "Expand command details", toolsHint: "Failed commands always show their details. Execution is unaffected.",
  reasoning: "Expand reasoning", reasoningHint: "Only shows content actually returned by the provider.",
  restore: "Restore appearance", restoreHint: "Return to native rendering and default display options. Keeps your settings language and chat history.", restoreAction: "Restore defaults",
  loading: "Loading Chat Skins settings…", loadError: "Couldn’t load settings", loadErrorHint: "Native rendering is active. Your saved preferences have not been overwritten.",
  retry: "Try again", reload: "Reload settings", reloadHint: "If another client saved changes, reload before choosing again.",
  saveError: "Couldn’t save changes", errorDetails: "Technical details", recovery: "Reset invalid settings", recoveryHint: "Replace invalid preferences with defaults, including English. Chats and models are not affected.",
  sampleUser: "Check this configuration and explain the change.",
  sampleAssistant: "The configuration is checked. Original content stays intact.\n\n```ts\nconst appearance = \"chat-skins\";\n```\n\nThis is a **message style** preview, not a model or permission control.",
  sampleTool: "Sample command · not executed", sampleCommand: "Run command", sampleOutput: "npm run typecheck\n\nSample output: type check complete.",
};
export type SettingsCopy = { [K in keyof typeof en]: string };
const zh: SettingsCopy = {
  composer: "输入框", composerStyling: "输入框样式增强", composerHint: "实验性 · 仅桌面端。调整真实输入框与控件；Codex 强度滑杆对应 Paseo 的可用选项。",
  composerOff: "当前使用原生输入框样式。", composerWaiting: "已准备好，打开支持的桌面聊天即可查看。", composerActive: "已应用到支持的可见输入框。", composerUnsupported: "当前布局不支持，保持原生输入框。", composerConflict: "当前窗口有多个 Chat Skins 实例，暂不应用输入框样式以避免冲突。",
  credit: "由 serra 创作",
  intro: "选择支持的聊天消息如何呈现，不改变模型、权限或会话内容。",
  language: "设置页面语言", languageHint: "仅影响本页和预览，不翻译聊天内容或 Paseo 界面。",
  scope: "自动保存 · 连接同一宿主的客户端共享设置",
  appearance: "外观", skin: "聊天样式", native: "Paseo 原生",
  nativeHint: "保留 Paseo 原始消息渲染。", codexHint: "深色用户气泡、简洁回复与圆角代码块。", claudeHint: "低强调工具行与更轻量、紧凑的阅读节奏。",
  saving: "正在保存…", saved: "已保存", syncing: "正在同步设置…", syncError: "同步失败，当前使用原生渲染。",
  preview: "展开样式预览", hidePreview: "收起样式预览", previewHint: "示例内容，不是你的会话。使用实际消息渲染组件。",
  previewNative: "选择 Codex 或 Claude Code 后可查看样式预览。",
  reading: "阅读", font: "正文字号", small: "小 · 14", reference: "参考 · 16", large: "大 · 18",
  density: "间距", comfortable: "舒适", compact: "紧凑", readingHint: "选择聊天皮肤后可调整。",
  details: "消息详情", tools: "默认展开命令详情", toolsHint: "失败详情始终显示，不改变命令执行行为。",
  reasoning: "默认展开思考内容", reasoningHint: "仅显示提供商实际返回的内容。",
  restore: "恢复外观", restoreHint: "恢复原生渲染与默认显示选项，保留设置页面语言和聊天记录。", restoreAction: "恢复默认",
  loading: "正在读取 Chat Skins 设置…", loadError: "无法读取设置", loadErrorHint: "当前使用原生渲染，已保存的偏好未被覆盖。",
  retry: "重试", reload: "重新读取设置", reloadHint: "如果另一客户端保存了修改，请重新读取后再选择。",
  saveError: "修改未能保存", errorDetails: "技术详情", recovery: "重置无效设置", recoveryHint: "用默认值替换无效偏好，包括恢复英文；不影响聊天或模型。",
  sampleUser: "检查这个配置，并解释修改。",
  sampleAssistant: "配置已检查，原始内容保持不变。\n\n```ts\nconst appearance = \"chat-skins\";\n```\n\n这里只展示**消息样式**，不是模型或权限控件。",
  sampleTool: "示例命令 · 未实际执行", sampleCommand: "运行命令", sampleOutput: "npm run typecheck\n\n示例输出：类型检查完成。",
};
const hi: SettingsCopy = {
  composer: "संदेश इनपुट", composerStyling: "इनपुट की शैली", composerHint: "प्रयोगात्मक · केवल डेस्कटॉप। असली इनपुट और नियंत्रण की शैली बदलता है। Codex का स्तर स्लाइडर Paseo के उपलब्ध विकल्पों का उपयोग करता है।",
  composerOff: "मूल इनपुट शैली चालू है।", composerWaiting: "तैयार है। शैली देखने के लिए समर्थित डेस्कटॉप चैट खोलें।", composerActive: "समर्थित दिखाई देने वाले इनपुट पर लागू है।", composerUnsupported: "यह लेआउट समर्थित नहीं है। मूल इनपुट नहीं बदला गया।", composerConflict: "इस विंडो में Chat Skins के कई इंस्टेंस हैं। टकराव से बचने के लिए इनपुट शैली रोकी गई है।",
  credit: "serra द्वारा निर्मित",
  intro: "समर्थित चैट संदेशों का रूप चुनें। आपका मॉडल, अनुमतियाँ और बातचीत नहीं बदलेंगे।",
  language: "सेटिंग्स की भाषा", languageHint: "केवल इस पेज और पूर्वावलोकन पर लागू होती है, आपकी चैट या Paseo के इंटरफ़ेस पर नहीं।",
  scope: "अपने-आप सहेजा जाता है · इस होस्ट से जुड़े क्लाइंट में साझा सेटिंग्स",
  appearance: "दिखावट", skin: "चैट शैली", native: "Paseo मूल शैली",
  nativeHint: "Paseo के मूल संदेश प्रदर्शन को बनाए रखें।", codexHint: "गहरे रंग के उपयोगकर्ता संदेश, बिना बॉक्स के जवाब और गोल कोनों वाले कोड ब्लॉक।", claudeHint: "सरल टूल पंक्तियाँ और पढ़ने के लिए हल्का, सघन लेआउट।",
  saving: "सहेजा जा रहा है…", saved: "सहेजा गया", syncing: "सेटिंग्स सिंक हो रही हैं…", syncError: "सिंक नहीं हुआ। मूल संदेश प्रदर्शन चालू है।",
  preview: "पूर्वावलोकन दिखाएँ", hidePreview: "पूर्वावलोकन छिपाएँ", previewHint: "यह नमूना है, आपकी बातचीत नहीं। इसमें वास्तविक संदेश रेंडरर इस्तेमाल होता है।",
  previewNative: "शैली का पूर्वावलोकन देखने के लिए Codex या Claude Code चुनें।",
  reading: "पढ़ने की सुविधा", font: "अक्षरों का आकार", small: "छोटा · 14", reference: "मानक · 16", large: "बड़ा · 18",
  density: "पंक्तियों का अंतर", comfortable: "खुला", compact: "सघन", readingHint: "चैट शैली चुनने के बाद उपलब्ध है।",
  details: "संदेश का विवरण", tools: "कमांड का विवरण खोलकर दिखाएँ", toolsHint: "असफल कमांड का विवरण हमेशा दिखेगा। कमांड चलाने का तरीका नहीं बदलता।",
  reasoning: "विचार प्रक्रिया दिखाएँ", reasoningHint: "केवल प्रदाता द्वारा लौटाई गई सामग्री दिखाई जाती है।",
  restore: "दिखावट रीसेट करें", restoreHint: "मूल शैली और डिफ़ॉल्ट प्रदर्शन विकल्प वापस लाएँ। सेटिंग्स की भाषा और चैट इतिहास नहीं बदलेंगे।", restoreAction: "डिफ़ॉल्ट बहाल करें",
  loading: "Chat Skins सेटिंग्स लोड हो रही हैं…", loadError: "सेटिंग्स लोड नहीं हो सकीं", loadErrorHint: "मूल संदेश प्रदर्शन चालू है। आपकी सहेजी गई पसंद नहीं बदली गई है।",
  retry: "फिर कोशिश करें", reload: "सेटिंग्स फिर लोड करें", reloadHint: "अगर किसी दूसरे क्लाइंट ने बदलाव सहेजे हैं, तो दोबारा चुनने से पहले सेटिंग्स लोड करें।",
  saveError: "बदलाव सहेजे नहीं जा सके", errorDetails: "तकनीकी विवरण", recovery: "अमान्य सेटिंग्स रीसेट करें", recoveryHint: "अमान्य पसंद को डिफ़ॉल्ट से बदलें, भाषा भी अंग्रेज़ी हो जाएगी। चैट और मॉडल पर असर नहीं पड़ेगा।",
  sampleUser: "इस कॉन्फ़िगरेशन की जाँच करें और बदलाव समझाएँ।",
  sampleAssistant: "कॉन्फ़िगरेशन जाँचा गया है। मूल सामग्री नहीं बदली है।\n\n```ts\nconst appearance = \"chat-skins\";\n```\n\nयह **संदेश शैली** का पूर्वावलोकन है, मॉडल या अनुमति का नियंत्रण नहीं।",
  sampleTool: "नमूना कमांड · चलाया नहीं गया", sampleCommand: "कमांड चलाएँ", sampleOutput: "npm run typecheck\n\nनमूना आउटपुट: टाइप जाँच पूरी हुई।",
};
export const settingsCopy: Record<Language, SettingsCopy> = { en, "zh-CN": zh, hi };
export function copyFor(language: unknown): SettingsCopy {
  return settingsCopy[language === "zh-CN" || language === "hi" ? language : "en"];
}
export function skinOptions(c: SettingsCopy) {
  return [{ value: "native", label: c.native }, { value: "codex", label: "Codex" }, { value: "claude-code", label: "Claude Code" }] as const;
}
export function skinHint(skin: Preferences["skin"], c: SettingsCopy) {
  return skin === "codex" ? c.codexHint : skin === "claude-code" ? c.claudeHint : c.nativeHint;
}
