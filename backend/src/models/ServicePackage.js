import mongoose from 'mongoose';

const servicePackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service package name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Periodic Maintenance',
        'Brake Service',
        'Engine Diagnostic',
        'AC Service',
        'Wheel Alignment',
        'Body Repair & Detailing',
        'Electrical Repair',
      ],
      default: 'Periodic Maintenance',
    },
    description: {
      type: String,
      default: '',
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDurationHours: {
      type: Number,
      default: 2,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

servicePackageSchema.index({ category: 1 });

export const ServicePackage = mongoose.model('ServicePackage', servicePackageSchema);
