import { ServicePackage } from '../models/ServicePackage.js';

// @desc    Get all service packages
// @route   GET /api/service-packages
export const getServicePackages = async (req, res) => {
  const packages = await ServicePackage.find({ isActive: true }).sort({ category: 1, basePrice: 1 });
  res.json({ success: true, count: packages.length, data: packages });
};

// @desc    Create service package
// @route   POST /api/service-packages
export const createServicePackage = async (req, res) => {
  const pkg = await ServicePackage.create(req.body);
  res.status(201).json({ success: true, data: pkg });
};

// @desc    Update service package
// @route   PUT /api/service-packages/:id
export const updateServicePackage = async (req, res) => {
  const pkg = await ServicePackage.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!pkg) {
    return res.status(404).json({ success: false, message: 'Package not found' });
  }
  res.json({ success: true, data: pkg });
};

// @desc    Delete service package
// @route   DELETE /api/service-packages/:id
export const deleteServicePackage = async (req, res) => {
  const pkg = await ServicePackage.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!pkg) {
    return res.status(404).json({ success: false, message: 'Package not found' });
  }
  res.json({ success: true, message: 'Package deactivated successfully' });
};
