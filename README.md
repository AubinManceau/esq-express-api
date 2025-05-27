# 🏗️ API REST - Back-End application ESQ

## 📚 Description

Ce projet est une API RESTful construite avec **Node.js**, **Express**, **Sequelize** et une base de données **MariaDB**.  
Il permet de gérer des utilisateurs, des rôles, des catégories, des entraînements, des messages privés, des groupes de discussion et des convocations.

L’API est documentée avec **Swagger** pour faciliter son utilisation.

---

## 🚀 Fonctionnalités

- Authentification et gestion des utilisateurs
- Gestion des rôles et catégories
- Entraînements et gestion des présences
- Système de messagerie privée et de groupe
- Gestion des équipes et coachs
- Génération de convocations

---

## 🧱 Prérequis

- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) et Docker Compose
- [Git](https://git-scm.com/)

---

## 🔧 Installation

```bash
git clone https://github.com/votre-utilisateur/votre-projet.git
cd votre-projet
cp .env.example .env
# Modifier les variables d'environnement
```

#### 🐳 Lancer l’environnement avec Docker

```bash
docker-compose up --build
```

🛠️ Migrations et Seeders
```bash
npm run migrate
npm run seed
```

🧪 Lancer les tests
```bash
# Pas encore développé
```

---

## 📖 Liens utiles

API - [http://localhost:3000/api/v1](http://localhost:3000/api/v1/api-docs)
PMA - [http://localhost:8080](http://localhost:8080)

---
