<?php
/**
 * Beta Tester Application Form Handler
 * Processes form submissions for the BioAnalytiX beta program
 */

// Start output buffering to prevent any accidental output
ob_start();

// Enable error reporting for debugging (but don't display errors to avoid breaking JSON)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Security headers
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Log the request
error_log('Beta form submission received - Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('POST data: ' . print_r($_POST, true));

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Configuration
$config = [
    'admin_email' => 'info@bioanalytix.info', // Change this to your email
    'from_email' => 'noreply@bioanalytix.info',
    'subject' => 'New Beta Tester Application - BioAnalytiX',
    'max_file_size' => 5 * 1024 * 1024, // 5MB
];

/**
 * Sanitize input data
 */
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email address
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate required fields
 */
function validateRequired($data, $required_fields) {
    $errors = [];
    
    foreach ($required_fields as $field) {
        if (empty($data[$field])) {
            $errors[] = "Field '{$field}' is required";
        }
    }
    
    return $errors;
}

/**
 * Log application data (for admin review)
 */
function logApplication($data) {
    $log_entry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'data' => $data
    ];
    
    $log_file = 'logs/beta_applications.log';
    
    // Create logs directory if it doesn't exist
    if (!file_exists('logs')) {
        mkdir('logs', 0755, true);
    }
    
    file_put_contents($log_file, json_encode($log_entry) . PHP_EOL, FILE_APPEND | LOCK_EX);
}

/**
 * Send email notification with improved error handling
 */
function sendEmailNotification($data, $config) {
    $to = $config['admin_email'];
    $subject = $config['subject'];
    $from = $config['from_email'];
    
    // Create email body
    $email_body = generateEmailBody($data);
    
    // Email headers with improved formatting
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        "From: BioAnalytiX System <{$from}>",
        "Reply-To: {$data['email']}",
        'X-Mailer: PHP/' . phpversion(),
        'X-Priority: 1',
        'Importance: High'
    ];
    
    // Log email attempt
    error_log("Attempting to send email to: {$to} from: {$from}");
    
    // Try to send email
    $result = mail($to, $subject, $email_body, implode("\r\n", $headers));
    
    if (!$result) {
        error_log("Failed to send email. Last error: " . error_get_last()['message']);
        
        // Try alternative method: save to file for manual processing
        $email_file = 'logs/failed_emails_' . date('Y-m-d') . '.log';
        $email_data = [
            'timestamp' => date('Y-m-d H:i:s'),
            'to' => $to,
            'subject' => $subject,
            'body' => $email_body,
            'applicant' => $data['firstName'] . ' ' . $data['lastName'] . ' (' . $data['email'] . ')'
        ];
        
        if (!file_exists('logs')) {
            mkdir('logs', 0755, true);
        }
        
        file_put_contents($email_file, json_encode($email_data, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND | LOCK_EX);
        error_log("Email saved to file for manual processing: {$email_file}");
    } else {
        error_log("Email sent successfully to: {$to}");
    }
    
    return $result;
}

/**
 * Generate HTML email body
 */
