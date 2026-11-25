import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    regNumber: {
      type: String,
      required: [true, 'Vehicle registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: [true, 'Brand reference is required'],
    },
    model: {
      type: String,
      required: [true, 'Car model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1990,
      max: 2027,
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'EV', 'CNG', 'Hybrid'],
      default: 'Petrol',
    },
    chassisNumber: {
      type: String,
      trim: true,
      default: '',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer owner reference is required'],
    },
    mileageKm: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

vehicleSchema.index({ customer: 1 });
vehicleSchema.index({ brand: 1, model: 1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
