// Costumes d'époque et costumes traditionnels du monde, dessinés en SVG (style manga).
// Chaque personnage tient dans une boîte de 120 × 260 (y de -20 à 240) : tête vers y = 22-63, pieds vers y = 228.
// Utilisés par les leçons intégrées (histoire, géographie) et servis en image : /costumes/<cle>.svg

const L = 'stroke="#1b1b1b" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
const F = (d, fill, extra = "") => `<path d="${d}" fill="${fill}" ${L} ${extra}/>`;
const T = (d, c = "#1b1b1b", w = 1.5, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rond = (cx, cy, r, fill, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${L} ${extra}/>`;
const PEAU = { claire: "#ffe1c6", rosee: "#f6cfb0", moyenne: "#e5b086", mate: "#c98e62", foncee: "#9a6440", ebene: "#6e4429" };

// Membre avec contour : un trait épais foncé, puis le même trait plus fin en couleur.
const membre = (d, c, w = 9) => `<path d="${d}" fill="none" stroke="#1b1b1b" stroke-width="${w + 4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
const BRAS_G = "M45 74 Q37 99 33 125", BRAS_D = "M75 74 Q83 99 87 125";
function bras(manche, peau, type = "longue") {
  const mains = rond(32.5, 129, 4.6, peau) + rond(87.5, 129, 4.6, peau);
  if (type === "aucune") return membre(BRAS_G, peau) + membre(BRAS_D, peau) + mains;
  if (type === "courte") return membre(BRAS_G, peau) + membre(BRAS_D, peau) + membre("M45 74 Q41 86 40 92", manche, 11) + membre("M75 74 Q79 86 80 92", manche, 11) + mains;
  if (type === "ample") return membre(BRAS_G, manche, 11) + membre(BRAS_D, manche, 11) + mains
    + F("M43 74 L30 84 L22 140 Q32 146 40 138 L42 104 Z", manche) + F("M77 74 L90 84 L98 140 Q88 146 80 138 L78 104 Z", manche);
  return membre(BRAS_G, manche, 10) + membre(BRAS_D, manche, 10) + mains;
}
const jambes = (c, chaussure = "#3a2a1e", { haut = 124, bas = 222 } = {}) =>
  membre(`M54 ${haut} L53.5 ${bas}`, c, 8) + membre(`M66 ${haut} L66.5 ${bas}`, c, 8)
  + `<ellipse cx="52" cy="${bas + 3}" rx="7.5" ry="4.2" fill="${chaussure}" ${L}/><ellipse cx="68" cy="${bas + 3}" rx="7.5" ry="4.2" fill="${chaussure}" ${L}/>`;
const torse = (c, bas = 122) => F(`M44 70 Q60 65 76 70 L77 ${bas} L43 ${bas} Z`, c);
// Jupe ou robe : de la taille (haut) à l'ourlet (bas), demi = demi-largeur de l'ourlet.
const jupe = (c, { haut = 116, bas = 222, demi = 34, taille = 15, plis = true } = {}) =>
  F(`M${60 - taille} ${haut} L${60 + taille} ${haut} Q${60 + demi * 0.85} ${(haut + bas) / 2} ${60 + demi} ${bas} Q60 ${bas + 6} ${60 - demi} ${bas} Q${60 - demi * 0.85} ${(haut + bas) / 2} ${60 - taille} ${haut} Z`, c)
  + (plis ? T(`M54 ${haut + 8} L${60 - demi * 0.45} ${bas - 2} M66 ${haut + 8} L${60 + demi * 0.45} ${bas - 2} M60 ${haut + 12} L60 ${bas}`, "#1b1b1b", 1, 'opacity=".35"') : "");
const pantalon = (c, { bas = 222, large = false } = {}) =>
  F(`M44 118 L76 118 L${large ? 79 : 74} ${bas} L${large ? 61 : 61} ${bas} L60 140 L${large ? 59 : 59} ${bas} L${large ? 41 : 46} ${bas} Z`, c);

// ---------- Tête (visage manga) ----------
function tete(peau, { fille = false, oreilles = true, barbe = "", moustache = "", yeux = "#3b2a1a", sourire = true } = {}) {
  const oeil = (x) => `<ellipse cx="${x}" cy="45" rx="3.8" ry="4.8" fill="#fff" stroke="#1b1b1b" stroke-width="1.4"/><ellipse cx="${x + 0.4}" cy="45.8" rx="2.7" ry="3.6" fill="${yeux}"/><circle cx="${x + 1.3}" cy="44.2" r="1.1" fill="#fff"/>`;
  return `<rect x="54.5" y="54" width="11" height="15" fill="${peau}" ${L}/>
    ${oreilles ? `<ellipse cx="44.5" cy="46" rx="3.4" ry="5" fill="${peau}" ${L}/><ellipse cx="75.5" cy="46" rx="3.4" ry="5" fill="${peau}" ${L}/>` : ""}
    ${F("M45 40 Q45 22 60 22 Q75 22 75 40 L75 46 Q74 59 60 63 Q46 59 45 46 Z", peau)}
    ${oeil(53)}${oeil(67)}
    ${fille ? T("M49 41.5 Q53 39 57 41 M48.5 42 L47 40.5 M63 41 Q67 39 71 41.5 M71.5 42 L73 40.5", "#1b1b1b", 1.6) : T("M49 38.6 Q53 36.8 57 38.4 M63 38.4 Q67 36.8 71 38.6", "#1b1b1b", 1.7)}
    ${T("M60 48.5 L59.2 51.5 L61 51.6", "#1b1b1b", 1.1)}
    ${sourire ? T("M56.5 55 Q60 58.2 63.5 55", "#1b1b1b", 1.5) : T("M57 56 L63 56", "#1b1b1b", 1.5)}
    <ellipse cx="49.5" cy="51.5" rx="3" ry="1.6" fill="#ff8fa3" opacity=".45"/><ellipse cx="70.5" cy="51.5" rx="3" ry="1.6" fill="#ff8fa3" opacity=".45"/>
    ${moustache ? F("M53.5 53.6 Q57 51 60 53 Q63 51 66.5 53.6 Q63 55.4 60 54.4 Q57 55.4 53.5 53.6 Z", moustache) : ""}
    ${barbe ? F("M46 48 Q47 60 60 66 Q73 60 74 48 Q72 56 66 58 Q60 61 54 58 Q48 56 46 48 Z", barbe) : ""}`;
}

// ---------- Coiffures : partie arrière (avant le visage) et avant (après) ----------
const devant = (c) => F("M44.5 41 Q42 18 60 17 Q78 18 75.5 41 Q73 31 65 29 Q60 33 54 30 Q48 32 44.5 41 Z", c);
const COIFFURES = {
  court: (c) => ({ arriere: "", avant: devant(c) }),
  aucune: () => ({ arriere: "", avant: "" }),
  long: (c) => ({ arriere: F("M42 38 Q40 15 60 15 Q80 15 78 38 L82 96 Q60 103 38 96 Z", c), avant: F("M44.5 42 Q43 19 60 18.5 Q77 19 75.5 42 Q74 31 68 27 Q62 34 52 31 Q47 33 44.5 42 Z", c) }),
  chignon: (c) => ({ arriere: rond(60, 15, 9.5, c), avant: F("M44.5 41 Q44 19.5 60 19.5 Q76 19.5 75.5 41 Q71 27 60 27 Q49 27 44.5 41 Z", c) }),
  chignonBas: (c) => ({ arriere: `<ellipse cx="60" cy="62" rx="12" ry="8" fill="${c}" ${L}/>` + F("M42 40 Q41 18 60 18 Q79 18 78 40 L76 60 L44 60 Z", c), avant: F("M44.5 41 Q44 19.5 60 19.5 Q76 19.5 75.5 41 Q71 26 60 26.5 Q49 26 44.5 41 Z", c) }),
  tresses: (c) => ({ arriere: "", avant: F("M44.5 41 Q44 19.5 60 19.5 Q76 19.5 75.5 41 Q71 27 60 27 Q49 27 44.5 41 Z", c)
    + [0, 1, 2, 3].map((i) => `<ellipse cx="${43 - i * 0.8}" cy="${56 + i * 11}" rx="4.6" ry="6.4" fill="${c}" ${L}/><ellipse cx="${77 + i * 0.8}" cy="${56 + i * 11}" rx="4.6" ry="6.4" fill="${c}" ${L}/>`).join("") }),
  natte: (c) => ({ arriere: F("M42 38 Q40 16 60 16 Q80 16 78 38 L76 56 L44 56 Z", c) + [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${74 + i}" cy="${64 + i * 10}" rx="5" ry="6.5" fill="${c}" ${L}/>`).join(""), avant: F("M44.5 41 Q44 19.5 60 19.5 Q76 19.5 75.5 41 Q70 27 60 27.5 Q50 27 44.5 41 Z", c) }),
  carre: (c) => ({ arriere: F("M41 40 Q40 15 60 15 Q80 15 79 40 L80 62 Q72 66 68 60 L52 60 Q48 66 40 62 Z", c), avant: F("M44.5 38 Q44 18 60 18 Q76 18 75.5 38 L75 34 Q60 30 45 34 Z", c) }),
  egyptienne: (c) => ({ arriere: F("M40 34 Q40 13 60 13 Q80 13 80 34 L81 72 L39 72 Z", c), avant: F("M44 37 Q44 16 60 16 Q76 16 76 37 L76 35 L44 35 Z", c) + T("M42 30 Q60 24 78 30", "#e9b824", 3) }),
  boucles: (c) => ({ arriere: "", avant: [[46, 33], [50, 26], [57, 22], [64, 22], [71, 26], [74, 33]].map(([x, y]) => rond(x, y, 6.2, c)).join("") }),
  herisse: (c) => ({ arriere: F("M40 46 L36 30 L44 30 L42 16 L52 22 L56 10 L62 20 L70 10 L72 22 L82 18 L78 30 L86 32 L80 46 L84 62 L74 56 L46 56 L36 62 Z", c), avant: F("M44.5 40 L46 28 L52 32 L56 24 L61 31 L67 24 L70 32 L75 28 L75.5 40 Q70 32 60 33 Q50 32 44.5 40 Z", c) }),
  perruque: (c) => ({ arriere: [[42, 30], [78, 30], [38, 46], [82, 46], [37, 62], [83, 62], [38, 78], [82, 78], [40, 92], [80, 92]].map(([x, y]) => rond(x, y, 9, c)).join(""), avant: [[47, 28], [54, 21], [62, 20], [70, 23], [75, 30]].map(([x, y]) => rond(x, y, 7.5, c)).join("") }),
  poudree: (c) => ({ arriere: `<ellipse cx="60" cy="4" rx="19" ry="27" fill="${c}" ${L}/>` + [[42, 40], [78, 40], [41, 54], [79, 54]].map(([x, y]) => rond(x, y, 6.5, c)).join(""), avant: F("M44.5 40 Q44 19 60 19 Q76 19 75.5 40 Q70 27 60 27 Q50 27 44.5 40 Z", c) + T("M50 0 Q60 -6 70 0 M48 10 Q60 4 72 10", "#1b1b1b", 1, 'opacity=".35"') }),
};

// ---------- Assemblage d'un personnage ----------
// Ordre des couches : arriere → cheveux (arrière) → jambes → dessous → bras → torse → bas → devant → tête → cheveux (avant) → coiffe → accessoire
function perso(o) {
  const peau = o.peau || PEAU.claire;
  const h = (COIFFURES[o.coiffure || "court"])(o.cheveux || "#3b2414");
  const lesBras = o.bras === false ? "" : bras(o.manches || o.haut || "#ccc", peau, o.manche || "longue");
  return [
    o.arriere || "", h.arriere,
    o.jambes === false ? "" : jambes(o.jambes || peau, o.chaussures || "#3a2a1e"),
    o.dessous || "",
    o.brasDevant ? "" : lesBras,
    o.torse === false ? "" : torse(o.haut || "#ccc", o.basTorse),
    o.bas || "", o.devant || "",
    o.brasDevant ? lesBras : "",
    tete(peau, o.visage), h.avant, o.coiffe || "", o.accessoire || "",
  ].join("");
}

// ---------- Les costumes ----------
const OR = "#e9b824", ARGENT = "#c9d1d9";
export const COSTUMES = {
  // ===== À travers l'histoire =====
  prehistoire: { cat: "histoire", nom: "Préhistoire", periode: "il y a plus de 10 000 ans", annee: -12000,
    elements: "vêtement en peau de bête, cheveux longs, sagaie (lance) à pointe de pierre", fond: "#f4e3c3",
    dessin: () => perso({ peau: PEAU.moyenne, coiffure: "herisse", cheveux: "#4a2e1a", manche: "aucune", torse: false, chaussures: "#8b5a2b",
      bas: F("M46 70 L70 66 L79 74 L81 152 Q72 160 62 152 Q52 162 41 152 L43 96 Z", "#b07a45") + [[52, 90], [68, 102], [56, 124], [72, 134], [48, 142]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="#6b4423"/>`).join("") + T("M41 152 L44 158 M50 154 L52 160 M62 152 L62 159 M72 156 L74 162", "#6b4423", 2),
      accessoire: T("M92 20 L90 232", "#7a4a26", 4) + F("M86 24 L91 4 L96 24 Z", "#8d99a6") + T("M88 26 L95 28", "#5b3a1f", 2.5),
      visage: { barbe: "#4a2e1a" } }) },
  egypte: { cat: "histoire", nom: "Égypte antique", periode: "vers 1500 av. J.-C.", annee: -1500,
    elements: "robe de lin blanc, large collier (ousekh), perruque noire, sandales", fond: "#f9e7b0",
    dessin: () => perso({ peau: PEAU.mate, coiffure: "egyptienne", cheveux: "#121212", manche: "aucune", torse: false, chaussures: "#c9a227",
      bas: F("M45 70 Q60 65 75 70 L79 222 L41 222 Z", "#fbf8ee") + T("M52 96 L48 220 M60 98 L60 220 M68 96 L72 220", "#c9c1a8", 1.2) + F("M57 118 L63 118 L66 176 L54 176 Z", "#c0392b"),
      devant: F("M43 70 Q60 96 77 70 Q60 82 43 70 Z", "#1f6fd1") + T("M45 73 Q60 91 75 73", OR, 3) + T("M47 77 Q60 89 73 77", "#c0392b", 2.2) + T("M44 118 L76 118", OR, 4),
      visage: { fille: true } }) },
  grece: { cat: "histoire", nom: "Grèce antique", periode: "vers 450 av. J.-C.", annee: -450,
    elements: "tunique drapée (chiton), manteau (himation), couronne de laurier, sandales lacées", fond: "#d9ecff",
    dessin: () => perso({ peau: PEAU.rosee, coiffure: "boucles", cheveux: "#5a3a22", manche: "aucune", torse: false, chaussures: "#9c6b3c",
      dessous: T("M50 190 L57 202 L50 212 M70 190 L63 202 L70 212", "#9c6b3c", 1.6),
      bas: F("M44 70 Q60 64 76 70 L80 188 Q60 194 40 188 Z", "#fbfbf7") + T("M41 182 L45 182 L45 178 L49 178 L49 182 L53 182 L53 178 L57 178 L57 182 L61 182 L61 178 L65 178 L65 182 L69 182 L69 178 L73 178 L73 182 L79 182", "#1f6fd1", 1.8),
      devant: F("M46 68 L58 68 L80 146 L71 156 L42 94 Z", "#e2eaf6") + T("M50 80 L72 140 M47 90 L68 150", "#9fb3cc", 1.2),
      coiffe: [[44, 34], [47, 27], [52, 22], [68, 22], [73, 27], [76, 34]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="2.4" fill="#3c9d4a" transform="rotate(${x < 60 ? -40 : 40} ${x} ${y})" ${L}/>`).join("") }) },
  rome: { cat: "histoire", nom: "Rome antique", periode: "vers 50 av. J.-C.", annee: -50,
    elements: "toge blanche à bande pourpre, tunique, sandales", fond: "#f6dfe2",
    dessin: () => perso({ peau: PEAU.moyenne, coiffure: "court", cheveux: "#2e1d12", manche: "courte", manches: "#f6f3ea", torse: false, chaussures: "#8a5a2e",
      bas: F("M44 70 Q60 65 76 70 L79 200 L41 200 Z", "#f6f3ea"),
      devant: F("M42 70 Q52 66 60 70 L83 176 L71 184 L40 112 Z", "#efe7d4") + T("M42 72 L39 112 M60 71 L83 176", "#6d2d8f", 4) + T("M50 90 L74 168 M45 100 L66 176", "#c9bfa8", 1.2) }) },
  dame_moyenage: { cat: "histoire", nom: "Moyen Âge (dame)", periode: "vers 1450", annee: 1450,
    elements: "hennin (chapeau pointu avec voile), longue robe à ceinture haute, manches larges", fond: "#e7defa",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "aucune", haut: "#2b59c3", manche: "ample", torse: false, jambes: false,
      arriere: T("M84 -16 Q104 30 96 96", "#ffffff", 7, 'opacity=".9"') + T("M84 -16 Q104 30 96 96", "#9aa8bb", 1.2),
      bas: F("M44 70 Q60 64 76 70 L80 100 Q94 170 100 226 Q60 234 20 226 Q26 170 40 100 Z", "#2b59c3") + F("M22 216 Q60 226 98 216 L100 226 Q60 234 20 226 Z", "#f2f2f2") + T("M50 106 L36 222 M70 106 L84 222", "#1b1b1b", 1, 'opacity=".3"'),
      devant: F("M51 70 L60 86 L69 70 Z", "#ffe1c6") + `<rect x="43" y="96" width="34" height="7" fill="${OR}" ${L}/>`,
      coiffe: F("M46 32 L74 28 L86 -16 Z", "#c0392b") + T("M48 32 L74 28", OR, 3), visage: { fille: true } }) },
  chevalier: { cat: "histoire", nom: "Moyen Âge (chevalier)", periode: "vers 1200", annee: 1200,
    elements: "cotte de mailles, surcot (tunique) à croix, épée, capuchon de mailles", fond: "#e3e8ee",
    defs: `<pattern id="maille" width="5" height="4" patternUnits="userSpaceOnUse"><rect width="5" height="4" fill="#aeb7c2"/><path d="M0 4 Q2.5 0 5 4" fill="none" stroke="#6b7682" stroke-width=".8"/></pattern>`,
    dessin: () => perso({ peau: PEAU.rosee, coiffure: "aucune", haut: "url(#maille)", manches: "url(#maille)", jambes: "#8c96a3", chaussures: "#4a3b2c", visage: { oreilles: false },
      arriere: F("M41 44 Q41 14 60 14 Q79 14 79 44 L82 74 L38 74 Z", "url(#maille)"),
      bas: F("M45 72 L75 72 L78 170 L42 170 Z", "#fafafa") + `<rect x="56" y="82" width="8" height="70" fill="#c0392b"/><rect x="47" y="104" width="26" height="8" fill="#c0392b"/>` + T("M43 124 L77 124", "#6b4423", 4),
      accessoire: T("M40 124 L28 196", ARGENT, 4) + T("M34 132 L46 136", "#6b4423", 4) }) },
  iroquoien: { cat: "histoire", nom: "Iroquoiens vers 1500", periode: "vers 1500 (Premiers peuples)", annee: 1500,
    elements: "tunique et jambières en peau de cerf à franges, mocassins, coiffe à plumes (gustoweh)", fond: "#e5f0d8",
    dessin: () => perso({ peau: PEAU.mate, coiffure: "long", cheveux: "#151515", haut: "#c49a6c", manches: "#c49a6c", jambes: "#b2885c", chaussures: "#8a5a2e",
      bas: F("M43 112 L77 112 L80 156 L40 156 Z", "#c49a6c") + T("M42 156 L41 164 M47 156 L46 164 M52 156 L52 164 M57 156 L57 164 M62 156 L62 164 M67 156 L68 164 M72 156 L73 164 M78 156 L79 164", "#8a6239", 1.6)
        + T("M30 104 L27 110 M32 112 L29 118 M88 104 L91 110 M86 112 L89 118", "#8a6239", 1.6),
      devant: T("M50 74 L50 104 M70 74 L70 104", "#8a6239", 1.2) + [52, 56, 60, 64, 68].map((x) => `<circle cx="${x}" cy="78" r="1.6" fill="${x % 8 ? "#5b2c83" : "#fff"}"/>`).join(""),
      coiffe: F("M45 31 Q60 24 75 31 L75 26 Q60 19 45 26 Z", "#8a6239") + F("M58 20 L56 -10 L62 -10 Z", "#fafafa") + T("M59 -8 L59 18", "#1b1b1b", 1) + F("M58 -10 L56 -12 L62 -12 L62 -10 Z", "#1b1b1b") + F("M66 24 L74 6 L77 9 Z", "#8a6239"),
      visage: { sourire: true } }) },
  renaissance: { cat: "histoire", nom: "Renaissance", periode: "XVIe siècle", annee: 1550,
    elements: "fraise (collerette plissée), pourpoint, chausses bouffantes, béret à plume", fond: "#fff1c9",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "court", cheveux: "#5a3a22", haut: "#c0392b", jambes: "#fafafa", chaussures: "#1b1b1b", basTorse: 118, visage: { barbe: "#5a3a22" },
      dessous: F("M43 116 Q32 132 43 150 L58 150 L60 138 L62 150 L77 150 Q88 132 77 116 Z", "#f2c14e") + T("M47 120 L46 148 M53 120 L53 148 M67 120 L67 148 M73 120 L74 148", "#c0392b", 2.5),
      devant: [84, 94, 104, 112].map((y) => `<circle cx="60" cy="${y}" r="2" fill="${OR}" stroke="#1b1b1b" stroke-width="1"/>`).join("") + `<ellipse cx="42" cy="78" rx="8" ry="7" fill="#c0392b" ${L}/><ellipse cx="78" cy="78" rx="8" ry="7" fill="#c0392b" ${L}/>` + T("M40 74 L44 82 M76 74 L80 82", OR, 2),
      accessoire: `<ellipse cx="60" cy="67" rx="19" ry="6.5" fill="#fff" ${L}/>` + T("M45 65 L47 70 M50 62 L51 72 M55 61 L55 73 M60 61 L60 73 M65 61 L65 73 M70 62 L69 72 M75 65 L73 70", "#9aa8bb", 1),
      coiffe: `<ellipse cx="58" cy="22" rx="20" ry="6.5" fill="#1b1b1b" transform="rotate(-10 58 22)"/>` + T("M68 18 Q86 0 94 10", "#2bb673", 4) }) },
  louis14: { cat: "histoire", nom: "Époque de Louis XIV", periode: "XVIIe siècle", annee: 1680,
    elements: "grande perruque bouclée, justaucorps à boutons dorés, jabot de dentelle, talons rouges", fond: "#dde6ff",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "perruque", cheveux: "#7a4a26", haut: "#2b59c3", manches: "#2b59c3", jambes: "#fafafa", chaussures: "#1b1b1b",
      dessous: F("M45 150 L75 150 L74 172 L46 172 Z", "#2b4590"),
      bas: F("M43 70 Q60 64 77 70 L84 168 Q60 174 36 168 Z", "#2b59c3") + T("M60 84 L60 166", "#1b1b1b", 1.2) + [88, 100, 112, 124, 136, 148].map((y) => `<circle cx="64" cy="${y}" r="2.2" fill="${OR}" stroke="#1b1b1b" stroke-width="1"/>`).join("")
        + F("M26 112 L39 110 L37 124 L25 124 Z", "#f2c14e") + F("M94 112 L81 110 L83 124 L95 124 Z", "#f2c14e"),
      devant: F("M54 68 L66 68 L64 90 L60 94 L56 90 Z", "#fff") + T("M56 74 L64 74 M56 80 L64 80 M57 86 L63 86", "#9aa8bb", 1),
      accessoire: `<rect x="49" y="226" width="4" height="4" fill="#c0392b"/><rect x="65" y="226" width="4" height="4" fill="#c0392b"/>` }) },
  nf_femme: { cat: "histoire", nom: "Nouvelle-France (femme)", periode: "vers 1700", annee: 1700,
    elements: "coiffe blanche, fichu (châle) croisé, jupe longue de laine, tablier", fond: "#f3e6d8",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "chignon", cheveux: "#6b4423", haut: "#7a2f2f", manches: "#f4efe4", jambes: false, visage: { fille: true },
      bas: jupe("#8e3b2e", { demi: 30 }) + F("M48 118 L72 118 L76 196 L44 196 Z", "#f4efe4") + T("M48 118 L72 118", "#1b1b1b", 2),
      devant: F("M44 70 Q60 64 76 70 L68 96 L60 88 L52 96 Z", "#ffffff") + T("M52 96 L60 88 L68 96", "#1b1b1b", 1.2),
      coiffe: F("M43 36 Q42 14 60 13 Q78 14 77 36 Q70 26 60 26 Q50 26 43 36 Z", "#ffffff") + T("M43 36 Q60 31 77 36", "#9aa8bb", 1.2) }) },
  nf_habitant: { cat: "histoire", nom: "Nouvelle-France (habitant)", periode: "XVIIIe siècle", annee: 1750,
    elements: "tuque rouge, capot (manteau à capuchon), ceinture fléchée, mitasses et bottes sauvages", fond: "#dff0f7",
    dessin: () => perso({ peau: PEAU.rosee, coiffure: "court", cheveux: "#3b2414", haut: "#3d5a80", manches: "#3d5a80", jambes: "#6b4f3a", chaussures: "#8a5a2e",
      bas: F("M43 70 Q60 64 77 70 L82 170 Q60 176 38 170 Z", "#3d5a80") + T("M60 72 L58 170", "#f4efe4", 3) + T("M39 166 Q60 172 81 166", "#f4efe4", 3),
      devant: `<rect x="40" y="116" width="40" height="11" fill="#c0392b" ${L}/>` + T("M42 121 L47 118 L52 124 L57 118 L62 124 L67 118 L72 124 L78 120", "#f2c14e", 1.8) + T("M42 125 L47 121 L52 126 L57 121 L62 126 L67 121 L72 126 L78 123", "#2b59c3", 1.2)
        + F("M70 126 L78 126 L80 160 L68 160 Z", "#c0392b") + T("M70 162 L69 170 M73 162 L73 170 M77 162 L78 170", "#c0392b", 2),
      coiffe: F("M44 34 Q44 14 60 14 Q76 14 76 34 Z", "#c0392b") + F("M60 14 Q82 6 88 30 L80 32 Q78 18 64 18 Z", "#c0392b") + rond(86, 34, 5, "#f4efe4") + `<rect x="43" y="30" width="34" height="6" fill="#a93226" ${L}/>` }) },
  xviii: { cat: "histoire", nom: "XVIIIe siècle", periode: "vers 1780", annee: 1780,
    elements: "robe à paniers très large, perruque poudrée haute, éventail", fond: "#fde2ec",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "poudree", cheveux: "#f1eee8", haut: "#f78fb3", manches: "#f78fb3", jambes: false, brasDevant: true, visage: { fille: true },
      bas: F("M47 112 L73 112 Q112 128 106 224 Q60 232 14 224 Q8 128 47 112 Z", "#f78fb3") + T("M16 190 Q60 204 104 190 M14 214 Q60 228 106 214", "#ffffff", 3) + [[30, 150], [90, 150], [60, 176]].map(([x, y]) => F(`M${x - 6} ${y - 4} L${x} ${y} L${x - 6} ${y + 4} Z M${x + 6} ${y - 4} L${x} ${y} L${x + 6} ${y + 4} Z`, "#c2185b")).join(""),
      devant: F("M47 72 L73 72 L64 118 L56 118 Z", "#fbd0e0") + T("M50 80 L70 80 M52 90 L68 90 M54 100 L66 100", "#c2185b", 1.6) + F("M47 72 Q60 80 73 72", "#fff", ""),
      accessoire: F("M88 128 L104 106 Q110 116 104 128 Z", "#fff6c9") + T("M88 128 L104 110 M88 128 L106 118", "#c99700", 1) + rond(66, -6, 3, "#c2185b") }) },
  xix: { cat: "histoire", nom: "XIXe siècle (homme)", periode: "vers 1850", annee: 1850,
    elements: "haut-de-forme, redingote, gilet et cravate, canne", fond: "#e8e8e8",
    dessin: () => perso({ peau: PEAU.rosee, coiffure: "court", cheveux: "#2e1d12", haut: "#3a3a3a", manches: "#3a3a3a", jambes: "#55504a", chaussures: "#1b1b1b", visage: { moustache: "#2e1d12" },
      bas: F("M43 70 Q60 64 77 70 L80 172 L64 172 L60 120 L56 172 L40 172 Z", "#3a3a3a"),
      devant: F("M53 68 L67 68 L65 116 L55 116 Z", "#8e6c3a") + F("M55 66 L65 66 L60 80 Z", "#fff") + F("M56 72 L64 72 L62 78 L58 78 Z", "#1b1b1b"),
      coiffe: `<rect x="45" y="-6" width="30" height="30" fill="#1b1b1b"/><rect x="38" y="20" width="44" height="6" rx="2" fill="#1b1b1b"/><rect x="45" y="14" width="30" height="4" fill="#7a2f2f"/>`,
      accessoire: T("M88 128 L86 226", "#5b3a1f", 3.5) + rond(88, 126, 3, OR) }) },
  xix_dame: { cat: "histoire", nom: "XIXe siècle (dame)", periode: "vers 1860", annee: 1860,
    elements: "robe à crinoline (en forme de cloche), capote (bonnet à ruban), gants", fond: "#ece2f7",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "chignonBas", cheveux: "#7a4a26", haut: "#7d3c98", manches: "#7d3c98", jambes: false, visage: { fille: true }, brasDevant: true,
      bas: jupe("#7d3c98", { haut: 112, demi: 48, taille: 13 }) + T("M18 182 Q60 194 102 182 M14 206 Q60 220 106 206", "#c39bd3", 4),
      devant: F("M49 70 L71 70 L66 112 L54 112 Z", "#9b59b6") + T("M56 70 L60 78 L64 70", "#fff", 2),
      accessoire: rond(32.5, 129, 4.8, "#fff") + rond(87.5, 129, 4.8, "#fff"),
      coiffe: F("M41 42 Q38 12 60 12 Q82 12 79 42 Q74 22 60 22 Q46 22 41 42 Z", "#f4d03f") + T("M42 42 Q45 60 56 67 M78 42 Q75 60 64 67", "#7d3c98", 3) }) },
  annees20: { cat: "histoire", nom: "Années 1920", periode: "vers 1925", annee: 1925,
    elements: "robe droite à franges (taille basse), chapeau cloche, long collier de perles", fond: "#d8f3e6",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "carre", cheveux: "#1b1b1b", haut: "#1e9e5a", manche: "aucune", jambes: "#f3d7bd", chaussures: "#1b1b1b", basTorse: 166, visage: { fille: true },
      devant: [128, 142, 156].map((y) => T(`M43 ${y} L77 ${y}`, "#0f6b3c", 2) + [46, 51, 56, 61, 66, 71, 75].map((x) => T(`M${x} ${y} L${x} ${y + 8}`, "#0f6b3c", 1.4)).join("")).join("") + T("M43 116 L77 116", "#0f6b3c", 3)
        + [70, 76, 82, 88, 94, 100, 106].map((y, i) => `<circle cx="${60 + Math.sin(i / 2) * 3}" cy="${y}" r="2" fill="#fff" stroke="#1b1b1b" stroke-width=".8"/>`).join(""),
      coiffe: F("M41 40 Q40 12 60 12 Q80 12 79 40 Q60 34 41 40 Z", "#8e44ad") + T("M42 34 Q60 30 78 34", "#f2c14e", 3) }) },

  // ===== Costumes traditionnels du monde =====
  japon: { cat: "monde", nom: "Japon", vetement: "kimono", autres: ["kimono", "yukata"], continent: "Asie",
    elements: "kimono à larges manches, obi (large ceinture nouée dans le dos), chignon orné, sandales zori", fond: "#ffe3e3",
    defs: `<pattern id="sakura" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#d64545"/><circle cx="4" cy="4" r="2.2" fill="#ffd1dc"/><circle cx="12" cy="12" r="2.2" fill="#ffd1dc"/><circle cx="4" cy="4" r=".8" fill="#f2c14e"/><circle cx="12" cy="12" r=".8" fill="#f2c14e"/></pattern>`,
    dessin: () => perso({ peau: PEAU.claire, coiffure: "chignon", cheveux: "#151515", haut: "url(#sakura)", manches: "url(#sakura)", manche: "ample", torse: false, jambes: "#fafafa", chaussures: "#c0392b", visage: { fille: true },
      bas: F("M44 70 Q60 65 76 70 L80 222 L40 222 Z", "url(#sakura)") + T("M54 68 L60 86 L66 68", "#fff", 3) + T("M66 70 L48 110 L46 222", "#1b1b1b", 1.4),
      devant: `<rect x="42" y="98" width="36" height="22" fill="${OR}" ${L}/>` + T("M42 109 L78 109", "#c0392b", 2) + F("M76 100 L90 94 L88 124 L76 118 Z", OR),
      coiffe: T("M68 12 L80 2", "#7a4a26", 2) + rond(81, 1, 3.5, "#ff9fb2") }) },
  inde: { cat: "monde", nom: "Inde", vetement: "sari", autres: ["sari", "saree"], continent: "Asie",
    elements: "sari (long tissu drapé sur l'épaule), choli (blouse courte), bracelets, bindi", fond: "#ffeccc",
    dessin: () => perso({ peau: PEAU.foncee, coiffure: "natte", cheveux: "#151515", haut: "#f39c12", manche: "courte", jambes: false, visage: { fille: true },
      bas: jupe("#c2185b", { haut: 110, demi: 26, taille: 17 }) + T("M36 218 Q60 226 84 218", OR, 4) + T("M52 122 L48 220 M56 122 L54 220 M60 122 L60 222 M64 122 L66 220", "#8e0f42", 1, 'opacity=".5"'),
      devant: F("M70 70 L78 72 L80 130 L62 150 L44 118 L50 106 L66 128 Z", "#c2185b") + T("M70 70 L78 72 L80 130", OR, 3) + T("M44 118 L62 150", OR, 3),
      accessoire: `<circle cx="60" cy="35" r="1.6" fill="#c0392b"/>` + T("M29 121 L36 121 M29 124 L36 124 M84 121 L91 121 M84 124 L91 124", OR, 2) }) },
  ecosse: { cat: "monde", nom: "Écosse", vetement: "kilt", autres: ["kilt"], continent: "Europe",
    elements: "kilt en tartan (tissu à carreaux), sporran (petite bourse), chaussettes hautes, béret", fond: "#dfeedd",
    defs: `<pattern id="tartan" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#1d6b3a"/><rect y="5" width="14" height="4" fill="#1f3f8a" opacity=".85"/><rect x="5" width="4" height="14" fill="#1f3f8a" opacity=".85"/><rect y="6.5" width="14" height="1" fill="#c0392b"/><rect x="6.5" width="1" height="14" fill="#c0392b"/></pattern>`,
    dessin: () => perso({ peau: PEAU.rosee, coiffure: "court", cheveux: "#b5501d", haut: "#2f3e46", manches: "#2f3e46", jambes: "#fafafa", chaussures: "#1b1b1b", basTorse: 118, visage: { barbe: "" },
      dessous: membre("M54 170 L53.5 184", PEAU.rosee, 8) + membre("M66 170 L66.5 184", PEAU.rosee, 8),
      bas: F("M42 114 L78 114 L82 172 L38 172 Z", "url(#tartan)") + T("M48 118 L46 170 M56 118 L55 170 M64 118 L65 170 M72 118 L74 170", "#0b2e18", 1) + T("M48 186 L58 186 M62 186 L72 186", "#c0392b", 3),
      devant: F("M54 68 L66 68 L62 86 L58 86 Z", "#fff") + [80, 92, 104].map((y) => `<circle cx="66" cy="${y}" r="2" fill="${ARGENT}" stroke="#1b1b1b" stroke-width="1"/>`).join("") + F("M44 72 L56 70 L82 120 L74 126 Z", "url(#tartan)")
        + F("M53 124 L67 124 L68 146 Q60 152 52 146 Z", "#f4efe4") + rond(57, 140, 1.8, "#1b1b1b") + rond(63, 140, 1.8, "#1b1b1b"),
      coiffe: `<ellipse cx="60" cy="21" rx="19" ry="7" fill="#1f3f8a" ${L}/><rect x="42" y="22" width="36" height="4" fill="#c0392b"/>` + rond(60, 13, 3.5, "#c0392b") }) },
  inuit: { cat: "monde", nom: "Inuit (Arctique canadien)", vetement: "parka (amauti)", autres: ["amauti", "parka", "atigi"], continent: "Amérique",
    elements: "parka à capuchon bordé de fourrure (amauti), mitaines, kamiks (bottes en peau de phoque)", fond: "#e3f2fd",
    dessin: () => perso({ peau: PEAU.mate, coiffure: "aucune", haut: "#f1e4cf", manches: "#f1e4cf", jambes: "#7a5a3a", chaussures: "#5b4030", visage: { oreilles: false },
      arriere: F("M38 50 Q36 10 60 8 Q84 10 82 50 L84 76 L36 76 Z", "#f1e4cf"),
      bas: F("M42 70 Q60 64 78 70 L84 176 Q60 168 36 176 Z", "#f1e4cf") + T("M38 160 L82 160", "#c0392b", 4) + T("M38 166 L44 160 L50 166 L56 160 L62 166 L68 160 L74 166 L80 160", "#1f3f8a", 2),
      dessous: F("M45 184 L58 184 L58 222 L45 222 Z", "#8d6e53") + F("M62 184 L75 184 L75 222 L62 222 Z", "#8d6e53") + T("M45 196 L58 196 M62 196 L75 196", "#f1e4cf", 2.5),
      accessoire: `<ellipse cx="60" cy="42" rx="21" ry="25" fill="none" stroke="#6b4f3a" stroke-width="9" stroke-dasharray="3 2"/>` + rond(32.5, 129, 6, "#6b4f3a") + rond(87.5, 129, 6, "#6b4f3a") }) },
  ghana: { cat: "monde", nom: "Ghana", vetement: "kente", autres: ["kente", "tissu kente", "pagne kente"], continent: "Afrique",
    elements: "kente (tissu tissé à bandes colorées) drapé sur l'épaule comme une toge, sandales", fond: "#fff3cd",
    defs: `<pattern id="kente" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="#f2c14e"/><rect width="9" height="9" fill="#1e7d3a"/><rect x="9" y="9" width="9" height="9" fill="#c0392b"/><rect y="3.5" width="9" height="2" fill="#151515"/><rect x="9" y="12.5" width="9" height="2" fill="#151515"/><rect x="12.5" width="2" height="9" fill="#1f3f8a"/></pattern>`,
    dessin: () => perso({ peau: PEAU.ebene, coiffure: "court", cheveux: "#121212", manche: "aucune", torse: false, chaussures: "#7a4a26",
      bas: F("M44 74 L72 66 L80 72 L82 214 Q60 220 38 214 L40 96 Z", "url(#kente)") + F("M68 66 L82 72 L84 150 L74 146 Z", "url(#kente)") + T("M44 74 L72 66", "#1b1b1b", 2) }) },
  mexique: { cat: "monde", nom: "Mexique", vetement: "costume de charro (mariachi)", autres: ["charro", "mariachi", "costume de charro", "sombrero"], continent: "Amérique",
    elements: "sombrero à large bord, veste courte à boutons d'argent, nœud papillon, pantalon à boutons", fond: "#ffe0cc",
    dessin: () => perso({ peau: PEAU.mate, coiffure: "court", cheveux: "#121212", haut: "#1b1b1b", manches: "#1b1b1b", jambes: "#1b1b1b", chaussures: "#3a2a1e", visage: { moustache: "#121212" },
      dessous: pantalon("#1b1b1b") + [130, 146, 162, 178, 194, 210].map((y) => `<circle cx="45.5" cy="${y}" r="1.8" fill="${ARGENT}"/><circle cx="74.5" cy="${y}" r="1.8" fill="${ARGENT}"/>`).join(""),
      basTorse: 104, bas: F("M50 104 L70 104 L72 120 L48 120 Z", "#fafafa"),
      devant: F("M53 68 L67 68 L64 104 L56 104 Z", "#fafafa") + F("M53 70 L60 74 L53 78 Z M67 70 L60 74 L67 78 Z", "#c0392b") + T("M44 84 Q48 92 44 100 M76 84 Q72 92 76 100", ARGENT, 2),
      coiffe: `<ellipse cx="60" cy="24" rx="44" ry="9" fill="#d9b26f" ${L}/>` + F("M46 24 Q46 2 60 0 Q74 2 74 24 Z", "#d9b26f") + T("M18 24 Q60 36 102 24", "#8a5a2e", 2) + T("M47 18 Q60 22 73 18", "#c0392b", 3) }) },
  perou: { cat: "monde", nom: "Pérou (Andes)", vetement: "poncho et chullo", autres: ["poncho", "chullo"], continent: "Amérique",
    elements: "poncho de laine coloré, chullo (bonnet à oreillettes et pompons), sandales", fond: "#fde4cf",
    dessin: () => perso({ peau: PEAU.mate, coiffure: "court", cheveux: "#121212", haut: "#c0392b", manches: "#c0392b", jambes: "#2f3e46", chaussures: "#5b4030",
      dessous: pantalon("#2f3e46"),
      bas: F("M42 68 L78 68 L96 140 L60 152 L24 140 Z", "#c0392b") + T("M30 128 L60 138 L90 128", "#f2c14e", 4) + T("M28 134 L36 128 L44 134 L52 128 L60 134 L68 128 L76 134 L84 128 L92 134", "#1f6fd1", 2) + T("M60 72 L60 136", "#f2c14e", 3),
      coiffe: F("M44 36 Q44 12 60 12 Q76 12 76 36 Z", "#1e9e5a") + T("M45 26 L75 26", "#f2c14e", 4) + T("M46 32 L50 28 L54 32 L58 28 L62 32 L66 28 L70 32 L74 28", "#c0392b", 2) + F("M44 34 L48 34 L48 54 L44 54 Z", "#1e9e5a") + F("M72 34 L76 34 L76 54 L72 54 Z", "#1e9e5a") + rond(46, 58, 3, "#c0392b") + rond(74, 58, 3, "#c0392b") + rond(60, 9, 4, "#c0392b") }) },
  baviere: { cat: "monde", nom: "Allemagne (Bavière)", vetement: "dirndl", autres: ["dirndl"], continent: "Europe",
    elements: "dirndl : blouse blanche, corsage lacé, jupe large et tablier", fond: "#e3f0ff",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "tresses", cheveux: "#e1b458", haut: "#1e6b3c", manches: "#fff", manche: "courte", jambes: "#fafafa", chaussures: "#1b1b1b", visage: { fille: true },
      bas: jupe("#c0392b", { bas: 182, demi: 32 }) + F("M50 118 L70 118 L74 176 L46 176 Z", "#9ec5f2") + T("M50 118 L70 118", "#1b1b1b", 2.2),
      devant: F("M47 70 Q60 82 73 70 L72 74 Q60 86 48 74 Z", "#fff") + T("M55 88 L65 92 M65 88 L55 92 M55 96 L65 100 M65 96 L55 100 M55 104 L65 108 M65 104 L55 108", "#fff", 1.4) + T("M72 118 Q74 128 70 134", "#1b1b1b", 1.5) }) },
  maroc: { cat: "monde", nom: "Maroc", vetement: "djellaba", autres: ["djellaba", "jellaba", "djellabah"], continent: "Afrique",
    elements: "djellaba (longue robe à capuchon pointu), babouches (pantoufles pointues), fez", fond: "#fbe9d7",
    dessin: () => perso({ peau: PEAU.moyenne, coiffure: "court", cheveux: "#1b1b1b", haut: "#e8dcc4", manches: "#e8dcc4", torse: false, jambes: false, visage: { barbe: "#1b1b1b" },
      arriere: F("M44 66 L60 96 L76 66 L72 30 Q60 18 48 30 Z", "#d6c7a6"),
      bas: F("M43 70 Q60 64 77 70 L82 222 L38 222 Z", "#e8dcc4") + T("M60 72 L60 150", "#8a5a2e", 2.5) + [80, 92, 104, 116, 128, 140].map((y) => `<circle cx="60" cy="${y}" r="1.6" fill="#8a5a2e"/>`).join(""),
      accessoire: F("M40 224 Q52 216 56 226 Q48 230 36 228 Z", "#f2c14e") + F("M80 224 Q68 216 64 226 Q72 230 84 228 Z", "#f2c14e"),
      coiffe: F("M48 28 L50 12 L70 12 L72 28 Z", "#c0392b") + T("M60 12 Q70 14 72 24", "#1b1b1b", 2) }) },
  chine: { cat: "monde", nom: "Chine", vetement: "qipao", autres: ["qipao", "cheongsam", "chipao"], continent: "Asie",
    elements: "qipao (robe ajustée à col montant), boutons en nœuds (brandebourgs), motifs dorés", fond: "#ffe4e1",
    defs: `<pattern id="nuage" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#c0392b"/><path d="M3 8 Q6 4 9 8 Q12 4 15 8" fill="none" stroke="#f2c14e" stroke-width="1.2"/><path d="M8 17 Q11 13 14 17" fill="none" stroke="#f2c14e" stroke-width="1.2"/></pattern>`,
    dessin: () => perso({ peau: PEAU.claire, coiffure: "chignon", cheveux: "#151515", haut: "url(#nuage)", manches: "url(#nuage)", manche: "courte", torse: false, jambes: PEAU.claire, chaussures: "#1b1b1b", visage: { fille: true },
      bas: F("M45 70 Q60 65 75 70 L76 118 L73 206 L47 206 L44 118 Z", "url(#nuage)") + T("M72 150 L73 206", "#1b1b1b", 1.4),
      devant: `<rect x="53" y="62" width="14" height="8" fill="#c0392b" ${L}/>` + T("M60 72 Q66 76 72 80", OR, 2) + [74, 80, 86].map((y, i) => T(`M${60 + i * 5} ${y} L${66 + i * 5} ${y}`, OR, 2.2)).join(""),
      coiffe: T("M52 10 L70 18", OR, 2) + rond(70, 18, 2.5, "#c0392b") }) },
  coree: { cat: "monde", nom: "Corée", vetement: "hanbok", autres: ["hanbok"], continent: "Asie",
    elements: "hanbok : veste courte (jeogori) à ruban noué (goreum), jupe longue et ample (chima)", fond: "#f0e6ff",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "chignonBas", cheveux: "#151515", haut: "#f7dc6f", manches: "#f7dc6f", jambes: false, visage: { fille: true },
      arriere: "", basTorse: 92,
      bas: F("M42 84 L78 84 Q102 150 98 224 Q60 232 22 224 Q18 150 42 84 Z", "#f1948a") + T("M52 92 L40 222 M60 92 L60 224 M68 92 L80 222", "#c0392b", 1, 'opacity=".4"'),
      devant: T("M53 68 L60 82 L67 68", "#fff", 3) + F("M60 84 L54 120 L58 120 L61 90 Z", "#8e44ad") + F("M61 84 L66 116 L69 114 L62 86 Z", "#8e44ad") + rond(60, 85, 3, "#8e44ad"),
      accessoire: T("M28 112 L38 112 M27 117 L38 117 M82 112 L92 112 M82 117 L93 117", "#1e9e5a", 2) + T("M46 60 L74 64", OR, 2) }) },
  norvege: { cat: "monde", nom: "Norvège", vetement: "bunad", autres: ["bunad"], continent: "Europe",
    elements: "bunad : blouse blanche, gilet brodé de fleurs, jupe sombre, broche d'argent (sølje)", fond: "#e1ecf7",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "long", cheveux: "#edc967", haut: "#1b2a4a", manches: "#fafafa", jambes: false, visage: { fille: true },
      bas: jupe("#1b2a4a", { demi: 30 }) + [[40, 210], [52, 214], [68, 214], [80, 210]].map(([x, y]) => rond(x, y, 3, "#e74c3c") + rond(x, y, 1, OR)).join(""),
      devant: F("M47 70 L73 70 L66 116 L54 116 Z", "#fafafa") + [[50, 90], [70, 90], [50, 104], [70, 104]].map(([x, y]) => rond(x, y, 3, "#e74c3c") + rond(x + 3, y - 4, 2, "#2ecc71")).join("") + rond(60, 72, 5, ARGENT) + T("M57 78 L56 84 M63 78 L64 84", ARGENT, 1.6) }) },
  maasai: { cat: "monde", nom: "Kenya (Maasaï)", vetement: "shuka", autres: ["shuka"], continent: "Afrique",
    elements: "shuka (étoffe rouge à carreaux drapée), grand collier de perles en disque", fond: "#ffe7d6",
    defs: `<pattern id="shuka" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#d62828"/><rect y="5" width="12" height="2" fill="#1f3f8a"/><rect x="5" width="2" height="12" fill="#1f3f8a"/></pattern>`,
    dessin: () => perso({ peau: PEAU.ebene, coiffure: "aucune", manche: "aucune", torse: false, chaussures: "#5b4030",
      bas: F("M46 76 L72 68 L80 74 L80 206 Q60 212 40 206 L42 98 Z", "url(#shuka)") + F("M66 68 L82 74 L84 140 L72 132 Z", "url(#shuka)"),
      accessoire: `<ellipse cx="60" cy="72" rx="20" ry="9" fill="none" stroke="#1b1b1b" stroke-width="11"/><ellipse cx="60" cy="72" rx="20" ry="9" fill="none" stroke="#f2c14e" stroke-width="8"/><ellipse cx="60" cy="72" rx="20" ry="9" fill="none" stroke="#1e7d3a" stroke-width="2.5" stroke-dasharray="3 3"/><ellipse cx="60" cy="72" rx="16" ry="6.5" fill="none" stroke="#c0392b" stroke-width="2"/>`
        + T("M90 30 L88 230", "#5b3a1f", 3.5) }) },
  emirats: { cat: "monde", nom: "Émirats arabes unis", vetement: "kandoura et ghutra", autres: ["kandoura", "kandura", "dishdasha", "ghutra", "keffieh"], continent: "Asie",
    elements: "kandoura (longue robe blanche), ghutra (foulard de tête) tenu par l'agal (cordon noir), sandales", fond: "#fdf6e3",
    dessin: () => perso({ peau: PEAU.mate, coiffure: "aucune", haut: "#fafafa", manches: "#fafafa", torse: false, chaussures: "#8a5a2e", visage: { barbe: "#1b1b1b", oreilles: false },
      arriere: F("M40 34 Q40 12 60 12 Q80 12 80 34 L86 92 L34 92 Z", "#fafafa") + T("M44 50 L40 90 M76 50 L80 90", "#d0d0d0", 1),
      bas: F("M43 70 Q60 64 77 70 L80 222 L40 222 Z", "#fafafa") + T("M60 70 L60 110", "#d0d0d0", 1.5) + T("M58 92 L56 106", "#c9c1a8", 2),
      coiffe: F("M42 36 Q42 14 60 14 Q78 14 78 36 Q70 28 60 28 Q50 28 42 36 Z", "#fafafa") + `<ellipse cx="60" cy="20" rx="17" ry="5" fill="none" stroke="#1b1b1b" stroke-width="3.5"/>` }) },
  paysbas: { cat: "monde", nom: "Pays-Bas", vetement: "costume de Volendam et sabots", autres: ["sabots", "klompen", "costume de volendam"], continent: "Europe",
    elements: "coiffe de dentelle à ailes, robe noire, tablier rayé, collier de corail, sabots de bois", fond: "#e6f4ff",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "aucune", haut: "#1b1b1b", manches: "#1b1b1b", jambes: "#fafafa", chaussures: "#f2c14e", visage: { fille: true },
      bas: jupe("#1b1b1b", { bas: 196, demi: 30 }) + F("M48 118 L72 118 L76 192 L44 192 Z", "#3b82c4") + T("M50 130 L70 130 M49 142 L71 142 M48 154 L72 154 M47 166 L73 166 M46 178 L74 178", "#fafafa", 2.5),
      devant: T("M48 70 Q60 80 72 70", "#c0392b", 3) + T("M50 74 Q60 84 70 74", "#c0392b", 3),
      accessoire: `<ellipse cx="52" cy="225" rx="9" ry="5" fill="#f2c14e" ${L}/><ellipse cx="68" cy="225" rx="9" ry="5" fill="#f2c14e" ${L}/>`,
      coiffe: F("M43 40 Q42 16 60 16 Q78 16 77 40 Q60 34 43 40 Z", "#fafafa") + F("M43 34 L28 22 Q30 40 44 44 Z", "#fafafa") + F("M77 34 L92 22 Q90 40 76 44 Z", "#fafafa") + T("M48 22 Q60 26 72 22", "#9aa8bb", 1) }) },
  vietnam: { cat: "monde", nom: "Viêt Nam", vetement: "áo dài", autres: ["ao dai", "áo dài", "aodai"], continent: "Asie",
    elements: "áo dài (longue tunique fendue sur les côtés, portée sur un pantalon large), nón lá (chapeau conique)", fond: "#e8f8f0",
    dessin: () => perso({ peau: PEAU.claire, coiffure: "long", cheveux: "#151515", haut: "#4fa3e0", manches: "#4fa3e0", jambes: false, chaussures: "#fafafa", visage: { fille: true },
      dessous: pantalon("#fafafa", { large: true }) + `<ellipse cx="52" cy="225" rx="7" ry="3.5" fill="#fafafa" ${L}/><ellipse cx="68" cy="225" rx="7" ry="3.5" fill="#fafafa" ${L}/>`,
      basTorse: 120, bas: F("M47 118 L73 118 L70 206 L50 206 Z", "#4fa3e0") + T("M54 196 Q60 168 66 140 M58 180 L64 176 M61 162 L55 158 M63 150 L68 147", "#fff", 1.6) + [[64, 176], [55, 158], [68, 147]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#f8c8dc" stroke="#fff" stroke-width=".8"/>`).join(""),
      devant: `<rect x="54" y="62" width="12" height="7" fill="#4fa3e0" ${L}/>`,
      coiffe: F("M22 30 L60 -2 L98 30 Q60 38 22 30 Z", "#e9d8a6") + T("M34 26 L60 4 L86 26 M46 28 L60 6 L74 28", "#b89b5e", 1) }) },
};
export const CLES_HISTOIRE = Object.keys(COSTUMES).filter((k) => COSTUMES[k].cat === "histoire").sort((a, b) => COSTUMES[a].annee - COSTUMES[b].annee);
export const CLES_MONDE = Object.keys(COSTUMES).filter((k) => COSTUMES[k].cat === "monde");

