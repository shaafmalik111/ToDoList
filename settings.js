/* settings.js - reminders, time format, theme, install, share and backup */

const Settings = {
  installPrompt: null,   // filled when the browser says the app can be installed

  isInstalled() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  },

  render() {
    const settings = Store.data.settings;
    const remindersOn = Reminders.enabled();

    let reminderText;
    if (!Reminders.supported()) {
      reminderText = '<span class="status-off">Not supported in this browser.</span>';
    } else if (Notification.permission === "denied") {
      reminderText = '<span class="status-off">Notifications are blocked in your browser settings.</span>';
    } else if (remindersOn) {
      reminderText = '<span class="status-ok">Reminders are on.</span>';
    } else {
      reminderText = '<span class="status-off">Reminders are off.</span>';
    }

    let installBlock = "";
    if (!this.isInstalled()) {
      if (this.installPrompt) {
        installBlock = '<div class="section"><span class="label">Install</span>' +
          '<p class="muted">Add the app to your home screen. It opens full screen and works offline.</p>' +
          '<button class="btn primary block" data-action="install-app">' + icon("phone", 20) + ' Install app</button></div>';
      } else {
        installBlock = '<div class="section"><span class="label">Install</span>' +
          '<p class="muted">Open your browser menu (the three dots) and tap <b>Install app</b> or <b>Add to Home screen</b>.</p></div>';
      }
    }

    function seg(name, value, label) {
      return '<button class="' + (settings[name] === value ? 'active' : '') + '" data-action="set-' + name + '" data-value="' + value + '">' + label + '</button>';
    }

    $("#view").innerHTML =
      '<div class="page-head"><h1>Settings</h1></div>' +

      '<div class="section"><span class="label">Reminders</span>' +
      '<p class="muted">' + reminderText + '<br>Reminders appear while the app is open or in the background.</p>' +
      '<div class="stack">' +
      (remindersOn
        ? '<button class="btn block" data-action="toggle-reminders">' + icon("bell", 20) + ' Turn off reminders</button>'
        : '<button class="btn primary block" data-action="toggle-reminders">' + icon("bell", 20) + ' Turn on reminders</button>') +
      '<button class="btn block" data-action="test-reminder">' + icon("clock", 20) + ' Send a test reminder</button>' +
      '</div></div>' +

      '<div class="section"><span class="label">Time format</span><div class="seg">' +
      seg("timeFormat", "12", "12-hour (am/pm)") + seg("timeFormat", "24", "24-hour") +
      '</div></div>' +

      '<div class="section"><span class="label">Theme</span><div class="seg">' +
      seg("theme", "dark", "Dark") + seg("theme", "light", "Light") +
      '</div></div>' +

      installBlock +

      '<div class="section"><span class="label">Share</span>' +
      '<p class="muted">Send this app to friends on WhatsApp or anywhere you like.</p>' +
      '<button class="btn primary block" data-action="share-app">' + icon("share", 20) + ' Share this app</button></div>' +

      '<div class="section"><span class="label">Your data</span>' +
      '<p class="muted">Everything is stored on this device only. Make a backup file to move it to another phone.</p>' +
      '<div class="stack">' +
      '<button class="btn block" data-action="export-data">' + icon("download", 20) + ' Download backup</button>' +
      '<button class="btn block" data-action="import-data">' + icon("upload", 20) + ' Restore from backup</button>' +
      '<button class="btn block" data-action="reset-data" style="color:var(--danger)">' + icon("trash", 20) + ' Delete all data</button>' +
      '</div><input type="file" id="import-file" accept="application/json,.json" hidden></div>';

    $("#import-file").addEventListener("change", (event) => this.importFile(event.target.files[0]));
  },

  async toggleReminders() {
    if (Reminders.enabled()) Reminders.turnOff();
    else await Reminders.turnOn();
    this.render();
  },

  setTimeFormat(value) {
    Store.data.settings.timeFormat = value;
    Store.save();
    this.render();
  },

  setTheme(value) {
    Store.data.settings.theme = value;
    Store.save();
    Theme.apply();
    this.render();
  },

  async install() {
    if (!this.installPrompt) return;
    this.installPrompt.prompt();
    await this.installPrompt.userChoice;
    this.installPrompt = null;
    this.render();
  },

  async share() {
    const shareData = {
      title: "SalahSync",
      text: "Salah & Quran tracker, tasks, notes and projects in one app.",
      url: location.href.split("#")[0]
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast("Link copied. Paste it in WhatsApp or anywhere.", "ok");
      }
    } catch (error) {
      // the user closed the share window: nothing to do
    }
  },

  exportData() {
    Notes.flush();
    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile("salahsync-backup-" + stamp + ".json", JSON.stringify(Store.data, null, 2), "application/json");
    toast("Backup downloaded.", "ok");
  },

  importFile(file) {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = function () {
      try {
        const imported = JSON.parse(reader.result);
        const valid = imported && Array.isArray(imported.tasks) && Array.isArray(imported.notes) && Array.isArray(imported.projects);
        if (!valid) throw new Error("wrong file");

        confirmSheet("This replaces everything in the app with the backup.", "Restore", function () {
          localStorage.setItem(Store.KEY, JSON.stringify(imported));
          Store.load();
          Theme.apply();
          App.render();
          toast("Backup restored.", "ok");
        });
      } catch (error) {
        toast("That file is not a valid backup.", "error");
      }
    };
    reader.readAsText(file);
  },

  reset() {
    confirmSheet("All tasks, notes, projects and prayer records will be deleted from this device.", "Delete everything", function () {
      localStorage.removeItem(Store.KEY);
      Store.load();       // starts again with the example data
      Theme.apply();
      App.render();
      toast("All data deleted.");
    });
  }
};
