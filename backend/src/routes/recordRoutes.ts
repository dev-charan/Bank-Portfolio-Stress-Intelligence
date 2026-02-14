// src/routes/recordRoutes.ts
import { Router } from "express";
import { RecordController } from "../controllers/recordController";

const router = Router();
const recordController = new RecordController();

// GET /api/records/overview - Get overview statistics
router.get(
  "/overview",
  recordController.getOverviewStats.bind(recordController),
);

// GET /api/records/cycles - Get all unique cycles
router.get("/cycles", recordController.getAllCycles.bind(recordController));

// GET /api/records/cycle/:cycle - Get records by cycle
router.get(
  "/cycle/:cycle",
  recordController.getRecordsByCycle.bind(recordController),
);

export default router;
