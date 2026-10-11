/* tasks.js - the "All Tasks" screen */

const Tasks = {
  filter: "all",   // all | today | upcoming | done

  find(id) {
    return Store.data.tasks.find((task) => task.id === id);
  },

  // Tasks to show for the selected filter, in a sensible order
  visible() {
    const endOfToday = startOfDay(new Date()).getTime() + 86400000;   // start of tomorrow
    let list = Store.data.tasks.slice();

    if (this.filter === "today") {
      list = list.filter((t) => !t.done && t.due && new Date(t.due).getTime() < endOfToday);
    } else if (this.filter === "upcoming") {
      list = list.filter((t) => !t.done && t.due && new Date(t.due).getTime() >= endOfToday);
    } else if (this.filter === "done") {
      list = list.filter((t) => t.done);
    }

    // pending first, then by due time (tasks without a date go last)
    list.sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      const timeA = a.due ? new Date(a.due).getTime() : Infinity;
      const timeB = b.due ? new Date(b.due).getTime() : Infinity;
      if (timeA === timeB) return b.createdAt - a.createdAt;
      return timeA < timeB ? -1 : 1;
    });

    return list;
  },

  render() {
    const tasks = Store.data.tasks;
    const remaining = tasks.filter((t) => !t.done).length;
    const list = this.visible();
    const now = Date.now();

    const filters = [["all", "All"], ["today", "Today"], ["upcoming", "Upcoming"], ["done", "Done"]];
    const chips = filters.map(function (item) {
      const active = item[0] === Tasks.filter ? " active" : "";
      return '<button class="chip' + active + '" data-action="set-filter" data-value="' + item[0] + '">' + item[1] + '</button>';
    }).join("");

    // Offer to turn on reminders when there are tasks with a time
    let banner = "";
    const hasTimedTasks = tasks.some((t) => !t.done && t.due);
    if (!Store.data.settings.reminders && hasTimedTasks && Reminders.supported()) {
      banner = '<div class="card banner">' + icon("bell", 24) +
        '<p>Get a notification when a task is due.</p>' +
        '<button class="btn primary" data-action="enable-reminders">Turn on</button></div>';
    }

    let body;
    if (list.length === 0) {
      const text = tasks.length === 0
        ? "Tap the + button to add your first task."
        : "Nothing here. Try another filter.";
      body = '<div class="card empty">' + icon("checkSquare", 40) + '<h3>No tasks</h3><p class="muted">' + text + '</p></div>';
    } else {
      body = '<ul class="task-list">' + list.map(function (task) {
        const overdue = task.due && !task.done && new Date(task.due).getTime() < now;
        const due = task.due
          ? '<div class="task-due' + (overdue ? ' overdue' : '') + '">' + icon("clock", 14) + ' ' + esc(formatDue(task.due)) + '</div>'
          : "";
        return '<li class="card task' + (task.done ? ' done' : '') + '" data-id="' + task.id + '">' +
          '<button class="check' + (task.done ? ' on' : '') + '" data-action="toggle-task" aria-label="Mark as done or pending">' + icon("check", 20) + '</button>' +
          '<div class="task-body"><div class="task-title">' + esc(task.title) + '</div>' + due + '</div>' +
          '<div class="task-actions">' +
          '<button class="icon-btn small" data-action="edit-task" aria-label="Edit task">' + icon("edit", 18) + '</button>' +
          '<button class="icon-btn small danger" data-action="delete-task" aria-label="Delete task">' + icon("trash", 18) + '</button>' +
          '</div></li>';
      }).join("") + '</ul>';
    }

    $("#view").innerHTML =
      '<div class="page-head"><h1>All Tasks</h1><p class="sub">' + remaining + ' remaining</p></div>' +
      banner + '<div class="chips">' + chips + '</div>' + body;
  },

  setFilter(value) {
    this.filter = value;
    this.render();
  },

  toggle(id) {
    const task = this.find(id);
    if (!task) return;
    task.done = !task.done;
    Store.save();
    this.render();
  },

  remove(id) {
    const task = this.find(id);
    if (!task) return;
    confirmSheet('"' + task.title + '" will be deleted.', "Delete", () => {
      Store.data.tasks = Store.data.tasks.filter((t) => t.id !== id);
      Store.save();
      this.render();
      toast("Task deleted.");
    });
  },

  // Opens the "New task" / "Edit task" sheet
  openEditor(id) {
    const task = id ? this.find(id) : null;

    Sheet.open(
      '<h2 class="sheet-title">' + (task ? "Edit task" : "New task") + '</h2>' +
      '<label class="label" for="t-title">Task</label>' +
      '<input id="t-title" class="field" maxlength="120" placeholder="What do you need to do?" autocomplete="off">' +
      '<label class="label" for="t-due">Due (optional)</label>' +
      '<input id="t-due" class="field" type="datetime-local">' +
      '<div class="quick-row">' +
      '<button class="chip" data-quick="1h">In 1 hour</button>' +
      '<button class="chip" data-quick="tonight">Tonight</button>' +
      '<button class="chip" data-quick="tomorrow">Tomorrow 9:00</button>' +
      '<button class="chip" data-quick="none">No date</button>' +
      '</div>' +
      '<div class="sheet-actions">' +
      '<button class="btn" data-sheet="close">Cancel</button>' +
      '<button class="btn primary" id="t-save">' + (task ? "Save changes" : "Add task") + '</button>' +
      '</div>',
      function (sheet) {
        const titleInput = $("#t-title", sheet);
        const dueInput = $("#t-due", sheet);

        if (task) {
          titleInput.value = task.title;
          dueInput.value = task.due || "";
        }

        // Quick time buttons
        sheet.querySelectorAll("[data-quick]").forEach(function (button) {
          button.addEventListener("click", function () {
            const date = new Date();
            const choice = button.dataset.quick;
            if (choice === "1h") date.setHours(date.getHours() + 1);
            if (choice === "tonight") date.setHours(20, 0, 0, 0);
            if (choice === "tomorrow") { date.setDate(date.getDate() + 1); date.setHours(9, 0, 0, 0); }
            dueInput.value = choice === "none" ? "" : toInputValue(date);
          });
        });

        function save() {
          const title = titleInput.value.trim();
          if (!title) {
            toast("Please type a task name.", "error");
            titleInput.focus();
            return;
          }
          Tasks.save(task, title, dueInput.value);
        }

        $("#t-save", sheet).addEventListener("click", save);
        titleInput.addEventListener("keydown", function (event) {
          if (event.key === "Enter") save();
        });
        if (!task) setTimeout(function () { titleInput.focus(); }, 300);
      }
    );
  },

  save(task, title, due) {
    if (task) {
      if (task.due !== due) task.notified = false;   // new time = remind again
      task.title = title;
      task.due = due;
    } else {
      Store.data.tasks.push({
        id: Store.uid(), title: title, due: due,
        done: false, notified: false, createdAt: Date.now()
      });
    }

    Store.save();
    Sheet.close();
    this.render();
    toast(task ? "Task updated." : "Task added.", "ok");
    Reminders.check();
  }
};
