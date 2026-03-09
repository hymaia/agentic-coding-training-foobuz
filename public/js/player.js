(() => {
    const app = document.querySelector('.app-shell');
    if (!app) {
        return;
    }

    const apiUrl = app.dataset.apiPlaylistsUrl;
    const tabsContainer = document.getElementById('playlist-tabs');
    const cover = document.getElementById('cover');
    const playlistName = document.getElementById('playlist-name');
    const trackTitle = document.getElementById('track-title');
    const trackArtist = document.getElementById('track-artist');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const seekbar = document.getElementById('seekbar');
    const playToggle = document.getElementById('play-toggle');
    const playIcon = document.getElementById('play-icon');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const statusEl = document.getElementById('status');
    const audio = document.getElementById('audio');

    let playlists = [];
    let playlistIndex = 0;
    let trackIndex = 0;

    const formatTime = (seconds) => {
        if (!Number.isFinite(seconds) || seconds < 0) {
            return '0:00';
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const currentPlaylist = () => playlists[playlistIndex] || null;
    const currentTrack = () => {
        const playlist = currentPlaylist();
        if (!playlist || !Array.isArray(playlist.tracks)) {
            return null;
        }

        return playlist.tracks[trackIndex] || null;
    };

    const syncPlayButton = () => {
        if (!playIcon) {
            return;
        }

        playIcon.src = audio.paused ? '/images/icons/play.svg' : '/images/icons/pause.svg';
    };

    const renderTabs = () => {
        tabsContainer.innerHTML = '';

        playlists.forEach((playlist, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'playlist-tab';
            button.role = 'tab';
            button.setAttribute('aria-selected', String(index === playlistIndex));
            button.textContent = playlist.name;

            button.addEventListener('click', () => {
                playlistIndex = index;
                trackIndex = 0;
                renderTabs();
                loadTrack(false);
            });

            tabsContainer.appendChild(button);
        });
    };

    const updateMeta = () => {
        const playlist = currentPlaylist();
        const track = currentTrack();

        if (!playlist || !track) {
            playlistName.textContent = 'Playlist';
            trackTitle.textContent = 'No track available';
            trackArtist.textContent = '-';
            cover.removeAttribute('src');
            cover.alt = 'No cover available';
            return;
        }

        playlistName.textContent = playlist.name;
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        cover.src = track.cover || playlist.cover;
        cover.alt = `${track.title} cover`;
    };

    const loadTrack = (autoplay) => {
        const track = currentTrack();
        updateMeta();

        if (!track) {
            audio.removeAttribute('src');
            audio.load();
            syncPlayButton();
            return;
        }

        audio.src = track.audioUrl;
        audio.load();
        seekbar.value = '0';
        currentTimeEl.textContent = '0:00';
        durationEl.textContent = '0:00';
        statusEl.textContent = `Loaded: ${track.title}`;

        if (autoplay) {
            void audio.play().catch(() => {
                statusEl.textContent = 'Press play to start audio';
            });
        }

        syncPlayButton();
    };

    const skip = (direction) => {
        const playlist = currentPlaylist();
        if (!playlist || !Array.isArray(playlist.tracks) || playlist.tracks.length === 0) {
            return;
        }

        const lastIndex = playlist.tracks.length - 1;
        trackIndex = direction > 0 ? Math.min(trackIndex + 1, lastIndex) : Math.max(trackIndex - 1, 0);
        loadTrack(!audio.paused);
    };

    const restartCurrentTrack = async () => {
        audio.currentTime = 0;
        seekbar.value = '0';
        currentTimeEl.textContent = '0:00';

        try {
            await audio.play();
            statusEl.textContent = 'Restarted track';
        } catch {
            statusEl.textContent = 'Press play to start audio';
        }
    };

    playToggle.addEventListener('click', async () => {
        if (!audio.src) {
            loadTrack(false);
        }

        if (audio.paused) {
            try {
                await audio.play();
                statusEl.textContent = 'Playing';
            } catch {
                statusEl.textContent = 'Playback blocked. Interact and try again.';
            }
        } else {
            audio.pause();
            statusEl.textContent = 'Paused';
        }

        syncPlayButton();
    });

    prevBtn.addEventListener('click', () => {
        if (audio.currentTime > 3) {
            void restartCurrentTrack();
            return;
        }

        skip(-1);
    });
    nextBtn.addEventListener('click', () => skip(1));

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        currentTimeEl.textContent = formatTime(audio.currentTime);

        if (Number.isFinite(audio.duration) && audio.duration > 0) {
            seekbar.value = String(Math.round((audio.currentTime / audio.duration) * 100));
        }
    });

    audio.addEventListener('play', syncPlayButton);
    audio.addEventListener('pause', syncPlayButton);

    audio.addEventListener('ended', () => {
        skip(1);
    });

    seekbar.addEventListener('input', () => {
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
            return;
        }

        audio.currentTime = (Number(seekbar.value) / 100) * audio.duration;
    });

    fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error('playlist-api-failed');
            }

            return response.json();
        })
        .then((payload) => {
            playlists = Array.isArray(payload.playlists) ? payload.playlists : [];

            if (playlists.length === 0) {
                throw new Error('no-playlists');
            }

            playlistIndex = 0;
            trackIndex = 0;
            renderTabs();
            loadTrack(false);
        })
        .catch(() => {
            statusEl.textContent = 'Unable to load playlists';
            trackTitle.textContent = 'API unavailable';
            trackArtist.textContent = '-';
        });
})();
