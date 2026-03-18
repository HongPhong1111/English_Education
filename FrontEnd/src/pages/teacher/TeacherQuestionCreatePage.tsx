import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { questionApi, QuestionRequest } from "../../services/api/questionApi";
import api from "../../services/api/axios";
import {
  ArrowLeft,
  Plus,
  Loader2,
  HelpCircle,
  BookOpen,
  PlusCircle,
  XCircle,
  CheckCircle2,
  Lightbulb,
  Award,
} from "lucide-react";
import Card from "../../components/ui/Card";
import { toast } from "sonner";

interface Lesson {
  id: number;
  title: string;
}

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Trắc nghiệm" },
  { value: "TRUE_FALSE", label: "Đúng / Sai" },
  { value: "FILL_IN_BLANK", label: "Điền từ" },
];

export default function TeacherQuestionCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonIdFromUrl = searchParams.get("lessonId");

  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  
  const [form, setForm] = useState<QuestionRequest>({
    lessonId: lessonIdFromUrl ? Number(lessonIdFromUrl) : undefined,
    questionType: "MULTIPLE_CHOICE",
    questionText: "",
    points: 1,
    explanation: "",
    options: [
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
  });

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get("/lessons?page=0&size=100");
        setLessons(res.data.data.content || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLessonsLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.questionText.trim() || !form.lessonId) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    const validOptions = form.options.filter(o => o.optionText.trim());
    if (validOptions.length < 2 && form.questionType !== "FILL_IN_BLANK") {
        toast.error("Vui lòng cung cấp ít nhất 2 đáp án");
        return;
    }

    const hasCorrect = validOptions.some(o => o.isCorrect);
    if (!hasCorrect && form.questionType !== "FILL_IN_BLANK") {
        toast.error("Vui lòng chọn ít nhất một đáp án đúng");
        return;
    }

    setLoading(true);
    try {
      await questionApi.create({
        ...form,
        options: validOptions,
      });
      toast.success("Tạo câu hỏi thành công");
      navigate(`/teacher/questions?lessonId=${form.lessonId}`);
    } catch (error) {
      console.error(error);
      toast.error("Lưu câu hỏi thất bại");
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setForm({
      ...form,
      options: [...form.options, { optionText: "", isCorrect: false }],
    });
  };

  const removeOption = (idx: number) => {
    setForm({
      ...form,
      options: form.options.filter((_, i) => i !== idx),
    });
  };

  const updateOption = (idx: number, field: "optionText" | "isCorrect", value: any) => {
    const newOptions = [...form.options];
    if (field === "isCorrect" && form.questionType === "TRUE_FALSE") {
        // Only one can be correct for True/False usually, but let's keep it simple
        newOptions.forEach((o, i) => o.isCorrect = i === idx ? value : false);
    } else {
        newOptions[idx] = { ...newOptions[idx], [field]: value };
    }
    setForm({ ...form, options: newOptions });
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl hover:bg-[var(--color-bg-secondary)] border border-transparent hover:border-[var(--color-border)] transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-text)" }}>
              Tạo câu hỏi mới
            </h1>
            <p className="font-medium mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Thiết kế câu hỏi và đáp án cho bài kiểm tra
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          <span>Tạo câu hỏi</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 space-y-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-blue-500 pb-2 border-b border-[var(--color-border)]">
                <HelpCircle className="w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-wider">Nội dung câu hỏi</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Câu hỏi <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  placeholder="Nhập nội dung câu hỏi tại đây..."
                  className="input-field pt-4 leading-relaxed font-bold text-lg min-h-[120px]"
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Giải thích đáp án
                </label>
                <textarea
                  rows={3}
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Giải thích tại sao đáp án này lại đúng..."
                  className="input-field pt-4 leading-relaxed italic"
                />
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <h2 className="text-lg font-black uppercase tracking-wider">Đáp án & Lựa chọn</h2>
                </div>
                {form.questionType === "MULTIPLE_CHOICE" && (
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs hover:bg-emerald-500/20 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Thêm lựa chọn
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="shrink-0">
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={(e) => updateOption(idx, "isCorrect", e.target.checked)}
                        className="w-6 h-6 rounded-lg border-[var(--color-border)] bg-[var(--color-bg-tertiary)] checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer accent-emerald-500"
                        title="Đánh dấu là đáp án đúng"
                      />
                    </div>
                    <div className="flex-1 relative">
                       <input
                        type="text"
                        value={opt.optionText}
                        onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                        placeholder={`Đáp án ${idx + 1}`}
                        className={`input-field h-14 ${opt.isCorrect ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
                      />
                    </div>
                    {form.options.length > 2 && form.questionType === "MULTIPLE_CHOICE" && (
                      <button
                        type="button"
                        onClick={() => removeOption(idx)}
                        className="p-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 space-y-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-purple-500 pb-2 border-b border-[var(--color-border)]">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-wider">Cấu hình</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Gắn vào bài học <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.lessonId || ""}
                  onChange={(e) => setForm({ ...form, lessonId: e.target.value ? Number(e.target.value) : undefined })}
                  disabled={lessonsLoading}
                  className="input-field h-14 appearance-none font-bold"
                  required
                >
                  <option value="">-- Chọn bài học --</option>
                  {lessons.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Loại câu hỏi
                </label>
                <select
                  value={form.questionType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    let newOptions = [...form.options];
                    if (newType === "TRUE_FALSE") {
                       newOptions = [
                           { optionText: "True", isCorrect: true },
                           { optionText: "False", isCorrect: false }
                       ];
                    } else if (newType === "FILL_IN_BLANK") {
                        newOptions = [{ optionText: "", isCorrect: true }];
                    } else if (form.questionType !== "MULTIPLE_CHOICE") {
                        newOptions = [
                            { optionText: "", isCorrect: false },
                            { optionText: "", isCorrect: false }
                        ];
                    }
                    setForm({ ...form, questionType: newType, options: newOptions });
                  }}
                  className="input-field h-14 appearance-none font-bold"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

               <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Số điểm
                </label>
                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                  <input
                    type="number"
                    min={1}
                    value={form.points}
                    onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                    className="input-field pl-12 h-14 font-black"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-blue-500/5 border-blue-500/20 rounded-[2.5rem] shadow-none">
            <div className="flex items-center gap-3 text-blue-500 mb-3">
               <Lightbulb className="w-5 h-5" />
               <h3 className="font-black uppercase tracking-tight">Gợi ý</h3>
            </div>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              {form.questionType === "MULTIPLE_CHOICE" && "Sử dụng nhiều hơn 2 lựa chọn để tăng độ thử thách cho câu hỏi."}
              {form.questionType === "TRUE_FALSE" && "Câu hỏi Đúng/Sai thường được dùng để kiểm tra kiến thức về các sự kiện hoặc định nghĩa cơ bản."}
              {form.questionType === "FILL_IN_BLANK" && "Nhập đáp án đúng vào ô bên dưới. Học sinh sẽ phải nhập chính xác từ này."}
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}
