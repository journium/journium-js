#!/usr/bin/env node

/**
 * Journium Package Build and Publish Script
 * 
 * This script handles building and publishing all Journium packages in the correct dependency order.
 * It performs clean builds, runs tests, and publishes to npm with proper authentication.
 * 
 * Usage:
 *   node scripts/publish.js [options]
 * 
 * Options:
 *   --dry-run    Perform a dry run without actually publishing
 *   --skip-build Skip the build process
 *   --skip-tests Skip running tests
 *   --tag        Specify npm tag (default: latest for releases, alpha for prereleases)
 *   --force      Force publish even if version already exists
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';

// Package dependency order for publishing
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

class PackagePublisher {
  constructor() {
    // Handle both running from root and from scripts directory
    this.workspaceRoot = process.cwd().endsWith('/scripts') ? path.join(process.cwd(), '..') : process.cwd();
    this.packagesDir = path.join(this.workspaceRoot, 'packages');
    this.packages = new Map();
    this.options = this.parseOptions();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  parseOptions() {
    const args = process.argv.slice(2);
    return {
      dryRun: args.includes('--dry-run'),
      skipBuild: args.includes('--skip-build'),
      skipTests: args.includes('--skip-tests'),
      force: args.includes('--force'),
      tag: this.getOptionValue(args, '--tag') || null
    };
  }

  getOptionValue(args, option) {
    const index = args.indexOf(option);
    if (index !== -1 && index + 1 < args.length) {
      return args[index + 1];
    }
    return null;
  }

  async run() {
    try {
      console.log('🚀 Journium Package Build & Publish Tool\n');
      
      if (this.options.dryRun) {
        console.log('🔍 DRY RUN MODE - No actual publishing will occur\n');
      }
      
      // Load package information
      await this.loadPackages();
      
      // Display current versions
      this.displayPackageInfo();
      
      // Check npm authentication
      if (!this.options.dryRun) {
        await this.checkNpmAuth();
      }
      
      // Confirm before proceeding
      const confirmed = await this.confirmPublish();
      if (!confirmed) {
        console.log('❌ Publish cancelled.');
        return;
      }
      
      // Install dependencies
      await this.installDependencies();
      
      // Build packages
      if (!this.options.skipBuild) {
        await this.buildPackages();
      }
      
      // Run tests
      if (!this.options.skipTests) {
        await this.runTests();
      }
      
      // Publish packages
      await this.publishPackages();
      
      console.log('✅ All packages published successfully!');
      
    } catch (error) {
      console.error('❌ Error during publish:', error.message);
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
        dir: path.dirname(packagePath),
        data: packageJson,
        name: packageJson.name,
        version: packageJson.version
      });
    }
  }

  displayPackageInfo() {
    console.log('📋 Packages to be published:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const [pkg, info] of this.packages) {
      const tag = this.determineNpmTag(info.version);
      console.log(`   ${info.name.padEnd(20)} v${info.version.padEnd(15)} [${tag}]`);
    }
    
    console.log('\n⚙️  Options:');
    console.log(`   Dry Run:     ${this.options.dryRun ? '✅' : '❌'}`);
    console.log(`   Skip Build:  ${this.options.skipBuild ? '✅' : '❌'}`);
    console.log(`   Skip Tests:  ${this.options.skipTests ? '✅' : '❌'}`);
    console.log(`   Force:       ${this.options.force ? '✅' : '❌'}`);
    console.log(`   Tag:         ${this.options.tag || 'auto'}\n`);
  }

  determineNpmTag(version) {
    if (this.options.tag) {
      return this.options.tag;
    }
    
    // Auto-determine tag based on version
    if (version.includes('alpha') || version.includes('beta') || version.includes('rc')) {
      return 'alpha';
    }
    
    return 'latest';
  }

  async checkNpmAuth() {
    console.log('🔐 Checking npm authentication...');
    
    try {
      const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
      console.log(`   Logged in as: ${whoami}`);
      
      // Check if user has publish permissions for scoped packages
      try {
        execSync('npm access list packages', { encoding: 'utf8', stdio: 'pipe' });
        console.log('   ✅ npm authentication verified\n');
      } catch (error) {
        console.log('   ⚠️  Warning: Could not verify publish permissions\n');
      }
      
    } catch (error) {
      console.error('   ❌ npm authentication failed');
      console.error('   Please run: npm login');
      throw new Error('npm authentication required');
    }
  }

  async confirmPublish() {
    return new Promise((resolve) => {
      const action = this.options.dryRun ? 'dry-run' : 'publish';
      this.rl.question(`❓ Proceed with ${action}? (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async installDependencies() {
    console.log('📥 Installing dependencies...');
    
    try {
      const currentDir = process.cwd();
      process.chdir(this.workspaceRoot);
      
      execSync('npm install', { stdio: 'inherit' });
      console.log('   ✅ Dependencies installed\n');
      
      process.chdir(currentDir);
    } catch (error) {
      process.chdir(process.cwd());
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  async buildPackages() {
    console.log('🔨 Building packages...\n');
    
    for (const [pkg, info] of this.packages) {
      console.log(`📦 Building ${pkg}...`);
      
      try {
        const currentDir = process.cwd();
        process.chdir(info.dir);
        
        // Clean previous build
        execSync('npm run clean', { stdio: 'inherit' });
        
        // Build package
        execSync('npm run build', { stdio: 'inherit' });
        
        process.chdir(currentDir);
        console.log(`   ✅ ${pkg} built successfully`);
        
      } catch (error) {
        process.chdir(process.cwd());
        throw new Error(`Failed to build ${pkg}: ${error.message}`);
      }
    }
    
    console.log('\n✅ All packages built successfully\n');
  }

  async runTests() {
    console.log('🧪 Running tests...\n');
    
    // Run tests from workspace root
    try {
      const currentDir = process.cwd();
      process.chdir(this.workspaceRoot);
      
      execSync('npm test', { stdio: 'inherit' });
      console.log('\n✅ All tests passed\n');
      
      process.chdir(currentDir);
    } catch (error) {
      process.chdir(process.cwd());
      throw new Error('Tests failed. Please fix failing tests before publishing.');
    }
  }

  async publishPackages() {
    console.log(`📤 ${this.options.dryRun ? 'Dry-run' : 'Publishing'} packages...\n`);
    
    const results = [];
    
    for (const [pkg, info] of this.packages) {
      console.log(`📦 ${this.options.dryRun ? 'Dry-run' : 'Publishing'} ${pkg}...`);
      
      try {
        await this.publishSinglePackage(pkg, info);
        results.push({ pkg, status: 'success' });
        console.log(`   ✅ ${pkg} ${this.options.dryRun ? 'dry-run' : 'published'} successfully`);
        
        // Wait a moment between publishes to avoid rate limiting
        if (!this.options.dryRun) {
          await this.sleep(2000);
        }
        
      } catch (error) {
        results.push({ pkg, status: 'failed', error: error.message });
        console.error(`   ❌ Failed to ${this.options.dryRun ? 'dry-run' : 'publish'} ${pkg}: ${error.message}`);
        
        // Ask if we should continue or abort
        if (!this.options.force) {
          const shouldContinue = await this.askToContinue(pkg);
          if (!shouldContinue) {
            throw new Error(`Publish aborted after ${pkg} failed`);
          }
        }
      }
    }
    
    // Display summary
    this.displayPublishSummary(results);
  }

  async publishSinglePackage(pkg, info) {
    const currentDir = process.cwd();
    
    try {
      process.chdir(info.dir);
      
      const tag = this.determineNpmTag(info.version);
      let publishCmd = `npm publish --tag ${tag}`;
      
      if (this.options.dryRun) {
        publishCmd += ' --dry-run';
      }
      
      if (this.options.force) {
        publishCmd += ' --force';
      }
      
      execSync(publishCmd, { stdio: 'inherit' });
      
    } finally {
      process.chdir(currentDir);
    }
  }

  async askToContinue(failedPkg) {
    return new Promise((resolve) => {
      this.rl.question(`❓ ${failedPkg} failed. Continue with remaining packages? (y/N): `, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  displayPublishSummary(results) {
    console.log('\n📊 Publish Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');
    
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (failed.length > 0) {
      console.log('\nFailed packages:');
      for (const result of failed) {
        console.log(`   ${result.pkg}: ${result.error}`);
      }
    }
    
    console.log();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const publisher = new PackagePublisher();
  publisher.run().catch(console.error);
}

export default PackagePublisher;