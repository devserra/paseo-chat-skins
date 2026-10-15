import type { PluginClientContext } from "@getpaseo/plugin/client";

export interface AgentAppearance {
  workspaceId: string;
  fastMode: boolean | null;
}
export interface AgentAppearanceState {
  watch(agentId: string): () => void;
  get(agentId: string): AgentAppearance | undefined;
  subscribe(listener: () => void): () => void;
  dispose(): void;
}

/** Public SDK snapshots only. No provider writes or private React inspection. */
export function createAgentAppearanceState(client: PluginClientContext): AgentAppearanceState {
  const entries = new Map<string, { count: number; value?: AgentAppearance; unsubscribe(): void }>();
  const listeners = new Set<() => void>();
  let disposed = false;
  return {
    watch(agentId) {
      if (disposed) return () => {};
      let entry = entries.get(agentId);
      if (entry) { entry.count++; for (const listener of listeners) listener(); }
      else {
        const handle = client.paseo.agents.ref(agentId);
        const created: { count: number; value?: AgentAppearance; unsubscribe(): void } = { count: 1, unsubscribe() {} };
        entries.set(agentId, created); entry = created;
        let revision = 0;
        const update = (snapshot: ReturnType<typeof handle.current>) => {
          if (disposed || entries.get(agentId) !== created) return;
          if (!snapshot || typeof snapshot.workspaceId !== "string") { delete created.value; for (const listener of listeners) listener(); return; }
          const feature = snapshot.features?.find((item) => item.id === "fast_mode");
          created.value = { workspaceId: snapshot.workspaceId, fastMode: feature?.type === "toggle" ? feature.value : null };
          for (const listener of listeners) listener();
        };
        created.unsubscribe = handle.subscribe((event) => {
          if (disposed || entries.get(agentId) !== created) return;
          revision++;
          if (event.kind === "upsert") update(event.agent);
          else { delete created.value; for (const listener of listeners) listener(); }
        });
        const initialRevision = revision;
        void handle.refresh().then(() => { if (revision === initialRevision) update(handle.current()); }).catch(() => {
          if (entries.get(agentId) !== created || revision !== initialRevision) return;
          delete created.value; for (const listener of listeners) listener();
        });
      }
      const owned = entry; let released = false;
      return () => { if (released || entries.get(agentId) !== owned) return; released = true; if (--owned.count === 0) { owned.unsubscribe(); entries.delete(agentId); for (const listener of listeners) listener(); } };
    },
    get: (id) => entries.get(id)?.value,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    dispose() { disposed = true; for (const entry of entries.values()) entry.unsubscribe(); entries.clear(); listeners.clear(); },
  };
}
