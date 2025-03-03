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
	 <link rel="stylesheet" href="style.css" />
   </head>
<body>
	<?php include "includes/header.php"; ?>
	<h1> Team members: </h1>
	
	<div class="aboutus">
		<h1>Ford</h1>
		<img src="./images/Ford.jpg" alt = "photo of Ford on the roof of Exley" width="50%" height="50%"/>
		<p>Ford is a math and computer science major at Wesleyan and spends his time working on awesome websites and software.</p> 
	</div>
	
	<div class="aboutus">
			<h1>Chase</h1>
			<img src="./images/Chase.jpg" alt = "photo of Chase in the woods" width="50%" height="50%">
			<p>Chase is a computer science major who likes to play video games and ultimate frisbee.</p>
	</div>

	<div class="aboutus">
		<h1>Tess</h1>
		<img src="./images/Tess.jpg" alt = "photo of Tess playing drums" width="50%" height="50%"/>
		<p>Tess is a computer science major at Wesleyan who likes to drum, listen to music, and hang out with her cat Gigi.</p> 
	</div>

	<div class="aboutus">
		<h1>Olivia</h1>
		<img src="./images/Olivia.jpg" alt = "photo of Olivia exploring a Cave" width="50%" height="50%"/>
		<p>Olivia is a computer science and Latin American studies major at Wesleyan who likes to cook, bike, and play ultimate frisbee.</p> 
	</div>
	
	<div class="footer">
		<p>This site was designed and published as part of the COMP 333 Software Engineering class at Wesleyan University. This is an exercise.</p>
	  </div>
</body>