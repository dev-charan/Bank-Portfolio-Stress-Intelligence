// src/controllers/dashboardController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../config/database";
import { logger } from "../utils/logger";

export class DashboardController {
  /**
   * GET /api/dashboard
   * Get complete dashboard data from pre-calculated metrics
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { cycle } = req.query;

      logger.info("Fetching dashboard data");

      // Get latest cycle if not specified
      const latestCycle = await this.getLatestCycle();
      const selectedCycle = (cycle as string) || latestCycle;

      // Get all bank metrics for the selected cycle
      const banksMetrics = await prisma.bankMetrics.findMany({
        where: { reportingCycle: selectedCycle },
        include: {
          bank: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      // 1. Calculate KPIs
      const kpis = await this.calculateKPIs(banksMetrics, selectedCycle);

      // 2. Risk Distribution
      const riskDistribution = this.getRiskDistribution(banksMetrics);

      // 3. Top 10 High-Risk Banks
      const top10Banks = this.getTop10Banks(banksMetrics);

      // 4. Risk Trend (show cycle-by-cycle changes)
      const riskTrend = await this.getRiskTrend();

      // 5. Geographic Risk
      const geoRisk = await this.getGeoRisk(selectedCycle);

      // 6. Exposure by Risk Category (over time)
      const exposureData = await this.getExposureByRisk();

      // 7. Risk Metrics Matrix (top 10)
      const riskMatrix = this.getRiskMatrix(banksMetrics);

      const response = {
        reportingCycle: selectedCycle,
        kpis,
        riskDistribution,
        top10Banks,
        riskTrend,
        geoRisk,
        exposureData,
        riskMatrix,
      };

      logger.success("Dashboard data fetched successfully");

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      logger.error("Error fetching dashboard data:", error);
      next(error);
    }
  }

  /**
   * Calculate KPIs
   */
  private async calculateKPIs(banksMetrics: any[], cycle: string) {
    const totalExposure = banksMetrics.reduce(
      (sum, bank) => sum + Number(bank.totalExposure),
      0,
    );

    const highRiskBanks = banksMetrics.filter(
      (b) => b.riskCategory === "HIGH",
    ).length;

    const mediumRiskBanks = banksMetrics.filter(
      (b) => b.riskCategory === "MEDIUM",
    ).length;

    const lowRiskBanks = banksMetrics.filter(
      (b) => b.riskCategory === "LOW",
    ).length;

    const averageRiskScore =
      banksMetrics.length > 0
        ? banksMetrics.reduce((sum, b) => sum + b.compositeScore, 0) /
          banksMetrics.length
        : 0;

    const portfolioHealthScore = 100 - averageRiskScore;

    const complianceRate =
      banksMetrics.length > 0
        ? ((lowRiskBanks + mediumRiskBanks) / banksMetrics.length) * 100
        : 0;

    // Count active alerts for this cycle
    const activeAlerts = await prisma.alert.count({
      where: {
        reportingCycle: cycle,
        status: "ACTIVE",
      },
    });

    return {
      totalExposure: Math.round(totalExposure),
      highRiskBanks,
      mediumRiskBanks,
      lowRiskBanks,
      portfolioHealthScore: Math.round(portfolioHealthScore * 100) / 100,
      averageRiskScore: Math.round(averageRiskScore * 100) / 100,
      activeAlerts,
      complianceRate: Math.round(complianceRate * 100) / 100,
      totalBanks: banksMetrics.length,
    };
  }

  /**
   * Get Risk Distribution
   */
  private getRiskDistribution(banksMetrics: any[]) {
    return {
      high: banksMetrics.filter((b) => b.riskCategory === "HIGH").length,
      medium: banksMetrics.filter((b) => b.riskCategory === "MEDIUM").length,
      low: banksMetrics.filter((b) => b.riskCategory === "LOW").length,
    };
  }

