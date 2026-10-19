/* reminders.js - notifications for tasks that are due */

const Reminders = {
  timer: null,

  supported() {
    return "Notification" in window;
  },

  // True when the user turned reminders on AND the browser allows notifications
  enabled() {
    return Store.data.settings.reminders && this.supported() && Notification.permission === "granted";
  },

  async turnOn() {
    if (!this.supported()) {
      toast("This browser does not support notifications.", "error");
      return false;
    }

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      Store.data.settings.reminders = true;
      Store.save();
      toast("Reminders are on.", "ok");
      return true;
    }

    toast("Notifications are blocked. Allow them in your browser settings.", "error");
    return false;
  },

  turnOff() {
    Store.data.settings.reminders = false;
    Store.save();
    toast("Reminders are off.");
  },

  // Shows a notification. It goes through the service worker when possible,
  // because that is the only way notifications work on Android Chrome.
  async notify(title, body) {
    if (!this.supported() || Notification.permission !== "granted") return false;

    const options = {
      body: body,
      icon: "./icon-192.png",
      badge: "./icon-192.png",
      vibrate: [120, 60, 120]
    };

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(title, options);
          return true;
        }
      }
      new Notification(title, options);
      return true;
    } catch (error) {
      return false;
    }
  },

  // Looks for tasks whose time has come
  check() {
    if (typeof Salah !== "undefined") Salah.checkReminders();
    if (!this.enabled()) return;

    const now = Date.now();
    const twoHours = 2 * 3600 * 1000;
    let changed = false;

    Store.data.tasks.forEach((task) => {
      if (task.done || !task.due || task.notified) return;

      const dueTime = new Date(task.due).getTime();
      if (dueTime > now) return;

      task.notified = true;
      changed = true;

      // Very old tasks are only marked (they show as "overdue" in the list)
      if (now - dueTime < twoHours) {
        this.notify("Task due: " + task.title, "Due " + formatDue(task.due));
        if (!document.hidden) toast("Due now: " + task.title);
      }
    });

    if (changed) {
      Store.save();
      if (typeof App !== "undefined" && App.current === "tasks") Tasks.render();
    }
  },

  start() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.check(), 15000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) this.check();
    });
    this.check();
  },

  // "Send test" button in Settings
  async test() {
    if (!this.enabled()) {
      const ok = await this.turnOn();
      if (!ok) return;
    }
    toast("Test reminder in 5 seconds. Switch to another app to see it.", "ok");
    setTimeout(() => {
      this.notify("Test reminder", "Reminders are working.");
      if (!document.hidden) toast("Test reminder: it works!", "ok");
    }, 5000);
  }
};
