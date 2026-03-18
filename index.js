const express = require("express");
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const cors = require("cors");

const app = express();
app.use(cors());

ffmpeg.setFfmpegPath(ffmpegPath);

// ✅ Health
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ INFO
app.get("/info", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    // ✅ FIXED VIDEO ID EXTRACTION
    let videoId = "";

    if (url.includes("youtu.be")) {
      videoId = url.split("/").pop().split("?")[0];
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    }

    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    res.json({
      title: "YouTube Video",
      thumbnail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
      length: 0
    });

  } catch (err) {
    console.error("INFO ERROR:", err);
    res.status(500).json({ error: "Failed to fetch video details" });
  }
});

// ✅ VIDEO
app.get("/download-video", (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Invalid URL");
    }

    // ✅ direct redirect to youtube (no crash)
    res.redirect(url);

  } catch (err) {
    console.error("VIDEO ERROR:", err);
    res.status(500).send("Download failed");
  }
});
// ✅ MP3
app.get("/download-mp3", (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Invalid URL");
    }

    // ✅ redirect (placeholder for now)
    res.redirect(url);

  } catch (err) {
    console.error("MP3 ERROR:", err);
    res.status(500).send("Conversion failed");
  }
});

// ✅ START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});