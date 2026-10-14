// ReviZ — serveur local accessible sur le même Wi-Fi.
// Lancer : npm start   (puis ouvrir l'adresse affichée sur un autre appareil)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { demoRevision, demoFinal, demoDico } from "./demo.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const DATA = path.join(ROOT, "data");
const PHOTOS = path.join(DATA, "photos");
const CACHE = path.join(DATA, "recherche");
const DB_FILE = path.join(DATA, "db.json");
const CONFIG_FILE = path.join(DATA, "config.json");
const PORT = Number(process.env.PORT) || 3000;
const MODEL = "claude-opus-5-5";

for (const d of [DATA, PHOTOS, CACHE]) fs.mkdirSync(d, { recursive: true });

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
const newId = () => crypto.randomBytes(6).toString("hex");

// Réglages du test, propres à chaque profil.
const REGLAGES_DEFAUT = { minuteur: true, secondesChoix: 45, secondesOuvertes: 90, nbRevision: 10, nbFinal: 20, pctQcm: 70 };
const BORNES = { secondesChoix: [10, 300], secondesOuvertes: [15, 600], nbRevision: [5, 25], nbFinal: [10, 40], pctQcm: [0, 100] };
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
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 5, user_location: { type: "approximate", country: "CA", region: "Quebec" } }],
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
  required: ["type", "enonce", "choix", "reponse", "reponses_acceptees", "tolerance", "audio", "explication", "notion", "difficulte"],
  properties: {
    type: { type: "string", enum: ["qcm", "vrai_faux", "numerique", "ouverte"] },
    enonce: { type: "string" },
    choix: { type: "array", items: { type: "string" }, description: "4 choix courts pour qcm, [\"Vrai\",\"Faux\"] pour vrai_faux, [] pour numerique et ouverte" },
    reponse: { type: "string", description: "Texte exact du bon choix (qcm/vrai_faux), nombre (numerique, point décimal) ou réponse modèle courte (ouverte)" },
    reponses_acceptees: { type: "array", items: { type: "string" }, description: "Pour ouverte : variantes acceptées (synonymes, formes équivalentes). [] sinon" },
    tolerance: { type: "number", description: "Écart accepté pour numerique, 0 sinon" },
    audio: { type: "string", description: "Matières de langue seulement : phrase à faire écouter à l'élève (dans la langue étudiée) pour une question d'écoute. \"\" sinon" },
    explication: { type: "string" },
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
            required: ["titre", "explication", "exemple", "visuel_svg", "audio"],
            properties: {
              titre: { type: "string" },
              explication: { type: "string" },
              exemple: { type: "string" },
              visuel_svg: { type: "string", description: "Schéma SVG autonome illustrant la notion" },
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
        required: ["correct", "commentaire"],
        properties: { correct: { type: "boolean" }, commentaire: { type: "string", description: "1 phrase pour l'élève" } },
      },
    },
  },
};

function nettoyerQuestions(qs) {
  return (qs || []).filter((q) => {
    if (q.type === "numerique") return !Number.isNaN(parseFloat(String(q.reponse).replace(",", ".")));
    if (q.type === "ouverte") return String(q.reponse).trim() !== "";
    return q.choix.length >= 2 && q.choix.includes(q.reponse);
  });
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
${lang ? `C'est une matière de langue : inclus au moins 2 questions d'écoute avec le champ audio (phrase lue à voix haute à l'élève, l'énoncé dit « Écoute la phrase… »). Ailleurs audio = "".` : `Le champ audio est toujours "".`}`;
}

// ---------- Routes IA ----------
async function genererRevision(p, matiere, sujet) {
  const reg = reglagesDe(p);
  if (!getClient()) return demoRevision(matiere, sujet, reg.nbRevision, reg.pctQcm);
  const rech = await recherche(p.annee, matiere, sujet);
  const n = reg.nbRevision, rep = repartition(n, reg.pctQcm);
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
  for (const no of r.json.fiche.notions) no.visuel_svg = nettoyerSvg(no.visuel_svg);
  return { ...r.json, questions: nettoyerQuestions(r.json.questions), sources: rech.sources };
}

async function genererFinal(p, matiere, sujet, dejaVues) {
  const reg = reglagesDe(p);
  if (!getClient()) return demoFinal(matiere, sujet, reg.nbFinal, reg.pctQcm);
  const n = reg.nbFinal, rep = repartition(n, reg.pctQcm);
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
  if (!getClient() || !items.length) return items.map(() => ({ correct: false, commentaire: "" }));
  const r = await ask({
    system: SYSTEM,
    effort: "low",
    maxTokens: 8000,
    schema: SCHEMA_CORRECTION,
    content: `Corrige les réponses écrites d'un élève de ${p.annee} en ${matiere}. Pour chaque item, dis si la réponse est correcte sur le fond.
Accepte les synonymes, les formulations équivalentes et les petites fautes de frappe, SAUF si la question évalue justement l'orthographe, la grammaire ou la conjugaison (alors l'écriture exacte compte).
Donne un commentaire d'une phrase, encourageant, qui explique l'erreur s'il y en a une. Réponds dans le même ordre.