function generateEmailBody($data) {
    $imaging_types = is_array($data['imaging']) ? implode(', ', $data['imaging']) : $data['imaging'];
    
    $html = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #7CCDB3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .section { margin-bottom: 20px; }
            .field { margin-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-left: 10px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h1>New Beta Tester Application</h1>
            <p>BioAnalytiX Beta Program</p>
        </div>
        
        <div class='content'>
            <div class='section'>
                <h2>Personal Information</h2>
                <div class='field'>
                    <span class='label'>Name:</span>
                    <span class='value'>{$data['firstName']} {$data['lastName']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Email:</span>
                    <span class='value'>{$data['email']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Phone:</span>
                    <span class='value'>{$data['phone']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Country:</span>
                    <span class='value'>{$data['country']}</span>
                </div>
            </div>
            
            <div class='section'>
                <h2>Professional Information</h2>
                <div class='field'>
                    <span class='label'>Organization:</span>
                    <span class='value'>{$data['organization']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Role:</span>
                    <span class='value'>{$data['role']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Experience:</span>
                    <span class='value'>{$data['experience']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Specialty:</span>
                    <span class='value'>{$data['specialty']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Imaging Types:</span>
                    <span class='value'>{$imaging_types}</span>
                </div>
            </div>
            
            <div class='section'>
                <h2>Application Details</h2>
                <div class='field'>
                    <span class='label'>Use Case:</span>
                    <div class='value'>" . nl2br($data['useCase']) . "</div>
                </div>
                <div class='field'>
                    <span class='label'>Motivation:</span>
                    <div class='value'>" . nl2br($data['motivation']) . "</div>
                </div>
                <div class='field'>
                    <span class='label'>Commitment:</span>
                    <span class='value'>{$data['commitment']}</span>
                </div>
                <div class='field'>
                    <span class='label'>Additional Comments:</span>
                    <div class='value'>" . nl2br($data['feedback']) . "</div>
                </div>
            </div>
            
            <div class='section'>
                <h2>Preferences</h2>
                <div class='field'>
                    <span class='label'>Newsletter Subscription:</span>
                    <span class='value'>" . (isset($data['newsletter']) ? 'Yes' : 'No') . "</span>
                </div>
                <div class='field'>
                    <span class='label'>Application Date:</span>
                    <span class='value'>" . date('Y-m-d H:i:s') . "</span>
                </div>
            </div>
        </div>
    </body>
    </html>";
    
    return $html;
}

try {
    error_log('Starting form processing...');
    
    // Collect and sanitize form data
    $data = [];
    $fields = [
        'firstName', 'lastName', 'email', 'phone', 'country',
        'organization', 'role', 'experience', 'specialty',
        'useCase', 'motivation', 'commitment', 'feedback'
    ];
    
    foreach ($fields as $field) {
        $data[$field] = isset($_POST[$field]) ? sanitizeInput($_POST[$field]) : '';
    }
    
    error_log('Form data collected: ' . json_encode($data));
    
    // Handle imaging array
    $data['imaging'] = isset($_POST['imaging']) && is_array($_POST['imaging']) 
        ? array_map('sanitizeInput', $_POST['imaging']) 
        : [];
    
    // Handle checkboxes
    $data['newsletter'] = isset($_POST['newsletter']);
    $data['terms'] = isset($_POST['terms']);
    
    error_log('Imaging data: ' . json_encode($data['imaging']));
    error_log('Newsletter: ' . ($data['newsletter'] ? 'Yes' : 'No'));
    error_log('Terms accepted: ' . ($data['terms'] ? 'Yes' : 'No'));
    
    // Required fields validation
    $required_fields = [
        'firstName', 'lastName', 'email', 'country',
        'organization', 'role', 'experience',
        'useCase', 'motivation', 'commitment'
    ];
    
    $validation_errors = validateRequired($data, $required_fields);
    
    // Email validation
    if (!empty($data['email']) && !isValidEmail($data['email'])) {
        $validation_errors[] = 'Invalid email address';
    }
    
    // Imaging types validation
    if (empty($data['imaging'])) {
        $validation_errors[] = 'At least one imaging type must be selected';
    }
    
    // Terms validation
    if (!$data['terms']) {
        $validation_errors[] = 'Terms and conditions must be accepted';
    }
    
    error_log('Validation errors: ' . json_encode($validation_errors));
    
    // Check for validation errors
    if (!empty($validation_errors)) {
        error_log('Validation failed, returning errors');
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $validation_errors,
            'message' => 'Please fix the following errors: ' . implode(', ', $validation_errors)
        ]);
        exit;
    }
    
    error_log('Validation passed, logging application...');
    
    // Log the application
    logApplication($data);
    
    error_log('Application logged, sending email...');
    
    // Send email notification
    $email_sent = sendEmailNotification($data, $config);
    
    if (!$email_sent) {
        error_log('Failed to send beta application email for: ' . $data['email']);
    }
    
    error_log('Process completed successfully, email sent: ' . ($email_sent ? 'Yes' : 'No'));
    
    // Clear any output buffer and send clean JSON response
    ob_clean();
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Application submitted successfully! We will review your application and get back to you within 48 hours.',
        'email_sent' => $email_sent
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log('Beta form submission error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    // Clear output buffer and send error response
    ob_clean();
    
    // Error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while processing your application: ' . $e->getMessage()
    ]);
} catch (Error $e) {
    // Catch fatal errors
    error_log('Beta form fatal error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    
    // Clear output buffer and send error response
    ob_clean();
    
    // Error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'A system error occurred: ' . $e->getMessage()
    ]);
}
?>
