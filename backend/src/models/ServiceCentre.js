import mongoose from 'mongoose';

const serviceCentreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service centre name is required'],
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    capacityBays: {
      type: Number,
      default: 10,
    },
    activeMechanics: {
      type: Number,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

serviceCentreSchema.index({ city: 1 });

export const ServiceCentre = mongoose.model('ServiceCentre', serviceCentreSchema);
