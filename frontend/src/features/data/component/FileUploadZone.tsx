// src/components/data/FileUploadZone.tsx
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileSpreadsheet,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { parseExcelFile } from "@/lib/excel-parser";
import { CRIFRecord, ValidationResult } from "@/types/data.types";

interface FileUploadZoneProps {
  onUploadComplete: (data: CRIFRecord[], fileName: string) => void;
}

export function FileUploadZone({ onUploadComplete }: FileUploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parsedData, setParsedData] = useState<CRIFRecord[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setSelectedFile(file);
    setValidation(null);
    setParsedData([]);
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Parse Excel file
      const result = await parseExcelFile(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setValidation(result.validation);
      setParsedData(result.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      clearInterval(progressInterval);
      setValidation({
        isValid: false,
        errors: ["Failed to parse Excel file. Please check the file format."],
        warnings: [],
        recordCount: 0,
      });
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleConfirmUpload = () => {
    if (selectedFile && validation?.isValid && parsedData.length > 0) {
      onUploadComplete(parsedData, selectedFile.name);
      // Reset
      setSelectedFile(null);
      setValidation(null);
      setParsedData([]);
      setUploadProgress(0);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setValidation(null);
    setParsedData([]);
    setUploadProgress(0);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors duration-200
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {isDragActive ? "Drop your file here" : "Upload CRIF Data"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to browse
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Supported: .xlsx, .xls
              </Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing file...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Validation Results */}
            {validation && (
              <div className="space-y-3">
                {validation.isValid && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      File validated successfully! Found{" "}
                      {validation.recordCount} records.
                    </AlertDescription>
                  </Alert>
                )}

                {validation.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-1">
                        Validation Errors:
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {validation.errors.map((error, idx) => (
                          <li key={idx}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.warnings.length > 0 && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <div className="font-semibold mb-1">
                        Warnings ({validation.warnings.length}):
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1 max-h-32 overflow-y-auto">
                        {validation.warnings.slice(0, 5).map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                        {validation.warnings.length > 5 && (
                          <li className="font-medium">
                            ...and {validation.warnings.length - 5} more
                          </li>
                        )}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleConfirmUpload}
                    disabled={!validation.isValid}
                    className="flex-1"
                  >
                    Confirm Upload
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
