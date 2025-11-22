import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CSVImportDialog({ open, onOpenChange }: CSVImportDialogProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/classes/import-csv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Import failed");
      }

      const result = await response.json();
      setResults(result);

      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.success} classes`,
      });

      if (result.success > 0) {
        setTimeout(() => {
          onOpenChange(false);
          setResults(null);
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Import Error",
        description: error.message || "Failed to import CSV",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Classes from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with your class schedule. Required columns: courseName, meetingTimes (comma-separated), examDates (comma-separated)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
              className="w-full"
              data-testid="button-select-csv"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Select CSV File"}
            </Button>
          </div>

          {results && (
            <div className="space-y-3">
              {results.success > 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {results.success} classes imported successfully
                    </p>
                  </div>
                </div>
              )}

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">
                        {results.errors.length} rows failed
                      </p>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {results.errors.map((error, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground">
                        Row {error.row}: {error.error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
            <p className="font-medium mb-1">CSV Format Example:</p>
            <pre className="text-xs overflow-x-auto">
{`courseName,meetingTimes,examDates
Calculus 1,"Mon 10:00-11:30, Wed 10:00-11:30","2025-05-15"
Physics 101,"Tue 14:00-15:30, Thu 14:00-15:30","2025-05-20"`}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
