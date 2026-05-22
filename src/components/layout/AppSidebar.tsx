import { useContext, useMemo, useState } from "react";
import {
  LayoutDashboard, User2, User, NotebookPen, BookCopy, ListChecks, ListCheck,
  BookOpen, Info, GraduationCap, FileEdit, TableProperties, CheckCheck,
  Laptop, Laptop2, Disc3, ReceiptText, AlarmClock, Pencil, Settings, LogOut,
  ChevronRight,
  ChevronDown,
  Upload,
  MessageSquareText,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SessionContext } from "@/contexts/SessionContext";
import useFetch from "@/hooks/useFetch";
import logo from "@/assets/logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ── helpers ──────────────────────────────────────────────────────────────────
const className = (c: any) => String(c?.name || c?.className || "");
// Use name string (not _id) — backend routes expect class name, e.g. "JS1"
const classId   = (c: any) => String(c?.name || c?.className || "");

// ── nav builders ─────────────────────────────────────────────────────────────
function buildAdminNav(classes: any[]) {
  const classSubItems = classes.length > 0
    ? classes.map((c) => ({ title: className(c), url: `/student/information/${classId(c)}` }))
    : [
        { title: "Class J.S.1", url: "/student/information/js1" },
        { title: "Class J.S.2", url: "/student/information/js2" },
        { title: "Class J.S.3", url: "/student/information/js3" },
        { title: "Class S.S.1", url: "/student/information/ss1" },
        { title: "Class S.S.2", url: "/student/information/ss2" },
        { title: "Class S.S.3", url: "/student/information/ss3" },
      ];

  const subjectSubItems = classes.length > 0
    ? classes.map((c) => ({ title: className(c), url: `/subject/${classId(c)}` }))
    : [
        { title: "Class J.S.1", url: "/subject/js1" },
        { title: "Class J.S.2", url: "/subject/js2" },
        { title: "Class J.S.3", url: "/subject/js3" },
        { title: "Class S.S.1", url: "/subject/ss1" },
        { title: "Class S.S.2", url: "/subject/ss2" },
        { title: "Class S.S.3", url: "/subject/ss3" },
      ];

  return [
    {
      label: "Main",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
        { title: "Admin", url: "/admin", icon: User2, key: "admin" },
      ],
    },
    {
      label: "Student",
      items: [
        { title: "Admit Student", url: "/student/admit", icon: User, key: "admit-student" },
        { title: "Bulk Upload", url: "/student/bulk-upload", icon: Upload, key: "bulk-student-upload" },
        { title: "Student Information", icon: NotebookPen, key: "student-info", subItems: classSubItems },
        { title: "Student Promotion", url: "/student/promotion", icon: BookCopy, key: "student-promotion" },
      ],
    },
    {
      label: "Affective Psychomotor",
      items: [
        { title: "Manage Category", url: "/psycho/category", icon: ListChecks, key: "psycho-category" },
        { title: "Student Report", url: "/psycho/stu-report", icon: ListCheck, key: "psycho-report" },
      ],
    },
    {
      label: "Teacher",
      items: [{ title: "Teachers", url: "/teacher", icon: User, key: "teacher" }],
    },
    {
      label: "Parents",
      items: [{ title: "Parents", url: "/parents", icon: User, key: "parents" }],
    },
    {
      label: "Notice Board",
      items: [{ title: "Noticeboard", url: "/notices", icon: Info, key: "notice" }],
    },
    {
      label: "Class",
      items: [
        { title: "Manage Class", url: "/class/manage", icon: GraduationCap, key: "class" },
        { title: "Academic Syllabus", url: "/class/syllabus", icon: GraduationCap, key: "class" },
      ],
    },
    {
      label: "Subjects",
      items: [
        { title: "Subject by Class", icon: BookOpen, key: "subject", subItems: subjectSubItems },
      ],
    },
    {
      label: "Exam",
      items: [
        { title: "Exam List", url: "/exam/list", icon: ListChecks, key: "exam-list" },
        { title: "Exam Grades", url: "/exam/grades", icon: GraduationCap, key: "exam-grades" },
        { title: "Manage Marks", url: "/exam/manage-marks", icon: FileEdit, key: "manage-marks" },
        { title: "Tabulation Sheet", url: "/exam/tabulation", icon: TableProperties, key: "tabulation" },
        { title: "On Screen Marking", url: "/exam/onscreenmarking", icon: CheckCheck, key: "onscreen-marking" },
      ],
    },
    {
      label: "Online Exam",
      items: [
        { title: "Create Online Exam", url: "/onlineexam/create", icon: Laptop, key: "onlinexam" },
        { title: "Manage Online Exam", url: "/onlineexam/manage", icon: Laptop2, key: "onlinexam" },
      ],
    },
    {
      label: "AI Tools",
      items: [
        { title: "Curriculum Generator", url: "/curriculum", icon: Disc3, key: "curriculum" },
        { title: "Generate Questions", url: "/gen-questions", icon: Disc3, key: "gen-questions" },
      ],
    },
    {
      label: "Past Questions",
      items: [
        { title: "UTME", url: "https://cbt.edupro.com.ng/login", icon: Disc3, key: "past-questions" },
        { title: "WAEC", url: "https://cbt.edupro.com.ng/login", icon: Disc3, key: "past-questions" },
      ],
    },
    {
      label: "Accounting",
      items: [
        { title: "Student Receipt", url: "/stu-receipt", icon: ReceiptText, key: "studentAccounting" },
        { title: "Student Payments", url: "/stu-payments", icon: ReceiptText, key: "studentAccounting" },
      ],
    },
    {
      label: "Study Material",
      items: [{ title: "Study Material", url: "/studymaterial", icon: Disc3, key: "studymaterial" }],
    },
    {
      label: "Daily Attendance",
      items: [{ title: "Daily Attendance", url: "/dailyattend", icon: AlarmClock, key: "dailyattend" }],
    },
    {
      label: "System",
      items: [
        { title: "Profile", url: "/profile", icon: User2, key: "settings" },
        { title: "Settings", url: "/settings", icon: Settings, key: "settings" },
        { title: "Account", url: "/account", icon: Pencil, key: "settings" },
      ],
    },
  ];
}

