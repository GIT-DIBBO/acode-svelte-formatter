# Svelte Formatter Offline

Format `.svelte` files directly inside **Acode** (Android code editor) — fully offline, no internet required.

Powered by [Prettier 3](https://prettier.io/) and [prettier-plugin-svelte](https://github.com/sveltejs/prettier-plugin-svelte).

---

## Features

- **100% offline** — Prettier and the Svelte plugin are bundled into a single IIFE. No CDN calls at runtime.
- **Format on demand** — trigger via the Acode Format command or `Ctrl+Alt+S`.
- **Auto format & save** — optional daemon that formats + saves every 8 seconds (disabled by default).
- **Settings panel** — tab width, print width, quote style, trailing commas, Svelte sort order, and more.
- **Cursor preservation** — cursor stays as close to its original position as possible after formatting.

---

## Install via Remote URL (recommended)

1. In Acode open **Settings → Plugins → ⊕ → Remote**
2. Paste:
   ```
   https://github.com/GIT-DIBBO/acode-svelte-formatter/archive/refs/heads/main.zip
   ```
3. Tap **Install**

---

## Install from local `.aip`

1. Download `svelte-formatter.aip` from the [Releases](../../releases) page.
2. In Acode open **Settings → Plugins → ⊕ → Local**.
3. Select the `.aip` file.

---

## Build from source

```bash
git clone https://github.com/GIT-DIBBO/acode-svelte-formatter.git
cd acode-svelte-formatter
npm install
npm run build
# → creates svelte-formatter.aip
# Install via Acode → Plugins → ⊕ → Local
```

### Dev / live-reload mode

```bash
npm run dev
# In Acode: Plugins → ⊕ → Remote → http://<your-pc-ip>:3000/dist.zip
```

---

## Usage

| Action | How |
| --- | --- |
| Format current file | `Ctrl+Alt+S` or Acode → Format |
| Configure options | Acode → Settings → Plugins → Svelte Formatter Offline |
| Auto-format + save | Enable **Auto Format & Save** in plugin settings |

---

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| Tab Width | `2` | Spaces per indent level |
| Print Width | `80` | Max line length before wrapping |
| Use Tabs | `false` | Indent with tabs instead of spaces |
| Single Quotes | `false` | Use `'` instead of `"` |
| Trailing Commas | `all` | `all` / `es5` / `none` |
| Block Sort Order | `options-scripts-markup-styles` | Order of top-level Svelte blocks |
| Strict Mode | `false` | Enable stricter Svelte formatting rules |
| Allow Shorthand | `true` | Allow `{name}` attribute shorthand |
| Auto Format & Save | `false` | Format + save active `.svelte` file on a timer |

---

## Requirements

- Acode **v1.8.290** or higher (`minVersionCode: 290`)

---

## License

MIT © DIBBO
