"use strict";

// ================= Données scolaires du Québec =================
const ANNEES = [
  ...["1re", "2e", "3e", "4e", "5e", "6e"].map((a) => `${a} année du primaire`),
  ...["1re", "2e", "3e", "4e", "5e"].map((a) => `${a} secondaire`),
];
function matieresPour(annee) {
  const sec = /secondaire/.test(annee);
  const n = parseInt(annee, 10);
  if (!sec) {
    return ["Français", "Mathématique", "Anglais", "Univers social", "Science et technologie", "Géographie, histoire et éducation à la citoyenneté", "Culture et citoyenneté québécoise", "Arts plastiques", "Musique", "Éducation physique"];
  }
  const base = ["Français", "Anglais langue seconde", "Univers social", "Culture et citoyenneté québécoise", "Arts plastiques", "Musique", "Éducation physique", "Espagnol"];
  if (n <= 2) return ["Mathématique", "Science et technologie", "Géographie", "Histoire et éducation à la citoyenneté", ...base];
  if (n === 3) return ["Mathématique", "Science et technologie", "Histoire du Québec et du Canada", ...base];
  if (n === 4) return ["Mathématique CST", "Mathématique TS", "Mathématique SN", "Science et technologie (ST)", "Applications technologiques et scientifiques (ATS)", "Science et technologie de l'environnement (STE)", "Histoire du Québec et du Canada", ...base];
  return ["Mathématique CST", "Mathématique TS", "Mathématique SN", "Chimie", "Physique", "Monde contemporain", "Éducation financière", ...base];
}
const SUJETS = [
  [/math/i, ["Algèbre", "Algèbre : expressions et réduction", "Algèbre : équations du 1er degré", "Fractions", "Nombres décimaux", "Pourcentages", "Priorité des opérations", "Nombres entiers", "Proportionnalité", "Aire et périmètre", "Volume", "Théorème de Pythagore", "Statistiques", "Probabilités", "Fonctions", "Inéquations", "Systèmes d'équations", "Trigonométrie", "Géométrie analytique", "Fonction quadratique", "Exposants et racines"]],
  [/fran/i, ["Accord du participe passé", "Accords dans le groupe du nom", "Conjugaison", "Homophones", "Classes de mots", "Fonctions syntaxiques", "Ponctuation", "Texte narratif", "Texte descriptif", "Texte justificatif", "Texte argumentatif", "Compréhension de lecture", "Figures de style"]],
  [/angl/i, ["Simple present", "Simple past", "Present progressive", "Future (will / going to)", "Vocabulary", "Reading comprehension", "Listening comprehension", "Pronunciation", "Writing a text", "Irregular verbs", "Modals"]],
  [/espagnol/i, ["Saludos y presentaciones", "Verbos ser y estar", "Presente de indicativo", "Vocabulario", "Números", "La familia"]],
  [/science|chimie|physique|ats|ste\b/i, ["La cellule", "Le corps humain", "Propriétés de la matière", "Mélanges et solutions", "Changements physiques et chimiques", "Atome et tableau périodique", "Énergie", "Électricité", "Forces et mouvement", "La Terre et l'Univers", "Écologie", "Génétique", "Ingénierie mécanique", "Ondes et lumière", "Stœchiométrie", "Cinématique"]],
  [/univers social/i, ["Drapeaux et capitales d'Europe", "Drapeaux et capitales des Amériques", "Drapeaux et capitales d'Afrique", "Les drapeaux du monde", "Les océans du monde", "Les continents et les océans", "La Renaissance et l'humanisme", "Les costumes à travers l'histoire", "Les costumes traditionnels du monde", "Les Iroquoiens vers 1500", "Les Algonquiens vers 1500", "La Nouvelle-France vers 1645", "La société canadienne vers 1745", "La société québécoise vers 1905", "Le Québec de 1960 à 1980", "Les Incas et les Iroquoiens", "Les Micmacs et les Inuits", "Lire une carte et une ligne du temps", "Les régions du Québec", "Les premiers occupants", "La Conquête et le Régime britannique", "Les territoires et la population", "La démocratie et les droits"]],
  [/g[ée]ograph/i, ["Les costumes traditionnels du monde", "Les océans du monde", "Les continents et les océans", "Drapeaux et capitales d'Europe", "Drapeaux et capitales des Amériques", "Drapeaux et capitales d'Afrique", "Les drapeaux du monde", "Lire une carte", "Les territoires urbains", "Les territoires agricoles", "Population", "Environnement", "Les territoires autochtones", "Les risques naturels"]],
  [/histoire|monde/i, ["La Renaissance et l'humanisme", "Les costumes à travers l'histoire", "Les costumes traditionnels du monde", "Premiers occupants", "La Nouvelle-France", "La Conquête et le Régime britannique", "Les rébellions de 1837-1838", "La Confédération", "L'industrialisation", "La Révolution tranquille", "Le Québec contemporain", "La sédentarisation", "L'Antiquité", "La Renaissance", "Les territoires urbains", "Les territoires agricoles", "Population", "Environnement"]],
  [/culture|citoy/i, ["L'autonomie", "L'interdépendance", "Les relations intimes à l'adolescence", "La solidarité sociale", "Les institutions démocratiques du Québec et du Canada", "Droits et responsabilités", "L'ordre social", "Le dialogue et la pensée critique", "Le vivre-ensemble", "La démocratie", "Les droits et libertés", "Le dialogue", "Les identités", "Les relations interpersonnelles", "La société québécoise"]],
  [/financ/i, ["Le budget", "Le crédit", "L'épargne", "Les impôts", "Le monde du travail", "La consommation"]],
  [/arts|musique/i, ["Les couleurs", "Les éléments du langage plastique", "Le rythme", "Les notes de musique", "Les instruments", "Histoire de l'art"]],
  [/physique/i, ["Les habiletés motrices", "La condition physique", "Les saines habitudes de vie"]],
];
const sujetsPour = (m) => (SUJETS.find(([re]) => re.test(m || "")) || [null, []])[1];
const REGLAGES_DEFAUT = { minuteur: true, secondesChoix: 45, secondesOuvertes: 120, nbRevision: 10, nbFinal: 20, pctQcm: 70, pctQcmMaths: 0 };
const reglagesDe = (p) => ({ ...REGLAGES_DEFAUT, ...(p?.reglages || {}) });

// ================= Utilitaires =================
const $ = (sel, el = document) => el.querySelector(sel);
const app = $("#app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = (iso) => new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" });
const melange = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sansAccents = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const estMobile = () => matchMedia("(max-width: 700px), (pointer: coarse)").matches;
const estChoix = (q) => q.type === "qcm" || q.type === "vrai_faux";

async function api(chemin, options = {}) {
  const res = await fetch("/api" + chemin, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : {},
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !chemin.startsWith("/auth") && !chemin.startsWith("/admin")) {
    etat.moi.profil = null; // session expirée : retour à l'écran de connexion
    if (location.hash !== "#/") location.hash = "#/";
  }
  if (!res.ok) throw new Error(data.erreur || "Erreur " + res.status);
  return data;
}
function toast(msg, erreur = false) {
  const t = $("#toast");
  t.textContent = msg; t.className = "toast" + (erreur ? " erreur" : ""); t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), erreur ? 6000 : 3000);
}
let loaderTimer;
function chargement(titre, messages) {
  $("#loader-sensei").innerHTML = senseiSVG("joie");
  $("#loader-titre").textContent = titre;
  let i = 0;
  const txt = $("#loader-texte");
  txt.textContent = messages[0] || "";
  clearInterval(loaderTimer);
  loaderTimer = setInterval(() => { i = (i + 1) % messages.length; txt.textContent = messages[i]; }, 4500);
  $("#loader").hidden = false;
}
function finChargement() { clearInterval(loaderTimer); $("#loader").hidden = true; }

// Redimensionne une photo côté navigateur (plus léger à envoyer et à analyser).
function lirePhoto(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = URL.createObjectURL(file);
  });
}

// Photo de profil : recadrée au centre en carré.
function recadrerCarre(file, taille = 320) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas"); c.width = c.height = taille;
      const cote = Math.min(img.width, img.height);
      c.getContext("2d").drawImage(img, (img.width - cote) / 2, (img.height - cote) / 2, cote, cote, 0, 0, taille, taille);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.88));
    };
    img.onerror = () => reject(new Error("Image illisible"));
    img.src = URL.createObjectURL(file);
  });
}

// ================= Audio (synthèse vocale du navigateur) =================
function langueDe(matiere) {
  if (/angl/i.test(matiere || "")) return "en";
  if (/espagnol/i.test(matiere || "")) return "es";
  return "fr";
}
function parler(texte, langue = "en") {
  if (!("speechSynthesis" in window)) return toast("Ce navigateur ne peut pas lire l'audio.", true);
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texte);
  const voix = speechSynthesis.getVoices();
  const preferee = { en: ["en-CA", "en-US", "en-GB"], es: ["es-MX", "es-ES"], fr: ["fr-CA", "fr-FR"] }[langue] || [langue];
  u.voice = preferee.map((l) => voix.find((v) => v.lang === l || v.lang.replace("_", "-") === l)).find(Boolean)
    || voix.find((v) => v.lang.toLowerCase().startsWith(langue)) || null;
  u.lang = u.voice?.lang || preferee[0];
  u.rate = 0.9;
  speechSynthesis.speak(u);
}
if ("speechSynthesis" in window) speechSynthesis.getVoices(); // précharge la liste des voix
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-dire]");
  if (b) parler(b.dataset.dire, b.dataset.langue || "en");
});

// ================= Dessins (SVG) =================
const CHEVEUX = ["#1d1d1d", "#7a4a26", "#e8b04a", "#e63946", "#2b6cff", "#8e44ad", "#2bb673", "#f78fb3"];
const STYLES = ["pics", "long", "carre", "queue"];
function avatarSVG(code = "pics-0") {
  if (String(code).startsWith("photo:")) return `<img class="avatar avatar-photo" src="/avatars/${encodeURIComponent(String(code).slice(6).split("/").pop())}" alt="">`;
  const [style, ci] = String(code).split("-");
  const c = CHEVEUX[Number(ci) % CHEVEUX.length] || CHEVEUX[0];
  const derriere = {
    pics: "",
    long: `<path d="M18 52 Q14 96 30 108 L90 108 Q106 96 102 52 Z" fill="${c}" stroke="#111" stroke-width="3"/>`,
    carre: `<path d="M20 50 Q18 86 28 92 L92 92 Q102 86 100 50 Z" fill="${c}" stroke="#111" stroke-width="3"/>`,
    queue: `<path d="M92 36 Q118 40 112 78 Q106 64 96 58 Z" fill="${c}" stroke="#111" stroke-width="3"/>`,
  }[style] || "";
  const devant = {
    pics: `<path d="M22 56 L16 30 L34 38 L36 14 L52 32 L62 8 L72 30 L88 14 L88 38 L106 30 L98 56 Q80 34 60 40 Q40 34 22 56 Z" fill="${c}" stroke="#111" stroke-width="3" stroke-linejoin="round"/>`,
    long: `<path d="M22 60 Q20 22 60 20 Q100 22 98 60 Q88 40 70 36 Q66 46 52 48 Q58 40 54 36 Q34 40 22 60 Z" fill="${c}" stroke="#111" stroke-width="3"/>`,
    carre: `<path d="M22 58 Q20 20 60 20 Q100 20 98 58 L86 46 L76 52 L68 42 L56 52 L46 42 L36 52 Z" fill="${c}" stroke="#111" stroke-width="3" stroke-linejoin="round"/>`,
    queue: `<path d="M22 58 Q22 22 60 20 Q98 22 98 58 Q84 36 60 38 Q42 38 22 58 Z" fill="${c}" stroke="#111" stroke-width="3"/>`,
  }[style] || "";
  return `<svg class="avatar" viewBox="0 0 120 120" aria-hidden="true">
    ${derriere}
    <ellipse cx="60" cy="66" rx="36" ry="38" fill="#ffe3c8" stroke="#111" stroke-width="3"/>
    <g fill="#111"><ellipse cx="45" cy="70" rx="7" ry="10"/><ellipse cx="75" cy="70" rx="7" ry="10"/></g>
    <g fill="#fff"><circle cx="47" cy="66" r="3"/><circle cx="77" cy="66" r="3"/><circle cx="43" cy="74" r="1.5"/><circle cx="73" cy="74" r="1.5"/></g>
    <g fill="#ff9aa2" opacity=".6"><ellipse cx="34" cy="84" rx="6" ry="3"/><ellipse cx="86" cy="84" rx="6" ry="3"/></g>
    <path d="M52 88 Q60 95 68 88" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
    ${devant}
  </svg>`;
}
function senseiSVG(humeur = "joie") {
  const bouche = humeur === "triste"
    ? `<path d="M50 96 Q60 88 70 96" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>`
    : `<path d="M48 88 Q60 102 72 88 Z" fill="#c0392b" stroke="#111" stroke-width="3" stroke-linejoin="round"/>`;
  const yeux = humeur === "joie"
    ? `<path d="M38 72 Q45 64 52 72 M68 72 Q75 64 82 72" fill="none" stroke="#111" stroke-width="4" stroke-linecap="round"/>`
    : `<g fill="#111"><ellipse cx="45" cy="72" rx="6" ry="8"/><ellipse cx="75" cy="72" rx="6" ry="8"/></g><g fill="#fff"><circle cx="47" cy="69" r="2.5"/><circle cx="77" cy="69" r="2.5"/></g>`;
  return `<svg viewBox="0 0 120 130" aria-hidden="true" style="width:100%;height:auto;display:block">
    <path d="M30 120 Q60 100 90 120 L90 130 L30 130 Z" fill="#111"/>
    <ellipse cx="60" cy="72" rx="36" ry="38" fill="#ffe3c8" stroke="#111" stroke-width="3"/>
    <path d="M22 62 L18 34 L34 42 L40 16 L54 36 L62 10 L72 34 L88 18 L88 42 L104 36 L98 62 Q60 40 22 62 Z" fill="#111" stroke="#111" stroke-width="3" stroke-linejoin="round"/>
    <rect x="22" y="50" width="76" height="12" fill="#e63946" stroke="#111" stroke-width="3"/>
    <path d="M98 54 L116 46 L112 60 Z" fill="#e63946" stroke="#111" stroke-width="3"/>
    <circle cx="60" cy="56" r="5" fill="#ffd60a" stroke="#111" stroke-width="2"/>
    ${yeux}
    <g fill="#ff9aa2" opacity=".6"><ellipse cx="34" cy="88" rx="6" ry="3"/><ellipse cx="86" cy="88" rx="6" ry="3"/></g>
    ${bouche}
  </svg>`;
}
const senseiDit = (texte, humeur = "joie") =>
  `<div class="sensei-ligne"><div class="sensei">${senseiSVG(humeur)}</div><div class="bulle">${texte}</div></div>`;
// Les schémas générés sont affichés comme images : aucun script ne peut s'y exécuter.
const visuelHTML = (svg, alt) => svg && /^<svg[\s>]/i.test(svg)
  ? `<div class="visuel"><img alt="${esc(alt)}" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}"></div>` : "";
// Carte ou drapeau servi par le site (seules ces adresses sont acceptées). Un clic ouvre la carte en grand.
const estUrlImage = (u) => /^\/drapeaux\/[a-z]{2}\.svg$/.test(u || "") || /^\/api\/carte\?[\w=&,.%-]+$/.test(u || "") || /^\/costumes\/\w+\.svg$/.test(u || "");
const imageSiteHTML = (u, alt) => !estUrlImage(u) ? ""
  : u.startsWith("/drapeaux/") ? `<div class="visuel visuel-drapeau"><img alt="${esc(alt)}" src="${esc(u)}"></div>`
  : u.startsWith("/costumes/") ? `<div class="visuel visuel-costume"><img alt="${esc(alt)}" src="${esc(u)}"></div>`
  : `<div class="visuel visuel-carte"><a href="${esc(u)}" target="_blank" rel="noopener" title="Agrandir la carte"><img alt="${esc(alt)}" src="${esc(u)}" loading="lazy"></a><span class="zoom">🔍 cliquer pour agrandir</span></div>`;
const imageQuestion = (q) => visuelHTML(q.image_svg, "Image de la question") || imageSiteHTML(q.image_url, "Image de la question");

// Adresse joignable depuis le téléphone (IP du Wi-Fi, même si l'ordinateur utilise « localhost »).
const adresseSite = () => (/^(localhost|127\.)/.test(location.hostname) && etat.status.adresses[0]) || location.origin;
const qrHTML = (texte, alt) => `<div class="qr"><img src="/api/qr?t=${encodeURIComponent(texte)}" alt="${esc(alt)}" width="150" height="150"></div>`;

// ================= État =================
const etat = { status: { ia: false, adresses: [] }, moi: { profil: null, admin: false, adminConfigure: false }, mobile: false, ecoles: null, profil: null, quiz: null };
async function chargerEcoles() {
  if (!etat.ecoles) etat.ecoles = await fetch("/ecoles.json").then((r) => r.json()).catch(() => []);
  return etat.ecoles;
}
const bandeauDemo = () => etat.status.ia ? "" :
  `<div class="demo-bandeau">MODE DÉMO — questions d'exemple seulement. ${etat.moi.admin
    ? `Ajoute une clé API dans <a href="#/parametres">🔑 Paramètres</a>`
    : `L'admin doit ajouter une clé API (<a href="#/admin">🛡 Admin</a> → Clé API)`} pour que Sensei cherche sur internet et crée des révisions sur mesure.</div>`;

