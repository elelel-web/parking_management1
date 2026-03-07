<?php
session_start();
header('Content-Type: application/json');

session_unset();
session_destroy();

if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

echo json_encode([
    'success' => true,
    'message' => 'Logged out successfully'
]);
?>