FROM node:20 As development

# Required for Prisma Client to work in container
RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN npm run prisma:generate

USER node