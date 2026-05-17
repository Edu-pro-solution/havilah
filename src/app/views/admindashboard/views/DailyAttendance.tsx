import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Save } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

type AttendanceStatus = "present" | "absent" | "late";

type StudentRow = {
  _id: string;
  studentName?: string;
  name?: string;
  AdmNo?: string;
  status: AttendanceStatus;
};

export default function DailyAttendance() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const sessionId = currentSession?._id;

  const { data: classesRaw } = useFetch(sessionId ? `/class/${sessionId}` : null);
  const classes = useMemo(
    () => Array.isArray(classesRaw) ? (classesRaw as any[]).sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))) : [],
    [classesRaw],
  );

  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleGetStudents = async () => {
    if (!sessionId || !selectedClass) { toast.error("Please select a class"); return; }
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiUrl}/api/students/${sessionId}/${selectedClass.toUpperCase()}`,
        { headers: authHeaders() },
      );
      const students: any[] = Array.isArray(res.data?.data || res.data)
        ? (res.data?.data || res.data)
        : [];

      setRows(students.map((s) => ({
        _id: String(s._id),
        studentName: s.studentName || s.name,
        AdmNo: s.AdmNo,
        status: "present",
      })));
      setFetched(true);
      setCurrentPage(1);
      toast.success(`Loaded ${students.length} student(s)`);
    } catch {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (id: string, status: AttendanceStatus) => {
    setRows((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
  };

  const handleSave = async () => {
    if (!sessionId || !selectedClass || rows.length === 0) {
      toast.error("Load students first");
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${apiUrl}/api/attendance`,
        { sessionId, className: selectedClass, date, students: rows.map(r => ({ studentId: r._id, status: r.status })) },
        { headers: authHeaders() },
      );
      toast.success("Attendance saved successfully");
    } catch {
      toast.error("Attendance save failed — the attendance API may not be configured yet");
    } finally {
      setSaving(false);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = rows.slice(indexOfFirst, indexOfLast);

  const summary = useMemo(() => ({
    present: rows.filter(r => r.status === "present").length,
    absent: rows.filter(r => r.status === "absent").length,
    late: rows.filter(r => r.status === "late").length,
  }), [rows]);

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-[#004aaa]">Manage Daily Attendance</h2>

      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Select a Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (
                    <SelectItem key={c._id} value={String(c.name || "")}>{String(c.name || "—")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-500">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div />
            <Button
              onClick={handleGetStudents}
              disabled={loading}
              className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2">
              <Search size={16} /> {loading ? "Loading..." : "Get Students"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {fetched && (
        <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
          <CardHeader className="bg-white border-b py-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg font-bold text-[#004aaa]">
                  Attendance — {selectedClass}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Date: {date} &nbsp;|&nbsp;
                  <span className="text-emerald-600 font-medium">{summary.present} present</span>,{" "}
                  <span className="text-red-500 font-medium">{summary.absent} absent</span>,{" "}
                  <span className="text-amber-500 font-medium">{summary.late} late</span>
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2 h-9 px-6">
                <Save size={16} /> {saving ? "Saving..." : "Save Attendance"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#E8EBF3]">
                <TableRow>
                  <TableHead className="w-[80px] text-[#004aaa] font-bold pl-6">#</TableHead>
                  <TableHead className="text-[#004aaa] font-bold">Adm No</TableHead>
                  <TableHead className="text-[#004aaa] font-bold">Name</TableHead>
                  <TableHead className="text-[#004aaa] font-bold pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRows.map((row, idx) => (
                    <TableRow key={row._id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 font-medium text-slate-500">{indexOfFirst + idx + 1}</TableCell>
                      <TableCell className="font-mono text-sm text-blue-600 font-semibold">{row.AdmNo || "—"}</TableCell>
                      <TableCell className="font-bold text-slate-800">{row.studentName || "—"}</TableCell>
                      <TableCell className="pr-6">
                        <Select value={row.status} onValueChange={(v) => setStatus(row._id, v as AttendanceStatus)}>
                          <SelectTrigger className="w-[150px] bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present" className="text-green-600">Present</SelectItem>
                            <SelectItem value="absent" className="text-red-600">Absent</SelectItem>
                            <SelectItem value="late" className="text-amber-600">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <div className="border-t px-4">
            <DataTablePagination
              totalItems={rows.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
