<?php
// Initialize the session
session_start();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Login System</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        .user-info {
            text-align: right;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="user-info">
                <?php if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true): ?>
                    <span id="currentUser">Welcome, <?php echo htmlspecialchars($_SESSION["username"]); ?></span>
                    <a href="logout.php" class="btn">Logout</a>
                <?php else: ?>
                    <span id="currentUser">Not logged in</span>
                    <a href="login.php" class="btn">Login</a>
                <?php endif; ?>
            </div>
        </div>
    </header>
    <h1>WesShacks: Coming Soon...</h1>
    <div id="flex-container">
      <a class="active" href="index.php">Home</a>
      <a href="explorehouses.php">Explore Wesleyan Houses</a>
      <a href="about_us.php">Meet the Team</a>
      <a href="reviews.php">Submit a Review</a>
      <a href="login.php">Log in</a>
    </div>
    <main>
        <div class="container">