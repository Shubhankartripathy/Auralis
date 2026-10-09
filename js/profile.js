/* =========================================================
   AURALIS PROFILE
========================================================= */


/* =========================================================
   GO TO HOME
========================================================= */

function goHome() {

    window.location.href = "home.html";

}



/* =========================================================
   ELEMENTS
========================================================= */

const photoInput =
    document.getElementById("photoInput");

const profilePhoto =
    document.getElementById("profilePhoto");

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const photoMessage =
    document.getElementById("photoMessage");

const statusMessage =
    document.getElementById("statusMessage");

const logoutBtn =
    document.getElementById("logoutBtn");



/* =========================================================
   LOAD USER INFORMATION
========================================================= */

function loadUserInformation() {

    const savedName =
        localStorage.getItem("auralisName");

    const savedEmail =
        localStorage.getItem("auralisEmail");


    if (profileName) {

        profileName.textContent =
            savedName || "Auralis User";

    }


    if (profileEmail) {

        profileEmail.textContent =
            savedEmail || "Auralis User";

    }

}


loadUserInformation();



/* =========================================================
   DEFAULT PROFILE AVATAR
========================================================= */

function createDefaultAvatar() {

    const canvas =
        document.createElement("canvas");

    canvas.width = 500;
    canvas.height = 500;


    const ctx =
        canvas.getContext("2d");


    /*
     * Dark background
     */

    ctx.fillStyle = "#171717";

    ctx.fillRect(
        0,
        0,
        500,
        500
    );


    /*
     * Green circle
     */

    ctx.beginPath();

    ctx.arc(
        250,
        250,
        190,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "#1ed760";

    ctx.lineWidth = 8;

    ctx.stroke();


    /*
     * User icon
     */

    ctx.fillStyle =
        "#777777";


    ctx.beginPath();

    ctx.arc(
        250,
        205,
        65,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        250,
        360,
        105,
        Math.PI,
        0
    );

    ctx.fill();


    return canvas.toDataURL(
        "image/jpeg",
        0.8
    );

}



/* =========================================================
   LOAD PROFILE PHOTO
========================================================= */

function loadProfilePhoto() {

    const savedPhoto =
        localStorage.getItem(
            "auralisPhoto"
        );


    if (savedPhoto) {

        profilePhoto.src =
            savedPhoto;

        return;

    }


    /*
     * No photo saved.
     * Create a default avatar.
     */

    profilePhoto.src =
        createDefaultAvatar();

}


loadProfilePhoto();



/* =========================================================
   PHOTO MESSAGE
========================================================= */

function showPhotoMessage(message) {

    if (!photoMessage) {
        return;
    }


    photoMessage.textContent =
        message;


    setTimeout(
        () => {

            photoMessage.textContent =
                "";

        },
        2500
    );

}



/* =========================================================
   PROFILE PHOTO CHANGE
========================================================= */

if (photoInput) {

    photoInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }



            /* =============================================
               CHECK FILE TYPE
            ============================================== */

            if (
                !file.type.startsWith("image/")
            ) {

                showPhotoMessage(
                    "Please select an image file."
                );

                this.value = "";

                return;

            }



            /* =============================================
               CHECK FILE SIZE
            ============================================== */

            if (
                file.size > 10 * 1024 * 1024
            ) {

                showPhotoMessage(
                    "Please choose an image below 10 MB."
                );

                this.value = "";

                return;

            }



            /* =============================================
               READ IMAGE
            ============================================== */

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const image =
                        new Image();


                    image.onload =
                        function () {


                            /*
                             * Create canvas
                             */

                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            const maxSize =
                                600;


                            let width =
                                image.width;

                            let height =
                                image.height;



                            /*
                             * Resize large images
                             */

                            if (
                                width > maxSize ||
                                height > maxSize
                            ) {

                                if (
                                    width > height
                                ) {

                                    height =
                                        height *
                                        maxSize /
                                        width;

                                    width =
                                        maxSize;

                                }

                                else {

                                    width =
                                        width *
                                        maxSize /
                                        height;

                                    height =
                                        maxSize;

                                }

                            }



                            canvas.width =
                                width;

                            canvas.height =
                                height;



                            const ctx =
                                canvas.getContext(
                                    "2d"
                                );


                            /*
                             * Draw image
                             */

                            ctx.drawImage(
                                image,
                                0,
                                0,
                                width,
                                height
                            );



                            /*
                             * Compress image
                             */

                            const compressedImage =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.80
                                );



                            /* =================================
                               SAVE PHOTO
                            ================================== */

                            try {

                                localStorage.setItem(
                                    "auralisPhoto",
                                    compressedImage
                                );


                                /*
                                 * Immediately display
                                 */

                                profilePhoto.src =
                                    compressedImage;


                                showPhotoMessage(
                                    "Profile photo updated successfully."
                                );


                            }

                            catch (error) {

                                console.error(
                                    "Photo save error:",
                                    error
                                );


                                showPhotoMessage(
                                    "Could not save photo. Try a smaller image."
                                );

                            }

                        };


                    image.onerror =
                        function () {

                            showPhotoMessage(
                                "Could not read this image."
                            );

                        };


                    image.src =
                        event.target.result;

                };


            reader.onerror =
                function () {

                    showPhotoMessage(
                        "Could not load the image."
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}



/* =========================================================
   FIREBASE LOGOUT
========================================================= */

logoutBtn.addEventListener(
    "click",
    async function () {


        logoutBtn.disabled =
            true;


        logoutBtn.textContent =
            "Logging out...";


        if (statusMessage) {

            statusMessage.textContent =
                "Signing you out...";

        }



        try {

            /*
             * Dynamically import Firebase.
             *
             * This keeps the photo system and
             * navigation independent from Firebase.
             */

            const firebaseAuth =
                await import(
                    "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"
                );


            const authModule =
                await import(
                    "./auth.js"
                );


            /*
             * Firebase logout
             */

            await firebaseAuth.signOut(
                authModule.auth
            );


            /*
             * Remove login-specific
             * local information.
             */

            localStorage.removeItem(
                "auralisName"
            );

            localStorage.removeItem(
                "auralisEmail"
            );

            localStorage.removeItem(
                "isNewUser"
            );


            /*
             * Keep profile photo.
             */

            if (statusMessage) {

                statusMessage.textContent =
                    "Logout successful.";

            }


            /*
             * Go to login page.
             */

            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                400
            );


        }

        catch (error) {

            console.error(
                "Logout error:",
                error
            );


            logoutBtn.disabled =
                false;


            logoutBtn.textContent =
                "Logout";


            if (statusMessage) {

                statusMessage.textContent =
                    "Logout failed. Please try again.";

            }

        }

    }
);