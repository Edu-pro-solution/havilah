import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormShell } from "@/components/ActionForm";
import { DeleteModal } from "@/components/DeleteModal";
import { DataTablePagination } from "@/components/DataTablePagination";
import { MoreHorizontal, FileText, User, ArrowLeft, Printer, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";
import logo from "@/assets/logo.png";

type ViewState = "list" | "receipt" | "edit";

function parseAmount(val: unknown): number {
  if (val == null || val === "") return NaN;
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(/[^\d.-]/g, ""));
}

function calcBalance(item: Record<string, unknown>) {
  const total = parseAmount(item.amount);
  // "paid" field may be stored as "balance" in some records (legacy naming)
  const paid = parseAmount(item.paid ?? item.balance);
  if (Number.isNaN(total) || Number.isNaN(paid)) return NaN;
  return Math.max(0, total - paid);
}

function paidAmount(item: Record<string, unknown>) {
  return parseAmount(item.paid ?? item.balance);
}

type PaymentRow = Record<string, unknown> & { _id?: string };

export default function PaymentHistory() {
  const navigate = useNavigate();
  const { currentSession } = useContext(SessionContext);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { data: schoolSettings } = useFetch("/account-setting");
  const { data: schoolProfile } = useFetch("/school-profile");

  const listUrl = currentSession?._id ? `/receipt-session/${currentSession._id}` : null;
  const { data, loading: listLoading, error, reFetch } = useFetch(listUrl);

  const payments = useMemo(
    () => (Array.isArray(data) ? (data as PaymentRow[]) : []),
    [data],
  );

  const [view, setView] = useState<ViewState>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({ studentName: "", amount: "", paid: "", reason: "", date: "", status: "" });
  const itemsPerPage = 5;

  const receiptUrl = view === "receipt" && selectedPayment?._id ? `/receipt/${selectedPayment._id}` : null;
  const { data: receiptData, loading: receiptLoading } = useFetch(receiptUrl);

  const receiptDetail = useMemo(() => {
    if (!selectedPayment) return null;
    const extra =
      receiptData && typeof receiptData === "object" && !Array.isArray(receiptData)
        ? (receiptData as Record<string, unknown>)
        : {};
    return { ...selectedPayment, ...extra } as PaymentRow;
  }, [selectedPayment, receiptData]);

  const school = useMemo(() => {
    const settings = Array.isArray(schoolSettings) ? schoolSettings[0] : schoolSettings;
    const profile = Array.isArray(schoolProfile) ? schoolProfile[0] : schoolProfile;
    const rawLogo = settings?.schoolLogo || settings?.logo || settings?.logoUrl || "";
    const rawSignature = profile?.signature || "";

    return {
      name: settings?.name || "School Name",
      address: settings?.address || "",
      email: settings?.email || "",
      logo:
        rawLogo && !String(rawLogo).startsWith("http")
          ? `${apiUrl}/${String(rawLogo).replace(/^\//, "")}`
          : rawLogo || logo,
      signature:
        rawSignature && !String(rawSignature).startsWith("http")
          ? `${apiUrl}/${String(rawSignature).replace(/^\//, "")}`
          : rawSignature,
      principalName: profile?.principalName || "Accounts Office",
    };
  }, [apiUrl, schoolProfile, schoolSettings]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem);

  const authHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const openEdit = (item: PaymentRow) => {
    setSelectedPayment(item);
    setEditForm({
      studentName: String(item.studentName ?? item.name ?? ""),
      amount: String(item.amount ?? ""),
      paid: String(item.paid ?? ""),
      reason: String(item.reason ?? ""),
      date: item.date ? String(item.date).split("T")[0] : "",
      status: String(item.status ?? ""),
    });
    setView("edit");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment?._id) return;
    setLoading(true);
    try {
      await axios.put(`${apiUrl}/api/receipt/${selectedPayment._id}`, {
        studentName: editForm.studentName,
        amount: Number(editForm.amount),
        paid: Number(editForm.paid),
        reason: editForm.reason,
        date: editForm.date,
        status: editForm.status,
      }, { headers: authHeaders() });
      toast.success("Payment record updated");
      await reFetch();
      setView("list");
      setSelectedPayment(null);
    } catch {
      toast.error("Failed to update payment record");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPayment?._id) return;
    setLoading(true);
    try {
      await axios.delete(`${apiUrl}/api/receipt/${selectedPayment._id}`, { headers: authHeaders() });
      toast.success("Payment record deleted");
      await reFetch();
    } catch {
      toast.error("Failed to delete payment record");
    } finally {
      setLoading(false);
      setIsDeleteOpen(false);
      setSelectedPayment(null);
    }
  };

  // --- EDIT VIEW ---
  if (view === "edit" && selectedPayment) {
    return (
      <div className="p-6">
        <FormShell title="Payment Record" type="edit" loading={loading} onSubmit={handleEditSubmit}>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Student Name</Label>
            <Input value={editForm.studentName} onChange={(e) => setEditForm(f => ({ ...f, studentName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Total Fees (₦)</Label>
            <Input type="number" value={editForm.amount} onChange={(e) => setEditForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Amount Paid (₦)</Label>
            <Input type="number" value={editForm.paid} onChange={(e) => setEditForm(f => ({ ...f, paid: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Status</Label>
            <Input value={editForm.status} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))} placeholder="e.g. Complete / Partial" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Date</Label>
            <Input type="date" value={editForm.date} onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase text-slate-400">Reason / Description</Label>
            <Input value={editForm.reason} onChange={(e) => setEditForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. School fees" />
          </div>
        </FormShell>
      </div>
    );
  }

  // --- RECEIPT VIEW ---
  if (view === "receipt" && selectedPayment && receiptDetail) {
    const amount = parseAmount(receiptDetail.amount);
    const paid = paidAmount(receiptDetail as Record<string, unknown>);
    const balance = calcBalance(receiptDetail as Record<string, unknown>);
    const studentName = String(receiptDetail.studentName ?? receiptDetail.name ?? "—");
    const reason = String(receiptDetail.reason ?? "—");
    const status = String(receiptDetail.status ?? "—");
    const receiptNo = String(
      receiptDetail.receiptNo ?? receiptDetail.serial ?? `RCPT-${String(receiptDetail._id ?? "").slice(-8)}`,
    );
    const dateRaw = receiptDetail.date;
    const dateStr =
      dateRaw instanceof Date || typeof dateRaw === "string" || typeof dateRaw === "number"
        ? new Date(dateRaw as string | number | Date).toLocaleDateString()
        : "—";

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Button
            variant="ghost"
            onClick={() => { setView("list"); setSelectedPayment(null); }}
            className="text-muted-foreground hover:text-primary gap-2">
            <ArrowLeft size={16} /> Back to Payment History
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-2 border-border">
            <Printer size={16} /> Print Receipt
          </Button>
        </div>

        {receiptLoading ? <p className="text-sm text-muted-foreground print:hidden">Loading receipt…</p> : null}

        <Card className="max-w-4xl border-none shadow-sm ring-1 ring-border print:shadow-none print:ring-0 printable-receipt">
          <CardHeader className="bg-card border-b space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Receipt Number</p>
                <CardTitle className="text-primary text-lg font-bold">{receiptNo}</CardTitle>
              </div>
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-black bg-white p-1">
                <img src={school.logo} alt="School Logo" className="h-full w-full object-contain" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary">{school.name}</h2>
              <p className="text-sm text-black">{[school.address, school.email].filter(Boolean).join(" • ")}</p>
              <p className="text-sm text-slate-500">14, Babs Ladipo Street, Lagos • support@edana.com</p>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-b border-border p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Date</p>
                <p className="font-semibold text-foreground">{dateStr}</p>
              </div>
              <div className="border-b border-border p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Received From</p>
                <p className="font-semibold text-foreground">{studentName}</p>
              </div>
              <div className="border-b border-border p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Amount Paid</p>
                <p className="font-semibold text-foreground">
                  {Number.isNaN(paid) ? String(receiptDetail.paid ?? "—") : `N ${paid.toLocaleString()}`}
                </p>
              </div>
              <div className="border-b border-border p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Balance</p>
                <p className="font-semibold text-foreground">
                  {Number.isNaN(balance) ? "—" : `N ${balance.toLocaleString()}`}
                </p>
              </div>
              <div className="border-b border-border p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Total Fees</p>
                <p className="font-semibold text-foreground">
                  {Number.isNaN(amount) ? String(receiptDetail.amount ?? "—") : `N ${amount.toLocaleString()}`}
                </p>
              </div>
              <div className="border-b border-border p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Being Paid For</p>
                <p className="font-semibold text-foreground">{reason}</p>
              </div>
            </div>

            <div className="flex items-end justify-between border-t pt-6">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">Payment Status</p>
                <p className="font-semibold text-foreground">{status}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-muted-foreground">Signature</p>
                {school.signature ? (
                  <img src={school.signature} alt="School Signature" className="ml-auto h-12 object-contain" />
                ) : null}
                <p className="text-primary font-semibold">{school.principalName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Payment History</h2>
        <p className="text-sm text-muted-foreground">Track student financial records and outstanding balances.</p>
      </div>

      <Card className="border-none shadow-sm overflow-hidden ring-1 ring-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-primary/10">
              <TableRow>
                <TableHead className="w-[60px] text-primary font-bold pl-6 text-xs uppercase">S/N</TableHead>
                <TableHead className="text-primary font-bold text-xs uppercase">Student Name</TableHead>
                <TableHead className="text-primary font-bold text-xs uppercase">Total Fees</TableHead>
                <TableHead className="text-primary font-bold text-xs uppercase">Amount Paid</TableHead>
                <TableHead className="text-primary font-bold text-xs uppercase">Reason</TableHead>
                <TableHead className="text-primary font-bold text-xs uppercase">Date</TableHead>
                <TableHead className="text-primary font-bold text-xs uppercase text-center">Balance</TableHead>
                <TableHead className="text-primary font-bold text-xs uppercase">Status</TableHead>
                <TableHead className="text-right pr-6 text-primary font-bold text-xs uppercase">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">Loading payments…</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-destructive">Failed to load payment history.</TableCell>
                </TableRow>
              ) : currentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">No payment records for this session.</TableCell>
                </TableRow>
              ) : (
                currentPayments.map((item, index) => {
                  const amount = parseAmount(item.amount);
                  const paid = paidAmount(item);
                  const balance = calcBalance(item);
                  const studentName = String(item.studentName ?? item.name ?? "—");
                  const studentId = String(item.studentId ?? item.student ?? item.student_id ?? "");
                  const dateStr = item.date ? new Date(item.date as string | number).toLocaleDateString() : "—";
                  const statusStr = String(item.status ?? "");

                  return (
                    <TableRow key={String(item._id ?? index)} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6 text-muted-foreground font-medium">{indexOfFirstItem + index + 1}</TableCell>
                      <TableCell className="font-bold text-primary">{studentName}</TableCell>
                      <TableCell className="font-medium text-foreground">
                        {Number.isNaN(amount) ? String(item.amount ?? "—") : `N${amount.toLocaleString()}`}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        {Number.isNaN(paid) ? String(item.paid ?? "—") : `N${paid.toLocaleString()}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{String(item.reason ?? "—")}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{dateStr}</TableCell>
                      <TableCell className="text-center font-bold text-foreground">
                        {Number.isNaN(balance) ? "—" : `N${balance.toLocaleString()}`}
                      </TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                          statusStr.toLowerCase().includes("complete")
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-secondary text-foreground border-border"
                        }`}>
                          {statusStr.toUpperCase() || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal size={16} className="text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            {studentId ? (
                              <DropdownMenuItem className="gap-2" onClick={() => navigate(`/student_profile/${studentId}`)}>
                                <User size={14} /> Student Profile
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem className="gap-2" onClick={() => { setSelectedPayment(item); setView("receipt"); }}>
                              <FileText size={14} /> View Receipt
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-[#004aaa] focus:bg-[#004aaa]/10 focus:text-[#004aaa]" onClick={() => openEdit(item)}>
                              <Pencil size={14} className="text-[#004aaa]" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                              onClick={() => { setSelectedPayment(item); setIsDeleteOpen(true); }}>
                              <Trash2 size={14} className="text-red-600" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="border-t px-4">
            <DataTablePagination
              totalItems={payments.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedPayment(null); }}
        onConfirm={handleDelete}
        loading={loading}
        itemName={String(selectedPayment?.studentName ?? selectedPayment?.name ?? "this payment")}
      />
    </div>
  );
}

