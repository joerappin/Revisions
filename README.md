# ReviZ ⚡

Module de révision style manga pour les élèves du Québec (primaire et secondaire), accessible sur tous les appareils du même Wi-Fi.

## Lancer

```bash
cd "Module de test"
npm start
```

Le terminal affiche l'adresse à ouvrir, par ex. `http://192.168.2.114:3000`, sur la tablette, le téléphone ou l'ordinateur de l'ado.
(Au premier lancement, macOS peut demander d'autoriser « node » à accepter les connexions entrantes : clique sur **Autoriser**.)

## ReviZ sur le Wi-Fi et par internet (mode actuel)

- **Partout (internet)** : **https://joerappin.github.io/Revisions/** redirige vers le site (tunnel Cloudflare gratuit vers le Mac).
- **Sur le Wi-Fi de la maison** : **http://MacBook-Air-de-Joe.local:3000** (ou l'adresse numérique du Mac, ex. http://192.168.2.122:3000).
- Deux services démarrent à l'ouverture de session, indépendants l'un de l'autre :
  - `com.reviz.local` → `en-local.sh` : récupère la dernière version sur GitHub, empêche la veille, lance le serveur et le relance s'il ne répond plus;
  - `com.reviz.tunnel` → `en-tunnel.sh` : ouvre le tunnel, met à jour le lien fixe (branche `gh-pages`), et relance seulement le tunnel s'il ne répond plus (le site local n'est jamais coupé).
- App **« Relancer ReviZ »** (Dock, Bureau, `~/Applications`) : affiche 🟢/🔴 pour le Wi-Fi et pour internet, et relance les deux.
- Le Mac doit rester allumé (couvercle ouvert ou branché sur un écran). Le tunnel gratuit n'a pas de garantie de disponibilité.

## Mettre ReviZ en ligne sans le Mac (Render, payant)

