// Leçon intégrée d'histoire (Renaissance, humanisme, tenues d'époque), avec ses illustrations SVG. Utilisée sans clé API.
import { svgCostume, plancheCostumes } from "./costumes.js";
const q = (type, enonce, choix, reponse, explication, notion, difficulte = "moyen", extra = {}) =>
  ({ type, enonce, choix, indice: "", elements: [], image_svg: "", reponse, reponses_acceptees: [], tolerance: 0, audio: "", explication, demarche: "", explications_choix: [], notion, difficulte, ...extra });
const VF = ["Vrai", "Faux"];
const ordre = (enonce, elements, explication, notion, difficulte = "moyen") =>
  q("ordre", enonce, [], elements.join(" → "), explication, notion, difficulte, { elements });
const pourquoi = (obj) => Object.entries(obj).map(([choix, p]) => ({ choix, pourquoi: p }));
const svg = (contenu, h = 220, w = 400) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial" font-size="14"><rect width="${w}" height="${h}" fill="#fff"/>${contenu}</svg>`;
const t = (x, y, txt, extra = "") => `<text x="${x}" y="${y}" ${extra}>${txt}</text>`;
const PEAU = "#ffe3c8", TRAIT = 'stroke="#111" stroke-width="2.5"';

// ---------- Tenues d'époque : personnages de costumes.js ----------
const CLE_TENUE = { moyenage: "dame_moyenage", renaissance: "renaissance", louis14: "louis14", xviii: "xviii", xix: "xix", annees20: "annees20" };
// Image de question : une seule tenue, sans légende.
const imageTenue = (cle) => svgCostume(CLE_TENUE[cle]);
const FRISE_TENUES = plancheCostumes(Object.values(CLE_TENUE), { legende: (c) => c.periode.replace("vers ", ""), avecFleche: true });

const EVTS = [[1450, "Imprimerie (Gutenberg)"], [1453, "Chute de Constantinople"], [1492, "Colomb en Amérique"], [1503, "La Joconde"], [1517, "Réforme (Luther)"], [1534, "Cartier au Canada"], [1543, "Copernic"]];
const xAn = (a) => 20 + ((a - 1440) / 110) * 360;
const FRISE_RENAISSANCE = svg(`<rect x="20" y="104" width="360" height="12" fill="#ffd60a" ${TRAIT}/>`
  + EVTS.map(([a, e], i) => `<line x1="${xAn(a)}" y1="${i % 2 ? 116 : 104}" x2="${xAn(a)}" y2="${i % 2 ? 150 : 70}" stroke="#e63946" stroke-width="2"/>`
    + t(xAn(a), i % 2 ? 166 : 62, a, 'text-anchor="middle" font-weight="bold" font-size="13"') + t(xAn(a), i % 2 ? 182 : 46, e, 'text-anchor="middle" font-size="11"')).join("")
  + t(200, 20, "La Renaissance : XVe et XVIe siècles", 'text-anchor="middle" font-weight="bold" font-size="16"'), 200);
const HUMANISME = svg(`<circle cx="200" cy="110" r="44" fill="#ffd60a" ${TRAIT}/>` + t(200, 106, "L'ÊTRE", 'text-anchor="middle" font-weight="bold" font-size="16"') + t(200, 124, "HUMAIN", 'text-anchor="middle" font-weight="bold" font-size="16"')
  + [["Textes de l'Antiquité", 70, 36], ["Raison et esprit critique", 330, 36], ["Éducation pour tous", 70, 190], ["Imprimerie : les idées voyagent", 330, 190]].map(([l, x, y]) =>
    `<rect x="${x - 72}" y="${y - 16}" width="144" height="26" fill="#e8f0ff" stroke="#111" stroke-width="2"/>` + t(x, y + 2, l, 'text-anchor="middle" font-size="11.5" font-weight="bold"')
    + `<line x1="${x < 200 ? x + 50 : x - 50}" y1="${y < 110 ? y + 12 : y - 18}" x2="${x < 200 ? 165 : 235}" y2="${y < 110 ? 85 : 135}" stroke="#e63946" stroke-width="3"/>`).join(""));
