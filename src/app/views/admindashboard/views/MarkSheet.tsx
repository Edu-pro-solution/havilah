import { useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileBarChart, ArrowLeft } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

const MarkSheet = () => {
  const { id } = useParams<{ id: string }>();
  const { currentSession } = useContext(SessionContext);

  const { data: raw } = useFetch(
    id && currentSession?._id ? `/get-students/${id}/${currentSession._id}` : null
  );
  const student = raw ? (Array.isArray(raw) ? (raw as any[])[0] : raw as any) : null;
  const studentName = student?.studentName || student?.name || "Student";
  const studentClass = student?.classname || "";

  const reportCards = [
    { title: "First Term Report Card",  route: `/dashboard/first_term_report_card/${id}` },
    { title: "Second Term Report Card", route: `/dashboard/term_report_card/${id}` },
    { title: "Third Term Report Card",  route: `/dashboard/third_term_report_card/${id}` },
    { title: "Cumulative Result",        route: `/dashboard/cumulative/${id}` },
  ];

  return (
    <div className="p-6 space-y-6">
      <Link to={-1 as any} className="flex items-center gap-2 text-slate-500 hover:text-[#004aaa] transition-colors">
        <ArrowLeft size={18} /> Back to List
      </Link>

      <header>
        <h2 className="text-2xl font-bold text-[#004aaa]">Academic Marksheet</h2>
        <p className="text-slate-500">
          Student: <span className="font-bold text-[#004aaa]">{studentName}</span>
          {studentClass && <span className="text-slate-400"> · {studentClass}</span>}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {reportCards.map((card) => (
          <Card key={card.title} className="border-none shadow-sm ring-1 ring-slate-200 hover:ring-[#004aaa] transition-all group">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-slate-50 rounded-full text-[#004aaa] group-hover:bg-[#004aaa] group-hover:text-white transition-colors">
                <FileBarChart size={32} />
              </div>
              <h3 className="font-bold text-[#004aaa] text-lg">{card.title}</h3>
              <Link to={card.route} className="w-full">
                <Button className="w-full bg-[#004aaa] hover:bg-[#004aaa]/90">View Report</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MarkSheet;
