import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import { examApi, ExamResponse } from '../../services/api/examApi'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import {
    Users,
    FileText,
    TrendingUp,
    Plus,
    BarChart3,
    School,
    Loader2,
    AlertTriangle,
    ClipboardList,
    ArrowRight,
    CalendarDays,
    Settings,
    Bell,
    Sparkles,
} from 'lucide-react'

export default function TeacherDashboard() {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [exams, setExams] = useState<ExamResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.id) return
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const [cls, examPage] = await Promise.all([
                    classroomApi.getByTeacher(user.id),
                    examApi.getByTeacher(user.id, 0, 100),
                ])
                setClasses(cls)
                setExams(examPage.content)
            } catch {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user?.id])

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
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all"
                >
                    Thử lại
                </button>
            </div>
        )
    }

    const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)
    const totalExams = exams.length
    const avgScore =
        exams.length > 0
            ? Math.round(
                  exams.reduce((sum, e) => sum + (e.averageScore || 0), 0) / (exams.filter((e) => e.averageScore != null).length || 1)
              )
            : 0

    const recentExams = [...exams]
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 5)

    const quickActions = [
        { label: 'Tạo bài thi', icon: Plus, path: '/teacher/exams/create', color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
        { label: 'Kết quả thi', icon: BarChart3, path: '/teacher/questions', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
        { label: 'Quản lý bài học', icon: School, path: '/teacher/lessons', color: 'bg-purple-500', shadow: 'shadow-purple-500/20' },
    ]

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto animate-fadeIn">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[var(--color-bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--color-border)] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Sparkles className="w-32 h-32 text-blue-500" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="info" className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500">
                            TEACHER MODULE
                        </Badge>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] text-[10px] font-black uppercase tracking-widest">
                            <CalendarDays className="w-3 h-3" />
                            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>
                        Xin chào, <span className="text-blue-500">{user?.fullName || 'Giáo viên'}</span>!
                    </h1>
                    <p className="mt-2 text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        Hôm nay bạn có {classes.length} lớp học và {totalExams} bài thi cần quản lý.
                    </p>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button className="p-4 rounded-2xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] transition-all group">
                        <Bell className="w-6 h-6 text-[var(--color-text-secondary)] group-hover:text-blue-500" />
                    </button>
                    <button className="p-4 rounded-2xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] border border-[var(--color-border)] transition-all group" onClick={() => navigate('/settings')}>
                        <Settings className="w-6 h-6 text-[var(--color-text-secondary)] group-hover:text-blue-500" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<School className="w-6 h-6" />} 
                    label="Lớp đang dạy" 
                    value={classes.length} 
                    color="text-blue-500" 
                    className="rounded-[2rem] border border-[var(--color-border)] shadow-sm p-6"
                />
                <StatCard 
                    icon={<Users className="w-6 h-6" />} 
                    label="Tổng học sinh" 
                    value={totalStudents} 
                    color="text-emerald-500" 
                    className="rounded-[2rem] border border-[var(--color-border)] shadow-sm p-6"
                />
                <StatCard 
                    icon={<FileText className="w-6 h-6" />} 
                    label="Bài thi đã tạo" 
                    value={totalExams} 
                    color="text-purple-500" 
                    className="rounded-[2rem] border border-[var(--color-border)] shadow-sm p-6"
                />
                <StatCard 
                    icon={<TrendingUp className="w-6 h-6" />} 
                    label="Điểm trung bình" 
                    value={avgScore > 0 ? `${avgScore}%` : '—'} 
                    color="text-amber-500" 
                    className="rounded-[2rem] border border-[var(--color-border)] shadow-sm p-6"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Quick Actions */}
                <Card className="lg:col-span-1 p-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm" hover={false}>
                    <h2 className="text-xl font-black mb-8 flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
                        <div className="w-2 h-8 bg-blue-500 rounded-full" />
                        Thao tác nhanh
                    </h2>
                    <div className="space-y-4">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                className={`w-full group relative overflow-hidden p-5 rounded-3xl border border-transparent hover:border-[var(--color-border)] transition-all flex items-center justify-between text-white ${action.color} ${action.shadow}`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                        <action.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-black text-lg">{action.label}</span>
                                </div>
                                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                        <p className="text-sm font-bold leading-relaxed flex items-start gap-3" style={{ color: 'var(--color-text-secondary)' }}>
                            <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            Bạn có thể theo dõi tiến độ học tập chi tiết của từng học sinh trong phần quản lý lớp học.
                        </p>
                    </div>
                </Card>

                {/* Recent Exams Table */}
                <Card className="lg:col-span-2 p-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm overflow-hidden" hover={false}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
                            <div className="w-2 h-8 bg-emerald-500 rounded-full" />
                            Bài thi gần đây
                        </h2>
                        <button
                            onClick={() => navigate('/teacher/exams')}
                            className="text-sm font-black text-blue-500 hover:text-blue-400 p-2 rounded-xl transition-all active:scale-95"
                        >
                            Xem tất cả
                        </button>
                    </div>

                    {recentExams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fadeIn">
                             <div className="p-6 rounded-full bg-[var(--color-bg-tertiary)]">
                                <ClipboardList className="w-12 h-12 text-[var(--color-text-secondary)] opacity-20" />
                             </div>
                            <p className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>Bạn chưa có bài thi nào</p>
                            <button 
                                onClick={() => navigate('/teacher/exams/create')}
                                className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-black text-sm"
                            >
                                Tạo bài thi ngay
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
                                        <th className="px-6 pb-2">Bài thi</th>
                                        <th className="px-6 pb-2">Lớp</th>
                                        <th className="px-6 pb-2">Trạng thái</th>
                                        <th className="px-6 pb-2">Nộp bài</th>
                                        <th className="px-6 pb-2 text-right">Điểm TB</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentExams.map((exam) => (
                                        <tr
                                            key={exam.id}
                                            className="group cursor-pointer"
                                            onClick={() => navigate(`/teacher/exams/${exam.id}/edit`)}
                                        >
                                            <td className="px-6 py-4 rounded-l-3xl bg-[var(--color-bg-secondary)] border-y border-l border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                <div className="font-black text-[var(--color-text)]">{exam.title}</div>
                                                <div className="text-[10px] font-medium text-[var(--color-text-secondary)] mt-1">
                                                    {new Date(exam.createdAt || '').toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                <Badge variant="default" className="bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-bold">
                                                    {exam.className || 'Không có lớp'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                <Badge
                                                    variant={
                                                        exam.status === 'PUBLISHED'
                                                            ? 'success'
                                                            : exam.status === 'CLOSED'
                                                              ? 'danger'
                                                              : 'warning'
                                                    }
                                                    className="font-black uppercase text-[9px] tracking-widest px-3"
                                                >
                                                    {exam.status === 'PUBLISHED' ? 'ĐANG MỞ' : exam.status === 'CLOSED' ? 'ĐÃ ĐÓNG' : 'NHÁP'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors">
                                                <span className="font-bold text-[var(--color-text-secondary)]">
                                                    {exam.submittedCount ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 rounded-r-3xl bg-[var(--color-bg-secondary)] border-y border-r border-[var(--color-border)] group-hover:border-blue-500/50 transition-colors text-right">
                                                <span className="font-black text-blue-500">
                                                    {exam.averageScore != null ? `${Math.round(exam.averageScore)}%` : '—'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
