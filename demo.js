// Mode démo : petite banque de questions pour essayer l'application sans clé API.
import { RENAISSANCE } from "./demo-histoire-geo.js";
import { banqueGeo } from "./geo-banque.js";
import { banqueCostumes } from "./costumes-banque.js";
import { banqueCCQ, estCCQ } from "./ccq-banque.js";
import { questionsGenerees } from "./maths-generateur.js";
const q = (type, enonce, choix, reponse, explication, notion, difficulte = "moyen", extra = {}) =>
  ({ type, enonce, choix, indice: "", elements: [], image_svg: "", image_url: "", reponse, reponses_acceptees: [], tolerance: 0, audio: "", explication, demarche: "", explications_choix: [], notion, difficulte, ...extra });
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

// ---------- Schémas d'algèbre ----------
const VISUELS_ALG = {
  expression: svg(t(200, 40, "Une expression algébrique", 'text-anchor="middle" font-weight="bold" font-size="18"')
    + `<rect x="40" y="70" width="90" height="56" fill="#ffd60a" stroke="#111" stroke-width="3"/><rect x="155" y="70" width="90" height="56" fill="#2b6cff" stroke="#111" stroke-width="3"/><rect x="270" y="70" width="90" height="56" fill="#fff" stroke="#111" stroke-width="3"/>`
    + t(85, 106, "3x", 'text-anchor="middle" font-size="26" font-weight="bold"') + t(142, 106, "+", 'text-anchor="middle" font-size="24"')
    + t(200, 106, "2y", 'text-anchor="middle" font-size="26" font-weight="bold" fill="#fff"') + t(257, 106, "−", 'text-anchor="middle" font-size="24"')
    + t(315, 106, "5", 'text-anchor="middle" font-size="26" font-weight="bold"')
    + t(85, 150, "terme", 'text-anchor="middle"') + t(200, 150, "terme", 'text-anchor="middle"') + t(315, 150, "constante", 'text-anchor="middle"')
    + t(85, 185, "3 = coefficient", 'text-anchor="middle" fill="#e63946" font-weight="bold"') + t(200, 185, "y = variable", 'text-anchor="middle" fill="#2b6cff" font-weight="bold"')),
  semblables: svg(t(200, 34, "Réduire : regrouper les termes semblables", 'text-anchor="middle" font-weight="bold" font-size="16"')
    + t(200, 80, "4x + 3 + 2x − 1", 'text-anchor="middle" font-size="26" font-weight="bold"')
    + `<path d="M118 92 Q160 130 206 92" fill="none" stroke="#e63946" stroke-width="4"/><path d="M168 92 Q222 140 288 92" fill="none" stroke="#2b6cff" stroke-width="4"/>`
    + t(150, 150, "x avec x", 'text-anchor="middle" fill="#e63946" font-weight="bold"') + t(260, 150, "nombres ensemble", 'text-anchor="middle" fill="#2b6cff" font-weight="bold"')
    + t(200, 195, "= 6x + 2", 'text-anchor="middle" font-size="26" font-weight="bold"')),
  distributivite: svg(t(200, 34, "Distributivité", 'text-anchor="middle" font-weight="bold" font-size="18"')
    + t(200, 110, "3(x + 4)", 'text-anchor="middle" font-size="30" font-weight="bold"')
    + `<path d="M158 82 Q190 40 222 82" fill="none" stroke="#e63946" stroke-width="4"/><path d="M158 82 Q218 20 268 82" fill="none" stroke="#2b6cff" stroke-width="4"/>`
    + t(200, 160, "= 3 × x + 3 × 4", 'text-anchor="middle" font-size="20"') + t(200, 198, "= 3x + 12", 'text-anchor="middle" font-size="26" font-weight="bold" fill="#e63946"')),
  balance: svg(`<polygon points="200,150 185,190 215,190" fill="#111"/><line x1="60" y1="150" x2="340" y2="150" stroke="#111" stroke-width="6"/>`
    + `<rect x="60" y="100" width="110" height="46" fill="#ffd60a" stroke="#111" stroke-width="3"/><rect x="230" y="100" width="110" height="46" fill="#2b6cff" stroke="#111" stroke-width="3"/>`
    + t(115, 131, "2x + 3", 'text-anchor="middle" font-size="22" font-weight="bold"') + t(285, 131, "11", 'text-anchor="middle" font-size="24" font-weight="bold" fill="#fff"')
    + t(200, 40, "Une équation = une balance en équilibre", 'text-anchor="middle" font-weight="bold" font-size="16"')
    + t(200, 70, "Ce qu'on fait d'un côté, on le fait de l'autre !", 'text-anchor="middle" fill="#e63946"')
    + t(200, 214, "−3 des deux côtés : 2x = 8  →  ÷2 : x = 4", 'text-anchor="middle" font-weight="bold"'), 220),
  probleme: svg(t(200, 34, "Traduire un problème en équation", 'text-anchor="middle" font-weight="bold" font-size="17"')
    + ["« un nombre »  →  x", "« le double »  →  2x", "« 5 de plus »  →  + 5", "« vaut 17 »  →  = 17"].map((l, i) => `<rect x="40" y="${52 + i * 36}" width="320" height="30" fill="${i % 2 ? "#fff" : "#ffd60a"}" stroke="#111" stroke-width="2"/>` + t(200, 73 + i * 36, l, 'text-anchor="middle" font-weight="bold"')).join("")
    + t(200, 210, "2x + 5 = 17", 'text-anchor="middle" font-size="22" font-weight="bold" fill="#e63946"'), 220),
};

