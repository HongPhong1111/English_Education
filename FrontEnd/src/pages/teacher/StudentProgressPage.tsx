import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../store/authStore'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import { progressApi, ProgressResponse } from '../../services/api/progressApi'
import api from '../../services/api/axios'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import {
    Loader2,
    AlertTriangle,
    Users,
    BookOpen,
    CheckCircle,
    BarChart3,
    School,
    TrendingUp,
    ChevronRight,
    Search,
} from 'lucide-react'

interface StudentInfo {
    id: number
    username: string
    fullName: string
    email?: string
}

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

interface ProgressStats {
    totalLessons?: number
    completedLessons?: number
    inProgressLessons?: number
    averageCompletion?: number
    [key: string]: unknown
}

export default function StudentProgressPage() {
    const user = useAuthStore((s) => s.user)
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [selectedClass, setSelectedClass] = useState<string>('')
    const [students, setStudents] = useState<StudentInfo[]>([])
    const [selectedStudent, setSelectedStudent] = useState<string>('')

    const [progress, setProgress] = useState<ProgressResponse[]>([])
    const [stats, setStats] = useState<ProgressStats | null>(null)

    const [classesLoading, setClassesLoading] = useState(true)
    const [studentsLoading, setStudentsLoading] = useState(false)
    const [progressLoading, setProgressLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchClasses = useCallback(async () => {
        if (!user?.id) return
        setClassesLoading(true)
        try {
            const data = await classroomApi.getByTeacher(user.id)
            setClasses(data)
        } catch {
            setError('Không thể tải danh sách lớp.')
        } finally {
            setClassesLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        fetchClasses()
    }, [fetchClasses])

    const fetchStudents = useCallback(async (classId: string) => {
        if (!classId) {
            setStudents([])
            return
        }
        setStudentsLoading(true)
        try {
            const res = await api.get<ApiResponse<StudentInfo[]>>(`/classes/${classId}/students`)
            setStudents(res.data.data || [])
        } catch {
            setStudents([])
        } finally {
            setStudentsLoading(false)
        }
    }, [])

    const fetchProgress = useCallback(async (studentId: string) => {
        if (!studentId) {
            setProgress([])
            setStats(null)
            return
        }
        setProgressLoading(true)
        setError(null)
        try {
            const [prog, st] = await Promise.all([
                progressApi.getAll(parseInt(studentId)),
                progressApi.getStats(parseInt(studentId)),
            ])
            setProgress(prog)
            setStats(st as ProgressStats)
        } catch {
            setError('Không thể tải tiến độ học sinh.')
        } finally {
            setProgressLoading(false)
        }
    }, [])

    const handleClassChange = (val: string) => {
        setSelectedClass(val)
        setSelectedStudent('')
        setProgress([])
        setStats(null)
        fetchStudents(val)
    }

    const handleStudentChange = (val: string) => {
        setSelectedStudent(val)
        fetchProgress(val)
    }

    const columns = [
        {
            key: 'lessonTitle',
            label: 'Bài học',
            render: (item: Record<string, unknown>) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-[var(--color-text)]">
                        {(item.lessonTitle as string) || `Lesson #${item.lessonId}`}
                    </span>
                </div>
            ),
        },
        {
            key: 'completionPercentage',
            label: 'Tiến độ hoàn thành',
            render: (item: Record<string, unknown>) => {
                const pct = (item.completionPercentage as number) ?? 0
                return (
                    <div className="w-full max-w-[200px]">
                        <div className="flex justify-between items-center mb-1.5 px-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">HOÀN THÀNH</span>
                            <span className={`text-[10px] font-black ${pct >= 100 ? 'text-emerald-500' : 'text-blue-500'}`}>{Math.round(pct)}%</span>
                        </div>
                        <ProgressBar
                            value={pct}
                            variant="gradient"
                            gradientStart={pct >= 100 ? 'from-emerald-500' : 'from-blue-500'}
                            gradientEnd={pct >= 100 ? 'to-emerald-400' : 'to-blue-400'}
                        />
                    </div>
                )
            },
        },
        {
            key: 'isCompleted',
            label: 'Trạng thái',
            render: (item: Record<string, unknown>) => (
                <Badge 
                    variant={item.isCompleted ? 'success' : 'info'}
                    className="font-black text-[9px] uppercase tracking-widest px-3 py-1"
                >
                    {item.isCompleted ? 'Hoàn thành' : 'Đang học'}
                </Badge>
            ),
        },
        {
            key: 'lastAccessed',
            label: 'TRUY CẬP CUỐI',
            render: (item: Record<string, unknown>) => {
                const la = item.lastAccessed as string
                return (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium">
                        <Loader2 className="w-3 h-3 opacity-30" />
                        {la ? new Date(la).toLocaleDateString('vi-VN') : '—'}
                    </div>
                )
            },
        },
    ]

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto animate-fadeIn">
            <div className="bg-[var(--color-bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--color-border)] shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <Badge variant="info" className="px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest bg-blue-500/10 text-blue-500 mb-3">
                            STUDENT PERFORMANCE
                        </Badge>
                        <h1 className="text-3xl font-black tracking-tight" style={{ color: "var(--color-text)" }}>
                            Báo cáo tiến độ
                        </h1>
                        <p className="mt-2 text-lg font-medium" style={{ color: "var(--color-text-secondary)" }}>
                            Theo dõi mức độ hoàn thành bài học của học sinh.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="p-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm overflow-visible" hover={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] ml-1">
                            Chọn lớp học
                        </label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                <School className="w-5 h-5 text-blue-500" />
                            </div>
                            <select
                                value={selectedClass}
                                onChange={(e) => handleClassChange(e.target.value)}
                                disabled={classesLoading}
                                className="w-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-blue-500 rounded-[1.5rem] pl-14 pr-6 py-4 outline-none transition-all font-bold appearance-none cursor-pointer"
                                style={{ color: 'var(--color-text)' }}
                            >
                                <option value="">-- Lớp chưa chọn --</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                {classesLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5 rotate-90" />}
                            </div>
                        </div>
                    </div>

                    <div className={`space-y-3 transition-opacity duration-300 ${!selectedClass ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                        <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)] ml-1">
                            Chọn học sinh
                        </label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                            <select
                                value={selectedStudent}
                                onChange={(e) => handleStudentChange(e.target.value)}
                                disabled={studentsLoading || !selectedClass}
                                className="w-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] focus:border-blue-500 rounded-[1.5rem] pl-14 pr-6 py-4 outline-none transition-all font-bold appearance-none cursor-pointer"
                                style={{ color: 'var(--color-text)' }}
                            >
                                <option value="">-- Học sinh chưa chọn --</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.fullName || s.username}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                {studentsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5 rotate-90" />}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Content Results */}
            {!selectedClass ? (
                <Card className="py-20 flex flex-col items-center justify-center text-center rounded-[2.5rem] border-[var(--color-border)] shadow-sm" hover={false}>
                    <div className="bg-[var(--color-bg-tertiary)] p-10 rounded-full mb-6">
                        <Search className="w-16 h-16 text-[var(--color-text-secondary)] opacity-10" />
                    </div>
                    <h3 className="text-xl font-black mb-2" style={{ color: "var(--color-text)" }}>Bắt đầu khám phá</h3>
                    <p className="max-w-xs font-medium text-[var(--color-text-secondary)]">Vui lòng chọn lớp học để xem danh sách học sinh và tiến độ học tập chi tiết.</p>
                </Card>
            ) : !selectedStudent ? (
                <Card className="py-20 flex flex-col items-center justify-center text-center rounded-[2.5rem] border-[var(--color-border)] shadow-sm animate-fadeIn" hover={false}>
                    <div className="bg-[var(--color-bg-tertiary)] p-10 rounded-full mb-6 text-blue-500">
                        <Users className="w-16 h-16 opacity-10" />
                    </div>
                    <h3 className="text-xl font-black mb-2" style={{ color: "var(--color-text)" }}>Chọn học sinh</h3>
                    <p className="max-w-xs font-medium text-[var(--color-text-secondary)]">
                        {students.length === 0 && !studentsLoading
                            ? 'Lớp này hiện chưa có thành viên nào.'
                            : 'Vui lòng chọn một học sinh cụ thể để tải báo cáo tiến độ.'}
                    </p>
                </Card>
            ) : error ? (
                <div className="py-20 flex flex-col items-center justify-center gap-6 animate-fadeIn">
                    <div className="p-6 rounded-[2.5rem] bg-red-500/10 border-2 border-red-500/20">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                    <p className="font-black text-red-500">{error}</p>
                    <button
                        onClick={() => fetchProgress(selectedStudent)}
                        className="px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                    >
                        Thử tải lại
                    </button>
                </div>
            ) : progressLoading ? (
                <div className="py-32 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="space-y-10 animate-fadeIn">
                    {/* Stat cards */}
                    {stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<BookOpen className="w-6 h-6" />}
                                label="BÀI HỌC"
                                value={stats.totalLessons ?? progress.length}
                                className="border-b-4 border-b-blue-500"
                            />
                            <StatCard
                                icon={<CheckCircle className="w-6 h-6" />}
                                label="HOÀN THÀNH"
                                value={stats.completedLessons ?? progress.filter((p) => p.isCompleted).length}
                                className="border-b-4 border-b-emerald-500"
                            />
                            <StatCard
                                icon={<TrendingUp className="w-6 h-6" />}
                                label="ĐANG HỌC"
                                value={stats.inProgressLessons ?? progress.filter((p) => !p.isCompleted).length}
                                className="border-b-4 border-b-amber-500"
                            />
                            <StatCard
                                icon={<BarChart3 className="w-6 h-6" />}
                                label="TB TIẾN ĐỘ"
                                value={
                                    stats.averageCompletion != null
                                        ? `${Math.round(stats.averageCompletion)}%`
                                        : progress.length > 0
                                          ? `${Math.round(progress.reduce((s, p) => s + (p.completionPercentage || 0), 0) / progress.length)}%`
                                          : '0%'
                                }
                                className="border-b-4 border-b-purple-500"
                            />
                        </div>
                    )}

                    {/* Progress table */}
                    <Card className="p-8 rounded-[2.5rem] border-[var(--color-border)] shadow-sm overflow-hidden" hover={false}>
                        <div className="flex items-center justify-between mb-8">
                             <h3 className="text-xl font-black flex items-center gap-3" style={{ color: "var(--color-text)" }}>
                                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                Chi tiết kỹ năng
                             </h3>
                        </div>
                        
                        <div className="DataTable-Premium">
                            <DataTable
                                columns={columns}
                                data={progress as unknown as Record<string, unknown>[]}
                                loading={false}
                                emptyMessage="Học sinh này chưa tham gia bài học nào."
                            />
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
