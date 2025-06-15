#!/bin/bash

echo "🚀 Testing Beta Form Submission"
echo "=============================="
echo ""

# Open the beta form for testing
echo "📝 Opening beta form..."
open /Users/christostsoutsas/Desktop/Projects/BioAnalytiX_WebsiteV2/BioAnalytiXG.github.io/beta-tester-form/index.html

echo ""
echo "🧪 Test the form with this data:"
echo "Name: Test User"
echo "Email: test@example.com"
echo "Organization: Test Hospital"
echo "Role: Radiologist"
echo "Experience: 5-10 years"
echo ""
echo "The form should now:"
echo "✅ Show success message"
echo "✅ Open email client with formatted application"
echo "✅ Log data to browser console"
echo "✅ Save backup to localStorage"
echo ""
echo "Press any key to continue..."
read -n 1

echo ""
echo "📧 Check if email client opened with application data"
echo "If not, the manual submission modal should appear"
echo ""
echo "Next steps:"
echo "1. Submit the test application"
echo "2. Check if success message appears"
echo "3. Verify email client opens with data"
echo "4. Check browser console for logs"
