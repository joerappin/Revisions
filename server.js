// ReviZ — serveur local accessible sur le même Wi-Fi.
// Lancer : npm start   (puis ouvrir l'adresse affichée sur un autre appareil)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { execFile, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import QRCode from "qrcode";
import { carteDepuisRequete } from "./carto.js";
import { genererTestGeo } from "./geo-banque.js";
import { demoRevision, demoFinal, demoDico } from "./demo.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const DATA = process.env.REVIZ_DATA || path.join(ROOT, "data"); // REVIZ_DATA : autre dossier (tests)
const PHOTOS = path.join(DATA, "photos");
const CACHE = path.join(DATA, "recherche");
const DB_FILE = path.join(DATA, "db.json");
const CONFIG_FILE = path.join(DATA, "config.json");
const PORT = Number(process.env.PORT) || 3000;
const MODEL = "claude-opus-5-5";

// ---------- Données gardées dans un dépôt GitHub privé (hébergement gratuit sans disque) ----------
// DONNEES_GIT = git@github.com:compte/depot.git, DONNEES_CLE = clé SSH de déploiement (base64).
// Au démarrage, les données sont récupérées; ensuite chaque changement est envoyé sur GitHub (toutes les 20 s et à l'arrêt).
let gitEnv = null;
if (process.env.DONNEES_GIT && process.env.DONNEES_CLE) {
  const cle = path.join(os.tmpdir(), "reviz-cle-donnees");
  fs.writeFileSync(cle, Buffer.from(process.env.DONNEES_CLE, "base64").toString("utf8"), { mode: 0o600 });
  gitEnv = {
    ...process.env,
    GIT_SSH_COMMAND: `ssh -i ${cle} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=${path.join(os.tmpdir(), "reviz-hotes")}`,
    GIT_AUTHOR_NAME: "ReviZ", GIT_AUTHOR_EMAIL: "reviz@users.noreply.github.com", GIT_COMMITTER_NAME: "ReviZ", GIT_COMMITTER_EMAIL: "reviz@users.noreply.github.com",
  };
  // Port 443 : passe partout, même là où le port SSH habituel est fermé.
  const depot = process.env.DONNEES_GIT.replace(/^git@github\.com:/, "ssh://git@ssh.github.com:443/");
  if (!fs.existsSync(path.join(DATA, ".git"))) {
    fs.rmSync(DATA, { recursive: true, force: true });
    execFileSync("git", ["clone", "-q", depot, DATA], { env: gitEnv, stdio: "inherit" });
  }
  console.log("  Données récupérées depuis", process.env.DONNEES_GIT);
}
let envoiEnCours = null;
function sauverSurGit() {
  if (!gitEnv) return Promise.resolve();
  return (envoiEnCours ||= new Promise((resolve) => {
    const script = 'git add -A && (git diff --cached --quiet || (git commit -qm "Sauvegarde ReviZ" && git push -q origin HEAD))';
    execFile("sh", ["-c", script], { cwd: DATA, env: gitEnv }, (err, _out, e) => {
      if (err) console.error("Sauvegarde GitHub impossible :", String(e || err.message).trim());
      envoiEnCours = null; resolve();
    });
  }));
}
if (gitEnv) {
  setInterval(sauverSurGit, 20e3);
  for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, async () => { await sauverSurGit(); process.exit(0); });
}

const AVATARS = path.join(DATA, "avatars"); // photos de profil (nom aléatoire, affichées aussi sur le téléphone-télécommande)
for (const d of [DATA, PHOTOS, CACHE, AVATARS]) fs.mkdirSync(d, { recursive: true });
function retirerAvatar(p) {
  if (String(p.avatar || "").startsWith("photo:")) fs.rmSync(path.join(AVATARS, path.basename(p.avatar.slice(6))), { force: true });
}

// ---------- Stockage JSON ----------
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}
function writeJSON(file, value) {
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}
const db = readJSON(DB_FILE, { profils: [] });
const saveDb = () => writeJSON(DB_FILE, db);
const config = readJSON(CONFIG_FILE, {});
// En ligne : l'admin est créé au démarrage depuis ADMIN_EMAIL / ADMIN_PASSWORD (personne d'autre ne peut le créer avant toi).
if (!config.admin && process.env.ADMIN_EMAIL && String(process.env.ADMIN_PASSWORD || "").length >= 6) {
  const sel = crypto.randomBytes(16).toString("hex");
  config.admin = { email: process.env.ADMIN_EMAIL.trim().toLowerCase(), sel, hash: crypto.scryptSync(process.env.ADMIN_PASSWORD, sel, 32).toString("hex") };
  writeJSON(CONFIG_FILE, config);
}
// Adresse publique du site (Render la fournit toute seule) : sert au QR code et à la page réseau.
const URL_PUBLIQUE = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");
const newId = () => crypto.randomBytes(6).toString("hex");

// Réglages du test, propres à chaque profil.
const REGLAGES_DEFAUT = { minuteur: true, secondesChoix: 45, secondesOuvertes: 120, nbRevision: 10, nbFinal: 20, pctQcm: 70, pctQcmMaths: 0 };
const BORNES = { secondesChoix: [10, 300], secondesOuvertes: [15, 900], nbRevision: [5, 25], nbFinal: [10, 40], pctQcm: [0, 100], pctQcmMaths: [0, 100] };
function reglagesDe(p) {
  return { ...REGLAGES_DEFAUT, ...(p.reglages || {}) };
}
function nettoyerReglages(b) {
  const r = { minuteur: !!b.minuteur };
  for (const [k, [min, max]] of Object.entries(BORNES)) {
    const v = Math.round(Number(b[k]));
    r[k] = Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : REGLAGES_DEFAUT[k];
  }
  return r;
}
function repartition(n, pctQcm) {
  const choix = Math.round((n * pctQcm) / 100);
  return { choix, ouvertes: n - choix };
}
const estLangue = (m) => /angl|espagnol/i.test(m || "");
const estMaths = (m) => /math/i.test(m || "");
const estHistoire = (m) => /histoire|univers social|monde contemporain/i.test(m || "");
const estGeo = (m) => /g[ée]ograph|univers social/i.test(m || "");
// En maths, la part de QCM a son propre réglage (0 % par défaut : que des questions ouvertes avec calcul).
const pctPour = (reg, matiere) => (estMaths(matiere) ? reg.pctQcmMaths : reg.pctQcm);

// ---------- Client Claude ----------
function apiKey() { return process.env.ANTHROPIC_API_KEY || config.apiKey || ""; }
let client = null, clientKey = "";
function getClient() {
  const key = apiKey();
  if (!key) return null;
  if (!client || clientKey !== key) { client = new Anthropic({ apiKey: key }); clientKey = key; }
  return client;
}

// Appel générique : streaming + repli serveur en cas de refus + reprise des pause_turn.
async function ask({ system, content, tools, schema, effort = "medium", maxTokens = 32000 }) {
  const c = getClient();
  if (!c) throw new Error("Aucune clé API configurée");
  const messages = [{ role: "user", content }];
  const base = { model: MODEL, max_tokens: maxTokens, system, output_config: { effort } };
  if (tools) base.tools = tools;
  if (schema) base.output_config.format = { type: "json_schema", schema };

  let useFallback = true;
  let final;
  const blocs = []; // tous les blocs reçus, pour récupérer les sources même après une pause_turn
  for (let tour = 0; tour < 4; tour++) {
    const params = { ...base, messages };
    let msg;
    try {
      msg = useFallback
        ? await c.beta.messages.stream({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" }).finalMessage()
        : await c.messages.stream(params).finalMessage();
    } catch (err) {
      // Si le compte n'a pas accès au repli serveur, on réessaie sans.
      if (useFallback && err instanceof Anthropic.BadRequestError && /fallback/i.test(err.message)) {
        useFallback = false; tour--; continue;
      }
      throw err;
    }
    if (msg.stop_reason === "refusal") throw new Error("La demande a été refusée par le modèle. Reformule le sujet.");
    blocs.push(...msg.content);
    if (msg.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: msg.content });
      final = msg;
      continue;
    }
    final = msg;
    break;
  }
  if (final.stop_reason === "max_tokens") throw new Error("Réponse trop longue, réessaie.");
  const text = final.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const sources = [];
  for (const b of blocs) {
    if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
      for (const r of b.content) if (r.url) sources.push({ titre: r.title || r.url, url: r.url });
    }
  }
  return { text, sources, json: schema ? JSON.parse(text) : null };
}

const SYSTEM = `Tu es « Sensei », un tuteur bienveillant et énergique pour les élèves du Québec (primaire et secondaire).
Tu suis le Programme de formation de l'école québécoise (PFEQ) et la Progression des apprentissages du ministère de l'Éducation du Québec.
Tu écris en français québécois standard, clair, adapté à l'âge de l'élève, avec un ton motivant façon manga (sans exagérer).
Écris les maths en texte simple avec des symboles Unicode (×, ÷, ², ³, √, π, ≤, ≥, ½) — jamais de LaTeX.
Vérifie soigneusement chaque réponse et chaque calcul avant de la donner : une erreur dans le corrigé nuit à l'élève.`;

