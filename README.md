# Markdown Previewer

A live Markdown editor with real-time preview, built with vanilla HTML, CSS and JavaScript — no framework, no build tools.

---

## Demo

Open `index.html` in any modern browser. No server required.

---

## Features

- **Live preview** — rendering updates instantly on every keystroke
- **Full toolbar** — bold, italic, strikethrough, code, headings, lists, quotes, code blocks, links, horizontal rule
- **Three view modes** — Split (editor + preview), Editor only, Preview only
- **Draggable resizer** — resize both panes in Split mode
- **Document statistics** — words, characters, lines, estimated read time
- **Download** — save the content as a `.md` file (Ctrl+S)
- **Copy** — copy all Markdown to the clipboard
- **Bilingual UI (EN/IT)** — hybrid language detection: defaults to the browser/system language on first load, with a manual toggle that overrides it; the choice is saved in `localStorage` and remembered on future visits
- **Automatic dark theme** — follows the operating system preference (`prefers-color-scheme`)
- **Responsive** — works on desktop, tablet and mobile
- **Accessible** — HTML landmarks, `aria-label`, `aria-live`, visible focus states
- **Custom favicon** — SVG with ICO fallback for older browsers

---

## Project structure

```
markdown-previewer/
├── index.html              # HTML structure, references CSS/JS/i18n
├── css/
│   └── style.css           # Styles, CSS variables, dark theme, responsive
├── js/
│   ├── script.js             # Core application logic (modular)
│   └── i18n-manager.js      # Language detection, toggle, persistence
├── i18n/
│   ├── en.js                # English translation strings
│   └── it.js                # Italian translation strings
├── assets/
│   └── favicon/
│       ├── favicon.svg      # Vector favicon (modern browsers)
│       └── favicon.ico      # Multi-size ICO fallback (16/32/48/64/128/256)
└── README.md                # This file
```

---

## How to run it

### Quick start

```bash
# Just open the file in your browser:
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

Or use a local server (recommended to avoid CORS restrictions on some browsers):

```bash
# Python 3
python -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code
# Install the "Live Server" extension and click "Go Live"
```

Then visit `http://localhost:8080`.

---

## Language switching

The app uses a **hybrid language strategy**:

1. On first visit, it reads `navigator.language` to detect the browser/system language (`en` or `it`; any other language falls back to English).
2. The **EN / IT** toggle in the toolbar lets the user override this at any time.
3. The chosen language is saved to `localStorage` under the key `markdown-previewer-lang`, so it's remembered on every future visit — regardless of the system language at that point.

Switching languages re-translates the entire UI (toolbar tooltips, pane headers, status bar, toasts) instantly, without reloading the page. The editor's own content is never overwritten on a language switch, to avoid losing the user's work — only the *default* starter content is locale-specific, shown the first time the editor loads.

---

## Keyboard shortcuts

| Shortcut     | Action                         |
|--------------|---------------------------------|
| `Ctrl+B`     | Bold                            |
| `Ctrl+I`     | Italic                          |
| `Ctrl+K`     | Insert link                     |
| `Ctrl+S`     | Download the `.md` file         |
| `Ctrl+/`     | Cycle through view modes        |
| `Tab`        | Indent with 2 spaces             |

> On macOS, use `Cmd` instead of `Ctrl`.

---

## JavaScript architecture

`js/script.js` is organized into IIFE modules (Module pattern), each with a single responsibility:

| Module           | Responsibility                                          |
|------------------|-----------------------------------------------------------|
| `Config`         | Non-translatable constants (reading speed, filenames, etc.) |
| `Renderer`       | Markdown → HTML parsing via marked.js                     |
| `Stats`          | Document statistics calculation and display                |
| `ToolbarActions` | Snippet insertion into the editor at the cursor            |
| `EditorActions`  | Copy, clear, download                                       |
| `ViewManager`    | View mode management                                        |
| `ResizerManager` | Draggable divider with mouse and touch support               |
| `KeyboardManager`| Keyboard shortcuts                                           |
| `App`            | Entry point and module coordination                          |

`js/i18n-manager.js` (the `I18n` module) is loaded before `script.js` and handles:
- language detection (`detectLanguage`)
- applying translations to the DOM (`applyToDOM`, using `data-i18n*` attributes)
- persisting and switching language (`setLanguage`)
- exposing the active dictionary to other modules (`t`, `getCurrentLanguage`)

---

## Technologies used

| Library / API                          | Version | Purpose                          |
|-----------------------------------------|---------|-----------------------------------|
| [marked.js](https://marked.js.org)      | 9.1.6   | Markdown → HTML parsing           |
| [Tabler Icons](https://tabler.io/icons) | 2.44    | Outline icons in the toolbar      |
| Clipboard API                           | Web API | Copy to clipboard                  |
| Blob + URL.createObjectURL              | Web API | `.md` file download                |
| localStorage                            | Web API | Language preference persistence    |

No JavaScript framework, no build step, no npm dependencies.

---

## Customization

### Changing colors

All CSS variables live at the top of `css/style.css` in the `:root` section. The dark theme overrides live in the `@media (prefers-color-scheme: dark)` section.

```css
:root {
  --color-accent: #534ab7;   /* purple → change to your brand color */
  --font-mono: "Fira Code", monospace;
}
```

### Adding a new language

1. Create `i18n/<lang-code>.js` modeled on `i18n/en.js`, translating every key (including `defaultContent`).
2. Add a `<script src="i18n/<lang-code>.js"></script>` tag in `index.html`, before `i18n-manager.js`.
3. Add `<lang-code>` to the `SUPPORTED_LANGUAGES` array in `js/i18n-manager.js`.
4. Add a corresponding `<button class="lang-btn" data-lang="<lang-code>" ...>` in the `#lang-toggle` group in `index.html`.

### Changing the default content

Edit the `defaultContent` key inside each `i18n/<lang-code>.js` file — the editor loads this value for the language active on first run.

### Adding a toolbar button

1. Add the button in `index.html`, inside the appropriate group, with the relevant `data-i18n-title` / `data-i18n-aria` attributes:
   ```html
   <button class="tb-btn" onclick="ToolbarActions.inlineWrap('__', '__')" data-i18n-title="underline" data-i18n-aria="underline" title="Underline" aria-label="Underline">
     <i class="ti ti-underline" aria-hidden="true"></i>
   </button>
   ```
2. Add the `underline` key (translated) to every file in `i18n/`.
3. If new logic is needed, add it to `ToolbarActions` in `js/script.js`.

### Replacing the favicon

Replace `assets/favicon/favicon.svg` with your own vector icon, then regenerate `favicon.ico` (multi-size, 16 to 256px) from it using Pillow or any icon generator. Both files are already linked in `index.html`'s `<head>`.

---

## Browser support

| Browser         | Minimum version |
|------------------|------------------|
| Chrome / Edge    | 88+              |
| Firefox          | 85+              |
| Safari           | 14+              |
| Opera            | 74+              |

Requires: `Clipboard API`, `localStorage`, `CSS Custom Properties`, `Flexbox`, `ES6+`.

---

## License

MIT — free to use, modify and distribute.
