/**
 * Gmail → GitHub instant trigger.
 *
 * Runs inside the dedicated Gmail account (script.google.com) on a
 * once-a-minute timer. When unread mail is waiting, it pokes the
 * GitHub "Import memories from email" workflow, which does the real work.
 *
 * One-time setup (in the Gmail account):
 *   1. Go to script.google.com → New project, paste this file.
 *   2. Project Settings (gear) → Script Properties → add:
 *        GITHUB_TOKEN = a fine-grained token for bbarch/samriddhi
 *                       with "Contents: read & write"
 *   3. Triggers (clock icon) → Add Trigger →
 *        function: checkAndDispatch, event: Time-driven, Every minute.
 */

var REPO = "bbarch/samriddhi";

function checkAndDispatch() {
  // Anything unread in the inbox? (The importer marks mail read when done.)
  var unread = GmailApp.getInboxUnreadCount();
  if (unread === 0) return;

  var token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  if (!token) throw new Error("Set GITHUB_TOKEN in Script Properties.");

  UrlFetchApp.fetch("https://api.github.com/repos/" + REPO + "/dispatches", {
    method: "post",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
    },
    payload: JSON.stringify({ event_type: "new-memory" }),
  });
  console.log(unread + " unread email(s) — triggered import workflow.");
}
