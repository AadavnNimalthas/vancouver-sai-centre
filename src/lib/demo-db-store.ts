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
}

const STORE_VERSION = 2;
const STORE_PATH = path.join(process.cwd(), ".local-db.json");

function initialDb(): LocalDb {
  return {
    version: STORE_VERSION,
    events: [],
    forms: [],
    posts: [],
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
