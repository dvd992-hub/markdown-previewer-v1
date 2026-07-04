/**
 * script.js — Markdown Previewer
 *
 * Architecture: several focused modules + initialization
 *   1. Config         — constants (non-translatable settings)
 *   2. Renderer       — Markdown → HTML parsing (marked.js)
 *   3. Stats          — document statistics calculation
 *   4. ToolbarActions — snippet insertion into the editor
 *   5. EditorActions  — copy, clear, download
 *   6. ViewManager    — view mode management
 *   7. ResizerManager — draggable pane divider
 *   8. KeyboardManager— keyboard shortcuts
 *   9. App.init()     — entry point
 *
 * Note: translated strings live in i18n/en.js, i18n/it.js and are
 * accessed through the I18n module (js/i18n-manager.js), loaded
 * before this file.
 */

'use strict';


/* ================================================
   1. CONFIG
   ================================================ */

const Config = {

  /** Average reading speed (words per minute) */
  WORDS_PER_MINUTE: 200,

  /** "Copied!" toast duration in milliseconds */
  TOAST_DURATION: 2000,

  /** Default filename used for download */
  DOWNLOAD_FILENAME: 'document.md',
};


/* ================================================
   2. RENDERER
   Configures marked.js and converts Markdown → HTML
   ================================================ */

const Renderer = (() => {

  /** Configures marked.js global options */
  function configure() {
    // gfm: GitHub Flavored Markdown (tables, code, etc.)
    // breaks: converts single \n into <br> (GitHub-like behavior)
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  }

  /**
   * Converts a Markdown string into sanitized HTML
   * @param {string} markdown - Source Markdown text
   * @returns {string} - Resulting HTML
   */
  function parse(markdown) {
    if (!markdown.trim()) {
      // Show a placeholder when the editor is empty (translated)
      return `<p style="color: var(--color-text-muted); font-style: italic;">${I18n.t('previewEmpty')}</p>`;
    }
    return marked.parse(markdown);
  }

  return { configure, parse };
})();


/* ================================================
   3. STATS
   Calculates live document statistics
   ================================================ */

