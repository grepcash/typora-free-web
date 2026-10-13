// Website bootstrap. Routes wired through a tiny hash router.
// Everything else lives in components/ and routes/.

import "prosemirror-view/style/prosemirror.css";
import "katex/dist/katex.min.css";
import "../src/styles/widgets.css";
import "./style.css";

import { initTheme } from "./theme.ts";
import { startRouter } from "./router.ts";
import { homeRoute } from "./routes/home.ts";
import { newRoute } from "./routes/new.ts";

initTheme();

const root = document.querySelector<HTMLDivElement>("#app")!;

startRouter(root, [
  { path: "/", handler: homeRoute },
  { path: "/new", handler: newRoute },
]);

