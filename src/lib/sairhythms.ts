import type { Bhajan } from "./types";
import { BHAJAN_DEITY_OPTIONS } from "./types";

/**
 * Parsers for SaiRhythms song pages (sairhythms.sathyasai.org).
 *
 * The site is a Drupal 7 app that serves song pages at
 *   https://sairhythms.sathyasai.org/song/<slug>
 * where the slug is the title with spaces turned into hyphens (and an
 * occasional trailing "-<number>" to disambiguate duplicates).
 *
 * These are pure functions so they can be unit-reasoned and run on the
 * server. The network fetch lives in the `importFromSaiRhythms` server
 * action (a browser fetch would be blocked by CORS).
 */

const ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&rsquo;": "’",
  "&lsquo;": "‘",
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&mdash;": "—",
  "&ndash;": "–",
};

function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m);
}

function stripTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]+>/g, "")).replace(/ /g, " ");
}

/** "Sai Natha Bhagawan" — first letter of every word capitalised. */
export function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Derive a readable title from a /song/<slug> URL. */
export function titleFromSaiRhythmsUrl(url: string): string {
  const afterSong = url.split(/\/song\/+/i)[1];
  if (!afterSong) return "";
  const slug = decodeURIComponent(afterSong.split(/[?#]/)[0])
    // drop Drupal's duplicate-disambiguation suffix, e.g. "sai-ram-sai-ram-0"
    .replace(/-\d+$/, "");
  return toTitleCase(slug.replace(/-+/g, " ").trim());
}

/** Guess the deity/category by looking for a known name in the title/lyrics. */
function guessCategory(title: string, lyrics: string): string {
  const hay = `${title} ${lyrics}`.toLowerCase();
  // Longer names first so "Subrahmanya" wins over a stray "rama" inside it.
  const ordered = [...BHAJAN_DEITY_OPTIONS].sort((a, b) => b.length - a.length);
  for (const deity of ordered) {
    if (new RegExp(`\\b${deity.toLowerCase()}`, "i").test(hay)) return deity;
  }
  return "";
}

/**
 * Extract a bhajan from the HTML of a SaiRhythms song page.
 * Returns whatever it can find; callers should treat missing lyrics as a
 * failed import (likely not a song page).
 */
export function parseSaiRhythmsHtml(rawHtml: string, url: string): Partial<Bhajan> {
  const html = rawHtml.replace(/\s+/g, " ");

  // ── Title: prefer the page <title>, fall back to the URL slug ──
  let title = "";
  const titleTag = html.match(/<title>(.*?)<\/title>/i);
  if (titleTag) {
    title = stripTags(titleTag[1]).replace(/\s*\|\s*Sai Rhythms\s*$/i, "").trim();
  }
  if (!title || /resource not found/i.test(title)) {
    title = titleFromSaiRhythmsUrl(url);
  } else {
    title = toTitleCase(title);
  }

  // ── Lyrics: the first `lyrics-set` block, line by line ──
  const setMatch = html.match(
    /<div class=['"]lyrics-set['"]>([\s\S]*?)(?:<div class=['"]lyrics-set['"]>|<!--\s*\.devotional-song-content|<hr)/i
  );
  const block = setMatch ? setMatch[1] : html;
  const lyrics = [
    ...block.matchAll(/class=['"](?:song-first-line|song-line)['"][^>]*>([\s\S]*?)<\/div>/gi),
  ]
    .map((m) => stripTags(m[1]).trim())
    .filter(Boolean)
    .join("\n");

  // ── Beat: the metadata label that reads "<n> Beat" → just the number ──
  let beatTaal = "";
  for (const m of html.matchAll(/class=['"]label label-default['"][^>]*>(.*?)<\/span>/gi)) {
    const label = stripTags(m[1]);
    const beat = label.match(/(\d+)\s*Beat/i);
    if (beat) {
      beatTaal = beat[1];
      break;
    }
  }

  // ── Meaning: the blue "alert-info" box below the lyrics ──
  let meaning = "";
  const meaningBox = html.match(/devotional-song-meaning[^>]*>([\s\S]*?)<\/div>/i);
  if (meaningBox) {
    meaning = stripTags(meaningBox[1].replace(/<br\s*\/?>/gi, "\n"))
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  // ── Language: the first lyrics tab label (e.g. "Sanskrit / Hindi") ──
  let language = "Sanskrit";
  const langTab = html.match(/class=['"]alt-lyrics-title['"][^>]*>(.*?)<\/a>/i);
  if (langTab) {
    const raw = stripTags(langTab[1]).trim();
    if (raw) language = raw;
  }

  return {
    title,
    lyrics,
    meaning,
    language,
    tempo: "medium",
    beatTaal,
    category: guessCategory(title, lyrics),
    sourceLink: url,
    status: "pending",
    audioUrl: null,
    videoUrl: null,
  };
}
