import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import { FormShell } from "@/components/ActionForm";
import { DeleteModal } from "@/components/DeleteModal";

const Admin = () => {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const adminUrl = currentSession?._id ? `/get-session-admin/${currentSession._id}` : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(adminUrl);
  const admins = useMemo(
    () => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []),
    [data],
  );

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "" });
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdmins = admins.slice(indexOfFirstItem, indexOfLastItem);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleEdit = (admin: any) => {
    setSelectedAdmin(admin);
    setForm({
      name: admin.username || admin.name || "",
      email: admin.email || "",
      phone: admin.phone || "",
      address: admin.address || "",
      password: "",
    });
    setView("edit");
  };

  const handleAdd = () => {
    setSelectedAdmin(null);
    setForm({ name: "", email: "", phone: "", address: "", password: "" });
    setView("add");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) { toast.error("No active session"); return; }
    setLoading(true);
    try {
      if (view === "add") {
        await axios.post(`${apiUrl}/api/register`, {
          username: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          password: form.password,
          role: "admin",
          sessionId: currentSession._id,
        }, { headers: authHeaders() });
        toast.success("Admin created successfully");
      } else if (view === "edit" && selectedAdmin?._id) {
        await axios.put(`${apiUrl}/api/admin/${selectedAdmin._id}`, {
          username: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          ...(form.password ? { password: form.password } : {}),
        }, { headers: authHeaders() });
        toast.success("Admin updated successfully");
      }
      await reFetch();
      setView("list");
      setSelectedAdmin(null);
      setForm({ name: "", email: "", phone: "", address: "", password: "" });
    } catch {
      toast.error(view === "add" ? "Failed to create admin" : "Failed to update admin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin?._id) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/users/${selectedAdmin._id}`, { headers: authHeaders() });
      toast.success("Admin deleted successfully");
      await reFetch();
    } catch {
      toast.error("Failed to delete admin");
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedAdmin(null);
    }
  };

  if (view !== "list") {
    return (
      <div className="p-6 space-y-6">
        <FormShell
          title="Admin"
          type={view === "add" ? "add" : "edit"}
          loading={loading}
          onSubmit={handleFormSubmit}
          onClose={() => { setView("list"); setSelectedAdmin(null); }}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Email Address</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@school.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Phone Number</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="080..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Home address"
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
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">Admin Management</h2>
          <p className="text-sm text-slate-500">View and manage system administrators.</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#004aaa] gap-2 hover:bg-[#004aaa]/90">
          <Plus size={16} /> Add Admin
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[60px] pl-6 text-[#004aaa] font-bold uppercase text-xs">S/N</TableHead>
                <TableHead className="text-[#004aaa] font-bold uppercase text-xs">Name</TableHead>
                <TableHead className="text-[#004aaa] font-bold uppercase text-xs">Email</TableHead>
                <TableHead className="text-[#004aaa] font-bold uppercase text-xs">Phone</TableHead>
                <TableHead className="text-right pr-6 text-[#004aaa] font-bold uppercase text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">Loading admins…</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">Failed to load admins.</TableCell>
                </TableRow>
              ) : currentAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">No admins found for this session.</TableCell>
                </TableRow>
              ) : (
                currentAdmins.map((admin, index) => (
                  <TableRow key={String(admin._id || index)} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 text-slate-400">{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell className="font-bold text-[#004aaa]">
                      {(admin.username as string) || (admin.name as string) || "—"}
                    </TableCell>
                    <TableCell className="text-slate-600">{(admin.email as string) || "—"}</TableCell>
                    <TableCell className="text-slate-600">{(admin.phone as string) || "—"}</TableCell>
                    <TableCell className="text-right pr-6 space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(admin)}
                        className="text-blue-600 hover:bg-blue-50">
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedAdmin(admin); setIsDeleteModalOpen(true); }}
                        className="text-red-600 hover:bg-red-50">
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="border-t px-4">
            <DataTablePagination
              currentPage={currentPage}
              totalItems={admins.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        itemName={(selectedAdmin?.username || selectedAdmin?.name) as string}
        loading={loading}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedAdmin(null); }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Admin;
