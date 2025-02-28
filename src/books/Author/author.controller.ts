import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from 'src/dto/create-author.dto';

@Controller('author')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post('create')
  async createAuthor(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.createAuthor(createAuthorDto);
  }

  @Get('all')
  async getAllAuthors() {
    return this.authorService.getAllAuthors();
  }

  @Get(':id')
  async getAuthorById(@Param('id') id: string) {
    return this.authorService.getAuthorsById(id);
  }
}
