import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { questionApi, QuestionRequest } from "../../services/api/questionApi";
import api from "../../services/api/axios";
import {
  ArrowLeft,
  Save,
  Loader2,
  HelpCircle,
  BookOpen,
  PlusCircle,
  XCircle,
  CheckCircle2,
  Lightbulb,
  Award,
  AlertTriangle,
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

export default function TeacherQuestionEditPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  
  const [form, setForm] = useState<QuestionRequest>({
    lessonId: undefined,
    questionType: "MULTIPLE_CHOICE",
    questionText: "",
    points: 1,
    explanation: "",
    options: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [question, lessonsRes] = await Promise.all([
          questionApi.getById(Number(questionId)),
          api.get("/lessons?page=0&size=100"),
        ]);
        
        setForm({
          lessonId: question.lessonId,
          questionType: question.questionType,
          questionText: question.questionText,
          points: question.points || 1,
          explanation: question.explanation || "",
          options: question.options.map(o => ({
            optionText: o.optionText,
            isCorrect: o.isCorrect,
          })),
        });
        setLessons(lessonsRes.data.data.content || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin câu hỏi");
      } finally {
        setLoading(false);
        setLessonsLoading(false);
      }
    };
    fetchData();
  }, [questionId]);

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

    setSaving(true);
    try {
      await questionApi.update(Number(questionId), {
        ...form,
        options: validOptions,
      });
      toast.success("Cập nhật câu hỏi thành công");
      navigate(`/teacher/questions?lessonId=${form.lessonId}`);
    } catch (error) {
      console.error(error);
      toast.error("Lưu câu hỏi thất bại");
    } finally {
      setSaving(false);
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
        newOptions.forEach((o, i) => o.isCorrect = i === idx ? value : false);
    } else {
        newOptions[idx] = { ...newOptions[idx], [field]: value };
    }
    setForm({ ...form, options: newOptions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fadeIn">
        <div className="p-6 rounded-[2.5rem] bg-red-500/10 border-2 border-red-500/20 shadow-2xl shadow-red-500/10">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-[var(--color-text)]">Đã có lỗi xảy ra</h1>
          <p className="text-[var(--color-text-secondary)] font-medium max-w-md mx-auto">
            {error}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3.5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] font-black hover:bg-[var(--color-bg-tertiary)] transition-all flex items-center gap-2 group"
          style={{ color: "var(--color-text)" }}
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </button>
      </div>
    );
  }

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
              Chỉnh sửa câu hỏi
            </h1>
            <p className="font-medium mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Cập nhật nội dung và đáp án cho bài kiểm tra
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/25 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Cập nhật</span>
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
                         if (newOptions.length < 2) {
                             newOptions = [
                                { optionText: "", isCorrect: false },
                                { optionText: "", isCorrect: false }
                            ];
                         }
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
              Duy trì hệ thống câu hỏi phong phú giúp học sinh không bị nhàm chán và có cái nhìn đa chiều về nội dung bài học.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}