const ALGEBRE = {
  fiche: {
    titre: "La saga de l'inconnue x !",
    intro: "En algèbre, une lettre (souvent x) remplace un nombre qu'on ne connaît pas encore. On apprend à écrire des expressions, à les simplifier, puis à résoudre des équations pour trouver la valeur de l'inconnue. C'est la base de toutes les maths du secondaire !",
    notions: [
      { titre: "Expression algébrique", explication: "Une expression algébrique contient des nombres, des lettres (les variables) et des opérations. Chaque partie séparée par + ou − est un terme. Le nombre devant la lettre est le coefficient. Un terme sans lettre est une constante.", exemple: "Dans 3x + 2y − 5 : les termes sont 3x, 2y et −5. Le coefficient de x est 3. Si x = 2 et y = 1 : 3(2) + 2(1) − 5 = 6 + 2 − 5 = 3.", visuel_svg: VISUELS_ALG.expression, audio: [] },
      { titre: "Réduire une expression", explication: "Des termes semblables ont exactement la même partie littérale (même lettre, même exposant). On les additionne en additionnant leurs coefficients. On ne peut PAS additionner des x avec des nombres ou des y.", exemple: "4x + 3 + 2x − 1 = (4x + 2x) + (3 − 1) = 6x + 2.\n5a + 2b − a = 4a + 2b (on ne touche pas au 2b).", visuel_svg: VISUELS_ALG.semblables, audio: [] },
      { titre: "La distributivité", explication: "Pour enlever des parenthèses, on multiplie le nombre devant la parenthèse par CHAQUE terme à l'intérieur. Attention aux signes : un « − » devant la parenthèse change le signe de chaque terme.", exemple: "3(x + 4) = 3x + 12\n−2(x − 5) = −2x + 10", visuel_svg: VISUELS_ALG.distributivite, audio: [] },
      { titre: "Résoudre une équation du 1er degré", explication: "Une équation est une égalité avec une inconnue. On l'imagine comme une balance : on fait la même opération des deux côtés pour isoler x. On défait les opérations dans l'ordre inverse (d'abord + et −, ensuite × et ÷). On vérifie en remplaçant x dans l'équation de départ.", exemple: "2x + 3 = 11\n2x + 3 − 3 = 11 − 3 → 2x = 8\n2x ÷ 2 = 8 ÷ 2 → x = 4\nVérification : 2(4) + 3 = 11 ✔", visuel_svg: VISUELS_ALG.balance, audio: [] },
      { titre: "Traduire un problème en équation", explication: "On choisit une lettre pour l'inconnue, on traduit chaque mot en symbole, on écrit l'équation, on la résout, puis on répond à la question par une phrase.", exemple: "« Le double d'un nombre, augmenté de 5, vaut 17. »\n2x + 5 = 17 → 2x = 12 → x = 6. Le nombre est 6.", visuel_svg: VISUELS_ALG.probleme, audio: [] },
    ],
    astuces: ["Termes semblables = même lettre ET même exposant : 3x et 5x oui, 3x et 3x² non.", "Pour isoler x, défais d'abord les + et −, puis les × et ÷.", "Vérifie toujours ta réponse en remplaçant x dans l'équation de départ."],
    pieges: ["Additionner x et des nombres : 2x + 3 ≠ 5x.", "Oublier de distribuer au 2e terme : 3(x + 4) ≠ 3x + 4.", "Oublier de changer les signes avec un − devant la parenthèse : −(x − 2) = −x + 2.", "Ne faire l'opération que d'un seul côté de l'équation."],
  },
  questions: [
    q("qcm", "Dans l'expression 7x − 4, quel est le coefficient de x ?", ["7", "x", "−4", "4"], "7", "Le coefficient est le nombre qui multiplie la variable : 7.", "Expression algébrique", "facile"),
    q("numerique", "Calcule la valeur de 3x + 2 si x = 5.", [], "17", "On remplace x par 5 : 3 × 5 + 2 = 15 + 2 = 17.", "Expression algébrique", "facile"),
    q("vrai_faux", "2x + 3 = 5x", VF, "Faux", "2x et 3 ne sont pas des termes semblables : on ne peut pas les additionner. 2x + 3 reste 2x + 3.", "Réduire une expression", "facile"),
    q("qcm", "Réduis : 4x + 3 + 2x − 1", ["6x + 2", "8x", "6x + 4", "2x + 2"], "6x + 2", "x avec x : 4x + 2x = 6x. Nombres ensemble : 3 − 1 = 2. Donc 6x + 2.", "Réduire une expression", "facile"),
    q("qcm", "Développe : 3(x + 4)", ["3x + 4", "3x + 12", "x + 12", "3x + 7"], "3x + 12", "On multiplie 3 par CHAQUE terme : 3 × x + 3 × 4 = 3x + 12.", "La distributivité", "facile"),
    q("numerique", "Résous : x + 7 = 15. Quelle est la valeur de x ?", [], "8", "On enlève 7 des deux côtés : x = 15 − 7 = 8.", "Résoudre une équation du 1er degré", "facile"),
    q("numerique", "Résous : 2x + 3 = 11", [], "4", "−3 des deux côtés : 2x = 8. ÷2 des deux côtés : x = 4. Vérif : 2(4) + 3 = 11 ✔", "Résoudre une équation du 1er degré"),
    q("qcm", "Réduis : 5a + 2b − a + 3b", ["4a + 5b", "6a + 5b", "9ab", "5a + 5b"], "4a + 5b", "5a − a = 4a et 2b + 3b = 5b.", "Réduire une expression"),
    q("qcm", "Développe : −2(x − 5)", ["−2x − 10", "−2x + 10", "2x − 10", "−2x − 5"], "−2x + 10", "−2 × x = −2x et −2 × (−5) = +10. Le « − » change le signe des deux termes.", "La distributivité"),
    q("ouverte", "Réduis l'expression : 3x + 5 − x + 2", [], "2x + 7", "3x − x = 2x et 5 + 2 = 7, donc 2x + 7.", "Réduire une expression", "moyen", { reponses_acceptees: ["2x+7", "7 + 2x", "7+2x"] }),
    q("numerique", "Résous : 5x − 4 = 21", [], "5", "+4 des deux côtés : 5x = 25. ÷5 : x = 5. Vérif : 5(5) − 4 = 21 ✔", "Résoudre une équation du 1er degré"),
    q("numerique", "Résous : x/3 = 6", [], "18", "On fait l'inverse de ÷3 : on multiplie par 3 des deux côtés. x = 18.", "Résoudre une équation du 1er degré"),
    q("qcm", "« Le double d'un nombre, augmenté de 5, vaut 17. » Quelle équation traduit ce problème ?", ["2x + 5 = 17", "2(x + 5) = 17", "x + 2 + 5 = 17", "5x + 2 = 17"], "2x + 5 = 17", "Le double d'un nombre : 2x. Augmenté de 5 : + 5. Vaut 17 : = 17.", "Traduire un problème en équation"),
    q("numerique", "« Le triple d'un nombre diminué de 4 vaut 20. » Quel est ce nombre ?", [], "8", "3x − 4 = 20 → 3x = 24 → x = 8.", "Traduire un problème en équation", "difficile"),
    q("numerique", "Résous : 3x + 4 = x + 10", [], "3", "On regroupe les x d'un côté : 3x − x = 10 − 4, donc 2x = 6 et x = 3. Vérif : 3(3) + 4 = 13 et 3 + 10 = 13 ✔", "Résoudre une équation du 1er degré", "difficile"),
    q("numerique", "Résous : 2(x + 3) = 14", [], "4", "On distribue : 2x + 6 = 14 → 2x = 8 → x = 4.", "La distributivité", "difficile"),
    q("vrai_faux", "x = 6 est la solution de l'équation 4x − 9 = 15.", VF, "Vrai", "On vérifie : 4 × 6 − 9 = 24 − 9 = 15 ✔", "Résoudre une équation du 1er degré"),
    q("ouverte", "Comment appelle-t-on la lettre qui représente un nombre inconnu dans une équation ?", [], "inconnue", "C'est l'inconnue (ou la variable). On la note souvent x.", "Expression algébrique", "facile", { reponses_acceptees: ["l'inconnue", "variable", "la variable", "une inconnue", "une variable"] }),
    q("qcm", "Un forfait de cellulaire coûte 15 $ par mois plus 2 $ par Go utilisé. Ce mois-ci, la facture est de 27 $. Combien de Go ont été utilisés ?", ["6", "12", "21", "7"], "6", "15 + 2x = 27 → 2x = 12 → x = 6 Go.", "Traduire un problème en équation", "difficile"),
    q("ouverte", "Développe et réduis : 2(x + 1) + 3x", [], "5x + 2", "2(x + 1) = 2x + 2. Puis 2x + 3x = 5x. Résultat : 5x + 2.", "La distributivité", "difficile", { reponses_acceptees: ["5x+2", "2 + 5x", "2+5x"] }),
  ],
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

export const estAlgebre = (matiere, sujet) => /math/i.test(matiere || "") && /alg[eè]br|[ée]quation|expression|variable|inconnue|distributiv/i.test(sujet || "");
function banque(matiere, sujet = "") {
  if (estCCQ(matiere)) return banqueCCQ(sujet, true); // Culture et citoyenneté québécoise : programme de 2e secondaire
  if (/renaissance|humanis|gutenberg/i.test(sujet)) return RENAISSANCE;
  const costumes = banqueCostumes(matiere, sujet); // costumes d'époque ou traditionnels (illustrations)
  if (costumes) return costumes;
  const geo = banqueGeo(matiere, sujet); // vraies cartes + drapeaux officiels
  if (geo) return geo;
  if (/histoire|univers social/i.test(matiere)) return RENAISSANCE;
  if (/g[ée]ograph/i.test(matiere)) return banqueGeo(matiere, "les continents");
  if (/angl/i.test(matiere)) return BANQUES["Anglais"];
  if (estAlgebre(matiere, sujet)) return ALGEBRE;
  if (/fran/i.test(matiere)) return BANQUES["Français"];
  return BANQUES["Mathématique"];
}
const estChoix = (x) => x.type === "qcm" || x.type === "vrai_faux" || x.type === "ordre" || x.type === "carte"; // questions sans écriture
// Choisit n questions en respectant au mieux la part de questions à choix demandée.
// Clé d'une question (pour savoir si l'élève l'a déjà vue) : énoncé + image + réponse.
export const cleQuestion = (x) => `${x.enonce}|${x.image_url || ""}|${x.reponse}`.toLowerCase().replace(/\s+/g, " ").slice(0, 300);
const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };
// Jamais vues d'abord (au hasard), puis les plus anciennement vues : la révision change à chaque fois.
function parFraicheur(questions, vues = []) {
  const rang = new Map(vues.map((e, i) => [e, i]));
  return melange(questions).sort((a, b) => (rang.get(cleQuestion(a)) ?? -1) - (rang.get(cleQuestion(b)) ?? -1));
}
// Variantes : chaque QCM devient aussi un « vrai ou faux » (bonne réponse, puis un mauvais choix).
// Une seule version d'une même question par séance (base commune).
function avecVariantes(questions) {
  const out = [];
  for (const x of questions) {
    const base = cleQuestion(x);
    out.push({ ...x, _base: base });
    if (x.type !== "qcm" || x.choix.length < 3 || /^(Vrai|Faux)$/.test(x.reponse)) continue;
    const mauvais = x.choix.filter((c) => c !== x.reponse);
    const faux = mauvais[Math.floor(Math.random() * mauvais.length)];
    const pq = (x.explications_choix || []).find((e) => e.choix === faux)?.pourquoi || "";
    const enonce = (rep) => `Vrai ou faux ? ${x.enonce.replace(/\s*\?$/, " ?")} Réponse proposée : « ${rep} »`;
    out.push({ ...x, _base: base, type: "vrai_faux", choix: ["Vrai", "Faux"], enonce: enonce(x.reponse), reponse: "Vrai", explications_choix: [], explication: `Vrai : « ${x.reponse} » est la bonne réponse. ${x.explication}` });
    out.push({ ...x, _base: base, type: "vrai_faux", choix: ["Vrai", "Faux"], enonce: enonce(faux), reponse: "Faux", explications_choix: [], explication: `Faux. ${pq ? pq + " " : ""}La bonne réponse est « ${x.reponse} ». ${x.explication}` });
  }
  return out;
}
function selection(questionsBrutes, n, pctQcm, vues = []) {
  const vuesBases = new Set();
  const questions = parFraicheur(avecVariantes(questionsBrutes), vues).filter((x) => (vuesBases.has(x._base) ? false : vuesBases.add(x._base)))
    .map(({ _base, ...x }) => x);
  const choix = questions.filter(estChoix), ouvertes = questions.filter((x) => !estChoix(x));
  if (pctQcm <= 0) return melange(ouvertes.slice(0, n));
  if (pctQcm >= 100) return melange(choix.slice(0, n));
  let nc = Math.round((Math.min(n, questions.length) * pctQcm) / 100), no = Math.min(n, questions.length) - nc;
  if (nc > choix.length) { no += nc - choix.length; nc = choix.length; }
  if (no > ouvertes.length) { nc = Math.min(choix.length, nc + no - ouvertes.length); no = ouvertes.length; }
  return melange([...choix.slice(0, nc), ...ouvertes.slice(0, no)]); // ordre toujours différent
}

