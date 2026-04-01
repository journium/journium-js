/**
 * Syncs version.ts files with their package.json versions.
 *
 * Run automatically after `changeset version` so that the changeset PR
 * includes updated version.ts files alongside bumped package.json versions.
 *
 * Only needed for packages that cannot use @rollup/plugin-replace at build
 * time (currently Angular, which uses ng-packagr).
 */
const fs = require('fs');
const path = require('path');

const packages = [
  { dir: 'packages/journium-angular', name: '@journium/angular' },
];

for (const pkg of packages) {
  const pkgJsonPath = path.join(__dirname, '..', pkg.dir, 'package.json');
  const versionTsPath = path.join(__dirname, '..', pkg.dir, 'src', 'version.ts');

  const { version } = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const content = `export const SDK_VERSION = "${pkg.name}@${version}";\n`;

  const existing = fs.existsSync(versionTsPath) ? fs.readFileSync(versionTsPath, 'utf8') : '';
  if (existing !== content) {
    fs.writeFileSync(versionTsPath, content);
    console.log(`Updated ${pkg.dir}/src/version.ts → ${pkg.name}@${version}`);
  }
}
