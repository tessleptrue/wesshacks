<?php
// Database configuration
define('DB_SERVER', 'sql204.infinityfree.com');
define('DB_USERNAME', '');     // Replace with your MySQL username
define('DB_PASSWORD', '');         // Replace with your MySQL password
define('DB_NAME', 'if0_38404601_users');

// Connect to MySQL database
$conn = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($conn === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
?>
