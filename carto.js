// Cartes « atlas scolaire » générées en SVG à partir des contours réels des pays (Natural Earth, via world-atlas) :
// pays en couleurs pastel, mer bleue quadrillée, capitales, titre en cartouche, rose des vents, échelle et légende.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { geoPath, geoNaturalEarth1, geoConicConformal, geoAzimuthalEqualArea, geoGraticule10, geoCentroid, geoArea } from "d3-geo";
import { feature, neighbors } from "topojson-client";
import { PAYS, PAYS_PAR_ISO } from "./geo-donnees.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const lire = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, "node_modules/world-atlas", f), "utf8"));
const TOPO_50 = lire("countries-50m.json");
const MONDE_50 = feature(TOPO_50, TOPO_50.objects.countries).features;
const MONDE_110 = feature(lire("countries-110m.json"), lire("countries-110m.json").objects.countries).features;
const PAR_NUM = Object.fromEntries(PAYS.map((p) => [p.num, p]));

// ---------- Continents (pour la carte du monde) ----------
const MOYEN_ORIENT = new Set(["682", "887", "512", "784", "634", "414", "048", "376", "400", "422", "760", "368", "275", "364"]);
const EURASIE_ASIE = new Set(["792", "196", "268", "051", "031", "643"]); // Turquie, Chypre, Caucase, Russie (surtout en Asie)
export function continentDe(f) {
  if (f.id === "010") return "Antarctique";
  const [lon, lat] = geoCentroid(f);
  if (lon < -25 || f.id === "304") return lat < 12 && lon > -82 && f.id !== "304" ? "Amérique du Sud" : "Amérique du Nord";
  if (lat > 35 && lon < 45 && !EURASIE_ASIE.has(f.id)) return "Europe";
  if (lat < 37 && lat > -36 && lon > -20 && lon < 52 && !MOYEN_ORIENT.has(f.id)) return "Afrique";
  if ((lat < -8 && lon > 110) || lon > 160 || lon < -150) return "Océanie";
  return "Asie";
}
export const COUL_CONTINENT = { "Amérique du Nord": "#f9e79f", "Amérique du Sud": "#abebc6", Europe: "#aed6f1", Afrique: "#f5cba7", Asie: "#f7dc6f", Océanie: "#d7bde2", Antarctique: "#f4f6f7" };

// Couleurs pastel des pays (comme dans un atlas) : coloration de graphe, deux pays voisins n'ont jamais la même couleur.
const PASTELS = ["#f6d7a7", "#f9f0a7", "#cfe8b8", "#f6c9d0", "#dccff0", "#d6eadf"];
const COULEUR_DE = (() => {
  const geoms = TOPO_50.objects.countries.geometries, voisins = neighbors(geoms), couleur = new Array(geoms.length);
  const ordre = geoms.map((_, i) => i).sort((a, b) => voisins[b].length - voisins[a].length);
  for (const i of ordre) {
    const prises = new Set(voisins[i].map((j) => couleur[j]));
    couleur[i] = PASTELS.findIndex((_, k) => !prises.has(k));
    if (couleur[i] < 0) couleur[i] = i % PASTELS.length;
  }
  return Object.fromEntries(geoms.map((g, i) => [g.id, PASTELS[couleur[i]]]));
})();
const couleurPays = (id) => COULEUR_DE[id] || PASTELS[0];
const AIRE = Object.fromEntries(MONDE_50.map((f) => [f.id, geoArea(f)]));

