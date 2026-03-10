# Foobuz

Minimal Spotify-style playlist player built with Symfony, Twig, plain CSS, and a SQLite-backed API.

## What It Does

- Serves playlists and tracks from SQLite
- Renders a small black-and-white player UI with Twig
- Plays locally hosted openly licensed audio files
- Supports play/pause, previous, next, and seek

## Stack

- PHP 8.5
- Symfony 8
- Twig
- SQLite
- Plain CSS and vanilla JavaScript

## Run It

Install dependencies:

```bash
composer install
```

Start the app:

```bash
symfony serve
```

If Symfony CLI is not available:

```bash
php -S 127.0.0.1:8000 -t public
```

Open:

```text
http://127.0.0.1:8000
```

## Test It

```bash
php bin/phpunit
```

## Data

SQLite lives at [data/foobuz.sqlite](/Users/civetta/Works/Hymaia/foobuz/data/foobuz.sqlite).

Schema and seed files:

- [data/schema.sql](/Users/civetta/Works/Hymaia/foobuz/data/schema.sql)
- [data/seed.sql](/Users/civetta/Works/Hymaia/foobuz/data/seed.sql)

API endpoints:

- `GET /api/playlists`
- `GET /api/playlists/{id}`

## Media

Tracks are stored in `public/media` and sourced from Wikimedia Commons under free public licenses.

Details:

- [MEDIA_LICENSES.md](/Users/civetta/Works/Hymaia/foobuz/MEDIA_LICENSES.md)
