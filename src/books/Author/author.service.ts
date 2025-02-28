import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAuthorDto } from 'src/dto/create-author.dto';
import { Author, AuthorDocument } from 'src/schemas/author.schema';
import { BookDocument } from 'src/schemas/book.schema';

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel('Author') private readonly authorModel: Model<AuthorDocument>,
    @InjectModel('Book') private readonly bookModel: Model<BookDocument>,
  ) {}

  async createAuthor(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const newAuthor = new this.authorModel(createAuthorDto);
    return newAuthor.save();
  }

  async getAuthorsById(authorId: string): Promise<Author[]> {
    const authors = await this.authorModel
      .find({ _id: { $in: authorId } })
      .lean()
      .exec();
    return authors;
  }

  async getAllAuthors(): Promise<Author[]> {
    return this.authorModel.find().lean().exec();
  }

  async deleteAuthor(id: string) {
    const author = this.authorModel.findById(id);

    const book = this.bookModel.findOne({ authors: author });
    if (!author) {
      throw new NotFoundException('Author not found with id' + id);
    }
    if (book) {
      throw new BadRequestException(
        'Cannot delete author because they still have books associated ',
      );
    }
    return this.authorModel.findByIdAndDelete(id).exec();
  }
}
