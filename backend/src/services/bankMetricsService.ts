// src/services/bankMetricsService.ts
import prisma from "../config/database";
import { logger } from "../utils/logger";

interface BankMetricsData {
  bankId: string;
  reportingCycle: string;
  totalExposure: number;
  totalRecords: number;
  totalBorrowers: number;
  totalBranches: number;
  compositeScore: number;
  riskCategory: "HIGH" | "MEDIUM" | "LOW";
  exposureGrowth: number;
  borrowerGrowth: number;
  escalationRate: number;
  persistenceRate: number;
  suitFiledCount: number;
  suitFiledPercentage: number;
  geoConcentration: number;
  topState: string | null;
  stateDistribution: Record<string, number>;
  npaDistribution: Record<string, number>;
}

export class BankMetricsService {
  /**
   * Calculate metrics for all banks in a specific cycle
   */
  async calculateMetricsForCycle(cycleName: string): Promise<void> {
    logger.info(`Calculating metrics for cycle: ${cycleName}`);

    // Get all unique banks in this cycle
    const banksInCycle = await prisma.record.findMany({
      where: { reportingCycle: cycleName },
      distinct: ["bankId"],
      select: { bankId: true },
    });

    logger.info(`Found ${banksInCycle.length} banks in cycle ${cycleName}`);

    // Calculate metrics for each bank
    for (const { bankId } of banksInCycle) {
      try {
        await this.calculateBankMetricsForCycle(bankId, cycleName);
      } catch (error: any) {
        logger.error(
          `Error calculating metrics for bank ${bankId} in cycle ${cycleName}:`,
          error,
        );
        // Continue with next bank even if one fails
      }
    }

    logger.success(
      `Metrics calculation complete for ${banksInCycle.length} banks in cycle ${cycleName}`,
    );
  }

