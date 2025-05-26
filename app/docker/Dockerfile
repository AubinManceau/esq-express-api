# Étape 1 : Utiliser une image officielle Node
FROM node:20-alpine

# Étape 2 : Définir le répertoire de travail
WORKDIR /usr/src/app

# Étape 3 : Copier les fichiers package pour installer les deps
COPY package*.json ./

# Étape 4 : Installer les dépendances
# Utilise l'ARG pour basculer entre prod et dev
ARG NODE_ENV=prod
ENV NODE_ENV=$NODE_ENV

RUN if [ "$NODE_ENV" = "dev" ]; \
    then npm install; \
    else npm install --omit=dev; \
    fi

# Étape 5 : Copier le reste du code
COPY . .

# Étape 6 : Exposer le port
EXPOSE 3000

# Étape 7 : Démarrer l'application
CMD ["node", "server.js"]
