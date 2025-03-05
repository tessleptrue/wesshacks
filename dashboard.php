<?php
// Initialize the session
session_start();
 
// Check if the user is logged in, if not then redirect to login page
if(!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true){
    header("location: login.php");
    exit;
}

// Include database connection
require_once "config.php";

// Get user information
$user_id = $_SESSION["id"];
$sql = "SELECT username FROM users WHERE user_id = ?";

if($stmt = mysqli_prepare($conn, $sql)){
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    
    if(mysqli_stmt_execute($stmt)){
        mysqli_stmt_store_result($stmt);
        
        if(mysqli_stmt_num_rows($stmt) == 1){
            mysqli_stmt_bind_result($stmt, $username);
            mysqli_stmt_fetch($stmt);
        }
    }
    
    mysqli_stmt_close($stmt);
}
mysqli_close($conn);
?>

<?php include "includes/header.php"; ?>
<link rel="stylesheet" href="style.css" />


<div class="dashboard-container">
    <h2>Welcome to Your Dashboard, <?php echo htmlspecialchars($_SESSION["username"]); ?></h2>
    <div class="user-details">
        <h3>Your Profile Information</h3>
        <p><strong>Username:</strong> <?php echo htmlspecialchars($username); ?></p>
    </div>
    
    <div class="protected-content">
        <h3>Protected Content</h3>
        <p>This is secure content only visible to logged-in users.</p>
        <p>You can add your application-specific content here.</p>
    </div>
</div>

<?php include "includes/footer.php"; ?>