function buildTeacherNav(classes: any[]) {
  const classSubItems = classes.length > 0
    ? classes.map((c) => ({ title: className(c), url: `/teacher/dashboard/student-information/${classId(c)}` }))
    : [
        { title: "Class J.S.1", url: "/teacher/dashboard/student-information/js1" },
        { title: "Class J.S.2", url: "/teacher/dashboard/student-information/js2" },
        { title: "Class J.S.3", url: "/teacher/dashboard/student-information/js3" },
        { title: "Class S.S.1", url: "/teacher/dashboard/student-information/ss1" },
        { title: "Class S.S.2", url: "/teacher/dashboard/student-information/ss2" },
        { title: "Class S.S.3", url: "/teacher/dashboard/student-information/ss3" },
      ];

  const subjectSubItems = classes.length > 0
    ? classes.map((c) => ({ title: className(c), url: `/teacher/dashboard/subject/${classId(c)}` }))
    : [
        { title: "Class J.S.1", url: "/teacher/dashboard/subject/js1" },
        { title: "Class J.S.2", url: "/teacher/dashboard/subject/js2" },
        { title: "Class J.S.3", url: "/teacher/dashboard/subject/js3" },
        { title: "Class S.S.1", url: "/teacher/dashboard/subject/ss1" },
        { title: "Class S.S.2", url: "/teacher/dashboard/subject/ss2" },
        { title: "Class S.S.3", url: "/teacher/dashboard/subject/ss3" },
      ];

  return [
    {
      label: "Teacher Menu",
      items: [
        { title: "Dashboard", url: "/teacher/dashboard", icon: LayoutDashboard, key: "teacher-dashboard" },
      ],
    },
    {
      label: "Students",
      items: [
        { title: "Student Information", icon: NotebookPen, key: "teacher-student-info", subItems: classSubItems },
      ],
    },
    {
      label: "Subjects",
      items: [
        { title: "Subject by Class", icon: BookOpen, key: "teacher-subjects", subItems: subjectSubItems },
      ],
    },
    {
      label: "Affective Psychomotor",
      items: [
        { title: "Student Report", url: "/psycho/stu-report", icon: ListCheck, key: "psycho-report" },
      ],
    },
    {
      label: "Exam",
      items: [
        { title: "Manage Marks", url: "/teacher/dashboard/manage-mark-view", icon: FileEdit, key: "manage-marks" },
        { title: "Tabulation Sheet", url: "/dashboard/tabulation-sheet", icon: TableProperties, key: "tabulation" },
        { title: "On Screen Marking", url: "/exam/onscreenmarking", icon: CheckCheck, key: "onscreen-marking" },
      ],
    },
    {
      label: "Online Exam",
      items: [
        { title: "Create Online Exam", url: "/dashboard/online-exam", icon: Laptop, key: "onlinexam" },
        { title: "Manage Online Exam", url: "/dashboard/manage-online-exam", icon: Laptop2, key: "onlinexam" },
      ],
    },
    {
      label: "AI Tools",
      items: [
        { title: "Homework Review", url: "/teacher/dashboard/homework", icon: MessageSquareText, key: "homework" },
          { title: "Curriculum Generator", url: "/curriculum", icon: Disc3, key: "curriculum" },
        { title: "Generate Questions", url: "/gen-questions", icon: Disc3, key: "gen-questions" },
      ],
    },
    {
      label: "Notice Board",
      items: [{ title: "Noticeboard", url: "/notices", icon: Info, key: "notice" }],
    },
    {
      label: "Material & Attendance",
      items: [
        { title: "Study Material", url: "/studymaterial", icon: Disc3, key: "studymaterial" },
        { title: "Daily Attendance", url: "/dailyattend", icon: AlarmClock, key: "dailyattend" },
      ],
    },
    {
      label: "System",
      items: [
        { title: "Profile", url: "/dashboard/profile", icon: User2, key: "settings" },
      ],
    },
  ];
}

