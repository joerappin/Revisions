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

// ---------- Algèbre ----------
const GEN_ALGEBRE = [
  () => { // valeur d'une expression
    const a = ent(2, 9), b = nonNul(-9, 9), x = ent(-5, 6), r = a * x + b;
    return q("numerique", `Calcule la valeur de ${a}x ${signe(b)} si x = ${nb(x)}.`, r, `On remplace x par ${nb(x)} : ${a} × ${par(x)} ${signe(b)} = ${nb(a * x)} ${signe(b)} = ${nb(r)}.`, "Expression algébrique", "facile",
      { demarche: `1. Remplacer x par ${x} : ${a} × ${par(x)} ${signe(b)}\n2. Multiplier d'abord : ${a * x} ${signe(b)}\n3. Additionner : ${r}`, indice: "Remplace x par sa valeur, puis fais la multiplication avant l'addition. Exemple : si x = 2, 4x − 1 = 4 × 2 − 1 = 7." });
  },
  () => { // équation x + b = c
    const x = ent(-8, 15), b = nonNul(-12, 12), c = x + b;
    return q("numerique", `Résous : x ${signe(b)} = ${c}. Quelle est la valeur de x ?`, x, `On ${b > 0 ? `enlève ${b}` : `ajoute ${-b}`} des deux côtés : x = ${c} ${signe(-b)} = ${x}. Vérif : ${par(x)} ${signe(b)} = ${c} ✔`, "Résoudre une équation du 1er degré", "facile",
      { demarche: `1. Isoler x : ${b > 0 ? `−${b}` : `+${-b}`} des deux côtés\n2. x = ${c} ${signe(-b)}\n3. x = ${x}\n4. Vérification : ${par(x)} ${signe(b)} = ${c} ✔`, indice: "Fais l'opération inverse des deux côtés. Exemple : x − 3 = 10 → x = 10 + 3 = 13." });
  },
  () => { // équation ax + b = c
    const a = ent(2, 9), x = ent(-6, 12), b = nonNul(-15, 15), c = a * x + b;
    return q("numerique", `Résous : ${a}x ${signe(b)} = ${c}`, x, `${b > 0 ? `−${b}` : `+${-b}`} des deux côtés : ${a}x = ${c - b}. ÷${a} des deux côtés : x = ${x}. Vérif : ${a}(${x}) ${signe(b)} = ${c} ✔`, "Résoudre une équation du 1er degré", "moyen",
      { demarche: `1. ${b > 0 ? `Enlever ${b}` : `Ajouter ${-b}`} des deux côtés : ${a}x = ${c - b}\n2. Diviser par ${a} : x = ${c - b} ÷ ${a}\n3. x = ${x}\n4. Vérification : ${a} × ${par(x)} ${signe(b)} = ${c} ✔`, indice: "Défais d'abord le + ou le −, puis la multiplication. Exemple : 2x + 5 = 17 → 2x = 12 → x = 6." });
  },
  () => { // réduire
    const a = ent(2, 9), c = ent(1, 9), d = nonNul(-9, 9); let b = nonNul(-6, 8); if (a + b === 0) b += 1; const x = a + b, k = c + d;
    const rep = `${x ? coef(x) + "x" : ""}${x && k ? ` ${signe(k)}` : !x ? nb(k) : ""}`;
    const faux = [`${nb(a + b + c + d)}x`, `${coef(x)}x ${signe(c - d)}`, `${coef(x + c)}x ${signe(d)}`];
    return qcm(`Réduis : ${a}x + ${c} ${signe(b).replace(/(\d+)$/, "$1x")} ${signe(d)}`, rep, faux, `On regroupe les x : ${a}x ${signe(b)}x = ${x}x. Puis les nombres : ${c} ${signe(d)} = ${k}. Réponse : ${rep}.`, "Réduire une expression", "moyen",
      { indice: "Regroupe d'un côté les termes en x, de l'autre les nombres seuls. Exemple : 3x + 4 + 2x − 1 = 5x + 3." });
  },
  () => { // distributivité
    const a = nonNul(-6, 7), b = nonNul(-9, 9), ab = a * b, rep = `${coef(a)}x ${signe(ab)}`;
    return qcm(`Développe : ${nb(a)}(x ${signe(b)})`, rep, [`${coef(a)}x ${signe(b)}`, `x ${signe(ab)}`, `${coef(a)}x ${signe(-ab)}`], `On multiplie ${nb(a)} par chaque terme : ${nb(a)} × x = ${coef(a)}x et ${nb(a)} × ${par(b)} = ${nb(ab)}. Réponse : ${rep}.`, "La distributivité", "moyen",
      { indice: "Multiplie le nombre devant la parenthèse par CHAQUE terme. Exemple : 5(x − 2) = 5x − 10." });
  },
  () => { // problème
    const k = ent(2, 4), b = ent(3, 20), x = ent(3, 25), c = k * x + b, mot = ["", "", "Le double", "Le triple", "Le quadruple"][k];
    return q("numerique", `« ${mot} d'un nombre, augmenté de ${b}, vaut ${c}. » Quel est ce nombre ?`, x, `On traduit : ${k}x + ${b} = ${c}. Donc ${k}x = ${c - b} et x = ${x}. Vérif : ${k} × ${x} + ${b} = ${c} ✔`, "Traduire un problème en équation", "difficile",
      { demarche: `1. Inconnue : x = le nombre\n2. Équation : ${k}x + ${b} = ${c}\n3. ${k}x = ${c - b}\n4. x = ${x}\n5. Réponse : le nombre est ${x}.`, indice: "Choisis x pour le nombre et traduis chaque mot. Exemple : « le double d'un nombre diminué de 3 vaut 11 » → 2x − 3 = 11." });
  },
];

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

// n questions générées (types variés), pour la banque donnée : "algebre" ou "fractions".
export function questionsGenerees(quelle, n = 8) {
  const gens = quelle === "algebre" ? GEN_ALGEBRE : GEN_FRACTIONS;
  return Array.from({ length: n }, (_, i) => gens[(i + ent(0, gens.length - 1)) % gens.length]());
}