const Stats = (() => {

  // DOM node references for the statistics
  const el = {
    words: () => document.getElementById('stat-words'),
    chars: () => document.getElementById('stat-chars'),
    lines: () => document.getElementById('stat-lines'),
    read:  () => document.getElementById('stat-read'),
  };

  /**
   * Updates all counters in the status bar
   * @param {string} text - Current editor content
   */
  function update(text) {
    const words = countWords(text);
    const chars = text.length;
    const lines = text === '' ? 0 : text.split('\n').length;
    const readMin = Math.max(1, Math.round(words / Config.WORDS_PER_MINUTE));

    el.words().textContent = `${words} ${words === 1 ? I18n.t('word') : I18n.t('words')}`;
    el.chars().textContent = `${chars} ${chars === 1 ? I18n.t('char') : I18n.t('chars')}`;
    el.lines().textContent = `${lines} ${lines === 1 ? I18n.t('line') : I18n.t('lines')}`;
    el.read().textContent  = `~${readMin} ${I18n.t('readTime')}`;
  }

  /**
   * Counts words while ignoring common Markdown symbols
   * @param {string} text
   * @returns {number}
   */
  function countWords(text) {
    if (!text.trim()) return 0;
    // Strips common Markdown symbols before counting
    const clean = text
      .replace(/[#*_~`>[\]()!|]/g, ' ')  // Markdown symbols
      .replace(/https?:\/\/\S+/g, ' ')    // URLs
      .replace(/\s+/g, ' ')               // multiple spaces → one
      .trim();
    return clean ? clean.split(' ').length : 0;
  }

  return { update };
})();


/* ================================================
   4. TOOLBAR ACTIONS
   Inserts Markdown snippets into the editor at the cursor
   ================================================ */

const ToolbarActions = (() => {

  /** Reference to the textarea element */
  const getEditor = () => document.getElementById('editor');

  /**
   * Inline wrap: wraps the selected text (or "text") with markers
   * Example: inlineWrap('**','**') → **selection**
   *
   * @param {string} before - Opening marker
   * @param {string} after  - Closing marker (defaults to before)
   */
  function inlineWrap(before, after = before) {
    const ed = getEditor();
    const start = ed.selectionStart;
    const end   = ed.selectionEnd;
    // Uses the current selection or the "text" placeholder
    const selected = ed.value.slice(start, end) || 'text';
    const replacement = before + selected + after;

    // Replaces the selection (or cursor position) with the snippet
    ed.setRangeText(replacement, start, end, 'select');
    ed.focus();
    triggerUpdate(ed);
  }

  /**
   * Inserts a prefix at the start of the current line
   * Example: insertLinePrefix('- ') → "- " before the line
   *
   * @param {string} prefix - Prefix to add
   */
  function insertLinePrefix(prefix) {
    const ed = getEditor();
    const pos = ed.selectionStart;
    // Finds the start of the current line
    const lineStart = ed.value.lastIndexOf('\n', pos - 1) + 1;
    ed.setRangeText(prefix, lineStart, lineStart, 'end');
    ed.focus();
    triggerUpdate(ed);
  }

  /**
   * Inserts an H2 heading (##) at the start of the current line.
   * If the line is already a heading, increases its level (## → ###)
   */
  function insertHeading() {
    const ed = getEditor();
    const pos = ed.selectionStart;
    const lineStart = ed.value.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd   = ed.value.indexOf('\n', pos);
    const line = ed.value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);

    // Checks whether the line is already a heading
    const headingMatch = line.match(/^(#{1,5}) /);
    if (headingMatch) {
      // Adds one more # to the existing level (max H6)
      const hashes = headingMatch[1];
      if (hashes.length < 6) {
        ed.setRangeText('#', lineStart, lineStart, 'end');
      }
    } else {
      // Adds ## if the line isn't a heading yet
      ed.setRangeText('## ', lineStart, lineStart, 'end');
    }

    ed.focus();
    triggerUpdate(ed);
  }

  /**
   * Inserts a fenced code block (triple backtick).
   * Wraps the selection if present, otherwise inserts an empty template.
   */
  function insertCodeBlock() {
    const ed = getEditor();
    const start = ed.selectionStart;
    const end   = ed.selectionEnd;
    const selected = ed.value.slice(start, end);

    let snippet;
    if (selected) {
      // Wraps the selection in a code block
      snippet = '```\n' + selected + '\n```';
    } else {
      // Template with placeholder code
      snippet = '```\n// code here\n```';
    }

    ed.setRangeText(snippet, start, end, 'end');
    ed.focus();
    triggerUpdate(ed);
  }

  /**
   * Inserts Markdown link syntax.
   * Uses the selected text as the label, or "link text".
   */
  function insertLink() {
    const ed = getEditor();
    const start = ed.selectionStart;
    const end   = ed.selectionEnd;
    const label = ed.value.slice(start, end) || 'link text';
    const snippet = `[${label}](https://example.com)`;
    ed.setRangeText(snippet, start, end, 'end');
    ed.focus();
    triggerUpdate(ed);
  }

  /**
   * Inserts a horizontal rule (---) on a new line
   */
  function insertHR() {
    const ed = getEditor();
    const pos = ed.selectionStart;
    // Adds a newline before/after if needed
    const before = pos > 0 && ed.value[pos - 1] !== '\n' ? '\n' : '';
    const snippet = before + '\n---\n\n';
    ed.setRangeText(snippet, pos, pos, 'end');
    ed.focus();
    triggerUpdate(ed);
  }

  /**
   * Helper: dispatches an 'input' event on the textarea
   * to force a re-render of the preview
   * @param {HTMLTextAreaElement} ed
   */
  function triggerUpdate(ed) {
    ed.dispatchEvent(new Event('input'));
  }

  // Exposes the module's public API
  return { inlineWrap, insertLinePrefix, insertHeading, insertCodeBlock, insertLink, insertHR };
})();


/* ================================================
   5. EDITOR ACTIONS
   Utility operations on the editor
   ================================================ */

const EditorActions = (() => {

  const getEditor = () => document.getElementById('editor');

  /**
   * Copies the Markdown content to the clipboard.
   * Shows a confirmation toast for Config.TOAST_DURATION ms.
   */
  async function copyMarkdown() {
    const text = getEditor().value;
    try {
      await navigator.clipboard.writeText(text);
      showToast(I18n.t('copied'));
    } catch {
      // Fallback for browsers without the Clipboard API
      getEditor().select();
      document.execCommand('copy');
      showToast(I18n.t('copied'));
    }
  }

  /**
   * Clears the editor after user confirmation
   */
  function clearEditor() {
    if (!confirm(I18n.t('confirmClear'))) return;
    const ed = getEditor();
    ed.value = '';
    ed.dispatchEvent(new Event('input'));
    ed.focus();
  }

  /**
   * Downloads the editor content as a .md file
   */
  function downloadMarkdown() {
    const text = getEditor().value;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    // Creates a temporary link, clicks it, then removes it
    const a = document.createElement('a');
    a.href     = url;
    a.download = Config.DOWNLOAD_FILENAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Frees the blob URL memory after a short timeout
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Shows the notification toast in the status bar
   * @param {string} message - Toast text
   */
  function showToast(message) {
    const toast = document.getElementById('copy-toast');
    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
      toast.classList.remove('visible');
    }, Config.TOAST_DURATION);
  }

  return { copyMarkdown, clearEditor, downloadMarkdown };
})();


/* ================================================
   6. VIEW MANAGER
   Manages the three view modes:
   'split', 'editor', 'preview'
   ================================================ */

const ViewManager = (() => {

  /** Currently active view */
  let currentView = 'split';

  /** Map of view name → button ID */
  const BTN_IDS = {
    split:   'btn-split',
    editor:  'btn-editor',
    preview: 'btn-preview',
  };

  /**
   * Switches the view by applying the matching CSS class to #panes
   * and updating the active state of the buttons
   * @param {string} view - 'split' | 'editor' | 'preview'
   */
  function set(view) {
    if (!['split', 'editor', 'preview'].includes(view)) return;

    const panes = document.getElementById('panes');

    // Removes previous view classes
    panes.classList.remove('view-split', 'view-editor', 'view-preview');

    // Adds the class for the new view
    panes.classList.add(`view-${view}`);

    // Updates buttons (active / non-active)
    Object.entries(BTN_IDS).forEach(([name, id]) => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.toggle('active', name === view);
    });

    currentView = view;

    // Focuses the editor if visible
    if (view !== 'preview') {
      setTimeout(() => document.getElementById('editor').focus(), 50);
    }
  }

  /** Returns the currently active view */
  function getCurrent() { return currentView; }

  return { set, getCurrent };
})();


/* ================================================
   7. RESIZER MANAGER
   Draggable divider between the two panes.
   Updates pane flex widths in real time.
   ================================================ */

const ResizerManager = (() => {

  let isDragging = false;
  let startX     = 0;
  let startWidthLeft = 0;

  /**
   * Initializes the resizer's event listeners
   */
  function init() {
    const resizer     = document.getElementById('resizer');
    const editorPane  = document.getElementById('editor-pane');
    const panes       = document.getElementById('panes');

    if (!resizer) return;

    // Mouse down on the resizer: starts the drag
    resizer.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      // Current width of the left pane
      startWidthLeft = editorPane.getBoundingClientRect().width;

      resizer.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      // Disables text selection during the drag
      document.body.style.userSelect = 'none';

      e.preventDefault();
    });

    // Mouse move on the document: resizes
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const totalWidth = panes.getBoundingClientRect().width;
      const delta      = e.clientX - startX;
      const newLeft    = startWidthLeft + delta;

      // Limits: left pane min 20% – max 80% of total width
      const minW = totalWidth * 0.2;
      const maxW = totalWidth * 0.8;
      const clampedLeft = Math.max(minW, Math.min(maxW, newLeft));

      // Sets an explicit width on the left pane;
      // the right pane fills the rest via flex: 1
      editorPane.style.flex = 'none';
      editorPane.style.width = `${clampedLeft}px`;
    });

    // Mouse up: ends the drag
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      resizer.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });

    // Touch support (mobile) — optional, the resizer is hidden on mobile
    resizer.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startWidthLeft = editorPane.getBoundingClientRect().width;
      isDragging = true;
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const totalWidth = panes.getBoundingClientRect().width;
      const delta = touch.clientX - startX;
      const newLeft = Math.max(totalWidth * 0.2, Math.min(totalWidth * 0.8, startWidthLeft + delta));
      document.getElementById('editor-pane').style.width = `${newLeft}px`;
    });

    document.addEventListener('touchend', () => { isDragging = false; });
  }

  return { init };
})();


