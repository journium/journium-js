#!/usr/bin/env node

/**
 * Journium Release Orchestration Script
 * 
 * This is the main script that orchestrates the complete release process:
 * 1. Version bumping
 * 2. Dependency installation
 * 3. Building
 * 4. Testing
 * 5. Publishing to npm
 * 
 * Usage:
 *   node scripts/release.js [bump-type] [options]
 * 
 * Bump types: patch, minor, major, prerelease, prepatch, preminor, premajor
 * 
 * Options:
 *   --dry-run    Perform a dry run without actually publishing
 *   --skip-build Skip the build process
 *   --skip-tests Skip running tests
 *   --tag        Specify npm tag
 *   --force      Force publish even if version already exists
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import VersionBumper from './bump-versions.js';
import PackagePublisher from './publish.js';

class ReleaseOrchestrator {
  constructor() {
    this.args = process.argv.slice(2);
    this.options = this.parseOptions();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  parseOptions() {
    return {
      bumpType: this.getBumpType(),
      dryRun: this.args.includes('--dry-run'),
      skipBuild: this.args.includes('--skip-build'),
      skipTests: this.args.includes('--skip-tests'),
      force: this.args.includes('--force'),
      tag: this.getOptionValue('--tag'),
      interactive: !this.getBumpType() // If no bump type provided, be interactive
    };
  }

  getBumpType() {
    const bumpTypes = ['patch', 'minor', 'major', 'prerelease', 'prepatch', 'preminor', 'premajor'];
    return this.args.find(arg => bumpTypes.includes(arg.toLowerCase()));
  }

  getOptionValue(option) {
    const index = this.args.indexOf(option);
    if (index !== -1 && index + 1 < this.args.length) {
      return this.args[index + 1];
    }
    return null;
  }

  async run() {
    try {
      this.displayBanner();
      
      // Check prerequisites
      await this.checkPrerequisites();
      
      // Display current status
      await this.displayCurrentStatus();
      
      // Confirm release process
      if (this.options.interactive) {
        const shouldProceed = await this.confirmRelease();
        if (!shouldProceed) {
          console.log('❌ Release cancelled.');
          return;
        }
      }
      
      console.log('🚀 Starting release process...\n');
      
      // Step 1: Version bumping
      await this.performVersionBump();
      
      // Step 2: Build and publish
      await this.performBuildAndPublish();
      
      // Step 3: Post-release actions
      await this.performPostRelease();
      
      console.log('🎉 Release completed successfully!');
      this.displayNextSteps();
      
    } catch (error) {
      console.error('❌ Release failed:', error.message);
      console.error('\n🔧 You may need to:');
      console.error('   1. Check git status and resolve any conflicts');
      console.error('   2. Verify npm authentication');
      console.error('   3. Review package.json files for consistency');
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  displayBanner() {
    console.log('╭─────────────────────────────────────────────────╮');
    console.log('│                                                 │');
    console.log('│           🚀 Journium Release Tool              │');
    console.log('│                                                 │');
    console.log('│   Automated package versioning and publishing  │');
    console.log('│                                                 │');
    console.log('╰─────────────────────────────────────────────────╯\n');
    
    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made\n');
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...\n');
    
    // Check if we're in a git repository
    try {
      const { execSync } = await import('child_process');
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
      console.log('   ✅ Git repository detected');
    } catch (error) {
      throw new Error('Not in a git repository');
    }
    
    // Check for uncommitted changes
    try {
      const { execSync } = await import('child_process');
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      if (gitStatus.trim() && !this.options.dryRun) {
        console.log('   ⚠️  Warning: Uncommitted changes detected');
        
        const shouldContinue = await this.askQuestion('   Continue anyway? (y/N): ');
        if (!shouldContinue) {
          throw new Error('Please commit or stash changes before releasing');
        }
      } else {
        console.log('   ✅ Working directory clean');
      }
    } catch (error) {
      if (error.message.includes('commit or stash')) {
        throw error;
      }
      console.log('   ⚠️  Could not check git status');
    }
    
    // Check Node.js and npm versions
    try {
      const { execSync } = await import('child_process');
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`   ✅ Node.js ${nodeVersion}, npm ${npmVersion}`);
    } catch (error) {
      throw new Error('Node.js or npm not found');
    }
    
    // Check npm authentication (if not dry run)
    if (!this.options.dryRun) {
      try {
        const { execSync } = await import('child_process');
        const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
        console.log(`   ✅ npm authenticated as: ${whoami}`);
      } catch (error) {
        throw new Error('npm authentication required. Run: npm login');
      }
    }
    
    console.log();
  }

  async displayCurrentStatus() {
    console.log('📊 Current package status:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Handle both running from root and from scripts directory
    const workspaceRoot = process.cwd().endsWith('/scripts') ? path.join(process.cwd(), '..') : process.cwd();
    const packagesDir = path.join(workspaceRoot, 'packages');
    const packages = ['core', 'journium-js', 'journium-react', 'journium-nextjs'];
    
    for (const pkg of packages) {
      const packagePath = path.join(packagesDir, pkg, 'package.json');
      
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log(`   ${packageJson.name.padEnd(20)} v${packageJson.version}`);
      }
    }
    
    console.log('\n⚙️  Release options:');
    console.log(`   Bump type:   ${this.options.bumpType || 'interactive'}`);
    console.log(`   Dry run:     ${this.options.dryRun ? '✅' : '❌'}`);
    console.log(`   Skip build:  ${this.options.skipBuild ? '✅' : '❌'}`);
    console.log(`   Skip tests:  ${this.options.skipTests ? '✅' : '❌'}`);
    console.log(`   Force:       ${this.options.force ? '✅' : '❌'}`);
    console.log(`   Tag:         ${this.options.tag || 'auto'}\n`);
  }

  async confirmRelease() {
    return this.askQuestion('❓ Proceed with release? (y/N): ');
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async performVersionBump() {
    console.log('📝 Step 1: Version Bumping');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Prepare arguments for version bumper
      const versionArgs = [];
      if (this.options.bumpType) {
        versionArgs.push(this.options.bumpType);
      }
      
      // Temporarily override process.argv for the version bumper
      const originalArgv = process.argv;
      process.argv = ['node', 'bump-versions.js', ...versionArgs];
      
      const bumper = new VersionBumper();
      await bumper.run();
      
      // Restore original argv
      process.argv = originalArgv;
      
      console.log('✅ Version bump completed\n');
    } catch (error) {
      throw new Error(`Version bump failed: ${error.message}`);
    }
  }

  async performBuildAndPublish() {
    console.log('🔨 Step 2: Build and Publish');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      // Prepare arguments for publisher
      const publishArgs = [];
      if (this.options.dryRun) publishArgs.push('--dry-run');
      if (this.options.skipBuild) publishArgs.push('--skip-build');
      if (this.options.skipTests) publishArgs.push('--skip-tests');
      if (this.options.force) publishArgs.push('--force');
      if (this.options.tag) publishArgs.push('--tag', this.options.tag);
      
      // Temporarily override process.argv for the publisher
      const originalArgv = process.argv;
      process.argv = ['node', 'publish.js', ...publishArgs];
      
      const publisher = new PackagePublisher();
      await publisher.run();
      
      // Restore original argv
      process.argv = originalArgv;
      
      console.log('✅ Build and publish completed\n');
    } catch (error) {
      throw new Error(`Build and publish failed: ${error.message}`);
    }
  }

  async performPostRelease() {
    if (this.options.dryRun) {
      console.log('⏭️  Skipping post-release actions (dry run)\n');
      return;
    }
    
    console.log('🏁 Step 3: Post-Release Actions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const { execSync } = await import('child_process');
      
      // Create git tag for the release
      const packageJsonPath = path.join(process.cwd(), 'packages', 'journium-js', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const releaseTag = `v${packageJson.version}`;
      
      // Check if tag already exists
      try {
        execSync(`git rev-parse ${releaseTag}`, { stdio: 'pipe' });
        console.log(`   ⚠️  Tag ${releaseTag} already exists, skipping tag creation`);
      } catch (error) {
        // Tag doesn't exist, create it
        const tagMessage = `Release ${releaseTag}`;
        execSync(`git tag -a ${releaseTag} -m "${tagMessage}"`, { stdio: 'inherit' });
        console.log(`   ✅ Created git tag: ${releaseTag}`);
      }
      
      // Ask about pushing to remote
      const shouldPush = await this.askQuestion('   Push tags to remote? (y/N): ');
      if (shouldPush) {
        execSync('git push origin --tags', { stdio: 'inherit' });
        console.log('   ✅ Tags pushed to remote');
      }
      
    } catch (error) {
      console.log(`   ⚠️  Post-release actions failed: ${error.message}`);
    }
    
    console.log();
  }

  displayNextSteps() {
    console.log('\n🎯 Next Steps:');
    console.log('━━━━━━━━━━━━━━━');
    
    if (this.options.dryRun) {
      console.log('   This was a dry run. To perform actual release:');
      console.log('   node scripts/release.js [bump-type]');
    } else {
      console.log('   1. ✅ Packages published to npm');
      console.log('   2. ✅ Git tags created');
      console.log('   3. 📢 Consider updating CHANGELOG.md');
      console.log('   4. 📢 Announce release on social media/blog');
      console.log('   5. 📢 Update documentation if needed');
    }
    
    console.log('\n📚 Useful commands:');
    console.log('   npm view journium-js           # Check published version');
    console.log('   npm view @journium/core        # Check core package');
    console.log('   git log --oneline              # View recent commits');
    console.log('   git tag --list                 # View all tags');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new ReleaseOrchestrator();
  orchestrator.run().catch(console.error);
}

export default ReleaseOrchestrator;