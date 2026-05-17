import React, { useContext, useMemo, useState } from "react";
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
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import axios from "axios";

const Teacher = () => {
  const { currentSession } = useContext(SessionContext);
  const teachersUrl = currentSession?._id
    ? `/get-teachers/${currentSession._id}`
    : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(teachersUrl);
  const teachers = useMemo(
    () => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []),
    [data],
  );

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // --- UI States ---
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- Form State ---
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "" });

  // --- Data States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachers = teachers.slice(indexOfFirstItem, indexOfLastItem);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setForm({
      name: teacher.teacherName || teacher.name || teacher.username || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      address: teacher.address || "",
      password: "",
    });
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) { toast.error("No active session"); return; }
    setLoading(true);
    try {
      if (view === "add") {
        await axios.post(`${apiUrl}/api/create-teachers`, {
          username: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          password: form.password,
          session: currentSession._id,
        }, { headers: authHeaders() });
        toast.success("Teacher created successfully");
      } else if (view === "edit" && selectedTeacher?._id) {
        await axios.put(`${apiUrl}/api/teachers/${selectedTeacher._id}`, {
          username: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          ...(form.password ? { password: form.password } : {}),
        }, { headers: authHeaders() });
        toast.success("Teacher updated successfully");
      }
      await reFetch();
      setView("list");
      setSelectedTeacher(null);
      setForm({ name: "", email: "", phone: "", address: "", password: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save teacher");
    } finally {
      setLoading(false);
    }
  };

  // --- 1. ADD / EDIT VIEW ---
  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <FormShell
          title="Teacher"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setView("list");
            setSelectedTeacher(null);
          }}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Mr. John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Email Address</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="teacher@school.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Phone Number</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="080..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Home Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Lagos, Nigeria"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              {view === "edit" ? "New Password (leave blank to keep)" : "Account Password"}
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min 6 characters"
                minLength={view === "add" ? 6 : undefined}
                required={view === "add"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004aaa]">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </FormShell>
      </div>
    );
  }

  // --- 2. LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-row gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold text-[#004aaa]">Manage Teachers</h2>
        <Button
          onClick={() => { setForm({ name: "", email: "", phone: "", address: "", password: "" }); setSelectedTeacher(null); setView("add"); }}
          className="bg-[#004aaa] gap-2 hover:bg-[#004aaa]/90">
          <Plus className="h-4 w-4" />
          Add new Teacher
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[80px] text-[#004aaa] font-bold pl-6">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">Name</TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Email
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Phone
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Address
                </TableHead>
                <TableHead className="text-right text-[#004aaa] font-bold pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                    Loading teachers…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-destructive">
                    Failed to load teachers. Ensure a session is selected and the API is reachable.
                  </TableCell>
                </TableRow>
              ) : null}
              {!listLoading && !error && teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-slate-500">
                    No teachers found for this session.
                  </TableCell>
                </TableRow>
              ) : null}
              {!listLoading && !error && teachers.length > 0 && currentTeachers.map((teacher, index) => (
                <TableRow
                  key={(teacher._id as string) || (teacher.id as string) || index}
                  className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="pl-6 text-slate-500 font-medium">
                    {indexOfFirstItem + index + 1}
                  </TableCell>
                  <TableCell className="font-bold text-[#004aaa]">
                    {(teacher.username as string) ||
                      (teacher.name as string) ||
                      "Unnamed"}
                  </TableCell>
                  <TableCell className="text-blue-600 font-medium">
                    {(teacher.email as string) || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {(teacher.phone as string) || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm max-w-[200px] truncate">
                    {(teacher.address as string) || "—"}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(teacher)}
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTeacher(teacher);
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
              totalItems={teachers.length}
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
          selectedTeacher?.username || selectedTeacher?.name || "Teacher"
        }
        loading={loading}
        onConfirm={async () => {
          const id = selectedTeacher?._id || selectedTeacher?.id;
          if (!id) return;
          setLoading(true);
          try {
            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
            const token = localStorage.getItem("jwtToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.delete(`${apiUrl}/api/users/${id}`, { headers });
            await reFetch();
            toast.success("Teacher deleted successfully");
          } catch (e) {
            console.error(e);
            toast.error("Failed to delete teacher");
          } finally {
            setLoading(false);
            setIsDeleteOpen(false);
            setSelectedTeacher(null);
          }
        }}
      />
    </div>
  );
};

export default Teacher;
