import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { examApi, ExamRequest, ExamResponse } from '../../services/api/examApi'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import { questionApi, QuestionResponse } from '../../services/api/questionApi'
import { ArrowLeft, Save, Clock, Shield, ListChecks, CheckCircle2, Search, Loader2, AlertCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'

export default function TeacherExamEditPage() {
    const { examId } = useParams()
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    
    const [fetching, setFetching] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [questions, setQuestions] = useState<QuestionResponse[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    const [form, setForm] = useState({
        title: '',
        classId: 0,
        startTime: '',
        endTime: '',
        durationMinutes: 60,
        shuffleQuestions: false,
        shuffleAnswers: false,
        antiCheatEnabled: false,
        questionIds: [] as number[]
    })
    const [originalExam, setOriginalExam] = useState<ExamResponse | null>(null)

    const fetchData = useCallback(async () => {
        if (!user?.id || !examId) return
        setFetching(true)
        try {
            const id = parseInt(examId)
            const [exam, cls, qs] = await Promise.all([
                examApi.getById(id),
                classroomApi.getByTeacher(user.id),
                questionApi.getAll()
            ])
            
            setOriginalExam(exam)
            setClasses(cls)
            setQuestions(qs)
            
            setForm({
                title: exam.title,
                classId: exam.classId || 0,
                startTime: exam.startTime ? exam.startTime.slice(0, 16) : '',
                endTime: exam.endTime ? exam.endTime.slice(0, 16) : '',
                durationMinutes: exam.durationMinutes || 60,
                shuffleQuestions: exam.shuffleQuestions || false,
                shuffleAnswers: exam.shuffleAnswers || false,
                antiCheatEnabled: exam.antiCheatEnabled || false,
                questionIds: exam.questions ? exam.questions.map((q: any) => q.id) : []
            })
            
            // If the API doesn't return questionIds in the main response, we might need another call
            // But for now, we'll assume they will be added or we'll handle accordingly
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setFetching(false)
        }
    }, [user?.id, examId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleUpdate = async () => {
        if (!form.title.trim() || !form.classId || !examId) {
            alert('Vui lòng điền đầy đủ tiêu đề và chọn lớp học')
            return
        }

        setSubmitting(true)
        try {
            const payload: ExamRequest = {
                ...form,
                startTime: form.startTime || new Date().toISOString(),
                endTime: form.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
            await examApi.update(parseInt(examId), payload)
            navigate('/teacher/exams')
        } catch (error) {
            alert('Cập nhật bài thi thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleQuestion = (qId: number) => {
        setForm(prev => ({
            ...prev,
            questionIds: prev.questionIds.includes(qId)
                ? prev.questionIds.filter(id => id !== qId)
                : [...prev.questionIds, qId]
        }))
    }

    const filteredQuestions = questions.filter(q => 
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.lessonTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                <p className="text-slate-400 font-medium animate-pulse">Đang tải thông tin bài thi...</p>
            </div>
        )
    }

    if (!originalExam) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <p className="text-white font-bold text-xl">Không tìm thấy bài thi!</p>
                <Button onClick={() => navigate('/teacher/exams')}>Quay lại danh sách</Button>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1400px] mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[var(--color-bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--color-border)] shadow-sm">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/teacher/exams')}
                        className="p-3.5 rounded-2xl bg-[var(--color-bg)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] transition-all border border-[var(--color-border)] group active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-4" style={{ color: 'var(--color-text)' }}>
                            Chỉnh sửa bài thi
                            <Badge variant={originalExam.status === 'PUBLISHED' ? 'success' : 'warning'} className="text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-black">
                                {originalExam.status}
                            </Badge>
                        </h1>
                        <p className="font-medium mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>Cập nhật thông tin và danh sách câu hỏi cho <span className="text-[var(--color-primary)]">"{originalExam.title}"</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/teacher/exams')}
                        className="px-8 py-3.5 rounded-2xl font-bold"
                    >
                        Hủy bỏ
                    </Button>
                    <Button 
                        onClick={handleUpdate}
                        disabled={submitting}
                        className="px-10 py-3.5 rounded-2xl font-black shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-3"
                    >
                        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Lưu thay đổi</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Left Column: Configuration */}
                <div className="xl:col-span-4 space-y-8">
                    <Card className="p-8 shadow-sm rounded-[2.5rem] relative group" hover={false}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3.5 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-inner">
                                <Clock className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Cấu hình chung</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-secondary)' }}>Tiêu đề bài thi *</label>
                                <input 
                                    type="text"
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                    className="input-field text-lg font-bold"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-secondary)' }}>Lớp học phụ trách *</label>
                                <div className="relative">
                                    <select 
                                        value={form.classId}
                                        onChange={e => setForm({...form, classId: parseInt(e.target.value)})}
                                        className="input-field text-lg font-bold appearance-none pr-12"
                                    >
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ArrowLeft className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 rotate-[270deg] text-[var(--color-text-secondary)] pointer-events-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-secondary)' }}>Thời gian (phút)</label>
                                    <input 
                                        type="number"
                                        min={1}
                                        value={form.durationMinutes}
                                        onChange={e => setForm({...form, durationMinutes: parseInt(e.target.value) || 0})}
                                        className="input-field text-xl font-black text-center"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] ml-1" style={{ color: 'var(--color-text-secondary)' }}>Đã chọn</label>
                                    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-4 flex items-center justify-center text-emerald-500 font-black text-2xl shadow-inner">
                                        {form.questionIds.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 shadow-sm rounded-[2.5rem]" hover={false}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                                <Shield className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Bảo mật & Tùy chọn</h3>
                        </div>

                        <div className="space-y-5">
                            {[
                                { id: 'shuffleQuestions', label: 'Xáo trộn câu hỏi', description: 'Thứ tự ngẫu nhiên cho mỗi học sinh', checked: form.shuffleQuestions },
                                { id: 'shuffleAnswers', label: 'Xáo trộn đáp án', description: 'Thứ tự đáp án A/B/C/D ngẫu nhiên', checked: form.shuffleAnswers },
                                { id: 'antiCheatEnabled', label: 'Chống gian lận (Anti-cheat)', description: 'Khóa nếu thoát toàn màn hình', checked: form.antiCheatEnabled, important: true }
                            ].map(opt => (
                                <div key={opt.id} 
                                     onClick={() => setForm({...form, [opt.id]: !form[opt.id as keyof typeof form]})}
                                     className={`group p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-5 ${opt.checked ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-[var(--color-bg-secondary)] border-transparent hover:border-[var(--color-border)]'}`}
                                >
                                    <div className={`h-7 w-12 rounded-full relative transition-colors p-1 ${opt.checked ? 'bg-indigo-500' : 'bg-[var(--color-bg-tertiary)]'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${opt.checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black uppercase tracking-tight" style={{ color: opt.checked ? '#4338ca' : 'var(--color-text)' }}>{opt.label}</span>
                                            {opt.important && <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>}
                                        </div>
                                        <p className="text-xs font-medium mt-1" style={{ color: 'var(--color-text-secondary)' }}>{opt.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column: Question Selection */}
                <div className="xl:col-span-8">
                    <Card className="shadow-lg rounded-[3rem] flex flex-col h-[800px] overflow-hidden" hover={false}>
                        <div className="p-10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[var(--color-bg-secondary)]/30 border-b border-[var(--color-border)]">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-3xl bg-blue-500/10 text-blue-500 shadow-inner">
                                    <ListChecks className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Cập nhật câu hỏi</h3>
                                    <p className="text-sm font-bold flex items-center gap-2 mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                        <span>Tổng số: {questions.length} câu</span>
                                        <span className="opacity-30">|</span>
                                        <span className="text-emerald-500">{form.questionIds.length} câu đã chọn</span>
                                    </p>
                                </div>
                            </div>
                            <div className="relative w-full md:w-[360px]">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-secondary)] opacity-50" />
                                <input 
                                    type="text"
                                    placeholder="Tìm kiếm câu hỏi..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="input-field pl-12 font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-5 custom-scrollbar bg-[var(--color-bg)]">
                            {filteredQuestions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-28 text-center space-y-6">
                                    <div className="p-8 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] opacity-30">
                                        <Search className="h-14 w-14" />
                                    </div>
                                    <p className="text-lg font-bold italic" style={{ color: 'var(--color-text-secondary)' }}>Không tìm thấy câu hỏi phù hợp.</p>
                                </div>
                            ) : (
                                filteredQuestions.map((q) => {
                                    const isSelected = form.questionIds.includes(q.id)
                                    return (
                                        <div 
                                            key={q.id}
                                            onClick={() => toggleQuestion(q.id)}
                                            className={`group p-6 rounded-3xl border transition-all cursor-pointer flex items-center gap-8 relative ${isSelected ? 'bg-emerald-50/50 border-emerald-200 shadow-sm ring-1 ring-emerald-100' : 'bg-[var(--color-bg)] border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-text-secondary)]/20'}`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                                    <Badge className={`text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full border-none ${q.questionType === 'MULTIPLE_CHOICE' ? 'bg-violet-100 text-violet-600' : 'bg-amber-100 text-amber-600'}`}>
                                                        {q.questionType}
                                                    </Badge>
                                                    <Badge variant="default" className="text-[10px] uppercase tracking-wider font-black px-3 py-1 rounded-full border-none bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]">
                                                        {q.points || 1} Điểm
                                                    </Badge>
                                                </div>
                                                <h4 className="font-bold leading-relaxed text-lg transition-colors italic" style={{ color: isSelected ? '#065f46' : 'var(--color-text)' }}>"{q.questionText}"</h4>
                                            </div>

                                            <div className={`p-4 rounded-2xl transition-all border shrink-0 shadow-sm ${isSelected ? 'bg-emerald-600 text-white border-emerald-500 scale-110' : 'bg-[var(--color-bg-secondary)] text-[var(--color-bg-tertiary)] border-[var(--color-border)] group-hover:text-[var(--color-text-secondary)]'}`}>
                                                <CheckCircle2 className="h-7 w-7" />
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
