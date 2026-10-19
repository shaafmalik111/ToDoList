/* utils.js - icons, small helpers, toast message and bottom sheet */

// ---------- Icons (simple SVG drawings) ----------
const Icons = {
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  edit: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  alignLeft: '<line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>',
  alignCenter: '<line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/>',
  alignRight: '<line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  checkSquare: '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>'
};

function icon(name, size) {
  size = size || 22;
  return '<svg class="icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    Icons[name] + '</svg>';
}

// ---------- Small helpers ----------
function $(selector, root) {
  return (root || document).querySelector(selector);
}

// Makes text safe to put inside HTML (stops people typing <script> into a task)
function esc(text) {
  return String(text).replace(/[&<>"']/g, function (ch) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
  });
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ---------- Dates and times ----------
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

// Date -> "2026-10-12T17:30" (the format used by <input type="datetime-local">)
function toInputValue(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) +
    "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

// 12-hour ("5:30 pm") or 24-hour ("17:30") depending on the setting
function formatTime(date) {
  const hours = date.getHours();
  const minutes = pad(date.getMinutes());
  if (Store.data.settings.timeFormat === "24") {
    return pad(hours) + ":" + minutes;
  }
  const suffix = hours >= 12 ? "pm" : "am";
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;
  return hours12 + ":" + minutes + " " + suffix;
}

function dayLabel(date) {
  const difference = Math.round((startOfDay(date) - startOfDay(new Date())) / 86400000);
  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";
  if (difference === -1) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function formatDue(isoText) {
  const date = new Date(isoText);
  return dayLabel(date) + ", " + formatTime(date);
}

// ---------- Download a file (used for notes and backups) ----------
function downloadFile(filename, text, mimeType) {
  const blob = new Blob([text], { type: mimeType || "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

// ---------- Toast (small message at the bottom) ----------
let toastTimer = null;

function toast(message, type) {
  const box = document.getElementById("toast");
  box.textContent = message;
  box.className = "toast show" + (type ? " " + type : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { box.classList.remove("show"); }, 3200);
}

// ---------- Bottom sheet (pop-up panel from the bottom) ----------
const Sheet = {
  init() {
    const sheet = document.getElementById("sheet");
    // any element with data-sheet="close" closes the sheet
    sheet.addEventListener("click", function (event) {
      if (event.target.closest('[data-sheet="close"]')) Sheet.close();
    });
  },

  open(html, onMount) {
    const sheet = document.getElementById("sheet");
    sheet.innerHTML = '<div class="sheet-handle"></div>' + html;
    sheet.scrollTop = 0;
    sheet.classList.add("open");
    document.getElementById("backdrop").classList.add("show");
    document.body.classList.add("no-scroll");
    if (onMount) onMount(sheet);
  },

  close() {
    document.getElementById("sheet").classList.remove("open");
    if (!document.getElementById("drawer").classList.contains("open")) {
      document.getElementById("backdrop").classList.remove("show");
      document.body.classList.remove("no-scroll");
    }
  }
};

// Asks "are you sure?" before something is deleted
function confirmSheet(message, buttonLabel, onYes) {
  Sheet.open(
    '<h2 class="sheet-title">Are you sure?</h2>' +
    '<p class="muted">' + esc(message) + '</p>' +
    '<div class="sheet-actions">' +
    '<button class="btn" data-sheet="close">Cancel</button>' +
    '<button class="btn danger" id="confirm-yes">' + esc(buttonLabel) + '</button>' +
    '</div>',
    function (sheet) {
      $("#confirm-yes", sheet).addEventListener("click", function () {
        Sheet.close();
        onYes();
      });
    }
  );
}
