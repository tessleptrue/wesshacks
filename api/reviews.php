<?php
// API endpoint for reviews
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
require_once "../config.php";

// Start session for auth purposes
session_start();

// GET reviews for a specific house
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $house_address = isset($_GET['house']) ? $_GET['house'] : '';
    $review_id = isset($_GET['id']) ? $_GET['id'] : '';
    
    if (!empty($review_id)) {
        // Get specific review by ID
        $sql = "SELECT * FROM house_reviews WHERE review_id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $review_id);
    } elseif (!empty($house_address)) {
        // Get all reviews for a specific house
        $sql = "SELECT * FROM house_reviews WHERE house_address = ? ORDER BY created_at DESC";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $house_address);
    } else {
        // Get all reviews (with optional limit)
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
        $sql = "SELECT * FROM house_reviews ORDER BY created_at DESC LIMIT ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "i", $limit);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $reviews = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $reviews[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    
    // Return JSON response
    echo json_encode([
        'status' => 'success',
        'count' => count($reviews),
        'data' => $reviews
    ]);
}
// POST a new review
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
    
    // Get POST data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        // Try to get from $_POST
        $data = $_POST;
    }
    
    // Validate input
    if (empty($data['house_address'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'House address is required'
        ]);
        exit;
    }
    
    if (!isset($data['rating']) || $data['rating'] < 0 || $data['rating'] > 5) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Valid rating (0-5) is required'
        ]);
        exit;
    }
    
    // Insert review
    $house_address = $data['house_address'];
    $rating = $data['rating'];
    $review_text = isset($data['review_text']) ? $data['review_text'] : '';
    $is_resident = isset($data['is_resident']) ? (bool)$data['is_resident'] : false;
    
    // Use API username or session username
    $username = $username ?: $data['username'];
    
    // Prepare statement
    $sql = "INSERT INTO house_reviews (house_address, rating, review_text, username, is_resident) VALUES (?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "sdssi", $house_address, $rating, $review_text, $username, $is_resident);
    
    if (mysqli_stmt_execute($stmt)) {
        $review_id = mysqli_insert_id($conn);
        
        // Return success with the new review ID
        http_response_code(201); // Created
        echo json_encode([
            'status' => 'success',
            'message' => 'Review created successfully',
            'review_id' => $review_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to create review: ' . mysqli_error($conn)
        ]);
    }
    
    mysqli_stmt_close($stmt);
}
// DELETE a review
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
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
    
    // Get review ID from URL parameter
    $review_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($review_id <= 0) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid review ID'
        ]);
        exit;
    }
    
    // Check if the review belongs to the logged-in user
    $check_sql = "SELECT username FROM house_reviews WHERE review_id = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "i", $review_id);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);
    
    if (mysqli_stmt_num_rows($check_stmt) == 0) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Review not found'
        ]);
        exit;
    }
    
    mysqli_stmt_bind_result($check_stmt, $review_username);
    mysqli_stmt_fetch($check_stmt);
    mysqli_stmt_close($check_stmt);
    
    // Only allow deletion if the review belongs to the user
    if ($review_username !== $username) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Forbidden: You can only delete your own reviews'
        ]);
        exit;
    }
    
    // Delete the review
    $delete_sql = "DELETE FROM house_reviews WHERE review_id = ?";
    $delete_stmt = mysqli_prepare($conn, $delete_sql);
    mysqli_stmt_bind_param($delete_stmt, "i", $review_id);
    
    if (mysqli_stmt_execute($delete_stmt)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Review deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to delete review: ' . mysqli_error($conn)
        ]);
    }
    
    mysqli_stmt_close($delete_stmt);
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