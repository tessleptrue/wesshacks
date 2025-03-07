<?php
session_start();
require_once 'config.php';

if (!isset($_SESSION['username'])) {
    header("Location: login.php"); // Redirect to login if not logged in
    exit();
}

$review_id = isset($_GET['review_id']) ? $_GET['review_id'] : null;
if (!$review_id) {
    header("Location: explorehouses.php"); // Redirect if no review ID
    exit();
}

// Check if the review belongs to the logged-in user
$sql = "SELECT * FROM house_reviews WHERE review_id = ? AND username = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "is", $review_id, $_SESSION['username']);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$review = mysqli_fetch_assoc($result);

if (!$review) {
    header("Location: explorehouses.php"); // Redirect if the review doesn't belong to the user
    exit();
}

// Delete the review
$delete_sql = "DELETE FROM house_reviews WHERE review_id = ?";
$delete_stmt = mysqli_prepare($conn, $delete_sql);
mysqli_stmt_bind_param($delete_stmt, "i", $review_id);
mysqli_stmt_execute($delete_stmt);

// Redirect back to the explorehouses page
header("Location: explorehouses.php");
exit();
