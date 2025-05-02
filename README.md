# wesshacks
COMP333 Wesleyan housing forum

A website created by Olivia Bordon, Ford McDill, Chase Yahn-Krafft, and Tess Lepeska-True

The code provided in this repo is the front-end and back-end code for WesShacks, a website and mobile app where users, students at Wesleyan University, can rate the woodframe houses on campus.

##### AI Assistance Disclaimer:

Parts of this project were developed with assistance from Claude, an AI assistant by Anthropic, and ChatGPT, an AI chatbot by OpenAI. Claude and ChatGPT were used to help with code generation and debugging. All AI-assisted contributions were reviewed and validated to ensure they meet the requirements of the assignment.

## Final Project

For our final project, we decided to implement a variety of small - medium features to enhance our app. We added a search bar with the ability to filter results so that users can find the houses that fit the criteria they are looking for more easily. We also added the ability for users to save the houses they are interested in living in. This new save feature is very important because the primary purpose of our app is to make it easy for Wesleyan students to find the house they want to live in and repeatedly being able to look at potential houses is essential to this process. Additionally, we added a forum where users who are looking for housemates can post. Lastly, we added a navigation bar so users can seamlessly switch between browsing houses, the housing group forum, and their profile, where they can view the houses they've saved.

In summary, here are the new features we implemented: 
1. Search bar with filters
2. Ability to save houses
3. Housing group forum
4. Navigation bar

Set up instructions: use the same set up instructions as for HW03

We are using two late days for the final project. 

### Problem 1 Setup

For setting up the tests, you need to navigate into ./wesshacks/test-project. Then, run the command "./vendor/bin/phpunit PHPtests.php" This will run the PHP tests found in PHPtests.php, of which there are 4.

One thing to note is that we do not have a get_userlist test and instead replaced that with a get_houseslist test. This is because our user list is private, and if it is accessed, it will raise an exception. However, the house list is public, and therefore is able to be accessed by anyone. Thus, we just replaced the get_UserList test with a get_HousesList test.

### Problem 2

We have actually used generative AI for a lot of this process and have created much of WesShacks by using Claude.ai and ChatGPT. This is included in the testing. For me personally, I mostly used AI to help with errors that kept arising in the testing process. I wrote a basic test, but then when I sent along the users.php file, it learned what parts were incorrect in my tests and gave me help fixing it. One example of this is the formatting of the user creation. I was not sure how to format the user information, but artificial intelligence gave me the structure of the data that I should add. In the code shown below, I used AI to add the "form_params" section. 

$response = $this->client->request('POST', 'api/users.php/list', [
        'form_params' => [
            'action' => 'register',
            'username' => 'test3',
            'password' => 'TestPassword1',
            'email' => 'test3@wesleyan.edu'
        ]
    ]);

This saved me a lot of time looking through the file users.php because I am less knowledgeable about the structure of that code because it was written by another member of the group. I think that ChatGPT and other AI models are excellent at parsing large amounts of code. For example, it would have taken me a long time to realize that I had to add a parameter for the action the user wants to do. However, after I provided ChatGPT with the users.php file, it found that and told me to add it to the form_params data. AI is very helpful in web development, and this is just one example of how our group has used it.

## Homework 3

##### Team breakdown for HW03

Each team member contributed to HW03 equally. We used two late dates on this assignment.

### Set up instruction for Homework #3

###### Set up instructions for local XAMPP enviornment:

1. Clone this repo into XAMPP/htdocs
2. Start up the Apache server and mySQL data base
3. In a browser naviagate to phpMyadmin and go to import tab.
4. Upload and import the create_db.sql file (drop app_db database if it already exits on your machine)

###### Instructions for viewing app using Android Studio (assuming user already has Android Studio set up)

1. Open Android Studio -> Virtual Device Manager -> start device Pixel 6A, Android API 34
2. cd into mobile_app
3. In the terminal run the following commands:
4. npm install
5. npm install @react-native-async-storage/async-storage@1.23.1
6. npm install @react-native-picker/picker@2.9.0
7. npm install @react-navigation/bottom-tabs
8. npm install @react-navigation/native @react-navigation/stack
9. npm install react-native-safe-area-context@4.12.0
10. npm install @expo/vector-icons
11. npm install react-native-screens@4.4.0
12. npm run android
13. There is no need to edit any of the code to include your personal IP address


#### Ford's Postman Interface:

