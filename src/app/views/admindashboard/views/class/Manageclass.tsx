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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function ManageClasses() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const classUrl = currentSession?._id ? `/class/${currentSession._id}` : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(classUrl);
  const { data: studentData } = useFetch(currentSession?._id ? `/users/student/${currentSession._id}` : null);

  const classes = useMemo(() => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []), [data]);
  const students = useMemo(() => (Array.isArray(studentData) ? (studentData as Record<string, unknown>[]) : []), [studentData]);
  const classCapacityMap = useMemo(() => {
    return students.reduce<Record<string, number>>((acc, student) => {
      const key = String(student.classname || student.className || "").trim().toUpperCase();
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [students]);

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [form, setForm] = useState({ name: "", teacher: "" });
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClasses = classes.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (item: any) => {
    setSelectedClass(item);
    setForm({ name: String(item.name || ""), teacher: String(item.teacher || item.classTeacher || "") });
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) {
      toast.error("No active session");
      return;
    }

    setLoading(true);
    try {
      if (view === "add") {
        await axios.post(`${apiUrl}/api/class`, { name: form.name, teacher: form.teacher, session: currentSession._id });
        toast.success("Class created successfully");
      } else if (view === "edit" && selectedClass?._id) {
        await axios.put(`${apiUrl}/api/class/${selectedClass._id}`, { name: form.name, teacher: form.teacher });
        toast.success("Class updated successfully");
      }

      await reFetch();
      setView("list");
      setSelectedClass(null);
      setForm({ name: "", teacher: "" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save class");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass?._id) return;

    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/class/${selectedClass._id}`);
      toast.success("Class deleted successfully");
      await reFetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete class");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedClass(null);
    }
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <FormShell
          title="Class"
          type={view}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setView("list");
            setSelectedClass(null);
          }}
        >
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Class Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. JS1 or SS3"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Class Teacher</Label>
            <Input
              value={form.teacher}
              onChange={(e) => setForm((prev) => ({ ...prev, teacher: e.target.value }))}
              placeholder="e.g. Mr Victor"
            />
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Manage Classes</h2>
          <p className="mt-1 text-sm text-black">
            Create, edit, and organize school class sections and assign their respective class teachers.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ name: "", teacher: "" });
            setSelectedClass(null);
            setView("add");
          }}
          className="w-fit gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add new Class
        </Button>
      </div>

      <Card className="overflow-hidden border border-black shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-primary/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] pl-6 font-bold text-primary">S/N</TableHead>
                <TableHead className="font-bold text-primary">Class Name</TableHead>
                <TableHead className="font-bold text-primary">Class Teacher</TableHead>
                <TableHead className="text-center font-bold text-primary">Capacity</TableHead>
                <TableHead className="pr-6 text-right font-bold text-primary">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-black">
                    Loading classes...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-black">
                    Failed to load classes.
                  </TableCell>
                </TableRow>
              ) : currentClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-black">
                    No classes found for this session.
                  </TableCell>
                </TableRow>
              ) : (
                currentClasses.map((item, index) => {
                  const className = String(item.name || "").trim().toUpperCase();
                  const capacity = classCapacityMap[className] ?? Number(item.studentCount ?? item.capacity ?? 0);
                  return (
                    <TableRow key={String(item._id || item.id || index)} className="hover:bg-primary/5">
                      <TableCell className="pl-6 font-medium text-black">{indexOfFirstItem + index + 1}</TableCell>
                      <TableCell className="font-bold text-primary">{String(item.name || "-")}</TableCell>
                      <TableCell className="text-black">{String(item.teacher || item.classTeacher || "-")}</TableCell>
                      <TableCell className="text-center font-medium text-black">{capacity}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8 text-primary hover:bg-primary/10">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedClass(item);
                              setIsDeleteOpen(true);
                            }}
                            className="h-8 w-8 text-primary hover:bg-primary/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="border-t border-black px-4">
            <DataTablePagination
              totalItems={classes.length}
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
        itemName={selectedClass?.name}
      />
    </div>
  );
}
