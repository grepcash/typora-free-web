import { Plugin, TextSelection } from "prosemirror-state";
import { markConsumed, type InlineSpan } from "../inline-parse.ts";
import type { FeatureSpec, InlineFeatureSpec } from "./_types.ts";

/**
 * Checks whether the content inside parentheses is a mathematical formula.
 * Requires:
 * 1. Contains LaTeX commands like \frac, \sqrt, \alpha, \sum, \int, etc.
 * 2. Or subscript/superscript with math variables/operators like T_{分组}=...
 */
function isMathContent(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  // Contains LaTeX macro: \frac, \sum, \alpha, etc.
  if (/\\[a-zA-Z]+/.test(text)) return true;
  // Subscript / superscript with braces or alphanumeric: T_{...}, x^2, a_{i}
  if (/([a-zA-Z0-9\)\}])[_^]\{[^}]+\}/.test(text)) return true;
  if (/([a-zA-Z0-9\)\}])[_^][a-zA-Z0-9]/.test(text) && /[=+\-*/]/.test(text)) return true;
  return false;
}

function createMathSpan(
  openFrom: number,
  openTo: number,
  closeFrom: number,
  closeTo: number,
  content: string,
  isDisplay: boolean,
  fullText: string,
): InlineSpan {
  return {
    type: "math",
    from: openFrom,
    to: closeTo,
    openFrom,
    openTo,
    closeFrom,
    closeTo,
    delimRanges: [
      { from: openFrom, to: openTo },
      { from: openTo, to: closeFrom, softInside: true },
      { from: closeFrom, to: closeTo },
    ],
    widgetDecorations: [
      {
        pos: openFrom,
        when: "outside",
        kind: "math",
        attrs: {
          tex: content,
          display: isDisplay ? "1" : "0",
          raw: fullText.slice(openFrom, closeTo),
        },
        side: -1,
      },
      {
        pos: closeTo,
        when: "inside",
        kind: "math-preview",
        attrs: {
          tex: content,
          display: isDisplay ? "1" : "0",
        },
        side: 1,
      },
    ],
  };
}

