#!/bin/zsh

# Quick Web3Forms Beta Form Test Script
# Tests the actual form submission with realistic data

echo "🧪 Testing BioAnalytiX Beta Form with Web3Forms"
echo "=============================================="

# Test with realistic beta application data
echo "📋 Submitting test beta application..."

curl -X POST https://api.web3forms.com/submit \
  -F access_key=8bbac0a7-2854-4123-bd6a-4e6eda5c6b97 \
  -F subject="Beta Tester Application - Dr. Test User" \
  -F from_name="Dr. Test User" \
  -F email="test@bioanalytix.info" \
  -F firstName="Test" \
  -F lastName="User" \
  -F phone="+1 (555) 123-4567" \
  -F country="United States" \
  -F organization="Test Medical Center" \
  -F role="Radiologist" \
  -F experience="6-10 years" \
  -F specialty="Neurology" \
  -F "imaging[]"="CT Scans" \
  -F "imaging[]"="MRI" \
  -F useCase="Daily diagnostic imaging analysis for neurological conditions" \
  -F motivation="Want to improve diagnostic accuracy and workflow efficiency using AI" \
  -F commitment="daily" \
  -F feedback="Very excited to test the new AI features" \
  -F terms="on" \
  -F botcheck="" \
  -F message="Beta Tester Application Received

PERSONAL INFORMATION:
Name: Dr. Test User
Email: test@bioanalytix.info
Phone: +1 (555) 123-4567
Country: United States

PROFESSIONAL INFORMATION:
Organization: Test Medical Center
Role: Radiologist
Experience: 6-10 years
Specialty: Neurology
Imaging Types: CT Scans, MRI

TESTING PREFERENCES:
Use Case: Daily diagnostic imaging analysis for neurological conditions
Motivation: Want to improve diagnostic accuracy and workflow efficiency using AI
Testing Commitment: Daily usage
Additional Comments: Very excited to test the new AI features

Application submitted on: $(date)"

echo ""
echo "✅ Test completed!"
echo "📧 Check info@bioanalytix.info for the test email"
echo "🔍 Email subject: 'Beta Tester Application - Dr. Test User'"
