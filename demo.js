// Mode démo : petite banque de questions pour essayer l'application sans clé API.
const q = (type, enonce, choix, reponse, explication, notion, difficulte = "moyen", extra = {}) =>
  ({ type, enonce, choix, reponse, reponses_acceptees: [], tolerance: 0, audio: "", explication, notion, difficulte, ...extra });
const VF = ["Vrai", "Faux"];

// ---------- Petits schémas SVG ----------
const svg = (contenu, h = 220) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${h}" font-family="Arial" font-size="15"><rect width="400" height="${h}" fill="#fff"/>${contenu}</svg>`;
function barre(x, y, w, parts, pleines, couleur) {
  const pw = w / parts;
  let s = "";
  for (let i = 0; i < parts; i++) s += `<rect x="${x + i * pw}" y="${y}" width="${pw}" height="40" fill="${i < pleines ? couleur : "#fff"}" stroke="#111" stroke-width="3"/>`;
  return s;
}
const fleche = (x1, y1, x2, y2, c = "#e63946") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="4"/><polygon points="${x2},${y2} ${x2 - 10},${y2 - 6} ${x2 - 10},${y2 + 6}" fill="${c}" transform="rotate(${(Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI} ${x2} ${y2})"/>`;
const t = (x, y, txt, extra = "") => `<text x="${x}" y="${y}" ${extra}>${txt}</text>`;

const VISUELS = {
  equivalentes: svg(barre(40, 40, 300, 3, 2, "#ffd60a") + t(350, 67, "2/3", 'font-weight="bold"') + barre(40, 130, 300, 6, 4, "#2b6cff") + t(350, 157, "4/6", 'font-weight="bold"') + t(200, 112, "= même quantité !", 'text-anchor="middle" font-weight="bold" fill="#e63946"')),
  addition: svg(t(20, 30, "1/4 + 1/6  →  dénominateur commun 12", 'font-weight="bold"') + barre(20, 50, 360, 12, 3, "#ffd60a") + t(20, 115, "3/12") + barre(20, 125, 360, 12, 2, "#2b6cff") + t(20, 190, "2/12") + t(380, 210, "= 5/12", 'text-anchor="end" font-weight="bold" fill="#e63946" font-size="18"')),
  priorites: svg(["( )", "x²", "× ÷", "+ −"].map((e, i) => `<rect x="${12 + i * 98}" y="70" width="80" height="60" fill="${["#ffd60a", "#2b6cff", "#e63946", "#fff"][i]}" stroke="#111" stroke-width="3"/>` + t(52 + i * 98, 108, e, 'text-anchor="middle" font-size="22" font-weight="bold"') + t(52 + i * 98, 155, `${i + 1}`, 'text-anchor="middle" font-weight="bold"') + (i < 3 ? fleche(94 + i * 98, 100, 108 + i * 98, 100, "#111") : "")).join("") + t(200, 40, "Ordre des opérations", 'text-anchor="middle" font-weight="bold" font-size="18"')),
  pourcentage: svg(Array.from({ length: 100 }, (_, i) => `<rect x="${20 + (i % 10) * 18}" y="${20 + Math.floor(i / 10) * 18}" width="18" height="18" fill="${i < 25 ? "#e63946" : "#fff"}" stroke="#111" stroke-width="1.5"/>`).join("") + t(220, 90, "25 cases sur 100", 'font-weight="bold"') + t(220, 115, "= 25 %") + t(220, 140, "= 25/100 = 1/4")),
  etre: svg(t(30, 110, "Les filles", 'font-size="24" font-weight="bold"') + t(160, 110, "sont", 'font-size="24"') + t(225, 110, "part", 'font-size="24" font-weight="bold"') + t(272, 110, "ies", 'font-size="24" font-weight="bold" fill="#e63946"') + `<path d="M80 120 Q170 190 285 120" fill="none" stroke="#2b6cff" stroke-width="4"/>` + t(200, 200, "avec ÊTRE : accord avec le sujet", 'text-anchor="middle" font-weight="bold"') + t(80, 60, "fém. plur.", 'fill="#2b6cff" text-anchor="middle"')),
  avoir: svg(t(20, 70, "Les pommes que j'ai mang", 'font-size="20"') + t(266, 70, "ées", 'font-size="20" font-weight="bold" fill="#e63946"') + `<path d="M150 80 Q210 120 280 80" fill="none" stroke="#2b6cff" stroke-width="4"/>` + t(150, 52, "CD avant", 'fill="#2b6cff"') + t(20, 160, "J'ai mangé les pommes.", 'font-size="20"') + t(20, 190, "CD après → pas d'accord", 'fill="#e63946" font-weight="bold"')),
  aa: svg(`<rect x="20" y="30" width="170" height="160" fill="#ffd60a" stroke="#111" stroke-width="3"/><rect x="210" y="30" width="170" height="160" fill="#fff" stroke="#111" stroke-width="3"/>` + t(105, 75, "a", 'text-anchor="middle" font-size="40" font-weight="bold"') + t(105, 120, "= verbe avoir", 'text-anchor="middle"') + t(105, 160, "avait ✔", 'text-anchor="middle" font-weight="bold"') + t(295, 75, "à", 'text-anchor="middle" font-size="40" font-weight="bold"') + t(295, 120, "= préposition", 'text-anchor="middle"') + t(295, 160, "avait ✘", 'text-anchor="middle" font-weight="bold" fill="#e63946"')),
  classes: svg(`<rect x="15" y="20" width="180" height="185" fill="#2b6cff" stroke="#111" stroke-width="3"/><rect x="205" y="20" width="180" height="185" fill="#fff" stroke="#111" stroke-width="3"/>` + t(105, 50, "VARIABLES", 'text-anchor="middle" font-weight="bold" fill="#fff"') + ["nom", "déterminant", "adjectif", "pronom", "verbe"].map((m, i) => t(105, 85 + i * 24, m, 'text-anchor="middle" fill="#fff"')).join("") + t(295, 50, "INVARIABLES", 'text-anchor="middle" font-weight="bold"') + ["adverbe", "préposition", "conjonction"].map((m, i) => t(295, 85 + i * 24, m, 'text-anchor="middle"')).join("")),
  ligneTemps: (titre, marque) => svg(fleche(20, 120, 380, 120, "#111") + `<circle cx="${marque === "passe" ? 110 : marque === "futur" ? 300 : 200}" cy="120" r="14" fill="#e63946" stroke="#111" stroke-width="3"/>` + `<line x1="200" y1="95" x2="200" y2="145" stroke="#2b6cff" stroke-width="4"/>` + t(200, 170, "NOW", 'text-anchor="middle" font-weight="bold" fill="#2b6cff"') + t(60, 170, "past", 'text-anchor="middle"') + t(340, 170, "future", 'text-anchor="middle"') + t(200, 50, titre, 'text-anchor="middle" font-weight="bold" font-size="18"')),
};

