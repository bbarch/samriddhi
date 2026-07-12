/* Gentle magic: an occasional butterfly, and sparkles when hovering artwork. */
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  // --- Floating butterflies (one drifts across every so often) ---
  var BUTTERFLIES = ["\u{1F98B}"]; // 🦋
  function releaseButterfly() {
    var b = document.createElement("span");
    b.className = "butterfly";
    b.textContent = BUTTERFLIES[0];
    b.style.setProperty("--y0", 25 + Math.random() * 55 + "vh");
    b.style.setProperty("--dur", 20 + Math.random() * 14 + "s");
    document.body.appendChild(b);
    setTimeout(function () { b.remove(); }, 36000);
  }
  setTimeout(releaseButterfly, 3000);
  setInterval(releaseButterfly, 45000 + Math.random() * 30000);

  // --- Sparkles on hover over memory cards ---
  var SPARKS = ["✦", "✧", "✵"]; // ✦ ✧ ✵
  var last = 0;
  document.addEventListener("mousemove", function (e) {
    var card = e.target.closest && e.target.closest(".memory-card, .nav-card");
    if (!card) return;
    var now = Date.now();
    if (now - last < 160) return; // throttle
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