// ---------- Régions ----------
const cadre = (lon1, lon2, lat1, lat2) => {
  const pts = [];
  for (let i = 0; i <= 10; i++) { const lo = lon1 + ((lon2 - lon1) * i) / 10, la = lat1 + ((lat2 - lat1) * i) / 10; pts.push([lo, lat1], [lo, lat2], [lon1, la], [lon2, la]); }
  return { type: "MultiPoint", coordinates: pts };
};
const REGIONS = {
  monde: { titre: "Le monde", w: 960, h: 500, donnees: MONDE_110, proj: () => geoNaturalEarth1(), cadre: { type: "Sphere" }, zone: null,
    oceans: [["Océan Pacifique", -150, 0], ["Océan Atlantique", -35, 15], ["Océan Indien", 78, -25], ["Océan Arctique", 10, 80], ["Océan Austral", 20, -60], ["Océan Pacifique", 165, 10]] },
  europe: { titre: "L'Europe politique", w: 800, h: 640, donnees: MONDE_50, proj: () => geoConicConformal().rotate([-12, 0]).parallels([40, 65]), cadre: cadre(-24, 42, 34, 71), zone: "Europe",
    oceans: [["Océan Atlantique", -16, 47], ["Mer du Nord", 3.5, 56], ["Mer Méditerranée", 17, 35.6], ["Mer Baltique", 19.5, 57.8], ["Mer Noire", 34, 43.3], ["Mer de Norvège", 2, 67]] },
  ameriques: { titre: "Les Amériques", w: 620, h: 820, donnees: MONDE_50, proj: () => geoAzimuthalEqualArea().rotate([82, -12]), cadre: cadre(-130, -34, -56, 60), zone: "Amériques",
    oceans: [["Océan Pacifique", -110, -10], ["Océan Atlantique", -40, 20], ["Mer des Caraïbes", -76, 14.5], ["Golfe du Mexique", -90, 25]] },
  afrique: { titre: "L'Afrique politique", w: 720, h: 760, donnees: MONDE_50, proj: () => geoAzimuthalEqualArea().rotate([-18, -2]), cadre: cadre(-19, 53, -36, 38), zone: "Afrique",
    oceans: [["Océan Atlantique", -12, -5], ["Océan Indien", 62, -15], ["Mer Méditerranée", 18, 35.2], ["Mer Rouge", 38.6, 20.5]] },
};
export const REGION_DE_ZONE = { Europe: "europe", "Amériques": "ameriques", Afrique: "afrique" };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const halo = 'paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round"';

// Échelle : longueur en pixels de N km au centre de la carte.
function echelle(proj, region) {
  const r = REGIONS[region];
  const [cx, cy] = [r.w / 2, r.h / 2];
  const [lon, lat] = proj.invert([cx, cy]);
  for (const km of [500, 1000, 2000, 3000]) {
    const dlon = km / (111.32 * Math.cos((lat * Math.PI) / 180));
    const a = proj([lon, lat]), b = proj([lon + dlon, lat]);
    const px = Math.abs(b[0] - a[0]);
    if (px > 60 && px < 160) return { km, px };
  }
  return null;
}

const cache = new Map();
/**
 * Génère une carte SVG.
 * options : region (monde | europe | ameriques | afrique), rouge (codes iso2 ou continent pour le monde), numeros (iso2 numérotés),
 * capitales (afficher les capitales), noms (afficher les noms des pays), continents (monde coloré par continent), muette.
 */
