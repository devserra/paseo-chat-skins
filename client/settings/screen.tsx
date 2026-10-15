import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { PluginSurfaceProps } from "@getpaseo/plugin/client";
import { useSettings } from "@getpaseo/plugin/client";
import { ExternalLink, SettingsAction, SettingsCard, SettingsSection, SettingsSelect, SettingsSwitch } from "@getpaseo/plugin/client/ui";
import { Icon } from "@getpaseo/plugin/client/react-native";
import { Pressable, Text, View } from "react-native";
import { preferences as definition, resetAppearance } from "../../shared/settings";
import type { Preferences } from "../../shared/settings";
import { copyFor, languages, skinHint, skinOptions } from "../i18n/settings";
import { ChatRow } from "../timeline/row";
import { tokens } from "../skins/tokens";
import type { SkinRuntime } from "../runtime";

type DisclosureProps = {
  title: string; openTitle?: string; open: boolean; onPress(): void;
  theme: PluginSurfaceProps["theme"]; children: ReactNode;
};
function Disclosure({ title, openTitle, open, onPress, theme, children }: DisclosureProps) {
  return <View style={{ gap: open ? 12 : 0 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={open ? openTitle ?? title : title}
      accessibilityState={{ expanded: open }} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, opacity: pressed ? 0.7 : 1 })}>
      <Icon name={open ? "ChevronDown" : "ChevronRight"} size={16} color={theme.colors.foregroundMuted} />
      <Text style={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 22, flexShrink: 1 }}>{open ? openTitle ?? title : title}</Text>
    </Pressable>
    {open && children}
  </View>;
}