// ================= Synchro avec le téléphone (côté ordinateur) =================
const sync = {
  code: null, profilId: null, es: null, telephones: 0, surAction: null, dernierEtat: { phase: "attente" },
  async activer(profil) {
    if (this.es && this.profilId === profil.id) return this.code;
    let ancien = null;
    try { const s = JSON.parse(sessionStorage.getItem("sync") || "null"); if (s?.profilId === profil.id) ancien = s.code; } catch {}
    const r = await api("/sync", { method: "POST", body: { profilId: profil.id, code: ancien } });
    this.fermer();
    this.code = r.code; this.profilId = profil.id;
    try { sessionStorage.setItem("sync", JSON.stringify({ code: r.code, profilId: profil.id })); } catch {}
    const es = (this.es = new EventSource(`/api/sync/${r.code}/flux?role=hote`));
    es.addEventListener("presence", (e) => { this.telephones = JSON.parse(e.data).telephones; majSyncUI(); });
    es.addEventListener("action", (e) => {
      const a = JSON.parse(e.data);
      // Depuis le téléphone : « Envoyer des photos de leçon » ouvre l'onglet 📸 Photo sur l'ordinateur.
      if (a.type === "ouvrirPhoto" && !location.hash.endsWith("/photo")) {
        if (!etat.profil?.matiere) return toast("📱 Choisis d'abord ta matière sur l'ordinateur.", true);
        location.hash = `#/profil/${this.profilId}/photo`;
        return;
      }
      if (this.surAction) this.surAction(a);
    });
    // Si la connexion est coupée (serveur redémarré, Wi-Fi), on la rétablit avec le MÊME code.
    es.onerror = () => {
      if (es.readyState !== EventSource.CLOSED || this.es !== es) return;
      this.es = null; this.telephones = 0; majSyncUI();
      const profil = { id: this.profilId };
      setTimeout(() => { if (!this.es && this.profilId === profil.id) this.activer(profil).catch(() => es.onerror()); }, 2500);
    };
    this.envoyer(this.dernierEtat);
    majSyncUI();
    return this.code;
  },
  fermer() {
    if (this.es) this.es.close();
    this.es = null; this.code = null; this.telephones = 0;
    try { sessionStorage.removeItem("sync"); } catch {}
    majSyncUI();
  },
  envoyer(e) {
    this.dernierEtat = e;
    if (!this.code) return;
    fetch(`/api/sync/${this.code}/etat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(e) }).catch(() => {});
  },
  get actif() { return !!this.code; },
};
function majSyncUI() {
  const b = $("#sync-badge");
  if (sync.code) {
    b.hidden = false;
    b.textContent = `📱 ${sync.code} ${sync.telephones ? "✅" : "…"}`;
    b.title = sync.telephones ? "Téléphone connecté" : "En attente du téléphone";
    b.href = sync.profilId ? `#/profil/${sync.profilId}` : "#/";
  } else b.hidden = true;
  document.querySelectorAll("[data-sync-statut]").forEach((el) => {
    el.innerHTML = sync.telephones ? "✅ <strong>Téléphone connecté !</strong> Il sert de télécommande pendant les quiz." : "⏳ En attente du téléphone…";
  });
}
async function reprendreSync(p) {
  try {
    const s = JSON.parse(sessionStorage.getItem("sync") || "null");
    if (s?.profilId === p.id && !sync.es) await sync.activer(p);
  } catch {}
}

// ================= Minuteur (ordinateur) =================
let minuteur = null;
function arreterMinuteur() { if (minuteur) clearInterval(minuteur.id); minuteur = null; }
function lancerMinuteur(dureeMs, auBout) {
  arreterMinuteur();
  const fin = Date.now() + dureeMs;
  const tick = () => {
    const reste = Math.max(0, fin - Date.now());
    const zone = $("#minuteur");
    if (zone) {
      const s = Math.ceil(reste / 1000);
      zone.querySelector(".sec").textContent = s + " s";
      zone.querySelector(".jauge div").style.width = (reste / dureeMs) * 100 + "%";
      zone.classList.toggle("urgent", s <= 10);
    }
    if (reste <= 0) { arreterMinuteur(); auBout(); }
  };
  minuteur = { id: setInterval(tick, 200), fin };
  tick();
}
const resteMs = () => (minuteur ? Math.max(0, minuteur.fin - Date.now()) : null);

// ================= Routeur =================
// [motif, écran, accès] — accès : "libre", "compte" (élève connecté ou admin), "admin"
const routes = [
  [/^#?\/?$/, ecranAccueil, "libre"],
  [/^#\/inscription$/, () => ecranFormulaire(null), "libre"],
  [/^#\/code$/, ecranCode, "libre"],
  [/^#\/tel\/(\d+)$/, ecranTelephone, "libre"],
  [/^#\/admin$/, ecranAdmin, "libre"],
  [/^#\/admin\/compte\/(\w+)$/, ecranAdminCompte, "admin"],
  [/^#\/parametres$/, ecranParametres, "admin"],
  [/^#\/progres$/, () => ecranMobileOnglet("progres"), "compte"],
  [/^#\/photos$/, () => ecranMobileOnglet("photos"), "compte"],
  [/^#\/profil\/(\w+)$/, ecranProfil, "compte"],
  [/^#\/profil\/(\w+)\/modifier$/, async (id) => ecranFormulaire(await api("/profils/" + id)), "compte"],
  [/^#\/profil\/(\w+)\/reglages$/, ecranReglages, "compte"],
  [/^#\/profil\/(\w+)\/(lecon|test|photo)$/, ecranLecon, "compte"],
  [/^#\/profil\/(\w+)\/evaluation\/(\w+)$/, ecranEvaluation, "compte"],
  [/^#\/lecons$/, ecranMesLecons, "compte"],
  [/^#\/profil\/(\w+)\/revision$/, (id) => ecranLecon(id, "lecon"), "compte"],
  [/^#\/profil\/(\w+)\/final$/, (id) => ecranLecon(id, "test"), "compte"],
  [/^#\/profil\/(\w+)\/devoirs$/, ecranDevoirs, "compte"],
];
async function router() {
  const h = location.hash || "#/";
  window.scrollTo(0, 0);
  arreterMinuteur();
  quitterTelephone();
  fermerDico();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  sync.surAction = null;
  sync.envoyer({ phase: "attente" });
  majEntete();
  for (const [re, fn, acces] of routes) {
    const m = h.match(re);
    if (!m) continue;
    if (acces === "compte" && !etat.moi.profil && !etat.moi.admin) { location.hash = "#/"; return; }
    if (acces === "admin" && !etat.moi.admin) { location.hash = "#/admin"; return; }
    try { await fn(...m.slice(1)); } catch (e) { console.error(e); finChargement(); app.innerHTML = `<div class="panel">${senseiDit("Oups ! " + esc(e.message), "triste")}<a class="btn" href="#/">Retour</a></div>`; }
    majEntete();
    return;
  }
  location.hash = "#/";
}
window.addEventListener("hashchange", router);
// Un lien vers la page déjà ouverte (ex. « Retour aux tests » après un quiz lancé depuis l'onglet Test)
// ne déclenche pas hashchange : on réaffiche la page nous-mêmes.
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (a && a.getAttribute("href") === (location.hash || "#/") && !e.defaultPrevented) { e.preventDefault(); router(); }
});

// ================= En-tête et barre d'onglets (mobile) =================
function majEntete() {
  const moi = etat.moi, p = moi.profil, h = location.hash || "#/";
  const tel = document.body.classList.contains("mode-tel");
  const anglais = p && (/angl/i.test(p.matiere || "") || /angl/i.test(etat.quiz?.matiere || ""));
  $("#nav-compte").innerHTML = `
    ${anglais && !tel ? `<button type="button" class="btn-dico" id="btn-dico" title="Dictionnaire anglais → français">📖 Dico</button>` : ""}
    ${p && !etat.mobile ? `<a href="#/lecons" class="btn-lecons" title="Les leçons que j'ai apprises">📚 Mes leçons</a>` : ""}
    ${p ? `<a href="#/" class="chip-compte" title="Mon profil"><span class="mini-av">${avatarSVG(p.avatar)}</span><span class="chip-nom">${esc(p.nom)}</span></a>` : ""}
    <a href="#/admin" class="btn-admin ${moi.admin ? "actif" : ""}" title="Espace admin">🛡${etat.mobile ? "" : " Admin"}</a>
    ${p ? `<button type="button" class="btn-deco" id="btn-deco" title="Se déconnecter">⏻</button>` : ""}`;
  $("#btn-deco")?.addEventListener("click", seDeconnecter);
  $("#btn-dico")?.addEventListener("click", () => ouvrirDico());
  const bar = $("#tabbar");
  bar.hidden = !(etat.mobile && p && !tel);
  document.body.classList.toggle("avec-tabbar", !bar.hidden);
  if (!bar.hidden) {
    const onglets = [["#/", "🏠", "Accueil"], ["#/lecons", "📚", "Leçons"], ["#/photos", "📸", "Cours"], ["#/progres", "📊", "Progrès"], ["#/code", "📱", "Code"]];
    const actif = onglets.find(([href]) => href !== "#/" && h.startsWith(href))?.[0] || (h === "#/" || h === "" ? "#/" : "");
    bar.innerHTML = onglets.map(([href, ic, lib]) => `<a href="${href}" class="${href === actif ? "actif" : ""}"><span>${ic}</span>${lib}</a>`).join("");
  }
}
async function seDeconnecter() {
  if (!confirm("Se déconnecter ?")) return;
  await api("/auth/deconnexion", { method: "POST" }).catch(() => {});
  sync.fermer();
  etat.moi.profil = null; etat.profil = null;
  location.hash = "#/";
  router();
}

// ================= Écran : accueil =================
function panneauCodeTel() {
  let dernier = "";
  try { dernier = localStorage.getItem("telCode") || ""; } catch {}
  return `<div class="panel noir code-tel">
    <span class="etiquette">📱 MODE TÉLÉCOMMANDE</span>
    <h2 style="color:var(--jaune)">Tu es sur ton téléphone ?</h2>
    <p>Entre le code affiché sur l'ordinateur pour faire ta révision avec ton téléphone.</p>
    <form id="form-code" class="actions" style="align-items:stretch">
      <input id="code-tel" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="0000" value="${esc(dernier)}" class="champ-code" aria-label="Code à 4 chiffres">
      <button class="btn">Connecter ⚡</button>
    </form>
  </div>`;
}
function brancherCodeTel() {
  $("#form-code")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const c = $("#code-tel").value.replace(/\D/g, "");
    if (c.length !== 4) return toast("Le code contient 4 chiffres.", true);
    location.hash = "#/tel/" + c;
  });
}

async function ecranAccueil() {
  if (!etat.moi.profil) return ecranConnexion();
  if (etat.mobile) return ecranMobileOnglet("accueil");
  return ecranProfil(etat.moi.profil.id);
}

function ecranConnexion() {
  const formConnexion = `
    <form id="form-connexion" autocomplete="on">
      <label for="c-id">Identifiant</label>
      <input id="c-id" name="identifiant" autocomplete="username" autocapitalize="none" required>
      <label for="c-mdp">Mot de passe</label>
      <input id="c-mdp" name="motDePasse" type="password" autocomplete="current-password" required>
      <div class="actions"><button class="btn rouge">Se connecter ⚡</button></div>
    </form>`;
  if (etat.mobile) {
    // Version mobile : une seule colonne, le mode télécommande en premier.
    app.innerHTML = `
      <div class="mobile-hero">${senseiDit("<strong>Yo !</strong> Connecte-toi pour réviser, ou entre le code de l'ordinateur pour utiliser ton téléphone comme télécommande.")}</div>
      ${panneauCodeTel()}
      <div class="panel"><span class="etiquette">CONNEXION</span>${formConnexion}</div>
      <a class="btn blanc large" href="#/inscription">✨ Créer mon compte</a>`;
  } else {
    app.innerHTML = `
      ${senseiDit("<strong>Yo !</strong> Je suis Sensei. Connecte-toi à ton compte ou crée-le pour commencer à réviser !")}
      <div class="deux">
        <div class="panel incline-g"><span class="etiquette">CONNEXION</span><h2>Bon retour, héros !</h2>${formConnexion}</div>
        <div class="panel jaune incline-d"><span class="etiquette">NOUVEAU ?</span>
          <h2>Crée ton compte</h2>
          <p>Ton compte garde ton profil, tes résultats, le nombre de tes révisions et tes photos de cours.</p>
          <ul class="liste-manga"><li>Leçons et révisions sur mesure</li><li>Ton téléphone devient une télécommande</li><li>Aide aux devoirs avec photo</li></ul>
          <div class="actions"><a class="btn rouge" href="#/inscription">✨ Créer mon compte</a></div>
        </div>
      </div>
      <div class="panel noir"><span class="etiquette">📱 SUR TON TÉLÉPHONE</span>
        <div class="sync-actif">
          ${qrHTML(adresseSite(), "QR code pour ouvrir ReviZ sur le téléphone")}
          <div style="flex:1;min-width:220px">
            <p><strong style="color:var(--jaune)">📷 Scanne ce QR code</strong> avec ton téléphone (même Wi-Fi) pour ouvrir ReviZ, ou tape <strong>${esc(adresseSite())}</strong>.</p>
            <p class="aide" style="color:#ccc">Pour la télécommande : connecte-toi ici, puis « Connecter mon téléphone » dans ton profil affiche un QR code qui relie directement le téléphone.</p>
          </div>
        </div>
      </div>`;
  }
  brancherCodeTel();
  $("#form-connexion").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const r = await api("/auth/connexion", { method: "POST", body: Object.fromEntries(new FormData(e.target)) });
      etat.moi.profil = r.profil;
      toast("Bienvenue, " + r.profil.nom + " !");
      router();
    } catch (err) { toast(err.message, true); }
  });
}

// Mobile : saisie du code donné par l'ordinateur.
function ecranCode() {
  app.innerHTML = `
    ${senseiDit("Sur l'ordinateur, ouvre ton profil et clique sur <strong>« Connecter mon téléphone »</strong>. Entre ici le code à 4 chiffres affiché.")}
    ${panneauCodeTel()}`;
  brancherCodeTel();
  $("#code-tel").focus();
}

// ================= Liste déroulante avec recherche (écoles, sujets) =================
function brancherCombo(input, liste, { source, rendu, choisir, toutSiVide = false, bouton = null }) {
  let resultats = [], actif = -1;
  const afficher = async (tout = false) => {
    resultats = await source(tout ? "" : input.value.trim());
    if (!resultats.length && !(toutSiVide || tout)) { liste.hidden = true; return; }
    actif = -1;
    liste.innerHTML = resultats.length
      ? resultats.map((r, i) => `<li data-i="${i}">${rendu(r)}</li>`).join("")
      : `<li class="vide">Aucun résultat — tu peux garder ce que tu as écrit.</li>`;
    liste.hidden = false;
    liste.scrollTop = 0;
  };
  const valider = (i) => { const r = resultats[i]; if (r == null) return; choisir(r); liste.hidden = true; };
  input.addEventListener("input", () => afficher());
  input.addEventListener("focus", () => { if (toutSiVide) afficher(); });
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowDown" && liste.hidden) { ev.preventDefault(); return afficher(true); }
    if (liste.hidden) return;
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      actif = Math.max(0, Math.min(resultats.length - 1, actif + (ev.key === "ArrowDown" ? 1 : -1)));
      [...liste.children].forEach((li, i) => li.classList.toggle("actif", i === actif));
      liste.children[actif]?.scrollIntoView({ block: "nearest" });
    } else if (ev.key === "Enter" && actif >= 0) { ev.preventDefault(); valider(actif); }
    else if (ev.key === "Escape") liste.hidden = true;
  });
  liste.addEventListener("mousedown", (ev) => ev.preventDefault()); // garde le focus pendant le défilement
  liste.addEventListener("click", (ev) => { const li = ev.target.closest("li[data-i]"); if (li) valider(Number(li.dataset.i)); });
  input.addEventListener("blur", () => setTimeout(() => (liste.hidden = true), 150));
  if (bouton) {
    bouton.addEventListener("mousedown", (ev) => ev.preventDefault());
    bouton.addEventListener("click", () => { if (liste.hidden) { input.focus(); afficher(true); } else liste.hidden = true; });
  }
}

// ================= Écran : formulaire de profil =================
async function ecranFormulaire(p) {
  const v = p || { nom: "", ecole: "", ville: "", annee: "1re secondaire", avatar: "pics-0" };
  app.innerHTML = `
    <div class="panel">
      <span class="etiquette">${p ? "MODIFIER LE PROFIL" : "CRÉER MON COMPTE"}</span>
      <form id="form-profil" autocomplete="off">
        ${p ? "" : `
        <h3>1. Ton compte</h3>
        <div class="mission">
          <div><label for="f-id">Identifiant *</label><input id="f-id" name="identifiant" required minlength="3" maxlength="30" pattern="[A-Za-z0-9._\\-]+" autocapitalize="none" autocomplete="username" placeholder="ex. lea.tremblay"></div>
          <div><label for="f-mdp">Mot de passe * (6 caractères min.)</label><input id="f-mdp" name="motDePasse" type="password" required minlength="6" autocomplete="new-password"></div>
        </div>
        <label for="f-mdp2">Confirme le mot de passe *</label>
        <input id="f-mdp2" type="password" required minlength="6" autocomplete="new-password">
        <h3 style="margin-top:18px">2. Ton profil</h3>`}
        <label>Choisis ton avatar <span class="aide">ou mets ta photo</span></label>
        <div class="actions" style="margin:0 0 10px">
          <label class="btn blanc petit" for="f-photo-av" style="cursor:pointer">📷 Utiliser ma photo</label>
          <input type="file" id="f-photo-av" accept="image/*" hidden>
          <span id="apercu-photo-av"></span>
        </div>
        <div class="avatars" id="avatars"></div>
        <label for="f-nom">Nom ou surnom *</label>
        <input id="f-nom" name="nom" required maxlength="60" value="${esc(v.nom)}">
        <label for="f-ecole">Établissement scolaire</label>
        <div class="auto">
          <input id="f-ecole" name="ecole" value="${esc(v.ecole)}" placeholder="Commence à écrire le nom de ton école…">
          <ul class="auto-liste" id="ecole-liste" hidden></ul>
        </div>
        <input type="hidden" name="ville" id="f-ville" value="${esc(v.ville)}">
        <div class="aide">Liste officielle des écoles primaires et secondaires du Québec (Données Québec).</div>
        <label for="f-annee">Année scolaire</label>
        <select id="f-annee" name="annee">${ANNEES.map((a) => `<option ${a === v.annee ? "selected" : ""}>${a}</option>`).join("")}</select>
        ${p ? "" : `<p class="aide" style="margin-top:12px">Tu choisiras ta matière et ton sujet à réviser juste après !</p>`}
        <div class="actions">
          <button class="btn rouge" type="submit">${p ? "Enregistrer" : "Créer mon compte !"}</button>
          <a class="btn blanc" href="#/">Annuler</a>
          ${p ? `<button class="btn blanc" type="button" id="suppr">🗑 Supprimer ${etat.moi.profil?.id === p.id ? "mon compte" : "ce compte"}</button>` : ""}
        </div>
      </form>
    </div>`;

  let avatar = v.avatar || "pics-0";
  let photoAvatar = null; // photo choisie, envoyée après l'enregistrement du profil
  $("#f-photo-av").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    photoAvatar = await recadrerCarre(f, 320);
    $("#apercu-photo-av").innerHTML = `<img src="${photoAvatar}" class="mini-portrait" alt="Ma photo" style="width:56px;height:56px;vertical-align:middle"> <button type="button" class="btn blanc petit" id="retirer-photo-av">✕</button>`;
    $("#retirer-photo-av").addEventListener("click", () => { photoAvatar = null; $("#apercu-photo-av").innerHTML = ""; });
  });
  const zoneAv = $("#avatars");
  const dessinerAvatars = () => {
    zoneAv.innerHTML = STYLES.flatMap((s, si) => CHEVEUX.slice(0, 4).map((_, ci) => {
      const code = `${s}-${(ci + si * 2) % CHEVEUX.length}`;
      return `<button type="button" data-av="${code}" class="${code === avatar ? "choisi" : ""}" aria-label="Avatar ${code}">${avatarSVG(code)}</button>`;
    })).join("");
  };
  dessinerAvatars();
  zoneAv.addEventListener("click", (e) => { const b = e.target.closest("button[data-av]"); if (b) { avatar = b.dataset.av; dessinerAvatars(); } });

  const inE = $("#f-ecole"), ville = $("#f-ville");
  inE.addEventListener("input", () => (ville.value = ""));
  brancherCombo(inE, $("#ecole-liste"), {
    source: async (texte) => {
      const mots = sansAccents(texte).split(/\s+/).filter(Boolean);
      if (!mots.length) return [];
      const out = [];
      for (const e of await chargerEcoles()) {
        if (!e._k) e._k = sansAccents(`${e.nom} ${e.ville}`);
        if (mots.every((m) => e._k.includes(m))) { out.push(e); if (out.length >= 60) break; }
      }
      return out;
    },
    rendu: (e) => `${esc(e.nom)}<small>${esc(e.ville)} · ${esc(e.reseau)}${e.niveau ? " · " + esc(e.niveau) : ""}</small>`,
    choisir: (e) => { inE.value = e.nom; ville.value = e.ville; },
  });

  $("#form-profil").addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    d.avatar = avatar;
    if (!p && d.motDePasse !== $("#f-mdp2").value) return toast("Les deux mots de passe ne sont pas pareils.", true);
    try {
      if (p) {
        let r = await api("/profils/" + p.id, { method: "PUT", body: d });
        if (photoAvatar) r = await api(`/profils/${p.id}/avatar`, { method: "POST", body: { image: photoAvatar } });
        if (etat.moi.profil?.id === r.id) etat.moi.profil = r;
        toast("Profil mis à jour !");
        location.hash = etat.moi.profil?.id === r.id ? "#/" : "#/admin/compte/" + r.id;
      } else {
        const r = await api("/auth/inscription", { method: "POST", body: d });
        etat.moi.profil = photoAvatar ? await api(`/profils/${r.profil.id}/avatar`, { method: "POST", body: { image: photoAvatar } }) : r.profil;
        toast("Bienvenue, " + r.profil.nom + " ! Choisis ta mission.");
        location.hash = "#/";
        router();
      }
    } catch (err) { toast(err.message, true); }
  });
  if (p) $("#suppr").addEventListener("click", async () => {
    if (!confirm(`Supprimer le compte de ${p.nom} et tous ses résultats ? C'est définitif.`)) return;
    if (sync.profilId === p.id) sync.fermer();
    await api("/profils/" + p.id, { method: "DELETE" });
    if (etat.moi.profil?.id === p.id) { etat.moi.profil = null; location.hash = "#/"; }
    else location.hash = "#/admin";
  });
}

// ================= Écran : tableau de bord du profil =================
function rang(pct) { return pct >= 90 ? "S" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "D"; }
// Graphique de progression : points reliés, une courbe par type d'évaluation.
// Révision = violet, ronds, pointillé · Examen = bleu, losanges, trait plein · point vert = plus de 81 %.
const COUL_GRAPH = { revision: "#8e44ad", final: "#2b6cff", excellent: "#1e9e5a" }; // palette validée (daltonisme + contraste)
const SEUIL_EXCELLENT = 81;
function graphique(sessions) {
  const s = sessions.filter((x) => x.type !== "lecon").slice(-15);
  if (!s.length) return `<p class="vide">Aucun résultat pour l'instant. Lance ta première révision !</p>`;
  // Sur mobile, un repère plus étroit garde des textes lisibles une fois l'image réduite à la largeur du téléphone.
  const W = etat.mobile ? 360 : 640, H = etat.mobile ? 260 : 250, gauche = 34, droite = 14, haut = 30, bas = 36;
  const x = (i) => (s.length === 1 ? (gauche + W - droite) / 2 : gauche + (i * (W - gauche - droite)) / (s.length - 1));
  const y = (v) => haut + ((100 - v) / 100) * (H - haut - bas);
  const pts = s.map((v, i) => ({ ...v, i, px: x(i), py: y(v.pourcentage) }));
  const serie = (type) => pts.filter((p) => (type === "final" ? p.type === "final" : p.type !== "final"));
  const ligne = (arr, type) => arr.length < 2 ? "" : `<polyline points="${arr.map((p) => `${p.px.toFixed(1)},${p.py.toFixed(1)}`).join(" ")}" fill="none"
    stroke="${COUL_GRAPH[type]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" ${type === "final" ? "" : 'stroke-dasharray="7 5"'}/>`;
  const marque = (p) => {
    const type = p.type === "final" ? "final" : "revision";
    const fill = p.pourcentage > SEUIL_EXCELLENT ? COUL_GRAPH.excellent : COUL_GRAPH[type];
    const forme = type === "final"
      ? `<rect x="${p.px - 6.5}" y="${p.py - 6.5}" width="13" height="13" transform="rotate(45 ${p.px} ${p.py})" fill="${fill}" stroke="#fff" stroke-width="2"/>`
      : `<circle cx="${p.px}" cy="${p.py}" r="6.5" fill="${fill}" stroke="#fff" stroke-width="2"/>`;
    return `<g class="pt-graph"><title>${fmtDate(p.date)} · ${type === "final" ? "Examen" : "Révision"} · ${esc(p.matiere)} · ${esc(p.sujet)} : ${p.pourcentage} %${p.pourcentage > SEUIL_EXCELLENT ? " ★ excellent" : ""}</title>
      <circle cx="${p.px}" cy="${p.py}" r="14" fill="transparent"/>${forme}</g>`;
  };
  // Étiquette seulement sur le dernier point de chaque courbe (pas un nombre sur chaque point).
  // Révision : étiquette au-dessus du point; examen : en dessous (évite que les deux se chevauchent).
  const etiquette = (arr, dessous) => { const p = arr.at(-1); return p ? `<text x="${Math.min(p.px, W - droite - 4)}" y="${dessous ? p.py + 24 : p.py - 12}" text-anchor="${p.px > W - 60 ? "end" : "middle"}" font-size="12" font-weight="700" fill="#111">${p.pourcentage} %</text>` : ""; };
  const grille = [0, 25, 50, 75, 100].map((v) => `<line x1="${gauche}" x2="${W - droite}" y1="${y(v)}" y2="${y(v)}" stroke="#e6e2d6" stroke-width="1"/>
    <text x="${gauche - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#6b6b6b">${v}</text>`).join("");
  const rev = serie("revision"), exa = serie("final");
  return `
    <div class="legende-graph">
      ${rev.length ? `<span><svg width="34" height="14"><line x1="2" y1="7" x2="32" y2="7" stroke="${COUL_GRAPH.revision}" stroke-width="2.5" stroke-dasharray="7 5"/><circle cx="17" cy="7" r="5" fill="${COUL_GRAPH.revision}"/></svg> Révisions</span>` : ""}
      ${exa.length ? `<span><svg width="34" height="14"><line x1="2" y1="7" x2="32" y2="7" stroke="${COUL_GRAPH.final}" stroke-width="2.5"/><rect x="12" y="2" width="10" height="10" transform="rotate(45 17 7)" fill="${COUL_GRAPH.final}"/></svg> Examens</span>` : ""}
      <span><svg width="14" height="14"><circle cx="7" cy="7" r="5.5" fill="${COUL_GRAPH.excellent}"/></svg> Plus de ${SEUIL_EXCELLENT} %</span>
      <span class="seuil"><svg width="28" height="10"><line x1="1" y1="5" x2="27" y2="5" stroke="${COUL_GRAPH.excellent}" stroke-width="2" stroke-dasharray="2 4"/></svg> excellent ${SEUIL_EXCELLENT} %</span>
      <span class="seuil"><svg width="28" height="10"><line x1="1" y1="5" x2="27" y2="5" stroke="#111" stroke-width="2" stroke-dasharray="5 4"/></svg> seuil de réussite 60 %</span>
    </div>
    <svg class="graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progression : ${rev.length} révisions et ${exa.length} examens, sur 100 %">
      ${grille}
      <line x1="${gauche}" x2="${W - droite}" y1="${y(60)}" y2="${y(60)}" stroke="#111" stroke-dasharray="5 4" stroke-width="1.5"/>
      <line x1="${gauche}" x2="${W - droite}" y1="${y(SEUIL_EXCELLENT)}" y2="${y(SEUIL_EXCELLENT)}" stroke="${COUL_GRAPH.excellent}" stroke-dasharray="2 4" stroke-width="1.5"/>
      <line x1="${gauche}" x2="${W - droite}" y1="${y(0)}" y2="${y(0)}" stroke="#111" stroke-width="2"/>
      ${ligne(rev, "revision")}${ligne(exa, "final")}
      ${pts.map(marque).join("")}
      ${etiquette(rev, false)}${etiquette(exa, true)}
      <text x="${x(0)}" y="${H - 12}" text-anchor="${s.length === 1 ? "middle" : "start"}" font-size="11" fill="#6b6b6b">${fmtDate(s[0].date)}</text>
      ${s.length > 1 ? `<text x="${x(s.length - 1)}" y="${H - 12}" text-anchor="end" font-size="11" fill="#6b6b6b">${fmtDate(s.at(-1).date)}</text>` : ""}
    </svg>`;
}
const libType = (s) => s.type === "final" ? "Examen" : s.type === "lecon" ? "Leçon" : s.photo ? "Révision photo" : "Révision";
function resumeReglages(r) {
  return `${r.minuteur ? `⏱ ${r.secondesChoix} s (choix) / ${r.secondesOuvertes} s (ouvertes)` : "⏱ sans minuteur"} · ${r.nbRevision} questions en révision · ${r.nbFinal} à l'examen · ${r.pctQcm} % QCM / ${100 - r.pctQcm} % ouvertes · maths : ${100 - r.pctQcmMaths} % ouvertes avec calcul`;
}

// --- Sections du profil, réutilisées par l'écran web, les onglets mobiles et la vue admin ---
// Moyennes : toutes les notes (révisions + examens), jamais la meilleure note seule.
const typeDe = (s) => (s.type === "final" ? "final" : s.type === "lecon" ? "lecon" : "revision");
const notees = (ss) => ss.filter((s) => s.type !== "lecon" && Number.isFinite(s.pourcentage));
const moyenneDe = (ss) => { const n = notees(ss); return n.length ? Math.round(n.reduce((a, s) => a + s.pourcentage, 0) / n.length) : null; };
const fmtPct = (v) => (v == null ? "–" : v + " %");
// Code couleur par matière (bande à gauche des lignes, puces, cartes de moyenne).
const COUL_MATIERE = [
  [/fran/i, "#e63946"], [/math/i, "#f77f00"], [/angl/i, "#0096c7"], [/espagnol/i, "#6a994e"],
  [/éducation physique/i, "#06a77d"], [/culture/i, "#9d4edd"], [/financ/i, "#5c677d"],
  [/univers|géo|hist|monde/i, "#a0522d"], [/scien|chimie|physique|techno|ATS|STE/i, "#2d6a4f"],
  [/arts?\b|plastique/i, "#e5679b"], [/musique/i, "#c99700"],
];
const PALETTE_MATIERE = ["#3a86ff", "#ff006e", "#8338ec", "#fb5607", "#118ab2", "#7a5c3c"];
function couleurMatiere(m) {
  const t = COUL_MATIERE.find(([re]) => re.test(m || ""));
  if (t) return t[1];
  let h = 0; for (const c of String(m || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE_MATIERE[h % PALETTE_MATIERE.length];
}
const badgeMatiere = (m) => `<span class="badge-matiere" style="--c:${couleurMatiere(m)}">${esc(m || "—")}</span>`;
const S = {
  entete: (p, { lectureSeule = false } = {}) => `
    <div class="panel trame">
      <div class="entete-profil">
        <div class="portrait">${avatarSVG(p.avatar)}</div>
        <div style="flex:1;min-width:180px">
          <h1>${esc(p.nom)}</h1>
          <div><strong>${esc(p.annee)}</strong>${p.ecole ? " · " + esc(p.ecole) : ""}${p.ville ? " (" + esc(p.ville) + ")" : ""}</div>
          ${p.identifiant ? `<div class="aide">@${esc(p.identifiant)}</div>` : ""}
        </div>
        ${lectureSeule ? "" : `<div class="actions" style="margin:0">
          <a class="btn blanc petit" href="#/profil/${p.id}/modifier">✏️ Modifier</a>
          <a class="btn blanc petit" href="#/profil/${p.id}/reglages">⚙️ Réglages</a>
        </div>`}
      </div>
    </div>`,
  mission: (p) => {
    const matieres = matieresPour(p.annee);
    const listeM = p.matiere && !matieres.includes(p.matiere) ? [p.matiere, ...matieres] : matieres;
    return `
    <div class="panel jaune">
      <span class="etiquette">TA MISSION</span>
      <div id="mission-aide" ${p.matiere && p.sujet ? "hidden" : ""}>${senseiDit("Choisis ta <strong>matière</strong> puis ta <strong>leçon</strong> pour débloquer les boutons !")}</div>
      <div class="mission">
        <div><label for="m-matiere">1. Matière</label>
          <select id="m-matiere"><option value="">— Choisis ta matière —</option>${listeM.map((m) => `<option ${m === p.matiere ? "selected" : ""}>${esc(m)}</option>`).join("")}</select></div>
        <div><label for="m-sujet">2. Leçon</label>
          <div class="auto combo">
            <input id="m-sujet" value="${esc(p.sujet || "")}" placeholder="Choisis dans la liste ou écris ta leçon" autocomplete="off">
            <button type="button" class="combo-btn" id="m-sujet-btn" aria-label="Voir toutes les leçons">▼</button>
            <ul class="auto-liste" id="m-sujet-liste" hidden></ul>
          </div></div>
      </div>
      <p class="aide" style="color:#111;margin-top:8px" id="resume-lecon"></p>
      <div class="actions">
        <button class="btn rouge" data-go="lecon">📖 Ouvrir la leçon</button>
        <button class="btn bleu" data-go="test">⚔️ Révision</button>
        <button class="btn blanc" data-go="photo">📸 Leçon en photo</button>
        <button class="btn blanc" data-go="devoirs">✍️ Aide aux devoirs</button>
      </div>
      <p class="aide" style="color:#111">${esc(resumeReglages(reglagesDe(p)))} — <a href="#/profil/${p.id}/reglages">modifier</a></p>
    </div>`;
  },
  sync: () => `<div class="panel noir"><span class="etiquette">📱 TÉLÉCOMMANDE</span><div id="zone-sync"></div></div>`,
  lienCode: () => `<a class="panel noir carte-lien" href="#/code"><span class="etiquette">📱 TÉLÉCOMMANDE</span>
    <strong style="color:var(--jaune)">Entrer le code de l'ordinateur ▶</strong><br><span class="aide" style="color:#ccc">Pour répondre à la révision depuis ton téléphone.</span></a>`,
  stats: (p) => {
    const ss = p.sessions, rev = ss.filter((x) => typeDe(x) === "revision"), exa = ss.filter((x) => x.type === "final");
    return `<div class="stats panel">
      <span class="etiquette">STATS DU HÉROS</span>
      <div class="stat rev"><div class="val">${ss.filter((x) => x.type === "lecon").length}</div><div class="lib">leçons lues</div></div>
      <div class="stat"><div class="val">${rev.length}</div><div class="lib">révisions</div></div>
      <div class="stat"><div class="val">${exa.length}</div><div class="lib">examens</div></div>
      <div class="stat moy"><div class="val">${fmtPct(moyenneDe(ss))}</div><div class="lib">moyenne globale</div></div>
      <div class="stat"><div class="val">${fmtPct(moyenneDe(rev))}</div><div class="lib">moyenne des révisions</div></div>
      <div class="stat"><div class="val">${fmtPct(moyenneDe(exa))}</div><div class="lib">moyenne des examens</div></div>
    </div>`;
  },
  photos: (p, { lectureSeule = false } = {}) => `
    <div class="panel">
      <span class="etiquette">${lectureSeule ? "PHOTOS DE COURS" : "MES PHOTOS DE COURS"}</span>
      ${lectureSeule ? "" : `<p>Ajoute des photos de tes notes de cours, de tes exercices ou de tes anciens examens. Sensei les lit pour créer des questions qui ressemblent à celles de ton prof !</p>
      ${p.matiere ? "" : `<p class="aide">Choisis d'abord ta matière dans ta mission pour classer les photos.</p>`}
      <label class="zone-upload" for="photo-input" style="cursor:pointer">
        📸 <strong>${etat.mobile ? "Prendre une photo ou choisir" : "Prendre ou choisir des photos"}</strong><br><span class="aide">Classées dans : ${esc(p.matiere || "—")}${p.sujet ? " · " + esc(p.sujet) : ""}</span>
      </label>
      <input type="file" id="photo-input" accept="image/*" multiple hidden>`}
      <div class="galerie" id="galerie">
        ${p.photos.length ? [...p.photos].reverse().map((ph) => `
          <div class="photo">
            <img src="/photos/${esc(ph.fichier)}" alt="Photo de cours" data-desc="${esc(ph.description || "")}" loading="lazy">
            ${lectureSeule ? "" : `<button class="suppr" data-suppr="${ph.id}" title="Supprimer">×</button>`}
            <div class="leg"><strong>${esc(ph.matiere)}</strong>${ph.sujet ? " · " + esc(ph.sujet) : ""}<br>${ph.description ? "✅ analysée" : etat.status.ia ? "⚠️ non analysée" : "mode démo"}</div>
          </div>`).join("") : `<p class="vide">Aucune photo pour l'instant.</p>`}
      </div>
    </div>`,
};

// Branche les événements des sections présentes à l'écran.
function brancherProfil(p, recharger) {
  const selM = $("#m-matiere"), inS = $("#m-sujet");
  const sauverMission = async () => {
    if (!selM) return;
    const r = await api("/profils/" + p.id, { method: "PUT", body: { matiere: selM.value, sujet: inS.value.trim() } });
    Object.assign(p, r);
    if (etat.moi.profil?.id === p.id) { etat.moi.profil = r; majEntete(); } // affiche le Dico si la matière devient l'anglais
    majMission();
    prechauffer(p, "lecon"); // Sensei commence à préparer la leçon pendant que l'élève clique
  };
  const majMission = () => {
    if (!selM) return;
    const ok = !!(selM.value && inS.value.trim());
    app.querySelectorAll("[data-go]").forEach((b) => (b.disabled = b.dataset.go === "devoirs" || b.dataset.go === "photo" ? !selM.value : !ok));
    inS.disabled = !selM.value;
    $("#m-sujet-btn").disabled = !selM.value;
    $("#resume-lecon").innerHTML = ok ? resumeLecon(p, selM.value, inS.value.trim()) : "";
    $("#mission-aide").hidden = ok;
  };
  if (selM) {
    brancherCombo(inS, $("#m-sujet-liste"), {
      toutSiVide: true,
      bouton: $("#m-sujet-btn"),
      source: async (texte) => {
        const tous = sujetsPour(selM.value);
        const t = sansAccents(texte);
        return t ? tous.filter((s) => sansAccents(s).includes(t)) : tous;
      },
      rendu: (s) => esc(s),
      choisir: (s) => { inS.value = s; sauverMission(); },
    });
    selM.addEventListener("change", () => {
      inS.value = "";
      inS.disabled = $("#m-sujet-btn").disabled = !selM.value; // actif tout de suite, sans attendre l'enregistrement
      sauverMission();
      if (selM.value) inS.focus(); // ouvre la liste des leçons
    });
    inS.addEventListener("input", majMission);
    inS.addEventListener("change", sauverMission);
    majMission();
    app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", async () => {
      await sauverMission();
      location.hash = `#/profil/${p.id}/${b.dataset.go}`;
    }));
  }

  // Télécommande (ordinateur)
  const z = $("#zone-sync");
  const dessinerSync = () => {
    if (!z) return;
    if (sync.code && sync.profilId === p.id) {
      z.innerHTML = `
        <div class="sync-actif">
          ${qrHTML(`${adresseSite()}/t/${sync.code}`, "QR code pour connecter le téléphone")}
          <div><div class="aide" style="color:#ddd">CODE</div><div class="gros-code">${esc(sync.code)}</div></div>
          <div style="flex:1;min-width:220px">
            <p><strong style="color:var(--jaune)">📷 Scanne le QR code</strong> avec l'appareil photo du téléphone : il se connecte tout seul en télécommande.</p>
            <p class="aide" style="color:#ccc">Ou ouvre ${esc(adresseSite())} et entre le code (onglet 📱 Code, ou « Mode télécommande »).</p>
            <p data-sync-statut></p>
            <button class="btn blanc petit" id="sync-off">Déconnecter</button>
          </div>
        </div>`;
      $("#sync-off").addEventListener("click", () => { sync.fermer(); dessinerSync(); });
      majSyncUI();
    } else {
      z.innerHTML = `<p>Fais ta révision sur l'ordinateur et réponds avec ton téléphone, comme une manette de jeu ! Les questions et le temps restent sur l'écran de l'ordinateur.</p>
        <button class="btn" id="sync-on">📱 Connecter mon téléphone</button>`;
      $("#sync-on").addEventListener("click", async () => {
        try { await sync.activer(p); dessinerSync(); } catch (e) { toast(e.message, true); }
      });
    }
  };
  dessinerSync();

  // Photos
  $("#photo-input")?.addEventListener("change", async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    const matiere = selM?.value || p.matiere;
    if (!matiere) { toast("Choisis d'abord ta matière pour classer les photos.", true); e.target.value = ""; return; }
    await sauverMission();
    chargement("Sensei lit tes photos !", ["Il déchiffre l'écriture de ton prof…", "Il repère les notions importantes…", `Photo(s) : ${files.length}`]);
    try {
      for (const f of files) {
        const image = await lirePhoto(f);
        await api(`/profils/${p.id}/photos`, { method: "POST", body: { image, matiere, sujet: inS?.value ?? p.sujet } });
      }
      toast(files.length > 1 ? "Photos ajoutées !" : "Photo ajoutée !");
    } catch (err) { toast(err.message, true); }
    finChargement();
    recharger();
  });
  $("#galerie")?.addEventListener("click", async (e) => {
    const s = e.target.closest("[data-suppr]");
    if (s) {
      if (!confirm("Supprimer cette photo ?")) return;
      await api(`/profils/${p.id}/photos/${s.dataset.suppr}`, { method: "DELETE" });
      return recharger();
    }
    const img = e.target.closest("img");
    if (img) {
      const w = window.open(img.src, "_blank");
      if (!w && img.dataset.desc) alert(img.dataset.desc);
    }
  });
}

async function chargerProfil(id) {
  const p = await api("/profils/" + id);
  etat.profil = p;
  if (etat.moi.profil?.id === p.id) etat.moi.profil = p;
  if (sync.profilId && sync.profilId !== p.id) sync.fermer();
  return p;
}

// ---------- Filtre par matière (stats, graphique, historique) ----------
function puceFiltres(matieres, actif, attr = "data-filtre-matiere") {
  if (matieres.length < 1) return "";
  return `<div class="filtres">${["", ...matieres].map((m) => `<button type="button" class="puce ${m === actif ? "actif" : ""}" ${attr}="${esc(m)}">${m ? esc(m) : "Toutes les matières"}</button>`).join("")}</div>`;
}
const matieresDe = (p) => [...new Set(p.sessions.map((s) => s.matiere).filter(Boolean))].sort();
// Vue des progrès : filtres matière + type, moyennes, graphique, puis UN seul historique (cases à cocher, corbeille).
const TYPES_PROGRES = [["", "Tout"], ["lecon", "📖 Leçons"], ["revision", "⚡ Révisions"], ["final", "⚔️ Examens"]];
function contenuProgres(p) {
  const matieres = matieresDe(p);
  const fm = matieres.includes(etat.filtreMatiere) ? etat.filtreMatiere : "";
  const ft = TYPES_PROGRES.some(([t]) => t && t === etat.filtreType) ? etat.filtreType : "";
  const dansMatiere = fm ? p.sessions.filter((x) => x.matiere === fm) : p.sessions;
  const choisies = ft ? dansMatiere.filter((x) => typeDe(x) === ft) : dansMatiere;
  const filtres = !p.sessions.length ? "" : `
    <div class="filtres">${["", ...matieres].map((m) => `<button type="button" class="puce ${m === fm ? "actif" : ""}" data-pf-matiere="${esc(m)}" ${m ? `style="--c:${couleurMatiere(m)}"` : ""}>${m ? `<i class="pastille"></i>${esc(m)}` : "Toutes les matières"}</button>`).join("")}</div>
    <div class="filtres">${TYPES_PROGRES.map(([t, lib]) => `<button type="button" class="puce ${t === ft ? "actif" : ""}" data-pf-type="${t}">${lib}</button>`).join("")}</div>`;
  // Moyenne par matière (selon le type choisi)
  const parMatiere = (fm ? [fm] : matieres).map((m) => {
    const ss = p.sessions.filter((x) => x.matiere === m && (!ft || typeDe(x) === ft));
    const rev = ss.filter((x) => typeDe(x) === "revision"), exa = ss.filter((x) => x.type === "final");
    return { m, moy: moyenneDe(ss), rev, exa, lecons: ss.filter((x) => x.type === "lecon").length };
  }).filter((x) => x.rev.length || x.exa.length || x.lecons);
  const moyennes = ft === "lecon" || !parMatiere.length ? "" : `
    <div class="panel"><span class="etiquette">MOYENNE PAR MATIÈRE</span>
      <div class="grille-moyennes">${parMatiere.map((x) => `
        <button type="button" class="carte-moyenne ${x.m === fm ? "actif" : ""}" data-pf-matiere="${x.m === fm ? "" : esc(x.m)}" style="--c:${couleurMatiere(x.m)}">
          <span class="nom">${esc(x.m)}</span>
          <strong class="val ${x.moy == null ? "" : x.moy >= 60 ? "ok" : "ko"}">${fmtPct(x.moy)}</strong>
          <span class="aide">⚡ ${x.rev.length} révision${x.rev.length > 1 ? "s" : ""} · moy. ${fmtPct(moyenneDe(x.rev))}<br>⚔️ ${x.exa.length} examen${x.exa.length > 1 ? "s" : ""} · moy. ${fmtPct(moyenneDe(x.exa))}</span>
        </button>`).join("")}</div>
    </div>`;
  const hist = [...choisies].reverse();
  const admin = !!etat.moi.admin; // seul l'admin peut supprimer des lignes
  const resultat = (x) => (x.type === "lecon" ? "📖 lue" : `<strong class="${x.pourcentage >= 60 ? "ok" : "ko"}">${x.pourcentage} %</strong> <span class="aide">(${fmtPoints(x.score)}/${x.total})</span>`);
  const revoir = (x) => (x.details?.length ? `<a class="btn blanc petit" href="#/profil/${p.id}/evaluation/${x.id}">👁 Revoir</a>` : "");
  const corbeille = (x) => !admin ? "" : `<button type="button" class="btn-corbeille" data-pf-suppr="${x.id}" title="Supprimer cette ligne" aria-label="Supprimer cette ligne">🗑</button>`;
  const caseL = (x) => !admin ? "" : `<input type="checkbox" class="pf-case" value="${x.id}" aria-label="Sélectionner cette ligne">`;
  const lignes = !hist.length ? `<p class="vide">${p.sessions.length ? "Rien pour ce filtre." : "Aucun résultat pour l'instant. Lance ta première révision !"}</p>` : `
    <div class="barre-selection">
      ${admin ? `<label class="case" style="margin:0"><input type="checkbox" id="pf-tout"> Tout cocher</label>
      <button type="button" class="btn rouge petit" id="pf-suppr" disabled>🗑 Supprimer la sélection</button>` : ""}
      <span class="aide">${hist.length} ligne${hist.length > 1 ? "s" : ""}</span>
    </div>
    ${etat.mobile
      ? `<div class="liste-sessions">${hist.map((x) => `<div class="carte-session ligne-matiere" style="--c:${couleurMatiere(x.matiere)}">
          <div class="haut-session">${caseL(x)}<span class="badge ${x.type}">${libType(x)}</span><strong class="pct">${x.type === "lecon" ? "📖" : x.pourcentage + " %"}</strong>${corbeille(x)}</div>
          <div>${esc(x.sujet)}</div><div class="aide">${esc(x.matiere)} · ${fmtDate(x.date)}${x.type === "lecon" ? "" : ` · ${fmtPoints(x.score)}/${x.total}`}</div>${revoir(x)}</div>`).join("")}</div>`
      : `<div class="table-scroll"><table class="historique">
          <thead><tr>${admin ? "<th></th>" : ""}<th>Date</th><th>Type</th><th>Matière</th><th>Leçon</th><th>Résultat</th><th></th>${admin ? "<th></th>" : ""}</tr></thead>
          <tbody>${hist.map((x) => `<tr class="ligne-matiere" style="--c:${couleurMatiere(x.matiere)}">
            ${admin ? `<td>${caseL(x)}</td>` : ""}<td>${fmtDate(x.date)}</td><td><span class="badge ${x.type}">${libType(x)}</span></td>
            <td>${badgeMatiere(x.matiere)}</td><td>${esc(x.sujet)}</td><td>${resultat(x)}</td><td>${revoir(x)}</td>${admin ? `<td>${corbeille(x)}</td>` : ""}</tr>`).join("")}</tbody></table></div>`}`;
  return filtres + S.stats({ ...p, sessions: dansMatiere }) + moyennes + `
    <div class="panel"><span class="etiquette">PROGRESSION${fm ? " · " + esc(fm).toUpperCase() : ""}</span>
      ${ft === "lecon" ? "" : graphique(choisies)}
      <h3 style="margin:18px 0 6px">Historique</h3>${lignes}
    </div>`;
}
const vueProgres = (p) => { etat.progres = p; return `<div id="zone-progres">${contenuProgres(p)}</div>`; };
const majProgres = () => { const z = $("#zone-progres"); if (z && etat.progres) z.innerHTML = contenuProgres(etat.progres); };
async function supprimerLignes(p, ids) {
  if (!ids.length) return;
  if (!confirm(ids.length > 1 ? `Supprimer ces ${ids.length} lignes de l'historique (et leurs résultats) ? C'est définitif.` : "Supprimer cette ligne de l'historique (et son résultat) ? C'est définitif.")) return;
  try {
    const r = await api(`/profils/${p.id}/sessions`, { method: "POST", body: { ids } });
    p.sessions = r.profil.sessions; p.revisions = r.profil.revisions;
    if (etat.profil?.id === p.id) etat.profil.sessions = p.sessions;
    toast(`${r.supprimees} ligne${r.supprimees > 1 ? "s" : ""} supprimée${r.supprimees > 1 ? "s" : ""}.`);
    majProgres();
  } catch (err) { toast(err.message, true); }
}
document.addEventListener("click", (e) => {
  if (!e.target.closest("#zone-progres") || !etat.progres) return;
  const bm = e.target.closest("[data-pf-matiere]"), bt = e.target.closest("[data-pf-type]"), bs = e.target.closest("[data-pf-suppr]");
  if (bm) { etat.filtreMatiere = bm.dataset.pfMatiere; majProgres(); }
  else if (bt) { etat.filtreType = bt.dataset.pfType; majProgres(); }
  else if (bs) supprimerLignes(etat.progres, [bs.dataset.pfSuppr]);
  else if (e.target.id === "pf-suppr") supprimerLignes(etat.progres, [...document.querySelectorAll("#zone-progres .pf-case:checked")].map((c) => c.value));
});
document.addEventListener("change", (e) => {
  if (!e.target.closest("#zone-progres")) return;
  const cases = [...document.querySelectorAll("#zone-progres .pf-case")];
  if (e.target.id === "pf-tout") cases.forEach((c) => (c.checked = e.target.checked));
  const n = cases.filter((c) => c.checked).length, b = $("#pf-suppr");
  if (b) { b.disabled = !n; b.textContent = n ? `🗑 Supprimer la sélection (${n})` : "🗑 Supprimer la sélection"; }
  const tout = $("#pf-tout"); if (tout && e.target.id !== "pf-tout") tout.checked = n === cases.length;
});
// Filtre par matière de « Mes leçons »
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-filtre-matiere]");
  if (!b) return;
  etat.filtreMatiere = b.dataset.filtreMatiere;
  if ($("#zone-lecons") && etat.profil) $("#zone-lecons").innerHTML = contenuMesLecons(etat.profil);
});

