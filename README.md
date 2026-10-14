# ReviZ ⚡

Module de révision style manga pour les élèves du Québec (primaire et secondaire), accessible sur tous les appareils du même Wi-Fi.

## Lancer

```bash
cd "Module de test"
npm start
```

Le terminal affiche l'adresse à ouvrir, par ex. `http://192.168.2.114:3000`, sur la tablette, le téléphone ou l'ordinateur de l'ado.
(Au premier lancement, macOS peut demander d'autoriser « node » à accepter les connexions entrantes : clique sur **Autoriser**.)

## Comptes et admin

- Chaque élève **crée son compte** (identifiant + mot de passe) sur l'ordinateur ou le téléphone, puis choisit sa matière et son sujet.
- L'interface s'adapte : **version web** (tableau de bord complet) et **version mobile** (onglets Accueil / Code / Cours / Progrès).
- Bouton **🛡 Admin** : connexion avec le courriel et le mot de passe admin (à la toute première visite, il demande de créer ce compte admin). L'espace admin montre l'avancement de tous les comptes (révisions, tests, moyennes, dernier résultat, activité), permet de réinitialiser un mot de passe, de supprimer un compte et de régler la clé API.

## Activer l'IA (recherche internet, photos, tests sur mesure)

Sans clé, l'appli tourne en **mode démo** (petite banque de questions en maths, en français et en anglais).
Pour que Sensei cherche sur internet et crée les fiches et les tests sur n'importe quel sujet :

- dans 🛡 **Admin → Clé API**, colle une clé API Anthropic (console.anthropic.com), **ou**
- crée un fichier `.env` contenant `ANTHROPIC_API_KEY=sk-ant-...`

## Fonctionnement

1. **Profil** : nom, école (liste officielle des écoles du Québec, Données Québec), année scolaire, avatar. La matière et le sujet se choisissent ensuite dans le profil (liste de sujets défilante).
2. **Réviser** : Sensei cherche le sujet sur internet (Alloprof, Progression des apprentissages…), lit les photos de cours, puis crée une fiche de révision (avec schémas visuels, et exemples audio 🔊 en anglais) et un quiz avec correction immédiate. Chaque révision terminée est comptée dans le profil.
3. **Test final** : questions notées sur 100 %, sans correction pendant le test, puis rang (S/A/B/C/D) et corrigé complet. Il cible les notions ratées pendant les révisions.
4. **Réglages par profil** : minuteur (activable, secondes par question à choix / ouverte), nombre de questions, répartition QCM / questions ouvertes (70 / 30 par défaut).
5. **Télécommande téléphone** : dans le profil, « Connecter mon téléphone » affiche un code à 4 chiffres. Sur le téléphone, entre ce code sur la page d'accueil : il devient une manette (boutons A/B/C/D, champ texte pour les questions ouvertes, bouton Confirmer). Les questions et le temps restent sur l'ordinateur. À 10 secondes de la fin, le contour du téléphone clignote en rouge.
6. **Aide aux devoirs** : photo ou texte de l'exercice → reformulation, méthode, indices progressifs, solution cachée.
7. **📖 Dico (anglais)** : quand la matière est l'anglais, un bouton « Dico » apparaît en haut. Il ouvre une fenêtre où l'on colle des mots ou des phrases anglaises : traduction, prononciation 🔊, exemple en anglais et en français, synonymes anglais et français (cliquables). Les traductions sont gardées en cache.
8. **Photos de cours** : classées par matière/sujet, analysées une fois, puis utilisées pour personnaliser les questions.

Les données (comptes, résultats, photos, mots de passe hachés) restent sur cet ordinateur dans le dossier `data/`.
Les recherches internet sont mises en cache par niveau/matière/sujet pour accélérer les révisions suivantes.
