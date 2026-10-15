import type { PluginClientContext } from "@getpaseo/plugin/client";
import { registerChatSkins } from "./client/register";

export default function contribute(client: PluginClientContext): () => Promise<void> {
  return registerChatSkins(client);
}
