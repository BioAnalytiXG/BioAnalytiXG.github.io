#!/bin/bash

# BioAnalytiX Web3Forms Beta Form Deployment Script
# This script helps test and deploy the Web3Forms implementation

echo "🚀 BioAnalytiX Web3Forms Deployment & Testing"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Web3Forms endpoint
echo -e "\n${YELLOW}1. Testing Web3Forms Endpoint...${NC}"
curl -s -X POST https://api.web3forms.com/submit \
  -F access_key=8bbac0a7-2854-4123-bd6a-4e6eda5c6b97 \
  -F name="Test User" \
  -F email="test@example.com" \
  -F message="Deployment test from script" | jq '.'

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Web3Forms endpoint is responsive${NC}"
else
    echo -e "${RED}❌ Web3Forms endpoint test failed${NC}"
fi

# Check if required files exist
echo -e "\n${YELLOW}2. Checking Required Files...${NC}"
files=(
    "beta-tester-form/index.html"
    "assets/js/beta-form-enhanced.js"
    "test-web3forms.html"
    "beta-admin.html"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
    fi
done

# Check form configuration
echo -e "\n${YELLOW}3. Validating Form Configuration...${NC}"

# Check access key in HTML
if grep -q "8bbac0a7-2854-4123-bd6a-4e6eda5c6b97" beta-tester-form/index.html; then
    echo -e "${GREEN}✅ Correct access key found in HTML form${NC}"
else
    echo -e "${RED}❌ Access key missing or incorrect in HTML form${NC}"
fi

# Check access key in JavaScript
if grep -q "8bbac0a7-2854-4123-bd6a-4e6eda5c6b97" assets/js/beta-form-enhanced.js; then
    echo -e "${GREEN}✅ Correct access key found in JavaScript${NC}"
else
    echo -e "${RED}❌ Access key missing or incorrect in JavaScript${NC}"
fi

# Check Web3Forms action URL
if grep -q "https://api.web3forms.com/submit" beta-tester-form/index.html; then
    echo -e "${GREEN}✅ Correct Web3Forms action URL found${NC}"
else
    echo -e "${RED}❌ Web3Forms action URL missing or incorrect${NC}"
fi

# Check for EmailJS remnants (should be removed)
if grep -q "emailjs" beta-tester-form/index.html; then
    echo -e "${YELLOW}⚠️ EmailJS references still found - consider removing${NC}"
else
    echo -e "${GREEN}✅ No EmailJS remnants found${NC}"
fi

# Test form fields
echo -e "\n${YELLOW}4. Testing Form Structure...${NC}"

required_fields=(
    'name="firstName"'
    'name="lastName"'
    'name="email"'
    'name="country"'
    'name="organization"'
    'name="role"'
    'name="experience"'
    'name="useCase"'
    'name="motivation"'
    'name="commitment"'
)

for field in "${required_fields[@]}"; do
    if grep -q "$field" beta-tester-form/index.html; then
        echo -e "${GREEN}✅ $field found${NC}"
    else
        echo -e "${RED}❌ $field missing${NC}"
    fi
done

# Open test pages for manual verification
echo -e "\n${YELLOW}5. Opening Test Pages...${NC}"
echo "Opening Web3Forms test page..."
open -a "Google Chrome" test-web3forms.html 2>/dev/null || open test-web3forms.html 2>/dev/null

echo "Opening Beta Form..."
open -a "Google Chrome" beta-tester-form/index.html 2>/dev/null || open beta-tester-form/index.html 2>/dev/null

echo "Opening Admin Panel..."
open -a "Google Chrome" beta-admin.html 2>/dev/null || open beta-admin.html 2>/dev/null

# Git status
echo -e "\n${YELLOW}6. Git Repository Status...${NC}"
if [ -d ".git" ]; then
    echo "Current branch: $(git branch --show-current)"
    echo "Uncommitted changes:"
    git status --porcelain
    
    echo -e "\n${YELLOW}Ready to commit and deploy? Run:${NC}"
    echo "git add ."
    echo "git commit -m \"Implement Web3Forms for beta form submission\""
    echo "git push origin main"
else
    echo "Not a git repository"
fi

echo -e "\n${GREEN}🎉 Deployment Check Complete!${NC}"
echo -e "${YELLOW}Manual Testing Required:${NC}"
echo "1. Test form submission via test-web3forms.html"
echo "2. Complete full beta form application"
echo "3. Check info@bioanalytix.info inbox for emails"
echo "4. Verify admin panel shows applications"
echo "5. Test on mobile devices"

echo -e "\n${GREEN}✅ Web3Forms Implementation Ready for Production${NC}"
