let allSongs = [];       // Current catalog/search results
let songs = [];          // Currently visible batch


const SEARCH_TERMS = [
    "bollywood",
    "punjabi hits",
    "arijit singh",
    "karan aujla",
    "hindi love songs",
    "sidhu moose wala"
];


const BATCH_SIZE = 20;



/* =========================================================
   FETCH SONGS FROM ITUNES
========================================================= */

async function fetchSongs() {

    try {

        let requests = SEARCH_TERMS.map(term =>

            fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=50`
            )
            .then(res => res.json())

        );


        let responses =
            await Promise.all(requests);


        let combinedResults =
            responses.flatMap(
                data => data.results
            );


        mergeAndRender(
            combinedResults
        );


    } catch (err) {

        console.error(
            "Failed to load songs from iTunes:",
            err
        );


        let container =
            document.querySelector(
                ".container"
            );


        if (container) {

            container.innerHTML =
                "<p style='color:#b3b3b3;'>Couldn't load songs right now. Check your connection.</p>";

        }

    }

}



/* =========================================================
   SEARCH SONGS
========================================================= */

async function searchSongs(query) {

    if (
        !query ||
        !query.trim()
    ) {

        fetchSongs();

        return;
    }


    try {

        let res =
            await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=50`
            );


        let data =
            await res.json();


        mergeAndRender(
            data.results || []
        );


    } catch (err) {

        console.error(
            "Search failed:",
            err
        );


        let container =
            document.querySelector(
                ".container"
            );


        if (container) {

            container.innerHTML =
                "<p style='color:#b3b3b3;'>Search failed. Check your connection.</p>";

        }

    }

}



/* =========================================================
   MERGE / MAP / SAVE / RENDER
========================================================= */

function mergeAndRender(rawResults) {

    let seenIds =
        new Set();


    let mapped =
        rawResults

            .filter(track => {

                /* Skip tracks without preview */

                if (!track.previewUrl) {
                    return false;
                }


                /* Skip duplicate tracks */

                if (
                    seenIds.has(
                        track.trackId
                    )
                ) {

                    return false;
                }


                seenIds.add(
                    track.trackId
                );


                return true;

            })


            .map(track => ({

                name:
                    track.trackName,

                artist:
                    track.artistName,

                description:
                    track.collectionName ||
                    "Single",

                duration:
                    formatDuration(
                        track.trackTimeMillis
                    ),

                path:
                    track.previewUrl,

                image:
                    track.artworkUrl100
                        .replace(
                            "100x100",
                            "600x600"
                        ),

                spotifyUrl:
                    `https://open.spotify.com/search/${encodeURIComponent(
                        track.trackName +
                        " " +
                        track.artistName
                    )}`

            }));


    /* Replace current catalog */

    allSongs =
        mapped;


    /*
       Save songs so player.html can access them.
    */

    localStorage.setItem(
        "auralisSongs",
        JSON.stringify(
            allSongs
        )
    );


    /*
       First 20 songs
    */

    songs =
        allSongs.slice(
            0,
            BATCH_SIZE
        );


    renderSongCards();

    renderLoadMoreButton();

    showLikedSongs();

}



/* =========================================================
   FORMAT DURATION
========================================================= */

function formatDuration(ms) {

    let totalSeconds =
        Math.floor(
            ms / 1000
        );


    let m =
        Math.floor(
            totalSeconds / 60
        );


    let s =
        (
            totalSeconds % 60
        )
            .toString()
            .padStart(
                2,
                "0"
            );


    return `${m}:${s}`;

}



/* =========================================================
   BUILD NORMAL SONG CARDS
========================================================= */

