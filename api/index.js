const express = require("express");
const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const cors = require("cors");

const app = express();
app.use(cors());

// ✅ FFmpeg setup
ffmpeg.setFfmpegPath(ffmpegPath);

// ✅ Root route
app.get("/", (req, res) => {
    res.send("Nobilink Backend Running 🚀");
});

// ✅ Video Info
app.get("/info", async (req, res) => {
    try {
        const url = req.query.url;

        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).json({ error: "Invalid URL" });
        }

        const info = await ytdl.getInfo(url);

        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url,
            length: info.videoDetails.lengthSeconds
        });

    } catch (err) {
        console.error("INFO ERROR:", err);
        res.status(500).json({ error: "Failed to fetch video details" });
    }
});

// ✅ Download Video
app.get("/download-video", (req, res) => {
    try {
        const url = req.query.url;

        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).send("Invalid URL");
        }

        res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
        res.setHeader("Content-Type", "video/mp4");

        const stream = ytdl(url, {
            quality: "highest",
            filter: "audioandvideo"
        });

        stream.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error downloading video");
    }
});

// ✅ Download MP3
app.get("/download-mp3", (req, res) => {
    try {
        const url = req.query.url;

        if (!url || !ytdl.validateURL(url)) {
            return res.status(400).send("Invalid URL");
        }

        res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");
        res.setHeader("Content-Type", "audio/mpeg");

        const stream = ytdl(url, { quality: "highestaudio" });

        ffmpeg(stream)
            .audioBitrate(128)
            .format("mp3")
            .on("error", (err) => {
                console.error("FFmpeg Error:", err);
                res.status(500).send("Conversion failed");
            })
            .pipe(res, { end: true });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error converting");
    }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});