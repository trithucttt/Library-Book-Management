import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LoanDocument = HydratedDocument<Loan>;

@Schema()
export class Loan {
  // Người mượn sach
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  // Sách được mượn
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;

  // Thời gian mượn sách
  @Prop({ required: true })
  borrowedAt: Date;

  // Hạn trả sách
  @Prop({ required: true })
  dueDate: Date;

  // Thời gian trả sách (nếu đã trả)
  @Prop()
  returnedAt?: Date;

  // Trạng thái trả sách
  @Prop({ default: false })
  isReturned: boolean;

  // Ghi chú thêm
  @Prop()
  notes?: string;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
