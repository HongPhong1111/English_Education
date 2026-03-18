import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, ArrowLeft, Loader2, Save, School, User as UserIcon, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useRole } from '@/app/useRole'
import type { ApiResponse, ClassRoomRequest, School as SchoolType, Page, User } from '@/types/api'
import { cn } from '@/lib/utils'

export default function ClassRoomCreatePage() {
    const navigate = useNavigate()
    const { isAdmin } = useRole()
    const [submitting, setSubmitting] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [form, setForm] = useState<ClassRoomRequest>({
        name: '',
        schoolId: undefined,
        teacherId: undefined,
        academicYear: '',
        isActive: true,
    })

    const [schools, setSchools] = useState<SchoolType[]>([])
    const [teachers, setTeachers] = useState<User[]>([])
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true)
            try {
                // Fetch schools and users (for teachers)
                const [schoolsRes, usersRes, meRes] = await Promise.allSettled([
                    api.get<ApiResponse<SchoolType[]>>('/schools'),
                    api.get<ApiResponse<Page<User>>>('/users', { params: { page: 0, size: 1000 } }),
                    api.get<ApiResponse<User>>('/users/me')
                ])

                if (schoolsRes.status === 'fulfilled') {
                    setSchools(schoolsRes.value.data.data)
                }

                if (usersRes.status === 'fulfilled') {
                    const allUsers = usersRes.value.data.data.content
                    const teacherList = allUsers.filter((u) => u.roles.includes('ROLE_TEACHER'))
                    setTeachers(teacherList)
                }

                if (meRes.status === 'fulfilled') {
                    const me = meRes.value.data.data
                    setCurrentUser(me)
                    if (me.schoolId) {
                        setForm(prev => ({ ...prev, schoolId: me.schoolId }))
                    }
                }
            } catch {
                toast.error('Không thể tải dữ liệu bổ trợ')
            } finally {
                setLoadingData(false)
            }
        }
        fetchData()
    }, [])

    const handleCreate = async () => {
        if (!form.name.trim()) {
            toast.error('Vui lòng nhập tên lớp học')
            return
        }
        
        setSubmitting(true)
        try {
            await api.post('/classes', form)
            toast.success('Thêm lớp học thành công')
            navigate('/classrooms')
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Thêm lớp học thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const selectClassName =
        'flex h-12 w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-bold'

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/classrooms')} className="rounded-xl">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Thêm lớp học mới</h1>
                    <p className="text-muted-foreground font-medium">Khởi tạo lớp học mới và phân công quản lý.</p>
                </div>
            </div>

            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        Thông tin lớp học
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    {loadingData ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                            <p className="font-bold text-sm tracking-widest uppercase">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tên lớp học *</Label>
                                <Input 
                                    value={form.name} 
                                    onChange={(e) => setForm({...form, name: e.target.value})} 
                                    className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                                    placeholder="VD: Lớp 6A1, IELTS 01..." 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <School className="h-3 w-3" /> Trường học
                                    </Label>
                                    <select
                                        value={form.schoolId ?? ''}
                                        onChange={(e) => setForm({ ...form, schoolId: e.target.value ? Number(e.target.value) : undefined })}
                                        className={cn(selectClassName, !isAdmin && "opacity-60 cursor-not-allowed")}
                                        disabled={!isAdmin}
                                    >
                                        <option value="">-- Chọn trường --</option>
                                        {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <UserIcon className="h-3 w-3" /> Giáo viên chủ nhiệm
                                    </Label>
                                    <select
                                        value={form.teacherId ?? ''}
                                        onChange={(e) => setForm({ ...form, teacherId: e.target.value ? Number(e.target.value) : undefined })}
                                        className={selectClassName}
                                    >
                                        <option value="">-- Chọn giáo viên --</option>
                                        {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName || t.username}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/50">
                                <div className="grid gap-2">
                                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Năm học
                                    </Label>
                                    <Input 
                                        value={form.academicYear || ''} 
                                        onChange={(e) => setForm({...form, academicYear: e.target.value})} 
                                        className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                                        placeholder="VD: 2024-2025"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Trạng thái</Label>
                                    <select
                                        value={form.isActive ? 'true' : 'false'}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                                        className={selectClassName}
                                    >
                                        <option value="true">Đang hoạt động</option>
                                        <option value="false">Tạm dừng</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-12 rounded-xl font-bold border-2" 
                                    onClick={() => navigate('/classrooms')}
                                    disabled={submitting}
                                >
                                    Hủy bỏ
                                </Button>
                                <Button 
                                    className="flex-1 h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20 gap-2" 
                                    onClick={handleCreate}
                                    disabled={submitting}
                                >
                                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Xác nhận tạo</>}
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
