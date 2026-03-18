import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Languages, ChevronLeft, Loader2, Save, Image as ImageIcon, Music, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Vocabulary, VocabularyRequest, Lesson, Page } from '@/types/api'

export default function VocabularyEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loadingLessons, setLoadingLessons] = useState(true)

    const [form, setForm] = useState<VocabularyRequest>({
        word: '',
        meaning: '',
        pronunciation: '',
        exampleSentence: '',
        imageUrl: '',
        audioUrl: '',
        lessonId: undefined
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lessonsRes, vocabRes] = await Promise.all([
                    api.get<ApiResponse<Page<Lesson>>>('/lessons', { params: { size: 1000 } }),
                    api.get<ApiResponse<Vocabulary>>(`/vocabulary/${id}`)
                ])
                
                setLessons(lessonsRes.data.data.content || [])
                setLoadingLessons(false)

                const v = vocabRes.data.data
                setForm({
                    word: v.word,
                    meaning: v.meaning,
                    pronunciation: v.pronunciation || '',
                    exampleSentence: v.exampleSentence || '',
                    imageUrl: v.imageUrl || '',
                    audioUrl: v.audioUrl || '',
                    lessonId: v.lessonId
                })
            } catch {
                toast.error('Không thể tải dữ liệu')
                navigate('/vocabulary')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.word.trim() || !form.meaning.trim()) {
            toast.error('Từ và nghĩa không được để trống')
            return
        }

        setSubmitting(true)
        try {
            await api.put(`/vocabulary/${id}`, form)
            toast.success('Cập nhật từ vựng thành công')
            navigate('/vocabulary')
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/vocabulary')} className="rounded-full">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Chỉnh sửa từ vựng</h1>
                    <p className="text-muted-foreground font-medium">Cập nhật thông tin chi tiết cho từ vựng.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-6">
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Languages className="h-5 w-5" /> Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Từ vựng *</Label>
                                    <Input
                                        value={form.word}
                                        onChange={(e) => setForm({ ...form, word: e.target.value })}
                                        className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-bold"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Ý nghĩa *</Label>
                                    <Input
                                        value={form.meaning}
                                        onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                                        className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Phiên âm</Label>
                                <Input
                                    value={form.pronunciation}
                                    onChange={(e) => setForm({ ...form, pronunciation: e.target.value })}
                                    className="h-12 rounded-xl bg-muted/20 border-border/50 italic font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Câu ví dụ</Label>
                                <textarea
                                    value={form.exampleSentence}
                                    onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
                                    className="flex min-h-[100px] w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Phân loại
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Bài học liên quan</Label>
                                <select
                                    value={form.lessonId || ''}
                                    onChange={(e) => setForm({ ...form, lessonId: e.target.value ? Number(e.target.value) : undefined })}
                                    className="flex h-11 w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    disabled={loadingLessons}
                                >
                                    <option value="">-- Chọn bài học --</option>
                                    {lessons.map((l) => (
                                        <option key={l.id} value={l.id}>{l.title}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" /> Đa phương tiện
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">URL Hình ảnh</Label>
                                <Input
                                    value={form.imageUrl}
                                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                    className="h-10 rounded-xl bg-muted/20 border-border/50 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">URL Âm thanh</Label>
                                <Input
                                    value={form.audioUrl}
                                    onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                                    className="h-10 rounded-xl bg-muted/20 border-border/50 text-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/vocabulary')}
                            className="h-12 rounded-xl font-bold border-2"
                            disabled={submitting}
                        >
                            HỦY
                        </Button>
                        <Button
                            type="submit"
                            className="h-12 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20"
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> LƯU</>}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}
