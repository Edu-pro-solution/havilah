import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { SessionContext } from "@/contexts/SessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TeacherHomework() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { currentSession } = useContext(SessionContext);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, { grade: string; feedback: string }>>({});

  const getAttachmentHref = (submission: any) => {
    if (submission.attachmentUrl) {
      return submission.attachmentUrl.startsWith("http")
        ? submission.attachmentUrl
        : `${apiUrl}${submission.attachmentUrl}`;
    }

    return "";
  };

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/homework/submissions`, {
        headers: authHeaders(),
        params: { sessionId: currentSession?._id },
      });
      setSubmissions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("loadSubmissions error:", error);
      toast.error("Failed to load homework submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [currentSession?._id]);

  const saveGrade = async (id: string) => {
    const payload = grades[id];
    if (!payload?.grade && !payload?.feedback) {
      toast.error("Add a grade or feedback before saving.");
      return;
    }

    try {
      setGradingId(id);
      await axios.patch(
        `${apiUrl}/api/homework/submissions/${id}`,
        { ...payload, status: "graded" },
        { headers: authHeaders() }
      );
      toast.success("Homework graded successfully.");
      loadSubmissions();
    } catch (error) {
      console.error("saveGrade error:", error);
      toast.error("Failed to grade homework.");
    } finally {
      setGradingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Homework Review</h2>
        <p className="text-sm text-muted-foreground">
          Review student submissions, then return a grade and feedback.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-base text-primary">Student Submissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No homework submissions yet.</p>
          ) : (
            submissions.map((submission) => (
              <div key={submission._id} className="space-y-3 rounded-md border border-black bg-white p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-bold text-black">{submission.title}</h3>
                    <p className="text-sm text-black">
                      {submission.studentName} {submission.className ? `- ${submission.className}` : ""}
                    </p>
                  </div>
                  <span className="text-xs uppercase font-medium text-primary">{submission.status}</span>
                </div>

                {submission.prompt && (
                  <p className="text-sm text-black">
                    <span className="font-bold">Prompt:</span> {submission.prompt}
                  </p>
                )}

                <div className="rounded-md border border-black bg-muted/20 p-3 text-sm whitespace-pre-wrap text-black">
                  {submission.answerText}
                </div>

                {submission.attachmentName && (
                  <p className="text-sm text-black">
                    <span className="font-bold">Attachment:</span>{" "}
                    {getAttachmentHref(submission) ? (
                      <a
                        href={getAttachmentHref(submission)}
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

                <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                  <Input
                    value={grades[submission._id]?.grade ?? submission.grade ?? ""}
                    onChange={(event) =>
                      setGrades((prev) => ({
                        ...prev,
                        [submission._id]: {
                          grade: event.target.value,
                          feedback: prev[submission._id]?.feedback ?? submission.feedback ?? "",
                        },
                      }))
                    }
                    placeholder="Grade"
                    className="border-black"
                  />
                  <Textarea
                    value={grades[submission._id]?.feedback ?? submission.feedback ?? ""}
                    onChange={(event) =>
                      setGrades((prev) => ({
                        ...prev,
                        [submission._id]: {
                          grade: prev[submission._id]?.grade ?? submission.grade ?? "",
                          feedback: event.target.value,
                        },
                      }))
                    }
                    placeholder="Teacher feedback"
                    className="min-h-[90px] border-black"
                  />
                  <Button onClick={() => saveGrade(submission._id)} disabled={gradingId === submission._id}>
                    {gradingId === submission._id ? "Saving..." : "Save Grade"}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
