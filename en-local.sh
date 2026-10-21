#!/bin/zsh
# ReviZ en local : serveur accessible seulement sur le Wi-Fi de la maison (http://<ip-du-mac>:3000), sans tunnel internet.
# Lancé à l'ouverture de session par launchd (~/Library/LaunchAgents/com.reviz.local.plist), relancé s'il s'arrête.
DIR="${0:A:h}"; cd "$DIR"
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"
LOG="$DIR/data"; mkdir -p "$LOG"

# Récupère la dernière version publiée sur GitHub (les comptes, dans data/, restent sur ce Mac)
AVANT=$(git rev-parse HEAD:package-lock.json 2>/dev/null)
git pull -q --ff-only origin main 2>> "$LOG/serveur.log"
[[ ! -d node_modules || "$AVANT" != "$(git rev-parse HEAD:package-lock.json)" ]] && npm ci --omit=dev --silent

/usr/bin/caffeinate -i -w $$ &                      # pas de mise en veille automatique tant que ReviZ tourne
node --env-file-if-exists=.env server.js >> "$LOG/serveur.log" 2>&1 &
SERVEUR=$!
echo "$(date) ReviZ en local démarré" >> "$LOG/serveur.log"

# Si le serveur ne répond plus 3 fois de suite (toutes les 20 s), on arrête : launchd relance le script.
ECHECS=0
while kill -0 $SERVEUR 2>/dev/null; do
  sleep 20
  if curl -s -m 10 -o /dev/null -f http://localhost:3000/api/status; then ECHECS=0; else ECHECS=$((ECHECS + 1)); fi
  [[ $ECHECS -ge 3 ]] && break
done
kill $SERVEUR 2>/dev/null
exit 1
