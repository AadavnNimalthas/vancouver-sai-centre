"use server";

type Script = "devanagari" | "telugu" | "tamil" | "english";

/**
 * Transliterates Romanized/phonetic text to the target script using Google Input Tools API.
 * Uses 'use server' so this executes securely on the backend without CORS issues.
 */
export async function transliterate(text: string, script: Script): Promise<string> {
  if (script === "english" || !text) return text;

  // Map to Google Input Tools language codes
  // Devanagari (Sanskrit) -> sa-t-i0-und
  const map: Record<string, string> = {
    devanagari: "sa-t-i0-und",
    telugu: "te-t-i0-und",
    tamil: "ta-t-i0-und"
  };
  
  const itc = map[script];
  if (!itc) return text;

  // Split by line to preserve formatting and avoid Google API length limits per request
  const lines = text.split("\n");
  
  const transliteratedLines = await Promise.all(
    lines.map(async (line) => {
      // Don't call API for empty lines
      if (!line.trim()) return line;
      
      try {
        const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(line)}&itc=${itc}&num=1`);
        if (!res.ok) return line;
        
        const json = await res.json();
        if (json[0] === "SUCCESS" && json[1] && json[1][0]) {
          return json[1][0][1][0] || line;
        }
      } catch (e) {
        // Fallback to original line on error
      }
      return line;
    })
  );

  return transliteratedLines.join("\n");
}
