import { useContext, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CalendarDays, ListChecks } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function StudentExamList() {
  const { currentSession } = useContext(SessionContext);
  const { data, loading } = useFetch(
    currentSession?._id ? `/getofflineexam/${currentSession._id}` : null
  );
  const exams = useMemo(() => Array.isArray(data) ? data as any[] : [], [data]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = exams.slice(indexOfFirst, indexOfLast);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ListChecks className="h-6 w-6 text-[#004aaa]" />
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">Exam List</h2>
          <p className="text-sm text-slate-500">Scheduled academic examinations</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="pl-6 w-[60px] font-bold text-[#004aaa]">S/N</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Exam Name</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Date</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">Loading exams…</TableCell>
                </TableRow>
              ) : current.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">No exams found.</TableCell>
                </TableRow>
              ) : current.map((exam: any, i) => (
                <TableRow key={exam._id || i} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 text-slate-500">{indexOfFirst + i + 1}</TableCell>
                  <TableCell className="font-bold text-[#004aaa]">{exam.name || "—"}</TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                      {exam.date ? new Date(exam.date).toLocaleDateString() : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                      {exam.comment || "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {exams.length > itemsPerPage && (
            <div className="border-t px-4">
              <DataTablePagination
                totalItems={exams.length}
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
