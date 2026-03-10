INSERT INTO playlists (id, name, description, cover, sort_order) VALUES
    ('night-drive', 'Night Drive', 'Cold city loops and late traffic lights.', '/images/cover-night.jpg', 1),
    ('mono-focus', 'Mono Focus', 'Minimal beats for deep concentration.', '/images/cover-focus.jpg', 2);

INSERT INTO tracks (id, playlist_id, title, artist, audio_url, cover, sort_order) VALUES
    ('nd-1', 'night-drive', 'Maple Leaf Rag', 'Scott Joplin', '/media/maple-leaf-rag.ogg', '/images/cover-night.jpg', 1),
    ('nd-2', 'night-drive', 'Euphonic Sounds', 'Scott Joplin', '/media/euphonic-sounds.ogg', '/images/cover-night.jpg', 2),
    ('mf-1', 'mono-focus', 'Fur Elise', 'Ludwig van Beethoven', '/media/fur-elise.ogg', '/images/cover-focus.jpg', 1),
    ('mf-2', 'mono-focus', 'Sarabande Wedding March', 'Cesar Cui', '/media/cui-sar-wedding.ogg', '/images/cover-focus.jpg', 2);
