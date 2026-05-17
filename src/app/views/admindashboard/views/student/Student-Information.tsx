import React, { useContext, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormShell } from "@/components/ActionForm";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Printer,
  Plus,
  Pencil,
  Trash2,
  FileText,
  User,
  Eye,
  EyeOff,
  CreditCard,
} from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import axios from "axios";
import { SessionContext } from "@/contexts/SessionContext";

const StudentInformation = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [view, setView] = useState<"list" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const itemsPerPage = 10;

  const { data, loading: fetchLoading, reFetch } = useFetch(
    currentSession && classId ? `/students/${currentSession._id}/${classId.toUpperCase()}` : null
  );
  const allStudents = Array.isArray(data) ? data : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = allStudents.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrint = () => window.print();

  const handleEditClick = (student: any) => {
    setSelectedStudent(student);
    setNewPassword("");
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.put(
        `${apiUrl}/api/put-students/${selectedStudent._id}`,
        {
          studentName: selectedStudent.studentName,
          address: selectedStudent.address,
          AdmNo: selectedStudent.AdmNo,
          email: selectedStudent.email,
          phone: selectedStudent.phone,
          password: newPassword || selectedStudent.password,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Student updated successfully");
      setView("list");
      reFetch();
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(`${apiUrl}/api/users/${selectedStudent._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Student deleted successfully");
      setIsDeleteOpen(false);
      reFetch();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  if (view === "edit" && selectedStudent) {
    return (
      <div className="p-6 space-y-6">
        <FormShell
          title="Student"
          type="edit"
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setView("list");
            setSelectedStudent(null);
          }}
        >
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Full Name</Label>
            <Input value={selectedStudent.studentName || ""} onChange={(e) => setSelectedStudent({ ...selectedStudent, studentName: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Admission Number</Label>
            <Input value={selectedStudent.AdmNo || ""} onChange={(e) => setSelectedStudent({ ...selectedStudent, AdmNo: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Email Address</Label>
            <Input type="email" value={selectedStudent.email || ""} onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Phone Number</Label>
            <Input value={selectedStudent.phone || ""} onChange={(e) => setSelectedStudent({ ...selectedStudent, phone: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Parent/Guardian Name</Label>
            <Input value={selectedStudent.parentsName || ""} onChange={(e) => setSelectedStudent({ ...selectedStudent, parentsName: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-black">Date of Birth</Label>
            <Input type="date" value={selectedStudent.birthday ? String(selectedStudent.birthday).split("T")[0] : ""} onChange={(e) => setSelectedStudent({ ...selectedStudent, birthday: e.target.value })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-black">Home Address</Label>
            <Input value={selectedStudent.address || ""} onChange={(e) => setSelectedStudent({ ...selectedStudent, address: e.target.value })} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-black">New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="pr-10 border-black"
              />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-primary">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="space-y-6">
  <div className="flex justify-between items-end print:hidden">
  <div>
    <h2 className="text-2xl font-bold text-primary">Student Information - {classId?.toUpperCase()}</h2>
    <p className="text-sm text-black">Managing {allStudents.length} students</p>
  </div>

  <div className="flex flex-wrap gap-2 justify-end">
    <Button onClick={() => navigate("/student/admit")} className="gap-2 bg-primary hover:bg-primary/90">
      <Plus size={16} /> Add Student
    </Button>

    <Button variant="outline" onClick={handlePrint} className="gap-2 border-black text-black hover:bg-primary/10">
      <Printer size={16} /> Print List
    </Button>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 border-black text-black hover:bg-primary/10">
          <FileText size={16} /> Bulk Print Reports
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuItem onClick={() => navigate(`/bulk-print/${classId}/first-term`)} className="gap-2">
          <FileText size={14} /> First Term Report Cards
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/bulk-print/${classId}/second-term`)} className="gap-2">
          <FileText size={14} /> Second Term Report Cards
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/bulk-print/${classId}/third-term`)} className="gap-2">
          <FileText size={14} /> Third Term Report Cards
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/bulk-print/${classId}/cumulative`)} className="gap-2">
          <FileText size={14} /> Cumulative Results
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>

      <Card className="overflow-hidden border border-black shadow-sm print:shadow-none">
        <CardContent className="p-0 printable-area">
          <Table>
            <TableHeader className="bg-primary/10 print:bg-white">
              <TableRow>
                <TableHead className="pl-6 font-bold text-primary">S/N</TableHead>
                <TableHead className="font-bold text-primary">Adm No</TableHead>
                <TableHead className="font-bold text-primary">Name</TableHead>
                <TableHead className="font-bold text-primary print:hidden">Email</TableHead>
                <TableHead className="pr-6 text-right font-bold text-primary print:hidden">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetchLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-black">Loading students...</TableCell>
                </TableRow>
              ) : currentStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-black">No students found in this class.</TableCell>
                </TableRow>
              ) : (
                currentStudents.map((student, index) => (
                  <TableRow key={student._id} className="print:border-b hover:bg-primary/5">
                    <TableCell className="pl-6">{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell className="font-bold text-black">{student.AdmNo}</TableCell>
                    <TableCell className="font-medium text-primary">{student.studentName}</TableCell>
                    <TableCell className="print:hidden text-black">{student.email}</TableCell>
                    <TableCell className="pr-6 text-right print:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem onClick={() => navigate(`/student_mark_sheet/${student._id}`)} className="gap-2">
                            <FileText size={14} /> Mark Sheet
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/student_profile/${student._id}`)} className="gap-2">
                            <User size={14} /> Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/student/id-card/${student._id}`)} className="gap-2">
                            <CreditCard size={14} /> ID Card
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(student)} className="gap-2 text-[#004aaa] focus:bg-[#004aaa]/10 focus:text-[#004aaa]">
                            <Pencil size={14} className="text-[#004aaa]" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDeleteOpen(true);
                            }}
                            className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 size={14} className="text-red-600" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="print:hidden">
        <DataTablePagination totalItems={allStudents.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        itemName={selectedStudent?.studentName}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
};

export default StudentInformation;
