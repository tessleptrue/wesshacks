<!--
    WesShacks
 --> 
<!DOCTYPE html>

<html lang="en">
  <head>
    
    <meta charset="utf-8" />
    <!--
        People may view your site on a desktop or mobile browser. There is even 
        the trend of mobile first. The viewport takes care of this for us.
        The description is a tag for displaying a summary (155-160 characters) 
        describing the content of a web page, e.g., for search engines to show 
        in search results.
    -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="WesShacks is a housing review site for woodframe houses at Wesleyan University in Middletown, CT.">

    <!--
        The title is important for search engine optimization (SEO). It will be 
        visible to people in the tab in which the site is opened. Titles 
        should be unique.
    -->
    <title>WesShacks</title>
    <link rel="stylesheet" href="style.css?v=1.0" /> <!-- this is a temporary fix to the issue of the css not being properly reloaded --> 
  </head>
  <body>
    <?php include "includes/header.php"; ?>
  

  <div class="welcome-container">
    <h1>Welcome to Our Website</h1>
    <p>This is a secure website with user authentication using PHP and MySQL.</p>
    
    <?php if(isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true): ?>
        <div class="user-welcome">
            <p>You are logged in as <strong><?php echo htmlspecialchars($_SESSION["username"]); ?></strong>.</p>
            <a href="dashboard.php" class="btn">Go to Dashboard</a>
        </div>
    <?php else: ?>
        <div class="auth-options">
            <p>Please login or register to access your account.</p>
            <div class="btn-group">
                <a href="login.php" class="btn">Login</a>
                <a href="register.php" class="btn btn-alt">Register</a>
            </div>
        </div>
    <?php endif; ?>
</div>

  <div>
    <p>
      Choosing where to live is an important decision, and although there is some information about the wood frame houses on Wesleyan's website, there isn't a streamlined way for students to hear from their peers about the pros and cons of living in different Wesleyan houses. That's why we created WesShacks, a platform for users to browse, rate, review, and ask and answer questions about wood frame houses at Wesleyan University. 
    </p>
  </div>

    <div class="row">
      <div class = "column" id = "col1">
        <h1 style = "text-align: center;">BROWSE</h1>
        <ul>
          <li>Users can browse a directory of the woodframe houses at Wesleyan University.</li>
          <li>Users can search for houses based on features such as number of bedrooms and street type.</li>
          <li>Users can make informed decisions about where to live by reading the reviews and ratings written by their peers.</li>
        </ul>
      </div>
      <div class = "column" id = "col2">
        <h1 style = "text-align: center;">RATE</h1>
        <ul>
          <li>Users can rate different aspects of the houses on a scale from 1 to 5.</li>
          <li>Aspects include the quality of the house's location, the quality of the bedrooms, and the quality of the common spaces.</li>
          <li>Ratings contribute to the overall house ratings.</li>
        </ul>
      </div>
      <div class = "column" id = "col3">
        <h1 style = "text-align: center;">REVIEW</h1>
        <ul>
          <li>After users create an account, they can write reviews about a house they currently live, a house they used to live in, or a house they have visited for an event.</li>
          <li>Reviews from users who live/lived in the house being reviewed will be tagged as resident reviews.</li>
          <li>Reviews from users who have visited the house being reviewed will be tagged as guest reviews.</li>
        </ul>
      </div>
      <div class = "column" id = "col4">
        <h1 style = "text-align: center;">Q & A</h1>
        <ul>
          <li>Users who are trying to decide what house to live in can post questions about specific houses or specific streets.</li>
          <li>Users who currently live in wooodframe houses can post answers to their questions.</li>
          <li>Users can upvote answers they agree with and downvote answers they disagree with.</li>
      </div>
    </div>
    <h1 style = "text-align: center;">Our Partners</h1>
    <div>
      <ul>
        <li>
          <a href="https://www.wesleyan.edu/reslife/ugrad_housing/index.html" target="_blank">Wesleyan Office of Residential Life</a>
        </li>
        <li>
          <a href="https://www.wesleyan.edu/mathcs/" target="_blank">Wesleyan Department of Mathematics and Computer Science</a>
        </li>
        <li>
          <a href="https://www.extraspace.com/" target="_blank">Extra Space Storage</a>
        </li>
        <li>And more partners coming soon . . .
        </li>
      </ul>
    </div>
    <h1 style = "text-align: center;">Maps Feature</h1>
    <p>We plan to implement a maps feature, where each house has a corresponding iframe that shows its location on <a href="https://www.google.com/maps">Google Maps</a>.</p>
    <p>Here's a sneak peak at the feature:</p>
    <div id="map-container">
      <!-- Show placeholder initially -->
      <div id="map-placeholder">
        <button onclick="loadMap()">Load Google Maps</button>
      </div>
      <!-- Hidden iframe that loads after consent -->
      <iframe 
        id="map-frame" 
        style="display: none"
        src= "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2985.814128323286!2d-72.66026122388756!3d41.55162157127949!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e64a63e6bc7f93%3A0xeef5c4082aa86488!2s49%20Brainerd%20Ave%2C%20Middletown%2C%20CT%2006457!5e0!3m2!1sen!2sus!4v1739839395132!5m2!1sen!2sus" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
    
    <script>
    function loadMap() {
      document.getElementById('map-placeholder').style.display = 'none';
      document.getElementById('map-frame').style.display = 'block';
    }
    </script>
  </body>
</html>

<?php include "includes/footer.php"; ?>