// ---------- 📚 Mes leçons : toutes les leçons apprises, par matière ----------
function leconsApprises(p) {
  const groupes = new Map();
  for (const s of p.sessions) {
    if (s.photo || !s.matiere || !s.sujet) continue;
    const cle = s.matiere + "|" + s.sujet;
    if (!groupes.has(cle)) groupes.set(cle, { matiere: s.matiere, sujet: s.sujet, lectures: [], revisions: [], examens: [] });
    const g = groupes.get(cle);
    (s.type === "lecon" ? g.lectures : s.type === "final" ? g.examens : g.revisions).push(s);
  }
  return [...groupes.values()].sort((a, b) => String(b.lectures.at(-1)?.date || "").localeCompare(String(a.lectures.at(-1)?.date || "")));
}
function contenuMesLecons(p) {
  const toutes = leconsApprises(p);
  const photos = p.leconsPhoto || [];
  const matieres = [...new Set([...toutes.map((l) => l.matiere), ...photos.map((l) => l.matiere)])].sort();
  const f = matieres.includes(etat.filtreMatiere) ? etat.filtreMatiere : "";
  const liste = toutes.filter((l) => !f || l.matiere === f);
  const lp = photos.filter((l) => !f || l.matiere === f);
  if (!toutes.length && !photos.length) return `<p class="vide">Tu n'as encore appris aucune leçon. Choisis une matière et une leçon dans l'accueil !</p>`;
  const moy = (arr) => fmtPct(moyenneDe(arr));
  return puceFiltres(matieres, f) + `<div class="grille-lecons">${liste.map((l) => `
    <div class="carte-lecon ${l.lectures.length ? "" : "non-lue"}">
      ${badgeMatiere(l.matiere)}
      <h3>${esc(l.sujet)}</h3>
      <div>${l.lectures.length ? `📖 Lue <strong>${l.lectures.length}×</strong> · dernière fois le ${fmtDate(l.lectures.at(-1).date)}` : "📖 Pas encore lue jusqu'au bout"}</div>
      <div>⚡ ${l.revisions.length} révision${l.revisions.length > 1 ? "s" : ""} (moy. ${moy(l.revisions)}) · ⚔️ ${l.examens.length} examen${l.examens.length > 1 ? "s" : ""} (moy. ${moy(l.examens)})</div>
      <div class="actions" style="margin-top:10px">
        <button class="btn petit" data-ouvrir-lecon="${esc(l.matiere)}|${esc(l.sujet)}|lecon">📖 Revoir la leçon</button>
        <button class="btn blanc petit" data-ouvrir-lecon="${esc(l.matiere)}|${esc(l.sujet)}|test">⚔️ Révision</button>
      </div>
    </div>`).join("")}
    ${lp.map((l) => `<div class="carte-lecon"><span class="badge lecon">📸 ${esc(l.matiere)}</span><h3>${esc(l.titre)}</h3>
      <div>Leçon créée à partir de ${l.photos.length} photo${l.photos.length > 1 ? "s" : ""} · ${fmtDate(l.date)}</div>
      <div class="actions" style="margin-top:10px"><button class="btn petit" data-ouvrir-photo="${esc(l.matiere)}|${l.id}">📖 Revoir</button></div></div>`).join("")}
  </div>`;
}
async function ecranMesLecons() {
  const p = await chargerProfil(etat.moi.profil?.id || etat.profil?.id);
  app.innerHTML = `
    <div class="panel noir"><span class="etiquette">📚 MES LEÇONS</span><h1 style="color:var(--jaune)">Les leçons que j'ai apprises</h1>
      <p>${leconsApprises(p).filter((l) => l.lectures.length).length} leçon(s) lue(s) · ${(p.leconsPhoto || []).length} leçon(s) en photo</p></div>
    <div class="panel"><span class="etiquette">PAR MATIÈRE</span><div id="zone-lecons">${contenuMesLecons(p)}</div></div>`;
  $("#zone-lecons").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-ouvrir-lecon], [data-ouvrir-photo]");
    if (!b) return;
    if (b.dataset.ouvrirPhoto) {
      const [matiere, idPhoto] = b.dataset.ouvrirPhoto.split("|");
      Object.assign(p, await api("/profils/" + p.id, { method: "PUT", body: { matiere } }));
      etat.profil = p; etat.ouvrirPhoto = idPhoto;
      location.hash = `#/profil/${p.id}/photo`;
      return;
    }
    const [matiere, sujet, onglet] = b.dataset.ouvrirLecon.split("|");
    Object.assign(p, await api("/profils/" + p.id, { method: "PUT", body: { matiere, sujet } }));
    etat.profil = p; if (etat.moi.profil?.id === p.id) etat.moi.profil = p;
    location.hash = `#/profil/${p.id}/${onglet}`;
  });
}

