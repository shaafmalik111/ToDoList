/* store.js - keeps all app data in the browser (localStorage) */

const Store = {
  KEY: "focuslist-data-v1",
  data: null,

  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  defaults() {
    return {
      tasks: [],
      notes: [],
      projects: [],
      activeNoteId: null,
      seeded: false,
      settings: { theme: "dark", timeFormat: "12", reminders: false }
    };
  },

  load() {
    const defaults = this.defaults();
    let saved = null;

    try {
      saved = JSON.parse(localStorage.getItem(this.KEY));
    } catch (error) {
      saved = null;   // broken or missing data: start fresh
    }

    this.data = Object.assign(this.defaults(), saved || {});
    this.data.settings = Object.assign(defaults.settings, (saved && saved.settings) || {});

    ["tasks", "notes", "projects"].forEach((name) => {
      if (!Array.isArray(this.data[name])) this.data[name] = [];
    });

    this.ensureSalah();
    if (!this.data.seeded) this.seed();
  },

  // Salah data is added to old saves safely: nothing existing is touched
  ensureSalah() {
    const times = { fajr: "05:00", dhuhr: "13:00", asr: "16:30", maghrib: "18:30", isha: "20:30", quran: "21:30" };
    let s = this.data.salah;
    if (!s || typeof s !== "object" || Array.isArray(s)) s = this.data.salah = {};
    if (!s.log || typeof s.log !== "object" || Array.isArray(s.log)) s.log = {};      // log["2026-10-19"] = { fajr: true, ... }
    if (!s.reminders || typeof s.reminders !== "object") s.reminders = {};
    Object.keys(times).forEach((id) => {
      const r = s.reminders[id] || {};
      s.reminders[id] = { on: r.on === true, time: /^\d\d:\d\d$/.test(r.time) ? r.time : times[id], last: r.last || "" };
    });
  },

  save() {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(this.data));
      return true;
    } catch (error) {
      toast("Could not save. Your browser storage may be full.", "error");
      return false;
    }
  },

  // Example data for the very first launch, so the app does not look empty
  seed() {
    const now = Date.now();
    const hour = 3600 * 1000;
    const tomorrow9 = new Date();
    tomorrow9.setDate(tomorrow9.getDate() + 1);
    tomorrow9.setHours(9, 0, 0, 0);

    this.data.tasks = [
      { id: this.uid(), title: "Go for a walk", due: toInputValue(new Date(now + 2 * hour)), done: false, notified: false, createdAt: now },
      { id: this.uid(), title: "Finish the OOP assignment", due: toInputValue(tomorrow9), done: false, notified: false, createdAt: now - 1 },
      { id: this.uid(), title: "Buy a notebook", due: "", done: true, notified: true, createdAt: now - 2 }
    ];

    const noteId = this.uid();
    this.data.notes = [{
      id: noteId,
      title: "Welcome",
      html: "<h2>Hello!</h2><ul><li>Format text with the toolbar above</li><li>Pick your own page color below</li><li>Notes save automatically</li></ul>",
      bg: "#ffffff",
      updatedAt: now
    }];
    this.data.activeNoteId = noteId;

    this.data.projects = [{
      id: this.uid(),
      name: "Final Year Project",
      members: [
        { id: this.uid(), name: "Ayesha", task: "Design the database", leader: true, done: true },
        { id: this.uid(), name: "Ali", task: "Build the login page", leader: false, done: false },
        { id: this.uid(), name: "Sara", task: "Write the report", leader: false, done: false }
      ],
      createdAt: now
    }];

    this.data.seeded = true;
    this.save();
  }
};
