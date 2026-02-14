import { Router } from "express";
import { DashboardController } from "../controllers/dashboardController";

const router = Router();
const dashboardController = new DashboardController();


// GET /api/dashboard - Complete dashboard
router.get("/", (req, res, next) =>
  dashboardController.getDashboard(req, res, next),
);

// GET /api/dashboard/kpis - KPIs only
router.get("/kpis", (req, res, next) =>
  dashboardController.getKPIs(req, res, next),
);

export default router;
