import prisma from "../config/database";
import { Prisma } from "@prisma/client";

export class MetricsCalculator {
  /**
   * Calculate all metrics for a bank in a specific reporting cycle
   */
  async calculateBankMetrics(bankId: string, reportingCycle: string) {
    // 1. Get all records for this bank in this cycle
    const records = await prisma.record.findMany({
      where: {
        bankId,
        reportingCycle,
      },
      include: {
        branch: true,
      },
    });

    if (records.length === 0) {
      return null;
    }

    // 2. Calculate aggregate financial data
    const totalExposure = records.reduce(
      (sum, r) => sum + Number(r.outstandingAmount),
      0,
    );
    const totalBorrowers = new Set(records.map((r) => r.borrowerId)).size;
    const totalBranches = new Set(records.map((r) => r.branchId)).size;

    // 3. Calculate legal actions
    const suitFiledCount = records.filter((r) => r.suitFiled).length;
    const suitFiledPercentage = (suitFiledCount / records.length) * 100;

    // 4. Calculate geographic concentration
    const stateExposure: { [key: string]: number } = {};
    records.forEach((r) => {
      const state = r.branch.state;
      stateExposure[state] =
        (stateExposure[state] || 0) + Number(r.outstandingAmount);
    });

    const topState = Object.keys(stateExposure).reduce((a, b) =>
      stateExposure[a] > stateExposure[b] ? a : b,
    );
    const geoConcentration = (stateExposure[topState] / totalExposure) * 100;

    // 5. Calculate NPA distribution
    const npaDistribution: { [key: string]: number } = {};
    records.forEach((r) => {
      if (r.assetClassification) {
        npaDistribution[r.assetClassification] =
          (npaDistribution[r.assetClassification] || 0) + 1;
      }
    });

    // 6. Calculate growth metrics (compare with previous cycle)
    const previousCycle = this.getPreviousCycle(reportingCycle);
    const previousMetrics = await prisma.bankMetrics.findUnique({
      where: {
        bankId_reportingCycle: {
          bankId,
          reportingCycle: previousCycle,
        },
      },
    });

    let exposureGrowth = 0;
    let borrowerGrowth = 0;

    if (previousMetrics) {
      exposureGrowth =
        ((totalExposure - Number(previousMetrics.totalExposure)) /
          Number(previousMetrics.totalExposure)) *
        100;
      borrowerGrowth =
        ((totalBorrowers - previousMetrics.totalBorrowers) /
          previousMetrics.totalBorrowers) *
        100;
    }

    // 7. Calculate escalation and persistence rates
    const { escalationRate, persistenceRate } = await this.calculateRiskRates(
      bankId,
      reportingCycle,
      previousCycle,
    );

    // 8. Calculate composite risk score (0-100)
    const compositeScore = this.calculateCompositeScore({
      suitFiledPercentage,
      geoConcentration,
      escalationRate,
      persistenceRate,
      exposureGrowth,
      npaCount: Object.keys(npaDistribution).length,
    });

    // 9. Determine risk category
    const riskCategory = this.determineRiskCategory(compositeScore);

    // 10. Save metrics
    const metrics = await prisma.bankMetrics.upsert({
      where: {
        bankId_reportingCycle: {
          bankId,
          reportingCycle,
        },
      },
      create: {
        bankId,
        reportingCycle,
        totalExposure,
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
        geoConcentration,
        topState,
        stateDistribution: stateExposure,
        npaDistribution,
      },
      update: {
        totalExposure,
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
        geoConcentration,
        topState,
        stateDistribution: stateExposure,
        npaDistribution,
        calculatedAt: new Date(),
      },
    });

    // 11. Generate alerts if needed
    await this.generateAlerts(bankId, reportingCycle, metrics);

    return metrics;
  }

  /**
   * Calculate escalation and persistence rates
   */
  private async calculateRiskRates(
    bankId: string,
    currentCycle: string,
    previousCycle: string,
  ) {
    const currentRecords = await prisma.record.findMany({
      where: { bankId, reportingCycle: currentCycle },
      select: { borrowerId: true, assetClassification: true },
    });

    const previousRecords = await prisma.record.findMany({
      where: { bankId, reportingCycle: previousCycle },
      select: { borrowerId: true, assetClassification: true },
    });

    const prevMap = new Map(
      previousRecords.map((r) => [r.borrowerId, r.assetClassification]),
    );

    let escalated = 0;
    let persisted = 0;
    let total = 0;

    currentRecords.forEach((curr) => {
      const prev = prevMap.get(curr.borrowerId);
      if (prev) {
        total++;
        // Check if escalated (simplified logic)
        if (this.isEscalated(prev, curr.assetClassification)) {
          escalated++;
        }
        // Check if persisted in high-risk category
        if (
          this.isHighRisk(prev) &&
          this.isHighRisk(curr.assetClassification)
        ) {
          persisted++;
        }
      }
    });

    return {
      escalationRate: total > 0 ? (escalated / total) * 100 : 0,
      persistenceRate: total > 0 ? (persisted / total) * 100 : 0,
    };
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
    npaCount: number;
  }): number {
    // Weighted scoring algorithm
    const weights = {
      suitFiled: 0.25,
      geoConcentration: 0.15,
      escalation: 0.25,
      persistence: 0.2,
      growth: 0.1,
      npaCount: 0.05,
    };

    const score =
      factors.suitFiledPercentage * weights.suitFiled +
      factors.geoConcentration * weights.geoConcentration +
      factors.escalationRate * weights.escalation +
      factors.persistenceRate * weights.persistence +
      Math.max(0, factors.exposureGrowth) * weights.growth +
      Math.min(100, factors.npaCount * 10) * weights.npaCount;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine risk category based on composite score
   */
  private determineRiskCategory(score: number): string {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  }

  /**
   * Generate alerts based on metrics
   */
  private async generateAlerts(
    bankId: string,
    reportingCycle: string,
    metrics: any,
  ) {
    const alerts = [];

    // High risk alert
    if (metrics.compositeScore >= 70) {
      alerts.push({
        bankId,
        reportingCycle,
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
        reportingCycle,
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
        reportingCycle,
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
  private getPreviousCycle(cycle: string): string {
    // Parse cycle like "DEC25" and get previous month
    const monthMap: { [key: string]: string } = {
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