// ---------- Recherche web (mise en cache par niveau/matière/sujet) ----------
async function recherche(annee, matiere, sujet) {
  const key = crypto.createHash("sha1").update(`${annee}|${matiere}|${sujet}`.toLowerCase()).digest("hex");
  const file = path.join(CACHE, key + ".json");
  const cached = readJSON(file, null);
  if (cached) return cached;
  const r = await ask({
    system: SYSTEM,
    effort: "medium",
    maxTokens: 16000,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3, user_location: { type: "approximate", country: "CA", region: "Quebec" } }],
    content: `Fais une recherche sur internet pour préparer une séance de révision.
Élève : ${annee} au Québec. Matière : ${matiere}. Sujet : ${sujet}.
Cherche en priorité dans des sources québécoises fiables (Alloprof, education.gouv.qc.ca, Progression des apprentissages, sites de centres de services scolaires, Récit).
Rédige ensuite des notes de préparation concises (max ~900 mots) :
- ce que la Progression des apprentissages attend à ce niveau pour ce sujet;
- les notions clés, définitions, règles ou formules exactes;
- 3 à 5 exemples types d'exercices avec la solution;
- les erreurs fréquentes des élèves;
- s'il y a une épreuve ministérielle ou un examen de fin d'année pertinent, son format.`,
  });
  const out = { notes: r.text, sources: dedupeSources(r.sources).slice(0, 8), date: new Date().toISOString() };
  writeJSON(file, out);
  return out;
}
function dedupeSources(list) {
  const seen = new Set();
  return list.filter((s) => (seen.has(s.url) ? false : seen.add(s.url)));
}

// ---------- Personnalisation ----------
function contexteProfil(p, matiere, sujet) {
  const sessions = p.sessions.filter((s) => s.matiere === matiere);
  const erreurs = {};
  for (const s of sessions.slice(-10)) for (const n of s.erreurs || []) erreurs[n] = (erreurs[n] || 0) + 1;
  const faibles = Object.entries(erreurs).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n]) => n);
  const derniers = sessions.slice(-5).map((s) => `${s.type === "final" ? "test final" : "révision"} « ${s.sujet} » : ${s.pourcentage}%`);
  const photos = p.photos.filter((ph) => ph.matiere === matiere);
  const lignes = [
    `Élève : ${p.nom}, ${p.annee}${p.ecole ? `, école ${p.ecole}` : ""}.`,
    derniers.length ? `Derniers résultats dans cette matière : ${derniers.join("; ")}.` : "Première séance dans cette matière.",
    faibles.length ? `Notions où l'élève s'est trompé récemment (à retravailler en priorité) : ${faibles.join(", ")}.` : "",
    photos.length ? `Notes de cours/exercices photographiés par l'élève (utilise le même vocabulaire, les mêmes méthodes et le même style d'exercices que son enseignant) :\n${photos.slice(-8).map((ph, i) => `[Photo ${i + 1} — ${ph.sujet || "sans sujet"}] ${ph.description || "(non analysée)"}`).join("\n")}` : "",
  ];
  return lignes.filter(Boolean).join("\n");
}
// Jusqu'à 3 photos récentes du même sujet (ou de la matière) jointes directement au prompt.
function imagesProfil(p, matiere, sujet) {
  const memeMatiere = p.photos.filter((ph) => ph.matiere === matiere);
  const memeSujet = memeMatiere.filter((ph) => ph.sujet && sujet && ph.sujet.toLowerCase() === sujet.toLowerCase());
  return (memeSujet.length ? memeSujet : memeMatiere).slice(-3).flatMap((ph) => {
    try {
      const data = fs.readFileSync(path.join(PHOTOS, ph.fichier)).toString("base64");
      return [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data } }];
    } catch { return []; }
  });
}

// ---------- Schémas de sortie ----------
const QUESTION = {
  type: "object",
  additionalProperties: false,
  required: ["type", "enonce", "choix", "elements", "image_svg", "image_url", "indice", "reponse", "reponses_acceptees", "tolerance", "audio", "explication", "demarche", "explications_choix", "notion", "difficulte"],
  properties: {
    type: { type: "string", enum: ["qcm", "vrai_faux", "numerique", "ouverte", "ordre"] },
    elements: { type: "array", items: { type: "string" }, description: "Type ordre (frise chronologique) : 4 à 6 événements dans le BON ordre chronologique, avec la date entre parenthèses. [] pour les autres types" },
    image_svg: { type: "string", description: "Image SVG autonome nécessaire à la question (tenue d'époque, figure géométrique, schéma…) ou \"\"" },
    indice: { type: "string", description: "Indice qui aide l'élève à trouver SANS donner la réponse (ex. une piste, un repère, la première lettre). \"\" en français et en maths" },
    image_url: { type: "string", description: "Image fournie par le site, ou \"\" : drapeau « /drapeaux/<code iso2>.svg » (ex. /drapeaux/fr.svg) ou carte « /api/carte?region=<monde|europe|ameriques|afrique>&rouge=<iso2 ou continent>&numeros=<iso2,iso2>&capitales=1&noms=1&continents=1 »" },
    enonce: { type: "string" },
    choix: { type: "array", items: { type: "string" }, description: "4 choix courts pour qcm, [\"Vrai\",\"Faux\"] pour vrai_faux, [] pour numerique et ouverte" },
    reponse: { type: "string", description: "Texte exact du bon choix (qcm/vrai_faux), nombre (numerique, point décimal) ou réponse modèle courte (ouverte)" },
    reponses_acceptees: { type: "array", items: { type: "string" }, description: "Pour ouverte : variantes acceptées (synonymes, formes équivalentes). [] sinon" },
    tolerance: { type: "number", description: "Écart accepté pour numerique, 0 sinon" },
    audio: { type: "string", description: "Matières de langue seulement : phrase à faire écouter à l'élève (dans la langue étudiée) pour une question d'écoute. \"\" sinon" },
    explication: { type: "string", description: "Pourquoi la bonne réponse est la bonne, en enseignant la règle" },
    demarche: { type: "string", description: "Maths et sciences : TOUTES les étapes du calcul ou du raisonnement, une étape par ligne (1. … 2. … 3. …), avec vérification finale. \"\" pour les autres matières" },
    explications_choix: {
      type: "array",
      description: "qcm et vrai_faux : pour CHAQUE mauvais choix, l'erreur précise qui mène à ce choix. [] pour numerique et ouverte",
      items: { type: "object", additionalProperties: false, required: ["choix", "pourquoi"], properties: { choix: { type: "string" }, pourquoi: { type: "string" } } },
    },
    notion: { type: "string", description: "Nom court de la notion évaluée" },
    difficulte: { type: "string", enum: ["facile", "moyen", "difficile"] },
  },
};
const SCHEMA_REVISION = {
  type: "object",
  additionalProperties: false,
  required: ["fiche", "questions"],
  properties: {
    fiche: {
      type: "object",
      additionalProperties: false,
      required: ["titre", "intro", "notions", "astuces", "pieges"],
      properties: {
        titre: { type: "string" },
        intro: { type: "string" },
        notions: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["titre", "explication", "exemple", "visuel_svg", "visuel_url", "audio"],
            properties: {
              titre: { type: "string" },
              explication: { type: "string" },
              exemple: { type: "string" },
              visuel_svg: { type: "string", description: "Schéma SVG autonome illustrant la notion" },
              visuel_url: { type: "string", description: "Carte du site (même format que image_url, ex. /api/carte?region=europe&capitales=1&noms=1) ou \"\"" },
              audio: { type: "array", items: { type: "string" }, description: "Matières de langue : 2 à 4 phrases d'exemple à écouter, dans la langue étudiée. [] sinon" },
            },
          },
        },
        astuces: { type: "array", items: { type: "string" } },
        pieges: { type: "array", items: { type: "string" } },
      },
    },
    questions: { type: "array", items: QUESTION },
  },
};
const SCHEMA_FINAL = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: { questions: { type: "array", items: QUESTION } },
};
const SCHEMA_DEVOIRS = {
  type: "object",
  additionalProperties: false,
  required: ["comprendre", "methode", "indices", "solution", "verification"],
  properties: {
    comprendre: { type: "string", description: "Ce que l'exercice demande, reformulé simplement" },
    methode: { type: "string", description: "La méthode/règle à appliquer, avec un exemple semblable résolu" },
    indices: { type: "array", items: { type: "string" }, description: "2 à 4 indices progressifs" },
    solution: { type: "string", description: "Solution complète étape par étape" },
    verification: { type: "string", description: "Comment l'élève peut vérifier sa réponse" },
  },
};

const SCHEMA_CORRECTION = {
  type: "object",
  additionalProperties: false,
  required: ["resultats"],
  properties: {
    resultats: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["correct", "points", "commentaire"],
        properties: {
          correct: { type: "boolean" },
          points: { type: "number", enum: [0, 0.5, 1], description: "1 = juste; 0.5 = à moitié (bon résultat sans calcul valable, ou bonne démarche avec une petite erreur); 0 = faux" },
          commentaire: { type: "string", description: "1 à 3 phrases pour l'élève" },
        },
      },
    },
  },
};

