// Questions de maths générées avec de nouveaux nombres à chaque révision / examen (mode sans clé API et leçons intégrées).
// Chaque question a sa démarche détaillée et un indice (notion + exemple avec d'autres nombres).
const q = (type, enonce, reponse, explication, notion, difficulte, extra = {}) =>
  ({ type, enonce, choix: [], indice: "", elements: [], image_svg: "", image_url: "", reponse: String(reponse), reponses_acceptees: [], tolerance: 0, audio: "", explication, demarche: "", explications_choix: [], notion, difficulte, ...extra });
const ent = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const nonNul = (a, b) => { let x = 0; while (!x) x = ent(a, b); return x; };
const signe = (n) => (n < 0 ? `− ${-n}` : `+ ${n}`);
const nb = (n) => (n < 0 ? `−${-n}` : `${n}`); // signe moins typographique
const par = (n) => (n < 0 ? `(${nb(n)})` : `${n}`);
const coef = (n) => (n === 1 ? "" : n === -1 ? "−" : nb(n));
const pgcd = (a, b) => (b ? pgcd(b, a % b) : Math.abs(a));
const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };
const qcm = (enonce, bonne, fausses, explication, notion, difficulte, extra = {}) =>
  ({ ...q("qcm", enonce, bonne, explication, notion, difficulte, extra), choix: melange([String(bonne), ...[...new Set(fausses.map(String))].filter((f) => f !== String(bonne)).slice(0, 3)]) });

