export type SkinId = "native" | "codex" | "claude-code";
export const skins = [
  { id: "native", name: "Paseo 原生", description: "不替换任何消息，保留宿主原始渲染。" },
  { id: "codex", name: "Codex", description: "黑色用户气泡、清晰正文与圆角代码块。" },
  { id: "claude-code", name: "Claude Code", description: "轻量正文、低强调工具行与更紧凑的节奏。" },
] as const;
