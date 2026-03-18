import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vocabularyApi, VocabularyRequest } from "../../services/api/vocabularyApi";
import api from "../../services/api/axios";
import {
  ArrowLeft,
  Save,
  Loader2,
  Type,
  FileText,
  Volume2,
  Image as ImageIcon,
  BookOpen,
  Link,
  AlertTriangle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import { toast } from "sonner";

interface Lesson {
  id: number;
  title: string;
}

export default function TeacherVocabEditPage() {
  const { vocabId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [form, setForm] = useState<VocabularyRequest>({
    word: "",
    meaning: "",
    pronunciation: "",
    exampleSentence: "",
    imageUrl: "",
    audioUrl: "",
    lessonId: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vocab, lessonsRes] = await Promise.all([
          vocabularyApi.getById(Number(vocabId)),
          api.get("/lessons?page=0&size=100"),
        ]);
        
        setForm({
          word: vocab.word,
          meaning: vocab.meaning,
          pronunciation: vocab.pronunciation || "",
          exampleSentence: vocab.exampleSentence || "",
          imageUrl: vocab.imageUrl || "",
          audioUrl: vocab.audioUrl || "",
          lessonId: vocab.lessonId,
        });
        setLessons(lessonsRes.data.data.content || []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin từ vựng");
      } finally {
        setLoading(false);
        setLessonsLoading(false);
      }
    };
    fetchData();
  }, [vocabId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.word.trim() || !form.meaning.trim() || !form.lessonId) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    setSaving(true);
    try {
      await vocabularyApi.update(Number(vocabId), {
        ...form,
        word: form.word.trim(),
        meaning: form.meaning.trim(),
        pronunciation: form.pronunciation?.trim() || undefined,
        exampleSentence: form.exampleSentence?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        audioUrl: form.audioUrl?.trim() || undefined,
      });
      toast.success("Cập nhật từ vựng thành công");
      navigate(`/teacher/vocabulary?lessonId=${form.lessonId}`);
    } catch (error) {
      console.error(error);
      toast.error("Lưu từ vựng thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
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
              Chỉnh sửa từ vựng
            </h1>
            <p className="font-medium mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {form.word}
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
              <div className="flex items-center gap-3 text-amber-500 pb-2 border-b border-[var(--color-border)]">
                <Type className="w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-wider">Thông tin từ vựng</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                    Từ vựng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.word}
                    onChange={(e) => setForm({ ...form, word: e.target.value })}
                    className="input-field h-14 text-lg font-bold"
                    required
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                    Nghĩa của từ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.meaning}
                    onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                    className="input-field h-14 text-lg font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Phiên âm
                </label>
                <div className="relative group">
                  <Volume2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                  <input
                    type="text"
                    value={form.pronunciation}
                    onChange={(e) => setForm({ ...form, pronunciation: e.target.value })}
                    className="input-field pl-12 h-14 italic"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Câu ví dụ
                </label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-5 w-5 h-5 text-[var(--color-text-secondary)]" />
                  <textarea
                    rows={3}
                    value={form.exampleSentence}
                    onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
                    className="input-field pl-12 pt-4 min-h-[100px] leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 space-y-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-blue-500 pb-2 border-b border-[var(--color-border)]">
                <Link className="w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-wider">Đa phương tiện</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                    URL Hình ảnh
                  </label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                    <input
                      type="url"
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className="input-field pl-12 h-14 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                    URL Âm thanh
                  </label>
                  <div className="relative group">
                    <Volume2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                    <input
                      type="url"
                      value={form.audioUrl}
                      onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                      className="input-field pl-12 h-14 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 space-y-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm">
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-purple-500 pb-2 border-b border-[var(--color-border)]">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-lg font-black uppercase tracking-wider">Gắn vào bài học</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
                  Chọn bài học <span className="text-red-500">*</span>
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
            </div>
          </Card>

          <Card className="p-8 bg-blue-500/5 border-blue-500/20 rounded-[2.5rem] shadow-none">
            <h3 className="font-black text-blue-500 mb-2 uppercase tracking-tight">Mẹo</h3>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Hãy duy trì tính nhất quán trong cách giải thích nghĩa và đặt câu ví dụ để học sinh dễ dàng nắm bắt mạch kiến thức của toàn bộ bài học.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}
