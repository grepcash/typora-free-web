# typora-web

> 运行在 Web 端的 Typora 风格所见即所得 Markdown 编辑器。

边写边排版，书写时即呈现最终排版效果。当你在文字两侧输入星号时，文本立即渲染为*斜体*；输入 `#` 时，标题直接以最终字号显示。控制符号（如 `*`、`#`、`[` 等）会在光标移开时自动淡出隐藏，并在光标再次移入时重新显现供编辑。

这同时也是一个探索性项目：全部源代码均由 AI Agent（Claude Opus 4.7）通过对话交互编写完成。人类仅通过对话沟通需求，不直接在源文件中手写代码。为了在此规模下保持开发可靠性，每项语法行为均被定义为一份**规范（Spec）**（包含初始文本、输入事件序列以及检查点期望的渲染输出），并自动编译为自动化测试用例，驱动整个编辑器的高保真实现。

## 动手试一试

> 当前正文就是编辑器本身，你可以直接在正文中点击、修改或输入内容。按 `⌘/`（Windows / Linux 下按 `Ctrl+/`）可随时在所见即所得视图与 Markdown 源码视图之间切换。

行内标记：**粗体**、*斜体*、`行内代码`、~~删除线~~、==高亮文本==、下标如 H~2~O、上标如 E = mc^2^。尖括号内的裸链接会自动识别为超链接：<https://prosemirror.net>。常规链接正常生效：[ProseMirror 指南][pmguide]、[CommonMark 规范][cm]。Emoji 短代码随打随出：:books: :tada: :hourglass: :warning:。

任务清单支持可视交互与勾选：

- [x] 行内标记（斜体、粗体、代码、删除线、高亮、上下标）
- [x] 自动链接与引用式链接
- [x] 支持每列对齐的表格
- [x] 行内与块级数学公式（基于 KaTeX，支持 $...$、$$...$$ 及 `(T_{分组}=...)` 实时预览）
- [ ] Mermaid 等图表语法块（规划中）

列表支持多层嵌套，并且支持 Typora 标志性的**三次回车梯阶退出**：

1. 外层有序列表项
   - 嵌套的无序列表项，包含 `代码片段`
   - 另一项，包含 **粗体** 文字
     1. 第三层嵌套有序项
2. 返回外层有序列表

