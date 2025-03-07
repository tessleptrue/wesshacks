<?php
// Start the session at the very beginning
session_start();

// Include configuration file
require_once 'config.php';

// Initialize filter variables
$capacity_filter = isset($_GET['capacity']) ? $_GET['capacity'] : '';
$noise_filter = isset($_GET['noise']) ? $_GET['noise'] : '';
$search_term = isset($_GET['search']) ? trim($_GET['search']) : '';

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

// Function to determine if a street is quiet
function isQuietStreet($address, $quietStreets) {
    foreach ($quietStreets as $street) {
        if (stripos($address, $street) !== false) {
            return true;
        }
    }
    return false;
}

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

// Function to get reviews for a house
function getHouseReviews($conn, $house_address) {
    $sql = "SELECT * FROM house_reviews WHERE house_address = ? ORDER BY created_at DESC";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $house_address);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $reviews = [];
    
    while ($row = mysqli_fetch_assoc($result)) {
        $reviews[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    return $reviews;
}

// Function to display rating as a number
function displayRating($rating) {
    return '<div class="rating-display">Rating: ' . number_format($rating, 1) . ' / 5.0</div>';
}

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
    $is_quiet = isQuietStreet($row['street_address'], $quietStreets);
    
    // Apply noise filter if set
    if (($noise_filter === 'quiet' && !$is_quiet) || 
        ($noise_filter === 'loud' && $is_quiet)) {
        continue;
    }
    
    $row['is_quiet'] = $is_quiet;
    $row['reviews_count'] = getReviewsCount($conn, $row['street_address']);
    $row['avg_rating'] = getAverageRating($conn, $row['street_address']);
    $row['reviews'] = getHouseReviews($conn, $row['street_address']);
    $houses[] = $row;
}

mysqli_stmt_close($stmt);

// Sort houses: houses with reviews at the top, houses without reviews at the bottom
usort($houses, function($a, $b) {
    // If one has reviews and the other doesn't, the one with reviews comes first
    if ($a['reviews_count'] > 0 && $b['reviews_count'] == 0) {
        return -1;
    }
    if ($a['reviews_count'] == 0 && $b['reviews_count'] > 0) {
        return 1;
    }
    
    // If both have reviews or both don't have reviews, sort by address
    return strcmp($a['street_address'], $b['street_address']);
});
?>

<!-- Main content starts here -->
<?php include "includes/header.php"; ?>
<head>
<link rel="stylesheet" href="style.css?v=1.0" /> <!-- this is a temporary fix to the issue of the css not being properly reloaded --> 
</head>

<!-- This is where I removed styles from, moved them to style.css --> 

