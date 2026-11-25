import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { InventoryPart } from '../models/InventoryPart.js';
import { Vehicle } from '../models/Vehicle.js';
import { Customer } from '../models/Customer.js';

/**
 * ---------------------------------------------------------------------------------
 * CRITICAL REQUIREMENT: MONGODB AGGREGATION PIPELINES
 * Every report below uses native Model.aggregate().
 * In-memory filtering/calculation is strictly prohibited.
 * ---------------------------------------------------------------------------------
 */

// @desc    Report 1: Total bookings grouped by Car Brand
// @route   GET /api/reports/bookings-by-brand
export const getBookingsByBrand = async (req, res) => {
  const pipeline = [
    // Stage 1: Join with Vehicles collection
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicleInfo',
      },
    },
    { $unwind: '$vehicleInfo' },

    // Stage 2: Join with Brands collection
    {
      $lookup: {
        from: 'brands',
        localField: 'vehicleInfo.brand',
        foreignField: '_id',
        as: 'brandInfo',
      },
    },
    { $unwind: '$brandInfo' },

    // Stage 3: Group by Brand
    {
      $group: {
        _id: '$brandInfo._id',
        brandName: { $first: '$brandInfo.name' },
        country: { $first: '$brandInfo.country' },
        logoUrl: { $first: '$brandInfo.logoUrl' },
        totalBookings: { $sum: 1 },
        completedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
        },
        inProgressBookings: {
          $sum: {
            $cond: [
              { $in: ['$status', ['In Progress', 'Inspection', 'Parts Replacement']] },
              1,
              0,
            ],
          },
        },
        totalRevenue: { $sum: '$totalAmount' },
        averageTicketSize: { $avg: '$totalAmount' },
      },
    },

    // Stage 4: Projection to shape output
    {
      $project: {
        _id: 1,
        brandName: 1,
        country: 1,
        logoUrl: 1,
        totalBookings: 1,
        completedBookings: 1,
        inProgressBookings: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        averageTicketSize: { $round: ['$averageTicketSize', 2] },
      },
    },

    // Stage 5: Sort by highest bookings first
    { $sort: { totalBookings: -1 } },
  ];

  const results = await Booking.aggregate(pipeline);
  res.json({ success: true, count: results.length, data: results });
};

// @desc    Report 2: Monthly Revenue Analysis
// @route   GET /api/reports/monthly-revenue
export const getMonthlyRevenue = async (req, res) => {
  const pipeline = [
    // Stage 1: Match only non-cancelled bookings
    {
      $match: {
        status: { $ne: 'Cancelled' },
      },
    },

    // Stage 2: Group by Year and Month
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m', date: '$scheduledDate' },
        },
        yearMonth: {
          $first: { $dateToString: { format: '%b %Y', date: '$scheduledDate' } },
        },
        totalRevenue: { $sum: '$totalAmount' },
        labourRevenue: { $sum: '$labourCost' },
        partsRevenue: { $sum: '$partsCost' },
        totalBookings: { $sum: 1 },
        paidAmount: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$totalAmount', 0] },
        },
      },
    },

    // Stage 3: Project with rounded figures
    {
      $project: {
        _id: 1,
        monthYear: '$_id',
        monthLabel: '$yearMonth',
        totalRevenue: { $round: ['$totalRevenue', 2] },
        labourRevenue: { $round: ['$labourRevenue', 2] },
        partsRevenue: { $round: ['$partsRevenue', 2] },
        totalBookings: 1,
        paidAmount: { $round: ['$paidAmount', 2] },
        avgRevenuePerBooking: {
          $round: [{ $divide: ['$totalRevenue', '$totalBookings'] }, 2],
        },
      },
    },

    // Stage 4: Sort chronologically
    { $sort: { _id: 1 } },
  ];

  const results = await Booking.aggregate(pipeline);
  res.json({ success: true, count: results.length, data: results });
};