// Version web : tout le tableau de bord sur une page.
async function ecranProfil(id) {
  if (etat.mobile && etat.moi.profil?.id === id) return ecranMobileOnglet("accueil");
  const p = await chargerProfil(id);
  await reprendreSync(p);
  app.innerHTML = bandeauDemo() + S.entete(p) + S.mission(p) + S.sync() + vueProgres(p) + S.photos(p);
  brancherProfil(p, () => ecranProfil(id));
}

// Version mobile : un onglet à la fois (barre en bas de l'écran).
async function ecranMobileOnglet(onglet) {
  if (!etat.moi.profil) return ecranConnexion();
  const p = await chargerProfil(etat.moi.profil.id);
  const vues = {
    accueil: () => `<div class="bonjour"><div class="mini-portrait">${avatarSVG(p.avatar)}</div><div><div class="aide">Salut,</div><h2 style="margin:0">${esc(p.nom)} !</h2></div></div>`
      + bandeauDemo() + S.mission(p) + S.lienCode() + S.stats(p),
    progres: () => vueProgres(p) + `<div class="actions"><a class="btn blanc" href="#/profil/${p.id}/modifier">✏️ Modifier mon profil</a><a class="btn blanc" href="#/profil/${p.id}/reglages">⚙️ Réglages</a></div>`,
    photos: () => S.photos(p),
  };
  app.innerHTML = (vues[onglet] || vues.accueil)();
  brancherProfil(p, () => ecranMobileOnglet(onglet));
}


// ================= Écran : réglages du test =================
async function ecranReglages(id) {
  const p = (etat.profil = await api("/profils/" + id));
  const r = reglagesDe(p);
  app.innerHTML = `
    <div class="panel">
      <span class="etiquette">RÉGLAGES DE ${esc(p.nom.toUpperCase())}</span>
      <form id="form-reg">
        <h3>⏱ Minuteur</h3>
        <label class="case"><input type="checkbox" name="minuteur" ${r.minuteur ? "checked" : ""}> Activer le temps limite par question</label>
        <div id="zone-temps" class="mission">
          <div><label for="r-sc">Secondes par question à choix</label><input id="r-sc" type="number" name="secondesChoix" min="10" max="300" value="${r.secondesChoix}"></div>
          <div><label for="r-so">Secondes par question ouverte</label><input id="r-so" type="number" name="secondesOuvertes" min="15" max="600" value="${r.secondesOuvertes}"></div>
        </div>
        <p class="aide">Quand il reste 10 secondes, le contour du téléphone clignote en rouge.</p>

        <h3 style="margin-top:20px">❓ Nombre de questions</h3>
        <div class="mission">
          <div><label for="r-nr">Quiz de révision</label><input id="r-nr" type="number" name="nbRevision" min="5" max="25" value="${r.nbRevision}"></div>
          <div><label for="r-nf">Examen</label><input id="r-nf" type="number" name="nbFinal" min="10" max="40" value="${r.nbFinal}"></div>
        </div>

        <h3 style="margin-top:20px">⚖️ Types de questions</h3>
        <label for="r-pct">Répartition : <span id="pct-lib"></span></label>
        <input id="r-pct" type="range" name="pctQcm" min="0" max="100" step="10" value="${r.pctQcm}">
        <div class="repartition"><div id="pct-barre"></div></div>
        <p class="aide">QCM = choix multiples, vrai/faux et frises (boutons sur le téléphone). Ouvertes = réponse à écrire (champ texte sur le téléphone). Par défaut : 70 % / 30 %.</p>
        <label for="r-pctm">🧮 En mathématiques : <span id="pctm-lib"></span></label>
        <input id="r-pctm" type="range" name="pctQcmMaths" min="0" max="100" step="10" value="${r.pctQcmMaths}">
        <div class="repartition"><div id="pctm-barre"></div></div>
        <p class="aide">Par défaut en maths : 100 % de questions ouvertes. L'élève écrit son calcul et son résultat final; le calcul compte dans la note.</p>

        <div class="actions">
          <button class="btn rouge">Enregistrer</button>
          <button class="btn blanc" type="button" id="defaut">Valeurs par défaut</button>
          <a class="btn blanc" href="#/profil/${p.id}">Retour</a>
        </div>
      </form>
    </div>`;
  const f = $("#form-reg");
  const maj = () => {
    const v = Number(f.pctQcm.value);
    $("#pct-lib").textContent = `${v} % QCM / ${100 - v} % questions ouvertes`;
    $("#pct-barre").style.width = v + "%";
    const vm = Number(f.pctQcmMaths.value);
    $("#pctm-lib").textContent = `${vm} % QCM / ${100 - vm} % questions ouvertes avec calcul`;
    $("#pctm-barre").style.width = vm + "%";
    $("#zone-temps").style.opacity = f.minuteur.checked ? 1 : 0.4;
    f.secondesChoix.disabled = f.secondesOuvertes.disabled = !f.minuteur.checked;
  };
  f.addEventListener("input", maj);
  maj();
  $("#defaut").addEventListener("click", () => {
    for (const [k, v] of Object.entries(REGLAGES_DEFAUT)) { if (k === "minuteur") f.minuteur.checked = v; else f[k].value = v; }
    maj();
  });
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = { minuteur: f.minuteur.checked };
    for (const k of ["secondesChoix", "secondesOuvertes", "nbRevision", "nbFinal", "pctQcm", "pctQcmMaths"]) body[k] = Number(f[k].value);
    try {
      etat.profil = await api(`/profils/${p.id}/reglages`, { method: "PUT", body });
      toast("Réglages enregistrés !");
      location.hash = "#/profil/" + p.id;
    } catch (err) { toast(err.message, true); }
  });
}

// ================= Correction =================
function normaliserNombre(s) {
  const t = String(s).trim().replace(/\s/g, "").replace(",", ".").replace(/[$%]/g, "");
  const f = t.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
  if (f) return Number(f[1]) / Number(f[2]);
  return t === "" ? NaN : Number(t);
}
const normTexte = (s) => String(s).toLowerCase().replace(/[’']/g, "'").replace(/[.,;:!?«»"()]/g, " ")
  .replace(/^\s*(le|la|les|l'|un|une|des|the|a|an)\s+/, "").replace(/\s+/g, " ").trim();
// Correction locale (sans IA). Pour une question ouverte, l'IA tranche ensuite si ça ne correspond pas.
// Tolérance : accents, majuscules, tirets, et « s » final manquant ou en trop (ex. « Etats Uni » = « États-Unis »).
const formeSouple = (x) => sansAccents(normTexte(x)).replace(/[^a-z0-9]+/g, " ").trim().split(" ").map((m) => (m.length > 3 ? m.replace(/s$/, "") : m)).join(" ");
// Distance d'édition (nombre de lettres à changer) pour repérer une petite faute de frappe.
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// Vérifie une réponse. souple = accepter les fautes d'orthographe (partout sauf en français).
// Renvoie { ok, orthographe } : orthographe = la bonne écriture quand la réponse est acceptée malgré une faute.
function correspondance(q, rep, souple = false) {
  if (rep == null || String(rep).trim() === "") return { ok: false };
  if (estChoix(q) || q.type === "ordre" || q.type === "carte") return { ok: rep === q.reponse };
  const a = normaliserNombre(rep), b = normaliserNombre(q.reponse);
  if (!Number.isNaN(a) && !Number.isNaN(b)) return { ok: Math.abs(a - b) <= Math.max(Number(q.tolerance) || 0, 1e-9) };
  if (q.type === "numerique") return { ok: false };
  const sansEsp = (x) => normTexte(x).replace(/\s+/g, "");
  const attendues = [q.reponse, ...(q.reponses_acceptees || [])];
  if (attendues.map(normTexte).includes(normTexte(rep)) || attendues.map(sansEsp).includes(sansEsp(rep))) return { ok: true };
  if (!souple) return { ok: false };
  const r = formeSouple(rep);
  for (const att of attendues) {
    const f = formeSouple(att);
    const tolerance = f.length >= 9 ? 2 : f.length >= 5 ? 1 : 0; // mots courts : pas de faute de frappe (Mali ≠ Bali)
    if (f === r || (tolerance && distance(f, r) <= tolerance)) return { ok: true, orthographe: att === q.reponse || !q.reponse ? att : q.reponse };
  }
  return { ok: false };
}
const estCorrectLocal = (q, rep, souple = false) => correspondance(q, rep, souple).ok;
// Indice (bouton ⓘ) : partout sauf en français et en maths. Celui de la question, sinon une piste générale.
// Indice (bouton ⓘ), pour toutes les matières : celui de la question, sinon une piste légère.
// En maths : la notion à utiliser et un petit exemple résolu (avec d'autres nombres). En français : la règle à appliquer.
const INDICES_MATHS = [
  [/[ée]quation|r[ée]sou|isole|inconnue|vaut x|valeur de x/, "Notion : une équation est une balance, fais la même opération des deux côtés pour isoler x. Exemple : 3x + 4 = 19 → 3x = 15 → x = 5."],
  [/distribu|d[ée]velopp/, "Notion : distributivité, multiplie le nombre devant la parenthèse par CHAQUE terme. Exemple : 4(x − 2) = 4x − 8."],
  [/r[ée]dui|semblable/, "Notion : on regroupe seulement les termes semblables (même lettre). Exemple : 5y + 3 + 2y − 1 = 7y + 2."],
  [/probl[eè]me|traduis|double|triple|forfait|de plus que|de moins que/, "Notion : choisis une lettre pour l'inconnue et traduis chaque mot en symbole. Exemple : « le triple d'un nombre diminué de 2 » → 3x − 2."],
  [/expression|si [a-z] =|remplace|coefficient|variable|constante/, "Notion : remplace la lettre par sa valeur, puis respecte la priorité des opérations. Exemple : si a = 3, 2a + 5 = 2 × 3 + 5 = 11."],
  [/[ée]quivalent/, "Notion : fractions équivalentes, multiplie (ou divise) le numérateur ET le dénominateur par le même nombre. Exemple : 2/5 = 6/15."],
  [/simplifi|irr[ée]ductible/, "Notion : divise le haut et le bas par leur plus grand diviseur commun. Exemple : 12/18 = 2/3 (÷ 6)."],
  [/fraction|\d+\/\d+/, "Notion : pour additionner des fractions, mets-les sur le même dénominateur. Exemple : 1/2 + 1/3 = 3/6 + 2/6 = 5/6."],
  [/priorit|parenth|exposant/, "Notion : priorité des opérations : parenthèses, exposants, × et ÷, puis + et −. Exemple : 10 − 2 × 3 = 10 − 6 = 4."],
  [/pourcent|%/, "Notion : x % d'un nombre = nombre × x ÷ 100. Exemple : 15 % de 40 = 40 × 0,15 = 6."],
  [/aire|p[ée]rim[eè]tre/, "Notion : périmètre = le tour; aire = la surface (rectangle : longueur × largeur). Exemple : rectangle de 5 sur 2 → P = 14, A = 10."],
  [/volume/, "Notion : volume d'un prisme = aire de la base × hauteur. Exemple : boîte de 2 × 5 × 3 = 30 cm³."],
  [/pythagore|hypot[ée]nuse|triangle rectangle/, "Notion : a² + b² = c², où c est l'hypoténuse. Exemple : 6² + 8² = 100 → c = 10."],
  [/probabilit|d[ée] |pi[eè]ce de monnaie/, "Notion : probabilité = cas favorables ÷ cas possibles. Exemple : tirer une bille rouge parmi 2 rouges et 3 bleues = 2/5."],
  [/moyenne|m[ée]diane|mode |statisti/, "Notion : moyenne = somme des valeurs ÷ nombre de valeurs. Exemple : (3 + 5 + 10) ÷ 3 = 6."],
  [/proportion|taux|rapport|r[eè]gle de trois|vitesse/, "Notion : règle de trois (produit croisé). Exemple : 3 cahiers coûtent 6 $, donc 5 cahiers coûtent 5 × 6 ÷ 3 = 10 $."],
  [/d[ée]cimal|virgule/, "Notion : aligne les virgules avant d'additionner ou de soustraire. Exemple : 3,4 + 1,25 = 4,65."],
  [/entier|n[ée]gatif|relatif/, "Notion : deux signes pareils donnent +, deux signes différents donnent −. Exemple : (−3) × (−4) = 12; (−3) × 4 = −12."],
];
function indiceDe(q, matiere) {
  if (q.indice) return q.indice;
  const m = matiere || "";
  if (/math/i.test(m)) {
    const t = `${q.notion || ""} ${q.enonce || ""}`.toLowerCase();
    const trouve = INDICES_MATHS.find(([re]) => re.test(t));
    return trouve ? trouve[1] : `Notion : ${q.notion || "relis la règle vue en classe"}. Écris les données de l'énoncé, puis applique la règle étape par étape.`;
  }
  if (/fran/i.test(m)) return q.notion ? `Pense à la règle : « ${q.notion} ». Repère le mot qui commande l'accord ou le choix, puis relis toute la phrase.` : "Repère le mot qui commande l'accord ou le choix, puis relis toute la phrase.";
  if (q.type === "vrai_faux") return "Lis l'affirmation mot par mot : un seul détail peut la rendre fausse.";
  if (q.type === "ordre") return "Trouve d'abord le premier élément (le plus ancien ou le plus grand), puis avance pas à pas.";
  if (q.type === "carte") return "Repère d'abord le bon continent, puis aide-toi des pays voisins et des mers.";
  if (q.type === "ouverte" && q.reponse && !/^[\d\s.,−-]+$/.test(q.reponse)) return `La réponse commence par « ${String(q.reponse).slice(0, 2)}… » (${String(q.reponse).replace(/[^\p{L}\d]/gu, "").length} lettres).`;
  if (q.type === "numerique") return "Note les données de l'énoncé et la règle à appliquer avant de calculer.";
  return q.notion ? `Pense à la notion « ${q.notion} » et élimine d'abord les réponses impossibles.` : "Élimine d'abord les réponses impossibles.";
}
const estMathsM = (m) => /math/i.test(m || "");
// En maths, une question ouverte demande le calcul + un résultat final.
const avecCalcul = (z, q) => estMathsM(z.matiere) && (q.type === "numerique" || q.type === "ouverte");
// Corrige une liste de réponses. Sensei reçoit en un seul appel : les réponses écrites douteuses
// et, en maths, toutes les réponses accompagnées d'un calcul (le calcul compte dans la note).
async function corrigerTout(z, indices) {
  const aDemander = [];
  for (const i of indices) {
    if (z.triches?.[i]) continue; // changement d'onglet : déjà comptée fausse
    const q = z.questions[i], rep = z.reponses[i], calcul = z.calculs?.[i] || "";
    const { ok, orthographe = "" } = correspondance(q, rep, !/fran/i.test(z.matiere || "")); // en français, l'orthographe exacte compte
    z.resultats[i] = { ok, points: ok ? 1 : 0, commentaire: "", orthographe };
    if (!etat.status.ia || rep == null || !String(rep).trim()) continue;
    if ((avecCalcul(z, q) && calcul.trim()) || (!ok && q.type === "ouverte")) aDemander.push(i);
  }
  if (aDemander.length) {
    try {
      const r = await api(`/profils/${etat.profil.id}/corriger`, {
        method: "POST",
        body: { matiere: z.matiere, items: aDemander.map((i) => ({ enonce: z.questions[i].enonce, reponse: z.questions[i].reponse, reponses_acceptees: z.questions[i].reponses_acceptees, reponse_eleve: z.reponses[i], calcul: z.calculs?.[i] || "" })) },
      });
      aDemander.forEach((i, k) => {
        const x = r.resultats[k];
        if (!x) return;
        const points = typeof x.points === "number" ? x.points : x.correct ? 1 : 0;
        z.resultats[i] = { ok: points >= 1, points, commentaire: x.commentaire || "" };
      });
    } catch (e) { toast("Correction automatique impossible : " + e.message, true); }
  }
}
// Pendant le test, la date entre parenthèses est cachée (sinon la frise se résout toute seule); elle réapparaît dans la correction.
const sansDate = (el) => String(el).replace(/\s*\([^)]*\d[^)]*\)\s*$/, "");
// Charge une carte muette cliquable (SVG généré par le serveur) et signale le pays touché.
async function chargerCarteInteractive(zone, url, auChoix) {
  if (!zone || !estUrlImage(url)) return;
  try {
    const svg = await fetch(url).then((r) => r.text());
    if (!/^<svg[\s>]/.test(svg.trim())) throw new Error();
    zone.innerHTML = svg;
    zone.addEventListener("click", (e) => { const el = e.target.closest("[data-nom]"); if (el) auChoix(el.dataset.nom); });
  } catch { zone.innerHTML = `<p class="ko">Impossible de charger la carte.</p>`; }
}
const fmtPoints = (x) => String(Math.round(x * 10) / 10).replace(".", ",");

// ================= Quiz (révision et test final) =================
function demarrerQuiz({ type, questions, matiere, sujet, sources, photo = false }) {
  if (!questions?.length) { toast("Aucune question reçue, réessaie.", true); return; }
  const reg = reglagesDe(etat.profil);
  etat.quiz = {
    type, matiere, sujet, sources, reg, photo, i: 0, reponses: [], calculs: [], resultats: [], indices: [], triches: [],
    questions: questions.map((q) => ({ ...q, choix: q.type === "qcm" ? melange(q.choix) : q.choix, melanges: q.type === "ordre" ? melange(q.elements) : [] })),
  };
  afficherQuestion();
}

function etatQuestion(z) {
  const q = z.questions[z.i];
  return {
    phase: "question", profil: { nom: etat.profil.nom, avatar: etat.profil.avatar },
    quiz: { type: z.type, sujet: z.sujet, i: z.i, n: z.questions.length },
    question: { type: q.type, choix: estChoix(q) ? q.choix : [], elements: q.melanges || [], audio: !!q.audio, calcul: avecCalcul(z, q), carte_url: q.type === "carte" ? q.carte_url : "", indice: indiceDe(q, z.matiere) },
    restantMs: resteMs(),
  };
}

