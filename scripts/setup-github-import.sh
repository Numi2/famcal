#!/bin/bash

# Setup script for GitHub Issues and Milestones import system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up GitHub Issues and Milestones import system...${NC}"

# Make scripts executable
echo -e "${YELLOW}Making scripts executable...${NC}"
chmod +x scripts/import-github-issues.sh
chmod +x scripts/setup-github-import.sh

# Make git hook executable
echo -e "${YELLOW}Setting up git hooks...${NC}"
chmod +x .git/hooks/pre-push

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI (gh) is not installed.${NC}"
    echo -e "${YELLOW}Please install it from: https://cli.github.com/${NC}"
    echo ""
    echo "For macOS:"
    echo "  brew install gh"
    echo ""
    echo "For Ubuntu/Debian:"
    echo "  sudo apt install gh"
    echo ""
    echo "For Windows:"
    echo "  winget install GitHub.cli"
    echo ""
    echo "After installation, run:"
    echo "  gh auth login"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}You are not authenticated with GitHub CLI.${NC}"
    echo -e "${YELLOW}Please run: gh auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo "  pnpm run import-issues    - Manually import issues and milestones"
echo "  pnpm run setup-hooks      - Re-setup git hooks"
echo "  git push                 - Auto-import on push (if .github files changed)"
echo ""
echo -e "${BLUE}GitHub Actions:${NC}"
echo "  The workflow will automatically run when you push .github files to main/master"
echo ""
echo -e "${YELLOW}Note: Make sure your repository has the necessary permissions for GitHub Actions.${NC}"
