import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { School, ArrowLeft, Loader2, Save, MapPin, Phone, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { SchoolRequest } from '@/types/api'

export default function SchoolCreatePage() {
    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState<SchoolRequest>({
        name: '',
        address: '',
        phone: '',
        email: '',
        trialEndDate: '',
        isActive: true,
        managerUsername: '',
        managerPassword: '',
    })

    const handleCreate = async () => {
        if (!form.name.trim()) {
            toast.error('Vui lòng nhập tên trường')
            return
        }
        if (!form.managerUsername?.trim()) {
            toast.error('Vui lòng nhập tên đăng nhập quản lý')
            return
        }
        if (!form.managerPassword?.trim() || form.managerPassword.length < 6) {
            toast.error('Mật khẩu quản lý phải ít nhất 6 ký tự')
            return
        }

        setSubmitting(true)
        try {
            await api.post('/schools', form)
            toast.success('Thêm trường học thành công')
            navigate('/schools')
        } catch {
            toast.error('Thêm trường thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/schools')} className="rounded-xl">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Thêm trường học mới</h1>
                    <p className="text-muted-foreground font-medium">Khởi tạo cơ sở giáo dục mới trong hệ thống.</p>
                </div>
            </div>

            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <School className="h-5 w-5 text-primary" />
                        Thông tin cơ bản
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="grid gap-2">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tên trường học *</Label>
                        <Input 
                            value={form.name} 
                            onChange={(e) => setForm({...form, name: e.target.value})} 
                            className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                            placeholder="VD: THCS Nguyễn Du" 
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
                            placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" 
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
                                placeholder="0123.456.789" 
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
                                placeholder="school@example.com" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-border/50">
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
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Trạng thái ban đầu</Label>
                            <div className="flex items-center h-12 px-4 bg-muted/20 rounded-xl border border-border/50">
                                <label className="flex items-center gap-3 cursor-pointer w-full">
                                    <input 
                                        type="checkbox" 
                                        checked={form.isActive} 
                                        onChange={(e) => setForm({...form, isActive: e.target.checked})}
                                        className="h-5 w-5 rounded-lg border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                    />
                                    <span className="text-sm font-bold">{form.isActive ? 'Hoạt động ngay' : 'Tạm dừng'}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 pt-2">
                        <Label className="text-sm font-black text-primary uppercase tracking-[0.2em]">Tài khoản quản lý trường</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Username quản trị *</Label>
                                <Input 
                                    value={form.managerUsername} 
                                    onChange={(e) => setForm({...form, managerUsername: e.target.value})} 
                                    className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                                    placeholder="VD: admin_school_name" 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Mật khẩu *</Label>
                                <Input 
                                    type="password"
                                    value={form.managerPassword} 
                                    onChange={(e) => setForm({...form, managerPassword: e.target.value})} 
                                    className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                                    placeholder="••••••••" 
                                />
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
                            onClick={handleCreate}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Xác nhận tạo</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