const scan: InlineFeatureSpec["scan"] = (text, consumed) => {
  const out: InlineSpan[] = [];
  let i = 0;

  while (i < text.length) {
    if (consumed[i]) {
      i++;
      continue;
    }

    // 1. Display math: $$...$$
    if (text[i] === "$" && text[i + 1] === "$") {
      const closeIdx = text.indexOf("$$", i + 2);
      if (closeIdx !== -1) {
        const fullStart = i;
        const fullEnd = closeIdx + 2;
        let blocked = false;
        for (let k = fullStart; k < fullEnd; k++) {
          if (consumed[k]) { blocked = true; break; }
        }
        if (!blocked) {
          const content = text.slice(i + 2, closeIdx).trim();
          markConsumed(consumed, fullStart, fullEnd);
          out.push(createMathSpan(fullStart, i + 2, closeIdx, fullEnd, content, true, text));
          i = fullEnd;
          continue;
        }
      }
    }

    // 2. LaTeX display math: \[...\]
    if (text[i] === "\\" && text[i + 1] === "[") {
      const closeIdx = text.indexOf("\\]", i + 2);
      if (closeIdx !== -1) {
        const fullStart = i;
        const fullEnd = closeIdx + 2;
        let blocked = false;
        for (let k = fullStart; k < fullEnd; k++) {
          if (consumed[k]) { blocked = true; break; }
        }
        if (!blocked) {
          const content = text.slice(i + 2, closeIdx).trim();
          markConsumed(consumed, fullStart, fullEnd);
          out.push(createMathSpan(fullStart, i + 2, closeIdx, fullEnd, content, true, text));
          i = fullEnd;
          continue;
        }
      }
    }

    // 3. LaTeX inline math: \(...\)
    if (text[i] === "\\" && text[i + 1] === "(") {
      const closeIdx = text.indexOf("\\)", i + 2);
      if (closeIdx !== -1) {
        const fullStart = i;
        const fullEnd = closeIdx + 2;
        let blocked = false;
        for (let k = fullStart; k < fullEnd; k++) {
          if (consumed[k]) { blocked = true; break; }
        }
        if (!blocked) {
          const content = text.slice(i + 2, closeIdx).trim();
          markConsumed(consumed, fullStart, fullEnd);
          out.push(createMathSpan(fullStart, i + 2, closeIdx, fullEnd, content, false, text));
          i = fullEnd;
          continue;
        }
      }
    }

    // 4. Inline dollar math: $...$
    if (text[i] === "$" && text[i + 1] !== "$" && text[i + 1] !== " ") {
      let closeIdx = -1;
      for (let k = i + 1; k < text.length; k++) {
        if (text[k] === "\\") { k++; continue; }
        if (text[k] === "$" && text[k - 1] !== " " && !consumed[k]) {
          closeIdx = k;
          break;
        }
      }
      if (closeIdx !== -1 && closeIdx > i + 1) {
        const fullStart = i;
        const fullEnd = closeIdx + 1;
        let blocked = false;
        for (let k = fullStart; k < fullEnd; k++) {
          if (consumed[k]) { blocked = true; break; }
        }
        if (!blocked) {
          const content = text.slice(i + 1, closeIdx).trim();
          markConsumed(consumed, fullStart, fullEnd);
          out.push(createMathSpan(fullStart, i + 1, closeIdx, fullEnd, content, false, text));
          i = fullEnd;
          continue;
        }
      }
    }

    // 5. Parenthesis math: (T_{分组}=\frac{x}{b}+(k-1)\frac{p}{b}+kd)
    if (text[i] === "(") {
      const prevChar = i > 0 ? text[i - 1] : "";
      const isWordChar = prevChar && /[\w\d]/.test(prevChar);
      if (!isWordChar) {
        let depth = 1;
        let j = i + 1;
        while (j < text.length && depth > 0) {
          if (text[j] === "\\") { j += 2; continue; }
          if (text[j] === "(") depth++;
          else if (text[j] === ")") depth--;
          j++;
        }
        if (depth === 0) {
          const fullStart = i;
          const fullEnd = j;
          const content = text.slice(i + 1, j - 1);
          if (isMathContent(content)) {
            let blocked = false;
            for (let k = fullStart; k < fullEnd; k++) {
              if (consumed[k]) { blocked = true; break; }
            }
            if (!blocked) {
              markConsumed(consumed, fullStart, fullEnd);
              out.push(createMathSpan(fullStart, i + 1, j - 1, fullEnd, content, false, text));
              i = fullEnd;
              continue;
            }
          }
        }
      }
    }

    i++;
  }

  return out;
};

export const math: FeatureSpec = {
  name: "math",

  plugins: () => [
    // Click on rendered KaTeX formula moves caret inside the formula
    new Plugin({
      props: {
        handleClick(view, _pos, event) {
          const target = event.target as HTMLElement | null;
          const mathEl = target?.closest(".math-render") as HTMLElement | null;
          if (!mathEl) return false;
          const dataPos = mathEl.getAttribute("data-pos");
          if (!dataPos) return false;
          const pos = Number(dataPos);
          if (pos < 0 || pos >= view.state.doc.content.size) return false;
          event.preventDefault();
          view.dispatch(
            view.state.tr.setSelection(TextSelection.create(view.state.doc, pos + 1)),
          );
          view.focus();
          return true;
        },
        handleDOMEvents: {
          click(view, event) {
            const target = event.target as HTMLElement | null;
            const mathEl = target?.closest(".math-render") as HTMLElement | null;
            if (!mathEl) return false;
            const dataPos = mathEl.getAttribute("data-pos");
            if (!dataPos) return false;
            const pos = Number(dataPos);
            if (pos < 0 || pos >= view.state.doc.content.size) return false;
            event.preventDefault();
            view.dispatch(
              view.state.tr.setSelection(TextSelection.create(view.state.doc, pos + 1)),
            );
            view.focus();
            return true;
          },
        },
      },
    }),
  ],

  inline: {
    // Priority 0.2: runs after code fences (0) but before emphasis (2), subSup (2.5), link (3)
    priority: 0.2,
    scan,
    markNames: [],
    extRanges: (parent) => {
      const text = parent.textContent;
      const consumed = new Uint8Array(text.length);
      const spans = scan(text, consumed, parent);
      return spans.map((s) => [s.openFrom, s.closeTo] as [number, number]);
    },
  },
};
