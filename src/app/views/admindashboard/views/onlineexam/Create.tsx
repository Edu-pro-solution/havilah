import React, { useState, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { SessionContext } from "@/contexts/SessionContext";
import useFetch from "@/hooks/useFetch";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function CreateOnlineExam() {
  const { currentSession } = useContext(SessionContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: classes } = useFetch(currentSession ? `/class/${currentSession._id}` : null);
  const [selectedClass, setSelectedClass] = useState("");
  const { data: subjects } = useFetch(selectedClass && currentSession ? `/get-subject/${selectedClass}/${currentSession._id}` : null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    examTitle: "",
    examDate: "",
    startTime: "",
    endTime: "",
    passPercentage: "40",
    instruction: "",
    subjectName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
  };

  const handleSubjectChange = (val: string) => {
    setFormData({ ...formData, subjectName: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession || !selectedClass || !formData.subjectName) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const dataToSubmit = {
        title: formData.examTitle,
        subject: formData.subjectName,
        date: formData.examDate,
        fromTime: formData.startTime,
        toTime: formData.endTime,
        percent: Number(formData.passPercentage || 0),
        instruction: formData.instruction,
        className: selectedClass,
        sessionId: currentSession._id,
      };
      const token = localStorage.getItem("jwtToken");
      await axios.post(`${apiUrl}/api/create-exam`, dataToSubmit, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      toast({ title: "Success", description: "Online exam created successfully!" });
      setFormData({
        examTitle: "", examDate: "", startTime: "", endTime: "",
        passPercentage: "40", instruction: "", subjectName: ""
      });
      setSelectedClass("");
      navigate("/onlineexam/manage");
    } catch (err) {
      console.error("Error creating exam:", err);
      toast({ title: "Error", description: "Failed to create online exam.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="border-b bg-card">
        <CardTitle className="text-lg font-bold text-foreground">
          Add New Online Exam
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={handleSubmit}>
          {/* Left Column */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="examTitle" className="text-foreground">
                Exam Title
              </Label>
              <Input
                id="examTitle"
                value={formData.examTitle}
                onChange={handleChange}
                placeholder="e.g. Mid-Term Coding"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Select a Class</Label>
              <Select onValueChange={handleClassChange} value={selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(classes) && classes.map((cls: any) => (
                    <SelectItem key={cls._id} value={cls.name}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Select the Subject</Label>
              <Select onValueChange={handleSubjectChange} value={formData.subjectName} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(subjects) && subjects.map((sub: any) => (
                    <SelectItem key={sub._id} value={sub.name}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="examDate" className="text-foreground">Exam Date</Label>
              <div className="relative">
                <Input id="examDate" type="date" value={formData.examDate} onChange={handleChange} className="pl-10" required />
                <CalendarIcon
                  className="absolute left-3 top-2.5 text-muted-foreground"
                  size={18}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-foreground">From</Label>
                <div className="relative">
                  <Input id="startTime" type="time" value={formData.startTime} onChange={handleChange} className="pl-10" required />
                  <Clock
                    className="absolute left-3 top-2.5 text-muted-foreground"
                    size={18}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-foreground">To</Label>
                <div className="relative">
                  <Input id="endTime" type="time" value={formData.endTime} onChange={handleChange} className="pl-10" required />
                  <Clock
                    className="absolute left-3 top-2.5 text-muted-foreground"
                    size={18}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-sm flex justify-between">
                Minimum Percentage for passing (%)
                <span className="text-muted-foreground font-normal italic">
                  Optional
                </span>
              </Label>
              <Input id="passPercentage" type="number" value={formData.passPercentage} onChange={handleChange} min={0} max={100} />
            </div>
          </div>

          {/* Full Width Footer */}
          <div className="md:col-span-2 space-y-2 pt-2">
            <Label htmlFor="instruction" className="text-foreground">Instructions</Label>
            <Textarea
              id="instruction"
              value={formData.instruction}
              onChange={handleChange}
              placeholder="Enter exam rules or guidelines here..."
              className="min-h-[120px] resize-none"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <Button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 h-11 text-base font-medium transition-all gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Add Exam"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
