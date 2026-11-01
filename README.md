# BeforeExams

A free revision platform for Cambridge IGCSE and AS & A Level students, made by DusboyevC and Magnetars.

Live site: https://beforexams.netlify.app

## What it does

- Topical practice and revision notes for Maths, Physics, Chemistry, Biology and Computer Science
- An exam guide with paper times, marks and weightings
- Topic trends across the years
- Mock test timing and score tracking
- Accounts with email codes, and an admin page for the owner

## How it is built

- `site/`: a static single-page website in plain HTML, CSS and JavaScript
- `papers_fn/`: Cloudflare Pages Functions that lock files and issue signed links
- `pipeline/`: Python scripts that build the static pages, trends and exam data
- `notes_src/`: source files for the revision notes
- `supabase_*.sql`: database setup for accounts, scores and admin stats

## Notes

Exam papers and syllabus files are not in this repository. BeforeExams is an independent project and is not affiliated with Cambridge.

The Supabase key in `site/assets/config.js` is the public anon key, which is safe to publish. Access to data is protected by row level security.
