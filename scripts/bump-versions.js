#!/usr/bin/env node

/**
 * Journium Package Version Bump Script
 * 
 * This script handles version bumping for all Journium packages in the correct dependency order.
 * It ensures internal dependencies are updated to use the latest versions.
 * 
 * Usage:
 *   node scripts/bump-versions.js [bump-type]
 * 
 * Bump types: patch, minor, major, prerelease, prepatch, preminor, premajor
 * If no bump type is provided, it will prompt interactively.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

// Package dependency order for publishing (dependencies first)
const PACKAGE_ORDER = [
  'core',           // @journium/core (no internal deps)
  'journium-js',    // journium-js (depends on core)
  'journium-react', // @journium/react (depends on core, journium-js)
  'journium-nextjs' // @journium/nextjs (depends on core, journium-js, react)
];

// Package name mapping
const PACKAGE_NAMES = {
  'core': '@journium/core',
  'journium-js': 'journium-js',
  'journium-react': '@journium/react',
  'journium-nextjs': '@journium/nextjs'
};

// Valid bump types
const VALID_BUMP_TYPES = [
  'patch', 'minor', 'major', 
  'prerelease', 'prepatch', 'preminor', 'premajor'
];

class VersionBumper {
  constructor() {
    // Handle both running from root and from scripts directory
    const workspaceRoot = process.cwd().endsWith('/scripts') ? path.join(process.cwd(), '..') : process.cwd();
    this.packagesDir = path.join(workspaceRoot, 'packages');
    this.packages = new Map();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run() {
    try {
      console.log('🚀 Journium Package Version Bump Tool\n');
      
      // Load current package info
      await this.loadPackages();
      
      // Display current versions
      this.displayCurrentVersions();
      
      // Get bump type
      const bumpType = await this.getBumpType();
      
      // Calculate new versions
      const newVersions = await this.calculateNewVersions(bumpType);
      
      // Confirm changes
      const confirmed = await this.confirmChanges(newVersions);
      if (!confirmed) {
        console.log('❌ Version bump cancelled.');
        return;
      }
      
      // Apply version bumps
      await this.applyVersionBumps(newVersions);
      
      console.log('✅ All package versions have been bumped successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Run: npm install');
      console.log('   2. Run: pnpm build');
      console.log('   3. Run: node scripts/publish.js');
      
    } catch (error) {
      console.error('❌ Error during version bump:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async loadPackages() {
    console.log('📦 Loading package information...\n');
    
    for (const pkg of PACKAGE_ORDER) {
      const packagePath = path.join(this.packagesDir, pkg, 'package.json');
      
      if (!fs.existsSync(packagePath)) {
        throw new Error(`Package not found: ${pkg} at ${packagePath}`);
      }
      
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      this.packages.set(pkg, {
        path: packagePath,
        data: packageJson,
        name: packageJson.name,
        version: packageJson.version
      });
    }
  }

  displayCurrentVersions() {
    console.log('📋 Current package versions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const [pkg, info] of this.packages) {
      console.log(`   ${info.name.padEnd(20)} v${info.version}`);
    }
    console.log();
  }

  async getBumpType() {
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
      const bumpType = args[0].toLowerCase();
      if (!VALID_BUMP_TYPES.includes(bumpType)) {
        throw new Error(`Invalid bump type: ${bumpType}. Valid types: ${VALID_BUMP_TYPES.join(', ')}`);
      }
      return bumpType;
    }
    
    return new Promise((resolve) => {
      console.log('🔢 Select version bump type:');
      console.log('   1. patch    - Bug fixes (0.1.0 → 0.1.1)');
      console.log('   2. minor    - New features (0.1.0 → 0.2.0)');
      console.log('   3. major    - Breaking changes (0.1.0 → 1.0.0)');
      console.log('   4. prerelease - Pre-release (0.1.0-alpha.1 → 0.1.0-alpha.2)');
      console.log('   5. prepatch - Pre-patch (0.1.0 → 0.1.1-alpha.0)');
      console.log('   6. preminor - Pre-minor (0.1.0 → 0.2.0-alpha.0)');
      console.log('   7. premajor - Pre-major (0.1.0 → 1.0.0-alpha.0)');
      console.log();
      
      this.rl.question('Enter choice (1-7) or bump type name: ', (answer) => {
        const choice = answer.trim();
        
        const typeMap = {
          '1': 'patch', '2': 'minor', '3': 'major', '4': 'prerelease',
          '5': 'prepatch', '6': 'preminor', '7': 'premajor'
        };
        
        const bumpType = typeMap[choice] || choice.toLowerCase();
        
        if (!VALID_BUMP_TYPES.includes(bumpType)) {
          console.log(`❌ Invalid choice: ${choice}`);
          process.exit(1);
        }
        
        resolve(bumpType);
      });
    });
  }

  async calculateNewVersions(bumpType) {
    console.log(`\n🔄 Calculating new versions for bump type: ${bumpType}\n`);
    
    const newVersions = new Map();
    
    for (const [pkg, info] of this.packages) {
      // Use npm version to calculate new version (dry run)
      try {
        const currentDir = process.cwd();
        const packageDir = path.dirname(info.path);
        
        process.chdir(packageDir);
        
        const result = execSync(`npm version ${bumpType} --no-git-tag-version --dry-run`, { 
          encoding: 'utf8',
          stdio: ['inherit', 'pipe', 'inherit']
        });
        
        const newVersion = result.trim().replace('v', '');
        newVersions.set(pkg, newVersion);
        
        process.chdir(currentDir);
        
        console.log(`   ${info.name.padEnd(20)} v${info.version} → v${newVersion}`);
        
      } catch (error) {
        throw new Error(`Failed to calculate new version for ${pkg}: ${error.message}`);
      }
    }
    
    return newVersions;
  }

  async confirmChanges(newVersions) {
    console.log('\n📝 Summary of changes:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const [pkg, newVersion] of newVersions) {
      const info = this.packages.get(pkg);
      console.log(`   ${info.name.padEnd(20)} v${info.version} → v${newVersion}`);
    }
    
    return new Promise((resolve) => {
      this.rl.question('\n❓ Proceed with version bump? (y/N): ', (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async applyVersionBumps(newVersions) {
    console.log('\n🔧 Applying version bumps...\n');
    
    // First pass: Update all package versions
    for (const [pkg, newVersion] of newVersions) {
      console.log(`📦 Updating ${pkg} to v${newVersion}...`);
      
      const info = this.packages.get(pkg);
      const currentDir = process.cwd();
      const packageDir = path.dirname(info.path);
      
      try {
        process.chdir(packageDir);
        execSync(`npm version ${newVersion} --no-git-tag-version`, { stdio: 'inherit' });
        process.chdir(currentDir);
        
        // Reload package data with new version
        const updatedPackageJson = JSON.parse(fs.readFileSync(info.path, 'utf8'));
        this.packages.set(pkg, {
          ...info,
          data: updatedPackageJson,
          version: newVersion
        });
        
      } catch (error) {
        process.chdir(currentDir);
        throw new Error(`Failed to update version for ${pkg}: ${error.message}`);
      }
    }
    
    // Second pass: Update internal dependencies
    console.log('\n🔗 Updating internal dependencies...\n');
    
    for (const [pkg] of this.packages) {
      await this.updateInternalDependencies(pkg, newVersions);
    }
  }

  async updateInternalDependencies(pkg, newVersions) {
    const info = this.packages.get(pkg);
    const packageJson = { ...info.data };
    let hasChanges = false;
    
    // Check and update dependencies
    if (packageJson.dependencies) {
      for (const [depPkg, newVersion] of newVersions) {
        const depName = PACKAGE_NAMES[depPkg];
        
        if (packageJson.dependencies[depName]) {
          // For workspace packages, use "workspace:*" or the new version
          const isWorkspace = packageJson.dependencies[depName].startsWith('workspace:');
          
          if (isWorkspace) {
            // Keep workspace:* pattern for monorepo
            packageJson.dependencies[depName] = 'workspace:*';
          } else {
            // Update to specific version for published packages
            packageJson.dependencies[depName] = newVersion;
          }
          
          hasChanges = true;
          console.log(`   Updated ${pkg} dependency: ${depName} → ${packageJson.dependencies[depName]}`);
        }
      }
    }
    
    // Check and update peerDependencies (usually for React, Next.js, etc.)
    if (packageJson.peerDependencies) {
      // Peer dependencies typically don't need version updates for internal packages
      // They reference external packages like React, Next.js
    }
    
    // Write updated package.json if there are changes
    if (hasChanges) {
      fs.writeFileSync(info.path, JSON.stringify(packageJson, null, 2) + '\n');
      
      // Update our internal cache
      this.packages.set(pkg, {
        ...info,
        data: packageJson
      });
    }
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const bumper = new VersionBumper();
  bumper.run().catch(console.error);
}

export default VersionBumper;