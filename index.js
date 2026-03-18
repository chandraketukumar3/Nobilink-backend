const express = require("express");
const cors = require("cors");
const ytdlp = require("yt-dlp-exec");

const app = express();
app.use(cors());

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});


// ✅ VIDEO INFO (FIXED - no more ytdl error)
app.get("/info", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const data = await ytdlp(url, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true
    });

    res.json({
      title: data.title,
      thumbnail: data.thumbnail,
      length: data.duration
    });

  } catch (err) {
    console.error("INFO ERROR:", err);
    res.status(500).json({ error: "Failed to fetch video details" });
  }
});


// ✅ VIDEO DOWNLOAD (yt-dlp based)
app.get("/download-video", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Invalid URL");
    }

    res.setHeader("Content-Disposition", "attachment; filename=video.mp4");

    const process = ytdlp.exec(url, {
      format: "best",
      output: "-"
    });

    process.stdout.pipe(res);

  } catch (err) {
    console.error("VIDEO ERROR:", err);
    res.status(500).send("Download failed");
  }
});


// ✅ MP3 DOWNLOAD (yt-dlp based)
app.get("/download-mp3", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Invalid URL");
    }

    res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");

    const process = ytdlp.exec(url, {
      extractAudio: true,
      audioFormat: "mp3",
      output: "-"
    });

    process.stdout.pipe(res);

  } catch (err) {
    console.error("MP3 ERROR:", err);
    res.status(500).send("Conversion failed");
  }
});


// ✅ START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000");
});