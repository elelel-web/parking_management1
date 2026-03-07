<?php
// Authentication check - Include at top of protected pages
session_start();

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

// Check session timeout (30 minutes)
$timeout_duration = 1800;

if (isset($_SESSION['login_time'])) {
    $elapsed_time = time() - $_SESSION['login_time'];
    
    if ($elapsed_time > $timeout_duration) {
        session_unset();
        session_destroy();
        header('Location: login.php?timeout=1');
        exit;
    }
}

// Update last activity time
$_SESSION['login_time'] = time();

// Make user info available
$current_user_id = $_SESSION['user_id'];
$current_username = $_SESSION['username'];
$current_full_name = $_SESSION['full_name'] ?? $_SESSION['username'];
?>