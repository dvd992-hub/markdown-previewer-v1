/**
 * en.js — English translation strings
 * Loaded as a global object on window.I18N_STRINGS.en
 */

window.I18N_STRINGS = window.I18N_STRINGS || {};

window.I18N_STRINGS.en = {
  // App brand
  appName: "Markdown Previewer",

  // Toolbar tooltips / aria-labels
  bold: "Bold",
  italic: "Italic",
  strikethrough: "Strikethrough",
  inlineCode: "Inline code",
  heading: "Heading",
  bulletList: "Bullet list",
  quote: "Quote",
  codeBlock: "Code block",
  link: "Insert link",
  horizontalRule: "Horizontal rule",
  copyMarkdown: "Copy markdown",
  clearEditor: "Clear editor",
  downloadMarkdown: "Download .md file",

  // Group aria-labels
  groupFormatting: "Text formatting",
  groupBlocks: "Block elements",
  groupActions: "Actions",
  groupViewToggle: "View mode",
  groupLanguage: "Language",

  // View toggle buttons
  viewSplit: "Split",
  viewEditor: "Editor",
  viewPreview: "Preview",

  // Pane headers
  paneMarkdown: "Markdown",
  panePreview: "Preview",

  // Editor placeholder
  editorAriaLabel: "Write markdown here",
  previewAriaLabel: "Rendered preview",
  previewEmpty: "Start typing in the editor…",

  // Status bar
  words: "words",
  word: "word",
  chars: "characters",
  char: "character",
  lines: "lines",
  line: "line",
  readTime: "min read",

  // Toast / confirm
  copied: "Copied!",
  confirmClear: "Clear all content?",

  // Default editor content (sample document)
  defaultContent: `# Welcome to Markdown Previewer 👋

A **live** editor with real-time preview.

## Basic formatting

You can use **bold**, *italic*, ~~strikethrough~~ and \`inline code\`.

## Lists

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Numbered list

1. First step
2. Second step
3. Third step

## Code

\`\`\`js
// JavaScript example
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

## Table

| Feature          | Status |
|------------------|--------|
| Live preview     | ✓      |
| Responsive       | ✓      |
| Dark mode        | ✓      |
| Download .md     | ✓      |

## Quote

> "Simplicity is the ultimate sophistication."
> — Leonardo da Vinci

## Links and images

Visit [Anthropic](https://www.anthropic.com) to learn more about Claude.

---

*Start writing in the editor on the left →*
`,
};
