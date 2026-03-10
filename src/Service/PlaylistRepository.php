<?php

namespace App\Service;

use App\Exception\PlaylistDataException;
use PDO;
use PDOException;

final class PlaylistRepository
{
    public function __construct(private readonly string $playlistDatabasePath)
    {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        $connection = $this->connect();
        $playlistRows = $connection->query(
            'SELECT id, name, description, cover FROM playlists ORDER BY sort_order ASC'
        );

        if ($playlistRows === false) {
            throw new PlaylistDataException('Playlist database query failed.');
        }

        /** @var array<int, array<string, mixed>> $playlists */
        $playlists = $playlistRows->fetchAll(PDO::FETCH_ASSOC);

        foreach ($playlists as &$playlist) {
            $playlist['tracks'] = $this->loadTracks($connection, (string) $playlist['id']);
        }

        return $playlists;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function find(string $id): ?array
    {
        $connection = $this->connect();
        $statement = $connection->prepare(
            'SELECT id, name, description, cover FROM playlists WHERE id = :id LIMIT 1'
        );

        if ($statement === false) {
            throw new PlaylistDataException('Playlist database query failed.');
        }

        $statement->bindValue(':id', $id);

        if (!$statement->execute()) {
            throw new PlaylistDataException('Playlist database query failed.');
        }

        /** @var array<string, mixed>|false $playlist */
        $playlist = $statement->fetch(PDO::FETCH_ASSOC);
        if ($playlist === false) {
            return null;
        }

        $playlist['tracks'] = $this->loadTracks($connection, $id);

        return $playlist;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function loadTracks(PDO $connection, string $playlistId): array
    {
        $statement = $connection->prepare(
            'SELECT id, title, artist, audio_url AS audioUrl, cover
             FROM tracks
             WHERE playlist_id = :playlistId
             ORDER BY sort_order ASC'
        );

        if ($statement === false) {
            throw new PlaylistDataException('Track database query failed.');
        }

        $statement->bindValue(':playlistId', $playlistId);

        if (!$statement->execute()) {
            throw new PlaylistDataException('Track database query failed.');
        }

        try {
            /** @var array<int, array<string, mixed>> $tracks */
            $tracks = $statement->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            throw new PlaylistDataException('Track database query failed.', 0, $exception);
        }

        return $tracks;
    }

    private function connect(): PDO
    {
        if (!is_file($this->playlistDatabasePath)) {
            throw new PlaylistDataException('Playlist database file was not found.');
        }

        try {
            $connection = new PDO('sqlite:'.$this->playlistDatabasePath);
            $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $exception) {
            throw new PlaylistDataException('Playlist database connection failed.', 0, $exception);
        }

        return $connection;
    }
}
