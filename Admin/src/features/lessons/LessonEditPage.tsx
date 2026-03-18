import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ChevronLeft, Loader2, Save, Send, Eye, Clock } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Lesson, LessonRequest } from '@/types/api'

export default function LessonEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState<LessonRequest>({
        title: '',
        contentHtml: '',
        difficultyLevel: 1,
        orderIndex: 1,
        isPublished: false
    })

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const r = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`)
                const l = r.data.data
                setForm({
                    title: l.title,
                    contentHtml: l.contentHtml || '',
                    difficultyLevel: l.difficultyLevel || 1,
                    orderIndex: l.orderIndex || 1,
                    isPublished: l.isPublished || false,
                    audioUrl: l.audioUrl,
                    videoUrl: l.videoUrl
                })
            } catch {
                toast.error('Không thể tải thông tin bài học')
                navigate('/lessons')
            } finally {
                setLoading(false)
            }
        }
        fetchLesson()
    }, [id, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim()) {
            toast.error('Tiêu đề không được để trống')
            return
        }

        setSubmitting(true)
        try {
            await api.put(`/lessons/${id}`, form)
            toast.success('Cập nhật bài học thành công')
            navigate('/lessons')
        } catch {
            toast.error('Cập nhật thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
                <p className="font-black text-sm tracking-widest uppercase text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/lessons')} className="rounded-full">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-extrabold tracking-tight">Cập nhật bài học</h1>
                        <Badge variant={form.isPublished ? "default" : "secondary"} className="h-6">
                            {form.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground font-medium">Chỉnh sửa nội dung và các thiết lập cho bài học mã #{id}.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-6">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <BookOpen className="h-5 w-5" /> Nội dung bài học
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Tiêu đề bài học *</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 text-lg font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Nội dung (HTML)</Label>
                                <textarea
                                    value={form.contentHtml}
                                    onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                                    className="flex min-h-[400px] w-full rounded-2xl border border-border/50 bg-muted/20 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-mono"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Cấu hình</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1 text-primary">Độ khó (1 - 5)</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="1"
                                        value={form.difficultyLevel}
                                        onChange={(e) => setForm({ ...form, difficultyLevel: Number(e.target.value) })}
                                        className="h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-xs shadow-lg shadow-primary/20">
                                        {form.difficultyLevel}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Thứ tự hiển thị</Label>
                                <Input
                                    type="number"
                                    value={form.orderIndex}
                                    onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
                                    className="h-12 rounded-xl bg-muted/20 border-border/50 font-bold"
                                />
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 cursor-pointer transition-all hover:bg-primary/5 group">
                                    <input
                                        type="checkbox"
                                        checked={form.isPublished}
                                        onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                                        className="w-5 h-5 rounded-md border-primary text-primary focus:ring-primary/20"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">Xuất bản bài học</span>
                                        <span className="text-[10px] text-muted-foreground">Công khai nội dung</span>
                                    </div>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            className="h-14 rounded-2xl font-black bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={submitting}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> LƯU THAY ĐỔI</>}
                            </span>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/lessons')}
                            className="h-12 rounded-xl font-bold border-2 transition-all"
                            disabled={submitting}
                        >
                            HỦY BỎ
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