function buildStudentNav(_classes: any[]) {
  return [
    {
      label: "Student Menu",
      items: [
        { title: "Dashboard", url: "/student/dashboard/default", icon: LayoutDashboard, key: "student-dashboard" },
        { title: "Teachers", url: "/student/dashboard/teacher", icon: User, key: "teacher" },
        { title: "Subjects", url: "/student/dashboard/subject", icon: BookOpen, key: "subject" },
      ],
    },
    {
      label: "Class Information",
      items: [
        { title: "My Class", url: "/student/dashboard/my-class", icon: NotebookPen, key: "student-info" },
      ],
    },
    {
      label: "Exam & Results",
      items: [
        { title: "Exam List", url: "/student/dashboard/examlist", icon: ListChecks, key: "exam-list" },
        { title: "My Results", url: "/student/dashboard/student_mark_sheet", icon: GraduationCap, key: "student-dashboard" },
      ],
    },
    {
      label: "Online Exam",
      items: [
        { title: "Take Online Exam", url: "/student/dashboard/manage-online-exam", icon: Laptop, key: "onlinexam" },
      ],
    },
    {
      label: "AI Tools",
      items: [
        { title: "Homework", url: "/student/dashboard/homework", icon: MessageSquareText, key: "homework" },
        { title: "Past Questions (JAMB)", url: "https://cbt.edupro.com.ng", icon: Disc3, key: "onlinexam" },
      ],
    },
    {
      label: "Payments & Materials",
      items: [
        { title: "Payment History", url: "/student/dashboard/student-payment", icon: ReceiptText, key: "studentAccounting" },
        { title: "Study Material", url: "/student/dashboard/student-material", icon: BookCopy, key: "studymaterial" },
      ],
    },
    {
      label: "Notice Board",
      items: [{ title: "Noticeboard", url: "/student/dashboard/notices", icon: Info, key: "notice" }],
    },
    {
      label: "System",
      items: [
        { title: "Profile", url: "/student/dashboard/profile", icon: User2, key: "settings" },
      ],
    },
  ];
}

