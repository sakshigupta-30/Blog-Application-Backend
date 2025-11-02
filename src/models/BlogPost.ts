import mongoose, { Document, Schema } from 'mongoose';
import { IBlogPost } from '../types';

interface IBlogPostDocument extends Omit<IBlogPost, '_id'>, Document {}

const blogPostSchema = new Schema<IBlogPostDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBlogPostDocument>('BlogPost', blogPostSchema);