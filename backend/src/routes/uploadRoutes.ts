// src/routes/uploadRoutes.ts
import { Router } from "express";
import { UploadController } from "../controllers/uploadController";

const router = Router();
const uploadController = new UploadController();

// POST /api/upload/records - Upload Excel data
router.post("/records", uploadController.uploadRecords.bind(uploadController));

// GET /api/upload/cycles - Get all reporting cycles
router.get("/cycles", uploadController.getCycles.bind(uploadController));

// DELETE /api/upload/cycles/:id - Delete a cycle
router.delete(
  "/cycles/:id",
  uploadController.deleteCycle.bind(uploadController),
);

export default router;