const BANQUES = {
  "Mathématique": {
    fiche: {
      titre: "L'arc des fractions et des priorités !",
      intro: "Mode démo : voici une mini-fiche sur les fractions et les priorités d'opérations. Avec une clé API, Sensei crée une fiche sur TON sujet à partir d'une recherche sur internet et de tes photos de cours.",
      notions: [
        { titre: "Fractions équivalentes", explication: "On obtient une fraction équivalente en multipliant ou divisant le numérateur ET le dénominateur par le même nombre.", exemple: "2/3 = 4/6 = 8/12 (on multiplie par 2 puis par 2).", visuel_svg: VISUELS.equivalentes, audio: [] },
        { titre: "Additionner des fractions", explication: "On met les fractions sur le même dénominateur, puis on additionne les numérateurs.", exemple: "1/4 + 1/6 = 3/12 + 2/12 = 5/12.", visuel_svg: VISUELS.addition, audio: [] },
        { titre: "Priorité des opérations", explication: "Parenthèses → exposants → × et ÷ (de gauche à droite) → + et − (de gauche à droite).", exemple: "3 + 4 × 2 = 3 + 8 = 11.", visuel_svg: VISUELS.priorites, audio: [] },
        { titre: "Pourcentage", explication: "Un pourcentage est une fraction sur 100. Pour trouver x % d'un nombre, on multiplie par x/100.", exemple: "25 % de 80 = 0,25 × 80 = 20.", visuel_svg: VISUELS.pourcentage, audio: [] },
      ],
      astuces: ["Pour les priorités, pense au mot PEMDAS.", "Simplifie toujours ta fraction finale.", "Estime ta réponse avant de calculer pour repérer les erreurs."],
      pieges: ["Additionner les dénominateurs entre eux (1/2 + 1/3 ≠ 2/5).", "Faire les opérations de gauche à droite sans respecter les priorités."],
    },
    questions: [
      q("qcm", "Quelle fraction est équivalente à 3/4 ?", ["6/8", "4/5", "3/8", "9/16"], "6/8", "3/4 = (3×2)/(4×2) = 6/8.", "Fractions équivalentes", "facile"),
      q("numerique", "Calcule : 3 + 4 × 2", [], "11", "On fait la multiplication d'abord : 4 × 2 = 8, puis 3 + 8 = 11.", "Priorité des opérations", "facile"),
      q("vrai_faux", "1/2 + 1/3 = 2/5", VF, "Faux", "Il faut un dénominateur commun : 3/6 + 2/6 = 5/6.", "Additionner des fractions", "facile"),
      q("numerique", "Combien vaut 25 % de 80 ?", [], "20", "25 % = 0,25 et 0,25 × 80 = 20.", "Pourcentage", "facile"),
      q("qcm", "1/4 + 1/6 = ?", ["2/10", "5/12", "1/5", "7/12"], "5/12", "Dénominateur commun 12 : 3/12 + 2/12 = 5/12.", "Additionner des fractions"),
      q("numerique", "Calcule : (8 − 3)² ÷ 5", [], "5", "Parenthèses : 5, exposant : 25, puis 25 ÷ 5 = 5.", "Priorité des opérations"),
      q("qcm", "Quelle est la forme simplifiée de 18/24 ?", ["9/12", "3/4", "2/3", "6/8"], "3/4", "On divise par le PGCD 6 : 18÷6 = 3 et 24÷6 = 4.", "Fractions équivalentes"),
      q("vrai_faux", "Un prix passe de 50 $ à 60 $ : c'est une hausse de 20 %.", VF, "Vrai", "Hausse de 10 $ sur 50 $ : 10/50 = 0,20 = 20 %.", "Pourcentage"),
      q("ouverte", "Comment appelle-t-on le nombre du bas d'une fraction ?", [], "dénominateur", "Le nombre du haut est le numérateur, celui du bas le dénominateur.", "Vocabulaire des fractions", "facile", { reponses_acceptees: ["le dénominateur", "denominateur"] }),
      q("numerique", "Calcule 2/3 × 9/4 (réponse en nombre décimal).", [], "1.5", "2×9 = 18 et 3×4 = 12 : 18/12 = 3/2 = 1,5.", "Multiplier des fractions", "difficile", { tolerance: 0.01 }),
      q("qcm", "Quel est le résultat de 12 − 6 ÷ 3 × 2 ?", ["4", "8", "11", "1"], "8", "6 ÷ 3 = 2, puis 2 × 2 = 4, et 12 − 4 = 8.", "Priorité des opérations", "difficile"),
      q("numerique", "Un chandail coûte 40 $. Il est en solde à 15 % de rabais. Quel est le nouveau prix ?", [], "34", "15 % de 40 = 6 $, donc 40 − 6 = 34 $.", "Pourcentage"),
      q("qcm", "Laquelle de ces fractions est la plus grande ?", ["3/5", "5/8", "2/3", "7/12"], "2/3", "En décimal : 0,6 ; 0,625 ; 0,667 ; 0,583. C'est 2/3.", "Comparer des fractions", "difficile"),
      q("ouverte", "Écris 0,75 sous forme de fraction irréductible.", [], "3/4", "0,75 = 75/100 = 3/4 (on divise par 25).", "Fractions et décimaux", "moyen"),
    ],
  },
  "Français": {
    fiche: {
      titre: "La légende des accords du participe passé !",
      intro: "Mode démo : mini-fiche sur les classes de mots et l'accord du participe passé. Avec une clé API, Sensei prépare une fiche sur ton propre sujet.",
      notions: [
        { titre: "Participe passé avec être", explication: "Il s'accorde en genre et en nombre avec le sujet.", exemple: "Les filles sont parties.", visuel_svg: VISUELS.etre, audio: [] },
        { titre: "Participe passé avec avoir", explication: "Il s'accorde avec le complément direct (CD) seulement s'il est placé AVANT le verbe.", exemple: "Les pommes que j'ai mangées. / J'ai mangé les pommes.", visuel_svg: VISUELS.avoir, audio: [] },
        { titre: "Homophones a / à", explication: "« a » est le verbe avoir (remplaçable par « avait »). « à » est une préposition.", exemple: "Il a un livre à lire.", visuel_svg: VISUELS.aa, audio: [] },
        { titre: "Classes de mots", explication: "Nom, déterminant, adjectif, pronom, verbe (variables) ; adverbe, préposition, conjonction (invariables).", exemple: "« rapidement » est un adverbe : il ne s'accorde jamais.", visuel_svg: VISUELS.classes, audio: [] },
      ],
      astuces: ["Pour a/à, essaie de remplacer par « avait ».", "Pour avoir, pose la question « quoi ? » avant le verbe pour trouver le CD."],
      pieges: ["Accorder le participe passé avec avoir avec le sujet.", "Confondre ces / ses / c'est / s'est."],
    },
    questions: [
      q("qcm", "Complète : « Les filles sont ___ tôt. »", ["parti", "partis", "partie", "parties"], "parties", "Avec être, accord avec le sujet « les filles » (féminin pluriel).", "Participe passé avec être", "facile"),
      q("qcm", "Complète : « Il ___ un rendez-vous ___ midi. »", ["a / à", "à / a", "a / a", "à / à"], "a / à", "« Il avait un rendez-vous » fonctionne : a. « à midi » est une préposition.", "Homophones a / à", "facile"),
      q("vrai_faux", "Dans « J'ai mangé les pommes », le participe passé doit s'accorder.", VF, "Faux", "Le CD « les pommes » est placé après le verbe : pas d'accord.", "Participe passé avec avoir"),
      q("ouverte", "Écris correctement le participe passé : « Les lettres que j'ai (écrire) »", [], "écrites", "Le CD « que » (= les lettres) est placé avant : accord au féminin pluriel.", "Participe passé avec avoir", "difficile"),
      q("qcm", "Quelle est la classe du mot « rapidement » ?", ["Adjectif", "Adverbe", "Verbe", "Nom"], "Adverbe", "Il modifie un verbe et il est invariable : c'est un adverbe.", "Classes de mots", "facile"),
      q("qcm", "Complète : « ___ amis sont venus hier. » (les amis de Léa)", ["Ces", "Ses", "C'est", "S'est"], "Ses", "Ce sont les amis à elle : déterminant possessif « ses ».", "Homophones"),
      q("vrai_faux", "Un déterminant est un mot variable.", VF, "Vrai", "Le déterminant varie en genre et en nombre (le, la, les).", "Classes de mots"),
      q("ouverte", "Accorde le participe passé : « Elle s'est (laver) les mains. »", [], "lavé", "Le CD « les mains » est après le verbe : pas d'accord.", "Participe passé des verbes pronominaux", "difficile"),
      q("qcm", "Dans « Le chat noir dort », quel est le groupe sujet ?", ["Le chat", "Le chat noir", "noir", "dort"], "Le chat noir", "On l'encadre par « C'est… qui » : C'est le chat noir qui dort.", "Groupe sujet"),
      q("ouverte", "Donne la classe du mot « mais » dans « Il pleut, mais je sors. »", [], "conjonction", "« mais » relie deux phrases : c'est une conjonction de coordination.", "Classes de mots", "moyen", { reponses_acceptees: ["conjonction de coordination", "une conjonction"] }),
    ],
  },
  "Anglais": {
    fiche: {
      titre: "The Time Travel Saga : Past & Present !",
      intro: "Mode démo : mini-fiche sur le simple past et le present progressive. Appuie sur 🔊 pour écouter les exemples !",
      notions: [
        { titre: "Simple past (regular verbs)", explication: "Pour une action terminée dans le passé, on ajoute -ed au verbe régulier.", exemple: "walk → walked, play → played, study → studied", visuel_svg: VISUELS.ligneTemps("Simple past", "passe"), audio: ["I walked to school yesterday.", "She played soccer last weekend.", "We studied for the test."] },
        { titre: "Simple past (irregular verbs)", explication: "Les verbes irréguliers ont une forme spéciale à apprendre par cœur.", exemple: "go → went, eat → ate, see → saw, have → had", visuel_svg: "", audio: ["I went to the movies.", "He ate a big pizza.", "They saw a bear in the forest."] },
        { titre: "Present progressive", explication: "Pour une action en train de se passer MAINTENANT : am / is / are + verbe en -ing.", exemple: "I am reading. She is running. They are playing.", visuel_svg: VISUELS.ligneTemps("Present progressive", "now"), audio: ["I am reading a book right now.", "She is running in the park.", "They are playing video games."] },
        { titre: "Questions with did", explication: "Au passé, on pose une question avec did + verbe à l'infinitif.", exemple: "Did you go? Where did she live?", visuel_svg: "", audio: ["Did you finish your homework?", "Where did you go last summer?"] },
      ],
      astuces: ["Yesterday, last week, ago → simple past.", "Now, right now, at the moment → present progressive.", "Après did, le verbe reste à l'infinitif : Did you went ✘ → Did you go ✔"],
      pieges: ["Oublier le verbe être au present progressive (She running ✘).", "Ajouter -ed à un verbe irrégulier (goed ✘)."],
    },
    questions: [
      q("qcm", "Écoute la phrase. Quel verbe as-tu entendu ?", ["walk", "walked", "walking", "walks"], "walked", "« I walked to school yesterday » : simple past avec -ed.", "Simple past (regular verbs)", "facile", { audio: "I walked to school yesterday." }),
      q("qcm", "Choose the right form: « Yesterday, I ___ to the park. »", ["go", "goes", "went", "going"], "went", "« Yesterday » = passé. go est irrégulier : went.", "Simple past (irregular verbs)", "facile"),
      q("ouverte", "Write the simple past of « eat ».", [], "ate", "eat → ate (verbe irrégulier).", "Simple past (irregular verbs)"),
      q("qcm", "Choose: « Look! The baby ___ . »", ["sleeps", "is sleeping", "slept", "sleep"], "is sleeping", "« Look! » montre que l'action se passe maintenant : present progressive.", "Present progressive"),
      q("vrai_faux", "« Did you went to school? » is correct.", VF, "Faux", "Après did, verbe à l'infinitif : Did you go to school?", "Questions with did"),
      q("ouverte", "Écoute la phrase et écris le verbe en -ing que tu entends.", [], "running", "« She is running in the park. »", "Present progressive", "moyen", { audio: "She is running in the park." }),
      q("qcm", "Choose: « They ___ soccer last weekend. »", ["play", "played", "are playing", "plays"], "played", "« last weekend » = passé terminé : played.", "Simple past (regular verbs)"),
      q("ouverte", "Write the simple past of « see ».", [], "saw", "see → saw (verbe irrégulier).", "Simple past (irregular verbs)", "moyen"),
      q("qcm", "Écoute. Quelle question as-tu entendue ?", ["Do you finish?", "Did you finish your homework?", "Are you finishing?", "Have you finished?"], "Did you finish your homework?", "Question au passé avec did.", "Questions with did", "difficile", { audio: "Did you finish your homework?" }),
      q("qcm", "Choose: « I ___ my homework right now. »", ["do", "did", "am doing", "done"], "am doing", "« right now » → present progressive : am doing.", "Present progressive", "moyen"),
    ],
  },
};

