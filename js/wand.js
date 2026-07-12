/* The Magic Wand: checks the mailbox for new memories right now.
   Fires the GitHub import workflow. Needs a fine-grained GitHub token
   (Contents: read & write) entered once per family device; it is kept
   in this browser's localStorage only, never in the site code. */
(function () {
  var REPO = "bbarch/samriddhi";
  var KEY = "memory-pull-token";

  var btn = document.getElementById("wand-btn");
  var status = document.getElementById("wand-status");
  var tokenRow = document.getElementById("wand-token-row");
  if (!btn) return;

  function setStatus(msg) { status.textContent = msg; }

  function dispatch(token) {
    setStatus("Waving the wand… asking the magic mailroom to check ✨");
    btn.disabled = true;
    fetch("https://api.github.com/repos/" + REPO + "/dispatches", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/vnd.github+json"
      },
      body: JSON.stringify({ event_type: "new-memory" })
    }).then(function (res) {
      btn.disabled = false;
      if (res.status === 204) {
        localStorage.setItem(KEY, token);
        tokenRow.style.display = "none";
        setStatus("✨ The wand worked! New memories appear in a minute or two — then refresh Artwork or Photos.");
      } else if (res.status === 401 || res.status === 403 || res.status === 404) {
        localStorage.removeItem(KEY);
        tokenRow.style.display = "block";
        setStatus("That magic key was not accepted (" + res.status + "). Paste a valid one to try again.");
      } else {
        setStatus("Hmm, GitHub answered with status " + res.status + ". Try again in a moment.");
      }
    }).catch(function () {
      btn.disabled = false;
      setStatus("Could not reach GitHub — check the connection and try again.");
    });
  }

  btn.addEventListener("click", function () {
    var token = localStorage.getItem(KEY);
    if (token) {
      dispatch(token);
    } else {
      tokenRow.style.display = "block";
      setStatus("The wand needs Mummy or Papa's magic key on this device 🔑 " +
        "(a GitHub fine-grained token for " + REPO + " with Contents read & write — see the README).");
    }
  });

  document.getElementById("wand-save").addEventListener("click", function () {
    var token = document.getElementById("wand-input").value.trim();
    if (token) dispatch(token);
  });

  document.getElementById("wand-forget").addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem(KEY);
    tokenRow.style.display = "none";
    setStatus("Magic key forgotten on this device.");
  });
})();
