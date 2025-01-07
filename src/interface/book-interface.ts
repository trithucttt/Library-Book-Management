import { Types } from 'mongoose';

export interface BookInterface {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  publishedYear?: string;
  isAvailable: boolean;
  authors: Types.ObjectId[];
  borrowCount: number;
  createdAt: Date;
  quantity: number;
  imageUrl?: string[];
}
