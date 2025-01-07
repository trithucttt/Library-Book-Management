import { Types } from 'mongoose';
import { ConvertAuthorInterface } from './convertAuthor-interface';

export interface ConvertBookInterface {
  _id?: Types.ObjectId;
  title: string;
  description?: string;
  publishedYear?: string;
  isAvailable: boolean;
  authors: ConvertAuthorInterface[];
  borrowCount: number;
  createdAt: Date;
  quantity: number;
  imageUrl?: string[];
}
