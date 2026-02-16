-- ============================================================
-- Frenchie Trivia — Question Seed Data
-- 60 questions across all categories for initial launch
-- ============================================================

-- BREED HISTORY
INSERT INTO questions (category, difficulty, question, correct_answer, incorrect_answer_1, incorrect_answer_2, incorrect_answer_3, explanation) VALUES
('breed_history', 'easy', 'What country did French Bulldogs originally come from before becoming popular in France?', 'England', 'Germany', 'Spain', 'Belgium', 'French Bulldogs descended from English Bulldogs. Lace workers from Nottingham brought toy bulldogs to France during the Industrial Revolution.'),
('breed_history', 'easy', 'What year did the AKC officially recognise the French Bulldog as a breed?', '1898', '1910', '1885', '1925', 'The American Kennel Club recognised French Bulldogs in 1898, making them one of the earlier recognised breeds.'),
('breed_history', 'medium', 'Which group of workers brought the ancestors of French Bulldogs to France in the 1800s?', 'Lace makers from Nottingham', 'Coal miners from Wales', 'Fishermen from Brittany', 'Farmers from Normandy', 'During the Industrial Revolution, displaced lace makers from Nottingham, England, emigrated to France and brought their toy bulldogs with them.'),
('breed_history', 'medium', 'A French Bulldog was famously aboard which doomed ship in 1912?', 'RMS Titanic', 'RMS Lusitania', 'SS Eastland', 'HMS Birkenhead', 'A French Bulldog named Gamin de Pycombe was aboard the Titanic. The dog was insured for an extraordinary sum at the time.'),
('breed_history', 'hard', 'Which American kennel club was the first to hold a specialty show exclusively for French Bulldogs in 1898?', 'French Bull Dog Club of America', 'Westminster Kennel Club', 'American Bulldog Association', 'National Dog Club of America', 'The French Bull Dog Club of America held the first specialty show at the Waldorf-Astoria hotel in New York City in 1898.'),

-- HEALTH & WELLNESS
('health_wellness', 'easy', 'What is the medical term for the breathing condition caused by a Frenchie''s flat face?', 'Brachycephalic Obstructive Airway Syndrome', 'Tracheal Collapse', 'Laryngeal Paralysis', 'Chronic Bronchitis', 'BOAS affects brachycephalic (flat-faced) breeds and can cause snoring, difficulty breathing, and exercise intolerance.'),
('health_wellness', 'easy', 'Why can''t most French Bulldogs swim well?', 'Their heavy front body and short legs make it hard to stay afloat', 'They are afraid of water', 'Their fur absorbs too much water', 'They have no webbing between their toes', 'Frenchies are top-heavy with a large head and chest relative to their hindquarters, making it very difficult to stay buoyant.'),
('health_wellness', 'medium', 'What percentage of French Bulldog litters are typically delivered via C-section?', 'Over 80%', 'About 50%', 'About 30%', 'Less than 10%', 'Due to the puppies'' large heads relative to the mother''s narrow pelvis, the vast majority of Frenchie births require surgical intervention.'),
('health_wellness', 'medium', 'What eye condition causes a red, swollen mass to appear in the corner of a Frenchie''s eye?', 'Cherry eye', 'Glaucoma', 'Cataracts', 'Entropion', 'Cherry eye occurs when the gland of the third eyelid prolapses and becomes visible as a red, cherry-like mass in the inner corner of the eye.'),
('health_wellness', 'hard', 'What spinal condition, characterised by premature disc degeneration, are French Bulldogs particularly prone to?', 'Intervertebral Disc Disease (IVDD)', 'Degenerative Myelopathy', 'Spondylosis', 'Wobbler Syndrome', 'IVDD is very common in Frenchies due to their chondrodystrophic body type, which predisposes them to early disc degeneration.'),

