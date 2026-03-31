/**
 * Acode Svelte Formatter — Offline
 *
 * Formats .svelte files using Prettier 3 + prettier-plugin-svelte.
 * Fully offline — all parsers bundled into dist/main.js at build time.
 *
 * @version 1.5.0
 * @author  DIBBO
 * @license MIT
 */

import prettier from 'prettier/standalone';

// ── Prettier 3 standalone plugins ─────────────────────────────────────────────
// IMPORTANT: prettier/plugins/estree MUST be included when formatting
// JavaScript. Without it, Prettier 3 throws "unknown node type: Script"
// because it cannot print the AST nodes inside <script> blocks.
// Source: https://prettier.io/docs/browser
import * as parserEstree  from 'prettier/plugins/estree';   // ← required for JS/TS
import * as parserBabel   from 'prettier/plugins/babel';
import * as parserHtml    from 'prettier/plugins/html';
import * as parserPostcss from 'prettier/plugins/postcss';
import * as parserSvelte  from 'prettier-plugin-svelte/browser';

import pluginJson from '../plugin.json';

// ─── Plugin class ─────────────────────────────────────────────────────────────

class SvelteFormatter {

  constructor() {
    this._isFormatting  = false;
    this._autoSaveTimer = null;
    this._cacheFile     = null;
    this._settings = {
      tabWidth:             2,
      printWidth:           80,
      useTabs:              false,
      singleQuote:          false,
      trailingComma:        'all',
      bracketSameLine:      true,
      svelteSortOrder:      'options-scripts-markup-styles',
      svelteStrictMode:     false,
      svelteAllowShorthand: true,
      autoSave:             false,
      autoSaveInterval:     8000,
    };
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async init(baseUrl, $page, cache) {
    this._cacheFile = cache?.cacheFile ?? null;

    if (this._cacheFile) {
      try {
        const raw   = await this._cacheFile.readFile('utf-8');
        const saved = JSON.parse(raw);
        Object.assign(this._settings, saved);
      } catch (_) { /* first run — defaults are fine */ }
    }

    // Register as a formatter for .svelte files
    acode.registerFormatter(
      pluginJson.id,
      ['svelte'],
      this._format.bind(this),
    );

    // Keyboard shortcut — use editorManager.editor.commands (documented compat API)
    // Wrapped in try/catch: failure here must never crash the formatter
    this._registerCommand();

    if (this._settings.autoSave) {
      this._startAutoSave();
    }
  }

  destroy() {
    acode.unregisterFormatter(pluginJson.id);
    this._unregisterCommand();
    this._stopAutoSave();
  }

  // ── Command (safe) ────────────────────────────────────────────────────────

  _registerCommand() {
    try {
      editorManager.editor.commands.addCommand({
        name:        'svelte-formatter:format',
        description: 'Format Svelte File',
        bindKey:     { win: 'Ctrl-Alt-S', mac: 'Command-Option-S' },
        exec:        () => this._format(),
      });
    } catch (e) {
      console.warn('[SvelteFormatter] Shortcut unavailable:', e.message);
    }
  }

  _unregisterCommand() {
    try {
      editorManager.editor.commands.removeCommand('svelte-formatter:format');
    } catch (_) {}
  }

  // ── Formatting core ────────────────────────────────────────────────────────

  async _format() {
    if (this._isFormatting) return;

    const { activeFile } = editorManager;
    if (!activeFile?.name?.endsWith('.svelte')) return;

    this._isFormatting = true;
    const editor      = editorManager.editor;
    const unformatted = editor.getValue();

    try {
      const formatted = await prettier.format(unformatted, {
        parser:  'svelte',

        // estree MUST be first — it provides the base JS AST printer.
        // parserSvelte MUST be last — it overrides the svelte parser on top.
        plugins: [parserEstree, parserBabel, parserHtml, parserPostcss, parserSvelte],

        tabWidth:        this._settings.tabWidth,
        useTabs:         this._settings.useTabs,
        printWidth:      this._settings.printWidth,
        singleQuote:     this._settings.singleQuote,
        trailingComma:   this._settings.trailingComma,
        bracketSameLine: this._settings.bracketSameLine,

        svelteSortOrder:      this._settings.svelteSortOrder,
        svelteStrictMode:     this._settings.svelteStrictMode,
        svelteAllowShorthand: this._settings.svelteAllowShorthand,
      });

      if (formatted !== unformatted) {
        const cursor = editor.getCursorPosition();
        editor.session.setValue(formatted);
        editor.moveCursorToPosition(cursor);
        editor.scrollToRow(cursor.row);
      }

    } catch (err) {
      console.error('[SvelteFormatter]', err);
      window.toast(`Svelte Formatter: ${err.message}`, 4000);
    } finally {
      this._isFormatting = false;
    }
  }

  // ── Auto-save ─────────────────────────────────────────────────────────────

  _startAutoSave() {
    if (this._autoSaveTimer) return;
    this._autoSaveTimer = setInterval(async () => {
      const { activeFile } = editorManager;
      if (!activeFile?.name?.endsWith('.svelte')) return;
      if (!activeFile.isUnsaved) return;
      await this._format();
      acode.exec('save');
    }, this._settings.autoSaveInterval);
  }

  _stopAutoSave() {
    if (this._autoSaveTimer) {
      clearInterval(this._autoSaveTimer);
      this._autoSaveTimer = null;
    }
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  async _onSettingChange(key, value) {
    this._settings[key] = value;
    if (key === 'autoSave')         value ? this._startAutoSave() : this._stopAutoSave();
    if (key === 'autoSaveInterval' && this._settings.autoSave) {
      this._stopAutoSave(); this._startAutoSave();
    }
    if (this._cacheFile) {
      try { await this._cacheFile.writeFile(JSON.stringify(this._settings)); }
      catch (_) {}
    }
  }
}

// ─── Registration ─────────────────────────────────────────────────────────────

const plugin = new SvelteFormatter();

acode.setPluginInit(
  pluginJson.id,
  (baseUrl, $page, cache) => plugin.init(baseUrl, $page, cache),
  {
    list: [
      { key: 'tabWidth',    text: 'Tab Width',    value: 2,  prompt: 'Spaces per indent level', promptType: 'number' },
      { key: 'printWidth',  text: 'Print Width',  value: 80, prompt: 'Max line length',          promptType: 'number' },
      { key: 'useTabs',     text: 'Use Tabs',     info: 'Indent with tabs instead of spaces',    checkbox: true, value: false },
      { key: 'singleQuote', text: 'Single Quotes',info: "Use ' instead of \"",                   checkbox: true, value: false },
      { key: 'trailingComma', text: 'Trailing Commas', value: 'all',
        select: [['all','All'],['es5','ES5'],['none','None']] },
      { key: 'svelteSortOrder', text: 'Block Sort Order', value: 'options-scripts-markup-styles',
        select: [
          ['options-scripts-markup-styles', 'options → scripts → markup → styles'],
          ['scripts-options-markup-styles', 'scripts → options → markup → styles'],
          ['markup-styles-scripts-options', 'markup → styles → scripts → options'],
        ]},
      { key: 'svelteStrictMode',     text: 'Strict Mode',            info: 'Enable stricter Svelte formatting', checkbox: true, value: false },
      { key: 'svelteAllowShorthand', text: 'Allow Shorthand Attributes', info: 'Allow {name} shorthand',       checkbox: true, value: true  },
      { key: 'autoSave',             text: 'Auto Format & Save',     info: 'Format + save every 8 seconds',    checkbox: true, value: false },
    ],
    cb: (key, value) => plugin._onSettingChange(key, value),
  },
);

acode.setPluginUnmount(pluginJson.id, () => plugin.destroy());
