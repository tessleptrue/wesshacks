<?php
// API endpoint for saved houses
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
require_once "../config.php";

// Start session for auth purposes
session_start();

// Check if user is authenticated
function isAuthenticated() {
    // Check API token
    $api_key = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    
    if (!empty($api_key) && strpos($api_key, 'Bearer ') === 0) {
        $token = substr($api_key, 7);
        if (!empty($token)) {
            return true;
        }
    } 
    // Check session auth
    elseif (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
        return true;
    }

    return false;
}

// Get current user ID
function getCurrentUserId($conn) {
    // Check API token
    $api_key = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    
    if (!empty($api_key) && strpos($api_key, 'Bearer ') === 0) {
        $token = substr($api_key, 7);
        // In a real app, you'd look up the user ID from the token
        // For this demo, we'll assume a test user ID
        // TODO: Implement proper token validation
        return 1; // Default test user ID
    } 
    // Check session auth
    elseif (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
        return $_SESSION['id'];
    }

    return null;
}

// GET - Retrieve saved houses for the current user
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit;
    }

    $user_id = getCurrentUserId($conn);
    
    // Get saved houses
    $sql = "SELECT h.*, 
            (SELECT AVG(rating) FROM house_reviews WHERE house_address = h.street_address) AS avg_rating,
            (SELECT COUNT(*) FROM house_reviews WHERE house_address = h.street_address) AS reviews_count,
            s.saved_at
            FROM saved_houses s
            JOIN houses h ON s.house_address = h.street_address
            WHERE s.user_id = ?
            ORDER BY s.saved_at DESC";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $houses = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Check if on quiet street
        $row['avg_rating'] = $row['avg_rating'] ? round($row['avg_rating'] * 10) / 10 : 0;
        $houses[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    
    // Return JSON response
    echo json_encode([
        'status' => 'success',
        'count' => count($houses),
        'data' => $houses
    ]);
}
// POST - Save a house
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isAuthenticated()) {
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
    
    $user_id = getCurrentUserId($conn);
    $house_address = $data['house_address'];
    
    // Check if house exists
    $check_sql = "SELECT street_address FROM houses WHERE street_address = ?";
    $check_stmt = mysqli_prepare($conn, $check_sql);
    mysqli_stmt_bind_param($check_stmt, "s", $house_address);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);
    
    if (mysqli_stmt_num_rows($check_stmt) == 0) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'House not found'
        ]);
        mysqli_stmt_close($check_stmt);
        exit;
    }
    
    mysqli_stmt_close($check_stmt);
    
    // Save the house (INSERT IGNORE to handle duplicate entries gracefully)
    $sql = "INSERT IGNORE INTO saved_houses (user_id, house_address) VALUES (?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "is", $user_id, $house_address);
    
    if (mysqli_stmt_execute($stmt)) {
        // Check if a row was actually inserted (affected_rows will be 0 if already exists)
        if (mysqli_stmt_affected_rows($stmt) > 0) {
            http_response_code(201); // Created
            echo json_encode([
                'status' => 'success',
                'message' => 'House saved successfully'
            ]);
        } else {
            // House was already saved
            echo json_encode([
                'status' => 'success',
                'message' => 'House was already saved'
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to save house: ' . mysqli_error($conn)
        ]);
    }
    
    mysqli_stmt_close($stmt);
}
// DELETE - Unsave a house
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit;
    }
    
    // Get house address from URL parameter
    $house_address = isset($_GET['house']) ? $_GET['house'] : '';
    
    if (empty($house_address)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'House address is required'
        ]);
        exit;
    }
    
    $user_id = getCurrentUserId($conn);
    
    // Delete the saved house
    $sql = "DELETE FROM saved_houses WHERE user_id = ? AND house_address = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "is", $user_id, $house_address);
    
    if (mysqli_stmt_execute($stmt)) {
        if (mysqli_stmt_affected_rows($stmt) > 0) {
            echo json_encode([
                'status' => 'success',
                'message' => 'House removed from saved list'
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'House was not in saved list'
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to remove house: ' . mysqli_error($conn)
        ]);
    }
    
    mysqli_stmt_close($stmt);
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