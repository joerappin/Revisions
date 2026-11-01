// Science et technologie — 1er cycle du secondaire (fin de la 2e secondaire).
// Leçons intégrées, rédigées pour ReviZ d'après les concepts de la Progression des apprentissages (ministère de l'Éducation).
// Comme en maths, les questions sont générées (nouveaux nombres à chaque fois, tableaux de notions) : aucune IA, aucun manuel recopié.
const q = (type, enonce, choix, reponse, explication, notion, difficulte = "moyen", extra = {}) =>
  ({ type, enonce, choix, indice: "", elements: [], image_svg: "", image_url: "", reponse: String(reponse), reponses_acceptees: [], tolerance: 0, audio: "", explication, demarche: "", explications_choix: [], notion, difficulte, ...extra });
const VF = ["Vrai", "Faux"];
const n = (titre, explication, exemple) => ({ titre, explication, exemple, visuel_svg: "", visuel_url: "", audio: [] });
const ent = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };
const fr = (x) => String(x).replace(".", ",");
const autres = (pool, bon, k = 3) => melange(pool.filter((x) => x !== bon)).slice(0, k);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const qcm = (enonce, bonne, fausses, explication, notion, difficulte, extra) => q("qcm", enonce, melange([bonne, ...fausses]), bonne, explication, notion, difficulte, extra);
const num = (enonce, reponse, explication, notion, difficulte, demarche = "", indice = "") => q("numerique", enonce, [], reponse, explication, notion, difficulte, { demarche, indice });
const serie = (k, fabrique) => Array.from({ length: k }, fabrique);

// Tableau [terme, définition] : définition → terme (QCM), terme → définition (QCM), définition → terme (à écrire).
function definitions(liste, notion, diff = ["facile", "moyen", "difficile"]) {
  const termes = liste.map((l) => l[0]), defs = liste.map((l) => l[1]);
  return liste.flatMap(([t, d]) => [
    qcm(`Quel mot correspond à cette définition : ${d} ?`, t, autres(termes, t), `${cap(t)} : ${d}.`, notion, diff[0]),
    qcm(`Que désigne « ${t} » ?`, cap(d), autres(defs, d).map(cap), `${cap(t)} : ${d}.`, notion, diff[1]),
    q("ouverte", `Écris le mot qui correspond à cette définition : ${d}.`, [], t, `${cap(t)} : ${d}.`, notion, diff[2]),
  ]);
}
// Tableau [élément, catégorie, précision] : à quelle catégorie appartient chaque élément ?
function classer(liste, categories, enonce, notion, diff = "facile") {
  return liste.map(([x, c, note = ""]) => qcm(enonce(x), c, autres(categories, c), `${cap(x)} : ${c}.${note ? " " + note : ""}`, notion, diff));
}

const VOL = "Le volume", MAS = "La masse", TEM = "La température", ETA = "Les changements d'état", ACI = "Acides et bases", PRO = "Les propriétés caractéristiques";
const proprietes = () => [
  ...definitions([
    ["masse", "quantité de matière d'un objet"],
    ["volume", "espace occupé par un objet"],
    ["température", "mesure du degré d'agitation des particules"],
    ["propriété caractéristique", "propriété qui aide à identifier une substance ou un groupe de substances"],
    ["dilatation thermique", "augmentation du volume d'un corps quand il se réchauffe"],
  ], PRO),
  ...[["fusion", "solide", "liquide"], ["solidification", "liquide", "solide"], ["vaporisation", "liquide", "gaz"], ["condensation", "gaz", "liquide"], ["sublimation", "solide", "gaz"], ["condensation solide", "gaz", "solide"]].flatMap(([nom, a, b], _, l) => [
    qcm(`Comment appelle-t-on le passage de l'état ${a === "gaz" ? "gazeux" : a} à l'état ${b === "gaz" ? "gazeux" : b} ?`, nom, autres(l.map((x) => x[0]), nom), `Le passage ${a} → ${b} s'appelle la ${nom}.`, ETA, "facile"),
    q("ouverte", `Quel changement d'état fait passer une substance de ${a} à ${b} ?`, [], nom, `Le passage ${a} → ${b} s'appelle la ${nom}.`, ETA, "moyen", { reponses_acceptees: ["la " + nom] }),
  ]),
  ...classer([["le jus de citron", "acide"], ["le vinaigre", "acide"], ["une boisson gazeuse", "acide"], ["le jus d'orange", "acide"], ["le lait de magnésie", "basique"], ["l'ammoniaque domestique", "basique"], ["l'eau de Javel", "basique"], ["l'eau pure", "neutre"], ["l'eau sucrée", "neutre"]],
    ["acide", "basique", "neutre"], (x) => `Quel est le caractère de ${x} ?`, ACI, "moyen"),
  ...classer([["une casserole en métal", "bonne conductrice de chaleur"], ["un fil électrique en cuivre", "bon conducteur d'électricité"], ["une fenêtre en verre", "transparence"], ["une bouée en liège", "flottaison"], ["un manche de casserole en bois", "mauvais conducteur de chaleur"], ["un imperméable en plastique", "imperméabilité"]],
    ["bonne conductrice de chaleur", "bon conducteur d'électricité", "transparence", "flottaison", "mauvais conducteur de chaleur", "imperméabilité"], (x) => `Quelle propriété explique l'usage du matériau dans ${x} ?`, PRO, "moyen"),
  q("vrai_faux", "Quand on chauffe une substance, ses particules s'agitent davantage.", VF, "Vrai", "Un apport de chaleur augmente le degré d'agitation des particules.", TEM, "facile"),
  q("vrai_faux", "Les acides rougissent le papier tournesol.", VF, "Vrai", "Le tournesol devient rouge avec un acide et bleu avec une base.", ACI, "facile"),
  q("vrai_faux", "Une base rougit le papier tournesol.", VF, "Faux", "Une base bleuit le tournesol; ce sont les acides qui le rougissent.", ACI, "moyen"),
  q("vrai_faux", "Un acide peut réagir avec certains métaux.", VF, "Vrai", "La réactivité avec un métal est une propriété observable des acides.", ACI, "moyen"),
  q("vrai_faux", "Deux substances différentes de même volume ont toujours la même masse.", VF, "Faux", "À volume égal, les masses diffèrent : un cube de fer est plus lourd qu'un cube de bois de même volume.", MAS, "moyen"),
  q("vrai_faux", "Un joint de dilatation sur un pont laisse de la place au métal qui s'allonge à la chaleur.", VF, "Vrai", "Les corps se dilatent en se réchauffant : sans ce joint, le pont se déformerait.", TEM, "difficile"),
  qcm("Pourquoi le liquide monte-t-il dans un thermomètre quand il fait plus chaud ?", "Il se dilate", ["Il perd de la masse", "Il devient un gaz", "Il se solidifie"], "Plus chaud, le liquide se dilate : il occupe plus de volume et monte dans le tube.", TEM, "difficile"),
  qcm("Sur un diagramme de changement d'état d'une substance pure, que montre le plateau horizontal ?", "La température reste constante pendant le changement d'état", ["La substance disparaît", "La masse double", "La substance refroidit très vite"], "Pendant un changement d'état d'une substance pure, la température reste constante : c'est le plateau.", ETA, "difficile"),
  ...serie(6, () => { const v = ent(2, 95) * 10; return num(`Convertis ${v} mL en litres.`, v / 1000, `${v} mL = ${fr(v / 1000)} L, car 1 L = 1000 mL.`, VOL, "facile", `1. 1 L = 1000 mL\n2. ${v} ÷ 1000 = ${fr(v / 1000)} L`, "Divise par 1000 pour passer des mL aux L."); }),
  ...serie(4, () => { const v = ent(11, 99) / 100, r = Math.round(v * 1000); return num(`Convertis ${fr(v)} L en cm³.`, r, `${fr(v)} L = ${r} mL = ${r} cm³, car 1 mL = 1 cm³.`, VOL, "moyen", `1. ${fr(v)} × 1000 = ${r} mL\n2. 1 mL = 1 cm³, donc ${r} cm³`, "1 L = 1000 mL et 1 mL = 1 cm³."); }),
  ...serie(4, () => { const m = ent(120, 4800); return num(`Convertis ${m} g en kilogrammes.`, m / 1000, `${m} g = ${fr(m / 1000)} kg, car 1 kg = 1000 g.`, MAS, "facile", `${m} ÷ 1000 = ${fr(m / 1000)} kg`, "1 kg = 1000 g."); }),
  ...serie(6, () => { const a = ent(2, 12), b = ent(2, 10), c = ent(2, 9), v = a * b * c; return num(`Quel est le volume, en cm³, d'une boîte de ${a} cm × ${b} cm × ${c} cm ?`, v, `Volume = longueur × largeur × hauteur = ${v} cm³.`, VOL, "moyen", `${a} × ${b} × ${c} = ${v} cm³`, "Multiplie les trois dimensions."); }),
  ...serie(6, () => { const d = ent(4, 16) * 5, e = ent(3, 40); return num(`Un cylindre gradué contient ${d} mL d'eau. On y plonge une roche et le niveau monte à ${d + e} mL. Quel est le volume de la roche, en cm³ ?`, e, `Volume de la roche = ${d + e} − ${d} = ${e} mL, soit ${e} cm³.`, VOL, "difficile", `1. ${d + e} − ${d} = ${e} mL\n2. 1 mL = 1 cm³, donc ${e} cm³`, "La roche déplace un volume d'eau égal au sien."); }),
];

