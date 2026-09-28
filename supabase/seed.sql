-- ============================================================
-- Konkani Quest — seed data
-- Run after schema.sql. Uses placeholder images for now.
-- ============================================================

insert into public.fun_facts (fact_text, unlock_points) values
  ('Konkani is spoken by about 2.5 million people along India''s beautiful western coast — Goa, Karnataka, Maharashtra, and Kerala!', 50),
  ('Konkani is written in five different scripts: Devanagari, Roman, Kannada, Malayalam, and Perso-Arabic. Talk about flexible!', 100),
  ('Konkani became the official language of Goa in 1987, after a passionate people''s movement to protect it.', 150),
  ('The word "Konkani" comes from "Konkan" — the lush coastal strip between the Sahyadri mountains and the Arabian Sea.', 200),
  ('Konkani has borrowed words from Portuguese during 450 years of contact — like "janel" (window) from "janela"!', 250),
  ('Konkani mando music blends Goan folk melodies with western harmonies — it''s often sung at weddings!', 300),
  ('Konkani was recognized in the 8th Schedule of the Indian Constitution in 1992, making it one of India''s 22 official languages.', 350),
  ('In Konkani, the same word can change meaning with tone and context — coastal conversations are full of playful wordplay.', 400)
on conflict do nothing;

insert into public.words
  (english_word, konkani_word, pronunciation, category, difficulty, mnemonic, image_prompt, image_url, example_sentence)
values
  ('Nose', 'Naak', 'naak (rhymes with "clock")', 'body', 'beginner',
   '"Naak" sounds like "knock" — imagine a nose knocking on a door!',
   'A cute cartoon nose knocking on a wooden door',
   'https://placehold.co/600x400/ffb020/1e3a3a?text=Nose+%E2%86%92+Naak',
   'Mhaji naak lamb asa. (My nose is long.)'),
  ('Water', 'Udok', 'oo-dohk', 'nature', 'beginner',
   '"Udok" sounds like "you dock" — you dock your boat in the water!',
   'A happy boat docking in sparkling blue water',
   'https://placehold.co/600x400/06b6d4/ffffff?text=Water+%E2%86%92+Udok',
   'Mhaka udok zai. (I want water.)'),
  ('Fish', 'Nishtem', 'nish-tem', 'food', 'beginner',
   '"Nishtem" — a fish swimming through a NICE system of coral!',
   'A smiling cartoon fish swimming through a maze of colorful coral',
   'https://placehold.co/600x400/0891b2/ffffff?text=Fish+%E2%86%92+Nishtem',
   'Goenkar nishtem khatat. (Goans eat fish.)'),
  ('House', 'Ghor', 'gh-or (like "gore" with soft g)', 'places', 'beginner',
   '"Ghor" sounds like "gore"-geous — a GORgeous house!',
   'A gorgeous little coastal cottage with a red tiled roof and palm trees',
   'https://placehold.co/600x400/ff6f61/ffffff?text=House+%E2%86%92+Ghor',
   'Mhojem ghor lhan asa. (My house is small.)'),
  ('Sun', 'Suryo', 'soor-yoh', 'nature', 'beginner',
   '"Suryo" — SIR YO! The sun greets you every morning like a cheerful friend.',
   'A smiling cartoon sun tipping its hat and saying yo',
   'https://placehold.co/600x400/f59e0b/1e3a3a?text=Sun+%E2%86%92+Suryo',
   'Suryo udelo. (The sun has risen.)'),
  ('Mother', 'Avoy', 'ah-voy', 'family', 'beginner',
   '"Avoy" — AHOY! Your mother waves ahoy from the kitchen.',
   'A warm cartoon mother waving ahoy like a friendly sailor',
   'https://placehold.co/600x400/16a34a/ffffff?text=Mother+%E2%86%92+Avoy',
   'Mhoji avoy randta. (My mother is cooking.)'),
  ('Coconut', 'Naral', 'nah-rull', 'food', 'beginner',
   '"Naral" — it''s only NATURAL to find coconuts on the Konkan coast!',
   'A cartoon coconut relaxing naturally on a beach chair under a palm tree',
   'https://placehold.co/600x400/15803d/ffffff?text=Coconut+%E2%86%92+Naral',
   'Naralachi kadi ruchik asa. (Coconut curry is tasty.)'),
  ('Moon', 'Chondrim', 'chon-drim', 'nature', 'intermediate',
   '"Chondrim" — the moon CHARMED him with its silver light.',
   'A dreamy cartoon moon casting a charming silver glow over the sea',
   'https://placehold.co/600x400/0e7490/ffffff?text=Moon+%E2%86%92+Chondrim',
   'Chondrim sundor dista. (The moon looks beautiful.)'),
  ('Bird', 'Sukonnem', 'soo-kon-nem', 'animals', 'intermediate',
   '"Sukonnem" — a bird singing SO CONtently on a branch.',
   'A colorful parrot singing contently on a coconut palm branch',
   'https://placehold.co/600x400/06b6d4/1e3a3a?text=Bird+%E2%86%92+Sukonnem',
   'Sukonnem gaita. (The bird is singing.)'),
  ('Love', 'Mog', 'mohg (rhymes with "vogue")', 'feelings', 'beginner',
   '"Mog" — love is always in VOGUE, and it starts with a warm MuG of tea.',
   'Two cartoon mugs of chai leaning into a heart shape',
   'https://placehold.co/600x400/ff6f61/ffffff?text=Love+%E2%86%92+Mog',
   'Tujo mog kortam. (I love you.)')
on conflict do nothing;
