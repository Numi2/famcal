#!/bin/bash

# GitHub Issues and Milestones Import Script
# This script automatically imports issues and milestones when you push to the repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}GitHub CLI (gh) is not installed. Please install it first:${NC}"
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}You are not authenticated with GitHub CLI. Please run:${NC}"
    echo "gh auth login"
    exit 1
fi

# Get repository name from git remote
REPO=$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//')

if [ -z "$REPO" ]; then
    echo -e "${RED}Could not determine repository name from git remote${NC}"
    exit 1
fi

echo -e "${GREEN}Importing GitHub issues and milestones for repository: $REPO${NC}"

# Function to create milestone
create_milestone() {
  local file="$1"
  local title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
  local description=$(grep "\*\*Description:\*\*" "$file" | sed 's/\*\*Description:\*\* //' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  local due_date=$(grep "\*\*Due Date:\*\*" "$file" | sed 's/\*\*Due Date:\*\* //' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  
  if [ -n "$title" ]; then
    echo -e "${YELLOW}Creating milestone: $title${NC}"
    
    # Convert date to ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
    local iso_date=""
    if [ -n "$due_date" ]; then
      # Add time if not present (default to end of day)
      if [[ "$due_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        iso_date="${due_date}T23:59:59Z"
      else
        iso_date="$due_date"
      fi
    fi
    
    # Create milestone
    if [ -n "$iso_date" ]; then
      gh api repos/$REPO/milestones \
        --method POST \
        --field title="$title" \
        --field description="$description" \
        --field due_on="$iso_date" || echo -e "${RED}Failed to create milestone: $title${NC}"
    else
      gh api repos/$REPO/milestones \
        --method POST \
        --field title="$title" \
        --field description="$description" || echo -e "${RED}Failed to create milestone: $title${NC}"
    fi
  fi
}

# Function to create simple issue
create_issue() {
  local file="$1"
  local title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
  
  if [ -n "$title" ]; then
    echo -e "${YELLOW}Creating issue: $title${NC}"
    
    # Get the full content of the file as the issue body
    local body=$(cat "$file")
    
    # Create simple issue without any labels or complex metadata
    gh issue create \
      --repo "$REPO" \
      --title "$title" \
      --body "$body" || echo -e "${RED}Failed to create issue: $title${NC}"
  fi
}

# Create milestones first
echo -e "${GREEN}Creating milestones...${NC}"
for file in .github/milestones/*.md; do
    if [ -f "$file" ]; then
        create_milestone "$file"
    fi
done

# Create issues
echo -e "${GREEN}Creating issues...${NC}"
for file in .github/issues/*.md; do
    if [ -f "$file" ]; then
        create_issue "$file"
    fi
done

echo -e "${GREEN}Import completed!${NC}" 