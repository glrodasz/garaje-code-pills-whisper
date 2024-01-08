import fs from "node:fs";
import OpenAI from "openai";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


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


const transcription = await transcribeAudio("./audio.mp3")
console.log(transcription);