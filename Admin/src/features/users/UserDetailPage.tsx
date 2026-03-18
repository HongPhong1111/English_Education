import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Loader2, Edit, Coins, Flame, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn, formatDate } from '@/lib/utils'
import type { ApiResponse, User } from '@/types/api'

export default function UserDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get<ApiResponse<User>>(`/users/${id}`)
                setUser(response.data.data)
            } catch (error) {
                toast.error('Không thể tải thông tin người dùng')
                navigate('/users')
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [id, navigate])

    const getRoleBadge = (role: string) => {
        const config: Record<string, { label: string; bg: string; text: string }> = {
            ROLE_ADMIN: { label: 'ADMIN', bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400' },
            ROLE_SCHOOL: { label: 'TRƯỜNG', bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
            ROLE_TEACHER: { label: 'GIÁO VIÊN', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
            ROLE_STUDENT: { label: 'HỌC SINH', bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
        }
        const c = config[role] || { label: role, bg: 'bg-muted', text: 'text-muted-foreground' }
        return <span className={cn("px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase border border-current/10", c.bg, c.text)}>{c.label}</span>
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-bold text-muted-foreground">Đang tải chi tiết...</p>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="rounded-xl">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Chi tiết tài khoản</h1>
                        <p className="text-muted-foreground font-medium">Xem thông tin chi tiết về người dùng.</p>
                    </div>
                </div>
                <Link to={`/users/edit/${user.id}`}>
                    <Button className="rounded-xl gap-2 font-black bg-primary px-6 h-11 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                        <Edit className="h-4 w-4" /> Chỉnh sửa
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden col-span-1">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-2xl mb-6">
                            <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                                {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-black text-foreground">{user.fullName}</h2>
                        <p className="text-muted-foreground font-bold mt-1">@{user.username}</p>
                        
                        <div className="mt-8 w-full space-y-3">
                            <div className={cn(
                                "flex items-center gap-3 p-3 rounded-2xl border border-border/50 transition-all",
                                user.isActive !== false ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600" : "bg-red-500/5 border-red-500/10 text-red-600"
                            )}>
                                {user.isActive !== false ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                <span className="text-xs font-black uppercase tracking-widest">{user.isActive !== false ? 'Hoạt động' : 'Đang bị khóa'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden md:col-span-2">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Thông tin hệ thống
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-1.5 font-bold">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Mail className="h-3 w-3" /> Địa chỉ Email
                                </Label>
                                <p className="text-foreground">{user.email}</p>
                            </div>
                            <div className="space-y-1.5 font-bold">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Calendar className="h-3 w-3" /> Ngày tham gia
                                </Label>
                                <p className="text-foreground">{user.createdAt ? formatDate(user.createdAt) : '—'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Thống kê hoạt động</Label>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-3 bg-amber-500/10 text-amber-600 px-4 py-2.5 rounded-2xl border border-amber-500/20">
                                        <Coins className="h-5 w-5" />
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black leading-none">{user.coins?.toLocaleString() ?? 0}</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter">Tổng xu</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-orange-500/10 text-orange-600 px-4 py-2.5 rounded-2xl border border-orange-500/20">
                                        <Flame className="h-5 w-5" />
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black leading-none">{user.streakDays ?? 0}</span>
                                            <span className="text-[9px] font-black uppercase tracking-tighter">Ngày học</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Vai trò tài khoản</Label>
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map(r => <div key={r}>{getRoleBadge(r)}</div>)}
                                </div>
                            </div>
                        </div>

                        {(user.schoolName || user.className) && (
                            <div className="pt-6 border-t border-border/50">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-4">Thông tin đơn vị</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {user.schoolName && (
                                        <div className="space-y-1 font-bold">
                                            <p className="text-[10px] text-muted-foreground uppercase">Trường học</p>
                                            <p className="text-foreground">{user.schoolName}</p>
                                        </div>
                                    )}
                                    {user.className && (
                                        <div className="space-y-1 font-bold">
                                            <p className="text-[10px] text-muted-foreground uppercase">Lớp học</p>
                                            <p className="text-foreground">{user.className}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
