import express from 'express';
import {
  getBookingsByBrand,
  getMonthlyRevenue,
  getMostServicedModels,
  getSparePartsReport,
  getServiceCentreBookings,
  getServiceStatusDistribution,
  getDashboardKPIs,
} from '../controllers/reportController.js';

const router = express.Router();

// All reporting endpoints strictly powered by MongoDB aggregate()
router.get('/dashboard-kpis', getDashboardKPIs);
router.get('/bookings-by-brand', getBookingsByBrand);
router.get('/monthly-revenue', getMonthlyRevenue);
router.get('/most-serviced-models', getMostServicedModels);
router.get('/inventory-valuation', getSparePartsReport);
router.get('/service-centres', getServiceCentreBookings);
router.get('/status-distribution', getServiceStatusDistribution);

export default router;