function banque(matiere) {
  if (/angl/i.test(matiere)) return BANQUES["Anglais"];
  if (/fran/i.test(matiere)) return BANQUES["Français"];
  return BANQUES["Mathématique"];
}
const estChoix = (x) => x.type === "qcm" || x.type === "vrai_faux";
// Choisit n questions en respectant au mieux la part de questions à choix demandée.
function selection(questions, n, pctQcm) {
  const choix = questions.filter(estChoix), ouvertes = questions.filter((x) => !estChoix(x));
  let nc = Math.round((Math.min(n, questions.length) * pctQcm) / 100), no = Math.min(n, questions.length) - nc;
  if (nc > choix.length) { no += nc - choix.length; nc = choix.length; }
  if (no > ouvertes.length) { nc = Math.min(choix.length, nc + no - ouvertes.length); no = ouvertes.length; }
  const pris = new Set([...choix.slice(0, nc), ...ouvertes.slice(0, no)]);
  return questions.filter((x) => pris.has(x));
}

export function demoRevision(matiere, sujet, n = 10, pctQcm = 70) {
  const b = banque(matiere);
  return { demo: true, fiche: b.fiche, questions: selection(b.questions, n, pctQcm), sources: [{ titre: "Alloprof", url: "https://www.alloprof.qc.ca/" }] };
}

export function demoFinal(matiere, sujet, n = 20, pctQcm = 70) {
  const b = banque(matiere);
  return { demo: true, questions: selection([...b.questions].sort(() => Math.random() - 0.5), n, pctQcm), sources: [] };
}
