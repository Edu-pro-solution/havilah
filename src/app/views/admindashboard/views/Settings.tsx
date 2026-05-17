import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SendHorizontal, School } from "lucide-react";
import { SessionContext } from "@/contexts/SessionContext";

interface SchoolSettings {
  name: string;
  motto: string;
  address: string;
  phone: string;
  phonetwo: string;
  currency: string;
  email: string;
  sessionStart: string;
  sessionEnd: string;
  schoolLogo: File | null;
}

interface SessionFormState {
  name: string;
  startDate: string;
  endDate: string;
}

export default function Settings() {
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionForm, setSessionForm] = useState<SessionFormState>({
    name: "",
    startDate: "",
    endDate: "",
  });
  const [formData, setFormData] = useState<SchoolSettings>({
    name: "",
    motto: "",
    address: "",
    phone: "",
    phonetwo: "",
    currency: "",
    email: "",
    sessionStart: "",
    sessionEnd: "",
    schoolLogo: null,
  });

  useEffect(() => {
    axios.get(`${apiUrl}/api/account-setting`)
      .then((res) => {
        const d = res.data?.data || res.data;
        if (d) {
          setFormData((prev) => ({
            ...prev,
            name: d.name || "",
            motto: d.motto || "",
            address: d.address || "",
            phone: d.phone || "",
            phonetwo: d.phonetwo || "",
            currency: d.currency || "",
            email: d.email || "",
            sessionStart: d.sessionStart || "",
            sessionEnd: d.sessionEnd || "",
          }));
        }
      })
      .catch(() => {});
  }, [apiUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession?._id) {
      toast.error("No active session found");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("motto", formData.motto);
    payload.append("address", formData.address);
    payload.append("phone", formData.phone);
    payload.append("phonetwo", formData.phonetwo);
    payload.append("currency", formData.currency);
    payload.append("email", formData.email);
    payload.append("sessionStart", formData.sessionStart);
    payload.append("sessionEnd", formData.sessionEnd);
    payload.append("session", currentSession._id);
    if (formData.schoolLogo) payload.append("schoolLogo", formData.schoolLogo);

    try {
      setLoading(true);
      await axios.post(`${apiUrl}/api/account-setting`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("School settings saved successfully");
    } catch {
      toast.error("Failed to save school settings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.name || !sessionForm.startDate || !sessionForm.endDate) {
      toast.error("Fill in session name, start date, and end date.");
      return;
    }

    try {
      setSessionLoading(true);
      await axios.post(`${apiUrl}/api/sessions`, sessionForm);
      toast.success("Session created successfully");
      setSessionForm({ name: "", startDate: "", endDate: "" });
    } catch (error: any) {
      console.error("create session error:", error);
      toast.error(error?.response?.data?.message || "Failed to create session");
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <School className="text-primary" size={22} />
        <h1 className="text-primary font-bold text-xl">System Settings</h1>
      </div>

      <Card className="border-black">
        <CardHeader>
          <CardTitle className="text-base text-primary">School Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
            {/* Left column */}
            <div className="space-y-5">
              <div className="space-y-1">
                <Label className="text-black font-medium">Name of School</Label>
                <Input name="name" placeholder="Enter school name" value={formData.name} onChange={handleChange} className="h-10 border-black" />
              </div>
              <div className="space-y-1">
                <Label className="text-black font-medium">School Motto</Label>
                <Input name="motto" placeholder="Enter school motto" value={formData.motto} onChange={handleChange} className="h-10 border-black" />
              </div>
              <div className="space-y-1">
                <Label className="text-black font-medium">School Address</Label>
                <Input name="address" placeholder="Enter school address" value={formData.address} onChange={handleChange} className="h-10 border-black" />
              </div>
              <div className="space-y-1">
                <Label className="text-black font-medium">Phone Number</Label>
                <Input name="phone" type="tel" placeholder="Primary phone" value={formData.phone} onChange={handleChange} className="h-10 border-black" />
              </div>
              <div className="space-y-1">
                <Label className="text-black font-medium">Additional Phone</Label>
                <Input name="phonetwo" type="tel" placeholder="Secondary phone (optional)" value={formData.phonetwo} onChange={handleChange} className="h-10 border-black" />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div className="space-y-1">
                <Label className="text-black font-medium">Currency</Label>
                <Input name="currency" placeholder="e.g. NGN" value={formData.currency} onChange={handleChange} className="h-10 border-black" />
              </div>
              <div className="space-y-1">
                <Label className="text-black font-medium">School Email</Label>
                <Input name="email" type="email" placeholder="school@example.com" value={formData.email} onChange={handleChange} className="h-10 border-black" />
              </div>
              <div className="space-y-1">
                <Label className="text-black font-medium">Session Start</Label>
                <Input name="sessionStart" placeholder="e.g. 2024" value={formData.sessionStart} onChange={handleChange} className="h-10 border-black" />
              </div>
              <div className="space-y-1">
                <Label className="text-black font-medium">Session End</Label>
                <Input name="sessionEnd" placeholder="e.g. 2025" value={formData.sessionEnd} onChange={handleChange} className="h-10 border-black" />
              </div>
              <div className="space-y-1">
                <Label className="text-black font-medium">School Logo</Label>
                <Input name="schoolLogo" type="file" accept="image/*" onChange={handleChange} className="h-10 cursor-pointer border-black text-sm" />
              </div>
            </div>

            <div className="col-span-full pt-2">
              <Button type="submit" disabled={loading} className="gap-2 h-10 px-8">
                <SendHorizontal size={16} />
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-black">
        <CardHeader>
          <CardTitle className="text-base text-primary">Create Session</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSession} className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-black font-medium">Session Name</Label>
              <Input
                value={sessionForm.name}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. 2026/2027"
                className="border-black"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-black font-medium">Start Date</Label>
              <Input
                type="date"
                value={sessionForm.startDate}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, startDate: event.target.value }))}
                className="border-black"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-black font-medium">End Date</Label>
              <Input
                type="date"
                value={sessionForm.endDate}
                onChange={(event) => setSessionForm((prev) => ({ ...prev, endDate: event.target.value }))}
                className="border-black"
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" disabled={sessionLoading}>
                {sessionLoading ? "Creating..." : "Create Session"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
