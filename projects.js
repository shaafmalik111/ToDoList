
// main.js - starts the app, handles navigation, theme and button clicks

// ---------- Menu items ----------
const NAV = [
  { id: "tasks", label: "All Tasks", icon: "checkSquare" },
  { id: "notes", label: "Notes", icon: "fileText" },
  { id: "projects", label: "Projects", icon: "users" },
  { id: "settings", label: "Settings", icon: "sliders" }
];

// ---------- Theme (dark / light) ---------
const Theme = {
  apply() {
    const theme = Store.data.settings.theme;

    document.documentElement.dataset.theme = theme;

    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute(
        "content",
        theme === "dark" ? "#06101c" : "#eef5fc"
      );

    // Sun = switch to light, moon = switch to dark
    $("#theme-btn").innerHTML = icon(
      theme === "dark" ? "sun" : "moon",
      24
    );
  },

  toggle() {
    Store.data.settings.theme =
      Store.data.settings.theme === "dark" ? "light" : "dark";

    Store.save();
    this.apply();

    if (App.current === "settings") {
      Settings.render();
    }
  }
};

// ---------- Side menu ----------
const Drawer = {
  build() {
    $("#drawer").innerHTML =
      '<div class="drawer-brand">' +
        '<img src="./icon.svg" alt="FocusList logo">' +
        '<div>' +
          '<strong>FocusList</strong>' +
          '<span>Organize your day</span>' +
        '</div>' +
      '</div>' +

      NAV.map((item) =>
        '<button class="nav-item" data-nav="' + item.id + '">' +
          icon(item.icon, 22) +
          '<span>' + item.label + '</span>' +
        '</button>'
      ).join("") +

      '<div class="drawer-foot">v1.0 - works offline</div>';
  },

  open() {
    $("#drawer").classList.add("open");
    $("#backdrop").classList.add("show");
    document.body.classList.add("no-scroll");
  },

  close() {
    $("#drawer").classList.remove("open");

    if (!$("#sheet").classList.contains("open")) {
      $("#backdrop").classList.remove("show");
      document.body.classList.remove("no-scroll");
    }
  },

  highlight() {
    document.querySelectorAll(".nav-item").forEach(function (button) {
      button.classList.toggle(
        "active",
        button.dataset.nav === App.current
      );
    });
  }
};

// ---------- What each button (data-action) does ----------
const Actions = {
  "toggle-task": (id) => Tasks.toggle(id),
  "edit-task": (id) => Tasks.openEditor(id),
  "delete-task": (id) => Tasks.remove(id),
  "set-filter": (id, button) => Tasks.setFilter(button.dataset.value),

  "enable-reminders": async () => {
    await Reminders.turnOn();
    Tasks.render();
  },

  "select-note": (id) => Notes.select(id),
  "new-note": () => Notes.addNew(),
  "delete-note": () => Notes.remove(),
  "download-txt": () => Notes.downloadText(),
  "print-note": () => Notes.print(),

  "edit-project": (id) => Projects.openEditor(id),
  "delete-project": (id) => Projects.remove(id),
  "toggle-member": (id, button) =>
    Projects.toggleMember(button.dataset.pid, button.dataset.mid),

  "toggle-reminders": () => Settings.toggleReminders(),
  "test-reminder": () => Reminders.test(),
  "set-timeFormat": (id, button) =>
    Settings.setTimeFormat(button.dataset.value),
  "set-theme": (id, button) =>
    Settings.setTheme(button.dataset.value),
  "install-app": () => Settings.install(),
  "share-app": () => Settings.share(),
  "export-data": () => Settings.exportData(),
  "import-data": () => $("#import-file").click(),
  "reset-data": () => Settings.reset()
};

// ---------- The app ----------
const App = {
  current: "tasks",

  init() {
    Store.load();
    Theme.apply();
    Sheet.init();
    Notes.init();
    Drawer.build();

    $("#menu-btn").innerHTML = icon("menu", 24);
    $("#fab").innerHTML = icon("plus", 30);

    $("#menu-btn").addEventListener("click", () => Drawer.open());

    $("#theme-btn").addEventListener("click", () => Theme.toggle());

    $("#backdrop").addEventListener("click", () => {
      Sheet.close();
      Drawer.close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        Sheet.close();
        Drawer.close();
      }
    });

    // The + button adds a task or project, depending on the screen
    $("#fab").addEventListener("click", () => {
      if (App.current === "tasks") {
        Tasks.openEditor();
      }

      if (App.current === "projects") {
        Projects.openEditor();
      }
    });

    // Menu items
    $("#drawer").addEventListener("click", (event) => {
      const item = event.target.closest("[data-nav]");

      if (!item) return;

      location.hash = "#/" + item.dataset.nav;
      Drawer.close();
    });

    // One click listener for every button with data-action
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");

      if (!button) return;

      const action = Actions[button.dataset.action];

      if (!action) return;

      const holder = button.closest("[data-id]");

      action(holder ? holder.dataset.id : null, button, event);
    });

    // The phone's back button changes the screen through the URL hash
    window.addEventListener("hashchange", () => this.route());

    // Browser tells us the app can be installed
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();

      Settings.installPrompt = event;

      if (App.current === "settings") {
        Settings.render();
      }
    });

    // Save the open note when the app goes to the background
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        Notes.flush();
      }
    });

    this.registerServiceWorker();
    Reminders.start();
    this.route();
  },

  route() {
    const name = location.hash.replace("#/", "");

    this.current = NAV.some((item) => item.id === name)
      ? name
      : "tasks";

    this.render();
    window.scrollTo(0, 0);
  },

  render() {
    // Never lose a pending note edit when changing screens
    Notes.flush();

    const fab = $("#fab");

    fab.hidden = !(
      this.current === "tasks" ||
      this.current === "projects"
    );

    fab.setAttribute(
      "aria-label",
      this.current === "projects" ? "New project" : "New task"
    );

    if (this.current === "tasks") Tasks.render();
    if (this.current === "notes") Notes.render();
    if (this.current === "projects") Projects.render();
    if (this.current === "settings") Settings.render();

    Drawer.highlight();
  },

  // Service workers need HTTPS or localhost
  registerServiceWorker() {
    const secure =
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";

    if ("serviceWorker" in navigator && secure) {
      navigator.serviceWorker
        .register("./sw.js")
        .catch(function (error) {
          console.error("Service worker registration failed:", error);
        });
    }
  }
};

App.init();
