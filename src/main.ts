import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import 'dotenv/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  // // CORS setup for multiple frontends
  // const allowedOrigins = [
  //   process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174', // URL dashboard admin
  //   process.env.USER_FRONTEND_URL || 'http://localhost:5173', // URL giao diện người dùng
  // ];

  app.enableCors({
    origin: true, // Hoặc chỉ định rõ ['http://localhost:5174']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
