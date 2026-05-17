import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormShell } from "@/components/ActionForm";
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
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  FileQuestion,
  Plus,
  ArrowLeft,
  Printer,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import ManageQuestions from "./ManageQuestions";
import { SessionContext } from "@/contexts/SessionContext";
import useFetch from "@/hooks/useFetch";
import { useToast } from "@/hooks/use-toast";

type ViewState = "list" | "add" | "edit" | "questions" | "results";

type ExamForm = {
  title: string;
  className: string;
  subject: string;
  date: string;
  fromTime: string;
  toTime: string;
  percent: string;
  instruction: string;
};

const emptyForm: ExamForm = {
  title: "",
  className: "",
  subject: "",
  date: "",
  fromTime: "",
  toTime: "",
  percent: "40",
  instruction: "",
};

const formatExamDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split("T")[0];
};

const getExamTitle = (exam: any) => exam?.title || exam?.examTitle || exam?.name || "Untitled Exam";
const getExamPassPercent = (exam: any) => Number(exam?.percent ?? exam?.passPercentage ?? exam?.passMark ?? 40);
const getExamTotalMarks = (exam: any) => Number(exam?.totalMark ?? exam?.totalMarks ?? exam?.mark ?? 0);

export default function ManageOnlineExams() {
  const { currentSession } = useContext(SessionContext);
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: examsData, loading: examsLoading, reFetch } = useFetch(
    currentSession ? `/get-exam/${currentSession._id}` : null
  );
  const { data: classesData } = useFetch(currentSession ? `/class/${currentSession._id}` : null);

  const exams = Array.isArray(examsData) ? examsData : [];
  const classes = Array.isArray(classesData) ? classesData : [];

  const [view, setView] = useState<ViewState>("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [form, setForm] = useState<ExamForm>(emptyForm);
  const itemsPerPage = 10;

  const { data: subjectsData } = useFetch(
    form.className && currentSession ? `/get-subject/${encodeURIComponent(form.className)}/${currentSession._id}` : null
  );
  const subjects = Array.isArray(subjectsData) ? subjectsData : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = exams.slice(indexOfFirstItem, indexOfLastItem);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const openForm = (mode: "add" | "edit", exam?: any) => {
    if (mode === "edit" && exam) {
      setSelectedExam(exam);
      setForm({
        title: getExamTitle(exam),
        className: exam.className || exam.class || "",
        subject: exam.subject || exam.subjectName || "",
        date: toDateInputValue(exam.date || exam.examDate),
        fromTime: exam.fromTime || exam.startTime || "",
        toTime: exam.toTime || exam.endTime || "",
        percent: String(exam.percent ?? exam.passPercentage ?? exam.passMark ?? 40),
        instruction: exam.instruction || "",
      });
      setView("edit");
      return;
    }

    setSelectedExam(null);
    setForm(emptyForm);
    setView("add");
  };

  const fetchResults = async (exam: any) => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/exams/all-scores/${exam._id}`, {
        headers: authHeaders(),
      });
      setSelectedExam(exam);
      setExamResults(Array.isArray(res.data) ? res.data : []);
      setView("results");
    } catch (error) {
      console.error("Error fetching results:", error);
      toast({ title: "Error", description: "Failed to fetch exam results.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) return;

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        className: form.className,
        subject: form.subject,
        date: form.date,
        fromTime: form.fromTime,
        toTime: form.toTime,
        percent: Number(form.percent || 0),
        instruction: form.instruction,
        sessionId: currentSession._id,
      };

      if (view === "add") {
        await axios.post(`${apiUrl}/api/create-exam`, payload, { headers: authHeaders() });
        toast({ title: "Success", description: "Online exam created successfully." });
      } else if (view === "edit" && selectedExam?._id) {
        await axios.put(`${apiUrl}/api/edit-exam/${selectedExam._id}`, payload, { headers: authHeaders() });
        toast({ title: "Success", description: "Exam updated successfully." });
      }

      setView("list");
      setSelectedExam(null);
      setForm(emptyForm);
      reFetch();
    } catch (error) {
      console.error("Error saving exam:", error);
      toast({ title: "Error", description: "Failed to save exam.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExam?._id) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/exam/${selectedExam._id}`, { headers: authHeaders() });
      toast({ title: "Success", description: "Exam deleted successfully." });
      setIsDeleteOpen(false);
      setSelectedExam(null);
      reFetch();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({ title: "Error", description: "Failed to delete exam.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestions = () => {
    toast({ title: "Saved", description: "Question updates have been handled." });
  };

  if ((view === "add" || view === "edit")) {
    return (
      <div className="p-6">
        <FormShell
          title="Online Exam"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setView("list");
            setSelectedExam(null);
          }}
        >
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Exam Title</Label>
            <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Class Name</Label>
            <Select value={form.className} onValueChange={(value) => setForm((prev) => ({ ...prev, className: value, subject: "" }))}>
              <SelectTrigger className="border-black">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls: any) => (
                  <SelectItem key={cls._id} value={cls.name}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Subject</Label>
            <Select value={form.subject} onValueChange={(value) => setForm((prev) => ({ ...prev, subject: value }))}>
              <SelectTrigger className="border-black">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject._id} value={subject.subjectName || subject.name}>
                    {subject.subjectName || subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Exam Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Start Time</Label>
            <Input type="time" value={form.fromTime} onChange={(e) => setForm((prev) => ({ ...prev, fromTime: e.target.value }))} required />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">End Time</Label>
            <Input type="time" value={form.toTime} onChange={(e) => setForm((prev) => ({ ...prev, toTime: e.target.value }))} required />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Pass Percentage</Label>
            <Input type="number" value={form.percent} onChange={(e) => setForm((prev) => ({ ...prev, percent: e.target.value }))} min={0} max={100} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-black">Instructions</Label>
            <Textarea value={form.instruction} onChange={(e) => setForm((prev) => ({ ...prev, instruction: e.target.value }))} className="min-h-[120px] border-black" />
          </div>
        </FormShell>
      </div>
    );
  }

  if (view === "questions" && selectedExam) {
    return (
      <ManageQuestions
        exam={selectedExam}
        onBack={() => {
          setView("list");
          setSelectedExam(null);
        }}
        onSaveQuestions={handleSaveQuestions}
      />
    );
  }

  if (view === "results" && selectedExam) {
    const passMark = getExamPassPercent(selectedExam);
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Button variant="ghost" onClick={() => { setView("list"); setSelectedExam(null); }} className="gap-2 text-black hover:text-primary">
            <ArrowLeft size={16} /> Back to Manage Online Exams
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2 border-black text-black hover:bg-primary/10">
            <Printer size={16} /> Print Result
          </Button>
        </div>

        <Card className="printable-area overflow-hidden border border-black shadow-sm">
          <CardHeader className="border-b border-black bg-white">
            <CardTitle className="text-lg font-bold text-primary">View Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-black p-4">
                <p className="text-xs font-bold uppercase text-black">Exam Title</p>
                <p className="font-semibold text-primary">{getExamTitle(selectedExam)}</p>
              </div>
              <div className="rounded-xl border border-black p-4">
                <p className="text-xs font-bold uppercase text-black">Date</p>
                <p className="font-semibold text-primary">{formatExamDate(selectedExam.date || selectedExam.examDate)}</p>
              </div>
              <div className="rounded-xl border border-black p-4">
                <p className="text-xs font-bold uppercase text-black">Class</p>
                <p className="font-semibold text-primary">{selectedExam.className || selectedExam.class || "—"}</p>
              </div>
              <div className="rounded-xl border border-black p-4">
                <p className="text-xs font-bold uppercase text-black">Time</p>
                <p className="font-semibold text-primary">{selectedExam.fromTime || selectedExam.startTime} - {selectedExam.toTime || selectedExam.endTime}</p>
              </div>
              <div className="rounded-xl border border-black p-4">
                <p className="text-xs font-bold uppercase text-black">Subject</p>
                <p className="font-semibold text-primary">{selectedExam.subject || selectedExam.subjectName || "—"}</p>
              </div>
              <div className="rounded-xl border border-black p-4">
                <p className="text-xs font-bold uppercase text-black">Pass Percentage</p>
                <p className="font-semibold text-primary">{passMark}%</p>
              </div>
              <div className="rounded-xl border border-black p-4">
                <p className="text-xs font-bold uppercase text-black">Instructions</p>
                <p className="font-semibold text-primary">{selectedExam.instruction || "—"}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-black">
              <Table>
                <TableHeader className="bg-primary/10">
                  <TableRow>
                    <TableHead className="pl-6 font-bold text-primary">Student Name</TableHead>
                    <TableHead className="text-center font-bold text-primary">Mark Obtained</TableHead>
                    <TableHead className="pr-6 text-right font-bold text-primary">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-black">No results available for this exam.</TableCell>
                    </TableRow>
                  ) : (
                    examResults.map((result: any) => (
                      <TableRow key={result._id || result.studentId} className="hover:bg-primary/5">
                        <TableCell className="pl-6 font-medium text-primary">{result.studentName || result.name || "Student"}</TableCell>
                        <TableCell className="text-center font-semibold text-black">{result.score ?? 0}</TableCell>
                        <TableCell className="pr-6 text-right">
                          <span className="inline-flex rounded-full border border-black bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary">
                            {Number(result.score ?? 0) >= passMark ? "PASSED" : "FAILED"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-primary">Manage Online Exams</h2>
        <Button onClick={() => openForm("add")} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus size={16} /> Add New Exam
        </Button>
      </div>

      <Card className="overflow-hidden border border-black shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-primary/10">
              <TableRow>
                <TableHead className="w-[50px] pl-6"><Checkbox /></TableHead>
                <TableHead className="w-[60px] font-bold text-primary">S/N</TableHead>
                <TableHead className="font-bold text-primary">Exam Name</TableHead>
                <TableHead className="font-bold text-primary">Class Name</TableHead>
                <TableHead className="font-bold text-primary">Subject</TableHead>
                <TableHead className="font-bold text-primary">Exam Date</TableHead>
                <TableHead className="font-bold text-primary">Time</TableHead>
                <TableHead className="pr-6 text-right font-bold text-primary">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examsLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Loading exams...
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-black">No online exams found.</TableCell>
                </TableRow>
              ) : (
                currentExams.map((exam, index) => (
                  <TableRow key={exam._id} className="hover:bg-primary/5">
                    <TableCell className="pl-6"><Checkbox /></TableCell>
                    <TableCell className="font-medium text-black">{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell className="font-bold text-primary">{getExamTitle(exam)}</TableCell>
                    <TableCell className="text-black">{exam.className || exam.class || "—"}</TableCell>
                    <TableCell className="text-black">{exam.subject || exam.subjectName || "—"}</TableCell>
                    <TableCell className="text-black">{formatExamDate(exam.date)}</TableCell>
                    <TableCell className="text-black">{exam.fromTime || exam.startTime} - {exam.toTime || exam.endTime}</TableCell>
                    <TableCell className="px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-black">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem className="gap-2" onClick={() => { setSelectedExam(exam); setView("questions"); }}>
                            <FileQuestion size={16} /> Manage Questions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => fetchResults(exam)}>
                            <Eye size={16} /> View Result
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-[#004aaa] focus:bg-[#004aaa]/10 focus:text-[#004aaa]" onClick={() => openForm("edit", exam)}>
                            <Edit3 size={16} className="text-[#004aaa]" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                            onClick={() => {
                              setSelectedExam(exam);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 size={16} className="text-red-600" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="border-t border-black bg-white px-4">
            <DataTablePagination
              totalItems={exams.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        itemName={getExamTitle(selectedExam)}
      />
    </div>
  );
}