// @desc    Report 3: Most Serviced Car Models
// @route   GET /api/reports/most-serviced-models
export const getMostServicedModels = async (req, res) => {
  const pipeline = [
    // Stage 1: Lookup Vehicle
    {
      $lookup: {
        from: 'vehicles',
        localField: 'vehicle',
        foreignField: '_id',
        as: 'vehicle',
      },
    },
    { $unwind: '$vehicle' },

    // Stage 2: Lookup Brand
    {
      $lookup: {
        from: 'brands',
        localField: 'vehicle.brand',
        foreignField: '_id',
        as: 'brand',
      },
    },
    { $unwind: '$brand' },

    // Stage 3: Group by Model & Brand
    {
      $group: {
        _id: { model: '$vehicle.model', brand: '$brand.name' },
        brandName: { $first: '$brand.name' },
        modelName: { $first: '$vehicle.model' },
        serviceCount: { $sum: 1 },
        totalRevenueGenerated: { $sum: '$totalAmount' },
        avgMileage: { $avg: '$vehicle.mileageKm' },
      },
    },

    // Stage 4: Project cleaned metrics
    {
      $project: {
        _id: 0,
        model: '$_id.model',
        brand: '$_id.brand',
        serviceCount: 1,
        totalRevenueGenerated: { $round: ['$totalRevenueGenerated', 2] },
        avgMileage: { $round: ['$avgMileage', 0] },
      },
    },

    // Stage 5: Sort by highest frequency
    { $sort: { serviceCount: -1 } },

    // Stage 6: Top 10 models
    { $limit: 10 },
  ];

  const results = await Booking.aggregate(pipeline);
  res.json({ success: true, count: results.length, data: results });
};

