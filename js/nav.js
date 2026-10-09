(function () {

    const NAV_HTML = `
        <a class="left" href="home.html">
            <img src="../banner/auralis.png" class="nav-logo" alt="Auralis logo">
            <h2>Auralis</h2>
        </a>
        <div class="right">
            <a href="login.html" data-page="login.html">Login</a>
            <a href="index.html" data-page="index.html">Create Account</a>
            <a href="about.html" data-page="about.html">About Us</a>
        </div>
    `;

    function injectNav() {

        let mount = document.getElementById("site-nav");

        if (!mount) return;

        let nav = document.createElement("nav");
        nav.innerHTML = NAV_HTML;

        mount.replaceWith(nav);

        let current = location.pathname.split("/").pop() || "home.html";

        nav.querySelectorAll(".right a").forEach(link => {

            if (link.dataset.page === current) {
                link.classList.add("active");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", injectNav);

})();