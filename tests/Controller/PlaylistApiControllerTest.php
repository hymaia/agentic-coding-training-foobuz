<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class PlaylistApiControllerTest extends WebTestCase
{
    public function testListReturnsPlaylists(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/playlists');

        self::assertResponseIsSuccessful();
        self::assertNotEmpty($client->getResponse()->getContent());

        $payload = json_decode($client->getResponse()->getContent() ?: '', true);
        self::assertIsArray($payload);
        self::assertArrayHasKey('playlists', $payload);
        self::assertIsArray($payload['playlists']);
    }

    public function testDetailReturnsPlaylist(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/playlists/night-drive');

        self::assertResponseIsSuccessful();
        self::assertNotEmpty($client->getResponse()->getContent());
    }

}
