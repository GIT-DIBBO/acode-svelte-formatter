/**
 * Build script for acode-svelte-formatter
 *
 * Usage:
 *   node build.js          → production build + packages svelte-formatter.aip
 *   node build.js --watch  → incremental dev build (no .aip)
 *
 * @version 1.2.0
 */

'use strict';

const esbuild      = require('esbuild');
const { execSync } = require('child_process');
const fs           = require('fs');
const path         = require('path');

const isWatch = process.argv.includes('--watch');

const DIST_DIR = path.resolve(__dirname, 'dist');
const OUT_FILE = path.join(DIST_DIR, 'main.js');
const AIP_FILE = path.resolve(__dirname, 'svelte-formatter.aip');

const buildConfig = {
  entryPoints: ['src/main.js'],
  bundle:      true,
  outfile:     OUT_FILE,
  format:      'iife',       // Acode loads plugins as self-contained IIFEs
  platform:    'browser',    // No Node.js shims; Prettier standalone is browser-safe
  target:      ['es2020'],
  minify:      !isWatch,
  sourcemap:   isWatch ? 'inline' : false,
  define: {
    // Suppress process.env checks inside Prettier's browser bundle
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  // Allow esbuild to resolve plugin.json as a module (used in main.js)
  loader: { '.json': 'json' },
  logLevel: 'info',
};

async function main() {
  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

  if (isWatch) {
    const ctx = await esbuild.context(buildConfig);
    await ctx.watch();
    console.log('👀  Watching for changes…');
    console.log('    In Acode: Plugins → ⊕ → Remote → paste your dev server URL');
    return;
  }

  // ── Production build ──────────────────────────────────────────────────────
  console.log('\n[1/2] Bundling…');
  await esbuild.build(buildConfig);

  console.log('[2/2] Packaging .aip…');
  if (fs.existsSync(AIP_FILE)) fs.unlinkSync(AIP_FILE);

  // Verify every file required by plugin.json / Acode spec exists
  const required = ['plugin.json', 'dist/main.js', 'readme.md', 'changelogs.md', 'LICENSE'];
  for (const f of required) {
    if (!fs.existsSync(path.resolve(__dirname, f))) {
      throw new Error(`Required file missing: ${f}`);
    }
  }

  // Pick best available icon
  let iconFlag = '';
  if      (fs.existsSync(path.resolve(__dirname, 'icon.png'))) iconFlag = ' icon.png';
  else if (fs.existsSync(path.resolve(__dirname, 'icon.svg'))) iconFlag = ' icon.svg';

  execSync(
    `zip -r svelte-formatter.aip plugin.json dist/main.js readme.md changelogs.md LICENSE${iconFlag}`,
    { stdio: 'inherit' },
  );

  const kb = (fs.statSync(AIP_FILE).size / 1024).toFixed(1);
  console.log(`\n✅  svelte-formatter.aip  (${kb} KB)`);
  console.log('    Install: Acode → Plugins → ⊕ → Local → select the .aip\n');
}

main().catch(err => {
  console.error('\n❌  Build failed:', err.message);
  process.exit(1);
});
