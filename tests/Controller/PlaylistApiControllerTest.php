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
        self::assertResponseFormatSame('json');

        $payload = json_decode($client->getResponse()->getContent() ?: '', true);
        self::assertIsArray($payload);
        self::assertArrayHasKey('playlists', $payload);
        self::assertNotEmpty($payload['playlists']);
        self::assertArrayHasKey('tracks', $payload['playlists'][0]);
    }

    public function testDetailReturnsPlaylist(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/playlists/night-drive');

        self::assertResponseIsSuccessful();

        $payload = json_decode($client->getResponse()->getContent() ?: '', true);
        self::assertSame('night-drive', $payload['id'] ?? null);
    }

    public function testDetailReturns404ForMissingPlaylist(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/playlists/does-not-exist');

        self::assertResponseStatusCodeSame(404);
    }

    public function testListReturns500WhenDatabaseIsMissing(): void
    {
        $path = dirname(__DIR__, 2).'/data/foobuz.sqlite';
        $backup = dirname(__DIR__, 2).'/data/foobuz.sqlite.bak';
        self::assertTrue(rename($path, $backup));

        try {
            $client = static::createClient();
            $client->request('GET', '/api/playlists');

            self::assertResponseStatusCodeSame(500);
        } finally {
            rename($backup, $path);
        }
    }
}
