// /**
//  * Shared printable report card — used by all three term pages.
//  * termLabel: "First Term" | "Second Term" | "Third Term" | "Cumulative"
//  */
// import { useContext, useEffect, useRef, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "axios";
// import { useReactToPrint } from "react-to-print";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Printer } from "lucide-react";
// import { SessionContext } from "@/contexts/SessionContext";

// interface Score {
//   subjectName?: string;
//   subject?: string;
//   examName?: string;
//   examId?: { name?: string };
//   testscore?: number;
//   examscore?: number;
//   marksObtained?: number;
//   firstTest?: number;
//   secondTest?: number;
//   examScore?: number;
//   total?: number;
//   grade?: string;
//   comment?: string;
// }

// interface StudentInfo {
//   studentName?: string;
//   name?: string;
//   classname?: string;
//   AdmNo?: string;
//   gender?: string;
// }

// interface SchoolSettings {
//   name?: string;
//   motto?: string;
//   address?: string;
//   phone?: string;
//   schoolLogo?: string;
//   email?: string;
// }

// interface ProfileSettings {
//   principalName?: string;
//   resumptionDate?: string;
//   signature?: string;
// }

// interface PsyData {
//   instruction: number;
//   independently: number;
//   punctuality: number;
//   talking: number;
//   eyecontact: number;
//   remarks: string;
//   premarks: string;
// }

// type CumulativeRow = {
//   subject: string;
//   first: number;
//   second: number;
//   third: number;
//   total: number;
//   average: number;
//   grade: string;
//   remark: string;
// };

// function buildCumulativeRows(scores: Score[]): CumulativeRow[] {
//   const subjectMap: Record<
//     string,
//     { first: number; second: number; third: number }
//   > = {};

//   scores.forEach((s) => {
//     const subject = String(s.subjectName || s.subject || "Unknown");
//     const examLabel = String(s.examName || s.examId?.name || "").toLowerCase();
//     const test = Number(s.testscore ?? s.firstTest ?? 0);
//     const exam = Number(s.examscore ?? s.examScore ?? 0);
//     const total = Number(s.marksObtained ?? s.total) || test + exam;

//     if (!subjectMap[subject]) {
//       subjectMap[subject] = { first: 0, second: 0, third: 0 };
//     }

//     if (examLabel.includes("first")) subjectMap[subject].first = total;
//     else if (examLabel.includes("second")) subjectMap[subject].second = total;
//     else if (examLabel.includes("third")) subjectMap[subject].third = total;
//   });

//   return Object.entries(subjectMap)
//     .map(([subject, t]) => {
//       const total = t.first + t.second + t.third;
//       const termCount =
//         [t.first, t.second, t.third].filter((n) => n > 0).length || 1;
//       const average = Math.round(total / termCount);
//       const { grade, comment } = deriveGrade(average);
//       return {
//         subject,
//         first: t.first,
//         second: t.second,
//         third: t.third,
//         total,
//         average,
//         grade,
//         remark: comment,
//       };
//     })
//     .sort((a, b) => a.subject.localeCompare(b.subject));
// }

// const psyRating = (n: number) => {
//   const map: Record<number, string> = {
//     0: "N/A",
//     1: "Poor",
//     2: "Fair",
//     3: "Good",
//     4: "Very Good",
//     5: "Excellent",
//   };
//   return map[n] ?? String(n);
// };

// const gradeColor = (g: string) => {
//   if (!g) return "";
//   const upper = g.toUpperCase();
//   if (upper === "A") return "text-green-600 font-bold";
//   if (upper === "B") return "text-blue-600 font-bold";
//   if (upper === "C") return "text-yellow-600 font-bold";
//   return "text-red-500 font-bold";
// };

// function deriveGrade(total: number): { grade: string; comment: string } {
//   if (total >= 70) return { grade: "A", comment: "Excellent" };
//   if (total >= 60) return { grade: "B", comment: "Very Good" };
//   if (total >= 50) return { grade: "C", comment: "Good" };
//   if (total >= 45) return { grade: "D", comment: "Fairly Good" };
//   if (total >= 40) return { grade: "E", comment: "Pass" };
//   return { grade: "F", comment: "Fail" };
// }

// interface Props {
//   termLabel: string;
// }

// export default function ReportCard({ termLabel }: Props) {
//   const { id } = useParams<{ id: string }>();
//   const { currentSession } = useContext(SessionContext);
//   const printRef = useRef<HTMLDivElement>(null);

//   const [student, setStudent] = useState<StudentInfo | null>(null);
//   const [scores, setScores] = useState<Score[]>([]);
//   const [school, setSchool] = useState<SchoolSettings>({});
//   const [profile, setProfile] = useState<ProfileSettings>({});
//   const [psyData, setPsyData] = useState<PsyData | null>(null);
//   const [loading, setLoading] = useState(true);

//   const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
//   const token = localStorage.getItem("jwtToken");
//   const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

//   // ── Derived state (must come before any early return) ──────────────────────
//   const isCumulative = termLabel.toLowerCase() === "cumulative";
//   const cumulativeRows = isCumulative ? buildCumulativeRows(scores) : [];

//   const tableHeaders = isCumulative
//     ? [
//         "Subject",
//         "1st Term",
//         "2nd Term",
//         "3rd Term",
//         "Total",
//         "Average",
//         "Grade",
//       ]
//     : ["Subject", "Test", "Exam", "Total", "Grade", "Remark"];

//   const colSpan = tableHeaders.length;

