FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
RUN mkdir -p /app/storage/private && chown -R node:node /app

USER node
EXPOSE 5001

CMD ["node", "src/server.js"]
