import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { SessionContext } from "@/contexts/SessionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Download, FolderOpen } from "lucide-react";

type DownloadRecord = {
  _id?: string;
  id?: string;
  date?: string;
  title?: string;
  desc?: string;
  className?: string;
  subject?: string;
  Downloads?: string;
};

const mockDownloads: DownloadRecord[] = [
  {
    id: "d1",
    date: "2026-04-17",
    title: "Mid-Term Assignment",
    desc: "Download the assignment sheet and complete it before next week.",
    className: "JS1",
    subject: "Mathematics",
    Downloads: "#",
  },
];

export default function StudentStudyMaterialPage() {
  const { user } = useAuth();
  const { currentSession } = useContext(SessionContext);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const className = useMemo(() => {
    const enrichedUser = user as Record<string, any> | null;
    return (
      enrichedUser?.classname ||
      enrichedUser?.className ||
      enrichedUser?.class ||
      "JS1"
    );
  }, [user]);

  useEffect(() => {
    const fetchDownloads = async () => {
      if (!currentSession) {
        setDownloads(mockDownloads);
        return;
      }

      setLoading(true);

      try {
        const token = localStorage.getItem("jwtToken");

        if (token === "mock-jwt-token") {
          setDownloads(mockDownloads);
          return;
        }

        const response = await axios.get(
          `${apiUrl}/api/downloaded/${currentSession._id}/${className}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        const records = response.data?.data || response.data || [];
        setDownloads(Array.isArray(records) ? records : []);
      } catch {
        setDownloads(mockDownloads);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [apiUrl, className, currentSession]);

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">Study Material</h2>
        <p className="text-sm text-slate-500">
          Learning resources for {className}.
        </p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#E8EBF3]">
              <TableRow>
                <TableHead className="w-[60px] text-[#004aaa] font-bold pl-6">
                  S/N
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">Date</TableHead>
                <TableHead className="text-[#004aaa] font-bold">Title</TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Description
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold">Class</TableHead>
                <TableHead className="text-[#004aaa] font-bold">
                  Subject
                </TableHead>
                <TableHead className="text-[#004aaa] font-bold text-center">
                  Download
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-slate-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#004aaa] border-t-transparent" />
                      Loading study materials...
                    </div>
                  </TableCell>
                </TableRow>
              ) : downloads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-slate-500">
                      <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <p>No study materials are available yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                downloads.map((item, index) => (
                  <TableRow
                    key={item._id || item.id || index}
                    className="hover:bg-slate-50/50"
                  >
                    <TableCell className="pl-6 font-medium text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-500" />
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : "Not set"}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-[#004aaa]">
                      {item.title || "Untitled Material"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {item.desc || "No description"}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-700">
                      {item.className || className}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {item.subject || "General"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        asChild
                        size="sm"
                        className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2 h-8 px-4"
                      >
                        <a
                          href={item.Downloads || "#"}
                          target="_blank"
                          rel="noreferrer"
                          download
                        >
                          <Download size={14} /> Download
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
