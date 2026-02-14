// src/routes/analyticsRoutes.ts
import { Router } from "express";
import { BankAnalyticsController } from "../controllers/bankAnalyticsController";
import { AnalyticsController } from "../controllers/AnalyticsController";

const router = Router();
const analyticsController = new AnalyticsController();
const bankAnalyticsController = new BankAnalyticsController();

// ==================== General Analytics ====================
// GET /api/analytics/overview - Get overview statistics
router.get(
  "/overview",
  analyticsController.getOverviewStats.bind(analyticsController),
);

// GET /api/analytics/exposure-trend - Get exposure trend
router.get(
  "/exposure-trend",
  analyticsController.getExposureTrend.bind(analyticsController),
);

// GET /api/analytics/risk-distribution - Get risk distribution summary
router.get(
  "/risk-distribution",
  bankAnalyticsController.getRiskDistribution.bind(bankAnalyticsController),
);

// GET /api/analytics/top-risk-banks - Get top high-risk banks
router.get(
  "/top-risk-banks",
  bankAnalyticsController.getTopRiskBanks.bind(bankAnalyticsController),
);

// ==================== Bank Analytics ====================
// GET /api/analytics/banks - Get all banks with analytics (paginated, searchable, filterable, sortable)
router.get(
  "/banks",
  bankAnalyticsController.getBanksWithAnalytics.bind(bankAnalyticsController),
);

// GET /api/analytics/banks/export - Export banks data as CSV
router.get(
  "/banks/export",
  bankAnalyticsController.exportBanksData.bind(bankAnalyticsController),
);

// GET /api/analytics/banks/:id - Get single bank analytics
router.get(
  "/banks/:id",
  bankAnalyticsController.getBankAnalytics.bind(bankAnalyticsController),
);

// POST /api/analytics/recalculate - Recalculate all banks metrics (admin)
router.post(
  "/recalculate",
  bankAnalyticsController.recalculateAllBanks.bind(bankAnalyticsController),
);

export default router;
