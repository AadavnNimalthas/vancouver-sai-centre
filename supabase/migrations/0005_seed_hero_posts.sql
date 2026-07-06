-- Seed featured homepage hero carousel posts for the upcoming centre events
insert into public.posts (
  title, 
  description, 
  body, 
  image_url, 
  cta_label, 
  cta_url, 
  placements, 
  members_only, 
  published
) values 
(
  'Annual Sai Picnic 2026',
  'Join us for our annual family picnic at Deas Island Regional Park in Delta. Saturday, July 25, 2026 from 10 AM to 2 PM. Potluck lunch details inside.',
  'Sai Ram! We warmly invite all families and members to our annual Sai Picnic.\n\nDate: Saturday, July 25, 2026\nTime: 10:00 AM - 2:00 PM\nLocation: Deas Island Regional Park, Delta\n\nThere will be games, devotional music, and a potluck lunch. Please register via the portal so that we can coordinate the potluck dishes accordingly.',
  '/images/event-picnic.jpg',
  'Register for Picnic',
  '/portal',
  array['featured'],
  false,
  true
),
(
  'Guru Poornima Celebrations',
  'Devotional program dedicated to our beloved spiritual teacher. Wednesday, July 29, 2026 from 7:30 PM to 9:00 PM at the Vancouver Sai Centre.',
  'Offering our loving pranams at the lotus feet of our master on this auspicious day of Guru Poornima.\n\nDate: Wednesday, July 29, 2026\nTime: 7:30 PM - 9:00 PM\nProgram includes special bhajans, readings, and distribution of prasadam. All are welcome.',
  '/images/event-gurupoornima.jpg',
  'Event Calendar',
  '/events',
  array['featured'],
  false,
  true
),
(
  'Sai Family Movie Night: ANANTHA',
  'Spend a relaxing evening with our Sai Family. Showing ''ANANTHA'' on Saturday, July 11, 2026 at 3:00 PM. Popcorn, snacks, and child-friendly options included.',
  'Let''s take an evening to pause from our busy lives and simply spend time together as a Sai Family.\n\nDate: Saturday, July 11, 2026\nTime: 3:00 PM\nFeatured Film: ANANTHA\nA child-friendly movie will also be playing at the same time in the adjoining room. Everyone is welcome!',
  '/images/event-movienight.jpg',
  'Details',
  '/events',
  array['featured'],
  false,
  true
),
(
  'Gayatri Havan for Universal Peace',
  'Special Havan and prayers for universal peace and well-being. Saturday, August 8, 2026 from 5:30 AM to 2:00 PM.',
  'We invite you all to participate in the Gayatri Havan for universal peace, harmony, and well-being.\n\nDate: Saturday, August 8, 2026\nTime: 5:30 AM - 2:00 PM\nProgram Schedule:\n- 5:30 AM: Suprabatham & Gayatri Japam\n- 7:30 AM: Pooja & Abhishekam\n- 9:00 AM: Breakfast\n- 10:00 AM: Gayatri Havan & Poorna Huthi\n- 12:00 PM: Bhajan & Aarthi\n- 1:00 PM: Lunch & Clean-up',
  '/images/event-gayatrihavan.jpg',
  'Register',
  '/portal',
  array['featured'],
  false,
  true
);
