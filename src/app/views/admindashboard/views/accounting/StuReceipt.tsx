import React, { useState, useContext, useEffect } from "react";
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
import {
  ReceiptText,
  SendHorizontal,
  Calendar as CalendarIcon,
  Wallet,
  Loader2
} from "lucide-react";
import { SessionContext } from "@/contexts/SessionContext";
import useFetch from "@/hooks/useFetch";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function StudentReceiptForm() {
  const { currentSession } = useContext(SessionContext);
  const { toast } = useToast();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const { data: classes } = useFetch(currentSession ? `/class/${currentSession._id}` : null);
  const [selectedClass, setSelectedClass] = useState("");
  const { data: students } = useFetch(selectedClass && currentSession ? `/student/${selectedClass}/${currentSession._id}` : null);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    date: new Date().toISOString().split("T")[0],
    amount: "0",
    paid: "0",
    reason: "",
    typeOfPayment: "Cash",
    status: "Success",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, val: string) => {
    if (field === "selectedClass") {
      setSelectedClass(val);
    } else {
      setFormData({ ...formData, [field]: val });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession || !selectedClass || !formData.studentName) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const receiptData = {
        ...formData,
        classname: selectedClass,
        sessionId: currentSession._id,
      };
      await axios.post(`${apiUrl}/api/receipt`, receiptData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Success", description: "Receipt created successfully!" });
      navigate("/dashboard/student-payment");
    } catch (err) {
      console.error("Error creating receipt:", err);
      toast({ title: "Error", description: "Failed to create receipt.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className="w-full max-w-4xl shadow-sm">
      <CardHeader className="border-b bg-card">
        <div className="flex items-center gap-2 text-primary">
          <ReceiptText size={20} />
          <CardTitle className="text-lg font-bold">Student Receipt</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {/* Left Section: Student Details */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Class</Label>
                <Select onValueChange={(val) => handleSelectChange("selectedClass", val)} value={selectedClass}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(classes) && classes.map((cls: any) => (
                      <SelectItem key={cls._id} value={cls.name}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-semibold">
                  Name of Student
                </Label>
                <Select onValueChange={(val) => handleSelectChange("studentName", val)} value={formData.studentName} disabled={!selectedClass}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select the Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(students) && students.map((stu: any) => (
                      <SelectItem key={stu._id} value={stu.studentName}>{stu.studentName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-foreground font-semibold">Date</Label>
                <div className="relative">
                  <Input id="date" type="date" value={formData.date} onChange={handleChange} className="pl-10" required />
                  <CalendarIcon
                    className="absolute left-3 top-2.5 text-muted-foreground"
                    size={18}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                  Total School Fees of the student
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground font-medium">
                    ₦
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Section: Payment Details */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="paid" className="text-foreground font-semibold">
                  Total School fees paid
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-muted-foreground font-medium">
                    ₦
                  </span>
                  <Input
                    id="paid"
                    type="number"
                    value={formData.paid}
                    onChange={handleChange}
                    placeholder="Amount Paid"
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-foreground font-semibold">
                  For what (Reason)
                </Label>
                <Input id="reason" value={formData.reason} onChange={handleChange} placeholder="e.g. First Term Tuition" required />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-semibold">
                  Method of payment
                </Label>
                <Select onValueChange={(val) => handleSelectChange("typeOfPayment", val)} value={formData.typeOfPayment}>
                  <SelectTrigger className="bg-white">
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-muted-foreground" />
                      <SelectValue placeholder="Select Method" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Status</Label>
                <Select onValueChange={(val) => handleSelectChange("status", val)} value={formData.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Success">Success</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit"
              disabled={loading}
              className="px-10 gap-2 h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal size={18} />}
              {loading ? "Submitting..." : "Submit Receipt"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
