import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Plus,
} from "lucide-react";
import Card from "../../components/ui/Card";
import { toast } from "sonner";

interface Lesson {
  id: number;
  title: string;
}

export default function TeacherVocabCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonIdFromUrl = searchParams.get("lessonId");

  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [form, setForm] = useState<VocabularyRequest>({
    word: "",
    meaning: "",
    pronunciation: "",
    exampleSentence: "",
    imageUrl: "",
    audioUrl: "",
    lessonId: lessonIdFromUrl ? Number(lessonIdFromUrl) : undefined,
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
    if (!form.word.trim() || !form.meaning.trim() || !form.lessonId) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    setLoading(true);
    try {
      await vocabularyApi.create({
        ...form,
        word: form.word.trim(),
        meaning: form.meaning.trim(),
        pronunciation: form.pronunciation?.trim() || undefined,
        exampleSentence: form.exampleSentence?.trim() || undefined,
        imageUrl: form.imageUrl?.trim() || undefined,
        audioUrl: form.audioUrl?.trim() || undefined,
      });
      toast.success("Thêm từ vựng thành công");
      navigate(`/teacher/vocabulary?lessonId=${form.lessonId}`);
    } catch (error) {
      console.error(error);
      toast.error("Lưu từ vựng thất bại");
    } finally {
      setLoading(false);
    }
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
              Thêm từ vựng
            </h1>
            <p className="font-medium mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Bổ sung từ mới vào kho ngữ liệu của bài học
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/25 bg-amber-500 hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          <span>Thêm từ vựng</span>
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
                    placeholder="E.g. Beautiful"
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
                    placeholder="E.g. Xinh đẹp"
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
                    placeholder="/ˈbjuːtɪfl/"
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
                    placeholder="Enter an example sentence..."
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
                      placeholder="https://example.com/image.jpg"
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
                      placeholder="https://example.com/audio.mp3"
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
                {lessonsLoading && (
                  <p className="text-xs font-medium text-blue-500 animate-pulse">Đang tải danh sách bài học...</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-amber-500/5 border-amber-500/20 rounded-[2.5rem] shadow-none">
            <h3 className="font-black text-amber-500 mb-2 uppercase tracking-tight">Lưu ý</h3>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              Từ vựng nên bao gồm phiên âm và câu ví dụ để giúp học sinh ghi nhớ tốt hơn. Bạn có thể sử dụng các nguồn như Oxford hoặc Cambridge Dictionary để lấy thông tin chính xác.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}
