import { useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
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
import { BookOpen } from "lucide-react";

type SubjectRecord = {
  _id?: string;
  id?: string;
  subjectName?: string;
  name?: string;
  teacherName?: string;
  teacher?: string;
  classname?: string;
  className?: string;
};

const CLASS_LABELS: Record<string, string> = {
  js1: "J.S.1",
  js2: "J.S.2",
  js3: "J.S.3",
  ss1: "S.S.1",
  ss2: "S.S.2",
  ss3: "S.S.3",
};

type Props = {
  title?: string;
};

export default function SubjectsPage({ title = "Subjects" }: Props) {
  const { classId } = useParams();
  const { currentSession } = useContext(SessionContext);
  const normalizedClassId = (classId || "js1").toLowerCase();
  const { data, loading } = useFetch(
    currentSession
      ? `/get-subject/${normalizedClassId.toUpperCase()}/${currentSession._id}`
      : null,
  );

  const subjects = useMemo(
    () => (Array.isArray(data) ? (data as SubjectRecord[]) : []),
    [data],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">{title}</h2>
        <p className="text-sm uppercase text-slate-500">
          {CLASS_LABELS[normalizedClassId] || normalizedClassId}
        </p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[80px] text-[#004aaa] font-bold pl-6">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Subject
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Teacher
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">Class</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#004aaa] border-t-transparent" />
                      Loading subjects...
                    </div>
                  </TableCell>
                </TableRow>
              ) : subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-slate-500">
                      <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <p>No subjects found for this class.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject, index) => (
                  <TableRow
                    key={subject._id || subject.id || index}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="pl-6 font-medium text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-bold text-[#004aaa]">
                      {subject.subjectName || subject.name || "Unnamed Subject"}
                    </TableCell>
                    <TableCell className="text-blue-600 font-medium">
                      {subject.teacherName || subject.teacher || "Not assigned"}
                    </TableCell>
                    <TableCell className="text-slate-600 uppercase font-semibold text-xs">
                      {subject.className ||
                        subject.classname ||
                        CLASS_LABELS[normalizedClassId] ||
                        normalizedClassId}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
