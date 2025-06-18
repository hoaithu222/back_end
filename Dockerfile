# Stage 1: Build ứng dụng NestJS
FROM node:22-alpine AS builder

WORKDIR /app

# Copy và cài đặt dependency
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn, bao gồm cả thư mục prisma
COPY . .

# ✅ Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Stage 2: Run ứng dụng
FROM node:22-alpine

WORKDIR /app

# Cài các file cần thiết từ builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma  # ✅ Copy thư mục prisma (nếu bạn cần migrations hoặc schema)

# Port mặc định của NestJS
EXPOSE 3000

# Start app
CMD ["node", "dist/main"]
