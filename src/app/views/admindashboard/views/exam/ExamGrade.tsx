import React, { useContext, useEffect, useMemo, useState } from "react";
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
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

type GradeRow = {
  _id: string;
  grade_name?: string;
  gradepoint?: string | number;
  markfrom?: string | number;
  markupto?: string | number;
  comment?: string;
};

const emptyForm = {
  grade_name: "",
  gradepoint: "",
  markfrom: "",
  markupto: "",
  comment: "",
};

export default function ExamGrades() {
  const { currentSession } = useContext(SessionContext);
  const gradeUrl = currentSession?._id ? `/grade/${currentSession._id}` : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(gradeUrl);

  const grades = useMemo(
    () => (Array.isArray(data) ? (data as GradeRow[]) : []),
    [data],
  );

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState<GradeRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const itemsPerPage = 10;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGrades = grades.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (view === "edit" && selectedGrade) {
      setForm({
        grade_name: String(selectedGrade.grade_name ?? ""),
        gradepoint: String(selectedGrade.gradepoint ?? ""),
        markfrom: String(selectedGrade.markfrom ?? ""),
        markupto: String(selectedGrade.markupto ?? ""),
        comment: String(selectedGrade.comment ?? ""),
      });
    } else if (view === "add") {
      setForm(emptyForm);
    }
  }, [view, selectedGrade]);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleEdit = (grade: GradeRow) => {
    setSelectedGrade(grade);
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) return;
    setLoading(true);
    try {
      const headers = authHeaders();
      if (view === "add") {
        await axios.post(
          `${apiUrl}/api/grade`,
          { ...form, session: currentSession._id },
          { headers },
        );
      } else if (view === "edit" && selectedGrade?._id) {
        await axios.put(
          `${apiUrl}/api/grade/${selectedGrade._id}`,
          { ...selectedGrade, ...form, _id: selectedGrade._id },
          { headers },
        );
      }
      await reFetch();
      toast.success(view === "add" ? "Grade created successfully" : "Grade updated successfully");
      setView("list");
      setSelectedGrade(null);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save grade");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGrade?._id) return;
    setLoading(true);
    try {
      const headers = authHeaders();
      await axios.delete(`${apiUrl}/api/grade/${selectedGrade._id}`, {
        headers,
      });
      await reFetch();
      toast.success("Grade deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete grade");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedGrade(null);
    }
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => {
            setView("list");
            setSelectedGrade(null);
            setForm(emptyForm);
          }}
          className="text-slate-500 hover:text-[#004aaa] gap-2">
          <ArrowLeft size={16} /> Back to Exam Grades
        </Button>

        <FormShell
          title="Grade"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Grade Name
            </Label>
            <Input
              value={form.grade_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, grade_name: e.target.value }))
              }
              placeholder="e.g. A"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Grade Point
            </Label>
            <Input
              type="number"
              step="0.1"
              value={form.gradepoint}
              onChange={(e) =>
                setForm((f) => ({ ...f, gradepoint: e.target.value }))
              }
              placeholder="e.g. 5.0"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Mark From
            </Label>
            <Input
              type="number"
              value={form.markfrom}
              onChange={(e) =>
                setForm((f) => ({ ...f, markfrom: e.target.value }))
              }
              placeholder="e.g. 70"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Mark Up To
            </Label>
            <Input
              type="number"
              value={form.markupto}
              onChange={(e) =>
                setForm((f) => ({ ...f, markupto: e.target.value }))
              }
              placeholder="e.g. 100"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Comment
            </Label>
            <Input
              value={form.comment}
              onChange={(e) =>
                setForm((f) => ({ ...f, comment: e.target.value }))
              }
              placeholder="e.g. Excellent"
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
          <h2 className="text-2xl font-bold text-[#004aaa]">Exam Grades</h2>
          <p className="text-sm text-slate-500">
            Set the marking range and grade points for evaluations.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedGrade(null);
            setForm(emptyForm);
            setView("add");
          }}
          className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2">
          <Plus className="h-4 w-4" /> Add New Grade
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="text-[#004aaa] font-bold pl-6">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Grade Name
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Grade Point
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Mark From
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Mark Up To
                </TableHead>
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
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-slate-400">
                    Loading grades…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-destructive">
                    Failed to load grades.
                  </TableCell>
                </TableRow>
              ) : currentGrades.length > 0 ? (
                currentGrades.map((grade, index) => (
                  <TableRow key={grade._id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 text-slate-500">
                      {indexOfFirstItem + index + 1}
                    </TableCell>
                    <TableCell className="text-center font-bold text-[#004aaa]">
                      {grade.grade_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {grade.gradepoint ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {grade.markfrom ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {grade.markupto ?? "—"}
                    </TableCell>
                    <TableCell className="italic text-slate-500">
                      {grade.comment ?? "—"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(grade)}
                          className="h-8 w-8 text-blue-600">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedGrade(grade);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-slate-400">
                    No Grade to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="border-t px-4">
            <DataTablePagination
              totalItems={grades.length}
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
        itemName={`grade ${selectedGrade?.grade_name ?? ""}`.trim()}
      />
    </div>
  );
}
