<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['username'])) {
    header("Location: login.php"); // Redirect to login if the user is not logged in
    exit();
}

$review_id = isset($_GET['review_id']) ? $_GET['review_id'] : null;
if (!$review_id) {
    header("Location: explorehouses.php"); // Redirect if no review ID is provided
    exit();
}

// Fetch the review to edit
$sql = "SELECT * FROM house_reviews WHERE review_id = ? AND username = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "is", $review_id, $_SESSION['username']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$review = mysqli_fetch_assoc($result);

if (!$review) {
    // Redirect if the review doesn't belong to the logged-in user
    header("Location: explorehouses.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update the review
    $rating = $_POST['rating'];
    $review_text = $_POST['review_text'];

    $update_sql = "UPDATE house_reviews SET rating = ?, review_text = ? WHERE review_id = ?";
    $update_stmt = mysqli_prepare($conn, $update_sql);
    mysqli_stmt_bind_param($update_stmt, "dsi", $rating, $review_text, $review_id);
    mysqli_stmt_execute($update_stmt);

    // Redirect after update
    header("Location: explorehouses.php");
    exit();
}
?>
<form method="POST">
    <div class="form-group">
        <label for="rating">Rating</label>
        <select name="rating" id="rating" class="form-control" required>
            <option value="0" <?php if ($review['rating'] == 0) echo 'selected'; ?>>0</option>
            <option value="0.5" <?php if ($review['rating'] == 0.5) echo 'selected'; ?>>0.5</option>
            <option value="1" <?php if ($review['rating'] == 1) echo 'selected'; ?>>1</option>
            <option value="1.5" <?php if ($review['rating'] == 1.5) echo 'selected'; ?>>1.5</option>
            <option value="2" <?php if ($review['rating'] == 2) echo 'selected'; ?>>2</option>
            <option value="2.5" <?php if ($review['rating'] == 2.5) echo 'selected'; ?>>2.5</option>
            <option value="3" <?php if ($review['rating'] == 3) echo 'selected'; ?>>3</option>
            <option value="3.5" <?php if ($review['rating'] == 3.5) echo 'selected'; ?>>3.5</option>
            <option value="4" <?php if ($review['rating'] == 4) echo 'selected'; ?>>4</option>
            <option value="4.5" <?php if ($review['rating'] == 4.5) echo 'selected'; ?>>4.5</option>
            <option value="5" <?php if ($review['rating'] == 5) echo 'selected'; ?>>5</option>
        </select>
    </div>
    <div class="form-group">
        <label for="review_text">Review</label>
        <textarea name="review_text" id="review_text" class="form-control" rows="5" required><?php echo htmlspecialchars($review['review_text']); ?></textarea>
    </div>
    <button type="submit" class="btn btn-primary">Save Changes</button>
</form>