//   const totalAll = isCumulative
//     ? cumulativeRows.reduce((s, r) => s + r.average, 0)
//     : scores.reduce((s, r) => {
//         const t =
//           Number(r.marksObtained ?? r.total) ||
//           Number(r.testscore ?? r.firstTest ?? 0) +
//             Number(r.examscore ?? r.examScore ?? 0);
//         return s + t;
//       }, 0);

//   const avg = isCumulative
//     ? cumulativeRows.length
//       ? Math.round(totalAll / cumulativeRows.length)
//       : 0
//     : scores.length
//       ? Math.round(totalAll / scores.length)
//       : 0;

//   // ── Data fetching ──────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!id || !currentSession?._id) return;
//     setLoading(true);

//     const termKeyword = termLabel.split(" ")[0].toLowerCase();

//     axios
//       .get(`${apiUrl}/api/getofflineexam/${currentSession._id}`, {
//         headers: authHeaders,
//       })
//       .then((examRes) => {
//         const exams: any[] = Array.isArray(examRes.data) ? examRes.data : [];
//         const matchedExam = exams.find((e: any) =>
//           (e.name || "").toLowerCase().includes(termKeyword),
//         );
//         const profileTerm =
//           termLabel.toLowerCase() === "cumulative"
//             ? "THIRD TERM"
//             : termLabel.toUpperCase();

//         return Promise.allSettled([
//           axios.get(`${apiUrl}/api/get-students/${id}/${currentSession._id}`, {
//             headers: authHeaders,
//           }),
//           axios.get(
//             `${apiUrl}/api/get-scores-by-student/${id}/${currentSession._id}`,
//             { headers: authHeaders },
//           ),
//           axios.get(`${apiUrl}/api/account-setting`, { headers: authHeaders }),
//           axios.get(`${apiUrl}/api/setting`, {
//             params: {
//               sessionId: currentSession._id,
//               term: encodeURIComponent(profileTerm),
//             },
//             headers: authHeaders,
//           }),
//           matchedExam
//             ? axios.get(`${apiUrl}/api/get-all-psy/${matchedExam._id}`, {
//                 headers: authHeaders,
//               })
//             : Promise.resolve({ data: { scores: [] } }),
//         ]);
//       })
//       .then(([stuRes, scoresRes, schoolRes, profileRes, psyRes]) => {
//         if (stuRes.status === "fulfilled") {
//           const d = stuRes.value.data?.data || stuRes.value.data;
//           setStudent(Array.isArray(d) ? d[0] : d);
//         }

//         if (scoresRes.status === "fulfilled") {
//           const resData = scoresRes.value.data;
//           const raw = resData?.scores ?? resData?.data ?? resData;
//           const list: Score[] = Array.isArray(raw) ? raw : [];
//           // For cumulative we keep ALL scores; for a specific term we filter
//           const filtered = isCumulative
//             ? list
//             : list.filter((s) => {
//                 const label = String(
//                   s.examName || s.examId?.name || "",
//                 ).toLowerCase();
//                 return !label || label.includes(termKeyword);
//               });
//           setScores(filtered);
//         }

//         if (schoolRes.status === "fulfilled") {
//           const d = schoolRes.value.data?.data || schoolRes.value.data;
//           const raw: any = Array.isArray(d) ? (d[0] ?? {}) : (d ?? {});
//           const logoRaw = raw.schoolLogo || raw.logo || raw.logoUrl || "";
//           const logoFull =
//             logoRaw && !logoRaw.startsWith("http")
//               ? `${apiUrl}/${logoRaw.replace(/^\//, "")}`
//               : logoRaw;
//           setSchool({ ...raw, schoolLogo: logoFull });
//         }

//         if (profileRes.status === "fulfilled") {
//           const d = profileRes.value.data?.data || profileRes.value.data;
//           const raw: any = Array.isArray(d) ? (d[0] ?? {}) : (d ?? {});
//           const signatureRaw = raw.signature || "";
//           const signatureFull =
//             signatureRaw && !signatureRaw.startsWith("http")
//               ? `${apiUrl}/${signatureRaw.replace(/^\//, "")}`
//               : signatureRaw;
//           setProfile({ ...raw, signature: signatureFull });
//         }

//         if (psyRes.status === "fulfilled") {
//           const psyScores: any[] = psyRes.value.data?.scores || [];
//           const found = psyScores.find(
//             (m: any) => String(m.studentId?._id || m.studentId) === String(id),
//           );
//           if (found) setPsyData(found);
//         }
//       })
//       .catch(() => {
//         /* silent — partial failure is OK */
//       })
//       .finally(() => setLoading(false));
//   }, [apiUrl, currentSession, id, termLabel]);

//   const handlePrint = useReactToPrint({ contentRef: printRef });

//   // ── Early return after all hooks ───────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
//       </div>
//     );
//   }

//   const hasRows = isCumulative ? cumulativeRows.length > 0 : scores.length > 0;

//   return (
//     <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between dont-print">
//         <Link
//           to={-1 as any}
//           className="flex items-center gap-2 text-muted-foreground hover:text-primary">
//           <ArrowLeft size={18} /> Back
//         </Link>
//         <Button onClick={() => handlePrint()} className="gap-2">
//           <Printer size={16} /> Print
//         </Button>
//       </div>

