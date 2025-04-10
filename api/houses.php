<?php
// API endpoint for houses
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
require_once "../config.php";

// Define quiet streets
$quietStreets = [
    'Brainerd Ave',
    'Fairview Ave',
    'High St',
    'Home Ave',
    'Huber Ave',
    'Knowles Ave',
    'Lawn Ave',
    'Williams St'
];

// Function to get average rating for a house
function getAverageRating($conn, $house_address) {
    $sql = "SELECT AVG(rating) as avg_rating FROM house_reviews WHERE house_address = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $house_address);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    return $row['avg_rating'] ? round($row['avg_rating'] * 10) / 10 : 0; // Round to 1 decimal place
}

// Function to get reviews count for a house
function getReviewsCount($conn, $house_address) {
    $sql = "SELECT COUNT(*) as count FROM house_reviews WHERE house_address = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $house_address);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    return $row['count'];
}

// Handle GET request
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $capacity_filter = isset($_GET['capacity']) ? $_GET['capacity'] : '';
    $noise_filter = isset($_GET['noise']) ? $_GET['noise'] : '';
    $search_term = isset($_GET['search']) ? trim($_GET['search']) : '';
    $house_id = isset($_GET['id']) ? trim($_GET['id']) : '';
    
    // Build SQL query based on filters
    $sql = "SELECT * FROM houses WHERE 1=1";
    $params = [];
    $types = "";
    
    if (!empty($capacity_filter)) {
        $sql .= " AND capacity = ?";
        $params[] = $capacity_filter;
        $types .= "s";
    }
    
    if (!empty($search_term)) {
        $sql .= " AND street_address LIKE ?";
        $search_param = "%" . $search_term . "%";
        $params[] = $search_param;
        $types .= "s";
    }
    
    if (!empty($house_id)) {
        $sql .= " AND street_address = ?";
        $params[] = $house_id;
        $types .= "s";
    }
    
    $sql .= " ORDER BY street_address";
    
    // Prepare and execute the query
    $stmt = mysqli_prepare($conn, $sql);
    
    if (!empty($params)) {
        mysqli_stmt_bind_param($stmt, $types, ...$params);
    }
    
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    // Fetch all houses
    $houses = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Check if on quiet street
        $is_quiet = false;
        foreach ($quietStreets as $street) {
            if (stripos($row['street_address'], $street) !== false) {
                $is_quiet = true;
                break;
            }
        }
        
        // Apply noise filter if set
        if (($noise_filter === 'quiet' && !$is_quiet) || 
            ($noise_filter === 'loud' && $is_quiet)) {
            continue;
        }
        
        $row['is_quiet'] = $is_quiet;
        $row['reviews_count'] = getReviewsCount($conn, $row['street_address']);
        $row['avg_rating'] = getAverageRating($conn, $row['street_address']);
        $houses[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    
    // Return JSON response
    echo json_encode([
        'status' => 'success',
        'count' => count($houses),
        'data' => $houses
    ]);
} else {
    // Method not allowed
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}

mysqli_close($conn);
?>