> 引用块与段落一样支持完整的行内标记。你可以在引用中随意插入 ==高亮==、[链接](https://typora.io) 或 `代码`，源码解析与导出保证 100% 字节级无损往返。
>
> 在空的引用行上按回车即可退出引用块。

SVG 矢量图支持实时交互预览（光标离开代码块时就地呈现图形，点击图形即可编辑源码）：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 90" width="360" height="90">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <rect x="5" y="10" width="350" height="70" rx="12" fill="url(#grad)" opacity="0.1" stroke="#4f46e5" stroke-width="1.5" />
  <circle cx="45" cy="45" r="22" fill="#4f46e5" />
  <path d="M37 45 L43 51 L53 39" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  <text x="80" y="41" font-family="-apple-system, system-ui, sans-serif" font-size="15" font-weight="600" fill="#1f2937">SVG 实时矢量预览</text>
  <text x="80" y="60" font-family="-apple-system, system-ui, sans-serif" font-size="12" fill="#6b7280">就地渲染 · 点击图形编辑代码 · 完美导出矢量 PDF</text>
</svg>
```

数学公式支持实时排版与交互编辑（基于 KaTeX 引擎，支持 `(formula)`、`$formula$` 及 `$$formula$$`）：

计算机网络分组交换传输时间公式：(T_{分组}=\frac{x}{b}+(k-1)\frac{p}{b}+kd)

爱因斯坦质能方程：$E = mc^2$，以及块级公式：

$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$

随时按下快捷键 `⌘/`（或 `Ctrl+/`）可以在渲染视图与原始 Markdown 源码视图之间无缝切换。

## 安装

```sh
npm install typora-web
```

## 使用方法

```ts
import { createEditor } from "typora-web";
import "typora-web/widgets.css";
import "typora-web/theme-typora.css";

const editor = createEditor(document.querySelector("#app")!, {
  initialContent: "# 你好，世界",
  onChange: (md) => console.log(md),
});
```

控制器方法与属性：

| 方法 / 属性 | 说明 |
|---|---|
| `editor.getMarkdown()` | 获取当前 Markdown 文本 |
| `editor.setMarkdown(md)` | 替换编辑器内容 |
| `editor.toggleSource()` | 切换渲染 ↔ 源码视图（绑定快捷键 `⌘/` / `Ctrl+/`） |
| `editor.isSourceMode()` | 当前是否处于源码模式（布尔值） |
| `editor.focus()` | 聚焦编辑区域 |
| `editor.destroy()` | 销毁编辑器实例并释放资源 |
| `editor.view` | 底层 ProseMirror EditorView 实例（高级访问） |

配置选项：`initialContent`（初始 Markdown 内容）、`onChange(md)`（内容变动回调）、`onFocus()`（聚焦回调）、`onBlur()`（失焦回调）。

默认提供两套主题样式：`typora-web/theme-typora.css`（默认 Typora 极简质感）与 `typora-web/theme-github.css`（GitHub 风格）。引入其一即可。如需自定义外观，编写覆盖 `.ProseMirror` 相关类的样式表即可。

## 语法支持度

状态标识：:white_check_mark: 稳定支持 · :yellow_circle: 部分支持（附说明） · :pause_button: 待实现。

### 块级语法

| 语法 | 状态 | 备注 |
|---|:---:|---|
| 段落 (Paragraph) | :white_check_mark: | |
| ATX 标题 `#`..`######` | :white_check_mark: | |
| Setext 下划线标题 (`===` / `---`) | :white_check_mark: | |
| 块级引用 `>` | :white_check_mark: | |
| 无序列表 `-` `*` `+` | :white_check_mark: | |
| 有序列表 `1.` | :white_check_mark: | |
| 嵌套列表 | :white_check_mark: | |
| 任务清单 `- [ ]` / `- [x]` | :white_check_mark: | |
| 围栏代码块 ```` ``` ```` | :white_check_mark: | |
| 缩进代码块 (4 空格) | :yellow_circle: | 解析正常；保存时转换为围栏代码块 |
| 水平分割线 `---` | :white_check_mark: | |
| GFM 表格 `\| a \| b \|` | :white_check_mark: | |
| YAML Front Matter 元数据 | :white_check_mark: | |
| 引用式链接定义 `[id]: url` | :yellow_circle: | 实时输入为独立块；解析时由 markdown-it 转换 |
| 原生 HTML 块 | :pause_button: | 需安全消毒策略；计划作为可选插件 |
| 数学公式块 `$$…$$` / `\[…\]` | :white_check_mark: | 基于 KaTeX 矢量排版，居中展示，光标移开就地呈现 |

### 行内语法

| 语法 | 状态 | 备注 |
|---|:---:|---|
| 斜体 `*x*` / `_x_` | :white_check_mark: | |
| 粗体 `**x**` / `__x__` | :white_check_mark: | |
| 粗斜体嵌套 `***em+strong***` | :yellow_circle: | 两端标记 ≥ 3 字符时生效 |
| 行内代码 `` `x` `` | :white_check_mark: | |
| 删除线 `~~x~~` | :white_check_mark: | |
| 超链接 `[文本](url)` | :yellow_circle: | 基础场景完整；边缘复杂嵌套处理中 |
| 带标题超链接 `[t](u "title")` | :white_check_mark: | |
| 空文本超链接 `[](url)` | :white_check_mark: | |
| 图片 `![alt](src)` | :white_check_mark: | |
| 自动链接 `<https://x.com>` | :white_check_mark: | |
| 引用式链接 `[t][id]` | :yellow_circle: | 解析为行内链接 |
| 硬换行 (末尾两空格 + 换行) | :white_check_mark: | |
| 软换行 (段落内普通换行) | :white_check_mark: | |
| 反斜杠转义 `\*` | :yellow_circle: | 往返保存正常；输入时无额外提示 |
| 行内 HTML | :pause_button: | 与 HTML 块统一规划 |
| 行内数学公式 `$x$` / `(formula)` | :white_check_mark: | 支持 `$…$`、`\(…\)` 及 `(…)` 格式，光标移入编辑，悬浮实时预览 |

### Typora 扩展语法

| 语法 | 状态 | 备注 |
|---|:---:|---|
| 高亮标记 `==x==` | :white_check_mark: | |
| 下标 `~x~` | :white_check_mark: | |
| 上标 `^x^` | :white_check_mark: | |
| `[toc]` 动态目录块 | :white_check_mark: | |
| Emoji 短代码 `:smile:` | :white_check_mark: | |
| HTML 注释 `<!-- -->` | :white_check_mark: | |
| SVG 矢量图形代码块 (```` ```svg ````) | :white_check_mark: | 实时就地渲染，光标移开隐匿源码，点击即时编辑 |
| 图表代码块 (Mermaid 等) | :pause_button: | 计划作为可选插件 |

### 编辑器交互行为

| 行为特性 | 状态 | 备注 |
|---|:---:|---|
| 光标感知语法标记显隐 | :white_check_mark: | 光标移入显现，移出淡出隐藏 |
| 括号与标记符号自动配对 | :white_check_mark: | 自动补全配对符号 |
| 无损往返 `解析 → 序列化 → 解析` | :white_check_mark: | 保证 Markdown 格式与排版原汁原味 |

## 规范驱动与测试验证

每个 Typora 的交互行为均被描述为一份精确的**规范（Spec）**：包括初始文档、按键序列与各阶段期望渲染的 DOM 结构。所有规范均直接编译为自动化测试用例运行，项目当前拥有 430+ 项行为测试用例保障兼容性与稳定性。

[demo]: https://yuyz0112.github.io/typora-web/ "在线演示"
[cm]: https://spec.commonmark.org/ "CommonMark 规范"
[pmguide]: https://prosemirror.net/docs/guide/ "ProseMirror 指南"
