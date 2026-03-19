const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

// ✅ Health
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ INFO (thumbnail + basic)
app.get("/info", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: "Invalid URL" });
    }

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


// 🔥 MP4 DOWNLOAD (RapidAPI)
app.get("/download-video", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Invalid URL");
    }

    const response = await fetch(
      `https://youtube-mp3-audio-video-downloader.p.rapidapi.com/get_video_download_link/?video_link=${encodeURIComponent(url)}&quality=720`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": "31ee78f03emsh8762673ddb9b0d4p18a8c7jsne1e8c84525c4",
          "X-RapidAPI-Host": "youtube-mp3-audio-video-downloader.p.rapidapi.com"
        }
      }
    );

    const data = await response.json();

    if (!data?.link) {
      console.log(data);
      return res.status(500).send("No video link found");
    }

    res.redirect(data.link);

  } catch (err) {
    console.error("VIDEO ERROR:", err);
    res.status(500).send("Download failed");
  }
});


// 🔥 MP3 DOWNLOAD (RapidAPI)
app.get("/download-mp3", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Invalid URL");
    }

    const response = await fetch(
      `https://youtube-mp3-audio-video-downloader.p.rapidapi.com/get_mp3_download_link/?video_link=${encodeURIComponent(url)}&quality=128`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": "31ee78f03emsh8762673ddb9b0d4p18a8c7jsne1e8c84525c4",
          "X-RapidAPI-Host": "youtube-mp3-audio-video-downloader.p.rapidapi.com"
        }
      }
    );

    const data = await response.json();

    if (!data?.link) {
      console.log(data);
      return res.status(500).send("No MP3 link found");
    }

    res.redirect(data.link);

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