const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = async (req, res) => {
    const { url, type } = req.query;

    if (!url) {
        return res.status(400).json({ error: "URL required" });
    }

    try {
        // ✅ VIDEO INFO
        if (!type) {
            const info = await ytdl.getInfo(url);

            return res.status(200).json({
                title: info.videoDetails.title,
                thumbnail: info.videoDetails.thumbnails[0].url,
                length: info.videoDetails.lengthSeconds,
            });
        }

        // ⚠️ VIDEO DOWNLOAD
        if (type === "mp4") {
            res.setHeader("Content-Disposition", "attachment; filename=video.mp4");
            return ytdl(url, { filter: "audioandvideo" }).pipe(res);
        }

        // ⚠️ MP3 DOWNLOAD
        if (type === "mp3") {
            res.setHeader("Content-Disposition", "attachment; filename=audio.mp3");

            return ffmpeg(ytdl(url, { quality: "highestaudio" }))
                .audioBitrate(128)
                .format("mp3")
                .pipe(res);
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process request" });
    }
};