const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const { GoogleGenAI } = require("@google/genai");

const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
].filter(Boolean);

console.log(
  "API keys chaje:",
  apiKeys.length
);

apiKeys.forEach((key, index) => {
  console.log(
    `Key ${index + 1}:`,
    key.substring(0, 12)
  );
});

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

        console.log("BACKEND VERSION: GEMINI 2.0");

        const { prompt } = req.body;

let response;
let success = false;

for (const key of apiKeys) {

  try {

    console.log("N ap itilize yon nouvo API key...");

    const ai = new GoogleGenAI({
      apiKey: key
    });

    response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
Ou se Bely AI, yon asistan entèlijan, pwofesyonèl ak itil.

Règ pou repons yo:

- Toujou reponn nan menm lang itilizatè a itilize.
- Ekri ak yon ton natirèl ak fasil pou konprann.
- Separe lide yo an paragraf klè.
- Kite yon liy vid ant chak paragraf.
- Itilize tit ak soutit lè sa nesesè.
- Itilize lis bal (•) oswa nimewo lè sa itil.
- Evite gwo blòk tèks ki difisil pou li.
- Bay repons ki byen estriktire sou telefòn ak òdinatè.

Demann itilizatè a:

${prompt}
`
    });

    success = true;

    break;

  } catch (error) {

    console.error("API key sa a echwe:", error.message);

    if (!error.message.includes("429")) {

      throw error;

    }

  }

}

if (!success) {

  return res.status(500).json({
    success: false,
    message: "Tout API keys yo rive nan limit yo."
  });

}

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

    console.log("BOUTON JENERE A RELE ROUTE /generate");

    console.log("=== YON DEMANN RIVE ===");

    console.log("Tout sa frontend voye:");
    console.log(req.body);

    const {
      text,
      voice
    } = req.body;

    console.log("TEXT:", text);
    console.log("VOICE:", voice);

    const piperPath = path.join(
  __dirname,
  "..",
  "piper",
  "piper.exe"
);

    const modelPath = path.join(
  __dirname,
  "..",
  "piper",
  "voices",
  "fr_FR-siwis-medium.onnx"
);

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