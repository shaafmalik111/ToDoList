# FocusList

A mobile-first to-do app you can install on your phone. Built with plain **HTML, CSS and JavaScript** (no frameworks, no build step). It works offline and keeps all your data on your own device.

## Features

- **Tasks**: add, edit, delete and complete tasks, with an optional due date and time. Filters: All, Today, Upcoming, Done.
- **Reminders**: a notification when a task is due (see "About reminders" below).
- **Notes**: several notes with tabs, a formatting toolbar (bold, italic, underline, strikethrough, text size, text color, bullet list, alignment), a custom page color, automatic saving, download as `.txt` or save as PDF.
- **Projects**: create a team project, choose the number of members, give each member a task, and pick a leader. A progress bar shows how many member tasks are done.
- **Settings**: 12-hour or 24-hour time, dark or light theme, install button, share button, backup and restore.
- **Installable and offline**: it is a Progressive Web App (PWA).

## Run it on your computer

A service worker needs `http://localhost` (opening `index.html` by double-click also works, but without offline install).

```bash
cd focuslist
python -m http.server 8000
```

Open http://localhost:8000. In VS Code you can also use the **Live Server** extension.

## Put it online (GitHub Pages, free)

1. Create a new repository on GitHub and upload all these files (keep the `css`, `js` and `icons` folders).
2. Go to **Settings > Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then Save.
3. After a minute your app is live at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

## Install it on your phone

1. Open the link in Chrome (Android) or Safari (iPhone).
2. Android: tap the three dots, then **Install app** or **Add to Home screen**. iPhone: tap Share, then **Add to Home Screen**.
3. Open the app from your home screen. In **Settings**, tap **Turn on reminders** and allow notifications.

## About reminders (please read)

A web app can show a notification when it is **open or in the background**. The app checks your tasks every 15 seconds and sends the notification through the service worker.

A web app **cannot** reliably wake itself up when it is completely closed, because phones stop background web pages to save battery. To get reminders even when the app is fully closed you have two options:

- **Wrap the app with Capacitor** and use its Local Notifications plugin. This turns the same code into a real Android/iOS app (`npm init @capacitor/app`, copy these files into the `www` folder, add `@capacitor/local-notifications`, and schedule a notification each time a task is saved).
- **Web Push**: a small server sends a push message at the due time. This needs a backend.

## Project structure

```
focuslist/
    index.html            the page
    manifest.json         tells the phone how to install the app (name, icons, colors)
    sw.js                 service worker (offline support and notifications)
    css/style.css         all styling, dark and light themes
    js/
        utils.js          icons, date formatting, toast message, bottom sheet
        store.js          saves and loads data (localStorage), example data
        reminders.js      notifications for due tasks
        tasks.js          the Tasks screen
        notes.js          the Notes screen and editor toolbar
        projects.js       the Projects screen
        settings.js       the Settings screen, backup, install, share
        main.js           menu, theme, navigation, button clicks
    icons/                app icons
```

## Make it yours

- **Name**: change `FocusList` in `index.html`, `manifest.json` and `js/main.js`.
- **Colors**: edit the variables at the top of `css/style.css` (`--accent-1`, `--accent-2`, `--bg-1`, ...).
- **Icon**: replace the files in `icons/`.
- **After you change any file**, increase the number in `CACHE_NAME` inside `sw.js` so phones download the new version.

## Notes and limits

- Data is stored in your browser (`localStorage`). Use **Settings > Download backup** before clearing browser data or changing phones.
- Notes use the browser's built-in editing commands (`document.execCommand`). They work in all major browsers.
- Shapes (line, circle, rectangle) in notes are not included.
