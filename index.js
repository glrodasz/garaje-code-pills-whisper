import fs from "node:fs";
import express from "express";
import ytdl from "ytdl-core";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const PORT = 3000 || process.env.PORT;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/transcribe", async (req, res) => {
  const youtubeURL = req.body.url;

  if (!youtubeURL || !ytdl.validateURL(youtubeURL)) {
    return res.status(400).send("Invalid YouTube URL");
  }

  try {
    const audioFilePath = await downloadAudio(youtubeURL);
    const transcript = await transcribeAudio(audioFilePath);
    fs.unlinkSync(audioFilePath);

    return res.status(200).send(transcript);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function downloadAudio(youtubeURL) {
  const audioFilePath = `${Math.random().toString(36).substring(2)}.mp3`;
  return new Promise((resolve, reject) => {
    ytdl(youtubeURL, { filter: "audioonly" })
      .pipe(fs.createWriteStream(audioFilePath))
      .on("finish", () => resolve(audioFilePath))
      .on("error", reject);
  });
}

async function transcribeAudio(audioFilePath) {
  const audioFile = fs.createReadStream(audioFilePath);

  try {
    const transcript = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
    });
    return transcript;
  } catch (error) {
    console.error("Error:", error);
  }
}
