import { useContext, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentSubjectView() {
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();

  const className = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : {};
    const merged = { ...parsed, ...user } as any;
    return String(merged?.classname || merged?.className || merged?.class || "");
  }, [user]);

  const { data, loading } = useFetch(
    currentSession?._id && className
      ? `/get-subject/${className}/${currentSession._id}`
      : null
  );
  const subjects = useMemo(
    () => (Array.isArray(data) ? (data as any[]) : []),
    [data]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">My Subjects</h2>
        <p className="text-sm text-slate-500">
          {className ? `${subjects.length} subject${subjects.length !== 1 ? "s" : ""} for ${className.toUpperCase()}` : "No class assigned"}
        </p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="pl-6 w-[60px] font-bold text-[#004aaa]">S/N</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Subject</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Teacher</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Class</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">Loading subjects…</TableCell>
                </TableRow>
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-slate-500">No subjects found.</TableCell>
                </TableRow>
              ) : subjects.map((s, i) => (
                <TableRow key={s._id || i} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 text-slate-500">{i + 1}</TableCell>
                  <TableCell className="font-bold text-[#004aaa]">
                    {s.subjectName || s.name || "—"}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {s.teacherName || s.teacher || s.username || "—"}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {s.classname || s.class || className || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
