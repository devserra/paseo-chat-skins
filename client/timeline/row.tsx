import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Icon, copyText, useRevealedText } from "@getpaseo/plugin/client/react-native";
import { openExternalUrl } from "@getpaseo/plugin/client";
import { blocks, inline } from "./markdown";
import type { Row } from "./model";
import type { SkinTokens } from "../skins/tokens";
import type { Preferences } from "../../shared/settings";

import { rowText } from "../i18n/rows";
import type { RowText } from "../i18n/rows";

const RowTextContext = createContext<RowText>(rowText["zh-CN"]);
const mono = Platform.OS === "ios" || Platform.OS === "macos" || Platform.OS === "web" ? "Menlo, monospace" : "monospace";

function CopyButton({ text, colors }: { text: string; colors: SkinTokens["colors"] }) {
  const labels = useContext(RowTextContext);
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  useEffect(() => { setState("idle"); }, [text]);
  return <View style={{ alignItems: "flex-end" }}>
    <Pressable accessibilityRole="button" accessibilityLabel={state === "copied" ? labels.copied : labels.copy}
      onPress={() => { void copyText(text).then(() => setState("copied"), () => setState("error")); }}
      style={({ pressed }) => ({ padding: 10, borderRadius: 8, backgroundColor: pressed ? colors.surface2 : "transparent" })}>
      <Icon name={state === "copied" ? "Check" : "Copy"} size={16} color={colors.foregroundMuted} />
    </Pressable>
    {state === "error" && <Text accessibilityRole="alert" style={{ color: colors.statusDanger, fontSize: 12 }}>{labels.copyFailed}</Text>}
  </View>;
}
function InlineText({ text, t }: { text: string; t: SkinTokens }) {
  const labels = useContext(RowTextContext);
  const [error, setError] = useState(false);
  return <Text selectable style={{ color: t.colors.foreground, fontSize: t.fontSize, lineHeight: t.lineHeight }}>
    {inline(text).map((part, index) => {
      if (part.kind === "link") return <Text key={index} accessibilityRole="link" accessibilityLabel={`${part.text}，${part.href}`}
        style={{ color: t.colors.accent, textDecorationLine: "underline" }}
        onPress={() => { void openExternalUrl(part.href).catch(() => setError(true)); }}>{part.text}</Text>;
      return <Text key={index} style={part.kind === "code" ? { fontFamily: mono, backgroundColor: t.colors.surface2 } :
        part.kind === "strong" ? { fontWeight: "600" } : part.kind === "em" ? { fontStyle: "italic" } : {}}>{part.text}</Text>;
    })}
    {error && <Text style={{ color: t.colors.statusDanger }}>{labels.linkFailed}</Text>}
  </Text>;
}
function CodeBlock({ text, language, t }: { text: string; language: string; t: SkinTokens }) {
  const labels = useContext(RowTextContext);
  return <View style={{ backgroundColor: t.colors.surface1, borderColor: t.colors.border, borderWidth: 1, borderRadius: t.codeRadius, overflow: "hidden" }}>
    <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: t.padding, paddingRight: 4, paddingTop: 4 }}>
      <Icon name="Code" size={16} color={t.colors.foregroundMuted} />
      <Text style={{ flex: 1, marginLeft: 8, color: t.colors.foreground, fontSize: 13 }}>{language || labels.code}</Text>
      <CopyButton text={text} colors={t.colors} />
    </View>
    <ScrollView horizontal accessibilityLabel={labels.codeScroll}>
      <Text selectable style={{ fontFamily: mono, fontSize: t.fontSize - 1, lineHeight: t.lineHeight, color: t.colors.foreground, padding: t.padding, paddingTop: 8 }}>{text}</Text>
    </ScrollView>
  </View>;
}
function Markdown({ text, t }: { text: string; t: SkinTokens }) {
  return <View style={{ gap: t.gap, minWidth: 0 }}>
    {blocks(text).map((block, index) => {
      if (block.kind === "code") return <CodeBlock key={index} text={block.text} language={block.language} t={t} />;
      if (block.kind === "rule") return <View key={index} style={{ height: 1, backgroundColor: t.colors.border }} />;
      if (block.kind === "list") return <View key={index} style={{ gap: 6 }}>{block.items.map((item, itemIndex) =>
        <View key={itemIndex} style={{ flexDirection: "row", gap: 8 }}>
          <Text style={{ width: 26, textAlign: "right", fontSize: t.fontSize, lineHeight: t.lineHeight, color: t.colors.foreground }}>{block.ordered ? `${block.start + itemIndex}.` : "•"}</Text>
          <View style={{ flex: 1, minWidth: 0 }}><InlineText text={item} t={t} /></View>
        </View>)}</View>;
      if (block.kind === "heading") return <Text key={index} selectable accessibilityRole="header" style={{ color: t.colors.foreground, fontWeight: "600", fontSize: t.fontSize + Math.max(2, 10 - (block.level ?? 1) * 2), lineHeight: t.lineHeight + 6, marginTop: 8 }}>{block.text}</Text>;
      return <View key={index} style={block.kind === "quote" ? { borderLeftWidth: 1, borderLeftColor: t.colors.border, paddingLeft: 16 } : {}}><InlineText text={block.text} t={t} /></View>;
    })}
  </View>;
}

