FROM node:22-bullseye AS runner

WORKDIR /app

COPY package*.json ./
COPY server.js ./

RUN npm ci

CMD ["npm", "run", "start"]
