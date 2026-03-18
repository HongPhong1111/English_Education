import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  questionApi,
  QuestionResponse,
} from "../../services/api/questionApi";
import api from "../../services/api/axios";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Filter,
  Search,
  BookOpen,
  LayoutGrid,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
}

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Trắc nghiệm" },
  { value: "TRUE_FALSE", label: "Đúng / Sai" },
  { value: "FILL_IN_BLANK", label: "Điền từ" },
];

export default function QuestionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLessonId = searchParams.get("lessonId") || "";

  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterLesson, setFilterLesson] = useState<string>(initialLessonId);
  const [filterType, setFilterType] = useState<string>("");

  const fetchLessons = useCallback(async () => {
    try {
      const res = await api.get("/lessons?page=0&size=100");
      setLessons(res.data.data.content || []);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await questionApi.getAll();
      setQuestions(data);
    } catch {
      setError("Không thể tải danh sách câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
    fetchQuestions();
  }, [fetchLessons, fetchQuestions]);

  const handleLessonFilterChange = (val: string) => {
    setFilterLesson(val);
    if (val) {
      setSearchParams({ lessonId: val });
    } else {
      setSearchParams({});
    }
  };

  // Filtered questions
  const filtered = questions.filter((q) => {
    if (filterLesson && q.lessonId?.toString() !== filterLesson) return false;
    if (filterType && q.questionType !== filterType) return false;
    return true;
  });

  const openCreate = () => {
    navigate(`/teacher/questions/create?lessonId=${filterLesson}`);
  };

  const openEdit = (q: QuestionResponse) => {
    navigate(`/teacher/questions/${q.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await questionApi.delete(id);
      await fetchQuestions();
    } catch {
      alert("Xóa thất bại.");
    }
  };

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fadeIn">
        <div className="p-6 rounded-[2.5rem] bg-red-500/10 border-2 border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <p className="font-bold text-red-500">{error}</p>
        <button
          onClick={fetchQuestions}
          className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const columns = [
    {
      key: "questionText",
      label: "Câu hỏi",
      render: (item: Record<string, unknown>) => {
        const text = item.questionText as string;
        return (
          <div className="max-w-md">
            <p className="font-bold leading-relaxed line-clamp-2" style={{ color: "var(--color-text)" }}>
              {text}
            </p>
          </div>
        );
      },
    },
    {
      key: "questionType",
      label: "Loại",
      render: (item: Record<string, unknown>) => {
        const type = item.questionType as string;
        const variant =
          type === "MULTIPLE_CHOICE"
            ? "info"
            : type === "TRUE_FALSE"
              ? "success"
              : "warning";
        const label =
          QUESTION_TYPES.find((t) => t.value === type)?.label || type;
        return (
            <Badge variant={variant} className="font-black uppercase tracking-tight text-[10px] px-3">
                {label}
            </Badge>
        );
      },
    },
    {
      key: "points",
      label: "Điểm",
      render: (item: Record<string, unknown>) => (
        <Badge variant="default" className="font-mono font-black bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
          {(item.points as number) ?? 1} pts
        </Badge>
      ),
    },
    {
      key: "lessonTitle",
      label: "Bài học",
      render: (item: Record<string, unknown>) => (
        <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          {(item.lessonTitle as string) || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: Record<string, unknown>) => {
        const q = item as unknown as QuestionResponse;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(q);
              }}
              className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
              title="Sửa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(q.id);
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[var(--color-bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--color-border)] shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-4" style={{ color: "var(--color-text)" }}>
            Ngân hàng câu hỏi
            <Badge variant="default" className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
              {filtered.length} CÂU HỎI
            </Badge>
          </h1>
          <p className="font-medium mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
            Xây dựng kho câu hỏi đa dạng để đánh giá năng lực học sinh
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-3 px-8 py-3.5 rounded-2xl text-white font-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/25 bg-amber-500 hover:bg-amber-400"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo câu hỏi mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 rounded-[2rem] border-[var(--color-border)] shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex flex-wrap items-center gap-6 flex-1">
            <div className="flex items-center gap-3 min-w-[280px]">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                    <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1 relative group">
                    <select
                        value={filterLesson}
                        onChange={(e) => handleLessonFilterChange(e.target.value)}
                        className="input-field h-12 pr-10 appearance-none font-bold text-xs bg-transparent"
                    >
                        <option value="">Tất cả bài học</option>
                        {lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.title}
                        </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-secondary)]">
                        ▼
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 min-w-[200px]">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                    <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="flex-1 relative group">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="input-field h-12 pr-10 appearance-none font-bold text-xs bg-transparent"
                    >
                        <option value="">Tất cả loại câu hỏi</option>
                        {QUESTION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-secondary)]">
                        ▼
                    </div>
                </div>
            </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 px-6 py-2 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <Search className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                Bộ lọc nâng cao
              </span>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="p-2 shadow-sm rounded-[2.5rem] overflow-hidden border-[var(--color-border)]" hover={false}>
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="Không tìm thấy câu hỏi nào phù hợp với bộ lọc."
        />
      </Card>
    </div>
  );
}
