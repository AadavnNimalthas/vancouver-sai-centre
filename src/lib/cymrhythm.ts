import type { Bhajan } from "./types";

interface CymRhythmInfo {
  title: string;
  lyrics: string;
  meaning: string;
  language: string;
  tempo: "slow" | "medium" | "fast";
  beatTaal: string;
  category: string;
  sourceLink: string;
}

const MOCK_CYMRHYTHM_BHAJANS: Record<string, CymRhythmInfo> = {
  "shiva-shambho": {
    title: "Shiva Shambho Shambo",
    lyrics: "Shiva Shambho Shambho Shiva Shambho Shambho\nHara Hara Shambho Mahadeva\nGanga Dhara Dhara Shambho Mahadeva\nHala Hala Dhara Shambho Mahadeva",
    meaning: "O Lord Shiva! You are Shambho, the giver of auspiciousness and joy. You are Mahadeva, the supreme Lord, who wears the holy Ganga river in His matted locks and drank the Hala Hala poison to save the universe.",
    language: "Sanskrit",
    tempo: "medium",
    beatTaal: "8 Beat / Keherwa",
    category: "Shiva",
    sourceLink: "https://www.cymrhythm.com/bhajans/shiva-shambho",
  },
  "ganesha-sharanam": {
    title: "Ganesha Sharanam Parama Pavanam",
    lyrics: "Ganesha Sharanam Parama Pavanam\nSathya Sai Sharanam Pranavakaram\nGanesha Sharanam Gauri Putram\nSathya Sai Sharanam Vighna Vinasham",
    meaning: "We take refuge in Lord Ganesha, the supremely holy one, the beloved son of Mother Gauri. We take refuge in Bhagavan Sathya Sai, the embodiment of the sacred Om, who destroys all obstacles on our path.",
    language: "Sanskrit",
    tempo: "slow",
    beatTaal: "8 Beat / Keherwa",
    category: "Ganesha",
    sourceLink: "https://www.cymrhythm.com/bhajans/ganesha-sharanam",
  },
  "hari-hari-bhajan-do": {
    title: "Hari Hari Bhajan Do Mana",
    lyrics: "Hari Hari Bhajan Do Mana Re\nSathya Sai Bhajan Do Mana Re\nKeshava Madhava Hari Hari Bol\nSathya Sai Baba Hari Hari Bol",
    meaning: "O mind, sing the glories of Lord Hari (Vishnu) and Bhagavan Sri Sathya Sai. Chant the divine names of Keshava, Madhava, and Sai.",
    language: "Hindi",
    tempo: "medium",
    beatTaal: "8 Beat / Keherwa",
    category: "Krishna",
    sourceLink: "https://www.cymrhythm.com/bhajans/hari-hari-bhajan-do",
  },
  "sai-prema-pradata": {
    title: "Sai Prema Pradata Anandadatha",
    lyrics: "Sai Prema Pradata Anandadatha\nJagat Pathey Baba Sai Ram\nPrema Pradata Anandadatha\nKaruna Sagar Baba Sai Ram",
    meaning: "Lord Sai is the bestower of pure divine love and infinite bliss. He is the master of the entire cosmos, the ocean of mercy and compassion.",
    language: "Hindi",
    tempo: "fast",
    beatTaal: "8-Beat / Dadra Double",
    category: "Sai",
    sourceLink: "https://www.cymrhythm.com/bhajans/sai-prema-pradata",
  },
};

export async function parseCymRhythmUrl(url: string): Promise<Partial<Bhajan>> {
  if (!url) {
    throw new Error("URL is empty");
  }

  // Clean URL and extract slug
  const trimmed = url.trim().toLowerCase();
  
  // Basic validation
  if (!trimmed.includes("cymrhythm.com")) {
    throw new Error("Not a valid CymRhythm URL");
  }

  // Look for match in mock list
  for (const slug of Object.keys(MOCK_CYMRHYTHM_BHAJANS)) {
    if (trimmed.includes(slug)) {
      const bhajanInfo = MOCK_CYMRHYTHM_BHAJANS[slug];
      return {
        title: bhajanInfo.title,
        lyrics: bhajanInfo.lyrics,
        meaning: bhajanInfo.meaning,
        language: bhajanInfo.language,
        tempo: bhajanInfo.tempo,
        beatTaal: bhajanInfo.beatTaal,
        category: bhajanInfo.category,
        sourceLink: url,
        status: "pending",
        audioUrl: null,
        videoUrl: null,
      };
    }
  }

  // Fallback: If it's a generic CymRhythm URL, extract title from url structure
  // e.g. https://www.cymrhythm.com/bhajans/some-bhajan-title
  try {
    const parts = trimmed.split("/bhajans/");
    if (parts.length > 1) {
      const titleSlug = parts[1].split(/[?#]/)[0];
      const parsedTitle = titleSlug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        title: parsedTitle,
        lyrics: "",
        meaning: "",
        language: "Sanskrit",
        tempo: "medium",
        beatTaal: "8 Beat / Keherwa",
        category: "Sai",
        sourceLink: url,
        status: "pending",
        audioUrl: null,
        videoUrl: null,
      };
    }
  } catch {
    // Ignore and return bare minimum
  }

  return {
    title: "Imported Bhajan",
    lyrics: "",
    meaning: "",
    language: "Sanskrit",
    tempo: "medium",
    beatTaal: "8 Beat / Keherwa",
    category: "Sai",
    sourceLink: url,
    status: "pending",
    audioUrl: null,
    videoUrl: null,
  };
}