//       {/* Printable area */}
//       <div
//         ref={printRef}
//         className="printable-area bg-white border border-border rounded-lg p-6 print:p-4 print:border-none space-y-4">
//         {/* School header */}
//         <div className="text-center space-y-1 border-b pb-4">
//           {school.schoolLogo && (
//             <img
//               src={school.schoolLogo}
//               alt="School Logo"
//               className="h-16 w-16 object-contain mx-auto mb-2"
//             />
//           )}
//           <h1 className="text-xl font-black text-primary uppercase">
//             {school.name || "School Name"}
//           </h1>
//           <p className="text-xs text-muted-foreground italic">{school.motto}</p>
//           <p className="text-xs text-muted-foreground">{school.address}</p>
//           {school.phone && (
//             <p className="text-xs text-muted-foreground">Tel: {school.phone}</p>
//           )}
//           <div className="mt-2 inline-block bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
//             {termLabel} Report Card
//           </div>
//         </div>

//         {/* Student info grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-b pb-4">
//           {[
//             ["Name", student?.studentName || student?.name || "—"],
//             ["Class", student?.classname || "—"],
//             ["Adm. No.", student?.AdmNo || "—"],
//             ["Gender", student?.gender || "—"],
//             ["Session", currentSession?.name || "—"],
//             ["Term", termLabel],
//           ].map(([label, value]) => (
//             <div key={label} className="space-y-0.5">
//               <p className="text-[10px] text-muted-foreground uppercase font-bold">
//                 {label}
//               </p>
//               <p className="font-semibold text-primary">{value}</p>
//             </div>
//           ))}
//         </div>

