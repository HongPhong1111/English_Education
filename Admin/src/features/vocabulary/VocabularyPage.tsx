import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Languages, Plus, Search, Edit, Trash2, BookOpen, ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Vocabulary, Lesson } from '@/types/api'

export default function VocabularyPage() {
    const [vocabs, setVocabs] = useState<Vocabulary[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<Vocabulary | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const fetchVocabs = async () => {
        setLoading(true)
        try {
            const r = await api.get<ApiResponse<Vocabulary[]>>('/vocabulary')
            setVocabs(Array.isArray(r.data.data) ? r.data.data : [])
        } catch {
            setVocabs([])
            toast.error('Không thể tải từ vựng')
        } finally { setLoading(false) }
    }

    useEffect(() => {
        fetchVocabs()
    }, [])

    const handleDelete = async () => {
        if (!deleting) return
        setSubmitting(true)
        try {
            await api.delete(`/vocabulary/${deleting.id}`)
            toast.success('Đã xóa từ vựng')
            fetchVocabs()
        } catch {
            toast.error('Xóa thất bại')
        } finally {
            setSubmitting(false)
            setDeleteOpen(false)
            setDeleting(null)
        }
    }

    const filtered = vocabs.filter((v) =>
        v.word.toLowerCase().includes(search.toLowerCase()) ||
        v.meaning.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Quản lý từ vựng</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Tổng cộng {vocabs.length} từ vựng trong hệ thống.</p>
                </div>
                <Button asChild className="h-12 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary">
                    <Link to="/vocabulary/create">
                        <Plus className="h-5 w-5" /> Thêm từ vựng
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5 text-primary" /> Danh sách</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Từ</TableHead>
                                    <TableHead>Nghĩa</TableHead>
                                    <TableHead>Phát âm</TableHead>
                                    <TableHead>Bài học</TableHead>
                                    <TableHead>Ví dụ</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Không có từ vựng</TableCell></TableRow>
                                ) : filtered.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-medium">{v.id}</TableCell>
                                        <TableCell className="font-semibold text-primary">{v.word}</TableCell>
                                        <TableCell>{v.meaning}</TableCell>
                                        <TableCell className="text-muted-foreground italic">{v.pronunciation}</TableCell>
                                        <TableCell className="text-muted-foreground">{v.lessonTitle || '-'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{v.exampleSentence}</TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all">
                                                    <Link to={`/vocabulary/edit/${v.id}`}>
                                                        <Edit className="h-4.5 w-4.5" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive transition-all"
                                                    onClick={() => { setDeleting(v); setDeleteOpen(true) }}
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>


            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>Xóa từ "{deleting?.word}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