  /**
   * Calculate metrics for a specific bank in a specific cycle
   */
  async calculateBankMetricsForCycle(
    bankId: string,
    cycleName: string,
  ): Promise<BankMetricsData> {
    // Get bank info
    const bank = await prisma.bank.findUnique({
      where: { id: bankId },
      select: { id: true, name: true },
    });

    if (!bank) {
      throw new Error(`Bank not found: ${bankId}`);
    }

    // Get all records for this bank in this cycle
    const records = await prisma.record.findMany({
      where: {
        bankId,
        reportingCycle: cycleName,
      },
      include: {
        branch: true,
        borrower: true,
      },
    });

    if (records.length === 0) {
      throw new Error(
        `No records found for bank ${bank.name} in cycle ${cycleName}`,
      );
    }

    // 1. Calculate total exposure
    const totalExposure = records.reduce(
      (sum, r) => sum + Number(r.outstandingAmount),
      0,
    );

    // 2. Count total records
    const totalRecords = records.length;

    // 3. Count unique borrowers
    const totalBorrowers = new Set(records.map((r) => r.borrowerId)).size;

    // 4. Count unique branches
    const totalBranches = new Set(records.map((r) => r.branchId)).size;

    // 5. Calculate suit filed metrics
    const suitFiledCount = records.filter((r) => r.suitFiled).length;
    const suitFiledPercentage = (suitFiledCount / totalRecords) * 100;

    // 6. Calculate geographic concentration
    const { concentration, topState, stateDistribution } =
      this.calculateGeoConcentration(records);

    // 7. Calculate NPA distribution
    const npaDistribution = this.calculateNPADistribution(records);

    // 8. Calculate exposure growth (compare with previous cycle)
    const exposureGrowth = await this.calculateExposureGrowth(
      bankId,
      cycleName,
      totalExposure,
    );

    // 9. Calculate borrower growth (compare with previous cycle)
    const borrowerGrowth = await this.calculateBorrowerGrowth(
      bankId,
      cycleName,
      totalBorrowers,
    );

    // 10. Calculate escalation rate
    const escalationRate = await this.calculateEscalationRate(
      bankId,
      cycleName,
    );

    // 11. Calculate persistence rate
    const persistenceRate = await this.calculatePersistenceRate(
      bankId,
      cycleName,
    );

    // 12. Calculate composite score
    const compositeScore = this.calculateCompositeScore({
      suitFiledPercentage,
      geoConcentration: concentration,
      escalationRate,
      persistenceRate,
      exposureGrowth,
    });

    // 13. Determine risk category
    const riskCategory = this.determineRiskCategory(compositeScore);

    // Prepare metrics data
    const metricsData: BankMetricsData = {
      bankId,
      reportingCycle: cycleName,
      totalExposure,
      totalRecords,
      totalBorrowers,
      totalBranches,
      compositeScore,
      riskCategory,
      exposureGrowth,
      borrowerGrowth,
      escalationRate,
      persistenceRate,
      suitFiledCount,
      suitFiledPercentage,
      geoConcentration: concentration,
      topState,
      stateDistribution,
      npaDistribution,
    };

    // Save to database
    await prisma.bankMetrics.upsert({
      where: {
        bankId_reportingCycle: {
          bankId,
          reportingCycle: cycleName,
        },
      },
      create: {
        bankId,
        reportingCycle: cycleName,
        totalExposure: metricsData.totalExposure,
        totalRecords: metricsData.totalRecords,
        totalBorrowers: metricsData.totalBorrowers,
        totalBranches: metricsData.totalBranches,
        compositeScore: metricsData.compositeScore,
        riskCategory: metricsData.riskCategory,
        exposureGrowth: metricsData.exposureGrowth,
        borrowerGrowth: metricsData.borrowerGrowth,
        escalationRate: metricsData.escalationRate,
        persistenceRate: metricsData.persistenceRate,
        suitFiledCount: metricsData.suitFiledCount,
        suitFiledPercentage: metricsData.suitFiledPercentage,
        geoConcentration: metricsData.geoConcentration,
        topState: metricsData.topState,
        stateDistribution: metricsData.stateDistribution,
        npaDistribution: metricsData.npaDistribution,
      },
      update: {
        totalExposure: metricsData.totalExposure,
        totalRecords: metricsData.totalRecords,
        totalBorrowers: metricsData.totalBorrowers,
        totalBranches: metricsData.totalBranches,
        compositeScore: metricsData.compositeScore,
        riskCategory: metricsData.riskCategory,
        exposureGrowth: metricsData.exposureGrowth,
        borrowerGrowth: metricsData.borrowerGrowth,
        escalationRate: metricsData.escalationRate,
        persistenceRate: metricsData.persistenceRate,
        suitFiledCount: metricsData.suitFiledCount,
        suitFiledPercentage: metricsData.suitFiledPercentage,
        geoConcentration: metricsData.geoConcentration,
        topState: metricsData.topState,
        stateDistribution: metricsData.stateDistribution,
        npaDistribution: metricsData.npaDistribution,
        calculatedAt: new Date(),
      },
    });

    // Generate alerts if needed
    await this.generateAlerts(bankId, cycleName, metricsData);

    logger.info(
      `Calculated metrics for ${bank.name} in ${cycleName}: Score=${compositeScore.toFixed(1)}, Risk=${riskCategory}`,
    );

    return metricsData;
  }

  /**
   * Calculate geographic concentration
   */
  private calculateGeoConcentration(records: any[]): {
    concentration: number;
    topState: string | null;
    stateDistribution: Record<string, number>;
  } {
    const stateExposure = new Map<string, number>();
    let totalExposure = 0;

    records.forEach((record) => {
      const state = record.branch.state;
      const exposure = Number(record.outstandingAmount);

      stateExposure.set(state, (stateExposure.get(state) || 0) + exposure);
      totalExposure += exposure;
    });

    if (totalExposure === 0) {
      return {
        concentration: 0,
        topState: null,
        stateDistribution: {},
      };
    }

    // Find top state
    let maxExposure = 0;
    let topState: string | null = null;

    stateExposure.forEach((exposure, state) => {
      if (exposure > maxExposure) {
        maxExposure = exposure;
        topState = state;
      }
    });

    const concentration = (maxExposure / totalExposure) * 100;

    // Convert to object for JSON storage
    const stateDistribution: Record<string, number> = {};
    stateExposure.forEach((exposure, state) => {
      stateDistribution[state] = Math.round(exposure * 100) / 100;
    });

    return {
      concentration: Math.round(concentration * 100) / 100,
      topState,
      stateDistribution,
    };
  }

  /**
   * Calculate NPA distribution
   */
  private calculateNPADistribution(records: any[]): Record<string, number> {
    const npaDistribution: Record<string, number> = {};

    records.forEach((record) => {
      if (record.assetClassification) {
        const classification = record.assetClassification;
        npaDistribution[classification] =
          (npaDistribution[classification] || 0) + 1;
      }
    });

    return npaDistribution;
  }

