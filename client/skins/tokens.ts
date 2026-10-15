import type { PluginTheme } from "@getpaseo/plugin";
import type { Preferences } from "../../shared/settings.ts";

export function tokens(theme: PluginTheme, preferences: Preferences, compact: boolean) {
  const claude = preferences.skin === "claude-code";
  const fontSize = { small: 14, reference: 16, large: 18 }[preferences.fontSize];
  return {
    colors: theme.colors,
    fontSize,
    lineHeight: Math.round(fontSize * (claude ? 1.65 : 1.6)),
    gap: preferences.density === "compact" ? 10 : claude ? 18 : 20,
    codeRadius: claude ? 12 : 20,
    padding: compact ? 12 : 18,
    claude,
  };
}
export type SkinTokens = ReturnType<typeof tokens>;
