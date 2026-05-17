import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SendHorizontal, Pencil } from "lucide-react";
import { SessionContext } from "@/contexts/SessionContext";
import useFetch from "@/hooks/useFetch";

export default function Account() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: rawExams } = useFetch(
    currentSession?._id ? `/getofflineexam/${currentSession._id}` : null
  );
  const exams = Array.isArray(rawExams) ? rawExams as any[] : [];

  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    principalName: "",
    resumptionDate: "",
    signature: null as File | null,
  });

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (!currentSession?._id) return;
    const token = localStorage.getItem("jwtToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // Try loading profile settings for the current session (first term as default)
    axios.get(`${apiUrl}/api/setting`, {
      params: { sessionId: currentSession._id, term: encodeURIComponent("FIRST TERM") },
      headers,
    })
      .then((res) => {
        const d = res.data?.data || res.data;
        if (d) {
          setFormData((prev) => ({
            ...prev,
            name: d.name || "",
            principalName: d.principalName || "",
            resumptionDate: d.resumptionDate ? d.resumptionDate.split("T")[0] : "",
          }));
          if (d.exam) setSelectedExam(String(d.exam));
        }
      })
      .catch(() => {
        // 404 means no setting yet — form starts empty, that's fine
      });
  }, [currentSession]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) { toast.error("No active session found"); return; }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("principalName", formData.principalName);
    payload.append("resumptionDate", formData.resumptionDate);
    payload.append("examName", selectedExam);
    payload.append("session", currentSession._id);
    if (formData.signature) payload.append("signature", formData.signature);

    try {
      setLoading(true);
      await axios.post(`${apiUrl}/api/setting`, payload, {
        headers: authHeaders(),
      });
      toast.success("Profile settings saved successfully");
    } catch {
      toast.error("Failed to save profile settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Pencil className="text-[#004aaa]" size={20} />
        <h1 className="text-[#004aaa] font-bold text-xl">Profile Setting</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[#004aaa]">Principal &amp; Report Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            <div className="space-y-5">
              <div className="space-y-1">
                <Label className="text-[#004aaa] font-medium">Name of School</Label>
                <Input name="name" placeholder="Enter school name" value={formData.name} onChange={handleChange} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-[#004aaa] font-medium">Principal Name</Label>
                <Input name="principalName" placeholder="Enter principal name" value={formData.principalName} onChange={handleChange} className="h-10" />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1">
                <Label className="text-[#004aaa] font-medium">Resumption Date</Label>
                <Input name="resumptionDate" type="date" value={formData.resumptionDate} onChange={handleChange} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label className="text-[#004aaa] font-medium">Select Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((ex: any) => (
                      <SelectItem key={ex._id} value={ex._id}>{ex.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[#004aaa] font-medium">Principal Signature</Label>
                <Input name="signature" type="file" accept="image/*" onChange={handleChange} className="h-10 cursor-pointer text-sm" />
              </div>
            </div>

            <div className="col-span-full pt-2">
              <Button type="submit" disabled={loading} className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2 h-10 px-8">
                <SendHorizontal size={16} />
                {loading ? "Saving..." : "Save Profile Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