type ChatRowProps = { row: Row; t: SkinTokens; preferences: Preferences };
/** Language is explicit for settings previews; live conversation controls keep their existing language. */
export function ChatRow({ language = "zh-CN", ...props }: ChatRowProps & { language?: Preferences["language"] }) {
  return <RowTextContext.Provider value={rowText[language]}><ChatRowBody {...props} /></RowTextContext.Provider>;
}
function ChatRowBody({ row, t, preferences }: ChatRowProps) {
  const labels = useContext(RowTextContext);
  const initialExpanded = row.kind === "tool" ? preferences.toolsExpanded : preferences.reasoningExpanded;
  const [expanded, setExpanded] = useState(initialExpanded);
  useEffect(() => setExpanded(initialExpanded), [initialExpanded, preferences.skin]);
  const sourceText = row.kind === "tool" ? "" : row.text;
  const phase = row.kind === "tool" ? "complete" : row.phase;
  const revealed = useRevealedText(sourceText, phase);
  if (row.kind === "user") return <View style={{ alignItems: "flex-end", paddingVertical: 8 }}>
    <View style={{ maxWidth: "85%", backgroundColor: t.colors.foreground, borderRadius: 20, paddingHorizontal: t.padding, paddingVertical: 12 }}>
      <Text selectable style={{ color: t.colors.surface0, fontSize: t.fontSize, lineHeight: t.lineHeight }}>{row.text}</Text>
    </View>
  </View>;
  if (row.kind === "assistant") return <View style={{ paddingVertical: t.gap / 2, minWidth: 0 }}>
    <Markdown text={revealed} t={t} />
    <View style={{ flexDirection: "row", marginTop: 8 }}><CopyButton text={row.text} colors={t.colors} /></View>
  </View>;
  const tool = row.kind === "tool";
  const failed = tool && row.status === "failed";
  const running = tool ? row.status === "running" : row.phase === "streaming";
  const open = expanded || failed;
  const status = tool ? labels[row.status] : running ? labels.thinking : labels.reasoning;
  return <View style={{ paddingVertical: 8, gap: 8 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${tool ? row.label : labels.reasoning}, ${status}, ${open ? labels.collapse : labels.expand}`}
      accessibilityState={{ expanded: open, disabled: failed }} disabled={failed}
      onPress={() => setExpanded(!expanded)}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, opacity: pressed ? 0.7 : 1 })}>
      {running ? <ActivityIndicator size="small" color={t.colors.accent} /> :
        <Icon name={failed ? "CircleAlert" : open ? "ChevronDown" : "ChevronRight"} size={16} color={failed ? t.colors.statusDanger : t.colors.foregroundMuted} />}
      <Text style={{ flex: 1, color: failed ? t.colors.statusDanger : t.colors.foregroundMuted, fontSize: t.fontSize - 1, lineHeight: t.lineHeight }}>{tool ? `${row.label} · ${status}` : status}</Text>
    </Pressable>
    {open && (tool ? <View style={{ gap: 8 }}>
      <Text selectable style={{ color: t.colors.foregroundMuted, fontSize: 12 }}>{row.name}</Text>
      <CodeBlock text={row.detail} language="shell" t={t} />
      {failed && <Text selectable accessibilityRole="alert" style={{ color: t.colors.statusDanger, fontSize: t.fontSize, lineHeight: t.lineHeight }}>{row.error}</Text>}
    </View> : <Markdown text={revealed} t={t} />)}
  </View>;
}