// ---------- Algèbre : 4 niveaux qui suivent l'année et les progrès de l'élève ----------
// Niveau 1 · bases (début de 2e secondaire, 1er contrôle) : vocabulaire, valeur numérique, réduire, équations à une étape, traduire.
// Niveau 2 · consolidation : nombres négatifs, distributivité, équations à deux étapes, problèmes simples.
// Niveau 3 · avancé : inconnue des deux côtés, parenthèses, deux variables, problèmes à deux étapes.
// Niveau 4 · défi (vers la 3e secondaire) : monômes, mise en évidence, équations avec fractions.
export const NIVEAUX_ALGEBRE = ["", "bases", "consolidation", "avancé", "défi"];
const DIFF = ["", "facile", "facile", "moyen", "difficile"];
const LETTRES = ["x", "a", "n", "y"];
const GEN_ALGEBRE = [
  // ----- Niveau 1 -----
  [1, () => { const a = ent(2, 9), l = LETTRES[ent(0, 3)]; let b = ent(1, 12); if (b === a) b += 1;
    return qcm(`Dans l'expression ${a}${l} + ${b}, quel est le coefficient de ${l} ?`, a, [b, l, a + b], `Le coefficient est le nombre collé devant la lettre : ${a}. ${b} est le terme constant.`, "Expression algébrique", "facile",
      { indice: "Le coefficient est le nombre qui multiplie la lettre. Exemple : dans 7y − 2, le coefficient de y est 7." }); }],
  [1, () => { const a = ent(2, 9); let b = ent(1, 15); if (b === a) b += 1;
    return qcm(`Dans l'expression ${a}x + ${b}, quel est le terme constant ?`, b, [a, `${a}x`, a + b], `Le terme constant est le terme sans lettre : ${b}.`, "Expression algébrique", "facile",
      { indice: "Le terme constant ne contient pas de lettre. Exemple : dans 4n + 9, c'est 9." }); }],
  [1, () => { const a = ent(2, 9), k = ent(2, 9);
    return qcm(`Lequel de ces termes est semblable à ${a}x ?`, `${k}x`, [`${k}y`, `${k}x²`, `${k}`], `Des termes semblables ont la même lettre avec le même exposant : ${a}x et ${k}x.`, "Réduire une expression", "facile",
      { garderChoix: true, indice: "Semblable = même lettre ET même exposant. Exemple : 3a et 8a sont semblables, mais pas 3a et 3b." }); }],
  [1, () => { const a = ent(2, 9), b = ent(1, 12), x = ent(1, 6), r = a * x + b;
    return q("numerique", `Calcule la valeur de ${a}x + ${b} si x = ${x}.`, r, `On remplace x par ${x} : ${a} × ${x} + ${b} = ${a * x} + ${b} = ${r}.`, "Expression algébrique", "facile",
      { demarche: `1. Remplacer x par ${x} : ${a} × ${x} + ${b}\n2. Multiplier d'abord : ${a * x} + ${b}\n3. Additionner : ${r}`, indice: "Remplace la lettre par sa valeur, puis fais la multiplication avant l'addition. Exemple : si x = 2, 4x + 1 = 9." }); }],
  [1, () => { const a = ent(2, 8), c = ent(1, 7), b = ent(1, 9), rep = `${a + c}x + ${b}`;
    return qcm(`Réduis : ${a}x + ${b} + ${coef(c)}x`, rep, [`${a + b + c}x`, `${a + c}x`, `${a * c}x + ${b}`], `On additionne les termes semblables : ${a}x + ${c}x = ${a + c}x. Le ${b} reste seul. Réponse : ${rep}.`, "Réduire une expression", "facile",
      { indice: "Regroupe les termes en x ensemble; un nombre seul ne s'additionne pas avec des x. Exemple : 2x + 5 + 3x = 5x + 5." }); }],
  [1, () => { const x = ent(2, 20), b = ent(2, 15), moins = Math.random() < 0.4, c = moins ? x - b : x + b;
    return q("numerique", `Résous : x ${moins ? "−" : "+"} ${b} = ${nb(c)}. Quelle est la valeur de x ?`, x, `On ${moins ? `ajoute ${b}` : `enlève ${b}`} des deux côtés : x = ${nb(c)} ${moins ? "+" : "−"} ${b} = ${x}. Vérif : ${x} ${moins ? "−" : "+"} ${b} = ${nb(c)} ✔`, "Résoudre une équation du 1er degré", "facile",
      { demarche: `1. Opération inverse des deux côtés : ${moins ? `+${b}` : `−${b}`}\n2. x = ${nb(c)} ${moins ? "+" : "−"} ${b}\n3. x = ${x}`, indice: "Fais l'opération inverse des deux côtés. Exemple : x + 4 = 11 → x = 11 − 4 = 7." }); }],
  [1, () => { const a = ent(2, 9), x = ent(2, 12), c = a * x;
    return q("numerique", `Résous : ${a}x = ${c}`, x, `On divise les deux côtés par ${a} : x = ${c} ÷ ${a} = ${x}. Vérif : ${a} × ${x} = ${c} ✔`, "Résoudre une équation du 1er degré", "facile",
      { demarche: `1. Diviser les deux côtés par ${a}\n2. x = ${c} ÷ ${a} = ${x}`, indice: "Pour défaire une multiplication, divise des deux côtés. Exemple : 4x = 20 → x = 20 ÷ 4 = 5." }); }],
  [1, () => { const k = ent(2, 4), b = ent(1, 9), mot = ["", "", "Le double", "Le triple", "Le quadruple"][k], rep = `${k}x + ${b}`;
    return qcm(`Traduis en expression algébrique : « ${mot} d'un nombre, augmenté de ${b} ».`, rep, [`${k}(x + ${b})`, `x + ${k} + ${b}`, `${b}x + ${k}`], `${mot} d'un nombre = ${k}x; augmenté de ${b} = + ${b}. Réponse : ${rep}.`, "Traduire un problème en équation", "facile",
      { indice: "Traduis mot par mot : « double » = 2x, « augmenté de » = +. Exemple : « le triple d'un nombre diminué de 1 » = 3x − 1." }); }],
  // ----- Niveau 2 -----
  [2, () => { const a = ent(2, 9), b = nonNul(-9, 9), x = ent(-5, 6), r = a * x + b;
    return q("numerique", `Calcule la valeur de ${a}x ${signe(b)} si x = ${nb(x)}.`, r, `On remplace x par ${nb(x)} : ${a} × ${par(x)} ${signe(b)} = ${nb(a * x)} ${signe(b)} = ${nb(r)}.`, "Expression algébrique", "moyen",
      { demarche: `1. Remplacer x par ${nb(x)} : ${a} × ${par(x)} ${signe(b)}\n2. Multiplier : ${nb(a * x)} ${signe(b)}\n3. Résultat : ${nb(r)}`, indice: "Attention aux signes quand x est négatif. Exemple : si x = −2, 3x + 1 = −6 + 1 = −5." }); }],
  [2, () => { const a = ent(3, 9), c = ent(1, a - 1), b = ent(1, 9), d = ent(1, 9), x = a - c, k = b - d, rep = `${coef(x)}x${k ? ` ${signe(k)}` : ""}`;
    return qcm(`Réduis : ${a}x + ${b} − ${coef(c)}x − ${d}`, rep, [`${a + c}x ${signe(b + d)}`, `${nb(a - c + b - d)}x`, `${coef(x)}x ${signe(b + d)}`], `Les x : ${a}x − ${c}x = ${coef(x)}x. Les nombres : ${b} − ${d} = ${nb(k)}. Réponse : ${rep}.`, "Réduire une expression", "moyen",
      { indice: "Garde le signe devant chaque terme quand tu regroupes. Exemple : 6x + 2 − 4x − 5 = 2x − 3." }); }],
  [2, () => { const a = ent(2, 7), b = ent(1, 9), rep = `${a}x + ${a * b}`;
    return qcm(`Développe : ${a}(x + ${b})`, rep, [`${a}x + ${b}`, `x + ${a * b}`, `${a + b}x`], `On multiplie ${a} par chaque terme : ${a} × x = ${a}x et ${a} × ${b} = ${a * b}. Réponse : ${rep}.`, "La distributivité", "moyen",
      { indice: "Multiplie le nombre devant la parenthèse par CHAQUE terme. Exemple : 3(x + 2) = 3x + 6." }); }],
  [2, () => { const a = ent(2, 9), x = ent(-6, 12), b = nonNul(-15, 15), c = a * x + b;
    return q("numerique", `Résous : ${a}x ${signe(b)} = ${nb(c)}`, x, `${b > 0 ? `−${b}` : `+${-b}`} des deux côtés : ${a}x = ${nb(c - b)}. ÷${a} des deux côtés : x = ${nb(x)}. Vérif : ${a} × ${par(x)} ${signe(b)} = ${nb(c)} ✔`, "Résoudre une équation du 1er degré", "moyen",
      { demarche: `1. ${b > 0 ? `Enlever ${b}` : `Ajouter ${-b}`} des deux côtés : ${a}x = ${nb(c - b)}\n2. Diviser par ${a} : x = ${nb(x)}\n3. Vérification : ${a} × ${par(x)} ${signe(b)} = ${nb(c)} ✔`, indice: "Défais d'abord le + ou le −, puis la multiplication. Exemple : 2x + 5 = 17 → 2x = 12 → x = 6." }); }],
  [2, () => { const k = ent(2, 4), b = ent(3, 20), x = ent(3, 25), c = k * x + b, mot = ["", "", "Le double", "Le triple", "Le quadruple"][k];
    return q("numerique", `« ${mot} d'un nombre, augmenté de ${b}, vaut ${c}. » Quel est ce nombre ?`, x, `On traduit : ${k}x + ${b} = ${c}. Donc ${k}x = ${c - b} et x = ${x}. Vérif : ${k} × ${x} + ${b} = ${c} ✔`, "Traduire un problème en équation", "moyen",
      { demarche: `1. Inconnue : x = le nombre\n2. Équation : ${k}x + ${b} = ${c}\n3. ${k}x = ${c - b}\n4. x = ${x}\n5. Réponse : le nombre est ${x}.`, indice: "Choisis x pour le nombre et traduis chaque mot. Exemple : « le double d'un nombre diminué de 3 vaut 11 » → 2x − 3 = 11." }); }],
  [2, () => { const b = ent(2, 9), rep = `4x + ${2 * b}`;
    return qcm(`Un rectangle mesure (x + ${b}) cm de long et x cm de large. Quelle expression donne son périmètre ?`, rep, [`2x + ${b}`, `4x + ${b}`, `x² + ${b}x`], `Périmètre = 2 × (longueur + largeur) = 2(x + ${b} + x) = 2(2x + ${b}) = ${rep}.`, "Traduire un problème en équation", "moyen",
      { indice: "Périmètre d'un rectangle = 2 × (longueur + largeur). Exemple : côtés x + 1 et x → 2(2x + 1) = 4x + 2." }); }],
  // ----- Niveau 3 -----
  [3, () => { const a = nonNul(-6, -2), b = nonNul(-9, 9), ab = a * b, rep = `${coef(a)}x ${signe(ab)}`;
    return qcm(`Développe : ${nb(a)}(x ${signe(b)})`, rep, [`${coef(a)}x ${signe(b)}`, `${coef(-a)}x ${signe(ab)}`, `${coef(a)}x ${signe(-ab)}`], `On multiplie ${nb(a)} par chaque terme : ${nb(a)} × x = ${coef(a)}x et ${nb(a)} × ${par(b)} = ${nb(ab)} (attention aux signes). Réponse : ${rep}.`, "La distributivité", "difficile",
      { indice: "Un nombre négatif devant la parenthèse change le signe de chaque terme. Exemple : −2(x − 4) = −2x + 8." }); }],
  [3, () => { const a = ent(2, 8), b = ent(1, 6), c = ent(1, a - 1), d = ent(1, 6), rep = `${coef(a - c)}a + ${coef(b + d)}b`;
    return qcm(`Réduis : ${a}a + ${coef(b)}b − ${coef(c)}a + ${coef(d)}b`, rep, [`${a + b - c + d}ab`, `${coef(a + c)}a + ${b + d}b`, `${coef(a - c)}a + ${coef(Math.abs(b - d) || 2)}b`], `On regroupe les a : ${a}a − ${coef(c)}a = ${coef(a - c)}a, puis les b : ${coef(b)}b + ${coef(d)}b = ${b + d}b.`, "Réduire une expression", "difficile",
      { indice: "Les a vont avec les a, les b avec les b : on ne mélange jamais deux lettres différentes. Exemple : 5a + 2b − a = 4a + 2b." }); }],
  [3, () => { const x = ent(-5, 9), c = ent(1, 5), a = c + ent(1, 5), b = nonNul(-12, 12), d = (a - c) * x + b;
    return q("numerique", `Résous : ${a}x ${signe(b)} = ${c === 1 ? "" : c}x ${signe(d)}`, x, `On ramène les x à gauche : ${a}x − ${c}x = ${a - c}x. Les nombres à droite : ${nb(d)} ${signe(-b)} = ${nb(d - b)}. Donc ${a - c}x = ${nb(d - b)} et x = ${nb(x)}.`, "Résoudre une équation du 1er degré", "difficile",
      { demarche: `1. Enlever ${c}x des deux côtés : ${a - c}x ${signe(b)} = ${nb(d)}\n2. ${b > 0 ? `Enlever ${b}` : `Ajouter ${-b}`} : ${a - c}x = ${nb(d - b)}\n3. Diviser par ${a - c} : x = ${nb(x)}\n4. Vérification : ${a} × ${par(x)} ${signe(b)} = ${nb(a * x + b)} et ${c} × ${par(x)} ${signe(d)} = ${nb(c * x + d)} ✔`, indice: "Regroupe les x d'un côté et les nombres de l'autre. Exemple : 5x + 2 = 2x + 11 → 3x = 9 → x = 3." }); }],
  [3, () => { const a = ent(2, 6), b = nonNul(-6, 8), x = ent(-4, 8), c = a * (x + b);
    return q("numerique", `Résous : ${a}(x ${signe(b)}) = ${nb(c)}`, x, `On développe : ${a}x ${signe(a * b)} = ${nb(c)}. Puis ${a}x = ${nb(c - a * b)} et x = ${nb(x)}. (Ou : on divise d'abord par ${a} : x ${signe(b)} = ${nb(c / a)}.)`, "Résoudre une équation du 1er degré", "difficile",
      { demarche: `1. Diviser les deux côtés par ${a} : x ${signe(b)} = ${nb(c / a)}\n2. ${b > 0 ? `Enlever ${b}` : `Ajouter ${-b}`} : x = ${nb(x)}`, indice: "Développe la parenthèse, ou divise d'abord les deux côtés par le nombre devant. Exemple : 3(x + 2) = 15 → x + 2 = 5 → x = 3." }); }],
  [3, () => { const t = ent(8, 16), e = ent(2, 9), total = 2 * t + e;
    return q("numerique", `Léa a ${e} ans de plus que Tom. Ensemble, ils ont ${total} ans. Quel âge a Tom ?`, t, `Tom = x, Léa = x + ${e}. Équation : x + x + ${e} = ${total} → 2x = ${total - e} → x = ${t}. Tom a ${t} ans.`, "Traduire un problème en équation", "difficile",
      { demarche: `1. Tom : x · Léa : x + ${e}\n2. x + (x + ${e}) = ${total}\n3. 2x + ${e} = ${total} → 2x = ${total - e}\n4. x = ${t} : Tom a ${t} ans (Léa ${t + e}).`, indice: "Exprime les deux âges avec la même lettre. Exemple : si Ana a 2 ans de plus que Ben, Ben = x et Ana = x + 2." }); }],
  // ----- Niveau 4 -----
  [4, () => { const a = ent(2, 7), b = a === 2 ? ent(3, 6) : ent(2, 6), rep = `${a * b}x²`;
    return qcm(`Calcule : ${a}x × ${b}x`, rep, [`${a * b}x`, `${a + b}x²`, `${a + b}x`], `On multiplie les coefficients (${a} × ${b} = ${a * b}) et les lettres (x × x = x²) : ${rep}.`, "Expression algébrique", "difficile",
      { indice: "Multiplie les nombres entre eux et les lettres entre elles : x × x = x². Exemple : 3x × 4x = 12x²." }); }],
  [4, () => { const k = ent(2, 6), a = ent(1, 5), b = ent(1, 7), rep = `${k}(${a === 1 ? "" : a}x + ${b})`;
    return qcm(`Factorise (mise en évidence) : ${k * a}x + ${k * b}`, rep, [`${k}(${k * a}x + ${b})`, `${k * a}(x + ${b})`, `x(${k * a} + ${k * b})`], `${k} divise ${k * a} et ${k * b} : ${k * a}x + ${k * b} = ${rep}. Vérif en développant ✔`, "La distributivité", "difficile",
      { indice: "Cherche le plus grand nombre qui divise tous les termes, puis mets-le devant la parenthèse. Exemple : 6x + 9 = 3(2x + 3)." }); }],
  [4, () => { const a = ent(2, 5), x = a * ent(-3, 6), b = nonNul(-8, 8), c = x / a + b;
    return q("numerique", `Résous : x/${a} ${signe(b)} = ${nb(c)}`, x, `${b > 0 ? `−${b}` : `+${-b}`} des deux côtés : x/${a} = ${nb(c - b)}. × ${a} des deux côtés : x = ${nb(x)}.`, "Résoudre une équation du 1er degré", "difficile",
      { demarche: `1. ${b > 0 ? `Enlever ${b}` : `Ajouter ${-b}`} : x/${a} = ${nb(c - b)}\n2. Multiplier par ${a} : x = ${nb(x)}`, indice: "Pour défaire une division, multiplie des deux côtés. Exemple : x/3 + 1 = 5 → x/3 = 4 → x = 12." }); }],
];
// Niveau visé en algèbre selon l'année scolaire, le moment de l'année et les résultats récents sur ce sujet.
export function niveauAlgebre({ annee = "", sessions = [], date = new Date() } = {}) {
  const sec = /secondaire/i.test(annee), an = parseInt(annee, 10) || 1;
  let base = !sec ? 1 : an <= 1 ? 1 : an === 2 ? 2 : an === 3 ? 3 : 4;
  const mois = date.getMonth(); // 0 = janvier
  const moment = mois >= 7 && mois <= 10 ? "debut" : mois >= 2 && mois <= 6 ? "fin" : "milieu";
  if (moment === "debut") base -= 1; else if (moment === "fin") base += 1;
  const notees = sessions.filter((s) => s.type !== "lecon" && Number.isFinite(s.pourcentage));
  const reussites = notees.filter((s) => s.pourcentage >= 80).length;
  const recentes = notees.slice(-2), moyRec = recentes.length ? recentes.reduce((a, s) => a + s.pourcentage, 0) / recentes.length : null;
  let niveau = base + Math.min(2, Math.floor(reussites / 2)); // monte d'un niveau toutes les 2 séances réussies (80 % et plus)
  if (moyRec != null && moyRec < 50) niveau -= 1;               // redescend si les deux dernières séances sont difficiles
  niveau = Math.max(1, Math.min(4, niveau));
  const quand = moment === "debut" ? "début d'année, 1er contrôle" : moment === "fin" ? "fin d'année" : "milieu d'année";
  return { niveau, moment, texte: `Algèbre · niveau ${niveau}/4 (${NIVEAUX_ALGEBRE[niveau]}) · ${annee || "—"}, ${quand}` };
}

