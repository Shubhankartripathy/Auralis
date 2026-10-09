/* =========================================================
   AURALIS PLAYER
   ========================================================= */


/* =========================================================
   SONG DATA
========================================================= */

let songs =
    JSON.parse(
        localStorage.getItem("auralisSongs")
    ) || [];


/* =========================================================
   ELEMENTS
========================================================= */

let audio =
    document.getElementById("audio");

let playBtn =
    document.getElementById("play");

let progress =
    document.getElementById("progress");

let title =
    document.getElementById("song-title");

let cover =
    document.querySelector(".cover");

let artist =
    document.getElementById("artist-name");

let plays =
    document.getElementById("plays");

let duration =
    document.getElementById("duration");

let description =
    document.getElementById("song-description");

let currentTimeEl =
    document.getElementById("current-time");

let totalDurationEl =
    document.getElementById("total-duration");

let likeBtn =
    document.getElementById("likeBtn");

let spotifyLink =
    document.getElementById("spotifyLink");


/* =========================================================
   CURRENT SONG
========================================================= */

let currentSong =
    parseInt(
        localStorage.getItem("songIndex")
    ) || 0;


/* =========================================================
   NO SONGS
========================================================= */

if (songs.length === 0) {

    document.querySelector(".player").innerHTML =
        `
        <p
            style="
                color:#b3b3b3;
                padding:20px;
            "
        >
            No songs loaded yet.
            Please go back to the home page first.
        </p>
        `;

}


/* =========================================================
   LOAD FIRST SONG
========================================================= */

else {

    loadSong(currentSong);

}


/* =========================================================
   LOAD SONG
========================================================= */

function loadSong(index) {

    if (!songs[index]) {

        return;
    }


    let song =
        songs[index];


    /* Audio */

    audio.src =
        song.path;


    /* Title */

    title.innerHTML =
        song.name;


    /* Album cover */

    cover.src =
        song.image;


    cover.alt =
        song.name;


    /* Artist */

    artist.innerHTML =
        song.artist;


    /* Plays */

    plays.innerHTML =
        "";


    /* Duration from API */

    duration.innerHTML =
        song.duration || "";


    /* Description */

    description.innerHTML =
        song.description ||
        "Single";


    /* Reset progress */

    currentTimeEl.innerHTML =
        "0:00";

    totalDurationEl.innerHTML =
        "0:00";

    progress.value =
        0;


    progress.max =
        0;


    /* Reset play button */

    playBtn.innerHTML =
        "▶";

    playBtn.setAttribute(
        "aria-label",
        "Play"
    );


    /* Spotify */

    if (spotifyLink) {

        spotifyLink.href =
            song.spotifyUrl ||
            `https://open.spotify.com/search/${encodeURIComponent(
                song.name + " " + song.artist
            )}`;
    }


    /* Update like button */

    updateLikeButton();

}


/* =========================================================
   LIKE SYSTEM
========================================================= */


/*
   A song is identified by its path.

   If path is unavailable,
   the song name is used.
*/


function getSongLikeId(song) {

    return song.path ||
        song.name;

}


/* =========================================================
   GET LIKED SONGS
========================================================= */

function getLikedSongs() {

    return JSON.parse(
        localStorage.getItem(
            "auralisLikedSongs"
        )
    ) || [];

}


/* =========================================================
   SAVE LIKED SONGS
========================================================= */

function saveLikedSongs(likedSongs) {

    localStorage.setItem(
        "auralisLikedSongs",
        JSON.stringify(likedSongs)
    );

}


/* =========================================================
   TOGGLE LIKE
========================================================= */

function toggleLike() {

    if (!songs[currentSong]) {

        return;
    }


    let song =
        songs[currentSong];


    let songId =
        getSongLikeId(song);


    let likedSongs =
        getLikedSongs();


    let index =
        likedSongs.indexOf(songId);


    /* Already liked */

    if (index !== -1) {

        likedSongs.splice(
            index,
            1
        );

    }


    /* Not liked */

    else {

        likedSongs.push(
            songId
        );

    }


    saveLikedSongs(
        likedSongs
    );


    updateLikeButton();

}


/* =========================================================
   UPDATE LIKE BUTTON
========================================================= */

