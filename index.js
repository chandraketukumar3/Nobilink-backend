const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

const API_KEY = "31ee78f03emsh8762673ddb9b0d4p18a8c7jsne1e8c84525c4";
const API_HOST = "youtube-mp3-audio-video-downloader.p.rapidapi.com";

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


// 🔥 WAIT FUNCTION
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


// 🔥 VIDEO DOWNLOAD (FIXED)
app.get("/download-video", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Invalid URL");
    }

    // STEP 1: request
    let response = await fetch(
      `https://${API_HOST}/get_video_download_link/?video_link=${encodeURIComponent(url)}&quality=720&wait_until_the_file_is_ready=false`,
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": API_HOST
        }
      }
    );

    let data = await response.json();
    console.log("STEP 1:", data);

    // STEP 2: WAIT + retry
    if (!data?.download_link) {
      await wait(3000);

      response = await fetch(
        `https://${API_HOST}/get_video_download_link/?video_link=${encodeURIComponent(url)}&quality=720&wait_until_the_file_is_ready=true`,
        {
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": API_HOST
          }
        }
      );

      data = await response.json();
      console.log("STEP 2:", data);
    }

    const downloadUrl = data?.download_link;

    if (!downloadUrl) {
      return res.status(500).send("No video link found");
    }

    res.redirect(downloadUrl);

  } catch (err) {
    console.error("VIDEO ERROR:", err);
    res.status(500).send("Download failed");
  }
});


// 🔥 MP3 DOWNLOAD (FIXED)
app.get("/download-mp3", async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).send("Invalid URL");
    }

    let response = await fetch(
      `https://${API_HOST}/get_mp3_download_link/?video_link=${encodeURIComponent(url)}&quality=128&wait_until_the_file_is_ready=false`,
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": API_HOST
        }
      }
    );

    let data = await response.json();
    console.log("MP3 STEP 1:", data);

    if (!data?.download_link) {
      await wait(3000);

      response = await fetch(
        `https://${API_HOST}/get_mp3_download_link/?video_link=${encodeURIComponent(url)}&quality=128&wait_until_the_file_is_ready=true`,
        {
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": API_HOST
          }
        }
      );

      data = await response.json();
      console.log("MP3 STEP 2:", data);
    }

    const downloadUrl = data?.download_link;

    if (!downloadUrl) {
      return res.status(500).send("No MP3 link found");
    }

    res.redirect(downloadUrl);

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