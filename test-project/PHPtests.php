<?php

class PHPtests extends PHPUnit\Framework\TestCase
{
   protected $client;

   protected function setUp() : void{
      parent::setUp();
      $this->client = new GuzzleHttp\Client(["base_uri" => "http://localhost/wesshacks/"]);
   }

   #This is our test to get a public list (houses list). We are using the list of houses because we created our site so that people
    #do not have access to the list of users. Therefore, we should expect a 401 unauthorized http code from the user list. However,
    #this list is public, and should return a 200 status code.
   public function testGet_HousesList() {
    $response = $this->client->request('GET', 'api/houses.php/list');
    $this->assertEquals(200, $response->getStatusCode());
    }

   #This code creates a user "test3." Note that if there is already a user named "test3" in the database, this will raise an exception,
   #And you will have to delete that user in order to get no errors.
   public function testPost_CreateUser() {
    $response = $this->client->request('POST', 'api/users.php/list', [
        'form_params' => [
            'action' => 'register',
            'username' => 'test3',
            'password' => 'TestPassword1',
            'email' => 'test3@wesleyan.edu'
        ]
    ]);
    $this->assertEquals(201, $response->getStatusCode());
    }

    public function testPost_LoginUser() {
        $response = $this->client->request('POST', 'api/users.php', [
            'form_params' => [
                'action' => 'login',
                'username' => 'test3',
                'password' => 'TestPassword1',
            ]
        ]);
        $this->assertEquals(201, $response->getStatusCode());
    }

    public function testPost_FailedLogin() {
        $response = $this->client->request('POST', 'api/users.php', [
            'form_params' => [
                'action' => 'login',
                'username' => 'test3',
                'password' => 'IncorrectPassword',
            ]
        ]);
        $this->assertEquals(201, $response->getStatusCode());
        }

   public function tearDown() : void{
      parent::tearDown();
      $this->client = null;
   }
}
?>