function buildParentNav() {
  return [
    {
      label: "Parent Menu",
      items: [
        { title: "Dashboard", url: "/parent/dashboard", icon: LayoutDashboard, key: "dashboard" },
        { title: "Ward Results", url: "/parent/dashboard/results", icon: GraduationCap, key: "parent-results" },
        { title: "Ward Materials", url: "/parent/dashboard/materials", icon: BookCopy, key: "parent-materials" },
        { title: "Ward Homework", url: "/parent/dashboard/homework", icon: MessageSquareText, key: "parent-homework" },
      ],
    },
  ];
}

// ── component ─────────────────────────────────────────────────────────────────
export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuth();
  const { currentSession } = useContext(SessionContext);

  const { data: rawClasses } = useFetch(
    currentSession?._id ? `/class/${currentSession._id}` : null
  );
  const classes = useMemo(
    () => Array.isArray(rawClasses)
      ? [...rawClasses].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
      : [],
    [rawClasses]
  );

  const nav = useMemo(() => {
    switch (user?.role) {
      case "teacher": return buildTeacherNav(classes);
      case "student": return buildStudentNav(classes);
      case "parent": return buildParentNav();
      default:        return buildAdminNav(classes);
    }
  }, [user?.role, classes]);

  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isGroupOpen = (label: string) => openGroups[label] ?? false;
  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !(prev[label] ?? true),
    }));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border bg-[#004aaa] p-4">
        <div className="flex items-center gap-3">
          {/* <img src={logo} alt="EduPro" className="h-10 w-10 rounded object-contain" /> */}
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground leading-tight">
                Havilah Schools
              </span>
              <span className="text-[10px] text-white">
               Havilah@gmail.com
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#004aaa] py-2 text-white [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/40 hover:[&::-webkit-scrollbar-thumb]:bg-white/60">
        {nav.map((group) => (
          <SidebarGroup key={group.label}>
            <Collapsible open={collapsed ? false : isGroupOpen(group.label)} onOpenChange={() => toggleGroup(group.label)}>
              <SidebarGroupLabel asChild className="px-2">
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 py-2 text-[10px] uppercase tracking-wider text-white/70 hover:bg-white/12 hover:text-white">
                  <span>{group.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      if ("subItems" in item && item.subItems) {
                        return (
                          <Collapsible key={item.title} asChild className="group/collapsible">
                            <SidebarMenuItem>
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={item.title} className="text-white hover:bg-white/12 hover:text-white data-[active=true]:bg-white data-[active=true]:text-[#004aaa]">
                                  <item.icon className="mr-2 h-4 w-4 shrink-0" />
                                  <span>{item.title}</span>
                                  <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {item.subItems.map((sub) => (
                                    <SidebarMenuSubItem key={sub.title}>
                                      <SidebarMenuSubButton asChild isActive={currentPath === sub.url} className="text-white/80 hover:bg-white/10 hover:text-white data-[active=true]:bg-white data-[active=true]:text-[#004aaa]">
                                        <NavLink to={sub.url}>{sub.title}</NavLink>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuItem>
                          </Collapsible>
                        );
                      }

                      const url = (item as any).url as string;
                      const isExternal = url?.startsWith("http");

                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={currentPath === url} className="text-white hover:bg-white/12 hover:text-white data-[active=true]:bg-white data-[active=true]:text-[#004aaa]">
                            {isExternal ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center rounded-md px-2 py-2 hover:bg-white/12">
                                <item.icon className="mr-2 h-4 w-4 shrink-0" />
                                {!collapsed && <span>{item.title}</span>}
                              </a>
                            ) : (
                              <NavLink to={url} end activeClassName="bg-white text-[#004aaa] font-semibold" className="rounded-md px-2 py-2 hover:bg-white/12">
                                <item.icon className="mr-2 h-4 w-4 shrink-0" />
                                {!collapsed && <span>{item.title}</span>}
                              </NavLink>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-[#004aaa] p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/12 hover:text-white"
          onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
