import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { DeleteModal } from "@/components/DeleteModal";
import { SessionContext } from "@/contexts/SessionContext";

type QType = "multiple_choice" | "true_false" | "fill_in_the_blanks" | "theory";

type ApiQuestion = {
  _id: string;
  questionType: QType;
  questionTitle: string;
  mark: number;
  options?: { option: string; isCorrect: boolean }[];
  correctAnswer?: string;
  possibleAnswers?: string;
  onscreenMarking?: string;
};

type FormState = {
  type: QType | "";
  text: string;
  mark: string;
  options: string[];
  answer: string;
};

const empty: FormState = { type: "", text: "", mark: "", options: ["", "", "", ""], answer: "" };

const TYPE_LABELS: Record<QType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  fill_in_the_blanks: "Fill In The Blanks",
  theory: "Theory",
};

function getDisplayAnswer(q: ApiQuestion): string {
  if (q.questionType === "multiple_choice") {
    return q.options?.find(o => o.isCorrect)?.option ?? "";
  }
  if (q.questionType === "true_false") return q.correctAnswer ?? "";
  if (q.questionType === "fill_in_the_blanks") return q.possibleAnswers ?? "";
  if (q.questionType === "theory") return q.onscreenMarking ?? "";
  return "";
}

function formatExamDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function getExamTitle(exam: any) {
  return exam?.title || exam?.examTitle || exam?.name || "—";
}

interface Props {
  exam: any;
  onBack: () => void;
  onSaveQuestions?: (examId: any, questions: any[]) => void;
}

