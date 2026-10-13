import { describe, expect, test } from "@voidzero-dev/vite-plus-test";
import { createEditor } from "../../src/editor-api.ts";

describe("features: math formula live rendering", () => {
  test("renders parenthesis formula format (T_{分组}=\\frac{x}{b}+(k-1)\\frac{p}{b}+kd)", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = "计算公式为：(T_{分组}=\\frac{x}{b}+(k-1)\\frac{p}{b}+kd)";
    const editor = createEditor(host, { initialContent: md });

    const mathEl = host.querySelector(".math-render");
    expect(mathEl).not.toBeNull();
    expect(mathEl?.getAttribute("data-tex")).toBe("T_{分组}=\\frac{x}{b}+(k-1)\\frac{p}{b}+kd");
    expect(mathEl?.querySelector(".katex")).not.toBeNull();

    // Verify lossless round-trip
    expect(editor.getMarkdown()).toBe(md);

    editor.destroy();
    host.remove();
  });

  test("renders standard dollar inline math $E=mc^2$", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = "质能方程是 $E=mc^2$。";
    const editor = createEditor(host, { initialContent: md });

    const mathEl = host.querySelector(".math-render");
    expect(mathEl).not.toBeNull();
    expect(mathEl?.getAttribute("data-tex")).toBe("E=mc^2");

    expect(editor.getMarkdown()).toBe(md);

    editor.destroy();
    host.remove();
  });

  test("renders display math $$...$$", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = "求和公式：$$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$";
    const editor = createEditor(host, { initialContent: md });

    const mathEl = host.querySelector(".math-render.math-display");
    expect(mathEl).not.toBeNull();
    expect(mathEl?.getAttribute("data-tex")).toBe("\\sum_{i=1}^n i = \\frac{n(n+1)}{2}");

    expect(editor.getMarkdown()).toBe(md);

    editor.destroy();
    host.remove();
  });

  test("does not misclassify regular text in parentheses as math", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = "这是普通括号说明 (例如第一节所述的内容) 和 (nested (bracket) test)。";
    const editor = createEditor(host, { initialContent: md });

    const mathEl = host.querySelector(".math-render");
    expect(mathEl).toBeNull();
    expect(editor.getMarkdown()).toBe(md);

    editor.destroy();
    host.remove();
  });

  test("clicking .math-render moves cursor inside formula for editing", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = "公式：(T_{分组}=\\frac{x}{b}) 测试";
    const editor = createEditor(host, { initialContent: md });

    const mathEl = host.querySelector(".math-render") as HTMLElement;
    expect(mathEl).not.toBeNull();

    // Trigger click on math element
    mathEl.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    // Caret is now inside the formula
    expect(editor.view.state.selection.from).toBeGreaterThan(3);

    editor.destroy();
    host.remove();
  });
});
