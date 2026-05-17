import React, { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormShell } from "@/components/ActionForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  MoreHorizontal,
  Plus,
  Trash2,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/DataTablePagination";
import { DeleteModal } from "@/components/DeleteModal";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

type DownloadRow = {
  _id: string;
  date?: string;
  title?: string;
  desc?: string;
  className?: string;
  subject?: string;
  Downloads?: string;
};

export default function ManageStudyMaterial() {
  const { currentSession } = useContext(SessionContext);
  const sessionId = currentSession?._id;

  const listUrl = sessionId ? `/download/${sessionId}` : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(listUrl);

  const classUrl = sessionId ? `/class/${sessionId}` : null;
  const { data: classData } = useFetch(classUrl);
  const classes = useMemo(
    () => (Array.isArray(classData) ? (classData as Record<string, unknown>[]) : []),
    [classData],
  );

  const [formClass, setFormClass] = useState("");
  const subjectUrl =
    formClass && sessionId
      ? `/get-subject/${encodeURIComponent(formClass)}/${sessionId}`
      : null;
  const { data: subjectData } = useFetch(subjectUrl);
  const subjects = useMemo(
    () =>
      Array.isArray(subjectData)
        ? (subjectData as Record<string, unknown>[])
        : [],
    [subjectData],
  );

  const materials = useMemo(
    () => (Array.isArray(data) ? (data as DownloadRow[]) : []),
    [data],
  );

  const [view, setView] = useState<"list" | "add">("list");
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState<DownloadRow | null>(
    null,
  );
  const [publishDate, setPublishDate] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const itemsPerPage = 5;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMaterials = materials.slice(indexOfFirstItem, indexOfLastItem);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const resetForm = () => {
    setPublishDate("");
    setTitle("");
    setDesc("");
    setFormClass("");
    setSubject("");
    setFile(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("date", publishDate);
      formDataToSend.append("title", title);
      formDataToSend.append("desc", desc);
      formDataToSend.append("className", formClass);
      formDataToSend.append("subject", subject);
      formDataToSend.append("session", sessionId);
      if (file) {
        formDataToSend.append("Downloads", file);
      }
      await axios.post(`${apiUrl}/api/download`, formDataToSend, {
        headers: {
          ...authHeaders(),
        },
      });
      await reFetch();
      toast.success("Study material uploaded successfully");
      setView("list");
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload study material");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!sessionId || !selectedMaterial?._id) return;
    setLoading(true);
    try {
      await axios.delete(
        `${apiUrl}/api/download/${sessionId}/${selectedMaterial._id}`,
        { headers: authHeaders() },
      );
      await reFetch();
      toast.success("Material deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete material");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedMaterial(null);
    }
  };

  if (view === "add") {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => {
            setView("list");
            resetForm();
          }}
          className="text-slate-500 hover:text-[#004aaa] gap-2">
          <ArrowLeft size={16} /> Back to Study Material
        </Button>

        <FormShell
          title="Study Material"
          type="add"
          loading={loading}
          onSubmit={handleFormSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Publish Date
            </Label>
            <Input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Material Title
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid Term Assignment"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Class
            </Label>
            <Select
              value={formClass || undefined}
              onValueChange={(v) => {
                setFormClass(v);
                setSubject("");
              }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((item) => (
                  <SelectItem
                    key={String(item._id ?? item.id ?? item.name)}
                    value={String(item.name ?? "")}>
                    {String(item.name ?? "—")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Subject
            </Label>
            <Select
              value={subject || undefined}
              onValueChange={setSubject}
              disabled={!formClass}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((item) => (
                  <SelectItem
                    key={String(item._id ?? item.id ?? item.name)}
                    value={String(
                      item.subjectName ?? item.name ?? "",
                    )}>
                    {String(item.subjectName ?? item.name ?? "—")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              File
            </Label>
            <Input
              type="file"
              onChange={(e) =>
                setFile(e.target.files?.[0] ? e.target.files[0] : null)
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Description
            </Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe the material here..."
              className="min-h-[120px] resize-none"
            />
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-[#004aaa]">
          Manage Study Material
        </h2>
        <Button
          onClick={() => {
            resetForm();
            setView("add");
          }}
          className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2 font-semibold">
          <Plus size={16} /> Add Study Material
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[60px] text-[#004aaa] font-bold pl-6">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">Date</TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Title
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Description
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Class
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Subject
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Download
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
                    colSpan={8}
                    className="py-12 text-center text-slate-500">
                    Loading study material…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-8 text-center text-sm text-destructive">
                    Failed to load study material.
                  </TableCell>
                </TableRow>
              ) : currentMaterials.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-slate-500">
                    No study material to display.
                  </TableCell>
                </TableRow>
              ) : (
                currentMaterials.map((item, index) => (
                  <TableRow key={item._id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 font-medium text-slate-500">
                      {indexOfFirstItem + index + 1}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-[#004aaa]">
                      {item.title ?? "—"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {item.desc ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-700">
                        {item.className ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item.subject ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.Downloads ? (
                        <Button
                          size="sm"
                          asChild
                          className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2 h-8 px-4">
                          <a
                            href={item.Downloads}
                            target="_blank"
                            rel="noopener noreferrer"
                            download>
                            <Download size={14} /> Download
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="gap-2 text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedMaterial(item);
                              setIsDeleteOpen(true);
                            }}>
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
          <div className="border-t px-4">
            <DataTablePagination
              totalItems={materials.length}
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
        itemName={selectedMaterial?.title}
      />
    </div>
  );
}
