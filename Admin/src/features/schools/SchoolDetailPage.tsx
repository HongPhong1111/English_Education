import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2, Edit, MapPin, Phone, Mail, Calendar, CheckCircle, XCircle, Users, GraduationCap, School as SchoolIcon } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn, formatDate } from '@/lib/utils'
import type { ApiResponse, School as SchoolType } from '@/types/api'

export default function SchoolDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [school, setSchool] = useState<SchoolType | null>(null)

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const response = await api.get<ApiResponse<SchoolType>>(`/schools/${id}`)
                setSchool(response.data.data)
            } catch (error) {
                toast.error('Không thể tải thông tin trường học')
                navigate('/schools')
            } finally {
                setLoading(false)
            }
        }
        fetchSchool()
    }, [id, navigate])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-bold text-muted-foreground">Đang tải chi tiết...</p>
            </div>
        )
    }

    if (!school) return null

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/schools')} className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Chi tiết trường học</h1>
                        <p className="text-muted-foreground font-medium">Thông tin quản lý và thống kê của cơ sở.</p>
                    </div>
                </div>
                <Link to={`/schools/edit/${school.id}`}>
                    <Button className="rounded-xl gap-2 font-black bg-primary px-6 h-11 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                        <Edit className="h-4 w-4" /> Chỉnh sửa
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden col-span-1">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <div className="h-28 w-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-black mb-6 shadow-inner border border-primary/20">
                            {school.name.charAt(0)}
                        </div>
                        <h2 className="text-xl font-black text-foreground">{school.name}</h2>
                        <p className="text-muted-foreground font-bold mt-1 uppercase tracking-widest text-[10px]">Mã trường: #{school.id}</p>
                        
                        <div className="mt-8 w-full space-y-3">
                            <div className={cn(
                                "flex items-center gap-3 p-4 rounded-2xl border border-border/50 transition-all",
                                school.isActive ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" : "bg-amber-500/5 border-amber-500/10 text-amber-600"
                            )}>
                                {school.isActive ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                <span className="text-xs font-black uppercase tracking-widest">{school.isActive ? 'Đang hoạt động' : 'Đang tạm dừng'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 space-y-6">
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <SchoolIcon className="h-5 w-5 text-primary" />
                                Thông tin liên hệ & Quản lý
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1.5 ">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Địa chỉ cơ sở
                                    </Label>
                                    <p className="text-foreground font-bold">{school.address || 'Chưa cập nhật'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Ngày tham gia hệ thống
                                    </Label>
                                    <p className="text-foreground font-bold">{school.createdAt ? formatDate(school.createdAt) : '—'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-1.5 font-bold">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="h-3 w-3" /> Email liên hệ
                                    </Label>
                                    <p className="text-foreground">{school.email || '—'}</p>
                                </div>
                                <div className="space-y-1.5 font-bold">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Phone className="h-3 w-3" /> Số điện thoại
                                    </Label>
                                    <p className="text-foreground">{school.phone || '—'}</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-4">Gói dịch vụ</Label>
                                <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-foreground uppercase italic tracking-widest">Premium Trial</p>
                                        <p className="text-[10px] text-muted-foreground font-bold">Hết hạn: {school.trialEndDate || 'Vĩnh viễn'}</p>
                                    </div>
                                    <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase">Standard</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center text-center">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-3">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-2xl font-black text-foreground">{school.teacherCount || 0}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Giáo viên</span>
                        </div>
                        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center text-center">
                            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-3">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <span className="text-2xl font-black text-foreground">{school.studentCount || 0}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Học sinh</span>
                        </div>
                        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex flex-col items-center text-center">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                                <Link to="#" className="h-full w-full flex items-center justify-center"><SchoolIcon className="h-5 w-5" /></Link>
                            </div>
                            <span className="text-2xl font-black text-foreground">{school.classCount || 0}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Lớp học</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
