import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/DataTablePagination";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Download, BookCopy } from "lucide-react";

export default function StudentStudyMaterial() {
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const className = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : {};
    const merged = { ...parsed, ...user } as any;
    return String(merged?.classname || merged?.className || merged?.class || "");
  }, [user]);

  useEffect(() => {
    if (!currentSession?._id) return;
    const token = localStorage.getItem("jwtToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    setLoading(true);
    axios
      .get(`${apiUrl}/api/download/${currentSession._id}`, { headers })
      .then(({ data }) => {
        const all: any[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        // Show class-specific materials; if none match, show all for the session
        const classFiltered = className
          ? all.filter((m) => String(m.className || "").toLowerCase() === className.toLowerCase())
          : all;
        setMaterials(classFiltered.length > 0 ? classFiltered : all);
      })
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, [currentSession?._id, className]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = materials.slice(indexOfFirst, indexOfLast);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookCopy className="h-6 w-6 text-[#004aaa]" />
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">Study Materials</h2>
          <p className="text-sm text-slate-500">Download materials shared by your teachers</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="pl-6 w-[60px] font-bold text-[#004aaa]">S/N</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Title</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Description</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Subject</TableHead>
                <TableHead className="font-bold text-[#004aaa] text-right pr-6">Download</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">Loading materials…</TableCell>
                </TableRow>
              ) : current.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">No study materials found.</TableCell>
                </TableRow>
              ) : current.map((m: any, i) => (
                <TableRow key={m._id || i} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 text-slate-500">{indexOfFirst + i + 1}</TableCell>
                  <TableCell className="font-semibold text-[#004aaa]">{m.title || "—"}</TableCell>
                  <TableCell className="text-slate-600 text-sm">{m.desc || m.description || "—"}</TableCell>
                  <TableCell className="text-slate-500 text-xs uppercase">{m.subject || "—"}</TableCell>
                  <TableCell className="text-right pr-6">
                    {m.Downloads || m.fileUrl || m.url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                        <a href={m.Downloads || m.fileUrl || m.url} target="_blank" rel="noopener noreferrer" download>
                          <Download size={14} /> Download
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">No file</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {materials.length > itemsPerPage && (
            <div className="border-t px-4">
              <DataTablePagination
                totalItems={materials.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
