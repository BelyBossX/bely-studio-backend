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

        console.log("BACKEND VERSION: GEMINI 2.0");

        const { prompt } = req.body;

        let response;

let attempts = 3;

while (attempts > 0) {

  try {

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
- Lè itilizatè a mande eksplikasyon, bay egzanp konkrè.
- Lè itilizatè a mande kontni kreyatif, fè l kaptivan ak pwofesyonèl.

Demann itilizatè a:

${prompt}
`
    });

    break;

  } catch (error) {

    if (
      error.message.includes("503") &&
      attempts > 1
    ) {

      console.log(
        `Gemini chaje. Nou pral re-eseye... (${attempts - 1} tantativ ki rete)`
      );

      await new Promise(resolve =>
        setTimeout(resolve, 3000)
      );

    } else {

      throw error;

    }

  }

  attempts--;

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