// =======================
// 🔐 CONFIG
// =======================
const ADMIN_USER = "admin@snkpm.com";
const ADMIN_PASS_HASH = "af2b2f5e3ca70b483f14d6a6ca69bb15ed2cbc549f2eb8dfa7fbd30ffa7ac793";

const SESSION_KEY = "admin_session_token";
const SESSION_TIME = 30 * 60 * 1000; // 15 min
const MAX_ATTEMPTS = 5;

let loginAttempts = 0;


// =======================
// 🔐 HASH FUNCTION
// =======================
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}


// =======================
// 🔐 TOKEN GENERATOR
// =======================
function generateToken(email) {
    return btoa(email + ":" + Date.now() + ":" + Math.random());
}


// =======================
// 🔐 LOGIN
// =======================
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        loginError.classList.add("hidden"); // 🔥 FIX

        if (loginAttempts >= MAX_ATTEMPTS) {
            alert("Too many attempts. Try again later.");
            return;
        }

        const email = document.getElementById("adminEmail").value.trim();
        const password = document.getElementById("adminPassword").value.trim();

        if (!email || !password) {
            alert("All fields required");
            return;
        }

        const hashedInput = await hashPassword(password);

        await new Promise(res => setTimeout(res, 800)); // delay

        if (email === ADMIN_USER && hashedInput === ADMIN_PASS_HASH) {

            const sessionData = {
                token: generateToken(email),
                expiry: Date.now() + SESSION_TIME
            };

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

            loginAttempts = 0;

            window.location.href = "admin-dashboard.html";

        } else {
            loginAttempts++;
            loginError.classList.remove("hidden"); // 🔥 SHOW ERROR
        }
    });
}


// =======================
// 🔐 CHECK AUTH
// =======================
function checkAuth() {
    const session = sessionStorage.getItem(SESSION_KEY);

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    const data = JSON.parse(session);

    if (Date.now() > data.expiry) {
        sessionStorage.removeItem(SESSION_KEY);
        alert("Session expired");
        window.location.href = "login.html";
    }

    // auto refresh
    data.expiry = Date.now() + SESSION_TIME;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}


// =======================
// 🔐 LOGOUT
// =======================
function logoutAdmin() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
}




// =======================
// 🔐 DEVTOOLS SLOW
// =======================
setInterval(() => {
    debugger;
}, 1500);


// =======================
// 🔐 DISABLE RIGHT CLICK
// =======================
document.addEventListener("contextmenu", e => e.preventDefault());