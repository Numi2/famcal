#!/bin/bash

# Test script to verify GitHub CLI setup and repository access

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing GitHub CLI setup...${NC}"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    exit 1
else
    echo -e "${GREEN}✅ GitHub CLI is installed${NC}"
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ You are not authenticated with GitHub CLI${NC}"
    echo -e "${YELLOW}Run: gh auth login${NC}"
    exit 1
else
    echo -e "${GREEN}✅ GitHub CLI is authenticated${NC}"
fi

# Get repository name from git remote
REPO=$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//')

echo -e "${YELLOW}Repository URL: $(git remote get-url origin)${NC}"
echo -e "${YELLOW}Parsed repository: $REPO${NC}"

if [ -z "$REPO" ]; then
    echo -e "${RED}❌ Could not determine repository name${NC}"
    exit 1
fi

# Test repository access
echo -e "${BLUE}Testing repository access...${NC}"
if gh repo view "$REPO" &> /dev/null; then
    echo -e "${GREEN}✅ Repository access confirmed${NC}"
else
    echo -e "${RED}❌ Cannot access repository: $REPO${NC}"
    echo -e "${YELLOW}Make sure you have access to this repository${NC}"
    exit 1
fi

# Test issue creation permissions
echo -e "${BLUE}Testing issue creation permissions...${NC}"
if gh api repos/$REPO/issues &> /dev/null; then
    echo -e "${GREEN}✅ Issue creation permissions confirmed${NC}"
else
    echo -e "${RED}❌ Cannot access repository issues${NC}"
    exit 1
fi

# Test milestone creation permissions
echo -e "${BLUE}Testing milestone creation permissions...${NC}"
if gh api repos/$REPO/milestones &> /dev/null; then
    echo -e "${GREEN}✅ Milestone creation permissions confirmed${NC}"
else
    echo -e "${RED}❌ Cannot access repository milestones${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All tests passed! GitHub CLI is properly configured.${NC}"
echo -e "${BLUE}You can now run: pnpm run import-issues${NC}"
