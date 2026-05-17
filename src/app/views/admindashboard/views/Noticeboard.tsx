import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

export default function NoticeBoard() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const noticeUrl = currentSession?._id ? `/get-all-notices/${currentSession._id}` : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(noticeUrl);
  const notices = useMemo(
    () => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []),
    [data]
  );

  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [form, setForm] = useState({ postedBy: "", date: "", message: "" });
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = notices.slice(indexOfFirstItem, indexOfLastItem);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleEdit = (item: any) => {
    setSelectedNotice(item);
    setForm({
      postedBy: item.posted_by || item.postedBy || "",
      date: item.date ? String(item.date).split("T")[0] : "",
      message: item.notice || item.message || "",
    });
    setView("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) { toast.error("No active session"); return; }
    setLoading(true);
    try {
      if (view === "add") {
        await axios.post(`${apiUrl}/api/create-notice`, {
          posted_by: form.postedBy,
          date: form.date,
          notice: form.message,
          sessionId: currentSession._id,
        }, { headers: authHeaders() });
        toast.success("Notice created successfully");
      } else if (view === "edit" && selectedNotice?._id) {
        await axios.put(`${apiUrl}/api/edit-notice/${selectedNotice._id}`, {
          posted_by: form.postedBy,
          date: form.date,
          notice: form.message,
          session: currentSession._id,
        }, { headers: authHeaders() });
        toast.success("Notice updated successfully");
      }
      await reFetch();
      setView("list");
      setSelectedNotice(null);
      setForm({ postedBy: "", date: "", message: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotice?._id) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/delete-notice/${selectedNotice._id}`, { headers: authHeaders() });
      await reFetch();
      toast.success("Notice deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notice");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedNotice(null);
    }
  };

  if (view === "add" || view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <FormShell title="Notice" type={view} loading={loading} onSubmit={handleFormSubmit} onClose={() => { setView("list"); setSelectedNotice(null); setForm({ postedBy: "", date: "", message: "" }); }}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Posted By</Label>
            <Input
              value={form.postedBy}
              onChange={(e) => setForm((f) => ({ ...f, postedBy: e.target.value }))}
              placeholder="e.g. Admin / Principal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Notice Date</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Notice Message</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Type the announcement here..."
              className="min-h-[120px] resize-none"
              required
            />
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-row gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold text-[#004aaa]">Notice Board</h2>
        <Button
          onClick={() => { setForm({ postedBy: "", date: "", message: "" }); setSelectedNotice(null); setView("add"); }}
          className="bg-[#004aaa] gap-2 hover:bg-[#004aaa]/90">
          <Plus className="h-4 w-4" />
          Add New Notice
        </Button>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[50px] pl-6">
                  <Checkbox className="border-slate-300" />
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center w-[80px]">S/N</TableHead>
                <TableHead className="text-[#004aaa] font-bold">Notice Content</TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">Posted By</TableHead>
                <TableHead className="text-[#004aaa] font-bold text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">Loading notices…</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">Failed to load notices.</TableCell>
                </TableRow>
              ) : notices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">No notices yet.</TableCell>
                </TableRow>
              ) : (
                currentNotices.map((item, index) => (
                  <TableRow key={(item._id as string) || index} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6">
                      <Checkbox className="border-slate-300" />
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-500">
                      {indexOfFirstItem + index + 1}
                    </TableCell>
                    <TableCell className="text-[#004aaa] max-w-[400px]">
                      <p className="line-clamp-1 font-medium">
                        {(item.notice as string) || (item.message as string) || "—"}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase">
                        {item.date ? new Date(item.date as string).toLocaleDateString() : ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-center text-slate-600 font-semibold text-sm">
                      {(item.posted_by as string) || (item.postedBy as string) || "—"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
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
                          onClick={() => { setSelectedNotice(item); setIsDeleteOpen(true); }}
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
              totalItems={notices.length}
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
        itemName="this notice"
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
}
