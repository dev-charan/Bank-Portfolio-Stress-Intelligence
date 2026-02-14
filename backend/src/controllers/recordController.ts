// src/controllers/recordController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export class RecordController {
  // Get records by reporting cycle
  async getRecordsByCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const { cycle } = req.params;
      const { bankId, suitFiled } = req.query;

      const where: any = { reportingCycle: cycle };
      if (bankId) where.bankId = bankId;
      if (suitFiled !== undefined) where.suitFiled = suitFiled === "true";

      const records = await prisma.record.findMany({
        where,
        include: {
          bank: true,
          branch: true,
          borrower: {
            include: {
              directors: true,
              guarantors: true,
            },
          },
        },
        orderBy: {
          outstandingAmount: "desc",
        },
      });

      res.json({
        success: true,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all unique reporting cycles
  async getAllCycles(req: Request, res: Response, next: NextFunction) {
    try {
      const cycles = await prisma.record.findMany({
        select: {
          reportingCycle: true,
        },
        distinct: ["reportingCycle"],
        orderBy: {
          reportingCycle: "desc",
        },
      });

      res.json({
        success: true,
        data: cycles.map((c) => c.reportingCycle),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get overview statistics
  async getOverviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalBanks,
        totalBorrowers,
        totalRecords,
        totalExposure,
        highRiskCount,
      ] = await Promise.all([
        prisma.bank.count(),
        prisma.borrower.count(),
        prisma.record.count(),
        prisma.record.aggregate({
          _sum: { outstandingAmount: true },
        }),
        prisma.record.count({
          where: { suitFiled: true },
        }),
      ]);

      res.json({
        success: true,
        data: {
          totalBanks,
          totalBorrowers,
          totalRecords,
          totalExposure: totalExposure._sum.outstandingAmount || 0,
          highRiskCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
