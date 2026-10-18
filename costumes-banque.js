// Leçons intégrées sur les costumes : « Les costumes à travers l'histoire » et « Les costumes traditionnels du monde ».
// Questions tirées au hasard à chaque appel, avec les illustrations de costumes.js (servies sur /costumes/<cle>.svg).
import { COSTUMES, CLES_HISTOIRE, CLES_MONDE, urlCostume, plancheCostumes } from "./costumes.js";

const q = (type, enonce, choix, reponse, explication, notion, difficulte = "moyen", extra = {}) =>
  ({ type, enonce, choix, indice: "", elements: [], image_svg: "", image_url: "", reponse, reponses_acceptees: [], tolerance: 0, audio: "", explication, demarche: "", explications_choix: [], notion, difficulte, ...extra });
const melange = (a) => { const t = [...a]; for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };
const pourquoi = (obj) => Object.entries(obj).map(([choix, p]) => ({ choix, pourquoi: p }));
const debut = (mot) => `commence par « ${mot.slice(0, 2)}… » (${mot.replace(/[^\p{L}]/gu, "").length} lettres)`;
const galerie = (cles, legende) => cles.map((k) => ({ img: urlCostume(k), legende: legende(COSTUMES[k]) }));
const an = (c) => (c.annee < 0 ? `vers ${-c.annee} av. J.-C.` : `vers ${c.annee}`);

