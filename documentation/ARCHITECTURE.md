# 🏗 Architecture du projet

---

## ⚙️ Stack technique

| Élément         | Technologie        |
|-----------------|--------------------|
| Langage         | JavaScript (Node.js) |
| Framework       | Express.js         |
| Base de données | MariaDB (via Sequelize) |
| Authentification| JWT, Bcrypt        |
| Conteneurisation| Docker             |

---

## 🧱 Structure du projet

├── server.js # Point d'entrée principal de l'application
├── app/
│ ├── app.js # Configuration de l'application Express
│ ├── config/ # Fichiers de configuration (DB, env, etc.)
│ ├── controllers/ # Logique métier par entité
│ ├── middlewares/ # Middlewares (authentification, erreurs, etc.)
│ ├── migrations/ # Fichiers de migration de base de données
│ ├── models/ # Modèles Sequelize (utilisateur, match, etc.)
│ ├── routes/ # Définition des routes par entité
│ ├── seeders/ # Données initiales (ex : utilisateurs de test)


---

## 🧩 Principaux modules

| Module       | Rôle                                                                 |
|--------------|----------------------------------------------------------------------|
| **Users**     | Gestion des utilisateurs, inscription, login, rôles, mot de passe   |
| **Auth**      | JWT, vérification de token, chiffrement des mots de passe avec bcrypt |
| **Trainings**    | Création et gestion des matchs/entraînements                        |
| **Presence**  | Suivi de la présence des membres aux matchs/entraînements                    |
| **Convocations** |  Gestion des convocations aux matchs  |
| **Articles** |  Gestion des articles  |
| **Messagerie** |  Gestion d'une messagrie privée et de groupe  |

---

## 🔐 Authentification et sécurité

- **Bcrypt** est utilisé pour hasher les mots de passe des utilisateurs.
- **JWT** (JSON Web Tokens) pour sécuriser les routes avec un middleware `authMiddleware`.
- Les routes protégées nécessitent un token JWT valide passé dans le header `Authorization`.

---

## 🔄 Flux de données

1. Les **clients React Native ou NextJS** effectuent une requête vers une route de l'API.
2. Express.js reçoit la requête via `server.js` → `app/app.js`.
3. Les middlewares sont exécutés.
4. La route est traitée par le contrôleur correspondant.
5. Le contrôleur communique avec la base via les modèles Sequelize.
6. Une réponse est renvoyée au client en JSON.

---

## 🐳 Conteneurisation (Docker)

Le projet est conteneurisé pour faciliter le déploiement et les environnements de développement reproductibles.

- Un fichier `Dockerfile` définit l’image de l’API.
- `docker-compose.yml` est utilisé pour lier l’API aux conteneurs **MariaDB** et **PhpMyAdmin**.

---

## 🧪 Tests

> Pas encore développé

---

## 🚀 Déploiement & environnement

> Pas encore développé

---

## 📌 À venir / Améliorations possibles

> Pas encore développé

---