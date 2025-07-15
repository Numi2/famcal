# GitHub Issues and Milestones Auto-Import System

This system automatically imports GitHub issues and milestones when you push to your repository. It supports multiple import methods for maximum flexibility.

## 🚀 Quick Setup

### Option 1: One-Command Setup (Recommended)
```bash
pnpm run setup-github-import
```

This will:
- ✅ Install and configure all necessary components
- ✅ Check for GitHub CLI installation
- ✅ Verify authentication
- ✅ Set up git hooks
- ✅ Make scripts executable

### Option 2: Manual Setup

1. **Install GitHub CLI**
   ```bash
   # macOS
   brew install gh
   
   # Ubuntu/Debian
   sudo apt install gh
   
   # Windows
   winget install GitHub.cli
   ```

2. **Authenticate with GitHub**
   ```bash
   gh auth login
   ```

3. **Make scripts executable**
   ```bash
   chmod +x scripts/import-github-issues.sh
   chmod +x scripts/setup-github-import.sh
   chmod +x .git/hooks/pre-push
   ```

## 📁 File Structure

```
.github/
├── ISSUE_TEMPLATE/          # Issue templates
├── milestones/              # Milestone definitions
├── issues/                  # Issue definitions
└── workflows/              # GitHub Actions workflows
scripts/
├── import-github-issues.sh  # Main import script
└── setup-github-import.sh   # Setup script
.git/hooks/
└── pre-push                # Git hook for auto-import
```

## 🔄 Import Methods

### 1. Automatic Import (Git Hook)
When you push to main/master branch with `.github` files:
```bash
git add .github/
git commit -m "Add new issues and milestones"
git push  # Automatically runs import script
```

### 2. Manual Import
Run the import script manually:
```bash
pnpm run import-issues
```

### 3. GitHub Actions (CI/CD)
Automatically runs when `.github` files are pushed to main/master:
- ✅ No local setup required
- ✅ Runs in GitHub's environment
- ✅ Uses repository secrets for authentication

## 📝 Creating Issues and Milestones

### Milestones
Create files in `.github/milestones/`:
```markdown
# Milestone Title

**Due Date:** 2024-01-31  
**Description:** Brief description of the milestone

## Goals
- [ ] Goal 1
- [ ] Goal 2

## Success Criteria
- Criterion 1
- Criterion 2
```

### Issues
Create files in `.github/issues/`:
```markdown
# Issue Title

## Description
Detailed description of the issue.

## Type
- **Type:** New Feature
- **Priority:** High
- **Component:** AI Agent
- **Milestone:** AI Agent v1.1

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Requirements
- Requirement 1
- Requirement 2

## Implementation Notes
Implementation details and considerations.
```

## 🛠️ Available Commands

```bash
# Test GitHub CLI setup and permissions
pnpm run test-github

# Create necessary labels in repository
pnpm run create-labels

# Setup the import system
pnpm run setup-github-import

# Manually import issues and milestones
pnpm run import-issues

# Re-setup git hooks
pnpm run setup-hooks
```

## 🔧 Configuration

### Environment Variables
- `GITHUB_TOKEN` - GitHub personal access token (for GitHub Actions)
- Repository permissions for GitHub Actions

### Git Hooks
The pre-push hook automatically runs when:
- Pushing to main/master branch
- `.github` files are in the commit
- Import script exists and is executable

### GitHub Actions
The workflow automatically runs when:
- Pushing to main/master branch
- `.github` files are modified
- Manual trigger via workflow_dispatch

## 🐛 Troubleshooting

### Common Issues

1. **GitHub CLI not installed**
   ```bash
   # Install GitHub CLI first
   brew install gh  # macOS
   sudo apt install gh  # Ubuntu
   ```

2. **Not authenticated**
   ```bash
   gh auth login
   ```

3. **Scripts not executable**
   ```bash
   chmod +x scripts/*.sh
   chmod +x .git/hooks/pre-push
   ```

4. **Repository permissions**
   - Ensure GitHub Actions has write permissions
   - Check repository settings for workflow permissions

### Debug Mode
Run with verbose output:
```bash
bash -x scripts/import-github-issues.sh
```

## 📊 Monitoring

### GitHub Actions
- Check the "Actions" tab in your repository
- View workflow runs and logs
- Monitor import success/failure

### Local Logs
The import script provides colored output:
- 🟢 Green: Success messages
- 🟡 Yellow: Warnings and info
- 🔴 Red: Errors and failures

## 🔒 Security

### Authentication
- Uses GitHub CLI for local authentication
- Uses `GITHUB_TOKEN` for GitHub Actions
- No credentials stored in code

### Permissions
- Repository issues: Read/Write
- Repository milestones: Read/Write
- Repository labels: Read/Write

## 🚀 Best Practices

1. **Organize Issues**: Use consistent naming and structure
2. **Test Locally**: Run `pnpm run import-issues` before pushing
3. **Review Changes**: Check imported issues in GitHub web interface
4. **Update Regularly**: Keep issues and milestones current
5. **Use Templates**: Leverage the provided issue templates

## 📞 Support

For issues with the import system:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Run in debug mode
4. Create an issue in the repository 