require("dotenv").config(); 

console.log("API =", process.env.GROQ_API_KEY);

const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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

    const { prompt } = req.body;

    console.log("Prompt resevwa:");
    console.log(prompt);

    const completion =
      await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [

          {
            role: "system",

            content: `

Ou se Bely AI.

Règ:

- Reponn nan menm lang itilizatè a itilize.
- Itilize tit.
- Itilize soutit.
- Itilize lis nimewote.
- Kite yon liy vid ant seksyon yo.
- Fòmate repons yo tankou ChatGPT.
- Pou quiz yo:
  * kestyon yo dwe nimewote
  * mete A B C D
  * mete "Bon repons:" anba kestyon an

`
          },

          {
            role: "user",
            content: prompt
          }

        ],

        temperature: 0.7

      });

    const answer =
      completion.choices[0].message.content;

    res.json({

      success: true,

      answer

    });

  } catch (error) {

    console.error("ERÈ GROQ:");
    console.error(error);

    res.status(500).json({

      success: false,

      message: error.message

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
  "piper",
  "piper"
);

    const modelPath = path.join(
  __dirname,
  "piper",
  "voices",
  "fr_FR-siwis-medium.onnx"
);

const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(
  "OUTPUT DIR CREATED =",
  fs.existsSync(outputDir)
);

    const outputPath =
      path.join(__dirname, "output", "audio.wav");

console.log("OUTPUT PATH =", outputPath);

console.log(
  "OUTPUT FOLDER EXISTS =",
  fs.existsSync(path.join(__dirname, "output"))
);

    const command =
      `echo "${text}" | "${piperPath}" --model "${modelPath}" --output_file "${outputPath}"`;
   
   exec(`chmod +x "${piperPath}"`, (chmodError) => {

  if (chmodError) {
    console.error("CHMOD ERROR:", chmodError);
  }

});   

   exec(command, (error, stdout, stderr) => {

    console.log("PIPER STDOUT:");
    console.log(stdout);

    console.log("PIPER STDERR:");
    console.log(stderr);

    if (error) {

        console.error("ERÈ GEMINI:", error);

        return res.status(500).json({
            success: false,
            message: "Erè Piper"
        });

    }

    console.log(
  "WAV EXISTS =",
  fs.existsSync(outputPath)
);

    const ffmpegPath = "ffmpeg";

const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

    const mp3Path =
      path.join(__dirname, "output", "audio.mp3");

    const convertCommand =
`${ffmpegPath} -y -i "${outputPath}" "${mp3Path}"`;

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