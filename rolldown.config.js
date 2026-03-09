import { defineConfig } from 'rolldown'

export default defineConfig({
  input: {
    index: 'src/index.ts',
    browser: 'src/browser.ts',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].mjs',
  },
  external: ['payload'],
})
