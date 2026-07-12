/* Renders memory cards (artwork / photos) and About Me year cards. */

function renderCards(containerId, entries, kind) {
  var el = document.getElementById(containerId);
  if (!el) return;

  if (!entries || entries.length === 0) {
    el.innerHTML =
      '<div class="empty-state">' +
      '<div class="icon">' + (kind === "artwork" ? "\u{1F3A8}" : "\u{1F4F8}") + "</div>" +
      "<h3>Nothing here yet…</h3>" +
      "<p>This gallery is waiting for its first memory!</p>" +
      "<p>To add one: put the picture in <code>images/" + kind + "/</code> and add an entry to <code>content/" + kind + ".js</code> — the example inside the file shows you how.</p>" +
      "</div>";
    return;
  }

  var grid = document.createElement("div");
  grid.className = "card-grid";

  entries.forEach(function (item) {
    var card = document.createElement("article");
    card.className = "memory-card";

    var html = "";
    if (item.image) {
      html += '<img src="' + item.image + '" alt="' + escapeHtml(item.title || "") + '" loading="lazy">';
    }
    html += '<div class="card-body">';
    if (item.date) html += '<div class="date">' + escapeHtml(item.date) + "</div>";
    html += "<h3>" + escapeHtml(item.title || "Untitled") + "</h3>";
    if (item.description) html += '<p class="description">“' + escapeHtml(item.description) + "”</p>";
    if (item.tags && item.tags.length) {
      html += '<div class="tags">' + item.tags.map(function (t) {
        return '<span class="tag">' + escapeHtml(t) + "</span>";
      }).join("") + "</div>";
    }
    html += "</div>";

    card.innerHTML = html;
    grid.appendChild(card);
  });

  el.innerHTML = "";
  el.appendChild(grid);
}

function renderAbout(containerId, entries) {
  var el = document.getElementById(containerId);
  if (!el) return;

  if (!entries || entries.length === 0) {
    el.innerHTML =
      '<div class="empty-state">' +
      '<div class="icon">\u{1F31F}</div>' +
      "<h3>The story starts soon…</h3>" +
      "<p>Every birthday, a new page gets added here — favourite colour, dream job, height, and all the little facts of that year.</p>" +
      "<p>To add the first one, open <code>content/about.js</code> and follow the example inside.</p>" +
      "</div>";
    return;
  }

  var labels = {
    favouriteColour: "Favourite colour",
    favouriteMovie: "Favourite movie",
    favouriteFood: "Favourite food",
    favouriteToy: "Favourite toy",
    dreamJob: "Dream job",
    height: "Height"
  };

  el.innerHTML = "";
  entries.forEach(function (item) {
    var card = document.createElement("section");
    card.className = "year-card";

    var html = "<h3>Age " + escapeHtml(String(item.age)) +
      (item.year ? '<span class="year-label">' + escapeHtml(item.year) + "</span>" : "") + "</h3>";

    html += '<dl class="facts">';
    Object.keys(labels).forEach(function (key) {
      if (item[key]) {
        html += "<div><dt>" + labels[key] + "</dt><dd>" + escapeHtml(item[key]) + "</dd></div>";
      }
    });
    html += "</dl>";

    if (item.facts && item.facts.length) {
      html += '<dl class="facts" style="margin-top:0.8rem"><div><dt>This year I…</dt>' +
        item.facts.map(function (f) { return "<dd>⭐ " + escapeHtml(f) + "</dd>"; }).join("") +
        "</div></dl>";
    }

    card.innerHTML = html;
    el.appendChild(card);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
