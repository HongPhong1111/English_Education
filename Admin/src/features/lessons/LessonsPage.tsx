import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, Filter } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Page, Lesson } from '@/types/api'

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const fetchLessons = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Page<Lesson>>>(`/lessons?page=${page}&size=10`)
            setLessons(response.data.data.content)
            setTotalPages(response.data.data.totalPages)
            setTotalElements(response.data.data.totalElements)
        } catch {
            setLessons([])
            toast.error('Không thể tải danh sách bài học')
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchLessons() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleDelete = async () => {
        if (!deletingLesson) return
        setSubmitting(true)
        try {
            await api.delete(`/lessons/${deletingLesson.id}`)
            toast.success('Đã xóa bài học')
            fetchLessons()
        } catch {
            toast.error('Xóa thất bại')
        } finally {
            setSubmitting(false)
            setDeleteDialogOpen(false)
            setDeletingLesson(null)
        }
    }

    const filtered = lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Quản lý bài học</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Bạn có tổng cộng {totalElements} bài học trong hệ thống.</p>
                </div>
                <Button asChild className="h-12 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary shadow-lg shadow-primary/20">
                    <Link to="/lessons/create">
                        <Plus className="h-5 w-5" /> Thêm bài học
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Danh sách bài học</CardTitle>
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
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">ID</TableHead>
                                        <TableHead>Tiêu đề</TableHead>
                                        <TableHead>Độ khó</TableHead>
                                        <TableHead>Thứ tự</TableHead>
                                        <TableHead>Từ vựng</TableHead>
                                        <TableHead>Câu hỏi</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Không có bài học nào</TableCell></TableRow>
                                    ) : filtered.map((lesson) => (
                                        <TableRow key={lesson.id}>
                                            <TableCell className="font-medium">{lesson.id}</TableCell>
                                            <TableCell className="font-medium max-w-[250px] truncate">{lesson.title}</TableCell>
                                            <TableCell><Badge variant="outline">Lv.{lesson.difficultyLevel ?? 1}</Badge></TableCell>
                                            <TableCell>{lesson.orderIndex ?? '-'}</TableCell>
                                            <TableCell>{lesson.vocabularyCount ?? 0}</TableCell>
                                            <TableCell>{lesson.questionCount ?? 0}</TableCell>
                                            <TableCell>
                                                <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                                                    {lesson.isPublished ? 'Đã xuất bản' : 'Nháp'}
                                                </Badge>
                                            </TableCell>
                                             <TableCell className="text-right pr-6">
                                                 <div className="flex justify-end gap-2">
                                                     <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all">
                                                         <Link to={`/lessons/edit/${lesson.id}`}>
                                                             <Edit className="h-4.5 w-4.5" />
                                                         </Link>
                                                     </Button>
                                                     <Button 
                                                         variant="ghost" 
                                                         size="icon" 
                                                         className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive transition-all"
                                                         onClick={() => { setDeletingLesson(lesson); setDeleteDialogOpen(true) }}
                                                     >
                                                         <Trash2 className="h-4.5 w-4.5" />
                                                     </Button>
                                                 </div>
                                             </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">Trang {page + 1} / {Math.max(totalPages, 1)}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>


            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>Bạn có chắc muốn xóa bài học "{deletingLesson?.title}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
