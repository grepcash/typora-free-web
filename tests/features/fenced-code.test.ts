import { describe, expect, test } from "@voidzero-dev/vite-plus-test";
import { runFeatureCases } from "../utils.ts";
import { fencedCodeSpecs } from "../../specs/features/fenced-code.specs.ts";
import { createEditor } from "../../src/editor-api.ts";

runFeatureCases(fencedCodeSpecs);

describe("fenced-code: SVG live preview", () => {
  test("renders SVG graphic inside .cb-svg-preview", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = '```svg\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#4f46e5" /></svg>\n```';
    const editor = createEditor(host, { initialContent: md });

    const pre = host.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre?.classList.contains("cb-is-svg")).toBe(true);

    const preview = pre?.querySelector(".cb-svg-preview");
    expect(preview).not.toBeNull();
    const svg = preview?.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelector("circle")).not.toBeNull();

    editor.destroy();
    host.remove();
  });

  test("sanitizes dangerous <script> and event attributes", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = '```svg\n<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script><circle onload="alert(1)" r="10"/></svg>\n```';
    const editor = createEditor(host, { initialContent: md });

    const pre = host.querySelector("pre");
    const preview = pre?.querySelector(".cb-svg-preview");
    expect(preview?.querySelector("script")).toBeNull();
    const circle = preview?.querySelector("circle");
    expect(circle?.hasAttribute("onload")).toBe(false);

    editor.destroy();
    host.remove();
  });

  test("shows error UI on malformed SVG syntax without crashing", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = '```svg\n<svg><circle unclosed\n```';
    const editor = createEditor(host, { initialContent: md });

    const pre = host.querySelector("pre");
    const errorEl = pre?.querySelector(".cb-svg-error");
    expect(errorEl).not.toBeNull();

    editor.destroy();
    host.remove();
  });

  test("does not activate preview for non-svg languages", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = '```ts\nconst a = 1;\n```';
    const editor = createEditor(host, { initialContent: md });

    const pre = host.querySelector("pre");
    expect(pre?.classList.contains("cb-is-svg")).toBe(false);
    editor.destroy();
    host.remove();
  });

  test("automatically extracts and renders <svg> even if wrapped in html/div", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = '```svg\n<html><body><div style="padding:10px;"><svg viewBox="0 0 100 100"><rect width="50" height="50" /></svg></div></body></html>\n```';
    const editor = createEditor(host, { initialContent: md });

    const pre = host.querySelector("pre");
    const preview = pre?.querySelector(".cb-svg-preview");
    const svg = preview?.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelector("rect")).not.toBeNull();

    editor.destroy();
    host.remove();
  });

  test("auto-cleans markdown link syntax in xmlns attribute", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const md = '```svg\n<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#4f46e5" /></svg>\n```';
    const editor = createEditor(host, { initialContent: md });

    const pre = host.querySelector("pre");
    const preview = pre?.querySelector(".cb-svg-preview");
    const svg = preview?.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.querySelector("circle")).not.toBeNull();

    editor.destroy();
    host.remove();
  });
});