function afficherQuestion() {
  const z = etat.quiz, q = z.questions[z.i], n = z.questions.length;
  const lettres = "ABCDEFGH";
  const langue = langueDe(z.matiere);
  const frise = q.type === "ordre";
  const positionner = q.type === "carte";
  const ouverte = !estChoix(q) && !frise && !positionner;
  const calcul = avecCalcul(z, q);
  const duree = z.reg.minuteur ? (ouverte || frise || positionner ? z.reg.secondesOuvertes : z.reg.secondesChoix) * 1000 : 0;
  let repondue = false, ordreChoisi = [], choixCarte = null;
  const indice = indiceDe(q, z.matiere);
  const montrerIndice = () => {
    if (!indice || $("#zone-indice")?.innerHTML) return;
    z.indices[z.i] = true;
    $("#zone-indice").innerHTML = `<div class="bloc-indice">💡 <strong>Indice :</strong> ${esc(indice)}</div>`;
    $("#btn-indice")?.classList.add("utilise");
  };
  const libType = positionner ? "📍 positionner sur la carte" : frise ? "🧭 frise chronologique" : calcul ? "🧮 calcul + résultat" : ouverte ? "✍️ question ouverte" : "🔘 choix";

  app.innerHTML = `
    <div class="progression"><div style="width:${(z.i / n) * 100}%"></div></div>
    ${duree ? `<div id="minuteur" class="minuteur"><span class="sec"></span><div class="jauge"><div></div></div></div>` : ""}
    <div class="panel ${z.type === "final" ? "" : "trame"}">
      <span class="etiquette">${z.type === "final" ? "EXAMEN" : "RÉVISION"} · ${esc(z.sujet)}</span>
      <div class="question-num">Question ${z.i + 1} / ${n} · ${esc(q.difficulte || "")} · ${libType}</div>
      <p class="enonce">${esc(q.enonce)}${indice ? ` <button type="button" class="btn-indice" id="btn-indice" title="Un indice ?" aria-label="Afficher un indice">i</button>` : ""}</p>
      <div id="zone-indice"></div>
      ${imageQuestion(q)}
      ${q.audio ? `<button class="btn bleu petit" data-dire="${esc(q.audio)}" data-langue="${langue}">🔊 Écouter</button>` : ""}
      ${positionner ? `
        <div class="carte-interactive" id="carte-int"><p class="aide">Chargement de la carte…</p></div>
        <div class="actions"><span class="aide" id="carte-sel">👆 Touche le bon endroit sur la carte.</span><button class="btn rouge" id="carte-ok" disabled>Valider</button></div>`
      : frise ? `
        <p class="aide">Clique les éléments dans l'ordre, du plus ancien au plus récent.</p>
        <ol class="frise-reponse" id="frise-rep"></ol>
        <div class="frise-choix">${q.melanges.map((el) => `<button type="button" data-el="${esc(el)}">${esc(sansDate(el))}</button>`).join("")}</div>
        <div class="actions"><button class="btn blanc petit" id="frise-annuler">↩ Retirer le dernier</button><button class="btn rouge" id="frise-ok" disabled>Valider ma frise</button></div>`
      : calcul ? `
        <form id="f-ouv">
          <label for="calc">🧮 Ton calcul (écris toutes tes étapes)</label>
          <textarea id="calc" class="zone-calcul" rows="4" placeholder="ex.&#10;2x + 3 = 11&#10;2x = 11 − 3 = 8&#10;x = 8 ÷ 2"></textarea>
          <label for="rep-ouv">✅ Résultat final</label>
          <div class="actions" style="align-items:stretch;margin-top:0"><input id="rep-ouv" class="champ-resultat" ${q.type === "numerique" ? 'inputmode="decimal"' : ""} placeholder="Ta réponse finale" style="flex:1;min-width:160px" autocomplete="off"><button class="btn rouge">Valider</button></div>
          <p class="aide">Ton calcul compte dans la note : un bon résultat sans démarche valable ne vaut que ½ point.</p>
        </form>`
      : ouverte ? `<form id="f-ouv" class="actions" style="align-items:stretch"><input id="rep-ouv" ${q.type === "numerique" ? 'inputmode="decimal" placeholder="Ta réponse (nombre)"' : 'placeholder="Écris ta réponse"'} style="flex:1;min-width:160px" autocomplete="off"><button class="btn rouge">Valider</button></form>`
      : `<div class="choix">${q.choix.map((c, k) => `<button data-c="${esc(c)}"><span class="lettre">${lettres[k]}</span><span>${esc(c)}</span></button>`).join("")}</div>`}
      <div id="feedback"></div>
    </div>
    <div class="actions">
      <button class="btn blanc petit" id="abandon">✖ Abandonner</button>
      ${sync.actif ? `<span class="aide" data-sync-statut></span>` : ""}
    </div>`;
  majSyncUI();
  const champ = $("#rep-ouv"), zoneCalc = $("#calc");
  if (!estMobile()) (zoneCalc || champ)?.focus();

  // --- Frise : on clique les éléments dans l'ordre ---
  const majFrise = () => {
    if (!frise) return;
    $("#frise-rep").innerHTML = ordreChoisi.map((el) => `<li>${esc(sansDate(el))}</li>`).join("") || `<li class="vide">Ta frise est vide</li>`;
    app.querySelectorAll(".frise-choix button").forEach((b) => (b.disabled = repondue || ordreChoisi.includes(b.dataset.el)));
    $("#frise-ok").disabled = repondue || ordreChoisi.length !== q.melanges.length;
  };
  if (frise) {
    app.querySelectorAll(".frise-choix button").forEach((b) => b.addEventListener("click", () => { ordreChoisi.push(b.dataset.el); majFrise(); }));
    $("#frise-annuler").addEventListener("click", () => { ordreChoisi.pop(); majFrise(); });
    $("#frise-ok").addEventListener("click", () => repondre(ordreChoisi.join(" → ")));
    majFrise();
  }

  // --- Positionner : on touche le pays sur une carte muette cliquable ---
  const choisirPays = (nomPays) => {
    if (repondue || !positionner) return;
    choixCarte = nomPays || null;
    app.querySelectorAll("#carte-int [data-nom]").forEach((el) => el.classList.toggle("choisie", el.dataset.nom === choixCarte));
    $("#carte-sel").innerHTML = choixCarte ? `Ta sélection : <strong>${esc(choixCarte)}</strong>` : "👆 Touche le bon endroit sur la carte.";
    $("#carte-ok").disabled = !choixCarte;
  };
  if (positionner) {
    chargerCarteInteractive($("#carte-int"), q.carte_url, choisirPays);
    $("#carte-ok").addEventListener("click", () => choixCarte && repondre(choixCarte));
  }

  const suivante = () => { surOnglet = null; z.i++; z.i < n ? afficherQuestion() : terminerQuiz(); };

  // --- Anti-triche : quitter l'onglet pendant une question = réponse fausse, puis question suivante ---
  let horsOnglet = false;
  surOnglet = (visibilite) => {
    if (etat.quiz !== z || !$("#feedback")) return (surOnglet = null);
    if (visibilite === "hidden") {
      if (repondue) return;
      repondue = horsOnglet = true;
      arreterMinuteur();
      z.reponses[z.i] = null; z.calculs[z.i] = ""; z.triches[z.i] = true;
      z.resultats[z.i] = { ok: false, points: 0, commentaire: "Changement d'onglet pendant la question : l'aide externe n'est pas permise, la réponse est comptée fausse.", orthographe: "" };
      sync.envoyer({ ...etatQuestion(z), phase: "envoye", restantMs: null });
    } else if (horsOnglet) {
      horsOnglet = false;
      popupTriche(suivante);
    }
  };

  const repondre = async (rep, tempsEcoule = false, calculTel = null) => {
    if (repondue) return;
    repondue = true;
    arreterMinuteur();
    z.reponses[z.i] = rep;
    z.calculs[z.i] = calculTel ?? zoneCalc?.value ?? "";
    if (z.type === "final") {
      sync.envoyer({ ...etatQuestion(z), phase: "envoye", restantMs: null });
      return setTimeout(suivante, tempsEcoule ? 900 : 250);
    }
    app.querySelectorAll(".choix button, .frise-choix button, #frise-ok, #frise-annuler, #carte-ok").forEach((b) => (b.disabled = true));
    const f = $("#f-ouv"); if (f) f.querySelectorAll("input,button,textarea").forEach((x) => (x.disabled = true));
    if ((ouverte || calcul) && rep && etat.status.ia) {
      $("#feedback").innerHTML = `<p class="aide">Sensei corrige ta réponse${calcul ? " et ton calcul" : ""}…</p>`;
      sync.envoyer({ ...etatQuestion(z), phase: "correction", restantMs: null });
    }
    await corrigerTout(z, [z.i]);
    const { ok, points, commentaire, orthographe } = z.resultats[z.i];
    app.querySelectorAll(".choix button").forEach((b) => {
      if (b.dataset.c === q.reponse) b.classList.add("bon");
      else if (b.dataset.c === rep) b.classList.add("mauvais");
    });
    if (positionner) app.querySelectorAll("#carte-int [data-nom]").forEach((el) => { el.classList.toggle("bonne", el.dataset.nom === q.reponse); el.classList.toggle("mauvaise", !ok && el.dataset.nom === rep); });
    const demi = !ok && points > 0;
    const cris = tempsEcoule ? ["TEMPS ÉCOULÉ !"] : ok ? ["SUGOI !", "BRAVO !", "PARFAIT !", "YATTA !"] : demi ? ["PRESQUE !"] : ["OUPS !", "COURAGE !"];
    const cri = cris[Math.floor(Math.random() * cris.length)];
    $("#feedback").innerHTML = `
      <div class="feedback">
        <div class="eclat ${ok ? "" : "rate"}">${cri}</div>
        <div class="texte">
          ${detailCorrection(detailDe(q, rep, ok, commentaire, { calcul: z.calculs[z.i], points, orthographe: z.resultats[z.i].orthographe, indice_vu: z.indices[z.i] }), { sansEnonce: true })}
          <button class="btn" id="suivant">${z.i + 1 < n ? "Question suivante ▶" : "Voir mon résultat ▶"}</button>
        </div>
      </div>`;
    $("#suivant").focus();
    $("#suivant").addEventListener("click", suivante);
    sync.envoyer({ ...etatQuestion(z), phase: "feedback", restantMs: null, feedback: { ok, cri, bonne: q.reponse, commentaire: orthographe ? `✏️ Attention à l'orthographe : on écrit « ${orthographe} ». ${commentaire || ""}` : commentaire, points, dernier: z.i + 1 >= n } });
  };

  app.querySelectorAll(".choix button").forEach((b) => b.addEventListener("click", () => repondre(b.dataset.c)));
  const f = $("#f-ouv");
  if (f) f.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#rep-ouv").value;
    if (!v.trim()) return toast(calcul ? "Écris ton résultat final." : "Écris ta réponse.", true);
    repondre(v);
  });
  $("#abandon").addEventListener("click", () => { if (confirm("Abandonner ? Ce quiz ne sera pas enregistré.")) location.hash = "#/profil/" + etat.profil.id; });
  $("#btn-indice")?.addEventListener("click", montrerIndice);

  // Actions reçues du téléphone
  sync.surAction = (a) => {
    if (a.type === "selection") {
      if (positionner) choisirPays(a.valeur);
      else if (frise) { ordreChoisi = Array.isArray(a.ordre) ? a.ordre.filter((x) => q.melanges.includes(x)) : []; majFrise(); }
      else if (ouverte) { if (champ) champ.value = a.valeur || ""; if (zoneCalc && a.calcul != null) zoneCalc.value = a.calcul; }
      else app.querySelectorAll(".choix button").forEach((b) => b.classList.toggle("choisi", b.dataset.c === a.valeur));
    } else if (a.type === "reponse") repondre(a.valeur, false, a.calcul ?? null);
    else if (a.type === "suivant" && repondue && $("#suivant")) suivante();
    else if (a.type === "audio" && q.audio) parler(q.audio, langue);
    else if (a.type === "indice") montrerIndice();
  };

  if (duree) lancerMinuteur(duree, () => repondre(positionner ? choixCarte : frise && ordreChoisi.length ? ordreChoisi.join(" → ") : champ?.value.trim() || null, true));
  sync.envoyer(etatQuestion(z));
  if (q.audio) setTimeout(() => parler(q.audio, langue), 400);
}


// Détecteur de changement d'onglet (actif seulement pendant une question).
let surOnglet = null;
document.addEventListener("visibilitychange", () => surOnglet?.(document.visibilityState));
function popupTriche(ensuite) {
  const fond = document.createElement("div");
  fond.className = "modal-fond";
  fond.id = "popup-triche";
  fond.innerHTML = `
    <div class="modal panel popup-triche" role="alertdialog" aria-modal="true" aria-labelledby="triche-titre">
      <span class="etiquette rouge">🚫 STOP</span>
      <h2 id="triche-titre">Tu as changé d'onglet !</h2>
      <p>L'aide externe (internet, autre onglet, autre application) n'est <strong>pas permise</strong> pendant la révision et l'examen.</p>
      <p>La réponse à cette question est donc <strong>comptée comme fausse</strong> et on passe à la question suivante.</p>
      <div class="actions"><button type="button" class="btn rouge" id="triche-ok">J'ai compris ▶</button></div>
    </div>`;
  document.body.appendChild(fond);
  document.body.classList.add("modal-ouvert");
  if (navigator.vibrate) navigator.vibrate([80, 60, 80]);
  const fermer = () => { fond.remove(); document.body.classList.remove("modal-ouvert"); ensuite(); };
  fond.querySelector("#triche-ok").addEventListener("click", fermer, { once: true });
  fond.querySelector("#triche-ok").focus();
}

async function terminerQuiz() {
  const z = etat.quiz, p = etat.profil;
  surOnglet = null;
  arreterMinuteur();
  sync.surAction = null;
  if (z.type === "final") {
    const nbOuv = z.questions.filter((q, i) => (q.type === "ouverte" || avecCalcul(z, q)) && z.reponses[i]).length;
    if (nbOuv && etat.status.ia) chargement("Sensei corrige ton examen…", ["Il lit tes réponses écrites…", "Il vérifie tes calculs ligne par ligne…", "Il prépare ton corrigé…"]);
    sync.envoyer({ phase: "correction", profil: { nom: p.nom, avatar: p.avatar } });
    await corrigerTout(z, z.questions.map((_, i) => i));
    finChargement();
  }
  const res = z.questions.map((q, i) => ({ q, rep: z.reponses[i], calcul: z.calculs[i] || "", indice_vu: !!z.indices[i], triche: !!z.triches?.[i], ...z.resultats[i] }));
  const score = res.reduce((a, r) => a + (r.points ?? (r.ok ? 1 : 0)), 0), total = res.length; // demi-points possibles en maths
  const pct = Math.round((score / total) * 100);
  const erreurs = [...new Set(res.filter((r) => !r.ok).map((r) => r.q.notion))];
  let enregistre;
  try {
    enregistre = await api(`/profils/${p.id}/resultats`, { method: "POST", body: { type: z.type, matiere: z.matiere, sujet: z.sujet, score, total, erreurs, photo: z.photo, details: res.map((x) => detailDe(x.q, x.rep, x.ok, x.commentaire, { calcul: x.calcul, points: x.points, orthographe: x.orthographe, indice_vu: x.indice_vu, triche: x.triche })) } });
    etat.profil = enregistre.profil;
  } catch (e) { toast("Résultat non enregistré : " + e.message, true); }
  if (z.type === "revision") sessionStorage.setItem("dejaVues", JSON.stringify(z.questions.map((q) => q.enonce)));

  const r = rang(pct);
  sync.envoyer({ phase: "fin", profil: { nom: p.nom, avatar: p.avatar }, resultat: { pct, score, total, rang: r, type: z.type } });
  const message = pct >= 90 ? "Tu es prêt(e) pour l'examen, champion(ne) !" : pct >= 70 ? "Très bon travail ! Encore une petite révision des points faibles." : pct >= 60 ? "Réussi ! Mais on peut faire mieux — révise les notions ratées." : "Pas de panique : chaque héros perd des combats avant de gagner. On révise encore !";
  app.innerHTML = `
    <div class="panel">
      <span class="etiquette">${z.type === "final" ? "RÉSULTAT DE L'EXAMEN" : "FIN DE LA RÉVISION"}</span>
      <div class="resultat-top">
        <div class="rang ${r}">${r}</div>
        <div>
          <div class="gros-score">${pct} %</div>
          <div><strong>${fmtPoints(score)} / ${total}</strong> points</div>
          ${enregistre ? `<div>Résultat enregistré dans ton historique 💾</div>` : ""}
        </div>
      </div>
      <div style="margin-top:18px">${senseiDit(esc(message), pct >= 60 ? "joie" : "triste")}</div>
      ${erreurs.length ? `<p><strong>Notions à retravailler :</strong> ${erreurs.map(esc).join(", ")}</p>` : ""}
      <div class="actions">
        ${z.photo ? `<a class="btn rouge" href="#/profil/${p.id}/photo">📸 Mes leçons en photo</a>` : `
        <a class="btn bleu" href="#/profil/${p.id}/test">⚔️ Retour aux révisions et à l'historique</a>
        <a class="btn rouge" href="#/profil/${p.id}/lecon">📖 Revoir la leçon</a>`}
        <a class="btn blanc" href="#/">🏠 Accueil</a>
      </div>
    </div>
    <div class="panel"><span class="etiquette">${z.type === "final" ? "CORRIGÉ DÉTAILLÉ" : "TES RÉPONSES ET LES CORRECTIONS"}</span>
      <p class="aide">Tu pourras revoir cette évaluation quand tu veux dans l'onglet ⚔️ Révision (bouton 👁 Revoir).</p>
      ${res.map((x, i) => detailCorrection(detailDe(x.q, x.rep, x.ok, x.commentaire, { calcul: x.calcul, points: x.points, orthographe: x.orthographe, indice_vu: x.indice_vu, triche: x.triche }), { numero: i + 1 })).join("")}
    </div>
    ${sourcesHTML(z.sources)}`;
}
// ---------- Correction détaillée (révision, examen, et « Revoir mon évaluation ») ----------
function pourquoiFaux(q, rep) {
  if (rep == null) return "";
  return (q.explications_choix || []).find((e) => e.choix === rep)?.pourquoi || "";
}
// Ce qu'on garde de chaque question pour la revoir plus tard.
function detailDe(q, rep, ok, commentaire = "", { calcul = "", points = null, orthographe = "", indice_vu = false, triche = false } = {}) {
  return {
    enonce: q.enonce, type: q.type, choix: q.choix || [], reponse: q.reponse, reponse_eleve: rep ?? null, ok: !!ok,
    explication: q.explication || "", demarche: q.demarche || "", pourquoi: ok ? "" : pourquoiFaux(q, rep), commentaire: commentaire || "", notion: q.notion || "",
    calcul: calcul || "", points: points ?? (ok ? 1 : 0), elements: q.type === "ordre" ? q.elements || [] : [], image_svg: q.image_svg || "", image_url: q.image_url || "", correction_url: q.correction_url || "", orthographe: ok ? orthographe || "" : "", indice_vu: !!indice_vu, triche: !!triche,
  };
}
function detailCorrection(d, { numero = null, sansEnonce = false } = {}) {
  const repEleve = d.reponse_eleve == null || String(d.reponse_eleve).trim() === "" ? "⏱ pas de réponse (temps écoulé)" : d.reponse_eleve;
  const demi = !d.ok && d.points > 0;
  const friseEleve = d.type === "ordre" && d.reponse_eleve ? String(d.reponse_eleve).split(" → ") : [];
  return `<div class="correction ${d.ok ? "juste" : demi ? "demi" : "faux"}">
    ${sansEnonce ? "" : `<p class="q-enonce"><strong>${numero ? numero + ". " : ""}${esc(d.enonce)}</strong> <span class="badge-points">${fmtPoints(d.points ?? (d.ok ? 1 : 0))} / 1 pt</span></p>${imageQuestion(d)}`}
    ${d.type === "ordre" ? `<div class="deux frises-comparees">
        <div><span class="aide">Ta frise :</span><ol class="frise-reponse">${friseEleve.map((el, k) => `<li class="${el === d.elements[k] ? "bon" : "mauvais"}">${esc(el)}</li>`).join("") || "<li>—</li>"}</ol></div>
        <div><span class="aide">Bon ordre :</span><ol class="frise-reponse">${d.elements.map((el) => `<li class="bon">${esc(el)}</li>`).join("")}</ol></div>
      </div>` : ""}
    ${d.calcul ? `<div class="bloc-calcul"><strong>🧮 Ton calcul :</strong><div class="pre">${esc(d.calcul)}</div></div>` : ""}
    ${demi ? `<div class="bloc-demi">½ point : ${d.reponse_eleve != null && String(d.reponse_eleve) && normaliserNombre(d.reponse_eleve) === normaliserNombre(d.reponse) ? "ton résultat est juste, mais ton calcul n'est pas complet ou contient une erreur." : "ta démarche est bonne, mais une erreur de calcul fausse le résultat."}</div>` : ""}
    ${!sansEnonce && d.choix?.length > 2 ? `<ul class="choix-revus">${d.choix.map((c) => `<li class="${c === d.reponse ? "bon" : c === d.reponse_eleve ? "mauvais" : ""}">${esc(c)}${c === d.reponse ? " ✔" : c === d.reponse_eleve ? " ✘" : ""}</li>`).join("")}</ul>` : ""}
    <div class="lignes-rep" ${d.type === "ordre" ? 'hidden' : ""}>
      <div><span class="aide">${d.calcul ? "Ton résultat final" : "Ta réponse"} :</span> <strong class="${d.ok ? "ok" : "ko"}">${d.ok ? "✔" : "✘"} ${esc(repEleve)}</strong></div>
      ${d.ok ? "" : `<div><span class="aide">Bonne réponse :</span> <strong class="ok">${esc(d.reponse)}</strong></div>`}
    </div>
    ${d.ok && d.orthographe ? `<div class="bloc-ortho">✏️ <strong>Réponse acceptée</strong>, mais attention à l'orthographe : on écrit <strong>« ${esc(d.orthographe)} »</strong>${d.reponse_eleve ? ` (tu as écrit « ${esc(d.reponse_eleve)} »)` : ""}.</div>` : ""}
    ${d.indice_vu ? `<div class="aide">💡 Indice utilisé pour cette question.</div>` : ""}
    ${d.triche ? `<div class="bloc-triche">🚫 <strong>Changement d'onglet détecté</strong> : l'aide externe n'est pas permise, la réponse a été comptée fausse.</div>` : ""}
    ${!d.ok && d.correction_url ? `<div class="bloc-carte-correction"><strong>📍 La bonne réponse (${esc(d.reponse)}), en rouge sur la carte :</strong>${imageSiteHTML(d.correction_url, "Carte de correction")}</div>` : ""}
    ${!d.ok && d.pourquoi ? `<div class="bloc-faux"><strong>❌ Pourquoi ta réponse est fausse :</strong> ${esc(d.pourquoi)}</div>` : ""}
    ${d.commentaire ? `<div class="bloc-faux"><strong>💬 Sensei :</strong> ${esc(d.commentaire)}</div>` : ""}
    ${d.explication ? `<div class="bloc-expl"><strong>💡 ${d.ok ? "Pourquoi c'est juste" : "La bonne explication"} :</strong> <span class="pre">${esc(d.explication)}</span></div>` : ""}
    ${d.demarche ? (d.ok
      ? `<details class="bloc-demarche"><summary>🧮 Voir la démarche détaillée</summary><div class="pre">${esc(d.demarche)}</div></details>`
      : `<div class="bloc-demarche"><strong>🧮 Démarche détaillée, étape par étape :</strong><div class="pre">${esc(d.demarche)}</div></div>`) : ""}
  </div>`;
}

const sourcesHTML = (sources) => sources?.length ? `<div class="panel sources"><span class="etiquette">SOURCES CONSULTÉES</span>
  <ul class="liste-manga">${sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.titre)}</a></li>`).join("")}</ul></div>` : "";

// Prévient le téléphone qu'un quiz est prêt; il peut le lancer à distance (un bouton par choix).
function phasePret(p, titre, choix, lancer) {
  sync.envoyer({ phase: "pret", profil: { nom: p.nom, avatar: p.avatar }, titre, choix });
  sync.surAction = (a) => { if (a.type === "commencer") lancer(a.choix || choix[0]?.id); };
}

