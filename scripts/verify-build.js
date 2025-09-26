#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const DIST_DIR = 'dist';
const REQUIRED_FILES = [
  'index.html',
  'manifest.json',
  'sw.js',
  'vite.svg'
];

console.log('🔍 Verifying build output...');

// Check if dist directory exists
if (!existsSync(DIST_DIR)) {
  console.error('❌ Build directory "dist" not found');
  process.exit(1);
}

// Check for required files
let allFilesExist = true;
for (const file of REQUIRED_FILES) {
  const filePath = join(DIST_DIR, file);
  if (existsSync(filePath)) {
    console.log(`✅ ${file} - Found`);
  } else {
    console.error(`❌ ${file} - Missing`);
    allFilesExist = false;
  }
}

// Check index.html contains expected content
try {
  const indexPath = join(DIST_DIR, 'index.html');
  if (existsSync(indexPath)) {
    const indexContent = readFileSync(indexPath, 'utf8');
    const checks = [
      ['Title', indexContent.includes('Limpopo Connect')],
      ['Assets linked', indexContent.includes('/assets/')],
      ['Meta description', indexContent.includes('Connecting communities')],
      ['Theme color', indexContent.includes('#1E40AF')]
    ];
    
    console.log('\n📄 index.html validation:');
    checks.forEach(([name, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${name}`);
      if (!passed) allFilesExist = false;
    });
  }
} catch (error) {
  console.error('❌ Error reading index.html:', error.message);
  allFilesExist = false;
}

console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Build verification passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('💥 Build verification failed! Please fix the issues above.');
  process.exit(1);
}