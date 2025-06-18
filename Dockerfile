# Stage 1: Build ứng dụng NestJS
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run ứng dụng
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist


EXPOSE 3000

CMD ["node", "dist/main"]