  /**
   * Calculate exposure growth (compare with previous cycle)
   */
  private async calculateExposureGrowth(
    bankId: string,
    currentCycle: string,
    currentExposure: number,
  ): Promise<number> {
    const previousCycle = this.getPreviousCycle(currentCycle);
    if (!previousCycle) return 0;

    const previousMetrics = await prisma.bankMetrics.findUnique({
      where: {
        bankId_reportingCycle: {
          bankId,
          reportingCycle: previousCycle,
        },
      },
    });

    if (!previousMetrics || Number(previousMetrics.totalExposure) === 0) {
      return 0;
    }

    const previousExposure = Number(previousMetrics.totalExposure);
    const growth =
      ((currentExposure - previousExposure) / previousExposure) * 100;

    return Math.round(growth * 100) / 100;
  }

  /**
   * Calculate borrower growth (compare with previous cycle)
   */
  private async calculateBorrowerGrowth(
    bankId: string,
    currentCycle: string,
    currentBorrowers: number,
  ): Promise<number> {
    const previousCycle = this.getPreviousCycle(currentCycle);
    if (!previousCycle) return 0;

    const previousMetrics = await prisma.bankMetrics.findUnique({
      where: {
        bankId_reportingCycle: {
          bankId,
          reportingCycle: previousCycle,
        },
      },
    });

    if (!previousMetrics || previousMetrics.totalBorrowers === 0) {
      return 0;
    }

    const growth =
      ((currentBorrowers - previousMetrics.totalBorrowers) /
        previousMetrics.totalBorrowers) *
      100;

    return Math.round(growth * 100) / 100;
  }

  /**
   * Calculate escalation rate (borrowers moving to worse NPA category)
   */
  private async calculateEscalationRate(
    bankId: string,
    currentCycle: string,
  ): Promise<number> {
    const previousCycle = this.getPreviousCycle(currentCycle);
    if (!previousCycle) return 0;

    // Get current cycle records
    const currentRecords = await prisma.record.findMany({
      where: { bankId, reportingCycle: currentCycle },
      select: { borrowerId: true, assetClassification: true },
    });

    // Get previous cycle records
    const previousRecords = await prisma.record.findMany({
      where: { bankId, reportingCycle: previousCycle },
      select: { borrowerId: true, assetClassification: true },
    });

    const prevMap = new Map(
      previousRecords.map((r) => [r.borrowerId, r.assetClassification]),
    );

    let escalated = 0;
    let total = 0;

    currentRecords.forEach((curr) => {
      const prev = prevMap.get(curr.borrowerId);
      if (prev) {
        total++;
        if (this.isEscalated(prev, curr.assetClassification)) {
          escalated++;
        }
      }
    });

    if (total === 0) return 0;

    return Math.round((escalated / total) * 100 * 100) / 100;
  }

  /**
   * Calculate persistence rate (borrowers staying in high-risk category)
   */
  private async calculatePersistenceRate(
    bankId: string,
    currentCycle: string,
  ): Promise<number> {
    const previousCycle = this.getPreviousCycle(currentCycle);
    if (!previousCycle) return 0;

    // Get current cycle records
    const currentRecords = await prisma.record.findMany({
      where: { bankId, reportingCycle: currentCycle },
      select: { borrowerId: true, assetClassification: true },
    });

    // Get previous cycle records
    const previousRecords = await prisma.record.findMany({
      where: { bankId, reportingCycle: previousCycle },
      select: { borrowerId: true, assetClassification: true },
    });

    const prevMap = new Map(
      previousRecords.map((r) => [r.borrowerId, r.assetClassification]),
    );

    let persisted = 0;
    let total = 0;

    currentRecords.forEach((curr) => {
      const prev = prevMap.get(curr.borrowerId);
      if (prev) {
        total++;
        if (
          this.isHighRisk(prev) &&
          this.isHighRisk(curr.assetClassification)
        ) {
          persisted++;
        }
      }
    });

    if (total === 0) return 0;

    return Math.round((persisted / total) * 100 * 100) / 100;
  }