-- GENETICS & COLOURS
('genetics_colours', 'easy', 'What are the two most common standard French Bulldog coat colours?', 'Fawn and brindle', 'Black and white', 'Blue and lilac', 'Cream and chocolate', 'According to the AKC breed standard, the accepted colours are brindle, fawn, white, brindle and white, and any other colour not constituting disqualification.'),
('genetics_colours', 'easy', 'What is the term for a French Bulldog with patches of white and another colour?', 'Pied', 'Merle', 'Tuxedo', 'Spotted', 'Pied Frenchies have a predominantly white coat with patches of another colour, typically brindle or fawn.'),
('genetics_colours', 'medium', 'Which two dilution genes must both be present for a French Bulldog to have a lilac coat?', 'Blue (d/d) and chocolate (b/b)', 'Blue (d/d) and cream (e/e)', 'Chocolate (b/b) and brindle (Kbr)', 'Cream (e/e) and fawn (Ay)', 'Lilac is produced when a dog carries two copies of both the blue dilution gene and the chocolate gene, creating a distinctive pale purple-grey colour.'),
('genetics_colours', 'hard', 'What is the merle gene designation in canine genetics?', 'M locus (PMEL17 gene)', 'D locus (MLPH gene)', 'B locus (TYRP1 gene)', 'E locus (MC1R gene)', 'The merle pattern is caused by a mutation in the PMEL17 gene at the M locus, creating patches of diluted colour.'),

-- ANATOMY & APPEARANCE
('anatomy', 'easy', 'What is the signature ear shape that distinguishes French Bulldogs from English Bulldogs?', 'Bat ears (upright and rounded)', 'Rose ears (folded back)', 'Button ears (folded forward)', 'Drop ears (hanging down)', 'French Bulldogs are famous for their large, upright "bat ears" — this was actually a point of debate between American and European breeders in the early 1900s.'),
('anatomy', 'easy', 'What is the typical weight range for an adult French Bulldog?', '16 to 28 pounds (7-13 kg)', '30 to 50 pounds (14-23 kg)', '8 to 15 pounds (4-7 kg)', '50 to 70 pounds (23-32 kg)', 'The AKC breed standard specifies a weight not to exceed 28 pounds for French Bulldogs.'),
('anatomy', 'medium', 'How tall is the average adult French Bulldog at the shoulder?', '11 to 13 inches (28-33 cm)', '15 to 18 inches (38-46 cm)', '8 to 10 inches (20-25 cm)', '20 to 24 inches (51-61 cm)', 'French Bulldogs are a compact, muscular breed standing 11-13 inches at the withers.'),
('anatomy', 'medium', 'What type of tail do French Bulldogs naturally have?', 'Short, stumpy screw tail', 'Long, curly tail', 'Docked (surgically shortened) tail', 'No tail at all', 'Frenchies are born with naturally short, stumpy tails that can be straight, screwed, or kinked. They are never docked.'),

-- PERSONALITY & BEHAVIOUR
('personality', 'easy', 'French Bulldogs are often described as having what kind of personality?', 'Clownish and affectionate', 'Aggressive and independent', 'Shy and timid', 'Hyperactive and anxious', 'Frenchies are known for their playful, clownish personalities and strong bonds with their owners.'),
('personality', 'easy', 'How many hours per day does an average adult French Bulldog sleep?', '12 to 14 hours', '6 to 8 hours', '18 to 20 hours', '4 to 6 hours', 'Frenchies are champion sleepers! Most sleep 12-14 hours per day, with puppies sleeping even more.'),
('personality', 'medium', 'What position do French Bulldogs often sleep in that resembles an amphibian?', 'Frog legs (splooting)', 'Curled in a ball', 'On their back with all four legs up', 'Standing up', 'Many Frenchies lie flat on their bellies with their back legs splayed out behind them, resembling a frog. This is called "splooting."'),
('personality', 'hard', 'Why are French Bulldogs sometimes called "velcro dogs"?', 'They follow their owners everywhere and always want to be close', 'Their fur sticks to furniture', 'They attach to other dogs quickly', 'They grip surfaces well with their paws', 'Frenchies are known for their extreme attachment to their owners, following them from room to room and wanting constant proximity.'),

-- FAMOUS FRENCHIES
('famous_frenchies', 'easy', 'Which pop star had their French Bulldogs stolen in a high-profile 2021 incident?', 'Lady Gaga', 'Ariana Grande', 'Taylor Swift', 'Beyoncé', 'Lady Gaga''s dog walker was shot and two of her three French Bulldogs were stolen in February 2021. They were later recovered.'),
('famous_frenchies', 'easy', 'What breed ranking did French Bulldogs achieve in the USA in 2022, a first in over 30 years?', 'Number 1 most popular breed', 'Number 5 most popular breed', 'Number 10 most popular breed', 'Number 3 most popular breed', 'In 2022, the French Bulldog overtook the Labrador Retriever to become the most popular dog breed in America for the first time, ending the Lab''s 31-year reign.'),
('famous_frenchies', 'medium', 'Which famous fashion designer was known for always being accompanied by his French Bulldog?', 'Yves Saint Laurent', 'Karl Lagerfeld', 'Ralph Lauren', 'Tom Ford', 'Yves Saint Laurent was famously devoted to his French Bulldog Moujik, who accompanied him nearly everywhere.'),
('famous_frenchies', 'medium', 'What is the name of the French Bulldog that has over 1 million Instagram followers and is one of the most famous dogs on social media?', 'Manny the Frenchie', 'Doug the Pug', 'Boo the Pomeranian', 'Tuna the Chiweenie', 'Manny the Frenchie became one of the most famous dogs on social media, amassing millions of followers before passing in 2022.'),

