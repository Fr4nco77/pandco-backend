import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductModule } from './product/product.module.js';
import { AddressModule } from './address/address.module.js';
import { WishlistModule } from './wishlist/wishlist.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrderModule } from './order/order.module.js';
import { CollectionModule } from './collection/collection.module.js';
import { TypeModule } from './type/type.module.js';
import { ProductVariantModule } from './product-variant/product-variant.module.js';
import { ProductImageModule } from './product-image/product-image.module.js';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 1000 * 60 * 5, // 5 minutos por defecto
      max: 100, // Máximo número de elementos en memoria para no saturar RAM
    }),
    AuthModule,
    UserModule,
    ProductModule,
    AddressModule,
    WishlistModule,
    CartModule,
    OrderModule,
    CollectionModule,
    TypeModule,
    ProductVariantModule,
    ProductImageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
