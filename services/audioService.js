import ffprobe from "ffprobe-static";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const durationCache = new Map();

export async function getAudioDuration(url) {
  if (!url) {
    return null;
  }

  const cached = durationCache.get(url);

  if (cached) {
    return cached;
  }

  const { stdout } = await execFileAsync(ffprobe.path, [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    url,
  ]);

  const duration = Math.floor(parseFloat(stdout.trim()));

  durationCache.set(url, duration);

  return duration;
}

export function formatDuration(seconds) {
  if (!seconds) {
    return "0 secs";
  }

  if (seconds < 60) {
    return `${seconds.toFixed(3)} secs`;
  }

  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);

  return `${mins}m ${secs}s`;
}
