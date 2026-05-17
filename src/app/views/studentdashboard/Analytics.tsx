import { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import useFetch from "@/hooks/useFetch";
import {
  Bell,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  Megaphone,
  Users,
} from "lucide-react";

type NoticeRecord = {
  _id?: string;
  id?: string;
  notice?: string;
  date?: string;
  posted_by?: string;
};

const fallbackNotices: NoticeRecord[] = [
  {
    id: "sn1",
    notice: "Continuous assessment results will be released next week.",
    date: "2026-04-18",
    posted_by: "Exams Unit",
  },
  {
    id: "sn2",
    notice: "Students should submit all outstanding assignments before Monday.",
    date: "2026-04-15",
    posted_by: "Class Teacher",
  },
];

const StudentDashboard = () => {
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();
  const { data: noticesData } = useFetch(
    currentSession ? `/get-all-notices/${currentSession._id}` : null
  );

  const notices = useMemo(
    () =>
      Array.isArray(noticesData) && noticesData.length > 0
        ? (noticesData as NoticeRecord[])
        : fallbackNotices,
    [noticesData]
  );

  const userInfo = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : {};
    return { ...parsed, ...user } as Record<string, any>;
  }, [user]);

  const className = String(
    userInfo?.classname || userInfo?.className || userInfo?.class || ""
  );
  const studentId = String(userInfo?._id || userInfo?.id || "");

  const { data: classmatesData, loading: loadingClassmates } = useFetch(
    currentSession && className
      ? `/students/${currentSession._id}/${className}`
      : null
  );
  const { data: subjectRows, loading: loadingSubjects } = useFetch(
    currentSession && className
      ? `/get-subject/${className}/${currentSession._id}`
      : null
  );

  const statCards = [
    {
      title: "Classmates",
      value: Array.isArray(classmatesData) ? classmatesData.length : 0,
      icon: Users,
      accent: "bg-blue-100 text-blue-700",
      isLoading: loadingClassmates,
    },
    {
      title: "Subjects",
      value: Array.isArray(subjectRows) ? subjectRows.length : 0,
      icon: BookOpen,
      accent: "bg-indigo-100 text-indigo-700",
      isLoading: loadingSubjects,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#004aaa]">Student Dashboard</h1>
        <p className="font-medium text-sm text-slate-500">
          {currentSession?.name
            ? `Current Session: ${currentSession.name}`
            : "Welcome to your student portal."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  <p className="mt-1 text-3xl font-black text-[#004aaa]">
                    {card.isLoading ? "..." : card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
          <CardContent className="p-0">
            <div className="grid min-h-[96px] grid-cols-1 sm:grid-cols-[44%_56%]">
              <div className="flex min-h-[72px] items-center justify-center bg-emerald-100 py-3 text-emerald-700 sm:min-h-0 sm:py-0">
                <CreditCard className="h-7 w-7" />
              </div>
              <div className="flex flex-col justify-center gap-3 px-4 py-4 sm:px-6">
                <div>
                  <p className="text-sm font-semibold text-[#004aaa]">
                    Student ID Card
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    View and print your school ID card anytime.
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="w-fit bg-[#004aaa] hover:bg-[#004aaa]/90"
                  disabled={!studentId}
                >
                  <Link
                    to={
                      studentId
                        ? `/student/id-card/${studentId}`
                        : "/student/dashboard/default"
                    }
                  >
                    View ID Card
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl text-[#004aaa]">
                Term Calendar
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="rounded-xl border border-slate-200 bg-white p-3 md:p-5">
              <Calendar
                mode="single"
                selected={new Date()}
                className="w-full rounded-md"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[420px] border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="flex flex-col gap-3 border-b bg-slate-50/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg text-[#004aaa] sm:text-xl">
                School Notices
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs font-bold text-blue-600 sm:w-auto"
            >
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[430px] divide-y divide-slate-100 overflow-y-auto">
              {notices.map((notice) => (
                <div
                  key={notice._id || notice.id}
                  className="flex gap-4 p-4 transition-colors hover:bg-slate-50/60"
                >
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#004aaa]">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-6 text-[#004aaa]">
                        {notice.notice || "No notice content"}
                      </p>
                      <span className="whitespace-nowrap text-[10px] text-slate-400">
                        {notice.date
                          ? new Date(notice.date).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
                      <span className="rounded-full bg-blue-50 px-2 py-1 font-bold text-blue-600">
                        {notice.posted_by || "School Admin"}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="h-3 w-3" />
                        Recent update
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