/* ================================================
   8. KEYBOARD MANAGER
   Keyboard shortcuts for the most common actions
   ================================================ */

const KeyboardManager = (() => {

  /**
   * Registers the shortcut listeners
   */
  function init() {
    document.addEventListener('keydown', handleKeydown);
  }

  /**
   * Handles keyboard shortcuts
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    // Only when Ctrl (or Cmd on Mac) is pressed
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;

    switch (e.key.toLowerCase()) {
      case 'b':
        // Ctrl+B → Bold
        e.preventDefault();
        ToolbarActions.inlineWrap('**', '**');
        break;

      case 'i':
        // Ctrl+I → Italic
        e.preventDefault();
        ToolbarActions.inlineWrap('*', '*');
        break;

      case 'k':
        // Ctrl+K → Insert link
        e.preventDefault();
        ToolbarActions.insertLink();
        break;

      case 's':
        // Ctrl+S → Save (download) the file
        e.preventDefault();
        EditorActions.downloadMarkdown();
        break;

      case '/':
        // Ctrl+/ → Cycle between views
        e.preventDefault();
        toggleView();
        break;
    }
  }

  /**
   * Cycles through views: split → editor → preview → split
   */
  function toggleView() {
    const views = ['split', 'editor', 'preview'];
    const current = ViewManager.getCurrent();
    const next = views[(views.indexOf(current) + 1) % views.length];
    ViewManager.set(next);
  }

  return { init };
})();