Le site tourne sur [Render](https://render.com) grâce au fichier `render.yaml` :

1. Ouvre **https://render.com/deploy?repo=https://github.com/joerappin/Revisions**, connecte-toi avec GitHub.
2. Remplis `ADMIN_EMAIL` et `ADMIN_PASSWORD` (le compte admin du site), et `ANTHROPIC_API_KEY` si tu veux l'IA. Valide (offre *Starter* avec disque, environ 7 $/mois : le plan gratuit efface les comptes à chaque redémarrage).
3. Le site est en ligne à l'adresse affichée par Render (ex. `https://reviz.onrender.com`). Le QR code du téléphone utilise automatiquement cette adresse.
4. **Transférer les profils et la progression** : sur l'ordinateur, 🛡 Admin → **💾 Sauvegarder** ; sur le site en ligne, 🛡 Admin → **📥 Restaurer** avec ce fichier.

Chaque `git push` sur `main` met le site à jour ; les comptes restent sur le disque du serveur (jamais sur GitHub).

## Comptes et admin

- Chaque élève **crée son compte** (identifiant + mot de passe) sur l'ordinateur ou le téléphone, puis choisit sa matière et son sujet.
- L'interface s'adapte : **version web** (tableau de bord complet) et **version mobile** (onglets Accueil / Code / Cours / Progrès).
- Bouton **🛡 Admin** : connexion avec le courriel et le mot de passe admin (à la toute première visite, il demande de créer ce compte admin). L'espace admin montre l'avancement de tous les comptes (révisions, tests, moyennes, dernier résultat, activité), permet de sauvegarder / restaurer tous les comptes, de supprimer des lignes d'historique (une, plusieurs ou toutes) de n'importe quel compte, de réinitialiser un mot de passe, de supprimer un compte et de régler la clé API.

## Activer l'IA (recherche internet, photos, tests sur mesure)

Sans clé, l'appli tourne en **mode démo** (petite banque de questions en maths, en français et en anglais).
Pour que Sensei cherche sur internet et crée les fiches et les tests sur n'importe quel sujet :

- dans 🛡 **Admin → Clé API**, colle une clé API Anthropic (console.anthropic.com), **ou**
- crée un fichier `.env` contenant `ANTHROPIC_API_KEY=sk-ant-...`

## Fonctionnement

1. **Profil** : photo ou avatar manga, nom, école (liste officielle des écoles du Québec, Données Québec), année scolaire, avatar. On choisit ensuite la **matière** (dont Univers social) puis la **leçon** (liste défilante ; en maths, « Algèbre » est proposée en premier).
2. **Page de la leçon, 3 onglets — parcours en 3 étapes : leçon → révision → examen** :
   - **📖 Leçon** : leçon en **diapositives** (bouton Suivant, flèches du clavier, glisser du doigt, ou le téléphone-télécommande). Schémas, exemples résolus, audio 🔊 en anglais, astuces, pièges. Arriver à la dernière diapo enregistre la leçon et **débloque la révision**. La leçon est gardée en mémoire : elle se rouvre instantanément.
   - **⚔️ Révision** : **révision** (correction détaillée après chaque question) puis **examen** noté sur 100 %, débloqué après au moins une révision. Historique : leçon lue combien de fois et quand, chaque évaluation avec sa date et son score, et **👁 Revoir** pour relire ses réponses et les corrections (toutes, ou seulement les erreurs).
   - **Corrections** : ta réponse, la bonne réponse, pourquoi ta réponse est fausse, l'explication, et en maths/sciences la **démarche détaillée étape par étape**.
   - **📸 Photo** : on photographie sa leçon (1 à 5 photos, depuis l'ordinateur, le téléphone connecté ou le téléphone-télécommande), puis **Terminer** : l'IA crée une leçon et un test à partir des photos.
3. **Réglages par profil** : minuteur (activable, secondes par question à choix / ouverte / calcul en maths; l'**admin** peut le régler pour un élève ou pour tous les comptes, et le **verrouiller** 🔒 pour que l'élève ne puisse pas le changer), nombre de questions, répartition QCM / questions ouvertes (70 / 30 par défaut) et réglage séparé pour les **maths : 100 % de questions ouvertes par défaut**, avec une case « Ton calcul » et une case « Résultat final ». Le calcul compte dans la note (½ point si le résultat est juste sans démarche valable, ou si la démarche est bonne avec une petite erreur).
4. **Télécommande téléphone** : « Connecter mon téléphone » affiche un **QR code** (à scanner avec l'appareil photo) et un code à 4 chiffres. Le téléphone devient une manette : boutons A/B/C/D, champ texte pour les questions ouvertes, Confirmer, et appareil photo pour l'onglet 📸. À 10 secondes de la fin, le contour du téléphone clignote en rouge. La connexion se rétablit toute seule (écran verrouillé, Wi-Fi, redémarrage du serveur).
5. **Aide aux devoirs** : photo ou texte de l'exercice → reformulation, méthode, indices progressifs, solution cachée.
6. **Types de questions** : QCM, vrai/faux, réponse écrite, calcul + résultat (maths), **frise chronologique** à remettre dans l'ordre, et **questions avec image** (tenues d'époque, cartes, drapeaux à compléter, figures).
   Leçons intégrées complètes (même sans clé API) : algèbre, fractions, français, anglais, **la Renaissance et l'humanisme** (tenues à travers les époques, frises) et **géographie**.
   - **Cartes de type atlas scolaire**, générées à partir des vrais contours des pays (Natural Earth) : pays en couleurs pastel (deux voisins n'ont jamais la même), mers et océans, quadrillage, capitales, titre, rose des vents, échelle et légende. Cartes du monde (continents), de l'Europe, des Amériques et de l'Afrique.
   - **Drapeaux officiels** de 106 pays d'Europe, des Amériques et d'Afrique, avec leur capitale.
   - Leçons « Drapeaux et capitales » (Europe, Amériques, Afrique ou les trois) et « Les continents et les océans » : carte politique, carte muette numérotée, galerie de drapeaux, tableau pays–capitales, puis questions tirées au hasard (drapeau → pays, capitale, pays en rouge sur la carte, numéro sur la carte).
   - **Test personnalisable** (leçons de drapeaux, pays et capitales) : zones à cocher (Monde = tout, Europe, Amériques, Afrique), contenu (cartes, drapeaux ou les deux) et format des réponses (QCM, question écrite, **positionner** en cliquant le pays sur la carte, ou un mélange). Positionner fonctionne aussi sur le téléphone-télécommande.
   - Leçon **« Les océans du monde »** : les cinq océans, leur position, leur taille, les trois océans du Canada; questions avec étoile sur la carte, positionnement sur la carte, frise par taille.
   - **Culture et citoyenneté québécoise (2e secondaire)** : 8 leçons intégrées, rédigées d'après le programme officiel du Ministère (PFEQ CCQ, 2023) — autonomie, interdépendance, relations intimes à l'adolescence (consentement, ressources d'aide), solidarité sociale, institutions démocratiques du Québec et du Canada (paliers, séparation des pouvoirs, laïcité, partis, Premiers Peuples), droits et responsabilités, ordre social, dialogue et pensée critique. Schémas, tableaux et questions avec indices. Utilisées même avec une clé API. Pour le cahier de l'élève : onglet 📸 Photo (photographier ses pages).
   - **Costumes illustrés** (31 personnages style manga) : leçon **« Les costumes à travers l'histoire »** (Préhistoire, Égypte, Grèce, Rome, Moyen Âge, Iroquoiens vers 1500, Renaissance, Louis XIV, Nouvelle-France, XVIIIe, XIXe, années 1920; frises) et **« Les costumes traditionnels du monde »** (kimono, sari, kilt, amauti inuit, kente, hanbok, áo dài, dirndl, djellaba…), avec questions « quelle époque ? », « quel pays ? », « quel continent ? », « comment s'appelle ce vêtement ? ». Avec une clé API, l'IA peut aussi utiliser ces images (`/costumes/<clé>.svg`).
   - Réponses écrites : les fautes d'orthographe (accents, « s » final, petite faute de frappe) sont **acceptées mais signalées**, avec la bonne orthographe (« ✏️ on écrit … »). En français, l'orthographe reste évaluée.
   - **Bouton ⓘ indice** à côté de chaque question, dans **toutes les matières** (aussi sur le téléphone-télécommande) : un indice léger; en maths, la notion à utiliser et un petit exemple résolu avec d'autres nombres; en français, la règle à appliquer. La correction indique si l'indice a été utilisé.
   - **Algèbre qui évolue** : 4 niveaux (bases → consolidation → avancé → défi) choisis selon l'année scolaire, le moment de l'année (début d'année = 1er contrôle : vocabulaire, valeur numérique, réduire, équations à une étape, traduire) et les résultats : le niveau monte toutes les 2 séances réussies (80 % et plus) et redescend si les deux dernières sont difficiles. Le niveau s'affiche au début de chaque révision. Avec une clé API, Sensei suit le même niveau.
   - **Révisions et examens toujours différents** : chaque élève a la mémoire des questions déjà vues; les nouvelles passent d'abord, l'ordre est mélangé à chaque fois, les maths utilisent de nouveaux nombres à chaque séance, et les QCM ont des variantes (vrai ou faux). Avec une clé API, Sensei crée une nouvelle série de questions quand la précédente a été vue.
   - **Anti-triche** : changer d'onglet pendant une question ouvre une fenêtre « l'aide externe n'est pas permise » ; la réponse est comptée fausse et on passe à la question suivante.
7. **Progrès** (élève et admin) : filtres par **matière** (code couleur par matière) et par **type** (leçons, révisions, examens), **moyenne globale** et **moyenne par matière** (révisions et examens), graphique, puis un **historique unique** ; pour l’admin seulement : cases à cocher (supprimer la sélection) et corbeille en fin de ligne.
   **Durées** : le temps de lecture de la leçon, de chaque révision et de chaque examen est enregistré (temps actif seulement : un onglet caché ne compte pas), affiché à la fin, dans l'historique, dans « Revoir », et en temps moyen par type.
8. **📚 Mes leçons** : toutes les leçons apprises, avec filtres par matière (lue combien de fois, révisions, examens, meilleurs scores) et accès direct pour les revoir. Les statistiques et l'historique du compte ont aussi des filtres par matière.
9. **📖 Dico (anglais)** : quand la matière est l'anglais, un bouton « Dico » apparaît en haut : traduction, prononciation, exemples en anglais et en français, synonymes.

**Rapidité** : fichiers compressés (gzip) et mis en cache, leçons gardées en mémoire, préparation de la leçon et du test final en arrière-plan pendant que l'élève lit.

Les données (comptes, résultats, photos, mots de passe hachés) restent sur cet ordinateur dans le dossier `data/`.
Les recherches internet sont mises en cache par niveau/matière/sujet pour accélérer les révisions suivantes.
