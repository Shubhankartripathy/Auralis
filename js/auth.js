import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


// ===============================
// FIREBASE CONFIG
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyC0qFhQp83DTAgAhDezeX459vGZUBkMWVQ",
    authDomain: "auralis-test-7b415.firebaseapp.com",
    projectId: "auralis-test-7b415",
    storageBucket: "auralis-test-7b415.firebasestorage.app",
    messagingSenderId: "591791589445",
    appId: "1:591791589445:web:e534c23bce3243a8923b2c",
    measurementId: "G-HGG26KSVTX"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Firebase initialized successfully");

// Export so other pages (like home.html's auth guard) can check login state
export { auth };


// ===============================
// PRE-FILL EMAIL ON LOGIN PAGE
// (used when redirected from signup
// because the email already exists)
// ===============================

(function prefillLoginEmail() {

    const params = new URLSearchParams(window.location.search);
    const prefillEmail = params.get("email");

    const loginEmailInput =
        document.getElementById("loginEmail");

    if (prefillEmail && loginEmailInput) {

        loginEmailInput.value =
            decodeURIComponent(prefillEmail);

        const loginPasswordInput =
            document.getElementById("loginPassword");

        if (loginPasswordInput) {
            loginPasswordInput.focus();
        }
    }

})();


// ===============================
// HELPER FUNCTIONS
// ===============================

function showMessage(element, message, type = "error") {

    if (!element) return;

    element.textContent = message;

    element.className =
        type === "success"
            ? "auth-message success"
            : "auth-message error";
}


function firebaseError(error) {

    console.error("Firebase Error:", error);

    switch (error.code) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Password must contain at least 6 characters.";

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/user-not-found":
            return "No account found with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/popup-closed-by-user":
            return "Google sign-in was cancelled.";

        case "auth/popup-blocked":
            return "Please allow popups for Google sign-in.";

        case "auth/operation-not-allowed":
            return "This sign-in method is not enabled in Firebase.";

        default:
            return error.message || "Something went wrong.";
    }
}


// Simple email format check — used now that the browser's own
// validation popups are turned off (forms use novalidate)
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ===============================
// SIGNUP
// ===============================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("Signup button clicked");

            const name =
                document
                    .getElementById("signupName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("signupEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("signupPassword")
                    .value;

            const terms =
                document.getElementById("terms");

            const message =
                document.getElementById("signupMessage");


            // Validation
            if (!name || !email || !password) {

                showMessage(
                    message,
                    "Please fill in all fields."
                );

                return;
            }

            if (!isValidEmail(email)) {

                showMessage(
                    message,
                    "Please enter a valid email address."
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    message,
                    "Password must contain at least 6 characters."
                );

                return;
            }


            if (terms && !terms.checked) {

                showMessage(
                    message,
                    "Please accept the Terms of Service and Privacy Policy."
                );

                return;
            }


            try {

                showMessage(
                    message,
                    "Creating your account...",
                    "success"
                );


                // Create Firebase account
                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user =
                    userCredential.user;


                console.log(
                    "Account created:",
                    user.uid
                );


                // Save user's name
                await updateProfile(
                    user,
                    {
                        displayName: name
                    }
                );

                // Save profile info locally, namespaced by uid so it
                // survives logout/login and doesn't leak between accounts
                localStorage.setItem("auralisName", name);
                localStorage.setItem("auralisEmail", user.email);
                localStorage.setItem("auralisUid", user.uid);
                localStorage.setItem("isNewUser", "true");
                localStorage.removeItem("auralisPhoto"); // brand new account, no photo yet


                showMessage(
                    message,
                    "Account created successfully!",
                    "success"
                );


                /*
                    Firebase automatically signs
                    the new user in.
                */

                setTimeout(() => {

                    window.location.href =
                        "home.html";

                }, 800);


            } catch (error) {

                if (error.code === "auth/email-already-in-use") {

                    showMessage(
                        message,
                        "This email is already registered. Redirecting you to login...",
                        "success"
                    );

                    setTimeout(() => {

                        window.location.href =
                            "login.html?email=" +
                            encodeURIComponent(email);

                    }, 1500);

                    return;
                }

                showMessage(
                    message,
                    firebaseError(error)
                );

            }

        }
    );
}


