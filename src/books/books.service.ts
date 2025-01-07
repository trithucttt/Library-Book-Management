import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Book, BookDocument } from 'src/schemas/book.schema';
import { CreateBookDto } from 'src/dto/create-book.dto';
import { UpdateBookDto } from 'src/dto/update-book.dto';
import { Author } from 'src/schemas/author.schema';
import { CreateAuthorDto } from 'src/dto/create-author.dto';
import { MessageResponse } from 'src/dto/message-response.dto';
import { BookInterface } from 'src/interface/book-interface';
import { ConvertAuthorInterface } from 'src/interface/convertAuthor-interface';
import { ConvertBookInterface } from 'src/interface/convertBook-interface';
import { ConfigService } from '@nestjs/config';
import { Loan, LoanDocument } from 'src/schemas/loan.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { Category } from 'src/schemas/category.schema';
@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @InjectModel(Author.name) private authorModel: Model<Author>,
    @InjectModel(Loan.name) private loanModel: Model<LoanDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private configService: ConfigService,
  ) {
    const cloudinaryConfig = this.configService.get('cloudinary');
    cloudinary.config({
      cloud_name: cloudinaryConfig.cloud_name,
      api_key: cloudinaryConfig.api_key,
      api_secret: cloudinaryConfig.api_secret,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'image',
      });
      console.log(result.secure_url);
      return result.secure_url;
    } catch (error) {
      throw new Error(`Cloudinary upload error: ${error.message}`);
    }
  }

  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    if (typeof createBookDto.authors === 'string') {
      createBookDto.authors = JSON.parse(createBookDto.authors);
    }

    // Kiểm tra từng phần tử trong authors phải là ObjectId hợp lệ
    createBookDto.authors = createBookDto.authors.map((id) => {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid author ID: ${id}`);
      }
      return new Types.ObjectId(id);
    });

    const newBook = new this.bookModel(createBookDto);
    // return newBook.save();
    if (!newBook) {
      throw new BadRequestException('Error create book');
    }
    await this.authorModel.updateMany(
      { _id: { $in: createBookDto.authors } },
      { $push: { books: newBook._id } },
    );

    await this.categoryModel.updateMany(
      { _id: { $in: createBookDto.categories } },
      { $push: { books: newBook._id } },
    );
    return newBook.save();
  }

  async createAuthor(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const newAuthor = new this.authorModel(createAuthorDto);
    return newAuthor.save();
  }

  mapToConvertAuthor(author: Author): ConvertAuthorInterface {
    return {
      name: author.fullName,
      dayOfBirth: author.dayOfBirth,
      nationality: author.nationality,
    };
  }

  async findAllBook(): Promise<MessageResponse> {
    const books: BookInterface[] = await this.bookModel.find().lean().exec();
    const convertBook: ConvertBookInterface[] = await Promise.all(
      books.map(async (book) => {
        const authors: Author[] = await this.getAuthorsByIds(book.authors);
        const convertAuthors = authors.map((author: Author) =>
          this.mapToConvertAuthor(author),
        );

        return {
          ...book,
          description: book.description || 'No description available',
          publishedYear: book.publishedYear || 'Unknown',
          authors: convertAuthors,
        };
      }),
    );

    return new MessageResponse(200, 'Success', convertBook);
  }

  private async getAuthorsByIds(
    authorIds: Types.ObjectId[],
  ): Promise<Author[]> {
    const authors = await this.authorModel
      .find({ _id: { $in: authorIds } })
      .lean()
      .exec();
    return authors;
  }

  async findOneBook(id: string): Promise<MessageResponse> {
    const book: BookInterface = await this.bookModel.findById(id).lean().exec();

    if (!book) {
      return new MessageResponse(404, 'Book not found', null);
    }

    const authors = await this.getAuthorsByIds(book.authors);
    const convertAuthor: ConvertAuthorInterface[] = authors.map(
      (author: Author) => ({
        name: author.fullName,
        dayOfBirth: author.dayOfBirth,
        nationality: author.nationality,
      }),
    );

    // Kết hợp book và authors
    const convertBook: ConvertBookInterface = {
      ...book,
      description: book.description || 'No description available',
      publishedYear: book.publishedYear || 'Unknown',
      authors: convertAuthor,
    };

    return new MessageResponse(200, 'Success', convertBook);
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const existingBook = await this.bookModel.findById(id);
    if (!existingBook) {
      throw new Error('Book not found');
    }
    const oldImage = await this.bookModel
      .findById(id)
      .select('imageUrl')
      .exec();
    if (updateBookDto.imageUrl) {
      const newImage = updateBookDto.imageUrl;
      const deleteImage = newImage.filter(
        (image) => !oldImage.imageUrl.includes(image),
      );
      if (deleteImage) {
        deleteImage.map(async (image) => {
          await cloudinary.uploader.destroy(image);
        });
      }
    }
    if (updateBookDto.authors) {
      await this.authorModel.updateMany(
        { _id: { $in: existingBook.authors } },
        { $pull: { books: id } },
      );
      await this.authorModel.updateMany(
        { _id: { $in: updateBookDto.authors } },
        { $pull: { books: id } },
      );
    }
    return (
      await this.bookModel.findByIdAndUpdate(id, updateBookDto, { new: true })
    )
      .populated('authors')
      .exec();
  }

  async removeBook(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid book ID: ${id}`);
    }
    const book = await this.bookModel.findById(id);
    const borrowedBook = await this.loanModel.findOne({ book: id });
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (!borrowedBook) {
      throw new BadRequestException('Book is borrowed cannot delete');
    }
    return this.bookModel.findByIdAndDelete(id).exec();
  }

  async borrowBook(
    bookId: string,
    username: string,
    returnDate: Date,
  ): Promise<MessageResponse> {
    const book = await this.bookModel.findById(bookId);
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (book.quantity <= 0) {
      throw new BadRequestException('Out of stock');
    }
    const borrowedAt = new Date();
    if (returnDate <= borrowedAt) {
      throw new BadRequestException('Invalid return date');
    }
    const newLoan = new this.loanModel({
      user: user._id,
      book: book._id,
      borrowedAt,
      dueDate: returnDate,
    }).save();
    if (newLoan) {
      await this.bookModel.findByIdAndUpdate(bookId, {
        $inc: { quantity: -1 },
      });
      return new MessageResponse(201, 'Borrow book successfully', newLoan);
    } else {
      throw new BadRequestException('Error borrow book');
    }
  }

  async returnBook(loanId: string): Promise<MessageResponse> {
    const loan = await this.loanModel.findById(loanId);
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }
    if (loan.isReturned) {
      throw new BadRequestException('Book already returned');
    }
    const returnedAt = new Date();
    const updatedLoan = await this.loanModel
      .findByIdAndUpdate(
        loanId,
        { returnedAt, isReturned: true },
        { new: true },
      )
      .exec();
    if (updatedLoan) {
      await this.bookModel.findByIdAndUpdate(updatedLoan.book, {
        $inc: { quantity: +1 },
      });
      return new MessageResponse(200, 'Return book successfully', updatedLoan);
    } else {
      throw new BadRequestException('Error return book');
    }
  }

  async getAllLoans(): Promise<MessageResponse> {
    const loans = await this.loanModel.find().lean().exec();
    return new MessageResponse(200, 'Success', loans);
  }

  async getLoanByUser(username: string): Promise<MessageResponse> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const loans = await this.loanModel.find({ user: user._id }).lean().exec();
    if (!loans) {
      throw new NotFoundException('Loan not found');
    }
    return new MessageResponse(200, 'Success', loans);
  }
}