<div class="container">
    <h1>WesShacks Houses</h1>
    
    <!-- Search and Filter Section -->
    <div class="filters">
        <form method="GET" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" class="row">
            <div class="col-md-6 mb-3">
                <div class="input-group">
                    <input type="text" class="form-control" name="search" placeholder="Search by address..." 
                           value="<?php echo htmlspecialchars($search_term); ?>">
                    <div class="input-group-append">
                        <button class="btn btn-primary" type="submit">Search</button>
                    </div>
                </div>
            </div>
            
            <div class="col-md-2 mb-3">
                <select name="capacity" class="form-control" onchange="this.form.submit()">
                    <option value="">Capacity (Any)</option>
                    <?php for($i = 2; $i <= 6; $i++): ?>
                        <option value="<?php echo $i; ?>" <?php echo ($capacity_filter == $i) ? 'selected' : ''; ?>>
                            <?php echo $i; ?> people
                        </option>
                    <?php endfor; ?>
                </select>
            </div>
            
            <div class="col-md-2 mb-3">
                <select name="noise" class="form-control" onchange="this.form.submit()">
                    <option value="">Noise Level (Any)</option>
                    <option value="quiet" <?php echo ($noise_filter == 'quiet') ? 'selected' : ''; ?>>Quiet Streets</option>
                    <option value="loud" <?php echo ($noise_filter == 'loud') ? 'selected' : ''; ?>>Loud Streets</option>
                </select>
            </div>
            
            <div class="col-md-2 mb-3">
                <a href="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" class="btn btn-secondary w-100">Reset Filters</a>
            </div>
        </form>
    </div>
    
    <!-- Houses Listing -->
    <?php if (empty($houses)): ?>
        <div class="no-results">
            <h3>No houses found matching your criteria</h3>
            <p>Try adjusting your search filters or browse all houses.</p>
        </div>
    <?php else: ?>
        <?php 
        $houses_with_reviews = false;
        $houses_without_reviews = false;
        
        // Check if we have both types of houses to display the separator
        foreach ($houses as $house) {
            if ($house['reviews_count'] > 0) {
                $houses_with_reviews = true;
            } else {
                $houses_without_reviews = true;
            }
            
            if ($houses_with_reviews && $houses_without_reviews) {
                break;
            }
        }
        
        $displayed_separator = false;
        ?>
        
        <?php foreach ($houses as $index => $house): ?>
            <?php 
            // Insert separator before the first house without reviews
            if (!$displayed_separator && $houses_with_reviews && $houses_without_reviews && $house['reviews_count'] == 0): 
                $displayed_separator = true;
            ?>
                <div class="section-separator">
                    <span class="separator-label">Houses Without Reviews</span>
                </div>
            <?php endif; ?>
            
            <div class="house-card">
                <div class="house-header">
                    <h3><?php echo htmlspecialchars($house['street_address']); ?></h3>
                    <?php echo displayRating($house['avg_rating']); ?>
                </div>
                
                <div class="house-details">
                    <div class="house-meta">
                        <span><i class="fas fa-users"></i> Capacity: <?php echo $house['capacity']; ?> people</span>
                        <span>
                            <i class="fas fa-volume-up"></i> Noise: 
                            <span class="noise-badge <?php echo $house['is_quiet'] ? 'quiet' : 'loud'; ?>">
                                <?php echo $house['is_quiet'] ? 'Quiet' : 'Loud'; ?> Street
                            </span>
                        </span>
                        <?php if (!empty($house['url'])): ?>
                            <span><i class="fas fa-link"></i> <a href="<?php echo htmlspecialchars($house['url']); ?>" target="_blank">Visit Website</a></span>
                        <?php endif; ?>
                    </div>
                    
                    <div>
                        <a href="reviews.php?house=<?php echo urlencode($house['street_address']); ?>" class="btn btn-sm generic-btn">Write a Review</a>
                    </div>
                </div>
                
                <!-- Reviews Section -->
                <div class="review-section">
                    <h4 class="review-heading">Reviews (<?php echo count($house['reviews']); ?>)</h4>
                    
                    <?php if (empty($house['reviews'])): ?>
                        <p class="no-reviews">No reviews yet. Be the first to review this house!</p>
                    <?php else: ?>
                        <?php foreach ($house['reviews'] as $review): ?>
                            <div class="review-item">
                                <div class="review-meta">
                                    <div>
                                        <strong><?php echo htmlspecialchars($review['username']); ?></strong>
                                        <?php if ($review['is_resident']): ?>
                                            <span class="resident-badge">Resident</span>
                                        <?php endif; ?>
                                    </div>
                                    <div>
                                        Rating: <?php echo number_format($review['rating'], 1); ?> / 5.0
                                    </div>
                                </div>
                                <?php if (!empty($review['review_text'])): ?>
                                    <div class="review-content">
                                        <?php echo nl2br(htmlspecialchars($review['review_text'])); ?>
                                    </div>
                                <?php endif; ?>
                                <div class="text-muted small mt-1 review-date">
                                    <i>Posted on <?php echo date('F j, Y', strtotime($review['created_at'])); ?></i>
                                </div>
                                <!-- This is where I originally edited --> 
                                <?php if ($_SESSION['username'] === $review['username']): // Check if current user is the author ?>
                                    <div class="review-actions">
                                    <a href="edit_review.php?review_id=<?php echo $review['review_id']; ?>" class="btn generic-btn">Edit</a>
                                    <a href="delete_review.php?review_id=<?php echo $review['review_id']; ?>" class="btn generic-btn" onclick="return confirm('Are you sure you want to delete this review?')">Delete</a>
                                    </div>
                                <?php endif; ?>
                                <!-- end my edit --> 
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>

<?php include "includes/footer.php"; ?>