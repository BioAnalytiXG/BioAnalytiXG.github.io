<?php
/**
 * Email Test Script for BioAnalytiX
 * This script helps test if your server can send emails
 */

// Configuration - Update these with your actual email settings
$to = 'info@bioanalytix.info'; // Change this to your email address
$from = 'noreply@bioanalytix.info';
$subject = 'Test Email from BioAnalytiX Beta Form';

// Check if this is a POST request (form submission)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $test_email = $_POST['test_email'] ?? $to;
    
    $message = "
    <html>
    <head>
        <title>Test Email</title>
    </head>
    <body>
        <h2>Test Email from BioAnalytiX</h2>
        <p>This is a test email to verify that your server can send emails.</p>
        <p><strong>Sent at:</strong> " . date('Y-m-d H:i:s') . "</p>
        <p><strong>Server:</strong> " . $_SERVER['SERVER_NAME'] . "</p>
        <p><strong>PHP Version:</strong> " . phpversion() . "</p>
    </body>
    </html>
    ";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: BioAnalytiX Test <{$from}>",
        'X-Mailer: PHP/' . phpversion()
    ];
    
    echo "<h2>Email Test Results</h2>";
    echo "<p><strong>Attempting to send email to:</strong> " . htmlspecialchars($test_email) . "</p>";
    
    $result = mail($test_email, $subject, $message, implode("\r\n", $headers));
    
    if ($result) {
        echo "<p style='color: green;'><strong>✅ SUCCESS:</strong> Email sent successfully!</p>";
        echo "<p>Check your email inbox (and spam folder) for the test message.</p>";
    } else {
        echo "<p style='color: red;'><strong>❌ FAILED:</strong> Email could not be sent.</p>";
        
        $last_error = error_get_last();
        if ($last_error) {
            echo "<p><strong>Last PHP Error:</strong> " . htmlspecialchars($last_error['message']) . "</p>";
        }
        
        echo "<h3>Possible Issues:</h3>";
        echo "<ul>";
        echo "<li>Mail server not configured on your hosting provider</li>";
        echo "<li>PHP mail() function disabled</li>";
        echo "<li>Firewall blocking outgoing mail</li>";
        echo "<li>Domain not properly configured for sending emails</li>";
        echo "<li>Need to use SMTP instead of PHP mail() function</li>";
        echo "</ul>";
    }
    
    echo "<hr>";
    echo "<h3>Server Information:</h3>";
    echo "<p><strong>Server:</strong> " . $_SERVER['SERVER_NAME'] . "</p>";
    echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
    echo "<p><strong>Mail Function Available:</strong> " . (function_exists('mail') ? 'Yes' : 'No') . "</p>";
    
    if (function_exists('mail')) {
        echo "<p><strong>Sendmail Path:</strong> " . ini_get('sendmail_path') . "</p>";
        echo "<p><strong>SMTP:</strong> " . ini_get('SMTP') . "</p>";
        echo "<p><strong>SMTP Port:</strong> " . ini_get('smtp_port') . "</p>";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>BioAnalytiX Email Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #7CCDB3;
            text-align: center;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="email"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        button {
            background: #7CCDB3;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
        }
        button:hover {
            background: #6bb3a0;
        }
        .info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 BioAnalytiX Email Test</h1>
        
        <div class="info">
            <strong>📧 Email Configuration Test</strong><br>
            This tool helps you test if your server can send emails for the beta application form.
            Make sure to test this before deploying your website to production.
        </div>
        
        <form method="POST">
            <div class="form-group">
                <label for="test_email">Test Email Address:</label>
                <input type="email" id="test_email" name="test_email" value="<?php echo htmlspecialchars($to); ?>" required>
                <small>Enter the email address where you want to receive the test email</small>
            </div>
            
            <button type="submit">Send Test Email</button>
        </form>
        
        <hr>
        
        <h3>📋 Troubleshooting Steps:</h3>
        <ol>
            <li><strong>Run this test first</strong> - Click "Send Test Email" to see if basic email functionality works</li>
            <li><strong>Check server logs</strong> - Look for email-related errors in your server's error logs</li>
            <li><strong>Verify email settings</strong> - Make sure your hosting provider supports PHP mail() function</li>
            <li><strong>Check spam folders</strong> - Test emails might end up in spam</li>
            <li><strong>Consider SMTP</strong> - For better delivery, consider using SMTP instead of PHP mail()</li>
        </ol>
        
        <h3>🚀 Next Steps if Email Works:</h3>
        <p>If this test succeeds, your beta application form should work properly. Make sure to:</p>
        <ul>
            <li>Update the email addresses in <code>submit-beta-application.php</code></li>
            <li>Test the actual beta form submission</li>
            <li>Check the <code>logs/</code> directory for application logs</li>
        </ul>
    </div>
</body>
</html>
