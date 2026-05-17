import React, { useContext, useMemo, useRef, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useReactToPrint } from "react-to-print";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { FileSpreadsheet, Printer, Save } from "lucide-react";

type SubjectScore = {
  subjectId: string;
  subjectName: string;
  test: number;
  exam: number;
  total: number;
  comment: string;
};

type StudentSheetRow = {
  studentId: string;
  studentName: string;
  AdmNo?: string;
  subjects: SubjectScore[];
};

export default function TabulationSheet() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<{ subjectId: string; name: string }[]>([]);
  const [students, setStudents] = useState<StudentSheetRow[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: classData } = useFetch(currentSession?._id ? `/class/${currentSession._id}` : null);
  const { data: examData } = useFetch(currentSession?._id ? `/getofflineexam/${currentSession._id}` : null);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleGenerate = async () => {
    if (!selectedExam || !selectedClass || !currentSession?._id) return;
    setLoadingSheet(true);
    try {
      const { data } = await axios.get(
        `${apiUrl}/api/get-all-scored/${selectedExam}/${currentSession._id}/${encodeURIComponent(selectedClass)}`,
        { headers: authHeaders() }
      );
      const results = Array.isArray(data?.results) ? data.results : [];
      const nextSubjects = results.map((subject: any) => ({
        subjectId: String(subject.subjectId),
        name: String(subject.subjectName || "-"),
      }));
      const grouped: Record<string, StudentSheetRow> = {};

      results.forEach((subject: any) => {
        (Array.isArray(subject.scores) ? subject.scores : []).forEach((score: any) => {
          const studentId = String(score.studentId);
          if (!grouped[studentId]) {
            grouped[studentId] = {
              studentId,
              studentName: String(score.studentName || "-"),
              AdmNo: String(score.AdmNo || ""),
              subjects: [],
            };
          }

          const test = Number(score.testscore || 0);
          const exam = Number(score.examscore || 0);
          grouped[studentId].subjects.push({
            subjectId: String(subject.subjectId),
            subjectName: String(subject.subjectName || "-"),
            test,
            exam,
            total: test + exam,
            comment: String(score.comment || ""),
          });
        });
      });

      setSubjects(nextSubjects);
      setStudents(Object.values(grouped));
    } catch (error) {
      console.error("Failed to load tabulation:", error);
      setSubjects([]);
      setStudents([]);
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleScoreChange = (studentIndex: number, subjectId: string, field: "test" | "exam", value: string) => {
    const num = Number(value) || 0;
    setStudents((prev) =>
      prev.map((student, index) => {
        if (index !== studentIndex) return student;
        return {
          ...student,
          subjects: student.subjects.map((subject) => {
            if (subject.subjectId !== subjectId) return subject;
            const next = { ...subject, [field]: num };
            next.total = Number(next.test || 0) + Number(next.exam || 0);
            return next;
          }),
        };
      })
    );
  };

  const handleSave = async () => {
    if (!selectedExam || !currentSession?._id || subjects.length === 0) return;
    setSaving(true);
    try {
      const headers = { ...authHeaders(), "Content-Type": "application/json" };
      await Promise.all(
        subjects.map(async (subject) => {
          const updates = students.map((student) => {
            const score = student.subjects.find((item) => item.subjectId === subject.subjectId) || {
              test: 0,
              exam: 0,
              total: 0,
              comment: "",
            };

            return {
              studentId: student.studentId,
              subjectId: subject.subjectId,
              testscore: Number(score.test || 0),
              examscore: Number(score.exam || 0),
              marksObtained: Number(score.total || 0),
              comment: score.comment || "",
            };
          });

          try {
            await axios.put(`${apiUrl}/api/update-all-marks`, { examId: selectedExam, subjectId: subject.subjectId, updates }, { headers });
          } catch {
            await axios.post(`${apiUrl}/api/save-marks/${currentSession._id}`, { examId: selectedExam, subjectId: subject.subjectId, updates }, { headers });
          }
        })
      );
    } catch (error) {
      console.error("Failed to save tabulation:", error);
    } finally {
      setSaving(false);
    }
  };

  const tableRows = useMemo(() => students, [students]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Tabulation_${selectedClass || "Sheet"}`,
  });

  const handleExportExcel = () => {
    if (students.length === 0) return;
    const headers = [
      "Name",
      "Adm No",
      ...subjects.flatMap((subject) => [`${subject.name} T`, `${subject.name} E`, `${subject.name} Total`]),
      "Grand Total",
      "Average",
    ];
    const rows = students.map((student) => {
      const grandTotal = student.subjects.reduce((acc, subject) => acc + subject.total, 0);
      const average = student.subjects.length ? (grandTotal / student.subjects.length).toFixed(2) : "0";
      return [
        student.studentName,
        student.AdmNo || "",
        ...subjects.flatMap((subject) => {
          const score = student.subjects.find((item) => item.subjectId === subject.subjectId);
          return [score?.test ?? 0, score?.exam ?? 0, score?.total ?? 0];
        }),
        grandTotal,
        average,
      ];
    });
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tabulation");
    XLSX.writeFile(workbook, `Tabulation_${selectedClass || "Sheet"}.xlsx`);
  };

  return (
    <div className="space-y-6 p-2 sm:p-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-primary sm:text-2xl">Tabulation Sheet</h2>
          <p className="text-sm text-muted-foreground">Comprehensive overview of student performance across all subjects.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" onClick={() => handlePrint()} disabled={students.length === 0} className="gap-2 border-black sm:flex-1 md:flex-initial">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleExportExcel} disabled={students.length === 0} className="gap-2 sm:flex-1 md:flex-initial">
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="border-black shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-black">Select Exam</label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger className="h-11 border-black">
                  <SelectValue placeholder="Select exam" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(examData) ? examData : []).map((exam: any) => (
                    <SelectItem key={String(exam._id)} value={String(exam._id)}>
                      {String(exam.name || "-")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-black">Select Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="h-11 border-black">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(classData) ? classData : []).map((classItem: any) => (
                    <SelectItem key={String(classItem._id || classItem.id)} value={String(classItem.name || "")}>
                      {String(classItem.name || "-")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={loadingSheet} className="h-11 px-8">
              {loadingSheet ? "Loading..." : "View Sheet"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-black shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-3 border-b border-black bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xs font-bold text-primary sm:text-sm">Tabulation Records: {selectedClass || "-"}</CardTitle>
          <Button size="sm" onClick={handleSave} disabled={saving || tableRows.length === 0} className="w-full gap-2 sm:w-auto">
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="printable-area printable-wide overflow-x-auto" ref={printRef}>
            <Table className="min-w-[1200px]">
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="sticky left-0 z-20 w-[220px] border-r border-black bg-muted font-bold text-primary">
                    Student Information
                  </TableHead>
                  {subjects.map((subject) => (
                    <TableHead key={subject.subjectId} colSpan={3} className="border-b border-r border-black text-center font-bold text-primary">
                      {subject.name}
                    </TableHead>
                  ))}
                  <TableHead colSpan={2} className="bg-accent text-center font-bold text-primary">
                    Final Analysis
                  </TableHead>
                </TableRow>
                <TableRow>
                  <TableHead className="sticky left-0 z-20 border-r border-black bg-muted text-[10px] font-bold uppercase text-black">
                    Name & Admission No.
                  </TableHead>
                  {subjects.map((subject) => (
                    <React.Fragment key={subject.subjectId}>
                      <TableHead className="text-center text-[10px] font-bold text-black">T</TableHead>
                      <TableHead className="text-center text-[10px] font-bold text-black">E</TableHead>
                      <TableHead className="border-r border-black text-center text-[10px] font-bold text-primary">TOT</TableHead>
                    </React.Fragment>
                  ))}
                  <TableHead className="bg-accent text-center text-[10px] font-bold text-primary">TOTAL</TableHead>
                  <TableHead className="bg-accent text-center text-[10px] font-bold text-primary">AVG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={subjects.length * 3 + 3} className="py-10 text-center text-muted-foreground">
                      No tabulation records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableRows.map((student, rowIndex) => {
                    const grandTotal = student.subjects.reduce((acc, subject) => acc + Number(subject.total || 0), 0);
                    const average = student.subjects.length ? (grandTotal / student.subjects.length).toFixed(2) : "0.00";

                    return (
                      <TableRow key={student.studentId} className="hover:bg-muted/30">
                        <TableCell className="sticky left-0 z-10 border-r border-black bg-white">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-primary">{student.studentName}</span>
                            <span className="font-mono text-[9px] text-muted-foreground">{student.AdmNo || "-"}</span>
                          </div>
                        </TableCell>
                        {subjects.map((subject) => {
                          const score = student.subjects.find((item) => item.subjectId === subject.subjectId);
                          return (
                            <React.Fragment key={`${student.studentId}-${subject.subjectId}`}>
                              <TableCell className="p-1 text-center">
                                <Input
                                  type="number"
                                  className="h-8 w-14 border-black text-center text-xs"
                                  value={Number(score?.test || 0)}
                                  onChange={(event) => handleScoreChange(rowIndex, subject.subjectId, "test", event.target.value)}
                                />
                              </TableCell>
                              <TableCell className="p-1 text-center">
                                <Input
                                  type="number"
                                  className="h-8 w-14 border-black text-center text-xs"
                                  value={Number(score?.exam || 0)}
                                  onChange={(event) => handleScoreChange(rowIndex, subject.subjectId, "exam", event.target.value)}
                                />
                              </TableCell>
                              <TableCell className="border-r border-black bg-muted/30 p-1 text-center font-bold text-black">
                                {Number(score?.total || 0)}
                              </TableCell>
                            </React.Fragment>
                          );
                        })}
                        <TableCell className="bg-accent/40 text-center font-bold text-primary">{grandTotal}</TableCell>
                        <TableCell className="bg-accent/40 text-center font-bold text-primary">{average}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
