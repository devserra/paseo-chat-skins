import { z } from "zod";
import type { AgentTimelineItem } from "@getpaseo/protocol/agent-types";
import type { PluginTimelineTransformResult } from "@getpaseo/plugin";
import { canRenderText } from "./markdown.ts";

export const rowSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.enum(["user", "assistant", "reasoning"]), text: z.string(), phase: z.enum(["streaming", "complete"]) }),
  z.object({ kind: z.literal("tool"), name: z.string(), label: z.string(), detail: z.string(), status: z.enum(["running", "completed", "failed", "canceled"]), error: z.string().nullable() }),
]);
export type Row = z.output<typeof rowSchema>;
function output(data: Row): PluginTimelineTransformResult {
  return { items: [{ type: "plugin", kind: "chat-skins-row", version: 1, data }] };
}
function stringify(value: unknown): string {
  if (typeof value === "string") return value;
  try { return JSON.stringify(value, null, 2) ?? String(value); } catch { return String(value); }
}
export function transform(item: AgentTimelineItem, phase: "streaming" | "complete"): PluginTimelineTransformResult | undefined {
  if (item.type === "user_message" || item.type === "assistant_message" || item.type === "reasoning") {
    if (!canRenderText(item.text)) return undefined;
    return output({ kind: item.type === "user_message" ? "user" : item.type === "reasoning" ? "reasoning" : "assistant", text: item.text, phase });
  }
  if (item.type !== "tool_call") return undefined;
  // Keep unknown tools, edits, attachments, approvals and host actions entirely native.
  const detail = item.detail;
  if (detail.type !== "shell") return undefined;
  // Metadata can carry provider-specific actions or resources; do not discard it.
  if (item.metadata && Object.keys(item.metadata).length) return undefined;
  const { command, cwd, output: stdout, exitCode } = detail;
  const body = [command, ...(cwd ? [`工作目录: ${cwd}`] : []), ...(stdout !== undefined ? [stdout] : []), ...(exitCode !== undefined && exitCode !== null ? [`退出码: ${exitCode}`] : [])].join("\n\n");
  if (body.length > 40_000) return undefined;
  const failed = item.status === "failed" || (item.status === "completed" && exitCode !== undefined && exitCode !== null && exitCode !== 0);
  return output({ kind: "tool", name: item.name, label: "运行命令", detail: body,
    status: failed ? "failed" : item.status,
    error: item.status === "failed" ? stringify(item.error) : failed ? `命令退出码为 ${exitCode}` : null });
}
