import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Save, Search, Upload } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";

type MarkRow = {
  studentId: string;
  studentName?: string;
  AdmNo?: string;
  testscore: number;
  examscore: number;
  marksObtained: number;
  comment: string;
};

type GradeRule = {
  markfrom?: number;
  markupto?: number;
  comment?: string;
};

export default function ManageMarks() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const sessionId = currentSession?._id;

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<MarkRow[]>([]);
  const [fetched, setFetched] = useState(false);
  const [importing, setImporting] = useState(false);
  const itemsPerPage = 5;

  const { data: classData } = useFetch(sessionId ? `/class/${sessionId}` : null);
  const { data: examsData } = useFetch(sessionId ? `/getofflineexam/${sessionId}` : null);
  const { data: gradesData } = useFetch(sessionId ? `/grade/${sessionId}` : null);
  const { data: subjectData } = useFetch(
    selectedClass && sessionId ? `/get-subject/${encodeURIComponent(selectedClass)}/${sessionId}` : null
  );

  const classes = useMemo(() => (Array.isArray(classData) ? (classData as any[]) : []), [classData]);
  const exams = useMemo(() => (Array.isArray(examsData) ? (examsData as any[]) : []), [examsData]);
  const subjects = useMemo(() => (Array.isArray(subjectData) ? (subjectData as any[]) : []), [subjectData]);
  const gradeRules = useMemo(
    () =>
      (Array.isArray((gradesData as any)?.data) ? ((gradesData as any).data as GradeRule[]) : []).sort(
        (a, b) => Number(b.markfrom || 0) - Number(a.markfrom || 0)
      ),
    [gradesData]
  );

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const notifyError = (title: string, description: string) => {
    toast.error(title, { description });
  };

  const notifySuccess = (title: string, description?: string) => {
    toast.success(title, description ? { description } : undefined);
  };

  const notifyWarning = (title: string, description: string) => {
    toast.warning(title, { description });
  };

  const getRemarkFromTotal = (total: number) => {
    const rule = gradeRules.find(
      (item) => total >= Number(item.markfrom || 0) && total <= Number(item.markupto || 0)
    );
    if (rule?.comment) return rule.comment;
    if (total >= 70) return "Excellent";
    if (total >= 60) return "Very Good";
    if (total >= 50) return "Good";
    if (total >= 40) return "Fair";
    return "Fail";
  };

  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    setSelectedSubjectId("");
    setSelectedSubjectName("");
    setRows([]);
    setFetched(false);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const found = subjects.find((s: any) => s._id === subjectId);
    setSelectedSubjectName(found?.subjectName || found?.name || "");
  };

  const handleLoad = async () => {
    if (!sessionId || !selectedClass || !selectedSubjectId || !selectedExam) {
      notifyError(
        "Selection required",
        "Choose the exam, class, and subject before loading marks."
      );
      return;
    }

    setLoading(true);
    try {
      const [stuRes, scoresRes] = await Promise.allSettled([
        axios.get(`${apiUrl}/api/students/${sessionId}/${selectedClass}`, { headers: authHeaders() }),
        axios.get(`${apiUrl}/api/get-all-scores/${selectedExam}/${selectedSubjectId}/${sessionId}`, {
          headers: authHeaders(),
        }),
      ]);

      const students =
        stuRes.status === "fulfilled" && Array.isArray(stuRes.value.data) ? stuRes.value.data : [];
      const scores =
        scoresRes.status === "fulfilled" && Array.isArray(scoresRes.value.data?.scores)
          ? scoresRes.value.data.scores
          : [];

      const merged: MarkRow[] = students.map((student: any) => {
        const score = scores.find(
          (item: any) => String(item.studentId?._id || item.studentId) === String(student._id)
        );
        const testscore = Number(score?.testscore ?? 0);
        const examscore = Number(score?.examscore ?? 0);
        const marksObtained = Number(score?.marksObtained ?? testscore + examscore);
        return {
          studentId: String(student._id),
          studentName: student.studentName || student.username || student.name,
          AdmNo: student.AdmNo || student.admNo,
          testscore,
          examscore,
          marksObtained,
          comment: score?.comment || getRemarkFromTotal(marksObtained),
        };
      });

      setRows(merged);
      setFetched(true);
      setCurrentPage(1);
      if (merged.length === 0) {
        notifyWarning(
          "No students found",
          "There are no student records available for the selected class."
        );
      }
    } catch (error) {
      console.error("Failed to load marks:", error);
      notifyError(
        "Unable to load marks",
        "Please try again. If the problem continues, check the console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRow = (globalIndex: number, field: "testscore" | "examscore", value: string) => {
    setRows((prev) =>
      prev.map((row, index) => {
        if (index !== globalIndex) return row;
        const next = { ...row };
        next[field] = Number(value) || 0;
        next.marksObtained = Number(next.testscore || 0) + Number(next.examscore || 0);
        next.comment = getRemarkFromTotal(next.marksObtained);
        return next;
      })
    );
  };

  const handleSave = async () => {
    if (!sessionId || !selectedExam || !selectedSubjectId) return;

    setSaving(true);
    try {
      await axios.post(
        `${apiUrl}/api/save-marks/${sessionId}`,
        {
          examId: selectedExam,
          subjectId: selectedSubjectId,
          updates: rows.map((row) => ({
            studentId: row.studentId,
            testscore: Number(row.testscore || 0),
            examscore: Number(row.examscore || 0),
            comment: row.comment || "",
          })),
        },
        { headers: authHeaders() }
      );
      notifySuccess(
        "Marks saved",
        "All edited scores have been stored successfully."
      );
    } catch (error) {
      console.error("Failed to save marks:", error);
      notifyError(
        "Unable to save marks",
        "Please try again. If it fails again, review the console logs."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    if (!sessionId || !selectedClass || !selectedSubjectId || !selectedExam) {
      notifyError(
        "Import setup incomplete",
        "Select the exam, class, and subject before importing a mark sheet."
      );
      return;
    }

    setImporting(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("className", selectedClass);
      payload.append("subjectId", selectedSubjectId);
      payload.append("examId", selectedExam);

      const response = await axios.post(`${apiUrl}/api/import-marks/${sessionId}`, payload, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });

      console.log("OCR import debug:", response.data?.ocrDebug || null);
      console.log("OCR import matched rows:", response.data?.rows || []);
      console.log("OCR import unmatched rows:", response.data?.unmatched || []);

      const importedRows = Array.isArray(response.data?.rows) ? response.data.rows : [];
      const matchedImportedRows = importedRows.filter((item: any) => item.matched && item.studentId);
      const mergedRows = rows.length > 0 ? rows : [];

      const nextRows = (mergedRows.length > 0 ? mergedRows : matchedImportedRows)
        .map((row: any) => {
          const imported = matchedImportedRows.find((item: any) => String(item.studentId) === String(row.studentId));
          if (!imported) return row;
          const marksObtained = Number(imported.testscore || 0) + Number(imported.examscore || 0);
          return {
            ...row,
            testscore: Number(imported.testscore || 0),
            examscore: Number(imported.examscore || 0),
            marksObtained,
            comment: getRemarkFromTotal(marksObtained),
          };
        })
        .concat(
          mergedRows.length === 0
            ? matchedImportedRows
                .map((item: any) => ({
                  studentId: String(item.studentId),
                  studentName: item.studentName,
                  AdmNo: item.AdmNo,
                  testscore: Number(item.testscore || 0),
                  examscore: Number(item.examscore || 0),
                  marksObtained: Number(item.testscore || 0) + Number(item.examscore || 0),
                  comment: getRemarkFromTotal(Number(item.testscore || 0) + Number(item.examscore || 0)),
                }))
            : []
        );

      setRows(
        nextRows.length > 0
          ? nextRows.filter((row: any, index: number, self: any[]) => self.findIndex((item) => item.studentId === row.studentId) === index)
          : []
      );
      setFetched(true);
      setCurrentPage(1);
      notifySuccess(
        "Import complete",
        response.data?.message || "Review the imported rows, make any corrections, then save."
      );
      if (response.data?.unmatched?.length) {
        notifyWarning(
          "Some rows need review",
          `${response.data.unmatched.length} imported row(s) could not be matched to a student in this class.`
        );
      }
      if (matchedImportedRows.length === 0) {
        notifyError(
          "No student matches found",
          "The imported names did not match any students in the selected class."
        );
      }
    } catch (error) {
      const err = error as any;
      console.error("Failed to import marks:", err);
      console.error("Import marks response:", err?.response?.data || null);
      console.error("Import marks OCR debug:", err?.response?.data?.ocrDebug || null);

      if (err?.response?.status === 422) {
        notifyError(
          "Image could not be read",
          "Please upload a clearer mark sheet image, or use CSV/Excel for a more reliable import."
        );
      } else if (err?.response?.status === 400) {
        notifyError(
          "Import request invalid",
          "Check that the exam, class, subject, and supported file have all been selected correctly."
        );
      } else {
        notifyError(
          "Import failed",
          "We could not import the mark sheet right now. Please try again and check the console if the issue persists."
        );
      }
    } finally {
      setImporting(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-primary">Manage Exam Marks</h2>
        <p className="text-sm text-muted-foreground">Select parameters to record or update student scores.</p>
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-black">Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="h-11 border-input">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam: any) => (
                    <SelectItem key={exam._id} value={exam._id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-black">Class</label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger className="h-11 border-input">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem: any) => (
                    <SelectItem key={String(classItem._id || classItem.id)} value={String(classItem.name || "")}>
                      {String(classItem.name || "-")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-black">Subject</label>
              <Select value={selectedSubjectId} onValueChange={handleSubjectChange} disabled={!selectedClass}>
                <SelectTrigger className="h-11 border-input">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject: any) => (
                    <SelectItem key={String(subject._id || subject.id)} value={String(subject._id || subject.id)}>
                      {String(subject.subjectName || subject.name || "-")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="h-11 gap-2" disabled={!selectedExam || !selectedClass || !selectedSubjectId || loading} onClick={handleLoad}>
              <Search className="h-4 w-4" />
              {loading ? "Loading..." : "Load Marks"}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
            <Label htmlFor="marks-import" className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-primary px-4 py-2 text-sm font-medium text-white">
              <Upload className="h-4 w-4" />
              {importing ? "Importing..." : "Import CSV, Excel or Image"}
            </Label>
            <Input
              id="marks-import"
              type="file"
              accept=".csv,.xlsx,.xls,image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                void handleImport(file);
                event.currentTarget.value = "";
              }}
            />
            <p className="text-xs text-slate-600">
              Upload a mark sheet. Test 1 and Test 2 will be added together and capped at 40, and you can still edit every imported row before saving.
            </p>
          </div>
        </CardContent>
      </Card>

      {fetched && (
        <Card className="overflow-hidden border border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-200 bg-muted/40">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-primary">
                Marks For: {selectedSubjectName || "-"} ({selectedClass || "-"})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleSave} disabled={saving || rows.length === 0} className="gap-2 border-slate-300 text-primary hover:bg-accent">
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-[60px] pl-6 text-center font-bold text-primary">#</TableHead>
                  <TableHead className="font-bold text-primary">Student Detail</TableHead>
                  <TableHead className="w-[140px] text-center font-bold text-primary">Test Score (40)</TableHead>
                  <TableHead className="w-[140px] text-center font-bold text-primary">Exam Score (60)</TableHead>
                  <TableHead className="w-[100px] text-center font-bold text-primary">Total</TableHead>
                  <TableHead className="pr-6 font-bold text-primary">Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading marks...
                    </TableCell>
                  </TableRow>
                ) : currentRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentRows.map((student, index) => (
                    <TableRow key={student.studentId} className="hover:bg-muted/30">
                      <TableCell className="pl-6 text-center font-medium text-muted-foreground">
                        {indexOfFirstItem + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-primary">{student.studentName || "-"}</span>
                          <span className="font-mono text-[10px] uppercase text-muted-foreground">{student.AdmNo || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={40}
                          value={student.testscore}
                          onChange={(event) => handleChangeRow(indexOfFirstItem + index, "testscore", event.target.value)}
                          className="h-9 border-input text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          value={student.examscore}
                          onChange={(event) => handleChangeRow(indexOfFirstItem + index, "examscore", event.target.value)}
                          className="h-9 border-input text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center text-lg font-bold text-primary">{student.marksObtained}</TableCell>
                      <TableCell className="pr-6">
                        <Input
                          value={student.comment}
                          readOnly
                          className="h-9 border-input bg-muted/30 font-medium text-black"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="border-t border-slate-200 px-4">
              <DataTablePagination
                totalItems={rows.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
