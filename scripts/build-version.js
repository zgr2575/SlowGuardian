#!/usr/bin/env node

/**
 * Build Version Generator
 * Generates version information for SlowGuardian builds
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Get package.json version
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));

// Get git information
let gitCommitHash = 'unknown';
let gitCommitShort = 'unknown';
let gitBranch = 'unknown';
let gitCommitDate = 'unknown';
let gitCommitMessage = 'unknown';

try {
  gitCommitHash = execSync('git rev-parse HEAD', { cwd: rootDir }).toString().trim();
  gitCommitShort = execSync('git rev-parse --short HEAD', { cwd: rootDir }).toString().trim();
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: rootDir }).toString().trim();
  gitCommitDate = execSync('git log -1 --format=%cI', { cwd: rootDir }).toString().trim();
  gitCommitMessage = execSync('git log -1 --format=%s', { cwd: rootDir }).toString().trim();
} catch (error) {
  console.warn('Warning: Could not retrieve git information:', error.message);
}

// Generate build information
const buildInfo = {
  version: packageJson.version,
  name: packageJson.name,
  buildId: `${gitCommitShort}-${Date.now()}`,
  buildDate: new Date().toISOString(),
  buildTimestamp: Date.now(),
  git: {
    commit: gitCommitHash,
    commitShort: gitCommitShort,
    branch: gitBranch,
    commitDate: gitCommitDate,
    commitMessage: gitCommitMessage
  },
  environment: process.env.NODE_ENV || 'development',
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch
};

// Write version.json
const versionPath = join(rootDir, 'static', 'version.json');
writeFileSync(versionPath, JSON.stringify(buildInfo, null, 2));

// Update version.txt with short format
const shortVersion = `${buildInfo.version}-${buildInfo.git.commitShort}`;
writeFileSync(join(rootDir, 'version.txt'), shortVersion);

console.log('✅ Build version generated successfully!');
console.log(`📦 Version: ${buildInfo.version}`);
console.log(`🔨 Build ID: ${buildInfo.buildId}`);
console.log(`📅 Build Date: ${buildInfo.buildDate}`);
console.log(`🌿 Branch: ${buildInfo.git.branch}`);
console.log(`🔗 Commit: ${buildInfo.git.commitShort} (${buildInfo.git.commitMessage})`);
console.log(`📁 Version file: ${versionPath}`);

export default buildInfo;