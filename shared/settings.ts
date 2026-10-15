import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

export const preferencesSchema = z.object({
  language: z.enum(["en", "zh-CN", "hi"]).default("en"),
  composerStyling: z.boolean().default(false),
  skin: z.enum(["native", "codex", "claude-code"]).default("native"),
  fontSize: z.enum(["small", "reference", "large"]).default("reference"),
  density: z.enum(["comfortable", "compact"]).default("comfortable"),
  toolsExpanded: z.boolean().default(false),
  reasoningExpanded: z.boolean().default(false),
});
export type Preferences = z.output<typeof preferencesSchema>;
export const defaultPreferences: Preferences = preferencesSchema.parse({});
export const preferences = defineSettings({
  id: "appearance",
  scope: "host",
  version: 3,
  schema: preferencesSchema,
  migrate: migratePreferences,
});

/** Add missing language and opt-in composer styling without resetting existing preferences. */
export function migratePreferences(values: unknown, fromVersion: number): Preferences {
  if (fromVersion !== 1 && fromVersion !== 2) throw new Error(`Unsupported settings version: ${fromVersion}`);
  return preferencesSchema.parse(values);
}

export function resetAppearance(values: Preferences): Preferences {
  return { ...defaultPreferences, language: values.language };
}
