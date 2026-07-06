import fs from "fs";
import path from "path";
import { defaultSiteContent, defaultWings, localAdmin } from "./demo-data";
import type {
  AccessRequest,
  Album,
  Announcement,
  Bhajan,
  BhajanSignUpForm,
  BhajanSubmission,
  Book,
  FormResponse,
  Post,
  Profile,
  Registration,
  Resource,
  SaiEvent,
  SaiForm,
  SiteContent,
  Wing,
} from "./types";

/**
 * Local database used when no Supabase project is connected.
 * File-backed so content survives dev-server restarts, and it starts
 * empty: everything is created through the admin console, exactly as it
 * would be in production. Delete `.local-db.json` to reset.
 */
export interface LocalDb {
  version: number;
  events: SaiEvent[];
  forms: SaiForm[];
  posts: Post[];
  resources: Resource[];
  books: Book[];
  albums: Album[];
  announcements: Announcement[];
  registrations: Registration[];
  profiles: Profile[];
  wings: Wing[];
  siteContent: SiteContent;
  accessRequests: AccessRequest[];
  contactMessages: { id: string; name: string; email: string; subject: string; message: string; createdAt: string }[];
  bhajans: Bhajan[];
  signupForms: BhajanSignUpForm[];
  submissions: BhajanSubmission[];
  favorites: { userId: string; bhajanId: string }[];
  formResponses: FormResponse[];
}

const STORE_VERSION = 2;
const STORE_PATH = path.join(process.cwd(), ".local-db.json");

function initialDb(): LocalDb {
  return {
    version: STORE_VERSION,
    events: [],
    forms: [],
    posts: [
      {
        id: "hero-picnic",
        title: "Annual Sai Picnic 2026",
        description: "Join us for our annual family picnic at Deas Island Regional Park in Delta. Saturday, July 25, 2026 from 10 AM to 2 PM. Potluck lunch details inside.",
        body: "Sai Ram! We warmly invite all families and members to our annual Sai Picnic.\n\nDate: Saturday, July 25, 2026\nTime: 10:00 AM - 2:00 PM\nLocation: Deas Island Regional Park, Delta\n\nThere will be games, devotional music, and a potluck lunch. Please register via the portal so that we can coordinate the potluck dishes accordingly.",
        imageUrl: "/images/event-picnic.jpg",
        videoUrl: null,
        instagramUrl: null,
        ctaLabel: "Register for Picnic",
        ctaUrl: "/portal",
        placements: ["featured"],
        membersOnly: false,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "hero-gurupoornima",
        title: "Guru Poornima Celebrations",
        description: "Devotional program dedicated to our beloved spiritual teacher. Wednesday, July 29, 2026 from 7:30 PM to 9:00 PM at the Vancouver Sai Centre.",
        body: "Offering our loving pranams at the lotus feet of our master on this auspicious day of Guru Poornima.\n\nDate: Wednesday, July 29, 2026\nTime: 7:30 PM - 9:00 PM\nProgram includes special bhajans, readings, and distribution of prasadam. All are welcome.",
        imageUrl: "/images/event-gurupoornima.jpg",
        videoUrl: null,
        instagramUrl: null,
        ctaLabel: "Event Calendar",
        ctaUrl: "/events",
        placements: ["featured"],
        membersOnly: false,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "hero-movienight",
        title: "Sai Family Movie Night: ANANTHA",
        description: "Spend a relaxing evening with our Sai Family. Showing 'ANANTHA' on Saturday, July 11, 2026 at 3:00 PM. Popcorn, snacks, and child-friendly options included.",
        body: "Let's take an evening to pause from our busy lives and simply spend time together as a Sai Family.\n\nDate: Saturday, July 11, 2026\nTime: 3:00 PM\nFeatured Film: ANANTHA\nA child-friendly movie will also be playing at the same time in the adjoining room. Everyone is welcome!",
        imageUrl: "/images/event-movienight.jpg",
        videoUrl: null,
        instagramUrl: null,
        ctaLabel: "Details",
        ctaUrl: "/events",
        placements: ["featured"],
        membersOnly: false,
        published: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "hero-gayatrihavan",
        title: "Gayatri Havan for Universal Peace",
        description: "Special Havan and prayers for universal peace and well-being. Saturday, August 8, 2026 from 5:30 AM to 2:00 PM.",
        body: "We invite you all to participate in the Gayatri Havan for universal peace, harmony, and well-being.\n\nDate: Saturday, August 8, 2026\nTime: 5:30 AM - 2:00 PM\nProgram Schedule:\n- 5:30 AM: Suprabatham & Gayatri Japam\n- 7:30 AM: Pooja & Abhishekam\n- 9:00 AM: Breakfast\n- 10:00 AM: Gayatri Havan & Poorna Huthi\n- 12:00 PM: Bhajan & Aarthi\n- 1:00 PM: Lunch & Clean-up",
        imageUrl: "/images/event-gayatrihavan.jpg",
        videoUrl: null,
        instagramUrl: null,
        ctaLabel: "Register",
        ctaUrl: "/portal",
        placements: ["featured"],
        membersOnly: false,
        published: true,
        createdAt: new Date().toISOString(),
      },
    ],
    resources: [],
    books: [],
    albums: [],
    announcements: [],
    registrations: [],
    profiles: [localAdmin],
    wings: defaultWings,
    siteContent: defaultSiteContent,
    accessRequests: [],
    contactMessages: [],
    bhajans: [],
    signupForms: [],
    submissions: [],
    favorites: [],
    formResponses: [],
  };
}

export function getDemoDb(): LocalDb {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const db = initialDb();
      saveDemoDb(db);
      return db;
    }
    const raw = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
    if (raw.version !== STORE_VERSION) {
      // Older store layout: start fresh but keep anything that still fits.
      const db = { ...initialDb(), ...raw, version: STORE_VERSION };
      saveDemoDb(db);
      return db;
    }
    // Fields added after the store was created default to empty.
    raw.formResponses ??= [];
    return raw;
  } catch (error) {
    console.error("Error reading local db store:", error);
    return initialDb();
  }
}

export function saveDemoDb(db: LocalDb): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing local db store:", error);
  }
}

/** Read-modify-write helper for local mutations. */
export function mutateDemoDb<T>(fn: (db: LocalDb) => T): T {
  const db = getDemoDb();
  const result = fn(db);
  saveDemoDb(db);
  return result;
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
