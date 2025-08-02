#!/usr/bin/env node

/**
 * Version bump script for Chrome Extension
 *
 * Usage:
 *   node scripts/bump-version.js patch  # 2.0.0 -> 2.0.1
 *   node scripts/bump-version.js minor  # 2.0.0 -> 2.1.0
 *   node scripts/bump-version.js major  # 2.0.0 -> 3.0.0
 *   node scripts/bump-version.js 2.1.5  # Set specific version
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '../v2/manifest.json');
const PACKAGE_PATH = path.join(__dirname, '../v2/package.json');

function getCurrentVersion() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  return manifest.version;
}

function parseVersion(version) {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0
  };
}

function bumpVersion(current, type) {
  const version = parseVersion(current);

  switch (type) {
    case 'major':
      return `${version.major + 1}.0.0`;
    case 'minor':
      return `${version.major}.${version.minor + 1}.0`;
    case 'patch':
      return `${version.major}.${version.minor}.${version.patch + 1}`;
    default:
      // Assume it's a specific version string
      if (/^\d+\.\d+\.\d+$/.test(type)) {
        return type;
      }
      throw new Error(`Invalid version type: ${type}. Use 'major', 'minor', 'patch', or a specific version like '2.1.5'`);
  }
}

function updateManifest(newVersion) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  manifest.version = newVersion;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ Updated manifest.json: ${manifest.version} -> ${newVersion}`);
}

function updatePackageJson(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated package.json: ${oldVersion} -> ${newVersion}`);
}

function createGitTag(version) {
  const { execSync } = require('child_process');
  try {
    // Check if we're in a git repository and have changes to commit
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });

    // Add the changed files
    execSync('git add v2/manifest.json v2/package.json', { stdio: 'inherit' });

    // Commit the version bump
    execSync(`git commit -m "Bump version to ${version}"`, { stdio: 'inherit' });

    // Create and push the tag
    execSync(`git tag v${version}`, { stdio: 'inherit' });

    console.log(`✅ Created git commit and tag: v${version}`);
    console.log(`💡 Push with: git push && git push --tags`);

  } catch (error) {
    console.log(`⚠️  Git operations failed (this is okay if not in a git repo): ${error.message}`);
  }
}

function main() {
  const versionType = process.argv[2];

  if (!versionType) {
    console.error('❌ Usage: node bump-version.js <major|minor|patch|version>');
    console.error('   Examples:');
    console.error('     node bump-version.js patch   # 2.0.0 -> 2.0.1');
    console.error('     node bump-version.js minor   # 2.0.0 -> 2.1.0');
    console.error('     node bump-version.js major   # 2.0.0 -> 3.0.0');
    console.error('     node bump-version.js 2.1.5   # Set to specific version');
    process.exit(1);
  }

  try {
    const currentVersion = getCurrentVersion();
    const newVersion = bumpVersion(currentVersion, versionType);

    console.log(`🚀 Bumping version from ${currentVersion} to ${newVersion}`);

    updateManifest(newVersion);
    updatePackageJson(newVersion);

    console.log(`\n📋 Version bump complete!`);
    console.log(`   Current version: ${newVersion}`);
    console.log(`   Manifest: v2/manifest.json updated`);
    console.log(`   Package:  v2/package.json updated`);

    // Optionally create git commit and tag
    if (process.argv.includes('--git')) {
      createGitTag(newVersion);
    } else {
      console.log(`\n💡 To also create git commit and tag, use: --git flag`);
      console.log(`   Example: node bump-version.js patch --git`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getCurrentVersion, bumpVersion, updateManifest, updatePackageJson };