// ---------- Histoire ----------
const GROUPES_HISTOIRE = [
  { titre: "Préhistoire et Antiquité", cles: ["prehistoire", "egypte", "grece", "rome"],
    explication: "Les premiers humains se protègent du froid avec des peaux de bêtes. Dans l'Antiquité, on porte surtout des vêtements drapés, faits d'un grand morceau de tissu : le lin blanc en Égypte, le chiton en Grèce, la toge à Rome (la bande pourpre est réservée aux personnages importants).",
    exemple: "Un tissu blanc drapé et des sandales ? Pense Antiquité ! Une couronne de laurier : la Grèce." },
  { titre: "Le Moyen Âge", cles: ["chevalier", "dame_moyenage"],
    explication: "Au Moyen Âge, le chevalier se protège avec une cotte de mailles (armure de petits anneaux de métal) couverte d'un surcot à ses couleurs. Les dames nobles portent de longues robes à manches larges et, à la fin du Moyen Âge, le hennin, un grand chapeau pointu avec un voile.",
    exemple: "La croix rouge sur le surcot rappelle les croisades." },
  { titre: "Les Premiers peuples et la Nouvelle-France", cles: ["iroquoien", "nf_femme", "nf_habitant"],
    explication: "Vers 1500, les Iroquoiens fabriquent leurs vêtements en peau de cerf : tunique et jambières à franges, mocassins. En Nouvelle-France, les habitants s'adaptent à l'hiver : capot de laine à capuchon, tuque, mitasses et bottes sauvages (inspirées des mocassins autochtones), et la célèbre ceinture fléchée. Les femmes portent une coiffe blanche, un fichu croisé, une jupe de laine et un tablier.",
    exemple: "La ceinture fléchée, tissée aux doigts, est devenue un symbole du Québec (on la voit au Carnaval de Québec)." },
  { titre: "De la Renaissance au XVIIIe siècle", cles: ["renaissance", "louis14", "xviii"],
    explication: "Renaissance (XVIe siècle) : fraise (collerette plissée), pourpoint rembourré, chausses bouffantes, béret à plume. Sous Louis XIV (XVIIe siècle) : immense perruque bouclée, justaucorps à boutons dorés, jabot de dentelle, talons rouges réservés à la noblesse. Au XVIIIe siècle : robes à paniers très larges et perruques poudrées très hautes.",
    exemple: "Talons rouges = noblesse de la cour de Louis XIV." },
  { titre: "Le XIXe siècle et les années 1920", cles: ["xix", "xix_dame", "annees20"],
    explication: "Au XIXe siècle, les hommes portent haut-de-forme, redingote et canne; les dames des robes à crinoline en forme de cloche et une capote nouée sous le menton. Dans les années 1920, la mode change beaucoup : robes droites plus courtes à franges, taille basse, cheveux coupés au carré et chapeau cloche.",
    exemple: "Cheveux au carré et chapeau cloche ? On est dans les « années folles » (1920)." },
];
const NOMMER_HISTOIRE = [
  ["nf_habitant", "Comment s'appelle la ceinture tissée de couleurs vives portée par les habitants de la Nouvelle-France ?", "ceinture fléchée", ["fléchée", "ceinture flechee"]],
  ["nf_habitant", "Comment s'appelle le bonnet de laine rouge porté par les habitants de la Nouvelle-France ?", "tuque", []],
  ["dame_moyenage", "Comment s'appelle le grand chapeau pointu porté par les dames à la fin du Moyen Âge ?", "hennin", []],
  ["renaissance", "Comment s'appelle la collerette blanche plissée portée à la Renaissance ?", "fraise", []],
  ["rome", "Quel vêtement drapé portaient les citoyens de la Rome antique ?", "toge", ["la toge"]],
  ["xviii", "Comment s'appelle la robe très large sur les côtés portée au XVIIIe siècle ?", "robe à paniers", ["paniers", "robe a panier"]],
  ["xix", "Comment s'appelle le chapeau haut et cylindrique des hommes du XIXe siècle ?", "haut-de-forme", ["haut de forme", "chapeau haut-de-forme"]],
  ["chevalier", "Comment s'appelle l'armure faite de petits anneaux de métal du chevalier ?", "cotte de mailles", ["cote de maille", "cotte de maille"]],
  ["annees20", "Comment s'appelle le chapeau en forme de cloche à la mode dans les années 1920 ?", "chapeau cloche", ["cloche"]],
  ["iroquoien", "Comment s'appellent les chaussures souples en peau portées par les Iroquoiens ?", "mocassins", ["mocassin"]],
  ["louis14", "Sous Louis XIV, de quelle couleur sont les talons des chaussures de la noblesse ?", "rouge", ["rouges"]],
];
export function banqueCostumesHistoire() {
  const avant = CLES_HISTOIRE.filter((k) => COSTUMES[k].annee < 1520), apres = CLES_HISTOIRE.filter((k) => COSTUMES[k].annee >= 1520);
  const notions = [
    { titre: "Lire l'histoire dans les vêtements", explication: "Les vêtements changent avec les époques, les matériaux disponibles, le climat et le rang social. En observant un costume (coiffure, chapeau, forme de la robe, chaussures, accessoires), on peut deviner à quelle époque vit la personne. Voici la frise des costumes, de la Préhistoire à 1500.",
      exemple: "Méthode : regarde d'abord le chapeau ou la coiffure, puis la forme du vêtement, puis les chaussures.", visuel_svg: plancheCostumes(avant, { legende: (c) => `${c.nom.replace(/ \(.*\)/, "")} (${an(c)})`, avecFleche: true }), visuel_url: "", audio: [] },
    { titre: "La frise des costumes (de 1500 à 1925)", explication: "Suite de la frise : de la Renaissance aux années 1920, en passant par la Nouvelle-France.",
      exemple: "Plus on avance dans le temps, plus les vêtements deviennent simples et pratiques.", visuel_svg: plancheCostumes(apres, { legende: (c) => `${c.nom.replace(/ \(.*\)/, "")} (${an(c)})`, avecFleche: true }), visuel_url: "", audio: [] },
    ...GROUPES_HISTOIRE.map((g) => ({ titre: g.titre, explication: g.explication + "\n" + g.cles.map((k) => `• ${COSTUMES[k].nom} (${COSTUMES[k].periode}) : ${COSTUMES[k].elements}.`).join("\n"),
      exemple: g.exemple, visuel_svg: "", visuel_url: "", audio: [], galerie: galerie(g.cles, (c) => `${c.nom} · ${c.periode}`) })),
  ];
  const groupeDe = (k) => GROUPES_HISTOIRE.find((g) => g.cles.includes(k))?.titre || "Lire l'histoire dans les vêtements";
  const questions = [];
  for (const k of CLES_HISTOIRE) {
    const c = COSTUMES[k];
    const autres = melange(CLES_HISTOIRE.filter((x) => x !== k && Math.abs(COSTUMES[x].annee - c.annee) > 60)).slice(0, 3);
    questions.push(q("qcm", "Observe ce costume. À quelle époque (ou à quel peuple) appartient-il ?", melange([c.nom, ...autres.map((x) => COSTUMES[x].nom)]), c.nom,
      `C'est ${c.nom} (${c.periode}) : on reconnaît ${c.elements}.`, groupeDe(k), c.annee < 0 || c.annee > 1900 ? "facile" : "moyen",
      { image_url: urlCostume(k), indice: `Regarde surtout : ${c.elements.split(",")[0]}.`, explications_choix: pourquoi(Object.fromEntries(autres.map((x) => [COSTUMES[x].nom, `${COSTUMES[x].nom} (${COSTUMES[x].periode}) : ${COSTUMES[x].elements}.`]))) }));
  }
  for (const [k, enonce, rep, acc] of NOMMER_HISTOIRE)
    questions.push(q("ouverte", enonce, [], rep, `Réponse : ${rep}. ${COSTUMES[k].nom} (${COSTUMES[k].periode}) : ${COSTUMES[k].elements}.`, groupeDe(k), "moyen",
      { image_url: urlCostume(k), reponses_acceptees: acc, indice: `Le mot ${debut(rep)}.` }));
  for (let f = 0; f < 3; f++) {
    const choisis = melange(CLES_HISTOIRE).slice(0, 5).sort((a, b) => COSTUMES[a].annee - COSTUMES[b].annee);
    questions.push(q("ordre", "Frise chronologique : place ces costumes du plus ancien au plus récent.", [], choisis.map((k) => `${COSTUMES[k].elements.split(",")[0]} (${an(COSTUMES[k])})`).join(" → "),
      choisis.map((k) => `${COSTUMES[k].nom} (${an(COSTUMES[k])})`).join(" → ") + ".", "Lire l'histoire dans les vêtements", "difficile",
      { elements: choisis.map((k) => `${COSTUMES[k].elements.split(",")[0]} (${an(COSTUMES[k])})`), indice: "Commence par le vêtement le plus simple (peaux, tissus drapés), puis avance dans le temps." }));
  }
  const VF = ["Vrai", "Faux"];
  questions.push(
    q("vrai_faux", "Les bottes sauvages des habitants de la Nouvelle-France s'inspirent des mocassins des Premiers peuples.", VF, "Vrai", "Oui : les colons ont adopté les vêtements autochtones, mieux adaptés à l'hiver et à la forêt.", "Les Premiers peuples et la Nouvelle-France", "moyen", { image_url: urlCostume("nf_habitant"), indice: "Pense aux échanges entre colons et Autochtones." }),
    q("vrai_faux", "La fraise (collerette plissée) est typique des années 1920.", VF, "Faux", "La fraise est typique de la Renaissance (XVIe siècle). Les années 1920, c'est la robe droite à franges et le chapeau cloche.", "De la Renaissance au XVIIIe siècle", "facile", { image_url: urlCostume("renaissance"), indice: "La fraise date d'environ 400 ans plus tôt." }),
    q("vrai_faux", "Dans l'Antiquité, beaucoup de vêtements étaient faits d'un grand tissu drapé autour du corps.", VF, "Vrai", "Oui : chiton grec, toge romaine, robe de lin égyptienne… on drape le tissu au lieu de le coudre en vêtement ajusté.", "Préhistoire et Antiquité", "facile", { image_url: urlCostume("grece"), indice: "Regarde comment le tissu tombe sur l'épaule." }),
  );
  return {
    fiche: {
      titre: "Les costumes à travers l'histoire",
      intro: "Les vêtements racontent l'histoire ! De la Préhistoire aux années 1920, en passant par les Premiers peuples et la Nouvelle-France, apprends à reconnaître une époque grâce à son costume.",
      notions,
      astuces: ["Commence par la tête : hennin, fraise, perruque, tuque, haut-de-forme… le chapeau trahit souvent l'époque.", "Tissu drapé = Antiquité; fraise = Renaissance; perruque géante = Louis XIV; robe à paniers = XVIIIe; chapeau cloche = 1920.", "Ceinture fléchée + tuque + capot = Nouvelle-France."],
      pieges: ["Confondre la perruque de Louis XIV (XVIIe, bouclée et brune) avec la perruque poudrée du XVIIIe (blanche et très haute).", "Croire que le chevalier vit à la Renaissance : il appartient au Moyen Âge.", "Oublier que les Premiers peuples habitaient le territoire bien avant la Nouvelle-France."],
    },
    questions: melange(questions),
  };
}

