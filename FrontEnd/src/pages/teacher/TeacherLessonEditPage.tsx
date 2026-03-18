import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api/axios";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  Layout,
  Globe,
  Star,
  Hash,
  AlertTriangle,
  Eye,
  Edit2,
  FileText,
} from "lucide-react";
import Card from "../../components/ui/Card";
import { toast } from "sonner";

export default function TeacherLessonEditPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [form, setForm] = useState({
    title: "",
    contentHtml: "",
    grammarHtml: "",
    difficultyLevel: 1,
    orderIndex: 0,
    isPublished: false,
  });

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/lessons/${lessonId}`);
        const lesson = res.data.data;
        setForm({
          title: lesson.title,
          contentHtml: lesson.contentHtml || "",
          grammarHtml: lesson.grammarHtml || "",
          difficultyLevel: lesson.difficultyLevel ?? 1,
          orderIndex: lesson.orderIndex ?? 0,
          isPublished: lesson.isPublished ?? false,
        });
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin bài học");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/lessons/${lessonId}`, form);
      toast.success("Cập nhật bài học thành công");
      navigate("/teacher/lessons");
    } catch (error) {
      console.error(error);
      toast.error("Lưu bài học thất bại");
    } finally {
      setSaving(false);
    }
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
          <p className="text-[var(--color-text-secondary)] font-medium max-w-md mx-auto line-clamp-2">
            {error}
          </p>
        </div>
        <button
          onClick={() => navigate("/teacher/lessons")}
          className="px-8 py-3.5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] font-black hover:bg-[var(--color-bg-tertiary)] transition-all flex items-center gap-2 group"
          style={{ color: "var(--color-text)" }}
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
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
            onClick={() => navigate("/teacher/lessons")}
            className="p-2.5 rounded-2xl hover:bg-[var(--color-bg-secondary)] border border-transparent hover:border-[var(--color-border)] transition-all active:scale-95 group"
          >
            <ArrowLeft className="w-6 h-6 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-text)" }}>
              Chỉnh sửa bài học
            </h1>
            <p className="font-medium mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {form.title}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 space-y-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm overflow-hidden" hover={false}>
            {/* Mode Switcher */}
            <div className="flex items-center p-1.5 bg-[var(--color-bg-tertiary)] rounded-2xl w-fit">
              <button
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                  viewMode === "edit"
                    ? "bg-[var(--color-bg)] text-blue-500 shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <Edit2 className="w-4 h-4" />
                CHỈNH SỬA
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                  viewMode === "preview"
                    ? "bg-[var(--color-bg)] text-blue-500 shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                }`}
              >
                <Eye className="w-4 h-4" />
                XEM TRƯỚC
              </button>
            </div>

            {viewMode === "edit" ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 text-blue-500 pb-2 border-b border-[var(--color-border)]">
                  <BookOpen className="w-5 h-5" />
                  <h2 className="text-lg font-black uppercase tracking-wider">Thông tin chính</h2>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                    Tiêu đề bài học
                  </label>
                  <div className="relative group">
                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)] group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="Nhập tiêu đề..."
                      className="input-field pl-12 h-14 text-lg font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                    Nội dung bài học (HTML)
                  </label>
                  <textarea
                    rows={10}
                    value={form.contentHtml}
                    onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                    placeholder="Nhập nội dung giảng dạy bằng HTML..."
                    className="input-field p-6 min-h-[300px] font-mono leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                    Ngữ pháp (HTML)
                  </label>
                  <textarea
                    rows={6}
                    value={form.grammarHtml}
                    onChange={(e) => setForm({ ...form, grammarHtml: e.target.value })}
                    placeholder="Nhập lý thuyết ngữ pháp bằng HTML..."
                    className="input-field p-6 min-h-[200px] font-mono leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-fadeIn min-h-[600px]">
                {/* Content Preview */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-blue-500 pb-2 border-b border-[var(--color-border)]">
                    <BookOpen className="w-5 h-5" />
                    <h2 className="text-lg font-black uppercase tracking-wider">Nội dung hiển thị</h2>
                  </div>
                  <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-8 border border-[var(--color-border)]">
                    <h1 className="text-3xl font-black mb-6" style={{ color: "var(--color-text)" }}>{form.title || "Tiêu đề bài học"}</h1>
                    {form.contentHtml ? (
                      <div
                        className="prose prose-sm max-w-none text-[var(--color-text)]"
                        dangerouslySetInnerHTML={{ __html: form.contentHtml }}
                      />
                    ) : (
                      <p className="text-center py-12 text-[var(--color-text-secondary)] italic">Chưa có nội dung để hiển thị.</p>
                    )}
                  </div>
                </div>

                {/* Grammar Preview */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-indigo-500 pb-2 border-b border-[var(--color-border)]">
                    <FileText className="w-5 h-5" />
                    <h2 className="text-lg font-black uppercase tracking-wider">Ngữ pháp hiển thị</h2>
                  </div>
                  <div className="bg-[var(--color-bg-secondary)] rounded-3xl p-8 border border-[var(--color-border)]">
                    {form.grammarHtml ? (
                      <div
                        className="prose prose-sm max-w-none text-[var(--color-text)]"
                        dangerouslySetInnerHTML={{ __html: form.grammarHtml }}
                      />
                    ) : (
                      <p className="text-center py-12 text-[var(--color-text-secondary)] italic">Chưa có nội dung ngữ pháp để hiển thị.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 space-y-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm" hover={false}>
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-amber-500 pb-2 border-b border-[var(--color-border)]">
                <Globe className="w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-wider">Cài đặt</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Độ khó
                </label>
                <div className="relative group">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                  <select
                    value={form.difficultyLevel}
                    onChange={(e) => setForm({ ...form, difficultyLevel: parseInt(e.target.value) })}
                    className="input-field pl-12 h-14 appearance-none font-bold"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>Cấp độ {n}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Thứ tự hiển thị
                </label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                  <input
                    type="number"
                    min={0}
                    value={form.orderIndex}
                    onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
                    className="input-field pl-12 h-14 font-bold"
                  />
                </div>
              </div>

              <div 
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                  form.isPublished 
                    ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-500" 
                    : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:border-emerald-500/30"
                }`}
                onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black uppercase tracking-widest text-xs">Trạng thái</p>
                    <p className="text-lg font-bold mt-1">
                      {form.isPublished ? "Đã công bố" : "Đang xử lý"}
                    </p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${form.isPublished ? "bg-emerald-500" : "bg-[var(--color-border)]"}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.isPublished ? "left-7" : "left-1"}`} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-blue-500/5 border-blue-500/20 rounded-[2.5rem] shadow-none" hover={false}>
            <h3 className="font-black text-blue-500 mb-2 uppercase tracking-tight">Mẹo soạn thảo</h3>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Đừng quên kiểm tra kỹ các thẻ HTML trước khi cập nhật. Mọi thay đổi sẽ có hiệu lực ngay lập tức đối với học sinh nếu bài học đang ở trạng thái 'Đã công bố'.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

