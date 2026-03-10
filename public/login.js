// ============================
// Firebase Auth Setup
// ============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCFYKtb_fNUtLA3Yz0Ssx4PoBoKQIQxOM0",
    authDomain: "disaster-ai-240b7.firebaseapp.com",
    projectId: "disaster-ai-240b7",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Firebase initialized successfully");

// ============================
// Login Form Logic
// ============================
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');

    loginForm?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;

        if (email && password) {
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Signing in...</span>';
            submitBtn.disabled = true;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);

                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', email);

                if (remember) localStorage.setItem('rememberedUser', email);

                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Authentication error:", error);
                alert("Login failed: " + error.message);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    });

    // Fill remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.querySelector('input[name="remember"]').checked = true;
    }

    // Input animations
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => input.parentElement.style.transform = 'translateY(-2px)');
        input.addEventListener('blur', () => input.parentElement.style.transform = 'translateY(0)');
    });

    // Social login buttons placeholder
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', () => alert('Social login will be implemented with OAuth providers'));
    });
});

// ============================
// Chatbot Logic
// ============================
const toggle = document.getElementById("chat-toggle");
const box = document.getElementById("chatbox");
const sendBtn = document.getElementById("send");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

// Toggle chat window
toggle.onclick = () => {
    box.style.display = box.style.display === "flex" ? "none" : "flex";
};

// Send message on button click or Enter
sendBtn.onclick = send;
input.addEventListener("keypress", e => { if (e.key === "Enter") send(); });

// Add message to chat window
function add(text, type) {
    const msg = document.createElement("div");
    msg.className = "msg " + type;
    msg.innerText = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
}

// Send message to backend
async function send() {
    const text = input.value.trim();
    if (!text) return;

    add(text, "user");
    input.value = "";

    const typing = add("Typing...", "bot");

    try {
        // For Vercel serverless: change to /api/chat
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        const data = await res.json();
        typing.remove();
        add(data.reply, "bot");

    } catch (err) {
        typing.remove();
        add("⚠️ Server error. Please try again later.", "bot");
    }
}