// ---------- Images ----------
const tramee = `<pattern id="trame" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#000" opacity=".07"/></pattern>`;
// Un personnage seul, sur fond pastel tramé (style manga). Sans légende : sert aussi d'image de question.
export function svgCostume(cle) {
  const c = COSTUMES[cle];
  if (!c) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 280" width="200" height="280" font-family="Arial">
    <defs>${tramee}${c.defs || ""}</defs>
    <rect x="3" y="3" width="194" height="274" rx="16" fill="${c.fond || "#f4f4f4"}" stroke="#1b1b1b" stroke-width="3"/>
    <rect x="3" y="3" width="194" height="274" rx="16" fill="url(#trame)"/>
    <ellipse cx="100" cy="256" rx="58" ry="9" fill="#000" opacity=".12"/>
    <g transform="translate(40 26)">${c.dessin()}</g>
  </svg>`;
}
// Planche : plusieurs personnages côte à côte, avec légende (et frise si avecDates).
export function plancheCostumes(cles, { titre = "", legende = (c) => c.nom, avecFleche = false } = {}) {
  const w = 120, n = cles.length, W = n * w + 20, H = (titre ? 330 : 310) + (avecFleche ? 14 : 0);
  const defs = [...new Set(cles.map((k) => COSTUMES[k].defs || ""))].join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Arial">
    <defs>${tramee}${defs}</defs>
    <rect width="${W}" height="${H}" fill="#fffdf6"/><rect width="${W}" height="${H}" fill="url(#trame)"/>
    ${titre ? `<text x="${W / 2}" y="24" text-anchor="middle" font-size="18" font-weight="bold">${titre}</text>` : ""}
    ${cles.map((k, i) => {
      const c = COSTUMES[k], x = 10 + i * w, y0 = titre ? 30 : 10;
      return `<rect x="${x + 4}" y="${y0}" width="${w - 8}" height="250" rx="10" fill="${c.fond}" stroke="#1b1b1b" stroke-width="2"/>
        <g transform="translate(${x + 10} ${y0 + 22}) scale(0.84)">${c.dessin()}</g>
        ${String(legende(c)).split(/ (?=\()/).map((l, j) => `<text x="${x + w / 2}" y="${y0 + 268 + j * 14}" text-anchor="middle" font-size="${j ? 10.5 : 12}" font-weight="${j ? "normal" : "bold"}">${l}</text>`).join("")}`;
    }).join("")}
    ${avecFleche ? `<line x1="12" y1="${H - 12}" x2="${W - 16}" y2="${H - 12}" stroke="#1b1b1b" stroke-width="3"/><polygon points="${W - 6},${H - 12} ${W - 18},${H - 18} ${W - 18},${H - 6}" fill="#1b1b1b"/>` : ""}
  </svg>`;
}
export const urlCostume = (cle) => `/costumes/${cle}.svg`;
