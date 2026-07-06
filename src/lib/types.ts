export type EventCategory =
  | "devotional"
  | "service"
  | "education"
  | "sse"
  | "young-adults"
  | "special"
  | "retreat";

export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "devotional", label: "Devotional" },
  { value: "service", label: "Service" },
  { value: "education", label: "Education" },
  { value: "sse", label: "SSE" },
  { value: "young-adults", label: "Young Adults" },
  { value: "special", label: "Special Events" },
  { value: "retreat", label: "Retreats" },
];

export function categoryLabel(value: EventCategory): string {
  return EVENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export type Recurrence = "none" | "weekly" | "biweekly" | "monthly";

export interface SaiEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  startsAt: string; // ISO
  endsAt: string; // ISO
  location: string;
  capacity: number | null; // null = unlimited
  registrationEnabled: boolean;
  volunteerSignupEnabled: boolean;
  livestreamUrl: string | null;
  category: EventCategory;
  recurrence: Recurrence;
  recurrenceUntil: string | null;
  formId: string | null;
  registeredCount: number;
  published: boolean;
}

export type Role =
  | "visitor"
  | "member"
  | "volunteer"
  | "wing-lead"
  | "executive"
  | "president"
  | "administrator";

export const ROLES: Role[] = [
  "visitor",
  "member",
  "volunteer",
  "wing-lead",
  "executive",
  "president",
  "administrator",
];

export const ROLE_LABELS: Record<Role, string> = {
  visitor: "Visitor",
  member: "Member",
  volunteer: "Volunteer",
  "wing-lead": "Wing Coordinator",
  executive: "Executive",
  president: "President",
  administrator: "Web Team (Super Admin)",
};

const ROLE_RANK: Record<Role, number> = {
  visitor: 0,
  member: 1,
  volunteer: 2,
  "wing-lead": 3,
  executive: 4,
  president: 5,
  administrator: 6,
};

/* Wings a coordinator can be scoped to */
export type WingSlug = "devotional" | "service" | "education" | "young-adults";

export const WING_SLUGS: WingSlug[] = ["devotional", "service", "education", "young-adults"];

export const WING_LABELS: Record<WingSlug, string> = {
  devotional: "Devotional",
  service: "Service",
  education: "Education",
  "young-adults": "Young Adults",
};

/** Which wing owns each event category. Special events and retreats belong to no single wing. */
export function wingForCategory(category: EventCategory): WingSlug | null {
  switch (category) {
    case "devotional":
      return "devotional";
    case "service":
      return "service";
    case "education":
    case "sse":
      return "education";
    case "young-adults":
      return "young-adults";
    default:
      return null;
  }
}

/**
 * Wing coordinators may only manage content in their own wing (plus wings
 * they have been granted access to). Executives and above manage everything.
 */
export function canManageWing(profile: Profile, wing: WingSlug | null): boolean {
  if (roleAtLeast(profile.role, "executive")) return true;
  if (profile.role !== "wing-lead") return false;
  if (wing === null) return false;
  return profile.wing === wing || (profile.extraWings ?? []).includes(wing);
}

export function roleAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  interests: string[];
  joinedAt: string;
  avatarUrl: string | null;
  /** Home wing for wing coordinators */
  wing: WingSlug | null;
  /** Additional wings this coordinator has been granted access to */
  extraWings: WingSlug[];
}

export interface AccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  wing: WingSlug;
  status: "pending" | "approved" | "denied";
  createdAt: string;
}

export type RegistrationStatus = "registered" | "waitlisted" | "checked-in" | "cancelled";

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  kind: "attendee" | "volunteer";
  status: RegistrationStatus;
  answers: Record<string, unknown>;
  createdAt: string;
  // joined fields for display
  eventTitle?: string;
  eventStartsAt?: string;
  userName?: string;
  userEmail?: string;
}

export type FormFieldType =
  | "short-text"
  | "long-text"
  | "email"
  | "phone"
  | "number"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "date"
  | "file"
  | "consent"
  | "bhajan-select";

export const FORM_FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "short-text", label: "Short text" },
  { value: "long-text", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "number", label: "Number" },
  { value: "dropdown", label: "Dropdown" },
  { value: "radio", label: "Multiple choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "date", label: "Date" },
  { value: "file", label: "File upload" },
  { value: "consent", label: "Consent checkbox" },
  { value: "bhajan-select", label: "Bhajan selection" },
];

export interface BhajanFieldFilters {
  categories: string[];
  tempos: string[];
  beats: string[];
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  helpText: string;
  required: boolean;
  options: string[]; // dropdown / radio / checkbox
  /** Only for bhajan-select fields: limits which bhajans can be picked. */
  bhajanFilters?: BhajanFieldFilters;
}

export interface SaiForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  published: boolean;
  updatedAt: string;
  attachedEventIds: string[];
}

export const INTEREST_TOPICS = [
  { value: "devotional", label: "Devotional programs" },
  { value: "study-circle", label: "Study Circle" },
  { value: "service", label: "Service projects" },
  { value: "education", label: "Education" },
  { value: "sse", label: "SSE (children's program)" },
  { value: "young-adults", label: "Young Adults" },
  { value: "major-events", label: "Major events" },
  { value: "retreats", label: "Retreats" },
] as const;

export interface Announcement {
  id: string;
  title: string;
  body: string;
  topics: string[];
  sentAt: string | null;
  createdAt: string;
  recipients: number;
  openRate: number | null;
}

