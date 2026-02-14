import prisma from "../config/database";
import { Decimal } from "@prisma/client/runtime/library";

interface BankMetrics {
  id: string;
  name: string;
  code?: string | null;
  compositeScore: number;
  riskCategory: "HIGH" | "MEDIUM" | "LOW";
  exposureGrowth: number;
  escalationRate: number;
  persistenceRate: number;
  geoConcentration: number;
  totalExposure: number;
  totalRecords: number;
  suitFiledCount: number;
  branchCount: number;
  borrowerCount: number;
  topState?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BankAnalyticsService {
  // Calculate all metrics for a single bank
  async calculateBankMetrics(bankId: string): Promise<BankMetrics | null> {
    const bank = await prisma.bank.findUnique({
      where: { id: bankId },
      include: {
        _count: {
          select: {
            records: true,
            branches: true,
          },
        },
      },
    });

    if (!bank) return null;

    // Get all records for this bank
    const records = await prisma.record.findMany({
      where: { bankId },
      include: {
        borrower: true,
        branch: true,
      },
    });

    if (records.length === 0) {
      return {
        id: bank.id,
        name: bank.name,
        code: bank.code,
        compositeScore: 0,
        riskCategory: "LOW",
        exposureGrowth: 0,
        escalationRate: 0,
        persistenceRate: 0,
        geoConcentration: 0,
        totalExposure: 0,
        totalRecords: 0,
        suitFiledCount: 0,
        branchCount: bank._count.branches,
        borrowerCount: 0,
        createdAt: bank.createdAt,
        updatedAt: bank.updatedAt,
      };
    }

    // Calculate total exposure
    const totalExposure = records.reduce(
      (sum, record) => sum + Number(record.outstandingAmount),
      0,
    );

    // Calculate suit filed count
    const suitFiledCount = records.filter((r) => r.suitFiled).length;

    // Calculate escalation rate
    const escalationRate = (suitFiledCount / records.length) * 100;

    // Calculate exposure growth
    const exposureGrowth = await this.calculateExposureGrowth(bankId);

    // Calculate persistence rate
    const persistenceRate = await this.calculatePersistenceRate(bankId);

    // Calculate geo concentration
    const { concentration, topState } =
      await this.calculateGeoConcentration(bankId);

    // Get unique borrowers count
    const uniqueBorrowers = new Set(records.map((r) => r.borrowerId)).size;

    // Calculate composite score (weighted average)
    const compositeScore = this.calculateCompositeScore(
      exposureGrowth,
      escalationRate,
      persistenceRate,
      concentration,
    );

    // Determine risk category
    const riskCategory = this.determineRiskCategory(compositeScore);

    return {
      id: bank.id,
      name: bank.name,
      code: bank.code,
      compositeScore: Math.round(compositeScore * 100) / 100,
      riskCategory,
      exposureGrowth: Math.round(exposureGrowth * 100) / 100,
      escalationRate: Math.round(escalationRate * 100) / 100,
      persistenceRate: Math.round(persistenceRate * 100) / 100,
      geoConcentration: Math.round(concentration * 100) / 100,
      totalExposure,
      totalRecords: records.length,
      suitFiledCount,
      branchCount: bank._count.branches,
      borrowerCount: uniqueBorrowers,
      topState,
      createdAt: bank.createdAt,
      updatedAt: bank.updatedAt,
    };
  }

  // Calculate exposure growth (first cycle vs last cycle)
  private async calculateExposureGrowth(bankId: string): Promise<number> {
    // Get all unique cycles for this bank
    const records = await prisma.record.findMany({
      where: { bankId },
      select: {
        reportingCycle: true,
        outstandingAmount: true,
      },
      orderBy: {
        reportingCycle: "asc",
      },
    });

    if (records.length === 0) return 0;

    // Group by cycle
    const cycleMap = new Map<string, number>();
    records.forEach((record) => {
      const current = cycleMap.get(record.reportingCycle) || 0;
      cycleMap.set(
        record.reportingCycle,
        current + Number(record.outstandingAmount),
      );
    });

    const cycles = Array.from(cycleMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    if (cycles.length < 2) return 0;

    const firstCycleExposure = cycles[0][1];
    const lastCycleExposure = cycles[cycles.length - 1][1];

    if (firstCycleExposure === 0) return 0;

    const growth =
      ((lastCycleExposure - firstCycleExposure) / firstCycleExposure) * 100;

    return growth;
  }

  // Calculate persistence rate (borrowers appearing in multiple cycles)
  private async calculatePersistenceRate(bankId: string): Promise<number> {
    // Get all borrower-cycle combinations
    const records = await prisma.record.findMany({
      where: { bankId },
      select: {
        borrowerId: true,
        reportingCycle: true,
      },
    });

    if (records.length === 0) return 0;

    // Count cycles per borrower
    const borrowerCycles = new Map<string, Set<string>>();
    records.forEach((record) => {
      if (!borrowerCycles.has(record.borrowerId)) {
        borrowerCycles.set(record.borrowerId, new Set());
      }
      borrowerCycles.get(record.borrowerId)!.add(record.reportingCycle);
    });

    // Count borrowers appearing in 3+ cycles
    const persistentBorrowers = Array.from(borrowerCycles.values()).filter(
      (cycles) => cycles.size >= 3,
    ).length;

    const totalBorrowers = borrowerCycles.size;

    if (totalBorrowers === 0) return 0;

    return (persistentBorrowers / totalBorrowers) * 100;
  }

  // Calculate geographic concentration (top state percentage)
  private async calculateGeoConcentration(
    bankId: string,
  ): Promise<{ concentration: number; topState: string }> {
    // Get all records with state info
    const records = await prisma.record.findMany({
      where: { bankId },
      include: {
        branch: true,
      },
    });

    if (records.length === 0) {
      return { concentration: 0, topState: "N/A" };
    }

    // Calculate exposure by state
    const stateExposure = new Map<string, number>();
    let totalExposure = 0;

    records.forEach((record) => {
      const state = record.branch.state;
      const exposure = Number(record.outstandingAmount);

      stateExposure.set(state, (stateExposure.get(state) || 0) + exposure);
      totalExposure += exposure;
    });

    if (totalExposure === 0) {
      return { concentration: 0, topState: "N/A" };
    }

    // Find top state
    let maxExposure = 0;
    let topState = "N/A";

    stateExposure.forEach((exposure, state) => {
      if (exposure > maxExposure) {
        maxExposure = exposure;
        topState = state;
      }
    });

    const concentration = (maxExposure / totalExposure) * 100;

    return { concentration, topState };
  }

  // Calculate composite score (weighted average)
  private calculateCompositeScore(
    exposureGrowth: number,
    escalationRate: number,
    persistenceRate: number,
    geoConcentration: number,
  ): number {
    // Normalize exposure growth to 0-100 scale
    // Assuming +100% growth is max risk (score 100)
    const normalizedGrowth =
      Math.min(Math.max(exposureGrowth, -100), 100) + 100;
    const growthScore = (normalizedGrowth / 200) * 100;

    // Weights
    const weights = {
      exposureGrowth: 0.3,
      escalation: 0.25,
      persistence: 0.25,
      geoConcentration: 0.2,
    };

    const compositeScore =
      growthScore * weights.exposureGrowth +
      escalationRate * weights.escalation +
      persistenceRate * weights.persistence +
      geoConcentration * weights.geoConcentration;

    return compositeScore;
  }

  // Determine risk category based on composite score
  private determineRiskCategory(score: number): "HIGH" | "MEDIUM" | "LOW" {
    if (score >= 70) return "HIGH";
    if (score >= 40) return "MEDIUM";
    return "LOW";
  }

  // Calculate metrics for all banks
  async calculateAllBanksMetrics(): Promise<BankMetrics[]> {
    const banks = await prisma.bank.findMany();

    const metricsPromises = banks.map((bank) =>
      this.calculateBankMetrics(bank.id),
    );

    const metrics = await Promise.all(metricsPromises);

    // Filter out null values
    return metrics.filter((m): m is BankMetrics => m !== null);
  }
}
