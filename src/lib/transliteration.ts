"use server";

type Script = "devanagari" | "telugu" | "tamil" | "english";

/**
 * Transliterates Romanized/phonetic text to the target script using Google Input Tools API.
 * Uses 'use server' so this executes securely on the backend without CORS issues.
 */
export async function transliterate(text: string, script: Script): Promise<string> {
  if (script === "english" || !text) return text;

  const map: Record<string, string> = {
    devanagari: "sa-t-i0-und",
    telugu: "te-t-i0-und",
    tamil: "ta-t-i0-und"
  };
  
  const itc = map[script];
  if (!itc) return text;

  const lines = text.split("\n");
  
  const transliteratedLines = await Promise.all(
    lines.map(async (line) => {
      if (!line.trim()) return line;
      
      // Google Input Tools fails/stops translating if a string has too many words (~15+)
      // We chunk the line into smaller word groups to ensure full transliteration.
      const words = line.split(" ");
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < words.length; i += chunkSize) {
        chunks.push(words.slice(i, i + chunkSize).join(" "));
      }

      const transliteratedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          if (!chunk.trim()) return chunk;
          try {
            const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(chunk)}&itc=${itc}&num=1`);
            if (!res.ok) return chunk;
            
            const json = await res.json();
            if (json[0] === "SUCCESS" && json[1] && json[1][0]) {
              return json[1][0][1][0] || chunk;
            }
          } catch (e) {
            // Fallback to original chunk
          }
          return chunk;
        })
      );

      return transliteratedChunks.join(" ");
    })
  );

  return transliteratedLines.join("\n");
}
