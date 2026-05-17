import useFetch from "@/hooks/useFetch";
import { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { SessionContext } from "@/contexts/SessionContext";

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSession } = useContext(SessionContext);
  const { data: rawStudent, loading } = useFetch(
    id && currentSession?._id ? `/get-students/${id}/${currentSession._id}` : null
  );

  const student = rawStudent
    ? Array.isArray(rawStudent)
      ? (rawStudent as any[])[0]
      : (rawStudent as Record<string, any>)
    : null;

  const studentName = student?.studentName || student?.username || student?.name || "Student";
  const formatDate = (value?: string) => {
    if (!value) return "Not provided";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const info = [
    { label: "Admission Number", value: student?.AdmNo || "Not provided" },
    { label: "Current Class", value: student?.classname || "Not provided" },
    { label: "Email Address", value: student?.email || "Not provided" },
    { label: "Home Address", value: student?.address || "Not provided" },
    { label: "Parent/Guardian", value: student?.parentsName || student?.parent || "Not provided" },
    { label: "Date of Birth", value: formatDate(student?.birthday || student?.dob) },
    { label: "Phone Number", value: student?.phone || "Not provided" },
  ];

  return (
    <div className="p-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="gap-2 text-black hover:text-primary">
        <ArrowLeft size={18} /> Back to Students
      </Button>

      <div className="flex justify-between items-center max-w-4xl">
        <h2 className="text-primary text-2xl font-bold">Student Profile</h2>
      </div>

      <Card className="max-w-4xl border border-black shadow-sm">
        <CardHeader className="bg-white border-b border-black">
          <CardTitle className="text-primary text-lg font-bold">
            {loading ? "Loading student..." : studentName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {!id || !currentSession?._id ? (
            <p className="text-sm text-black">Student profile is unavailable because the student or session could not be found.</p>
          ) : loading ? (
            <p className="text-sm text-black">Loading student profile...</p>
          ) : !student ? (
            <p className="text-sm text-black">No student record was found for this profile.</p>
          ) : (
            info.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[220px_1fr] items-center border-b border-black pb-4">
                <span className="text-black font-semibold text-xs uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-primary font-bold">{item.value}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
