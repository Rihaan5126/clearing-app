-- Seed: top 15 UK universities by QS World University Rankings 2027.
-- clearing_phone is intentionally left null: most universities only publish
-- their live Clearing hotline number on A-level results day itself, and
-- Oxford/Cambridge/Imperial don't run Clearing at all (places fill before
-- it opens). scrape_status stays 'manual_fallback' until the scraper
-- verifies a real number/course list from the university's own page.
--
-- Detailed course/vacancy data (the `courses` table) is populated on demand
-- per university, driven by which universities a user actually selects in
-- their profile — not scraped eagerly for all 15 up front.

insert into universities (name, clearing_phone, website_url, scrape_status) values
('Imperial College London', null, 'https://www.imperial.ac.uk/study/apply/contact/', 'manual_fallback'),
('University of Oxford', null, 'https://www.ox.ac.uk/admissions/undergraduate/applying-to-oxford/guide/results', 'manual_fallback'),
('University of Cambridge', null, 'https://www.undergraduate.study.cam.ac.uk/', 'manual_fallback'),
('University College London', null, 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/clearing', 'manual_fallback'),
('University of Edinburgh', null, 'https://www.ed.ac.uk/clearing-2026', 'manual_fallback'),
('King''s College London', null, 'https://www.kcl.ac.uk/study/undergraduate/clearing', 'manual_fallback'),
('University of Manchester', null, 'https://www.manchester.ac.uk/study/undergraduate/applying/clearing/', 'manual_fallback'),
('University of Bristol', null, 'https://www.bristol.ac.uk/clearing/', 'manual_fallback'),
('London School of Economics and Political Science', null, 'https://www.lse.ac.uk/study-at-lse/Undergraduate', 'manual_fallback'),
('University of Warwick', null, 'https://warwick.ac.uk/study/results/clearing', 'manual_fallback'),
('University of Birmingham', null, 'https://www.birmingham.ac.uk/study/undergraduate/clearing', 'manual_fallback'),
('University of Leeds', null, 'https://www.leeds.ac.uk/clearing', 'manual_fallback'),
('University of Glasgow', null, 'https://www.gla.ac.uk/study/clearing/', 'manual_fallback'),
('University of Sheffield', null, 'https://www.sheffield.ac.uk/clearing', 'manual_fallback'),
('Durham University', null, 'https://www.durham.ac.uk/study/undergraduate/clearing/', 'manual_fallback');
