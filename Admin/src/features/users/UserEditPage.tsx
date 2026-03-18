import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, ArrowLeft, Loader2, Save, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { ROLE_OPTIONS } from '@/lib/roles'
import type { ApiResponse, User } from '@/types/api'


export default function UserEditPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [editForm, setEditForm] = useState({
        fullName: '',
        email: '',
        roles: [] as string[],
        isActive: true,
        coins: 0
    })
    const [username, setUsername] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get<ApiResponse<User>>(`/users/${id}`)
                const user = response.data.data
                setUsername(user.username)
                setEditForm({
                    fullName: user.fullName || '',
                    email: user.email || '',
                    roles: [...user.roles],
                    isActive: user.isActive !== false,
                    coins: user.coins || 0
                })
            } catch (error) {
                toast.error('Không thể tải thông tin người dùng')
                navigate('/users')
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [id, navigate])

    const handleUpdateUser = async () => {
        setSubmitting(true)
        try {
            await api.put(`/users/${id}`, editForm)
            toast.success(`Đã cập nhật thông tin cho ${username}`)
            navigate('/users')
        } catch (error: unknown) {
            const msg = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : null
            toast.error(msg || 'Cập nhật thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleRole = (role: string) => {
        setEditForm(prev => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }))
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
                <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="rounded-xl">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Chỉnh sửa người dùng</h1>
                    <p className="text-muted-foreground font-medium">Cập nhật thông tin cho tài khoản <span className="text-foreground font-bold">@{username}</span></p>
                </div>
            </div>

            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Edit className="h-5 w-5 text-primary" />
                        Chỉnh sửa thông tin
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="grid gap-2">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Họ và tên</Label>
                        <Input 
                            value={editForm.fullName} 
                            onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} 
                            className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                        <Input 
                            type="email"
                            value={editForm.email} 
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                            className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Số lượng xu</Label>
                            <Input 
                                type="number" 
                                value={editForm.coins} 
                                onChange={(e) => setEditForm({...editForm, coins: parseInt(e.target.value) || 0})} 
                                className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Trạng thái tài khoản</Label>
                            <div className="flex items-center h-12 px-4 bg-muted/20 rounded-xl border border-border/50">
                                <label className="flex items-center gap-3 cursor-pointer w-full">
                                    <input 
                                        type="checkbox" 
                                        checked={editForm.isActive} 
                                        onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                                        className="h-5 w-5 rounded-lg border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                    />
                                    <span className="text-sm font-bold">{editForm.isActive ? 'Đang hoạt động' : 'Đang bị khóa'}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Vai trò hệ thống</Label>
                        <div className="flex flex-wrap gap-2">
                            {ROLE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggleRole(opt.value)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-border/50",
                                        editForm.roles.includes(opt.value)
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                            : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-12 rounded-xl font-bold border-2" 
                            onClick={() => navigate('/users')}
                            disabled={submitting}
                        >
                            Hủy bỏ
                        </Button>
                        <Button 
                            className="flex-1 h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20 gap-2" 
                            onClick={handleUpdateUser}
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
