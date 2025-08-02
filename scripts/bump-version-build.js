#!/usr/bin/env node
/**
 * GitHub Actions Version Bumper
 * Updates patch version using GitHub Actions run number
 * Usage: node scripts/bump-version-build.js [build-number]
 *
 * Examples:
 *   node scripts/bump-version-build.js 123    # Sets patch to 123 (e.g., 2.1.123)
 *   node scripts/bump-version-build.js        # Uses GITHUB_RUN_NUMBER env var
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

function setBuildVersion(currentVersion, buildNumber) {
  const { major, minor } = parseVersion(currentVersion);
  const patch = parseInt(buildNumber, 10);

  if (isNaN(patch) || patch < 0) {
    throw new Error(`Invalid build number: ${buildNumber}. Must be a positive integer.`);
  }

  return `${major}.${minor}.${patch}`;
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

function main() {
  try {
    // Get build number from command line or environment
    const buildNumber = process.argv[2] || process.env.GITHUB_RUN_NUMBER;

    if (!buildNumber) {
      console.error('❌ Build number required!');
      console.error('Usage: node bump-version-build.js <build-number>');
      console.error('   Or set GITHUB_RUN_NUMBER environment variable');
      process.exit(1);
    }

    const currentVersion = getCurrentVersion();
    const newVersion = setBuildVersion(currentVersion, buildNumber);

    console.log(`🚀 Setting build version: ${currentVersion} -> ${newVersion}`);
    console.log(`   Build number: ${buildNumber}`);

    updateManifest(newVersion);
    updatePackageJson(newVersion);

    console.log(`\n📋 Version update complete!`);
    console.log(`   New version: ${newVersion}`);
    console.log(`   Manifest: v2/manifest.json updated`);
    console.log(`   Package:  v2/package.json updated`);

    // Output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      const output = `version=${newVersion}\n`;
      fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
      console.log(`🔧 Set GitHub Actions output: version=${newVersion}`);
    }

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getCurrentVersion, setBuildVersion, updateManifest, updatePackageJson };