export function createSettingsScreen(runtime: SkinRuntime) {
  return function SettingsScreen({ theme, layout }: PluginSurfaceProps) {
    const settings = useSettings(definition);
    const applied = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
    const [busy, setBusy] = useState(false);
    const pending = useRef(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [knownLanguage, setKnownLanguage] = useState<Preferences["language"]>("en");
    const savedLanguage = settings.status === "ready" ? settings.values.language : undefined;
    useEffect(() => { if (savedLanguage) setKnownLanguage(savedLanguage); }, [savedLanguage]);
    const language = savedLanguage ?? knownLanguage;
    const c = copyFor(language);
    const disabled = busy || settings.saving;
    const textStyle = { color: theme.colors.foregroundMuted, fontSize: 14, lineHeight: 23 };
    const save = async (patch: Partial<Preferences>) => {
      if (settings.status !== "ready" || pending.current || settings.saving) return;
      pending.current = true; setBusy(true);
      try { if (await settings.save({ ...settings.values, ...patch }, settings.revision)) await runtime.refresh(); }
      finally { pending.current = false; setBusy(false); }
    };
    const reset = async () => {
      if (pending.current || settings.saving) return;
      pending.current = true; setBusy(true);
      try {
        const ok = settings.status === "ready"
          ? await settings.save(resetAppearance(settings.values), settings.revision)
          : await settings.reset();
        if (ok) await runtime.refresh();
      } finally { pending.current = false; setBusy(false); }
    };
    const reload = () => { void settings.reload(); void runtime.refresh(); };
    const errorDetails = (error: string) => <Disclosure title={c.errorDetails} open={errorOpen} onPress={() => setErrorOpen(!errorOpen)} theme={theme}>
      <Text selectable style={textStyle}>{error}</Text>
    </Disclosure>;
    if (settings.status === "loading") return <Text accessibilityLiveRegion="polite" style={textStyle}>{c.loading}</Text>;
    if (settings.status !== "ready") return <View style={{ gap: 16 }}>
      <Text accessibilityRole="alert" style={{ color: theme.colors.statusDanger, fontSize: 16 }}>{c.loadError}</Text>
      <Text style={textStyle}>{c.loadErrorHint}</Text>
      {errorDetails(settings.error)}
      <SettingsAction label={c.reload} actionLabel={c.retry} onPress={reload} disabled={disabled} />
      {settings.status === "invalid" && <SettingsAction label={c.recovery} hint={c.recoveryHint} actionLabel={c.restoreAction} disabled={disabled} onPress={() => { void reset(); }} />}
      {settings.saveError && <Text accessibilityRole="alert" style={{ ...textStyle, color: theme.colors.statusDanger }}>{c.saveError}</Text>}
    </View>;
    const p = settings.values;
    const t = tokens(theme, p, layout.compact);
    const options = skinOptions(c);
    const status = disabled ? c.saving : applied.status === "ready" ? c.saved : applied.status === "error" ? c.syncError : c.syncing;
    return <View style={{ gap: 24, paddingBottom: 24, minWidth: 0 }}>
      <Text style={textStyle}>{c.intro}</Text>
      <SettingsCard>
        <SettingsSelect label={c.language} hint={c.languageHint} value={language} options={languages} disabled={disabled} onValueChange={(language) => { void save({ language }); }} />
      </SettingsCard>
      <SettingsSection title={c.appearance}>
        <SettingsCard>
          <SettingsSelect label={c.skin} hint={skinHint(p.skin, c)} value={p.skin} options={options} disabled={disabled} onValueChange={(skin) => { void save({ skin }); }} />
        </SettingsCard>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 10 }}>
          <Icon name={applied.status === "error" ? "CircleAlert" : disabled ? "Loader" : "Check"} size={14} color={theme.colors.foregroundMuted} />
          <Text accessibilityLiveRegion="polite" style={textStyle}>{status}</Text>
        </View>
        <Text style={{ ...textStyle, marginTop: 4 }}>{c.scope}</Text>
        {settings.saveError && <View style={{ gap: 8, marginTop: 12 }}>
          <Text accessibilityRole="alert" style={{ ...textStyle, color: theme.colors.statusDanger }}>{c.saveError}</Text>
          {errorDetails(settings.saveError)}
          <SettingsAction label={c.reload} hint={c.reloadHint} actionLabel={c.retry} onPress={reload} disabled={disabled} />
        </View>}
        {applied.error && errorDetails(applied.error)}
        {p.skin === "native" ? <Text style={{ ...textStyle, marginTop: 12 }}>{c.previewNative}</Text> :
          <Disclosure title={c.preview} openTitle={c.hidePreview} open={previewOpen} onPress={() => setPreviewOpen(!previewOpen)} theme={theme}>
            <Text style={textStyle}>{c.previewHint}</Text>
            <View style={{ backgroundColor: theme.colors.surface0, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, padding: layout.compact ? 12 : 20 }}>
              {p.skin === "codex" && <ChatRow row={{ kind: "user", text: c.sampleUser, phase: "complete" }} preferences={p} t={t} language={language} />}
              <ChatRow row={{ kind: "assistant", text: c.sampleAssistant, phase: "complete" }} preferences={p} t={t} language={language} />
              <ChatRow row={{ kind: "tool", name: c.sampleTool, label: c.sampleCommand, detail: c.sampleOutput, status: "completed", error: null }} preferences={p} t={t} language={language} />
            </View>
          </Disclosure>}
      </SettingsSection>
      <SettingsSection title={c.reading}>
        {p.skin === "native" && <Text style={textStyle}>{c.readingHint}</Text>}
        <SettingsCard>
          <SettingsSelect label={c.font} value={p.fontSize} options={[{ value: "small", label: c.small }, { value: "reference", label: c.reference }, { value: "large", label: c.large }]} disabled={disabled || p.skin === "native"} onValueChange={(fontSize) => { void save({ fontSize }); }} />
          <SettingsSelect label={c.density} value={p.density} options={[{ value: "comfortable", label: c.comfortable }, { value: "compact", label: c.compact }]} disabled={disabled || p.skin === "native"} onValueChange={(density) => { void save({ density }); }} />
        </SettingsCard>
      </SettingsSection>
      <SettingsSection title={c.details}>
        <SettingsCard>
          <SettingsSwitch label={c.tools} hint={c.toolsHint} value={p.toolsExpanded} disabled={disabled || p.skin === "native"} onValueChange={(toolsExpanded) => { void save({ toolsExpanded }); }} />
          <SettingsSwitch label={c.reasoning} hint={c.reasoningHint} value={p.reasoningExpanded} disabled={disabled || p.skin === "native"} onValueChange={(reasoningExpanded) => { void save({ reasoningExpanded }); }} />
        </SettingsCard>
      </SettingsSection>
      <SettingsAction label={c.restore} hint={c.restoreHint} actionLabel={c.restoreAction} disabled={disabled} onPress={() => { void reset(); }} />
      <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: 16, alignItems: "center" }}>
        <ExternalLink href="https://serra.dev" accessibilityLabel={`${c.credit} — https://serra.dev`}>
          <Text style={{ color: theme.colors.foregroundMuted, fontSize: 13, lineHeight: 22, textDecorationLine: "underline" }}>{c.credit}</Text>
        </ExternalLink>
      </View>
    </View>;
  };
}
