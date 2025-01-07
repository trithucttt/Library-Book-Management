import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookDocument = HydratedDocument<Book>;

@Schema()
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  publishedYear?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Author' }] })
  authors: Types.ObjectId[];

  @Prop({ default: 0 })
  borrowCount: number;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ type: [String], default: [] })
  imageUrl?: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Category' }] })
  categories: Types.ObjectId[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
