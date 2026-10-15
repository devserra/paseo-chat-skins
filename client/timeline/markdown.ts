/** Small lossless renderer model: unsupported syntax stays visible as source text. */
export type Block =
  | { kind: "paragraph" | "heading" | "quote"; text: string; level?: number }
  | { kind: "code"; text: string; language: string }
  | { kind: "list"; items: string[]; ordered: boolean; start: number }
  | { kind: "rule" };
export type Inline = { kind: "text" | "code" | "strong" | "em"; text: string } |
  { kind: "link"; text: string; href: string };

export function safeUrl(href: string): boolean {
  return /^https?:\/\/[^\s<>]+$/i.test(href);
}
export function inline(text: string): Inline[] {
  const result: Inline[] = [];
  // Bounded, non-recursive. No HTML execution, automatic local-file opening or code execution.
  const pattern = /`([^`\n]+)`|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)|\*([^*\n]+)\*/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index;
    if (index > cursor) result.push({ kind: "text", text: text.slice(cursor, index) });
    if (match[1] !== undefined) result.push({ kind: "code", text: match[1] });
    else if (match[2] !== undefined || match[3] !== undefined) result.push({ kind: "strong", text: match[2] ?? match[3] ?? "" });
    else if (match[4] !== undefined && match[5] !== undefined) result.push({ kind: "link", text: match[4], href: match[5] });
    else result.push({ kind: "em", text: match[6] ?? "" });
    cursor = index + match[0].length;
  }
  if (cursor < text.length) result.push({ kind: "text", text: text.slice(cursor) });
  return result;
}

export function blocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) { i++; continue; }
    const fence = /^\s{0,3}(`{3,}|~{3,})([^ ]*)\s*$/.exec(line);
    if (fence) {
      const marker = fence[1] ?? "```";
      const body: string[] = []; i++;
      const close = new RegExp(`^\\s{0,3}${marker[0]}{${marker.length},}\\s*$`);
      while (i < lines.length && !close.test(lines[i] ?? "")) body.push(lines[i++] ?? "");
      if (i < lines.length) i++;
      out.push({ kind: "code", text: body.join("\n"), language: fence[2] ?? "" }); continue;
    }
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) { out.push({ kind: "heading", level: heading[1]?.length ?? 1, text: heading[2] ?? "" }); i++; continue; }
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push({ kind: "rule" }); i++; continue; }
    const list = /^(?:([-+*])\s+|(\d+)\.\s+)(.*)$/.exec(line);
    if (list) {
      const ordered = list[2] !== undefined; const items = [list[3] ?? ""]; const start = Number(list[2] ?? 1); i++;
      const next = ordered ? /^\d+\.\s+(.*)$/ : /^[-+*]\s+(.*)$/;
      while (i < lines.length) { const m = next.exec(lines[i] ?? ""); if (!m) break; items.push(m[1] ?? ""); i++; }
      out.push({ kind: "list", ordered, items, start }); continue;
    }
    if (/^>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i] ?? "")) body.push((lines[i++] ?? "").replace(/^>\s?/, ""));
      out.push({ kind: "quote", text: body.join("\n") }); continue;
    }
    const body = [line]; i++;
    while (i < lines.length && (lines[i] ?? "").trim() && !/^(?:#{1,6}\s|>|[-+*]\s|\d+\.\s|\s{0,3}`{3}|\s{0,3}~{3}|-{3,}$)/.test(lines[i] ?? "")) body.push(lines[i++] ?? "");
    out.push({ kind: "paragraph", text: body.join("\n") });
  }
  return out;
}

/** Attachment/file actions and rich markdown stay host-owned rather than being silently lost. */
export function canRenderText(text: string): boolean {
  if (!text.trim() || text.length > 60_000) return false;
  const prose = blocks(text).filter((b) => b.kind !== "code").map((b) => "text" in b ? b.text : b.kind === "list" ? b.items.join("\n") : "").join("\n");
  return !(/!\[|<[^>]*>|\]\((?!https?:\/\/)|\[\^|\[\[|\uE200|\uE202|\uE206|^\s*\|.*\|\s*$|^\s*\[.*\]:|attachment:|sandbox:|file:\/\//m.test(prose));
}
