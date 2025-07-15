#!/bin/bash

# Script to create necessary labels for GitHub issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get repository name from git remote
REPO=$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//')

echo -e "${BLUE}Creating labels for repository: $REPO${NC}"

# Define labels to create
declare -A labels=(
  ["ai-agent"]="#3b82f6"
  ["enhancement"]="#10b981"
  ["bug"]="#ef4444"
  ["v1.1"]="#8b5cf6"
  ["v2.0"]="#f59e0b"
  ["high-priority"]="#dc2626"
  ["medium-priority"]="#f59e0b"
  ["low-priority"]="#6b7280"
)

# Create each label
for label in "${!labels[@]}"; do
  color="${labels[$label]}"
  echo -e "${YELLOW}Creating label: $label${NC}"
  
  gh api repos/$REPO/labels \
    --method POST \
    --field name="$label" \
    --field color="${color:1}" \
    --field description="Label for $label" || echo -e "${RED}Failed to create label: $label${NC}"
done

echo -e "${GREEN}✅ Labels created successfully!${NC}" 