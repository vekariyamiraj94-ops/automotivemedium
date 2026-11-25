import { ServiceCentre } from '../models/ServiceCentre.js';

// @desc    Get all service centres
// @route   GET /api/service-centres
export const getServiceCentres = async (req, res) => {
  const centres = await ServiceCentre.find({ isActive: true }).sort({ city: 1, name: 1 });
  res.json({ success: true, count: centres.length, data: centres });
};

// @desc    Create service centre
// @route   POST /api/service-centres
export const createServiceCentre = async (req, res) => {
  const centre = await ServiceCentre.create(req.body);
  res.status(201).json({ success: true, data: centre });
};

// @desc    Update service centre
// @route   PUT /api/service-centres/:id
export const updateServiceCentre = async (req, res) => {
  const centre = await ServiceCentre.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!centre) {
    return res.status(404).json({ success: false, message: 'Service centre not found' });
  }
  res.json({ success: true, data: centre });
};

// @desc    Delete service centre (soft delete)
// @route   DELETE /api/service-centres/:id
export const deleteServiceCentre = async (req, res) => {
  const centre = await ServiceCentre.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!centre) {
    return res.status(404).json({ success: false, message: 'Service centre not found' });
  }
  res.json({ success: true, message: 'Service centre deactivated' });
};
