import { useContext, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
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
import { BookOpen, GraduationCap, ListChecks, Loader2 } from "lucide-react";
import { downloadDocx } from "@/lib/docx";

function renderStyledLessonNote(content: string) {
  return content.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) return <div key={`space-${index}`} className="h-3" />;
    if (trimmed === "---") return <div key={`divider-${index}`} className="my-4 h-px w-full bg-primary/20" />;
    if (trimmed.startsWith("### ")) return <h3 key={index} className="mt-5 text-lg font-bold text-primary">{trimmed.replace(/^###\s+/, "")}</h3>;
    if (trimmed.startsWith("## ")) return <h2 key={index} className="mt-6 text-xl font-bold text-primary">{trimmed.replace(/^##\s+/, "")}</h2>;
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      return <p key={index} className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">{trimmed.replace(/^\*\*|\*\*$/g, "")}</p>;
    }
    if (/^\d+\.\s/.test(trimmed)) return <p key={index} className="pl-4 text-sm leading-7 text-black">{trimmed}</p>;
    if (trimmed.startsWith("*")) return <p key={index} className="pl-4 text-sm leading-7 text-black">{trimmed.replace(/^\*\s*/, "• ")}</p>;
    return <p key={index} className="text-sm leading-7 text-black">{trimmed}</p>;
  });
}

export default function CurriculumGenerator() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: classesRaw } = useFetch(currentSession?._id ? `/class/${currentSession._id}` : null);
  const classes = useMemo(() => Array.isArray(classesRaw) ? classesRaw as any[] : [], [classesRaw]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [lastFilename, setLastFilename] = useState("curriculum.docx");

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
    `${selectedClass || "class"}-${selectedSubject || "subject"}-${topic || "curriculum"}.docx`;

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSubject || !topic.trim()) {
      toast.error("Please fill in class, subject, and topic");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/api/generate-lesson-note`,
        {
          topic,
          className: selectedClass,
          subject: selectedSubject,
          session: currentSession?._id,
          preview: true,
        },
        { headers: authHeaders() }
      );
      const content = res.data?.lessonNoteContent || res.data?.content || JSON.stringify(res.data, null, 2);
      const nextContent = typeof content === "string" ? content : JSON.stringify(content, null, 2);
      setPreview(nextContent);
      setLastFilename(buildFilename());
      toast.success("Preview generated");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to generate curriculum");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!preview) {
      toast.error("Generate the curriculum preview first");
      return;
    }

    downloadDocx({
      filename: lastFilename,
      title: `Curriculum - ${selectedSubject || "Subject"}`,
      content: preview,
    });
    toast.success("Curriculum downloaded successfully");
  };

  return (
    <Card className="w-full border-black shadow-sm">
      <CardHeader className="border-b border-black bg-muted/40 py-4">
        <CardTitle className="text-lg font-bold text-black">
          Curriculum Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex gap-2 items-center text-sm font-medium text-black">
              <GraduationCap size={14} /> Select Class
            </label>
            <Select value={selectedClass} onValueChange={(v) => { setSelectedClass(v); setSelectedSubject(""); }}>
              <SelectTrigger className="border-black bg-white">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c: any) => (
                  <SelectItem key={c._id} value={String(c.name || "")}>{String(c.name || "—")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="flex gap-2 items-center text-sm font-medium text-black">
              <BookOpen size={14} /> Select Subject
            </label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
              <SelectTrigger className="border-black bg-white">
                <SelectValue placeholder="Choose a subject" />
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

        <div className="space-y-2">
          <label className="flex gap-2 items-center text-sm font-medium text-black">
            <ListChecks size={14} /> Topic
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Algebraic Expressions"
            className="border-black bg-white"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="px-8 gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Preview Curriculum
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || !preview}
            variant="outline"
            className="border-black px-8 text-primary hover:bg-accent">
            Save Curriculum
          </Button>
        </div>

        {preview && (
          <div className="mt-4 max-h-[500px] overflow-y-auto rounded-xl border border-black bg-white p-6 shadow-sm">
            <div className="mx-auto max-w-4xl rounded-xl border border-primary/20 bg-gradient-to-b from-white to-primary/5 p-6">
              {renderStyledLessonNote(preview)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
