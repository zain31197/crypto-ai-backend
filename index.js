const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(bodyParser.json());

const HUGGING_FACE_API_KEY = process.env.HUGGING_FACE_API_KEY;

app.post("/ask-ai", async (req, res) => {
  const { question } = req.body;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: `Answer this: ${question}` }),
    });

    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
      return Array.isArray(json) && json[0]?.generated_text
        ? res.json({ answer: json[0].generated_text })
        : res.json({ answer: "🤖 AI ran but returned no clear answer." });
    } catch {
      return res.json({ answer: "⚠️ Unexpected AI response:\n" + text });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ answer: "❌ Server error contacting Hugging Face." });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Crypto AI API is live on port ${process.env.PORT || 3000}`)
);