function nettoyerQuestions(qs) {
  return (qs || []).map((q) => ({ demarche: "", explications_choix: [], elements: [], indice: "", ...q, image_svg: nettoyerSvg(q.image_svg), image_url: nettoyerUrlImage(q.image_url) }))
    .map((q) => (q.type === "ordre" ? { ...q, reponse: q.elements.join(" → ") } : q)).filter((q) => {
    if (q.type === "ordre") return q.elements.length >= 3;
    if (q.type === "numerique") return !Number.isNaN(parseFloat(String(q.reponse).replace(",", ".")));
    if (q.type === "ouverte") return String(q.reponse).trim() !== "";
    return q.choix.length >= 2 && q.choix.includes(q.reponse);
  });
}
// Seules les images du site sont permises : drapeaux et cartes générées.
function nettoyerUrlImage(u) {
  const s = String(u || "").trim();
  return /^\/drapeaux\/[a-z]{2}\.svg$/.test(s) || /^\/api\/carte\?[\w=&,.%-]{1,300}$/.test(s) ? s : "";
}
function nettoyerSvg(svg) {
  const s = String(svg || "").trim();
  return /^<svg[\s>]/i.test(s) && s.length < 30000 ? s : "";
}

const CONSIGNES_SVG = `Pour visuel_svg : un schéma SVG simple et lisible (style manga : traits noirs épais, aplats #ffd60a jaune, #e63946 rouge, #2b6cff bleu, fond blanc) qui aide vraiment à comprendre la notion (diagramme, ligne du temps, tableau, figure géométrique, barres de fractions, carte simplifiée, flèches d'accord…).
Règles : commence par <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220">, pas de script, pas d'image externe, police font-family="Arial", textes en français (ou dans la langue étudiée), taille ≥ 13, rien qui dépasse du cadre. Mets "" si un visuel n'aide pas.`;

function consignesQuestions(n, r, matiere) {
  const lang = estLangue(matiere);
  return `${n} questions au total : exactement ${r.choix} à choix (qcm ou vrai_faux) et ${r.ouvertes} ouvertes (type "numerique" pour une réponse qui est un nombre, sinon type "ouverte" avec une réponse courte : un mot, une expression ou une phrase courte, corrigeable sans ambiguïté; liste les variantes acceptées dans reponses_acceptees).
Indice : sauf en français et en maths, donne pour chaque question un indice court qui met sur la piste sans donner la réponse.
Corrections : l'explication enseigne la règle; si la matière est les maths ou les sciences, "demarche" détaille chaque étape du calcul (une par ligne, avec les nombres réels de la question et une vérification); pour chaque mauvais choix, "explications_choix" dit exactement quelle erreur mène à ce choix (ex. « tu as additionné les dénominateurs »).
${estHistoire(matiere) ? `Histoire : inclus au moins 2 frises chronologiques (type "ordre", 4 à 6 événements avec leur date) et des questions avec image (image_svg) : tenues vestimentaires d'époque à identifier, objets, monuments, cartes. Les questions "ordre" comptent dans les questions à choix.` : ""}
${estGeo(matiere) ? `Géographie : utilise les cartes et drapeaux du site via image_url (cartes réelles de type atlas scolaire) : « quel pays est en rouge ? » (/api/carte?region=europe&rouge=fr), « quel pays porte le numéro 2 ? » (/api/carte?region=afrique&numeros=ng,ke,eg), « à quel pays appartient ce drapeau ? » (/drapeaux/ca.svg), capitales. Régions disponibles : monde (rouge = nom de continent, continents=1), europe, ameriques, afrique. Pour les notions, mets une carte dans visuel_url.` : ""}
${estMaths(matiere) ? `Maths : les questions ouvertes doivent demander un calcul (l'élève écrit sa démarche ET un résultat final); mets le résultat attendu dans reponse. Utilise image_svg pour les figures géométriques.` : ""}
${CONSIGNES_SVG.replace("Pour visuel_svg", "Pour image_svg (et visuel_svg)")}
${lang ? `C'est une matière de langue : inclus au moins 2 questions d'écoute avec le champ audio (phrase lue à voix haute à l'élève, l'énoncé dit « Écoute la phrase… »). Ailleurs audio = "".` : `Le champ audio est toujours "".`}`;
}

// ---------- Cache des leçons et préparation en arrière-plan ----------
// Une leçon générée est gardée sur disque : la rouvrir est instantané. Les générations en cours
// sont partagées (si l'élève clique pendant la préparation, il attend la même génération).
const LECONS = path.join(DATA, "lecons");
fs.mkdirSync(LECONS, { recursive: true });
const enCours = new Map();
const cleLecon = (p, matiere, sujet) => crypto.createHash("sha1").update(`${p.id}|${matiere}|${sujet}`.toLowerCase()).digest("hex");
function partager(cle, fabrique) {
  if (!enCours.has(cle)) enCours.set(cle, fabrique().finally(() => enCours.delete(cle)));
  return enCours.get(cle);
}
async function obtenirLecon(p, matiere, sujet, { nouvelle = false } = {}) {
  const fichier = path.join(LECONS, cleLecon(p, matiere, sujet) + ".json");
  if (!nouvelle) { const c = readJSON(fichier, null); if (c) return c; }
  return partager("lecon:" + fichier, async () => {
    const l = await genererRevision(p, matiere, sujet);
    if (!l.demo) writeJSON(fichier, { ...l, date: new Date().toISOString() });
    return l;
  });
}
// Le test final se prépare pendant que l'élève lit sa leçon; il est consommé une seule fois.
const finalsPrets = new Map();
function prechaufferFinal(p, matiere, sujet, dejaVues) {
  const cle = cleLecon(p, matiere, sujet);
  if (!finalsPrets.has(cle)) {
    const pr = genererFinal(p, matiere, sujet, dejaVues);
    pr.catch(() => finalsPrets.delete(cle));
    finalsPrets.set(cle, pr);
  }
}
function prendreFinal(p, matiere, sujet, dejaVues) {
  const cle = cleLecon(p, matiere, sujet);
  const pr = finalsPrets.get(cle) || genererFinal(p, matiere, sujet, dejaVues);
  finalsPrets.delete(cle);
  return pr;
}

// ---------- Leçon créée à partir de photos ----------
const LECONS_PHOTO = path.join(DATA, "lecons-photo");
fs.mkdirSync(LECONS_PHOTO, { recursive: true });
async function genererLeconPhoto(p, matiere, sujet, fichiers) {
  const reg = reglagesDe(p);
  if (!getClient()) {
    const d = demoRevision(matiere, sujet, reg.nbRevision, pctPour(reg, matiere));
    d.fiche = { ...d.fiche, titre: "Ta leçon en photo (démo)", intro: "Mode démo : Sensei ne peut pas lire la photo sans clé API. Voici un exemple de leçon et de révision. Avec une clé API, la leçon et la révision sont créées à partir de ce qui est écrit sur ta photo." };
    return d;
  }
  const n = reg.nbRevision, rep = repartition(n, pctPour(reg, matiere));
  const images = fichiers.map((f) => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: fs.readFileSync(path.join(PHOTOS, f)).toString("base64") } }));
  const r = await ask({
    system: SYSTEM,
    schema: SCHEMA_REVISION,
    maxTokens: 64000,
    content: [...images, {
      type: "text",
      text: `${contexteProfil(p, matiere, sujet)}

L'élève a photographié sa leçon (${matiere}${sujet ? `, « ${sujet} »` : ""}, ${p.annee}). Lis attentivement TOUT le contenu des photos (texte, schémas, exemples, exercices).
1. Fais-en une leçon explicative et visuelle, fidèle à la photo : reprends les définitions, règles, méthodes et le vocabulaire de l'enseignant, en les expliquant plus simplement. Titre accrocheur style manga (tiré du contenu), intro courte, 4 à 6 notions (explication + exemple résolu + visuel + ${estLangue(matiere) ? "exemples audio" : "audio = []"}), 3 astuces, 2 à 4 pièges.
${CONSIGNES_SVG}
2. Un test qui vérifie que l'élève a compris CE contenu précis (pas d'autres notions). ${consignesQuestions(n, rep, matiere)}
Si une partie de la photo est illisible, n'invente rien : base-toi seulement sur ce qui est lisible.`,
    }],
  });
  for (const no of r.json.fiche.notions) { no.visuel_svg = nettoyerSvg(no.visuel_svg); no.visuel_url = nettoyerUrlImage(no.visuel_url); }
  return { ...r.json, questions: nettoyerQuestions(r.json.questions), sources: [] };
}

