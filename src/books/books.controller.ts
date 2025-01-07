import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { CreateAuthorDto } from '../dto/create-author.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // @Post('/create')
  // createBook(@Body() createBookDto: CreateBookDto) {
  //   return this.booksService.create(createBookDto);
  // }
  @Post('create')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads', // Thư mục tạm thời để lưu ảnh
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Chỉ cho phép các định dạng ảnh
        // console.log('File mimetype:', file.mimetype);
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createBook(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createBookDto: CreateBookDto,
  ) {
    try {
      // console.log('Image FIle', files);
      const imageUrls = await Promise.all(
        files.map((file) => this.booksService.uploadImage(file)),
      );
      createBookDto.imageUrl = imageUrls;
      const newBook = this.booksService.createBook(createBookDto);
      return newBook;
    } catch (error) {
      throw new BadRequestException(`Error creating book: ${error.message}`);
    }
  }

  @Post('/author')
  createAuthor(@Body() createAuthor: CreateAuthorDto) {
    return this.booksService.createAuthor(createAuthor);
  }

  @Get('all')
  findAll() {
    return this.booksService.findAllBook();
  }

  @Get(':id')
  findAOneBook(@Param('id') id: string) {
    return this.booksService.findOneBook(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.removeBook(id);
  }

  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Folder to store the image temporarily
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Validate file type (only images allowed)
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Invalid file type'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    try {
      // Call the service method to upload the image to Cloudinary
      const imageUrl = await this.booksService.uploadImage(file);
      return { imageUrl };
    } catch (error) {
      throw new BadRequestException(`Error uploading image: ${error.message}`);
    }
  }
}
