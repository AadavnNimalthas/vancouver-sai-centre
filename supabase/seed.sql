-- Seed content for a new Vancouver Sai Centre instance.
-- Mirrors the demo-mode content so the connected site starts populated.

insert into public.forms (id, title, description, fields, published) values
(
  '00000000-0000-0000-0000-00000000f001',
  'Event Registration',
  'Standard registration for Centre events.',
  '[
    {"id":"f1","type":"short-text","label":"Full name","helpText":"","required":true,"options":[]},
    {"id":"f2","type":"email","label":"Email","helpText":"We''ll send your confirmation here.","required":true,"options":[]},
    {"id":"f3","type":"phone","label":"Phone","helpText":"","required":false,"options":[]},
    {"id":"f4","type":"number","label":"Number of guests attending with you","helpText":"Including children.","required":true,"options":[]},
    {"id":"f5","type":"dropdown","label":"Will you join the community dinner?","helpText":"","required":true,"options":["Yes","No","Not sure yet"]},
    {"id":"f6","type":"consent","label":"I consent to being photographed at this event","helpText":"Photos may appear in the Centre''s gallery and newsletter.","required":false,"options":[]}
  ]'::jsonb,
  true
),
(
  '00000000-0000-0000-0000-00000000f002',
  'Volunteer Signup',
  'Tell us where you can help.',
  '[
    {"id":"v1","type":"short-text","label":"Full name","helpText":"","required":true,"options":[]},
    {"id":"v2","type":"email","label":"Email","helpText":"","required":true,"options":[]},
    {"id":"v3","type":"checkbox","label":"Which shifts can you take?","helpText":"","required":true,"options":["Morning prep (9:00–11:00)","Distribution (11:30–1:30)","Cleanup (1:30–2:30)"]},
    {"id":"v4","type":"radio","label":"Can you drive supplies downtown?","helpText":"","required":true,"options":["Yes, I have a vehicle","No"]},
    {"id":"v5","type":"consent","label":"I have read the volunteer safety guidelines","helpText":"","required":true,"options":[]}
  ]'::jsonb,
  true
);

insert into public.events
  (slug, title, description, banner_url, starts_at, ends_at, location, capacity,
   registration_enabled, volunteer_signup_enabled, livestream_url, category,
   recurrence, recurrence_until, form_id, published)
values
(
  'sunday-bhajans', 'Sunday Bhajans & Satsang',
  'Our weekly gathering — an hour of devotional singing followed by a short talk and prasadam. Newcomers are always welcome.',
  '/images/gallery-bhajan-hall.svg',
  '2026-07-05 17:00:00-07', '2026-07-05 18:30:00-07',
  'Vancouver Sai Centre, 3855 Albert St, Burnaby', null,
  false, false, 'https://youtube.com/@vancouversaicentre/live', 'devotional',
  'weekly', '2026-12-27', null, true
),
(
  'study-circle', 'Weekly Study Circle',
  'A facilitated reading and discussion of Sathya Sai Baba''s teachings.',
  '/images/gallery-study.svg',
  '2026-07-08 19:30:00-07', '2026-07-08 21:00:00-07',
  'Vancouver Sai Centre — Library Room', null,
  false, false, null, 'education',
  'weekly', '2026-12-23', null, true
),
(
  'sse-classes', 'SSE Classes (Groups 1–4)',
  'Sai Spiritual Education for children ages 6–17, exploring the five human values.',
  '/images/gallery-sse.svg',
  '2026-07-12 15:00:00-07', '2026-07-12 16:30:00-07',
  'Vancouver Sai Centre — Classrooms', 60,
  true, true, null, 'sse',
  'weekly', '2026-12-13', '00000000-0000-0000-0000-00000000f001', true
),
(
  'guru-purnima-2026', 'Guru Purnima Celebration',
  'Our largest devotional gathering of the summer — bhajans, a guest speaker, and a shared community dinner.',
  '/images/gallery-festival.svg',
  '2026-07-29 18:00:00-07', '2026-07-29 21:30:00-07',
  'Vancouver Sai Centre — Main Hall', 220,
  true, true, 'https://youtube.com/@vancouversaicentre/live', 'special',
  'none', null, '00000000-0000-0000-0000-00000000f001', true
),
(
  'sandwich-seva', 'Sandwich Seva — Downtown Eastside',
  '400 sandwich lunches prepared and shared, with volunteers needed for prep and distribution.',
  '/images/gallery-seva.svg',
  '2026-07-18 09:00:00-07', '2026-07-18 13:30:00-07',
  'Meet at Vancouver Sai Centre kitchen', 40,
  false, true, null, 'service',
  'monthly', '2026-12-19', '00000000-0000-0000-0000-00000000f002', true
);

insert into public.bhajans (title, meaning, language, tempo, category, notes, lyrics) values
('Ganesha Sharanam', 'I take refuge in Lord Ganesha, remover of obstacles.', 'Sanskrit', 'medium', 'Ganesha',
 'Traditional opening bhajan.', E'Ganesha Sharanam Sharanam Ganesha\nGam Gam Ganapathi Sharanam Ganesha'),
('Sathya Sai Ram Om Sai Ram', 'Chanting the name of Sai Ram, embodiment of truth.', 'Sanskrit', 'medium', 'Sai',
 'A Centre favourite.', E'Om Sai Ram Om Sai Ram\nSathya Sai Ram Om Sai Ram\nParthi Vihari Om Sai Ram'),
('Subrahmanyam Subrahmanyam', 'Salutations to Lord Subrahmanya.', 'Sanskrit', 'fast', 'Subrahmanya',
 'Builds quickly.', E'Subrahmanyam Subrahmanyam\nShanmukhanatha Subrahmanyam'),
('He Shiva Shankara Namami Shankara', 'O Shiva, I bow to you.', 'Sanskrit', 'slow', 'Shiva',
 'Meditative.', E'He Shiva Shankara Namami Shankara\nShiva Shankara Shambho'),
('Love Is My Form', 'A song of Baba''s message in English.', 'English', 'slow', 'Sai',
 'Often sung at public programs.', E'Love is my form, Truth is my breath\nBliss is my food\nMy life is my message');

insert into public.resources (title, description, kind, url, tags, members_only) values
('Centre Bhajan Book (2026 Edition)', 'The full Centre songbook with transliterations and meanings.', 'pdf', '#', '{bhajans,songbook}', false),
('Sadhana: The Inward Path — Study Guide', 'Discussion questions for this season''s study circle.', 'study', '#', '{"study circle",sadhana}', false),
('Guru Purnima Discourse (1996)', 'Bhagawan''s Guru Purnima discourse. Audio, 48 minutes.', 'discourse', '#', '{"guru purnima",discourse}', false),
('Sunday Bhajans — Live Recording Archive', 'Recordings of recent Sunday sessions.', 'bhajan', '#', '{bhajans,recordings}', true);

insert into public.announcements (title, body, topics, sent_at, recipients, open_rate) values
('Guru Purnima — registration now open',
 'Registration for our July 29 Guru Purnima celebration is open. Register early so we can plan prasadam for everyone.',
 '{devotional,major-events}', '2026-07-01 09:00:00-07', 412, 0.64);
