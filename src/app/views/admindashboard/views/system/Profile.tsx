import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormShell } from "@/components/ActionForm";
import { ArrowLeft, UserPen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [view, setView] = useState<"profile" | "edit">("profile");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const getUpdateEndpoint = () => {
    const id = user?._id || user?.id;
    if (!id) return null;
    if (user?.role === "teacher") return `${apiUrl}/api/teachers/${id}`;
    if (user?.role === "student") return `${apiUrl}/api/put-students/${id}`;
    if (user?.role === "parent") return `${apiUrl}/api/parent/${id}`;
    return `${apiUrl}/api/admin/${id}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = getUpdateEndpoint();
    if (!endpoint) { toast.error("Cannot determine update endpoint"); return; }
    setLoading(true);
    try {
      await axios.put(endpoint, {
        username: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      }, { headers: authHeaders() });
      toast.success("Profile updated successfully");
      setView("profile");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const info = [
    { label: "Username / Name", value: form.name },
    { label: "Email Address", value: form.email },
    { label: "Phone Number", value: form.phone },
    { label: "Home Address", value: form.address },
    { label: "Role", value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—" },
  ];

  if (view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => setView("profile")}
          className="text-slate-500 hover:text-[#004aaa] gap-2">
          <ArrowLeft size={16} /> Back to Profile
        </Button>

        <FormShell title="Profile" type="edit" loading={loading} onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Username / Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Email Address</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Phone Number</Label>
            <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="080..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Home Address</Label>
            <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full residential address" />
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end border-b border-slate-200 pb-2">
        <div className="flex gap-8">
          <button className="text-[#004aaa] font-bold pb-2 px-2">About</button>
        </div>
        <Button
          onClick={() => setView("edit")}
          className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2 mb-2 px-6 shadow-md active:scale-95">
          <UserPen size={16} />
          Edit Profile
        </Button>
      </div>

      <div className="max-w-4xl space-y-6">
        <header>
          <h2 className="text-[#004aaa] text-2xl font-extrabold tracking-tight">User Profile</h2>
          <p className="text-slate-500 text-sm">Manage and view your personal information.</p>
        </header>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
            <CardTitle className="text-[#004aaa] text-lg font-bold">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 gap-y-5">
              {info.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[220px_1fr] items-baseline border-b border-slate-50 pb-3 last:border-0">
                  <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider">{item.label}</span>
                  <span className="text-[#004aaa] font-medium text-base">{item.value || "Not set"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
