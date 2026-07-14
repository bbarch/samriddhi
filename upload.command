#!/bin/bash
# Double-click me to publish new memories!
# Takes whatever is in inbox/artwork and inbox/photos and pushes it
# to GitHub. The website updates itself a minute or two later.

cd "$(dirname "$0")" || exit 1

echo "✨ Samriddhi's Magical World — uploader"
echo ""

ART=$(find inbox/artwork -type f ! -name "README.txt" ! -name ".*" 2>/dev/null | wc -l | tr -d ' ')
PHO=$(find inbox/photos  -type f ! -name "README.txt" ! -name ".*" 2>/dev/null | wc -l | tr -d ' ')
echo "Inbox: $ART artwork, $PHO photo(s)"
echo ""

echo "Getting latest from GitHub first..."
if ! git pull --rebase origin main; then
  echo ""
  echo "❌ Could not sync with GitHub. Check your internet connection and try again."
  read -n 1 -s -r -p "Press any key to close..."
  exit 1
fi

git add -A
if git diff --cached --quiet; then
  echo ""
  echo "Nothing new to upload — the site already has everything."
else
  git commit -m "new memories"
  echo ""
  echo "Uploading..."
  if git push origin main; then
    echo ""
    echo "✅ Done! New memories will be live on samriddhisingh.in in a minute or two."
  else
    echo ""
    echo "❌ Upload failed — see the message above."
  fi
fi

echo ""
read -n 1 -s -r -p "Press any key to close..."
