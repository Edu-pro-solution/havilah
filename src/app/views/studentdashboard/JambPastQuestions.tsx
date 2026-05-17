import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const CBT_URL = "https://cbt.edupro.com";

export default function JambPastQuestions() {
  useEffect(() => {
    window.location.href = CBT_URL;
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">JAMB Past Questions</h2>
        <p className="text-sm text-slate-500">
          Redirecting you to the EduPro CBT platform for past questions practice.
        </p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-slate-600">
            If the redirect does not happen automatically, use the button below.
          </p>
          <Button asChild className="gap-2 bg-[#004aaa] hover:bg-[#004aaa]/90">
            <a href={CBT_URL} target="_blank" rel="noopener noreferrer">
              Open EduPro CBT
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
