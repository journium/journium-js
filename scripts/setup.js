#!/usr/bin/env node

/**
 * Journium Release Scripts Setup
 * 
 * This script sets up the release automation by:
 * 1. Making scripts executable
 * 2. Adding npm scripts to package.json
 * 3. Verifying prerequisites
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class ReleaseSetup {
  constructor() {
    this.rootDir = process.cwd();
    this.scriptsDir = path.join(this.rootDir, 'scripts');
    this.packageJsonPath = path.join(this.rootDir, 'package.json');
  }

  async run() {
    console.log('🔧 Setting up Journium Release Scripts\n');
    
    try {
      await this.makeScriptsExecutable();
      await this.updatePackageJson();
      await this.verifySetup();
      
      console.log('✅ Setup completed successfully!\n');
      this.displayUsage();
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async makeScriptsExecutable() {
    console.log('📁 Making scripts executable...');
    
    const scripts = ['release.js', 'bump-versions.js', 'publish.js', 'setup.js'];
    
    for (const script of scripts) {
      const scriptPath = path.join(this.scriptsDir, script);
      
      if (fs.existsSync(scriptPath)) {
        try {
          execSync(`chmod +x "${scriptPath}"`);
          console.log(`   ✅ ${script}`);
        } catch (error) {
          console.log(`   ⚠️  Could not make ${script} executable: ${error.message}`);
        }
      }
    }
    
    console.log();
  }

  async updatePackageJson() {
    console.log('📝 Updating package.json scripts...');
    
    if (!fs.existsSync(this.packageJsonPath)) {
      throw new Error('package.json not found in root directory');
    }
    
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    
    // Add release scripts if they don't exist
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    const newScripts = {
      'release': 'node scripts/release.js',
      'release:patch': 'node scripts/release.js patch',
      'release:minor': 'node scripts/release.js minor', 
      'release:major': 'node scripts/release.js major',
      'release:prerelease': 'node scripts/release.js prerelease',
      'release:dry-run': 'node scripts/release.js patch --dry-run',
      'bump-versions': 'node scripts/bump-versions.js',
      'publish-packages': 'node scripts/publish.js'
    };
    
    let added = 0;
    for (const [key, value] of Object.entries(newScripts)) {
      if (!packageJson.scripts[key]) {
        packageJson.scripts[key] = value;
        added++;
        console.log(`   ✅ Added: npm run ${key}`);
      } else {
        console.log(`   ⚠️  Exists: npm run ${key}`);
      }
    }
    
    if (added > 0) {
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`   📦 Updated package.json with ${added} new scripts`);
    } else {
      console.log('   ℹ️  No scripts needed to be added');
    }
    
    console.log();
  }

  async verifySetup() {
    console.log('🔍 Verifying setup...');
    
    // Check Node.js version
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0]);
      
      if (majorVersion >= 16) {
        console.log(`   ✅ Node.js ${nodeVersion} (compatible)`);
      } else {
        console.log(`   ⚠️  Node.js ${nodeVersion} (recommend v16+)`);
      }
    } catch (error) {
      console.log('   ❌ Node.js not found');
    }
    
    // Check npm
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`   ✅ npm v${npmVersion}`);
    } catch (error) {
      console.log('   ❌ npm not found');
    }
    
    // Check git
    try {
      execSync('git --version', { stdio: 'pipe' });
      console.log('   ✅ Git available');
    } catch (error) {
      console.log('   ❌ Git not found');
    }
    
    // Check if in git repo
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      console.log('   ✅ Git repository detected');
    } catch (error) {
      console.log('   ⚠️  Not in a git repository');
    }
    
    // Check npm authentication (optional)
    try {
      const whoami = execSync('npm whoami', { encoding: 'utf8', stdio: 'pipe' }).trim();
      console.log(`   ✅ npm authenticated as: ${whoami}`);
    } catch (error) {
      console.log('   ⚠️  npm not authenticated (run: npm login)');
    }
    
    console.log();
  }

  displayUsage() {
    console.log('🚀 Release Scripts Ready!\n');
    
    console.log('📋 Quick Commands:');
    console.log('   npm run release              # Interactive release');
    console.log('   npm run release:patch        # Patch release (0.1.0 → 0.1.1)');
    console.log('   npm run release:minor        # Minor release (0.1.0 → 0.2.0)');
    console.log('   npm run release:major        # Major release (0.1.0 → 1.0.0)');
    console.log('   npm run release:prerelease   # Prerelease (0.1.0-alpha.1 → 0.1.0-alpha.2)');
    console.log('   npm run release:dry-run      # Test release (no changes)');
    console.log();
    
    console.log('🔧 Individual Steps:');
    console.log('   npm run bump-versions        # Version bumping only');
    console.log('   npm run publish-packages     # Build and publish only');
    console.log();
    
    console.log('📚 Documentation:');
    console.log('   cat scripts/README.md        # Full documentation');
    console.log('   node scripts/release.js --help  # Command help');
    console.log();
    
    console.log('🔍 Next Steps:');
    console.log('   1. Run: npm run release:dry-run  (safe test)');
    console.log('   2. When ready: npm run release:patch');
    console.log('   3. Check: npm view journium-js');
  }
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new ReleaseSetup();
  setup.run().catch(console.error);
}

export default ReleaseSetup;