const PERSPECTIVE = svg(`<rect x="40" y="20" width="320" height="180" fill="#f3f0e6" ${TRAIT}/>`
  + [[40, 20], [360, 20], [40, 200], [360, 200], [40, 110], [360, 110], [140, 200], [260, 200]].map(([x, y]) => `<line x1="${x}" y1="${y}" x2="200" y2="96" stroke="#2b6cff" stroke-width="1.5"/>`).join("")
  + `<circle cx="200" cy="96" r="6" fill="#e63946"/>` + t(212, 90, "point de fuite", 'font-weight="bold" fill="#e63946"')
  + `<rect x="150" y="70" width="100" height="70" fill="none" stroke="#111" stroke-width="2"/>` + t(200, 216, "La perspective donne l'illusion de la profondeur", 'text-anchor="middle" font-size="12"'), 222);

export const RENAISSANCE = {
  fiche: {
    titre: "Renaissance : le grand réveil de l'Europe !",
    intro: "Aux XVe et XVIe siècles, l'Europe vit une période de renouveau qu'on appelle la Renaissance. Elle commence en Italie : on redécouvre l'Antiquité, les arts et les sciences progressent, l'imprimerie diffuse les idées, et les humanistes placent l'être humain au centre de leurs réflexions. Les tenues vestimentaires changent aussi selon les époques !",
    notions: [
      { titre: "La Renaissance, c'est quoi ?", explication: "La Renaissance est une période (XVe et XVIe siècles) qui suit le Moyen Âge. Elle naît en Italie, dans des villes riches comme Florence, puis gagne toute l'Europe. On « fait renaître » les savoirs de l'Antiquité grecque et romaine.", exemple: "Des mécènes comme les Médicis, à Florence, payent des artistes pour créer des œuvres.", visuel_svg: FRISE_RENAISSANCE, audio: [] },
      { titre: "L'humanisme", explication: "L'humanisme est un courant de pensée de la Renaissance. Les humanistes croient en l'être humain, en sa raison et en l'éducation. Ils relisent les textes anciens et développent l'esprit critique. Grands humanistes : Érasme (L'Éloge de la folie), Thomas More (L'Utopie), Rabelais, Montaigne.", exemple: "Érasme se moque des abus de son époque et défend l'éducation et la paix.", visuel_svg: HUMANISME, audio: [] },
      { titre: "L'imprimerie de Gutenberg", explication: "Vers 1450, Gutenberg met au point l'imprimerie à caractères mobiles. Les livres deviennent moins chers et plus nombreux : les idées des humanistes voyagent beaucoup plus vite partout en Europe.", exemple: "Avant, un moine copiait un livre à la main pendant des mois. Avec l'imprimerie, on produit des centaines d'exemplaires.", visuel_svg: "", audio: [] },
      { titre: "Les arts : la perspective", explication: "Les artistes de la Renaissance observent la nature et le corps humain. Ils utilisent la perspective (lignes qui se rejoignent vers un point de fuite) pour donner l'illusion de la profondeur. Grands artistes : Léonard de Vinci (La Joconde), Michel-Ange (plafond de la chapelle Sixtine), Raphaël.", exemple: "Dans La Cène de Léonard de Vinci, toutes les lignes du décor convergent vers la tête de Jésus.", visuel_svg: PERSPECTIVE, audio: [] },
      { titre: "Sciences et grandes découvertes", explication: "On explore et on observe : Christophe Colomb arrive en Amérique (1492), Jacques Cartier explore le Canada (1534), Copernic affirme que la Terre tourne autour du Soleil (1543).", exemple: "Le premier voyage de Jacques Cartier, en 1534, mène à la Gaspésie : c'est un lien direct entre la Renaissance et l'histoire du Québec.", visuel_svg: FRISE_RENAISSANCE, audio: [] },
      { titre: "Les tenues à travers les époques", explication: "On peut reconnaître une époque à ses vêtements :\n• Moyen Âge : robe longue, hennin (chapeau pointu).\n• Renaissance : fraise (collerette), pourpoint, chausses bouffantes, béret à plume.\n• XVIIe siècle (Louis XIV) : grande perruque bouclée, justaucorps, talons rouges.\n• XVIIIe siècle : robe à paniers très large, perruque poudrée.\n• XIXe siècle : haut-de-forme, redingote.\n• Années 1920 : robe droite courte, chapeau cloche.", exemple: "Une collerette blanche plissée autour du cou ? C'est une fraise : pense Renaissance !", visuel_svg: FRISE_TENUES, audio: [] },
    ],
    astuces: ["Renaissance = re-naissance de l'Antiquité.", "Humanisme = l'Humain au centre.", "Pour une frise : repère d'abord la date la plus ancienne, puis avance dans le temps.", "Fraise + pourpoint = Renaissance ; perruque géante + talons rouges = Louis XIV."],
    pieges: ["Confondre le Moyen Âge (avant) et la Renaissance (après).", "Croire que la Renaissance commence en France : elle naît en Italie.", "Placer Colomb (1492) avant l'imprimerie (vers 1450) sur une frise."],
  },
  questions: [
    q("qcm", "Observe la tenue. À quelle époque appartient-elle ?", ["Moyen Âge", "Renaissance (XVIe siècle)", "Époque de Louis XIV (XVIIe siècle)", "Années 1920"], "Renaissance (XVIe siècle)", "La fraise (collerette blanche), le pourpoint et les chausses bouffantes sont typiques de la Renaissance.", "Les tenues à travers les époques", "facile",
      { image_svg: imageTenue("renaissance"), explications_choix: pourquoi({ "Moyen Âge": "Au Moyen Âge, on porte surtout des robes longues; la fraise n'existe pas encore.", "Époque de Louis XIV (XVIIe siècle)": "Sous Louis XIV, on reconnaît la grande perruque bouclée et le long justaucorps.", "Années 1920": "En 1920, les vêtements sont simples et droits, sans fraise ni chausses bouffantes." }) }),
    q("qcm", "Observe la tenue. À quelle époque appartient-elle ?", ["Moyen Âge", "Renaissance (XVIe siècle)", "XIXe siècle", "XVIIIe siècle"], "Moyen Âge", "Le hennin (chapeau en cône pointu avec un voile) et la robe longue sont typiques de la fin du Moyen Âge.", "Les tenues à travers les époques", "facile",
      { image_svg: imageTenue("moyenage"), explications_choix: pourquoi({ "Renaissance (XVIe siècle)": "À la Renaissance, le hennin disparaît et la fraise apparaît.", "XIXe siècle": "Au XIXe siècle, on porte haut-de-forme et redingote, pas de hennin.", "XVIIIe siècle": "Au XVIIIe, les robes sont gonflées par des paniers très larges." }) }),
    q("qcm", "Observe la tenue. À quelle époque appartient-elle ?", ["XVIIIe siècle", "Années 1920", "Moyen Âge", "Renaissance (XVIe siècle)"], "XVIIIe siècle", "La robe à paniers, très large sur les côtés, et la haute perruque poudrée sont typiques du XVIIIe siècle (époque de Marie-Antoinette).", "Les tenues à travers les époques", "moyen",
      { image_svg: imageTenue("xviii"), explications_choix: pourquoi({ "Années 1920": "Les robes des années 1920 sont droites et courtes, pas larges.", "Moyen Âge": "La robe médiévale est longue mais pas gonflée par des paniers.", "Renaissance (XVIe siècle)": "La Renaissance a la fraise, mais pas ces robes immenses ni les perruques poudrées." }) }),
    q("qcm", "Observe la tenue. À quelle époque appartient-elle ?", ["XIXe siècle", "Renaissance (XVIe siècle)", "Époque de Louis XIV (XVIIe siècle)", "Moyen Âge"], "XIXe siècle", "Le haut-de-forme, la redingote et la canne sont typiques du XIXe siècle.", "Les tenues à travers les époques", "facile",
      { image_svg: imageTenue("xix"), explications_choix: pourquoi({ "Renaissance (XVIe siècle)": "À la Renaissance, on porte un béret à plume et une fraise, pas un haut-de-forme.", "Époque de Louis XIV (XVIIe siècle)": "Sous Louis XIV, les hommes ont une grande perruque bouclée et des talons rouges.", "Moyen Âge": "Le haut-de-forme n'existe pas au Moyen Âge." }) }),
    q("qcm", "Observe la tenue. À quelle époque appartient-elle ?", ["Époque de Louis XIV (XVIIe siècle)", "XIXe siècle", "Années 1920", "Moyen Âge"], "Époque de Louis XIV (XVIIe siècle)", "La grande perruque bouclée, le long justaucorps à boutons et les talons rouges : c'est la mode de la cour de Louis XIV.", "Les tenues à travers les époques", "moyen",
      { image_svg: imageTenue("louis14"), explications_choix: pourquoi({ "XIXe siècle": "Au XIXe, on porte le haut-de-forme et la redingote, et plus de perruques.", "Années 1920": "En 1920, les cheveux sont courts et les vêtements simples.", "Moyen Âge": "Les perruques et justaucorps apparaissent bien après le Moyen Âge." }) }),
    ordre("Frise chronologique : place ces tenues de la plus ancienne à la plus récente.", ["Robe longue et hennin pointu", "Fraise et pourpoint", "Grande perruque bouclée et justaucorps", "Haut-de-forme et redingote", "Robe droite courte et chapeau cloche"],
      "Moyen Âge (hennin) → Renaissance (fraise) → XVIIe siècle (perruque de Louis XIV) → XIXe siècle (haut-de-forme) → années 1920 (chapeau cloche).", "Les tenues à travers les époques", "difficile"),
    ordre("Frise chronologique : place ces événements dans l'ordre.", ["Imprimerie de Gutenberg (vers 1450)", "Colomb arrive en Amérique (1492)", "Jacques Cartier au Canada (1534)", "Copernic : la Terre tourne autour du Soleil (1543)"],
      "Vers 1450 → 1492 → 1534 → 1543. On classe toujours de la date la plus petite (la plus ancienne) à la plus grande.", "Sciences et grandes découvertes"),
    ordre("Frise chronologique : remets ces événements dans l'ordre.", ["Chute de Constantinople (1453)", "Léonard de Vinci peint La Joconde (vers 1503)", "Luther lance la Réforme (1517)", "Copernic publie sa théorie (1543)"],
      "1453 → vers 1503 → 1517 → 1543.", "La Renaissance, c'est quoi ?", "difficile"),
    q("qcm", "Dans quel pays la Renaissance commence-t-elle ?", ["Italie", "France", "Angleterre", "Espagne"], "Italie", "La Renaissance naît en Italie, notamment à Florence, grâce à de riches mécènes comme les Médicis.", "La Renaissance, c'est quoi ?", "facile",
      { explications_choix: pourquoi({ France: "La France adopte la Renaissance plus tard, notamment sous François Ier, qui invite Léonard de Vinci.", Angleterre: "L'Angleterre la connaît après l'Italie.", Espagne: "L'Espagne la connaît aussi, mais après l'Italie." }) }),
    q("qcm", "Que place l'humanisme au centre de ses réflexions ?", ["L'être humain", "Le roi", "La guerre", "Les châteaux forts"], "L'être humain", "Humanisme vient d'« humain » : les humanistes croient en la raison, en l'éducation et en la valeur de chaque personne.", "L'humanisme", "facile"),
    q("ouverte", "Quel artiste de la Renaissance a peint La Joconde ?", [], "Léonard de Vinci", "C'est Léonard de Vinci, peintre, inventeur et scientifique italien, vers 1503.", "Les arts : la perspective", "facile", { reponses_acceptees: ["de vinci", "leonard de vinci", "léonard", "vinci", "da vinci", "leonardo da vinci"] }),
    q("vrai_faux", "L'imprimerie a aidé à diffuser rapidement les idées des humanistes.", VF, "Vrai", "Les livres imprimés sont moins chers et plus nombreux : les idées voyagent partout en Europe.", "L'imprimerie de Gutenberg", "facile"),
    q("qcm", "Quel humaniste a écrit L'Éloge de la folie ?", ["Érasme", "Copernic", "Michel-Ange", "Christophe Colomb"], "Érasme", "Érasme, grand humaniste, y critique avec humour les abus de son époque.", "L'humanisme"),
    q("qcm", "Quelle technique les peintres de la Renaissance utilisent-ils pour donner l'impression de profondeur ?", ["La perspective", "La mosaïque", "Le vitrail", "La gravure sur bois"], "La perspective", "Avec la perspective, les lignes se rejoignent vers un point de fuite : le tableau semble avoir de la profondeur.", "Les arts : la perspective", "moyen", { image_svg: PERSPECTIVE }),
    q("ouverte", "En quel siècle se déroule surtout la Renaissance en Europe ? (ex. : XIIe)", [], "XVIe", "La Renaissance s'épanouit surtout au XVIe siècle (années 1500), après ses débuts en Italie au XVe siècle.", "La Renaissance, c'est quoi ?", "moyen", { reponses_acceptees: ["16e", "16e siècle", "xvie siècle", "16", "le xvie", "le 16e", "xvi"] }),
    q("vrai_faux", "La Renaissance vient avant le Moyen Âge.", VF, "Faux", "C'est l'inverse : le Moyen Âge vient d'abord, puis la Renaissance (XVe-XVIe siècles).", "La Renaissance, c'est quoi ?", "facile"),
  ],
};
