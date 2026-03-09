#!/usr/bin/env node
import { copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const srcStyles = resolve('src/styles.css')
const distStyles = resolve('dist/styles.css')

if (existsSync(srcStyles)) {
  copyFileSync(srcStyles, distStyles)
  console.log('✓ Copied styles.css to dist/')
} else {
  console.log('ℹ No src/styles.css found, skipping copy')
}