${items.map((it, i) => `Item ${i + 1}
Question : ${it.enonce}
Réponse attendue : ${it.reponse}${it.reponses_acceptees?.length ? ` (aussi acceptées : ${it.reponses_acceptees.join(" | ")})` : ""}
Réponse de l'élève : ${it.reponse_eleve}`).join("\n\n")}`,
  });
  const res = r.json.resultats || [];
  return items.map((_, i) => res[i] || { correct: false, commentaire: "" });
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

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}
function readBody(req, limit = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => { size += c.length; if (size > limit) { reject(new Error("Fichier trop gros")); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch { reject(new Error("JSON invalide")); } });
    req.on("error", reject);
  });
}
function serveFile(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Introuvable"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
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
  res.setHeader("Set-Cookie", `mr_session=${jeton}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${DUREE_SESSION / 1000}`);
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
function bloque(req) {
  const e = echecs.get(req.socket.remoteAddress);
  return !!e && e.n >= 8 && Date.now() - e.t < 10 * 60e3;
}
function echec(req) {
  const ip = req.socket.remoteAddress, e = echecs.get(ip);
  echecs.set(ip, e && Date.now() - e.t < 10 * 60e3 ? { n: e.n + 1, t: e.t } : { n: 1, t: Date.now() });
}
const normIdentifiant = (s) => String(s || "").trim().toLowerCase();

function resumeCompte(p) {
  const finals = p.sessions.filter((s) => s.type === "final");
  const derniere = p.sessions[p.sessions.length - 1];
  return {
    id: p.id, nom: p.nom, identifiant: p.identifiant || "", avatar: p.avatar, ecole: p.ecole, ville: p.ville, annee: p.annee,
    matiere: p.matiere, sujet: p.sujet, cree: p.cree, revisions: p.revisions || 0, tests: finals.length,
    moyenne: finals.length ? Math.round(finals.reduce((a, s) => a + s.pourcentage, 0) / finals.length) : null,
    meilleur: finals.length ? Math.max(...finals.map((s) => s.pourcentage)) : null,
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
  send(res, 404, { erreur: "Route inconnue" });
}

async function api(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean).slice(1); // après "api"
  const m = req.method;
  const sess = sessionDe(req);

  if (parts[0] === "status") {
    return send(res, 200, { ia: !!apiKey(), cleEnv: !!process.env.ANTHROPIC_API_KEY, adresses: lanAddresses().map((a) => `http://${a}:${PORT}`) });
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
    if (parts.length === 2 && m === "PUT") { Object.assign(p, nettoyerProfil(await readBody(req))); saveDb(); return send(res, 200, profilPublic(p)); }
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
      }));
      return send(res, 200, { resultats: await corriger(p, String(b.matiere || p.matiere || ""), items) });
    }
    if (parts.length === 2 && m === "DELETE") {
      for (const ph of p.photos) fs.rmSync(path.join(PHOTOS, ph.fichier), { force: true });
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

    if (parts[2] === "revision" && m === "POST") {
      const b = await readBody(req);
      return send(res, 200, await genererRevision(p, b.matiere || p.matiere, b.sujet || p.sujet));
    }
    if (parts[2] === "final" && m === "POST") {
      const b = await readBody(req);
      return send(res, 200, await genererFinal(p, b.matiere || p.matiere, b.sujet || p.sujet, b.dejaVues));
    }
    if (parts[2] === "devoirs" && m === "POST") {
      const b = await readBody(req);
      return send(res, 200, await aideDevoirs(p, { matiere: b.matiere || p.matiere, question: String(b.question || "").slice(0, 4000), image: b.image ? String(b.image).replace(/^data:image\/\w+;base64,/, "") : null }));
    }
    if (parts[2] === "resultats" && m === "POST") {
      const b = await readBody(req);
      const total = Math.max(1, Number(b.total) || 1), score = Math.max(0, Math.min(total, Number(b.score) || 0));
      const s = {
        id: newId(), type: b.type === "final" ? "final" : "revision",
        matiere: String(b.matiere || "").slice(0, 100), sujet: String(b.sujet || "").slice(0, 150),
        score, total, pourcentage: Math.round((score / total) * 100),
        erreurs: (Array.isArray(b.erreurs) ? b.erreurs : []).map((e) => String(e).slice(0, 80)).slice(0, 30),
        date: new Date().toISOString(),
      };
      p.sessions.push(s);
      if (s.type === "revision") p.revisions = (p.revisions || 0) + 1;
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
async function apiSync(req, res, parts, url, sess) {
  const m = req.method;
  if (parts.length === 1 && m === "POST") {
    const b = await readBody(req);
    const p = db.profils.find((x) => x.id === b.profilId);
    if (!p || !peutVoir(sess, p.id)) return send(res, 404, { erreur: "Profil introuvable" });
    const ancien = syncs.get(String(b.code || ""));
    if (ancien && ancien.profilId === p.id) { ancien.vu = Date.now(); return send(res, 200, { code: ancien.code }); }
    const code = nouveauCode();
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
    if (role === "tels") res.write(`event: etat\ndata: ${JSON.stringify(s.etat)}\n\n`);
    presence(s);
    req.on("close", () => { s[role].delete(res); presence(s); });
    return;
  }
  if (parts[2] === "etat" && m === "POST") {
    if (!estHote) return send(res, 403, { erreur: "Réservé à l'ordinateur connecté au compte." });
    s.etat = await readBody(req, 200000);
    diffuser(s.tels, "etat", s.etat);
    return send(res, 200, { ok: true });
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
    if (url.pathname.startsWith("/photos/")) {
      const f = path.basename(decodeURIComponent(url.pathname));
      if (!peutVoir(sessionDe(req), f.split("-")[0])) { res.writeHead(403); return res.end(); }
      return serveFile(res, path.join(PHOTOS, f));
    }
    const rel = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const file = path.resolve(PUBLIC, rel);
    if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
    serveFile(res, file);
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
  console.log(`\n  IA : ${apiKey() ? "activée ✅" : "mode démo (ajoute une clé API dans ⚙️ Paramètres)"}\n`);
});
