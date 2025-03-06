CREATE DATABASE IF NOT EXISTS app_db;
USE app_db;

-- This is our table of usernames along with their hashed passwords and emails. 
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100)  NULL UNIQUE
);

-- This is our table that contains all the houses. It also contains a link to the house's page, the house's capacity, 
-- if it is on a quiet street, and the number of bathrooms in the house 
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

-- This is a table which contains houses as well as the rating, review, who wrote the review, and when the review was written. 
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

-- This just creates our database by adding all the houses to the houses tab. As of right now, this is all the 2 and 3 person 
-- houses along with some others. 
INSERT INTO houses (street_address, url, capacity, bathrooms)
VALUES
("140 Church St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/140%20Church%20Street.htm", 1, 1),
("140 Church St Unit C", "https://www.wesleyan.edu/reslife/housing/woodframe/140%20Church%20Street.htm", 2, 1),
("162 Church St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/162_church.htm", 1, 1),
("162 Church St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/162_church.htm", 1, 1),
("162 Church St Unit C", "https://www.wesleyan.edu/reslife/housing/woodframe/162_church.htm", 3, 1),
("6 Fountain Ave", "https://www.wesleyan.edu/reslife/housing/woodframe/6_fountain.htm", 1, 1),
("69 Fountain Ave Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/69_fountain.htm", 1, 1),
("69 Fountain Ave Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/69_fountain.htm", 1, 1),
("124 High St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/69_fountain.htm", 4, 1),
("124 High St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/69_fountain.htm", 1, 1),
("136 High St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/136_high.htm", 2, 2),
("136 High St Unit C", "https://www.wesleyan.edu/reslife/housing/woodframe/136_high.htm", 1, 1),
("146 High St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/146_high.htm", 2, 1),
("146 High St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/146_high.htm", 3, 1),
("146 High St Unit C", "https://www.wesleyan.edu/reslife/housing/woodframe/146_high.htm", 1, 1),
("214 High St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/214%20High.htm", 1, 1),
("102 Knowles Ave", "https://www.wesleyan.edu/reslife/housing/woodframe/102_knowles.htm", 1, 1),
("118 Knowles Ave", "https://www.wesleyan.edu/reslife/housing/woodframe/118_knowles.htm", 1, 1),
("203 Pine St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/203_pine.htm", 1, 1),
("203 Pine St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/203_pine.htm", 1, 1),
("207 Pine St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/207_pine.htm", 1, 1),
("207 Pine St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/207_pine.htm", 1, 1),
("211 Pine St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/211_pine.htm", 1, 1),
("211 Pine St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/211_pine.htm", 1, 1),
("215 Pine St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/215_pine.htm", 1, 1),
("215 Pine St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/215_pine.htm", 1, 1),
("223 Pine St", "https://www.wesleyan.edu/reslife/housing/woodframe/223_pine.htm", 1, 1),
("261 Pine St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/261_pine.htm", 1,1),
("261 Pine St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/261_pine.htm", 2,1),
("19 Vine St", "https://www.wesleyan.edu/reslife/housing/woodframe/19_Vine.htm", 1, 1),
("255 Williams St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/255%20Williams%20Street.htm", 1, 1),
("148 Church St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/148_Church.htm", 3, 1),
("148 Church St Unit C", "https://www.wesleyan.edu/reslife/housing/woodframe/148_Church.htm", 3, 1),
("148 Church St Unit D", "https://www.wesleyan.edu/reslife/housing/woodframe/148_Church.htm", 2, 1),
("115 Cross St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/115%20Cross%20Street.htm", 2, 1),
("115 Cross St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/115%20Cross%20Street.htm", 4, 1),
("127 Cross St", "https://www.wesleyan.edu/reslife/housing/woodframe/127_cross.htm", 2, 1),
("170 Cross St", "https://www.wesleyan.edu/reslife/housing/woodframe/170_cross.htm", 2, 1),
("10 Fountain Ave Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/10_fountain.htm", 2, 1),
("10 Fountain Ave Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/10_fountain.htm", 2, 1),
("63 Fountain Ave", "https://www.wesleyan.edu/reslife/housing/woodframe/63_fountain.htm", 2, 1),
("126 Knowles Ave Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/126_knowles.htm", 2, 1),
("126 Knowles Ave Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/126_knowles.htm", 2, 1),
("86 Lawn Ave Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/86_lawn.htm", 2, 1),
("86 Lawn Ave Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/86_lawn.htm", 2, 1),
("96 Lawn Ave Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/96_lawn.htm", 2, 1),
("96 Lawn Ave Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/96_lawn.htm", 2, 1),
("239 Pine St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/239_pine.htm", 4, 3),
("239 Pine St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/239_pine.htm", 2, 1),
("251 Pine St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/251_pine.htm", 2, 1),
("251 Pine St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/251_pine.htm", 2, 1),
("21 Vine St", "https://www.wesleyan.edu/reslife/housing/woodframe/21_vine.htm", 2, 1),
("23 Vine St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/23_vine.htm", 2, 1),
("23 Vine St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/23_vine.htm", 2, 1),
("2 Warren St", "https://www.wesleyan.edu/reslife/housing/woodframe/2_warren.htm", 2, 1),
("259 Williams St Unit A", "https://www.wesleyan.edu/reslife/housing/woodframe/259%20Williams%20Street.htm", 4, 1),
("259 Williams St Unit B", "https://www.wesleyan.edu/reslife/housing/woodframe/259%20Williams%20Street.htm", 2, 1);







