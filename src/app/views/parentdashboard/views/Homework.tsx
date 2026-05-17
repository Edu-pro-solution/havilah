import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentHomework() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { currentSession } = useContext(SessionContext);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const getAttachmentHref = (submission: any) => {
    if (submission.attachmentUrl) {
      return submission.attachmentUrl.startsWith("http")
        ? submission.attachmentUrl
        : `${apiUrl}${submission.attachmentUrl}`;
    }

    return "";
  };

  useEffect(() => {
    const loadHomework = async () => {
      const token = localStorage.getItem("jwtToken");
      if (!token || !currentSession?._id) return;
      try {
        const response = await axios.get(`${apiUrl}/api/homework/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { sessionId: currentSession._id },
        });
        setSubmissions(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("loadHomework error:", error);
      }
    };

    loadHomework();
  }, [apiUrl, currentSession?._id]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Ward Homework</h2>
        <p className="text-sm text-muted-foreground">View homework submissions and teacher feedback for linked wards.</p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-base text-primary">Homework Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No homework activity yet.</p>
          ) : (
            submissions.map((submission) => (
              <div key={submission._id} className="rounded-md border border-black bg-white p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <h3 className="font-bold text-black">{submission.title}</h3>
                  <span className="text-xs uppercase font-medium text-primary">{submission.status}</span>
                </div>
                <p className="mt-2 text-sm text-black">
                    <span className="font-bold">Ward:</span> {submission.studentName || submission.studentUsername || "Student"}
                  </p>
                {submission.attachmentName && (
                  <p className="mt-2 text-sm text-black">
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
                {submission.feedback && (
                  <p className="mt-2 text-sm text-black">
                    <span className="font-bold">Feedback:</span> {submission.feedback}
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
