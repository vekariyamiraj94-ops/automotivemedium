import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    popularModels: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

brandSchema.index({ isActive: 1 });

export const Brand = mongoose.model('Brand', brandSchema);
