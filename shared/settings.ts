import { defineSettings } from "@getpaseo/plugin";
import { z } from "zod";

export const preferencesSchema = z.object({
  language: z.enum(["en", "zh-CN", "hi"]).default("en"),
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
  version: 2,
  schema: preferencesSchema,
  migrate: migratePreferences,
});

/** Add page language without resetting an existing skin or display preferences. */
export function migratePreferences(values: unknown, fromVersion: number): Preferences {
  if (fromVersion !== 1) throw new Error(`Unsupported settings version: ${fromVersion}`);
  return preferencesSchema.parse(values);
}

export function resetAppearance(values: Preferences): Preferences {
  return { ...defaultPreferences, language: values.language };
}