// Demande au serveur de préparer en arrière-plan (leçon ou test final) : ne bloque jamais l'élève.
function prechauffer(p, quoi) {
  if (!etat.status.ia || !p.matiere || !p.sujet) return;
  let dejaVues = [];
  try { dejaVues = JSON.parse(sessionStorage.getItem("dejaVues") || "[]"); } catch {}
  fetch(`/api/profils/${p.id}/prechauffer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quoi, matiere: p.matiere, sujet: p.sujet, dejaVues }) }).catch(() => {});
}

// Historique d'une leçon : combien de fois faite, quand, et chaque test avec son score.
function historiqueLecon(p, matiere, lecon) {
  const ici = p.sessions.filter((s) => s.matiere === matiere && s.sujet === lecon && !s.photo);
  return { lecons: ici.filter((s) => s.type === "lecon"), tests: ici.filter((s) => s.type !== "lecon") };
}
function resumeLecon(p, matiere, lecon) {
  const { lecons, tests } = historiqueLecon(p, matiere, lecon);
  const l = lecons.length ? `📖 Leçon faite <strong>${lecons.length}×</strong> (dernière fois le ${fmtDate(lecons.at(-1).date)})` : "📖 Leçon pas encore faite";
  const t = tests.length ? `⚔️ <strong>${tests.length}</strong> révision${tests.length > 1 ? "s" : ""} et examen${tests.length > 1 ? "s" : ""} (dernier : ${tests.at(-1).pourcentage} %)` : "⚔️ aucune révision";
  return `${l} · ${t}`;
}

const ONGLETS_LECON = [["lecon", "📖 Leçon"], ["test", "⚔️ Révision"], ["photo", "📸 Photo"]];

// Page d'une leçon : 3 onglets.
async function ecranLecon(id, onglet) {
  const p = etat.profil?.id === id ? etat.profil : await chargerProfil(id);
  if (!p.matiere || (!p.sujet && onglet !== "photo")) { location.hash = "#/"; return; }
  await reprendreSync(p);
  app.innerHTML = `
    ${bandeauDemo()}
    <div class="panel noir entete-lecon">
      <span class="etiquette">${esc(p.matiere.toUpperCase())}</span>
      <h1 style="color:var(--jaune)">${esc(p.sujet || "Leçon en photo")}</h1>
      <p>${esc(p.annee)}${p.sujet ? " · " + resumeLecon(p, p.matiere, p.sujet) : ""}</p>
    </div>
    <nav class="onglets-lecon">${ONGLETS_LECON.map(([o, lib]) => `<a href="#/profil/${p.id}/${o}" class="${o === onglet ? "actif" : ""}">${lib}</a>`).join("")}</nav>
    <div id="contenu-onglet"></div>`;
  majSyncUI();
  const zone = $("#contenu-onglet");
  if (onglet === "test") return ongletTest(p, zone);
  if (onglet === "photo") { const o = etat.ouvrirPhoto; etat.ouvrirPhoto = null; return ongletPhoto(p, zone, o); }
  return ongletLecon(p, zone);
}

// ---------- Leçon en diapositives : on avance avec « Suivant » jusqu'à la fin ----------
function diapos(f, matiere) {
  const langue = langueDe(matiere);
  return [
    { titre: "Introduction", html: `<h2>${esc(f.titre)}</h2>${senseiDit(esc(f.intro))}<p class="aide">Lis chaque diapo, puis appuie sur <strong>Suivant ▶</strong>. Il faut aller jusqu'au bout pour débloquer la révision.</p>` },
    ...f.notions.map((n, i) => ({
      titre: `Notion ${i + 1} / ${f.notions.length}`,
      html: `<h2 class="titre-notion">${esc(n.titre)}</h2><p class="pre gros-texte">${esc(n.explication)}</p>
        ${visuelHTML(n.visuel_svg, "Schéma : " + n.titre)}${imageSiteHTML(n.visuel_url, "Carte : " + n.titre)}
        ${n.galerie?.length ? `<div class="galerie-drapeaux">${n.galerie.map((g) => `<figure ${String(g.img).startsWith("/costumes/") ? 'class="costume"' : ""}>${estUrlImage(g.img) ? `<img src="${esc(g.img)}" alt="" loading="lazy">` : ""}<figcaption>${esc(g.legende)}</figcaption></figure>`).join("")}</div>` : ""}
        ${n.tableau?.length ? `<div class="table-scroll"><table class="historique tableau-lecon"><thead><tr>${n.tableau[0].map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${n.tableau.slice(1).map((l) => `<tr>${l.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
        <div class="exemple"><strong>Exemple :</strong> ${esc(n.exemple)}</div>
        ${n.audio?.length ? `<div class="audios"><div class="aide">🎧 Écoute les exemples :</div>${n.audio.map((a) => `<button class="btn-audio" data-dire="${esc(a)}" data-langue="${langue}">🔊 ${esc(a)}</button>`).join("")}</div>` : ""}`,
    })),
    { titre: "À retenir", html: `<div class="deux"><div class="panel jaune" style="margin:0"><span class="etiquette">ASTUCES</span><ul class="liste-manga">${f.astuces.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div>
        <div class="panel" style="margin:0"><span class="etiquette">PIÈGES</span><ul class="liste-manga">${f.pieges.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div></div>` },
  ];
}
// Affiche la leçon diapo par diapo. onFin() est appelé la première fois qu'on atteint la dernière diapo.
function diaporama(zone, f, matiere, { onFin, finHTML, profil }) {
  const liste = [...diapos(f, matiere), { titre: "Bravo !", html: "", fin: true }];
  let i = 0, finAtteinte = false;
  const rendre = async () => {
    const d = liste[i], n = liste.length;
    if (d.fin && !finAtteinte) { finAtteinte = true; await onFin?.(); }
    zone.innerHTML = `
      <div class="diapo-progres"><div style="width:${((i + 1) / n) * 100}%"></div></div>
      <div class="diapo-points">${liste.map((_, k) => `<span class="${k < i ? "lu" : k === i ? "ici" : ""}"></span>`).join("")}</div>
      <div class="panel diapo ${d.fin ? "jaune" : ""}" id="diapo">
        <span class="etiquette">${esc(d.titre)}</span>
        ${d.fin ? finHTML() : d.html}
      </div>
      <div class="diapo-nav">
        <button class="btn blanc" id="d-prec" ${i === 0 ? "disabled" : ""}>◀ Précédent</button>
        <span class="diapo-compteur">${i + 1} / ${n}</span>
        ${d.fin ? "" : `<button class="btn rouge" id="d-suiv">${i === n - 2 ? "Terminer la leçon ✔" : "Suivant ▶"}</button>`}
      </div>`;
    $("#d-prec")?.addEventListener("click", () => aller(-1));
    $("#d-suiv")?.addEventListener("click", () => aller(1));
    zone.scrollIntoView({ block: "start", behavior: "smooth" });
    if (profil) sync.envoyer({ phase: "lecon", profil: { nom: profil.nom, avatar: profil.avatar }, titre: f.titre, i, n, fin: !!d.fin });
    // Glisser le doigt à gauche / à droite sur mobile
    let x0 = null;
    const el = $("#diapo");
    el.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    el.addEventListener("touchend", (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) aller(dx < 0 ? 1 : -1); x0 = null; });
  };
  const aller = (sens) => { const j = i + sens; if (j < 0 || j >= liste.length) return; i = j; rendre(); };
  const clavier = (e) => {
    if (!document.body.contains(zone)) return document.removeEventListener("keydown", clavier);
    if ($("#dico") || /input|textarea|select/i.test(document.activeElement?.tagName)) return;
    if (e.key === "ArrowRight") aller(1); else if (e.key === "ArrowLeft") aller(-1);
  };
  document.addEventListener("keydown", clavier);
  if (profil) sync.surAction = (a) => { if (a.type === "slide") aller(a.sens > 0 ? 1 : -1); else if (a.type === "allerTest") location.hash = `#/profil/${profil.id}/test`; };
  rendre();
}

// --- Onglet 1 : la leçon en diapositives (gardée en cache) ---
async function ongletLecon(p, zone, nouvelle = false) {
  zone.innerHTML = `<div class="tel-centre"><div class="sensei grand">${senseiSVG("joie")}</div><h2>Sensei prépare ta leçon…</h2>
    <p>${etat.status.ia ? "La première fois, il cherche sur internet et dessine les schémas (environ une minute). Ensuite, la leçon s'ouvre tout de suite !" : ""}</p></div>`;
  sync.envoyer({ phase: "chargement", profil: { nom: p.nom, avatar: p.avatar } });
  let data;
  try { data = await api(`/profils/${p.id}/lecon`, { method: "POST", body: { matiere: p.matiere, sujet: p.sujet, nouvelle } }); }
  catch (e) { zone.innerHTML = `<div class="panel">${senseiDit(esc(e.message), "triste")}</div>`; return; }
  if (!document.body.contains(zone)) return;
  etat.leconCourante = { cle: p.matiere + "|" + p.sujet, data };
  prechauffer(p, "final"); // le test final se prépare pendant la lecture
  diaporama(zone, data.fiche, p.matiere, {
    profil: p,
    onFin: async () => {
      try {
        const r = await api(`/profils/${p.id}/resultats`, { method: "POST", body: { type: "lecon", matiere: p.matiere, sujet: p.sujet } });
        Object.assign(p, r.profil); etat.profil = p; if (etat.moi.profil?.id === p.id) etat.moi.profil = r.profil;
        $(".entete-lecon p").innerHTML = esc(p.annee) + " · " + resumeLecon(p, p.matiere, p.sujet);
      } catch (err) { toast("Leçon non enregistrée : " + err.message, true); }
    },
    finHTML: () => `
      <div class="tel-centre">
        <div class="eclat">BRAVO !</div>
        <h2>Leçon terminée ✔</h2>
        <p>Tu as lu toute la leçon (${historiqueLecon(p, p.matiere, p.sujet).lecons.length} fois au total). La <strong>révision</strong> est débloquée !</p>
        <div class="actions" style="justify-content:center">
          <a class="btn rouge" href="#/profil/${p.id}/test">⚡ Passer à la révision</a>
          <button class="btn blanc" id="lecon-relire">↺ Relire depuis le début</button>
          ${data.demo ? "" : `<button class="btn blanc" id="lecon-nouvelle">↻ Nouvelle version</button>`}
        </div>
      </div>
      ${sourcesHTML(data.sources)}`,
  });
  zone.addEventListener("click", (e) => {
    if (e.target.id === "lecon-relire") ongletLecon(p, zone);
    if (e.target.id === "lecon-nouvelle" && confirm("Créer une nouvelle version de cette leçon ?")) ongletLecon(p, zone, true);
  });
}

// --- Onglet 2 : révision puis examen, avec l'historique et « Revoir » ---
function lignesHistorique(p, tests) {
  return tests.map((t, i) => `<tr><td>${i + 1}</td><td>${fmtDate(t.date)}</td><td><span class="badge ${t.type}">${libType(t)}</span></td>
    <td><strong class="${t.pourcentage >= 60 ? "ok" : "ko"}">${t.pourcentage} %</strong> (${fmtPoints(t.score)}/${t.total})</td>
    <td>${t.details?.length ? `<a class="btn blanc petit" href="#/profil/${p.id}/evaluation/${t.id}">👁 Revoir</a>` : ""}</td></tr>`).reverse().join("");
}
async function ongletTest(p, zone) {
  const reg = reglagesDe(p);
  const { lecons, tests } = historiqueLecon(p, p.matiere, p.sujet);
  const leconLue = lecons.length > 0;
  const revisionFaite = tests.some((t) => t.type === "revision");
  const geo = estLeconGeoPays(p.matiere, p.sujet); // test de cartes / drapeaux personnalisable
  if (leconLue) prechauffer(p, "final");
  zone.innerHTML = `
    ${geo ? panneauOptionsGeo(p) : ""}
    <div class="deux">
      <div class="panel jaune ${leconLue ? "" : "verrou"}"><span class="etiquette">ÉTAPE 2 · RÉVISION</span>
        <h3>⚡ Révision</h3><p>${reg.nbRevision} questions sur la leçon. Après chaque réponse : la correction détaillée${/math/i.test(p.matiere) ? " avec la démarche du calcul" : ""}.</p>
        ${leconLue ? `<button class="btn rouge" data-lancer="entrainement">⚡ Commencer la révision</button>`
          : `<p><strong>🔒 Lis d'abord toute la leçon</strong> (jusqu'à la dernière diapo) pour débloquer la révision.</p><a class="btn rouge" href="#/profil/${p.id}/lecon">📖 Lire la leçon</a>`}</div>
      <div class="panel ${revisionFaite ? "" : "verrou"}"><span class="etiquette">ÉTAPE 3 · EXAMEN</span>
        <h3>⚔️ Examen final</h3><p>${reg.nbFinal} questions notées sur 100 %, ${reg.minuteur ? "avec minuteur" : "sans minuteur"}, corrigé détaillé à la fin.</p>
        ${revisionFaite ? `<button class="btn bleu" data-lancer="final">⚔️ Passer l'examen</button>`
          : `<p><strong>🔒 Fais au moins une révision</strong> pour débloquer l'examen.</p>`}</div>
    </div>
    <div class="panel">
      <span class="etiquette">HISTORIQUE</span>
      <div class="stats" style="margin-bottom:14px">
        <div class="stat rev"><div class="val">${lecons.length}</div><div class="lib">leçon${lecons.length > 1 ? "s" : ""} lue${lecons.length > 1 ? "s" : ""}</div></div>
        <div class="stat"><div class="val">${tests.filter((t) => t.type === "revision").length}</div><div class="lib">révisions</div></div>
        <div class="stat"><div class="val">${tests.filter((t) => t.type === "final").length}</div><div class="lib">examens</div></div>
        <div class="stat"><div class="val">${fmtPct(moyenneDe(tests))}</div><div class="lib">moyenne</div></div>
      </div>
      <p>${leconLue ? `📖 Leçon lue <strong>${lecons.length} fois</strong> : ${lecons.map((l) => fmtDate(l.date)).join(", ")}.` : `📖 Leçon pas encore lue.`}</p>
      ${tests.length ? `<div class="table-scroll"><table class="historique"><thead><tr><th>#</th><th>Date</th><th>Type</th><th>Score</th><th></th></tr></thead><tbody>
        ${lignesHistorique(p, tests)}</tbody></table></div>` : `<p class="vide">Aucune révision ni examen pour l'instant.</p>`}
    </div>
    ${sync.actif ? `<p class="aide" data-sync-statut></p>` : ""}`;
  majSyncUI();
  let enCours = false;
  const lancer = async (quoi) => {
    if (enCours) return;
    if (quoi === "final" && !revisionFaite) return toast("🔒 Fais d'abord une révision.", true);
    if (!leconLue) return toast("🔒 Lis d'abord toute la leçon.", true);
    enCours = true;
    sync.surAction = null;
    sync.envoyer({ phase: "chargement", profil: { nom: p.nom, avatar: p.avatar } });
    try {
      if (geo) {
        // Cartes et drapeaux : questions tirées des vraies données selon les choix de l'élève.
        const o = optionsGeo(p);
        const data = await api(`/profils/${p.id}/geo-test`, { method: "POST", body: { ...o, n: quoi === "final" ? reg.nbFinal : reg.nbRevision } });
        if (!document.body.contains(zone)) return;
        return demarrerQuiz({ type: quoi === "final" ? "final" : "revision", questions: data.questions, matiere: p.matiere, sujet: p.sujet, sources: [] });
      }
      if (quoi === "final") {
        chargement("Sensei prépare l'examen !", ["Il simule un vrai examen…", "Il choisit des questions sur tes points faibles…", "Il vérifie chaque réponse deux fois…"]);
        let dejaVues = [];
        try { dejaVues = JSON.parse(sessionStorage.getItem("dejaVues") || "[]"); } catch {}
        const data = await api(`/profils/${p.id}/final`, { method: "POST", body: { matiere: p.matiere, sujet: p.sujet, dejaVues } });
        finChargement();
        if (!document.body.contains(zone)) return;
        return demarrerQuiz({ type: "final", questions: data.questions, matiere: p.matiere, sujet: p.sujet, sources: data.sources });
      }
      // Révision : de nouvelles questions à chaque fois (celles déjà vues passent en dernier), dans un ordre différent.
      chargement("Sensei prépare ta révision !", ["Il relit la leçon…", "Il choisit des questions que tu n'as pas encore vues…"]);
      const data = await api(`/profils/${p.id}/revision`, { method: "POST", body: { matiere: p.matiere, sujet: p.sujet } });
      finChargement();
      if (!document.body.contains(zone)) return;
      demarrerQuiz({ type: "revision", questions: melange(data.questions), matiere: p.matiere, sujet: p.sujet, sources: data.sources });
    } catch (e) {
      finChargement(); enCours = false; toast(e.message, true);
      phasePret(p, "Révision : " + p.sujet, choixTests, lancer);
    }
  };
  const choixTests = [
    ...(leconLue ? [{ id: "entrainement", label: "⚡ RÉVISION" }] : []),
    ...(revisionFaite ? [{ id: "final", label: "⚔️ EXAMEN" }] : []),
  ];
  zone.querySelectorAll("[data-lancer]").forEach((b) => b.addEventListener("click", () => lancer(b.dataset.lancer)));
  if (choixTests.length) phasePret(p, "Révision : " + p.sujet, choixTests, lancer);
  else sync.envoyer({ phase: "attente" });
}

// ---------- Options du test de cartes et de drapeaux ----------
const estLeconGeoPays = (matiere, sujet) => /g[ée]ograph|univers social/i.test(matiere || "") && /drapeau|capitale|pays|europ|am[ée]ri|afri/i.test(sujet || "");
const ZONES_GEO = ["Europe", "Amériques", "Afrique"];
function zonesDuSujet(sujet = "") {
  const z = [];
  if (/europ/i.test(sujet)) z.push("Europe");
  if (/am[ée]ri/i.test(sujet)) z.push("Amériques");
  if (/afri/i.test(sujet)) z.push("Afrique");
  return z.length ? z : [...ZONES_GEO];
}
function optionsGeo(p) {
  let o = null;
  try { o = JSON.parse(localStorage.getItem("geoOptions:" + p.sujet) || "null"); } catch {}
  return { zones: o?.zones?.length ? o.zones : zonesDuSujet(p.sujet), contenu: o?.contenu || "mix", format: o?.format || "mix" };
}
function panneauOptionsGeo(p) {
  const o = optionsGeo(p);
  const radio = (nom, val, lib) => `<label class="opt"><input type="radio" name="${nom}" value="${val}" ${o[nom === "geo-contenu" ? "contenu" : "format"] === val ? "checked" : ""}> ${lib}</label>`;
  return `<div class="panel trame options-geo" id="options-geo">
    <span class="etiquette">🗺️ PERSONNALISE TA RÉVISION</span>
    <div class="opt-groupe"><strong>Zones</strong>
      <label class="opt"><input type="checkbox" data-zone="monde" ${o.zones.length === 3 ? "checked" : ""}> 🌍 Monde (tout)</label>
      ${ZONES_GEO.map((z) => `<label class="opt"><input type="checkbox" data-zone="${z}" ${o.zones.includes(z) ? "checked" : ""}> ${{ Europe: "🇪🇺 Europe", "Amériques": "🌎 Amériques", Afrique: "🌍 Afrique" }[z]}</label>`).join("")}
    </div>
    <div class="opt-groupe"><strong>Contenu</strong>${radio("geo-contenu", "mix", "🔀 Cartes + drapeaux")}${radio("geo-contenu", "cartes", "🗺️ Cartes seulement")}${radio("geo-contenu", "drapeaux", "🏳️ Drapeaux seulement")}</div>
    <div class="opt-groupe"><strong>Réponses</strong>${radio("geo-format", "mix", "🔀 Mélange")}${radio("geo-format", "qcm", "🔘 QCM")}${radio("geo-format", "ouverte", "✍️ Question écrite")}${radio("geo-format", "positionner", "📍 Positionner sur la carte")}</div>
    <p class="aide">Les accents et le « s » final oubliés sont acceptés dans les réponses écrites.</p>
  </div>`;
}
// Enregistre les choix à chaque clic (gardés sur cet appareil, pour cette leçon).
document.addEventListener("change", (e) => {
  const panneau = e.target.closest("#options-geo");
  if (!panneau || !etat.profil) return;
  const cases = [...panneau.querySelectorAll("[data-zone]")];
  if (e.target.dataset.zone === "monde") cases.forEach((c) => (c.checked = e.target.checked));
  let zones = cases.filter((c) => c.dataset.zone !== "monde" && c.checked).map((c) => c.dataset.zone);
  if (!zones.length) { zones = zonesDuSujet(etat.profil.sujet); cases.forEach((c) => (c.checked = zones.includes(c.dataset.zone))); toast("Choisis au moins une zone.", true); }
  panneau.querySelector('[data-zone="monde"]').checked = zones.length === 3;
  const o = { zones, contenu: panneau.querySelector('[name="geo-contenu"]:checked')?.value || "mix", format: panneau.querySelector('[name="geo-format"]:checked')?.value || "mix" };
  try { localStorage.setItem("geoOptions:" + etat.profil.sujet, JSON.stringify(o)); } catch {}
});

// ---------- Revoir une évaluation passée ----------
async function ecranEvaluation(id, sid) {
  const p = await chargerProfil(id);
  const s = p.sessions.find((x) => x.id === sid);
  if (!s) { app.innerHTML = `<div class="panel">${senseiDit("Évaluation introuvable.", "triste")}<a class="btn" href="#/">Retour</a></div>`; return; }
  const r = rang(s.pourcentage);
  const fautes = (s.details || []).filter((d) => !d.ok).length;
  app.innerHTML = `
    <div class="actions" style="margin:0 0 16px">
      <a class="btn blanc petit" href="javascript:history.back()">◀ Retour</a>
    </div>
    <div class="panel">
      <span class="etiquette">👁 REVOIR MON ÉVALUATION</span>
      <div class="resultat-top">
        <div class="rang ${r}">${r}</div>
        <div>
          <div class="gros-score">${s.pourcentage} %</div>
          <div><strong>${fmtPoints(s.score)} / ${s.total}</strong> · ${esc(libType(s))} · ${fmtDate(s.date)}</div>
          <div>${esc(s.matiere)} · ${esc(s.sujet)}</div>
        </div>
      </div>
      ${fautes ? senseiDit(`Tu t'es trompé(e) sur <strong>${fautes}</strong> question${fautes > 1 ? "s" : ""}. Relis bien les explications en rouge : c'est là qu'on apprend le plus !`, "normal") : senseiDit("Sans faute ! Tu maîtrises cette leçon. 🏆")}
      <div class="actions">
        <button class="btn petit ${etat.filtreEval === "faux" ? "" : "blanc"}" id="ev-faux">✘ Seulement mes erreurs</button>
        <button class="btn petit ${etat.filtreEval === "faux" ? "blanc" : ""}" id="ev-tout">Toutes les questions</button>
      </div>
    </div>
    <div class="panel" id="ev-liste"></div>`;
  const dessiner = () => {
    const liste = (s.details || []).map((d, i) => ({ d, i })).filter(({ d }) => etat.filtreEval !== "faux" || !d.ok);
    $("#ev-liste").innerHTML = `<span class="etiquette">${etat.filtreEval === "faux" ? "MES ERREURS" : "TOUTES LES QUESTIONS"}</span>`
      + (liste.length ? liste.map(({ d, i }) => detailCorrection(d, { numero: i + 1 })).join("") : `<p class="vide">Aucune erreur à revoir. 🎉</p>`);
  };
  $("#ev-faux").addEventListener("click", () => { etat.filtreEval = "faux"; ecranEvaluation(id, sid); });
  $("#ev-tout").addEventListener("click", () => { etat.filtreEval = "tout"; ecranEvaluation(id, sid); });
  dessiner();
}


// --- Onglet 3 : prendre sa leçon en photo (1 à 5) → « Terminer » → leçon + test faits par l'IA ---
const MAX_PHOTOS = 5;
async function ongletPhoto(p, zone, ouvrirId = null) {
  const liste = await api(`/profils/${p.id}/lecons-photo`);
  const images = [];
  zone.innerHTML = `
    <div class="panel">
      <span class="etiquette">📸 MA LEÇON EN PHOTO</span>
      ${senseiDit(`Prends ta leçon en photo (cahier, manuel, notes au tableau…) : <strong>1 à ${MAX_PHOTOS} photos</strong>. Appuie ensuite sur <strong>Terminer</strong> : je t'en fais une leçon expliquée avec des schémas, puis une révision !`)}
      <div class="deux" style="gap:12px">
        <label class="zone-upload" for="lp-camera" style="cursor:pointer">📷 <strong>Prendre une photo</strong></label>
        <label class="zone-upload" for="lp-input" style="cursor:pointer">🖼 <strong>Choisir des photos</strong></label>
      </div>
      <input type="file" id="lp-camera" accept="image/*" capture="environment" hidden>
      <input type="file" id="lp-input" accept="image/*" multiple hidden>
      ${sync.actif && sync.profilId === p.id ? `<p class="aide">📱 Ton téléphone est connecté : tu peux aussi prendre les photos avec lui, elles arrivent ici. <span data-sync-statut></span></p>` : ""}
      <p><strong id="lp-compte">0 / ${MAX_PHOTOS} photo</strong></p>
      <div class="galerie" id="lp-apercu"></div>
      <label for="lp-titre">Titre de la leçon (facultatif)</label>
      <input id="lp-titre" placeholder="ex. Les fractions équivalentes" value="${esc(p.sujet || "")}">
      <div class="actions"><button class="btn rouge" id="lp-go" disabled>✔ Terminer : créer ma leçon et ma révision</button></div>
    </div>
    ${liste.length ? `<div class="panel"><span class="etiquette">MES LEÇONS EN PHOTO</span>
      <div class="liste-sessions">${liste.map((l) => {
        const tests = p.sessions.filter((s) => s.photo && s.sujet === l.titre);
        return `<div class="carte-session carte-compte">
          <img src="/photos/${esc(l.photos[0])}" alt="" class="vignette">
          <div style="flex:1"><strong>${esc(l.titre)}</strong><div class="aide">${esc(l.matiere)} · ${fmtDate(l.date)} · ${l.photos.length} photo${l.photos.length > 1 ? "s" : ""} · ${tests.length} révision${tests.length > 1 ? "s" : ""}${tests.length ? ` (dernier ${tests.at(-1).pourcentage} %)` : ""}</div>
            <div class="actions" style="margin-top:6px"><button class="btn petit" data-ouvrir="${l.id}">Ouvrir</button><button class="btn blanc petit" data-suppr-lp="${l.id}">🗑</button></div></div></div>`;
      }).join("")}</div></div>` : ""}
    <div id="lp-lecon"></div>`;
  majSyncUI();

  const etatTel = () => sync.envoyer({ phase: "photos", profil: { nom: p.nom, avatar: p.avatar }, nb: images.length, max: MAX_PHOTOS });
  const majApercu = () => {
    $("#lp-apercu").innerHTML = images.map((src, i) => `<div class="photo"><img src="${src}" alt="Page ${i + 1}"><button class="suppr" data-retirer="${i}" title="Retirer">×</button><div class="leg">Photo ${i + 1}</div></div>`).join("");
    $("#lp-compte").textContent = `${images.length} / ${MAX_PHOTOS} photo${images.length > 1 ? "s" : ""}`;
    $("#lp-go").disabled = !images.length;
    $("#lp-camera").disabled = $("#lp-input").disabled = images.length >= MAX_PHOTOS;
    etatTel();
  };
  const ajouter = async (fichiers) => {
    for (const f of fichiers) { if (images.length >= MAX_PHOTOS) { toast(`Maximum ${MAX_PHOTOS} photos.`, true); break; } images.push(await lirePhoto(f, 1800)); }
    majApercu();
  };
  for (const id of ["#lp-camera", "#lp-input"]) $(id).addEventListener("change", async (e) => { await ajouter([...e.target.files]); e.target.value = ""; });
  $("#lp-apercu").addEventListener("click", (e) => {
    const b = e.target.closest("[data-retirer]");
    if (b) { images.splice(Number(b.dataset.retirer), 1); majApercu(); }
  });
  let creation = false;
  const terminer = async () => {
    if (!images.length || creation) return;
    creation = true;
    sync.envoyer({ phase: "chargement", profil: { nom: p.nom, avatar: p.avatar } });
    chargement("Sensei lit ta leçon !", ["Il déchiffre tes photos…", "Il explique chaque notion plus simplement…", "Il dessine des schémas…", "Il prépare ta révision…"]);
    let r;
    try { r = await api(`/profils/${p.id}/lecons-photo`, { method: "POST", body: { images, matiere: p.matiere, sujet: $("#lp-titre").value.trim() } }); }
    catch (e) { finChargement(); creation = false; etatTel(); return toast(e.message, true); }
    finChargement();
    if (!document.body.contains(zone)) return;
    toast("Leçon créée à partir de tes photos !");
    ongletPhoto(p, zone, r.meta.id);
  };
  $("#lp-go").addEventListener("click", terminer);
  // Le téléphone-télécommande envoie ses photos et peut appuyer sur « Terminer ».
  sync.surAction = (a) => {
    if (a.type === "photo" && images.length < MAX_PHOTOS) { images.push(a.image); majApercu(); toast("📱 Photo reçue du téléphone !"); }
    else if (a.type === "retirerPhoto" && images.length) { images.pop(); majApercu(); }
    else if (a.type === "terminer") terminer();
  };
  zone.querySelectorAll("[data-ouvrir]").forEach((b) => b.addEventListener("click", () => afficherLeconPhoto(p, b.dataset.ouvrir)));
  zone.querySelectorAll("[data-suppr-lp]").forEach((b) => b.addEventListener("click", async () => {
    if (!confirm("Supprimer cette leçon en photo ?")) return;
    await api(`/profils/${p.id}/lecons-photo/${b.dataset.supprLp}`, { method: "DELETE" });
    ongletPhoto(p, zone);
  }));
  majApercu();
  if (ouvrirId) afficherLeconPhoto(p, ouvrirId);
}

async function afficherLeconPhoto(p, idLecon) {
  const z = $("#lp-lecon");
  z.innerHTML = `<p class="aide">Chargement…</p>`;
  const l = await api(`/profils/${p.id}/lecons-photo/${idLecon}`);
  if (!l.fiche) { z.innerHTML = `<p class="vide">Leçon introuvable.</p>`; return; }
  const lancer = () => demarrerQuiz({ type: "revision", questions: melange(l.questions), matiere: l.meta.matiere, sujet: l.meta.titre, sources: [], photo: true });
  z.innerHTML = `${l.demo ? bandeauDemo() : ""}<div id="lp-diapos"></div>`;
  // Comme pour les autres leçons : il faut lire toutes les diapos pour accéder à la révision.
  diaporama($("#lp-diapos"), l.fiche, l.meta.matiere, {
    profil: p,
    onFin: () => phasePret(p, "Révision : " + l.meta.titre, [{ id: "photo", label: "⚡ FAIRE LA RÉVISION" }], lancer),
    finHTML: () => `<div class="tel-centre"><div class="eclat">BRAVO !</div><h2>Leçon terminée ✔</h2>
      <p>${l.questions.length} questions tirées de ta photo, avec la correction détaillée.</p>
      <button class="btn rouge" id="lp-test">⚡ Faire la révision</button></div>`,
  });
  z.addEventListener("click", (e) => { if (e.target.id === "lp-test") lancer(); });
}


// ================= Écran : aide aux devoirs =================
async function ecranDevoirs(id) {
  const p = etat.profil?.id === id ? etat.profil : (etat.profil = await api("/profils/" + id));
  let image = null;
  app.innerHTML = `
    ${bandeauDemo()}
    ${senseiDit("Montre-moi ton devoir ! Je ne vais pas juste te donner la réponse : je vais t'aider à comprendre pour que tu réussisses ton examen.")}
    <div class="panel">
      <span class="etiquette">AIDE AUX DEVOIRS · ${esc(p.matiere)}</span>
      <label class="zone-upload" for="dev-photo" style="cursor:pointer">📸 <strong>Photo de l'exercice</strong> (facultatif)<br><span class="aide" id="dev-nom">Aucune photo choisie</span></label>
      <input type="file" id="dev-photo" accept="image/*" hidden>
      <img id="dev-apercu" alt="" style="display:none;max-height:240px;border:3px solid #111;margin-top:10px">
      <label for="dev-q">Ta question ou l'énoncé</label>
      <textarea id="dev-q" placeholder="ex. Je ne comprends pas comment trouver x dans 3x + 5 = 20"></textarea>
      <div class="actions"><button class="btn rouge" id="dev-go">✍️ Aide-moi, Sensei !</button><a class="btn blanc" href="#/profil/${p.id}">Retour</a></div>
    </div>
    <div id="dev-rep"></div>`;
  $("#dev-photo").addEventListener("change", async (e) => {
    const f = e.target.files[0]; if (!f) return;
    image = await lirePhoto(f);
    $("#dev-nom").textContent = f.name;
    const ap = $("#dev-apercu"); ap.src = image; ap.style.display = "block";
  });
  $("#dev-go").addEventListener("click", async () => {
    const question = $("#dev-q").value.trim();
    if (!question && !image) return toast("Écris ta question ou ajoute une photo.", true);
    chargement("Sensei analyse ton devoir…", ["Il lit l'énoncé…", "Il cherche la meilleure méthode…", "Il prépare des indices…"]);
    let r;
    try { r = await api(`/profils/${id}/devoirs`, { method: "POST", body: { matiere: p.matiere, question, image } }); }
    catch (e) { finChargement(); return toast(e.message, true); }
    finChargement();
    let montres = 0;
    const zone = $("#dev-rep");
    zone.innerHTML = `
      <div class="panel jaune"><span class="etiquette">CE QU'ON TE DEMANDE</span><p class="pre">${esc(r.comprendre)}</p></div>
      <div class="panel"><span class="etiquette">LA MÉTHODE</span><p class="pre">${esc(r.methode)}</p></div>
      <div class="panel trame"><span class="etiquette">INDICES</span><ol id="indices"></ol>
        <button class="btn petit" id="indice-btn">💡 Un indice de plus</button></div>
      <div class="panel"><span class="etiquette">SOLUTION</span>
        <p class="aide">Essaie d'abord avec les indices ! 😉</p>
        <button class="btn blanc petit" id="sol-btn">👀 Révéler la solution</button>
        <div id="sol" class="cache"><p class="pre">${esc(r.solution)}</p><div class="exemple"><strong>Pour vérifier :</strong> ${esc(r.verification)}</div></div></div>`;
    const ajouterIndice = () => {
      if (montres >= r.indices.length) return;
      $("#indices").insertAdjacentHTML("beforeend", `<li class="pre">${esc(r.indices[montres++])}</li>`);
      if (montres >= r.indices.length) $("#indice-btn").disabled = true;
    };
    ajouterIndice();
    $("#indice-btn").addEventListener("click", ajouterIndice);
    $("#sol-btn").addEventListener("click", () => { $("#sol").classList.remove("cache"); $("#sol-btn").remove(); });
    zone.scrollIntoView({ behavior: "smooth" });
  });
}

// ================= Écran : téléphone (télécommande) =================
const tel = { es: null, code: null, cle: null, tick: null, selection: null, fin: null, seconde: null };
function quitterTelephone() {
  if (tel.es) tel.es.close();
  clearInterval(tel.tick);
  Object.assign(tel, { es: null, code: null, cle: null, tick: null, selection: null, fin: null, seconde: null });
  document.body.classList.remove("mode-tel", "flash");
}
function actionTel(action) {
  return fetch(`/api/sync/${tel.code}/action`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) })
    .then((r) => r.json()).then((d) => { if (d.hote === false) toast("L'ordinateur n'est plus connecté.", true); })
    .catch(() => toast("Connexion perdue…", true));
}
async function ecranTelephone(code) {
  let info;
  try { info = await api("/sync/" + code); }
  catch (e) {
    app.innerHTML = `${senseiDit(esc(e.message), "triste")}${panneauCodeTel()}`;
    $("#form-code").addEventListener("submit", (ev) => { ev.preventDefault(); location.hash = "#/tel/" + $("#code-tel").value.replace(/\D/g, ""); });
    return;
  }
  try { localStorage.setItem("telCode", code); } catch {}
  document.body.classList.add("mode-tel");
  tel.code = code;
  app.innerHTML = `
    <div class="tel-entete">
      <div class="mini-portrait">${avatarSVG(info.profil?.avatar)}</div>
      <div style="flex:1"><strong>${esc(info.profil?.nom || "")}</strong><div class="aide" id="tel-etat-co">Connexion…</div></div>
      <a class="btn blanc petit" href="#/" id="tel-quitter">Quitter</a>
    </div>
    <div id="tel-zone"></div>`;
  // La connexion se rétablit toute seule (écran verrouillé, Wi-Fi coupé, serveur redémarré).
  const ouvrir = () => {
    if (tel.code !== code) return;
    const es = (tel.es = new EventSource(`/api/sync/${code}/flux?role=tel`));
    es.addEventListener("presence", (e) => {
      const d = JSON.parse(e.data);
      const el = $("#tel-etat-co");
      if (el) el.textContent = d.hotes ? "✅ Connecté à l'ordinateur · code " + code : "⚠️ Ordinateur pas encore connecté — garde la page ouverte";
    });
    es.addEventListener("etat", (e) => rendreTel(JSON.parse(e.data)));
    es.onerror = () => {
      const el = $("#tel-etat-co"); if (el) el.textContent = "⏳ Reconnexion…";
      if (es.readyState === EventSource.CLOSED && tel.es === es) { tel.cle = null; setTimeout(ouvrir, 3000); }
    };
  };
  ouvrir();
}
// Quand le téléphone se rallume, on force une reconnexion immédiate si elle était coupée.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && tel.code && tel.es?.readyState === EventSource.CLOSED) {
    const code = tel.code; tel.es = null; tel.cle = null;
    ecranTelephone(code);
  }
});

function rendreTel(e) {
  const zone = $("#tel-zone");
  if (!zone) return;
  // Ne redessine pas si c'est la même question (pour garder la sélection et le texte tapé).
  const cle = `${e.phase}:${e.quiz?.type || ""}:${e.quiz?.i ?? ""}:${e.nb ?? ""}:${e.i ?? ""}`;
  if (cle === tel.cle) return;
  tel.cle = cle;
  clearInterval(tel.tick);
  document.body.classList.remove("flash");
  tel.selection = null;

  if (e.phase === "question") return rendreTelQuestion(zone, e);
  if (e.phase === "photos") return rendreTelPhotos(zone, e);
  if (e.phase === "lecon") {
    // Leçon en diapos sur l'ordinateur : le téléphone fait défiler.
    zone.innerHTML = `<div class="tel-centre"><h2>📖 ${esc(e.titre || "Leçon")}</h2>
      <div class="gros-score">${e.i + 1} / ${e.n}</div>
      <div class="diapo-progres" style="width:100%"><div style="width:${((e.i + 1) / e.n) * 100}%"></div></div>
      <p>${e.fin ? "Leçon terminée ! 🎉" : "Lis la diapo sur l'ordinateur, puis appuie sur Suivant."}</p></div>
      ${e.fin ? `<button class="tel-gros vert" id="tel-aller-test">⚡ PASSER À LA RÉVISION</button>`
        : `<button class="tel-gros vert" id="tel-suiv">SUIVANT ▶</button>`}
      <button class="btn blanc large" id="tel-prec" style="margin-top:12px" ${e.i === 0 ? "disabled" : ""}>◀ Précédent</button>`;
    $("#tel-suiv")?.addEventListener("click", () => { if (navigator.vibrate) navigator.vibrate(20); actionTel({ type: "slide", sens: 1 }); });
    $("#tel-prec")?.addEventListener("click", () => actionTel({ type: "slide", sens: -1 }));
    $("#tel-aller-test")?.addEventListener("click", () => actionTel({ type: "allerTest" }));
    return;
  }
  const ecrans = {
    attente: () => `${senseiDit("Prêt ! Lance une leçon ou une révision sur l'ordinateur : ton téléphone deviendra ta manette.")}
      <button class="tel-gros" id="tel-ouvrir-photo">📸 Envoyer des photos de leçon</button>`,
    chargement: () => `<div class="tel-centre"><div class="sensei grand">${senseiSVG("joie")}</div><h2>Sensei prépare tes questions…</h2><p>Ça peut prendre une minute.</p></div>`,
    pret: () => `<div class="tel-centre"><h2>${esc(e.titre || "Quiz")}</h2><p>Tout est prêt sur l'ordinateur ! Choisis :</p>
      ${(e.choix?.length ? e.choix : [{ id: "", label: "▶ COMMENCER" }]).map((c, i) => `<button class="tel-gros ${i ? "" : "vert"}" data-commencer="${esc(c.id)}">${esc(c.label)}</button>`).join("")}</div>`,
    envoye: () => `<div class="tel-centre"><div class="eclat">ENVOYÉ !</div><p>Regarde l'écran pour la prochaine question.</p></div>`,
    correction: () => `<div class="tel-centre"><div class="sensei grand">${senseiSVG("normal")}</div><h2>Sensei corrige…</h2></div>`,
    feedback: () => {
      const f = e.feedback || {};
      return `<div class="tel-centre">
        <div class="eclat ${f.ok ? "" : "rate"}">${esc(f.cri || (f.ok ? "BRAVO !" : "OUPS !"))}</div>
        ${f.ok ? "<p><strong>Bonne réponse !</strong></p>" : `<p>Bonne réponse : <strong>${esc(f.bonne)}</strong></p>`}
        ${f.commentaire ? `<p><em>${esc(f.commentaire)}</em></p>` : ""}
        <p class="aide">L'explication est sur l'ordinateur.</p>
        <button class="tel-gros" id="tel-suivant">${f.dernier ? "Voir mon résultat ▶" : "Question suivante ▶"}</button></div>`;
    },
    fin: () => {
      const r = e.resultat || {};
      return `<div class="tel-centre"><div class="rang ${esc(r.rang)}">${esc(r.rang)}</div><div class="gros-score">${r.pct} %</div><p>${r.score} / ${r.total} bonnes réponses</p><p>Le détail est sur l'ordinateur.</p></div>`;
    },
  };
  zone.innerHTML = (ecrans[e.phase] || ecrans.attente)();
  $("#tel-ouvrir-photo")?.addEventListener("click", () => actionTel({ type: "ouvrirPhoto" }));
  zone.querySelectorAll("[data-commencer]").forEach((bt) => bt.addEventListener("click", () => {
    actionTel({ type: "commencer", choix: bt.dataset.commencer });
    $("#tel-ouvrir-photo")?.addEventListener("click", () => actionTel({ type: "ouvrirPhoto" }));
  zone.querySelectorAll("[data-commencer]").forEach((x) => (x.disabled = true));
  }));
  $("#tel-suivant")?.addEventListener("click", () => actionTel({ type: "suivant" }));
}