<img width="1244" alt="Screenshot 2025-04-09 at 3 39 09 PM" src="https://github.com/user-attachments/assets/7cfded0a-94a2-40a0-8a2d-56fbd5621314" />
<img width="1244" alt="Screenshot 2025-04-09 at 3 38 56 PM" src="https://github.com/user-attachments/assets/49ace30d-e6d3-4223-8989-8208beaee3ae" />

#### Tess's Postman Interface:
<img width="1256" alt="Screenshot 2025-04-09 at 4 00 58 PM" src="https://github.com/user-attachments/assets/3b106f3b-bac1-49c3-a0c4-2a33afb09b8e" />
<img width="1219" alt="Screenshot 2025-04-09 at 4 02 20 PM" src="https://github.com/user-attachments/assets/e4e33c4f-524d-47b9-9a93-320a6263acdf" />

#### Olivia's Postman Interface:
<img width="1466" alt="Olivia Postman 1" src="https://github.com/user-attachments/assets/5e47078f-b700-4292-9d1f-87f05ee16268" />
<img width="1468" alt="Olivia Postman 2" src="https://github.com/user-attachments/assets/ec4cdc45-c40e-4b99-9a7e-b45992662f1f" />

#### Chase's Postman Interface:
<img width="1392" alt="Screenshot 2025-04-10 at 8 47 32 PM" src="https://github.com/user-attachments/assets/ac6fdd04-7b57-4d27-9dd5-90eb8471e923" />
<img width="1392" alt="Screenshot 2025-04-10 at 8 48 13 PM" src="https://github.com/user-attachments/assets/5d3ff0b1-37f8-4d89-ad92-9e2798b50fe1" />


## Homework 2

The code provided in this repo is the front-end and back-end code for WesShacks, a website where users, students at Wesleyan University, can rate the woodframe houses on campus. Our website has five main parts so far: our landing page (Home), which discusses our mission and gives a background to the site, our explore page (Explore Wesleyan Houses), where people can search for houses matching certain criteria and read reviews written by their peers, our about us page (About Us), our review submission page (Submit a Review), where people can submit a review and rating of a house, and our Log in page (Log in) where users can log in (users must be logged in to submit a review/rating). 

AN IMPORTANT NOTE: This project is still being developed, so not all features are fully implemented.

Set up instructions for local XAMPP enviornment:
1. Clone this repo into XAMPP/htdocs
2. Start up the Apache server and mySQL data base
3. In a browser naviagate to phpMyadmin and go to import tab.
4. Upload and import the create_db.sql file (drop app_db database if it already exits on your machine)
5. Then navigate to localhost/wesshacks in a browser of your choice

To access our site on the web, go to http://wesshacks.free.nf/

As for team breakdown, we all contributed equally to this project for Homework #1 and Homework #2.

## Screenshot of our table structures: 

#### Houses: 
<img width="1230" alt="Screenshot 2025-03-06 at 10 57 43 PM" src="https://github.com/user-attachments/assets/79ece79f-1883-4573-bf16-d48931deeaf8" />

#### Reviews/ratings:
<img width="1230" alt="Screenshot 2025-03-06 at 10 58 23 PM" src="https://github.com/user-attachments/assets/9150c4f9-2c64-4e76-a38b-51be310fbca0" />

#### Users: 
<img width="1231" alt="Screenshot 2025-03-06 at 10 58 57 PM" src="https://github.com/user-attachments/assets/8377014e-2dfe-42b4-8a35-f965e5ac4643" />

## phpMyAdmin Screenshots

#### Chase's phpMyAdmin Interface:
<img width="1440" alt="phpMyAdminChase" src="https://github.com/user-attachments/assets/d39761cf-6501-4363-a024-acf204af7edd" />

#### Ford's phpMyAdmin Interface:
<img width="1437" alt="Screenshot 2025-03-06 at 5 41 08 PM" src="https://github.com/user-attachments/assets/71685ce4-a5cd-4d9f-a05f-c861a1521dbe" />

#### Olivia's phpMyAdmin Interface:
<img width="1470" alt="Screenshot 2025-03-06 at 10 44 17 PM" src="https://github.com/user-attachments/assets/3fb3e9b8-9ab2-4cc8-a2a3-c9fdb42d8968" />

#### Tess's phpMyAdmin Interface:
<img width="1332" alt="Screenshot 2025-03-07 at 12 20 03 AM" src="https://github.com/user-attachments/assets/8ce6a0dc-9d80-4e54-8603-ab0095d33980" />




