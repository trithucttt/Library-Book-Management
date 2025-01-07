import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
@Schema()
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['ADMIN', 'LIBRARIAN', 'MEMBER'], default: 'MEMBER' })
  role: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  // Danh sách các giao dịch mượn sách
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Loan' }] })
  loans: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
