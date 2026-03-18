import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api/axios";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  contentHtml?: string;
  grammarHtml?: string;
  difficultyLevel?: number;
  orderIndex?: number;
  isPublished?: boolean;
  vocabularyCount?: number;
  questionCount?: number;
}

export default function TeacherLessonsPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/lessons?page=0&size=100");
      setLessons(res.data.data.content || []);
    } catch {
      setError("Không thể tải danh sách bài học.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const openCreate = () => {
    navigate("/teacher/lessons/create");
  };

  const openEdit = (lesson: Lesson) => {
    navigate(`/teacher/lessons/${lesson.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await api.delete(`/lessons/${id}`);
      await fetchLessons();
    } catch {
      alert("Xóa thất bại.");
    }
  };

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p style={{ color: "var(--color-text-secondary)" }}>{error}</p>
        <button
          onClick={fetchLessons}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const columns = [
    {
      key: "title",
      label: "Tiêu đề",
      render: (item: Record<string, unknown>) => (
        <span className="font-bold" style={{ color: "var(--color-text)" }}>
          {item.title as string}
        </span>
      ),
    },
    {
      key: "difficultyLevel",
      label: "Độ khó",
      render: (item: Record<string, unknown>) => {
        const lvl = (item.difficultyLevel as number) || 1;
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${i < lvl ? "bg-amber-400" : "bg-[var(--color-bg-tertiary)]"}`}
              />
            ))}
            <span
              className="ml-2 text-xs font-bold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Lvl {lvl}
            </span>
          </div>
        );
      },
    },
    {
      key: "isPublished",
      label: "Trạng thái",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isPublished ? "success" : "warning"} className="font-black uppercase tracking-tight text-[10px]">
          {item.isPublished ? "Đã xuất bản" : "Nháp"}
        </Badge>
      ),
    },
    {
      key: "orderIndex",
      label: "Thứ tự",
      render: (item: Record<string, unknown>) => (
        <span className="font-mono font-bold" style={{ color: "var(--color-text-secondary)" }}>
          #{(item.orderIndex as number) ?? 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: Record<string, unknown>) => {
        const lesson = item as unknown as Lesson;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/teacher/vocabulary?lessonId=${lesson.id}`);
              }}
              className="p-2 rounded-lg hover:bg-blue-500/15 text-blue-400 transition-colors"
              title="Từ vựng"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/teacher/questions?lessonId=${lesson.id}`);
              }}
              className="p-2 rounded-lg hover:bg-purple-500/15 text-purple-400 transition-colors"
              title="Câu hỏi"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(lesson);
              }}
              className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
              title="Sửa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(lesson.id);
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
            Quản lý bài học
            <Badge variant="default" className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
              {lessons.length} BÀI HỌC
            </Badge>
          </h1>
          <p className="font-medium mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
            Tạo và biên tập nội dung giảng dạy, từ vựng và câu hỏi bài tập
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-3 px-8 py-3.5 rounded-2xl text-white font-black transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-500"
        >
          <Plus className="w-5 h-5" />
          <span>Tạo bài học mới</span>
        </button>
      </div>

      {/* Table Section */}
      <Card className="p-2 shadow-sm rounded-[2.5rem] overflow-hidden border-[var(--color-border)]" hover={false}>
        <DataTable
          columns={columns}
          data={lessons as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="Chưa có bài học nào được tạo."
        />
      </Card>
    </div>
  );
}
