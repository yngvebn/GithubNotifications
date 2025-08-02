#!/usr/bin/env node
/**
 * Manual Version Bumper for Major/Minor versions
 * Resets patch version to 0 (will be set by build number in CI)
 * Usage: node scripts/bump-version-manual.js <major|minor>
 *
 * Examples:
 *   node scripts/bump-version-manual.js minor   # 2.1.123 -> 2.2.0
 *   node scripts/bump-version-manual.js major   # 2.1.123 -> 3.0.0
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
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${version}. Expected format: major.minor.patch`);
  }
  return { major: parts[0], minor: parts[1], patch: parts[2] };
}

function bumpVersion(currentVersion, type) {
  const { major, minor, patch } = parseVersion(currentVersion);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    default:
      throw new Error(`Invalid version type: ${type}. Use 'major' or 'minor'`);
  }
}

function updateManifest(newVersion) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const oldVersion = manifest.version;
  manifest.version = newVersion;
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✅ Updated manifest.json: ${oldVersion} -> ${newVersion}`);
}

function updatePackageJson(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  const oldVersion = packageJson.version;
  packageJson.version = newVersion;
  fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Updated package.json: ${oldVersion} -> ${newVersion}`);
}

function createGitCommit(version, type) {
  const { execSync } = require('child_process');
  try {
    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });

    // Add the changed files
    execSync('git add v2/manifest.json v2/package.json', { stdio: 'inherit' });

    // Commit the version bump
    execSync(`git commit -m "Bump ${type} version to ${version} (patch will be set by build number)"`, { stdio: 'inherit' });

    console.log(`✅ Created git commit for ${type} version bump`);
    console.log(`💡 Push with: git push`);
    console.log(`🚀 Next CI build will set patch version automatically!`);

  } catch (error) {
    console.log(`⚠️  Git operations failed: ${error.message}`);
  }
}

function main() {
  const versionType = process.argv[2];

  if (!versionType || !['major', 'minor'].includes(versionType)) {
    console.error('❌ Usage: node bump-version-manual.js <major|minor>');
    console.error('   Examples:');
    console.error('     node bump-version-manual.js minor   # 2.1.123 -> 2.2.0');
    console.error('     node bump-version-manual.js major   # 2.1.123 -> 3.0.0');
    console.error('');
    console.error('   Note: Patch version will be automatically set by CI build number');
    process.exit(1);
  }

  try {
    const currentVersion = getCurrentVersion();
    const newVersion = bumpVersion(currentVersion, versionType);

    console.log(`🚀 Bumping ${versionType} version: ${currentVersion} -> ${newVersion}`);
    console.log(`   Patch version reset to 0 (will be set by CI build number)`);

    updateManifest(newVersion);
    updatePackageJson(newVersion);

    console.log(`\n📋 ${versionType.charAt(0).toUpperCase() + versionType.slice(1)} version bump complete!`);
    console.log(`   New version: ${newVersion}`);
    console.log(`   Manifest: v2/manifest.json updated`);
    console.log(`   Package:  v2/package.json updated`);

    // Optionally create git commit
    if (process.argv.includes('--git')) {
      createGitCommit(newVersion, versionType);
    } else {
      console.log(`\n💡 To also create git commit, use: --git flag`);
      console.log(`   Example: node bump-version-manual.js ${versionType} --git`);
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
