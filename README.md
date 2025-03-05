# wesshacks
COMP333 Wesleyan housing forum

A website created by Olivia Bordon, Ford McDill, Chase Yahn-Krafft, and Tess Lepeska-True

The code provided in this repo is the front-end code for WesShacks, a website where people can rate their woodframe houses on campus and evaluate others as well. The code is relatively straightforward; we have 4 html files and 1 css file, all of which make up the framework of our site. The code can be run locally in a browser, but also can be acccessed at https://tessleptrue.github.io/wesshacks/index.html.

Our website has four main parts so far: our landing page, which discusses our mission and gives a background to the site, our explore page, where people can search for houses matching certain criteria, our about us page, and our review submission page, where people can submit a review of a house. AN IMPORTANT NOTE is that this project is only the front-end of WesShacks. In the explore and review pages, the forms do not actually get submitted. We will be adding that in a future release.

As for team breakdown, we all contributed equally to this project.

SQL Queries

Create login table

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE houses (
    street_address VARCHAR(255) PRIMARY KEY,
    url VARCHAR(255),
    capacity ENUM('2', '3', '4', '5', '6') NOT NULL,
    is_quiet BOOLEAN GENERATED ALWAYS AS (
        CASE 
            WHEN 
                street_address LIKE '%Brainerd Ave%' OR
                street_address LIKE '%Fairview Ave%' OR
                street_address LIKE '%High St%' OR
                street_address LIKE '%Home Ave%' OR
                street_address LIKE '%Huber Ave%' OR
                street_address LIKE '%Knowles Ave%' OR
                street_address LIKE '%Lawn Ave%' OR
                street_address LIKE '%Williams St%'
            THEN TRUE
            ELSE FALSE
        END
    ) STORED,
    bathrooms ENUM('1', '1.5','2' ,'2.5') NOT NULL
);

CREATE TABLE house_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    house_address VARCHAR(255) NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5 AND rating*10 = FLOOR(rating*10)),
    review_text VARCHAR(500),
    username VARCHAR(50) NOT NULL,
    is_resident BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (house_address) REFERENCES houses(street_address) ON DELETE CASCADE,
    CONSTRAINT valid_rating CHECK (rating IN (0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5))
);
