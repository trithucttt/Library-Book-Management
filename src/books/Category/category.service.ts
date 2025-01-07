import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BookDocument } from 'src/schemas/book.schema';
import { Category, CategoryDocument } from 'src/schemas/category.schema';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel('Book') private bookModel: Model<BookDocument>,
  ) {}

  async createCategory(name: string, description?: string): Promise<Category> {
    const category = new this.categoryModel({ name, description });
    return category.save();
  }

  async updateCategory(
    id: string,
    name: string,
    description?: string,
  ): Promise<Category> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return this.categoryModel.findByIdAndUpdate(
      id,
      { name, description },
      { new: true },
    );
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryModel.findById(id).exec();
  }
  async deleteCategory(id: string): Promise<Category> {
    const category = await this.categoryModel.findOne({ _id: id });
    if (!category) {
      throw new Error('Category not found');
    }
    const categoryIsInBook = await this.bookModel.findOne({ categories: id });
    if (categoryIsInBook) {
      throw new Error('Category is in book');
    }
    return this.categoryModel.findByIdAndDelete(id).exec();
  }
}
