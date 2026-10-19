/* notes.js - the "Notes" screen with a formatting toolbar */

const Notes = {
  savedRange: null,   // remembers the text selection while you use the toolbar
  saveTimer: null,

  init() {
    // Remember the selection inside the editor, and highlight active toolbar button
    document.addEventListener("selectionchange", () => {
      const editor = $("#editor");
      if (!editor) return;
      const selection = window.getSelection();
      if (selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
        this.savedRange = selection.getRangeAt(0).cloneRange();
        this.updateToolbar();
      }
    });
  },

  // Makes sure there is always at least one note
  ensureNote() {
    if (Store.data.notes.length === 0) this.create();
    if (!Store.data.notes.some((n) => n.id === Store.data.activeNoteId)) {
      Store.data.activeNoteId = Store.data.notes[0].id;
    }
  },

  active() {
    return Store.data.notes.find((n) => n.id === Store.data.activeNoteId);
  },

  create() {
    const note = { id: Store.uid(), title: "", html: "", bg: "#ffffff", updatedAt: Date.now() };
    Store.data.notes.push(note);
    Store.data.activeNoteId = note.id;
    return note;
  },

  label(note) {
    return note.title.trim() || "Untitled";
  },

  render() {
    this.ensureNote();
    const note = this.active();

    const tabs = Store.data.notes.map((n) =>
      '<button class="chip' + (n.id === note.id ? ' active' : '') + '" data-id="' + n.id + '" data-action="select-note">' + esc(this.label(n)) + '</button>'
    ).join("");

    $("#view").innerHTML =
      '<div class="page-head"><h1>Notes</h1></div>' +
      '<div class="tabs">' + tabs + '<button class="chip ghost" data-action="new-note">+ New note</button></div>' +
      '<input id="note-title" class="field note-title" placeholder="Untitled" maxlength="60" autocomplete="off">' +
      '<div class="card toolbar" id="toolbar">' +
        '<button class="tool" data-cmd="bold" aria-label="Bold"><b>B</b></button>' +
        '<button class="tool" data-cmd="italic" aria-label="Italic"><i>I</i></button>' +
        '<button class="tool" data-cmd="underline" aria-label="Underline"><u>U</u></button>' +
        '<button class="tool" data-cmd="strikeThrough" aria-label="Strikethrough"><s>S</s></button>' +
        '<span class="tool-sep"></span>' +
        '<select class="tool-select" id="size-select" aria-label="Text size">' +
          '<option value="" selected>Aa</option><option value="2">Small</option><option value="3">Normal</option><option value="5">Large</option><option value="6">Huge</option>' +
        '</select>' +
        '<label class="tool color-tool" aria-label="Text color"><span class="color-swatch"><span>A</span><i id="color-bar"></i></span><input type="color" id="color-input" value="#2563eb"></label>' +
        '<span class="tool-sep"></span>' +
        '<button class="tool" data-cmd="insertUnorderedList" aria-label="Bullet list">' + icon("list", 20) + '</button>' +
        '<button class="tool" data-cmd="align" id="align-btn" aria-label="Text alignment">' + icon("alignLeft", 20) + '</button>' +
      '</div>' +
      '<h1 class="print-title" id="print-title"></h1>' +
      '<div class="page" id="editor" contenteditable="true" spellcheck="true" data-placeholder="Start writing..."></div>' +
      '<div class="note-actions">' +
        '<label class="btn bg-tool">Page color<input type="color" id="bg-input"></label>' +
        '<button class="btn" data-action="download-txt">' + icon("download", 18) + ' .txt</button>' +
        '<button class="btn" data-action="print-note">' + icon("printer", 18) + ' PDF</button>' +
        '<button class="btn" data-action="delete-note">' + icon("trash", 18) + '</button>' +
        '<span class="save-state" id="save-state">Saved</span>' +
      '</div>';

    this.bind(note);
  },

  // Connects the editor, title and toolbar of the note that was just drawn
  bind(note) {
    const editor = $("#editor");
    const titleInput = $("#note-title");
    titleInput.value = note.title;
    editor.innerHTML = note.html;
    this.applyBackground(note);

    // Plain text paste keeps the page clean
    editor.addEventListener("paste", function (event) {
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, text);
    });

    editor.addEventListener("input", () => {
      note.html = editor.innerHTML;
      this.queueSave();
    });

    titleInput.addEventListener("input", () => {
      note.title = titleInput.value;
      const tab = document.querySelector('.tabs .chip[data-id="' + note.id + '"]');
      if (tab) tab.textContent = this.label(note);
      this.queueSave();
    });

    const toolbar = $("#toolbar");
    // keep the cursor inside the editor when tapping toolbar buttons
    toolbar.addEventListener("mousedown", function (event) {
      if (event.target.closest("button")) event.preventDefault();
    });
    toolbar.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-cmd]");
      if (button) this.runCommand(button.dataset.cmd);
    });

    $("#size-select").addEventListener("change", (event) => {
      const size = event.target.value;
      if (size) this.runCommand("fontSize", size);
      event.target.value = "";
    });

    $("#color-input").addEventListener("input", (event) => {
      $("#color-bar").style.background = event.target.value;
      this.runCommand("foreColor", event.target.value);
    });

    const bgInput = $("#bg-input");
    bgInput.value = note.bg;
    bgInput.addEventListener("input", () => {
      note.bg = bgInput.value;
      this.applyBackground(note);
      this.queueSave();
    });
  },

  // Page color, with readable text on dark pages
  applyBackground(note) {
    const editor = $("#editor");
    const hex = note.bg || "#ffffff";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    editor.style.background = hex;
    editor.style.color = brightness > 140 ? "#111827" : "#f3f4f6";
  },

  restoreSelection() {
    const editor = $("#editor");
    editor.focus();
    if (this.savedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.savedRange);
    }
  },

  runCommand(command, value) {
    this.restoreSelection();
    document.execCommand("styleWithCSS", false, true);

    if (command === "align") {
      // each tap switches: left -> center -> right -> left
      if (document.queryCommandState("justifyCenter")) command = "justifyRight";
      else if (document.queryCommandState("justifyRight")) command = "justifyLeft";
      else command = "justifyCenter";
    }

    document.execCommand(command, false, value || null);

    const note = this.active();
    note.html = $("#editor").innerHTML;
    this.queueSave();
    this.updateToolbar();
  },

  // Highlights the toolbar buttons that match the text under the cursor
  updateToolbar() {
    const toolbar = $("#toolbar");
    if (!toolbar) return;

    toolbar.querySelectorAll("button[data-cmd]").forEach(function (button) {
      const command = button.dataset.cmd;
      if (command === "align") return;
      let on = false;
      try { on = document.queryCommandState(command); } catch (error) { on = false; }
      button.classList.toggle("active", on);
    });

    let name = "alignLeft";
    if (document.queryCommandState("justifyCenter")) name = "alignCenter";
    if (document.queryCommandState("justifyRight")) name = "alignRight";
    const alignButton = $("#align-btn");
    alignButton.innerHTML = icon(name, 20);
    alignButton.classList.toggle("active", name !== "alignLeft");
  },

  // Saves 0.4 seconds after you stop typing
  queueSave() {
    const state = $("#save-state");
    if (state) state.textContent = "Saving...";
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      const note = this.active();
      if (note) note.updatedAt = Date.now();
      Store.save();
      const label = $("#save-state");
      if (label) label.textContent = "Saved";
    }, 400);
  },

  flush() {
    clearTimeout(this.saveTimer);
    Store.save();
  },

  select(id) {
    this.flush();
    Store.data.activeNoteId = id;
    this.render();
  },

  addNew() {
    this.flush();
    this.create();
    Store.save();
    this.render();
    $("#note-title").focus();
  },

  remove() {
    const note = this.active();
    confirmSheet('"' + this.label(note) + '" will be deleted.', "Delete", () => {
      Store.data.notes = Store.data.notes.filter((n) => n.id !== note.id);
      Store.data.activeNoteId = null;
      this.ensureNote();
      Store.save();
      this.render();
      toast("Note deleted.");
    });
  },

  downloadText() {
    const note = this.active();
    const text = this.label(note) + "\n\n" + $("#editor").innerText;
    const name = this.label(note).replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "note";
    downloadFile(name + ".txt", text, "text/plain");
  },

  // "PDF": opens the print dialog, where you choose "Save as PDF"
  print() {
    $("#print-title").textContent = this.label(this.active());
    this.flush();
    window.print();
  }
};
