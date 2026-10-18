// Leçons et questions de géographie générées à partir des vraies cartes et des drapeaux officiels.
import { PAYS, de } from "./geo-donnees.js";
import { urlCarte, urlDrapeau, REGION_DE_ZONE } from "./carto.js";

const q = (type, enonce, choix, reponse, explication, notion, difficulte = "moyen", extra = {}) =>
  ({ type, enonce, choix, elements: [], image_svg: "", image_url: "", indice: "", reponse, reponses_acceptees: [], tolerance: 0, audio: "", explication, demarche: "", explications_choix: [], notion, difficulte, ...extra });
const melange = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const autres = (pool, exclu, n) => melange(pool.filter((p) => p !== exclu)).slice(0, n);
const NOM_ZONE = { Europe: "l'Europe", "Amériques": "les Amériques", Afrique: "l'Afrique" };
const DE_ZONE = { Europe: "d'Europe", "Amériques": "des Amériques", Afrique: "d'Afrique" };
// Sous-continent pour les Amériques (Amérique du Nord, centrale et Caraïbes / Amérique du Sud).
const amerique = (p) => (p.lat > 12 || ["pa", "cr", "ni"].includes(p.iso2) ? "Amérique du Nord" : "Amérique du Sud");
const continentDe = (p) => (p.zone === "Amériques" ? amerique(p) : p.zone);

// ---------- Indices (aident sans donner la réponse) ----------
const CENTRES_CONT = { Europe: [15, 52], Afrique: [20, 2], "Amérique du Nord": [-95, 35], "Amérique du Sud": [-60, -18] };
function region(p) { // « dans le nord-ouest de l'Afrique », « au centre de l'Europe »…
  const c = continentDe(p), [lo, la] = CENTRES_CONT[c] || [0, 0];
  const ns = p.lat > la + 6 ? "nord" : p.lat < la - 6 ? "sud" : "", eo = p.lon > lo + 8 ? "est" : p.lon < lo - 8 ? "ouest" : "";
  const dir = ns && eo ? `${ns}-${eo}` : ns || eo;
  const du = c === "Europe" ? "de l'Europe" : c === "Afrique" ? "de l'Afrique" : "de l'" + c;
  return dir ? `dans le ${dir} ${du}` : `au centre ${du}`;
}
const debut = (mot) => `commence par « ${mot.slice(0, 2)}… » (${mot.replace(/[^\p{L}]/gu, "").length} lettres)`;
const indicePays = (p) => `Ce pays se trouve ${region(p)}. Sa capitale est ${p.capitale}.`;

