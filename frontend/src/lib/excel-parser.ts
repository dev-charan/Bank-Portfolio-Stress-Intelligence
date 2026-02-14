import * as XLSX from "xlsx";
import { CRIFRecord, ValidationResult } from "@/types/data.types";

const REQUIRED_COLUMNS = [
  "Bank Name",
  "Borrower Name",
  "Outstanding Amount(in Lakhs)",
  "Suit Filed (Y/N)",
  "State",
  "Reporting Cycle",
];

export function parseExcelFile(file: File): Promise<{
  data: CRIFRecord[];
  validation: ValidationResult;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as any[][];

        // Validate and parse
        const result = validateAndParseData(jsonData);
        resolve(result);
      } catch (error) {
        reject(new Error("Failed to parse Excel file"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });
}

function validateAndParseData(jsonData: any[][]): {
  data: CRIFRecord[];
  validation: ValidationResult;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const records: CRIFRecord[] = [];

  // Check if data exists
  if (jsonData.length < 2) {
    errors.push("File is empty or contains no data rows");
    return {
      data: [],
      validation: { isValid: false, errors, warnings, recordCount: 0 },
    };
  }

  // Get headers (first row)
  const headers = jsonData[0].map((h) => String(h).trim());

  // Validate required columns
  const missingColumns = REQUIRED_COLUMNS.filter(
    (col) => !headers.includes(col),
  );
  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
    return {
      data: [],
      validation: { isValid: false, errors, warnings, recordCount: 0 },
    };
  }

  // Get column indices (using exact header names)
  const colMap = {
    bankName: headers.indexOf("Bank Name"),
    borrowerName: headers.indexOf("Borrower Name"),
    outstandingAmount: headers.indexOf("Outstanding Amount(in Lakhs)"),
    suitFiled: headers.indexOf("Suit Filed (Y/N)"),
    state: headers.indexOf("State"),
    reportingCycle: headers.indexOf("Reporting Cycle"),
  };

  // Parse data rows (skip header)
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];

    // Skip empty rows
    if (!row || row.every((cell) => !cell)) continue;

    try {
      const record: CRIFRecord = {
        bankName: String(row[colMap.bankName] || "").trim(),
        borrowerName: String(row[colMap.borrowerName] || "").trim(),
        outstandingAmount: parseFloat(
          String(row[colMap.outstandingAmount] || 0),
        ),
        suitFiled: String(row[colMap.suitFiled] || "N")
          .trim()
          .toUpperCase() as "Y" | "N",
        state: String(row[colMap.state] || "").trim(),
        reportingCycle: String(row[colMap.reportingCycle] || "").trim(),
      };

      // Validate record
      if (!record.bankName) {
        warnings.push(`Row ${i + 1}: Missing bank name`);
      }
      if (!record.borrowerName) {
        warnings.push(`Row ${i + 1}: Missing borrower name`);
      }
      if (isNaN(record.outstandingAmount) || record.outstandingAmount <= 0) {
        warnings.push(`Row ${i + 1}: Invalid outstanding amount`);
      }
      if (!["Y", "N"].includes(record.suitFiled)) {
        warnings.push(
          `Row ${i + 1}: Invalid suit filed value (must be Y or N)`,
        );
        record.suitFiled = "N";
      }
      if (!record.state) {
        warnings.push(`Row ${i + 1}: Missing state`);
      }
      if (!record.reportingCycle) {
        warnings.push(`Row ${i + 1}: Missing reporting cycle`);
      }

      records.push(record);
    } catch (error) {
      warnings.push(`Row ${i + 1}: Failed to parse row`);
    }
  }

  const isValid = errors.length === 0 && records.length > 0;

  return {
    data: records,
    validation: {
      isValid,
      errors,
      warnings,
      recordCount: records.length,
    },
  };
}
