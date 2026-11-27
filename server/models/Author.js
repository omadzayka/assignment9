import mongoose from 'mongoose';
import {toJSONTransform, yearValidator } from './shared.js';

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      minLength: [1, 'name must have 1 to 100 characters'],
      maxLength: [100, 'name must have 1 to 100 characters'],
    },
    born: {
      type: Number,
      min: [1000, 'born must be a whole number between 1000 and the current year'],
      validate: yearValidator('born'),
      cast: 'born must be a number',
    },
  },
  { timestamps: true, strict: true, toJSON: { transform: toJSONTransform } }
);

// Unique name, compared case-insensitively (collation strength 2).
authorSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model('Author', authorSchema);
