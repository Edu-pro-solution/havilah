import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SessionContext } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet } from "lucide-react";

const REQUIRED_FIELDS = [
  "username",
  "classname",
  "email",
  "parentsName",
  "phone",
  "birthday",
  "address",
  "AdmNo",
  "password",
  "studentName",
];

export default function BulkStudentUpload() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!currentSession?._id) {
      toast.error("No active session found.");
      return;
    }
    if (!file) {
      toast.error("Choose a CSV or Excel file first.");
      return;
    }

    const payload = new FormData();
    payload.append("file", file);
    payload.append("sessionId", currentSession._id);

    try {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");
      const response = await axios.post(`${apiUrl}/api/bulk-upload/students`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setResult(response.data);
      toast.success("Bulk upload finished.");
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      toast.error(error?.response?.data?.message || "Bulk upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Bulk Student Upload</h2>
        <p className="text-sm text-muted-foreground">
          Upload a CSV or Excel file to create many students at once.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="flex items-center gap-2 text-base text-primary">
            <FileSpreadsheet className="h-4 w-4" />
            File Format Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-foreground">
            The CSV or Excel file must include every field below exactly like the admin student form.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {REQUIRED_FIELDS.map((field) => (
              <div key={field} className="rounded-md border border-black bg-white px-3 py-2 text-sm font-medium text-black">
                {field}
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="border-black"
            />
            <Button onClick={handleUpload} disabled={loading} className="gap-2">
              <Upload className="h-4 w-4" />
              {loading ? "Uploading..." : "Upload Students"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-base text-primary">Upload Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-3 md:grid-cols-4">
              {Object.entries(result.summary || {}).map(([key, value]) => (
                <div key={key} className="rounded-md border border-black bg-white p-4">
                  <p className="text-xs uppercase text-muted-foreground">{key}</p>
                  <p className="text-xl font-bold text-black">{String(value)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {(result.results || []).map((item: any) => (
                <div key={`${item.row}-${item.status}`} className="rounded-md border border-black bg-white px-4 py-3 text-sm">
                  Row {item.row}: <span className="font-bold capitalize">{item.status}</span>
                  {item.username ? ` - ${item.username}` : ""}
                  {item.reason ? ` - ${item.reason}` : ""}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
