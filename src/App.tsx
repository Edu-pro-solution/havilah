import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { AppLayout } from "@/components/layout/AppLayout";

import Login from "./app/views/Login";
import NotFound from "./app/views/NotFound";
import ForgotPassword from "./app/views/ForgotPassword";

// Admin
import Dashboard from "./app/views/admindashboard/Analytics";
import Admin from "./app/views/admindashboard/views/Admin";
import Inbox from "./app/views/admindashboard/views/Inbox";
import AdmitStudent from "./app/views/admindashboard/views/student/Admit-Student";
import StudentInformation from "./app/views/admindashboard/views/student/Student-Information";
import StudentPromotion from "./app/views/admindashboard/views/student/Student-Promo";
import Category from "./app/views/admindashboard/views/psycho/Category";
import PsychoStudentReport from "./app/views/admindashboard/views/psycho/PsychoStudentReport";
import Teacher from "./app/views/admindashboard/views/Teacher";
import Subject from "./app/views/admindashboard/views/Subject";
import Noticeboard from "./app/views/admindashboard/views/Noticeboard";
import StudentNoticeboard from "./app/views/studentdashboard/views/Noticeboard";
import Parents from "./app/views/admindashboard/views/Parents";
import { AcademicSyllabus } from "./app/views/admindashboard/views/class/AcademicSyllabus";
import ManageClasses from "./app/views/admindashboard/views/class/Manageclass";
import ExamList from "./app/views/admindashboard/views/exam/ExamList";
import ExamGrades from "./app/views/admindashboard/views/exam/ExamGrade";
import ManageMarks from "./app/views/admindashboard/views/exam/ManageMarks";
import TabulationSheet from "./app/views/admindashboard/views/exam/TabulationSheet";
import OnScreenMarkingHub from "./app/views/admindashboard/views/exam/OnScreenMarkingHub";
import MarkingWorkspace from "./app/views/admindashboard/views/exam/MarkingWorkSpace";
import OnScreenMarkingLayout from "./app/views/admindashboard/views/exam/OnScreenMarkingLayout";
import CreateOnlineExam from "./app/views/admindashboard/views/onlineexam/Create";
import ManageOnlineExams from "./app/views/admindashboard/views/onlineexam/Manage";
import CurriculumGenerator from "./app/views/admindashboard/views/CurriculumGen";
import QuestionsGenerator from "./app/views/admindashboard/views/GenQuestions";
import BulkStudentUpload from "./app/views/admindashboard/views/student/BulkUpload";
import StudentIdCard from "./app/views/admindashboard/views/student/StudentIdCard";
import StudentReceiptForm from "./app/views/admindashboard/views/accounting/StuReceipt";
import PaymentHistory from "./app/views/admindashboard/views/accounting/StuPayments";
import ManageStudyMaterial from "./app/views/admindashboard/views/StudyMaterial";
import DailyAttendance from "./app/views/admindashboard/views/DailyAttendance";
import Settings from "./app/views/admindashboard/views/Settings";
import Profile from "./app/views/admindashboard/views/system/Profile";
import Account from "./app/views/admindashboard/views/system/Account";
import MarkSheet from "./app/views/admindashboard/views/MarkSheet";
import StudentProfile from "./app/views/admindashboard/views/StudentProfile";
import ReportCard from "./app/views/admindashboard/views/ReportCard";

// Teacher
import TeacherDashboard from "./app/views/teacherdashboard/Analytics";
import TeacherStudentInformation from "./app/views/teacherdashboard/views/student/Student-Information";
import TeacherSubject from "./app/views/teacherdashboard/views/Subject";
import TeacherExamList from "./app/views/teacherdashboard/views/exam/ExamList";
import TeacherManageMarks from "./app/views/teacherdashboard/views/exam/ManageMarks";
import TeacherTabulationSheet from "./app/views/teacherdashboard/views/exam/TabulationSheet";
import TeacherCreateOnlineExam from "./app/views/teacherdashboard/views/onlineexam/Create";
import TeacherManageOnlineExams from "./app/views/teacherdashboard/views/onlineexam/Manage";
import TeacherPaymentHistory from "./app/views/teacherdashboard/views/accounting/StuPayments";
import TeacherProfile from "./app/views/teacherdashboard/views/system/Profile";