// ---------- Routes IA ----------
async function genererRevision(p, matiere, sujet) {
  const reg = reglagesDe(p);
  if (!getClient()) return demoRevision(matiere, sujet, reg.nbRevision, pctPour(reg, matiere));
  const rech = await recherche(p.annee, matiere, sujet);
  const n = reg.nbRevision, rep = repartition(n, pctPour(reg, matiere));
  const content = [
    ...imagesProfil(p, matiere, sujet),
    {
      type: "text",
      text: `${contexteProfil(p, matiere, sujet)}

Notes de recherche sur le sujet :
${rech.notes}

Crée une séance de révision sur « ${sujet} » (${matiere}, ${p.annee}) :
1. Une fiche de révision : titre accrocheur style manga, intro courte (2-3 phrases), 4 à 6 notions (explication claire + exemple concret résolu + visuel + ${estLangue(matiere) ? "exemples audio" : 'audio = []'}), 3 astuces de mémorisation, 2 à 4 pièges fréquents.
${CONSIGNES_SVG}
${estLangue(matiere) ? "Pour audio des notions : 2 à 4 phrases d'exemple naturelles dans la langue étudiée, qui illustrent la notion, que l'élève pourra écouter." : ""}
2. Des questions de révision progressives (facile → difficile) qui couvrent toutes les notions, en insistant sur les notions faibles de l'élève. ${consignesQuestions(n, rep, matiere)}
Chaque explication doit enseigner, pas seulement corriger.
Si des photos sont jointes, inspire-toi de leurs exercices et de leur vocabulaire.`,
    },
  ];
  const r = await ask({ system: SYSTEM, content, schema: SCHEMA_REVISION, maxTokens: 64000 });
  for (const no of r.json.fiche.notions) { no.visuel_svg = nettoyerSvg(no.visuel_svg); no.visuel_url = nettoyerUrlImage(no.visuel_url); }
  return { ...r.json, questions: nettoyerQuestions(r.json.questions), sources: rech.sources };
}

async function genererFinal(p, matiere, sujet, dejaVues) {
  const reg = reglagesDe(p);
  if (!getClient()) return demoFinal(matiere, sujet, reg.nbFinal, pctPour(reg, matiere));
  const n = reg.nbFinal, rep = repartition(n, pctPour(reg, matiere));
  const rech = await recherche(p.annee, matiere, sujet);
  const content = [
    ...imagesProfil(p, matiere, sujet),
    {
      type: "text",
      text: `${contexteProfil(p, matiere, sujet)}

Notes de recherche sur le sujet :
${rech.notes}

Crée le TEST FINAL sur « ${sujet} » (${matiere}, ${p.annee}), comme une simulation d'examen noté sur 100 %.
Environ 30 % faciles, 45 % moyennes, 25 % difficiles, couvrant toutes les notions du sujet au niveau attendu par la Progression des apprentissages; si une épreuve ministérielle existe pour ce niveau, imite son style.
${consignesQuestions(n, rep, matiere)}
Insiste sur les notions faibles de l'élève.
${dejaVues?.length ? `Ne réutilise pas ces questions déjà vues en révision :\n${dejaVues.slice(0, 30).map((e) => "- " + e).join("\n")}` : ""}`,
    },
  ];
  const r = await ask({ system: SYSTEM, content, schema: SCHEMA_FINAL, maxTokens: 64000 });
  return { questions: nettoyerQuestions(r.json.questions), sources: rech.sources };
}

// Correction des réponses ouvertes qui ne correspondent pas mot pour mot au corrigé.
async function corriger(p, matiere, items) {
  if (!getClient() || !items.length) return items.map(() => ({ correct: false, points: 0, commentaire: "" }));
  const r = await ask({
    system: SYSTEM,
    effort: "low",
    maxTokens: 8000,
    schema: SCHEMA_CORRECTION,
    content: `Corrige les réponses écrites d'un élève de ${p.annee} en ${matiere}. Pour chaque item, dis si la réponse est correcte sur le fond.
Accepte les synonymes, les formulations équivalentes, les fautes d'orthographe et de frappe, les accents oubliés ou en trop et un « s » final manquant ou en trop, SAUF en français quand la question évalue justement l'orthographe, la grammaire, les accords ou la conjugaison (alors l'écriture exacte compte).
Quand tu acceptes une réponse malgré une faute d'orthographe, commence le commentaire par « Attention à l'orthographe : on écrit … » avec la bonne orthographe.
Quand l'élève a écrit son calcul, il compte dans la note : points = 1 si le résultat final est juste ET le calcul est valable; 0.5 si le résultat est juste mais le calcul est absent, faux ou incohérent, OU si la démarche est bonne mais qu'une petite erreur de calcul fausse le résultat; 0 sinon. Sans calcul demandé : 1 ou 0.
Donne un commentaire encourageant (1 à 3 phrases) : si c'est faux ou à moitié juste, explique précisément l'erreur (en maths : à quelle ligne de son calcul il se trompe et ce qu'il aurait fallu faire). Réponds dans le même ordre.

${items.map((it, i) => `Item ${i + 1}
Question : ${it.enonce}
Réponse attendue : ${it.reponse}${it.reponses_acceptees?.length ? ` (aussi acceptées : ${it.reponses_acceptees.join(" | ")})` : ""}
Réponse de l'élève : ${it.reponse_eleve}${it.calcul ? `\nCalcul de l'élève :\n${it.calcul}` : ""}`).join("\n\n")}`,
  });
  const res = r.json.resultats || [];
  return items.map((_, i) => res[i] || { correct: false, points: 0, commentaire: "" });
}

async function analyserPhoto(p, photo) {
  if (!getClient()) return;
  try {
    const data = fs.readFileSync(path.join(PHOTOS, photo.fichier)).toString("base64");
    const r = await ask({
      system: SYSTEM,
      effort: "low",
      maxTokens: 8000,
      content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data } },
        { type: "text", text: `Photo prise par un élève de ${p.annee} (matière : ${photo.matiere}${photo.sujet ? `, sujet : ${photo.sujet}` : ""}). Transcris l'essentiel puis résume en 150 mots max : type de document (notes de cours, exercice, examen…), notions abordées, méthodes et vocabulaire de l'enseignant, types d'exercices. Texte brut, sans titre.` },
      ],
    });
    photo.description = r.text.trim();
  } catch (e) {
    photo.description = "";
    console.error("Analyse photo échouée :", e.message);
  }
  saveDb();
}

// ---------- Dictionnaire anglais → français ----------
const DICO_FILE = path.join(DATA, "dico.json");
const dicoCache = readJSON(DICO_FILE, {});
const ENTREE_DICO = {
  type: "object",
  additionalProperties: false,
  required: ["mot", "phonetique", "nature", "traductions", "exemple_en", "exemple_fr", "synonymes_en", "synonymes_fr"],
  properties: {
    mot: { type: "string", description: "Le mot ou l'expression tel que saisi (corrigé s'il y avait une faute de frappe évidente)" },
    phonetique: { type: "string", description: "Prononciation API, ex. /ˈhæp.i/ ; \"\" pour une phrase" },
    nature: { type: "string", description: "nom, verbe, adjectif, adverbe, expression, phrase… (en français)" },
    traductions: { type: "array", items: { type: "string" }, description: "1 à 4 traductions françaises, la plus courante en premier" },
    exemple_en: { type: "string", description: "Phrase d'exemple simple en anglais utilisant le mot" },
    exemple_fr: { type: "string", description: "Traduction française de l'exemple" },
    synonymes_en: { type: "array", items: { type: "string" }, description: "2 à 5 synonymes anglais ([] pour une phrase)" },
    synonymes_fr: { type: "array", items: { type: "string" }, description: "2 à 5 synonymes français de la traduction ([] pour une phrase)" },
  },
};
const SCHEMA_DICO = { type: "object", additionalProperties: false, required: ["entrees"], properties: { entrees: { type: "array", items: ENTREE_DICO } } };

function decouperDico(texte) {
  const morceaux = String(texte || "").split(/[\n,;]+/).map((s) => s.trim().replace(/\s+/g, " ")).filter(Boolean);
  return [...new Set(morceaux.map((s) => s.slice(0, 200)))].slice(0, 15);
}
async function dico(p, texte) {
  const items = decouperDico(texte);
  if (!items.length) return { entrees: [] };
  if (!getClient()) return { demo: true, entrees: demoDico(items) };
  const cle = (s) => s.toLowerCase();
  const manquants = items.filter((s) => !dicoCache[cle(s)]);
  if (manquants.length) {
    const r = await ask({
      system: SYSTEM,
      effort: "low",
      maxTokens: 12000,
      schema: SCHEMA_DICO,
      content: `Tu es un dictionnaire anglais → français pour un élève québécois de ${p?.annee || "secondaire"}.
Pour chaque élément ci-dessous (dans le même ordre, une entrée par élément), donne : la prononciation, la nature, les traductions françaises (français du Québec quand l'usage diffère, ex. « fin de semaine »), un exemple simple en anglais et sa traduction, des synonymes anglais et français.
Si un élément est une phrase entière, traduis la phrase au complet (nature « phrase », exemple = la phrase elle-même, synonymes vides).
Si un élément n'est pas de l'anglais, traduis-le quand même vers le français si possible.

${manquants.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    });
    (r.json.entrees || []).forEach((e, i) => { if (manquants[i]) dicoCache[cle(manquants[i])] = e; });
    writeJSON(DICO_FILE, dicoCache);
  }
  return { entrees: items.map((s) => dicoCache[cle(s)]).filter(Boolean) };
}

async function aideDevoirs(p, { matiere, question, image }) {
  if (!getClient()) {
    return {
      comprendre: "Mode démo : configure une clé API dans ⚙️ Paramètres pour que Sensei lise ton exercice.",
      methode: "1. Relis la consigne et souligne les mots importants.\n2. Trouve la règle ou la formule vue en classe.\n3. Fais un petit exemple plus simple avant.",
      indices: ["Qu'est-ce qu'on te demande exactement ?", "Quelles données as-tu ?"],
      solution: "Disponible avec une clé API.",
      verification: "Relis ta réponse : est-elle logique ? As-tu répondu à la question posée ?",
    };
  }
  const content = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } });
  content.push({
    type: "text",
    text: `${contexteProfil(p, matiere, "")}

L'élève a besoin d'aide pour un devoir en ${matiere}.
${question ? `Sa question : ${question}` : "L'exercice est sur la photo jointe."}
Aide-le à COMPRENDRE et à faire l'exercice lui-même : reformule la consigne, explique la méthode avec un exemple semblable (pas le même), donne des indices progressifs, puis la solution complète (qui sera cachée derrière un bouton) et comment vérifier.`,
  });
  const r = await ask({ system: SYSTEM, content, schema: SCHEMA_DEVOIRS });
  return r.json;
}

// ---------- HTTP ----------
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".ico": "image/x-icon" };

