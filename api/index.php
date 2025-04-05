<?php
// API index/documentation page
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Return API documentation
echo json_encode([
    'name' => 'WesShacks API',
    'version' => '1.0.0',
    'description' => 'REST API for Wesleyan University housing reviews',
    'endpoints' => [
        [
            'path' => '/api/houses.php',
            'methods' => ['GET'],
            'description' => 'Get house listings',
            'params' => [
                'capacity' => 'Filter by house capacity (2-6)',
                'noise' => 'Filter by noise level (quiet|loud)',
                'search' => 'Search term for street address',
                'id' => 'Get a specific house by address'
            ]
        ],
        [
            'path' => '/api/reviews.php',
            'methods' => ['GET', 'POST', 'DELETE'],
            'description' => 'Manage house reviews',
            'params' => [
                'GET' => [
                    'house' => 'Get reviews for a specific house',
                    'id' => 'Get a specific review by ID',
                    'limit' => 'Limit the number of reviews returned'
                ],
                'POST' => [
                    'house_address' => 'House address (required)',
                    'rating' => 'Rating value 0-5 (required)',
                    'review_text' => 'Review text (optional)',
                    'is_resident' => 'Whether the reviewer is a resident (optional)'
                ],
                'DELETE' => [
                    'id' => 'ID of the review to delete'
                ]
            ],
            'authentication' => 'Required for POST and DELETE'
        ],
        [
            'path' => '/api/users.php',
            'methods' => ['GET', 'POST'],
            'description' => 'User authentication and management',
            'params' => [
                'GET' => [
                    'Get current user info (authentication required)'
                ],
                'POST' => [
                    'action' => 'Action to perform (login|register|logout)',
                    'username' => 'Username (required for login/register)',
                    'password' => 'Password (required for login/register)',
                    'email' => 'Email (required for register)'
                ]
            ]
        ]
    ],
    'authentication' => [
        'type' => 'Bearer Token',
        'header' => 'Authorization: Bearer {token}',
        'obtain' => 'POST to /api/users.php with action=login'
    ]
]);
?>