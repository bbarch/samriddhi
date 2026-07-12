/* Gentle magic: butterflies, drifting clouds, a flying unicorn,
   and sparkles when hovering over cards.
   Pages opt into an intensity via <body data-magic="full|calm">:
     full → home & about (more critters)
     calm → artwork & photos (rare, so the memories stay the star) */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  var full = (document.body.dataset.magic || "full") === "full";

  function spawn(className, emoji, y0, dur, life) {
    var el = document.createElement("span");
    el.className = className;
    el.textContent = emoji;
    el.style.setProperty("--y0", y0 + "vh");
    el.style.setProperty("--dur", dur + "s");
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, life * 1000);
  }

  // --- Butterflies ---
  function butterfly() {
    spawn("butterfly", "\u{1F98B}", 20 + Math.random() * 60, 18 + Math.random() * 12, 34);
    if (full && Math.random() < 0.4) {
      setTimeout(function () {
        spawn("butterfly", "\u{1F98B}", 20 + Math.random() * 60, 18 + Math.random() * 12, 34);
      }, 2500);
    }
  }
  setTimeout(butterfly, 2000);
  setInterval(butterfly, full ? 18000 : 55000);

  // --- Drifting clouds (background, very slow) ---
  function cloud() {
    spawn("cloud", "☁️", 5 + Math.random() * 30, 70 + Math.random() * 50, 125);
  }
  cloud();
  setTimeout(cloud, 15000);
  setInterval(cloud, full ? 40000 : 70000);

  // --- Flying unicorn (full-magic pages only) ---
  if (full) {
    function unicorn() {
      spawn("unicorn-flyer", "\u{1F984}", 15 + Math.random() * 40, 14 + Math.random() * 8, 24);
    }
    setTimeout(unicorn, 8000);
    setInterval(unicorn, 50000 + Math.random() * 30000);
  }

  // --- Sparkles on hover over cards ---
  var SPARKS = ["✦", "✧", "✵", "⭐"];
  var last = 0;
  document.addEventListener("mousemove", function (e) {
    var card = e.target.closest && e.target.closest(".memory-card, .nav-card");
    if (!card) return;
    var now = Date.now();
    if (now - last < (full ? 120 : 180)) return; // throttle
    last = now;
    var s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = SPARKS[Math.floor(Math.random() * SPARKS.length)];
    var r = card.getBoundingClientRect();
    s.style.left = e.clientX - r.left + (Math.random() * 16 - 8) + "px";
    s.style.top = e.clientY - r.top + (Math.random() * 16 - 8) + "px";
    card.appendChild(s);
    setTimeout(function () { s.remove(); }, 900);
  });
})();
