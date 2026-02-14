import { Request, Response, NextFunction } from "express";
import { MetricsCalculator } from "../services/metricsCalculator";
import prisma from "../config/database";

export class MetricsController {
  private calculator = new MetricsCalculator();

  /**
   * POST /api/metrics/calculate
   * Calculate metrics for all banks in a reporting cycle
   */
  async calculateMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportingCycle } = req.body;

      if (!reportingCycle) {
        throw new Error("Reporting cycle is required", 400);
      }

      // Check if cycle exists
      const cycle = await prisma.reportingCycle.findUnique({
        where: { cycleName: reportingCycle },
      });

      if (!cycle) {
        throw new AppError("Reporting cycle not found", 404);
      }

      // Get all unique banks in this cycle
      const banks = await prisma.record.findMany({
        where: { reportingCycle },
        distinct: ["bankId"],
        select: { bankId: true },
      });

      if (banks.length === 0) {
        throw new AppError("No records found for this cycle", 404);
      }

      // Calculate metrics for each bank
      const results = [];
      for (const { bankId } of banks) {
        const metrics = await this.calculator.calculateBankMetrics(
          bankId,
          reportingCycle,
        );
        if (metrics) {
          results.push({
            bankId,
            compositeScore: metrics.compositeScore,
            riskCategory: metrics.riskCategory,
          });
        }
      }

      res.json({
        success: true,
        data: {
          reportingCycle,
          banksProcessed: results.length,
          results,
        },
        message: "Metrics calculated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/metrics/calculate/:bankId
   * Calculate metrics for a specific bank
   */
  async calculateBankMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { bankId } = req.params;
      const { reportingCycle } = req.body;

      if (!reportingCycle) {
        throw new AppError("Reporting cycle is required", 400);
      }

      const metrics = await this.calculator.calculateBankMetrics(
        bankId,
        reportingCycle,
      );

      if (!metrics) {
        throw new AppError("No records found for this bank and cycle", 404);
      }

      res.json({
        success: true,
        data: metrics,
        message: "Bank metrics calculated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/metrics/status/:cycle
   * Check calculation status for a cycle
   */
  async getCalculationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { cycle } = req.params;

      const totalRecords = await prisma.record.count({
        where: { reportingCycle: cycle },
      });

      const totalBanks = await prisma.record.findMany({
        where: { reportingCycle: cycle },
        distinct: ["bankId"],
      });

      const calculatedMetrics = await prisma.bankMetrics.count({
        where: { reportingCycle: cycle },
      });

      res.json({
        success: true,
        data: {
          reportingCycle: cycle,
          totalRecords,
          totalBanks: totalBanks.length,
          calculatedBanks: calculatedMetrics,
          isComplete: calculatedMetrics === totalBanks.length,
          percentage:
            totalBanks.length > 0
              ? ((calculatedMetrics / totalBanks.length) * 100).toFixed(1)
              : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