// Compression gzip des réponses texte : ~4× moins de données sur le Wi-Fi.
const accepteGzip = (res) => /\bgzip\b/.test(String(res.req?.headers["accept-encoding"] || ""));
function send(res, status, body) {
  const json = JSON.stringify(body);
  const entetes = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", Vary: "Accept-Encoding" };
  if (json.length > 1024 && accepteGzip(res)) {
    res.writeHead(status, { ...entetes, "Content-Encoding": "gzip" });
    return res.end(zlib.gzipSync(json, { level: 6 }));
  }
  res.writeHead(status, entetes);
  res.end(json);
}
function readBody(req, limit = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > limit) { reject(new Error("Fichier trop gros")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch { reject(new Error("JSON invalide")); } });
    req.on("error", reject);
  });
}
// Fichiers statiques : ETag (réponse 304 instantanée si rien n'a changé) + version gzip gardée en mémoire.
const cacheStatique = new Map();
function serveFile(res, file, cacheControl = "no-cache") {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end("Introuvable"); }
    const etag = `"${st.size.toString(36)}-${st.mtimeMs.toString(36)}"`;
    const type = MIME[path.extname(file)] || "application/octet-stream";
    const entetes = { "Content-Type": type, ETag: etag, "Cache-Control": cacheControl, Vary: "Accept-Encoding" };
    if (res.req.headers["if-none-match"] === etag) { res.writeHead(304, entetes); return res.end(); }
    const texte = /^(text|application\/json|image\/svg)/.test(type);
    let c = cacheStatique.get(file);
    if (!c || c.etag !== etag) {
      const data = fs.readFileSync(file);
      c = { etag, data, gz: texte && data.length > 1024 ? zlib.gzipSync(data, { level: 9 }) : null };
      if (texte) cacheStatique.set(file, c);
    }
    if (c.gz && accepteGzip(res)) { res.writeHead(200, { ...entetes, "Content-Encoding": "gzip" }); return res.end(c.gz); }
    res.writeHead(200, entetes);
    res.end(c.data);
  });
}
function lanAddresses() {
  return Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === "IPv4" && !i.internal).map((i) => i.address);
}
const champsProfil = ["nom", "ecole", "ville", "annee", "matiere", "sujet", "avatar"];
function nettoyerProfil(body) {
  const out = {};
  for (const k of champsProfil) if (k in body) out[k] = String(body[k] ?? "").slice(0, 200).trim();
  return out;
}
function profilPublic(p) {
  const { mdp, ...reste } = p;
  return { ...reste, reglages: reglagesDe(p) };
}

// ---------- Comptes et sessions ----------
// Chaque profil est un compte (identifiant + mot de passe haché avec scrypt).
// La session est un jeton aléatoire dans un cookie HttpOnly, gardé dans data/sessions.json.
const SESSIONS_FILE = path.join(DATA, "sessions.json");
const sessions = new Map(Object.entries(readJSON(SESSIONS_FILE, {})));
const DUREE_SESSION = 30 * 24 * 3600e3;
const saveSessions = () => writeJSON(SESSIONS_FILE, Object.fromEntries(sessions));

