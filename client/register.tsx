import { useSyncExternalStore } from "react";
import type { PluginClientContext, PluginTimelineItemProps } from "@getpaseo/plugin/client";
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
  function Renderer({ item, theme, layout }: PluginTimelineItemProps<Row>) {
    const state = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
    return <ChatRow row={item.data} preferences={state.values} t={tokens(theme, state.values, layout.compact)} />;
  }
  const remove = [
    client.addTimelineRenderer({ kind: "chat-skins-row", version: 1, schema: rowSchema, Component: Renderer }),
    client.addSettingsScreen({ id: "appearance", title: SETTINGS_TITLE, icon: "Palette", Component: createSettingsScreen(runtime) }),
    client.addCommandCenterItem({ id: "open-settings", title: SETTINGS_TITLE, icon: "Palette", context: "global", onSelect: ({ openSettings }) => openSettings("appearance") }),
  ];
  return async () => { await runtime.dispose(); for (const dispose of remove.reverse()) dispose(); };
}
