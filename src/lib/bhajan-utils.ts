import type { Bhajan } from "./types";

export function capitalizeEachWord(text: string): string {
  if (!text) return "";
  return text
    .split("\n")
    .map((line) =>
      line
        .split(/\s+/)
        .map((word) => {
          if (!word) return "";
          // Capitalize first letter, keep/lowercase rest of the word
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ")
    )
    .join("\n");
}

export function cleanForComparison(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Normalizes text for broader search matching by reducing spelling variations.
 * Collapses double vowels and aspirated consonants to their simpler forms.
 */
export function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/aa/g, "a")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/dh/g, "d")
    .replace(/th/g, "t")
    .replace(/bh/g, "b")
    .replace(/ph/g, "p");
}

export function getWordSimilarity(s1: string, s2: string): number {
  if (!s1 || !s2) return 0;
  const words1 = new Set(s1.toLowerCase().match(/[a-z0-9]+/g) || []);
  const words2 = new Set(s2.toLowerCase().match(/[a-z0-9]+/g) || []);
  
  if (words1.size === 0 && words2.size === 0) return 1.0;
  
  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

export interface DuplicateCheckResult {
  exactDuplicate: Bhajan | null;
  variationDuplicate: Bhajan | null;
}

export function checkDuplicateBhajan(
  title: string,
  lyrics: string,
  allBhajans: Bhajan[],
  sourceLink?: string | null
): DuplicateCheckResult {
  const formattedLyrics = capitalizeEachWord(lyrics);
  const cleanLyricsInput = cleanForComparison(formattedLyrics);
  
  let exactDuplicate: Bhajan | null = null;
  let variationDuplicate: Bhajan | null = null;
  
  for (const b of allBhajans) {
    const cleanBLyrics = cleanForComparison(b.lyrics);
    if (cleanBLyrics === cleanLyricsInput) {
      exactDuplicate = b;
      break;
    }
    
    // Only check for variation duplicates if they share the same non-empty sourceLink
    if (
      sourceLink &&
      b.sourceLink &&
      sourceLink.trim().toLowerCase() === b.sourceLink.trim().toLowerCase()
    ) {
      variationDuplicate = b;
    }
  }
  
  return { exactDuplicate, variationDuplicate };
}
