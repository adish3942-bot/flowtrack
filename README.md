# FlowTrack PRO 🔥

Your all-in-one tracker for college, gym & life.

## 📁 File Structure
```
flowtrack3/
├── index.html        ← Login / Sign Up page
├── app.html          ← Main app (after login)
├── manifest.json     ← PWA manifest (install to phone)
├── css/
│   ├── login.css     ← Login page styles
│   └── app.css       ← Full app styles
└── js/
    ├── auth.js       ← Login & signup logic
    ├── data.js       ← All state & data
    ├── notifications.js ← Push + in-app notifications
    ├── tasks.js      ← Task management per space
    ├── diet.js       ← Diet & macro tracking
    ├── physique.js   ← Photo progress tracking
    ├── games.js      ← 4 brain training games
    └── app.js        ← Main controller
```

## 🚀 Deploy to GitHub Pages (Simple)

1. Go to github.com → New Repository → name it `flowtrack` → Public
2. Upload ALL files (keep folder structure!)
3. Go to Settings → Pages → Branch: main → Save
4. Live at: `https://YOURUSERNAME.github.io/flowtrack`

## 📱 Install on Phone (PWA)

**Android (Chrome):**
- Open your GitHub Pages URL in Chrome
- Tap ⋮ menu → "Add to Home Screen"
- App installs like a native app!

**iPhone (Safari):**
- Open your GitHub Pages URL in Safari
- Tap Share button → "Add to Home Screen"

## 🔔 Enable Notifications

1. Open the app → Click 🔔 in sidebar → "Notifications"
2. Click "Enable Notifications"
3. Allow permission when browser asks
4. Done! You'll get notified before each task

## 👤 Demo Login
- Username: `demo`
- Password: `demo123`

## ✨ Features
- 🎓 **College Space** — assignments, exams, lectures
- 📚 **School Space** — classes, homework, projects  
- 💪 **Gym Space** — workouts, sets, fitness goals
- ⚡ **Routine Space** — daily habits, personal tasks
- 🥩 **Diet Tracker** — macros, meals, water intake
- 📸 **Physique Tracker** — photo progress, weight chart
- 🧠 **MindGames** — memory, reaction, math, scramble
- 🔔 **Notifications** — browser push + in-app toasts
- 💾 **Auto-save** — everything saves to localStorage