export type ResourceKind = "pdf" | "video" | "audio" | "bhajan" | "study" | "discourse";

export const RESOURCE_KINDS: { value: ResourceKind; label: string }[] = [
  { value: "pdf", label: "PDFs" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
  { value: "bhajan", label: "Bhajans" },
  { value: "study", label: "Study Circle" },
  { value: "discourse", label: "Discourses" },
];

export interface Resource {
  id: string;
  title: string;
  description: string;
  kind: ResourceKind;
  url: string;
  tags: string[];
  membersOnly: boolean;
  createdAt: string;
}

export const BHAJAN_DEITY_OPTIONS = [
  "Allah",
  "Anjaneya",
  "Ayyappa",
  "Buddha",
  "Devi",
  "Ganesha",
  "Guru",
  "Jehovah",
  "Jesus",
  "Krishna",
  "Narayana",
  "Rama",
  "Sai",
  "Sarva Dharma",
  "Shiva",
  "Subrahmanya",
  "Vittala"
] as const;

export const BHAJAN_TEMPO_OPTIONS = [
  { value: "meliodic", label: "Meliodic" },
  { value: "slow", label: "Slow" },
  { value: "medium", label: "Medium" },
  { value: "fast", label: "Fast" },
  { value: "very_fast", label: "Very Fast" }
] as const;

export type BhajanTempo = typeof BHAJAN_TEMPO_OPTIONS[number]["value"];

export interface Bhajan {
  id: string;
  title: string;
  lyrics: string;
  meaning: string;
  tempo: BhajanTempo;
  beatTaal: string;
  language: string;
  category: string;
  notes: string;
  sourceLink?: string | null;
  audioUrl: string | null;
  videoUrl: string | null;
  status: "pending" | "approved" | "rejected" | "archived";
  createdBy?: string | null;
  additionalMetadata?: Record<string, unknown>;
  createdAt?: string;
}


export interface BhajanSignUpForm {
  id: string;
  title: string;
  description: string;
  openDate: string;
  closeDate: string;
  bhajansRequired: number;
  /** Empty arrays mean "no limit" for that filter. */
  allowedCategories: string[];
  allowedTempos: BhajanTempo[];
  allowedBeats: string[];
  published: boolean;
  createdAt: string;
}

export interface BhajanSubmission {
  id: string;
  formId: string;
  userId: string;
  bhajanIds: string[];
  createdAt: string;
  // Join fields for display
  userName?: string;
  userEmail?: string;
  bhajans?: Bhajan[];
}


export interface Album {
  id: string;
  title: string;
  description: string;
  eventId: string | null;
  coverUrl: string;
  date: string;
  /** When set, the album lives in Google Photos and the card links there. */
  googlePhotosUrl: string | null;
  photos: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  width: number;
  height: number;
}

export interface WingSubgroup {
  id: string;
  title: string;
  description: string;
  links: { label: string; url: string }[];
}

export interface Wing {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  activities: string[];
  imageUrl: string | null;
  subgroups: WingSubgroup[];
}

/** A physical book in the centre's Sai literature library. */
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  available: boolean;
  createdAt: string;
}

/* ── Posts (CMS) ─────────────────────────────────────────── */

export type PostPlacement =
  | "featured" // homepage carousel
  | "announcements" // homepage news section
  | "events-page"
  | "wing-devotional"
  | "wing-service"
  | "wing-education"
  | "wing-young-adults"
  | "portal";

export const POST_PLACEMENTS: { value: PostPlacement; label: string }[] = [
  { value: "featured", label: "Homepage carousel" },
  { value: "announcements", label: "Latest announcements" },
  { value: "events-page", label: "Events page" },
  { value: "wing-devotional", label: "Devotional wing" },
  { value: "wing-service", label: "Service wing" },
  { value: "wing-education", label: "Education wing" },
  { value: "wing-young-adults", label: "Young Adults wing" },
  { value: "portal", label: "Member portal" },
];

export interface Post {
  id: string;
  title: string;
  description: string;
  body: string;
  imageUrl: string | null;
  videoUrl: string | null;
  /** Instagram post URL; when set the card renders an embed from @vancouver_sai_center */
  instagramUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  placements: PostPlacement[];
  membersOnly: boolean;
  published: boolean;
  createdAt: string;
}

/* ── Site content (editable from the admin console) ─────── */

export interface ContactCard {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  visible: boolean;
}

export const CONTACT_ROLES = [
  "President",
  "Vice President",
  "Treasurer",
  "Secretary",
  "Devotional Coordinator",
  "Education Coordinator",
  "Seva Coordinator",
  "Young Adults Coordinator",
];

export interface BCGroup {
  id: string;
  name: string;
  address: string;
  contact: string;
  meetingTime: string;
  link: string;
}

export interface MeetTime {
  label: string;
  time: string;
}

export interface ValueItem {
  name: string;
  sanskrit: string;
  line: string;
}

export interface SiteContent {
  /** Shown at the top of the homepage when there are no featured posts. */
  heroTitle: string;
  heroSubtitle: string;
  intro: string;
  address: string;
  contactEmail: string;
  parkingInfo: string;
  /** Google Maps embed URL for the contact page (optional). */
  mapEmbedUrl: string;
  whenMeet: MeetTime[];
  valuesIntro: string;
  values: ValueItem[];
  babaTitle: string;
  babaBody: string;
  sssioTitle: string;
  sssioBody: string;
  instagramHandle: string;
  contacts: ContactCard[];
  bcGroups: BCGroup[];
}