// Pourquoi chaque mauvais choix est faux (questions d'algèbre de démo).
const POURQUOI = {
  "Dans l'expression 7x − 4": { x: "x est la variable, pas le coefficient. Le coefficient est le nombre collé devant la lettre.", "−4": "−4 est la constante (le terme sans lettre).", "4": "4 vient de la constante −4, pas du terme en x." },
  "Réduis : 4x + 3 + 2x − 1": { "8x": "Tu as additionné les x avec les nombres (4 + 3 + 2 − 1). On ne peut pas : 3 et −1 ne contiennent pas de x.", "6x + 4": "Tu as fait 3 + 1 au lieu de 3 − 1. Attention au signe devant le 1.", "2x + 2": "Tu as soustrait 4x − 2x, mais le 2x est précédé d'un + : 4x + 2x = 6x." },
  "Développe : 3(x + 4)": { "3x + 4": "Tu as oublié de multiplier le 4 par 3. Le 3 se distribue sur CHAQUE terme.", "x + 12": "Tu as oublié de multiplier le x par 3.", "3x + 7": "Tu as additionné 3 + 4 au lieu de multiplier 3 × 4." },
  "Réduis : 5a + 2b − a + 3b": { "6a + 5b": "Tu as ajouté le a au lieu de l'enlever : 5a − a = 4a.", "9ab": "On ne peut pas regrouper des a avec des b : ce ne sont pas des termes semblables.", "5a + 5b": "Tu as oublié le −a : 5a − a = 4a." },
  "Développe : −2(x − 5)": { "−2x − 10": "Moins par moins donne PLUS : −2 × (−5) = +10.", "2x − 10": "Le −2 multiplie aussi le x : −2 × x = −2x (et −2 × −5 = +10).", "−2x − 5": "Il faut multiplier le −5 par −2 : on obtient +10, pas −5." },
  "« Le double d'un nombre, augmenté de 5": { "2(x + 5) = 17": "Ici, c'est seulement le nombre qui est doublé, pas « le nombre + 5 ». Les parenthèses changent le sens.", "x + 2 + 5 = 17": "« Le double » veut dire × 2, pas + 2.", "5x + 2 = 17": "Tu as inversé : le double = 2x, puis on ajoute 5." },
  "Un forfait de cellulaire": { "12": "12 $, c'est le montant payé pour les Go (27 − 15). Il faut encore diviser par 2 $ par Go.", "21": "Tu as additionné. Il faut d'abord enlever le forfait de base : 27 − 15 = 12, puis 12 ÷ 2.", "7": "Vérifie : 15 + 2 × 7 = 29 $, pas 27 $." },
  "Quelle fraction est équivalente à 3/4": { "4/5": "On a ajouté 1 en haut et en bas : ça ne garde pas la même valeur. Il faut MULTIPLIER les deux par le même nombre.", "3/8": "Seul le bas a été multiplié par 2 : la fraction devient plus petite.", "9/16": "Le haut a été multiplié par 3 et le bas par 4 : ce n'est pas le même nombre." },
  "1/4 + 1/6 = ?": { "2/10": "Tu as additionné les numérateurs ET les dénominateurs. Il faut d'abord un dénominateur commun.", "1/5": "Ce n'est pas une addition de fractions valide : mets-les sur 12 d'abord.", "7/12": "Les fractions sur 12 sont 3/12 et 2/12 : 3 + 2 = 5, pas 7." },
};
// En maths, la démarche détaillée reprend l'explication étape par étape.
function enrichir(questions, maths) {
  return questions.map((x) => {
    const cle = Object.keys(POURQUOI).find((k) => x.enonce.startsWith(k));
    const explications_choix = x.explications_choix.length ? x.explications_choix
      : cle ? Object.entries(POURQUOI[cle]).map(([choix, pourquoi]) => ({ choix, pourquoi })) : [];
    const etapes = x.explication.split(/(?<=[.✔])\s+/).filter(Boolean);
    const demarche = x.demarche || (maths && /\d/.test(x.explication) && etapes.length > 1 ? etapes.map((l, i) => `${i + 1}. ${l}`).join("\n") : "");
    return { ...x, demarche, explications_choix };
  });
}
const estMaths = (b) => b === ALGEBRE || b === BANQUES["Mathématique"];
// Maths en « questions ouvertes seulement » : un QCM à réponse courte devient une question à écrire (avec calcul).
const enOuvertes = (questions) => questions.map((x) => x.type !== "qcm" || x.reponse.length > 14 || x.garderChoix ? x
  : { ...x, type: /^-?\d+([.,]\d+)?$/.test(x.reponse) ? "numerique" : "ouverte", choix: [], explications_choix: [], reponses_acceptees: [x.reponse.replace(/\s+/g, "")] });
