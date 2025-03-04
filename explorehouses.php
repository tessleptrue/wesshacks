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
    $row['avg_rating'] = getAverageRating($conn, $row['street_address']);
    $row['reviews'] = getHouseReviews($conn, $row['street_address']);
    $houses[] = $row;
}

mysqli_stmt_close($stmt);
?>

<!-- Main content starts here -->
<?php include "includes/header.php"; ?>
<link rel="stylesheet" href="style.css" />
<style>
    /* House listing styles */
    .filters {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 20px;
    }
    
    .house-card {
        border: 1px solid #ddd;
        border-radius: 5px;
        margin-bottom: 20px;
        overflow: hidden;
    }
    
    .house-header {
        background-color: #f8f9fa;
        padding: 15px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .house-header h3 {
        margin: 0;
    }
    
    .house-details {
        padding: 15px;
    }
    
    .house-meta {
        display: flex;
        gap: 20px;
        margin-bottom: 10px;
    }
    
    .house-meta span {
        display: flex;
        align-items: center;
    }
    
    .house-meta span i {
        margin-right: 5px;
    }
    
    .noise-badge {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
    }
    
    .quiet {
        background-color: #d4edda;
        color: #155724;
    }
    
    .loud {
        background-color: #f8d7da;
        color: #721c24;
    }
    
    .review-section {
        padding: 15px;
        border-top: 1px solid #eee;
    }
    
    .review-heading {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 1.1em;
        color: #555;
    }
    
    .review-item {
        padding: 10px;
        border-bottom: 1px solid #eee;
    }
    
    .review-item:last-child {
        border-bottom: none;
    }
    
    .review-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        font-size: 0.9em;
        color: #666;
    }
    
    .resident-badge {
        background-color: #cce5ff;
        color: #004085;
        padding: 2px 5px;
        border-radius: 3px;
        font-size: 0.8em;
    }
    
    .review-content {
        margin-top: 5px;
    }
    
    .no-reviews {
        color: #6c757d;
        font-style: italic;
    }
    
    /* Rating Display Styles */
    .rating-display {
        font-weight: bold;
        color: #495057;
    }
    
    /* No results message */
    .no-results {
        text-align: center;
        padding: 30px;
        background-color: #f8f9fa;
        border-radius: 5px;
        color: #6c757d;
    }
</style>

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
        <?php foreach ($houses as $house): ?>
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
                        <a href="reviews.php?house=<?php echo urlencode($house['street_address']); ?>" class="btn btn-sm btn-primary">Write a Review</a>
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
                                <div class="text-muted small mt-1">
                                    Posted on <?php echo date('F j, Y', strtotime($review['created_at'])); ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        <?php endforeach; ?>
    <?php endif; ?>
</div>

<?php include "includes/footer.php"; ?>