// src/routes/bankRoutes.ts
import { Router } from "express";
import { BankController } from "../controllers/bankController";

const router = Router();
const bankController = new BankController();

// GET /api/banks - Get all banks
router.get("/", bankController.getAllBanks.bind(bankController));

// GET /api/banks/:id - Get bank by ID
router.get("/:id", bankController.getBankById.bind(bankController));

// GET /api/banks/:id/stats - Get bank statistics
router.get("/:id/stats", bankController.getBankStats.bind(bankController));

export default router;
