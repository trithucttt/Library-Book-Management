import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { BooksModule } from './books/books.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import cloudinaryConfig from './config/cloudinary.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cloudinaryConfig],
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/book_management'),
    BooksModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
