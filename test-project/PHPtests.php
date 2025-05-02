<?php

class PHPtests extends PHPUnit\Framework\TestCase
{
   protected $client;

   protected function setUp() : void{
      parent::setUp();
      $this->client = new GuzzleHttp\Client(["base_uri" => "http://localhost/wesshacks/"]);
   }
   
   public function testPost_CreateUser() {
    $response = $this->client->request('POST', 'api/users.php/list', [
        'form_params' => [
            'action' => 'register',
            'username' => 'ford3',
            'password' => 'TestPassword1',
            'email' => 'fmcdill3@wesleyan.edu'
        ]
    ]);
    $this->assertEquals(201, $response->getStatusCode());
    }

    public function testPost_LoginUser() {
        $response = $this->client->request('POST', 'api/users.php', [
            'form_params' => [
                'action' => 'login',
                'username' => 'ford3',
                'password' => 'TestPassword1',
            ]
        ]);
        $this->assertEquals(201, $response->getStatusCode());
    }

    public function testPost_FailedLogin() {
        $response = $this->client->request('POST', 'api/users.php', [
            'form_params' => [
                'action' => 'login',
                'username' => 'ford3',
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