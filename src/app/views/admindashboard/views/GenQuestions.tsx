import { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Loader2, BarChart3, Hash, Save } from "lucide-react";
import { downloadDocx } from "@/lib/docx";

export default function QuestionsGenerator() {
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: classesRaw } = useFetch(currentSession?._id ? `/class/${currentSession._id}` : null);
  const classes = useMemo(() => Array.isArray(classesRaw) ? classesRaw as any[] : [], [classesRaw]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("10");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [lastFilename, setLastFilename] = useState("questions.docx");

  const { data: subjectsRaw } = useFetch(
    selectedClass && currentSession?._id
      ? `/get-subject/${encodeURIComponent(selectedClass)}/${currentSession._id}`
      : null
  );
  const subjects = useMemo(() => Array.isArray(subjectsRaw) ? subjectsRaw as any[] : [], [subjectsRaw]);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const buildFilename = () =>
    `${selectedClass || "class"}-${selectedSubject || "subject"}-${topic || "questions"}.docx`;

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !topic.trim() || !difficulty || !numberOfQuestions) {
      toast.error("Please fill in class, subject, topic, difficulty, and number of questions");
      return;
    }
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : {};
      const currentUser = { ...parsedUser, ...user } as any;

      const res = await axios.post(
        `${apiUrl}/api/generate-gen-question`,
        {
          fullname: currentUser?.name || currentUser?.username || "ClassMark User",
          email: currentUser?.email || "no-email@classmark.local",
          topic,
          difficulty,
          numberOfQuestions: Number(numberOfQuestions),
          field: selectedSubject,
          className: selectedClass,
          subject: selectedSubject,
          preview: true,
        },
        { headers: authHeaders() }
      );
      const qs = Array.isArray(res.data?.questions) ? res.data.questions : [];
      setQuestions(qs);
      setLastFilename(buildFilename());
      toast.success(`${qs.length} question(s) generated`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (questions.length === 0) {
      toast.error("Generate questions first");
      return;
    }

    const body = questions
      .map((q: any, index: number) => {
        const options = Array.isArray(q.options)
          ? q.options.map((option: string, optionIndex: number) => `${String.fromCharCode(65 + optionIndex)}. ${option}`).join("\n")
          : "";
        return [
          `${index + 1}. ${q.questionText || q.text || String(q)}`,
          options,
          q.correctAnswer ? `Answer: ${q.correctAnswer}` : "",
        ].filter(Boolean).join("\n");
      })
      .join("\n\n");

    downloadDocx({
      filename: lastFilename,
      title: `Generated Questions - ${selectedSubject || "Subject"}`,
      content: body,
    });
    toast.success("Questions downloaded successfully");
  };

  return (
    <Card className="w-full border-slate-200 shadow-sm">
      <CardHeader className="border-b bg-slate-50/50 py-4">
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} className="text-[#004aaa]" />
          <CardTitle className="text-lg font-bold text-black">
            Questions Generator
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black">Class</label>
              <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedSubject(""); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (
                    <SelectItem key={c._id} value={String(c.name || "")}>{String(c.name || "—")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black">Subject / Field</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s: any) => (
                    <SelectItem key={s._id} value={String(s.subjectName || s.name || "")}>
                      {String(s.subjectName || s.name || "—")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black">Topic</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Loops & Logic"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1">
                <BarChart3 size={12} /> Difficulty
              </label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1">
              <Hash size={12} /> Number of Questions
            </label>
            <Input
              type="number"
              min={1}
              max={50}
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-end border-b border-black pb-2">
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="gap-2 text-sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit size={14} />}
                Generate
              </Button>
              {questions.length > 0 && (
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  variant="outline"
                  className="text-sm gap-2 border-black text-primary hover:bg-accent">
                  <Save size={14} /> Save
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[250px] w-full bg-muted rounded-lg border-2 border-dashed border-black p-4 overflow-y-auto max-h-[400px]">
            {questions.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center space-y-2 flex-col">
                <p className="font-medium text-black">No questions generated yet.</p>
                <p className="text-xs text-muted-foreground">Fill in the fields above and click Generate.</p>
              </div>
            ) : (
              <ol className="space-y-4">
                {questions.map((q: any, i: number) => (
                  <li key={i} className="text-sm text-black">
                    <p className="font-semibold">{i + 1}. {q.questionText || q.text || String(q)}</p>
                    {q.options && q.options.length > 0 && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {q.options.map((opt: string, j: number) => (
                          <li key={j} className={`text-xs ${opt === q.correctAnswer ? "font-bold text-primary" : "text-black"}`}>
                            {String.fromCharCode(65 + j)}. {opt}
                          </li>
                        ))}
                      </ul>
                    )}
                    {q.correctAnswer && (
                      <p className="mt-1 text-xs font-bold text-primary">Answer: {q.correctAnswer}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
