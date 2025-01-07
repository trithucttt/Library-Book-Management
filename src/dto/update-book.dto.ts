import { Transform } from 'class-transformer';
import { IsArray, Min } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateBookDto {
  readonly title?: string;
  readonly description?: string;
  readonly publishedYear?: string;
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : JSON.parse(value)))
  authors?: Types.ObjectId[];
  @Min(1)
  quantity?: number;
  imageUrl?: string[];
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : JSON.parse(value)))
  categories?: Types.ObjectId[];
}
