import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SessionContext } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareText, Send, UploadCloud } from "lucide-react";

export default function StudentHomework() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { currentSession } = useContext(SessionContext);
  const [question, setQuestion] = useState("");
  const [assistantAnswer, setAssistantAnswer] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", subject: "", prompt: "", answerText: "" });
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadSubmissions = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/homework/submissions`, {
        headers: authHeaders(),
        params: { sessionId: currentSession?._id },
      });
      setSubmissions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("loadSubmissions error:", error);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [currentSession?._id]);

  const askAssistant = async () => {
    if (!question.trim()) {
      toast.error("Type your homework question first.");
      return;
    }

    try {
      setAssistantLoading(true);
      const response = await axios.post(
        `${apiUrl}/api/homework/assistant`,
        { question, subject: form.subject },
        { headers: authHeaders() }
      );
      setAssistantAnswer(response.data?.answer || "");
    } catch (error: any) {
      console.error("askAssistant error:", error);
      toast.error(error?.response?.data?.message || "Homework assistant failed.");
    } finally {
      setAssistantLoading(false);
    }
  };

  const submitHomework = async () => {
    if (!currentSession?._id) {
      toast.error("No active session found.");
      return;
    }
    if (!form.title || !form.answerText) {
      toast.error("Homework title and answer are required.");
      return;
    }

    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("subject", form.subject);
      payload.append("prompt", form.prompt);
      payload.append("answerText", form.answerText);
      payload.append("attachmentName", attachmentName);
      payload.append("session", currentSession._id);
      if (attachmentFile) payload.append("attachment", attachmentFile);

      await axios.post(`${apiUrl}/api/homework/submissions`, payload, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      toast.success("Homework submitted successfully.");
      setForm({ title: "", subject: "", prompt: "", answerText: "" });
      setAttachmentName("");
      setAttachmentFile(null);
      loadSubmissions();
    } catch (error: any) {
      console.error("submitHomework error:", error);
      toast.error(error?.response?.data?.message || "Failed to submit homework.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Homework</h2>
        <p className="text-sm text-muted-foreground">
          Ask the AI assistant about your homework, then submit your final answer below.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <MessageSquareText className="h-4 w-4" />
              AI Homework Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Input
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              placeholder="Subject"
              className="border-black"
            />
            <Textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about your homework in plain text..."
              className="min-h-[160px] border-black"
            />
            <Button onClick={askAssistant} disabled={assistantLoading} className="gap-2">
              <Send className="h-4 w-4" />
              {assistantLoading ? "Thinking..." : "Ask Assistant"}
            </Button>
            <div className="rounded-md border border-black bg-white p-4 text-sm whitespace-pre-wrap text-black min-h-[160px]">
              {assistantAnswer || "The AI reply will appear here."}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <UploadCloud className="h-4 w-4" />
              Submit Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Assignment title"
              className="border-black"
            />
            <Textarea
              value={form.prompt}
              onChange={(event) => setForm((prev) => ({ ...prev, prompt: event.target.value }))}
              placeholder="Assignment question or prompt"
              className="min-h-[100px] border-black"
            />
            <Textarea
              value={form.answerText}
              onChange={(event) => setForm((prev) => ({ ...prev, answerText: event.target.value }))}
              placeholder="Write your answer here"
              className="min-h-[180px] border-black"
            />
            <Input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setAttachmentFile(file);
                setAttachmentName(file?.name || "");
              }}
              className="border-black"
            />
            <Button onClick={submitHomework} disabled={saving} className="gap-2">
              <UploadCloud className="h-4 w-4" />
              {saving ? "Submitting..." : "Submit Homework"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-base text-primary">My Homework Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No homework submitted yet.</p>
          ) : (
            submissions.map((submission) => (
              <div key={submission._id} className="rounded-md border border-black bg-white p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-bold text-black">{submission.title}</h3>
                  <span className="text-xs font-medium uppercase text-primary">{submission.status}</span>
                </div>
                <p className="mt-2 text-sm text-black whitespace-pre-wrap">{submission.answerText}</p>
                {submission.attachmentName && (
                  <p className="mt-2 text-sm text-black">
                    <span className="font-bold">Attachment:</span>{" "}
                    {submission.attachmentUrl ? (
                      <a
                        href={`${apiUrl}${submission.attachmentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-primary underline"
                      >
                        {submission.attachmentName}
                      </a>
                    ) : (
                      `${submission.attachmentName} (file path unavailable)`
                    )}
                  </p>
                )}
                {submission.feedback && (
                  <p className="mt-3 text-sm text-black">
                    <span className="font-bold">Teacher feedback:</span> {submission.feedback}
                  </p>
                )}
                {submission.grade && (
                  <p className="mt-2 text-sm font-bold text-primary">Grade: {submission.grade}</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
