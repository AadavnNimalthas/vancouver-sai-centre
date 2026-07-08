import PipelineSingleton from "./transformers";

/**
 * Generates a vector embedding for the given text using local Xenova/all-MiniLM-L6-v2.
 * Returns a 384-dimensional vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Clean up the text: remove excess whitespace and newlines
  const cleanedText = text.replace(/\s+/g, " ").trim();
  
  const extractor = await PipelineSingleton.getInstance();
  const output = await extractor(cleanedText, { pooling: 'mean', normalize: true });
  
  // Convert Float32Array to standard JS Array
  return Array.from(output.data);
}

/**
 * Helper to construct a rich text representation of a bhajan for optimal embedding matches.
 */
export function buildBhajanEmbeddingText(bhajan: {
  title: string;
  category: string;
  language: string;
  tempo: string;
  beatTaal?: string | null;
  lyrics: string;
  meaning?: string | null;
}): string {
  const parts = [
    `Title: ${bhajan.title}`,
    `Category/Deity: ${bhajan.category}`,
    `Language: ${bhajan.language}`,
    `Tempo: ${bhajan.tempo}`,
  ];
  
  if (bhajan.beatTaal) {
    parts.push(`Beat/Taal: ${bhajan.beatTaal}`);
  }
  
  parts.push(`Lyrics:\n${bhajan.lyrics}`);
  
  if (bhajan.meaning) {
    parts.push(`Meaning:\n${bhajan.meaning}`);
  }
  
  return parts.join("\n");
}
