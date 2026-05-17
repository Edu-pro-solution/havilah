import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowLeft,
  Eye,
  EyeOff
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

  // UI States
  const [view, setView] = useState<"list" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Data States
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Fetch real students — /students/:sessionId/:classname
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
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const updatedData = {
        studentName: selectedStudent.studentName,
        address: selectedStudent.address,
        AdmNo: selectedStudent.AdmNo,
        email: selectedStudent.email,
        phone: selectedStudent.phone,
        password: newPassword || selectedStudent.password,
      };

      await axios.put(
        `${apiUrl}/api/put-students/${selectedStudent._id}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setView("list");
      reFetch();
    } catch (err) {
      console.error("Error updating student:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent || !currentSession) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(
        `${apiUrl}/api/session/${currentSession._id}/users/${selectedStudent._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsDeleteOpen(false);
      reFetch();
    } catch (err) {
      console.error("Error deleting student:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- EDIT VIEW ---
  if (view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => setView("list")}
          className="text-slate-500 hover:text-[#004aaa] gap-2">
          <ArrowLeft size={16} /> Back to Student List
        </Button>

        <FormShell
          title="Student"
          type="edit"
          loading={loading}
          onSubmit={handleFormSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Full Name
            </Label>
            <Input
              defaultValue={selectedStudent?.studentName}
              onChange={(e) => setSelectedStudent({...selectedStudent, studentName: e.target.value})}
              placeholder="e.g. Akinola Al-ameen"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Admission Number
            </Label>
            <Input
              defaultValue={selectedStudent?.AdmNo}
              onChange={(e) => setSelectedStudent({...selectedStudent, AdmNo: e.target.value})}
              placeholder="ACE/2026/..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Email Address
            </Label>
            <Input
              type="email"
              defaultValue={selectedStudent?.email}
              onChange={(e) => setSelectedStudent({...selectedStudent, email: e.target.value})}
              placeholder="student@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Phone Number
            </Label>
            <Input 
              defaultValue={selectedStudent?.phone} 
              onChange={(e) => setSelectedStudent({...selectedStudent, phone: e.target.value})}
              placeholder="080..." 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Parent/Guardian Name
            </Label>
            <Input
              defaultValue={selectedStudent?.parent}
              placeholder="Mr/Mrs..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Date of Birth
            </Label>
            <Input type="date" defaultValue={selectedStudent?.dob} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Home Address
            </Label>
            <Input
              defaultValue={selectedStudent?.address}
              onChange={(e) => setSelectedStudent({...selectedStudent, address: e.target.value})}
              placeholder="Full residential address"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              New Password
            </Label>
            <div className="relative ">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="pr-10 border-slate-200 focus:border-[#004aaa]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#004aaa] transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </FormShell>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">
            Student Information - {classId?.toUpperCase()}
          </h2>
          <p className="text-sm text-slate-500">
            Managing {allStudents.length} students
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/student/admit")}
            className="bg-[#004aaa] gap-2">
            <Plus size={16} /> Add Student
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2 border-slate-300">
            <Printer size={16} /> Print List
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden print:shadow-none print:ring-0">
        <CardContent className="p-0 printable-area">
          <Table>
            <TableHeader className="bg-[#E8EBF3] print:bg-slate-100">
              <TableRow>
                <TableHead className="pl-6 font-bold text-[#004aaa]">
                  S/N
                </TableHead>
                <TableHead className="font-bold text-[#004aaa]">
                  Adm No
                </TableHead>
                <TableHead className="font-bold text-[#004aaa]">Name</TableHead>
                <TableHead className="font-bold text-[#004aaa] print:hidden">
                  Email
                </TableHead>
                <TableHead className="text-right pr-6 font-bold text-[#004aaa] print:hidden">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetchLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-[#004aaa] border-t-transparent rounded-full" />
                      Loading students...
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                    No students found in this class.
                  </TableCell>
                </TableRow>
              ) : (
                currentStudents.map((student, index) => (
                  <TableRow
                    key={student._id}
                    className="print:border-b hover:bg-slate-50/50">
                    <TableCell className="pl-6">{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell className="font-bold">{student.AdmNo}</TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {student.studentName}
                    </TableCell>
                    <TableCell className="print:hidden text-slate-600">
                      {student.email}
                    </TableCell>
                    <TableCell className="text-right pr-6 print:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/student_mark_sheet/${student._id}`)
                            }
                            className="gap-2">
                            <FileText size={14} /> Mark Sheet
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditClick(student)}
                            className="gap-2 cursor-pointer">
                            <Pencil size={14} /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/student_profile/${student._id}`)
                            }
                            className="gap-2">
                            <User size={14} /> Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStudent(student);
                              setIsDeleteOpen(true);
                            }}
                            className="text-red-600 gap-2">
                            <Trash2 size={14} /> Delete
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
        <DataTablePagination
          totalItems={allStudents.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
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
