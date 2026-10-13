// Export functionality for typora-web.
// Supports Markdown (.md), PDF (.pdf), and Word (.docx).
// 100% client-side, zero backend dependency.

import type { Editor } from "../src/lib.ts";

/**
 * Intelligently derives a clean document filename from the markdown content.
 * Prioritizes the first # title, then any heading, then first text line, fallback to "未命名文档".
 */
export function deriveTitle(markdown: string): string {
  // 1. Try finding the first # H1 heading
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match[1].trim()) {
    return sanitizeFilename(h1Match[1].trim());
  }
  // 2. Try finding any level heading (##, ###, etc.)
  const anyHMatch = markdown.match(/^#{1,6}\s+(.+)$/m);
  if (anyHMatch && anyHMatch[1].trim()) {
    return sanitizeFilename(anyHMatch[1].trim());
  }
  // 3. Try finding the first non-empty prose line
  const lines = markdown.split("\n");
  for (const line of lines) {
    const trimmed = line.replace(/^[#>\-*_~`\s]+/, "").trim();
    if (trimmed) {
      return sanitizeFilename(trimmed.slice(0, 24));
    }
  }
  return "未命名文档";
}

function sanitizeFilename(name: string): string {
  // Strip characters forbidden in common file systems
  const cleaned = name
    .replace(/[\\/:*?"<>|\r\n\t]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "未命名文档";
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 120);
}

/**
 * Export 1: Native Markdown (.md)
 */
export function exportMarkdown(editor: Editor): void {
  const md = editor.getMarkdown();
  const filename = `${deriveTitle(md)}.md`;
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, filename);
}

/**
 * Export 2: Vector PDF (.pdf) via native browser print & @media print CSS
 */
export function exportPdf(editor: Editor): void {
  const md = editor.getMarkdown();
  const title = deriveTitle(md);
  const oldTitle = document.title;

  const wasSource = editor.isSourceMode();
  if (wasSource) {
    editor.toggleSource();
  }

  try {
    document.title = title;
    window.print();
  } finally {
    document.title = oldTitle;
    if (wasSource) {
      editor.toggleSource();
    }
  }
}

/**
 * Export 3: Word Document (.docx) via html-docx-js-typescript AltChunk package
 */
export async function exportDocx(editor: Editor): Promise<void> {
  const md = editor.getMarkdown();
  const title = deriveTitle(md);
  const filename = `${title}.docx`;

  // Clone rendered editor DOM and strip editor-only widgets & markers
  const clone = editor.view.dom.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      ".play-caret, .cb-chrome, .selection-marker, .syntax-hidden, .table-toolbar, .math-preview-wrap, .math-preview-bubble",
    )
    .forEach((el) => el.remove());

  const contentHtml = clone.innerHTML;
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Calibri, "Microsoft YaHei", -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #222222;
    }
    h1 { font-size: 18pt; font-weight: bold; margin-top: 14pt; margin-bottom: 6pt; color: #111111; }
    h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; color: #111111; }
    h3 { font-size: 12pt; font-weight: bold; margin-top: 10pt; margin-bottom: 3pt; color: #111111; }
    p { margin: 0 0 6pt; }
    table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
    th, td { border: 1px solid #d0d0d0; padding: 5pt 8pt; text-align: left; }
    th { background-color: #f7f7f7; font-weight: bold; }
    code { font-family: Consolas, monospace; background-color: #f4f4f4; padding: 1pt 3pt; font-size: 9.5pt; }
    pre { font-family: Consolas, monospace; background-color: #f4f4f4; padding: 6pt; margin: 6pt 0; }
    blockquote { border-left: 3pt solid #cccccc; padding-left: 8pt; color: #666666; margin: 6pt 0; }
    a { color: #0969da; text-decoration: underline; }
    ul, ol { margin: 4pt 0 6pt 20pt; padding: 0; }
    li { margin: 2pt 0; }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;

  const { asBlob } = await import("html-docx-js-typescript");
  const blobOrBuffer = await asBlob(fullHtml);
  const blob =
    blobOrBuffer instanceof Blob
      ? blobOrBuffer
      : new Blob([new Uint8Array(blobOrBuffer as unknown as ArrayBuffer)], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

  downloadBlob(blob, filename);
}

/**
 * Creates the minimalist Typora-style "导出 ▾" dropdown menu.
 */
export function createExportMenu(getEditor: () => Editor | null): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "export-menu";

  wrap.innerHTML = `
    <button type="button" class="export-btn" aria-haspopup="true" aria-expanded="false" title="导出当前文档">
      导出 ▾
    </button>
    <div class="export-dropdown" hidden>
      <button type="button" class="export-item" data-format="md">
        <span class="export-icon">📄</span>
        <span class="export-text">
          <span class="export-name">Markdown</span>
          <span class="export-ext">.md</span>
        </span>
      </button>
      <button type="button" class="export-item" data-format="pdf">
        <span class="export-icon">📑</span>
        <span class="export-text">
          <span class="export-name">PDF 文档</span>
          <span class="export-ext">.pdf</span>
        </span>
      </button>
      <button type="button" class="export-item" data-format="docx">
        <span class="export-icon">📝</span>
        <span class="export-text">
          <span class="export-name">Word 文档</span>
          <span class="export-ext">.docx</span>
        </span>
      </button>
    </div>
  `;

  const btn = wrap.querySelector(".export-btn") as HTMLButtonElement;
  const dropdown = wrap.querySelector(".export-dropdown") as HTMLElement;

  function toggleDropdown(open?: boolean): void {
    const isOpen = open ?? dropdown.hasAttribute("hidden");
    if (isOpen) {
      dropdown.removeAttribute("hidden");
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("active");
    } else {
      dropdown.setAttribute("hidden", "");
      btn.setAttribute("aria-expanded", "false");
      btn.classList.remove("active");
    }
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Handle format selection
  dropdown.addEventListener("click", async (e) => {
    const item = (e.target as HTMLElement).closest<HTMLButtonElement>(".export-item");
    if (!item) return;
    const format = item.dataset.format;
    const editor = getEditor();
    if (!editor) return;

    toggleDropdown(false);

    try {
      if (format === "md") {
        exportMarkdown(editor);
      } else if (format === "pdf") {
        exportPdf(editor);
      } else if (format === "docx") {
        await exportDocx(editor);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("导出失败，请重试。");
    }
  });

  // Close when clicking outside or pressing Escape
  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target as Node)) {
      toggleDropdown(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dropdown.hasAttribute("hidden")) {
      toggleDropdown(false);
    }
  });

  return wrap;
}
