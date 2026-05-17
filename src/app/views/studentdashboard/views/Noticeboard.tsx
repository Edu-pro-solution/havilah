import { useContext, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/DataTablePagination";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { Bell } from "lucide-react";

export default function StudentNoticeboard() {
  const { currentSession } = useContext(SessionContext);
  const { data, loading } = useFetch(
    currentSession?._id ? `/get-all-notices/${currentSession._id}` : null
  );
  const notices = useMemo(
    () => (Array.isArray(data) ? (data as any[]) : []),
    [data]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = notices.slice(indexOfFirst, indexOfLast);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-orange-500" />
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">Notice Board</h2>
          <p className="text-sm text-slate-500">School announcements and updates</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="pl-6 w-[60px] font-bold text-[#004aaa]">S/N</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Notice</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Posted By</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">Loading notices…</TableCell>
                </TableRow>
              ) : current.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">No notices yet.</TableCell>
                </TableRow>
              ) : current.map((item, i) => (
                <TableRow key={item._id || i} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 text-slate-500">{indexOfFirst + i + 1}</TableCell>
                  <TableCell className="text-[#004aaa] font-medium max-w-[400px]">
                    <p>{item.notice || item.message || "—"}</p>
                  </TableCell>
                  <TableCell className="text-slate-600 font-semibold text-sm">
                    {item.posted_by || item.postedBy || "School Admin"}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {notices.length > itemsPerPage && (
            <div className="border-t px-4">
              <DataTablePagination
                totalItems={notices.length}
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