// ---------- Costumes traditionnels du monde ----------
const CONTINENTS = [["Asie", "en Asie"], ["Europe", "en Europe"], ["Afrique", "en Afrique"], ["Amérique", "en Amérique"]];
const OBJET = { mexique: "ce costume porté par les musiciens mariachis", inuit: "cette parka à capuchon bordée de fourrure", ecosse: "cette jupe à carreaux", ghana: "ce tissu à bandes colorées",
  maasai: "cette étoffe rouge drapée", emirats: "cette longue robe blanche", paysbas: "ces chaussures de bois", perou: "ce grand vêtement de laine porté par-dessus les habits", vietnam: "cette longue tunique fendue sur les côtés" };
export function banqueCostumesMonde() {
  const notions = [
    { titre: "Les costumes traditionnels", explication: "Un costume traditionnel est porté lors des fêtes, des mariages ou des cérémonies. Il raconte l'histoire, le climat et les savoir-faire d'un peuple : la laine dans les montagnes froides des Andes, la fourrure dans l'Arctique, des tissus légers et amples dans les pays chauds.",
      exemple: "Aujourd'hui, la plupart des gens portent des vêtements modernes au quotidien, et gardent le costume traditionnel pour les grandes occasions.", visuel_svg: plancheCostumes(melange(CLES_MONDE).slice(0, 6)), visuel_url: "", audio: [] },
    ...CONTINENTS.map(([cont, en]) => {
      const cles = CLES_MONDE.filter((k) => COSTUMES[k].continent === cont);
      return { titre: `Costumes traditionnels ${en === "en Amérique" ? "des Amériques" : en.replace("en ", "d'").replace("d'Europe", "d'Europe")}`,
        explication: cles.map((k) => `• ${COSTUMES[k].nom} : ${COSTUMES[k].vetement} (${COSTUMES[k].elements}).`).join("\n"),
        exemple: cont === "Amérique" ? "Au Canada, l'amauti inuit a un grand capuchon où la maman peut porter son bébé au chaud." : cont === "Asie" ? "Au Japon, on porte le kimono pour les fêtes, comme la fête de la majorité à 20 ans." : cont === "Afrique" ? "Au Ghana, chaque motif de kente a un nom et une signification." : "En Écosse, chaque famille (clan) a son propre tartan.",
        visuel_svg: "", visuel_url: "", audio: [], galerie: galerie(cles, (c) => `${c.nom} · ${c.vetement}`) };
    }),
  ];
  const questions = [];
  for (const k of CLES_MONDE) {
    const c = COSTUMES[k];
    const cont = CONTINENTS.find(([x]) => x === c.continent);
    const autres = melange(CLES_MONDE.filter((x) => x !== k)).slice(0, 3);
    const notion = notions.find((n) => n.galerie?.some((g) => g.img === urlCostume(k)))?.titre || "Les costumes traditionnels";
    questions.push(q("qcm", "Ce costume traditionnel vient de quel pays ?", melange([c.nom, ...autres.map((x) => COSTUMES[x].nom)]), c.nom,
      `C'est le costume traditionnel : ${c.nom} — ${c.vetement} (${c.elements}).`, notion, "facile",
      { image_url: urlCostume(k), indice: `Ce costume se porte ${cont[1]}.`, explications_choix: pourquoi(Object.fromEntries(autres.map((x) => [COSTUMES[x].nom, `${COSTUMES[x].nom} : ${COSTUMES[x].vetement} (${COSTUMES[x].elements}).`]))) }));
    const rep = c.autres[0] === "ao dai" ? "áo dài" : c.autres[0];
    questions.push(q("ouverte", `Comment s'appelle ${OBJET[k] || "ce vêtement traditionnel"} (${c.nom}) ?`, [], rep,
      `Réponse : ${c.vetement}. ${c.elements[0].toUpperCase() + c.elements.slice(1)}.`, notion, "moyen",
      { image_url: urlCostume(k), reponses_acceptees: c.autres, indice: `Le mot ${debut(rep)}.` }));
    questions.push(q("qcm", "Sur quel continent porte-t-on ce costume traditionnel ?", CONTINENTS.map(([x]) => x), c.continent,
      `${c.nom} se trouve ${cont[1]} : ${c.vetement}.`, notion, "facile", { image_url: urlCostume(k), indice: "Pense au climat et aux pays voisins." }));
  }
  const VF = ["Vrai", "Faux"];
  for (const k of melange(CLES_MONDE).slice(0, 5)) {
    const c = COSTUMES[k], vrai = Math.random() < 0.5, autre = COSTUMES[melange(CLES_MONDE.filter((x) => x !== k))[0]];
    questions.push(q("vrai_faux", `Le costume « ${c.vetement} » est un costume traditionnel de ${vrai ? c.nom : autre.nom}.`, VF, vrai ? "Vrai" : "Faux",
      vrai ? `Oui : ${c.vetement} → ${c.nom}.` : `Non : ${c.vetement} vient de ${c.nom}; ${autre.nom} a ${autre.vetement}.`, "Les costumes traditionnels", "moyen", { indice: `Ce costume se porte ${CONTINENTS.find(([x]) => x === c.continent)[1]}.` }));
  }
  return {
    fiche: {
      titre: "Les costumes traditionnels du monde",
      intro: "Fais le tour du monde en costumes ! Kimono, sari, kilt, amauti, kente… Chaque costume traditionnel raconte le climat, l'histoire et la culture d'un peuple. Apprends à les reconnaître et à les situer.",
      notions,
      astuces: ["Associe chaque costume à un pays et à un continent : kimono → Japon → Asie.", "Le climat aide : fourrure = Arctique, laine colorée = montagnes des Andes, tissus amples = pays chauds.", "Retiens un détail par costume : obi (Japon), sporran (Écosse), ceinture rouge… "],
      pieges: ["Confondre le kimono (Japon) et le qipao (Chine) : le kimono a de larges manches et un obi; le qipao est ajusté avec un col montant.", "Confondre le hanbok (Corée, jupe très haute et ample) et le kimono.", "Croire qu'un costume traditionnel est porté tous les jours : c'est surtout pour les fêtes."],
    },
    questions: melange(questions),
  };
}
// Le sujet parle-t-il de costumes ? → la bonne leçon (null sinon)
export function banqueCostumes(matiere, sujet = "") {
  const s = String(sujet || "").toLowerCase();
  if (!/costume|tenue|v[êe]tement|habit|mode|kimono|parure/.test(s)) return null;
  return /monde|tradition|cultur|pays|peuples du monde/.test(s) ? banqueCostumesMonde() : banqueCostumesHistoire();
}
