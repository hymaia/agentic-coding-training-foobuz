PRAGMA foreign_keys = ON;

CREATE TABLE playlists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    cover TEXT NOT NULL,
    sort_order INTEGER NOT NULL
);

CREATE TABLE tracks (
    id TEXT PRIMARY KEY,
    playlist_id TEXT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    cover TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
);

CREATE INDEX idx_tracks_playlist_sort ON tracks (playlist_id, sort_order);
