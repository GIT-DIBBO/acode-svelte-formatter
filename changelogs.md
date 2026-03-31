# Changelog

## 1.5.1

- **Fix:** Added icon.png and icon.svg to the plugin 

## v1.5.0

- **Fix:** Added `prettier/plugins/estree` to the plugins list — this is **required** by Prettier 3 standalone when formatting JavaScript. Without it, Prettier cannot print `<script>` block AST nodes, causing "unknown node type: Script"
- **Fix:** Plugin order corrected — `parserEstree` first, `parserSvelte` last (svelte overrides must come after base parsers)
- **Fix:** Removed auto-commit-back step from GitHub Actions — it was the root cause of the repeated "fetch first" push rejection race condition. `dist/main.js` is now committed manually before each push

## v1.4.0

- **Fix:** `editorManager.editor.commands.addCommand()` — correct compat API
- **Fix:** try/catch around command registration

## v1.3.0

- **Fix:** `acode.addCommand()` (was not a function) → `acode.require('commands')`
- **Added:** MIT LICENSE file

## v1.2.0

- **Fix:** Correct editor read/write API, `acode.exec('save')`, plugin ID import
- **Fix:** GitHub Actions 403 with `persist-credentials: true`

## v1.1.0

- Upgraded Prettier 2 → Prettier 3, added settings panel

## v1.0.2

- Initial release