  /**
   * Calculate composite risk score (0-100)
   */
  private calculateCompositeScore(factors: {
    suitFiledPercentage: number;
    geoConcentration: number;
    escalationRate: number;
    persistenceRate: number;
    exposureGrowth: number;
  }): number {
    // Weighted scoring algorithm
    const weights = {
      suitFiled: 0.3,
      geoConcentration: 0.15,
      escalation: 0.25,
      persistence: 0.2,
      growth: 0.1,
    };

    // Normalize exposure growth to 0-100 scale
    const normalizedGrowth = Math.min(
      Math.max(factors.exposureGrowth, -100),
      100,
    );
    const growthScore = ((normalizedGrowth + 100) / 200) * 100;

    const score =
      factors.suitFiledPercentage * weights.suitFiled +
      factors.geoConcentration * weights.geoConcentration +
      factors.escalationRate * weights.escalation +
      factors.persistenceRate * weights.persistence +
      growthScore * weights.growth;

    return Math.round(Math.min(100, Math.max(0, score)) * 100) / 100;
  }

  /**
   * Determine risk category based on composite score
   */
  private determineRiskCategory(score: number): "HIGH" | "MEDIUM" | "LOW" {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  }

  /**
   * Generate alerts based on metrics
   */
  private async generateAlerts(
    bankId: string,
    cycleName: string,
    metrics: BankMetricsData,
  ): Promise<void> {
    const alerts = [];

    // High risk alert
    if (metrics.compositeScore >= 70) {
      alerts.push({
        bankId,
        reportingCycle: cycleName,
        type: "RISK_ESCALATION",
        severity: "CRITICAL",
        title: "High Risk Score Detected",
        description: `Bank risk score has reached ${metrics.compositeScore.toFixed(1)}`,
        metric: "compositeScore",
        threshold: 70,
        actualValue: metrics.compositeScore,
      });
    }

    // Exposure spike alert
    if (metrics.exposureGrowth > 20) {
      alerts.push({
        bankId,
        reportingCycle: cycleName,
        type: "EXPOSURE_SPIKE",
        severity: "HIGH",
        title: "Significant Exposure Growth",
        description: `Exposure increased by ${metrics.exposureGrowth.toFixed(1)}%`,
        metric: "exposureGrowth",
        threshold: 20,
        actualValue: metrics.exposureGrowth,
      });
    }

    // Geographic concentration alert
    if (metrics.geoConcentration > 60) {
      alerts.push({
        bankId,
        reportingCycle: cycleName,
        type: "CONCENTRATION_RISK",
        severity: "MEDIUM",
        title: "High Geographic Concentration",
        description: `${metrics.geoConcentration.toFixed(1)}% exposure in ${metrics.topState}`,
        metric: "geoConcentration",
        threshold: 60,
        actualValue: metrics.geoConcentration,
      });
    }

    // Save alerts
    for (const alert of alerts) {
      await prisma.alert.create({ data: alert });
    }
  }

  /**
   * Helper: Get previous reporting cycle
   */
  private getPreviousCycle(cycle: string): string | null {
    const monthMap: Record<string, string> = {
      JAN: "DEC",
      FEB: "JAN",
      MAR: "FEB",
      APR: "MAR",
      MAY: "APR",
      JUN: "MAY",
      JUL: "JUN",
      AUG: "JUL",
      SEP: "AUG",
      OCT: "SEP",
      NOV: "OCT",
      DEC: "NOV",
    };

    const month = cycle.substring(0, 3);
    const year = parseInt(cycle.substring(3));

    const prevMonth = monthMap[month];
    if (!prevMonth) return null;

    const prevYear = month === "JAN" ? year - 1 : year;

    return `${prevMonth}${prevYear}`;
  }

  /**
   * Helper: Check if asset classification escalated
   */
  private isEscalated(prev: string | null, curr: string | null): boolean {
    const riskOrder = [
      "STANDARD",
      "SMA-0",
      "SMA-1",
      "SMA-2",
      "SUB-STANDARD",
      "DOUBTFUL",
      "LOSS",
    ];
    if (!prev || !curr) return false;
    return riskOrder.indexOf(curr) > riskOrder.indexOf(prev);
  }

  /**
   * Helper: Check if classification is high risk
   */
  private isHighRisk(classification: string | null): boolean {
    const highRisk = ["SUB-STANDARD", "DOUBTFUL", "LOSS"];
    return classification ? highRisk.includes(classification) : false;
  }
}
