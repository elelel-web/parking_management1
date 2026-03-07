<?php
session_start();
// If already logged in, redirect to main page
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Parking Management System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #2c2c2c 0%, #4a4a4a 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .login-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 15px 60px rgba(0, 0, 0, 0.4);
            overflow: hidden;
            max-width: 400px;
            width: 100%;
            animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .login-header {
            background: linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }

        .login-icon {
            font-size: 50px;
            margin-bottom: 15px;
        }

        .login-header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .login-header p {
            font-size: 14px;
            opacity: 0.9;
        }

        .login-body {
            padding: 40px 30px;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
            font-size: 14px;
        }

        .input-wrapper {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            font-size: 16px;
        }

        .form-control {
            width: 100%;
            padding: 14px 15px 14px 45px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 15px;
            transition: all 0.3s ease;
        }

        .form-control:focus {
            outline: none;
            border-color: #5a5a5a;
            box-shadow: 0 0 0 3px rgba(90, 90, 90, 0.1);
        }

        .password-toggle {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #999;
            cursor: pointer;
            font-size: 16px;
            transition: color 0.3s;
        }

        .password-toggle:hover {
            color: #5a5a5a;
        }

        .btn-login {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .btn-login:active {
            transform: translateY(0);
        }

        .btn-login:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .alert {
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
            animation: shake 0.3s ease;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }

        .alert-error {
            background: #ffebee;
            color: #c62828;
            border: 1px solid #ef5350;
        }

        .alert-success {
            background: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #66bb6a;
        }

        .login-footer {
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
            color: #666;
            font-size: 13px;
        }

        .default-credentials {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 13px;
        }

        .default-credentials strong {
            color: #856404;
        }

        .loading {
            display: none;
        }

        .loading.active {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-header">
            <div class="login-icon">
                <i class="fas fa-parking"></i>
            </div>
            <h1>Parking Management</h1>
            <p>Login to access the system</p>
        </div>

        <div class="login-body">
            

            <div class="alert alert-error" id="error-message"></div>
            <div class="alert alert-success" id="success-message"></div>

            <form id="login-form">
                <div class="form-group">
                    <label for="username">
                        <i class="fas fa-user"></i> Username
                    </label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            class="form-control" 
                            placeholder="Enter your username"
                            required
                            autocomplete="username"
                        >
                    </div>
                </div>

                <div class="form-group">
                    <label for="password">
                        <i class="fas fa-lock"></i> Password
                    </label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            class="form-control" 
                            placeholder="Enter your password"
                            required
                            autocomplete="current-password"
                        >
                        <i class="fas fa-eye password-toggle" id="toggle-password"></i>
                    </div>
                </div>

                <button type="submit" class="btn-login">
                    <span id="login-text">Login</span>
                    <span class="loading" id="loading"></span>
                </button>
            </form>
        </div>

        <div class="login-footer">
            &copy; 2026 Parking Management System
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        $(document).ready(function() {
            // Password toggle
            $('#toggle-password').click(function() {
                const passwordField = $('#password');
                const type = passwordField.attr('type') === 'password' ? 'text' : 'password';
                passwordField.attr('type', type);
                $(this).toggleClass('fa-eye fa-eye-slash');
            });

            // Login form submit
            $('#login-form').submit(function(e) {
                e.preventDefault();
                
                const username = $('#username').val().trim();
                const password = $('#password').val();

                if (!username || !password) {
                    showError('Please enter both username and password');
                    return;
                }

                // Show loading
                $('#login-text').text('Logging in...');
                $('#loading').addClass('active');
                $('.btn-login').prop('disabled', true);
                hideMessages();

                // Send login request
                $.ajax({
                    url: 'api/auth/login.php',
                    method: 'POST',
                    data: JSON.stringify({
                        username: username,
                        password: password
                    }),
                    contentType: 'application/json',
                    success: function(response) {
                        if (response.success) {
                            showSuccess('Login successful! Redirecting...');
                            setTimeout(function() {
                                window.location.href = 'index.php';
                            }, 500);
                        } else {
                            showError(response.message || 'Invalid username or password');
                            resetButton();
                        }
                    },
                    error: function(xhr) {
                        console.error('Login error:', xhr.responseText);
                        showError('An error occurred. Please try again.');
                        resetButton();
                    }
                });
            });

            function showError(message) {
                $('#error-message').text(message).fadeIn();
                setTimeout(hideMessages, 5000);
            }

            function showSuccess(message) {
                $('#success-message').text(message).fadeIn();
            }

            function hideMessages() {
                $('.alert').fadeOut();
            }

            function resetButton() {
                $('#login-text').text('Login');
                $('#loading').removeClass('active');
                $('.btn-login').prop('disabled', false);
            }

            // Auto-focus username
            $('#username').focus();
        });
    </script>
</body>
</html>