import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormShell } from "@/components/ActionForm";
import { ArrowLeft, UserPen } from "lucide-react";

type Props = {
  roleLabel?: string;
};

export default function UserProfilePage({ roleLabel = "User" }: Props) {
  const { user } = useAuth();
  const storedUser = localStorage.getItem("user");
  const mergedUser = useMemo(() => {
    const parsed = storedUser ? JSON.parse(storedUser) : {};
    return { ...parsed, ...user } as Record<string, any>;
  }, [storedUser, user]);

  const [view, setView] = useState<"profile" | "edit">("profile");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: mergedUser.username || mergedUser.name || "",
    email: mergedUser.email || "",
    phone: mergedUser.phone || "",
    address: mergedUser.address || "",
    admissionNo: mergedUser.AdmNo || mergedUser.admissionNo || "",
    className: mergedUser.classname || mergedUser.className || "",
    parentName: mergedUser.parent || mergedUser.parentName || "",
    dob: mergedUser.dob || "",
  });

  const info = [
    { label: "Username", value: formData.username },
    { label: "Email Address", value: formData.email },
    { label: "Phone Number", value: formData.phone },
    { label: "Home Address", value: formData.address },
    { label: "Admission No", value: formData.admissionNo },
    { label: "Class", value: formData.className },
    { label: "Parent Name", value: formData.parentName },
    { label: "Date of Birth", value: formData.dob },
    { label: "Role", value: roleLabel },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updatedUser = {
      ...mergedUser,
      username: formData.username,
      name: formData.username,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      admissionNo: formData.admissionNo,
      AdmNo: formData.admissionNo,
      className: formData.className,
      classname: formData.className,
      parentName: formData.parentName,
      parent: formData.parentName,
      dob: formData.dob,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setTimeout(() => {
      setLoading(false);
      setView("profile");
    }, 500);
  };

  if (view === "edit") {
    return (
      <div className="p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => setView("profile")}
          className="text-slate-500 hover:text-[#004aaa] gap-2"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Button>

        <FormShell
          title={`${roleLabel} Profile`}
          type="edit"
          loading={loading}
          onSubmit={handleSubmit}
          onClose={() => setView("profile")}
        >
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Username
            </Label>
            <Input
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Email Address
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Phone Number
            </Label>
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Date of Birth
            </Label>
            <Input
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              placeholder="e.g. 2012-05-12"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Admission No
            </Label>
            <Input
              value={formData.admissionNo}
              onChange={(e) =>
                setFormData({ ...formData, admissionNo: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Class
            </Label>
            <Input
              value={formData.className}
              onChange={(e) =>
                setFormData({ ...formData, className: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Parent Name
            </Label>
            <Input
              value={formData.parentName}
              onChange={(e) =>
                setFormData({ ...formData, parentName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Home Address
            </Label>
            <Input
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
        </FormShell>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end border-b border-slate-200 pb-2">
        <div className="flex gap-8">
          <button className="text-[#004aaa] font-bold pb-2 px-2 transition-all">
            About
          </button>
        </div>
        <Button
          onClick={() => setView("edit")}
          className="bg-[#004aaa] hover:bg-[#004aaa]/90 gap-2 mb-2 px-6 shadow-md transition-all active:scale-95"
        >
          <UserPen size={16} />
          Edit Profile
        </Button>
      </div>

      <div className="max-w-4xl space-y-6">
        <header>
          <h2 className="text-[#004aaa] text-2xl font-extrabold tracking-tight">
            {roleLabel} Profile
          </h2>
          <p className="text-slate-500 text-sm">
            Manage and view your personal school information.
          </p>
        </header>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-4 border-b border-slate-50 bg-slate-50/50">
            <CardTitle className="text-[#004aaa] text-lg font-bold">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 gap-y-5">
              {info.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[220px_1fr] items-baseline border-b border-slate-50 pb-3 last:border-0"
                >
                  <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-[#004aaa] font-medium text-base">
                    {item.value || "Not provided"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
