<?php

namespace App\Tests\Service;

use App\Exception\PlaylistDataException;
use App\Service\PlaylistRepository;
use PHPUnit\Framework\TestCase;

final class PlaylistRepositoryTest extends TestCase
{
    public function testAllReturnsPlaylistsFromSqliteDatabase(): void
    {
        $path = sys_get_temp_dir().'/foobuz-test-'.uniqid('', true).'.sqlite';
        $connection = new \PDO('sqlite:'.$path);
        $connection->exec('CREATE TABLE playlists (id TEXT PRIMARY KEY, name TEXT, description TEXT, cover TEXT, sort_order INTEGER)');
        $connection->exec('CREATE TABLE tracks (id TEXT PRIMARY KEY, playlist_id TEXT, title TEXT, artist TEXT, audio_url TEXT, cover TEXT, sort_order INTEGER)');
        $connection->exec("INSERT INTO playlists VALUES ('playlist-1', 'Playlist 1', 'Description', '/cover.jpg', 1)");
        $connection->exec("INSERT INTO tracks VALUES ('track-1', 'playlist-1', 'Track 1', 'Artist 1', '/track.ogg', '/cover.jpg', 1)");

        $repository = new PlaylistRepository($path);
        $playlists = $repository->all();

        self::assertCount(1, $playlists);
        self::assertSame('playlist-1', $playlists[0]['id']);
        self::assertSame('/track.ogg', $playlists[0]['tracks'][0]['audioUrl']);
        @unlink($path);
    }

    public function testMissingDatabaseRaisesControlledException(): void
    {
        $path = sys_get_temp_dir().'/missing-foobuz.sqlite';
        @unlink($path);

        $repository = new PlaylistRepository($path);

        $this->expectException(PlaylistDataException::class);
        $repository->all();
    }
}
