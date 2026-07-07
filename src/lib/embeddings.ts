import OpenAI from "openai";

// Lazily initialize OpenAI client so it doesn't break if API key is missing on the client-side
let openai: OpenAI | null = null;

export function getOpenAIClient() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in the environment.");
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Generates a vector embedding for the given text using text-embedding-3-small.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  
  // Clean up the text: remove excess whitespace and newlines
  const cleanedText = text.replace(/\s+/g, " ").trim();
  
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: cleanedText,
    encoding_format: "float",
  });
  
  return response.data[0].embedding;
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