function hacher(motDePasse, sel = crypto.randomBytes(16).toString("hex")) {
  return { sel, hash: crypto.scryptSync(String(motDePasse), sel, 32).toString("hex") };
}
function verifier(motDePasse, stocke) {
  if (!stocke?.sel || !stocke?.hash) return false;
  const a = Buffer.from(hacher(motDePasse, stocke.sel).hash, "hex"), b = Buffer.from(stocke.hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function lireCookies(req) {
  const out = {};
  for (const morceau of String(req.headers.cookie || "").split(";")) {
    const i = morceau.indexOf("=");
    if (i > 0) out[morceau.slice(0, i).trim()] = decodeURIComponent(morceau.slice(i + 1).trim());
  }
  return out;
}
function sessionDe(req) {
  const jeton = lireCookies(req).mr_session;
  const s = jeton && sessions.get(jeton);
  if (!s) return null;
  if (s.exp < Date.now()) { sessions.delete(jeton); saveSessions(); return null; }
  return { jeton, ...s };
}
function ouvrirSession(res, donnees, req) {
  const existante = sessionDe(req);
  const jeton = existante?.jeton || crypto.randomBytes(24).toString("hex");
  sessions.set(jeton, { ...(existante || {}), ...donnees, exp: Date.now() + DUREE_SESSION });
  delete sessions.get(jeton).jeton;
  saveSessions();
  res.setHeader("Set-Cookie", `mr_session=${jeton}; HttpOnly; SameSite=Lax; Path=/;${req.headers["x-forwarded-proto"] === "https" ? " Secure;" : ""} Max-Age=${DUREE_SESSION / 1000}`);
}
function modifierSession(req, changement) {
  const s = sessionDe(req);
  if (!s) return;
  const { jeton, ...donnees } = s;
  const nouv = { ...donnees, ...changement };
  if (!nouv.profilId && !nouv.admin) sessions.delete(jeton); else sessions.set(jeton, nouv);
  saveSessions();
}
const peutVoir = (sess, profilId) => !!sess && (sess.admin || sess.profilId === profilId);

// Anti-devinette : 8 échecs en 10 minutes par adresse bloquent les connexions un moment.
const echecs = new Map();
const ipDe = (req) => (URL_PUBLIQUE && String(req.headers["x-forwarded-for"] || "").split(",")[0].trim()) || req.socket.remoteAddress;
function bloque(req) {
  const e = echecs.get(ipDe(req));
  return !!e && e.n >= 8 && Date.now() - e.t < 10 * 60e3;
}
function echec(req) {
  const ip = ipDe(req), e = echecs.get(ip);
  echecs.set(ip, e && Date.now() - e.t < 10 * 60e3 ? { n: e.n + 1, t: e.t } : { n: 1, t: Date.now() });
}
const normIdentifiant = (s) => String(s || "").trim().toLowerCase();

function resumeCompte(p) {
  const finals = p.sessions.filter((s) => s.type === "final");
  const derniere = p.sessions[p.sessions.length - 1];
  return {
    id: p.id, nom: p.nom, identifiant: p.identifiant || "", avatar: p.avatar, ecole: p.ecole, ville: p.ville, annee: p.annee,
    matiere: p.matiere, sujet: p.sujet, cree: p.cree, revisions: p.revisions || 0, tests: finals.length,
    moyenne: (() => { const n = p.sessions.filter((s) => s.type !== "lecon" && Number.isFinite(s.pourcentage)); return n.length ? Math.round(n.reduce((a, s) => a + s.pourcentage, 0) / n.length) : null; })(), // révisions + examens
    dernierResultat: derniere ? { type: derniere.type, sujet: derniere.sujet, matiere: derniere.matiere, pourcentage: derniere.pourcentage, date: derniere.date } : null,
    derniereActivite: derniere?.date || p.derniereConnexion || p.cree,
    photos: p.photos.length,
    matieres: [...new Set(p.sessions.map((s) => s.matiere))],
  };
}

async function apiAuth(req, res, parts) {
  const m = req.method;
  if (parts[1] === "moi" && m === "GET") {
    const s = sessionDe(req);
    const p = s?.profilId && db.profils.find((x) => x.id === s.profilId);
    return send(res, 200, { profil: p ? profilPublic(p) : null, admin: !!s?.admin, adminConfigure: !!config.admin });
  }
  if (parts[1] === "inscription" && m === "POST") {
    const b = await readBody(req);
    const identifiant = normIdentifiant(b.identifiant);
    if (!/^[a-z0-9._-]{3,30}$/.test(identifiant)) return send(res, 400, { erreur: "Identifiant : 3 à 30 caractères (lettres sans accents, chiffres, . _ -)." });
    if (String(b.motDePasse || "").length < 6) return send(res, 400, { erreur: "Le mot de passe doit avoir au moins 6 caractères." });
    if (db.profils.some((x) => x.identifiant === identifiant)) return send(res, 409, { erreur: "Cet identifiant est déjà pris." });
    const infos = nettoyerProfil(b);
    if (!infos.nom) return send(res, 400, { erreur: "Le nom est obligatoire" });
    const p = { id: newId(), identifiant, mdp: hacher(b.motDePasse), ...infos, cree: new Date().toISOString(), derniereConnexion: new Date().toISOString(), revisions: 0, reglages: { ...REGLAGES_DEFAUT }, photos: [], sessions: [] };
    db.profils.push(p); saveDb();
    ouvrirSession(res, { profilId: p.id }, req);
    return send(res, 201, { profil: profilPublic(p) });
  }
  if (parts[1] === "connexion" && m === "POST") {
    if (bloque(req)) return send(res, 429, { erreur: "Trop d'essais. Réessaie dans quelques minutes." });
    const b = await readBody(req);
    const p = db.profils.find((x) => x.identifiant && x.identifiant === normIdentifiant(b.identifiant));
    if (!p || !verifier(b.motDePasse, p.mdp)) { echec(req); return send(res, 401, { erreur: "Identifiant ou mot de passe incorrect." }); }
    p.derniereConnexion = new Date().toISOString(); saveDb();
    ouvrirSession(res, { profilId: p.id }, req);
    return send(res, 200, { profil: profilPublic(p) });
  }
  if (parts[1] === "deconnexion" && m === "POST") {
    modifierSession(req, { profilId: null });
    return send(res, 200, { ok: true });
  }
  send(res, 404, { erreur: "Route inconnue" });
}

async function apiAdmin(req, res, parts) {
  const m = req.method;
  if (parts[1] === "initialiser" && m === "POST") {
    if (config.admin) return send(res, 409, { erreur: "Le mot de passe admin existe déjà." });
    const b = await readBody(req);
    const email = normIdentifiant(b.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { erreur: "Adresse courriel invalide." });
    if (String(b.motDePasse || "").length < 6) return send(res, 400, { erreur: "Au moins 6 caractères." });
    config.admin = { email, ...hacher(b.motDePasse) }; writeJSON(CONFIG_FILE, config);
    ouvrirSession(res, { admin: true }, req);
    return send(res, 201, { admin: true });
  }
  if (parts[1] === "connexion" && m === "POST") {
    if (bloque(req)) return send(res, 429, { erreur: "Trop d'essais. Réessaie dans quelques minutes." });
    const b = await readBody(req);
    const emailOk = !config.admin?.email || normIdentifiant(b.email) === config.admin.email;
    if (!emailOk || !verifier(b.motDePasse, config.admin)) { echec(req); return send(res, 401, { erreur: "Courriel ou mot de passe admin incorrect." }); }
    ouvrirSession(res, { admin: true }, req);
    return send(res, 200, { admin: true });
  }
  if (parts[1] === "deconnexion" && m === "POST") { modifierSession(req, { admin: false }); return send(res, 200, { ok: true }); }

  if (!sessionDe(req)?.admin) return send(res, 403, { erreur: "Accès réservé à l'admin." });

  // Sauvegarde complète (comptes, progression, photos, leçons, clé API) pour transférer ReviZ d'un ordinateur à un serveur en ligne.
  if (parts[1] === "sauvegarde" && m === "GET") {
    const fichiers = {};
    const parcourir = (dossier) => {
      for (const f of fs.readdirSync(dossier, { withFileTypes: true })) {
        const abs = path.join(dossier, f.name), rel = path.relative(DATA, abs);
        if (f.name === ".git") continue;
        if (f.isDirectory()) parcourir(abs);
        else if (!/^sessions\.json$|\.(log|tmp)$/.test(rel)) fichiers[rel] = fs.readFileSync(abs).toString("base64");
      }
    };
    parcourir(DATA);
    res.setHeader("Content-Disposition", `attachment; filename="reviz-sauvegarde-${new Date().toISOString().slice(0, 10)}.json"`);
    return send(res, 200, { reviz: 1, date: new Date().toISOString(), fichiers });
  }
  if (parts[1] === "restaurer" && m === "POST") {
    const b = await readBody(req, 200 * 1024 * 1024);
    if (b.reviz !== 1 || !b.fichiers || typeof b.fichiers !== "object") return send(res, 400, { erreur: "Ce fichier n'est pas une sauvegarde ReviZ." });
    let n = 0;
    for (const [rel, contenu] of Object.entries(b.fichiers)) {
      const abs = path.resolve(DATA, rel);
      if (!abs.startsWith(path.resolve(DATA) + path.sep) || /sessions\.json$|(^|[\\/])\.git([\\/]|$)/.test(rel) || typeof contenu !== "string") continue;
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, Buffer.from(contenu, "base64")); n++;
    }
    // Recharge en mémoire ce qui vient d'être restauré.
    const remplacer = (obj, nouv) => { for (const k of Object.keys(obj)) delete obj[k]; Object.assign(obj, nouv); };
    remplacer(db, readJSON(DB_FILE, { profils: [] }));
    db.profils ||= [];
    remplacer(config, readJSON(CONFIG_FILE, {}));
    remplacer(dicoCache, readJSON(DICO_FILE, {}));
    enCours.clear(); finalsPrets.clear();
    ouvrirSession(res, { admin: true }, req); // l'admin reste connecté même si le compte admin restauré est différent
    return send(res, 200, { ok: true, fichiers: n, comptes: db.profils.length });
  }

  if (parts[1] === "comptes" && parts.length === 2 && m === "GET") {
    return send(res, 200, db.profils.map(resumeCompte).sort((a, b) => String(b.derniereActivite).localeCompare(String(a.derniereActivite))));
  }
  const p = parts[1] === "comptes" && db.profils.find((x) => x.id === parts[2]);
  if (!p) return send(res, 404, { erreur: "Compte introuvable" });
  if (parts[3] === "mdp" && m === "POST") {
    const b = await readBody(req);
    if (String(b.motDePasse || "").length < 6) return send(res, 400, { erreur: "Au moins 6 caractères." });
    p.mdp = hacher(b.motDePasse); saveDb();
    for (const [j, s] of sessions) if (s.profilId === p.id) sessions.delete(j); // déconnecte l'ancien appareil
    saveSessions();
    return send(res, 200, { ok: true });
  }
  if (parts.length === 3 && m === "GET") return send(res, 200, profilPublic(p));
  // Supprimer des lignes d'historique (leçons, révisions, examens et leurs résultats) : { ids: [...] } ou { tout: true }.
  if (parts[3] === "sessions" && m === "POST") return supprimerSessions(res, p, await readBody(req));
  send(res, 404, { erreur: "Route inconnue" });
}

function supprimerSessions(res, p, b) {
  const ids = new Set(Array.isArray(b.ids) ? b.ids.map(String) : []);
  const retirees = p.sessions.filter((x) => b.tout === true || ids.has(x.id));
  p.sessions = p.sessions.filter((x) => !retirees.includes(x));
  p.revisions = Math.max(0, (p.revisions || 0) - retirees.filter((x) => x.type !== "final").length);
  saveDb();
  return send(res, 200, { supprimees: retirees.length, profil: profilPublic(p) });
}

async function api(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean).slice(1); // après "api"
  const m = req.method;
  const sess = sessionDe(req);

  if (parts[0] === "carte" && m === "GET") {
    const svg = carteDepuisRequete(url.searchParams);
    const gz = accepteGzip(res);
    res.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400", Vary: "Accept-Encoding", ...(gz ? { "Content-Encoding": "gzip" } : {}) });
    return res.end(gz ? zlib.gzipSync(svg, { level: 6 }) : svg);
  }
  if (parts[0] === "qr" && m === "GET") {
    const texte = String(url.searchParams.get("t") || "").slice(0, 300);
    if (!texte) return send(res, 400, { erreur: "Texte manquant" });
    const svg = await QRCode.toString(texte, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#111111", light: "#ffffff" } });
    res.writeHead(200, { "Content-Type": "image/svg+xml", "Cache-Control": "private, max-age=3600" });
    return res.end(svg);
  }
  if (parts[0] === "status") {
    res.setHeader("Access-Control-Allow-Origin", "*"); // la page d'accès (GitHub Pages) vérifie que le serveur est réveillé
    return send(res, 200, { ia: !!apiKey(), cleEnv: !!process.env.ANTHROPIC_API_KEY, adresses: URL_PUBLIQUE ? [URL_PUBLIQUE] : lanAddresses().map((a) => `http://${a}:${PORT}`) });
  }
  if (parts[0] === "config" && m === "POST") {
    if (!sess?.admin) return send(res, 403, { erreur: "Seul l'admin peut changer la clé API." });
    const b = await readBody(req);
    config.apiKey = String(b.apiKey || "").trim();
    writeJSON(CONFIG_FILE, config);
    return send(res, 200, { ia: !!apiKey() });
  }

  if (parts[0] === "auth") return apiAuth(req, res, parts);
  if (parts[0] === "admin") return apiAdmin(req, res, parts);
  if (parts[0] === "sync") return apiSync(req, res, parts, url, sess);
  if (parts[0] === "dico" && m === "POST") {
    if (!sess?.profilId && !sess?.admin) return send(res, 401, { erreur: "Connecte-toi d'abord." });
    const b = await readBody(req, 50000);
    return send(res, 200, await dico(db.profils.find((x) => x.id === sess.profilId), b.texte));
  }

  if (parts[0] === "profils" && parts[1]) {
    const p = db.profils.find((x) => x.id === parts[1]);
    if (!p || !peutVoir(sess, p.id)) return send(res, sess ? 404 : 401, { erreur: sess ? "Profil introuvable" : "Connecte-toi d'abord." });

    if (parts.length === 2 && m === "GET") return send(res, 200, profilPublic(p));
    // Supprimer des lignes de son historique : { ids: [...] } ou { tout: true }.
    if (parts[2] === "sessions" && parts.length === 3 && m === "POST") return supprimerSessions(res, p, await readBody(req));
    if (parts.length === 2 && m === "PUT") { Object.assign(p, nettoyerProfil(await readBody(req))); saveDb(); return send(res, 200, profilPublic(p)); }
    if (parts[2] === "avatar" && m === "POST") {
      const b = await readBody(req, 4 * 1024 * 1024);
      const b64 = String(b.image || "").replace(/^data:image\/\w+;base64,/, "");
      if (!b64) return send(res, 400, { erreur: "Image manquante" });
      retirerAvatar(p);
      const f = `${p.id}-${crypto.randomBytes(8).toString("hex")}.jpg`;
      fs.writeFileSync(path.join(AVATARS, f), Buffer.from(b64, "base64"));
      p.avatar = "photo:" + f; saveDb();
      return send(res, 200, profilPublic(p));
    }
    if (parts[2] === "reglages" && m === "PUT") {
      p.reglages = nettoyerReglages(await readBody(req)); saveDb();
      return send(res, 200, profilPublic(p));
    }
    if (parts[2] === "corriger" && m === "POST") {
      const b = await readBody(req);
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 40).map((it) => ({
        enonce: String(it.enonce || "").slice(0, 1500), reponse: String(it.reponse || "").slice(0, 500),
        reponses_acceptees: (Array.isArray(it.reponses_acceptees) ? it.reponses_acceptees : []).map((x) => String(x).slice(0, 200)).slice(0, 10),
        reponse_eleve: String(it.reponse_eleve || "").slice(0, 1000),
        calcul: String(it.calcul || "").slice(0, 3000),
      }));
      return send(res, 200, { resultats: await corriger(p, String(b.matiere || p.matiere || ""), items) });
    }
    if (parts.length === 2 && m === "DELETE") {
      for (const ph of p.photos) fs.rmSync(path.join(PHOTOS, ph.fichier), { force: true });
      retirerAvatar(p);
      for (const lp of p.leconsPhoto || []) {
        for (const f of lp.photos) fs.rmSync(path.join(PHOTOS, f), { force: true });
        fs.rmSync(path.join(LECONS_PHOTO, `${p.id}-${lp.id}.json`), { force: true });
      }
      db.profils.splice(db.profils.indexOf(p), 1); saveDb();
      for (const [j, s] of sessions) if (s.profilId === p.id) { if (s.admin) s.profilId = null; else sessions.delete(j); }
      saveSessions();
      return send(res, 200, { ok: true });
    }

    if (parts[2] === "photos" && parts.length === 3 && m === "POST") {
      const b = await readBody(req);
      const b64 = String(b.image || "").replace(/^data:image\/\w+;base64,/, "");
      if (!b64) return send(res, 400, { erreur: "Image manquante" });
      const photo = { id: newId(), matiere: String(b.matiere || p.matiere || "").slice(0, 100), sujet: String(b.sujet || "").slice(0, 150), date: new Date().toISOString(), description: null };
      photo.fichier = `${p.id}-${photo.id}.jpg`;
      fs.writeFileSync(path.join(PHOTOS, photo.fichier), Buffer.from(b64, "base64"));
      p.photos.push(photo); saveDb();
      await analyserPhoto(p, photo);
      return send(res, 201, photo);
    }
    if (parts[2] === "photos" && parts.length === 4 && m === "DELETE") {
      const i = p.photos.findIndex((x) => x.id === parts[3]);
      if (i >= 0) { fs.rmSync(path.join(PHOTOS, p.photos[i].fichier), { force: true }); p.photos.splice(i, 1); saveDb(); }
      return send(res, 200, { ok: true });
    }

    const matiereDe = (b) => String(b.matiere || p.matiere || "").slice(0, 100);
    const sujetDe = (b) => String(b.sujet || p.sujet || "").slice(0, 150);
    // Leçon (mise en cache) : { nouvelle: true } force une nouvelle version.
    if ((parts[2] === "lecon" || parts[2] === "revision") && m === "POST") {
      const b = await readBody(req);
      return send(res, 200, await obtenirLecon(p, matiereDe(b), sujetDe(b), { nouvelle: !!b.nouvelle }));
    }
    // Préparation en arrière-plan (ne bloque pas) : leçon dès que la mission est choisie, test final à l'ouverture de l'onglet Test.
    if (parts[2] === "prechauffer" && m === "POST") {
      const b = await readBody(req);
      if (getClient()) {
        if (b.quoi === "final") prechaufferFinal(p, matiereDe(b), sujetDe(b), b.dejaVues);
        else obtenirLecon(p, matiereDe(b), sujetDe(b)).catch((e) => console.error("Préparation leçon :", e.message));
      }
      return send(res, 202, { ok: true });
    }
    // Test de géographie personnalisé (zones, cartes / drapeaux, QCM / écrit / positionner) : généré à partir des vraies données.
    if (parts[2] === "geo-test" && m === "POST") {
      const b = await readBody(req);
      const n = Math.min(40, Math.max(3, Number(b.n) || 10));
      return send(res, 200, { questions: genererTestGeo({ zones: Array.isArray(b.zones) ? b.zones.map(String) : undefined, contenu: String(b.contenu || "mix"), format: String(b.format || "mix"), n }), sources: [] });
    }
    if (parts[2] === "final" && m === "POST") {
      const b = await readBody(req);
      return send(res, 200, await prendreFinal(p, matiereDe(b), sujetDe(b), b.dejaVues));
    }
    // Leçons en photo : liste, création, lecture, suppression.
    if (parts[2] === "lecons-photo") {
      p.leconsPhoto ||= [];
      if (parts.length === 3 && m === "GET") return send(res, 200, p.leconsPhoto);
      if (parts.length === 3 && m === "POST") {
        const b = await readBody(req, 60 * 1024 * 1024);
        const images = (Array.isArray(b.images) ? b.images : []).slice(0, 5).map((x) => String(x).replace(/^data:image\/\w+;base64,/, "")).filter(Boolean);
        if (!images.length) return send(res, 400, { erreur: "Ajoute au moins une photo de ta leçon." });
        const id = newId(), matiere = matiereDe(b), sujet = String(b.sujet || "").slice(0, 150);
        const fichiers = images.map((data, i) => {
          const f = `${p.id}-lp${id}-${i}.jpg`;
          fs.writeFileSync(path.join(PHOTOS, f), Buffer.from(data, "base64"));
          return f;
        });
        const lecon = await genererLeconPhoto(p, matiere, sujet, fichiers);
        const meta = { id, titre: lecon.fiche.titre, matiere, sujet, date: new Date().toISOString(), photos: fichiers, demo: !!lecon.demo };
        writeJSON(path.join(LECONS_PHOTO, `${p.id}-${id}.json`), { ...lecon, meta });
        p.leconsPhoto.unshift(meta); saveDb();
        return send(res, 201, { ...lecon, meta });
      }
      const meta = p.leconsPhoto.find((x) => x.id === parts[3]);
      if (!meta) return send(res, 404, { erreur: "Leçon introuvable" });
      const fichier = path.join(LECONS_PHOTO, `${p.id}-${meta.id}.json`);
      if (m === "GET") return send(res, 200, readJSON(fichier, { meta, fiche: null, questions: [] }));
      if (m === "DELETE") {
        for (const f of meta.photos) fs.rmSync(path.join(PHOTOS, f), { force: true });
        fs.rmSync(fichier, { force: true });
        p.leconsPhoto.splice(p.leconsPhoto.indexOf(meta), 1); saveDb();
        return send(res, 200, { ok: true });
      }
    }
    if (parts[2] === "devoirs" && m === "POST") {
      const b = await readBody(req);
      return send(res, 200, await aideDevoirs(p, { matiere: b.matiere || p.matiere, question: String(b.question || "").slice(0, 4000), image: b.image ? String(b.image).replace(/^data:image\/\w+;base64,/, "") : null }));
    }
    if (parts[2] === "resultats" && m === "POST") {
      const b = await readBody(req);
      const type = ["final", "revision", "lecon"].includes(b.type) ? b.type : "revision";
      const total = type === "lecon" ? 0 : Math.max(1, Number(b.total) || 1), score = type === "lecon" ? 0 : Math.max(0, Math.min(total, Number(b.score) || 0));
      const s = {
        id: newId(), type, photo: !!b.photo,
        matiere: String(b.matiere || "").slice(0, 100), sujet: String(b.sujet || "").slice(0, 150),
        score, total, pourcentage: type === "lecon" ? null : Math.round((score / total) * 100),
        erreurs: (Array.isArray(b.erreurs) ? b.erreurs : []).map((e) => String(e).slice(0, 80)).slice(0, 30),
        // Détail de chaque question (réponse donnée, bonne réponse, correction) pour que l'élève puisse revoir son évaluation.
        details: (Array.isArray(b.details) ? b.details : []).slice(0, 40).map((d) => ({
          enonce: String(d.enonce ?? "").slice(0, 1500), type: String(d.type ?? "").slice(0, 20),
          choix: (Array.isArray(d.choix) ? d.choix : []).map((c) => String(c).slice(0, 300)).slice(0, 8),
          reponse: String(d.reponse ?? "").slice(0, 500), reponse_eleve: d.reponse_eleve == null ? null : String(d.reponse_eleve).slice(0, 1000),
          ok: !!d.ok, explication: String(d.explication ?? "").slice(0, 2500), demarche: String(d.demarche ?? "").slice(0, 3000),
          pourquoi: String(d.pourquoi ?? "").slice(0, 1000), commentaire: String(d.commentaire ?? "").slice(0, 600), notion: String(d.notion ?? "").slice(0, 100),
          calcul: String(d.calcul ?? "").slice(0, 3000), points: Math.min(1, Math.max(0, Number(d.points) || 0)),
          elements: (Array.isArray(d.elements) ? d.elements : []).map((x) => String(x).slice(0, 200)).slice(0, 8),
          image_svg: nettoyerSvg(d.image_svg),
          image_url: nettoyerUrlImage(d.image_url),
          correction_url: nettoyerUrlImage(d.correction_url),
          indice_vu: !!d.indice_vu, triche: !!d.triche, orthographe: String(d.orthographe ?? "").slice(0, 300),
        })),
        date: new Date().toISOString(),
      };
      p.sessions.push(s);
      if (s.type !== "final") p.revisions = (p.revisions || 0) + 1; // leçons terminées + entraînements
      saveDb();
      return send(res, 201, { session: s, profil: profilPublic(p) });
    }
  }
  send(res, 404, { erreur: "Route inconnue" });
}

