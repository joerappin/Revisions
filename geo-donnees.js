// Pays d'Europe, des Amériques et d'Afrique : code ISO (drapeau), code numérique (carte), nom, capitale et position de la capitale.
// [iso2, isoNum, nom, capitale, zone, longitude, latitude, autres réponses acceptées pour la capitale]
const L = (zone, lignes) => lignes.map(([iso2, num, nom, capitale, lon, lat, ...autres]) => ({ iso2, num, nom, capitale, zone, lon, lat, autres }));

export const PAYS = [
  ...L("Europe", [
    ["fr", "250", "France", "Paris", 2.35, 48.86], ["de", "276", "Allemagne", "Berlin", 13.4, 52.52], ["it", "380", "Italie", "Rome", 12.5, 41.9],
    ["es", "724", "Espagne", "Madrid", -3.7, 40.42], ["pt", "620", "Portugal", "Lisbonne", -9.14, 38.72], ["gb", "826", "Royaume-Uni", "Londres", -0.13, 51.51],
    ["ie", "372", "Irlande", "Dublin", -6.26, 53.35], ["be", "056", "Belgique", "Bruxelles", 4.35, 50.85], ["nl", "528", "Pays-Bas", "Amsterdam", 4.9, 52.37],
    ["lu", "442", "Luxembourg", "Luxembourg", 6.13, 49.61], ["ch", "756", "Suisse", "Berne", 7.45, 46.95], ["at", "040", "Autriche", "Vienne", 16.37, 48.21],
    ["pl", "616", "Pologne", "Varsovie", 21.01, 52.23], ["cz", "203", "Tchéquie", "Prague", 14.42, 50.08], ["sk", "703", "Slovaquie", "Bratislava", 17.11, 48.15],
    ["hu", "348", "Hongrie", "Budapest", 19.04, 47.5], ["ro", "642", "Roumanie", "Bucarest", 26.1, 44.43], ["bg", "100", "Bulgarie", "Sofia", 23.32, 42.7],
    ["gr", "300", "Grèce", "Athènes", 23.73, 37.98], ["hr", "191", "Croatie", "Zagreb", 15.98, 45.81], ["si", "705", "Slovénie", "Ljubljana", 14.51, 46.06],
    ["rs", "688", "Serbie", "Belgrade", 20.46, 44.79], ["ba", "070", "Bosnie-Herzégovine", "Sarajevo", 18.41, 43.86], ["al", "008", "Albanie", "Tirana", 19.82, 41.33],
    ["mk", "807", "Macédoine du Nord", "Skopje", 21.43, 42.0], ["me", "499", "Monténégro", "Podgorica", 19.26, 42.44], ["dk", "208", "Danemark", "Copenhague", 12.57, 55.68],
    ["se", "752", "Suède", "Stockholm", 18.07, 59.33], ["no", "578", "Norvège", "Oslo", 10.75, 59.91], ["fi", "246", "Finlande", "Helsinki", 24.94, 60.17],
    ["is", "352", "Islande", "Reykjavik", -21.94, 64.15], ["ee", "233", "Estonie", "Tallinn", 24.75, 59.44], ["lv", "428", "Lettonie", "Riga", 24.11, 56.95],
    ["lt", "440", "Lituanie", "Vilnius", 25.28, 54.69], ["by", "112", "Biélorussie", "Minsk", 27.56, 53.9], ["ua", "804", "Ukraine", "Kiev", 30.52, 50.45, "Kyiv", "Kyïv"],
    ["md", "498", "Moldavie", "Chisinau", 28.86, 47.01, "Kichinev"], ["ru", "643", "Russie", "Moscou", 37.62, 55.76],
  ]),
  ...L("Amériques", [
    ["ca", "124", "Canada", "Ottawa", -75.7, 45.42], ["us", "840", "États-Unis", "Washington", -77.04, 38.91, "Washington D.C."], ["mx", "484", "Mexique", "Mexico", -99.13, 19.43],
    ["gt", "320", "Guatemala", "Guatemala", -90.51, 14.63, "Ciudad de Guatemala"], ["bz", "084", "Belize", "Belmopan", -88.76, 17.25], ["hn", "340", "Honduras", "Tegucigalpa", -87.21, 14.07],
    ["sv", "222", "Salvador", "San Salvador", -89.19, 13.69], ["ni", "558", "Nicaragua", "Managua", -86.25, 12.11], ["cr", "188", "Costa Rica", "San José", -84.09, 9.93],
    ["pa", "591", "Panama", "Panama", -79.52, 8.98, "Panama City"], ["cu", "192", "Cuba", "La Havane", -82.37, 23.11, "Havane"], ["ht", "332", "Haïti", "Port-au-Prince", -72.34, 18.54],
    ["do", "214", "République dominicaine", "Saint-Domingue", -69.93, 18.49], ["jm", "388", "Jamaïque", "Kingston", -76.79, 18.01], ["co", "170", "Colombie", "Bogota", -74.07, 4.71, "Bogotá"],
    ["ve", "862", "Venezuela", "Caracas", -66.9, 10.49], ["ec", "218", "Équateur", "Quito", -78.47, -0.18], ["pe", "604", "Pérou", "Lima", -77.04, -12.05],
    ["bo", "068", "Bolivie", "Sucre", -65.26, -19.04, "La Paz"], ["br", "076", "Brésil", "Brasilia", -47.88, -15.79, "Brasília"], ["py", "600", "Paraguay", "Asuncion", -57.58, -25.26, "Asunción"],
    ["uy", "858", "Uruguay", "Montevideo", -56.16, -34.9], ["ar", "032", "Argentine", "Buenos Aires", -58.38, -34.6], ["cl", "152", "Chili", "Santiago", -70.67, -33.45, "Santiago du Chili"],
    ["gy", "328", "Guyana", "Georgetown", -58.16, 6.8], ["sr", "740", "Suriname", "Paramaribo", -55.2, 5.85],
  ]),
  ...L("Afrique", [
    ["dz", "012", "Algérie", "Alger", 3.06, 36.75], ["ma", "504", "Maroc", "Rabat", -6.84, 34.02], ["tn", "788", "Tunisie", "Tunis", 10.18, 36.81],
    ["ly", "434", "Libye", "Tripoli", 13.19, 32.89], ["eg", "818", "Égypte", "Le Caire", 31.24, 30.04, "Caire"], ["sd", "729", "Soudan", "Khartoum", 32.56, 15.5],
    ["ss", "728", "Soudan du Sud", "Djouba", 31.58, 4.85, "Juba"], ["et", "231", "Éthiopie", "Addis-Abeba", 38.75, 9.03, "Addis Abeba"], ["er", "232", "Érythrée", "Asmara", 38.93, 15.32],
    ["dj", "262", "Djibouti", "Djibouti", 43.15, 11.59], ["so", "706", "Somalie", "Mogadiscio", 45.34, 2.05], ["ke", "404", "Kenya", "Nairobi", 36.82, -1.29],
    ["ug", "800", "Ouganda", "Kampala", 32.58, 0.35], ["tz", "834", "Tanzanie", "Dodoma", 35.74, -6.16], ["rw", "646", "Rwanda", "Kigali", 30.06, -1.95],
    ["bi", "108", "Burundi", "Gitega", 29.93, -3.43], ["cd", "180", "République démocratique du Congo", "Kinshasa", 15.31, -4.32, "RD Congo"], ["cg", "178", "Congo", "Brazzaville", 15.28, -4.26],
    ["ga", "266", "Gabon", "Libreville", 9.45, 0.39], ["cm", "120", "Cameroun", "Yaoundé", 11.5, 3.85], ["cf", "140", "Centrafrique", "Bangui", 18.56, 4.39],
    ["td", "148", "Tchad", "N'Djamena", 15.04, 12.13, "Ndjamena"], ["ne", "562", "Niger", "Niamey", 2.11, 13.51], ["ng", "566", "Nigeria", "Abuja", 7.49, 9.06],
    ["bj", "204", "Bénin", "Porto-Novo", 2.63, 6.5], ["tg", "768", "Togo", "Lomé", 1.23, 6.13], ["gh", "288", "Ghana", "Accra", -0.19, 5.6],
    ["bf", "854", "Burkina Faso", "Ouagadougou", -1.52, 12.37], ["ci", "384", "Côte d'Ivoire", "Yamoussoukro", -5.28, 6.82, "Abidjan"], ["ml", "466", "Mali", "Bamako", -8.0, 12.64],
    ["mr", "478", "Mauritanie", "Nouakchott", -15.98, 18.08], ["sn", "686", "Sénégal", "Dakar", -17.47, 14.72], ["gm", "270", "Gambie", "Banjul", -16.58, 13.45],
    ["gn", "324", "Guinée", "Conakry", -13.68, 9.64], ["sl", "694", "Sierra Leone", "Freetown", -13.23, 8.48], ["lr", "430", "Liberia", "Monrovia", -10.8, 6.31],
    ["ao", "024", "Angola", "Luanda", 13.23, -8.84], ["zm", "894", "Zambie", "Lusaka", 28.32, -15.39], ["zw", "716", "Zimbabwe", "Harare", 31.05, -17.83],
    ["mw", "454", "Malawi", "Lilongwe", 33.79, -13.96], ["mz", "508", "Mozambique", "Maputo", 32.57, -25.97], ["na", "516", "Namibie", "Windhoek", 17.08, -22.56],
    ["bw", "072", "Botswana", "Gaborone", 25.91, -24.65], ["za", "710", "Afrique du Sud", "Pretoria", 28.19, -25.75], ["mg", "450", "Madagascar", "Antananarivo", 47.52, -18.88, "Tananarive"],
    ["ls", "426", "Lesotho", "Maseru", 27.48, -29.32], ["sz", "748", "Eswatini", "Mbabane", 31.13, -26.31],
  ]),
];
export const PAYS_PAR_ISO = Object.fromEntries(PAYS.map((p) => [p.iso2, p]));
export const ZONES = ["Europe", "Amériques", "Afrique"];
// Article pour « le drapeau de … » : de la France, du Canada, des États-Unis, de l'Italie.
const PLURIELS = new Set(["États-Unis", "Pays-Bas"]);
const MASCULINS = new Set(["Canada", "Mexique", "Guatemala", "Belize", "Honduras", "Salvador", "Nicaragua", "Costa Rica", "Panama", "Venezuela", "Pérou", "Brésil", "Paraguay", "Chili", "Guyana", "Suriname",
  "Portugal", "Royaume-Uni", "Luxembourg", "Danemark", "Monténégro", "Maroc", "Soudan", "Soudan du Sud", "Kenya", "Rwanda", "Burundi", "Congo", "Gabon", "Cameroun", "Tchad", "Niger", "Nigeria", "Bénin", "Togo", "Ghana",
  "Burkina Faso", "Mali", "Sénégal", "Liberia", "Zimbabwe", "Malawi", "Mozambique", "Botswana", "Lesotho", "Eswatini", "Équateur", "Centrafrique"]);
export function de(nom) {
  if (PLURIELS.has(nom)) return "des " + nom;
  if (/^[AEIOUÉÈÊÎÔH]/.test(nom) && nom !== "Honduras") return "de l'" + nom;
  if (MASCULINS.has(nom)) return "du " + nom;
  if (["Cuba", "Haïti", "Madagascar", "Djibouti", "Malte", "Monaco"].includes(nom)) return "de " + nom;
  return "de la " + nom;
}
