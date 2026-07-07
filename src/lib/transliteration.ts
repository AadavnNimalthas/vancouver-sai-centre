/**
 * Light-weight client-side transliteration utility for Romanized Indian lyrics.
 * Supports Devanagari (Sanskrit/Hindi), Telugu, and Tamil.
 */

type Script = "devanagari" | "telugu" | "tamil";

interface MappingTable {
  vowels: Record<string, string>;
  matras: Record<string, string>;
  consonants: Record<string, string>;
  virama: string;
}

const VOWEL_KEYS = [
  "aa", "ā", "ee", "ii", "ī", "uu", "ū", "oo", "ai", "au",
  "am", "an", "ah", "aḥ", "a", "i", "u", "e", "o", "R", "ṛ"
];

const CONSONANT_KEYS = [
  "ksh", "shr", "chh", "ch", "kh", "gh", "ng", "jh", "ny",
  "th", "dh", "ph", "bh", "shh", "sh", "k", "g", "j", "t",
  "d", "n", "p", "b", "m", "y", "r", "l", "v", "w", "s", "h",
  "T", "D", "N", "S", "L", "R", "ñ", "ś", "ṣ", "ṇ", "ṭ", "ḍ", "ḷ"
];

const DEVANAGARI: MappingTable = {
  vowels: {
    a: "अ", aa: "आ", ā: "आ", i: "इ", ii: "ई", ee: "ई", ī: "ई",
    u: "उ", uu: "ऊ", oo: "ऊ", ū: "ऊ", e: "ए", o: "ओ", ai: "ऐ", au: "औ",
    am: "अं", an: "अं", ah: "अः", aḥ: "अः", R: "ऋ", ṛ: "ऋ"
  },
  matras: {
    a: "", aa: "ा", ā: "ा", i: "ि", ii: "ी", ee: "ी", ī: "ी",
    u: "ु", uu: "ू", oo: "ू", ū: "ू", e: "े", o: "ो", ai: "ै", au: "ौ",
    am: "ं", an: "ं", ah: "ः", aḥ: "ः", R: "ृ", ṛ: "ृ"
  },
  consonants: {
    ksh: "क्ष", shr: "श्र", chh: "छ", ch: "च", kh: "ख", gh: "घ", ng: "ङ",
    jh: "झ", ny: "ञ", th: "थ", dh: "ध", ph: "फ", bh: "भ",
    shh: "ष", S: "ष", ṣ: "ष", sh: "श", ś: "श", k: "क", g: "ग", j: "ज",
    t: "त", d: "द", n: "न", p: "प", b: "ब", m: "म",
    y: "य", r: "र", l: "ल", v: "व", w: "व", s: "स", h: "ह",
    T: "ट", ṭ: "ट", D: "ड", ḍ: "ड", N: "ण", ṇ: "ण", L: "ळ", ḷ: "ळ", R: "र"
  },
  virama: "्"
};

const TELUGU: MappingTable = {
  vowels: {
    a: "అ", aa: "ఆ", ā: "ఆ", i: "ఇ", ii: "ఈ", ee: "ఈ", ī: "ఈ",
    u: "ఉ", uu: "ఊ", oo: "ఊ", ū: "ఊ", e: "ఏ", o: "ఓ", ai: "ఐ", au: "ఔ",
    am: "అం", an: "అం", ah: "అః", aḥ: "అః", R: "ఋ", ṛ: "ఋ"
  },
  matras: {
    a: "", aa: "ా", ā: "ా", i: "ి", ii: "ీ", ee: "ీ", ī: "ీ",
    u: "ు", uu: "ూ", oo: "ూ", ū: "ూ", e: "ే", o: "ో", ai: "ై", au: "ౌ",
    am: "ం", an: "ం", ah: "ః", aḥ: "ః", R: "ృ", ṛ: "ృ"
  },
  consonants: {
    ksh: "క్ష", shr: "శ్ర", chh: "ఛ", ch: "చ", kh: "ఖ", gh: "ఘ", ng: "ఙ",
    jh: "ఝ", ny: "ఞ", th: "థ", dh: "ధ", ph: "ఫ", bh: "భ",
    shh: "ష", S: "ష", ṣ: "ష", sh: "శ", ś: "శ", k: "క", g: "గ", j: "జ",
    t: "త", d: "ద", n: "న", p: "ప", b: "బ", m: "మ",
    y: "య", r: "ర", l: "ల", v: "వ", w: "వ", s: "స", h: "హ",
    T: "ట", ṭ: "ట", D: "డ", ḍ: "డ", N: "ణ", ṇ: "ణ", L: "ళ", ḷ: "ళ", R: "ర"
  },
  virama: "్"
};