export function carte({ region = "europe", rouge = [], numeros = [], capitales = false, noms = false, continents = false, etoile = null, interactif = false, oceansCliquables = false, muette = false } = {}) {
  const r = REGIONS[region] || REGIONS.europe;
  const cle = JSON.stringify([region, rouge, numeros, capitales, noms, continents, etoile, interactif, oceansCliquables, muette]);
  if (cache.has(cle)) return cache.get(cle);
  const marge = 14;
  const proj = r.proj().fitExtent([[marge, marge], [r.w - marge, r.h - marge]], r.cadre);
  if (region !== "monde") proj.clipExtent([[-2, -2], [r.w + 2, r.h + 2]]); // ne dessine que ce qui est visible
  const chemin = geoPath(proj).digits(1);
  const rougeIso = new Set(rouge.map((x) => String(x).toLowerCase()));
  const pays = r.donnees.map((f) => {
    const info = PAR_NUM[f.id];
    const continent = region === "monde" ? continentDe(f) : null;
    let fill;
    if (region === "monde") fill = rouge.includes(continent) ? "#e63946" : continents ? COUL_CONTINENT[continent] : "#efe9dc";
    else fill = info && rougeIso.has(info.iso2) ? "#e63946" : r.zone && info?.zone === r.zone ? couleurPays(f.id) : "#e6e2d8";
    const d = chemin(f);
    // Carte cliquable (« positionne le pays ») : chaque pays de la zone porte son code et son nom.
    const cliquable = interactif && info && info.zone === r.zone;
    return d ? `<path d="${d}" fill="${fill}"${cliquable ? ` data-iso="${info.iso2}" data-nom="${esc(info.nom)}"` : ""}/>` : "";
  }).join("");
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.w} ${r.h}" font-family="Arial, Helvetica, sans-serif">`;
  s += `<rect width="${r.w}" height="${r.h}" fill="#bfe3f5"/>`;
  s += `<path d="${chemin(geoGraticule10())}" fill="none" stroke="#9fcbe6" stroke-width="0.6"/>`;
  s += `<g stroke="#5f5f5f" stroke-width="0.55" stroke-linejoin="round">${pays}</g>`;
  // Mers et océans (italique bleu, comme sur une carte scolaire)
  // (pas de noms de mers quand la question porte justement sur un océan : étoile, océans cliquables, carte muette)
  for (const [nom, lon, lat] of etoile || oceansCliquables || muette ? [] : r.oceans) {
    const p = proj([lon, lat]);
    if (p && p[0] > 0 && p[0] < r.w && p[1] > 0 && p[1] < r.h) s += `<text x="${p[0].toFixed(0)}" y="${p[1].toFixed(0)}" text-anchor="middle" font-size="${region === "monde" ? 13 : 12}" font-style="italic" fill="#1d5f99" ${halo.replace("#fff", "#bfe3f5")}>${esc(nom)}</text>`;
  }
  // Noms des continents (carte du monde)
  if (region === "monde" && continents) {
    for (const [nom, lon, lat] of [["AMÉRIQUE DU NORD", -100, 48], ["AMÉRIQUE DU SUD", -60, -15], ["EUROPE", 15, 52], ["AFRIQUE", 20, 5], ["ASIE", 90, 48], ["OCÉANIE", 134, -25]]) {
      const p = proj([lon, lat]);
      s += `<text x="${p[0].toFixed(0)}" y="${p[1].toFixed(0)}" text-anchor="middle" font-size="13" font-weight="bold" fill="#333" ${halo}>${nom}</text>`;
    }
  }
  // Océans cliquables : un grand cercle « ? » au milieu de chaque océan (le Pacifique a deux cercles, de chaque côté).
  if (oceansCliquables && region === "monde") {
    for (const [nom, lon, lat] of OCEANS_CLIC) {
      const [x, y] = proj([lon, lat]);
      s += `<g data-nom="${esc(nom)}" class="ocean-clic"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="22" fill="#ffffff" fill-opacity="0.55" stroke="#1d5f99" stroke-width="2" stroke-dasharray="5 3"/><text x="${x.toFixed(1)}" y="${(y + 7).toFixed(1)}" text-anchor="middle" font-size="20" font-weight="bold" fill="#1d5f99">?</text></g>`;
    }
  }
  if (etoile) { const p = proj(etoile); s += `<text x="${p[0]}" y="${p[1] + 10}" text-anchor="middle" font-size="30" fill="#e63946" stroke="#111" stroke-width="1">★</text>`; }
  // Capitales, noms, numéros — étiquettes placées sans chevauchement (on saute celles qui ne rentrent pas).
  if (region !== "monde") {
    const boites = [[0, 0, 300, 50], [r.w - 70, 0, r.w, 80]]; // cartouche + rose des vents
    for (const [nom, lon, lat] of r.oceans) { // les noms de mers restent lisibles
      const p = proj([lon, lat]); if (!p) continue;
      const w = nom.length * 6.6; boites.push([p[0] - w / 2, p[1] - 12, p[0] + w / 2, p[1] + 3]);
    }
    const libre = (x, y, w, h) => x > 2 && y > 2 && x + w < r.w - 2 && y + h < r.h - 2 && !boites.some(([a, b, c, d]) => x < c && x + w > a && y < d && y + h > b);
    const poser = (x, y, w, h) => { boites.push([x, y, x + w, y + h]); };
    const larg = (txt, fs, gras) => txt.length * fs * (gras ? 0.64 : 0.56);
    const liste = PAYS.filter((p) => p.zone === r.zone).map((p) => ({ ...p, pos: proj([p.lon, p.lat]) })).filter((p) => p.pos)
      .sort((a, b) => (AIRE[b.num] || 0) - (AIRE[a.num] || 0)); // les grands pays d'abord
    let marques = "", textes = "";
    for (const p of liste) {
      const [x, y] = p.pos, n = numeros.indexOf(p.iso2);
      if (n >= 0) {
        marques += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="#ffd60a" stroke="#111" stroke-width="1.5"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="bold">${n + 1}</text>`;
        poser(x - 10, y - 10, 20, 20);
      } else if (capitales) {
        marques += `<rect x="${(x - 3).toFixed(1)}" y="${(y - 3).toFixed(1)}" width="6" height="6" fill="#111" stroke="#fff" stroke-width="1"/>`;
        poser(x - 3, y - 3, 6, 6);
      }
    }
    for (const p of liste) {
      if (numeros.includes(p.iso2)) continue;
      const [x, y] = p.pos;
      if (noms) {
        const t = p.nom.toUpperCase(), fs = (AIRE[p.num] || 0) > 0.004 ? 11 : 9.5, w = larg(t, fs, true);
        for (const [dx, dy] of [[0, capitales ? 15 : 5], [0, -10], [0, 26]]) {
          const bx = x + dx - w / 2, by = y + dy - fs;
          if (libre(bx, by, w, fs + 2)) { poser(bx, by, w, fs + 2); textes += `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="bold" fill="#5a2d0c" ${halo}>${esc(t)}</text>`; break; }
        }
      }
      if (capitales) {
        const t = p.capitale, w = larg(t, 10, false);
        for (const [dx, dy, ancre] of [[5, -4, "start"], [-5, -4, "end"], [5, 11, "start"], [-5, 11, "end"]]) {
          const bx = ancre === "start" ? x + dx : x + dx - w, by = y + dy - 9;
          if (libre(bx, by, w, 11)) { poser(bx, by, w, 11); textes += `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${ancre}" font-size="10" fill="#111" ${halo}>${esc(t)}</text>`; break; }
        }
      }
    }
    s += marques + textes;
    // Petits pays : une zone de clic ronde autour de la capitale pour pouvoir les toucher du doigt.
    if (interactif) for (const p of liste) if ((AIRE[p.num] || 0) < 0.0009) s += `<circle cx="${p.pos[0].toFixed(1)}" cy="${p.pos[1].toFixed(1)}" r="9" fill="#fff" fill-opacity="0.01" stroke="#5f5f5f" stroke-width="0.8" stroke-dasharray="2 2" data-iso="${p.iso2}" data-nom="${esc(p.nom)}"/>`;
  }
  // Cartouche du titre
  const titre = r.titre;
  s += `<g><rect x="12" y="12" width="${titre.length * 9.5 + 24}" height="30" fill="#fff" stroke="#111" stroke-width="1.5"/><text x="24" y="33" font-size="16" font-weight="bold">${esc(titre)}</text></g>`;
  // Rose des vents
  const nx = r.w - 40, ny = 46;
  s += `<g><circle cx="${nx}" cy="${ny}" r="20" fill="#fff" stroke="#111" stroke-width="1.2"/><polygon points="${nx},${ny - 18} ${nx - 6},${ny} ${nx + 6},${ny}" fill="#e63946" stroke="#111" stroke-width="0.8"/><polygon points="${nx},${ny + 18} ${nx - 6},${ny} ${nx + 6},${ny}" fill="#fff" stroke="#111" stroke-width="0.8"/><text x="${nx}" y="${ny - 22}" text-anchor="middle" font-size="12" font-weight="bold">N</text></g>`;
  // Échelle et légende
  const e = region !== "monde" ? echelle(proj, region) : null;
  let ly = r.h - 16;
  if (e) {
    s += `<g><rect x="12" y="${ly - 30}" width="${e.px + 70}" height="36" fill="#fff" stroke="#111" stroke-width="1" opacity="0.92"/>`
      + `<rect x="22" y="${ly - 10}" width="${e.px / 2}" height="6" fill="#111"/><rect x="${22 + e.px / 2}" y="${ly - 10}" width="${e.px / 2}" height="6" fill="#fff" stroke="#111" stroke-width="1"/>`
      + `<text x="22" y="${ly - 15}" font-size="10">0</text><text x="${22 + e.px}" y="${ly - 15}" font-size="10" text-anchor="middle">${e.km} km</text></g>`;
  }
  const leg = [];
  if (capitales) leg.push(`<rect x="0" y="-7" width="7" height="7" fill="#111"/><text x="12" y="0" font-size="11">Capitale</text>`);
  if (rouge.length) leg.push(`<rect x="0" y="-9" width="14" height="10" fill="#e63946" stroke="#5f5f5f" stroke-width="0.6"/><text x="20" y="0" font-size="11">${region === "monde" ? "Continent à trouver" : "Pays à trouver"}</text>`);
  if (numeros.length) leg.push(`<circle cx="6" cy="-4" r="6" fill="#ffd60a" stroke="#111"/><text x="16" y="0" font-size="11">Pays numéroté</text>`);
  if (leg.length) {
    const lw = 150, lh = leg.length * 18 + 12, lx = r.w - lw - 12, lyy = r.h - lh - 12;
    s += `<g><rect x="${lx}" y="${lyy}" width="${lw}" height="${lh}" fill="#fff" stroke="#111" stroke-width="1" opacity="0.95"/>${leg.map((l, i) => `<g transform="translate(${lx + 10} ${lyy + 20 + i * 18})">${l}</g>`).join("")}</g>`;
  }
  s += `</svg>`;
  if (cache.size > 400) cache.clear();
  cache.set(cle, s);
  return s;
}

