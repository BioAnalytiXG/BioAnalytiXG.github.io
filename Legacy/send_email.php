<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $recaptcha_secret = "6LeJy5gqAAAAAHARaKyl48gYC5YeMnxpwFx106u6";
    $recaptcha_response = $_POST['g-recaptcha-response'];

    // Verify reCAPTCHA response
    $response = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$recaptcha_secret&response=$recaptcha_response");
    $response_keys = json_decode($response, true);

    if (intval($response_keys["success"]) !== 1) {
        echo "Please complete the reCAPTCHA.";
    } else {
        // Process the form
        $name = htmlspecialchars($_POST['name']);
        $email = htmlspecialchars($_POST['email']);
        $message = htmlspecialchars($_POST['message']);

        // Send email or save to database
        // ...

        echo "Message sent successfully!";
    }
}
?>