const TAMIL: MappingTable = {
  vowels: {
    a: "அ", aa: "ஆ", ā: "ஆ", i: "இ", ii: "ஈ", ee: "ஈ", ī: "ஈ",
    u: "உ", uu: "ஊ", oo: "ஊ", ū: "ஊ", e: "ஏ", o: "ஓ", ai: "ஐ", au: "ஔ",
    am: "அம்", an: "அம்", ah: "அ", aḥ: "அ", R: "இரு", ṛ: "இரு"
  },
  matras: {
    a: "", aa: "ா", ā: "ா", i: "ி", ii: "ீ", ee: "ீ", ī: "ீ",
    u: "ு", uu: "ூ", oo: "ூ", ū: "ூ", e: "ே", o: "ோ", ai: "ை", au: "ௌ",
    am: "ம்", an: "ம்", ah: "", aḥ: "", R: "ிரு", ṛ: "ிரு"
  },
  consonants: {
    ksh: "க்ஷ", shr: "ஶ்ர", chh: "ச", ch: "ச", kh: "க", gh: "க", ng: "ங",
    jh: "ச", ny: "ஞ", th: "த", dh: "த", ph: "ப", bh: "ப",
    shh: "ஷ", S: "ஷ", ṣ: "ஷ", sh: "ஶ", ś: "ஶ", k: "க", g: "க", j: "ஜ",
    t: "த", d: "த", n: "ந", p: "ப", b: "ப", m: "ம",
    y: "ய", r: "ர", l: "ல", v: "வ", w: "வ", s: "ஸ", h: "ஹ",
    T: "ட", ṭ: "ட", D: "ட", ḍ: "ட", N: "ண", ṇ: "ண", L: "ள", ḷ: "ள", R: "ர"
  },
  virama: "்"
};

const TABLES: Record<Script, MappingTable> = {
  devanagari: DEVANAGARI,
  telugu: TELUGU,
  tamil: TAMIL
};

/**
 * Transliterates Romanized/phonetic text to the target script.
 */
export function transliterate(text: string, script: Script): string {
  const table = TABLES[script];
  if (!table) return text;

  // Split input into lines, then transliterate word by word
  return text
    .split("\n")
    .map((line) =>
      line
        .split(" ")
        .map((word) => transliterateWord(word, table))
        .join(" ")
    )
    .join("\n");
}

function transliterateWord(word: string, table: MappingTable): string {
  // Strip punctuation but keep track of it to put it back
  const cleanWord = word.replace(/[^a-zA-ZāīūṇṭḍḷśṣñāīūṛR]/g, "");
  if (!cleanWord) return word;

  let result = "";
  let i = 0;
  const len = cleanWord.length;

  while (i < len) {
    // 1. Try to match consonant cluster
    let consonantMatch = "";
    let matchedConsonantLen = 0;

    for (const key of CONSONANT_KEYS) {
      if (cleanWord.slice(i).toLowerCase().startsWith(key.toLowerCase())) {
        consonantMatch = table.consonants[key] || "";
        matchedConsonantLen = key.length;
        break;
      }
    }

    if (consonantMatch) {
      i += matchedConsonantLen;

      // 2. Look for vowel immediately after this consonant
      let vowelMatch = "";
      let matchedVowelLen = 0;

      for (const key of VOWEL_KEYS) {
        if (cleanWord.slice(i).toLowerCase().startsWith(key.toLowerCase())) {
          vowelMatch = table.matras[key] ?? "";
          matchedVowelLen = key.length;
          break;
        }
      }

      if (vowelMatch !== "") {
        // Consonant + Vowel
        result += consonantMatch + vowelMatch;
        i += matchedVowelLen;
      } else {
        // Consonant at end of word or consonant cluster/conjunct: needs virama/halant
        // If it's the last character of the word and it's 'm', in Sanskrit it is often anusvara
        // but if it is mapped as raw consonant, we apply virama
        if (i === len) {
          result += consonantMatch + table.virama;
        } else {
          result += consonantMatch + table.virama;
        }
      }
    } else {
      // 3. Match independent vowel
      let vowelMatch = "";
      let matchedVowelLen = 0;

      for (const key of VOWEL_KEYS) {
        if (cleanWord.slice(i).toLowerCase().startsWith(key.toLowerCase())) {
          vowelMatch = table.vowels[key] || "";
          matchedVowelLen = key.length;
          break;
        }
      }

      if (vowelMatch) {
        result += vowelMatch;
        i += matchedVowelLen;
      } else {
        // Unknown character: skip
        result += cleanWord[i];
        i++;
      }
    }
  }

  // Restore non-alphabetic chars at correct locations (prefix/suffix)
  const prefixMatch = word.match(/^[^a-zA-ZāīūṇṭḍḷśṣñāīūṛR]+/);
  const suffixMatch = word.match(/[^a-zA-ZāīūṇṭḍḷśṣñāīūṛR]+$/);

  const prefix = prefixMatch ? prefixMatch[0] : "";
  const suffix = suffixMatch ? suffixMatch[0] : "";

  return prefix + result + suffix;
}
