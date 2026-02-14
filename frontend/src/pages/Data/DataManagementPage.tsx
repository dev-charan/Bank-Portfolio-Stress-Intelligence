// src/pages/Data/DataManagementPage.tsx
import { FileUploadZone } from "@/features/data/component/FileUploadZone";
import { CyclesTable } from "@/features/data/component/CyclesTable";
import { ModelActions } from "@/features/data/component/ModelActions";
import { CRIFRecord } from "@/types/data.types";
import { useUploadData } from "@/hooks/mutations/useUploadData";
import { useCycles } from "@/hooks/queries/useCycles";
import { useDeleteCycle } from "@/hooks/mutations/useDeleteCycle";

export default function DataManagementPage() {
  // TanStack Query hooks
  const uploadMutation = useUploadData();
  const { data: cyclesData, isLoading: cyclesLoading } = useCycles();
  const deleteMutation = useDeleteCycle();

  // Transform backend data to match component interface
  const cycles =
    cyclesData?.map((cycle) => ({
      id: cycle.id,
      cycleName: cycle.cycleName,
      fileName: cycle.fileName,
      recordCount: cycle.recordCount,
      uploadDate: new Date(cycle.uploadDate),
      status: cycle.status as "processing" | "completed" | "error",
      errorMessage: cycle.errorMessage,
    })) || [];

  const handleUploadComplete = (data: CRIFRecord[], fileName: string) => {
    const cycleName = data[0]?.reportingCycle || "Unknown Cycle";

    // Send to backend via TanStack Query
    uploadMutation.mutate({
      records: data,
      cycleName,
      fileName,
    });
  };

  const handleDeleteCycle = (id: string) => {
    // Delete via TanStack Query
    deleteMutation.mutate(id);
  };

  const handleRunModel = () => {
    // TODO: Implement backend model run API
    console.log("Running risk model...");
  };

  const handleRecompute = () => {
    // TODO: Implement backend recompute API
    console.log("Recomputing scores...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
        <p className="text-muted-foreground mt-2">
          Upload and manage CRIF reporting cycles for risk analysis
        </p>
      </div>

      <FileUploadZone onUploadComplete={handleUploadComplete} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CyclesTable
            cycles={cycles}
            onDelete={handleDeleteCycle}
            isLoading={cyclesLoading}
          />
        </div>

        <div>
          <ModelActions
            lastRunDate={null} // TODO: Get from backend
            cycleCount={cycles.length}
            onRunModel={handleRunModel}
            onRecompute={handleRecompute}
            isRunning={uploadMutation.isPending || deleteMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
