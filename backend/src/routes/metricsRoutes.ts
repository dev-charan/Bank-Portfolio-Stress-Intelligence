import { Router } from "express";
import { MetricsController } from "../controllers/metricsController";

const router = Router();
const metricsController = new MetricsController();

// All routes require authentication and admin/analyst role

// POST /api/metrics/calculate - Calculate metrics for all banks in a cycle
router.post("/calculate", (req, res, next) =>
  metricsController.calculateMetrics(req, res, next),
);

// POST /api/metrics/calculate/:bankId - Calculate metrics for specific bank
router.post("/calculate/:bankId", (req, res, next) =>
  metricsController.calculateBankMetrics(req, res, next),
);

// GET /api/metrics/status/:cycle - Check calculation status
router.get("/status/:cycle", (req, res, next) =>
  metricsController.getCalculationStatus(req, res, next),
);

export default router;
