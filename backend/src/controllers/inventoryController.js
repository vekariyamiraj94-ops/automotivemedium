import { InventoryPart } from '../models/InventoryPart.js';

// @desc    Get inventory parts with search and filters
// @route   GET /api/inventory
export const getInventoryParts = async (req, res) => {
  const { category, search, lowStock } = req.query;
  const query = {};

  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { partNumber: { $regex: search, $options: 'i' } },
    ];
  }
  if (lowStock === 'true') {
    query.$expr = { $lte: ['$stockQuantity', '$minReorderThreshold'] };
  }

  const parts = await InventoryPart.find(query)
    .populate('compatibleBrands', 'name')
    .sort({ stockQuantity: 1 });

  res.json({ success: true, count: parts.length, data: parts });
};

// @desc    Create inventory part
// @route   POST /api/inventory
export const createInventoryPart = async (req, res) => {
  const part = await InventoryPart.create(req.body);
  res.status(201).json({ success: true, data: part });
};

// @desc    Update inventory part
// @route   PUT /api/inventory/:id
export const updateInventoryPart = async (req, res) => {
  const part = await InventoryPart.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!part) {
    return res.status(404).json({ success: false, message: 'Part not found' });
  }
  res.json({ success: true, data: part });
};

// @desc    Delete inventory part
// @route   DELETE /api/inventory/:id
export const deleteInventoryPart = async (req, res) => {
  const part = await InventoryPart.findByIdAndDelete(req.params.id);
  if (!part) {
    return res.status(404).json({ success: false, message: 'Part not found' });
  }
  res.json({ success: true, message: 'Part deleted from inventory' });
};
