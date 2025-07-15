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
echo -e "${YELLOW}Debug: Repository URL: $(git remote get-url origin)${NC}"

# Function to create milestone
create_milestone() {
  local file="$1"
  local title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
  local description=$(grep "\*\*Description:\*\*" "$file" | sed 's/\*\*Description:\*\* //')
  local due_date=$(grep "\*\*Due Date:\*\*" "$file" | sed 's/\*\*Due Date:\*\* //')
  
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

# Function to create issue
create_issue() {
  local file="$1"
  local title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
  local description=$(grep "^## Description" "$file" -A 1 | tail -1)
  local type=$(grep "^## Type" "$file" -A 5 | grep "Type:" | sed 's/.*Type:\*\* //')
  local priority=$(grep "^## Type" "$file" -A 5 | grep "Priority:" | sed 's/.*Priority:\*\* //')
  local component=$(grep "^## Type" "$file" -A 5 | grep "Component:" | sed 's/.*Component:\*\* //')
  local milestone=$(grep "^## Type" "$file" -A 5 | grep "Milestone:" | sed 's/.*Milestone:\*\* //')
  
  if [ -n "$title" ]; then
    echo -e "${YELLOW}Creating issue: $title${NC}"
    
    # Build issue body
    local body="## Description\n$description\n\n"
    body+="## Type\n- Type: $type\n- Priority: $priority\n- Component: $component\n- Milestone: $milestone\n\n"
    
    # Add acceptance criteria (simplified parsing)
    if grep -q "## Acceptance Criteria" "$file"; then
      body+="## Acceptance Criteria\n"
      # Get content between Acceptance Criteria and Technical Requirements
      local start_line=$(grep -n "## Acceptance Criteria" "$file" | cut -d: -f1)
      local end_line=$(grep -n "## Technical Requirements" "$file" | cut -d: -f1)
      if [ -n "$start_line" ] && [ -n "$end_line" ]; then
        local criteria_content=$(sed -n "$((start_line + 1)),$((end_line - 1))p" "$file")
        body+="$criteria_content\n\n"
      fi
    fi
    
    # Add technical requirements (simplified parsing)
    if grep -q "## Technical Requirements" "$file"; then
      body+="## Technical Requirements\n"
      # Get content between Technical Requirements and Implementation Notes
      local start_line=$(grep -n "## Technical Requirements" "$file" | cut -d: -f1)
      local end_line=$(grep -n "## Implementation Notes" "$file" | cut -d: -f1)
      if [ -n "$start_line" ] && [ -n "$end_line" ]; then
        local tech_content=$(sed -n "$((start_line + 1)),$((end_line - 1))p" "$file")
        body+="$tech_content\n\n"
      fi
    fi
    
    # Add implementation notes (simplified parsing)
    if grep -q "## Implementation Notes" "$file"; then
      body+="## Implementation Notes\n"
      local start_line=$(grep -n "## Implementation Notes" "$file" | cut -d: -f1)
      local notes_content=$(sed -n "$((start_line + 1)),\$p" "$file")
      body+="$notes_content\n"
    fi
    
    # Create issue without labels first (to avoid label errors)
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
echo -e "${YELLOW}Note: You may need to manually link issues to milestones in the GitHub web interface.${NC}" 