import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { School, ArrowLeft, Loader2, Save, MapPin, Phone, Mail, Calendar, Edit } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, School as SchoolType, SchoolRequest } from '@/types/api'

export default function SchoolEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState<SchoolRequest>({
        name: '',
        address: '',
        phone: '',
        email: '',
        trialEndDate: '',
        isActive: true,
    })
    const [schoolName, setSchoolName] = useState('')

    useEffect(() => {
        const fetchSchool = async () => {
            try {
                const response = await api.get<ApiResponse<SchoolType>>(`/schools/${id}`)
                const school = response.data.data
                setSchoolName(school.name)
                setForm({
                    name: school.name,
                    address: school.address || '',
                    phone: school.phone || '',
                    email: school.email || '',
                    trialEndDate: school.trialEndDate || '',
                    isActive: school.isActive ?? true,
                })
            } catch (error) {
                toast.error('Không thể tải thông tin trường học')
                navigate('/schools')
            } finally {
                setLoading(false)
            }
        }
        fetchSchool()
    }, [id, navigate])

    const handleUpdate = async () => {
        if (!form.name.trim()) {
            toast.error('Vui lòng nhập tên trường')
            return
        }

        setSubmitting(true)
        try {
            await api.put(`/schools/${id}`, form)
            toast.success('Cập nhật trường học thành công')
            navigate('/schools')
        } catch {
            toast.error('Cập nhật thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-bold text-muted-foreground">Đang tải thông tin...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/schools')} className="rounded-xl">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Chỉnh sửa trường học</h1>
                    <p className="text-muted-foreground font-medium">Cập nhật thông tin cho <span className="text-foreground font-bold">{schoolName}</span></p>
                </div>
            </div>

            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        Chi tiết thay đổi
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="grid gap-2">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tên trường học *</Label>
                        <Input 
                            value={form.name} 
                            onChange={(e) => setForm({...form, name: e.target.value})} 
                            className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> Địa chỉ
                        </Label>
                        <Input 
                            value={form.address || ''} 
                            onChange={(e) => setForm({...form, address: e.target.value})} 
                            className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Số điện thoại
                            </Label>
                            <Input 
                                value={form.phone || ''} 
                                onChange={(e) => setForm({...form, phone: e.target.value})} 
                                className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Mail className="h-3 w-3" /> Email liên hệ
                            </Label>
                            <Input 
                                type="email"
                                value={form.email || ''} 
                                onChange={(e) => setForm({...form, email: e.target.value})} 
                                className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Ngày hết hạn dùng thử
                            </Label>
                            <Input 
                                type="date" 
                                value={form.trialEndDate || ''} 
                                onChange={(e) => setForm({...form, trialEndDate: e.target.value})} 
                                className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Trạng thái hoạt động</Label>
                            <div className="flex items-center h-12 px-4 bg-muted/20 rounded-xl border border-border/50">
                                <label className="flex items-center gap-3 cursor-pointer w-full">
                                    <input 
                                        type="checkbox" 
                                        checked={form.isActive} 
                                        onChange={(e) => setForm({...form, isActive: e.target.checked})}
                                        className="h-5 w-5 rounded-lg border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                    />
                                    <span className="text-sm font-bold">{form.isActive ? 'Đang hoạt động' : 'Tạm dừng'}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-12 rounded-xl font-bold border-2" 
                            onClick={() => navigate('/schools')}
                            disabled={submitting}
                        >
                            Hủy bỏ
                        </Button>
                        <Button 
                            className="flex-1 h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20 gap-2" 
                            onClick={handleUpdate}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Lưu thay đổi</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
