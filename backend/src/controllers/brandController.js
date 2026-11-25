import { Brand } from '../models/Brand.js';

// @desc    Get all car brands
// @route   GET /api/brands
export const getBrands = async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, count: brands.length, data: brands });
};

// @desc    Create a new brand
// @route   POST /api/brands
export const createBrand = async (req, res) => {
  const brand = await Brand.create(req.body);
  res.status(201).json({ success: true, data: brand });
};

// @desc    Update a brand
// @route   PUT /api/brands/:id
export const updateBrand = async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }
  res.json({ success: true, data: brand });
};

// @desc    Delete brand (soft delete)
// @route   DELETE /api/brands/:id
export const deleteBrand = async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!brand) {
    return res.status(404).json({ success: false, message: 'Brand not found' });
  }
  res.json({ success: true, message: 'Brand marked as inactive' });
};
