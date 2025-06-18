
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install


COPY . .


RUN npx prisma generate

RUN npm run build

FROM node:22-alpine AS production


WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env ./

ENV NODE_ENV=production
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/main"]
