import { useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Printer } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

const resolveAssetUrl = (value: unknown) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return `${apiUrl}/${raw.replace(/^\//, "")}`;
};

const getStudentLastName = (student: Record<string, any>) => {
  const explicitLastName = String(
    student.lastName || student.lastname || student.surname || ""
  ).trim();
  if (explicitLastName) return explicitLastName;

  const fullName = String(
    student.studentName || student.username || student.name || ""
  ).trim();
  if (!fullName) return "Student";

  const parts = fullName.split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] || "Student";
};

const getGuardianFallback = (student: Record<string, any>) => {
  const preferredGuardian = String(
    student.parentsName ||
      student.parent ||
      student.guardian ||
      student.guardianName ||
      ""
  ).trim();

  if (preferredGuardian) return preferredGuardian;

  const gender = String(student.gender || student.sex || "").toLowerCase();
  const title = gender.startsWith("f") ? "Mrs" : "Mr";
  return `${title} ${getStudentLastName(student)}`;
};

export default function StudentIdCard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentSession } = useContext(SessionContext);

  const { data: rawStudent, loading } = useFetch(
    id && currentSession?._id ? `/get-students/${id}/${currentSession._id}` : null
  );
  const { data: schoolSettings } = useFetch("/account-setting");
  const { data: profileSettings } = useFetch("/setting");

  const student = useMemo(() => {
    if (!rawStudent) return null;
    return Array.isArray(rawStudent) ? rawStudent[0] : rawStudent;
  }, [rawStudent]);

  const school = useMemo(() => {
    const data = Array.isArray(schoolSettings) ? schoolSettings[0] : schoolSettings;
    const profile = Array.isArray(profileSettings) ? profileSettings[0] : profileSettings;
    return {
      name: data?.name || "School Name",
      address: data?.address || "",
      logo: resolveAssetUrl(data?.schoolLogo || data?.logo || data?.logoUrl || ""),
      principalName: profile?.principalName || "",
    };
  }, [schoolSettings, profileSettings]);

  const studentName = String(
    student?.studentName || student?.username || student?.name || "Student"
  );
  const guardianName = student ? getGuardianFallback(student) : "-";
  const studentPhoto = resolveAssetUrl(
    student?.photo || student?.passport || student?.avatar || student?.image
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-black hover:text-primary"
        >
          <ArrowLeft size={16} /> Back
        </Button>
        <Button
          onClick={() => window.print()}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Printer size={16} /> Print ID Card
        </Button>
      </div>

      <div className="printable-area print-preserve-color flex justify-center">
        <Card className="print-id-card print-preserve-color w-full max-w-4xl overflow-hidden border border-slate-300 bg-white shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-sm text-black">Loading student...</div>
            ) : !student ? (
              <div className="p-6 text-sm text-black">Student record not found.</div>
            ) : (
              <div className="grid min-h-[300px] grid-cols-1 lg:grid-cols-[280px_1fr]">
                <div className="print-id-sidebar bg-primary px-6 py-7 text-white">
                  <div className="flex items-center gap-4">
                    {school.logo ? (
                      <img
                        src={school.logo}
                        alt="School Logo"
                        className="h-16 w-16 rounded-2xl bg-white object-contain p-2"
                      />
                    ) : null}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
                        EduPro Student Card
                      </p>
                      <h2 className="mt-2 text-2xl font-black uppercase leading-tight">
                        {school.name}
                      </h2>
                    </div>
                  </div>

                  {school.address ? (
                    <p className="mt-5 text-sm leading-6 text-white/90">
                      {school.address}
                    </p>
                  ) : null}

                  <div className="print-id-accent mt-8 overflow-hidden rounded-3xl border border-white/30 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="print-id-surface mx-auto flex h-36 w-32 items-center justify-center overflow-hidden rounded-2xl border border-white/40 bg-white/90">
                      {studentPhoto ? (
                        <img
                          src={studentPhoto}
                          alt={studentName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-black text-primary">
                          {studentName
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase())
                            .join("") || "S"}
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                      Student Identity Card
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between px-6 py-7 lg:px-8">
                  <div>
                    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
                          Card Holder
                        </p>
                        <h3 className="mt-2 text-3xl font-black text-primary">
                          {studentName}
                        </h3>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
                          {student.classname || student.className || "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-4 py-3 text-left md:min-w-[180px]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          Admission No
                        </p>
                        <p className="mt-1 text-lg font-black text-primary">
                          {student.AdmNo || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          Parent / Guardian
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {guardianName}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          Phone
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {student.phone || "-"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          Email Address
                        </p>
                        <p className="mt-2 break-words text-base font-semibold text-slate-900">
                          {student.email || "-"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                          Session
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {currentSession?.name || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-5 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        Authorized By
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {school.principalName || "School Admin"}
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      Valid School ID
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
