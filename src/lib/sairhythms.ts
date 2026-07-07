import type { Bhajan, BhajanTempo } from "./types";
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

function extractMetaRow(html: string, labelText: string): string {
  const regex = new RegExp(`strong['"]?[^>]*>\\s*${labelText}\\s*<\\/div>\\s*<div[^>]*>([\\s\\S]*?)<\\/div>`, "i");
  const match = html.match(regex);
  if (match) {
    return stripTags(match[1]).trim();
  }
  return "";
}

/**
 * Extract a bhajan from the HTML of a SaiRhythms song page.
 * Returns whatever it can find; callers should treat missing lyrics as a
 * failed import (likely not a song page).
 */
export function parseSaiRhythmsHtml(rawHtml: string, url: string): Partial<Bhajan>[] {
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

  // ── Beat ──
  let beatTaal = "";
  const rawBeat = extractMetaRow(html, "Beat");
  if (rawBeat) {
    const match = rawBeat.match(/(\d+)/);
    if (match) {
      beatTaal = match[1];
    }
  }
  if (!beatTaal) {
    for (const m of html.matchAll(/class=['"]label label-default['"][^>]*>(.*?)<\/span>/gi)) {
      const label = stripTags(m[1]);
      const beat = label.match(/(\d+)\s*Beat/i);
      if (beat) {
        beatTaal = beat[1];
        break;
      }
    }
  }

  // ── Deity / Category ──
  const rawDeity = extractMetaRow(html, "Deity");
  let category = "";
  if (rawDeity) {
    const cleanDeity = rawDeity.toLowerCase().trim();
    const directMatch = BHAJAN_DEITY_OPTIONS.find(
      (opt) => opt.toLowerCase() === cleanDeity
    );
    if (directMatch) {
      category = directMatch;
    } else {
      const subMatch = BHAJAN_DEITY_OPTIONS.find(
        (opt) => cleanDeity.includes(opt.toLowerCase())
      );
      if (subMatch) {
        category = subMatch;
      }
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

  // ── Languages ──
  const mainLanguage = extractMetaRow(html, "Language") || "Sanskrit";
  const altLanguages: string[] = [];
  for (const m of html.matchAll(/class=['"]alt-lyrics-title['"][^>]*>(.*?)<\/a>/gi)) {
    const lang = stripTags(m[1]).trim();
    if (lang) {
      altLanguages.push(lang);
    }
  }
  const languagesList = [mainLanguage, ...altLanguages];

  // ── Tempo ──
  const rawTempo = extractMetaRow(html, "Tempo");
  let tempo: BhajanTempo = "medium";
  if (rawTempo) {
    const t = rawTempo.toLowerCase().trim();
    if (t === "slow" || t === "medium slow") {
      if (!beatTaal || beatTaal === "0" || beatTaal === "6" || /no beat/i.test(rawBeat)) {
        tempo = "melodic";
      } else {
        tempo = "slow";
      }
    } else if (t === "medium") {
      tempo = "medium";
    } else if (t === "medium fast") {
      tempo = "fast";
    } else if (t === "fast" || t === "very fast") {
      tempo = "very_fast";
    }
  }

  // ── Lyrics Sets ──
  const parts = html.split(/<div class=['"]lyrics-set['"]>/i);
  const versions: Partial<Bhajan>[] = [];

  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      const block = parts[i].split(/<!--\s*\.devotional-song-content|<hr/i)[0];
      const lyrics = [
        ...block.matchAll(/class=['"](?:song-first-line|song-line)['"][^>]*>([\s\S]*?)<\/div>/gi),
      ]
        .map((m) => stripTags(m[1]).trim())
        .filter(Boolean)
        .join("\n");

      if (!lyrics) continue;

      const language = languagesList[i - 1] || mainLanguage;

      versions.push({
        title,
        lyrics,
        meaning,
        language,
        tempo,
        beatTaal,
        category: category || guessCategory(title, lyrics),
        sourceLink: url,
        status: "pending",
        audioUrl: null,
        videoUrl: null,
      });
    }
  }

  if (versions.length === 0) {
    const lyrics = [
      ...html.matchAll(/class=['"](?:song-first-line|song-line)['"][^>]*>([\s\S]*?)<\/div>/gi),
    ]
      .map((m) => stripTags(m[1]).trim())
      .filter(Boolean)
      .join("\n");

    if (lyrics) {
      versions.push({
        title,
        lyrics,
        meaning,
        language: mainLanguage,
        tempo,
        beatTaal,
        category: category || guessCategory(title, lyrics),
        sourceLink: url,
        status: "pending",
        audioUrl: null,
        videoUrl: null,
      });
    }
  }

  return versions;
}
