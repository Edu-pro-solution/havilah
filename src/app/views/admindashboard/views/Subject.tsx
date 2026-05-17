import React, { useContext, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { toast } from "sonner";

function Subject() {
  const { classId } = useParams();
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const classNameStr = (classId || "js1").toUpperCase();
  const subjectsUrl = currentSession
    ? `/get-subject/${classNameStr}/${currentSession._id}`
    : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(subjectsUrl);

  const { data: teacherData } = useFetch(
    currentSession?._id ? `/get-teachers/${currentSession._id}` : null
  );
  const teachers = useMemo(
    () => (Array.isArray(teacherData) ? (teacherData as any[]) : []),
    [teacherData]
  );

  const filtered = useMemo(
    () => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []),
    [data]
  );

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [subjectName, setSubjectName] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const itemsPerPage = 8;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleEdit = (sub: any) => {
    setSelectedSubject(sub);
    setSubjectName(sub.subjectName || sub.name || "");
    setSelectedTeacher(sub.teacherName || sub.teacher || sub.username || "");
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) { toast.error("No active session"); return; }
    setLoading(true);
    try {
      if (view === "add") {
        await axios.post(
          `${apiUrl}/api/create-subject/${currentSession._id}`,
          { name: subjectName, classname: classNameStr, teacher: selectedTeacher },
          { headers: authHeaders() }
        );
        toast.success("Subject created successfully");
      } else if (view === "edit" && selectedSubject?._id) {
        await axios.put(
          `${apiUrl}/api/update-subject/${selectedSubject._id}`,
          { name: subjectName, classname: classNameStr, teacher: selectedTeacher },
          { headers: authHeaders() }
        );
        toast.success("Subject updated successfully");
      }
      await reFetch();
      setView("list");
      setSelectedSubject(null);
      setSubjectName("");
      setSelectedTeacher("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSubject?._id) return;
    setLoading(true);
    try {
      await axios.delete(
        `${apiUrl}/api/delete-subject/${selectedSubject._id}`,
        { headers: authHeaders() }
      );
      await reFetch();
      toast.success("Subject deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete subject");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedSubject(null);
    }
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <FormShell
          title="Subject"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setView("list");
            setSelectedSubject(null);
            setSubjectName("");
            setSelectedTeacher("");
          }}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Subject Name
            </Label>
            <Input
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="e.g. Further Mathematics"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Class
            </Label>
            <Input
              value={classNameStr}
              readOnly
              className="uppercase bg-slate-50"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Assign Teacher
            </Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t: any) => (
                  <SelectItem key={t._id} value={t.username || t.teacherName || t.name || t._id}>
                    {t.username || t.teacherName || t.name || "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">Subjects</h2>
          <p className="text-sm text-slate-500 uppercase">
            {classId || "All Classes"}
          </p>
        </div>
        <Button
          onClick={() => { setSubjectName(""); setSelectedTeacher(""); setView("add"); }}
          className="bg-[#004aaa] gap-2 hover:bg-[#004aaa]/90">
          <Plus className="h-4 w-4" /> Add new Subject
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[80px] text-[#004aaa] font-bold pl-6">S/N</TableHead>
                <TableHead className="text-[#004aaa] font-bold">Subject</TableHead>
                <TableHead className="text-[#004aaa] font-bold">Teacher</TableHead>
                <TableHead className="text-[#004aaa] font-bold">Class</TableHead>
                <TableHead className="text-right text-[#004aaa] font-bold pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    Loading subjects…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">
                    Failed to load subjects for this class.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    No subjects found.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((sub, index) => (
                  <TableRow
                    key={(sub._id as string) || index}
                    className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 text-slate-500">
                      {indexOfFirst + index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-[#004aaa]">
                      {(sub.subjectName as string) || (sub.name as string) || "—"}
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {(sub.teacherName as string) || (sub.teacher as string) || "—"}
                    </TableCell>
                    <TableCell className="text-slate-600 uppercase font-semibold text-xs">
                      {(sub.classname as string) || (sub.class as string) || classNameStr}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(sub)}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setSelectedSubject(sub); setIsDeleteOpen(true); }}
                          className="h-8 w-8 text-destructive hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="border-t px-4">
            <DataTablePagination
              totalItems={filtered.length}
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
        itemName={
          (selectedSubject?.subjectName as string) ||
          (selectedSubject?.name as string) ||
          "Subject"
        }
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}

export default Subject;
