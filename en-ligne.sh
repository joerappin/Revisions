#!/bin/zsh
# ReviZ en ligne gratuitement : serveur local + tunnel Cloudflare, et lien fixe https://joerappin.github.io/Revisions/
# qui redirige vers l'adresse du tunnel (mise à jour à chaque démarrage). Lancé au démarrage du Mac par launchd.
DIR="${0:A:h}"; cd "$DIR"
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"
REPO="joerappin/Revisions"; LOG="$DIR/data"; mkdir -p "$LOG"

# Récupère la dernière version publiée sur GitHub (les comptes, dans data/, ne sont jamais sur GitHub)
AVANT=$(git rev-parse HEAD:package-lock.json 2>/dev/null)
git pull -q --ff-only origin main 2>> "$LOG/tunnel.log"
[[ ! -d node_modules || "$AVANT" != "$(git rev-parse HEAD:package-lock.json)" ]] && npm ci --omit=dev --silent

/usr/bin/caffeinate -i -w $$ &                      # le Mac ne se met pas en veille tant que ReviZ tourne
: > "$LOG/tunnel.log"
cloudflared tunnel --no-autoupdate --url http://localhost:3000 >> "$LOG/tunnel.log" 2>&1 &   # >> : les lignes ajoutées ensuite ne sont pas écrasées
TUNNEL=$!
for i in {1..60}; do
  URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG/tunnel.log" | grep -v '//api\.' | head -1)   # api. = message d'erreur, pas l'adresse
  [[ -n "$URL" ]] && break; sleep 1
done
[[ -z "$URL" ]] && { kill $TUNNEL; exit 1; }

PUBLIC_URL="$URL" node --env-file-if-exists=.env server.js >> "$LOG/serveur.log" 2>&1 &
SERVEUR=$!

# Met à jour la page de redirection (GitHub Pages, branche gh-pages)
PAGE=$(sed "s#__URL__#$URL#g" "$DIR/pages/index.html" | base64)
SHA=$(gh api "repos/$REPO/contents/index.html?ref=gh-pages" --jq .sha 2>/dev/null)
ARGS=(-X PUT "repos/$REPO/contents/index.html" -f message="Adresse ReviZ : $URL" -f content="$PAGE" -f branch=gh-pages)
[[ -n "$SHA" ]] && ARGS+=(-f sha="$SHA")
gh api "${ARGS[@]}" --jq .commit.sha >> "$LOG/tunnel.log" 2>&1 || echo "$(date) échec de la mise à jour du lien GitHub Pages" >> "$LOG/tunnel.log"
echo "$(date) ReviZ en ligne : $URL" >> "$LOG/tunnel.log"

# Si l'un des deux s'arrête, on arrête tout : launchd relance le script.
# Après une mise en veille, le tunnel peut rester « vivant » sans répondre : 3 échecs de suite → on relance tout.
ECHECS=0
while kill -0 $TUNNEL 2>/dev/null && kill -0 $SERVEUR 2>/dev/null; do
  sleep 30
  if curl -s -m 15 -o /dev/null -f "$URL/api/status"; then ECHECS=0; else ECHECS=$((ECHECS + 1)); fi
  [[ $ECHECS -ge 3 ]] && { echo "$(date) tunnel muet, redémarrage" >> "$LOG/tunnel.log"; break; }
done
kill $TUNNEL $SERVEUR 2>/dev/null
exit 1
