<?php
// Start the session at the very beginning
session_start();

// Include configuration and header files
require_once 'config.php';

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}

// Initialize variables
$street_address = "";
$url = "";
$capacity = "";
$message = "";
$error = "";

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $street_address = trim($_POST["street_address"]);
    $url = trim($_POST["url"]);
    $capacity = $_POST["capacity"];
    $created_by = $_SESSION['username'];
    
    // Validate inputs
    if (empty($street_address)) {
        $error = "Street address is required";
    } else {
        // Using mysqli instead of PDO to be consistent with register.php
        
        // Prepare an insert statement
        $sql = "INSERT INTO houses (street_address, url, capacity, created_by) VALUES (?, ?, ?, ?)";
        
        if($stmt = mysqli_prepare($conn, $sql)){
            // Bind variables to the prepared statement as parameters
            mysqli_stmt_bind_param($stmt, "ssss", $street_address, $url, $capacity, $created_by);
            
            // Attempt to execute the prepared statement
            if(mysqli_stmt_execute($stmt)){
                $message = "House added successfully!";
                $street_address = "";
                $url = "";
                $capacity = "";
            } else {
                // Check for duplicate entry - error code 1062 in mysqli
                if (mysqli_errno($conn) == 1062) {
                    $error = "This street address already exists in the database.";
                } else {
                    $error = "Database error: " . mysqli_error($conn);
                }
            }
            
            // Close statement
            mysqli_stmt_close($stmt);
        } else {
            $error = "Error preparing statement: " . mysqli_error($conn);
        }
    }
}

// Determine if a street would be quiet
function isQuietStreet($address) {
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
    
    foreach ($quietStreets as $street) {
        if (stripos($address, $street) !== false) {
            return true;
        }
    }
    return false;
}
?>

<!-- Main content starts here, assuming header.php has opened HTML, head, body tags -->
<?php include "includes/header.php"; ?>
<link rel="stylesheet" href="style.css" />

<div class="container">
    <h1>Add New House</h1>
    
    <?php if(!empty($error)): ?>
        <div class="alert alert-danger"><?php echo $error; ?></div>
    <?php endif; ?>
    
    <?php if(!empty($message)): ?>
        <div class="alert alert-success"><?php echo $message; ?></div>
    <?php endif; ?>
    
    <form method="POST" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
        <div class="form-group">
            <label for="street_address">Street Address:</label>
            <input type="text" class="form-control" id="street_address" name="street_address" value="<?php echo htmlspecialchars($street_address); ?>" required>
        </div>
        
        <div class="form-group">
            <label for="url">URL:</label>
            <input type="url" class="form-control" id="url" name="url" value="<?php echo htmlspecialchars($url); ?>" placeholder="https://example.com">
        </div>
        
        <div class="form-group">
            <label for="capacity">Capacity:</label>
            <select class="form-control" id="capacity" name="capacity" required>
                <option value="" disabled <?php echo empty($capacity) ? 'selected' : ''; ?>>Select capacity</option>
                <?php for($i = 2; $i <= 6; $i++): ?>
                    <option value="<?php echo $i; ?>" <?php echo ($capacity == $i) ? 'selected' : ''; ?>><?php echo $i; ?> people</option>
                <?php endfor; ?>
            </select>
        </div>
        
        <div id="quietStatus" class="alert alert-info" style="display: none;">
            This address is on a <span id="streetType">quiet</span> street.
        </div>
        
        <div class="form-group">
            <button type="submit" class="btn btn-primary">Add House</button>
        </div>
    </form>
</div>

<script>
    // JavaScript to check if the address is on a quiet street
    document.getElementById('street_address').addEventListener('input', function() {
        const address = this.value;
        const quietStreets = [
            'Brainerd Ave',
            'Fairview Ave',
            'High St',
            'Home Ave',
            'Huber Ave',
            'Knowles Ave',
            'Lawn Ave',
            'Williams St'
        ];
        
        let isQuiet = false;
        for (let street of quietStreets) {
            if (address.toLowerCase().includes(street.toLowerCase())) {
                isQuiet = true;
                break;
            }
        }
        
        const statusDiv = document.getElementById('quietStatus');
        const streetTypeSpan = document.getElementById('streetType');
        
        if (address.trim() !== '') {
            statusDiv.style.display = 'block';
            if (isQuiet) {
                streetTypeSpan.textContent = 'quiet';
                statusDiv.className = 'alert alert-info';
            } else {
                streetTypeSpan.textContent = 'loud';
                statusDiv.className = 'alert alert-warning';
            }
        } else {
            statusDiv.style.display = 'none';
        }
    });
</script>

<?php include "includes/footer.php"; ?>