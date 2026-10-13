// Top navigation. Editor brand + nav links. The `current` argument tells
// the bar which route to mark active so the router doesn't have to
// special-case CSS.

import { createThemeSwitch } from "../theme.ts";
import { createExportMenu } from "../export.ts";
import type { Editor } from "../../src/lib.ts";

export function mountNav(
  host: HTMLElement,
  current: string,
  getEditor?: () => Editor | null,
): void {
  const nav = document.createElement("nav");
  nav.className = "site-nav";
  nav.innerHTML = `
    <div class="nav-links">
      <a href="#/" data-route="/">文档</a>
      <a href="#/new" data-route="/new">新建写作</a>
    </div>
    <div class="nav-actions"></div>
  `;
  for (const a of nav.querySelectorAll<HTMLAnchorElement>("[data-route]")) {
    if (a.dataset.route === current) a.classList.add("active");
  }
  const actions = nav.querySelector(".nav-actions") as HTMLElement;
  actions.append(createThemeSwitch());
  if (getEditor) {
    actions.append(createExportMenu(getEditor));
  }
  host.append(nav);
}

