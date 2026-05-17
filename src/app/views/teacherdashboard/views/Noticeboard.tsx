import React, { useContext, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bell } from "lucide-react";
import { DataTablePagination } from "@/components/DataTablePagination";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function NoticeBoard() {
  const { currentSession } = useContext(SessionContext);
  const noticeUrl = currentSession?._id
    ? `/get-all-notices/${currentSession._id}`
    : null;
  const { data, loading: listLoading, error } = useFetch(noticeUrl);
  const notices = useMemo(
    () => (Array.isArray(data) ? (data as Record<string, unknown>[]) : []),
    [data],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotices = notices.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-primary">Notice Board</h2>
          <p className="text-sm text-slate-500">School announcements and updates</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[#004aaa] font-bold text-center w-[80px]">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Notice Content
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Posted By
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-right pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-slate-500">
                    Loading notices…
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-destructive">
                    Failed to load notices.
                  </TableCell>
                </TableRow>
              ) : notices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-slate-500">
                    No notices yet.
                  </TableCell>
                </TableRow>
              ) : null}
              {!listLoading &&
                !error &&
                currentNotices.map((item, index) => (
                <TableRow
                  key={(item._id as string) || (item.id as string) || index}
                  className="hover:bg-slate-50/50">
                  <TableCell className="text-center font-medium text-slate-500">
                    {indexOfFirstItem + index + 1}
                  </TableCell>
                  <TableCell className="text-[#004aaa] max-w-[400px]">
                    <p className="line-clamp-1 font-medium">
                      {(item.notice as string) ||
                        (item.message as string) ||
                        "—"}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase">
                      {item.date
                        ? new Date(item.date as string).toLocaleDateString()
                        : ""}
                    </p>
                  </TableCell>
                  <TableCell className="text-center text-slate-600 font-semibold text-sm">
                    {(item.posted_by as string) ||
                      (item.postedBy as string) ||
                      "—"}
                  </TableCell>
                  <TableCell className="text-right pr-6 text-slate-500 text-sm">
                    {item.date
                      ? new Date(item.date as string).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
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
    </div>
  );
}
