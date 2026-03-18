import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GraduationCap, ArrowLeft, Loader2, Plus, Search, Trash2, CheckCircle, Users, School, User as UserIcon, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, ClassRoom, User, Page } from '@/types/api'
import { formatDate } from '@/lib/utils'

export default function ClassRoomDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [room, setRoom] = useState<ClassRoom | null>(null)
    const [students, setStudents] = useState<User[]>([])
    const [loadingStudents, setLoadingStudents] = useState(false)

    // Add student state
    const [addingStudentOpen, setAddingStudentOpen] = useState(false)
    const [searchStudent, setSearchStudent] = useState('')
    const [searchResult, setSearchResult] = useState<User[]>([])
    const [searchingStudent, setSearchingStudent] = useState(false)

    const fetchDetail = async () => {
        setLoading(true)
        try {
            const res = await api.get<ApiResponse<ClassRoom>>(`/classes/${id}`)
            setRoom(res.data.data)
        } catch {
            toast.error('Không tìm thấy thông tin lớp học')
            navigate('/classrooms')
        } finally {
            setLoading(false)
        }
    }

    const fetchStudents = async () => {
        setLoadingStudents(true)
        try {
            const res = await api.get<ApiResponse<User[]>>(`/classes/${id}/students`)
            setStudents(res.data.data)
        } catch {
            toast.error('Không thể tải danh sách học sinh')
        } finally {
            setLoadingStudents(false)
        }
    }

    useEffect(() => {
        fetchDetail()
        fetchStudents()
    }, [id])

    const handleSearchStudents = async () => {
        if (!searchStudent.trim()) return
        setSearchingStudent(true)
        try {
            const res = await api.get<ApiResponse<Page<User>>>('/users/students', {
                params: { keyword: searchStudent, size: 10 }
            })
            setSearchResult(res.data.data.content)
        } catch {
            setSearchResult([])
        } finally {
            setSearchingStudent(false)
        }
    }

    const handleAddStudent = async (studentId: number) => {
        try {
            await api.post(`/classes/${id}/students/${studentId}`)
            toast.success('Đã thêm học sinh vào lớp')
            fetchStudents()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể thêm học sinh')
        }
    }

    const handleRemoveStudent = async (studentId: number, name: string) => {
        if (!confirm(`Bạn có chắc muốn xóa học sinh "${name}" khỏi lớp?`)) return
        try {
            await api.delete(`/classes/${id}/students/${studentId}`)
            toast.success('Đã xóa học sinh khỏi lớp')
            fetchStudents()
        } catch {
            toast.error('Xóa học sinh thất bại')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-bold text-muted-foreground">Đang tải thông tin lớp học...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/classrooms')} className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Chi tiết lớp {room?.name}</h1>
                        <p className="text-muted-foreground mt-1.5 font-medium">Quản lý thông tin và danh sách học sinh của lớp.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => navigate(`/classrooms/edit/${id}`)} className="h-11 px-6 rounded-xl font-bold border-2">
                        Chỉnh sửa
                    </Button>
                    <Button onClick={() => setAddingStudentOpen(true)} className="h-11 px-6 rounded-xl gap-2 font-bold bg-primary shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5" /> Thêm học sinh
                    </Button>
                </div>
            </div>

            {/* Overview Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="premium-card border-none shadow-xl">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <School className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trường học</p>
                            <p className="font-bold text-foreground mt-1">{room?.schoolName || '—'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="premium-card border-none shadow-xl">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                            <UserIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Giáo viên</p>
                            <p className="font-bold text-foreground mt-1">{room?.teacherName || 'Chưa phân công'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="premium-card border-none shadow-xl">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Năm học</p>
                            <p className="font-bold text-foreground mt-1">{room?.academicYear || '—'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="premium-card border-none shadow-xl">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sĩ số</p>
                            <p className="font-bold text-foreground mt-1">{students.length} học sinh</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Students Table */}
            <Card className="premium-card border-none shadow-xl overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <CardTitle className="text-xl font-black flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        Danh sách học sinh
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    {loadingStudents ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                            <p className="font-bold text-muted-foreground/60">Đang tải danh sách học sinh...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                                <Users className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground/80 text-lg">Chưa có học sinh nào</p>
                                <p className="text-muted-foreground/60">Nhấn nút &quot;Thêm học sinh&quot; để bắt đầu sĩ số lớp.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 border-none">
                                        <TableHead className="w-20 pl-8 font-black text-[10px] uppercase tracking-widest">ID</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Học sinh</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-right pr-8">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((s) => (
                                        <TableRow key={s.id} className="h-20 group hover:bg-muted/10 transition-colors border-border/40">
                                            <TableCell className="pl-8 font-bold text-muted-foreground/40">#{s.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                        {(s.fullName || s.username).charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground">{s.fullName || s.username}</span>
                                                        <span className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-wider">{s.email || '—'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleRemoveStudent(s.id, s.fullName || s.username)}
                                                    className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="h-4.5 w-4.5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Student Dialog */}
            <Dialog open={addingStudentOpen} onOpenChange={setAddingStudentOpen}>
                <DialogContent className="sm:max-w-[550px] rounded-3xl p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Thêm học sinh</DialogTitle>
                        <DialogDescription className="font-bold text-primary/60 uppercase text-[10px] tracking-widest mt-1">Tìm học viên thêm vào lớp {room?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="flex gap-3">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Nhập tên, email hoặc username..."
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchStudents()}
                                    className="pl-11 h-12 rounded-xl bg-muted/20 border-border/50 font-bold px-4"
                                />
                            </div>
                            <Button onClick={() => handleSearchStudents()} disabled={searchingStudent} className="h-12 w-12 rounded-xl bg-primary shadow-lg shadow-primary/20">
                                {searchingStudent ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                            </Button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-border/50">
                            {searchingStudent ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                                </div>
                            ) : searchResult.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground/40 font-bold text-xs uppercase tracking-widest">
                                    {searchStudent ? 'Không tìm thấy học sinh nào' : 'Bắt đầu tìm kiếm học sinh'}
                                </div>
                            ) : (
                                <Table>
                                    <TableBody>
                                        {searchResult.map((u) => {
                                            const isAlreadyInClass = students.some(cs => cs.id === u.id);
                                            return (
                                                <TableRow key={u.id} className="h-16 group hover:bg-muted/10 transition-colors border-border/40">
                                                    <TableCell className="pl-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm">{u.fullName || u.username}</span>
                                                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">@{u.username}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {isAlreadyInClass ? (
                                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                                                                <CheckCircle className="h-3 w-3" /> Trong lớp
                                                            </div>
                                                        ) : (
                                                            <Button size="sm" onClick={() => handleAddStudent(u.id)} className="rounded-lg h-9 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold transition-all px-4">
                                                                Thêm
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