-- PUPPY CARE
('puppy_care', 'easy', 'At what age do most French Bulldog puppies'' ears stand up permanently?', '8 to 15 weeks', '2 to 4 weeks', '6 to 12 months', 'They are born with upright ears', 'Frenchie puppies are born with floppy ears that gradually stand up as the ear cartilage strengthens, usually between 8-15 weeks.'),
('puppy_care', 'medium', 'How many puppies are typically in a French Bulldog litter?', '2 to 4 puppies', '6 to 8 puppies', '8 to 12 puppies', '1 puppy only', 'French Bulldogs typically have small litters of 2-4 puppies, with 3 being the most common.'),
('puppy_care', 'medium', 'Why should French Bulldog puppies avoid strenuous exercise, especially on hot days?', 'Their flat faces make breathing difficult and they overheat easily', 'Their bones are too fragile until age 2', 'They are naturally lazy and will refuse', 'Exercise causes their ears to droop', 'Brachycephalic breeds cannot pant as efficiently as longer-snouted dogs, making them highly susceptible to heatstroke.'),

-- NUTRITION
('nutrition', 'easy', 'Which common human food is toxic to French Bulldogs (and all dogs)?', 'Chocolate', 'Chicken', 'Rice', 'Carrots', 'Chocolate contains theobromine, which dogs cannot metabolise effectively. Dark chocolate is the most dangerous.'),
('nutrition', 'medium', 'French Bulldogs are prone to food allergies. What is the most common food allergen for dogs?', 'Beef protein', 'Rice', 'Sweet potato', 'Fish', 'Beef is the most common food allergen in dogs, followed by dairy and chicken. Frenchies are particularly prone to food sensitivities.'),
('nutrition', 'hard', 'What is the recommended daily calorie intake for an average adult French Bulldog weighing 25 pounds?', '500 to 600 calories', '200 to 300 calories', '800 to 1000 calories', '1200 to 1500 calories', 'A 25-pound moderately active Frenchie needs about 500-600 calories per day. Overfeeding is a common problem with this breed.'),

-- TRAINING
('training', 'easy', 'What training method works best for French Bulldogs?', 'Positive reinforcement with treats and praise', 'Strict discipline and loud commands', 'Ignoring bad behaviour completely', 'Physical corrections', 'Frenchies respond best to positive reinforcement. They can be stubborn, so patience and high-value treats are key.'),
('training', 'medium', 'Why can French Bulldogs be more challenging to house-train than some other breeds?', 'They are naturally stubborn and can be slow to learn routines', 'They have very small bladders', 'They cannot go outside in any weather', 'They prefer to go indoors', 'Frenchies are known for their stubborn streak, which can make house training take longer. Consistency and patience are essential.'),

-- FRENCHIE VS THE WORLD
('frenchie_vs_world', 'easy', 'Which breed did the French Bulldog surpass to become America''s most popular breed in 2022?', 'Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Poodle', 'The Labrador Retriever had been #1 for 31 consecutive years before the French Bulldog took the top spot in 2022.'),
('frenchie_vs_world', 'medium', 'How does the French Bulldog''s lifespan compare to the English Bulldog''s?', 'Frenchies typically live 2-3 years longer', 'They have about the same lifespan', 'English Bulldogs live significantly longer', 'Frenchies live about 5 years longer', 'French Bulldogs typically live 10-12 years, while English Bulldogs average 8-10 years.'),
('frenchie_vs_world', 'hard', 'Approximately how many French Bulldogs were registered with the AKC in 2024?', 'About 74,500', 'About 150,000', 'About 30,000', 'About 250,000', 'AKC registrations peaked at about 108,000 in 2022 and declined to approximately 74,500 in 2024, though Frenchies remained the most popular breed.'),