const MEL = "Les mélanges", SEP = "La séparation des mélanges", SOL = "Les solutions";
const melanges = () => [
  ...classer([["l'eau potable", "mélange homogène"], ["l'air", "mélange homogène"], ["un alliage comme le bronze", "mélange homogène"], ["l'eau salée", "mélange homogène"], ["le vinaigre", "mélange homogène"], ["le jus de tomates", "mélange hétérogène"], ["le smog", "mélange hétérogène"], ["une roche comme le granite", "mélange hétérogène"], ["une vinaigrette", "mélange hétérogène"], ["de l'eau avec du sable", "mélange hétérogène"], ["une soupe aux légumes", "mélange hétérogène"]],
    ["mélange homogène", "mélange hétérogène"], (x) => `Comment classe-t-on ${x} ?`, MEL, "facile"),
  ...[["l'eau et le sable", "la filtration"], ["le sel dissous dans l'eau (pour récupérer le sel)", "l'évaporation"], ["l'eau pure d'une eau salée (pour la récupérer)", "la distillation"], ["l'huile et l'eau", "la décantation"], ["la limaille de fer et le sable", "l'aimantation"], ["le gravier et le sable", "le tamisage"], ["les composants du sang", "la centrifugation"]].flatMap(([m, t], _, l) => [
    qcm(`Quelle technique permet le mieux de séparer ${m} ?`, t, autres([...new Set(l.map((x) => x[1]))], t), `Pour ${m}, on utilise ${t}.`, SEP, "moyen"),
    q("ouverte", `Nomme une technique pour séparer ${m}.`, [], t, `Pour ${m}, on utilise ${t}.`, SEP, "difficile", { reponses_acceptees: [t.replace(/^(la |le |l')/, "")] }),
  ]),
  q("vrai_faux", "Un mélange homogène ne montre qu'une seule phase visible.", VF, "Vrai", "On n'y distingue pas ses constituants, même s'il en contient plusieurs.", MEL, "facile"),
  q("vrai_faux", "Un mélange contient toujours plusieurs substances.", VF, "Vrai", "Un mélange est composé de plusieurs substances, dans une ou plusieurs phases.", MEL, "facile"),
  q("vrai_faux", "Dans un mélange hétérogène, on peut distinguer au moins deux phases.", VF, "Vrai", "Exemple : le sable et l'eau forment deux phases visibles.", MEL, "facile"),
  q("vrai_faux", "Une solution aqueuse est translucide et ne montre qu'une seule phase.", VF, "Vrai", "Ce sont deux propriétés d'une solution aqueuse.", SOL, "moyen"),
  q("vrai_faux", "L'air est une substance pure.", VF, "Faux", "L'air est un mélange homogène de gaz : azote, oxygène et d'autres.", MEL, "moyen"),
  q("vrai_faux", "Préparer ou séparer un mélange est un changement physique.", VF, "Vrai", "Les substances gardent leurs propriétés.", MEL, "moyen"),
  q("ordre", "Place dans l'ordre les étapes pour séparer de l'eau salée contenant du sable.", [], "Sédimentation → Décantation → Évaporation", "Le sable se dépose (sédimentation), on verse le liquide (décantation), puis on fait évaporer l'eau pour récupérer le sel.", SEP, "difficile", { elements: ["Sédimentation", "Décantation", "Évaporation"] }),
  ...definitions([
    ["mélange homogène", "mélange où on ne voit qu'une seule phase"],
    ["mélange hétérogène", "mélange où on voit au moins deux phases"],
    ["filtration", "technique qui retient un solide non dissous à l'aide d'un filtre"],
    ["évaporation", "technique qui fait passer le liquide à l'état gazeux pour récupérer le solide dissous"],
    ["distillation", "technique qui vaporise puis condense un liquide pour le récupérer"],
    ["décantation", "technique qui verse doucement le liquide du dessus d'un mélange reposé"],
    ["sédimentation", "dépôt au fond d'un liquide des particules solides d'un mélange"],
  ], SEP),
  ...serie(8, () => { const e = ent(10, 50) * 10, s = ent(3, 30); return num(`On dissout ${s} g de sel dans ${e} g d'eau. Quelle est la masse de la solution, en grammes ?`, e + s, `La masse se conserve : ${e} + ${s} = ${e + s} g.`, SOL, "moyen", `${e} + ${s} = ${e + s} g`, "Dissoudre ne fait pas disparaître la matière."); }),
  ...serie(6, () => { const t = ent(15, 60) * 10, s = ent(5, 40); return num(`Après évaporation complète de l'eau de ${t} g d'eau salée, il reste ${s} g de sel. Quelle masse d'eau s'est évaporée, en grammes ?`, t - s, `Masse d'eau = ${t} − ${s} = ${t - s} g.`, SEP, "difficile", `${t} − ${s} = ${t - s} g`, "Masse de la solution = masse d'eau + masse de sel."); }),
];

const PHY = "Physique ou chimique ?", IND = "Les indices d'un changement chimique", CON = "La conservation de la matière", TYP = "Types de changements chimiques";
const changements = () => [
  ...classer([["la glace qui fond", "changement physique"], ["du papier qu'on déchire", "changement physique"], ["du sucre qui se dissout dans le thé", "changement physique"], ["une flaque d'eau qui s'évapore", "changement physique"], ["un verre qui se brise", "changement physique"], ["de l'eau qui bout", "changement physique"], ["une craie qu'on broie", "changement physique"], ["du sable mélangé à de l'eau", "changement physique"],
    ["du bois qui brûle", "changement chimique"], ["un clou qui rouille", "changement chimique"], ["un gâteau qui cuit", "changement chimique"], ["du lait qui surit", "changement chimique"], ["du vinaigre versé sur du bicarbonate de soude", "changement chimique"], ["une pomme coupée qui brunit", "changement chimique"], ["un feu d'artifice qui explose", "changement chimique"], ["une feuille qui fait la photosynthèse", "changement chimique"]],
    ["changement physique", "changement chimique"], (x) => `Quel type de changement est ${x} ?`, PHY, "facile"),
  ...classer([["des bulles apparaissent dans le liquide", "effervescence"], ["un solide se forme dans un liquide clair", "formation d'un précipité"], ["le liquide passe du bleu au vert", "changement de couleur"], ["le mélange devient chaud", "dégagement de chaleur"], ["une flamme apparaît", "émission de lumière"]],
    ["effervescence", "formation d'un précipité", "changement de couleur", "dégagement de chaleur", "émission de lumière"], (x) => `Pendant une réaction, ${x}. Quel indice observe-t-on ?`, IND, "moyen"),
  ...classer([["le fer qui rouille", "oxydation"], ["la combustion du bois", "oxydation"], ["l'eau séparée en hydrogène et en oxygène par l'électricité", "décomposition"], ["une substance qui se sépare en substances plus simples sous la chaleur", "décomposition"]],
    ["oxydation", "décomposition", "fusion", "filtration"], (x) => `Quel type de changement décrit ${x} ?`, TYP, "difficile"),
  q("vrai_faux", "Lors d'un changement physique, la substance conserve ses propriétés.", VF, "Vrai", "Les molécules demeurent intactes : seule la forme ou l'état change.", PHY, "facile"),
  q("vrai_faux", "Lors d'un changement chimique, de nouvelles substances se forment.", VF, "Vrai", "Les propriétés changent parce que les substances ne sont plus les mêmes.", PHY, "facile"),
  q("vrai_faux", "Un changement d'état est un changement chimique.", VF, "Faux", "C'est un changement physique : l'eau reste de l'eau, qu'elle soit glace, liquide ou vapeur.", PHY, "moyen"),
  q("vrai_faux", "Lors d'un changement chimique en contenant fermé, la masse totale reste la même.", VF, "Vrai", "La matière se conserve : rien ne se perd, rien ne se crée.", CON, "moyen"),
  q("vrai_faux", "Quand une bûche brûle, sa matière disparaît complètement.", VF, "Faux", "La matière se conserve : elle devient des gaz et des cendres.", CON, "difficile"),
  qcm("Pourquoi une réaction qui dégage un gaz semble-t-elle perdre de la masse dans un contenant ouvert ?", "Le gaz s'échappe dans l'air", ["La matière est détruite", "La balance se dérègle", "La chaleur n'a pas de masse"], "La matière se conserve, mais le gaz produit quitte le contenant et n'est plus pesé.", CON, "difficile"),
  qcm("Laquelle de ces observations prouve le mieux un changement chimique ?", "Une nouvelle substance aux propriétés différentes se forme", ["La forme de l'objet change", "L'objet est coupé en deux", "Le solide fond"], "Le changement chimique se reconnaît aux modifications des propriétés des substances.", PHY, "difficile"),
  ...serie(12, () => { const a = ent(10, 80), b = ent(10, 80); return num(`En contenant fermé, ${a} g d'une substance réagissent avec ${b} g d'une autre. Quelle est la masse totale des produits, en grammes ?`, a + b, `La masse se conserve : ${a} + ${b} = ${a + b} g.`, CON, "moyen", `Masse des réactifs = masse des produits\n${a} + ${b} = ${a + b} g`, "Masse des réactifs = masse des produits."); }),
  ...serie(12, () => { const t = ent(60, 180), a = ent(15, t - 20); return num(`Une réaction en contenant fermé donne ${t} g de produits. Un des deux réactifs avait une masse de ${a} g. Quelle était la masse de l'autre réactif, en grammes ?`, t - a, `${t} − ${a} = ${t - a} g, car la masse se conserve.`, CON, "difficile", `1. a + b = ${t} g\n2. b = ${t} − ${a} = ${t - a} g`, "Masse des réactifs = masse des produits."); }),
  ...serie(8, () => { const m = ent(20, 90), g = ent(2, 15); return num(`En contenant ouvert, un mélange de ${m} g réagit et un gaz s'échappe. Il ne reste que ${m - g} g dans le contenant. Quelle masse de gaz s'est échappée, en grammes ?`, g, `${m} − ${m - g} = ${g} g de gaz.`, CON, "difficile", `${m} − ${m - g} = ${g} g`, "La masse manquante est celle du gaz."); }),
];

const ATO = "L'atome et le modèle de Dalton", MOL = "La molécule", ELE = "Les éléments", TAB = "Le tableau périodique";
const SYMBOLES = [["hydrogène", "H"], ["oxygène", "O"], ["carbone", "C"], ["azote", "N"], ["fer", "Fe"], ["sodium", "Na"], ["chlore", "Cl"], ["cuivre", "Cu"], ["or", "Au"], ["argent", "Ag"], ["aluminium", "Al"], ["hélium", "He"], ["potassium", "K"], ["calcium", "Ca"], ["magnésium", "Mg"], ["soufre", "S"], ["plomb", "Pb"], ["néon", "Ne"]];
const FORMULES = [["H₂O", "l'eau", 3, 2], ["CO₂", "le dioxyde de carbone", 3, 2], ["O₂", "le dioxygène", 2, 1], ["N₂", "le diazote", 2, 1], ["NH₃", "l'ammoniac", 4, 2], ["CH₄", "le méthane", 5, 2], ["H₂O₂", "le peroxyde d'hydrogène", 4, 2], ["C₆H₁₂O₆", "le glucose", 24, 3], ["O₃", "l'ozone", 3, 1], ["C₂H₆O", "l'éthanol", 9, 3]];
const atomes = () => [
  ...SYMBOLES.flatMap(([nom, s]) => [
    qcm(`Quel est le symbole de ${nom === "or" ? "l'or" : /^[aeiouhé]/.test(nom) ? "l'" + nom : "le " + nom} ?`, s, autres(SYMBOLES.map((x) => x[1]), s), `Le symbole de cet élément est ${s}.`, TAB, "facile"),
    q("ouverte", `Quel élément a pour symbole ${s} ?`, [], nom, `${s} est le symbole de cet élément : ${nom}.`, TAB, "moyen", { reponses_acceptees: ["l'" + nom, "le " + nom] }),
  ]),
  ...FORMULES.flatMap(([f, nom, a, e]) => [
    num(`Combien d'atomes en tout y a-t-il dans une molécule de ${nom} (${f}) ?`, a, `${f} contient ${a} atomes en tout.`, MOL, "moyen", "", "Additionne les petits chiffres; sans chiffre, compte 1."),
    num(`Combien de sortes d'atomes différentes y a-t-il dans ${f} ?`, e, `${f} contient ${e} sorte${e > 1 ? "s" : ""} d'atomes.`, MOL, "moyen", "", "Compte les symboles différents."),
    q("vrai_faux", `${f} est formé d'une seule sorte d'atomes.`, VF, e === 1 ? "Vrai" : "Faux", `${f} contient ${e} sorte${e > 1 ? "s" : ""} d'atomes.`, ELE, "difficile"),
  ]),
  q("vrai_faux", "Dans le modèle de Dalton, l'atome est représenté comme une petite sphère pleine.", VF, "Vrai", "Pour Dalton, l'atome est une sphère indivisible.", ATO, "moyen"),
  q("vrai_faux", "Selon Dalton, tous les atomes d'un même élément sont identiques.", VF, "Vrai", "Et ils diffèrent de ceux des autres éléments.", ATO, "difficile"),
  q("vrai_faux", "L'atome est l'unité de base de la molécule.", VF, "Vrai", "Une molécule est une combinaison d'atomes liés chimiquement.", ATO, "facile"),
  q("vrai_faux", "Une molécule est formée d'atomes liés chimiquement.", VF, "Vrai", "C'est sa définition selon le modèle de Dalton.", MOL, "facile"),
  q("vrai_faux", "Le tableau périodique est un répertoire organisé des éléments.", VF, "Vrai", "Il regroupe et classe tous les éléments connus.", TAB, "facile"),
  qcm("Qu'est-ce qu'un élément ?", "Une substance pure formée d'une seule sorte d'atomes", ["Un mélange de plusieurs gaz", "Un objet visible à l'œil nu", "Une molécule toujours formée de trois atomes"], "Le fer (Fe) et le diazote (N₂) sont des éléments.", ELE, "moyen"),
  qcm("Comment représenter une molécule d'eau avec le modèle de Dalton ?", "Deux sphères d'hydrogène liées à une sphère d'oxygène", ["Une seule grosse sphère", "Trois sphères d'oxygène", "Deux sphères d'oxygène liées à une sphère d'hydrogène"], "H₂O : deux atomes d'hydrogène et un atome d'oxygène.", MOL, "difficile"),
];

const CEL = "La cellule", CON2 = "Les constituants de la cellule", ECH = "Intrants, extrants et échanges", PHO = "Photosynthèse et respiration", GEN = "Gènes et chromosomes";
const cellule = () => [
  ...definitions([
    ["membrane cellulaire", "enveloppe qui contrôle ce qui entre dans la cellule et ce qui en sort"],
    ["noyau", "partie de la cellule qui dirige ses activités et contient les chromosomes"],
    ["cytoplasme", "substance gélatineuse où se trouvent les constituants de la cellule"],
    ["vacuole", "réservoir d'eau et de substances dans la cellule"],
    ["osmose", "passage de l'eau à travers une membrane vers le milieu le plus concentré en soluté"],
    ["diffusion", "déplacement de particules du milieu le plus concentré vers le moins concentré"],
    ["gène", "portion d'un chromosome qui transmet un caractère héréditaire"],
    ["cellule", "unité structurale de la vie"],
  ], CON2),
  ...classer([["la paroi cellulaire", "cellule végétale seulement"], ["les chloroplastes", "cellule végétale seulement"], ["une grande vacuole centrale", "cellule végétale seulement"], ["le noyau", "cellule animale et cellule végétale"], ["la membrane cellulaire", "cellule animale et cellule végétale"], ["le cytoplasme", "cellule animale et cellule végétale"]],
    ["cellule végétale seulement", "cellule animale seulement", "cellule animale et cellule végétale"], (x) => `Où trouve-t-on ${x} ?`, CEL, "moyen"),
  ...classer([["le dioxyde de carbone", "intrant"], ["l'eau", "intrant"], ["l'énergie lumineuse", "intrant"], ["le glucose", "extrant"], ["le dioxygène", "extrant"]], ["intrant", "extrant"], (x) => `Dans la photosynthèse, que représente ${x} : un intrant ou un extrant ?`, PHO, "moyen"),
  ...classer([["le glucose", "intrant"], ["le dioxygène", "intrant"], ["le dioxyde de carbone", "extrant"], ["l'eau", "extrant"], ["l'énergie", "extrant"]], ["intrant", "extrant"], (x) => `Dans la respiration cellulaire, que représente ${x} : un intrant ou un extrant ?`, PHO, "difficile"),
  ...classer([["les nutriments", "intrant"], ["le dioxygène", "intrant"], ["l'eau", "intrant"], ["le dioxyde de carbone", "extrant"], ["les déchets", "extrant"]], ["intrant", "extrant"], (x) => `Pour une cellule animale, que représente cet élément : ${x} ?`, ECH, "facile"),
  ...classer([["la nutrition", "caractéristique du vivant"], ["la reproduction", "caractéristique du vivant"], ["l'adaptation", "caractéristique du vivant"], ["la relation avec le milieu", "caractéristique du vivant"], ["la couleur verte", "pas une caractéristique commune"], ["la présence de pattes", "pas une caractéristique commune"]],
    ["caractéristique du vivant", "pas une caractéristique commune"], (x) => `Pour tous les êtres vivants, ${x} est…`, CEL, "facile"),
  q("vrai_faux", "Tous les êtres vivants sont faits d'au moins une cellule.", VF, "Vrai", "La cellule est l'unité structurale de la vie.", CEL, "facile"),
  q("vrai_faux", "Les cellules animales possèdent des chloroplastes.", VF, "Faux", "Seules les cellules végétales en ont : la photosynthèse s'y déroule.", CEL, "facile"),
  q("vrai_faux", "Les chromosomes se trouvent dans le noyau de la cellule.", VF, "Vrai", "Ils portent les gènes.", GEN, "facile"),
  q("vrai_faux", "Les gènes transmettent les caractères héréditaires.", VF, "Vrai", "Ils passent des parents aux enfants.", GEN, "moyen"),
  q("vrai_faux", "L'osmose concerne le déplacement de l'eau.", VF, "Vrai", "L'eau traverse la membrane vers le milieu le plus concentré en soluté.", ECH, "moyen"),
  q("vrai_faux", "La photosynthèse produit du dioxygène.", VF, "Vrai", "La plante utilise CO₂, eau et lumière pour produire du glucose et du dioxygène.", PHO, "moyen"),
  q("vrai_faux", "Seuls les animaux font la respiration cellulaire.", VF, "Faux", "Les plantes aussi respirent, jour et nuit.", PHO, "difficile"),
  qcm("Une carotte coupée placée dans de l'eau très salée ramollit. Pourquoi ?", "L'eau sort de ses cellules par osmose", ["Le sel fait pousser ses cellules", "Elle se dissout", "Elle fait la photosynthèse"], "L'eau traverse la membrane vers le milieu le plus concentré : ici, l'eau salée.", ECH, "difficile"),
  qcm("Un parfum ouvert se sent bientôt dans toute la pièce. Quel phénomène cela illustre-t-il ?", "La diffusion", ["L'osmose", "La photosynthèse", "La reproduction"], "Les particules vont du milieu le plus concentré vers le moins concentré.", ECH, "moyen"),
  qcm("Quelle est la relation entre la photosynthèse et la respiration ?", "Les extrants de l'une sont les intrants de l'autre", ["Elles n'ont aucun lien", "Elles utilisent toutes deux seulement de la lumière", "Elles ne se font que dans les animaux"], "Le glucose et le dioxygène produits par la photosynthèse servent à la respiration, qui rejette CO₂ et eau.", PHO, "difficile"),
];

const HAB = "Habitat et niche écologique", ESP = "Espèce et population", ADA = "Les adaptations", EVO = "Évolution et taxonomie";
const ecologie = () => [
  ...definitions([
    ["habitat", "lieu où vit une espèce, avec son climat, sa flore et sa faune"],
    ["niche écologique", "rôle et mode de vie d'une espèce dans son milieu"],
    ["espèce", "groupe d'individus aux caractères communs qui se reproduisent de façon naturelle, viable et féconde"],
    ["population", "ensemble des individus d'une même espèce sur un même territoire"],
    ["taxonomie", "système de classification des vivants basé sur leurs caractéristiques anatomiques et génétiques"],
    ["sélection naturelle", "processus par lequel les individus les mieux adaptés survivent et se reproduisent davantage"],
  ], HAB),
  ...classer([["le climat", "habitat"], ["la situation géographique", "habitat"], ["la flore", "habitat"], ["la proximité de constructions humaines", "habitat"], ["le régime alimentaire", "niche écologique"], ["le rythme journalier", "niche écologique"]], ["habitat", "niche écologique"], (x) => `Quel concept décrit surtout ${x} ?`, HAB, "moyen"),
  ...classer([["le pelage blanc du lièvre d'Amérique en hiver", "adaptation physique"], ["les épines du cactus", "adaptation physique"], ["la forme des feuilles d'un conifère", "adaptation physique"], ["les nageoires d'un poisson", "adaptation physique"], ["le long cou de la girafe", "adaptation physique"], ["la migration de la bernache", "adaptation comportementale"], ["le déplacement en groupes des poissons", "adaptation comportementale"], ["une plante qui pousse vers la lumière", "adaptation comportementale"], ["l'enfouissement d'un animal dans le sable", "adaptation comportementale"]],
    ["adaptation physique", "adaptation comportementale"], (x) => `Quel type d'adaptation est ${x} ?`, ADA, "facile"),
  q("vrai_faux", "Tous les orignaux d'un parc forment une population.", VF, "Vrai", "Même espèce, même territoire.", ESP, "facile"),
  q("vrai_faux", "Une population peut contenir plusieurs espèces différentes.", VF, "Faux", "Une population regroupe une seule espèce.", ESP, "moyen"),
  q("vrai_faux", "Le cheval et l'âne sont de la même espèce, car ils peuvent avoir un mulet.", VF, "Faux", "Le mulet est généralement stérile : leur reproduction n'est pas féconde.", ESP, "difficile"),
  q("vrai_faux", "Deux espèces peuvent vivre dans le même habitat sans avoir la même niche écologique.", VF, "Vrai", "Elles n'ont pas forcément le même régime ni le même rythme.", HAB, "difficile"),
  q("vrai_faux", "Une clé taxonomique sert à identifier une espèce.", VF, "Vrai", "On répond à une suite de choix sur ses caractéristiques.", EVO, "moyen"),
  qcm("Dans un milieu enneigé, des lièvres pâles et foncés vivent ensemble. Lesquels survivent le mieux ?", "Les pâles, moins visibles des prédateurs", ["Les foncés, plus visibles", "Tous également", "Aucun"], "C'est la sélection naturelle : les mieux adaptés survivent et se reproduisent davantage.", EVO, "difficile"),
  ...serie(10, () => { const d = ent(2, 15), s = ent(3, 40); return num(`Un territoire de ${s} km² compte en moyenne ${d} chevreuils par km². Combien de chevreuils y vivent ?`, d * s, `${d} × ${s} = ${d * s} chevreuils.`, ESP, "moyen", `Nombre d'individus = densité × superficie\n${d} × ${s} = ${d * s}`, "Multiplie la densité par la superficie."); }),
  ...serie(8, () => { const d = ent(2, 12), s = ent(5, 30), t = d * s; return num(`Une population de ${t} grenouilles occupe ${s} hectares. Combien y a-t-il de grenouilles par hectare ?`, d, `${t} ÷ ${s} = ${d} grenouilles par hectare.`, ESP, "moyen", `${t} ÷ ${s} = ${d}`, "Divise le nombre d'individus par la superficie."); }),
  ...serie(10, () => { const a = ent(3, 9), b = ent(3, 9), c = ent(3, 9), k = ent(5, 20) * 10; return num(`Dans 3 carrés de 1 m² d'un champ, on compte ${a}, ${b} et ${c} plants d'une espèce. Le champ mesure ${k * 3} m². Combien de plants estime-t-on dans tout le champ ?`, (a + b + c) * k, `On trouve ${a + b + c} plants dans 3 m², puis on multiplie par ${k} (le champ est ${k} fois plus grand) : ${(a + b + c) * k} plants.`, ESP, "difficile", `1. ${a} + ${b} + ${c} = ${a + b + c} plants dans 3 m²\n2. ${k * 3} ÷ 3 = ${k}\n3. ${a + b + c} × ${k} = ${(a + b + c) * k} plants`, "Additionne les plants comptés, puis cherche combien de fois 3 m² entrent dans le champ."); }),
];

const TER = "La structure de la Terre", ROC = "Roches et minéraux", ATM = "L'atmosphère et l'hydrosphère", GEO = "Phénomènes géologiques", NRG = "Ressources énergétiques", ESC = "Le système solaire", AST = "Phénomènes astronomiques";
const PLANETES = ["Mercure", "Vénus", "Terre", "Mars", "Jupiter", "Saturne", "Uranus", "Neptune"];
const terre = () => [
  ...classer([["le granite", "ignée"], ["le basalte", "ignée"], ["la pierre ponce", "ignée"], ["le calcaire", "sédimentaire"], ["le grès", "sédimentaire"], ["le schiste argileux", "sédimentaire"], ["l'ardoise", "métamorphique"], ["le marbre", "métamorphique"], ["le gneiss", "métamorphique"]],
    ["ignée", "sédimentaire", "métamorphique"], (x) => `De quel type de roche est ${x} ?`, ROC, "moyen"),
  ...classer([["l'énergie solaire", "renouvelable"], ["l'énergie éolienne", "renouvelable"], ["l'hydroélectricité", "renouvelable"], ["la géothermie", "renouvelable"], ["le pétrole", "non renouvelable"], ["le charbon", "non renouvelable"], ["le gaz naturel", "non renouvelable"], ["l'uranium", "non renouvelable"]], ["renouvelable", "non renouvelable"], (x) => `Comment classe-t-on cette ressource : ${x} ?`, NRG, "facile"),
  ...[["la planète la plus proche du Soleil", "Mercure"], ["la planète la plus éloignée du Soleil", "Neptune"], ["la plus grosse planète", "Jupiter"], ["la planète surnommée « planète rouge »", "Mars"], ["la planète aux anneaux les plus visibles", "Saturne"], ["la planète la plus chaude", "Vénus"], ["la seule planète connue avec de la vie", "Terre"]].flatMap(([d, p]) => [
    qcm(`Quelle est ${d} ?`, p, autres(PLANETES, p), `${p} : ${d}.`, ESC, "facile"),
    q("ouverte", `Écris le nom de ${d}.`, [], p, `${p} : ${d}.`, ESC, "moyen", { reponses_acceptees: p === "Terre" ? ["la terre"] : [] }),
  ]),
  ...definitions([
    ["lithosphère", "enveloppe externe de la Terre formée de la croûte et de la partie supérieure du manteau"],
    ["croûte", "couche la plus mince et la plus externe de la Terre"],
    ["manteau", "partie de la Terre située entre la croûte et le noyau"],
    ["gravitation", "force d'attraction mutuelle qui s'exerce entre les corps"],
    ["rotation", "mouvement de la Terre sur elle-même, en environ 24 heures"],
    ["révolution", "mouvement de la Terre autour du Soleil, en environ 365 jours"],
    ["érosion", "usure du relief par l'eau, le vent ou la glace"],
  ], TER),
  q("ordre", "Place les planètes dans l'ordre, de la plus proche à la plus éloignée du Soleil.", [], PLANETES.join(" → "), "Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune.", ESC, "difficile", { elements: PLANETES }),
  q("ordre", "Place les couches de l'atmosphère, du sol vers l'espace.", [], "Troposphère → Stratosphère → Mésosphère → Thermosphère", "On commence par la troposphère, où nous vivons.", ATM, "difficile", { elements: ["Troposphère", "Stratosphère", "Mésosphère", "Thermosphère"] }),
  q("ordre", "Place les parties de la Terre, de la surface vers le centre.", [], "Croûte → Manteau → Noyau", "La croûte est à l'extérieur, le noyau au centre.", TER, "facile", { elements: ["Croûte", "Manteau", "Noyau"] }),
  q("ordre", "Place les étapes du cycle de l'eau, à partir de la mer.", [], "Évaporation → Condensation → Précipitations → Ruissellement", "L'eau s'évapore, se condense en nuages, tombe, puis rejoint la mer.", GEO, "moyen", { elements: ["Évaporation", "Condensation", "Précipitations", "Ruissellement"] }),
  qcm("Quel gaz est le plus abondant dans l'air pur ?", "L'azote", ["L'oxygène", "Le dioxyde de carbone", "L'hélium"], "L'air contient environ 78 % d'azote et 21 % d'oxygène.", ATM, "moyen"),
  qcm("Environ quelle part de l'eau sur Terre est de l'eau salée ?", "97 %", ["3 %", "50 %", "21 %"], "Environ 97 % de l'eau est salée; seulement 3 % est de l'eau douce.", ATM, "moyen"),
  qcm("Dans quelle couche de l'atmosphère se produisent les aurores boréales ?", "La thermosphère", ["La troposphère", "La stratosphère", "La mésosphère"], "Les aurores se produisent très haut, dans la thermosphère, près des pôles.", AST, "difficile"),
  qcm("Pourquoi y a-t-il des saisons ?", "L'axe de la Terre est incliné pendant sa révolution autour du Soleil", ["La Terre s'éloigne beaucoup du Soleil en hiver", "La Lune cache le Soleil", "Le Soleil s'éteint un peu"], "L'inclinaison de l'axe change la quantité de lumière reçue pendant l'année.", AST, "difficile"),
  qcm("Pourquoi y a-t-il le jour et la nuit ?", "La Terre tourne sur elle-même", ["Le Soleil tourne autour de la Terre", "La Lune cache le Soleil chaque soir", "La Terre tourne autour de la Lune"], "Une rotation dure environ 24 heures.", AST, "facile"),
  qcm("Lors d'une éclipse solaire, quel astre se trouve entre le Soleil et la Terre ?", "La Lune", ["Mars", "Vénus", "Une comète"], "La Lune cache le Soleil.", AST, "moyen"),
  qcm("Lors d'une éclipse lunaire, quel astre se trouve entre le Soleil et la Lune ?", "La Terre", ["Mars", "Vénus", "Jupiter"], "La Lune passe dans l'ombre de la Terre.", AST, "difficile"),
  qcm("Combien de temps dure environ un cycle des phases de la Lune ?", "29,5 jours", ["24 heures", "7 jours", "365 jours"], "Le cycle lunaire dure environ 29,5 jours.", AST, "moyen"),
  qcm("Qu'est-ce qui forme le noyau d'une comète ?", "De la glace et de la roche", ["Du feu", "Du gaz seulement", "De l'eau liquide"], "Le noyau d'une comète est fait de glace et de roche.", AST, "moyen"),
  qcm("Quelle est l'origine du réservoir Manicouagan, au Québec ?", "Un impact météoritique", ["Un volcan", "Un séisme", "Une aurore boréale"], "Sa forme ronde est une trace d'impact météoritique.", AST, "difficile"),
  qcm("Comment se forme une roche ignée ?", "Par le refroidissement du magma ou de la lave", ["Par l'empilement de sédiments", "Par la transformation sous pression et chaleur", "Par l'évaporation de l'eau"], "Ignée vient d'un mot qui veut dire « feu ».", ROC, "moyen"),
  qcm("Comment se forme une roche sédimentaire ?", "Par l'accumulation et la compaction de sédiments", ["Par le refroidissement de la lave", "Par la foudre", "Par la fonte de la glace"], "Les sédiments se déposent en couches qui durcissent.", ROC, "moyen"),
  qcm("Comment se forme une roche métamorphique ?", "Par la transformation d'une roche sous l'effet de la chaleur et de la pression", ["Par l'évaporation", "Par le refroidissement rapide de la lave", "Par le vent"], "L'ardoise vient d'une roche transformée.", ROC, "moyen"),
  q("vrai_faux", "La lithosphère est découpée en plaques tectoniques qui se déplacent.", VF, "Vrai", "C'est la théorie de la tectonique des plaques.", GEO, "facile"),
  q("vrai_faux", "Les tremblements de terre sont souvent causés par le mouvement des plaques tectoniques.", VF, "Vrai", "L'énergie accumulée se libère brusquement.", GEO, "facile"),
  q("vrai_faux", "Les volcans sont répartis au hasard, sans lien avec les plaques.", VF, "Faux", "Beaucoup se trouvent aux frontières des plaques, comme la ceinture de feu du Pacifique.", GEO, "moyen"),
  q("vrai_faux", "Les montagnes peuvent se former quand deux plaques se rencontrent.", VF, "Vrai", "La collision plisse la croûte.", GEO, "moyen"),
  q("vrai_faux", "Une roche et un minéral, c'est la même chose.", VF, "Faux", "Une roche est faite d'un ou de plusieurs minéraux.", ROC, "moyen"),
  q("vrai_faux", "La lumière se propage en ligne droite.", VF, "Vrai", "C'est pourquoi un objet forme une ombre.", AST, "facile"),
  q("vrai_faux", "La Lune produit sa propre lumière.", VF, "Faux", "Elle réfléchit la lumière du Soleil.", AST, "moyen"),
  q("vrai_faux", "Les vents sont liés à l'énergie solaire, qui réchauffe l'air de façon inégale.", VF, "Vrai", "L'air chaud monte, l'air froid le remplace.", GEO, "difficile"),
];

const LECONS = {
  proprietes: {
    sujet: "Propriétés de la matière", re: /propri[ée]t|masse|volume|acid|[ée]tats? de la mati/, questions: proprietes,
    fiche: {
      titre: "Les propriétés de la matière : enquête sur les substances !", intro: "Tout ce qui nous entoure est fait de matière. Pour la décrire, on mesure sa masse, son volume et sa température, on observe son état, et on cherche les propriétés qui identifient une substance.",
      notions: [
        n("La masse", "La masse est la quantité de matière d'un objet. On la mesure avec une balance, en grammes ou en kilogrammes (1 kg = 1000 g).", "Un cube de fer et un cube de bois de même volume n'ont pas la même masse."),
        n("Le volume", "Le volume est l'espace occupé par un objet. 1 L = 1000 mL et 1 mL = 1 cm³. Pour une boîte : longueur × largeur × hauteur. Pour une roche : on mesure l'eau déplacée.", "120 mL = 0,12 L = 120 cm³."),
        n("La température", "La température mesure le degré d'agitation des particules. Un apport de chaleur les agite davantage; le corps se dilate alors : son volume augmente.", "Le liquide d'un thermomètre monte quand il fait chaud."),
        n("Les changements d'état", "Fusion (solide → liquide), solidification (liquide → solide), vaporisation (liquide → gaz), condensation (gaz → liquide), sublimation (solide → gaz), condensation solide (gaz → solide). Pour une substance pure, la température reste constante pendant le changement d'état.", "L'eau bout à température constante : c'est le plateau du diagramme."),
        n("Acides et bases", "Les acides rougissent le papier tournesol et réagissent avec certains métaux; les bases le bleuissent. Une solution neutre ne change pas sa couleur.", "Citron et vinaigre : acides. Lait de magnésie : basique. Eau pure : neutre."),
        n("Les propriétés caractéristiques", "Une propriété caractéristique aide à identifier une substance ou un groupe de substances. Elle explique aussi l'usage d'un matériau.", "On fabrique une casserole en métal parce qu'il conduit bien la chaleur."),
      ],
      astuces: ["Masse = quantité de matière; volume = place occupée.", "mL → L : divise par 1000.", "Acide → tournesol rouge."],
      pieges: ["Confondre masse et volume.", "Oublier que 1 mL = 1 cm³.", "Confondre condensation (gaz → liquide) et condensation solide (gaz → solide)."],
    },
  },
  melanges: {
    sujet: "Mélanges et solutions", re: /m[ée]lange|solution|s[ée]paration/, questions: melanges,
    fiche: {
      titre: "Mélanges et solutions : l'art de séparer !", intro: "Un mélange contient plusieurs substances. Selon ce qu'on voit, il est homogène ou hétérogène, et on choisit la bonne technique pour le séparer.",
      notions: [
        n("Les mélanges", "Un mélange est composé de plusieurs substances. Homogène : une seule phase visible. Hétérogène : au moins deux phases visibles.", "Eau salée, air, bronze : homogènes. Vinaigrette, roche, smog : hétérogènes."),
        n("Les solutions", "Une solution aqueuse est un mélange homogène à base d'eau : une seule phase visible, translucide.", "De l'eau sucrée est une solution aqueuse."),
        n("La séparation des mélanges", "Filtration : retenir un solide. Évaporation : récupérer un solide dissous. Distillation : récupérer un liquide. Décantation : verser le liquide du dessus. Sédimentation : laisser les particules se déposer. Tamisage, aimantation et centrifugation servent aussi.", "Eau salée avec du sable : sédimentation, décantation, puis évaporation."),
      ],
      astuces: ["Homogène = une seule phase.", "Choisis la technique selon ce que tu veux garder."],
      pieges: ["Confondre sédimentation (ça se dépose) et décantation (on verse).", "Croire que l'air est une substance pure."],
    },
  },
  changements: {
    sujet: "Changements physiques et chimiques", re: /changement|transformation|r[ée]action/, questions: changements,
    fiche: {
      titre: "Physique ou chimique ? Mène l'enquête !", intro: "La matière se transforme. Parfois, elle garde ses propriétés; parfois, de nouvelles substances apparaissent. Dans tous les cas, elle se conserve.",
      notions: [
        n(PHY, "Changement physique : la substance conserve ses propriétés et ses molécules restent intactes (changement d'état, mélange, séparation). Changement chimique : de nouvelles substances aux propriétés différentes se forment.", "La glace qui fond est physique; le bois qui brûle est chimique."),
        n(IND, "Cinq indices : formation d'un précipité, effervescence, changement de couleur, dégagement de chaleur, émission de lumière.", "Vinaigre + bicarbonate : des bulles apparaissent."),
        n(TYP, "L'oxydation (rouille, combustion) et la décomposition (une substance se sépare en substances plus simples) sont des changements chimiques.", "Un clou qui rouille s'oxyde."),
        n(CON, "La matière se conserve : la masse des réactifs égale la masse des produits. En contenant ouvert, un gaz peut s'échapper, mais sa masse existe toujours.", "30 g + 20 g donnent 50 g de produits."),
      ],
      astuces: ["Nouvelle substance = chimique.", "Masse avant = masse après."],
      pieges: ["Croire qu'un changement d'état est chimique.", "Croire que la matière disparaît quand elle brûle."],
    },
  },
  atomes: {
    sujet: "Atome et tableau périodique", re: /atome|mol[ée]cule|p[ée]riodique|[ée]l[ée]ment/, questions: atomes,
    fiche: {
      titre: "Atomes et molécules : les briques de la matière !", intro: "Toute la matière est faite d'atomes. Le modèle de Dalton les représente comme de petites sphères qui se lient en molécules.",
      notions: [
        n(ATO, "Pour Dalton, l'atome est une petite sphère pleine et indivisible. Les atomes d'un même élément sont identiques. L'atome est l'unité de base de la molécule.", "Une sphère = un atome."),
        n(MOL, "Une molécule est une combinaison d'atomes liés chimiquement. Dans une formule, le petit chiffre indique le nombre d'atomes.", "H₂O : 2 hydrogènes + 1 oxygène = 3 atomes."),
        n(ELE, "Un élément est une substance pure formée d'une seule sorte d'atomes.", "Fe, N₂ et O₂ sont des éléments."),
        n(TAB, "Le tableau périodique est un répertoire organisé des éléments. Chacun a un symbole.", "H, O, C, Fe, Au."),
      ],
      astuces: ["Sans chiffre après le symbole : 1 atome.", "Fe = fer, Au = or, Ag = argent."],
      pieges: ["Confondre atome et molécule.", "Croire qu'une molécule contient toujours des atomes différents : O₂ n'en a qu'une sorte."],
    },
  },
  cellule: {
    sujet: "La cellule", re: /cellul|vivant|photosynth|g[èe]ne|chromosome/, questions: cellule,
    fiche: {
      titre: "La cellule : la plus petite unité de vie !", intro: "Tous les êtres vivants sont faits de cellules. Chacune assure des fonctions vitales et échange avec son milieu.",
      notions: [
        n(CEL, "La cellule est l'unité structurale de la vie. Tous les vivants partagent la nutrition, la relation, l'adaptation et la reproduction. La cellule végétale a en plus une paroi, des chloroplastes et une grande vacuole.", "Une cellule de feuille contient des chloroplastes, pas une cellule de peau."),
        n(CON2, "Membrane : contrôle les entrées et sorties. Cytoplasme : milieu où baignent les constituants. Noyau : dirige la cellule et contient les chromosomes. Vacuole : réserve.", "Au microscope, on voit le noyau comme une tache foncée."),
        n(ECH, "Intrants : nutriments, eau, dioxygène. Extrants : dioxyde de carbone, déchets. Diffusion : des particules vont du milieu concentré vers le moins concentré. Osmose : l'eau traverse une membrane vers le milieu le plus concentré.", "Un parfum se répand par diffusion."),
        n(PHO, "Photosynthèse : CO₂ + eau + lumière → glucose + dioxygène. Respiration : glucose + dioxygène → CO₂ + eau + énergie.", "Les plantes font les deux; les animaux, seulement la respiration."),
        n(GEN, "Les chromosomes sont dans le noyau. Un gène est une portion de chromosome qui transmet un caractère héréditaire.", "La couleur des yeux dépend de gènes."),
      ],
      astuces: ["Photosynthèse et respiration sont inverses l'une de l'autre."],
      pieges: ["Croire que les plantes ne respirent pas.", "Confondre osmose (eau) et diffusion (particules)."],
    },
  },
  ecologie: {
    sujet: "Écologie", re: /[ée]colog|esp[èe]ce|adaptation|habitat|[ée]volution|population/, questions: ecologie,
    fiche: {
      titre: "Écologie : qui vit où, et comment ?", intro: "Chaque espèce occupe un habitat et y joue un rôle. Les adaptations augmentent ses chances de survie.",
      notions: [
        n(HAB, "L'habitat est le lieu de vie (climat, flore, faune, situation géographique). La niche écologique comprend l'habitat, le régime alimentaire et le rythme journalier.", "Le castor vit près des cours d'eau et mange de l'écorce."),
        n(ESP, "Une espèce regroupe des individus aux caractères communs dont la reproduction naturelle est viable et féconde. Une population regroupe les individus d'une espèce sur un territoire. Nombre d'individus = densité × superficie.", "5 chevreuils/km² sur 20 km² : 100 chevreuils."),
        n(ADA, "Adaptations physiques : pelage, forme des feuilles. Adaptations comportementales : migration, déplacement en groupes, phototropisme.", "Le lièvre d'Amérique devient blanc en hiver."),
        n(EVO, "Par la sélection naturelle, les individus les mieux adaptés survivent et se reproduisent davantage. La taxonomie classe les vivants; une clé taxonomique aide à identifier une espèce.", "Dans la neige, les lièvres pâles échappent mieux aux prédateurs."),
      ],
      astuces: ["Habitat = adresse; niche = métier.", "Population = une seule espèce."],
      pieges: ["Confondre espèce et population.", "Croire qu'avoir un petit suffit à être de la même espèce : il doit être fécond."],
    },
  },
  terre: {
    sujet: "La Terre et l'Univers", re: /terre|univers|plan[èe]te|espace|roche|atmosph|solaire|astronom/, questions: terre,
    fiche: {
      titre: "La Terre et l'Univers : du noyau aux étoiles !", intro: "Notre planète a une structure, une atmosphère et des phénomènes qui transforment son relief. Elle fait partie du système solaire.",
      notions: [
        n(TER, "La Terre comprend la croûte, le manteau et le noyau. La lithosphère est son enveloppe externe : la croûte et la partie supérieure du manteau.", "La croûte est la couche la plus mince."),
        n(ROC, "Roches ignées : refroidissement du magma (granite). Sédimentaires : compaction de sédiments (calcaire). Métamorphiques : transformation par chaleur et pression (ardoise). Une roche est faite de minéraux.", "Le granite est une roche ignée."),
        n(ATM, "L'air pur contient environ 78 % d'azote et 21 % d'oxygène. Couches : troposphère, stratosphère, mésosphère, thermosphère. Environ 97 % de l'eau est salée.", "Nous vivons dans la troposphère."),
        n(GEO, "Les plaques tectoniques se déplacent : montagnes, volcans et séismes. L'érosion use le relief. L'énergie solaire entraîne les vents et le cycle de l'eau.", "Beaucoup de volcans bordent le Pacifique."),
        n(NRG, "Ressources renouvelables : solaire, éolienne, hydroélectricité, géothermie. Non renouvelables : pétrole, charbon, gaz naturel, uranium.", "Le Québec produit surtout de l'hydroélectricité."),
        n(ESC, "Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune tournent autour du Soleil.", "Jupiter est la plus grosse."),
        n(AST, "Rotation (24 h) : jour et nuit. Révolution (365 jours) et axe incliné : saisons. Cycle lunaire : 29,5 jours. Éclipse solaire : la Lune entre le Soleil et la Terre. Éclipse lunaire : la Terre entre le Soleil et la Lune.", "La Lune réfléchit la lumière du Soleil."),
      ],
      astuces: ["Rotation = sur elle-même; révolution = autour du Soleil."],
      pieges: ["Croire que les saisons viennent de la distance au Soleil.", "Confondre roche et minéral."],
    },
  },
};

export const estScience = (matiere) => /^science et technologie/i.test(matiere || "");
// Leçon intégrée qui correspond au sujet; avec defaut, la première leçon plutôt que rien.
export function banqueScience(sujet = "", defaut = false) {
  const s = String(sujet || "").toLowerCase();
  const l = Object.values(LECONS).find((x) => x.sujet.toLowerCase() === s) || Object.values(LECONS).find((x) => x.re.test(s)) || (defaut ? LECONS.proprietes : null);
  return l ? { fiche: l.fiche, questions: l.questions() } : null;
}
export const SUJETS_SCIENCE = Object.values(LECONS).map((l) => l.sujet);
