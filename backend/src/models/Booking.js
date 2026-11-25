import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    serviceCentre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCentre',
      required: true,
    },
    servicePackages: [
      {
        package: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ServicePackage',
        },
        name: String,
        price: Number,
      },
    ],
    partsUsed: [
      {
        part: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'InventoryPart',
        },
        name: String,
        quantity: { type: Number, default: 1 },
        unitPrice: Number,
        totalPrice: Number,
      },
    ],
    status: {
      type: String,
      enum: [
        'Booked',
        'Inspection',
        'In Progress',
        'Parts Replacement',
        'Ready',
        'Completed',
        'Cancelled',
      ],
      default: 'Booked',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    labourCost: {
      type: Number,
      default: 0,
    },
    partsCost: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid'],
      default: 'Pending',
    },
    assignedMechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    serviceAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerFeedbackRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound and single indexes for ultra-fast queries & aggregation performance
bookingSchema.index({ status: 1, scheduledDate: -1 });
bookingSchema.index({ serviceCentre: 1, createdAt: -1 });
bookingSchema.index({ customer: 1 });
bookingSchema.index({ vehicle: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ createdAt: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