-- POP CULTURE
('pop_culture', 'easy', 'In what type of social media content are French Bulldogs most commonly featured?', 'Funny snoring and sleeping videos', 'Agility course competitions', 'Swimming videos', 'Long-distance running clips', 'Frenchie content is hugely popular on TikTok and Instagram, with snoring, splooting, and goofy behaviour videos going viral regularly.'),
('pop_culture', 'medium', 'Approximately how many views does the #frenchbulldog hashtag have on TikTok?', 'Over 17 billion', 'About 1 billion', 'About 500 million', 'Over 50 billion', 'The #frenchbulldog hashtag has accumulated over 17.9 billion views on TikTok, making it one of the most popular dog breed hashtags.'),

-- TRUE OR FALSE
('true_or_false', 'easy', 'True or False: French Bulldogs can naturally give birth without veterinary assistance.', 'False', 'True', NULL, NULL, 'Over 80% of Frenchie litters are delivered via C-section due to the puppies'' large heads relative to the mother''s narrow hips.'),
('true_or_false', 'easy', 'True or False: French Bulldogs are excellent swimmers.', 'False', 'True', NULL, NULL, 'Frenchies are notoriously poor swimmers due to their top-heavy build, short legs, and flat faces. They should always wear life vests near water.'),
('true_or_false', 'medium', 'True or False: The French Bulldog was originally bred in France.', 'False', 'True', NULL, NULL, 'Despite their name, French Bulldogs originated in England as a toy version of the English Bulldog before becoming popular in France.'),
('true_or_false', 'medium', 'True or False: A blue French Bulldog is a recognised AKC standard colour.', 'False', 'True', NULL, NULL, 'Blue (dilute) Frenchies are not recognised by the AKC breed standard. Standard colours include fawn, brindle, cream, white, and combinations of these.'),
('true_or_false', 'hard', 'True or False: French Bulldogs have been banned from flying on some airlines due to health risks.', 'True', 'False', NULL, NULL, 'Multiple airlines have restricted or banned brachycephalic breeds from cargo holds due to a significantly higher risk of respiratory distress and death during flights.'),

-- SPEED ROUND
('speed_round', 'easy', 'What shape are a French Bulldog''s ears?', 'Bat-shaped', 'Floppy', 'Pointed', 'Rose-shaped', NULL),
('speed_round', 'easy', 'Do French Bulldogs have long or short tails?', 'Short', 'Long', NULL, NULL, NULL),
('speed_round', 'easy', 'Are French Bulldogs a small or large breed?', 'Small', 'Large', 'Medium', 'Giant', NULL),
('speed_round', 'easy', 'What sound are French Bulldogs famous for making while sleeping?', 'Snoring', 'Howling', 'Barking', 'Whistling', NULL),
('speed_round', 'easy', 'What continent did French Bulldogs originate from?', 'Europe', 'Asia', 'North America', 'South America', NULL),

-- EXPERT ONLY
('expert_only', 'hard', 'What is the genetic test called that screens for the most common hereditary diseases in French Bulldogs?', 'French Bulldog Health Panel', 'Canine Complete Screen', 'Bulldog DNA Profile', 'Brachycephalic Gene Test', 'UC Davis VGL offers a French Bulldog Health Panel that tests for conditions including DM, CMR1, HUU, JHC, and chondrodysplasia.'),
('expert_only', 'hard', 'What is the name of the condition where a French Bulldog''s kneecap slides out of its normal position?', 'Patellar luxation', 'Cruciate rupture', 'Hip dysplasia', 'Osteochondritis dissecans', 'Patellar luxation is common in small breeds including Frenchies, where the kneecap (patella) dislocates from the groove in the femur.'),
('expert_only', 'hard', 'In the FCI (Fédération Cynologique Internationale) classification, what group are French Bulldogs in?', 'Group 9: Companion and Toy Dogs', 'Group 2: Pinscher and Schnauzer type', 'Group 3: Terriers', 'Group 1: Sheepdogs and Cattledogs', 'The FCI classifies French Bulldogs in Group 9 (Companion and Toy Dogs), Section 11 (Small Molossian Dogs).'),
('expert_only', 'hard', 'What condition, abbreviated as HUU, causes French Bulldogs to form bladder stones from uric acid?', 'Hyperuricosuria', 'Hyperthyroidism', 'Hemolytic Uremic Syndrome', 'Hypertrophic Urethropathy', 'HUU is an inherited condition where affected dogs excrete excessive uric acid in their urine, leading to the formation of urate bladder stones.');

-- Update version hash after seeding
UPDATE question_versions SET version_hash = 'v1.0.0-seed-60q', updated_at = datetime('now') WHERE id = 1;
