import { settingsRpc } from "@getpaseo/plugin";
import type { PluginClientContext } from "@getpaseo/plugin/client";
import { preferences, preferencesSchema, defaultPreferences } from "../shared/settings.ts";
import type { Preferences } from "../shared/settings.ts";

type State = { status: "loading" | "ready" | "error"; values: Preferences; error: string | null };

/** Per-installation state. Never a module-global store shared between hosts. */
export function createRuntime(client: PluginClientContext, activate: () => () => void) {
  let state: State = { status: "loading", values: defaultPreferences, error: null };
  let disposed = false;
  let generation = 0;
  let deactivate: (() => void) | undefined;
  const listeners = new Set<() => void>();
  const publish = (next: State) => {
    if (disposed) return;
    const enabled = next.status === "ready" && next.values.skin !== "native";
    if (!enabled || next.values.skin !== state.values.skin) { deactivate?.(); deactivate = undefined; }
    state = next;
    if (enabled && !deactivate) deactivate = activate();
    for (const listener of listeners) listener();
  };
  const fail = (error: unknown) => publish({
    status: "error", values: defaultPreferences,
    error: error instanceof Error ? error.message : String(error),
  });
  const refresh = async () => {
    const request = ++generation;
    try {
      const result = await client.rpc(settingsRpc(preferences.id).read, {});
      if (disposed || request !== generation) return;
      if (result.status !== "ready") throw new Error(result.error);
      publish({ status: "ready", values: preferencesSchema.parse(result.values), error: null });
    } catch (error) {
      if (!disposed && request === generation) fail(error);
    }
  };
  const observation = client.paseo.observeEvents(["status.plugin_settings_changed"]);
  const unsubscribe = observation.subscribe({
    snapshot: () => { void refresh(); }, // Includes reconnect: always re-read authoritative settings.
    update: (message) => {
      if (message.type === "status" && message.payload.status === "plugin_settings_changed" &&
          message.payload.settingsId === preferences.id) void refresh();
      // Read is installation-scoped even if another plugin uses the same settings ID.
    },
    error: (error) => { generation++; fail(error); },
  });
  void observation.ready.then(() => refresh()).catch((error: unknown) => {
    generation++; if (!disposed) fail(error);
  });
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    refresh,
    dispose: async () => {
      disposed = true; generation++; unsubscribe(); deactivate?.(); listeners.clear();
      await observation.release();
    },
  };
}
export type SkinRuntime = ReturnType<typeof createRuntime>;
