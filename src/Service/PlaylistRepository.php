<?php

namespace App\Service;

use App\Exception\PlaylistDataException;

final class PlaylistRepository
{
    public function __construct(private readonly string $playlistDataPath)
    {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        $payload = $this->load();

        if (!isset($payload['playlists']) || !is_array($payload['playlists'])) {
            throw new PlaylistDataException('Playlists payload is missing a playlists array.');
        }

        /** @var array<int, array<string, mixed>> $playlists */
        $playlists = $payload['playlists'];

        return $playlists;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function find(string $id): ?array
    {
        foreach ($this->all() as $playlist) {
            if (($playlist['id'] ?? null) === $id) {
                return $playlist;
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function load(): array
    {
        if (!is_file($this->playlistDataPath)) {
            throw new PlaylistDataException('Playlist data file was not found.');
        }

        $json = file_get_contents($this->playlistDataPath);
        if ($json === false) {
            throw new PlaylistDataException('Playlist data file could not be read.');
        }

        try {
            $decoded = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new PlaylistDataException('Playlist data is not valid JSON.', 0, $exception);
        }

        if (!is_array($decoded)) {
            throw new PlaylistDataException('Playlist data should decode to an object.');
        }

        return $decoded;
    }
}
