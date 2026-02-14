// src/routes/borrowerRoutes.ts
import { Router } from "express";
import { BorrowerController } from "../controllers/borrowerController";

const router = Router();
const borrowerController = new BorrowerController();

// GET /api/borrowers - Get all borrowers (with pagination)
router.get("/", borrowerController.getAllBorrowers.bind(borrowerController));

// GET /api/borrowers/:id - Get borrower by ID
router.get("/:id", borrowerController.getBorrowerById.bind(borrowerController));

export default router;
