import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Plus, Search, Edit, Trash2, Loader2, TrendingUp, CheckCircle, Users, BookOpen, ChevronLeft, ChevronRight, School, ChevronRight as ArrowRight } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useRole } from '@/app/useRole'
import type { ApiResponse, ClassRoom, School as SchoolType, Page, User } from '@/types/api'

export default function ClassRoomsPage() {
    const { isAdmin } = useRole()
    const [rooms, setRooms] = useState<ClassRoom[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<ClassRoom | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

    const fetchRooms = async () => {
        setLoading(true)
        try {
            const meRes = await api.get<ApiResponse<User>>('/users/me')
            const me = meRes.data.data

            let url = '/classes?size=1000'
            if (me.roles.includes('ROLE_SCHOOL') && me.schoolId) {
                url = `/classes/school/${me.schoolId}?size=1000`
            }

            const r = await api.get<ApiResponse<any>>(url)
            const data = r.data.data
            if (Array.isArray(data)) {
                setRooms(data)
            } else if (data && data.content) {
                setRooms(data.content)
            } else {
                setRooms([])
            }
        } catch {
            toast.error('Không thể tải danh sách lớp học')
            setRooms([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRooms()
    }, [])

    const handleDelete = async () => {
        if (!deleting) return
        setSubmitting(true)
        try {
            await api.delete(`/classes/${deleting.id}`)
            toast.success(`Đã xóa lớp "${deleting.name}"`)
            setDeleteOpen(false)
            setDeleting(null)
            fetchRooms()
        } catch {
            toast.error('Xóa lớp thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const filtered = rooms.filter((r) => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
            (r.schoolName && r.schoolName.toLowerCase().includes(search.toLowerCase())) ||
            (r.teacherName && r.teacherName.toLowerCase().includes(search.toLowerCase()))
        
        const matchStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && r.isActive) || 
            (statusFilter === 'inactive' && !r.isActive)
            
        return matchSearch && matchStatus
    })

    const stats = [
        { title: 'Tổng số lớp', value: rooms.length.toString(), change: '+3 trường mới', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', trend: 'up' },
        { title: 'Lớp đang dạy', value: rooms.filter(r => r.isActive).length.toString(), change: 'Đang hoạt động', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Tổng học viên', value: rooms.reduce((sum, r) => sum + (r.studentCount ?? 0), 0).toString(), change: 'Toàn hệ thống', icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ]

    const selectClassName =
        'flex h-11 w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-bold'

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Quản lý lớp học</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Theo dõi và quản lý các lớp học và sĩ số học sinh.</p>
                </div>
                <Button asChild className="h-12 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary">
                    <Link to="/classrooms/create">
                        <Plus className="h-5 w-5" /> Thêm lớp học
                    </Link>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardContent className="p-7 flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-5", stat.bg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                <p className="text-4xl font-black mt-2 text-foreground">{stat.value}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {stat.trend === 'up' && (
                                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 rounded-lg py-1 uppercase tracking-wider">
                                        <TrendingUp className="h-3 w-3" /> {stat.change}
                                    </div>
                                )}
                                {(stat.title.includes('dạy') || stat.title.includes('học viên')) && (
                                    <div className="text-muted-foreground/30 font-black text-[10px] uppercase tracking-widest pt-1">
                                        {stat.change}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-primary" />
                            </div>
                            Danh sách lớp học
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Tìm lớp học..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-11 pr-4 h-11 w-72 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                            <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                                <button 
                                    onClick={() => setStatusFilter('all')}
                                    className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'all' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground/40 hover:text-foreground")}
                                >
                                    Tất cả
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('active')}
                                    className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'active' ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-muted-foreground/40 hover:text-foreground")}
                                >
                                    Hoạt động
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('inactive')}
                                    className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'inactive' ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "text-muted-foreground/40 hover:text-foreground")}
                                >
                                    Tạm dừng
                                </button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-4">
                            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="font-bold text-muted-foreground/60">Đang tải dữ liệu...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-2">
                             <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                                <Search className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <p className="font-bold text-foreground/80 text-lg">Không tìm thấy lớp học nào</p>
                            <p className="text-muted-foreground/60">Hãy thử tìm kiếm với từ khóa khác</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                                        <TableHead className="w-20 h-14 font-black text-muted-foreground uppercase text-[10px] tracking-widest pl-8">ID</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Lớp học</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Quản lý</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Sĩ số</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Trạng thái</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-8">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((room) => (
                                        <TableRow key={room.id} className="hover:bg-muted/10 border-border/40 transition-colors h-24 group">
                                            <TableCell className="font-bold text-muted-foreground/30 text-sm pl-8">#{room.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/20 transition-colors">
                                                        <span className="text-primary font-black text-lg">{room.name.charAt(0)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                         <span className="font-bold text-foreground leading-tight">{room.name}</span>
                                                         <div className="flex items-center gap-2 mt-1">
                                                             <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">{room.academicYear || 'Chưa rõ năm học'}</span>
                                                             <span className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-widest">•</span>
                                                             <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Tạo: {formatDate(room.createdAt)}</span>
                                                         </div>
                                                     </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                                                        <School className="h-3.5 w-3.5 text-muted-foreground/40" />
                                                        {room.schoolName || '—'}
                                                    </div>
                                                    <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter flex items-center gap-2">
                                                        <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                                        GV: {room.teacherName || 'Chưa phân công'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button asChild variant="ghost" className="inline-flex flex-col items-center hover:bg-muted/50 h-auto p-2 rounded-xl transition-all">
                                                    <Link to={`/classrooms/${room.id}`}>
                                                        <span className="text-lg font-black text-primary">{room.studentCount ?? 0}</span>
                                                        <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Học sinh</span>
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider",
                                                    room.isActive 
                                                        ? 'bg-emerald-500/10 text-emerald-600' 
                                                        : 'bg-amber-500/10 text-amber-600'
                                                )}>
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", room.isActive ? 'bg-emerald-600' : 'bg-amber-600')} />
                                                    {room.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all">
                                                        <Link to={`/classrooms/edit/${room.id}`}>
                                                            <Edit className="h-4.5 w-4.5" />
                                                        </Link>
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive transition-all"
                                                            onClick={() => {
                                                                setDeleting(room)
                                                                setDeleteOpen(true)
                                                            }}
                                                        >
                                                            <Trash2 className="h-4.5 w-4.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    
                    {/* Pagination Placeholder */}
                    <div className="flex items-center justify-between mt-8 px-2">
                        <p className="text-sm font-bold text-muted-foreground/60">
                            Hiển thị {filtered.length} kết quả
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground/40 bg-background" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button className="h-10 w-10 rounded-xl font-bold bg-primary text-white">1</Button>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground/60 bg-background hover:bg-muted" disabled>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="rounded-3xl p-8 border-none shadow-2xl space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Xác nhận xóa lớp</DialogTitle>
                        <DialogDescription className="font-medium">
                            Bạn có chắc muốn xóa lớp &quot;<span className="text-foreground font-bold">{deleting?.name}</span>&quot;? Tận cả dữ liệu sĩ số sẽ bị ảnh hưởng.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting} className="h-12 rounded-xl flex-1 font-black transition-all hover:bg-muted border-2">HỦY</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting} className="h-12 rounded-xl flex-1 font-black">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            XÓA LỚP
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
