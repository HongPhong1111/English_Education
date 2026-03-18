import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
    ChevronLeft, 
    Loader2, 
    Save, 
    Search, 
    FileText, 
    Clock, 
    Calendar, 
    ShieldCheck, 
    Shuffle, 
    CheckSquare,
    Target
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/app/hooks'
import type { ApiResponse, ClassRoom, Question, ExamRequest, Page } from '@/types/api'

export default function ExamCreatePage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { user } = useAppSelector((state) => state.auth)
    
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [classes, setClasses] = useState<ClassRoom[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [questionSearch, setQuestionSearch] = useState('')
    
    const [form, setForm] = useState<ExamRequest>({
        title: '',
        classId: Number(searchParams.get('classId')) || 0,
        startTime: '',
        endTime: '',
        durationMinutes: 60,
        shuffleQuestions: false,
        shuffleAnswers: false,
        antiCheatEnabled: false,
        questionIds: [],
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesRes, questionsRes] = await Promise.all([
                    api.get<ApiResponse<ClassRoom[]>>('/classes'),
                    api.get<ApiResponse<Question[] | Page<Question>>>('/questions')
                ])
                
                setClasses(Array.isArray(classesRes.data.data) ? classesRes.data.data : [])
                
                const qData = questionsRes.data.data
                if (Array.isArray(qData)) setQuestions(qData)
                else if (qData && 'content' in qData) setQuestions(qData.content)
            } catch {
                toast.error('Không thể tải dữ liệu cần thiết')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim() || !form.classId || !form.startTime || !form.endTime) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }

        setSubmitting(true)
        try {
            const body: ExamRequest = {
                ...form,
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
            }
            await api.post(`/exams?teacherId=${user?.id ?? 0}`, body)
            toast.success('Tạo bài thi thành công')
            navigate(`/exams?classId=${form.classId}`)
        } catch {
            toast.error('Tạo bài thi thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleQuestion = (qId: number) => {
        const ids = form.questionIds ?? []
        setForm({ ...form, questionIds: ids.includes(qId) ? ids.filter(id => id !== qId) : [...ids, qId] })
    }

    const filteredQuestions = questions.filter(q => 
        q.questionText.toLowerCase().includes(questionSearch.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
                <p className="font-black text-sm tracking-widest uppercase text-muted-foreground">Khởi tạo dữ liệu...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-12 w-12 hover:bg-muted/50 transition-all">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">Thiết lập bài thi mới</h1>
                    <p className="text-muted-foreground font-medium">Tạo đề thi và cấu hình phòng thi cho học viên.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Tiêu đề bài thi *</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="VD: Kiểm tra giữa kỳ - Tiếng Anh 10"
                                    className="h-14 rounded-2xl bg-muted/20 border-border/50 font-bold text-lg"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Lớp học mục tiêu *</Label>
                                <select 
                                    className="w-full h-14 bg-muted/20 rounded-2xl border border-border/50 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                    value={form.classId} 
                                    onChange={(e) => setForm({ ...form, classId: Number(e.target.value) })}
                                    required
                                >
                                    <option value={0}>-- Chọn lớp học --</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.schoolName ? `(${c.schoolName})` : ''}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Ngày bắt đầu</Label>
                                    <Input 
                                        type="datetime-local" 
                                        value={form.startTime} 
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })} 
                                        className="h-12 bg-muted/20 rounded-xl border-border/50 font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Ngày kết thúc</Label>
                                    <Input 
                                        type="datetime-local" 
                                        value={form.endTime} 
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })} 
                                        className="h-12 bg-muted/20 rounded-xl border-border/50 font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Thời lượng làm bài</Label>
                                <div className="flex items-center gap-4">
                                    <Input 
                                        type="number" 
                                        value={form.durationMinutes} 
                                        onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} 
                                        className="h-14 bg-muted/20 rounded-2xl border-border/50 font-black text-center text-xl w-32"
                                    />
                                    <span className="font-black text-sm tracking-widest uppercase text-muted-foreground">Phút</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Cấu hình nâng cao</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {[
                                { id: 'shuffleQuestions', label: 'Trộn câu hỏi', icon: Shuffle, desc: 'Thay đổi thứ tự câu hỏi cho mỗi học sinh' },
                                { id: 'shuffleAnswers', label: 'Trộn đáp án', icon: Target, desc: 'Thay đổi thứ tự các lựa chọn A, B, C, D' },
                                { id: 'antiCheatEnabled', label: 'Chống gian lận', icon: ShieldCheck, desc: 'Tự động đóng bài thi khi học sinh chuyển tab' }
                            ].map((opt) => (
                                <label key={opt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50 cursor-pointer hover:bg-primary/5 transition-all group">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-background border border-border/50 text-muted-foreground/40 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                        <opt.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase tracking-wider text-foreground">{opt.label}</p>
                                        <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={(form as any)[opt.id]} 
                                        onChange={(e) => setForm({ ...form, [opt.id]: e.target.checked })}
                                        className="h-6 w-6 rounded-lg accent-primary border-border bg-background"
                                    />
                                </label>
                            ))}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 h-16 rounded-2xl font-black text-white bg-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'XÁC NHẬN TẠO BÀI THI'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="h-16 px-8 rounded-2xl font-black bg-muted/20 border-border/50 transition-all"
                        >
                            HỦY
                        </Button>
                    </div>
                </div>

                {/* Right Panel: Question Selection */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden h-full flex flex-col">
                        <CardHeader className="bg-primary/5 pb-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                    <CheckSquare className="h-5 w-5" /> Bộ câu hỏi ({(form.questionIds ?? []).length})
                                </CardTitle>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        placeholder="Tìm câu hỏi..." 
                                        value={questionSearch} 
                                        onChange={(e) => setQuestionSearch(e.target.value)} 
                                        className="pl-11 h-10 w-64 bg-background border-border/50 rounded-xl font-bold" 
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 flex-1 overflow-hidden">
                            <ScrollArea className="h-[750px] pr-4">
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredQuestions.map((q) => {
                                        const isSelected = (form.questionIds ?? []).includes(q.id)
                                        return (
                                            <div 
                                                key={q.id}
                                                onClick={() => toggleQuestion(q.id)}
                                                className={cn(
                                                    "group flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer",
                                                    isSelected 
                                                        ? "bg-primary shadow-lg shadow-primary/10 border-primary translate-x-1" 
                                                        : "bg-muted/10 border-border/30 hover:bg-muted/20 hover:border-border/60"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-6 w-6 rounded-lg flex items-center justify-center border transition-all shrink-0 mt-1",
                                                    isSelected ? "bg-white border-white text-primary" : "bg-background border-border/60 text-transparent"
                                                )}>
                                                    <CheckSquare className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge variant="outline" className={cn(
                                                            "text-[9px] font-black uppercase",
                                                            isSelected ? "border-white/50 text-white" : "border-border/50 text-muted-foreground/50"
                                                        )}>
                                                            {q.questionType}
                                                        </Badge>
                                                        <span className={cn(
                                                            "text-[10px] font-black tracking-widest uppercase",
                                                            isSelected ? "text-white/40" : "text-muted-foreground/20"
                                                        )}>ID: #{q.id}</span>
                                                    </div>
                                                    <p className={cn(
                                                        "font-bold leading-relaxed",
                                                        isSelected ? "text-white" : "text-foreground"
                                                    )}>{q.questionText}</p>
                                                    
                                                    {q.options && q.options.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                                            {q.options.map((opt: any, idx: number) => (
                                                                <div key={idx} className={cn(
                                                                    "text-[10px] font-medium p-2 rounded-lg truncate",
                                                                    isSelected ? "bg-white/10 text-white/70" : "bg-muted/30 text-muted-foreground/60"
                                                                )}>
                                                                    <span className="font-bold mr-1">{String.fromCharCode(65 + idx)}.</span> {opt.optionText}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    )
}
