// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { OpenAI } = require("openai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve index.html and JS/CSS

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================
// Disaster Knowledge Base
// =========================
function disasterLogic(message) {
  message = message.toLowerCase();

  if (message.includes("earthquake")) {
    return "⚠️ During an earthquake: Drop, Cover, and Hold. Stay away from windows and heavy objects.";
  }
  if (message.includes("flood")) {
    return "🌊 Flood Alert: Move to higher ground immediately and avoid walking or driving through flood water.";
  }
  if (message.includes("cyclone")) {
    return "🌀 Cyclone Safety: Stay indoors, secure loose objects, and keep emergency supplies ready.";
  }
  if (message.includes("fire")) {
    return "🔥 Fire Emergency: Evacuate immediately and call emergency services.";
  }
  if (message.includes("hello") || message.includes("hi")) {
    return "Hello 👋 I am Ocean Guard Assistant. How can I help you today?";
  }

  return null;
}

// =========================
// Chat Route
// =========================
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // First check disaster knowledge base
    const localReply = disasterLogic(userMessage);
    if (localReply) {
      return res.json({ reply: localReply });
    }

    // Otherwise, call OpenAI for AI-based response
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Ocean Guard Assistant. Help users with disaster safety, ocean hazards, earthquakes, floods, cyclones, fires, and emergency advice.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.json({ reply: "⚠️ AI service temporarily unavailable." });
  }
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});