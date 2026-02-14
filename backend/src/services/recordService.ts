import prisma from "../config/database";
import { BankService } from "./bankService";
import { BorrowerService } from "./borrowerService";

const bankService = new BankService();
const borrowerService = new BorrowerService();

export interface RecordData {
  reportingCycle: string;
  bankName: string;
  branchName: string;
  state: string;
  borrowerName: string;
  borrowerPan: string | null;
  borrowerAddress: string | null;
  outstandingAmount: number;
  suitFiled: boolean;
  assetClassification: string | null;
  assetClassificationDate: Date | null;
  directorName: string | null;
  directorDin: string | null;
  directorPan: string | null;
  guarantorName: string | null;
  guarantorCin: string | null;
  guarantorPan: string | null;
  otherBanks: string | null;
}

export class RecordService {
  async createRecord(data: RecordData) {
    // Step 1: Find or create bank
    const bank = await bankService.findOrCreateBank(data.bankName);

    // Step 2: Find or create branch
    const branch = await bankService.findOrCreateBranch(
      bank.id,
      data.branchName,
      data.state,
    );

    // Step 3: Find or create borrower
    const borrower = await borrowerService.findOrCreateBorrower(
      data.borrowerName,
      data.borrowerPan,
      data.borrowerAddress,
    );

    // Step 4: Create director if exists
    if (data.directorName) {
      await borrowerService.upsertDirector(
        borrower.id,
        data.directorName,
        data.directorDin,
        data.directorPan,
      );
    }

    // Step 5: Create guarantor if exists
    if (data.guarantorName) {
      await borrowerService.upsertGuarantor(
        borrower.id,
        data.guarantorName,
        data.guarantorCin,
        data.guarantorPan,
      );
    }

    // Step 6: Create central record
    const record = await prisma.record.upsert({
      where: {
        reportingCycle_bankId_borrowerId: {
          reportingCycle: data.reportingCycle,
          bankId: bank.id,
          borrowerId: borrower.id,
        },
      },
      update: {
        branchId: branch.id,
        outstandingAmount: data.outstandingAmount,
        suitFiled: data.suitFiled,
        assetClassification: data.assetClassification,
        assetClassificationDate: data.assetClassificationDate,
        otherBanks: data.otherBanks,
      },
      create: {
        reportingCycle: data.reportingCycle,
        bankId: bank.id,
        branchId: branch.id,
        borrowerId: borrower.id,
        outstandingAmount: data.outstandingAmount,
        suitFiled: data.suitFiled,
        assetClassification: data.assetClassification,
        assetClassificationDate: data.assetClassificationDate,
        otherBanks: data.otherBanks,
      },
    });

    return record;
  }

  // Bulk insert records
  async bulkCreateRecords(records: RecordData[]) {
    const results = [];

    for (const recordData of records) {
      try {
        const record = await this.createRecord(recordData);
        results.push({ success: true, record });
      } catch (error) {
        results.push({ success: false, error, data: recordData });
      }
    }

    return results;
  }

  // Get records by cycle
  async getRecordsByCycle(reportingCycle: string) {
    return await prisma.record.findMany({
      where: { reportingCycle },
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
    });
  }
}
