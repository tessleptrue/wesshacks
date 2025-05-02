<?php

class StackTest extends PHPUnit\Framework\TestCase
{
   protected $client;

   protected function setUp() : void{
      parent::setUp();
      $this->client = new GuzzleHttp\Client(["base_uri" => "https://sebastianzimmeck.de"]);
   }

   public function testPost_NewSong() {
      $response = $this->client->request('GET', 'teaching/comp333/test-api.json');
      $this->assertEquals(200, $response->getStatusCode());
   }

   public function tearDown() : void{
      parent::tearDown();
      $this->client = null;
   }
}
?>