// Banque + (en maths) des questions générées avec de nouveaux nombres à chaque fois.
// Algèbre : les questions fixes sont filtrées selon le niveau (1 : faciles; 2 : faciles + moyennes; 3-4 : toutes).
const DIFF_PERMISES = { 1: ["facile"], 2: ["facile", "moyen"] };
const preparer = (b, pct, n = 10, { niveau } = {}) => {
  const fixes = b === ALGEBRE && DIFF_PERMISES[niveau] ? b.questions.filter((x) => DIFF_PERMISES[niveau].includes(x.difficulte)) : b.questions;
  const qs = estMaths(b) ? [...fixes, ...questionsGenerees(b === ALGEBRE ? "algebre" : "fractions", Math.max(10, n + 6), { niveau })] : b.questions;
  return estMaths(b) && pct <= 0 ? enOuvertes(qs) : qs;
};

// vues : questions déjà vues par l'élève sur ce sujet (les plus anciennes d'abord) → on propose d'abord les nouvelles.
export function demoRevision(matiere, sujet, n = 10, pctQcm = 70, vues = [], opts = {}) {
  const b = banque(matiere, sujet);
  return { demo: true, fiche: b.fiche, questions: enrichir(selection(preparer(b, pctQcm, n, opts), n, pctQcm, vues), estMaths(b)), sources: [{ titre: "Alloprof", url: "https://www.alloprof.qc.ca/" }] };
}

