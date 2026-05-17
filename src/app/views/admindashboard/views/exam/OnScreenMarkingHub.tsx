import useFetch from "@/hooks/useFetch";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe, HardDriveDownload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OnScreenMarkingHub() {
  useFetch("/sessions");

  const navigate = useNavigate();

  const options = [
    {
      title: "Online Marking",
      description:
        "Directly grade student submissions already synced to the cloud.",
      icon: <Globe className="h-8 w-8 text-blue-600" />,
      path: "/exam/onscreenmarking/online",
      color: "hover:border-blue-500 hover:bg-blue-50/50",
    },
    {
      title: "Offline Marking",
      description:
        "Upload local answer sheet files (PDF/Images) to begin the grading process.",
      icon: <HardDriveDownload className="h-8 w-8 text-orange-600" />,
      path: "/exam/onscreenmarking/offline",
      color: "hover:border-orange-500 hover:bg-orange-50/50",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold text-[#004aaa] sm:text-3xl">On-Screen Marking</h2>
        <p className="text-slate-500">
          Choose your preferred grading environment to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt) => (
          <Card
            key={opt.title}
            className={`cursor-pointer transition-all border-2 border-transparent shadow-sm ${opt.color}`}
            onClick={() => navigate(opt.path)}>
            <CardHeader>
              <div className="mb-4">{opt.icon}</div>
              <CardTitle className="text-[#004aaa]">{opt.title}</CardTitle>
              <CardDescription>{opt.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-semibold text-[#004aaa]">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