// Mode télécommande, onglet 📸 Photo ouvert sur l'ordinateur : le téléphone sert d'appareil photo.
function rendreTelPhotos(zone, e) {
  const max = e.max || 5, nb = e.nb || 0;
  zone.innerHTML = `
    <div class="tel-centre">
      <h2>📸 Ta leçon en photo</h2>
      <p>Prends <strong>1 à ${max} photos</strong> de ta leçon. Elles s'affichent sur l'ordinateur.</p>
      <div class="gros-score">${nb} / ${max}</div>
      <p class="aide" id="tel-envoi"></p>
    </div>
    <label class="tel-gros vert tel-label ${nb >= max ? "inactif" : ""}" for="tel-cam">📷 PRENDRE UNE PHOTO</label>
    <input type="file" id="tel-cam" accept="image/*" capture="environment" hidden ${nb >= max ? "disabled" : ""}>
    <label class="tel-gros tel-label ${nb >= max ? "inactif" : ""}" for="tel-gal" style="margin-top:12px">🖼 Choisir dans la galerie</label>
    <input type="file" id="tel-gal" accept="image/*" multiple hidden ${nb >= max ? "disabled" : ""}>
    ${nb ? `<button class="btn blanc large" id="tel-retirer" style="margin-top:12px">↩ Retirer la dernière photo</button>` : ""}
    <button class="tel-gros" id="tel-terminer" style="margin-top:18px;background:var(--rouge);color:#fff" ${nb ? "" : "disabled"}>✔ TERMINER</button>
    <p class="aide" style="text-align:center">Terminer = Sensei crée ta leçon et ta révision à partir des photos.</p>`;
  const envoyer = async (fichiers) => {
    const info = $("#tel-envoi");
    let restant = max - nb;
    for (const f of fichiers) {
      if (restant-- <= 0) { toast(`Maximum ${max} photos.`, true); break; }
      if (info) info.textContent = "⏳ Envoi de la photo…";
      try {
        const image = await lirePhoto(f, 1800);
        const r = await fetch(`/api/sync/${tel.code}/photo`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }) }).then((x) => x.json());
        if (r.hote === false) toast("L'ordinateur n'est plus connecté.", true);
        if (navigator.vibrate) navigator.vibrate(40);
      } catch { toast("Envoi impossible, réessaie.", true); }
    }
    if ($("#tel-envoi")) $("#tel-envoi").textContent = "✅ Envoyé !";
  };
  for (const id of ["#tel-cam", "#tel-gal"]) $(id).addEventListener("change", (ev) => { envoyer([...ev.target.files]); ev.target.value = ""; });
  $("#tel-retirer")?.addEventListener("click", () => actionTel({ type: "retirerPhoto" }));
  $("#tel-terminer").addEventListener("click", (ev) => { ev.target.disabled = true; ev.target.textContent = "Création…"; actionTel({ type: "terminer" }); });
}

