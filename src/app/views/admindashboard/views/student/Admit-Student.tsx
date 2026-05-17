import React, { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { SessionContext } from "@/contexts/SessionContext";
import useFetch from "@/hooks/useFetch";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

function AdmitStudent() {
  const { currentSession } = useContext(SessionContext);
  const { toast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { data: classes } = useFetch(currentSession ? `/class/${currentSession._id}` : null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    classname: "",
    email: "",
    parentsName: "",
    phone: "",
    birthday: "",
    address: "",
    AdmNo: "",
    password: "",
    studentName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (val: string) => {
    setFormData({ ...formData, classname: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) {
      toast({ title: "Error", description: "No active session found.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        role: "student",
        sessionId: currentSession._id,
      };
      await axios.post(`${apiUrl}/api/register`, dataToSubmit);
      toast({ title: "Success", description: "Student admitted successfully!" });
      setFormData({
        username: "", classname: "", email: "", parentsName: "", phone: "",
        birthday: "", address: "", AdmNo: "", password: "", studentName: ""
      });
    } catch (err) {
      console.error("Error admitting student:", err);
      toast({ title: "Error", description: "Failed to admit student.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#004aaa]">
          Admit New Student
        </h2>
        <p className="text-muted-foreground">
          Fill in the details below to register a new student to the system.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={formData.username} onChange={handleChange} placeholder="johndoe123" required />
              </div>

              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="classname">Class</Label>
                <Select onValueChange={handleSelectChange} value={formData.classname}>
                  <SelectTrigger id="classname">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(classes) && classes.map((cls: any) => (
                      <SelectItem key={cls._id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  required
                />
              </div>

              {/* Parent Name */}
              <div className="space-y-2">
                <Label htmlFor="parentsName">Parent Name</Label>
                <Input
                  id="parentsName"
                  value={formData.parentsName}
                  onChange={handleChange}
                  placeholder="Enter parent or guardian name"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+234..." required />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="birthday">Date of Birth</Label>
                <Input id="birthday" type="date" value={formData.birthday} onChange={handleChange} required />
              </div>

              {/* Home Address */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Home Address</Label>
                <Input id="address" value={formData.address} onChange={handleChange} placeholder="123 School Lane, Lagos" required />
              </div>

              {/* Admission No */}
              <div className="space-y-2">
                <Label htmlFor="AdmNo">Admission No</Label>
                <Input id="AdmNo" value={formData.AdmNo} onChange={handleChange} placeholder="ED/2026/001" required />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
              </div>

              {/* Student Name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="studentName">Student Name</Label>
                <Input id="studentName" value={formData.studentName} onChange={handleChange} placeholder="Enter full name" required />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#004aaa] hover:bg-[#004aaa]/90 px-8 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {loading ? "Submitting..." : "Submit Admission"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdmitStudent;
