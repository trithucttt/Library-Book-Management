import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Author {
  @Prop({ required: true })
  fullName: string;

  @Prop()
  dayOfBirth: Date;

  @Prop()
  nationality: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Book' }] })
  books: Types.ObjectId[];
}
export const AuthorSchema = SchemaFactory.createForClass(Author);
