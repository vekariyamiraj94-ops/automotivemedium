import { Vehicle } from '../models/Vehicle.js';

// @desc    Get vehicles with search, filter, and pagination
// @route   GET /api/vehicles
export const getVehicles = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const { search, brand, customerId } = req.query;

  const query = {};
  if (brand) query.brand = brand;
  if (customerId) query.customer = customerId;
  if (search) {
    query.$or = [
      { regNumber: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
    ];
  }

  const [total, vehicles] = await Promise.all([
    Vehicle.countDocuments(query),
    Vehicle.find(query)
      .populate('brand', 'name country logoUrl')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.json({
    success: true,
    count: vehicles.length,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
    },
    data: vehicles,
  });
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
export const getVehicleById = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id)
    .populate('brand')
    .populate('customer');
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
  res.json({ success: true, data: vehicle });
};

// @desc    Create vehicle
// @route   POST /api/vehicles
export const createVehicle = async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  const populated = await Vehicle.findById(vehicle._id)
    .populate('brand')
    .populate('customer');
  res.status(201).json({ success: true, data: populated });
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
export const updateVehicle = async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('brand')
    .populate('customer');
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
  res.json({ success: true, data: vehicle });
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
export const deleteVehicle = async (req, res) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Vehicle not found' });
  }
  res.json({ success: true, message: 'Vehicle deleted successfully' });
};
