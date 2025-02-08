import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SendEmailModule } from './modules/send-email/send-email.module';
import { AuthMiddleware } from './middleware/auth/auth.middleware';
import { PrismaService } from './prisma.service';
import { AuthService } from './modules/auth/auth.service';
import { UploadModule } from './modules/upload/upload.module';
import { AddressModule } from './modules/address/address.module';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/sub-category/sub-category.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { ShopModule } from './modules/shop/shop.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    UsersModule,
    SendEmailModule,
    UploadModule,
    AddressModule,
    CategoryModule,
    SubCategoryModule,
    AttributesModule,
    ShopModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        // Loại trừ các routes callback khỏi middleware
        { path: '/auth/social/google/callback', method: RequestMethod.GET },
        { path: '/auth/social/facebook/callback', method: RequestMethod.GET },
        { path: '/auth/social/github/callback', method: RequestMethod.GET },
      )
      .forRoutes(
        {
          path: 'auth/profile',
          method: RequestMethod.GET,
        },
        {
          path: 'auth/logout',
          method: RequestMethod.POST,
        },
        {
          path: 'upload/image',
          method: RequestMethod.POST,
        },
        {
          path: 'users/update/:id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'address/create',
          method: RequestMethod.POST,
        },
        {
          path: 'address',
          method: RequestMethod.GET,
        },
        {
          path: 'address/:id',
          method: RequestMethod.PATCH,
        },
        // category
        {
          path: 'category',
          method: RequestMethod.POST,
        },
        {
          path: 'category/:id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'category/:id',
          method: RequestMethod.DELETE,
        },
        // sub-category
        {
          path: 'sub-category',
          method: RequestMethod.POST,
        },
        {
          path: 'sub-category/:id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'sub-category/:id',
          method: RequestMethod.DELETE,
        },
        // attributes
        {
          path: 'attributes',
          method: RequestMethod.POST,
        },
        {
          path: 'attributes/:id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'attributes/:id',
          method: RequestMethod.DELETE,
        },
        //shop
        {
          path: 'shop',
          method: RequestMethod.POST,
        },
        {
          path: 'shop',
          method: RequestMethod.GET,
        },
        // {
        //   path: 'shop/:id',
        //   method: RequestMethod.GET,
        // },
        {
          path: 'shop/:id',
          method: RequestMethod.PATCH,
        },
        {
          path: 'shop/:id/active',
          method: RequestMethod.PATCH,
        },
        //Products
        {
          path: 'products',
          method: RequestMethod.POST,
        },
        {
          path: 'products',
          method: RequestMethod.PATCH,
        },
        {
          path: 'products',
          method: RequestMethod.DELETE,
        },
      );
  }
}
