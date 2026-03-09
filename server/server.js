const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* =========================
   STATIC FRONTEND FILES
========================= */

// Go one folder up to reach /public
app.use(express.static(path.join(__dirname, "..", "public")));


/* =========================
   ROUTES
========================= */

// Chat Route
const chatRoute = require("./routes/chat");
app.use("/chat", chatRoute);


// Homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});


// Example API
app.get("/api/news", (req, res) => {
    res.json({
        status: "ok",
        articles: [
            { title: "Flood Alert", description: "Heavy rains expected." },
            { title: "Earthquake Warning", description: "Minor tremors detected." }
        ]
    });
});


/* =========================
   START SERVER
========================= */

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});