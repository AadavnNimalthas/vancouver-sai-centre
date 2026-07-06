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
  | "administrator";

export const ROLES: Role[] = [
  "visitor",
  "member",
  "volunteer",
  "wing-lead",
  "executive",
  "administrator",
];

export const ROLE_LABELS: Record<Role, string> = {
  visitor: "Visitor",
  member: "Member",
  volunteer: "Volunteer",
  "wing-lead": "Wing Lead",
  executive: "Executive",
  administrator: "Administrator",
};

const ROLE_RANK: Record<Role, number> = {
  visitor: 0,
  member: 1,
  volunteer: 2,
  "wing-lead": 3,
  executive: 4,
  administrator: 5,
};

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
  | "consent";

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
];

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  helpText: string;
  required: boolean;
  options: string[]; // dropdown / radio / checkbox
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
  { value: "study", label: "Study materials" },
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

export interface Bhajan {
  id: string;
  title: string;
  meaning: string;
  language: string;
  tempo: "slow" | "medium" | "fast";
  category: string;
  notes: string;
  lyrics: string;
  audioUrl: string | null;
  videoUrl: string | null;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  eventId: string | null;
  coverUrl: string;
  date: string;
  photos: Photo[];
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  width: number;
  height: number;
}

export interface Wing {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  activities: string[];
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

export interface SiteContent {
  intro: string;
  address: string;
  babaTitle: string;
  babaBody: string;
  sssioTitle: string;
  sssioBody: string;
  instagramHandle: string;
  contacts: ContactCard[];
  bcGroups: BCGroup[];
}
