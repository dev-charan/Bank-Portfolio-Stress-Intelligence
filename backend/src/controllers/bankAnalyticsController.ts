// src/controllers/bankAnalyticsController.ts
import { Request, Response, NextFunction } from "express";
import { BankAnalyticsService } from "../services/bankAnalyticsService";
import { logger } from "../utils/logger";

const analyticsService = new BankAnalyticsService();

export class BankAnalyticsController {
  // Get all banks with analytics (paginated, searchable, filterable, sortable)
  async getBanksWithAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 25,
        search,
        riskLevel,
        sortBy = "compositeScore",
        sortOrder = "desc",
      } = req.query;

      logger.info("Fetching banks analytics", {
        page,
        limit,
        search,
        riskLevel,
        sortBy,
        sortOrder,
      });

      // Calculate metrics for all banks
      let banksMetrics = await analyticsService.calculateAllBanksMetrics();

      // Apply search filter
      if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        banksMetrics = banksMetrics.filter((bank) =>
          bank.name.toLowerCase().includes(searchLower),
        );
      }

      // Apply risk level filter
      if (riskLevel && riskLevel !== "ALL") {
        banksMetrics = banksMetrics.filter(
          (bank) => bank.riskCategory === riskLevel,
        );
      }

      // Apply sorting
      const sortField = sortBy as string;
      const sortDirection = sortOrder as string;

      banksMetrics.sort((a, b) => {
        let aValue: any = a[sortField as keyof typeof a];
        let bValue: any = b[sortField as keyof typeof b];

        // Handle string comparison for name
        if (sortField === "name") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric comparison
        if (sortDirection === "asc") {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });

      // Calculate pagination
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedBanks = banksMetrics.slice(startIndex, endIndex);

      const response = {
        banks: paginatedBanks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: banksMetrics.length,
          pages: Math.ceil(banksMetrics.length / limitNum),
        },
      };

      logger.success(
        `Fetched ${paginatedBanks.length} banks (${banksMetrics.length} total)`,
      );

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error fetching banks analytics:", error);
      next(error);
    }
  }

  // Get single bank analytics
  async getBankAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      logger.info(`Fetching analytics for bank: ${id}`);

      const metrics = await analyticsService.calculateBankMetrics(id);

      if (!metrics) {
        return res.status(404).json({
          success: false,
          message: "Bank not found",
        });
      }

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      logger.error("Error fetching bank analytics:", error);
      next(error);
    }
  }

  // Get risk distribution summary
  async getRiskDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Fetching risk distribution");

      const banksMetrics = await analyticsService.calculateAllBanksMetrics();

      const distribution = {
        HIGH: banksMetrics.filter((b) => b.riskCategory === "HIGH").length,
        MEDIUM: banksMetrics.filter((b) => b.riskCategory === "MEDIUM").length,
        LOW: banksMetrics.filter((b) => b.riskCategory === "LOW").length,
        total: banksMetrics.length,
      };

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      logger.error("Error fetching risk distribution:", error);
      next(error);
    }
  }

  // Get top risk banks
  async getTopRiskBanks(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 5 } = req.query;

      logger.info(`Fetching top ${limit} risk banks`);

      let banksMetrics = await analyticsService.calculateAllBanksMetrics();

      // Sort by composite score descending
      banksMetrics.sort((a, b) => b.compositeScore - a.compositeScore);

      // Take top N
      const topBanks = banksMetrics.slice(0, Number(limit));

      res.json({
        success: true,
        data: topBanks,
      });
    } catch (error) {
      logger.error("Error fetching top risk banks:", error);
      next(error);
    }
  }

  // Export banks data (CSV format)
  async exportBanksData(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Exporting banks data");

      const banksMetrics = await analyticsService.calculateAllBanksMetrics();

      // Create CSV
      const headers = [
        "Bank Name",
        "Composite Score",
        "Risk Category",
        "Exposure Growth %",
        "Escalation Rate %",
        "Persistence Rate %",
        "Geo Concentration %",
        "Total Exposure (Lakhs)",
        "Total Records",
        "Suit Filed Count",
      ];

      const rows = banksMetrics.map((bank) => [
        bank.name,
        bank.compositeScore.toFixed(2),
        bank.riskCategory,
        bank.exposureGrowth.toFixed(2),
        bank.escalationRate.toFixed(2),
        bank.persistenceRate.toFixed(2),
        bank.geoConcentration.toFixed(2),
        bank.totalExposure.toFixed(2),
        bank.totalRecords,
        bank.suitFiledCount,
      ]);

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=banks-analytics-${Date.now()}.csv`,
      );

      res.send(csv);

      logger.success("Banks data exported successfully");
    } catch (error) {
      logger.error("Error exporting banks data:", error);
      next(error);
    }
  }

  // Recalculate all banks (for admin/maintenance)
  async recalculateAllBanks(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info("Recalculating all banks metrics");

      const startTime = Date.now();
      const banksMetrics = await analyticsService.calculateAllBanksMetrics();
      const duration = Date.now() - startTime;

      logger.success(
        `Recalculated ${banksMetrics.length} banks in ${duration}ms`,
      );

      res.json({
        success: true,
        message: `Successfully recalculated ${banksMetrics.length} banks`,
        data: {
          count: banksMetrics.length,
          duration: `${duration}ms`,
        },
      });
    } catch (error) {
      logger.error("Error recalculating banks:", error);
      next(error);
    }
  }
}
