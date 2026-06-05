# Sunu-idées

Sunu-idées est une application permettant de recueillir, gérer et valoriser des idées (innovation, amélioration de processus, projets, etc.).  
L’objectif du projet est de fournir une plateforme simple où les utilisateurs peuvent proposer des idées, les consulter, les commenter et éventuellement les valider.

---

## Objectifs du projet

- Permettre aux utilisateurs de **soumettre leurs idées** facilement.
- Mettre en place un **système de gestion** des idées (création, consultation, modification, suppression).
- Offrir une interface claire pour **lister et filtrer** les idées.
- Poser les bases d’un **workflow de validation** (statuts, commentaires, etc. – à adapter selon ton code réel).

---

## fonctionnalitée clé 

Le projet est organisé en plusieurs parties :
-Partie 1:  
  - Fournit une API pour gérer les idées (CRUD : Create, Read, Update, Delete).
  - Gère la logique métier (validation des données, statuts d’idée, etc.).
  - Assure la connexion à la base de données.

-Partie 2:  
  - Stocke les idées et leurs métadonnées (titre, description, auteur, date, statut, etc.).
  - Permet de rechercher et filtrer les idées.

-Partie 3  :  
  - Affiche la liste des idées.
  - Propose des formulaires pour créer ou modifier une idée.
  - Permet de consulter les détails d’une idée.

---

## Technologies utilisées
- Langage backend : `supabase` 
- Framework frontend : `HTML/CSS/Bootstrap` 
- Base de données : `supabase` 
- Outils et dépendances :
  - Gestion de versions : Git / GitHub 
  - le lien débloyer: `https://incredible-peony-2910e5.netlify.app/`

---

## Architecture du code (front)

- `main.js` : logique d’interface (écouteurs d’événements, wiring entre UI, API et validations).  
- `api/supabase.js` : fonctions CRUD pour les idées.  
- `api/openrouter.js` : intégration de l’IA OpenRouter pour la suggestion automatique de catégorie, avec fallback robuste.  
- `utils/validation.js` : règles de validation pour les champs (titre, description, etc.).  
- `utils/ui.js` : helpers d’interface (toasts, modales de confirmation, formatage de date, badges de catégories).

---


Parfait, bonne nouvelle que tout fonctionne à nouveau.

Pour résumer ce que tu as mis en place :

Projet NPM initialisé avec package.json
Vite installé et utilisé comme serveur de dev (npm run dev)
Supabase utilisé via @supabase/supabase-js (NPM) dans main.js
Clés sensibles (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_OPENROUTER_API_KEY) isolées dans .env
Ancien app.js et CDN Supabase supprimés du HTML
Si tu veux, on peut maintenant :