  /**
   * Get Top 10 High-Risk Banks
   */
  private getTop10Banks(banksMetrics: any[]) {
    return banksMetrics
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 5)
      .map((bank) => ({
        id: bank.bank.id,
        name: bank.bank.name,
        score: Math.round(bank.compositeScore * 10) / 10,
      }));
  }

  /**
   * Get Risk Trend (cycle-by-cycle historical view)
   * Shows how risk categories change over time
   */
  private async getRiskTrend() {
    // Get all cycles ordered by time
    const cycles = await prisma.reportingCycle.findMany({
      orderBy: { cycleName: "asc" },
      select: { cycleName: true },
    });

    const cycleNames = cycles.map((c) => c.cycleName);

    // Get metrics for all cycles
    const trendData = await Promise.all(
      cycleNames.map(async (cycleName) => {
        const metrics = await prisma.bankMetrics.findMany({
          where: { reportingCycle: cycleName },
        });

        const high = metrics.filter((m) => m.riskCategory === "HIGH");
        const medium = metrics.filter((m) => m.riskCategory === "MEDIUM");
        const low = metrics.filter((m) => m.riskCategory === "LOW");

        return {
          cycle: cycleName,
          highCount: high.length,
          mediumCount: medium.length,
          lowCount: low.length,
          avgScore:
            metrics.length > 0
              ? metrics.reduce((sum, m) => sum + m.compositeScore, 0) /
                metrics.length
              : 0,
        };
      }),
    );

    return {
      months: trendData.map((d) => this.formatCycleName(d.cycle)),
      high_risk: trendData.map((d) => d.highCount),
      medium_risk: trendData.map((d) => d.mediumCount),
      low_risk: trendData.map((d) => d.lowCount),
      average: trendData.map((d) => Math.round(d.avgScore * 10) / 10),
    };
  }

  /**
   * Get Geographic Risk Distribution
   */
  private async getGeoRisk(cycle: string) {
    // Get all bank metrics for this cycle with state distribution
    const banksMetrics = await prisma.bankMetrics.findMany({
      where: { reportingCycle: cycle },
      select: {
        compositeScore: true,
        totalExposure: true,
        topState: true,
        stateDistribution: true,
      },
    });

    // Aggregate by state
    const stateMap = new Map<
      string,
      {
        totalExposure: number;
        banks: number;
        totalRisk: number;
      }
    >();

    banksMetrics.forEach((m) => {
      if (m.stateDistribution && typeof m.stateDistribution === "object") {
        const stateData = m.stateDistribution as Record<string, number>;

        Object.entries(stateData).forEach(([state, exposure]) => {
          const current = stateMap.get(state) || {
            totalExposure: 0,
            banks: 0,
            totalRisk: 0,
          };

          stateMap.set(state, {
            totalExposure: current.totalExposure + exposure,
            banks: current.banks + 1,
            totalRisk: current.totalRisk + m.compositeScore,
          });
        });
      }
    });

    // Get top 5 states by exposure
    const geoData = Array.from(stateMap.entries())
      .map(([state, data]) => ({
        state,
        city: state,
        risk_score: Math.round((data.totalRisk / data.banks) * 10) / 10,
        exposure: Math.round(data.totalExposure),
        banks: data.banks,
        lat: 20.5937, // Default India center (you can map real coordinates)
        lng: 78.9629,
      }))
      .sort((a, b) => b.exposure - a.exposure)

    return geoData;
  }

  /**
   * Get Exposure by Risk Category (over last 3 quarters)
   */
  private async getExposureByRisk() {
    // Get last 3 quarters
    const cycles = await prisma.reportingCycle.findMany({
      orderBy: { cycleName: "desc" },
      take: 3,
      select: { cycleName: true },
    });

    const cycleNames = cycles.map((c) => c.cycleName).reverse();

    const exposureData = await Promise.all(
      cycleNames.map(async (cycleName) => {
        const metrics = await prisma.bankMetrics.findMany({
          where: { reportingCycle: cycleName },
          select: {
            riskCategory: true,
            totalExposure: true,
          },
        });

        const highRisk = metrics
          .filter((m) => m.riskCategory === "HIGH")
          .reduce((sum, m) => sum + Number(m.totalExposure), 0);

        const mediumRisk = metrics
          .filter((m) => m.riskCategory === "MEDIUM")
          .reduce((sum, m) => sum + Number(m.totalExposure), 0);

        const lowRisk = metrics
          .filter((m) => m.riskCategory === "LOW")
          .reduce((sum, m) => sum + Number(m.totalExposure), 0);

        return {
          cycle: cycleName,
          highRisk: Math.round((highRisk / 100000) * 100) / 100, // Convert to Cr
          mediumRisk: Math.round((mediumRisk / 100000) * 100) / 100,
          lowRisk: Math.round((lowRisk / 100000) * 100) / 100,
        };
      }),
    );

    return {
      categories: exposureData.map((d) => this.formatCycleName(d.cycle)),
      high_risk: exposureData.map((d) => d.highRisk),
      medium_risk: exposureData.map((d) => d.mediumRisk),
      low_risk: exposureData.map((d) => d.lowRisk),
    };
  }

  /**
   * Get Risk Metrics Matrix (Top 10 Banks)
   */
  private getRiskMatrix(banksMetrics: any[]) {
    return banksMetrics
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 5)
      .map((bank) => ({
        bank:
          bank.bank.name.length > 30
            ? bank.bank.name.substring(0, 30) + "..."
            : bank.bank.name,
        escalation: Math.round(bank.escalationRate * 10) / 10,
        persistence: Math.round(bank.persistenceRate * 10) / 10,
        growth: Math.round(bank.exposureGrowth * 10) / 10,
      }));
  }

  /**
   * GET /api/dashboard/kpis
   * Get KPIs only
   */
  async getKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const { cycle } = req.query;

      logger.info("Fetching dashboard KPIs");

      const latestCycle = await this.getLatestCycle();
      const selectedCycle = (cycle as string) || latestCycle;

      const banksMetrics = await prisma.bankMetrics.findMany({
        where: { reportingCycle: selectedCycle },
        include: {
          bank: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const kpis = await this.calculateKPIs(banksMetrics, selectedCycle);

      res.json({
        success: true,
        data: kpis,
      });
    } catch (error) {
      logger.error("Error fetching KPIs:", error);
      next(error);
    }
  }

  /**
   * Helper: Get latest reporting cycle
   */
  private async getLatestCycle(): Promise<string> {
    const latest = await prisma.reportingCycle.findFirst({
      orderBy: { cycleName: "desc" },
      select: { cycleName: true },
    });

    if (!latest) {
      throw new Error("No reporting cycles found");
    }

    return latest.cycleName;
  }

  /**
   * Helper: Format cycle name for display
   */
  private formatCycleName(cycle: string): string {
    const month = cycle.substring(0, 3);
    const year = cycle.substring(3);
    return `${month} 20${year}`;
  }
}
