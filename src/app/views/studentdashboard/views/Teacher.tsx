import { useContext, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentTeacherView() {
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();

  const className = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      const parsed = stored ? JSON.parse(stored) : {};
      const merged = { ...parsed, ...user } as any;
      return String(merged?.classname || merged?.className || merged?.class || "").trim();
    } catch {
      return String((user as any)?.classname || (user as any)?.className || (user as any)?.class || "").trim();
    }
  }, [user]);

  const { data: classData, loading: classLoading } = useFetch(
    currentSession?._id ? `/class/${currentSession._id}` : null
  );
  const { data: teacherData, loading: teacherLoading } = useFetch(
    currentSession?._id ? `/get-teachers/${currentSession._id}` : null
  );

  const classes = useMemo(
    () => (Array.isArray(classData) ? (classData as any[]) : []),
    [classData]
  );
  const teachers = useMemo(
    () => (Array.isArray(teacherData) ? (teacherData as any[]) : []),
    [teacherData]
  );

  const normalizedClassName = className.toUpperCase();

  const assignedClass = useMemo(
    () =>
      classes.find(
        (item: any) =>
          String(item.name || item.className || item.class || "")
            .trim()
            .toUpperCase() === normalizedClassName
      ) || null,
    [classes, normalizedClassName]
  );

  const classTeacherName = useMemo(
    () => String(assignedClass?.teacher || assignedClass?.classTeacher || "").trim(),
    [assignedClass]
  );

  const classTeacher = useMemo(() => {
    if (!classTeacherName) return null;

    const normalizedTeacherName = classTeacherName.toUpperCase();
    const matchedTeacher = teachers.find((item: any) => {
      const candidates = [
        item.username,
        item.teacherName,
        item.name,
        `${item.firstName || ""} ${item.lastName || ""}`.trim(),
      ]
        .map((value) => String(value || "").trim().toUpperCase())
        .filter(Boolean);

      return candidates.includes(normalizedTeacherName);
    });

    if (!matchedTeacher) {
      return {
        displayName: classTeacherName,
        email: "",
        phone: "",
      };
    }

    return {
      ...matchedTeacher,
      displayName:
        matchedTeacher.username ||
        matchedTeacher.teacherName ||
        matchedTeacher.name ||
        classTeacherName,
    };
  }, [classTeacherName, teachers]);

  const loading = classLoading || teacherLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">My Class Teacher</h2>
        <p className="text-sm text-slate-500">
          {className
            ? `Teacher assigned to ${className.toUpperCase()}`
            : "No class assigned to this student yet"}
        </p>
      </div>

      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[60px] pl-6 font-bold text-[#004aaa]">S/N</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Class</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Name</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Email</TableHead>
                <TableHead className="font-bold text-[#004aaa]">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    Loading class teacher...
                  </TableCell>
                </TableRow>
              ) : !className ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    This student does not have a class assigned yet.
                  </TableCell>
                </TableRow>
              ) : !classTeacher ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                    No class teacher has been assigned for this class yet.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow key={classTeacher._id || classTeacher.displayName} className="hover:bg-slate-50/50">
                  <TableCell className="pl-6 text-slate-500">1</TableCell>
                  <TableCell className="text-sm font-medium text-slate-600">
                    {className.toUpperCase()}
                  </TableCell>
                  <TableCell className="font-bold text-[#004aaa]">
                    {classTeacher.displayName}
                  </TableCell>
                  <TableCell className="text-blue-600">{classTeacher.email || "-"}</TableCell>
                  <TableCell className="text-slate-600">{classTeacher.phone || "-"}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
