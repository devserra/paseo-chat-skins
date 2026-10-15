import type { PluginServerContext } from "@getpaseo/plugin/server";
import { preferences } from "./shared/settings";

export default function contribute(server: PluginServerContext): () => void {
  const settings = server.registerSettings(preferences);
  // Validate/migrate once at load, even when no client has opened Settings yet.
  // Invalid data stays intact; the settings page provides explicit recovery.
  void settings.read().then((state) => {
    if (state.status === "invalid") console.warn("Chat Skins: saved preferences are invalid; original data retained.");
  }).catch(() => {
    console.warn("Chat Skins: settings initialization failed; original data retained.");
  });
  return () => {};
}