// ---------- Fractions, priorités, pourcentages ----------
const GEN_FRACTIONS = [
  () => { // même dénominateur
    const d = ent(5, 12), a = ent(1, d - 2), b = ent(1, d - a - 1), s = a + b, g = pgcd(s, d);
    return q("ouverte", `Calcule : ${a}/${d} + ${b}/${d} (donne une fraction).`, `${s}/${d}`, `Même dénominateur : on additionne les numérateurs : ${a} + ${b} = ${s}, donc ${s}/${d}${g > 1 ? ` = ${s / g}/${d / g}` : ""}.`, "Additionner des fractions", "facile",
      { reponses_acceptees: g > 1 ? [`${s / g}/${d / g}`] : [], indice: "Si les dénominateurs sont pareils, additionne seulement les numérateurs. Exemple : 2/7 + 3/7 = 5/7." });
  },
  () => { // dénominateurs différents
    const [d1, d2] = melange([[2, 3], [2, 5], [3, 4], [4, 6], [3, 5], [2, 7]])[0], a = ent(1, d1 - 1), b = ent(1, d2 - 1);
    const den = (d1 * d2) / pgcd(d1, d2), num = a * (den / d1) + b * (den / d2), g = pgcd(num, den);
    return q("ouverte", `Calcule : ${a}/${d1} + ${b}/${d2} (donne une fraction).`, `${num}/${den}`, `Dénominateur commun ${den} : ${a}/${d1} = ${a * (den / d1)}/${den} et ${b}/${d2} = ${b * (den / d2)}/${den}. Somme : ${num}/${den}${g > 1 ? ` = ${num / g}/${den / g}` : ""}.`, "Additionner des fractions", "moyen",
      { reponses_acceptees: g > 1 ? [`${num / g}/${den / g}`] : [], demarche: `1. Dénominateur commun : ${den}\n2. ${a}/${d1} = ${a * (den / d1)}/${den}\n3. ${b}/${d2} = ${b * (den / d2)}/${den}\n4. ${a * (den / d1)} + ${b * (den / d2)} = ${num} → ${num}/${den}`, indice: "Trouve un dénominateur commun avant d'additionner. Exemple : 1/2 + 1/4 = 2/4 + 1/4 = 3/4." });
  },
  () => { // équivalente
    const a = ent(1, 5), b = ent(a + 1, 9), k = ent(2, 5), bonne = `${a * k}/${b * k}`;
    return qcm(`Quelle fraction est équivalente à ${a}/${b} ?`, bonne, [`${a + k}/${b + k}`, `${a * k}/${b}`, `${a}/${b * k}`], `On multiplie le numérateur ET le dénominateur par ${k} : ${a}/${b} = ${bonne}.`, "Fractions équivalentes", "facile",
      { indice: "Multiplie le haut et le bas par le même nombre. Exemple : 3/4 = 6/8 (× 2)." });
  },
  () => { // priorité
    const a = ent(2, 15), b = ent(2, 9), c = ent(2, 9), r = a + b * c;
    return q("numerique", `Calcule : ${a} + ${b} × ${c}`, r, `La multiplication d'abord : ${b} × ${c} = ${b * c}, puis ${a} + ${b * c} = ${r}.`, "Priorité des opérations", "facile",
      { demarche: `1. Multiplication : ${b} × ${c} = ${b * c}\n2. Addition : ${a} + ${b * c} = ${r}`, indice: "Les × et ÷ passent avant les + et −. Exemple : 5 + 2 × 3 = 5 + 6 = 11." });
  },
  () => { // priorité avec parenthèses
    const a = ent(2, 9), b = ent(2, 9), c = ent(2, 6), r = (a + b) * c;
    return q("numerique", `Calcule : (${a} + ${b}) × ${c}`, r, `Les parenthèses d'abord : ${a} + ${b} = ${a + b}, puis ${a + b} × ${c} = ${r}.`, "Priorité des opérations", "facile",
      { demarche: `1. Parenthèses : ${a} + ${b} = ${a + b}\n2. Multiplication : ${a + b} × ${c} = ${r}`, indice: "Commence toujours par les parenthèses. Exemple : (2 + 3) × 4 = 5 × 4 = 20." });
  },
  () => { // pourcentage
    const p = [10, 20, 25, 50, 75, 5, 30][ent(0, 6)], base = ent(2, 16) * 20, r = (p * base) / 100;
    return q("numerique", `Combien font ${p} % de ${base} ?`, r, `${p} % de ${base} = ${base} × ${p} ÷ 100 = ${r}.`, "Pourcentage", "moyen",
      { demarche: `1. ${p} % = ${p}/100 = ${String(p / 100).replace(".", ",")}\n2. ${base} × ${String(p / 100).replace(".", ",")} = ${String(r).replace(".", ",")}`, indice: "x % d'un nombre = nombre × x ÷ 100. Exemple : 10 % de 70 = 7." });
  },
];

// n questions générées. Algèbre : surtout du niveau visé (≈ 70 %), le reste en rappel des niveaux précédents.
export function questionsGenerees(quelle, n = 8, { niveau = 2 } = {}) {
  if (quelle !== "algebre") return Array.from({ length: n }, (_, i) => GEN_FRACTIONS[(i + ent(0, GEN_FRACTIONS.length - 1)) % GEN_FRACTIONS.length]());
  const duNiveau = GEN_ALGEBRE.filter(([nv]) => nv === niveau), avant = GEN_ALGEBRE.filter(([nv]) => nv < niveau);
  return Array.from({ length: n }, (_, i) => {
    const pool = !avant.length || i % 10 < 7 ? duNiveau : avant;
    const [nv, gen] = pool[(i + ent(0, pool.length - 1)) % pool.length];
    return { ...gen(), difficulte: DIFF[nv] };
  });
}
