import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function Parents() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const parentUrl = currentSession?._id ? `/get-parent/${currentSession._id}` : null;
  const studentUrl = currentSession?._id ? `/users/student/${currentSession._id}` : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(parentUrl);
  const { data: studentsData } = useFetch(studentUrl);
  const parents = useMemo(
    () => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []),
    [data]
  );
  const students = useMemo(
    () => (Array.isArray(studentsData) ? (studentsData as any[]) : []),
    [studentsData]
  );

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParent, setSelectedParent] = useState<any>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    linkedStudentIds: [] as string[],
  });
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentParents = parents.slice(indexOfFirstItem, indexOfLastItem);
  const studentClasses = useMemo(
    () => Array.from(new Set(students.map((student) => String(student.classname || "")).filter(Boolean))).sort(),
    [students]
  );
  const filteredStudents = useMemo(
    () =>
      selectedClassFilter === "all"
        ? students
        : students.filter((student) => String(student.classname || "") === selectedClassFilter),
    [selectedClassFilter, students]
  );

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleEdit = (item: any) => {
    setSelectedParent(item);
    setForm({
      name: item.parentsName || item.name || item.username || "",
      email: item.email || "",
      phone: item.phone || "",
      address: item.address || "",
      password: "",
      linkedStudentIds: Array.isArray(item.linkedStudentIds) ? item.linkedStudentIds.map(String) : [],
    });
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) { toast.error("No active session"); return; }
    setLoading(true);
    const linkedStudents = students.filter((student) => form.linkedStudentIds.includes(String(student._id)));
    const linkedClassNames = Array.from(
      new Set(linkedStudents.map((student) => String(student.classname || "")).filter(Boolean))
    );

    try {
      if (view === "add") {
        await axios.post(`${apiUrl}/api/create-parent`, {
          username: form.name,
          parentsName: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          password: form.password,
          linkedStudentIds: form.linkedStudentIds,
          linkedClassNames,
          session: currentSession._id,
        }, { headers: authHeaders() });
        toast.success("Parent created successfully");
      } else if (view === "edit" && selectedParent?._id) {
        await axios.put(`${apiUrl}/api/parent/${selectedParent._id}`, {
          parentsName: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          linkedStudentIds: form.linkedStudentIds,
          linkedClassNames,
          ...(form.password ? { password: form.password } : {}),
        }, { headers: authHeaders() });
        toast.success("Parent updated successfully");
      }
      await reFetch();
      setView("list");
      setSelectedParent(null);
      setForm({ name: "", email: "", phone: "", address: "", password: "", linkedStudentIds: [] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save parent");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedParent?._id) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/users/${selectedParent._id}`, { headers: authHeaders() });
      await reFetch();
      toast.success("Parent deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete parent");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedParent(null);
    }
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <FormShell
          title="Parent"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setView("list");
            setSelectedParent(null);
          }}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Mrs Janet Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Email Address</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="parent@example.com"
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
              placeholder="Full residential address"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              {view === "edit" ? "New Password (leave blank to keep)" : "Account Password"}
            </Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Min 6 characters"
              minLength={view === "add" ? 6 : undefined}
              required={view === "add"}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Linked Students (Optional)
            </Label>
            <div className="space-y-3 rounded-md border border-black bg-white p-3">
              <div className="grid gap-3 md:grid-cols-[220px,1fr] md:items-center">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Filter By Class</Label>
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="h-10 w-full rounded-md border border-black bg-white px-3 text-sm text-black outline-none"
                  >
                    <option value="all">All Classes</option>
                    {studentClasses.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-black">
                  Showing {filteredStudents.length} student{filteredStudents.length === 1 ? "" : "s"}.
                </p>
              </div>
              <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2">
              {filteredStudents.length === 0 ? (
                <p className="text-sm text-slate-500">No students available for linking yet.</p>
              ) : (
                filteredStudents.map((student) => {
                  const id = String(student._id);
                  const checked = form.linkedStudentIds.includes(id);
                  return (
                    <label key={id} className="flex items-center gap-2 rounded-md border border-black px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setForm((prev) => ({
                            ...prev,
                            linkedStudentIds: checked
                              ? prev.linkedStudentIds.filter((item) => item !== id)
                              : [...prev.linkedStudentIds, id],
                          }))
                        }
                      />
                      <span className="text-black">
                        {student.studentName || student.username} {student.classname ? `- ${student.classname}` : ""}
                      </span>
                    </label>
                  );
                })
              )}
              </div>
            </div>
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-row gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold text-[#004aaa]">Parent Board</h2>
        <Button
          onClick={() => { setForm({ name: "", email: "", phone: "", address: "", password: "", linkedStudentIds: [] }); setSelectedParent(null); setView("add"); }}
          className="w-fit gap-2 bg-[#004aaa] hover:bg-[#004aaa]/90">
          <Plus className="h-4 w-4" />
          Add New Parent
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[50px] pl-4">
                  <Checkbox className="border-slate-300" />
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center w-[100px]">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Name
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Email
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Phone
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Address
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-right pr-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                    Loading parents…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-destructive">
                    Failed to load parents.
                  </TableCell>
                </TableRow>
              ) : currentParents.length > 0 ? (
                currentParents.map((item, index) => (
                  <TableRow
                    key={(item._id as string) || (item.id as string) || index}
                    className="hover:bg-slate-50/50">
                    <TableCell className="pl-4">
                      <Checkbox className="border-slate-300" />
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-500">
                      {indexOfFirstItem + index + 1}
                    </TableCell>
                    <TableCell className="text-[#004aaa] max-w-[400px] font-medium">
                      <p className="line-clamp-1">
                        {(item.parentsName as string) ||
                          (item.name as string) ||
                          (item.username as string) ||
                          "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-center text-slate-600">
                      {(item.email as string) || "—"}
                    </TableCell>
                    <TableCell className="text-center text-slate-600">
                      {(item.phone as string) || "—"}
                    </TableCell>
                    <TableCell className="text-center text-slate-600">
                      {(item.address as string) || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedParent(item);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 w-8 text-destructive hover:bg-red-50">
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
                    className="h-24 text-center text-[#004aaa] font-medium py-12">
                    No Parent to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="border-t px-4">
            <DataTablePagination
              totalItems={parents.length}
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
        itemName={selectedParent?.name}
      />
    </div>
  );
}
