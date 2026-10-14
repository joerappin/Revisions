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
    return ["Français", "Mathématique", "Anglais", "Science et technologie", "Géographie, histoire et éducation à la citoyenneté", "Culture et citoyenneté québécoise", "Arts plastiques", "Musique", "Éducation physique"];
  }
  const base = ["Français", "Anglais langue seconde", "Culture et citoyenneté québécoise", "Arts plastiques", "Musique", "Éducation physique", "Espagnol"];
  if (n <= 2) return ["Mathématique", "Science et technologie", "Géographie", "Histoire et éducation à la citoyenneté", ...base];
  if (n === 3) return ["Mathématique", "Science et technologie", "Histoire du Québec et du Canada", ...base];
  if (n === 4) return ["Mathématique CST", "Mathématique TS", "Mathématique SN", "Science et technologie (ST)", "Applications technologiques et scientifiques (ATS)", "Science et technologie de l'environnement (STE)", "Histoire du Québec et du Canada", ...base];
  return ["Mathématique CST", "Mathématique TS", "Mathématique SN", "Chimie", "Physique", "Monde contemporain", "Éducation financière", ...base];
}
const SUJETS = [
  [/math/i, ["Fractions", "Nombres décimaux", "Pourcentages", "Priorité des opérations", "Nombres entiers", "Équations du premier degré", "Proportionnalité", "Aire et périmètre", "Volume", "Théorème de Pythagore", "Statistiques", "Probabilités", "Fonctions", "Inéquations", "Systèmes d'équations", "Trigonométrie", "Géométrie analytique", "Fonction quadratique", "Exposants et racines"]],
  [/fran/i, ["Accord du participe passé", "Accords dans le groupe du nom", "Conjugaison", "Homophones", "Classes de mots", "Fonctions syntaxiques", "Ponctuation", "Texte narratif", "Texte descriptif", "Texte justificatif", "Texte argumentatif", "Compréhension de lecture", "Figures de style"]],
  [/angl/i, ["Simple present", "Simple past", "Present progressive", "Future (will / going to)", "Vocabulary", "Reading comprehension", "Listening comprehension", "Pronunciation", "Writing a text", "Irregular verbs", "Modals"]],
  [/espagnol/i, ["Saludos y presentaciones", "Verbos ser y estar", "Presente de indicativo", "Vocabulario", "Números", "La familia"]],
  [/science|chimie|physique|ats|ste\b/i, ["La cellule", "Le corps humain", "Propriétés de la matière", "Mélanges et solutions", "Changements physiques et chimiques", "Atome et tableau périodique", "Énergie", "Électricité", "Forces et mouvement", "La Terre et l'Univers", "Écologie", "Génétique", "Ingénierie mécanique", "Ondes et lumière", "Stœchiométrie", "Cinématique"]],
  [/histoire|géographie|monde/i, ["Premiers occupants", "La Nouvelle-France", "La Conquête et le Régime britannique", "Les rébellions de 1837-1838", "La Confédération", "L'industrialisation", "La Révolution tranquille", "Le Québec contemporain", "La sédentarisation", "L'Antiquité", "La Renaissance", "Les territoires urbains", "Les territoires agricoles", "Population", "Environnement"]],
  [/culture|citoy/i, ["Le vivre-ensemble", "La démocratie", "Les droits et libertés", "Le dialogue", "Les identités", "Les relations interpersonnelles", "La société québécoise"]],
  [/financ/i, ["Le budget", "Le crédit", "L'épargne", "Les impôts", "Le monde du travail", "La consommation"]],
  [/arts|musique/i, ["Les couleurs", "Les éléments du langage plastique", "Le rythme", "Les notes de musique", "Les instruments", "Histoire de l'art"]],
  [/physique/i, ["Les habiletés motrices", "La condition physique", "Les saines habitudes de vie"]],
];
const sujetsPour = (m) => (SUJETS.find(([re]) => re.test(m || "")) || [null, []])[1];
const REGLAGES_DEFAUT = { minuteur: true, secondesChoix: 45, secondesOuvertes: 90, nbRevision: 10, nbFinal: 20, pctQcm: 70 };
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