// @desc    Report 4: Spare Parts Inventory Valuation & Low Stock Report
// @route   GET /api/reports/inventory-valuation
export const getSparePartsReport = async (req, res) => {
  const pipeline = [
    {
      $facet: {
        // Pipeline A: Overall Inventory Financial Summary
        summary: [
          {
            $group: {
              _id: null,
              totalPartsInCatalog: { $sum: 1 },
              totalStockQuantity: { $sum: '$stockQuantity' },
              totalInventoryCostValue: {
                $sum: { $multiply: ['$stockQuantity', '$unitCost'] },
              },
              totalInventoryRetailValue: {
                $sum: { $multiply: ['$stockQuantity', '$sellingPrice'] },
              },
              lowStockItemsCount: {
                $sum: {
                  $cond: [{ $lte: ['$stockQuantity', '$minReorderThreshold'] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalPartsInCatalog: 1,
              totalStockQuantity: 1,
              totalInventoryCostValue: { $round: ['$totalInventoryCostValue', 2] },
              totalInventoryRetailValue: { $round: ['$totalInventoryRetailValue', 2] },
              potentialGrossProfit: {
                $round: [
                  {
                    $subtract: [
                      '$totalInventoryRetailValue',
                      '$totalInventoryCostValue',
                    ],
                  },
                  2,
                ],
              },
              lowStockItemsCount: 1,
            },
          },
        ],

        // Pipeline B: Category-wise Breakdown
        byCategory: [
          {
            $group: {
              _id: '$category',
              category: { $first: '$category' },
              partsCount: { $sum: 1 },
              totalStock: { $sum: '$stockQuantity' },
              categoryCostValue: {
                $sum: { $multiply: ['$stockQuantity', '$unitCost'] },
              },
              categoryRetailValue: {
                $sum: { $multiply: ['$stockQuantity', '$sellingPrice'] },
              },
            },
          },
          {
            $project: {
              _id: 0,
              category: 1,
              partsCount: 1,
              totalStock: 1,
              categoryCostValue: { $round: ['$categoryCostValue', 2] },
              categoryRetailValue: { $round: ['$categoryRetailValue', 2] },
            },
          },
          { $sort: { categoryCostValue: -1 } },
        ],

        // Pipeline C: Low Stock Warning Items
        lowStockAlerts: [
          {
            $match: {
              $expr: { $lte: ['$stockQuantity', '$minReorderThreshold'] },
            },
          },
          {
            $project: {
              partNumber: 1,
              name: 1,
              category: 1,
              stockQuantity: 1,
              minReorderThreshold: 1,
              unitCost: 1,
              supplier: 1,
            },
          },
          { $sort: { stockQuantity: 1 } },
        ],
      },
    },
  ];

  const results = await InventoryPart.aggregate(pipeline);
  res.json({
    success: true,
    data: {
      summary: results[0]?.summary[0] || {},
      byCategory: results[0]?.byCategory || [],
      lowStockAlerts: results[0]?.lowStockAlerts || [],
    },
  });
};

// @desc    Report 5: Service Centre Wise Booking & Performance Report
// @route   GET /api/reports/service-centres
export const getServiceCentreBookings = async (req, res) => {
  const pipeline = [
    // Stage 1: Join with ServiceCentre
    {
      $lookup: {
        from: 'servicecentres',
        localField: 'serviceCentre',
        foreignField: '_id',
        as: 'centre',
      },
    },
    { $unwind: '$centre' },

    // Stage 2: Group by Centre
    {
      $group: {
        _id: '$centre._id',
        centreName: { $first: '$centre.name' },
        city: { $first: '$centre.city' },
        code: { $first: '$centre.code' },
        capacityBays: { $first: '$centre.capacityBays' },
        activeMechanics: { $first: '$centre.activeMechanics' },
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        activeWorkflows: {
          $sum: {
            $cond: [
              { $in: ['$status', ['In Progress', 'Parts Replacement', 'Inspection']] },
              1,
              0,
            ],
          },
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
        },
      },
    },

    // Stage 3: Calculate utilization and format
    {
      $project: {
        _id: 1,
        centreName: 1,
        city: 1,
        code: 1,
        capacityBays: 1,
        activeMechanics: 1,
        totalBookings: 1,
        totalRevenue: { $round: ['$totalRevenue', 2] },
        activeWorkflows: 1,
        completedCount: 1,
        utilizationRate: {
          $round: [
            {
              $multiply: [{ $divide: ['$activeWorkflows', '$capacityBays'] }, 100],
            },
            1,
          ],
        },
      },
    },

    // Stage 4: Sort by revenue
    { $sort: { totalRevenue: -1 } },
  ];

  const results = await Booking.aggregate(pipeline);
  res.json({ success: true, count: results.length, data: results });
};

// @desc    Report 6: Service Status Distribution
// @route   GET /api/reports/status-distribution
export const getServiceStatusDistribution = async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: '$status',
        status: { $first: '$status' },
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $project: {
        _id: 0,
        status: 1,
        count: 1,
        totalAmount: { $round: ['$totalAmount', 2] },
      },
    },
    { $sort: { count: -1 } },
  ];

  const results = await Booking.aggregate(pipeline);
  res.json({ success: true, count: results.length, data: results });
};

// @desc    Dashboard Top-Level KPIs (Single aggregated query)
// @route   GET /api/reports/dashboard-kpis
export const getDashboardKPIs = async (req, res) => {
  const [bookingStats, customerCount, vehicleCount, inventoryCount] = await Promise.all([
    Booking.aggregate([
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: {
            $sum: { $cond: [{ $ne: ['$status', 'Cancelled'] }, '$totalAmount', 0] },
          },
          activeServices: {
            $sum: {
              $cond: [
                { $in: ['$status', ['In Progress', 'Inspection', 'Parts Replacement']] },
                1,
                0,
              ],
            },
          },
          completedServices: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
        },
      },
    ]),
    Customer.countDocuments(),
    Vehicle.countDocuments(),
    InventoryPart.countDocuments(),
  ]);

  const stats = bookingStats[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    activeServices: 0,
    completedServices: 0,
  };

  res.json({
    success: true,
    data: {
      totalBookings: stats.totalBookings,
      totalRevenue: Math.round(stats.totalRevenue),
      activeServices: stats.activeServices,
      completedServices: stats.completedServices,
      totalCustomers: customerCount,
      totalVehicles: vehicleCount,
      totalInventoryParts: inventoryCount,
    },
  });
};
