// "/" — the editor route. Loads README.md into a single live editor.
// Uses the public `createEditor` API end-to-end (dogfooding the npm
// surface from our own home page).

import type { Editor } from "../../src/lib.ts";
import { createEditor } from "../../src/lib.ts";
import { mountNav } from "../components/nav.ts";
import readme from "../../README.md?raw";

export function homeRoute(root: HTMLElement): () => void {
  let editor: Editor | null = null;
  mountNav(root, "/", () => editor);

  const main = document.createElement("main");
  main.className = "page page-home";
  main.innerHTML = `
    <section class="hero-editor"></section>
    <p class="route-footer">以上正文可直接点击并实时编辑。</p>
  `;
  root.append(main);

  const host = main.querySelector(".hero-editor") as HTMLElement;
  editor = createEditor(host, { initialContent: readme });

  return () => {
    editor?.destroy();
  };
}