/* ================================================
   9. APP — INITIALIZATION
   Entry point: everything is wired up here
   ================================================ */

const App = {

  /**
   * Initializes the application:
   * 1. Initializes i18n (language detection + DOM translation)
   * 2. Configures marked.js
   * 3. Populates the editor with the default content for the active language
   * 4. Runs the first render
   * 5. Wires up listeners
   * 6. Starts the remaining modules
   */
  init() {
    // 1. Initialize i18n first, so the default content is in the right language
    I18n.init();

    // 2. Configure the Markdown parser
    Renderer.configure();

    // 3. Main DOM references
    const editor  = document.getElementById('editor');
    const preview = document.getElementById('preview');

    // 4. Default content, taken from the active language dictionary
    editor.value = I18n.t('defaultContent');

    // 5. First synchronous render
    this._renderAndUpdateStats(editor, preview);

    // 6. Editor listener: updates on every keystroke
    editor.addEventListener('input', () => {
      this._renderAndUpdateStats(editor, preview);
    });

    // 7. Tab key in the editor: inserts 2 spaces instead of changing focus
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end   = editor.selectionEnd;
        editor.setRangeText('  ', start, end, 'end');
        editor.dispatchEvent(new Event('input'));
      }
    });

    // 8. Re-render translated UI strings (toolbar tooltips, stats, empty
    //    preview placeholder) whenever the language changes. The editor
    //    content itself is intentionally left untouched on language
    //    switch, since it may contain the user's own work.
    document.addEventListener('languagechange', () => {
      this._renderAndUpdateStats(editor, preview);
    });

    // 9. Start remaining modules
    ResizerManager.init();
    KeyboardManager.init();

    // 10. Set the initial view
    ViewManager.set('split');

    // 11. Focus the editor on startup
    editor.focus();
  },

  /**
   * Runs the render and updates the statistics
   * @param {HTMLTextAreaElement} editor
   * @param {HTMLElement} preview
   */
  _renderAndUpdateStats(editor, preview) {
    // Updates the preview HTML
    preview.innerHTML = Renderer.parse(editor.value);
    // Updates the statistics in the status bar
    Stats.update(editor.value);
  },
};

/* -----------------------------------------------
   Startup: once the DOM is fully loaded
   ----------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => App.init());
