<?php
// Start the session at the very beginning
session_start();

// Include configuration file
require_once 'config.php';

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}

// Initialize variables
$house_address = "";
$rating = "";
$review_text = "";
$is_resident = false;
$message = "";
$error = "";

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $house_address = trim($_POST["house_address"]);
    $rating = $_POST["rating"];
    $review_text = trim($_POST["review_text"]);
    $is_resident = isset($_POST["is_resident"]) ? 1 : 0;
    $username = $_SESSION['username'];
    
    // Validate inputs
    if (empty($house_address)) {
        $error = "Please select a house to review";
    } elseif (empty($rating)) {
        $error = "Please select a rating";
    } else {
        // Using mysqli instead of PDO to be consistent with house_reg.php
        
        // Prepare an insert statement
        $sql = "INSERT INTO house_reviews (house_address, rating, review_text, username, is_resident) VALUES (?, ?, ?, ?, ?)";
        
        if($stmt = mysqli_prepare($conn, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "sdssi", $house_address, $rating, $review_text, $username, $is_resident);
            
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                $message = "Your review has been submitted successfully!";
                $house_address = "";
                $rating = "";
                $review_text = "";
                $is_resident = false;
            } else {
                $error = "Database error: " . mysqli_error($conn);
            }
            
            // Close statement
            mysqli_stmt_close($stmt);
        } else {
            $error = "Error preparing statement: " . mysqli_error($conn);
        }
    }
}

// Get list of houses from database
$houses = array();
$houses_sql = "SELECT street_address FROM houses ORDER BY street_address";
if($result = mysqli_query($conn, $houses_sql)){
    while($row = mysqli_fetch_array($result)){
        $houses[] = $row['street_address'];
    }
    mysqli_free_result($result);
} else {
    $error = "Error fetching houses: " . mysqli_error($conn);
}
?>

<!-- Main content starts here -->
<?php include "includes/header.php"; ?>
<link rel="stylesheet" href="style.css" />

<div class="container">
    <h1>Leave a House Review</h1>
    
    <?php if(!empty($error)): ?>
        <div class="alert alert-danger"><?php echo $error; ?></div>
    <?php endif; ?>
    
    <?php if(!empty($message)): ?>
        <div class="alert alert-success"><?php echo $message; ?></div>
    <?php endif; ?>
    
    <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
        <div class="form-group">
            <label for="house_address">Select House:</label>
            <select class="form-control" id="house_address" name="house_address" required>
                <option value="" disabled <?php echo empty($house_address) ? 'selected' : ''; ?>>Select a house to review</option>
                <?php foreach ($houses as $house): ?>
                    <option value="<?php echo htmlspecialchars($house); ?>" <?php echo ($house_address == $house) ? 'selected' : ''; ?>>
                        <?php echo htmlspecialchars($house); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <div class="form-group">
            <label>Rating:</label>
            <div class="rating-selection">
                <?php
                // Rating options including half stars
                $rating_options = [
                    '0' => '0 stars', 
                    '0.5' => '0.5 stars', 
                    '1' => '1 star', 
                    '1.5' => '1.5 stars', 
                    '2' => '2 stars', 
                    '2.5' => '2.5 stars', 
                    '3' => '3 stars', 
                    '3.5' => '3.5 stars', 
                    '4' => '4 stars', 
                    '4.5' => '4.5 stars', 
                    '5' => '5 stars'
                ];
                
                foreach ($rating_options as $value => $label): 
                    $radio_id = 'rating-' . str_replace('.', '_', $value);
                ?>
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" name="rating" 
                               id="<?php echo $radio_id; ?>" value="<?php echo $value; ?>"
                               <?php echo ($rating == $value) ? 'checked' : ''; ?>>
                        <label class="form-check-label" for="<?php echo $radio_id; ?>">
                            <?php echo $label; ?>
                        </label>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        
        <div class="form-group">
            <label for="review_text">Your Review (Optional):</label>
            <textarea class="form-control" id="review_text" name="review_text" rows="5" 
                      maxlength="1000" placeholder="Share details of your experience at this house (max 1000 characters)"><?php echo htmlspecialchars($review_text); ?></textarea>
            <small class="form-text text-muted">
                <span id="char-count">0</span>/1000 characters
            </small>
        </div>
        
        <div class="form-group form-check">
            <input type="checkbox" class="form-check-input" id="is_resident" name="is_resident" <?php echo $is_resident ? 'checked' : ''; ?>>
            <label class="form-check-label" for="is_resident">I lived/currently live in this house</label>
        </div>
        
        <div class="form-group">
            <button type="submit" class="btn btn-primary">Submit Review</button>
        </div>
    </form>
</div>

<script>
    // Character counter for review text
    document.getElementById('review_text').addEventListener('input', function() {
        var charCount = this.value.length;
        document.getElementById('char-count').textContent = charCount;
        
        if (charCount >= 950) {
            document.getElementById('char-count').style.color = 'red';
        } else {
            document.getElementById('char-count').style.color = '';
        }
    });
    
    // Initialize counter on page load
    window.onload = function() {
        document.getElementById('char-count').textContent = document.getElementById('review_text').value.length;
    };
</script>

<?php include "includes/footer.php"; ?>