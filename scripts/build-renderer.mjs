import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rendererDir = path.resolve(process.cwd(), 'renderer');
const outDir = path.join(rendererDir, 'dist');

await mkdir(outDir, { recursive: true });

await build({
  entryPoints: [path.join(rendererDir, 'app.jsx')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2020'],
  outfile: path.join(outDir, 'app.js'),
  jsx: 'automatic',
  sourcemap: true,
  loader: {
    '.js': 'jsx',
    '.jsx': 'jsx',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});