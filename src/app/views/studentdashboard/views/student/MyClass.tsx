import { useContext, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/DataTablePagination";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";

export default function MyClass() {
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const userInfo = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : {};
    return { ...parsed, ...user } as Record<string, any>;
  }, [user]);

  const className = String(userInfo?.classname || userInfo?.className || userInfo?.class || "");

  const { data, loading } = useFetch(
    currentSession && className
      ? `/students/${currentSession._id}/${className}`
      : null
  );

  const students = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = students.slice(indexOfFirst, indexOfLast);

  if (!className) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        No class assigned to your account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">
          My Class — {className.toUpperCase()}
        </h2>
        <p className="text-sm text-slate-500">{students.length} classmate{students.length !== 1 ? "s" : ""}</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="pl-6 font-bold text-[#004aaa] w-[60px]">S/N</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Adm No</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-slate-500">
                    Loading classmates…
                  </TableCell>
                </TableRow>
              ) : current.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-slate-500">
                    No classmates found.
                  </TableCell>
                </TableRow>
              ) : (
                current.map((s: any, i) => (
                  <TableRow key={s._id} className="hover:bg-slate-50/50">
                    <TableCell className="pl-6 text-slate-500">{indexOfFirst + i + 1}</TableCell>
                    <TableCell className="font-medium text-slate-600">{s.AdmNo || "—"}</TableCell>
                    <TableCell className="font-semibold text-[#004aaa]">{s.studentName || s.name || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DataTablePagination
        totalItems={students.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
