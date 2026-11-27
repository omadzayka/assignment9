import mongoose from 'mongoose';
import { toJSONTransform, yearValidator } from './shared.js';

export const GENRES = ['fiction', 'non-fiction', 'science', 'history', 'fantasy', 'other'];

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      minLength: [1, 'title must have 1 to 100 characters'],
      maxLength: [100, 'title must have 1 to 100 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'author is required'],
      cast: 'author must be the id of an existing author',
    },
    year: {
      type: Number,
      required: [true, 'year is required'],
      min: [1000, 'year must be a whole number between 1000 and the current year'],
      validate: yearValidator('year'),
      cast: 'year must be a number',
    },
    genre: {
      type: String,
      enum: { values: GENRES, message: `genre must be one of: ${GENRES.join(', ')}` },
      default: 'other',
    },