export default function ManageQuestions({ exam, onBack: _onBack }: Props) {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const sessionId = currentSession?._id;
  const examId = exam?._id ?? exam?.id;

  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadQuestions = async () => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/questions/${examId}`, { headers: authHeaders() });
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuestions(); }, [examId]);

  const canSubmit = useMemo(() => {
    if (!form.type || !form.text.trim() || !form.mark.trim()) return false;
    if (form.type === "multiple_choice") return form.options.every(o => o.trim()) && !!form.answer.trim();
    return !!form.answer.trim();
  }, [form]);

  const resetForm = () => { setForm(empty); setEditingId(null); };

  const handleTypeChange = (value: QType) => {
    if (value === "multiple_choice") setForm({ type: value, text: "", mark: "", options: ["", "", "", ""], answer: "" });
    else if (value === "true_false") setForm({ type: value, text: "", mark: "", options: ["True", "False"], answer: "" });
    else setForm({ type: value, text: "", mark: "", options: [], answer: "" });
  };

  const buildPayload = () => {
    const base = { questionTitle: form.text.trim(), mark: Number(form.mark), examId, questionType: form.type };
    if (form.type === "multiple_choice") {
      return {
        ...base,
        options: form.options.map(o => ({ option: o, isCorrect: o === form.answer })),
      };
    }
    if (form.type === "true_false") return { ...base, correctAnswer: form.answer };
    if (form.type === "fill_in_the_blanks") return { ...base, possibleAnswers: form.answer };
    if (form.type === "theory") return { ...base, onscreenMarking: form.answer };
    return base;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !form.type) return;
    if (!sessionId || !examId) { toast.error("No active session"); return; }
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${apiUrl}/api/questions/${editingId}`, buildPayload(), { headers: authHeaders() });
        toast.success("Question updated");
      } else {
        await axios.post(`${apiUrl}/api/questions/${sessionId}`, buildPayload(), { headers: authHeaders() });
        toast.success("Question added");
      }
      await loadQuestions();
      resetForm();
    } catch {
      toast.error(editingId ? "Failed to update question" : "Failed to add question");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q: ApiQuestion) => {
    setEditingId(q._id);
    const opts = q.options?.map(o => o.option) ?? (q.questionType === "true_false" ? ["True", "False"] : []);
    const ans = getDisplayAnswer(q);
    setForm({ type: q.questionType, text: q.questionTitle, mark: String(q.mark), options: opts, answer: ans });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/questions/${deleteTarget._id}`, { headers: authHeaders() });
      toast.success("Question deleted");
      await loadQuestions();
      setDeleteTarget(null);
      if (editingId === deleteTarget._id) resetForm();
    } catch {
      toast.error("Failed to delete question");
    } finally {
      setLoading(false);
    }
  };

  const totalMarks =
    Number(exam?.totalMark ?? exam?.totalMarks) ||
    questions.reduce((sum, question) => sum + Number(question.mark || 0), 0);
  const passPercentage = exam?.percent ?? exam?.passPercentage ?? exam?.passMark ?? "—";

  return (
    <div className="p-6 space-y-6">
      <Button
        type="button"
        variant="ghost"
        onClick={_onBack}
        className="gap-2 border border-black text-black hover:bg-[#004aaa] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Manage Online Exams
      </Button>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-[#004aaa] text-lg font-bold">
              Question List ({questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#E8EBF3]">
                <TableRow>
                  <TableHead className="pl-6 text-[#004aaa] font-bold">#</TableHead>
                  <TableHead className="text-[#004aaa] font-bold">Type</TableHead>
                  <TableHead className="text-[#004aaa] font-bold">Question</TableHead>
                  <TableHead className="text-[#004aaa] font-bold text-center">Mark</TableHead>
                  <TableHead className="text-[#004aaa] font-bold text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">Loading questions…</TableCell>
                  </TableRow>
                ) : questions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-400">No questions added yet.</TableCell>
                  </TableRow>
                ) : (
                  questions.map((q, index) => (
                    <TableRow key={q._id} className="hover:bg-slate-50/50">
                      <TableCell className="pl-6 text-slate-500 font-medium">{index + 1}</TableCell>
                      <TableCell className="text-slate-600 font-medium">{TYPE_LABELS[q.questionType] ?? q.questionType}</TableCell>
                      <TableCell className="text-[#004aaa] font-medium">
                        <div className="space-y-1">
                          <p className="line-clamp-2">{q.questionTitle}</p>
                          {getDisplayAnswer(q) ? (
                            <p className="text-xs text-slate-400">Answer: {getDisplayAnswer(q)}</p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-slate-500 font-medium">{q.mark}</TableCell>
                      <TableCell className="pr-6">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(q)} className="h-8 w-8 text-[#004aaa] hover:bg-[#004aaa]/10 hover:text-[#004aaa]">
                            <Pencil className="h-4 w-4 text-[#004aaa]" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(q)} className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-[#004aaa] text-lg font-bold">Exam Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2">
                {[
                  ["Exam Title", getExamTitle(exam)],
                  ["Date", formatExamDate(exam?.date || exam?.examDate)],
                  ["Class", exam?.className || exam?.class],
                  ["Time", `${exam?.startTime || exam?.fromTime || "—"} - ${exam?.endTime || exam?.toTime || "—"}`],
                  ["Subject", exam?.subjectName || exam?.subject],
                  ["Pass %", `${passPercentage}%`],
                  ["Total Marks", totalMarks || "—"],
                  ["Instructions", exam?.instruction || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="border-b border-r border-slate-200 p-4 odd:bg-slate-50/40">
                    <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-semibold text-[#004aaa] line-clamp-2">{value || "—"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-[#004aaa] text-lg font-bold">
                {editingId ? "Edit Question" : "Add Question"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Question Type</Label>
                  <Select value={form.type || undefined} onValueChange={(v) => handleTypeChange(v as QType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Question Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True / False</SelectItem>
                      <SelectItem value="fill_in_the_blanks">Fill In The Blanks</SelectItem>
                      <SelectItem value="theory">Theory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Question</Label>
                  <Textarea
                    value={form.text}
                    onChange={(e) => setForm(f => ({ ...f, text: e.target.value }))}
                    placeholder="Type the question here..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Mark</Label>
                  <Input
                    type="number"
                    value={form.mark}
                    onChange={(e) => setForm(f => ({ ...f, mark: e.target.value }))}
                    placeholder="e.g. 1"
                  />
                </div>

                {form.type === "multiple_choice" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Options</Label>
                      <Button type="button" variant="outline" size="sm" className="gap-1"
                        onClick={() => setForm(f => ({ ...f, options: [...f.options, ""] }))}>
                        <Plus size={14} /> Add Option
                      </Button>
                    </div>
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={opt} onChange={(e) => setForm(f => ({ ...f, options: f.options.map((o, j) => j === i ? e.target.value : o) }))} placeholder={`Option ${i + 1}`} />
                        {form.options.length > 2 && (
                          <Button type="button" variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setForm(f => ({ ...f, options: f.options.filter((_, j) => j !== i), answer: f.answer === f.options[i] ? "" : f.answer }))}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400">Correct Answer</Label>
                      <Select value={form.answer || undefined} onValueChange={(v) => setForm(f => ({ ...f, answer: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select correct option" /></SelectTrigger>
                        <SelectContent>
                          {form.options.filter(o => o.trim()).map((o, i) => (
                            <SelectItem key={i} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {form.type === "true_false" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Correct Answer</Label>
                    <Select value={form.answer || undefined} onValueChange={(v) => setForm(f => ({ ...f, answer: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="True">True</SelectItem>
                        <SelectItem value="False">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {form.type === "fill_in_the_blanks" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Correct Answer</Label>
                    <Input value={form.answer} onChange={(e) => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Enter the missing word or phrase" />
                  </div>
                )}

                {form.type === "theory" && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-slate-400">Marking Guide / Expected Answer</Label>
                    <Textarea value={form.answer} onChange={(e) => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Add grading guide..." className="min-h-[100px] resize-none" />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {editingId ? "Cancel Edit" : "Reset"}
                  </Button>
                  <Button type="submit" disabled={!canSubmit || saving} className="bg-[#004aaa] hover:bg-[#004aaa]/90">
                    {saving ? "Saving…" : editingId ? "Save Changes" : "Add Question"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={loading}
        itemName="this question"
      />
    </div>
  );
}
