import fs from "fs";
import path from "path";
import { demoBhajans } from "./demo-data";
import type { Bhajan, BhajanSignUpForm, BhajanSubmission } from "./types";

interface DemoDb {
  bhajans: Bhajan[];
  signupForms: BhajanSignUpForm[];
  submissions: BhajanSubmission[];
  favorites: { userId: string; bhajanId: string }[];
}

const STORE_PATH = path.join(process.cwd(), "src/lib/demo-db-store.json");

const INITIAL_DB: DemoDb = {
  bhajans: demoBhajans,
  signupForms: [
    {
      id: "f-sunday",
      title: "Sunday Devotional Singing (July 19)",
      description: "Please select your offerings for the upcoming Sunday session. Refer to the Bhajan Library for lyrics and practice recordings. Only Ganesha, Shiva, Krishna, and Sai bhajans are allowed.",
      openDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      closeDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // In 3 days
      bhajansRequired: 2,
      allowedCategories: ["Ganesha", "Shiva", "Krishna", "Sai"],
      published: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "f-guru-purnima",
      title: "Guru Purnima Special Devotional Program",
      description: "Select one offering for the Guru Purnima program. Limit to Guru, Sai, and Sarva Dharma categories. Sign-ups close on July 25.",
      openDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      closeDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      bhajansRequired: 1,
      allowedCategories: ["Guru", "Sai", "Sarva Dharma"],
      published: true,
      createdAt: new Date().toISOString(),
    },
  ],
  submissions: [
    {
      id: "sub-1",
      formId: "f-sunday",
      userId: "u2", // Arun
      bhajanIds: ["bh-1", "bh-3"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "sub-2",
      formId: "f-sunday",
      userId: "u3", // Meera
      bhajanIds: ["bh-2", "bh-4"],
      createdAt: new Date().toISOString(),
    },
  ],
  favorites: [
    { userId: "user-demo", bhajanId: "bh-1" },
    { userId: "user-demo", bhajanId: "bh-2" },
  ],
};

export function getDemoDb(): DemoDb {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      saveDemoDb(INITIAL_DB);
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading demo db store:", error);
    return INITIAL_DB;
  }
}

export function saveDemoDb(db: DemoDb): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing demo db store:", error);
  }
}
