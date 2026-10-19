# SalahSync

A calm, mobile-first web app (plain HTML, CSS and JavaScript, no build step, no backend) that combines a **Salah & Quran tracker** with tasks, reminders, notes and projects. Formerly FocusList; all existing data is kept.

## Features
- **Salah & Quran**: five prayers (10 points each) and Quran reading (20 points). Daily score = prayers x 10 + Quran x 20, maximum 70. Any past day can be corrected.
- **History**: one record per date, weekly and monthly completion, day streak, 7-day chart and a calendar heat map.
- **Reminders**: per-prayer and Quran reminder times with individual on/off switches (Salah & Quran > Reminders). Task reminders are unchanged.
- **Tasks, Notes, Projects, Settings, backup/restore, install as an app, offline**: unchanged from FocusList.

## Data and upgrading
Everything is stored in your browser's `localStorage` under the same key as before (`focuslist-data-v1`). A new `salah` section is added automatically to existing data; tasks, notes and projects are never modified. Backups made with the old app restore fine, and new backups include prayer records.

## Reminders (please read)
Web apps can notify you while open or in the background, but phones may stop a fully closed web app. If notifications are blocked or unsupported, reminders appear as an in-app message while the app is open. For a guaranteed call to prayer, also keep your phone's own alarm or prayer app.

## Run locally
```
python -m http.server 8000
```
Open http://localhost:8000

## Deploy to GitHub Pages
1. Copy every file in this folder into the root of your repository (replace the old files; keep `projects.js` and `notes.js`, `tasks.js` as they are).
2. `git add . && git commit -m "SalahSync redesign" && git push`
3. Repository **Settings > Pages**: Deploy from a branch, `main`, `/ (root)`.
4. Open `https://YOUR-USERNAME.github.io/ToDoList/`. If you still see the old design, close and reopen the app once (the service worker cache is now `salahsync-v3`).

## Files
`index.html`, `style.css` (design tokens at the top), `salah.js` (new tracker), `store.js`, `utils.js`, `reminders.js`, `tasks.js`, `notes.js`, `projects.js`, `settings.js`, `main.js`, `sw.js`, `manifest.json`, `icon*.png/svg`.
