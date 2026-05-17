import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormShell } from "@/components/ActionForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, CalendarDays } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function ExamList() {
  const { currentSession } = useContext(SessionContext);
  const examUrl = currentSession?._id
    ? `/getofflineexam/${currentSession._id}`
    : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(examUrl);
  const exams = useMemo(
    () => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []),
    [data],
  );

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [form, setForm] = useState({ name: "", date: "", comment: "" });
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = exams.slice(indexOfFirstItem, indexOfLastItem);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleEdit = (exam: any) => {
    setSelectedExam(exam);
    setForm({
      name: exam.name || "",
      date: exam.date ? String(exam.date).split("T")[0] : "",
      comment: exam.comment || "",
    });
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) { toast.error("No active session"); return; }
    setLoading(true);
    try {
      if (view === "add") {
        await axios.post(`${apiUrl}/api/offlineexam`, {
          name: form.name,
          date: form.date,
          comment: form.comment,
          session: currentSession._id,
        });
        toast.success("Exam created successfully");
      } else if (view === "edit" && selectedExam?._id) {
        await axios.put(`${apiUrl}/api/class/${selectedExam._id}`, {
          name: form.name,
          date: form.date,
          comment: form.comment,
        });
        toast.success("Exam updated successfully");
      }
      await reFetch();
      setView("list");
      setSelectedExam(null);
      setForm({ name: "", date: "", comment: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save exam");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedExam?._id) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/deleteexam/${selectedExam._id}`);
      toast.success("Exam deleted successfully");
      await reFetch();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete exam");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedExam(null);
    }
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <FormShell
          title="Exam"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setView("list");
            setSelectedExam(null);
          }}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Exam Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. FIRST TERM"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Exam Date
            </Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Comment
            </Label>
            <Input
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="e.g. GOOD"
            />
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">Exam List</h2>
          <p className="text-sm text-slate-500">
            View and manage scheduled academic examinations.
          </p>
        </div>
        <Button
          onClick={() => { setForm({ name: "", date: "", comment: "" }); setSelectedExam(null); setView("add"); }}
          className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2">
          <Plus className="h-4 w-4" /> Add Exam
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[80px] text-[#004aaa] font-bold pl-6">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Exam Name
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">Date</TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Comment
                </TableHead>
                <TableHead className="text-right text-[#004aaa] font-bold pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    Loading exams…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">
                    Could not load exams.
                  </TableCell>
                </TableRow>
              ) : exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    No exams found for this session.
                  </TableCell>
                </TableRow>
              ) : null}
              {!listLoading &&
                !error &&
                currentExams.map((exam, index) => (
                <TableRow
                  key={(exam._id as string) || (exam.id as string) || index}
                  className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 font-medium text-slate-500">
                    {indexOfFirstItem + index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-[#004aaa]">
                    {(exam.name as string) || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                      {exam.date
                        ? new Date(exam.date as string).toLocaleDateString()
                        : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                      {(exam.comment as string) || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(exam)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedExam(exam);
                          setIsDeleteOpen(true);
                        }}
                        className="h-8 w-8 text-destructive hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t px-4">
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
        itemName={selectedExam?.name}
      />
    </div>
  );
}
