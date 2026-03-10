import $ from 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/+esm';

$(function () {
    var $app = $('.app-shell');

    if ($app.length === 0) {
        return;
    }

    var apiUrl = $app.attr('data-api-playlists-url');
    var $libraryToggle = $('#playlist-library-toggle');
    var $library = $('#playlist-library');
    var $libraryList = $('#playlist-library-list');
    var $player = $('.player');
    var $cover = $('#cover');
    var $playlistName = $('#playlist-name');
    var $trackTitle = $('#track-title');
    var $trackArtist = $('#track-artist');
    var $currentTime = $('#current-time');
    var $duration = $('#duration');
    var $seekbar = $('#seekbar');
    var $playToggle = $('#play-toggle');
    var $playIcon = $('#play-icon');
    var $prev = $('#prev');
    var $next = $('#next');
    var $status = $('#status');
    var audio = $('#audio').get(0);
    var playlists = [];
    var playlistIndex = 0;
    var trackIndex = 0;

    function formatTime(seconds) {
        var mins;
        var secs;

        if (!isFinite(seconds) || seconds < 0) {
            return '0:00';
        }

        mins = Math.floor(seconds / 60);
        secs = Math.floor(seconds % 60);

        if (secs < 10) {
            secs = '0' + secs;
        }

        return mins + ':' + secs;
    }

    function currentPlaylist() {
        return playlists[playlistIndex] || null;
    }

    function currentTrack() {
        var playlist = currentPlaylist();

        if (!playlist || !$.isArray(playlist.tracks)) {
            return null;
        }

        return playlist.tracks[trackIndex] || null;
    }

    function syncPlayButton() {
        if ($playIcon.length === 0 || !audio) {
            return;
        }

        $playIcon.attr('src', audio.paused ? '/images/icons/play.svg' : '/images/icons/pause.svg');
    }

    function playAudio(onSuccess, onFailure) {
        var playRequest;

        if (!audio) {
            return;
        }

        playRequest = audio.play();

        if (playRequest && typeof playRequest.then === 'function') {
            $.when(playRequest).done(onSuccess).fail(onFailure);
            return;
        }

        if (typeof onSuccess === 'function') {
            onSuccess();
        }
    }

    function openLibrary() {
        if ($library.length === 0 || $player.length === 0) {
            return;
        }

        $library.removeAttr('hidden').show().attr('aria-hidden', 'false');
        $player.attr('hidden', 'hidden').hide().attr('aria-hidden', 'true');
    }

    function closeLibrary() {
        if ($library.length === 0 || $player.length === 0) {
            return;
        }

        $library.attr('hidden', 'hidden').hide().attr('aria-hidden', 'true');
        $player.removeAttr('hidden').show().attr('aria-hidden', 'false');
    }

    function renderLibrary() {
        if ($libraryList.length === 0) {
            return;
        }

        $libraryList.empty();

        $.each(playlists, function (index, playlist) {
            var className = 'playlist-library__item';
            var $button;

            if (index === playlistIndex) {
                className += ' is-active';
            }

            $button = $('<button type="button"></button>');
            $button.addClass(className);
            $button.append($('<p></p>').addClass('playlist-library__item-title').text(playlist.name || 'Playlist'));
            $button.append($('<p></p>').addClass('playlist-library__item-meta').text(playlist.description || ''));
            $button.on('click', function () {
                playlistIndex = index;
                trackIndex = 0;
                renderLibrary();
                loadTrack(false);
                closeLibrary();
            });

            $libraryList.append($button);
        });
    }

    function updateMeta() {
        var playlist = currentPlaylist();
        var track = currentTrack();

        if (!playlist || !track) {
            $playlistName.text('Playlist');
            $trackTitle.text('No track available');
            $trackArtist.text('-');
            $cover.removeAttr('src').attr('alt', 'No cover available');
            return;
        }

        $playlistName.text(playlist.name);
        $trackTitle.text(track.title);
        $trackArtist.text(track.artist);
        $cover.attr('src', track.cover || playlist.cover || '').attr('alt', (track.title || 'Track') + ' cover');
    }

    function loadTrack(autoplay) {
        var track = currentTrack();

        updateMeta();

        if (!track || !audio) {
            if (audio) {
                audio.removeAttribute('src');
                audio.load();
            }

            syncPlayButton();
            return;
        }

        audio.src = track.audioUrl;
        audio.load();
        $seekbar.val('0');
        $currentTime.text('0:00');
        $duration.text('0:00');
        $status.text('Loaded: ' + track.title);

        if (autoplay) {
            playAudio(function () {
                $status.text('Playing');
            }, function () {
                $status.text('Press play to start audio');
            });
        }

        syncPlayButton();
    }

    function skip(direction) {
        var playlist = currentPlaylist();
        var lastIndex;

        if (!playlist || !$.isArray(playlist.tracks) || playlist.tracks.length === 0) {
            return;
        }

        lastIndex = playlist.tracks.length - 1;

        if (direction > 0) {
            trackIndex = Math.min(trackIndex + 1, lastIndex);
        } else {
            trackIndex = Math.max(trackIndex - 1, 0);
        }

        loadTrack(audio && !audio.paused);
    }

    function restartCurrentTrack() {
        if (!audio) {
            return;
        }

        audio.currentTime = 0;
        $seekbar.val('0');
        $currentTime.text('0:00');

        playAudio(function () {
            $status.text('Restarted track');
        }, function () {
            $status.text('Press play to start audio');
        });
    }

    $playToggle.on('click', function () {
        if (!audio) {
            return;
        }

        if (!audio.src) {
            loadTrack(false);
        }

        if (audio.paused) {
            playAudio(function () {
                $status.text('Playing');
                syncPlayButton();
            }, function () {
                $status.text('Playback blocked. Interact and try again.');
                syncPlayButton();
            });
        } else {
            audio.pause();
            $status.text('Paused');
            syncPlayButton();
        }
    });

    $prev.on('click', function () {
        if (audio && audio.currentTime > 3) {
            restartCurrentTrack();
            return;
        }

        skip(-1);
    });

    $next.on('click', function () {
        skip(1);
    });

    $libraryToggle.on('click', function () {
        openLibrary();
    });

    $(audio).on('loadedmetadata', function () {
        $duration.text(formatTime(audio.duration));
    });

    $(audio).on('timeupdate', function () {
        $currentTime.text(formatTime(audio.currentTime));

        if (isFinite(audio.duration) && audio.duration > 0) {
            $seekbar.val(String(Math.round((audio.currentTime / audio.duration) * 100)));
        }
    });

    $(audio).on('play pause', function () {
        syncPlayButton();
    });

    $(audio).on('ended', function () {
        skip(1);
    });

    $seekbar.on('input change', function () {
        if (!audio || !isFinite(audio.duration) || audio.duration <= 0) {
            return;
        }

        audio.currentTime = (Number($seekbar.val()) / 100) * audio.duration;
    });

    $.getJSON(apiUrl)
        .done(function (payload) {
            playlists = $.isArray(payload.playlists) ? payload.playlists : [];

            if (playlists.length === 0) {
                $status.text('Unable to load playlists');
                return;
            }

            playlistIndex = 0;
            trackIndex = 0;
            renderLibrary();
            closeLibrary();
            loadTrack(false);
        })
        .fail(function () {
                $status.text('Unable to load playlists');
        });
});
