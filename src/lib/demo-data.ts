import type { Profile, SiteContent, Wing } from "./types";

/**
 * Default editable content. These are the starting values for the Site
 * content console; administrators change everything from the admin UI.
 * There is no sample or placeholder data anywhere else: events, posts,
 * forms, resources, books, albums, and bhajans all start empty.
 */

export const defaultSiteContent: SiteContent = {
  heroTitle: "Vancouver Sai Centre",
  heroSubtitle: "Sunday bhajans at 5 pm. Everyone is welcome.",
  intro:
    "Vancouver Sai Centre is a spiritual community located at 2215 East Pender Street, Vancouver. We gather for devotional singing, study, service, children’s education, and youth activities inspired by the teachings of Sri Sathya Sai Baba.",
  address: "2215 East Pender Street, Vancouver, BC",
  contactEmail: "vancouversaicentre@gmail.com",
  parkingInfo:
    "Street parking is usually available nearby. Please remove your shoes in the foyer.",
  mapEmbedUrl: "",
  whenMeet: [
    { label: "SSE classes for children", time: "Sundays, 3:00 pm" },
    { label: "Bhajans and satsang", time: "Sundays, 5:00 pm" },
    { label: "Study circle", time: "Wednesdays, 7:30 pm" },
    { label: "Young adults", time: "Fridays, 7:00 pm" },
  ],
  valuesIntro:
    "Everything at the centre, from bhajans to children’s classes to service projects, comes back to five values.",
  values: [
    {
      name: "Love",
      sanskrit: "Prema",
      line: "Care for the people around you, in what you think, say, and do.",
    },
    {
      name: "Truth",
      sanskrit: "Sathya",
      line: "Be honest with yourself and with others.",
    },
    {
      name: "Peace",
      sanskrit: "Shanti",
      line: "A settled mind, practised through prayer and contentment.",
    },
    {
      name: "Right Conduct",
      sanskrit: "Dharma",
      line: "Do the right thing, even when it is not easy.",
    },
    {
      name: "Non-Violence",
      sanskrit: "Ahimsa",
      line: "Cause no harm through your words or your actions.",
    },
  ],
  babaTitle: "Who is Sri Sathya Sai Baba?",
  babaBody:
    "Sri Sathya Sai Baba (1926 to 2011) was a spiritual teacher born in Puttaparthi, a village in southern India. His central teaching is simple: love all, serve all. He taught that all faiths lead to the same goal, and asked his students to practise five values in daily life: love, truth, peace, right conduct, and non-violence.\n\nIn his name, his students around the world run free hospitals, schools, and drinking water projects. You can read more at sathyasai.org.",
  sssioTitle: "The Sri Sathya Sai International Organization",
  sssioBody:
    "The Sri Sathya Sai International Organization (SSSIO) has centres in more than 100 countries. Centres hold devotional meetings, run children’s classes, and organize community service. There are no fees and no conversion. Everyone is welcome to take part while practising their own faith.\n\nVancouver Sai Centre is part of SSSIO Canada.",
  instagramHandle: "vancouver_sai_center",
  contacts: [],
  bcGroups: [
    {
      id: "grp-abbotsford",
      name: "Abbotsford Sai Centre",
      address: "",
      contact: "",
      meetingTime: "",
      link: "",
    },
    {
      id: "grp-coquitlam",
      name: "Coquitlam Sai Centre",
      address: "",
      contact: "",
      meetingTime: "",
      link: "",
    },
  ],
};

export const defaultWings: Wing[] = [
  {
    slug: "devotional",
    name: "Devotional Wing",
    tagline: "Bhajans and festivals",
    description:
      "The devotional wing organizes Sunday bhajans, festival celebrations, and devotional programs through the year.",
    activities: [],
    imageUrl: null,
    subgroups: [],
  },
  {
    slug: "education",
    name: "Education Wing",
    tagline: "Classes for children and adults",
    description:
      "The education wing runs SSE (Sai Spiritual Education) classes for children, the adult study circle, readings, and educational programs.",
    activities: [],
    imageUrl: null,
    subgroups: [],
  },
  {
    slug: "service",
    name: "Service Wing",
    tagline: "Helping around Vancouver",
    description:
      "The service wing organizes service projects and volunteer activities in the community.",
    activities: [],
    imageUrl: null,
    subgroups: [],
  },
  {
    slug: "young-adults",
    name: "Young Adults",
    tagline: "Ages 18 to 35",
    description:
      "The young adults wing runs YA activities, events, and service projects for members aged 18 to 35.",
    activities: [],
    imageUrl: null,
    subgroups: [],
  },
];

/**
 * The local administrator account used when no Supabase project is
 * connected (local development). Not a real person; replaced by real
 * authenticated accounts in production.
 */
export const localAdmin: Profile = {
  id: "local-admin",
  fullName: "Web Team",
  email: "webteam@local",
  role: "administrator",
  interests: [],
  joinedAt: new Date().toISOString().slice(0, 10),
  avatarUrl: null,
  wing: null,
  extraWings: [],
};