function updateLikeButton() {

    if (
        !likeBtn ||
        !songs[currentSong]
    ) {

        return;
    }


    let song =
        songs[currentSong];


    let songId =
        getSongLikeId(song);


    let likedSongs =
        getLikedSongs();


    let isLiked =
        likedSongs.includes(
            songId
        );


    if (isLiked) {

        likeBtn.innerHTML =
            "♥";

        likeBtn.classList.add(
            "liked"
        );

        likeBtn.setAttribute(
            "aria-label",
            "Unlike"
        );

    }

    else {

        likeBtn.innerHTML =
            "♡";

        likeBtn.classList.remove(
            "liked"
        );

        likeBtn.setAttribute(
            "aria-label",
            "Like"
        );

    }

}


/* =========================================================
   AUDIO METADATA
========================================================= */

audio.addEventListener(
    "loadedmetadata",
    () => {

        if (
            !audio.duration ||
            !isFinite(audio.duration)
        ) {

            return;
        }


        progress.max =
            audio.duration;


        let totalMinutes =
            Math.floor(
                audio.duration / 60
            );


        let totalSeconds =
            Math.floor(
                audio.duration % 60
            );


        totalSeconds =
            totalSeconds
                .toString()
                .padStart(2, "0");


        totalDurationEl.innerHTML =
            totalMinutes +
            ":" +
            totalSeconds;

    }
);


/* =========================================================
   PLAY / PAUSE
========================================================= */

function playSong() {

    if (!audio.src) {

        return;
    }


    if (audio.paused) {

        audio
            .play()
            .then(() => {

                playBtn.innerHTML =
                    "⏸";

                playBtn.setAttribute(
                    "aria-label",
                    "Pause"
                );

            })
            .catch(error => {

                console.error(
                    "Unable to play song:",
                    error
                );

            });

    }

    else {

        audio.pause();


        playBtn.innerHTML =
            "▶";


        playBtn.setAttribute(
            "aria-label",
            "Play"
        );

    }

}


/* =========================================================
   NEXT SONG
========================================================= */

function nextSong() {

    if (songs.length === 0) {

        return;
    }


    currentSong++;


    if (
        currentSong >=
        songs.length
    ) {

        currentSong = 0;

    }


    localStorage.setItem(
        "songIndex",
        currentSong
    );


    loadSong(
        currentSong
    );


    audio
        .play()
        .then(() => {

            playBtn.innerHTML =
                "⏸";

            playBtn.setAttribute(
                "aria-label",
                "Pause"
            );

        })
        .catch(error => {

            console.error(
                "Unable to play next song:",
                error
            );

        });

}


/* =========================================================
   PREVIOUS SONG
========================================================= */

function prevSong() {

    if (songs.length === 0) {

        return;
    }


    currentSong--;


    if (
        currentSong < 0
    ) {

        currentSong =
            songs.length - 1;

    }


    localStorage.setItem(
        "songIndex",
        currentSong
    );


    loadSong(
        currentSong
    );


    audio
        .play()
        .then(() => {

            playBtn.innerHTML =
                "⏸";

            playBtn.setAttribute(
                "aria-label",
                "Pause"
            );

        })
        .catch(error => {

            console.error(
                "Unable to play previous song:",
                error
            );

        });

}


/* =========================================================
   PROGRESS UPDATE
========================================================= */

audio.addEventListener(
    "timeupdate",
    () => {

        if (
            !audio.duration ||
            !isFinite(audio.duration)
        ) {

            return;
        }


        progress.max =
            audio.duration;


        progress.value =
            audio.currentTime;


        /* Current time */

        let currentMinutes =
            Math.floor(
                audio.currentTime / 60
            );


        let currentSeconds =
            Math.floor(
                audio.currentTime % 60
            );


        currentSeconds =
            currentSeconds
                .toString()
                .padStart(2, "0");


        currentTimeEl.innerHTML =
            currentMinutes +
            ":" +
            currentSeconds;


        /* Total duration */

        let totalMinutes =
            Math.floor(
                audio.duration / 60
            );


        let totalSeconds =
            Math.floor(
                audio.duration % 60
            );


        totalSeconds =
            totalSeconds
                .toString()
                .padStart(2, "0");


        totalDurationEl.innerHTML =
            totalMinutes +
            ":" +
            totalSeconds;

    }
);


/* =========================================================
   SEEK
========================================================= */

progress.addEventListener(
    "input",
    () => {

        if (
            !audio.duration ||
            !isFinite(audio.duration)
        ) {

            return;
        }


        audio.currentTime =
            Number(
                progress.value
            );

    }
);


/* =========================================================
   AUTO NEXT
========================================================= */

audio.addEventListener(
    "ended",
    () => {

        nextSong();

    }
);