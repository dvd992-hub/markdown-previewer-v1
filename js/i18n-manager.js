/**
 * i18n.js — Internationalization manager
 *
 * Hybrid strategy:
 *   1. On first load, detect the browser language via navigator.language.
 *   2. If the user has a saved preference in localStorage, that wins instead.
 *   3. The manual toggle in the toolbar lets the user override the language
 *      at any time; the choice is persisted to localStorage for future visits.
 *
 * Supported languages: 'en' (English), 'it' (Italian).
 * Any other browser language falls back to English.
 */

'use strict';

const I18n = (() => {

  /** localStorage key used to persist the user's language choice */
  const STORAGE_KEY = 'markdown-previewer-lang';

  /** Languages supported by the app */
  const SUPPORTED_LANGUAGES = ['en', 'it'];

  /** Fallback language when detection fails or is unsupported */
  const FALLBACK_LANGUAGE = 'en';

  /** Currently active language */
  let currentLang = FALLBACK_LANGUAGE;

  /**
   * Detects the best language to use on first load.
   * Priority: saved preference > browser language > fallback.
   * @returns {string} - Language code ('en' | 'it')
   */
  function detectLanguage() {
    // 1. Check for a previously saved user preference
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }

    // 2. Fall back to the browser/system language
    const browserLang = (navigator.language || navigator.userLanguage || '')
      .toLowerCase()
      .slice(0, 2); // 'it-IT' → 'it'

    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      return browserLang;
    }

    // 3. Default fallback
    return FALLBACK_LANGUAGE;
  }

  /**
   * Returns the translation dictionary for a given language.
   * @param {string} lang
   * @returns {Object}
   */
  function getDictionary(lang) {
    return (window.I18N_STRINGS && window.I18N_STRINGS[lang]) || {};
  }

  /**
   * Translates a single key in the currently active language.
   * @param {string} key
   * @returns {string}
   */
  function t(key) {
    const dict = getDictionary(currentLang);
    return dict[key] !== undefined ? dict[key] : key;
  }

  /**
   * Applies translations to every element in the DOM marked with
   * data-i18n attributes:
   *   data-i18n        → textContent
   *   data-i18n-title  → title attribute (tooltip)
   *   data-i18n-aria   → aria-label attribute
   *   data-i18n-placeholder → placeholder attribute
   */
  function applyToDOM() {
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });

    // Update language toggle button states
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  /**
   * Switches the active language, persists the choice, and re-applies
   * translations to the DOM. Dispatches a custom event so other modules
   * (e.g. the editor default content) can react to the change.
   * @param {string} lang - 'en' | 'it'
   */
  function setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyToDOM();

    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }

  /**
   * Initializes the i18n system: detects language and applies it.
   * Should be called once on app startup.
   */
  function init() {
    currentLang = detectLanguage();
    applyToDOM();
  }

  /** Returns the current active language code */
  function getCurrentLanguage() {
    return currentLang;
  }

  return { init, setLanguage, t, getCurrentLanguage, getDictionary };
})();