// ---------- Synchro ordinateur ↔ téléphone ----------
// L'ordinateur (« hôte ») mène le quiz et publie son état; le téléphone (« télécommande »)
// reçoit cet état en direct (Server-Sent Events) et renvoie ses actions. Le serveur relaie.
const syncs = new Map();
function nouveauCode() {
  for (let i = 0; i < 1000; i++) {
    const c = String(crypto.randomInt(1000, 10000));
    if (!syncs.has(c)) return c;
  }
  throw new Error("Plus de codes disponibles");
}
function diffuser(clients, evenement, data) {
  const msg = `event: ${evenement}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}
function presence(s) {
  const d = { telephones: s.tels.size, hotes: s.hotes.size };
  diffuser(s.hotes, "presence", d);
  diffuser(s.tels, "presence", d);
}
setInterval(() => {
  const maintenant = Date.now();
  for (const [code, s] of syncs) {
    for (const res of [...s.hotes, ...s.tels]) res.write(": ping\n\n");
    if (!s.hotes.size && !s.tels.size && maintenant - s.vu > 6 * 3600e3) syncs.delete(code);
  }
}, 20000).unref();

// Le code à 4 chiffres sert de clé au téléphone; seul le compte connecté côté ordinateur peut le créer et piloter le quiz.
// Un téléphone qui se reconnecte en pleine question reçoit le temps restant réel, pas celui du début.
function etatActuel(s) {
  if (s.etat?.restantMs == null) return s.etat;
  return { ...s.etat, restantMs: Math.max(0, s.etat.restantMs - (Date.now() - (s.etatRecu || Date.now()))) };
}
async function apiSync(req, res, parts, url, sess) {
  const m = req.method;
  if (parts.length === 1 && m === "POST") {
    const b = await readBody(req);
    const p = db.profils.find((x) => x.id === b.profilId);
    if (!p || !peutVoir(sess, p.id)) return send(res, 404, { erreur: "Profil introuvable" });
    const demande = String(b.code || "");
    const ancien = syncs.get(demande);
    if (ancien && ancien.profilId === p.id) { ancien.vu = Date.now(); return send(res, 200, { code: ancien.code }); }
    // Après un redémarrage du serveur, l'ordinateur récupère le même code : le téléphone se reconnecte tout seul.
    const code = /^\d{4}$/.test(demande) && !ancien ? demande : nouveauCode();
    syncs.set(code, { code, profilId: p.id, hotes: new Set(), tels: new Set(), etat: { phase: "attente" }, vu: Date.now() });
    return send(res, 201, { code });
  }
  const s = syncs.get(parts[1]);
  if (!s) return send(res, 404, { erreur: "Code inconnu. Vérifie le code affiché sur l'ordinateur." });
  s.vu = Date.now();
  const p = db.profils.find((x) => x.id === s.profilId);

  if (parts.length === 2 && m === "GET") {
    return send(res, 200, { code: s.code, profil: p ? { id: p.id, nom: p.nom, avatar: p.avatar, annee: p.annee } : null, hote: s.hotes.size > 0 });
  }
  const estHote = peutVoir(sess, s.profilId);
  if (parts[2] === "flux" && m === "GET") {
    const role = url.searchParams.get("role") === "hote" ? "hotes" : "tels";
    if (role === "hotes" && !estHote) return send(res, 403, { erreur: "Réservé à l'ordinateur connecté au compte." });
    res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", Connection: "keep-alive", "X-Accel-Buffering": "no" });
    res.write("retry: 2000\n\n");
    s[role].add(res);
    if (role === "tels") res.write(`event: etat\ndata: ${JSON.stringify(etatActuel(s))}\n\n`);
    presence(s);
    req.on("close", () => { s[role].delete(res); presence(s); });
    return;
  }
  if (parts[2] === "etat" && m === "POST") {
    if (!estHote) return send(res, 403, { erreur: "Réservé à l'ordinateur connecté au compte." });
    s.etat = await readBody(req, 200000);
    s.etatRecu = Date.now();
    diffuser(s.tels, "etat", s.etat);
    return send(res, 200, { ok: true });
  }
  // Photo prise avec le téléphone-télécommande : relayée à l'ordinateur (onglet 📸 Photo).
  if (parts[2] === "photo" && m === "POST") {
    const b = await readBody(req, 12 * 1024 * 1024);
    const image = String(b.image || "");
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(image)) return send(res, 400, { erreur: "Image invalide" });
    diffuser(s.hotes, "action", { type: "photo", image });
    return send(res, 200, { ok: true, hote: s.hotes.size > 0 });
  }
  if (parts[2] === "action" && m === "POST") {
    const action = await readBody(req, 20000);
    diffuser(s.hotes, "action", action);
    return send(res, 200, { ok: true, hote: s.hotes.size > 0 });
  }
  send(res, 404, { erreur: "Route inconnue" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    const drapeau = url.pathname.match(/^\/drapeaux\/([a-z]{2})\.svg$/);
    if (drapeau) return serveFile(res, path.join(ROOT, "node_modules/flag-icons/flags/4x3", drapeau[1] + ".svg"), "public, max-age=604800");
    if (url.pathname.startsWith("/avatars/")) {
      return serveFile(res, path.join(AVATARS, path.basename(decodeURIComponent(url.pathname))), "public, max-age=31536000, immutable");
    }
    if (url.pathname.startsWith("/photos/")) {
      const f = path.basename(decodeURIComponent(url.pathname));
      if (!peutVoir(sessionDe(req), f.split("-")[0])) { res.writeHead(403); return res.end(); }
      return serveFile(res, path.join(PHOTOS, f), "private, max-age=31536000, immutable"); // noms uniques : jamais modifiés
    }
    let chemin;
    try { chemin = decodeURIComponent(url.pathname); } catch { chemin = url.pathname; }
    // Lien court du QR code télécommande : /t/1234 → l'appli en mode télécommande.
    const court = chemin.match(/^\/t\/(\d{4})\/?$/);
    if (court) { res.writeHead(302, { Location: `/#/tel/${court[1]}`, "Cache-Control": "no-store" }); return res.end(); }
    // Certaines applis appareil photo encodent le « # » en « %23 » : on remet l'adresse d'aplomb.
    if (chemin.startsWith("/#")) { res.writeHead(302, { Location: chemin, "Cache-Control": "no-store" }); return res.end(); }
    let rel = chemin === "/" ? "index.html" : chemin.replace(/^\/+/, "");
    if (!path.extname(rel)) rel = "index.html"; // adresse inconnue sans extension → l'application (jamais « Introuvable »)
    const file = path.resolve(PUBLIC, rel);
    if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
    serveFile(res, file, rel === "ecoles.json" ? "public, max-age=86400" : "no-cache");
  } catch (err) {
    console.error(err);
    let msg = err.message || "Erreur serveur";
    if (err instanceof Anthropic.AuthenticationError) msg = "Clé API invalide — vérifie-la dans ⚙️ Paramètres.";
    else if (err instanceof Anthropic.RateLimitError) msg = "Trop de demandes en même temps, réessaie dans une minute.";
    else if (err instanceof Anthropic.APIConnectionError) msg = "Impossible de joindre l'IA (connexion internet ?).";
    if (!res.headersSent) send(res, 500, { erreur: msg });
  }
});
server.requestTimeout = 0; // les générations avec recherche web peuvent prendre plus d'une minute

server.listen(PORT, "0.0.0.0", () => {
  console.log("\n  ⚡ ReviZ est lancé !\n");
  console.log(`  Sur cet ordinateur : http://localhost:${PORT}`);
  for (const a of lanAddresses()) console.log(`  Sur le même Wi-Fi  : http://${a}:${PORT}`);
  console.log(`\n  IA : ${apiKey() ? "activée ✅" : "mode démo (ajoute une clé API dans 🛡 Admin → Clé API)"}\n`);
});
