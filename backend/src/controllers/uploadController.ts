// src/controllers/uploadController.ts
import { Request, Response, NextFunction } from "express";
import { RecordService, RecordData } from "../services/recordService";
import { BankMetricsService } from "../services/bankMetricsService"; 
import { logger } from "../utils/logger";
import prisma from "../config/database";

const recordService = new RecordService();
const metricsService = new BankMetricsService(); 

export class UploadController {
  // Upload Excel data (from frontend parsing)
  async uploadRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const { records, cycleName, fileName } = req.body;

      if (!records || !Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No records provided",
        });
      }

      if (!cycleName) {
        return res.status(400).json({
          success: false,
          message: "Cycle name is required",
        });
      }

      logger.info(
        `Processing ${records.length} records for cycle: ${cycleName}`,
      );

      // Check if cycle already exists
      let reportingCycle = await prisma.reportingCycle.findUnique({
        where: { cycleName },
      });

      if (reportingCycle) {
        // Cycle exists - reject duplicate upload
        return res.status(400).json({
          success: false,
          message: `Cycle "${cycleName}" already exists. Please delete it first or use a different cycle name.`,
        });
      }

      // Create new reporting cycle
      reportingCycle = await prisma.reportingCycle.create({
        data: {
          cycleName,
          fileName,
          recordCount: records.length,
          status: "processing",
        },
      });

      // Transform records to match RecordData interface
      const transformedRecords: RecordData[] = records.map((record: any) => ({
        reportingCycle: record.reportingCycle || cycleName,
        bankName: record.bankName,
        branchName: record.branchName || record.bankBranch || "Head Office",
        state: record.state,
        borrowerName: record.borrowerName,
        borrowerPan: record.borrowerPan || null,
        borrowerAddress: record.borrowerAddress || null,
        outstandingAmount: parseFloat(record.outstandingAmount) || 0,
        suitFiled: record.suitFiled === "Y" || record.suitFiled === true,
        assetClassification: record.assetClassification || null,
        assetClassificationDate: record.assetClassificationDate
          ? new Date(record.assetClassificationDate)
          : null,
        directorName:
          record.directorName || record.directorPromotorName || null,
        directorDin: record.directorDin || record.directorPromotorDin || null,
        directorPan: record.directorPan || record.directorPromotorPan || null,
        guarantorName: record.guarantorName || null,
        guarantorCin: record.guarantorCin || null,
        guarantorPan: record.guarantorPan || null,
        otherBanks: record.otherBanks || null,
      }));

      // Bulk create records
      const results = await recordService.bulkCreateRecords(transformedRecords);

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;
      const errors = results
        .filter((r) => !r.success)
        .map((r: any, idx) => ({
          row: idx + 1,
          error: r.error?.message || "Unknown error",
          data: r.data,
        }));

      // ✅ NEW: Calculate metrics after successful upload
      if (successCount > 0) {
        logger.info(`Starting metrics calculation for cycle: ${cycleName}`);

        try {
          // Calculate metrics for all banks in this cycle
          await metricsService.calculateMetricsForCycle(cycleName);

          logger.success(
            `Metrics calculated successfully for cycle: ${cycleName}`,
          );
        } catch (metricsError: any) {
          logger.error("Metrics calculation error:", metricsError);
          // Don't fail the upload, just log the error
          // Metrics can be recalculated later if needed
        }
      }

      // Update reporting cycle status
      await prisma.reportingCycle.update({
        where: { id: reportingCycle.id },
        data: {
          status: failCount === 0 ? "completed" : "error",
          errorMessage: failCount > 0 ? `${failCount} records failed` : null,
        },
      });

      logger.success(
        `Upload complete: ${successCount} success, ${failCount} failed`,
      );

      res.status(200).json({
        success: true,
        message: "Records uploaded and metrics calculated successfully",
        data: {
          cycleId: reportingCycle.id,
          cycleName: cycleName, // ✅ ADD: Return cycle name
          totalRecords: records.length,
          successCount,
          failCount,
          errors: errors.slice(0, 10),
        },
      });
    } catch (error: any) {
      logger.error("Upload error:", error);
      next(error);
    }
  }

  // Get all reporting cycles
  async getCycles(req: Request, res: Response, next: NextFunction) {
    try {
      const cycles = await prisma.reportingCycle.findMany({
        orderBy: { uploadDate: "desc" },
      });

      res.json({
        success: true,
        data: cycles,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete a reporting cycle
  async deleteCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Get cycle info first
      const cycle = await prisma.reportingCycle.findUnique({
        where: { id },
      });

      if (!cycle) {
        return res.status(404).json({
          success: false,
          message: "Cycle not found",
        });
      }

      // ✅ NEW: Delete bank metrics for this cycle first
      await prisma.bankMetrics.deleteMany({
        where: { reportingCycle: cycle.cycleName },
      });

      // ✅ NEW: Delete alerts for this cycle
      await prisma.alert.deleteMany({
        where: { reportingCycle: cycle.cycleName },
      });

      // Delete all records for this cycle
      await prisma.record.deleteMany({
        where: { reportingCycle: cycle.cycleName },
      });

      // Delete cycle metadata
      await prisma.reportingCycle.delete({
        where: { id },
      });

      logger.success(`Deleted cycle: ${cycle.cycleName}`);

      res.json({
        success: true,
        message: "Cycle deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