//         {/* Scores table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-xs border-collapse">
//             <thead>
//               <tr className="bg-primary text-primary-foreground">
//                 {tableHeaders.map((h) => (
//                   <th key={h} className="px-2 py-2 text-left whitespace-nowrap">
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {!hasRows ? (
//                 <tr>
//                   <td
//                     colSpan={colSpan}
//                     className="text-center py-6 text-muted-foreground">
//                     No scores found for this term
//                   </td>
//                 </tr>
//               ) : isCumulative ? (
//                 cumulativeRows.map((row, i) => (
//                   <tr
//                     key={i}
//                     className={i % 2 === 0 ? "bg-muted/20" : "bg-white"}>
//                     <td className="px-2 py-1.5 font-medium">{row.subject}</td>
//                     <td className="px-2 py-1.5 text-center">
//                       {row.first || "—"}
//                     </td>
//                     <td className="px-2 py-1.5 text-center">
//                       {row.second || "—"}
//                     </td>
//                     <td className="px-2 py-1.5 text-center">
//                       {row.third || "—"}
//                     </td>
//                     <td className="px-2 py-1.5 text-center font-bold">
//                       {row.total}
//                     </td>
//                     <td className="px-2 py-1.5 text-center font-bold">
//                       {row.average}
//                     </td>
//                     <td
//                       className={`px-2 py-1.5 text-center ${gradeColor(row.grade)}`}>
//                       {row.grade}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 scores.map((s, i) => {
//                   const test = Number(s.testscore ?? s.firstTest ?? 0);
//                   const exam = Number(s.examscore ?? s.examScore ?? 0);
//                   const total =
//                     Number(s.marksObtained ?? s.total) || test + exam;
//                   const { grade, comment } = deriveGrade(total);
//                   return (
//                     <tr
//                       key={i}
//                       className={i % 2 === 0 ? "bg-muted/20" : "bg-white"}>
//                       <td className="px-2 py-1.5 font-medium">
//                         {s.subjectName || s.subject || "—"}
//                       </td>
//                       <td className="px-2 py-1.5 text-center">{test}</td>
//                       <td className="px-2 py-1.5 text-center">{exam}</td>
//                       <td className="px-2 py-1.5 text-center font-bold">
//                         {total}
//                       </td>
//                       <td
//                         className={`px-2 py-1.5 text-center ${gradeColor(s.grade || grade)}`}>
//                         {s.grade || grade}
//                       </td>
//                       <td className="px-2 py-1.5 text-center">
//                         {s.comment || comment}
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//             {hasRows && (
//               <tfoot>
//                 <tr className="bg-primary/10 font-bold">
//                   <td className="px-2 py-2" colSpan={isCumulative ? 5 : 3}>
//                     Average
//                   </td>
//                   <td className="px-2 py-2 text-center">{avg}</td>
//                   <td
//                     className={`px-2 py-2 text-center ${gradeColor(deriveGrade(avg).grade)}`}>
//                     {deriveGrade(avg).grade}
//                   </td>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>

//         {/* Psychomotor / Affective Report */}
//         {psyData && (
//           <div className="mt-4 pt-4 border-t">
//             <h3 className="text-xs font-bold text-primary uppercase mb-2">
//               Affective &amp; Psychomotor Report
//             </h3>
//             <table className="w-full text-xs border-collapse">
//               <thead>
//                 <tr className="bg-primary text-primary-foreground">
//                   <th className="px-2 py-1.5 text-left">Trait</th>
//                   <th className="px-2 py-1.5 text-center">Score (0–5)</th>
//                   <th className="px-2 py-1.5 text-left">Rating</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {(
//                   [
//                     ["Following Instruction", psyData.instruction],
//                     ["Working Independently", psyData.independently],
//                     ["Punctuality", psyData.punctuality],
//                     ["Talking", psyData.talking],
//                     ["Eye Contact", psyData.eyecontact],
//                   ] as [string, number][]
//                 ).map(([label, val], i) => (
//                   <tr
//                     key={label}
//                     className={i % 2 === 0 ? "bg-muted/40" : "bg-white"}>
//                     <td className="px-2 py-1.5 font-medium">{label}</td>
//                     <td className="px-2 py-1.5 text-center">{val}</td>
//                     <td className="px-2 py-1.5">{psyRating(val)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//             {(psyData.remarks || psyData.premarks) && (
//               <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
//                 {psyData.remarks && (
//                   <div>
//                     <span className="font-bold text-primary">
//                       Teacher's Remark:{" "}
//                     </span>
//                     {psyData.remarks}
//                   </div>
//                 )}
//                 {psyData.premarks && (
//                   <div>
//                     <span className="font-bold text-primary">
//                       Principal's Remark:{" "}
//                     </span>
//                     {psyData.premarks}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Signatures */}
//         <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t text-xs text-center">
//           <div className="space-y-8">
//             <div className="border-b border-border" />
//             <p className="text-muted-foreground">Class Teacher</p>
//           </div>
//           <div className="space-y-8">
//             {profile.signature ? (
//               <img
//                 src={profile.signature}
//                 alt="Principal Signature"
//                 className="h-10 object-contain mx-auto"
//               />
//             ) : (
//               <div className="h-10" />
//             )}
//             <div className="border-b border-border" />
//             <p className="text-muted-foreground">
//               Principal: {profile.principalName || "—"}
//             </p>
//           </div>
//           <div className="space-y-8">
//             <div className="border-b border-border" />
//             <p className="text-muted-foreground">Head Teacher</p>
//           </div>
//         </div>

//         {profile.resumptionDate && (
//           <p className="text-xs text-center text-muted-foreground mt-2">
//             Next Resumption:{" "}
//             <span className="font-semibold">
//               {new Date(profile.resumptionDate).toLocaleDateString()}
//             </span>
//           </p>
//         )}
//       </div>
//     </div>
//   );
// }

/**
 * Shared printable report card — used by all three term pages.
 * termLabel: "First Term" | "Second Term" | "Third Term" | "Cumulative"
 */

/**
 * Shared printable report card — used by all three term pages.
 * termLabel: "First Term" | "Second Term" | "Third Term" | "Cumulative"
 */
/**
 * Shared printable report card — used by all three term pages.
 * termLabel: "First Term" | "Second Term" | "Third Term" | "Cumulative"
 *
 * Improvements modelled on Perfect Angels PDF:
 *  - Correct Average Percentage  (obtained / obtainable × 100)
 *  - Total Score Obtainable / Obtained
 *  - No. in Class + Position
 *  - Keys to Grade Rating bar
 *  - Affective Traits checkmark table (1-5)
 *  - Psychomotor Skills checkmark table (1-5)
 *  - Keys to Psychomotor Rating
 *  - Attendance section
 *  - Term Dates section
 */
import { useContext, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { SessionContext } from "@/contexts/SessionContext";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Score {
  subjectName?: string;
  subject?: string;
  examName?: string;
  examId?: { name?: string };
  testscore?: number;
  examscore?: number;
  marksObtained?: number;
  firstTest?: number;
  secondTest?: number;
  examScore?: number;
  total?: number;
  grade?: string;
  comment?: string;
}

interface StudentInfo {
  studentName?: string;
  name?: string;
  classname?: string;
  AdmNo?: string;
  gender?: string;
  dob?: string;
}

interface SchoolSettings {
  name?: string;
  motto?: string;
  address?: string;
  phone?: string;
  schoolLogo?: string;
  email?: string;
}

interface ProfileSettings {
  principalName?: string;
  resumptionDate?: string;
  nextTermBegins?: string;
  termBegins?: string;
  termEnds?: string;
  signature?: string;
}

interface PsyData {
  // Affective traits
  attentiveness?: number;
  attitudeToWork?: number;
  cooperation?: number;
  emotionStability?: number;
  leadership?: number;
  attendance?: number;
  neatness?: number;
  perseverance?: number;
  politeness?: number;
  punctuality?: number;
  speakingWriting?: number;
  organisationAbility?: number;
  relationshipWithOthers?: number;
  // Psychomotor
  handlingOfTools?: number;
  handwriting?: number;
  verbalFluency?: number;
  processingSpeed?: number;
  retentiveness?: number;
  // legacy flat fields (original schema fallbacks)
  instruction?: number;
  independently?: number;
  talking?: number;
  eyecontact?: number;
  // remarks
  remarks?: string;
  premarks?: string;
}

type SubjectTermTotals = { first: number; second: number; third: number };

type CumulativeRow = {
  subject: string;
  first: number;
  second: number;
  third: number;
  total: number;
  average: number;
  grade: string;
  remark: string;
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function buildCumulativeRows(scores: Score[]): CumulativeRow[] {
  const subjectMap: Record<string, SubjectTermTotals> = {};

  scores.forEach((s) => {
    const subject   = String(s.subjectName || s.subject || "Unknown");
    const examLabel = String(s.examName || s.examId?.name || "").toLowerCase();
    const test      = Number(s.testscore ?? s.firstTest ?? 0);
    const exam      = Number(s.examscore ?? s.examScore ?? 0);
    const total     = Number(s.marksObtained ?? s.total) || test + exam;

    if (!subjectMap[subject]) subjectMap[subject] = { first: 0, second: 0, third: 0 };
    if (examLabel.includes("first"))       subjectMap[subject].first  = total;
    else if (examLabel.includes("second")) subjectMap[subject].second = total;
    else if (examLabel.includes("third"))  subjectMap[subject].third  = total;
  });

  return Object.entries(subjectMap)
    .map(([subject, t]) => {
      const total     = t.first + t.second + t.third;
      const termCount = [t.first, t.second, t.third].filter((n) => n > 0).length || 1;
      const average   = Math.round(total / termCount);
      const { grade, comment } = deriveGrade(average);
      return { subject, first: t.first, second: t.second, third: t.third, total, average, grade, remark: comment };
    })
    .sort((a, b) => a.subject.localeCompare(b.subject));
}

function deriveGrade(pct: number): { grade: string; comment: string } {
  if (pct >= 95) return { grade: "A+", comment: "Outstanding"    };
  if (pct >= 85) return { grade: "A",  comment: "Excellent"      };
  if (pct >= 75) return { grade: "B",  comment: "Very Good"      };
  if (pct >= 60) return { grade: "C",  comment: "Good"           };
  if (pct >= 50) return { grade: "D",  comment: "Average"        };
  if (pct >= 40) return { grade: "E",  comment: "Below Average"  };
  return              { grade: "F",  comment: "Poor / Fail"    };
}

function ordinal(n: number): string {
  if (n <= 0) return "—";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const gradeColor = (g: string): string => {
  if (!g) return "";
  const u = g.toUpperCase();
  if (u === "A+" || u === "A") return "text-green-700 font-bold";
  if (u === "B")  return "text-blue-600 font-bold";
  if (u === "C")  return "text-yellow-600 font-bold";
  return "text-red-500 font-bold";
};

/** Single row in the affective / psychomotor checkmark tables */
const RatingRow = ({ label, value, max = 5 }: { label: string; value?: number; max?: number }) => (
  <tr className="border-b border-gray-100 last:border-0">
    <td className="py-0.5 px-2 text-[10px] font-medium">{label}</td>
    {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
      <td key={n} className="py-0.5 px-1 text-center text-[10px] w-6">
        {value === n ? "✓" : ""}
      </td>
    ))}
  </tr>
);

// Keys to grade rating
const GRADE_KEYS = [
  { range: "100–95", label: "Outstanding",   grade: "A+" },
  { range: "94–85",  label: "Excellent",     grade: "A"  },
  { range: "84–75",  label: "Very Good",     grade: "B"  },
  { range: "74–60",  label: "Good",          grade: "C"  },
  { range: "59–50",  label: "Average",       grade: "D"  },
  { range: "49–40",  label: "Below Average", grade: "E"  },
  { range: "39–0",   label: "Poor/Fail",     grade: "F"  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { termLabel: string }

export default function ReportCard({ termLabel }: Props) {
  const { id }             = useParams<{ id: string }>();
  const { currentSession } = useContext(SessionContext);
  const printRef           = useRef<HTMLDivElement>(null);

  const [student,   setStudent]   = useState<StudentInfo | null>(null);
  const [scores,    setScores]    = useState<Score[]>([]);
  const [school,    setSchool]    = useState<SchoolSettings>({});
  const [profile,   setProfile]   = useState<ProfileSettings>({});
  const [psyData,   setPsyData]   = useState<PsyData | null>(null);
  const [position,  setPosition]  = useState<number>(0);
  const [classSize, setClassSize] = useState<number>(0);
  const [loading,   setLoading]   = useState(true);

  const apiUrl      = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token       = localStorage.getItem("jwtToken");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // ── derived ────────────────────────────────────────────────────────────────
  const isCumulative   = termLabel.toLowerCase() === "cumulative";
  const cumulativeRows = isCumulative ? buildCumulativeRows(scores) : [];
  const termKeyword    = termLabel.split(" ")[0].toLowerCase();

  const tableHeaders: string[] = isCumulative
    ? ["Subject", "1st Term", "2nd Term", "3rd Term", "Total", "Average", "Grade", "Remark"]
    : ["Subject", "Test", "Exam", "Total", "Grade", "Remark"];

  const colSpan = tableHeaders.length;

  // score summary
  const marksObtained: number = isCumulative
    ? cumulativeRows.reduce((s, r) => s + r.total, 0)
    : scores.reduce((s, r) => {
        const t = Number(r.marksObtained ?? r.total) ||
          Number(r.testscore ?? r.firstTest ?? 0) + Number(r.examscore ?? r.examScore ?? 0);
        return s + t;
      }, 0);

  const subjectCount: number       = isCumulative ? cumulativeRows.length : scores.length;
  const totalPossibleMarks: number = subjectCount * 100;

  // Correct: (obtained / obtainable) × 100, one decimal place
  const averagePercent: number = totalPossibleMarks > 0
    ? Math.round((marksObtained / totalPossibleMarks) * 1000) / 10
    : 0;

  const avgPerSubject: number = subjectCount ? Math.round(marksObtained / subjectCount) : 0;
  const averageGrade: string  = deriveGrade(averagePercent).grade;

  // ── data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id || !currentSession?._id) return;
    setLoading(true);

    const profileTerm = isCumulative ? "THIRD TERM" : termLabel.toUpperCase();

    axios
      .get(`${apiUrl}/api/getofflineexam/${currentSession._id}`, { headers: authHeaders })
      .then((examRes) => {
        const exams: any[]   = Array.isArray(examRes.data) ? examRes.data : [];
        const matchedExam    = exams.find((e: any) =>
          (e.name || "").toLowerCase().includes(termKeyword)
        );

        return Promise.allSettled([
          axios.get(`${apiUrl}/api/get-students/${id}/${currentSession._id}`,           { headers: authHeaders }),
          axios.get(`${apiUrl}/api/get-scores-by-student/${id}/${currentSession._id}`,  { headers: authHeaders }),
          axios.get(`${apiUrl}/api/account-setting`,                                    { headers: authHeaders }),
          axios.get(`${apiUrl}/api/setting`, {
            params: { sessionId: currentSession._id, term: encodeURIComponent(profileTerm) },
            headers: authHeaders,
          }),
          matchedExam
            ? axios.get(`${apiUrl}/api/get-all-psy/${matchedExam._id}`, { headers: authHeaders })
            : Promise.resolve({ data: { scores: [] } }),
          axios.get(`${apiUrl}/api/class/${currentSession._id}`, { headers: authHeaders }),
        ]);
      })
      .then(([stuRes, scoresRes, schoolRes, profileRes, psyRes, classRes]) => {

        if (stuRes.status === "fulfilled") {
          const d = stuRes.value.data?.data || stuRes.value.data;
          setStudent(Array.isArray(d) ? d[0] : d);
        }

        if (scoresRes.status === "fulfilled") {
          const resData = scoresRes.value.data;
          const raw     = resData?.scores ?? resData?.data ?? resData;
          const list: Score[] = Array.isArray(raw) ? raw : [];
          const filtered = isCumulative
            ? list
            : list.filter((s) => {
                const label = String(s.examName || s.examId?.name || "").toLowerCase();
                return !label || label.includes(termKeyword);
              });
          setScores(filtered);
        }

        if (schoolRes.status === "fulfilled") {
          const d       = schoolRes.value.data?.data || schoolRes.value.data;
          const raw: any = Array.isArray(d) ? (d[0] ?? {}) : (d ?? {});
          const logoRaw: string = raw.schoolLogo || raw.logo || raw.logoUrl || "";
          const logoFull = logoRaw && !logoRaw.startsWith("http")
            ? `${apiUrl}/${logoRaw.replace(/^\//, "")}`
            : logoRaw;
          setSchool({ ...raw, schoolLogo: logoFull });
        }

        if (profileRes.status === "fulfilled") {
          const d        = profileRes.value.data?.data || profileRes.value.data;
          const raw: any = Array.isArray(d) ? (d[0] ?? {}) : (d ?? {});
          const sigRaw: string = raw.signature || "";
          const sigFull  = sigRaw && !sigRaw.startsWith("http")
            ? `${apiUrl}/${sigRaw.replace(/^\//, "")}`
            : sigRaw;
          setProfile({ ...raw, signature: sigFull });
        }

        if (psyRes.status === "fulfilled") {
          const psyScores: any[] = psyRes.value.data?.scores || [];
          const found = psyScores.find(
            (m: any) => String(m.studentId?._id || m.studentId) === String(id)
          );
          if (found) setPsyData(found);
        }

        if (classRes.status === "fulfilled") {
          const classes: any[] = Array.isArray(classRes.value.data) ? classRes.value.data : [];
          // will be refined once student state settles — best-effort here
          const anyClass = classes[0];
          if (anyClass?.students) setClassSize(anyClass.students.length);
        }
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
  }, [apiUrl, currentSession, id, termLabel]);

  const handlePrint = useReactToPrint({ contentRef: printRef });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  const hasRows = isCumulative ? cumulativeRows.length > 0 : scores.length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-5xl mx-auto">

      {/* Toolbar */}
      <div className="flex items-center justify-between dont-print">
        <Link to={-1 as any} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
          <ArrowLeft size={18} /> Back
        </Link>
        <Button onClick={() => handlePrint()} className="gap-2">
          <Printer size={16} /> Print
        </Button>
      </div>

      {/* ════════════════════ PRINTABLE AREA ════════════════════ */}
      <div
        ref={printRef}
        className="printable-area bg-white border border-border rounded-lg p-6 print:p-3 print:border-none space-y-4 text-black"
      >

        {/* ── SCHOOL HEADER ── */}
        <div className="text-center border-b-2 border-primary pb-3 space-y-0.5">
          {school.schoolLogo && (
            <img src={school.schoolLogo} alt="School Logo" className="h-16 w-16 object-contain mx-auto mb-1" />
          )}
          <h1 className="text-xl font-black text-primary uppercase tracking-wide">
            {school.name || "School Name"}
          </h1>
          {school.address && <p className="text-[11px] text-gray-600">{school.address}</p>}
          {school.motto   && <p className="text-[11px] italic text-gray-500">Motto: {school.motto}</p>}
          {school.email   && <p className="text-[11px] text-gray-500">{school.email}</p>}
          {school.phone   && <p className="text-[11px] text-gray-500">Tel: {school.phone}</p>}
          <div className="mt-2 inline-block bg-primary text-white text-xs font-bold px-5 py-1 rounded-full tracking-wider">
            {currentSession?.name} — {termLabel.toUpperCase()} REPORT CARD
          </div>
        </div>

        {/* ── TOP INFO GRID (3 columns) ── */}
        <div className="grid grid-cols-3 gap-0 border border-gray-300 rounded-md overflow-hidden text-[11px]">

          {/* Col 1: Personal Data */}
          <div className="border-r border-gray-300 p-3 space-y-1.5">
            <p className="font-black text-primary text-[10px] uppercase tracking-wider mb-2">
              Student's Personal Data
            </p>
            {(
              [
                ["Name",          student?.studentName || student?.name || "—"],
                ["Date of Birth", student?.dob         || "—"],
                ["Sex",           student?.gender       || "—"],
                ["Class",         student?.classname    || "—"],
                ["Admission No.", student?.AdmNo        || "—"],
              ] as [string, string][]
            ).map(([l, v]) => (
              <div key={l} className="flex gap-1">
                <span className="font-semibold w-24 shrink-0 text-gray-600">{l}</span>
                <span className="border-b border-gray-300 flex-1 font-medium">{v}</span>
              </div>
            ))}
          </div>

          {/* Col 2: Attendance + Term Dates */}
          <div className="border-r border-gray-300 p-3 space-y-2">
            <p className="font-black text-primary text-[10px] uppercase tracking-wider mb-1">Attendance</p>
            <table className="w-full border border-gray-300 text-center text-[10px]">
              <thead className="bg-primary/10">
                <tr>
                  {["School Opened","Present","Absent"].map(h => (
                    <th key={h} className="border border-gray-300 px-1 py-1">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {["—","—","—"].map((v, i) => (
                    <td key={i} className="border border-gray-300 px-1 py-2 font-bold">{v}</td>
                  ))}
                </tr>
              </tbody>
            </table>

            <p className="font-black text-primary text-[10px] uppercase tracking-wider mt-2 mb-1">
              Terminal Duration
            </p>
            <table className="w-full border border-gray-300 text-center text-[10px]">
              <thead className="bg-primary/10">
                <tr>
                  {["Term Begins","Term Ends","Next Term Begins"].map(h => (
                    <th key={h} className="border border-gray-300 px-1 py-1">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {[profile.termBegins, profile.termEnds, profile.nextTermBegins || profile.resumptionDate].map((d, i) => (
                    <td key={i} className="border border-gray-300 px-1 py-2">
                      {d ? new Date(d).toLocaleDateString() : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Col 3: Score Summary */}
          <div className="p-3">
            <p className="font-black text-primary text-[10px] uppercase tracking-wider mb-2">Score Summary</p>
            <div className="space-y-1.5">
              {(
                [
                  ["Total Score Obtainable", totalPossibleMarks > 0 ? String(totalPossibleMarks) : "—"],
                  ["Total Score Obtained",   marksObtained > 0      ? String(marksObtained)      : "—"],
                  ["Average Percentage",     totalPossibleMarks > 0 ? `${averagePercent}%`        : "—"],
                  ["Average Grade",          averageGrade                                              ],
                  ["No. in Class",           classSize > 0 ? String(classSize) : "—"                  ],
                  ["Position",               position  > 0 ? ordinal(position)  : "—"                  ],
                ] as [string, string][]
              ).map(([l, v]) => (
                <div key={l} className="flex justify-between items-center border-b border-gray-100 pb-0.5">
                  <span className="text-gray-600 font-semibold">{l}</span>
                  <span className="font-black text-primary text-[12px]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ACADEMIC PERFORMANCE ── */}
        <div>
          <p className="text-center font-black text-primary text-[10px] uppercase tracking-widest mb-1">
            Academic Performance
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse border border-gray-300">
              <thead>
                <tr className="bg-primary text-white">
                  {tableHeaders.map((h) => (
                    <th key={h} className="border border-gray-400 px-2 py-1.5 text-left whitespace-nowrap font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!hasRows ? (
                  <tr>
                    <td colSpan={colSpan} className="text-center py-6 text-gray-400">
                      No scores found for this term
                    </td>
                  </tr>
                ) : isCumulative ? (
                  cumulativeRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="border border-gray-200 px-2 py-1 font-medium">{row.subject}</td>
                      <td className="border border-gray-200 px-2 py-1 text-center">{row.first  || "—"}</td>
                      <td className="border border-gray-200 px-2 py-1 text-center">{row.second || "—"}</td>
                      <td className="border border-gray-200 px-2 py-1 text-center">{row.third  || "—"}</td>
                      <td className="border border-gray-200 px-2 py-1 text-center font-bold">{row.total}</td>
                      <td className="border border-gray-200 px-2 py-1 text-center font-bold">{row.average}</td>
                      <td className={`border border-gray-200 px-2 py-1 text-center ${gradeColor(row.grade)}`}>{row.grade}</td>
                      <td className="border border-gray-200 px-2 py-1 text-center">{row.remark}</td>
                    </tr>
                  ))
                ) : (
                  scores.map((s, i) => {
                    const test  = Number(s.testscore  ?? s.firstTest  ?? 0);
                    const exam  = Number(s.examscore  ?? s.examScore  ?? 0);
                    const total = Number(s.marksObtained ?? s.total) || test + exam;
                    const { grade, comment } = deriveGrade(total);
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="border border-gray-200 px-2 py-1 font-medium">{s.subjectName || s.subject || "—"}</td>
                        <td className="border border-gray-200 px-2 py-1 text-center">{test}</td>
                        <td className="border border-gray-200 px-2 py-1 text-center">{exam}</td>
                        <td className="border border-gray-200 px-2 py-1 text-center font-bold">{total}</td>
                        <td className={`border border-gray-200 px-2 py-1 text-center ${gradeColor(s.grade || grade)}`}>
                          {s.grade || grade}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-center">{s.comment || comment}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            
            </table>
          </div>
        </div>

        {/* ── KEYS TO GRADE RATING ── */}
        <div>
          <p className="text-center font-black text-primary text-[10px] uppercase tracking-widest mb-1">
            Keys to Grade Rating
          </p>
          <div className="grid grid-cols-7 border border-gray-300 rounded overflow-hidden text-[10px]">
            {GRADE_KEYS.map(({ range, label, grade }) => (
              <div key={grade} className="border-r last:border-r-0 border-gray-300 text-center px-1 py-1.5 bg-white">
                <p className={`font-black text-[11px] ${gradeColor(grade)}`}>{grade}</p>
                <p className="font-semibold text-gray-700">{range}</p>
                <p className="text-gray-500 text-[9px]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── AFFECTIVE + PSYCHOMOTOR (side by side) ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Affective Traits */}
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="bg-primary text-white text-center font-bold text-[10px] py-1.5 uppercase tracking-wider">
              Affective Traits
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-primary/10 border-b border-gray-200">
                  <th className="py-1 px-2 text-left text-[10px]">Trait</th>
                  {[1,2,3,4,5].map(n => (
                    <th key={n} className="py-1 px-1 text-center text-[10px] w-6">{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <RatingRow label="Attentiveness"           value={psyData?.attentiveness} />
                <RatingRow label="Attitude to School Work" value={psyData?.attitudeToWork} />
                <RatingRow label="Cooperation with Others" value={psyData?.cooperation} />
                <RatingRow label="Emotional Stability"     value={psyData?.emotionStability} />
                <RatingRow label="Leadership"              value={psyData?.leadership} />
                <RatingRow label="Attendance"              value={psyData?.attendance} />
                <RatingRow label="Neatness"                value={psyData?.neatness} />
                <RatingRow label="Perseverance"            value={psyData?.perseverance} />
                <RatingRow label="Politeness"              value={psyData?.politeness} />
                <RatingRow label="Punctuality"             value={psyData?.punctuality ?? psyData?.instruction} />
                <RatingRow label="Speaking / Writing"      value={psyData?.speakingWriting} />
                <RatingRow label="Organisation Ability"    value={psyData?.organisationAbility} />
                <RatingRow label="Relationship w/ Others"  value={psyData?.relationshipWithOthers} />
              </tbody>
            </table>
          </div>

          {/* Psychomotor Skills + keys + remarks */}
          <div className="border border-gray-300 rounded overflow-hidden flex flex-col">
            <div className="bg-primary text-white text-center font-bold text-[10px] py-1.5 uppercase tracking-wider">
              Psychomotor Skills
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-primary/10 border-b border-gray-200">
                  <th className="py-1 px-2 text-left text-[10px]">Skill</th>
                  {[1,2,3,4,5].map(n => (
                    <th key={n} className="py-1 px-1 text-center text-[10px] w-6">{n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <RatingRow label="Handling of Tools" value={psyData?.handlingOfTools} />
                <RatingRow label="Handwriting"       value={psyData?.handwriting ?? psyData?.independently} />
                <RatingRow label="Verbal Fluency"    value={psyData?.verbalFluency ?? psyData?.talking} />
                <RatingRow label="Processing Speed"  value={psyData?.processingSpeed} />
                <RatingRow label="Retentiveness"     value={psyData?.retentiveness ?? psyData?.eyecontact} />
              </tbody>
            </table>

            {/* Rating key legend */}
            <div className="border-t border-gray-200 p-2 text-[10px] bg-gray-50 space-y-0.5 flex-1">
              <p className="font-bold text-primary uppercase tracking-wider mb-1">Keys to Rating</p>
              {["1 – Very Poor","2 – Poor","3 – Fair","4 – Good","5 – Excellent"].map(k => (
                <p key={k} className="text-gray-700">{k}</p>
              ))}
            </div>

            {/* Teacher / head remarks */}
            {(psyData?.remarks || psyData?.premarks) && (
              <div className="border-t border-gray-200 p-2 text-[10px] space-y-1">
                {psyData.remarks  && (
                  <p>
                    <span className="font-bold text-primary">Class Teacher's Remark: </span>
                    {psyData.remarks}
                  </p>
                )}
                {psyData.premarks && (
                  <p>
                    <span className="font-bold text-primary">Head Teacher's Remark: </span>
                    {psyData.premarks}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SIGNATURES ── */}
        <div className="grid grid-cols-3 gap-6 pt-4 mt-2 border-t border-gray-300 text-[11px] text-center">
          <div>
            <div className="border-b border-gray-400 mt-8 mb-1" />
            <p className="text-gray-600 font-semibold">Class Teacher</p>
          </div>
          <div>
            {profile.signature
              ? <img src={profile.signature} alt="Principal Signature" className="h-10 object-contain mx-auto mb-1" />
              : <div className="h-10" />
            }
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-gray-600 font-semibold">
              Principal{profile.principalName ? `: ${profile.principalName}` : ""}
            </p>
          </div>
          <div>
            <div className="border-b border-gray-400 mt-8 mb-1" />
            <p className="text-gray-600 font-semibold">Head Teacher</p>
          </div>
        </div>

        {/* Next Resumption */}
        {(profile.resumptionDate || profile.nextTermBegins) && (
          <p className="text-[11px] text-center text-gray-500 mt-1">
            Next Resumption:{" "}
            <span className="font-bold text-primary">
              {new Date(profile.resumptionDate || profile.nextTermBegins || "").toLocaleDateString()}
            </span>
          </p>
        )}

      </div>{/* end printable-area */}
    </div>
  );
}