function renderSongCards() {

    let container =
        document.querySelector(
            ".container"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    songs.forEach(
        (song, index) => {

            let card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.setAttribute(
                "data-index",
                index
            );


            /*
               Clicking card opens player.
            */

            card.onclick = () => {

                openPlayer(
                    index
                );

            };


            card.innerHTML = `

                <div
                    class="like-btn"
                    onclick="toggleLike(event, this, ${index})">
                    ♡
                </div>

                <img
                    src="${song.image}"
                    alt="${song.name}">

                <h3>
                    ${song.name}
                </h3>

                <p class="artist">
                    By ${song.artist}
                </p>

                <div class="details">

                    <span>
                        ${song.description}
                    </span>

                    <span>
                        ${song.duration}
                    </span>

                </div>

                <a
                    class="spotify-link"
                    href="${song.spotifyUrl}"
                    target="_blank"
                    rel="noopener"
                    onclick="event.stopPropagation();">

                    Listen Full Song on Spotify

                </a>
            `;


            container.appendChild(
                card
            );

        }
    );


    /*
       Update hearts after cards are created.
    */

    applyLikedHighlights();

}



/* =========================================================
   LOAD MORE
========================================================= */

function renderLoadMoreButton() {

    let existingBtn =
        document.getElementById(
            "loadMoreBtn"
        );


    if (existingBtn) {

        existingBtn.remove();

    }


    if (
        songs.length >=
        allSongs.length
    ) {

        return;

    }


    let btn =
        document.createElement(
            "button"
        );


    btn.id =
        "loadMoreBtn";


    btn.innerText =
        "Load More Songs";


    btn.style.cssText = `
        display:block;
        margin:30px auto 50px;
        padding:14px 32px;
        border:none;
        border-radius:30px;
        background:#1DB954;
        color:black;
        font-weight:700;
        font-size:15px;
        cursor:pointer;
    `;


    btn.onclick = () => {

        let nextBatch =
            allSongs.slice(
                songs.length,
                songs.length +
                BATCH_SIZE
            );


        songs =
            songs.concat(
                nextBatch
            );


        renderSongCards();

        renderLoadMoreButton();

        showLikedSongs();

    };


    let container =
        document.querySelector(
            ".container"
        );


    if (container) {

        container.insertAdjacentElement(
            "afterend",
            btn
        );

    }

}



/* =========================================================
   OPEN PLAYER
========================================================= */

function openPlayer(index) {

    /*
       Save the complete current catalog.
    */

    localStorage.setItem(
        "auralisSongs",
        JSON.stringify(
            allSongs
        )
    );


    /*
       Save index of selected song.
    */

    localStorage.setItem(
        "songIndex",
        index
    );


    window.location.href =
        "player.html";

}



/* =========================================================
   LIKE STORAGE
========================================================= */

function getLikedSongs() {

    return JSON.parse(
        localStorage.getItem(
            "auralisLikedSongs"
        )
    ) || [];

}


function saveLikedSongs(
    likedSongs
) {

    localStorage.setItem(
        "auralisLikedSongs",
        JSON.stringify(
            likedSongs
        )
    );

}



/* =========================================================
   UNIQUE SONG ID
========================================================= */

function getSongLikeId(song) {

    /*
       Preview URL is unique enough for this API.
       If unavailable, song name is used.
    */

    return song.path ||
        song.name;

}



/* =========================================================
   TOGGLE LIKE FROM HOME
========================================================= */

function toggleLike(
    event,
    button,
    index
) {

    /*
       Prevent card click from opening player.
    */

    event.stopPropagation();


    let song =
        songs[index];


    if (!song) {
        return;
    }


    let songId =
        getSongLikeId(
            song
        );


    let likedSongs =
        getLikedSongs();


    let existingIndex =
        likedSongs.indexOf(
            songId
        );


    /*
       Already liked
       → remove
    */

    if (
        existingIndex !== -1
    ) {

        likedSongs.splice(
            existingIndex,
            1
        );

    }


    /*
       Not liked
       → add
    */

    else {

        likedSongs.push(
            songId
        );

    }


    /*
       Save
    */

    saveLikedSongs(
        likedSongs
    );


    /*
       Update normal cards
    */

    applyLikedHighlights();


    /*
       Update Most Liked
    */

    showLikedSongs();

}



/* =========================================================
   UPDATE NORMAL CARD HEARTS
========================================================= */

function applyLikedHighlights() {

    let likedSongs =
        getLikedSongs();


    let cards =
        document.querySelectorAll(
            ".card"
        );


    cards.forEach(
        (card, index) => {

            let button =
                card.querySelector(
                    ".like-btn"
                );


            if (!button) {
                return;
            }


            let song =
                songs[index];


            if (!song) {
                return;
            }


            let songId =
                getSongLikeId(
                    song
                );


            let isLiked =
                likedSongs.includes(
                    songId
                );


            if (isLiked) {

                button.innerHTML =
                    "♥";

                button.classList.add(
                    "liked"
                );

            }

            else {

                button.innerHTML =
                    "♡";

                button.classList.remove(
                    "liked"
                );

            }

        }
    );

}



/* =========================================================
   CREATE MOST LIKED SECTION
========================================================= */

function createLikedSection() {

    /*
       Don't create it twice.
    */

    if (
        document.getElementById(
            "likedSection"
        )
    ) {

        return;

    }


    let container =
        document.querySelector(
            ".container"
        );


    if (!container) {
        return;
    }


    let section =
        document.createElement(
            "section"
        );


    section.id =
        "likedSection";


    section.className =
        "liked-section";


    section.innerHTML = `

        <div class="section-header">

            <div>

                <h2>
                    Most Liked
                </h2>

                <p>
                    Your liked songs
                </p>

            </div>

        </div>

        <div
            class="liked-container"
            id="likedContainer">
        </div>

    `;


    /*
       Put Most Liked before normal song cards.
    */

    container.parentNode.insertBefore(
        section,
        container
    );

}



/* =========================================================
   SHOW MOST LIKED SONGS
========================================================= */

function showLikedSongs() {

    createLikedSection();


    let section =
        document.getElementById(
            "likedSection"
        );


    let container =
        document.getElementById(
            "likedContainer"
        );


    if (
        !section ||
        !container
    ) {

        return;

    }


    let likedIds =
        getLikedSongs();


    /*
       Find liked songs from current catalog.
    */

    let likedSongObjects =
        allSongs.filter(
            song => {

                let id =
                    getSongLikeId(
                        song
                    );


                return likedIds.includes(
                    id
                );

            }
        );


    /*
       No liked songs.
    */

    if (
        likedSongObjects.length === 0
    ) {

        section.style.display =
            "none";

        container.innerHTML =
            "";

        return;

    }


    /*
       Show section.
    */

    section.style.display =
        "block";


    container.innerHTML =
        "";


    /*
       Display liked songs.
    */

    likedSongObjects.forEach(
        song => {

            let card =
                document.createElement(
                    "div"
                );


            card.className =
                "liked-card";


            card.innerHTML = `

                <div class="liked-image-wrapper">

                    <img
                        src="${song.image}"
                        alt="${song.name}">

                    <button
                        class="liked-heart"
                        aria-label="Unlike">
                        ♥
                    </button>

                </div>

                <div class="liked-info">

                    <h3>
                        ${song.name}
                    </h3>

                    <p>
                        ${song.artist}
                    </p>

                </div>

            `;


            /*
               Find song index.
            */

            let songIndex =
                allSongs.indexOf(
                    song
                );


            /*
               Clicking card opens player.
            */

            card.addEventListener(
                "click",
                () => {

                    localStorage.setItem(
                        "auralisSongs",
                        JSON.stringify(
                            allSongs
                        )
                    );


                    localStorage.setItem(
                        "songIndex",
                        songIndex
                    );


                    window.location.href =
                        "player.html";

                }
            );


            /*
               Heart button.
            */

            let heart =
                card.querySelector(
                    ".liked-heart"
                );


            heart.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();


                    removeLikedSong(
                        song
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}



/* =========================================================
   REMOVE LIKE FROM MOST LIKED
========================================================= */

function removeLikedSong(song) {

    let songId =
        getSongLikeId(
            song
        );


    let likedSongs =
        getLikedSongs();


    likedSongs =
        likedSongs.filter(
            id => id !== songId
        );


    saveLikedSongs(
        likedSongs
    );


    /*
       Update normal cards.
    */

    applyLikedHighlights();


    /*
       Update Most Liked.
    */

    showLikedSongs();

}



/* =========================================================
   SEARCH BAR
   Smooth expanding animation
========================================================= */

function setupSearchBar() {

    const searchBox =
        document.querySelector(
            ".search-box"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (
        !searchBox ||
        !searchInput
    ) {

        console.warn(
            "No search bar elements found — search bar not wired up."
        );

        return;

    }


    let debounceTimer;


    /* =========================================
       EXPAND SEARCH BAR
    ========================================== */

    function activateSearch() {

        if (
            !searchBox.classList.contains(
                "active"
            )
        ) {

            searchBox.classList.add(
                "active"
            );

        }

    }


    /* =========================================
       COLLAPSE SEARCH BAR
    ========================================== */

    function deactivateSearch() {

        /*
           Only collapse when the search
           input is empty.
        */

        if (
            searchInput.value.trim() === ""
        ) {

            searchBox.classList.remove(
                "active"
            );

        }

    }


    /* =========================================
       CLICK SEARCH BAR
    ========================================== */

    searchBox.addEventListener(
        "click",
        activateSearch
    );


    /* =========================================
       FOCUS SEARCH BAR
    ========================================== */

    searchInput.addEventListener(
        "focus",
        activateSearch
    );


    /* =========================================
       SEARCH INPUT
    ========================================== */

    searchInput.addEventListener(
        "input",
        (e) => {

            clearTimeout(
                debounceTimer
            );


            debounceTimer =
                setTimeout(
                    () => {

                        searchSongs(
                            e.target.value
                        );

                    },
                    400
                );

        }
    );


    /* =========================================
       ENTER KEY
    ========================================== */

    searchInput.addEventListener(
        "keydown",
        (e) => {

            if (
                e.key === "Enter"
            ) {

                e.preventDefault();


                clearTimeout(
                    debounceTimer
                );


                searchSongs(
                    e.target.value
                );

            }

        }
    );


    /* =========================================
       CLICK OUTSIDE
    ========================================== */

    document.addEventListener(
        "click",
        (e) => {

            if (
                !searchBox.contains(
                    e.target
                )
            ) {

                deactivateSearch();

            }

        }
    );


    /* =========================================
       ESCAPE KEY
    ========================================== */

    document.addEventListener(
        "keydown",
        (e) => {

            if (
                e.key === "Escape"
            ) {

                searchInput.blur();


                if (
                    searchInput.value.trim() === ""
                ) {

                    searchBox.classList.remove(
                        "active"
                    );

                }

            }

        }
    );

}



/* =========================================================
   RUN
========================================================= */

fetchSongs();

setupSearchBar();



/* =========================================================
   OPEN LIKED PLAYER
========================================================= */

function openLikedPlayer(id) {

    const likedData =
        getLikedSongData();


    const song =
        likedData[
            String(id)
        ];


    if (!song) {
        return;
    }


    let catalog =
        JSON.parse(
            localStorage.getItem(
                "auralisSongs"
            ) || "[]"
        );


    let index =
        catalog.findIndex(
            item =>
                String(item.id) ===
                String(id)
        );


    if (index === -1) {

        catalog.push(
            song
        );


        index =
            catalog.length - 1;


        localStorage.setItem(
            "auralisSongs",
            JSON.stringify(
                catalog
            )
        );

    }


    localStorage.setItem(
        "songIndex",
        index
    );


    window.location.href =
        "player.html";

}