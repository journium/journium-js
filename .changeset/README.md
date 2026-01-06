# Changesets

This directory contains changeset files that track changes to packages in this monorepo.

## When to add a changeset

Add a changeset whenever you make changes that should be included in a release:

- **Bug fixes** → patch version bump
- **New features** → minor version bump  
- **Breaking changes** → major version bump

## How to add a changeset

1. Run `pnpm changeset` from the repository root
2. Select which packages your changes affect
3. Choose the appropriate version bump type (patch/minor/major)
4. Write a clear description of your changes
5. Commit the generated changeset file with your changes

## Example workflow

```bash
# Make your changes to packages
git add .
git commit -m "feat: add new analytics method"

# Add a changeset for the changes
pnpm changeset
# Follow the interactive prompts

# Commit the changeset
git add .changeset/
git commit -m "add changeset"
```

## Releasing

To create a new release:

1. Run `pnpm version` to apply all pending changesets and update package versions
2. Commit the version changes
3. Run `pnpm release` to publish packages to npm

## Package versioning

This monorepo uses **independent versioning** - each package can have its own version number and release cadence. Packages only get version bumps when they actually have changes.

## Changeset files

- Each changeset is a markdown file with metadata
- Files are automatically deleted when versions are applied
- The filename is auto-generated and not meaningful
- Only the content matters for release notes