// ================= État =================
const etat = { status: { ia: false, adresses: [] }, ecoles: null, profil: null, quiz: null };
async function chargerEcoles() {
  if (!etat.ecoles) etat.ecoles = await fetch("ecoles.json").then((r) => r.json()).catch(() => []);
  return etat.ecoles;
}
const bandeauDemo = () => etat.status.ia ? "" :
  `<div class="demo-bandeau">MODE DÉMO — questions d'exemple seulement. Ajoute une clé API dans <a href="#/parametres">⚙️ Paramètres</a> pour que Sensei cherche sur internet et crée des tests sur mesure.</div>`;

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
    es.addEventListener("action", (e) => { const a = JSON.parse(e.data); if (this.surAction) this.surAction(a); });
    es.onerror = () => { if (es.readyState === EventSource.CLOSED && this.es === es) { this.es = null; this.code = null; this.telephones = 0; majSyncUI(); } };
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
const routes = [
  [/^#?\/?$/, ecranAccueil],
  [/^#\/nouveau$/, () => ecranFormulaire(null)],
  [/^#\/profil\/(\w+)$/, ecranProfil],
  [/^#\/profil\/(\w+)\/modifier$/, async (id) => ecranFormulaire(await api("/profils/" + id))],
  [/^#\/profil\/(\w+)\/reglages$/, ecranReglages],
  [/^#\/profil\/(\w+)\/revision$/, ecranRevision],
  [/^#\/profil\/(\w+)\/final$/, ecranFinal],
  [/^#\/profil\/(\w+)\/devoirs$/, ecranDevoirs],
  [/^#\/tel\/(\d+)$/, ecranTelephone],
  [/^#\/parametres$/, ecranParametres],
];
async function router() {
  const h = location.hash || "#/";
  window.scrollTo(0, 0);
  arreterMinuteur();
  quitterTelephone();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  sync.surAction = null;
  sync.envoyer({ phase: "attente" });
  for (const [re, fn] of routes) {
    const m = h.match(re);
    if (m) {
      try { await fn(...m.slice(1)); } catch (e) { console.error(e); finChargement(); app.innerHTML = `<div class="panel">${senseiDit("Oups ! " + esc(e.message), "triste")}<a class="btn" href="#/">Retour</a></div>`; }
      return;
    }
  }
  location.hash = "#/";
}
window.addEventListener("hashchange", router);

// ================= Écran : accueil =================
function panneauCodeTel() {
  let dernier = "";
  try { dernier = localStorage.getItem("telCode") || ""; } catch {}
  return `<div class="panel noir code-tel">
    <span class="etiquette">📱 MODE TÉLÉCOMMANDE</span>
    <h2 style="color:var(--jaune)">Tu es sur ton téléphone ?</h2>
    <p>Entre le code affiché sur l'ordinateur pour faire le test avec ton téléphone.</p>
    <form id="form-code" class="actions" style="align-items:stretch">
      <input id="code-tel" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="0000" value="${esc(dernier)}" class="champ-code" aria-label="Code à 4 chiffres">
      <button class="btn">Connecter ⚡</button>
    </form>
  </div>`;
}
async function ecranAccueil() {
  const profils = await api("/profils");
  const mobile = estMobile();
  app.innerHTML = `
    ${mobile ? panneauCodeTel() : ""}
    ${bandeauDemo()}
    ${senseiDit(`<strong>Yo !</strong> Je suis Sensei. Choisis ton héros pour réviser, ou crée un nouveau profil !`)}
    <h1>Choisis ton héros</h1>
    <div class="grille">
      ${profils.map((p, i) => `
        <a class="panel carte-profil ${i % 2 ? "incline-d" : "incline-g"}" href="#/profil/${p.id}">
          <div class="portrait">${avatarSVG(p.avatar)}</div>
          <div class="nom">${esc(p.nom)}</div>
          <div>${esc(p.annee || "")}</div>
          <div class="aide">${esc(p.ecole || "")}</div>
          <div><span class="badge revision">${p.revisions || 0} révision${(p.revisions || 0) > 1 ? "s" : ""}</span></div>
        </a>`).join("")}
      <a class="panel carte-profil carte-nouveau" href="#/nouveau"><div class="plus">+</div><div class="nom">Nouveau profil</div></a>
    </div>
    ${mobile ? "" : `<div style="margin-top:30px">${panneauCodeTel()}</div>`}`;
  $("#form-code").addEventListener("submit", (e) => {
    e.preventDefault();
    const c = $("#code-tel").value.replace(/\D/g, "");
    if (c.length !== 4) return toast("Le code contient 4 chiffres.", true);
    location.hash = "#/tel/" + c;
  });
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
      <span class="etiquette">${p ? "MODIFIER LE PROFIL" : "NOUVEAU HÉROS"}</span>
      <form id="form-profil" autocomplete="off">
        <label>Choisis ton avatar</label>
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
          <button class="btn rouge" type="submit">${p ? "Enregistrer" : "Créer mon profil !"}</button>
          <a class="btn blanc" href="${p ? "#/profil/" + p.id : "#/"}">Annuler</a>
          ${p ? `<button class="btn blanc" type="button" id="suppr">🗑 Supprimer</button>` : ""}
        </div>
      </form>
    </div>`;

  let avatar = v.avatar || "pics-0";
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
    try {
      const r = p ? await api("/profils/" + p.id, { method: "PUT", body: d }) : await api("/profils", { method: "POST", body: d });
      toast(p ? "Profil mis à jour !" : "Bienvenue, " + r.nom + " ! Choisis ta mission.");
      location.hash = "#/profil/" + r.id;
    } catch (err) { toast(err.message, true); }
  });
  if (p) $("#suppr").addEventListener("click", async () => {
    if (!confirm(`Supprimer le profil de ${p.nom} et tous ses résultats ?`)) return;
    if (sync.profilId === p.id) sync.fermer();
    await api("/profils/" + p.id, { method: "DELETE" });
    location.hash = "#/";
  });
}

// ================= Écran : tableau de bord du profil =================
function rang(pct) { return pct >= 90 ? "S" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : "D"; }
function graphique(sessions) {
  const s = sessions.slice(-12);
  if (!s.length) return `<p class="vide">Aucun résultat pour l'instant. Lance ta première révision !</p>`;
  const W = 600, H = 200, pad = 28, bw = Math.min(70, (W - pad * 2) / s.length);
  const y = (v) => H - pad - (v / 100) * (H - pad * 2);
  return `<svg class="graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="Derniers résultats">
    <line x1="${pad}" x2="${W - pad}" y1="${y(60)}" y2="${y(60)}" stroke="#111" stroke-dasharray="6 5" stroke-width="2"/>
    <text x="${W - pad}" y="${y(60) - 5}" text-anchor="end" font-size="12" font-weight="700">seuil de réussite 60 %</text>
    <line x1="${pad}" x2="${W - pad}" y1="${H - pad}" y2="${H - pad}" stroke="#111" stroke-width="3"/>
    ${s.map((x, i) => {
      const h = Math.max(2, (x.pourcentage / 100) * (H - pad * 2));
      const fill = x.type === "final" ? "#e63946" : "#ffd60a";
      return `<g><title>${esc(x.sujet)} — ${x.pourcentage}% (${x.type === "final" ? "test final" : "révision"})</title>
        <rect x="${pad + i * bw + bw * 0.15}" y="${H - pad - h}" width="${bw * 0.7}" height="${h}" fill="${fill}" stroke="#111" stroke-width="2.5"/>
        <text x="${pad + i * bw + bw / 2}" y="${H - pad - h - 6}" text-anchor="middle" font-size="13" font-weight="700">${x.pourcentage}</text></g>`;
    }).join("")}
  </svg>`;
}
function resumeReglages(r) {
  return `${r.minuteur ? `⏱ ${r.secondesChoix} s (choix) / ${r.secondesOuvertes} s (ouvertes)` : "⏱ sans minuteur"} · ${r.nbRevision} questions en révision · ${r.nbFinal} au test final · ${r.pctQcm} % QCM / ${100 - r.pctQcm} % ouvertes`;
}

async function ecranProfil(id) {
  const p = await api("/profils/" + id);
  etat.profil = p;
  if (sync.profilId && sync.profilId !== p.id) sync.fermer();
  await reprendreSync(p);
  const finals = p.sessions.filter((s) => s.type === "final");
  const moy = finals.length ? Math.round(finals.reduce((a, s) => a + s.pourcentage, 0) / finals.length) : null;
  const meilleur = finals.length ? Math.max(...finals.map((s) => s.pourcentage)) : null;
  const matieres = matieresPour(p.annee);
  const listeM = p.matiere && !matieres.includes(p.matiere) ? [p.matiere, ...matieres] : matieres;
  const reg = reglagesDe(p);

  app.innerHTML = `
    ${bandeauDemo()}
    <div class="panel trame">
      <div class="entete-profil">
        <div class="portrait">${avatarSVG(p.avatar)}</div>
        <div style="flex:1;min-width:200px">
          <h1>${esc(p.nom)}</h1>
          <div><strong>${esc(p.annee)}</strong>${p.ecole ? " · " + esc(p.ecole) : ""}${p.ville ? " (" + esc(p.ville) + ")" : ""}</div>
        </div>
        <div class="actions" style="margin:0">
          <a class="btn blanc petit" href="#/profil/${p.id}/modifier">✏️ Modifier</a>
          <a class="btn blanc petit" href="#/profil/${p.id}/reglages">⚙️ Réglages</a>
        </div>
      </div>
    </div>

    <div class="panel jaune">
      <span class="etiquette">TA MISSION</span>
      ${p.matiere && p.sujet ? "" : senseiDit("Choisis ta <strong>matière</strong> puis le <strong>sujet</strong> à réviser pour débloquer les boutons !")}
      <div class="mission">
        <div><label for="m-matiere">1. Matière</label>
          <select id="m-matiere"><option value="">— Choisis ta matière —</option>${listeM.map((m) => `<option ${m === p.matiere ? "selected" : ""}>${esc(m)}</option>`).join("")}</select></div>
        <div><label for="m-sujet">2. Sujet à réviser</label>
          <div class="auto combo">
            <input id="m-sujet" value="${esc(p.sujet || "")}" placeholder="Choisis dans la liste ou écris ton sujet" autocomplete="off">
            <button type="button" class="combo-btn" id="m-sujet-btn" aria-label="Voir tous les sujets">▼</button>
            <ul class="auto-liste" id="m-sujet-liste" hidden></ul>
          </div></div>
      </div>
      <p class="aide" style="color:#111;margin-top:8px">Révisions sur ce sujet : <strong id="revs-sujet">0</strong>. Conseil de Sensei : fais au moins 2 révisions avant le test final !</p>
      <div class="actions">
        <button class="btn rouge" data-go="revision">📖 Réviser</button>
        <button class="btn bleu" data-go="final">⚔️ Test final</button>
        <button class="btn blanc" data-go="devoirs">✍️ Aide aux devoirs</button>
      </div>
      <p class="aide" style="color:#111">${esc(resumeReglages(reg))} — <a href="#/profil/${p.id}/reglages">modifier</a></p>
    </div>

    <div class="panel noir">
      <span class="etiquette">📱 TÉLÉCOMMANDE</span>
      <div id="zone-sync"></div>
    </div>

    <div class="stats panel">
      <span class="etiquette">STATS DU HÉROS</span>
      <div class="stat rev"><div class="val">${p.revisions || 0}</div><div class="lib">révisions faites</div></div>
      <div class="stat"><div class="val">${finals.length}</div><div class="lib">tests finals</div></div>
      <div class="stat"><div class="val">${moy == null ? "–" : moy + "%"}</div><div class="lib">moyenne aux tests</div></div>
      <div class="stat"><div class="val">${meilleur == null ? "–" : rang(meilleur)}</div><div class="lib">meilleur rang${meilleur == null ? "" : ` (${meilleur}%)`}</div></div>
    </div>

    <div class="panel">
      <span class="etiquette">PROGRESSION</span>
      ${graphique(p.sessions)}
      ${p.sessions.length ? `<div class="table-scroll"><table class="historique">
        <thead><tr><th>Date</th><th>Type</th><th>Matière</th><th>Sujet</th><th>Résultat</th></tr></thead>
        <tbody>${[...p.sessions].reverse().slice(0, 25).map((s) => `<tr>
          <td>${fmtDate(s.date)}</td>
          <td><span class="badge ${s.type}">${s.type === "final" ? "Test final" : "Révision"}</span></td>
          <td>${esc(s.matiere)}</td><td>${esc(s.sujet)}</td>
          <td><strong>${s.pourcentage}%</strong> (${s.score}/${s.total})</td></tr>`).join("")}</tbody></table></div>` : ""}
    </div>

    <div class="panel">
      <span class="etiquette">MES PHOTOS DE COURS</span>
      <p>Ajoute des photos de tes notes de cours, de tes exercices ou de tes anciens examens. Sensei les lit pour créer des questions qui ressemblent à celles de ton prof !</p>
      <label class="zone-upload" for="photo-input" style="cursor:pointer">
        📸 <strong>Prendre ou choisir des photos</strong><br><span class="aide">Elles seront classées dans la matière et le sujet de ta mission.</span>
      </label>
      <input type="file" id="photo-input" accept="image/*" multiple hidden>
      <div class="galerie" id="galerie">
        ${p.photos.length ? [...p.photos].reverse().map((ph) => `
          <div class="photo">
            <img src="/photos/${esc(ph.fichier)}" alt="Photo de cours" data-desc="${esc(ph.description || "")}" loading="lazy">
            <button class="suppr" data-suppr="${ph.id}" title="Supprimer">×</button>
            <div class="leg"><strong>${esc(ph.matiere)}</strong>${ph.sujet ? " · " + esc(ph.sujet) : ""}<br>${ph.description ? "✅ analysée" : etat.status.ia ? "⚠️ non analysée" : "mode démo"}</div>
          </div>`).join("") : `<p class="vide">Aucune photo pour l'instant.</p>`}
      </div>
    </div>`;

  // --- Mission : matière puis sujet ---
  const selM = $("#m-matiere"), inS = $("#m-sujet");
  const majMission = () => {
    const ok = !!(selM.value && inS.value.trim());
    app.querySelectorAll("[data-go]").forEach((b) => (b.disabled = b.dataset.go === "devoirs" ? !selM.value : !ok));
    inS.disabled = !selM.value;
    $("#m-sujet-btn").disabled = !selM.value;
    $("#revs-sujet").textContent = p.sessions.filter((s) => s.type === "revision" && s.matiere === selM.value && s.sujet === inS.value.trim()).length;
  };
  const sauverMission = async () => {
    const r = await api("/profils/" + p.id, { method: "PUT", body: { matiere: selM.value, sujet: inS.value.trim() } });
    Object.assign(p, r);
    majMission();
  };
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
  selM.addEventListener("change", () => { inS.value = ""; sauverMission(); if (selM.value) inS.focus(); });
  inS.addEventListener("input", majMission);
  inS.addEventListener("change", sauverMission);
  majMission();

  app.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", async () => {
    await sauverMission();
    location.hash = `#/profil/${p.id}/${b.dataset.go}`;
  }));

  // --- Télécommande ---
  const dessinerSync = () => {
    const z = $("#zone-sync");
    if (sync.code && sync.profilId === p.id) {
      z.innerHTML = `
        <div class="sync-actif">
          <div><div class="aide" style="color:#ddd">CODE</div><div class="gros-code">${esc(sync.code)}</div></div>
          <div style="flex:1;min-width:220px">
            <p>Sur le téléphone, ouvre <strong style="color:var(--jaune)">${esc(etat.status.adresses[0] || location.origin)}</strong>, puis entre ce code dans « Mode télécommande ».</p>
            <p data-sync-statut></p>
            <button class="btn blanc petit" id="sync-off">Déconnecter</button>
          </div>
        </div>`;
      $("#sync-off").addEventListener("click", () => { sync.fermer(); dessinerSync(); });
      majSyncUI();
    } else {
      z.innerHTML = `<p>Fais le test sur l'ordinateur et réponds avec ton téléphone, comme une manette de jeu ! Les questions et le temps restent sur l'écran de l'ordinateur.</p>
        <button class="btn" id="sync-on">📱 Connecter mon téléphone</button>`;
      $("#sync-on").addEventListener("click", async () => {
        try { await sync.activer(p); dessinerSync(); } catch (e) { toast(e.message, true); }
      });
    }
  };
  dessinerSync();

  // --- Photos ---
  $("#photo-input").addEventListener("change", async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    if (!selM.value) { toast("Choisis d'abord ta matière pour classer les photos.", true); e.target.value = ""; return; }
    await sauverMission();
    chargement("Sensei lit tes photos !", ["Il déchiffre l'écriture de ton prof…", "Il repère les notions importantes…", `Photo(s) : ${files.length}`]);
    try {
      for (const f of files) {
        const image = await lirePhoto(f);
        await api(`/profils/${p.id}/photos`, { method: "POST", body: { image, matiere: selM.value, sujet: inS.value } });
      }
      toast(files.length > 1 ? "Photos ajoutées !" : "Photo ajoutée !");
    } catch (err) { toast(err.message, true); }
    finChargement();
    ecranProfil(p.id);
  });
  $("#galerie").addEventListener("click", async (e) => {
    const s = e.target.closest("[data-suppr]");
    if (s) {
      if (!confirm("Supprimer cette photo ?")) return;
      await api(`/profils/${p.id}/photos/${s.dataset.suppr}`, { method: "DELETE" });
      return ecranProfil(p.id);
    }
    const img = e.target.closest("img");
    if (img) {
      const w = window.open(img.src, "_blank");
      if (!w && img.dataset.desc) alert(img.dataset.desc);
    }
  });
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
          <div><label for="r-nf">Test final</label><input id="r-nf" type="number" name="nbFinal" min="10" max="40" value="${r.nbFinal}"></div>
        </div>

        <h3 style="margin-top:20px">⚖️ Types de questions</h3>
        <label for="r-pct">Répartition : <span id="pct-lib"></span></label>
        <input id="r-pct" type="range" name="pctQcm" min="0" max="100" step="10" value="${r.pctQcm}">
        <div class="repartition"><div id="pct-barre"></div></div>
        <p class="aide">QCM = choix multiples et vrai/faux (boutons sur le téléphone). Ouvertes = réponse à écrire (champ texte sur le téléphone). Par défaut : 70 % / 30 %.</p>

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
    for (const k of ["secondesChoix", "secondesOuvertes", "nbRevision", "nbFinal", "pctQcm"]) body[k] = Number(f[k].value);
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
function estCorrectLocal(q, rep, indulgent = false) {
  if (rep == null || String(rep).trim() === "") return false;
  if (estChoix(q)) return rep === q.reponse;
  const a = normaliserNombre(rep), b = normaliserNombre(q.reponse);
  if (!Number.isNaN(a) && !Number.isNaN(b)) return Math.abs(a - b) <= Math.max(Number(q.tolerance) || 0, 1e-9);
  if (q.type === "numerique") return false;
  const attendues = [q.reponse, ...(q.reponses_acceptees || [])].map(normTexte);
  const r = normTexte(rep);
  if (attendues.includes(r)) return true;
  return indulgent && attendues.map(sansAccents).includes(sansAccents(r));
}
// Corrige une liste de réponses; les ouvertes douteuses sont envoyées à Sensei en un seul appel.
async function corrigerTout(z, indices) {
  const aDemander = [];
  for (const i of indices) {
    const q = z.questions[i], rep = z.reponses[i];
    const ok = estCorrectLocal(q, rep, !etat.status.ia);
    z.resultats[i] = { ok, commentaire: "" };
    if (!ok && q.type === "ouverte" && rep && String(rep).trim() && etat.status.ia) aDemander.push(i);
  }
  if (aDemander.length) {
    try {
      const r = await api(`/profils/${etat.profil.id}/corriger`, {
        method: "POST",
        body: { matiere: z.matiere, items: aDemander.map((i) => ({ enonce: z.questions[i].enonce, reponse: z.questions[i].reponse, reponses_acceptees: z.questions[i].reponses_acceptees, reponse_eleve: z.reponses[i] })) },
      });
      aDemander.forEach((i, k) => { const x = r.resultats[k]; if (x) z.resultats[i] = { ok: !!x.correct, commentaire: x.commentaire || "" }; });
    } catch (e) { toast("Correction automatique impossible : " + e.message, true); }
  }
}

// ================= Quiz (révision et test final) =================
function demarrerQuiz({ type, questions, matiere, sujet, sources }) {
  if (!questions?.length) { toast("Aucune question reçue, réessaie.", true); return; }
  const reg = reglagesDe(etat.profil);
  etat.quiz = {
    type, matiere, sujet, sources, reg, i: 0, reponses: [], resultats: [],
    questions: questions.map((q) => ({ ...q, choix: q.type === "qcm" ? melange(q.choix) : q.choix })),
  };
  afficherQuestion();
}

function etatQuestion(z) {
  const q = z.questions[z.i];
  return {
    phase: "question", profil: { nom: etat.profil.nom, avatar: etat.profil.avatar },
    quiz: { type: z.type, sujet: z.sujet, i: z.i, n: z.questions.length },
    question: { type: q.type, choix: estChoix(q) ? q.choix : [], audio: !!q.audio },
    restantMs: resteMs(),
  };
}

function afficherQuestion() {
  const z = etat.quiz, q = z.questions[z.i], n = z.questions.length;
  const lettres = "ABCDEFGH";
  const langue = langueDe(z.matiere);
  const ouverte = !estChoix(q);
  const duree = z.reg.minuteur ? (ouverte ? z.reg.secondesOuvertes : z.reg.secondesChoix) * 1000 : 0;
  let repondue = false;

  app.innerHTML = `
    <div class="progression"><div style="width:${(z.i / n) * 100}%"></div></div>
    ${duree ? `<div id="minuteur" class="minuteur"><span class="sec"></span><div class="jauge"><div></div></div></div>` : ""}
    <div class="panel ${z.type === "final" ? "" : "trame"}">
      <span class="etiquette">${z.type === "final" ? "TEST FINAL" : "RÉVISION"} · ${esc(z.sujet)}</span>
      <div class="question-num">Question ${z.i + 1} / ${n} · ${esc(q.difficulte || "")} · ${ouverte ? "✍️ question ouverte" : "🔘 choix"}</div>
      <p class="enonce">${esc(q.enonce)}</p>
      ${q.audio ? `<button class="btn bleu petit" data-dire="${esc(q.audio)}" data-langue="${langue}">🔊 Écouter</button>` : ""}
      ${ouverte
        ? `<form id="f-ouv" class="actions" style="align-items:stretch"><input id="rep-ouv" ${q.type === "numerique" ? 'inputmode="decimal" placeholder="Ta réponse (nombre)"' : 'placeholder="Écris ta réponse"'} style="flex:1;min-width:160px" autocomplete="off"><button class="btn rouge">Valider</button></form>`
        : `<div class="choix">${q.choix.map((c, k) => `<button data-c="${esc(c)}"><span class="lettre">${lettres[k]}</span><span>${esc(c)}</span></button>`).join("")}</div>`}
      <div id="feedback"></div>
    </div>
    <div class="actions">
      <button class="btn blanc petit" id="abandon">✖ Abandonner</button>
      ${sync.actif ? `<span class="aide" data-sync-statut></span>` : ""}
    </div>`;
  majSyncUI();
  const champ = $("#rep-ouv");
  if (champ && !estMobile()) champ.focus();

  const suivante = () => { z.i++; z.i < n ? afficherQuestion() : terminerQuiz(); };

  const repondre = async (rep, tempsEcoule = false) => {
    if (repondue) return;
    repondue = true;
    arreterMinuteur();
    z.reponses[z.i] = rep;
    if (z.type === "final") {
      sync.envoyer({ ...etatQuestion(z), phase: "envoye", restantMs: null });
      return setTimeout(suivante, tempsEcoule ? 900 : 250);
    }
    app.querySelectorAll(".choix button").forEach((b) => (b.disabled = true));
    const f = $("#f-ouv"); if (f) f.querySelectorAll("input,button").forEach((x) => (x.disabled = true));
    if (ouverte && rep && etat.status.ia) {
      $("#feedback").innerHTML = `<p class="aide">Sensei corrige ta réponse…</p>`;
      sync.envoyer({ ...etatQuestion(z), phase: "correction", restantMs: null });
    }
    await corrigerTout(z, [z.i]);
    const { ok, commentaire } = z.resultats[z.i];
    app.querySelectorAll(".choix button").forEach((b) => {
      if (b.dataset.c === q.reponse) b.classList.add("bon");
      else if (b.dataset.c === rep) b.classList.add("mauvais");
    });
    const cris = tempsEcoule ? ["TEMPS ÉCOULÉ !"] : ok ? ["SUGOI !", "BRAVO !", "PARFAIT !", "YATTA !"] : ["OUPS !", "PRESQUE !", "COURAGE !"];
    const cri = cris[Math.floor(Math.random() * cris.length)];
    $("#feedback").innerHTML = `
      <div class="feedback">
        <div class="eclat ${ok ? "" : "rate"}">${cri}</div>
        <div class="texte">
          ${ok ? "" : `<p><strong>Bonne réponse : ${esc(q.reponse)}</strong></p>`}
          ${commentaire ? `<p><em>${esc(commentaire)}</em></p>` : ""}
          <p>${esc(q.explication)}</p>
          <button class="btn" id="suivant">${z.i + 1 < n ? "Question suivante ▶" : "Voir mon résultat ▶"}</button>
        </div>
      </div>`;
    $("#suivant").focus();
    $("#suivant").addEventListener("click", suivante);
    sync.envoyer({ ...etatQuestion(z), phase: "feedback", restantMs: null, feedback: { ok, cri, bonne: q.reponse, commentaire, dernier: z.i + 1 >= n } });
  };

  app.querySelectorAll(".choix button").forEach((b) => b.addEventListener("click", () => repondre(b.dataset.c)));
  const f = $("#f-ouv");
  if (f) f.addEventListener("submit", (e) => { e.preventDefault(); const v = $("#rep-ouv").value; if (v.trim()) repondre(v); });
  $("#abandon").addEventListener("click", () => { if (confirm("Abandonner ? Ce quiz ne sera pas enregistré.")) location.hash = "#/profil/" + etat.profil.id; });

  // Actions reçues du téléphone
  sync.surAction = (a) => {
    if (a.type === "selection") {
      if (ouverte) { if (champ) champ.value = a.valeur || ""; }
      else app.querySelectorAll(".choix button").forEach((b) => b.classList.toggle("choisi", b.dataset.c === a.valeur));
    } else if (a.type === "reponse") repondre(a.valeur);
    else if (a.type === "suivant" && repondue && $("#suivant")) suivante();
    else if (a.type === "audio" && q.audio) parler(q.audio, langue);
  };

  if (duree) lancerMinuteur(duree, () => repondre(null, true));
  sync.envoyer(etatQuestion(z));
  if (q.audio) setTimeout(() => parler(q.audio, langue), 400);
}

async function terminerQuiz() {
  const z = etat.quiz, p = etat.profil;
  arreterMinuteur();
  sync.surAction = null;
  if (z.type === "final") {
    const nbOuv = z.questions.filter((q, i) => q.type === "ouverte" && z.reponses[i]).length;
    if (nbOuv && etat.status.ia) chargement("Sensei corrige ton test…", ["Il lit tes réponses écrites…", "Il vérifie chaque réponse…"]);
    sync.envoyer({ phase: "correction", profil: { nom: p.nom, avatar: p.avatar } });
    await corrigerTout(z, z.questions.map((_, i) => i));
    finChargement();
  }
  const res = z.questions.map((q, i) => ({ q, rep: z.reponses[i], ...z.resultats[i] }));
  const score = res.filter((r) => r.ok).length, total = res.length;
  const pct = Math.round((score / total) * 100);
  const erreurs = [...new Set(res.filter((r) => !r.ok).map((r) => r.q.notion))];
  let enregistre;
  try {
    enregistre = await api(`/profils/${p.id}/resultats`, { method: "POST", body: { type: z.type, matiere: z.matiere, sujet: z.sujet, score, total, erreurs } });
    etat.profil = enregistre.profil;
  } catch (e) { toast("Résultat non enregistré : " + e.message, true); }
  if (z.type === "revision") sessionStorage.setItem("dejaVues", JSON.stringify(z.questions.map((q) => q.enonce)));

  const r = rang(pct);
  sync.envoyer({ phase: "fin", profil: { nom: p.nom, avatar: p.avatar }, resultat: { pct, score, total, rang: r, type: z.type } });
  const message = pct >= 90 ? "Tu es prêt(e) pour l'examen, champion(ne) !" : pct >= 70 ? "Très bon travail ! Encore une petite révision des points faibles." : pct >= 60 ? "Réussi ! Mais on peut faire mieux — révise les notions ratées." : "Pas de panique : chaque héros perd des combats avant de gagner. On révise encore !";
  app.innerHTML = `
    <div class="panel">
      <span class="etiquette">${z.type === "final" ? "RÉSULTAT DU TEST FINAL" : "FIN DE LA RÉVISION"}</span>
      <div class="resultat-top">
        <div class="rang ${r}">${r}</div>
        <div>
          <div class="gros-score">${pct} %</div>
          <div><strong>${score} / ${total}</strong> bonnes réponses</div>
          ${z.type === "revision" && enregistre ? `<div>Révision n° <strong>${enregistre.profil.revisions}</strong> enregistrée 💾</div>` : ""}
        </div>
      </div>
      <div style="margin-top:18px">${senseiDit(esc(message), pct >= 60 ? "joie" : "triste")}</div>
      ${erreurs.length ? `<p><strong>Notions à retravailler :</strong> ${erreurs.map(esc).join(", ")}</p>` : ""}
      <div class="actions">
        <a class="btn rouge" href="#/profil/${p.id}/revision">📖 Nouvelle révision</a>
        <a class="btn bleu" href="#/profil/${p.id}/final">⚔️ ${z.type === "final" ? "Refaire un test final" : "Passer au test final"}</a>
        <a class="btn blanc" href="#/profil/${p.id}">🏠 Mon profil</a>
      </div>
    </div>
    ${z.type === "final" ? `<div class="panel"><span class="etiquette">CORRIGÉ</span>
      ${res.map((x, i) => `<div class="correction">
        <p><strong>${i + 1}. ${esc(x.q.enonce)}</strong></p>
        <p>${x.ok ? `<span class="ok">✔ ${esc(x.rep)}</span>` : `<span class="ko">✘ ${x.rep == null ? "temps écoulé" : esc(x.rep)}</span> → bonne réponse : <strong>${esc(x.q.reponse)}</strong>`}</p>
        ${x.commentaire ? `<p><em>${esc(x.commentaire)}</em></p>` : ""}
        <p class="aide pre">${esc(x.q.explication)}</p></div>`).join("")}
    </div>` : ""}
    ${sourcesHTML(z.sources)}`;
}
const sourcesHTML = (sources) => sources?.length ? `<div class="panel sources"><span class="etiquette">SOURCES CONSULTÉES</span>
  <ul class="liste-manga">${sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.titre)}</a></li>`).join("")}</ul></div>` : "";

// Prévient le téléphone qu'un quiz est prêt; il peut le lancer à distance.
function phasePret(p, titre, lancer) {
  sync.envoyer({ phase: "pret", profil: { nom: p.nom, avatar: p.avatar }, titre });
  sync.surAction = (a) => { if (a.type === "commencer") lancer(); };
}

// ================= Écran : révision =================
async function ecranRevision(id) {
  const p = etat.profil?.id === id ? etat.profil : (etat.profil = await api("/profils/" + id));
  await reprendreSync(p);
  sync.envoyer({ phase: "chargement", profil: { nom: p.nom, avatar: p.avatar } });
  chargement("Sensei prépare ta révision !", [
    `Recherche sur internet : « ${p.sujet} »…`, "Il vérifie la Progression des apprentissages du Québec…",
    p.photos.length ? "Il relit tes photos de cours…" : "Il rédige ta fiche de révision…",
    "Il dessine des schémas pour t'aider…", `Il prépare ${reglagesDe(p).nbRevision} questions juste pour toi…`, "Encore un peu… les meilleures fiches prennent du temps !",
  ]);
  let data;
  try { data = await api(`/profils/${id}/revision`, { method: "POST", body: { matiere: p.matiere, sujet: p.sujet } }); }
  finally { finChargement(); }
  if (location.hash !== `#/profil/${id}/revision`) return; // l'élève a quitté la page pendant la préparation
  const f = data.fiche, langue = langueDe(p.matiere);
  app.innerHTML = `
    ${data.demo ? bandeauDemo() : ""}
    <div class="panel noir"><span class="etiquette">CHAPITRE ${(p.revisions || 0) + 1}</span>
      <h1 style="color:var(--jaune)">${esc(f.titre)}</h1>
      <p>${esc(p.matiere)} · ${esc(p.sujet)} · ${esc(p.annee)}</p>
    </div>
    ${senseiDit(esc(f.intro))}
    <div class="deux">
      ${f.notions.map((n, i) => `<div class="panel notion ${i % 2 ? "incline-d" : "incline-g"}">
        <span class="etiquette">NOTION ${i + 1}</span>
        <h3>${esc(n.titre)}</h3><p class="pre">${esc(n.explication)}</p>
        ${visuelHTML(n.visuel_svg, "Schéma : " + n.titre)}
        <div class="exemple"><strong>Exemple :</strong> ${esc(n.exemple)}</div>
        ${n.audio?.length ? `<div class="audios"><div class="aide">🎧 Écoute les exemples :</div>${n.audio.map((a) => `<button class="btn-audio" data-dire="${esc(a)}" data-langue="${langue}">🔊 ${esc(a)}</button>`).join("")}</div>` : ""}
      </div>`).join("")}
    </div>
    <div class="deux">
      <div class="panel jaune"><span class="etiquette">ASTUCES</span><ul class="liste-manga">${f.astuces.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div>
      <div class="panel"><span class="etiquette">PIÈGES</span><ul class="liste-manga">${f.pieges.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></div>
    </div>
    ${sourcesHTML(data.sources)}
    <div class="panel trame" style="text-align:center">
      <h2>Prêt(e) pour l'entraînement ?</h2>
      <p>${data.questions.length} questions avec correction immédiate. Ta révision sera comptée dans ton profil.</p>
      <button class="btn rouge" id="go-quiz">⚡ Commencer le quiz de révision</button>
      ${sync.actif ? `<p class="aide" data-sync-statut></p>` : ""}
    </div>`;
  majSyncUI();
  const lancer = () => demarrerQuiz({ type: "revision", questions: data.questions, matiere: p.matiere, sujet: p.sujet, sources: data.sources });
  $("#go-quiz").addEventListener("click", lancer);
  phasePret(p, "Quiz de révision", lancer);
}

// ================= Écran : test final =================
async function ecranFinal(id) {
  const p = etat.profil?.id === id ? etat.profil : (etat.profil = await api("/profils/" + id));
  await reprendreSync(p);
  const reg = reglagesDe(p);
  const revs = p.sessions.filter((s) => s.type === "revision" && s.matiere === p.matiere && s.sujet === p.sujet).length;
  app.innerHTML = `
    ${bandeauDemo()}
    <div class="panel noir"><span class="etiquette">BOSS FINAL</span>
      <h1 style="color:var(--jaune)">Test final : ${esc(p.sujet)}</h1>
      <p>${esc(p.matiere)} · ${esc(p.annee)} · ${reg.nbFinal} questions · ${reg.minuteur ? "⏱ minuteur activé" : "sans minuteur"}</p></div>
    ${senseiDit(revs ? `Tu as fait <strong>${revs}</strong> révision${revs > 1 ? "s" : ""} sur ce sujet. ` + "Le test est noté sur 100 %. Pas de correction pendant le test : tu verras le corrigé complet à la fin. Bonne chance !" : "Attention : tu n'as pas encore révisé ce sujet ! Tu peux quand même tenter le test, mais je te conseille une révision d'abord.", revs ? "joie" : "normal")}
    <div class="actions">
      <button class="btn bleu" id="go">⚔️ Commencer le test</button>
      ${revs ? "" : `<a class="btn rouge" href="#/profil/${p.id}/revision">📖 Réviser d'abord</a>`}
      <a class="btn blanc" href="#/profil/${p.id}">Retour</a>
    </div>
    ${sync.actif ? `<p class="aide" data-sync-statut></p>` : ""}`;
  majSyncUI();
  let enCours = false;
  const lancer = async () => {
    if (enCours) return;
    enCours = true;
    sync.surAction = null;
    sync.envoyer({ phase: "chargement", profil: { nom: p.nom, avatar: p.avatar } });
    chargement("Sensei prépare le boss final !", ["Il simule un vrai examen…", "Il choisit des questions sur tes points faibles…", "Il vérifie chaque réponse deux fois…", "Concentre-toi, respire…"]);
    let data;
    try {
      let dejaVues = [];
      try { dejaVues = JSON.parse(sessionStorage.getItem("dejaVues") || "[]"); } catch {}
      data = await api(`/profils/${id}/final`, { method: "POST", body: { matiere: p.matiere, sujet: p.sujet, dejaVues } });
    } catch (e) { finChargement(); enCours = false; phasePret(p, "Test final", lancer); return toast(e.message, true); }
    finChargement();
    if (location.hash !== `#/profil/${id}/final`) return;
    demarrerQuiz({ type: "final", questions: data.questions, matiere: p.matiere, sujet: p.sujet, sources: data.sources });
  };
  $("#go").addEventListener("click", lancer);
  phasePret(p, "Test final", lancer);
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
  const es = (tel.es = new EventSource(`/api/sync/${code}/flux?role=tel`));
  es.addEventListener("presence", (e) => {
    const d = JSON.parse(e.data);
    $("#tel-etat-co").textContent = d.hotes ? "✅ Connecté à l'ordinateur · code " + code : "⚠️ Ordinateur déconnecté";
  });
  es.addEventListener("etat", (e) => rendreTel(JSON.parse(e.data)));
  es.onerror = () => { const el = $("#tel-etat-co"); if (el) el.textContent = "⏳ Reconnexion…"; };
}

function rendreTel(e) {
  const zone = $("#tel-zone");
  if (!zone) return;
  // Ne redessine pas si c'est la même question (pour garder la sélection et le texte tapé).
  const cle = `${e.phase}:${e.quiz?.type || ""}:${e.quiz?.i ?? ""}`;
  if (cle === tel.cle) return;
  tel.cle = cle;
  clearInterval(tel.tick);
  document.body.classList.remove("flash");
  tel.selection = null;

  if (e.phase === "question") return rendreTelQuestion(zone, e);
  const ecrans = {
    attente: () => `${senseiDit("Prêt ! Lance une révision ou un test final sur l'ordinateur. Ton téléphone deviendra ta manette.")}`,
    chargement: () => `<div class="tel-centre"><div class="sensei grand">${senseiSVG("joie")}</div><h2>Sensei prépare tes questions…</h2><p>Ça peut prendre une minute.</p></div>`,
    pret: () => `<div class="tel-centre"><h2>${esc(e.titre || "Quiz")}</h2><p>Tout est prêt sur l'ordinateur !</p><button class="tel-gros vert" id="tel-go">▶ COMMENCER</button></div>`,
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
  $("#tel-go")?.addEventListener("click", () => { actionTel({ type: "commencer" }); $("#tel-go").disabled = true; });
  $("#tel-suivant")?.addEventListener("click", () => actionTel({ type: "suivant" }));
}

function rendreTelQuestion(zone, e) {
  const q = e.question, lettres = "ABCDEFGH";
  const ouverte = !(q.type === "qcm" || q.type === "vrai_faux");
  zone.innerHTML = `
    <div class="tel-q-entete">
      <div class="question-num">${e.quiz.type === "final" ? "TEST FINAL" : "RÉVISION"} · ${e.quiz.i + 1} / ${e.quiz.n}</div>
      ${e.restantMs != null ? `<div class="tel-temps"><span id="tel-sec"></span><div class="jauge"><div id="tel-jauge"></div></div></div>` : ""}
    </div>
    <p class="aide">${ouverte ? "✍️ Écris ta réponse" : "Lis la question sur l'ordinateur, puis choisis :"}</p>
    ${q.audio ? `<button class="btn bleu petit" id="tel-audio">🔊 Réécouter</button>` : ""}
    ${ouverte
      ? `<textarea id="tel-texte" class="tel-texte" ${q.type === "numerique" ? 'inputmode="decimal"' : ""} placeholder="${q.type === "numerique" ? "Ta réponse (nombre)" : "Ta réponse…"}" rows="3"></textarea>`
      : `<div class="tel-choix ${q.choix.length > 2 ? "" : "deux-col"}">${q.choix.map((c, k) => `<button data-c="${esc(c)}"><span class="lettre">${lettres[k]}</span><span class="txt">${esc(c)}</span></button>`).join("")}</div>`}
    <button class="tel-gros vert" id="tel-ok" disabled>✔ CONFIRMER</button>`;

  const ok = $("#tel-ok");
  if (ouverte) {
    const t = $("#tel-texte");
    let envoiSel;
    t.addEventListener("input", () => {
      ok.disabled = !t.value.trim();
      clearTimeout(envoiSel);
      envoiSel = setTimeout(() => actionTel({ type: "selection", valeur: t.value }), 300); // l'ordi affiche ce qui est tapé
    });
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
    const valeur = ouverte ? $("#tel-texte").value.trim() : tel.selection;
    if (!valeur) return;
    ok.disabled = true;
    ok.textContent = "Envoi…";
    actionTel({ type: "reponse", valeur });
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

// ================= Écran : paramètres =================
async function ecranParametres() {
  etat.status = await api("/status");
  const s = etat.status;
  app.innerHTML = `
    <div class="panel">
      <span class="etiquette">PARAMÈTRES</span>
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
api("/status").then((s) => (etat.status = s)).catch(() => {}).finally(router);
