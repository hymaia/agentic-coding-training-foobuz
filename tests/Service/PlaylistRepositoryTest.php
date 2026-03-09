<?php

namespace App\Tests\Service;

use App\Exception\PlaylistDataException;
use App\Service\PlaylistRepository;
use PHPUnit\Framework\TestCase;

final class PlaylistRepositoryTest extends TestCase
{
    public function testInvalidJsonRaisesControlledException(): void
    {
        $path = sys_get_temp_dir().'/invalid-playlists.json';
        file_put_contents($path, '{invalid-json');

        $repository = new PlaylistRepository($path);

        $this->expectException(PlaylistDataException::class);
        $repository->all();

        @unlink($path);
    }
}