function rendreTelQuestion(zone, e) {
  const q = e.question, lettres = "ABCDEFGH";
  const frise = q.type === "ordre";
  const positionner = q.type === "carte";
  const ouverte = !(q.type === "qcm" || q.type === "vrai_faux") && !frise && !positionner;
  let ordre = [], paysTouche = null;
  zone.innerHTML = `
    <div class="tel-q-entete">
      <div class="question-num">${e.quiz.type === "final" ? "EXAMEN" : "RÉVISION"} · ${e.quiz.i + 1} / ${e.quiz.n}</div>
      ${e.restantMs != null ? `<div class="tel-temps"><span id="tel-sec"></span><div class="jauge"><div id="tel-jauge"></div></div></div>` : ""}
    </div>
    <p class="aide">${positionner ? "📍 Touche le bon endroit sur la carte (tu peux zoomer avec deux doigts)" : frise ? "🧭 Touche les éléments dans l'ordre (du plus ancien au plus récent)" : q.calcul ? "🧮 Écris ton calcul, puis ton résultat final" : ouverte ? "✍️ Écris ta réponse" : "Lis la question sur l'ordinateur, puis choisis :"}</p>
    ${q.audio ? `<button class="btn bleu petit" id="tel-audio">🔊 Réécouter</button>` : ""}
    ${q.indice ? `<button type="button" class="btn blanc petit" id="tel-indice"><span class="btn-indice">i</span> Un indice ?</button><div id="tel-zone-indice"></div>` : ""}
    ${positionner ? `<div class="carte-interactive tel-carte" id="tel-carte"><p class="aide">Chargement de la carte…</p></div><p class="aide" id="tel-carte-sel"></p>`
      : frise ? `<ol class="frise-reponse" id="tel-frise"></ol>
        <div class="frise-choix tel-frise-choix">${q.elements.map((el) => `<button data-el="${esc(el)}">${esc(sansDate(el))}</button>`).join("")}</div>
        <button class="btn blanc large" id="tel-frise-annuler">↩ Retirer le dernier</button>`
      : q.calcul ? `<textarea id="tel-calc" class="tel-texte zone-calcul" rows="5" placeholder="Ton calcul, étape par étape…"></textarea>
        <input id="tel-texte" class="tel-texte champ-resultat" ${q.type === "numerique" ? 'inputmode="decimal"' : ""} placeholder="✅ Résultat final" style="min-height:0">`
      : ouverte ? `<textarea id="tel-texte" class="tel-texte" ${q.type === "numerique" ? 'inputmode="decimal"' : ""} placeholder="${q.type === "numerique" ? "Ta réponse (nombre)" : "Ta réponse…"}" rows="3"></textarea>`
      : `<div class="tel-choix ${q.choix.length > 2 ? "" : "deux-col"}">${q.choix.map((c, k) => `<button data-c="${esc(c)}"><span class="lettre">${lettres[k]}</span><span class="txt">${esc(c)}</span></button>`).join("")}</div>`}
    <button class="tel-gros vert" id="tel-ok" disabled>✔ CONFIRMER</button>`;

  const ok = $("#tel-ok");
  $("#tel-indice")?.addEventListener("click", () => {
    $("#tel-zone-indice").innerHTML = `<div class="bloc-indice">💡 <strong>Indice :</strong> ${esc(q.indice)}</div>`;
    $("#tel-indice").remove();
    actionTel({ type: "indice" });
  });
  if (positionner) {
    chargerCarteInteractive($("#tel-carte"), q.carte_url, (nomPays) => {
      paysTouche = nomPays;
      zone.querySelectorAll("#tel-carte [data-nom]").forEach((el) => el.classList.toggle("choisie", el.dataset.nom === nomPays));
      $("#tel-carte-sel").innerHTML = `Ta sélection : <strong>${esc(nomPays)}</strong>`;
      ok.disabled = false;
      if (navigator.vibrate) navigator.vibrate(20);
      actionTel({ type: "selection", valeur: nomPays });
    });
  } else if (frise) {
    const maj = () => {
      $("#tel-frise").innerHTML = ordre.map((el) => `<li>${esc(sansDate(el))}</li>`).join("");
      zone.querySelectorAll(".tel-frise-choix button").forEach((b) => (b.disabled = ordre.includes(b.dataset.el)));
      ok.disabled = ordre.length !== q.elements.length;
      actionTel({ type: "selection", ordre });
    };
    zone.querySelectorAll(".tel-frise-choix button").forEach((b) => b.addEventListener("click", () => { ordre.push(b.dataset.el); if (navigator.vibrate) navigator.vibrate(20); maj(); }));
    $("#tel-frise-annuler").addEventListener("click", () => { ordre.pop(); maj(); });
  } else if (ouverte) {
    const t = $("#tel-texte"), c = $("#tel-calc");
    let envoiSel;
    const envoyerSel = () => {
      ok.disabled = !t.value.trim();
      clearTimeout(envoiSel);
      envoiSel = setTimeout(() => actionTel({ type: "selection", valeur: t.value, calcul: c ? c.value : null }), 300); // l'ordi affiche ce qui est tapé
    };
    t.addEventListener("input", envoyerSel);
    c?.addEventListener("input", envoyerSel);
  } else {
    zone.querySelectorAll(".tel-choix button").forEach((b) => b.addEventListener("click", () => {
      tel.selection = b.dataset.c;
      zone.querySelectorAll(".tel-choix button").forEach((x) => x.classList.toggle("choisi", x === b));
      ok.disabled = false;
      if (navigator.vibrate) navigator.vibrate(20);
      actionTel({ type: "selection", valeur: tel.selection });
    }));
  }
  ok.addEventListener("click", () => {
    const valeur = positionner ? paysTouche : frise ? ordre.join(" → ") : ouverte ? $("#tel-texte").value.trim() : tel.selection;
    if (!valeur) return;
    ok.disabled = true;
    ok.textContent = "Envoi…";
    actionTel({ type: "reponse", valeur, calcul: $("#tel-calc")?.value ?? null });
  });
  $("#tel-audio")?.addEventListener("click", () => actionTel({ type: "audio" }));

  // Compte à rebours : le contour clignote en rouge chaque seconde dans les 10 dernières secondes.
  if (e.restantMs != null) {
    const total = e.restantMs, fin = Date.now() + e.restantMs;
    const tick = () => {
      const reste = Math.max(0, fin - Date.now());
      const s = Math.ceil(reste / 1000);
      const sec = $("#tel-sec"), jauge = $("#tel-jauge");
      if (!sec) return clearInterval(tel.tick);
      sec.textContent = reste > 0 ? s + " s" : "Temps écoulé !";
      jauge.style.width = (reste / Math.max(total, 1)) * 100 + "%";
      const urgent = reste > 0 && s <= 10;
      sec.parentElement.classList.toggle("urgent", urgent);
      document.body.classList.toggle("flash", urgent && reste % 1000 > 500);
      if (urgent && s !== tel.seconde && navigator.vibrate) navigator.vibrate(60);
      tel.seconde = s;
      if (reste <= 0) { clearInterval(tel.tick); document.body.classList.remove("flash"); }
    };
    tel.tick = setInterval(tick, 100);
    tick();
  }
}

// ================= Dictionnaire anglais → français (pop-up) =================
function lireRecents() { try { return JSON.parse(localStorage.getItem("dicoRecents") || "[]"); } catch { return []; } }
function ajouterRecents(mots) {
  const liste = [...new Set([...mots, ...lireRecents()])].slice(0, 12);
  try { localStorage.setItem("dicoRecents", JSON.stringify(liste)); } catch {}
}
function carteDico(e) {
  const puces = (liste, cls) => liste.map((s) => `<button type="button" class="puce ${cls}" ${cls === "en" ? `data-chercher="${esc(s)}"` : ""}>${esc(s)}</button>`).join("");
  return `<div class="carte-dico">
    <div class="dico-tete">
      <h3>${esc(e.mot)}</h3>
      <button type="button" class="btn-son" data-dire="${esc(e.mot)}" data-langue="en" title="Écouter">🔊</button>
      ${e.phonetique ? `<span class="aide">${esc(e.phonetique)}</span>` : ""}
      ${e.nature ? `<span class="badge tag">${esc(e.nature)}</span>` : ""}
    </div>
    <p class="dico-trad">→ ${e.traductions.map((t, i) => i ? esc(t) : `<strong>${esc(t)}</strong>`).join(", ")}</p>
    ${e.exemple_en ? `<div class="exemple">
      <div>🇬🇧 <em>${esc(e.exemple_en)}</em> <button type="button" class="btn-son petit" data-dire="${esc(e.exemple_en)}" data-langue="en" title="Écouter l'exemple">🔊</button></div>
      <div>🇫🇷 ${esc(e.exemple_fr)}</div></div>` : ""}
    ${e.synonymes_en.length ? `<div class="dico-syn"><span class="aide">Synonymes anglais :</span> ${puces(e.synonymes_en, "en")}</div>` : ""}
    ${e.synonymes_fr.length ? `<div class="dico-syn"><span class="aide">Synonymes français :</span> ${puces(e.synonymes_fr, "fr")}</div>` : ""}
  </div>`;
}
function ouvrirDico(texteInitial = "") {
  fermerDico();
  const fond = document.createElement("div");
  fond.className = "modal-fond";
  fond.id = "dico";
  fond.innerHTML = `
    <div class="modal panel" role="dialog" aria-modal="true" aria-labelledby="dico-titre">
      <span class="etiquette">📖 DICO</span>
      <button type="button" class="modal-fermer" id="dico-fermer" aria-label="Fermer">✕</button>
      <h2 id="dico-titre">Anglais → français</h2>
      <textarea id="dico-texte" rows="3" placeholder="Colle ou écris des mots anglais (un par ligne ou séparés par des virgules)…"></textarea>
      <div class="actions" style="margin-top:10px"><button type="button" class="btn rouge" id="dico-go">🔎 Traduire</button></div>
      <div id="dico-recents"></div>
      <div id="dico-res"></div>
    </div>`;
  document.body.appendChild(fond);
  document.body.classList.add("modal-ouvert");
  const champ = $("#dico-texte"), res = $("#dico-res");
  const dessinerRecents = () => {
    const r = lireRecents();
    $("#dico-recents").innerHTML = r.length ? `<div class="dico-syn"><span class="aide">Récents :</span> ${r.map((m) => `<button type="button" class="puce" data-chercher="${esc(m)}">${esc(m)}</button>`).join("")}</div>` : "";
  };
  const traduire = async () => {
    const texte = champ.value.trim();
    if (!texte) return champ.focus();
    res.innerHTML = `<div class="tel-centre"><div class="sensei grand">${senseiSVG("joie")}</div><p>Sensei cherche dans son dico…</p></div>`;
    try {
      const r = await api("/dico", { method: "POST", body: { texte } });
      res.innerHTML = (r.demo ? `<p class="demo-bandeau">Mode démo : mini-dictionnaire de 20 mots (happy, friend, go, homework…). Avec une clé API, tous les mots et phrases sont traduits.</p>` : "")
        + (r.entrees.length ? r.entrees.map(carteDico).join("") : `<p class="vide">Rien à traduire.</p>`);
      ajouterRecents(r.entrees.filter((e) => e.exemple_en).map((e) => e.mot));
      dessinerRecents();
    } catch (e) { res.innerHTML = `<p class="ko">${esc(e.message)}</p>`; }
  };
  $("#dico-go").addEventListener("click", traduire);
  champ.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); traduire(); } });
  champ.addEventListener("paste", () => setTimeout(traduire, 0)); // colle → traduit tout de suite
  $("#dico-fermer").addEventListener("click", fermerDico);
  fond.addEventListener("click", (e) => {
    if (e.target === fond) return fermerDico();
    const b = e.target.closest("[data-chercher]");
    if (b) { champ.value = b.dataset.chercher; traduire(); fond.querySelector(".modal").scrollTop = 0; }
  });
  dessinerRecents();
  if (texteInitial) { champ.value = texteInitial; traduire(); } else champ.focus();
}
function fermerDico() {
  $("#dico")?.remove();
  document.body.classList.remove("modal-ouvert");
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#dico")) fermerDico(); });

// ================= Espace admin =================
async function ecranAdmin() {
  etat.moi = await api("/auth/moi"); // l'admin a pu être créé ou fermé depuis un autre appareil
  majEntete();
  if (!etat.moi.admin) {
    const premier = !etat.moi.adminConfigure;
    app.innerHTML = `
      <div class="panel noir" style="max-width:520px;margin:0 auto 22px">
        <span class="etiquette">🛡 ESPACE ADMIN</span>
        <h2 style="color:var(--jaune)">${premier ? "Créer le compte admin" : "Connexion admin"}</h2>
        <p>${premier ? "Première visite : choisis le mot de passe qui protégera l'espace admin (suivi de tous les comptes, clé API). Garde-le pour toi !" : "Réservé au parent ou à l'enseignant : suivi de l'avancement de tous les comptes."}</p>
        <form id="form-admin">
          <label for="a-email">Courriel admin</label>
          <input id="a-email" type="email" required autocomplete="username" autocapitalize="none">
          <label for="a-mdp">Mot de passe admin</label>
          <input id="a-mdp" type="password" required minlength="6" autocomplete="${premier ? "new-password" : "current-password"}">
          ${premier ? `<label for="a-mdp2">Confirme</label><input id="a-mdp2" type="password" required minlength="6" autocomplete="new-password">` : ""}
          <div class="actions"><button class="btn">${premier ? "Créer et entrer" : "Entrer 🛡"}</button><a class="btn blanc" href="#/">Retour</a></div>
        </form>
      </div>`;
    $("#form-admin").addEventListener("submit", async (e) => {
      e.preventDefault();
      const mdp = $("#a-mdp").value;
      if (premier && mdp !== $("#a-mdp2").value) return toast("Les deux mots de passe ne sont pas pareils.", true);
      try {
        await api(premier ? "/admin/initialiser" : "/admin/connexion", { method: "POST", body: { email: $("#a-email").value, motDePasse: mdp } });
        etat.moi.admin = true; etat.moi.adminConfigure = true;
        router();
      } catch (err) { toast(err.message, true); }
    });
    return;
  }

  const comptes = await api("/admin/comptes");
  const total = comptes.reduce((a, c) => a + c.revisions, 0);
  const actifs7 = comptes.filter((c) => Date.now() - new Date(c.derniereActivite) < 7 * 864e5).length;
  const ligneRes = (c) => c.dernierResultat ? `<span class="badge ${c.dernierResultat.type}">${libType(c.dernierResultat)}</span> ${c.dernierResultat.pourcentage == null ? "" : c.dernierResultat.pourcentage + "% · "}${esc(c.dernierResultat.sujet)}` : `<span class="vide">aucun</span>`;
  app.innerHTML = `
    <div class="panel noir">
      <span class="etiquette">🛡 ESPACE ADMIN</span>
      <div class="entete-profil">
        <h1 style="color:var(--jaune);flex:1">Avancement des comptes</h1>
        <div class="actions" style="margin:0">
          <a class="btn petit" href="#/parametres">🔑 Clé API & réseau</a>
          <a class="btn blanc petit" href="/api/admin/sauvegarde" download>💾 Sauvegarder</a>
          <label class="btn blanc petit" style="cursor:pointer">📥 Restaurer<input type="file" id="admin-restaurer" accept=".json,application/json" hidden></label>
          <button class="btn blanc petit" id="admin-out">Quitter l'admin</button>
        </div>
      </div>
    </div>
    <div class="stats panel">
      <div class="stat rev"><div class="val">${comptes.length}</div><div class="lib">comptes</div></div>
      <div class="stat"><div class="val">${actifs7}</div><div class="lib">actifs cette semaine</div></div>
      <div class="stat"><div class="val">${total}</div><div class="lib">révisions au total</div></div>
      <div class="stat"><div class="val">${comptes.reduce((a, c) => a + c.tests, 0)}</div><div class="lib">examens</div></div>
    </div>
    <div class="panel">
      <span class="etiquette">TOUS LES COMPTES</span>
      <input id="admin-filtre" placeholder="🔎 Chercher un nom, une école, une matière…" style="margin-bottom:14px">
      ${!comptes.length ? `<p class="vide">Aucun compte pour l'instant.</p>` : etat.mobile
        ? `<div class="liste-sessions" id="admin-liste">${comptes.map((c) => `
            <a class="carte-session carte-compte" href="#/admin/compte/${c.id}" data-filtre="${esc(sansAccents([c.nom, c.identifiant, c.ecole, c.annee, ...c.matieres].join(" ")))}">
              <div class="mini-portrait">${avatarSVG(c.avatar)}</div>
              <div style="flex:1"><strong>${esc(c.nom)}</strong> <span class="aide">@${esc(c.identifiant)}</span>
                <div class="aide">${esc(c.annee || "")}${c.ecole ? " · " + esc(c.ecole) : ""}</div>
                <div>📖 ${c.revisions} · ⚔️ ${c.tests} · moy. ${c.moyenne == null ? "–" : c.moyenne + "%"}</div>
                <div class="aide">${ligneRes(c)}</div></div></a>`).join("")}</div>`
        : `<div class="table-scroll"><table class="historique admin-table" id="admin-liste">
            <thead><tr><th></th><th>Élève</th><th>Année · école</th><th>Révisions</th><th>Examens</th><th>Moyenne globale</th><th>Dernier résultat</th><th>Activité</th></tr></thead>
            <tbody>${comptes.map((c) => `<tr data-href="#/admin/compte/${c.id}" data-filtre="${esc(sansAccents([c.nom, c.identifiant, c.ecole, c.annee, ...c.matieres].join(" ")))}">
              <td><div class="mini-portrait petit">${avatarSVG(c.avatar)}</div></td>
              <td><strong>${esc(c.nom)}</strong><br><span class="aide">@${esc(c.identifiant)}</span></td>
              <td>${esc(c.annee || "")}<br><span class="aide">${esc(c.ecole || "")}</span></td>
              <td><strong>${c.revisions}</strong></td><td>${c.tests}</td>
              <td>${c.moyenne == null ? "–" : `<strong class="${c.moyenne >= 60 ? "ok" : "ko"}">${c.moyenne}%</strong>`}</td>
              <td>${ligneRes(c)}</td>
              <td>${fmtDate(c.derniereActivite)}</td></tr>`).join("")}</tbody></table></div>`}
    </div>`;
  $("#admin-out").addEventListener("click", async () => { await api("/admin/deconnexion", { method: "POST" }); etat.moi.admin = false; location.hash = "#/"; });
  $("#admin-restaurer").addEventListener("change", async (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f || !confirm(`Restaurer « ${f.name} » ? Les comptes et la progression de cette sauvegarde remplaceront ceux du site.`)) return;
    try {
      const r = await api("/admin/restaurer", { method: "POST", body: JSON.parse(await f.text()) });
      toast(`Sauvegarde restaurée : ${r.comptes} compte(s), ${r.fichiers} fichier(s).`);
      router();
    } catch (err) { toast("Restauration impossible : " + err.message, true); }
  });
  app.querySelectorAll("tr[data-href]").forEach((tr) => tr.addEventListener("click", () => (location.hash = tr.dataset.href)));
  $("#admin-filtre").addEventListener("input", (e) => {
    const t = sansAccents(e.target.value.trim());
    app.querySelectorAll("[data-filtre]").forEach((el) => (el.style.display = !t || el.dataset.filtre.includes(t) ? "" : "none"));
  });
}

async function ecranAdminCompte(id) {
  const p = await api("/admin/comptes/" + id);
  app.innerHTML = `
    <div class="actions" style="margin:0 0 16px"><a class="btn blanc petit" href="#/admin">◀ Tous les comptes</a></div>
    ${S.entete(p, { lectureSeule: true })}
    <p class="aide">Compte créé le ${fmtDate(p.cree)}${p.derniereConnexion ? ` · dernière connexion le ${fmtDate(p.derniereConnexion)}` : ""} · mission actuelle : ${esc(p.matiere || "—")}${p.sujet ? " / " + esc(p.sujet) : ""}</p>
    ${vueProgres(p)}
    ${S.photos(p, { lectureSeule: true })}
    <div class="panel"><span class="etiquette">GESTION DU COMPTE</span>
      <form id="form-reset" class="actions" style="align-items:stretch">
        <input id="nouv-mdp" type="password" minlength="6" required placeholder="Nouveau mot de passe (6 caractères min.)" style="flex:1;min-width:200px" autocomplete="new-password">
        <button class="btn">🔑 Réinitialiser le mot de passe</button>
      </form>
      <div class="actions">
        <a class="btn blanc" href="#/profil/${p.id}/modifier">✏️ Modifier le profil</a>
        <button class="btn rouge" id="suppr-compte">🗑 Supprimer le compte</button>
      </div>
    </div>`;

  $("#form-reset").addEventListener("submit", async (e) => {
    e.preventDefault();
    try { await api(`/admin/comptes/${p.id}/mdp`, { method: "POST", body: { motDePasse: $("#nouv-mdp").value } }); toast("Mot de passe changé. Donne-le à " + p.nom + "."); $("#nouv-mdp").value = ""; }
    catch (err) { toast(err.message, true); }
  });
  $("#suppr-compte").addEventListener("click", async () => {
    if (!confirm(`Supprimer définitivement le compte de ${p.nom} ?`)) return;
    await api("/profils/" + p.id, { method: "DELETE" });
    if (etat.moi.profil?.id === p.id) etat.moi.profil = null;
    location.hash = "#/admin";
  });
  $("#galerie")?.addEventListener("click", (e) => { const img = e.target.closest("img"); if (img) window.open(img.src, "_blank"); });
}

// ================= Écran : paramètres =================
async function ecranParametres() {
  etat.status = await api("/status");
  const s = etat.status;
  app.innerHTML = `
    <div class="panel">
      <span class="etiquette">🛡 PARAMÈTRES (ADMIN)</span>
      <div class="actions" style="margin:0 0 12px"><a class="btn blanc petit" href="#/admin">◀ Espace admin</a></div>
      <h2>Intelligence artificielle</h2>
      <p>État : <strong>${s.ia ? "✅ activée" : "⚠️ mode démo"}</strong></p>
      ${s.cleEnv ? `<p class="aide">La clé vient de la variable d'environnement ANTHROPIC_API_KEY du serveur.</p>` : `
      <label for="cle">Clé API Anthropic</label>
      <input id="cle" type="password" placeholder="sk-ant-…" autocomplete="off">
      <p class="aide">La clé est gardée seulement sur l'ordinateur qui fait tourner le module (fichier data/config.json). Elle permet à Sensei de chercher sur internet et de lire tes photos. Obtiens-en une sur console.anthropic.com.</p>
      <div class="actions"><button class="btn rouge" id="save">Enregistrer la clé</button>${s.ia ? `<button class="btn blanc" id="clear">Retirer la clé</button>` : ""}</div>`}
      <p class="aide" style="margin-top:14px">Le minuteur, le nombre de questions et la part de QCM se règlent dans chaque profil (bouton ⚙️ Réglages).</p>
    </div>
    <div class="panel jaune">
      <span class="etiquette">SUR LE MÊME WI-FI</span>
      <p>Ouvre une de ces adresses sur la tablette, le téléphone ou l'ordinateur de l'ado (connecté au même Wi-Fi) :</p>
      <ul class="liste-manga">${s.adresses.map((a) => `<li><strong>${esc(a)}</strong></li>`).join("") || "<li>Aucune adresse réseau trouvée</li>"}</ul>
    </div>`;
  const save = $("#save");
  if (save) save.addEventListener("click", async () => {
    const r = await api("/config", { method: "POST", body: { apiKey: $("#cle").value } });
    toast(r.ia ? "Clé enregistrée ! Sensei est prêt." : "Clé retirée.");
    ecranParametres();
  });
  const clear = $("#clear");
  if (clear) clear.addEventListener("click", async () => { await api("/config", { method: "POST", body: { apiKey: "" } }); ecranParametres(); });
}

// ================= Démarrage =================
// Ouvert par une adresse « abîmée » (ex. /tel/1234 ou /%23/tel/1234 par une appli photo) : on remet l'adresse normale.
if (location.pathname !== "/") {
  const p = decodeURIComponent(location.pathname).replace(/^\/#?/, "/");
  const tel = p.match(/^\/(?:t|tel)\/(\d{4})\/?$/);
  history.replaceState(null, "", "/" + (tel ? `#/tel/${tel[1]}` : location.hash));
}
etat.mobile = estMobile();
document.body.classList.toggle("ui-mobile", etat.mobile);
document.body.classList.toggle("ui-web", !etat.mobile);
Promise.all([
  api("/status").then((s) => (etat.status = s)).catch(() => {}),
  api("/auth/moi").then((m) => (etat.moi = m)).catch(() => {}),
]).finally(router);
