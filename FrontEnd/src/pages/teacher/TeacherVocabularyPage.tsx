import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  vocabularyApi,
  VocabularyResponse,
} from "../../services/api/vocabularyApi";
import api from "../../services/api/axios";
import DataTable from "../../components/ui/DataTable";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  BookOpen,
  Inbox,
  Loader2,
  Type,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
}

export default function TeacherVocabularyPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLessonId = searchParams.get("lessonId") || "";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>(initialLessonId);
  const [vocabulary, setVocabulary] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    setLessonsLoading(true);
    try {
      const res = await api.get("/lessons?page=0&size=100");
      setLessons(res.data.data.content || []);
    } catch {
      /* ignore */
    } finally {
      setLessonsLoading(false);
    }
  }, []);

  const fetchVocabulary = useCallback(async (lessonId: string) => {
    if (!lessonId) {
      setVocabulary([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await vocabularyApi.getByLesson(parseInt(lessonId));
      setVocabulary(data);
    } catch {
      setError("Không thể tải từ vựng.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    fetchVocabulary(selectedLesson);
  }, [selectedLesson, fetchVocabulary]);

  const handleLessonChange = (val: string) => {
    setSelectedLesson(val);
    if (val) {
      setSearchParams({ lessonId: val });
    } else {
      setSearchParams({});
    }
  };

  const openCreate = () => {
    navigate(`/teacher/vocabulary/create?lessonId=${selectedLesson}`);
  };

  const openEdit = (v: VocabularyResponse) => {
    navigate(`/teacher/vocabulary/${v.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa từ vựng này?")) return;
    try {
      await vocabularyApi.delete(id);
      await fetchVocabulary(selectedLesson);
    } catch {
      alert("Xóa thất bại.");
    }
  };

  const columns = [
    {
      key: "word",
      label: "Từ vựng",
      render: (item: Record<string, unknown>) => (
        <span className="font-bold text-lg" style={{ color: "var(--color-text)" }}>
          {item.word as string}
        </span>
      ),
    },
    {
      key: "meaning",
      label: "Nghĩa",
      render: (item: Record<string, unknown>) => (
        <span className="font-medium" style={{ color: "var(--color-text-secondary)" }}>
          {item.meaning as string}
        </span>
      ),
    },
    {
      key: "pronunciation",
      label: "Phát âm",
      render: (item: Record<string, unknown>) => (
        <span
          className="italic font-mono text-sm px-2 py-1 rounded-md bg-[var(--color-bg-tertiary)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {(item.pronunciation as string) || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: Record<string, unknown>) => {
        const v = item as unknown as VocabularyResponse;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(v);
              }}
              className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
              title="Sửa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(v.id);
              }}
              className="p-2 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[var(--color-bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--color-border)] shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-4" style={{ color: "var(--color-text)" }}>
            Quản lý từ vựng
            {selectedLesson && (
              <Badge variant="default" className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                {vocabulary.length} TỪ VỰNG
              </Badge>
            )}
          </h1>
          <p className="font-medium mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
            {selectedLesson
              ? `Đang xem danh sách từ vựng cho bài học đã chọn`
              : "Chọn bài học để bắt đầu quản lý kho từ vựng và đa phương tiện"}
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={!selectedLesson}
          className="flex items-center gap-3 px-8 py-3.5 rounded-2xl text-white font-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/25 bg-amber-500 hover:bg-amber-400 disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm từ vựng</span>
        </button>
      </div>

      {/* Control Bar */}
      <Card className="p-4 rounded-[2rem] border-[var(--color-border)] shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 relative group">
            <select
              value={selectedLesson}
              onChange={(e) => handleLessonChange(e.target.value)}
              disabled={lessonsLoading}
              className="input-field h-12 pr-10 appearance-none font-bold text-sm bg-transparent"
            >
              <option value="">-- Chọn bài học để quản lý --</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-secondary)]">
              {lessonsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "▼"}
            </div>
          </div>
        </div>
        
        {selectedLesson && (
           <div className="hidden lg:flex items-center gap-3 px-6 py-2 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <Type className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                Chế độ quản lý từ vựng
              </span>
           </div>
        )}
      </Card>

      {/* Content Section */}
      {!selectedLesson ? (
        <Card className="p-20 rounded-[2.5rem] border-dashed border-2 border-[var(--color-border)] bg-transparent">
          <EmptyState
            icon={<Inbox className="w-16 h-16 text-[var(--color-text-secondary)] opacity-20" />}
            title="Sẵn sàng quản lý"
            description="Hãy chọn một bài học cụ thể từ danh sách bên trên để bắt đầu thêm, sửa hoặc xóa dữ liệu từ vựng."
          />
        </Card>
      ) : error ? (
        <Card className="p-20 rounded-[2.5rem] border-red-500/20 bg-red-500/5">
          <div className="flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <p className="font-bold text-red-500">{error}</p>
            <button
              onClick={() => fetchVocabulary(selectedLesson)}
              className="px-6 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
            >
              Thử lại
            </button>
          </div>
        </Card>
      ) : (
        <Card className="p-2 shadow-sm rounded-[2.5rem] overflow-hidden border-[var(--color-border)]" hover={false}>
          <DataTable
            columns={columns}
            data={vocabulary as unknown as Record<string, unknown>[]}
            loading={loading}
            emptyMessage="Bài học này chưa có từ vựng nào."
          />
        </Card>
      )}
    </div>
  );
}
