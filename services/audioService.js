import { parseStream } from "music-metadata";
import got from "got";

/**
 * Get audio duration from a remote URL (Supabase supported)
 */
export async function getAudioDuration(url) {
  if (!url) return null;

  try {
    // Create readable stream from URL
    const stream = got.stream(url);

    // Extract metadata
    const metadata = await parseStream(stream, null, {
      duration: true,
    });

    const duration = Math.floor(metadata.format.duration || 0);

    return duration;
  } catch (err) {
    console.error("Error getting duration:", err.message);
    return null;
  }
}

/**
 * Format duration nicely
 */
export function formatDuration(seconds) {
  if (!seconds) return "0 secs";

  if (seconds < 60) {
    return `${seconds.toFixed(3)} secs`;
  }

  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);

  return `${mins}m ${secs}s`;
}