// ---------- Questions pour une ou plusieurs zones ----------
function questionsZones(zones) {
  const pool = PAYS.filter((p) => zones.includes(p.zone));
  const memeZone = (p) => pool.filter((x) => x.zone === p.zone);
  const qs = [];
  for (const p of melange(pool).slice(0, 7)) { // drapeau → pays
    const faux = autres(memeZone(p), p, 3);
    qs.push(q("qcm", "À quel pays appartient ce drapeau ?", melange([p, ...faux]).map((x) => x.nom), p.nom,
      `C'est le drapeau ${de(p.nom)} (${continentDe(p)}), dont la capitale est ${p.capitale}.`, `Les drapeaux ${DE_ZONE[p.zone]}`, "facile",
      { image_url: urlDrapeau(p.iso2), explications_choix: faux.map((x) => ({ choix: x.nom, pourquoi: `Le drapeau ${de(x.nom)} est différent. Retiens : ${x.nom} → capitale ${x.capitale}.` })) }));
  }
  for (const p of melange(pool).slice(0, 6)) { // capitale (QCM)
    const faux = autres(memeZone(p), p, 3);
    qs.push(q("qcm", `Quelle est la capitale ${de(p.nom)} ?`, melange([p, ...faux]).map((x) => x.capitale), p.capitale,
      `La capitale ${de(p.nom)} est ${p.capitale}.`, `Pays et capitales ${DE_ZONE[p.zone]}`, "facile",
      { explications_choix: faux.map((x) => ({ choix: x.capitale, pourquoi: `${x.capitale} est la capitale ${de(x.nom)}.` })) }));
  }
  for (const p of melange(pool).slice(0, 4)) { // capitale → pays (écrit)
    qs.push(q("ouverte", `${p.capitale} est la capitale de quel pays ?`, [], p.nom, `${p.capitale} est la capitale ${de(p.nom)} (${continentDe(p)}).`, `Pays et capitales ${DE_ZONE[p.zone]}`, "moyen",
      { reponses_acceptees: [de(p.nom).replace(/^(de la |de l'|du |des |de )/, ""), "la " + p.nom, "le " + p.nom, "les " + p.nom] }));
  }
  for (const p of melange(pool).slice(0, 4)) { // capitale d'un pays (écrit)
    qs.push(q("ouverte", `Écris la capitale ${de(p.nom)}.`, [], p.capitale, `La capitale ${de(p.nom)} est ${p.capitale}.`, `Pays et capitales ${DE_ZONE[p.zone]}`, "moyen",
      { reponses_acceptees: p.autres, image_url: urlCarte({ region: REGION_DE_ZONE[p.zone], rouge: [p.iso2] }) }));
  }
  for (const p of melange(pool).slice(0, 5)) { // pays en rouge sur la carte
    const faux = autres(memeZone(p), p, 3);
    qs.push(q("qcm", "Sur la carte, quel pays est en rouge ?", melange([p, ...faux]).map((x) => x.nom), p.nom,
      `Le pays en rouge est ${p.nom.startsWith("É") || /^[AEIOU]/.test(p.nom) ? "l'" : ""}${p.nom}; sa capitale est ${p.capitale}.`, `La carte ${DE_ZONE[p.zone]}`, "moyen",
      { image_url: urlCarte({ region: REGION_DE_ZONE[p.zone], rouge: [p.iso2] }) }));
  }
  for (const z of zones) { // carte numérotée
    const choisis = melange(pool.filter((p) => p.zone === z)).slice(0, 6);
    const url = urlCarte({ region: REGION_DE_ZONE[z], numeros: choisis.map((p) => p.iso2) });
    choisis.slice(0, 3).forEach((p) => {
      const n = choisis.indexOf(p) + 1;
      qs.push(q("ouverte", `Sur la carte, quel pays porte le numéro ${n} ?`, [], p.nom, `Le numéro ${n} est ${p.nom} (capitale : ${p.capitale}).`, `La carte ${DE_ZONE[z]}`, "difficile",
        { image_url: url, reponses_acceptees: [de(p.nom).replace(/^(de la |de l'|du |des |de )/, "")] }));
    });
  }
  for (const p of melange(pool).slice(0, 2)) { // drapeau → capitale
    qs.push(q("ouverte", "Quelle est la capitale du pays de ce drapeau ?", [], p.capitale, `C'est le drapeau ${de(p.nom)} : sa capitale est ${p.capitale}.`, `Les drapeaux ${DE_ZONE[p.zone]}`, "difficile",
      { image_url: urlDrapeau(p.iso2), reponses_acceptees: p.autres }));
  }
  return melange(qs);
}

function ficheZones(zones, titre) {
  const notions = [];
  for (const z of zones) {
    const pays = PAYS.filter((p) => p.zone === z);
    const reperes = melange(pays).slice(0, 8);
    notions.push(
      { titre: `La carte politique ${DE_ZONE[z]}`, explication: `Voici ${NOM_ZONE[z]} comme dans ton atlas : chaque pays a sa couleur et sa capitale est marquée d'un petit carré noir. Repère les mers et les océans autour, et la rose des vents (le nord est en haut).`,
        exemple: z === "Europe" ? "La France est à l'ouest, l'Allemagne au centre, la Russie à l'est, la Grèce au sud-est." : z === "Afrique" ? "L'Égypte est au nord-est, l'Afrique du Sud tout au sud, le Sénégal à l'ouest." : "Le Canada est au nord, le Brésil (le plus grand pays d'Amérique du Sud) au centre-est, le Chili tout en longueur à l'ouest.",
        visuel_svg: "", visuel_url: urlCarte({ region: REGION_DE_ZONE[z], capitales: true, noms: true }), audio: [] },
      { titre: `Repère les pays ${DE_ZONE[z]}`, explication: "Sur une carte muette, les noms ne sont pas écrits : il faut reconnaître les pays par leur forme et leur position. Entraîne-toi avec les numéros !",
        exemple: reperes.map((p, i) => `${i + 1} = ${p.nom}`).join(" · "), visuel_svg: "", visuel_url: urlCarte({ region: REGION_DE_ZONE[z], numeros: reperes.map((p) => p.iso2) }), audio: [] },
      { titre: `Les drapeaux ${DE_ZONE[z]}`, explication: "Observe bien les couleurs, leur ordre et les symboles (étoiles, croix, emblèmes).", exemple: "Astuce : associe chaque drapeau à sa capitale.",
        visuel_svg: "", visuel_url: "", audio: [], galerie: pays.map((p) => ({ img: urlDrapeau(p.iso2), legende: `${p.nom} · ${p.capitale}` })) },
      { titre: `Pays et capitales ${DE_ZONE[z]}`, explication: `Les ${pays.length} pays de la leçon et leur capitale.`, exemple: "Lis la liste à voix haute en cachant la colonne des capitales pour t'entraîner.",
        visuel_svg: "", visuel_url: "", audio: [], tableau: [["Pays", "Capitale"], ...pays.map((p) => [p.nom, p.capitale])] },
    );
  }
  return {
    titre, intro: `Prêt pour un tour ${zones.length > 1 ? "du monde" : DE_ZONE[zones[0]].replace("d'", "de l'").replace("des ", "des ")} ? Dans cette leçon : de vraies cartes comme dans ton atlas, les drapeaux officiels et les capitales. Ensuite, Sensei te teste !`,
    notions,
    astuces: ["Apprends par petits groupes de voisins (ex. : Espagne, Portugal, France).", "Associe toujours trois choses : le pays, sa capitale et son drapeau.", "Sur une carte muette, sers-toi des mers et des pays faciles (Italie, Royaume-Uni) comme repères."],
    pieges: ["Confondre des drapeaux qui se ressemblent (Italie / Irlande / Mexique, Roumanie / Tchad).", "Croire que la plus grande ville est toujours la capitale (Canada → Ottawa, pas Toronto; Australie → Canberra).", "Oublier les accents dans les noms de capitales."],
  };
}

// ---------- Le monde : continents et océans ----------
function banqueMonde() {
  const CONTS = ["Afrique", "Amérique du Sud", "Amérique du Nord", "Europe", "Asie", "Océanie"];
  const qs = [];
  for (const c of CONTS) {
    const faux = melange(CONTS.filter((x) => x !== c)).slice(0, 3);
    qs.push(q(Math.random() < 0.6 ? "qcm" : "ouverte", "Sur la carte, quel continent est en rouge ?", [], c, `Le continent en rouge est ${c === "Asie" || c === "Afrique" || c === "Europe" || c === "Océanie" ? "l'" : "l'"}${c}.`, "Les continents", "facile",
      { image_url: urlCarte({ region: "monde", rouge: [c] }), reponses_acceptees: ["l'" + c, c.replace("Amérique", "Amerique")] }));
    if (qs.at(-1).type === "qcm") qs.at(-1).choix = melange([c, ...faux]);
  }
  for (const [o, lon, lat] of [["Océan Atlantique", -35, 25], ["Océan Pacifique", -150, 0], ["Océan Indien", 78, -20], ["Océan Arctique", 0, 82]]) {
    qs.push(q("qcm", "Quel océan est marqué d'une étoile ★ ?", melange(["Océan Atlantique", "Océan Pacifique", "Océan Indien", "Océan Arctique"]), o, `L'étoile est sur l'${o.replace("Océan ", "océan ")}.`, "Les océans", "facile",
      { image_url: urlCarte({ region: "monde", continents: true, etoile: [lon, lat] }) }));
  }
  for (const p of melange(PAYS).slice(0, 6)) {
    const c = continentDe(p);
    qs.push(q("qcm", `Sur quel continent se trouve ${p.nom.match(/^[AEIOUÉ]/) ? "l'" : ""}${p.nom} ?`, melange(CONTS.slice(0, 5)), c, `${p.nom} se trouve en ${c} (capitale : ${p.capitale}).`, "Les continents", "moyen"));
  }
  qs.push(q("qcm", "Quel est le plus grand océan de la Terre ?", ["Pacifique", "Atlantique", "Indien", "Arctique"], "Pacifique", "Le Pacifique couvre à lui seul près du tiers de la planète.", "Les océans", "facile"));
  qs.push(q("vrai_faux", "Le Canada et le Québec se trouvent en Amérique du Nord.", ["Vrai", "Faux"], "Vrai", "Le Canada (et le Québec) sont en Amérique du Nord.", "Les continents", "facile"));
  return {
    fiche: {
      titre: "Le tour du monde : continents et océans !",
      intro: "Sur un planisphère (une carte du monde à plat), on repère les grandes étendues de terre, les continents, et les grandes étendues d'eau, les océans.",
      notions: [
        { titre: "Les continents", explication: "La Terre compte six continents habités : l'Amérique du Nord, l'Amérique du Sud, l'Europe, l'Afrique, l'Asie et l'Océanie, plus l'Antarctique au pôle Sud. Le Québec et le Canada sont en Amérique du Nord.", exemple: "L'Asie est le plus grand continent; l'Océanie est le plus petit.", visuel_svg: "", visuel_url: urlCarte({ region: "monde", continents: true }), audio: [] },
        { titre: "Les océans", explication: "Les continents sont entourés de cinq océans : Pacifique (le plus grand), Atlantique (entre l'Amérique et l'Europe/Afrique), Indien, Arctique (au nord) et Austral (autour de l'Antarctique).", exemple: "Pour aller du Québec à la France en bateau, on traverse l'océan Atlantique.", visuel_svg: "", visuel_url: urlCarte({ region: "monde" }), audio: [] },
        { titre: "Lire une carte", explication: "Une carte scolaire a toujours : un titre, une orientation (la rose des vents indique le nord, en haut), une échelle (pour mesurer les distances) et une légende (pour comprendre les symboles et les couleurs).", exemple: "Sur l'échelle, si 1 cm = 1000 km et que deux villes sont à 3 cm, elles sont à environ 3000 km.", visuel_svg: "", visuel_url: urlCarte({ region: "europe", capitales: true }), audio: [] },
      ],
      astuces: ["Pacifique = le plus grand, Atlantique = celui qu'on traverse pour aller en Europe.", "Pour s'orienter : le nord est en haut, le sud en bas, l'est à droite, l'ouest à gauche."],
      pieges: ["Croire que l'Europe et l'Asie sont séparées par un océan : elles forment un seul bloc de terre (l'Eurasie).", "Oublier que l'Amérique compte deux continents : du Nord et du Sud."],
    },
    questions: melange(qs),
  };
}

// ---------- Les océans du monde ----------
const OCEANS = [
  { nom: "Océan Pacifique", court: "Pacifique", superficie: "environ 165 millions de km²", situation: "entre l'Asie / l'Océanie et les Amériques", positions: [[-150, 0], [-135, 25], [170, 10], [-115, -30]] },
  { nom: "Océan Atlantique", court: "Atlantique", superficie: "environ 106 millions de km²", situation: "entre les Amériques et l'Europe / l'Afrique", positions: [[-35, 25], [-25, -20], [-45, 40]] },
  { nom: "Océan Indien", court: "Indien", superficie: "environ 70 millions de km²", situation: "entre l'Afrique, l'Asie et l'Australie", positions: [[78, -20], [65, -5], [95, -30]] },
  { nom: "Océan Austral", court: "Austral", superficie: "environ 22 millions de km²", situation: "autour de l'Antarctique, au pôle Sud", positions: [[20, -62], [-90, -63], [130, -62]] },
  { nom: "Océan Arctique", court: "Arctique", superficie: "environ 14 millions de km²", situation: "autour du pôle Nord, au nord du Canada, de l'Europe et de la Russie", positions: [[10, 82], [-150, 79], [80, 80]] },
];
function banqueOceans() {
  const noms = OCEANS.map((o) => o.nom);
  const etoile = (o) => o.positions[Math.floor(Math.random() * o.positions.length)];
  const acc = (o) => [o.court, "l'" + o.nom.toLowerCase(), "l'océan " + o.court, o.court.toLowerCase()];
  const qs = [];
  for (const o of melange(OCEANS)) { // étoile → QCM
    qs.push(q("qcm", "Quel océan est marqué d'une étoile ★ ?", melange([o.nom, ...melange(noms.filter((x) => x !== o.nom)).slice(0, 3)]),
      o.nom, `L'étoile est sur l'océan ${o.court}, ${o.situation}.`, "Reconnaître les océans", "facile",
      { indice: "Regarde quels continents entourent l'étoile.", image_url: urlCarte({ region: "monde", continents: true, etoile: etoile(o) }), explications_choix: OCEANS.filter((x) => x !== o).map((x) => ({ choix: x.nom, pourquoi: `L'océan ${x.court} se trouve ${x.situation}.` })) }));
  }
  for (const o of melange(OCEANS).slice(0, 3)) { // étoile → écrit
    qs.push(q("ouverte", "Écris le nom de l'océan marqué d'une étoile ★.", [], o.nom, `C'est l'océan ${o.court}, ${o.situation}.`, "Reconnaître les océans", "moyen",
      { indice: `Regarde les continents autour de l'étoile. Le nom ${debut(o.court)}.`, image_url: urlCarte({ region: "monde", continents: true, etoile: etoile(o) }), reponses_acceptees: acc(o) }));
  }
  for (const o of melange(OCEANS).slice(0, 4)) { // positionner
    qs.push(q("carte", `Positionne l'océan ${o.court} : clique sur le bon cercle « ? ».`, [], o.nom, `L'océan ${o.court} se trouve ${o.situation}.`, "Situer les océans", "difficile",
      { indice: `Cet océan se trouve ${o.situation}.`, carte_url: urlCarte({ region: "monde", continents: true, oceansCliquables: true }), correction_url: urlCarte({ region: "monde", continents: true, etoile: o.positions[0] }) }));
  }
  qs.push(q("qcm", "Quel océan borde la côte est du Québec et des Maritimes ?", ["Océan Atlantique", "Océan Pacifique", "Océan Arctique", "Océan Indien"], "Océan Atlantique", "Le golfe du Saint-Laurent s'ouvre sur l'océan Atlantique.", "Le Canada et ses trois océans", "facile", { indice: "C'est l'océan qu'on traverse pour aller en Europe." }));
  qs.push(q("qcm", "Quel océan borde la Colombie-Britannique, à l'ouest du Canada ?", ["Océan Pacifique", "Océan Atlantique", "Océan Arctique", "Océan Austral"], "Océan Pacifique", "La côte ouest du Canada (Vancouver) donne sur l'océan Pacifique.", "Le Canada et ses trois océans", "facile", { indice: "C'est le plus grand océan du monde." }));
  qs.push(q("qcm", "Quel océan se trouve au nord du Canada ?", ["Océan Arctique", "Océan Atlantique", "Océan Pacifique", "Océan Indien"], "Océan Arctique", "Au nord du Canada, l'océan Arctique est couvert de glace une grande partie de l'année.", "Le Canada et ses trois océans", "facile", { indice: "Il entoure le pôle Nord et il est couvert de glace une grande partie de l'année." }));
  qs.push(q("qcm", "Quel est le plus grand océan du monde ?", ["Océan Pacifique", "Océan Atlantique", "Océan Indien", "Océan Arctique"], "Océan Pacifique", "Le Pacifique (environ 165 millions de km²) couvre près du tiers de la planète.", "La taille des océans", "facile", { indice: "Il apparaît des deux côtés d'un planisphère." }));
  qs.push(q("ouverte", "Quel océan entoure l'Antarctique, au pôle Sud ?", [], "Océan Austral", "L'océan Austral entoure le continent Antarctique.", "Situer les océans", "moyen", { indice: "Son nom veut dire « du sud » et commence par « Au… ».", reponses_acceptees: acc(OCEANS[3]) }));
  qs.push(q("ouverte", "Quel océan faut-il traverser pour aller du Québec à la France ?", [], "Océan Atlantique", "Entre l'Amérique du Nord et l'Europe, on traverse l'océan Atlantique.", "Situer les océans", "facile", { indice: "Il est entre l'Amérique du Nord et l'Europe.", reponses_acceptees: acc(OCEANS[1]) }));
  qs.push(q("ordre", "Classe les océans du plus grand au plus petit.", [], "", "Pacifique (165 M km²) → Atlantique (106) → Indien (70) → Austral (22) → Arctique (14).", "La taille des océans", "difficile",
    { indice: "Commence par celui qui apparaît des deux côtés de la carte.", elements: OCEANS.map((o) => `${o.nom} (${o.superficie})`) }));
  qs.at(-1).reponse = qs.at(-1).elements.join(" → ");
  qs.push(q("vrai_faux", "Le Canada est bordé par trois océans : l'Atlantique, le Pacifique et l'Arctique.", ["Vrai", "Faux"], "Vrai", "C'est vrai : d'où la devise du Canada, « D'un océan à l'autre ».", "Le Canada et ses trois océans", "moyen", { indice: "Pense aux côtes est, ouest et nord du Canada." }));
  qs.push(q("vrai_faux", "L'océan Indien baigne les côtes du Canada.", ["Vrai", "Faux"], "Faux", "L'océan Indien est entre l'Afrique, l'Asie et l'Australie, loin du Canada.", "Situer les océans", "facile", { indice: "L'océan Indien est entre l'Afrique, l'Asie et l'Australie." }));
  return {
    fiche: {
      titre: "Les océans du monde : cap sur le grand bleu !",
      intro: "Plus des deux tiers de la Terre sont couverts d'eau salée. Cette eau forme cinq grands océans, reliés entre eux. Apprenons à les nommer, à les situer et à les classer par taille !",
      notions: [
        { titre: "Les cinq océans", explication: "Les cinq océans sont : le Pacifique, l'Atlantique, l'Indien, l'Austral et l'Arctique. Ils sont tous reliés : on parle parfois d'un seul « océan mondial ».", exemple: "Sur la carte, repère les noms en bleu italique entre les continents.", visuel_svg: "", visuel_url: urlCarte({ region: "monde", continents: true }), audio: [] },
        { titre: "Où sont-ils ?", explication: OCEANS.map((o) => `• ${o.nom} : ${o.situation}.`).join("\n"), exemple: "Astuce : l'Atlantique est « notre » océan, celui qu'on traverse pour aller en Europe.", visuel_svg: "", visuel_url: urlCarte({ region: "monde" }), audio: [] },
        { titre: "Du plus grand au plus petit", explication: "Le Pacifique est de loin le plus grand : à lui seul, il est plus vaste que toutes les terres réunies. L'Arctique est le plus petit.", exemple: "Pacifique > Atlantique > Indien > Austral > Arctique.", visuel_svg: "", visuel_url: "", audio: [],
          tableau: [["Rang", "Océan", "Superficie"], ...OCEANS.map((o, i) => [String(i + 1), o.nom, o.superficie])] },
        { titre: "Le Canada et ses trois océans", explication: "Le Canada touche trois océans : l'Atlantique à l'est (Québec, Maritimes), le Pacifique à l'ouest (Colombie-Britannique) et l'Arctique au nord (Nunavut). Sa devise est « D'un océan à l'autre ».", exemple: "Le fleuve Saint-Laurent se jette dans le golfe du Saint-Laurent, puis dans l'océan Atlantique.", visuel_svg: "", visuel_url: urlCarte({ region: "ameriques", capitales: true }), audio: [] },
      ],
      astuces: ["PAIAA pour les classer par taille : Pacifique, Atlantique, Indien, Austral, Arctique.", "Arctique = pôle Nord, Austral = pôle Sud.", "Le Pacifique apparaît des deux côtés d'un planisphère : c'est le même océan !"],
      pieges: ["Croire que le Pacifique de gauche et celui de droite sont deux océans différents.", "Confondre Arctique (nord) et Antarctique (le continent du sud, entouré par l'océan Austral).", "Oublier l'océan Austral."],
    },
    questions: melange(qs),
  };
}

// ---------- Test personnalisé : zones, contenu (cartes / drapeaux / mix), format (QCM / écrit / positionner / mix) ----------
export const ZONES_GEO = ["Europe", "Amériques", "Afrique"];
export function genererTestGeo({ zones = ZONES_GEO, contenu = "mix", format = "mix", n = 10 } = {}) {
  zones = zones.filter((z) => ZONES_GEO.includes(z));
  if (!zones.length) zones = ZONES_GEO;
  const pool = melange(PAYS.filter((p) => zones.includes(p.zone)));
  const contenus = contenu === "cartes" ? ["carte"] : contenu === "drapeaux" ? ["drapeau"] : ["carte", "drapeau"];
  const formats = ["qcm", "ouverte", "positionner"].includes(format) ? [format] : ["qcm", "ouverte", "positionner"];
  const nom = (p) => p.nom;
  const sansArticle = (p) => de(p.nom).replace(/^(de la |de l'|du |des |de )/, "");
  const acceptes = (p) => [sansArticle(p), "la " + p.nom, "le " + p.nom, "les " + p.nom, "l'" + p.nom];
  const choixMemeZone = (p, champ) => melange([p, ...autres(PAYS.filter((x) => x.zone === p.zone), p, 3)]).map(champ);
  const pourquoiPays = (p, choix) => choix.filter((c) => c !== p.nom).map((c) => { const x = PAYS.find((y) => y.nom === c); return { choix: c, pourquoi: x ? `Ce n'est pas ça : ${x.nom} a pour capitale ${x.capitale}.` : "" }; });
  const carteZone = (p, o = {}) => urlCarte({ region: REGION_DE_ZONE[p.zone], ...o });
  const qs = [];
  for (let i = 0; i < n; i++) {
    const p = pool[i % pool.length];
    const c = contenus[i % contenus.length];
    const f = formats[Math.floor(Math.random() * formats.length)];
    const info = `${p.nom} (${continentDe(p)}) — capitale : ${p.capitale}.`;
    if (c === "drapeau") {
      if (f === "qcm") {
        const ch = choixMemeZone(p, nom);
        qs.push(q("qcm", "À quel pays appartient ce drapeau ?", ch, p.nom, `C'est le drapeau ${de(p.nom)}. ${info}`, `Les drapeaux ${DE_ZONE[p.zone]}`, "facile",
          { indice: indicePays(p), image_url: urlDrapeau(p.iso2), explications_choix: pourquoiPays(p, ch), correction_url: carteZone(p, { rouge: [p.iso2] }) }));
      } else if (f === "ouverte") {
        qs.push(q("ouverte", "Écris le nom du pays de ce drapeau.", [], p.nom, `C'est le drapeau ${de(p.nom)}. ${info}`, `Les drapeaux ${DE_ZONE[p.zone]}`, "moyen",
          { indice: `${indicePays(p)} Son nom ${debut(p.nom)}.`, image_url: urlDrapeau(p.iso2), reponses_acceptees: acceptes(p), correction_url: carteZone(p, { rouge: [p.iso2] }) }));
      } else {
        qs.push(q("carte", "Clique sur la carte le pays de ce drapeau.", [], p.nom, `C'est le drapeau ${de(p.nom)}. ${info}`, `Les drapeaux ${DE_ZONE[p.zone]}`, "difficile",
          { indice: `C'est le drapeau ${de(p.nom)} : cherche ${region(p)}.`, image_url: urlDrapeau(p.iso2), carte_url: carteZone(p, { interactif: true }), correction_url: carteZone(p, { rouge: [p.iso2] }) }));
      }
    } else {
      if (f === "qcm") {
        const capitale = Math.random() < 0.35;
        if (capitale) {
          const ch = choixMemeZone(p, (x) => x.capitale);
          qs.push(q("qcm", "Quelle est la capitale du pays en rouge ?", ch, p.capitale, `Le pays en rouge est ${p.nom}; sa capitale est ${p.capitale}.`, `Pays et capitales ${DE_ZONE[p.zone]}`, "moyen",
            { indice: `Le pays en rouge est ${avecArticle(p.nom)}.`, image_url: carteZone(p, { rouge: [p.iso2] }), explications_choix: ch.filter((x) => x !== p.capitale).map((x) => { const y = PAYS.find((z) => z.capitale === x); return { choix: x, pourquoi: y ? `${x} est la capitale ${de(y.nom)}.` : "" }; }) }));
        } else {
          const ch = choixMemeZone(p, nom);
          qs.push(q("qcm", "Sur la carte, quel pays est en rouge ?", ch, p.nom, `Le pays en rouge est ${info}`, `La carte ${DE_ZONE[p.zone]}`, "moyen",
            { indice: `Sa capitale est ${p.capitale}.`, image_url: carteZone(p, { rouge: [p.iso2] }), explications_choix: pourquoiPays(p, ch) }));
        }
      } else if (f === "ouverte") {
        const capitale = Math.random() < 0.35;
        qs.push(capitale
          ? q("ouverte", "Écris la capitale du pays en rouge.", [], p.capitale, `Le pays en rouge est ${p.nom}; sa capitale est ${p.capitale}.`, `Pays et capitales ${DE_ZONE[p.zone]}`, "difficile",
            { indice: `Le pays en rouge est ${avecArticle(p.nom)}; sa capitale ${debut(p.capitale)}.`, image_url: carteZone(p, { rouge: [p.iso2] }), reponses_acceptees: p.autres })
          : q("ouverte", "Écris le nom du pays en rouge sur la carte.", [], p.nom, `Le pays en rouge est ${info}`, `La carte ${DE_ZONE[p.zone]}`, "moyen",
            { indice: `Sa capitale est ${p.capitale}. Son nom ${debut(p.nom)}.`, image_url: carteZone(p, { rouge: [p.iso2] }), reponses_acceptees: acceptes(p) }));
      } else {
        qs.push(q("carte", `Positionne ${avecArticle(p.nom)} : clique sur ce pays sur la carte.`, [], p.nom, `${info}`, `La carte ${DE_ZONE[p.zone]}`, "difficile",
          { indice: `Cherche ${region(p)}. Sa capitale est ${p.capitale}.`, carte_url: carteZone(p, { interactif: true }), correction_url: carteZone(p, { rouge: [p.iso2] }) }));
      }
    }
  }
  return qs;
}
// « de la Bulgarie » → « la Bulgarie », « du Canada » → « le Canada », « des États-Unis » → « les États-Unis ».
const avecArticle = (nom) => de(nom).replace(/^de la /, "la ").replace(/^de l'/, "l'").replace(/^du /, "le ").replace(/^des /, "les ").replace(/^de /, "");
// Une leçon « drapeaux / capitales / pays » peut avoir un test personnalisé.
export const estLeconGeoPays = (matiere, sujet) => /g[ée]ograph|univers social/i.test(matiere || "") && /drapeau|capitale|pays|europ|am[ée]ri|afri/i.test(sujet || "");
export function zonesDuSujet(sujet = "") {
  const s = sujet.toLowerCase(), z = [];
  if (/europ/.test(s)) z.push("Europe");
  if (/am[ée]ri/.test(s)) z.push("Amériques");
  if (/afri/.test(s)) z.push("Afrique");
  return z.length ? z : ZONES_GEO;
}

// Choisit la leçon de géographie qui correspond au sujet (ou null si ce n'en est pas une).
export function banqueGeo(matiere, sujet = "") {
  const s = (sujet || "").toLowerCase();
  if (/oc[ée]an/.test(s) && !/contin/.test(s)) return banqueOceans();
  if (/contin|oc[ée]an|plan[ée]te|planisph|lire une carte/.test(s)) return banqueMonde();
  const zones = [];
  if (/europ/.test(s)) zones.push("Europe");
  if (/am[ée]ri/.test(s)) zones.push("Amériques");
  if (/afri/.test(s)) zones.push("Afrique");
  if (!zones.length && /drapeau|capitale|pays|carte|monde/.test(s)) zones.push("Europe", "Amériques", "Afrique");
  if (!zones.length && /g[ée]ograph/i.test(matiere || "") && !s) return banqueMonde();
  if (!zones.length) return null;
  const titre = zones.length > 1 ? "Drapeaux, pays et capitales du monde !" : `Drapeaux, pays et capitales ${DE_ZONE[zones[0]]} !`;
  return { fiche: ficheZones(zones, titre), questions: questionsZones(zones) };
}
