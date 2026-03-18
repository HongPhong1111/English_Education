import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { ROLE_OPTIONS } from '@/lib/roles'


export default function UserCreatePage() {
    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roles: [] as string[]
    })

    const handleCreateUser = async () => {
        if (!newUser.username || !newUser.email || !newUser.password || !newUser.fullName) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }
        if (newUser.roles.length === 0) {
            toast.error('Vui lòng chọn ít nhất một vai trò')
            return
        }

        setSubmitting(true)
        try {
            await api.post('/users', newUser)
            toast.success(`Đã tạo người dùng ${newUser.username}`)
            navigate('/users')
        } catch (error: unknown) {
            const msg = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : null
            toast.error(msg || 'Tạo người dùng thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleRole = (role: string) => {
        setNewUser(prev => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }))
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="rounded-xl">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight">Tạo người dùng mới</h1>
                    <p className="text-muted-foreground font-medium">Thêm thành viên mới vào hệ thống quản lý.</p>
                </div>
            </div>

            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Thông tin chi tiết
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="fullName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Họ và tên *</Label>
                        <Input 
                            id="fullName" 
                            value={newUser.fullName} 
                            onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} 
                            className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                            placeholder="VD: Nguyễn Văn A" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Username *</Label>
                            <Input 
                                id="username" 
                                value={newUser.username} 
                                onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                                className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                                placeholder="VD: langmaster01" 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email *</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                value={newUser.email} 
                                onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                                className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium" 
                                placeholder="VD: user@example.com" 
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Mật khẩu *</Label>
                        <div className="relative">
                            <Input 
                                id="password" 
                                type={showPassword ? "text" : "password"} 
                                value={newUser.password} 
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                                className="rounded-xl h-12 bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-medium pr-12" 
                                placeholder="••••••••" 
                            />
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="absolute right-0 top-0 h-full px-4 hover:bg-transparent" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Vai trò hệ thống *</Label>
                        <div className="flex flex-wrap gap-2">
                            {ROLE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggleRole(opt.value)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border border-border/50",
                                        newUser.roles.includes(opt.value)
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                            : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium italic">* Người dùng có thể có nhiều vai trò cùng lúc.</p>
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
                            className="flex-1 h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20" 
                            onClick={handleCreateUser}
                            disabled={submitting}
                        >
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Xác nhận tạo"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
