import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book, BookSchema } from 'src/schemas/book.schema';
import { Author, AuthorSchema } from 'src/schemas/author.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Loan, LoanSchema } from 'src/schemas/loan.schema';
import { CategoryService } from './Category/category.service';
import { CategoryController } from './Category/category.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Author.name, schema: AuthorSchema },
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
      { name: Loan.name, schema: LoanSchema },
    ]),
  ],
  controllers: [BooksController, CategoryController],
  providers: [BooksService, CategoryService],
})
export class BooksModule {}
