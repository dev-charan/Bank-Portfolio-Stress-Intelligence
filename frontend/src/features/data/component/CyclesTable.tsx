// src/features/data/component/CyclesTable.tsx
import { formatDistanceToNow } from "date-fns";
import {
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadedCycle } from "@/types/data.types";

interface CyclesTableProps {
  cycles: UploadedCycle[];
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function CyclesTable({ cycles, onDelete, isLoading }: CyclesTableProps) {
  const getStatusBadge = (status: UploadedCycle["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium text-gray-900">Loading cycles...</p>
          <p className="text-xs text-gray-500 mt-1">
            Fetching data from server
          </p>
        </CardContent>
      </Card>
    );
  }

  if (cycles.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900">
            No cycles uploaded yet
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Upload your first CRIF data file to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Uploaded Cycles</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cycle Name</TableHead>
              <TableHead>File Name</TableHead>
              <TableHead className="text-right">Records</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cycles.map((cycle) => (
              <TableRow key={cycle.id}>
                <TableCell className="font-medium">{cycle.cycleName}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {cycle.fileName}
                </TableCell>
                <TableCell className="text-right">
                  {cycle.recordCount.toLocaleString()}
                </TableCell>
                <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDistanceToNow(cycle.uploadDate, { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(cycle.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