// Student
import StudentDashboard from "./app/views/studentdashboard/Analytics";
import StudentTeacher from "./app/views/studentdashboard/views/Teacher";
import StudentSubject from "./app/views/studentdashboard/views/Subject";
import StudentMyClass from "./app/views/studentdashboard/views/student/MyClass";
import StudentExamList from "./app/views/studentdashboard/views/exam/ExamList";
import StudentManageOnlineExams from "./app/views/studentdashboard/views/onlineexam/Manage";
import StudentPaymentHistory from "./app/views/studentdashboard/views/accounting/PaymentHistory";
import StudentStudyMaterial from "./app/views/studentdashboard/views/StudyMaterial";
import StudentProfilePage from "./app/views/studentdashboard/views/system/Profile";
import StudentMarkSheet from "./app/views/studentdashboard/views/MarkSheet";
import JambPastQuestions from "./app/views/studentdashboard/JambPastQuestions";
import StudentHomework from "./app/views/studentdashboard/views/Homework";
import TeacherHomework from "./app/views/teacherdashboard/views/Homework";
import ParentDashboard from "./app/views/parentdashboard/Analytics";
import ParentResults from "./app/views/parentdashboard/views/Results";
import ParentMaterials from "./app/views/parentdashboard/views/Materials";
import ParentHomework from "./app/views/parentdashboard/views/Homework";
import BulkPrintReports from "./app/views/admindashboard/views/student/BulkPrintReports";

const DashboardWrapper = () => {
  const { user } = useAuth();
  if (user?.role === "teacher") return <TeacherDashboard />;
  if (user?.role === "student") return <StudentDashboard />;
  if (user?.role === "parent") return <ParentDashboard />;
  return <Dashboard />;
};

const StudentMarkSheetRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={`/student_mark_sheet/${user?._id ?? user?.id ?? "unknown"}`} replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SessionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/session/forgot-password" element={<ForgotPassword />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />

              <Route element={<AppLayout />}>
                {/* shared entry */}
                <Route path="/dashboard" element={<DashboardWrapper />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />

                {/* ── Teacher ── */}
                <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/dashboard/student-information/:classId" element={<TeacherStudentInformation />} />
                <Route path="/teacher/dashboard/subject/:classId" element={<TeacherSubject />} />
                <Route path="/teacher/dashboard/examlist" element={<TeacherExamList />} />
                <Route path="/teacher/dashboard/manage-mark-view" element={<TeacherManageMarks />} />
                {/* legacy teacher class redirects */}
                <Route path="/teacher/dashboard/jss1-student_information" element={<Navigate to="/teacher/dashboard/student-information/js1" replace />} />
                <Route path="/teacher/dashboard/jss2-student_information" element={<Navigate to="/teacher/dashboard/student-information/js2" replace />} />
                <Route path="/teacher/dashboard/jss3-student_information" element={<Navigate to="/teacher/dashboard/student-information/js3" replace />} />
                <Route path="/teacher/dashboard/ss1-science-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss1" replace />} />
                <Route path="/teacher/dashboard/ss1-art-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss1" replace />} />
                <Route path="/teacher/dashboard/ss1-commercial-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss1" replace />} />
                <Route path="/teacher/dashboard/ss2-science-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss2" replace />} />
                <Route path="/teacher/dashboard/ss2-art-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss2" replace />} />
                <Route path="/teacher/dashboard/ss2-commercial-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss2" replace />} />
                <Route path="/teacher/dashboard/ss3-science-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss3" replace />} />
                <Route path="/teacher/dashboard/ss3-art-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss3" replace />} />
                <Route path="/teacher/dashboard/ss3-commercial-student_information" element={<Navigate to="/teacher/dashboard/student-information/ss3" replace />} />
                {/* /dashboard/* shared by teacher sidebar */}
                <Route path="/dashboard/subject" element={<TeacherSubject />} />
                <Route path="/dashboard/class" element={<ManageClasses />} />
                <Route path="/dashboard/exam" element={<TeacherExamList />} />
                <Route path="/dashboard/grade" element={<ExamGrades />} />
                <Route path="/dashboard/tabulation-sheet" element={<TeacherTabulationSheet />} />
                <Route path="/dashboard/online-exam" element={<TeacherCreateOnlineExam />} />
                <Route path="/dashboard/manage-online-exam" element={<TeacherManageOnlineExams />} />
                <Route path="/dashboard/student-payment" element={<TeacherPaymentHistory />} />
                <Route path="/dashboard/profile" element={<TeacherProfile />} />

                {/* ── Student ── */}
                <Route path="/student/dashboard/default" element={<StudentDashboard />} />
                <Route path="/student/dashboard/my-class" element={<StudentMyClass />} />
                <Route path="/student/dashboard/teacher" element={<StudentTeacher />} />
                <Route path="/student/dashboard/subject" element={<StudentSubject />} />
                <Route path="/student/dashboard/exam" element={<StudentExamList />} />
                <Route path="/student/dashboard/examlist" element={<StudentExamList />} />
                <Route path="/student/dashboard/online-exam" element={<StudentManageOnlineExams />} />
                <Route path="/student/dashboard/manage-online-exam" element={<StudentManageOnlineExams />} />
                <Route path="/student/dashboard/manage-online-exam/:id" element={<StudentManageOnlineExams />} />
                <Route path="/student/dashboard/manage-online-result" element={<StudentManageOnlineExams />} />
                <Route path="/student/dashboard/jamb-past-questions" element={<JambPastQuestions />} />
                <Route path="/student/dashboard/student_mark_sheet" element={<StudentMarkSheetRedirect />} />
                <Route path="/student/dashboard/student-payment" element={<StudentPaymentHistory />} />
                <Route path="/student/dashboard/student-material" element={<StudentStudyMaterial />} />
                <Route path="/student/dashboard/homework" element={<StudentHomework />} />
                <Route path="/student/dashboard/profile" element={<StudentProfilePage />} />
                <Route path="/student/dashboard/notices" element={<StudentNoticeboard />} />
                <Route path="/dashboard/report_card/:id" element={<StudentMarkSheet />} />

                {/* Parent */}
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                <Route path="/parent/dashboard/results" element={<ParentResults />} />
                <Route path="/parent/dashboard/materials" element={<ParentMaterials />} />
                <Route path="/parent/dashboard/homework" element={<ParentHomework />} />

                {/* ── Admin-only ── */}
                <Route path="/admin" element={<Admin />} />
                <Route path="/bulk-print/:classId/:term" element={<BulkPrintReports />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/student/admit" element={<AdmitStudent />} />
                <Route path="/student/bulk-upload" element={<BulkStudentUpload />} />
                <Route path="/student/information/:classId" element={<StudentInformation />} />
                <Route path="/student/id-card/:id" element={<StudentIdCard />} />
                <Route path="/student/promotion" element={<StudentPromotion />} />
                <Route path="/psycho/category" element={<Category />} />
                <Route path="/psycho/stu-report" element={<PsychoStudentReport />} />
                <Route path="/teacher" element={<Teacher />} />
                <Route path="/subject/:classId" element={<Subject />} />
                <Route path="/notices" element={<Noticeboard />} />
                <Route path="/parents" element={<Parents />} />
                <Route path="/class/manage" element={<ManageClasses />} />
                <Route path="/class/syllabus" element={<AcademicSyllabus />} />
                <Route path="/exam/list" element={<ExamList />} />
                <Route path="/exam/grades" element={<ExamGrades />} />
                <Route path="/exam/manage-marks" element={<ManageMarks />} />
                <Route path="/exam/tabulation" element={<TabulationSheet />} />
                <Route path="/exam/onscreenmarking" element={<OnScreenMarkingLayout />}>
                  <Route index element={<OnScreenMarkingHub />} />
                  <Route path="online" element={<MarkingWorkspace mode="online" />} />
                  <Route path="offline" element={<MarkingWorkspace mode="offline" />} />
                </Route>
                <Route path="/onlineexam/create" element={<CreateOnlineExam />} />
                <Route path="/onlineexam/manage" element={<ManageOnlineExams />} />
                <Route path="/curriculum" element={<CurriculumGenerator />} />
                <Route path="/gen-questions" element={<QuestionsGenerator />} />
                <Route path="/stu-receipt" element={<StudentReceiptForm />} />
                <Route path="/stu-payments" element={<PaymentHistory />} />
                <Route path="/studymaterial" element={<ManageStudyMaterial />} />
                <Route path="/dailyattend" element={<DailyAttendance />} />
                <Route path="/teacher/dashboard/homework" element={<TeacherHomework />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/account" element={<Account />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/student_mark_sheet/:id" element={<MarkSheet />} />
                <Route path="/student_profile/:id" element={<StudentProfile />} />
                <Route path="/dashboard/first_term_report_card/:id" element={<ReportCard termLabel="First Term" />} />
                <Route path="/dashboard/term_report_card/:id" element={<ReportCard termLabel="Second Term" />} />
                <Route path="/dashboard/third_term_report_card/:id" element={<ReportCard termLabel="Third Term" />} />
                <Route path="/dashboard/cumulative/:id" element={<ReportCard termLabel="Cumulative" />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SessionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
