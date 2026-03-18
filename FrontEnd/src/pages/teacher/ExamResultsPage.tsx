import { useState, useEffect, useCallback, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examApi, ExamResponse, ExamResultResponse, AntiCheatEvent } from '../../services/api/examApi'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card from '../../components/ui/Card'
import {
    Loader2,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Trophy,
    Inbox,
    Users,
    TrendingUp,
    FileText,
} from 'lucide-react'

export default function ExamResultsPage() {
    const { examId } = useParams<{ examId: string }>()
    const navigate = useNavigate()

    const [exam, setExam] = useState<ExamResponse | null>(null)
    const [results, setResults] = useState<ExamResultResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Expandable anti-cheat
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [antiCheatEvents, setAntiCheatEvents] = useState<AntiCheatEvent[]>([])
    const [eventsLoading, setEventsLoading] = useState(false)

    const fetchData = useCallback(async () => {
        if (!examId) return
        setLoading(true)
        setError(null)
        try {
            const [examInfo, examResults] = await Promise.all([
                examApi.getById(parseInt(examId)),
                examApi.getResults(parseInt(examId)),
            ])
            setExam(examInfo)
            setResults(examResults)
        } catch {
            setError('Không thể tải kết quả bài thi.')
        } finally {
            setLoading(false)
        }
    }, [examId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const toggleExpand = async (resultId: number) => {
        if (expandedId === resultId) {
            setExpandedId(null)
            setAntiCheatEvents([])
            return
        }
        setExpandedId(resultId)
        setEventsLoading(true)
        try {
            const events = await examApi.getAntiCheatEvents(resultId)
            setAntiCheatEvents(events)
        } catch {
            setAntiCheatEvents([])
        } finally {
            setEventsLoading(false)
        }
    }

    const getScoreColor = (percentage?: number) => {
        if (percentage == null) return 'text-[var(--color-text-secondary)]'
        if (percentage >= 80) return 'text-emerald-500'
        if (percentage >= 60) return 'text-blue-500'
        if (percentage >= 40) return 'text-amber-500'
        return 'text-red-500'
    }

    const getBadgeVariant = (grade?: string) => {
        if (!grade) return 'default'
        const g = grade.toUpperCase()
        if (g.startsWith('A')) return 'success'
        if (g.startsWith('B')) return 'info'
        if (g.startsWith('C')) return 'warning'
        return 'danger'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fadeIn">
                <div className="p-6 rounded-[2.5rem] bg-red-500/10 border-2 border-red-500/20">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>
                <p className="font-bold text-red-500">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all"
                >
                    Thử lại
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-10 space-y-8 max-w-[1400px] mx-auto animate-fadeIn">
            <Breadcrumb items={[
                { label: 'QUẢN LÝ BÀI THI', path: '/teacher/exams' },
                { label: exam?.title ? `KẾT QUẢ: ${exam.title.toUpperCase()}` : 'KẾT QUẢ BÀI THI' }
            ]} />

            {/* Premium Header */}
            <div className="bg-[var(--color-bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--color-border)] shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="info" className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500">
                                DATA ANALYTICS
                            </Badge>
                            {exam?.className && (
                                <Badge variant="default" className="px-3 py-1 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] text-[10px] font-black uppercase tracking-widest">
                                    LỚP {exam.className}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
                            {exam?.title}
                        </h1>
                        <p className="mt-2 text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                            Báo cáo chi tiết kết quả bài thi của học sinh.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-blue-500 text-white">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">SĨ SỐ</div>
                                <div className="text-xl font-black" style={{ color: 'var(--color-text)' }}>{results.length}</div>
                            </div>
                         </div>
                         <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-500 text-white">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">ĐIỂM TB</div>
                                <div className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
                                    {exam?.averageScore != null ? `${Math.round(exam.averageScore)}%` : '—'}
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <Card className="p-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm overflow-hidden" hover={false}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
                        <div className="w-2 h-8 bg-blue-500 rounded-full" />
                        Danh sách bài nộp
                    </h2>
                </div>

                {results.length === 0 ? (
                    <EmptyState
                        icon={<Inbox className="w-12 h-12 text-[var(--color-text-secondary)] opacity-20" />}
                        title="Chưa có bài nộp"
                        description="Hiện tại chưa có học sinh nào nộp bài thi này."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                                    <th className="px-6 pb-2">Học sinh</th>
                                    <th className="px-6 pb-2">Điểm số</th>
                                    <th className="px-6 pb-2">Đúng / Tổng</th>
                                    <th className="px-6 pb-2">Phần trăm</th>
                                    <th className="px-6 pb-2">Xếp loại</th>
                                    <th className="px-6 pb-2">Vi phạm</th>
                                    <th className="px-6 pb-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r) => (
                                    <Fragment key={r.id}>
                                        <tr
                                            className="group cursor-pointer"
                                            onClick={() => toggleExpand(r.id)}
                                        >
                                            <td className={`px-6 py-4 rounded-l-3xl bg-[var(--color-bg-secondary)] border-y border-l border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors ${
                                                (r.percentage ?? 0) >= 80 ? 'border-l-4 border-l-emerald-500' :
                                                (r.percentage ?? 0) >= 60 ? 'border-l-4 border-l-blue-500' :
                                                (r.percentage ?? 0) >= 40 ? 'border-l-4 border-l-amber-500' :
                                                'border-l-4 border-l-red-500'
                                            }`}>
                                                <div className="font-black text-[var(--color-text)]">
                                                    {r.studentName || `Học sinh #${r.studentId}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                <span className={`text-lg font-black ${getScoreColor(r.percentage)}`}>
                                                    {r.score ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                                                    <span className="font-bold text-[var(--color-text-secondary)]">
                                                        {r.correctCount ?? 0} / {r.totalQuestions ?? 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                <span className={`font-black ${getScoreColor(r.percentage)}`}>
                                                    {r.percentage != null ? `${Math.round(r.percentage)}%` : '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                <Badge
                                                    variant={getBadgeVariant(r.grade)}
                                                    className="font-black uppercase text-[10px] px-3 py-1"
                                                >
                                                    {r.grade || '—'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                {(r.violationCount ?? 0) > 0 ? (
                                                    <Badge variant="danger" className="font-black flex items-center gap-1.5 px-3">
                                                        <ShieldAlert className="w-3.5 h-3.5" />
                                                        {r.violationCount} LẦN
                                                    </Badge>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-sm">
                                                        <Trophy className="w-3.5 h-3.5 opacity-50" />
                                                        0
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 rounded-r-3xl bg-[var(--color-bg-secondary)] border-y border-r border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors text-right">
                                                {expandedId === r.id ? (
                                                    <ChevronUp className="w-5 h-5 text-blue-500 ml-auto" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-[var(--color-text-secondary)] ml-auto" />
                                                )}
                                            </td>
                                        </tr>

                                        {/* Premium Expanded Section */}
                                        {expandedId === r.id && (
                                            <tr>
                                                <td colSpan={7} className="p-0">
                                                    <div className="mx-6 mb-6 p-8 rounded-[2rem] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] animate-slideDown">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h3 className="text-sm font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                                                                <ShieldAlert className="w-4 h-4" />
                                                                LỊCH SỬ CHỐNG GIAN LẬN
                                                            </h3>
                                                        </div>
                                                        
                                                        {eventsLoading ? (
                                                            <div className="flex items-center justify-center py-10">
                                                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                                            </div>
                                                        ) : antiCheatEvents.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-8 gap-3 bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)]">
                                                                <Trophy className="w-10 h-10 text-emerald-500 opacity-20" />
                                                                <p className="font-bold text-emerald-500/80">Không phát hiện hành vi bất thường</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {antiCheatEvents.map((evt) => (
                                                                    <div
                                                                        key={evt.id}
                                                                        className="flex items-start gap-4 p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-red-500/10 hover:border-red-500/30 transition-colors"
                                                                    >
                                                                        <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                                                                            <ShieldAlert className="w-5 h-5" />
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center justify-between gap-4">
                                                                                <p className="font-black text-[var(--color-text)]">
                                                                                    {evt.eventType}
                                                                                </p>
                                                                                <span className="text-[10px] font-black text-red-500 bg-red-500/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                                                    {new Date(evt.timestamp || '').toLocaleTimeString('vi-VN')}
                                                                                </span>
                                                                            </div>
                                                                            {evt.details && (
                                                                                <p className="text-sm mt-1.5 font-medium leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                                                                    {evt.details}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}
