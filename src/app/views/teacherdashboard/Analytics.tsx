import { useContext, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import {
  GraduationCap,
  Megaphone,
  Shield,
  Users,
  Users2,
} from "lucide-react";


type NoticeRecord = {
  _id?: string;
  id?: string;
  notice?: string;
  date?: string;
  posted_by?: string;
};

const TeacherDashboard = () => {
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();
  const sid = currentSession?._id;
  const { data: noticesData } = useFetch(
    currentSession ? `/get-all-notices/${currentSession._id}` : null,
  );
  const { data: studentUsers, loading: loadingStudents } = useFetch(
    sid ? `/users/student/${sid}` : null,
  );
  const { data: teacherUsers, loading: loadingTeachers } = useFetch(
    sid ? `/users/teacher/${sid}` : null,
  );
  const { data: parentUsers, loading: loadingParents } = useFetch(
    sid ? `/users/parent/${sid}` : null,
  );
  const { data: adminUsers, loading: loadingAdmins } = useFetch(
    sid ? `/users/admin/${sid}` : null,
  );

  const notices = useMemo(
    () => (Array.isArray(noticesData) ? (noticesData as NoticeRecord[]) : []),
    [noticesData],
  );

  const counts = useMemo(
    () => ({
      students: Array.isArray(studentUsers) ? studentUsers.length : 0,
      teachers: Array.isArray(teacherUsers) ? teacherUsers.length : 0,
      parents: Array.isArray(parentUsers) ? parentUsers.length : 0,
      admins: Array.isArray(adminUsers) ? adminUsers.length : 0,
    }),
    [studentUsers, teacherUsers, parentUsers, adminUsers],
  );

  const loadingCounts =
    loadingStudents || loadingTeachers || loadingParents || loadingAdmins;

  const statCards = [
    {
      title: "Students",
      value: counts.students,
      icon: GraduationCap,
      accent: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Teachers",
      value: counts.teachers,
      icon: Users2,
      accent: "bg-blue-100 text-blue-700",
    },
    {
      title: "Parents",
      value: counts.parents,
      icon: Users,
      accent: "bg-amber-100 text-amber-700",
    },
    {
      title: "Admins",
      value: counts.admins,
      icon: Shield,
      accent: "bg-rose-100 text-rose-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#004aaa]">Teacher Dashboard</h1>
        <p className="text-sm text-slate-500 font-medium">
          {currentSession?.name
            ? `Current Session: ${currentSession.name}`
            : `Welcome back${user?.name ? `, ${user.name}` : ""}.`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200"
          >
            <CardContent className="p-0">
              <div className="grid min-h-[96px] grid-cols-1 sm:grid-cols-[44%_56%]">
                <div
                  className={`flex min-h-[72px] items-center justify-center py-3 sm:min-h-0 sm:py-0 ${card.accent}`}
                >
                  <card.icon className="h-7 w-7" />
                </div>
                <div className="flex flex-col justify-center px-4 py-4 sm:px-6">
                  <p className="text-sm font-semibold text-[#004aaa]">
                    {card.title}
                  </p>
                  <p className="text-3xl font-black text-[#004aaa] mt-1">
                    {loadingCounts ? "..." : card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Event Calendar</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <Calendar />
              </CardContent>
            </Card>
    
            {/* <Card className="lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recruitment Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recruitmentPipelineData.map((item) => (
                    <div key={item.stage} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-muted-foreground">{item.stage}</div>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${(item.count / 129) * 100}%` }}
                        >
                          <span className="text-[10px] text-primary-foreground font-medium">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
    
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-[#004aaa]">
                  Notice Board
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notices.length > 0 ? (
                    notices.map((notice) => (
                      <div
                        key={notice._id || notice.id}
                        className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                        <div className="mt-0.5 h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          <Megaphone className="h-4 w-4 text-[#004aaa]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-bold text-[#004aaa] truncate line-clamp-2">
                              {notice.notice || "—"}
                            </p>
                            <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {notice.date ? new Date(notice.date).toLocaleDateString() : ""}
                            </p>
                          </div>
                          <p className="text-[10px] font-medium text-blue-600 mt-1">
                            By: {notice.posted_by || "Admin"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <p className="text-xs text-muted-foreground italic">No notices available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
    </div>
  );
};

export default TeacherDashboard;