// ---------- Mini-dictionnaire du mode démo ----------
const d = (mot, phonetique, nature, traductions, exemple_en, exemple_fr, synonymes_en, synonymes_fr) =>
  ({ mot, phonetique, nature, traductions, exemple_en, exemple_fr, synonymes_en, synonymes_fr });
const DICO = [
  d("happy", "/ˈhæp.i/", "adjectif", ["heureux", "content"], "She is happy to see her friends.", "Elle est heureuse de voir ses amis.", ["glad", "joyful", "cheerful"], ["joyeux", "ravi", "content"]),
  d("sad", "/sæd/", "adjectif", ["triste"], "He was sad after the game.", "Il était triste après la partie.", ["unhappy", "upset", "down"], ["malheureux", "peiné"]),
  d("big", "/bɪɡ/", "adjectif", ["grand", "gros"], "They live in a big house.", "Ils habitent dans une grande maison.", ["large", "huge", "enormous"], ["énorme", "immense", "vaste"]),
  d("small", "/smɔːl/", "adjectif", ["petit"], "I have a small dog.", "J'ai un petit chien.", ["little", "tiny"], ["minuscule", "menu"]),
  d("fast", "/fæst/", "adjectif / adverbe", ["rapide", "vite"], "My brother runs very fast.", "Mon frère court très vite.", ["quick", "rapid", "speedy"], ["rapide", "prompt"]),
  d("beautiful", "/ˈbjuː.tɪ.fəl/", "adjectif", ["beau", "magnifique"], "What a beautiful sunset!", "Quel beau coucher de soleil !", ["pretty", "lovely", "gorgeous"], ["joli", "superbe", "splendide"]),
  d("friend", "/frend/", "nom", ["ami", "amie"], "My best friend lives next door.", "Mon meilleur ami habite à côté.", ["buddy", "pal", "mate"], ["copain", "camarade", "chum (Québec)"]),
  d("school", "/skuːl/", "nom", ["école"], "We walk to school every morning.", "Nous marchons jusqu'à l'école chaque matin.", ["academy", "college"], ["établissement scolaire", "collège"]),
  d("house", "/haʊs/", "nom", ["maison"], "Their house has a red door.", "Leur maison a une porte rouge.", ["home", "residence", "building"], ["demeure", "domicile", "logement"]),
  d("weekend", "/ˈwiːk.end/", "nom", ["fin de semaine", "week-end"], "What did you do last weekend?", "Qu'as-tu fait la fin de semaine dernière ?", [], ["week-end"]),
  d("homework", "/ˈhoʊm.wɝːk/", "nom", ["devoirs"], "I finished my homework before dinner.", "J'ai fini mes devoirs avant le souper.", ["assignment", "schoolwork"], ["travail", "exercices"]),
  d("go", "/ɡoʊ/", "verbe (irrégulier : went, gone)", ["aller", "partir"], "We go to the park on Sundays.", "Nous allons au parc le dimanche.", ["move", "travel", "leave"], ["se rendre", "partir"]),
  d("eat", "/iːt/", "verbe (irrégulier : ate, eaten)", ["manger"], "They eat lunch at noon.", "Ils mangent le dîner à midi.", ["consume", "have", "dine"], ["se nourrir", "dîner"]),
  d("run", "/rʌn/", "verbe (irrégulier : ran, run)", ["courir"], "She runs in the park every day.", "Elle court au parc tous les jours.", ["jog", "sprint", "race"], ["galoper", "filer"]),
  d("learn", "/lɝːn/", "verbe", ["apprendre"], "I want to learn Spanish.", "Je veux apprendre l'espagnol.", ["study", "discover", "master"], ["étudier", "découvrir"]),
  d("understand", "/ˌʌn.dɚˈstænd/", "verbe (irrégulier : understood)", ["comprendre"], "Do you understand the question?", "Comprends-tu la question ?", ["get", "grasp", "realize"], ["saisir", "piger (familier)"]),
  d("help", "/help/", "verbe / nom", ["aider", "aide"], "Can you help me with this exercise?", "Peux-tu m'aider avec cet exercice ?", ["assist", "support", "aid"], ["assister", "soutenir", "dépanner"]),
  d("tired", "/taɪrd/", "adjectif", ["fatigué"], "I'm tired after the hockey practice.", "Je suis fatigué après la pratique de hockey.", ["exhausted", "sleepy", "worn out"], ["épuisé", "crevé", "brûlé (Québec)"]),
  d("always", "/ˈɑːl.weɪz/", "adverbe", ["toujours"], "He is always late.", "Il est toujours en retard.", ["constantly", "forever", "every time"], ["constamment", "sans cesse"]),
  d("yesterday", "/ˈjes.tɚ.deɪ/", "adverbe / nom", ["hier"], "I saw a movie yesterday.", "J'ai vu un film hier.", [], ["la veille"]),
];
export function demoDico(items) {
  return items.map((mot) => DICO.find((e) => e.mot === mot.toLowerCase())
    || d(mot, "", "—", ["(mode démo : mot absent du mini-dictionnaire)"], "", "", [], []));
}

export function demoFinal(matiere, sujet, n = 20, pctQcm = 70, vues = [], opts = {}) {
  const b = banque(matiere, sujet);
  return { demo: true, questions: enrichir(selection(preparer(b, pctQcm, n, opts), n, pctQcm, vues), estMaths(b)), sources: [] };
}