// ===============================
// LOGIN
// ===============================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("Login button clicked");


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            const rememberMe =
                document.getElementById("rememberMe");

            const message =
                document.getElementById("loginMessage");


            if (!email || !password) {

                showMessage(
                    message,
                    "Please enter your email and password."
                );

                return;
            }

            if (!isValidEmail(email)) {

                showMessage(
                    message,
                    "Please enter a valid email address."
                );

                return;
            }


            try {

                showMessage(
                    message,
                    "Logging you in...",
                    "success"
                );


                // Remember me
                if (
                    rememberMe &&
                    rememberMe.checked
                ) {

                    await setPersistence(
                        auth,
                        browserLocalPersistence
                    );

                } else {

                    await setPersistence(
                        auth,
                        browserSessionPersistence
                    );

                }


                // Login
                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const user = userCredential.user;

                console.log(
                    "Login successful:",
                    user.uid
                );

                // Save profile info locally, namespaced by uid
                localStorage.setItem(
                    "auralisName",
                    user.displayName || email
                );
                localStorage.setItem("auralisEmail", user.email);
                localStorage.setItem("auralisUid", user.uid);

                // Restore this account's saved photo, if we have one from
                // a previous session on this browser; otherwise clear it
                // so a leftover photo from a different account can't show
                const savedPhoto = localStorage.getItem(`auralisPhoto_${user.uid}`);

                if (savedPhoto) {
                    localStorage.setItem("auralisPhoto", savedPhoto);
                } else {
                    localStorage.removeItem("auralisPhoto");
                }


                showMessage(
                    message,
                    "Login successful!",
                    "success"
                );


                window.location.href = "home.html";


            } catch (error) {

                showMessage(
                    message,
                    firebaseError(error)
                );

            }

        }
    );
}


// ===============================
// GOOGLE LOGIN
// ===============================

const googleProvider =
    new GoogleAuthProvider();


document
    .querySelectorAll('[data-provider="google"]')
    .forEach((button) => {

        button.addEventListener(
            "click",
            async function () {

                console.log(
                    "Google button clicked"
                );


                try {

                    const result = await signInWithPopup(
                        auth,
                        googleProvider
                    );

                    const gUser = result.user;

                    localStorage.setItem(
                        "auralisName",
                        gUser.displayName || gUser.email
                    );
                    localStorage.setItem("auralisEmail", gUser.email);
                    localStorage.setItem("auralisUid", gUser.uid);

                    const savedPhoto = localStorage.getItem(`auralisPhoto_${gUser.uid}`);

                    if (savedPhoto) {
                        localStorage.setItem("auralisPhoto", savedPhoto);
                    } else if (gUser.photoURL) {
                        localStorage.setItem("auralisPhoto", gUser.photoURL);
                    } else {
                        localStorage.removeItem("auralisPhoto");
                    }


                    console.log(
                        "Google login successful"
                    );


                    window.location.href =
                        "home.html";


                } catch (error) {

                    const message =
                        document.getElementById(
                            "loginMessage"
                        ) ||
                        document.getElementById(
                            "signupMessage"
                        );


                    showMessage(
                        message,
                        firebaseError(error)
                    );

                }

            }
        );

    });


// ===============================
// FORGOT PASSWORD
// ===============================

const forgotPassword =
    document.getElementById(
        "forgotPassword"
    );


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const message =
                document.getElementById(
                    "loginMessage"
                );


            if (!email) {

                showMessage(
                    message,
                    "Enter your email address first."
                );

                return;
            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                showMessage(
                    message,
                    "Password reset email sent. Check your inbox.",
                    "success"
                );


            } catch (error) {

                showMessage(
                    message,
                    firebaseError(error)
                );

            }

        }
    );

}


// ===============================
// SHOW / HIDE PASSWORD TOGGLE
// (wires up every button with class
// "password-toggle" on the page —
// works for both login and signup)
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".password-toggle").forEach((btn) => {

        btn.addEventListener("click", () => {

            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);

            if (!input) return;

            const isHidden = input.type === "password";

            input.type = isHidden ? "text" : "password";
            btn.textContent = isHidden ? "Hide" : "Show";
            btn.setAttribute(
                "aria-label",
                isHidden ? "Hide password" : "Show password"
            );

        });

    });

});


// ===============================
// LOGOUT (optional helper — wire up
// to any button with id="logoutBtn"
// on any page that loads this script)
// ===============================

import { signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", async () => {

            await signOut(auth);

            localStorage.removeItem("auralisName");
            localStorage.removeItem("auralisPhoto");
            localStorage.removeItem("isNewUser");

            window.location.href = "login.html";

        });

    }

});