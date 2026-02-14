// src/controllers/bankController.ts
import { Request, Response, NextFunction } from "express";
import { BankService } from "../services/bankService";
import prisma from "../config/database";

const bankService = new BankService();

export class BankController {
  // Get all banks
  async getAllBanks(req: Request, res: Response, next: NextFunction) {
    try {
      const banks = await bankService.getAllBanks();

      res.json({
        success: true,
        data: banks,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bank by ID with details
  async getBankById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const bank = await prisma.bank.findUnique({
        where: { id },
        include: {
          branches: true,
          records: {
            include: {
              borrower: true,
            },
            orderBy: {
              reportingCycle: "desc",
            },
          },
          _count: {
            select: {
              records: true,
              branches: true,
            },
          },
        },
      });

      if (!bank) {
        return res.status(404).json({
          success: false,
          message: "Bank not found",
        });
      }

      res.json({
        success: true,
        data: bank,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get bank statistics
  async getBankStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { cycle } = req.query;

      const where: any = { bankId: id };
      if (cycle) {
        where.reportingCycle = cycle;
      }

      const [totalRecords, totalExposure, suitFiledCount] = await Promise.all([
        prisma.record.count({ where }),
        prisma.record.aggregate({
          where,
          _sum: { outstandingAmount: true },
        }),
        prisma.record.count({
          where: { ...where, suitFiled: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalRecords,
          totalExposure: totalExposure._sum.outstandingAmount || 0,
          suitFiledCount,
          escalationRate:
            totalRecords > 0 ? (suitFiledCount / totalRecords) * 100 : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
