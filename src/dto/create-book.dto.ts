import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;
  readonly description?: string;
  readonly publishedYear?: string;
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : JSON.parse(value)))
  authors: Types.ObjectId[];
  quantity: number;
  imageUrl: string[];
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : JSON.parse(value)))
  categories: Types.ObjectId[];
}
