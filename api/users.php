<?php
// API endpoint for user management
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
require_once "../config.php";

// Start session for auth purposes
session_start();

// Function to generate API key/token (basic implementation)
function generateToken($username) {
    // In a real app, you'd want to use a more secure method and store tokens in a database
    $token = bin2hex(random_bytes(32));
    // For simple implementation - you would store this in a database with an expiration
    return $token;
}

// Handle GET request (get user info)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if user is logged in via API key or session
    $api_key = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    $is_authorized = false;
    $username = '';
    
    // Check API key (you would implement proper API key validation)
    if (!empty($api_key)) {
        // Simple example - replace with proper API key validation
        if (strpos($api_key, 'Bearer ') === 0) {
            $token = substr($api_key, 7);
            // Validate token
            // For demonstration, we'll just check if it's a non-empty string
            if (!empty($token)) {
                $is_authorized = true;
                // Get username from token (implement this properly)
                $username = "api_user"; // Placeholder
            }
        }
    } 
    // Check session auth
    elseif (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
        $is_authorized = true;
        $username = $_SESSION['username'];
    }
    
    if (!$is_authorized) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit;
    }
    
    // Get user information (exclude password)
    $sql = "SELECT user_id, username, email FROM users WHERE username = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $username);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user = mysqli_fetch_assoc($result);
    
    if ($user) {
        echo json_encode([
            'status' => 'success',
            'data' => $user
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'User not found'
        ]);
    }
    
    mysqli_stmt_close($stmt);
}
// Handle POST request (login/register)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get POST data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        // Try to get from $_POST
        $data = $_POST;
    }
    
    // Check action parameter
    $action = isset($data['action']) ? $data['action'] : '';
    
    // Login
    if ($action === 'login') {
        // Validate input
        if (empty($data['username']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Username and password are required'
            ]);
            exit;
        }
        
        $username = $data['username'];
        $password = $data['password'];
        
        // Check credentials
        $sql = "SELECT user_id, username, password FROM users WHERE username = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $username);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt);
        
        if (mysqli_stmt_num_rows($stmt) == 1) {
            mysqli_stmt_bind_result($stmt, $id, $username, $hashed_password);
            mysqli_stmt_fetch($stmt);
            
            if (password_verify($password, $hashed_password)) {
                // Generate API token
                $token = generateToken($username);
                
                // Set session variables if needed
                $_SESSION["loggedin"] = true;
                $_SESSION["id"] = $id;
                $_SESSION["username"] = $username;
                
                // Return success with token
                http_response_code(201);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Login successful',
                    'token' => $token,
                    'user_id' => $id,
                    'username' => $username
                ]);
            } else {
                http_response_code(201);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid username or password'
                ]);
            }
        } else {
            http_response_code(201);
            echo json_encode([
                'status' => 'error',
                'message' => 'Invalid username or password'
            ]);
        }
        
        mysqli_stmt_close($stmt);
    }
    // Register
    elseif ($action === 'register') {
        // Validate input
        if (empty($data['username']) || empty($data['password']) || empty($data['email'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Username, password, and email are required'
            ]);
            exit;
        }
        
        $username = $data['username'];
        $password = $data['password'];
        $email = $data['email'];
        
        // Check if username exists
        $check_sql = "SELECT user_id FROM users WHERE username = ?";
        $check_stmt = mysqli_prepare($conn, $check_sql);
        mysqli_stmt_bind_param($check_stmt, "s", $username);
        mysqli_stmt_execute($check_stmt);
        mysqli_stmt_store_result($check_stmt);
        
        if (mysqli_stmt_num_rows($check_stmt) > 0) {
            http_response_code(409); // Conflict
            echo json_encode([
                'status' => 'error',
                'message' => 'Username already exists'
            ]);
            mysqli_stmt_close($check_stmt);
            exit;
        }
        
        mysqli_stmt_close($check_stmt);
        
        // Check if email exists
        $check_email_sql = "SELECT user_id FROM users WHERE email = ?";
        $check_email_stmt = mysqli_prepare($conn, $check_email_sql);
        mysqli_stmt_bind_param($check_email_stmt, "s", $email);
        mysqli_stmt_execute($check_email_stmt);
        mysqli_stmt_store_result($check_email_stmt);
        
        if (mysqli_stmt_num_rows($check_email_stmt) > 0) {
            http_response_code(409); // Conflict
            echo json_encode([
                'status' => 'error',
                'message' => 'Email already registered'
            ]);
            mysqli_stmt_close($check_email_stmt);
            exit;
        }
        
        mysqli_stmt_close($check_email_stmt);
        
        // Validate password length
        if (strlen($password) < 10) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Password must be at least 10 characters long'
            ]);
            exit;
        }
        
        // Register user
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "sss", $username, $hashed_password, $email);
        
        if (mysqli_stmt_execute($stmt)) {
            $user_id = mysqli_insert_id($conn);
            
            // Generate API token
            $token = generateToken($username);
            
            // Return success with token
            http_response_code(201); // Created
            echo json_encode([
                'status' => 'success',
                'message' => 'Registration successful',
                'token' => $token,
                'user_id' => $user_id,
                'username' => $username
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Registration failed: ' . mysqli_error($conn)
            ]);
        }
        
        mysqli_stmt_close($stmt);
    }
    // Logout
    elseif ($action === 'logout') {
        // Clear session
        $_SESSION = array();
        session_destroy();
        
        // Return success
        echo json_encode([
            'status' => 'success',
            'message' => 'Logout successful'
        ]);
    }
    // Invalid action
    else {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid action. Supported actions: login, register, logout'
        ]);
    }
}
// Method not allowed
else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}

mysqli_close($conn);
?>