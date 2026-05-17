import { useContext, useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/DataTablePagination";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Laptop2, PlayCircle, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

type QuestionOption = { _id?: string; option: string; isCorrect?: boolean };

type ExamQuestion = {
  _id: string;
  questionTitle?: string;
  questionText?: string;
  questionType?: string;
  options?: QuestionOption[];
};

function parseExamDateTime(dateValue?: string, timeValue?: string) {
  if (!dateValue || !timeValue) return null;
  const date = new Date(dateValue);
  const trimmed = timeValue.trim();

  if (trimmed.includes("AM") || trimmed.includes("PM")) {
    const [time, modifier] = trimmed.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    date.setHours(hours, minutes, 0, 0);
  } else {
    const [hours, minutes] = trimmed.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  }

  return date;
}

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function TakeOnlineExam({ exam, onBack }: { exam: any; onBack: () => void }) {
  const { user } = useAuth();
  const { currentSession } = useContext(SessionContext);
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const { data: questionsData, loading } = useFetch(`/questions/${exam._id}`);
  const questions: ExamQuestion[] = useMemo(
    () => (Array.isArray(questionsData) ? questionsData as ExamQuestion[] : []),
    [questionsData]
  );

  const userInfo = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : {};
    return { ...parsed, ...user } as Record<string, any>;
  }, [user]);

  useEffect(() => {
    const start = parseExamDateTime(exam.date, exam.fromTime || exam.startTime);
    const end = parseExamDateTime(exam.date, exam.toTime || exam.endTime);
    if (!start || !end) return;

    const tick = () => {
      const now = new Date();
      if (now < start) {
        setRemainingTime(Math.max(0, Math.floor((start.getTime() - now.getTime()) / 1000)));
        return;
      }
      setRemainingTime(Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000)));
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [exam.date, exam.fromTime, exam.startTime, exam.toTime, exam.endTime]);

  const calcScore = useCallback((qs: ExamQuestion[], ans: Record<string, string>) => {
    return qs.reduce((acc, q) => {
      const chosen = ans[q._id];
      if (!chosen || !Array.isArray(q.options)) return acc;
      const opt = q.options.find((o) => o.option === chosen);
      return acc + (opt?.isCorrect ? 1 : 0);
    }, 0);
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const token = localStorage.getItem("jwtToken");
    const sessionId = currentSession?._id;
    const userId = userInfo._id || userInfo.id;
    const computedScore = calcScore(questions, answers);

    try {
      await axios.post(
        `${apiUrl}/api/exams/submit/${sessionId}`,
        {
          examId: exam._id,
          userId,
          answers,
          score: computedScore,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setScore(computedScore);
      setSubmitted(true);
      toast({ title: "Exam submitted!", description: "Your answers have been recorded." });
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-primary">
          <ArrowLeft size={16} /> Back to Exams
        </Button>
        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={submitting || Object.keys(answers).length === 0 || remainingTime === 0}
            className="gap-2">
            {submitting ? "Submitting..." : "Submit Exam"}
          </Button>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-primary">{exam.title || exam.examTitle || exam.name || "Online Exam"}</h2>
        <p className="text-sm text-muted-foreground">{exam.subject || exam.subjectName} • {questions.length} questions</p>
        {remainingTime !== null ? (
          <p className="mt-2 text-sm font-medium text-foreground">
            {remainingTime > 0 ? `Time remaining: ${formatRemainingTime(remainingTime)}` : "Exam time has ended."}
          </p>
        ) : null}
      </div>

      {submitted && (
        <Card className="border-none bg-primary text-white">
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-black">{score ?? 0}/{questions.length}</p>
            <p className="text-sm mt-1 opacity-80">
              {score !== null ? `${Math.round(((score ?? 0) / questions.length) * 100)}% • ${(score ?? 0) >= questions.length * 0.5 ? "Well done!" : "Keep practising!"}` : "Submitted!"}
            </p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p className="text-center text-muted-foreground py-10">Loading questions…</p>
      ) : questions.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No questions found for this exam.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => {
            const opts: QuestionOption[] = Array.isArray(q.options) ? q.options : [];
            return (
              <Card key={q._id} className="border border-border">
                <CardContent className="p-5 space-y-3">
                  <div className="flex gap-2 items-start">
                    <span className="shrink-0 text-[10px] font-black bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center mt-0.5">{i + 1}</span>
                    <p className="text-sm font-semibold text-foreground">{q.questionTitle || q.questionText || "—"}</p>
                  </div>
                  {opts.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                      {opts.map((opt, oi) => {
                        const optText = opt.option ?? String(opt);
                        return (
                          <button
                            key={oi}
                            disabled={submitted}
                            onClick={() => !submitted && setAnswers((a) => ({ ...a, [q._id]: optText }))}
                            className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                              answers[q._id] === optText
                                ? "border-primary bg-primary/10 font-semibold"
                                : "border-border hover:border-primary/50"
                            }`}>
                            {optText}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {q.questionType === "theory" && !submitted && (
                    <textarea
                      className="w-full ml-7 mt-1 text-sm border border-border rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      rows={3}
                      placeholder="Type your answer here…"
                      value={answers[q._id] || ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q._id]: e.target.value }))}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentManageOnlineExams() {
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const className = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : {};
    const merged = { ...parsed, ...user } as any;
    return String(merged?.classname || merged?.className || merged?.class || "");
  }, [user]);

  const { data, loading } = useFetch(
    currentSession?._id && className ? `/get-exams-by-class/${className}/${currentSession._id}` : null
  );

  const exams = useMemo(() => (Array.isArray(data) ? data as any[] : []), [data]);

  useEffect(() => {
    if (!id || !exams.length) return;
    const match = exams.find((entry: any) => String(entry._id) === String(id));
    if (match) setSelectedExam(match);
  }, [id, exams]);

  const canTakeExam = (exam: any) => {
    const submittedAnswers = Array.isArray(exam.submittedAnswers) ? exam.submittedAnswers : [];
    const userId = String(user?._id || user?.id || "");
    const hasTaken = submittedAnswers.some((answer: any) => String(answer.userId) === userId);
    if (hasTaken) return { allowed: false, reason: "Already submitted" };

    const start = parseExamDateTime(exam.date, exam.fromTime || exam.startTime);
    const end = parseExamDateTime(exam.date, exam.toTime || exam.endTime);
    if (!start || !end) return { allowed: true, reason: "" };

    const now = new Date();
    if (now < start) return { allowed: false, reason: "Not started" };
    if (now > end) return { allowed: false, reason: "Closed" };
    return { allowed: true, reason: "" };
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const current = exams.slice(indexOfFirst, indexOfLast);

  if (selectedExam) {
    return <TakeOnlineExam exam={selectedExam} onBack={() => { setSelectedExam(null); navigate("/student/dashboard/manage-online-exam"); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Laptop2 className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-primary">Online Exams</h2>
          <p className="text-sm text-muted-foreground">Available exams for your class</p>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-primary/10">
              <TableRow>
                <TableHead className="pl-6 w-[60px] font-bold text-primary">S/N</TableHead>
                <TableHead className="font-bold text-primary">Exam Name</TableHead>
                <TableHead className="font-bold text-primary">Subject</TableHead>
                <TableHead className="font-bold text-primary">Date</TableHead>
                <TableHead className="font-bold text-primary">Time</TableHead>
                <TableHead className="font-bold text-primary text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading exams…</TableCell>
                </TableRow>
              ) : current.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No online exams available.</TableCell>
                </TableRow>
              ) : current.map((exam: any, i) => {
                const access = canTakeExam(exam);
                return (
                  <TableRow key={exam._id || i} className="hover:bg-muted/50">
                    <TableCell className="pl-6 text-muted-foreground">{indexOfFirst + i + 1}</TableCell>
                    <TableCell className="font-bold text-primary">{exam.title || exam.examTitle || exam.name || "—"}</TableCell>
                    <TableCell className="text-foreground">{exam.subject || exam.subjectName || "—"}</TableCell>
                    <TableCell className="text-foreground text-sm">
                      {exam.date ? new Date(exam.date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-foreground text-sm">
                      {[exam.startTime || exam.fromTime, exam.endTime || exam.toTime].filter(Boolean).join(" - ") || "—"}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="sm"
                        disabled={!access.allowed}
                        onClick={() => {
                          setSelectedExam(exam);
                          navigate(`/student/dashboard/manage-online-exam/${exam._id}`);
                        }}
                        className="gap-1.5">
                        <PlayCircle size={14} />
                        {access.allowed ? "Take Exam" : access.reason}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {exams.length > itemsPerPage && (
            <div className="border-t px-4">
              <DataTablePagination
                totalItems={exams.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
