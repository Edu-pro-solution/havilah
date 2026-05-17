import { useContext, useMemo } from "react";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/DataTablePagination";
import { Users } from "lucide-react";

type TeacherRecord = {
  _id?: string;
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
};

type Props = {
  title?: string;
  description?: string;
};

export default function TeachersPage({
  title = "Teachers",
  description = "School teaching staff and contact information.",
}: Props) {
  const { currentSession } = useContext(SessionContext);
  const teachersUrl = currentSession?._id
    ? `/get-teachers/${currentSession._id}`
    : null;
  const { data, loading, error } = useFetch(teachersUrl);
  const teachers = useMemo(
    () => (Array.isArray(data) ? (data as TeacherRecord[]) : []),
    [data],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#004aaa]">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[80px] text-[#004aaa] font-bold pl-6">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">Name</TableHead>
                <TableHead className="text-[#004aaa] font-bold">Email</TableHead>
                <TableHead className="text-[#004aaa] font-bold">Phone</TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Address
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#004aaa] border-t-transparent" />
                      Loading teachers...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-destructive">
                    Could not load teachers. Check your session and API connection.
                  </TableCell>
                </TableRow>
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-slate-500">
                      <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <p>No teachers available right now.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher, index) => (
                  <TableRow
                    key={teacher._id || teacher.id || index}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="pl-6 font-medium text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-[#004aaa]">
                      {teacher.username || teacher.name || "Unnamed Teacher"}
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {teacher.email || "Not provided"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {teacher.phone || "Not provided"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {teacher.address || "Not provided"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="border-t px-4">
            <DataTablePagination
              totalItems={teachers.length}
              itemsPerPage={teachers.length || 1}
              currentPage={1}
              onPageChange={() => {}}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
