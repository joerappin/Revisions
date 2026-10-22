#!/bin/zsh
# Accès par internet : tunnel Cloudflare gratuit vers le serveur local (lancé à part par en-local.sh).
# Le lien fixe https://joerappin.github.io/Revisions/ est mis à jour avec l'adresse du tunnel.
# Si le tunnel ne répond plus (3 essais, toutes les 30 s), il est relancé seul : le site local n'est jamais coupé.
DIR="${0:A:h}"; cd "$DIR"
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
REPO="joerappin/Revisions"; LOG="$DIR/data"; mkdir -p "$LOG"

until curl -s -m 5 -o /dev/null -f http://localhost:3000/api/status; do sleep 3; done   # attend le serveur local
: > "$LOG/tunnel.log"; rm -f "$LOG/adresse-internet.txt"
cloudflared tunnel --no-autoupdate --url http://localhost:3000 >> "$LOG/tunnel.log" 2>&1 &
TUNNEL=$!
for i in {1..60}; do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG/tunnel.log" | head -1)
  [[ -n "$URL" ]] && break; sleep 1
done
[[ -z "$URL" ]] && { kill $TUNNEL 2>/dev/null; exit 1; }
for i in {1..30}; do curl -s -m 10 -o /dev/null -f "$URL/api/status" && break; sleep 2; done
echo "$URL" > "$LOG/adresse-internet.txt"

# Lien fixe (GitHub Pages, branche gh-pages)
PAGE=$(sed "s#__URL__#$URL#g" "$DIR/pages/index.html" | base64)
SHA=$(gh api "repos/$REPO/contents/index.html?ref=gh-pages" --jq .sha 2>/dev/null)
ARGS=(-X PUT "repos/$REPO/contents/index.html" -f message="Adresse ReviZ : $URL" -f content="$PAGE" -f branch=gh-pages)
[[ -n "$SHA" ]] && ARGS+=(-f sha="$SHA")
gh api "${ARGS[@]}" --jq .commit.sha >> "$LOG/tunnel.log" 2>&1 || echo "$(date) échec de la mise à jour du lien GitHub Pages" >> "$LOG/tunnel.log"
echo "$(date) ReviZ en ligne : $URL" >> "$LOG/tunnel.log"

ECHECS=0
while kill -0 $TUNNEL 2>/dev/null; do
  sleep 30
  if curl -s -m 15 -o /dev/null -f "$URL/api/status"; then ECHECS=0; else ECHECS=$((ECHECS + 1)); fi
  [[ $ECHECS -ge 3 ]] && { echo "$(date) tunnel muet, redémarrage" >> "$LOG/tunnel.log"; break; }
done
kill $TUNNEL 2>/dev/null; rm -f "$LOG/adresse-internet.txt"
exit 1
