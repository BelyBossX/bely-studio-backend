const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const { GoogleGenAI } = require("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const app = express();

app.use(cors());
app.use(express.json());

app.use("/audio", express.static("output"));

app.get("/", (req, res) => {

    res.json({
        message: "Backend Bely Studio ap mache"
    });

});

app.post("/ask-ai", async (req, res) => {

    try {

        console.log("Prompt resevwa:");
        console.log(req.body);

        const { prompt } = req.body;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.json({
            success: true,
            answer: response.text
        });

    } 
    
    catch (error) {

  console.error("ERÈ GEMINI:");
  console.error(error);

  res.status(500).json({

    success:false,

    message:error.message

  });

}

});

app.post("/generate", (req, res) => {

    const {
  text,
  voice
} = req.body;

console.log(
  "Voice:",
  voice
);

    const piperPath =
      "C:\\Users\\belyf\\OneDrive\\Desktop\\Bely Studio\\piper\\piper.exe";

    const modelPath =
      "C:\\Users\\belyf\\OneDrive\\Desktop\\Bely Studio\\piper\\voices\\en_US-lessac-medium.onnx";

    const outputPath =
      path.join(__dirname, "output", "audio.wav");

    const command =
      `echo "${text}" | "${piperPath}" --model "${modelPath}" --output_file "${outputPath}"`;

   exec(command, (error) => {

    if (error) {

        console.error("ERÈ GEMINI:", error);

        return res.status(500).json({
            success: false,
            message: "Erè Piper"
        });

    }

    const ffmpegPath =
      "C:\\ffmpeg\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe";

    const mp3Path =
      path.join(__dirname, "output", "audio.mp3");

    const convertCommand =
      `"${ffmpegPath}" -y -i "${outputPath}" "${mp3Path}"`;

    exec(convertCommand, (ffmpegError) => {

        if (ffmpegError) {

            console.error(ffmpegError);

            return res.status(500).json({
                success: false,
                message: "Erè FFmpeg"
            });

        }

        res.json({
            success: true,
            message: "MP3 kreye!",
            audio: "audio.mp3"
        });

    });

});

});

app.listen(5000, () => {

    console.log(
        "Server lan sou port 5000"
    );

});