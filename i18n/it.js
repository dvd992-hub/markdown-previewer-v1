/**
 * it.js — Stringhe di traduzione italiane
 * Caricato come oggetto globale su window.I18N_STRINGS.it
 */

window.I18N_STRINGS = window.I18N_STRINGS || {};

window.I18N_STRINGS.it = {
  // Nome app
  appName: "Markdown Previewer",

  // Tooltip / aria-label toolbar
  bold: "Grassetto",
  italic: "Corsivo",
  strikethrough: "Barrato",
  inlineCode: "Codice inline",
  heading: "Titolo",
  bulletList: "Lista puntata",
  quote: "Citazione",
  codeBlock: "Blocco di codice",
  link: "Inserisci link",
  horizontalRule: "Linea orizzontale",
  copyMarkdown: "Copia markdown",
  clearEditor: "Cancella editor",
  downloadMarkdown: "Scarica file .md",

  // aria-label dei gruppi
  groupFormatting: "Formattazione testo",
  groupBlocks: "Elementi blocco",
  groupActions: "Azioni",
  groupViewToggle: "Modalità di visualizzazione",
  groupLanguage: "Lingua",

  // Pulsanti modalità di vista
  viewSplit: "Split",
  viewEditor: "Editor",
  viewPreview: "Anteprima",

  // Intestazioni pannelli
  paneMarkdown: "Markdown",
  panePreview: "Anteprima",

  // Editor
  editorAriaLabel: "Scrivi markdown qui",
  previewAriaLabel: "Anteprima renderizzata",
  previewEmpty: "Inizia a scrivere nell'editor…",

  // Status bar
  words: "parole",
  word: "parola",
  chars: "caratteri",
  char: "carattere",
  lines: "righe",
  line: "riga",
  readTime: "min lettura",

  // Toast / conferma
  copied: "Copiato!",
  confirmClear: "Cancellare tutto il contenuto?",

  // Contenuto di default dell'editor (documento di esempio)
  defaultContent: `# Benvenuto in Markdown Previewer 👋

Un editor **live** con anteprima in tempo reale.

## Formattazione di base

Puoi usare **grassetto**, *corsivo*, ~~barrato~~ e \`codice inline\`.

## Liste

- Elemento uno
- Elemento due
  - Elemento annidato
  - Altro annidato
- Elemento tre

### Lista numerata

1. Primo passo
2. Secondo passo
3. Terzo passo

## Codice

\`\`\`js
// Esempio JavaScript
function saluta(nome) {
  return \`Ciao, \${nome}!\`;
}
console.log(saluta('Mondo'));
\`\`\`

## Tabella

| Caratteristica   | Stato |
|------------------|-------|
| Anteprima live   | ✓     |
| Responsive       | ✓     |
| Tema scuro       | ✓     |
| Download .md     | ✓     |

## Citazione

> "La semplicità è l'ultima sofisticazione."
> — Leonardo da Vinci

## Link e immagini

Visita [Anthropic](https://www.anthropic.com) per saperne di più su Claude.

---

*Inizia a scrivere nell'editor a sinistra →*
`,
};