export const OCEANS_CLIC = [["Océan Pacifique", -145, 5], ["Océan Pacifique", 172, 15], ["Océan Atlantique", -35, 20], ["Océan Indien", 78, -22], ["Océan Arctique", 20, 80], ["Océan Austral", -20, -62]];

// URL d'une carte servie par /api/carte (utilisée dans les leçons et les questions).
export function urlCarte(o) {
  const q = new URLSearchParams({ region: o.region || "europe" });
  if (o.rouge?.length) q.set("rouge", o.rouge.join(","));
  if (o.numeros?.length) q.set("numeros", o.numeros.join(","));
  if (o.capitales) q.set("capitales", "1");
  if (o.noms) q.set("noms", "1");
  if (o.continents) q.set("continents", "1");
  if (o.etoile) q.set("etoile", o.etoile.join(","));
  if (o.interactif) q.set("interactif", "1");
  if (o.oceansCliquables) q.set("oceans", "1");
  if (o.muette) q.set("muette", "1");
  return "/api/carte?" + q.toString();
}
export function carteDepuisRequete(sp) {
  const liste = (k) => (sp.get(k) || "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 30);
  const etoile = liste("etoile").map(Number);
  return carte({
    region: sp.get("region") || "europe",
    rouge: liste("rouge").map((x) => (x.length === 2 ? x.toLowerCase() : x)),
    numeros: liste("numeros").map((x) => x.toLowerCase()),
    capitales: sp.get("capitales") === "1", noms: sp.get("noms") === "1", continents: sp.get("continents") === "1", interactif: sp.get("interactif") === "1", oceansCliquables: sp.get("oceans") === "1", muette: sp.get("muette") === "1",
    etoile: etoile.length === 2 && etoile.every(Number.isFinite) ? etoile : null,
  });
}
export const urlDrapeau = (iso2) => `/drapeaux/${iso2}.svg`;
export { PAYS_PAR_ISO };
