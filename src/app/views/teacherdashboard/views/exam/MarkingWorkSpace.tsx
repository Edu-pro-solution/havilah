import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useContext,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Check,
  X,
  Brush,
  Star,
  Undo,
  Plus,
  Save,
  RotateCcw,
  Trash2,
  UploadCloud,
} from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { SessionContext } from "@/contexts/SessionContext";

export default function MarkingWorkspace({
  mode,
}: {
  mode: "online" | "offline";
}) {
  const { currentSession } = useContext(SessionContext);
  const [selectedClassName, setSelectedClassName] = useState("");

  const { data: classList } = useFetch(
    currentSession ? `/class/${currentSession._id}` : null,
  );
  const classes = useMemo(
    () => (Array.isArray(classList) ? (classList as Record<string, unknown>[]) : []),
    [classList],
  );

  const { data: subjectList } = useFetch(
    currentSession && selectedClassName
      ? `/get-subject/${selectedClassName}/${currentSession._id}`
      : null,
  );
  const subjects = useMemo(
    () =>
      Array.isArray(subjectList) ? (subjectList as Record<string, unknown>[]) : [],
    [subjectList],
  );

  const { data: studentList } = useFetch(
    currentSession && selectedClassName
      ? `/students/${currentSession._id}/${selectedClassName}`
      : null,
  );
  const students = useMemo(
    () =>
      Array.isArray(studentList) ? (studentList as Record<string, unknown>[]) : [],
    [studentList],
  );

  // --- State Management ---
  const [questions, setQuestions] = useState([
    { id: 1, outOf: 10, score: 0 },
    { id: 2, outOf: 10, score: 0 },
    { id: 3, outOf: 10, score: 0 },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [activeTool, setActiveTool] = useState<string | number>("check");
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Realistic handwritten script for testing
  const scriptUrl =
    "https://images.unsplash.com/photo-1588702547919-26089e690ecc?q=80&w=2070&auto=format&fit=crop";

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "red";
        context.lineWidth = 3;
        context.font = "bold 28px Arial";
        setCtx(context);
      }
    }
  }, []);

  // --- Helpers ---
  const totalScore = useMemo(
    () => questions.reduce((acc, q) => acc + (Number(q.score) || 0), 0),
    [questions],
  );
  const totalPossible = useMemo(
    () => questions.reduce((acc, q) => acc + (Number(q.outOf) || 0), 0),
    [questions],
  );

  const saveHistory = () => {
    if (canvasRef.current)
      setHistory([...history, canvasRef.current.toDataURL()]);
  };

  const handleCanvasAction = (e: React.MouseEvent) => {
    if (activeTool === "brush" || !ctx || !canvasRef.current) return;
    saveHistory();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (typeof activeTool === "number") {
      ctx.fillStyle = "#2563eb"; // Blue for scores
      ctx.fillText(activeTool.toString(), x, y);
    } else if (activeTool === "check") {
      ctx.fillStyle = "#16a34a";
      ctx.fillText("✔", x, y);
    } else if (activeTool === "x") {
      ctx.fillStyle = "#dc2626";
      ctx.fillText("✘", x, y);
    } else if (activeTool === "star") {
      ctx.fillStyle = "#d97706";
      ctx.fillText("★", x, y);
    }
  };

  const undo = () => {
    if (history.length === 0 || !ctx || !canvasRef.current) return;
    const previous = history[history.length - 1];
    const img = new Image();
    img.src = previous;
    img.onload = () => {
      ctx.clearRect(0, 0, 800, 1100);
      ctx.drawImage(img, 0, 0);
      setHistory(history.slice(0, -1));
    };
  };

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-slate-100">
      <header className="z-30 flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b bg-white px-3 py-2 shadow-sm sm:min-h-[4.5rem] sm:px-4 lg:h-20 lg:flex-nowrap lg:gap-4">
        <div className="flex shrink-0 items-center gap-2 border-slate-200 pr-2 sm:border-r sm:pr-4">
          <div
            className={`h-2 w-2 rounded-full ${mode === "online" ? "bg-green-500" : "bg-orange-500"} animate-pulse`}
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#004aaa]">
            {mode}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 overflow-x-auto py-1 sm:flex-nowrap lg:gap-2">
          <div className="flex h-10 min-w-[140px] max-w-full shrink-0 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-[#004aaa]">
            <span className="truncate">
              {currentSession?.name || "Session"}
            </span>
          </div>
          <Select
            value={selectedClassName || undefined}
            onValueChange={(v) => setSelectedClassName(v)}>
            <SelectTrigger className="h-10 w-[min(100%,140px)] shrink-0 sm:w-[140px]">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem
                  key={String(c._id || c.name)}
                  value={String(c.name)}>
                  {String(c.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger
              disabled={!selectedClassName}
              className="h-10 w-[min(100%,160px)] shrink-0 sm:w-[160px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem
                  key={String(s._id || s.subjectName)}
                  value={String(s.subjectName || s.name || "")}>
                  {String(s.subjectName || s.name || "Subject")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger
              disabled={!selectedClassName}
              className="h-10 w-[min(100%,220px)] shrink-0 sm:w-[220px]">
              <SelectValue placeholder="Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => {
                const label = `${String(s.studentName || s.name || "Student")} (${String(s.AdmNo || s.admNo || s._id || "")})`;
                return (
                  <SelectItem key={String(s._id || label)} value={label}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-full shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-white pt-2 sm:w-auto sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          {mode === "offline" && (
            <Button
              variant="outline"
              className="hidden gap-2 border-dashed border-slate-300 md:inline-flex">
              <UploadCloud size={16} /> Upload
            </Button>
          )}
          <Button className="h-10 flex-1 gap-2 bg-[#004aaa] font-bold shadow-lg hover:bg-[#004aaa]/90 sm:flex-initial sm:px-6">
            <Save size={16} /> Save Marks
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="order-2 flex w-full shrink-0 flex-col border-slate-200 bg-white shadow-xl sm:flex-row sm:overflow-x-auto lg:order-none lg:h-full lg:w-20 lg:flex-col lg:overflow-hidden lg:border-r">
          <div className="flex max-h-40 min-h-0 flex-1 flex-col border-b sm:max-h-none lg:h-1/2">
            <span className="bg-slate-50 p-2 text-center text-[9px] font-bold uppercase text-slate-400">
              Scores
            </span>
            <ScrollArea className="h-full w-full px-2">
              <div className="flex flex-row flex-wrap justify-center gap-2 py-2 lg:flex-col lg:flex-nowrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <Button
                    key={n}
                    onClick={() => setActiveTool(n)}
                    variant={activeTool === n ? "default" : "outline"}
                    className={`h-10 w-full rounded-lg font-black shrink-0 ${activeTool === n ? "bg-blue-600 shadow-md" : "text-slate-400 border-slate-100"}`}>
                    {n}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex max-h-40 min-h-0 flex-1 flex-col sm:max-h-none lg:h-1/2">
            <span className="bg-slate-50 p-2 text-center text-[9px] font-bold uppercase text-slate-400">
              Tools
            </span>
            <ScrollArea className="h-full w-full px-2">
              <div className="flex flex-row flex-wrap items-center justify-center gap-2 py-2 lg:flex-col lg:gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTool("check")}
                  className={`rounded-xl h-10 w-10 shrink-0 ${activeTool === "check" ? "bg-green-100 text-green-600 shadow-inner" : "text-slate-400"}`}>
                  <Check size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTool("x")}
                  className={`rounded-xl h-10 w-10 shrink-0 ${activeTool === "x" ? "bg-red-100 text-red-600 shadow-inner" : "text-slate-400"}`}>
                  <X size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTool("brush")}
                  className={`rounded-xl h-10 w-10 shrink-0 ${activeTool === "brush" ? "bg-blue-100 text-blue-600 shadow-inner" : "text-slate-400"}`}>
                  <Brush size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setActiveTool("star")}
                  className={`rounded-xl h-10 w-10 shrink-0 ${activeTool === "star" ? "bg-amber-100 text-amber-600 shadow-inner" : "text-slate-400"}`}>
                  <Star size={20} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={undo}
                  className="text-slate-300 hover:text-blue-600 shrink-0">
                  <Undo size={18} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => ctx?.clearRect(0, 0, 800, 1100)}
                  className="text-slate-300 hover:text-red-500 shrink-0">
                  <RotateCcw size={18} />
                </Button>
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* 3. CENTER VIEWPORT (IMAGE + CANVAS) */}
        <main className="order-1 flex min-h-0 min-w-0 flex-1 justify-center overflow-auto bg-slate-200 p-2 sm:p-4 lg:order-none lg:p-8">
          <div className="relative h-fit w-full max-w-[800px] rounded-sm bg-white shadow-2xl">
            <img
              src={scriptUrl}
              alt="Student Script"
              className="pointer-events-none absolute inset-0 h-full w-full max-w-full select-none object-cover opacity-90"
            />
            <canvas
              ref={canvasRef}
              width={800}
              height={1100}
              onClick={handleCanvasAction}
              className="relative z-10 h-auto w-full max-w-full cursor-crosshair"
            />
          </div>
        </main>

        <aside className="order-3 flex max-h-[42vh] w-full min-w-0 flex-col border-t border-slate-200 bg-white shadow-2xl sm:max-h-[50vh] lg:order-none lg:max-h-none lg:h-full lg:w-80 lg:border-l lg:border-t-0">
          <div className="p-6 bg-[#E8EBF3]/50 border-b">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Final Result
                </p>
                <h2 className="text-4xl font-black text-[#004aaa]">
                  {totalScore}{" "}
                  <span className="text-sm text-slate-300">
                    / {totalPossible}
                  </span>
                </h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Average
                </p>
                <p className="font-bold text-blue-600 text-lg">
                  {totalPossible > 0
                    ? Math.round((totalScore / totalPossible) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-5">
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:border-blue-300 group">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-[#004aaa] uppercase tracking-tighter">
                      Question {i + 1}
                    </span>
                    <button
                      onClick={() =>
                        setQuestions(questions.filter((x) => x.id !== q.id))
                      }
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p className="text-[9px] font-bold text-slate-400 mb-1">
                        LIMIT
                      </p>
                      <Input
                        type="number"
                        value={q.outOf}
                        onChange={(e) =>
                          setQuestions(
                            questions.map((x) =>
                              x.id === q.id
                                ? { ...x, outOf: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                        className="h-9 text-center bg-slate-50 border-none font-bold text-slate-600"
                      />
                    </div>
                    <div className="flex-[1.5]">
                      <p className="text-[9px] font-bold text-blue-500 mb-1">
                        AWARDED
                      </p>
                      <Input
                        type="number"
                        value={q.score}
                        onChange={(e) =>
                          setQuestions(
                            questions.map((x) =>
                              x.id === q.id
                                ? { ...x, score: Number(e.target.value) }
                                : x,
                            ),
                          )
                        }
                        className="h-9 text-center border-blue-100 focus:ring-blue-500 font-black text-blue-600 text-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  setQuestions([
                    ...questions,
                    { id: Date.now(), outOf: 10, score: 0 },
                  ])
                }
                className="w-full border-dashed border-2 py-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                <Plus className="mr-2" /> Add Question Row
              </Button>
            </div>
          </ScrollArea>

          <div className="p-4 bg-slate-50 border-t">
            <Button className="w-full bg-[#004aaa] h-12 font-bold shadow-lg shadow-blue-900/10">
              Finalize & Lock Marks
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
