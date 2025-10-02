#!/usr/bin/env node

/**
 * Script to set up Scramjet proxy for premium users
 * Copies necessary files from node_modules to static directory
 */

const fs = require('fs');
const path = require('path');

const scramjetSrc = path.join(__dirname, '../node_modules/@mercuryworkshop/scramjet');
const scramjetDest = path.join(__dirname, '../static/scram');

console.log('Setting up Scramjet for premium users...');

// Create destination directory
if (!fs.existsSync(scramjetDest)) {
  fs.mkdirSync(scramjetDest, { recursive: true });
  console.log('✓ Created /static/scram directory');
}

// Check if Scramjet package exists
if (!fs.existsSync(scramjetSrc)) {
  console.error('✗ Scramjet package not found in node_modules');
  console.log('  Run: npm install @mercuryworkshop/scramjet');
  process.exit(1);
}

// List of files to copy (based on Scramjet documentation)
const filesToCopy = [
  'scramjet.wasm.js',
  'scramjet.worker.js', 
  'scramjet.client.js',
  'scramjet.shared.js',
  'scramjet.sync.js',
  'scramjet.codecs.js'
];

let copiedCount = 0;

// Try to copy files from various possible locations
const possiblePaths = ['dist', 'lib', ''];

for (const file of filesToCopy) {
  let found = false;
  
  for (const subPath of possiblePaths) {
    const srcPath = path.join(scramjetSrc, subPath, file);
    const destPath = path.join(scramjetDest, file);
    
    if (fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✓ Copied ${file}`);
        copiedCount++;
        found = true;
        break;
      } catch (err) {
        console.error(`✗ Error copying ${file}:`, err.message);
      }
    }
  }
  
  if (!found) {
    console.log(`⚠ ${file} not found (may not be needed)`);
  }
}

if (copiedCount > 0) {
  console.log(`\n✓ Successfully set up Scramjet with ${copiedCount} files`);
  console.log('  Scramjet will be available for premium users at /scram/ prefix');
} else {
  console.log('\n⚠ No Scramjet files were copied');
  console.log('  Please check the Scramjet package installation');
  console.log('  or refer to: https://github.com/MercuryWorkshop/scramjet');
}
