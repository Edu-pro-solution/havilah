import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bell, GraduationCap, Users, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

type StatCard = {
  title: string;
  subtitle: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

const countItems = (value: unknown) => (Array.isArray(value) ? value.length : 0);

export default function Dashboard() {
  const { currentSession } = useContext(SessionContext);
  const navigate = useNavigate();
  const sessionId = currentSession?._id;

  const { data: rawStudents } = useFetch(sessionId ? `/users/student/${sessionId}` : null);
  const { data: rawTeachers } = useFetch(sessionId ? `/users/teacher/${sessionId}` : null);
  const { data: rawParents } = useFetch(sessionId ? `/users/parent/${sessionId}` : null);
  const { data: notices } = useFetch(sessionId ? `/get-all-notices/${sessionId}` : null);
const { data: rawAdmins } = useFetch(sessionId ? `/users/admin/${sessionId}` : null);
  const stats = useMemo<StatCard[]>(
    () => [
      {
        title: "Students",
        subtitle: "total students",
        value: countItems(rawStudents),
        icon: GraduationCap,
        href: "/student/admit",
      },
      {
        title: "Teachers",
        subtitle: "total teachers",
        value: countItems(rawTeachers),
        icon: Users2,
        href: "/teacher",
      },
      {
        title: "Parents",
        subtitle: "total parents",
        value: countItems(rawParents),
        icon: Users,
        href: "/parents",
      },
      {
  title: "Admins",
  subtitle: "total admins",
  value: countItems(rawAdmins),
  icon: Bell,
  href: "/admin",
},
      // {
      //   title: "Notice Board",
      //   subtitle: "active notices",
      //   value: countItems(notices),
      //   icon: Bell,
      //   href: "/notices",
      // },
    ],
    [notices, rawParents, rawStudents, rawTeachers]
  );

  const latestNotices = Array.isArray(notices) ? notices.slice(0, 3) : [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-black bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#004aaa]">
              Admin Dashboard
            </p>
            <h1 className="text-3xl font-bold text-black">School Overview</h1>
            <p className="text-sm text-black">
              Session: {currentSession?.name || "No active session selected"}
            </p>
          </div>
          <div className="rounded-xl border border-black bg-[#004aaa] px-4 py-3 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Current Session</p>
            <p className="text-lg font-bold">{currentSession?.name || "Not Set"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {stats.map((item) => (
              <Card key={item.title} className="border border-black bg-white shadow-sm">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-black bg-[#004aaa] text-white">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-black">{item.value}</p>
                      <p className="text-sm font-semibold text-black">{item.title}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-[#004aaa]">{item.subtitle}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(item.href)}
                    className="h-10 w-10 border-black text-[#004aaa] hover:bg-[#004aaa] hover:text-white"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border border-black bg-white shadow-sm">
            <CardHeader className="border-b border-black">
              <CardTitle className="text-base font-bold text-[#004aaa]">Recent Notice Board</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {latestNotices.length === 0 ? (
                <p className="text-sm text-black">No notices yet.</p>
              ) : (
                latestNotices.map((notice: any) => (
                  <div key={notice._id || notice.title} className="rounded-xl border border-black bg-white p-4">
                    <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-bold text-black">{notice.title || "Notice"}</p>
                        <p className="mt-1 text-sm text-black">
                          {notice.notice || notice.message || notice.description || "No notice body provided."}
                        </p>
                        <p className="mt-2 text-[11px] font-semibold text-[#004aaa]">
                          Posted by: {notice.posted_by || notice.postedBy || "Admin"}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#004aaa]">
                        {notice.date ? new Date(notice.date).toLocaleDateString() : "Notice"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border border-black bg-white shadow-sm">
          <CardHeader className="border-b border-black">
            <CardTitle className="text-base font-bold text-[#004aaa]">Academic Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Calendar className="w-full rounded-xl border border-black" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
