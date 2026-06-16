import csv from "csv-parser";
import { format } from "@fast-csv/format";
import pLimit from "p-limit";
import { Readable } from "stream"
import { getAudioDuration, formatDuration } from "./audioService.js";

const limit = pLimit(5);

export async function processCsv(buffer) {
  const rows = [];

  await new Promise((resolve, reject) => {
    const readable = new Readable();

    readable.push(buffer);
    readable.push(null);

    readable
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  await Promise.all(
    rows.map((row, index) =>
      limit(async () => {
        const audioUrl = row["Audio Link"];

        if (!audioUrl) {
          return;
        }

        try {
          const duration = await getAudioDuration(audioUrl);

          row["Actual Audio Duration (Seconds)"] = duration;

          row["Actual Audio Duration (Formatted)"] = formatDuration(duration);
        } catch (error) {
          row["Actual Audio Duration (Seconds)"] = "ERROR";

          row["Actual Audio Duration (Formatted)"] = "ERROR";
        }
      }),
    ),
  );

  return await generateCsvBuffer(rows);
}

function generateCsvBuffer(rows) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    const csvStream = format({
      headers: true,
    });

    csvStream.on("data", (chunk) => chunks.push(chunk));

    csvStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    csvStream.on("error", reject);

    rows.forEach((row) => csvStream.write(row));

    csvStream.end();
  });
}
