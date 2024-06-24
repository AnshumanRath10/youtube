import videoFiles from "../models/videoFiles.js";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { dirname } from "path";
import { fileURLToPath } from "url";

ffmpeg.setFfmpegPath(ffmpegStatic);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadVideo = async (req, res, next) => {
  if (req.file === undefined) {
    res.status(404).json({ message: "plz Upload a '.mp4' video file only " });
  } else {
    try {
      const filePath = path.join(__dirname, "..", req.file.path);
      const outputDir = path.join(__dirname, "..", "uploads", "output");

      // Ensure the output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const resolutions = [
        { width: 1920, height: 1080, label: "1080p" },
        { width: 1280, height: 720, label: "720p" },
        { width: 854, height: 480, label: "480p" },
        { width: 640, height: 360, label: "360p" },
      ];

      let transcodePromises = resolutions.map(resolution => {
        return new Promise((resolve, reject) => {
          const outputFilePath = path.join(outputDir, `${req.file.filename}-${resolution.label}.mp4`);
          ffmpeg(filePath)
            .output(outputFilePath)
            .videoCodec('libx264')
            .size(`${resolution.width}x${resolution.height}`)
            .on('end', () => {
              resolve(outputFilePath);
            })
            .on('error', (err) => {
              console.error(`Error transcoding to ${resolution.label}`, err);
              reject(`Error: ${err.message}`);
            })
            .run();
        });
      });

      await Promise.all(transcodePromises)
        .then((outputFiles) => {
          console.log("Videos transcoded successfully", outputFiles);
        })
        .catch((error) => {
          console.error("Error transcoding videos", error);
          // res.status(500).json({ error: error });
        });

      const file = new videoFiles({
        videoTitle: req.body.title,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        videoChanel: req.body.chanel,
        Uploder: req.body.Uploder,
      });
      //   console.log(file);
      await file.save();
      res.status(200).send("File uploded successfully");
    } catch (error) {
      console.log("Error=>", error);
      res.status(400).send(error.message);
    }
  }
};
export const getAllvideos = async (req, res) => {
  try {
    const files = await videoFiles.find();
    res.status(200).send(files)
  } catch (error) {
    res.status(404).send(error.message)
  }
}