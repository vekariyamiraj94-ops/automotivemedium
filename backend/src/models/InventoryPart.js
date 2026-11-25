import mongoose from 'mongoose';

const inventoryPartSchema = new mongoose.Schema(
  {
    partNumber: {
      type: String,
      required: [true, 'Part number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Part name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Engine', 'Brakes', 'Suspension', 'Filters', 'Fluids', 'Electrical', 'Tyres', 'Body'],
      default: 'Engine',
    },
    compatibleBrands: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
      },
    ],
    unitCost: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minReorderThreshold: {
      type: Number,
      default: 5,
    },
    supplier: {
      type: String,
      default: 'Automotive Genuine Spares Ltd',
    },
  },
  { timestamps: true }
);

inventoryPartSchema.index({ category: 1 });
inventoryPartSchema.index({ stockQuantity: 1 });

export const InventoryPart = mongoose.model('InventoryPart', inventoryPartSchema);
