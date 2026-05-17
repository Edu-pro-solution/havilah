import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ParentDashboard() {
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
        <h2 className="text-2xl font-bold text-primary">Parent Dashboard</h2>
        <p className="text-sm text-muted-foreground">View your wards, their results, materials, and homework activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-base text-primary">Linked Wards</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-3xl font-bold text-black">{wards.length}</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-base text-primary">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 p-6">
            <Button asChild><Link to="/parent/dashboard/results">Ward Results</Link></Button>
            <Button asChild variant="outline"><Link to="/parent/dashboard/materials">Ward Materials</Link></Button>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="border-b bg-muted/40">
            <CardTitle className="text-base text-primary">Homework</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center p-6">
            <Button asChild variant="outline"><Link to="/parent/dashboard/homework">View Homework</Link></Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-base text-primary">My Wards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {wards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No wards linked yet. Link students from the admin parent form.</p>
          ) : (
            wards.map((ward) => (
              <div key={ward._id} className="rounded-md border border-black bg-white p-4">
                <h3 className="font-bold text-black">{ward.studentName || ward.username || ward.name || "Unnamed Student"}</h3>
                <p className="text-sm text-black">
                  {ward.studentName || ward.username || ward.name || "Unnamed Student"} {ward.AdmNo ? `- ${ward.AdmNo}` : ""}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
