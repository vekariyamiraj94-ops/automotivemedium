import { Booking } from '../models/Booking.js';
import { InventoryPart } from '../models/InventoryPart.js';

// Helper to generate formatted booking number
const generateBookingNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `BK-${timestamp}-${random}`;
};

// @desc    Get all bookings with pagination and filters
// @route   GET /api/bookings
export const getBookings = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { status, serviceCentre, priority, search } = req.query;

  const query = {};
  if (status) query.status = status;
  if (serviceCentre) query.serviceCentre = serviceCentre;
  if (priority) query.priority = priority;
  if (search) {
    query.bookingNumber = { $regex: search, $options: 'i' };
  }

  const [total, bookings] = await Promise.all([
    Booking.countDocuments(query),
    Booking.find(query)
      .populate('customer', 'name email phone')
      .populate({
        path: 'vehicle',
        populate: { path: 'brand', select: 'name logoUrl' },
      })
      .populate('serviceCentre', 'name city code')
      .populate('assignedMechanic', 'name role')
      .populate('serviceAdvisor', 'name role')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.json({
    success: true,
    count: bookings.length,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    },
    data: bookings,
  });
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer')
    .populate({
      path: 'vehicle',
      populate: { path: 'brand' },
    })
    .populate('serviceCentre')
    .populate('assignedMechanic', 'name role')
    .populate('serviceAdvisor', 'name role')
    .populate('servicePackages.package')
    .populate('partsUsed.part');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, data: booking });
};

// @desc    Create new booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  const bookingData = {
    ...req.body,
    bookingNumber: req.body.bookingNumber || generateBookingNumber(),
  };

  // Calculate costs if not directly provided
  const labourCost = req.body.labourCost || 0;
  const partsCost = (req.body.partsUsed || []).reduce(
    (sum, p) => sum + (p.totalPrice || p.quantity * (p.unitPrice || 0)),
    0
  );
  bookingData.labourCost = labourCost;
  bookingData.partsCost = partsCost;
  bookingData.totalAmount = req.body.totalAmount || labourCost + partsCost;

  const booking = await Booking.create(bookingData);

  // Decrement inventory stock if parts were specified
  if (req.body.partsUsed && req.body.partsUsed.length > 0) {
    for (const p of req.body.partsUsed) {
      if (p.part) {
        await InventoryPart.findByIdAndUpdate(p.part, {
          $inc: { stockQuantity: -p.quantity },
        });
      }
    }
  }

  const populated = await Booking.findById(booking._id)
    .populate('customer')
    .populate({
      path: 'vehicle',
      populate: { path: 'brand' },
    })
    .populate('serviceCentre');

  res.status(201).json({ success: true, data: populated });
};

// @desc    Update booking / advance workflow status
// @route   PUT /api/bookings/:id
export const updateBooking = async (req, res) => {
  const updateData = { ...req.body };
  if (updateData.status === 'Completed' && !updateData.completedAt) {
    updateData.completedAt = new Date();
  }

  const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('customer')
    .populate({
      path: 'vehicle',
      populate: { path: 'brand' },
    })
    .populate('serviceCentre');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, data: booking });
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, message: 'Booking removed successfully' });
};
