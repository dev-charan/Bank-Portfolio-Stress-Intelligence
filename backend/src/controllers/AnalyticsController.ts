// src/controllers/analyticsController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";

export class AnalyticsController {
  // Get overview statistics
  async getOverviewStats(req: Request, res: Response, next: NextFunction) {
    try {
      // Get all unique banks count
      const totalBanks = await prisma.bank.count();

      // Get all unique borrowers count
      const totalBorrowers = await prisma.borrower.count();

      // Get total records
      const totalRecords = await prisma.record.count();

      // Get total exposure (sum of all outstanding amounts)
      const exposureResult = await prisma.record.aggregate({
        _sum: {
          outstandingAmount: true,
        },
      });

      // Get total high risk records (suit filed)
      const highRiskRecords = await prisma.record.count({
        where: {
          suitFiled: true,
        },
      });

      // Get latest reporting cycle
      const latestCycle = await prisma.reportingCycle.findFirst({
        orderBy: {
          uploadDate: "desc",
        },
      });

      // Calculate average risk score (for now, percentage of suit filed)
      const avgRiskScore =
        totalRecords > 0 ? (highRiskRecords / totalRecords) * 100 : 0;

      res.json({
        success: true,
        data: {
          totalBanks,
          totalBorrowers,
          totalRecords,
          totalExposure: exposureResult._sum.outstandingAmount || 0,
          highRiskCount: highRiskRecords,
          avgRiskScore: avgRiskScore.toFixed(2),
          latestCycle: latestCycle?.cycleName || null,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get exposure trend (by reporting cycle)
  async getExposureTrend(req: Request, res: Response, next: NextFunction) {
    try {
      // Get all reporting cycles
      const cycles = await prisma.reportingCycle.findMany({
        orderBy: {
          cycleName: "asc",
        },
        take: 12, // Last 12 months
      });

      // Get exposure per cycle
      const trendData = await Promise.all(
        cycles.map(async (cycle) => {
          const exposureResult = await prisma.record.aggregate({
            where: {
              reportingCycle: cycle.cycleName,
            },
            _sum: {
              outstandingAmount: true,
            },
            _count: true,
          });

          return {
            cycle: cycle.cycleName,
            exposure: exposureResult._sum.outstandingAmount || 0,
            recordCount: exposureResult._count,
          };
        }),
      );

      res.json({
        success: true,
        data: trendData,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get risk distribution
  async getRiskDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      // Count records by suit filed status
      const highRisk = await prisma.record.count({
        where: { suitFiled: true },
      });

      const lowRisk = await prisma.record.count({
        where: { suitFiled: false },
      });

      res.json({
        success: true,
        data: {
          highRisk,
          mediumRisk: 0, // TODO: Define medium risk criteria
          lowRisk,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get top high-risk banks (simple version)
  async getTopRiskBanks(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 5 } = req.query;

      // Get banks with highest suit filed count
      const banks = await prisma.bank.findMany({
        include: {
          _count: {
            select: {
              records: true,
            },
          },
        },
      });

      // Calculate risk metrics per bank
      const banksWithMetrics = await Promise.all(
        banks.map(async (bank) => {
          const totalRecords = await prisma.record.count({
            where: { bankId: bank.id },
          });

          const suitFiledCount = await prisma.record.count({
            where: {
              bankId: bank.id,
              suitFiled: true,
            },
          });

          const totalExposure = await prisma.record.aggregate({
            where: { bankId: bank.id },
            _sum: { outstandingAmount: true },
          });

          const escalationRate =
            totalRecords > 0 ? (suitFiledCount / totalRecords) * 100 : 0;

          return {
            id: bank.id,
            name: bank.name,
            totalRecords,
            suitFiledCount,
            totalExposure: totalExposure._sum.outstandingAmount || 0,
            escalationRate,
            riskScore: escalationRate, // Simplified for now
          };
        }),
      );

      // Sort by risk score and take top N
      const topBanks = banksWithMetrics
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, Number(limit));

      res.json({
        success: true,
        data: topBanks,
      });
    } catch (error) {
      next(error);
    }
  }
}
