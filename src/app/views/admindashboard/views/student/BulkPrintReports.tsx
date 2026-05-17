import { useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

// Map URL param → report card route segment and label
const TERM_MAP: Record<string, { label: string; route: (id: string) => string }> = {
  "first-term":  { label: "First Term Report Card",  route: (id) => `/dashboard/first_term_report_card/${id}` },
  "second-term": { label: "Second Term Report Card", route: (id) => `/dashboard/term_report_card/${id}` },
  "third-term":  { label: "Third Term Report Card",  route: (id) => `/dashboard/third_term_report_card/${id}` },
  "cumulative":  { label: "Cumulative Result",        route: (id) => `/dashboard/cumulative/${id}` },
};

const BulkPrintReports = () => {
  const { classId, term } = useParams<{ classId: string; term: string }>();
  const navigate = useNavigate();
  const { currentSession } = useContext(SessionContext);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const termConfig = TERM_MAP[term || ""] ?? TERM_MAP["first-term"];

  // Fetch all students for this class (same call as StudentInformation)
  const { data, loading } = useFetch(
    currentSession && classId
      ? `/students/${currentSession._id}/${classId.toUpperCase()}`
      : null
  );
  const allStudents: any[] = Array.isArray(data) ? data : [];

  const handleBulkPrint = () => {
    // Collect all iframe document contents and merge into one print window
    const iframes = iframeContainerRef.current?.querySelectorAll("iframe");
    if (!iframes || iframes.length === 0) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Please allow popups for this site to enable bulk printing.");
      return;
    }

    // Collect HTML from all iframes
    let combinedBody = "";
    iframes.forEach((iframe, idx) => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          const bodyHtml = doc.body?.innerHTML || "";
          const styles = Array.from(doc.querySelectorAll("style, link[rel='stylesheet']"))
            .map((el) => el.outerHTML)
            .join("\n");

          if (idx === 0) {
            // Inject styles only once from the first iframe
            combinedBody += `<head>${styles}</head><body>`;
          }
          // Each report card wrapped in a page-break div
          combinedBody += `
            <div style="page-break-after: always; page-break-inside: avoid;">
              ${bodyHtml}
            </div>
          `;
        }
      } catch {
        // Cross-origin iframes won't be readable — use the navigate approach below instead
      }
    });
    combinedBody += "</body>";

    printWindow.document.write(`<!DOCTYPE html><html>${combinedBody}</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-slate-500 text-sm">Loading students for {classId?.toUpperCase()}…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-primary">
              Bulk Print — {termConfig.label}
            </h2>
            <p className="text-sm text-slate-500">
              Class: <span className="font-semibold">{classId?.toUpperCase()}</span>
              {" · "}
              <span className="font-semibold">{allStudents.length}</span> students
            </p>
          </div>
        </div>

        <Button
          onClick={handleBulkPrint}
          disabled={allStudents.length === 0}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Printer size={16} />
          Print All {allStudents.length} Report Cards
        </Button>
      </div>

      {allStudents.length === 0 ? (
        <p className="text-center text-slate-400 py-20">No students found in this class.</p>
      ) : (
        <>
          {/* Preview list */}
          <div className="print:hidden bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
            ⚠️ Each report card will load in a hidden frame below. Wait for all{" "}
            <strong>{allStudents.length}</strong> to finish loading before clicking Print All.
          </div>

          {/* Student name index for reference */}
          <div className="print:hidden grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allStudents.map((student, i) => (
              <div
                key={student._id}
                className="text-xs bg-white border border-slate-200 rounded px-3 py-2 flex items-center gap-2"
              >
                <span className="text-slate-400 w-5 text-right">{i + 1}.</span>
                <span className="font-medium text-slate-700 truncate">{student.studentName}</span>
              </div>
            ))}
          </div>

          {/* Hidden iframe container — each iframe loads one student's report */}
          <div
            ref={iframeContainerRef}
            className="hidden"               // Hidden from view, but iframes still load
            aria-hidden="true"
          >
            {allStudents.map((student) => (
              <iframe
                key={student._id}
                src={termConfig.route(student._id)}
                title={`Report - ${student.studentName}`}
                style={{ width: "210mm", height: "297mm", border: "none" }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BulkPrintReports;