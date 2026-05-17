import { useState, useContext, useMemo } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DataTablePagination } from "@/components/DataTablePagination";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { toast } from "sonner";

type PsyRow = {
  studentId: string;
  studentName?: string;
  AdmNo?: string;
  instruction: number;
  independently: number;
  punctuality: number;
  talking: number;
  eyecontact: number;
  remarks: string;
  premarks: string;
};

function PsychoStudentReport() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const sessionId = currentSession?._id;

  const { data: examsRaw } = useFetch(sessionId ? `/getofflineexam/${sessionId}` : null);
  const exams = useMemo(() => Array.isArray(examsRaw) ? examsRaw as any[] : [], [examsRaw]);

  const { data: classesRaw } = useFetch(sessionId ? `/class/${sessionId}` : null);
  const classes = useMemo(() => Array.isArray(classesRaw) ? (classesRaw as any[]).sort((a, b) => String(a.name).localeCompare(String(b.name))) : [], [classesRaw]);

  const [selectedExam, setSelectedExam] = useState(""); // exam _id for saving
  const [selectedExamName, setSelectedExamName] = useState(""); // exam name for getScores lookup
  const [selectedClass, setSelectedClass] = useState("");
  const [rows, setRows] = useState<PsyRow[]>([]);
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleGetStudents = async () => {
    if (!sessionId || !selectedClass) {
      toast.error("Please select a class");
      return;
    }
    setLoading(true);
    try {
      const [stuRes, psyRes] = await Promise.allSettled([
        axios.get(`${apiUrl}/api/students/${sessionId}/${selectedClass}`, { headers: authHeaders() }),
        selectedExam
          ? axios.get(`${apiUrl}/api/get-all-psy/${selectedExam}`, { headers: authHeaders() })
          : Promise.resolve({ data: { scores: [] } }),
      ]);

      const students = stuRes.status === "fulfilled"
        ? (Array.isArray(stuRes.value.data?.data || stuRes.value.data) ? (stuRes.value.data?.data || stuRes.value.data) : [])
        : [];

      const psyMarks: any[] = psyRes.status === "fulfilled"
        ? (psyRes.value.data?.scores || [])
        : [];

      const mapped: PsyRow[] = students.map((s: any) => {
        const existing = psyMarks.find((p: any) =>
          String(p.studentId?._id || p.studentId) === String(s._id)
        );
        return {
          studentId: String(s._id),
          studentName: s.studentName || s.name,
          AdmNo: s.AdmNo,
          instruction: existing?.instruction ?? 0,
          independently: existing?.independently ?? 0,
          punctuality: existing?.punctuality ?? 0,
          talking: existing?.talking ?? 0,
          eyecontact: existing?.eyecontact ?? 0,
          remarks: existing?.remarks ?? "",
          premarks: existing?.premarks ?? "",
        };
      });
      setRows(mapped);
      setFetched(true);
      setCurrentPage(1);
      toast.success(`Loaded ${mapped.length} student(s)`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, field: keyof PsyRow, value: string | number) => {
    setRows((prev) => prev.map((r, i) => i !== index ? r : { ...r, [field]: value }));
  };

  const handleSave = async () => {
    if (!sessionId || !selectedExam) { toast.error("Select an exam to save"); return; }
    setSaving(true);
    try {
      // Check if records already exist for this exam
      const checkRes = await axios.get(
        `${apiUrl}/api/get-all-psy/${selectedExam}`,
        { headers: authHeaders() }
      ).catch(() => ({ data: { scores: [] } }));

      const existingScores: any[] = checkRes.data?.scores || [];

      if (existingScores.length > 0) {
        // Update existing marks
        await axios.put(
          `${apiUrl}/api/update-all-psy`,
          { examId: selectedExam, updates: rows },
          { headers: authHeaders() }
        );
      } else {
        // First save
        await axios.post(
          `${apiUrl}/api/save-psy/${sessionId}`,
          { examId: selectedExam, updates: rows },
          { headers: authHeaders() }
        );
      }
      toast.success("Psychomotor report saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = rows.slice(indexOfFirst, indexOfLast);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#004aaa]">
        Manage Affective &amp; Psychomotor Report
      </h2>

      <Card className="border-none shadow-sm bg-slate-50/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Select an Exam</label>
              <Select value={selectedExam} onValueChange={(val) => {
                setSelectedExam(val);
                const found = exams.find((e: any) => e._id === val);
                setSelectedExamName(found?.name || found?.examName || "");
              }}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((ex: any) => (
                    <SelectItem key={ex._id} value={ex._id}>{ex.name || ex.examName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Select a Class</label>
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

            <Button
              onClick={handleGetStudents}
              disabled={loading}
              className="bg-[#004aaa] hover:bg-[#004aaa]/90 w-fit px-8">
              {loading ? "Loading..." : "Get Students"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {fetched && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#004aaa]">
              Extracurricular Marks — {selectedClass}
            </h3>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#E8EBF3]">
                  <TableRow>
                    <TableHead className="w-[40px] text-[#004aaa] font-bold pl-4">#</TableHead>
                    <TableHead className="text-[#004aaa] font-bold">Adm No</TableHead>
                    <TableHead className="text-[#004aaa] font-bold">Name</TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-[11px] leading-tight">Following<br />Instruction</TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-[11px] leading-tight">Working<br />Independently</TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-[11px] leading-tight">Punctuality</TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-[11px] leading-tight">Talking</TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-[11px] leading-tight">Eye Contact</TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-[11px] leading-tight min-w-[140px]">Teacher Remarks</TableHead>
                    <TableHead className="text-[#004aaa] font-bold text-[11px] leading-tight min-w-[140px]">Principal Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-10 text-slate-500">
                        No students found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentRows.map((row, idx) => {
                      const globalIdx = indexOfFirst + idx;
                      return (
                        <TableRow key={row.studentId} className="hover:bg-slate-50">
                          <TableCell className="pl-4 text-muted-foreground">{globalIdx + 1}</TableCell>
                          <TableCell className="font-medium text-slate-700">{row.AdmNo || "—"}</TableCell>
                          <TableCell className="font-medium text-slate-700">{row.studentName || "—"}</TableCell>
                          {(["instruction", "independently", "punctuality", "talking", "eyecontact"] as const).map((field) => (
                            <TableCell key={field}>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                value={row[field]}
                                onChange={(e) => handleChange(globalIdx, field, Number(e.target.value))}
                                className="w-14 h-10 text-center border-slate-300"
                              />
                            </TableCell>
                          ))}
                          <TableCell>
                            <Input
                              placeholder="Teacher's remark"
                              value={row.remarks}
                              onChange={(e) => handleChange(globalIdx, "remarks", e.target.value)}
                              className="h-10 border-slate-300 min-w-[130px]"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Principal's remark"
                              value={row.premarks}
                              onChange={(e) => handleChange(globalIdx, "premarks", e.target.value)}
                              className="h-10 border-slate-300 min-w-[130px]"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="border-t px-4">
            <DataTablePagination
              totalItems={rows.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#004aaa] hover:bg-[#004aaa]/90 px-10">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PsychoStudentReport;
