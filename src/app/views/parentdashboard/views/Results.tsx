import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ParentResults() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    const loadWards = async () => {
      const token = localStorage.getItem("jwtToken");
      const ids = Array.isArray((user as any)?.linkedStudentIds) ? (user as any).linkedStudentIds : [];
      if (!token || ids.length === 0 || !currentSession?._id) return;

      const responses = await Promise.all(
        ids.map((id: string) =>
          axios.get(`${apiUrl}/api/get-students/${id}/${currentSession._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null)
        )
      );

      setWards(
        responses
          .map((response) => {
            const payload = response?.data;
            return Array.isArray(payload) ? payload[0] : payload;
          })
          .filter(Boolean)
      );
    };

    loadWards();
  }, [apiUrl, currentSession?._id, user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Ward Results</h2>
        <p className="text-sm text-muted-foreground">Open the report-card view for each linked ward.</p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-base text-primary">Linked Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {wards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked wards found.</p>
          ) : (
            wards.map((ward) => (
              <div key={ward._id} className="flex flex-col gap-3 rounded-md border border-black bg-white p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-bold text-black">{ward.studentName || ward.username || ward.name || "Unnamed Student"}</h3>
                  <p className="text-sm text-black">
                    {ward.studentName || ward.username || ward.name || "Unnamed Student"} {ward.AdmNo ? `- ${ward.AdmNo}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to={`/dashboard/first_term_report_card/${ward._id}`}>1st Term</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/dashboard/term_report_card/${ward._id}`}>2nd Term</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/dashboard/third_term_report_card/${ward._id}`}>3rd Term</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/dashboard/cumulative/${ward._id}`}>Cumulative</Link>
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
