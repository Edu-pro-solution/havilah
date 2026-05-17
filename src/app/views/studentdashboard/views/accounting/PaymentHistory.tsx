import { useContext, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/useFetch";
import { useAuth } from "@/contexts/AuthContext";
import { SessionContext } from "@/contexts/SessionContext";
import { ReceiptText } from "lucide-react";

export default function StudentPaymentHistory() {
  const { user } = useAuth();
  const { currentSession } = useContext(SessionContext);

  const userInfo = useMemo(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : {};
    return { ...parsed, ...user } as Record<string, any>;
  }, [user]);

  // Fetch all receipts for the session, then filter by student name/id
  const { data, loading } = useFetch(
    currentSession?._id ? `/receipt-session/${currentSession._id}` : null
  );

  const receipts = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const name = String(userInfo?.studentName || userInfo?.username || userInfo?.name || "").toLowerCase().trim();
    const id = String(userInfo?._id || userInfo?.id || "");
    return data.filter((r: any) => {
      if (id && (String(r.studentId || "") === id)) return true;
      const rName = String(r.studentName || "").toLowerCase().trim();
      return name && rName === name;
    });
  }, [data, userInfo]);

  const statusColor = (status: string) => {
    const s = String(status || "").toLowerCase();
    if (s === "complete" || s === "paid" || s === "full") return "bg-green-100 text-green-700";
    if (s === "partial") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#004aaa]">Payment History</h2>
        <p className="text-sm text-slate-500">Your fee payment records</p>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4 text-[#004aaa]" />
            <CardTitle className="text-sm font-bold text-[#004aaa]">
              {loading ? "Loading…" : `${receipts.length} Payment${receipts.length !== 1 ? "s" : ""} Found`}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#E8EBF3]">
                <TableRow>
                  <TableHead className="pl-6 font-bold text-[#004aaa] w-[60px]">S/N</TableHead>
                  <TableHead className="font-bold text-[#004aaa]">Receipt No</TableHead>
                  <TableHead className="font-bold text-[#004aaa]">Reason</TableHead>
                  <TableHead className="font-bold text-[#004aaa] text-right">Total (₦)</TableHead>
                  <TableHead className="font-bold text-[#004aaa] text-right">Paid (₦)</TableHead>
                  <TableHead className="font-bold text-[#004aaa] text-right">Balance (₦)</TableHead>
                  <TableHead className="font-bold text-[#004aaa]">Date</TableHead>
                  <TableHead className="font-bold text-[#004aaa]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                      Loading payment records…
                    </TableCell>
                  </TableRow>
                ) : receipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                      No payment records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  receipts.map((r: any, i) => {
                    const total = Number(r.amount || r.total || 0);
                    const paid = Number(r.paid ?? r.balance ?? 0);
                    const balance = Math.max(0, total - paid);
                    return (
                      <TableRow key={r._id} className="hover:bg-slate-50/50">
                        <TableCell className="pl-6 text-slate-500">{i + 1}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">{r.receiptNo || r.serial || "—"}</TableCell>
                        <TableCell className="text-slate-700">{r.reason || "—"}</TableCell>
                        <TableCell className="text-right font-semibold text-[#004aaa]">{total.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-green-700">{paid.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">{balance > 0 ? balance.toLocaleString() : "0"}</TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {r.date ? new Date(r.date).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor(r.status)}`}>
                            {r.status || "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
