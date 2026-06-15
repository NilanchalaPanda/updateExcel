import express from "express";
import multer from "multer";

import { processCsv } from "./services/csvService.js";

const app = express();

app.use(express.static("public"));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const outputBuffer = await processCsv(req.file.buffer);

    res.setHeader("Content-Type", "text/csv");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="audio-duration-report.csv"`,
    );

    return res.send(outputBuffer);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
