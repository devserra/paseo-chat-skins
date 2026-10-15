import { useEffect, useSyncExternalStore } from "react";
import { View } from "react-native";
import { createAgentAppearanceState } from "./agent-state";
import type { PluginClientContext, PluginTimelineItemProps } from "@getpaseo/plugin/client";
import { installComposerStyling } from "./web";
import { createRuntime } from "./runtime";
import { rowSchema, transform } from "./timeline/model";
import type { Row } from "./timeline/model";
import { ChatRow } from "./timeline/row";
import { tokens } from "./skins/tokens";
import { SETTINGS_TITLE } from "./i18n/settings";
import { createSettingsScreen } from "./settings/screen";

export function registerChatSkins(client: PluginClientContext): () => Promise<void> {
  const runtime = createRuntime(client, () => {
    const remove = [
      client.addTimelineTransformer({ id: "skin-user", query: { itemType: "user_message" },
        transform: ({ item, phase }) => runtime.getSnapshot().values.skin === "codex" ? transform(item, phase) : undefined }),
      client.addTimelineTransformer({ id: "skin-assistant", query: { itemType: "assistant_message" },
        transform: ({ item, phase }) => transform(item, phase) }),
      client.addTimelineTransformer({ id: "skin-reasoning", query: { itemType: "reasoning" },
        transform: ({ item, phase }) => transform(item, phase) }),
      client.addTimelineTransformer({ id: "skin-tool", query: { itemType: "tool_call" },
        transform: ({ item, phase }) => transform(item, phase) }),
    ];
    return () => { for (const dispose of remove) dispose(); };
  });
  const agentAppearance = createAgentAppearanceState(client);
  const composer = installComposerStyling(runtime, agentAppearance);
  function Renderer({ item, theme, layout, host, agentId }: PluginTimelineItemProps<Row>) {
    useEffect(() => composer.bindHost(host.id), [host.id]);
    const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
    useEffect(() => {
      if (state.status === "ready" && state.values.composerStyling && state.values.skin === "claude-code") return composer.watchAgent(agentId);
    }, [agentId, state.status, state.values.composerStyling, state.values.skin]);
    const row = <ChatRow row={item.data} preferences={state.values} t={tokens(theme, state.values, layout.compact)} />;
    return state.values.skin === "claude-code" && state.values.composerStyling
      ? <View testID={`chat-skins-agent-${agentId}`} collapsable={false} style={{ minWidth: 0 }}>{row}</View>
      : row;
  }
  const remove = [
    client.addTimelineRenderer({ kind: "chat-skins-row", version: 1, schema: rowSchema, Component: Renderer }),
    client.addSettingsScreen({ id: "appearance", title: SETTINGS_TITLE, icon: "Palette", Component: createSettingsScreen(runtime, composer) }),
    client.addCommandCenterItem({ id: "open-settings", title: SETTINGS_TITLE, icon: "Palette", context: "global", onSelect: ({ openSettings }) => openSettings("appearance") }),
  ];
  return async () => { composer.dispose(); agentAppearance.dispose(); await runtime.dispose(); for (const dispose of remove.reverse()) dispose(); };
}
