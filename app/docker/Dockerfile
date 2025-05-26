# Étape 1 : Utiliser une image Node officielle
FROM node:20-alpine

# Étape 2 : Définir le répertoire de travail
WORKDIR /usr/src/app

# Étape 3 : Copier les fichiers de dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install --production

# Étape 5 : Copier le reste du code
COPY . .

# Étape 6 : Exposer le port
EXPOSE 3000

# Étape 7 : Lancer l'application
CMD ["node", "server.js"]
