import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Search, ChevronLeft, ChevronRight, Coins, Eye, Flame, UserPlus, Trash2, CheckCircle, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Page, User } from '@/types/api'
import { useRole } from '@/app/useRole'

const ROLE_OPTIONS = [
    { label: 'Tất cả vai trò', value: '' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Học sinh', value: 'ROLE_STUDENT' },
    { label: 'Giáo viên', value: 'ROLE_TEACHER' },
    { label: 'Trường học', value: 'ROLE_SCHOOL' },
]

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [userStats, setUserStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        teacherCount: 0,
        studentCount: 0,
        totalCoins: 0
    })

    // Role-based permissions
    const { canCreateUser, canDeleteUser } = useRole()

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Page<User>>>(`/users?page=${page}&size=10&sort=id,asc`)
            setUsers(response.data.data.content)
            setTotalPages(response.data.data.totalPages)
            setTotalElements(response.data.data.totalElements)
        } catch {
            setUsers([])
            toast.error('Không thể tải danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await api.get<ApiResponse<any>>('/users/stats')
            if (response.data.success) {
                setUserStats(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching user stats:', error)
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchStats()
    }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleDeleteUser = async (userId: number, username: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
            return
        }

        try {
            await api.delete(`/users/${userId}`)
            toast.success(`Đã xóa người dùng ${username}`)
            fetchUsers()
        } catch (error: unknown) {
            const msg = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : null
            toast.error(msg || 'Xóa người dùng thất bại')
        }
    }

    const getRoleBadge = (role: string) => {
        const config: Record<string, { label: string; bg: string; text: string }> = {
            ROLE_ADMIN: { label: 'ADMIN', bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400' },
            ROLE_SCHOOL: { label: 'TRƯỜNG', bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
            ROLE_TEACHER: { label: 'GIÁO VIÊN', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
            ROLE_STUDENT: { label: 'HỌC SINH', bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
        }
        const c = config[role] || { label: role, bg: 'bg-muted', text: 'text-muted-foreground' }
        return <span className={cn("px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase", c.bg, c.text)}>{c.label}</span>
    }

    // Apply client-side filters
    const filtered = users.filter((u) => {
        const matchSearch =
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        const matchRole = !roleFilter || u.roles.includes(roleFilter)
        return matchSearch && matchRole
    })

    const stats = [
        { title: 'Tổng người dùng', value: userStats.totalUsers.toLocaleString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Đang hoạt động', value: userStats.activeUsers.toLocaleString(), icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Giáo viên', value: userStats.teacherCount.toLocaleString(), icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'Tổng xu hệ thống', value: userStats.totalCoins.toLocaleString(), icon: Coins, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Quản lý người dùng</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Quản lý và theo dõi thông tin học sinh, giáo viên trong hệ thống.</p>
                </div>
                {canCreateUser && (
                    <Link to="/users/create">
                        <Button className="h-12 px-6 rounded-xl gap-2 font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary">
                            <UserPlus className="h-5 w-5" /> Tạo người dùng mới
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardContent className="p-7">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-5", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{stat.title}</p>
                            <p className="text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="premium-card border-none shadow-xl dark:shadow-none bg-card overflow-hidden">
                <CardHeader className="p-8 pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                         <div className="flex items-center gap-2">
                              <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                                 {ROLE_OPTIONS.map((opt) => (
                                     <button
                                         key={opt.value}
                                         onClick={() => setRoleFilter(opt.value)}
                                         className={cn(
                                             "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                             roleFilter === opt.value 
                                                 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                                 : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
                                         )}
                                     >
                                         {opt.label}
                                     </button>
                                 ))}
                              </div>
                         </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Tìm kiếm..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                className="pl-11 pr-4 h-11 w-80 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-4">
                            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="font-bold text-muted-foreground">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                                        <TableHead className="h-14 font-black text-muted-foreground uppercase text-[10px] tracking-widest pl-8">Người dùng</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Vai trò</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Thống kê</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Trạng thái</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-8">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-20 font-bold">Không có người dùng nào được tìm thấy</TableCell></TableRow>
                                    ) : filtered.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/10 border-border/40 transition-colors h-24 group">
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border-none shadow-xl dark:shadow-none ring-1 ring-border/50 group-hover:ring-primary/30 transition-all">
                                                        <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                                                        <AvatarFallback className="bg-muted text-primary text-[10px] font-black">
                                                            {user.username.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-foreground leading-tight">{user.fullName}</span>
                                                        <span className="text-[10px] font-black text-muted-foreground/30 mt-1 uppercase tracking-tight truncate max-w-[200px]">@{user.username} · {user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-1.5 flex-wrap">
                                                    {user.roles.map((r) => <div key={r}>{getRoleBadge(r)}</div>)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="flex items-center gap-1.5 font-black text-sm text-foreground">
                                                        <Coins className="h-4 w-4 text-amber-500" /> {user.coins?.toLocaleString() ?? 0}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-bold text-xs text-orange-500">
                                                        <Flame className="h-3.5 w-3.5" /> {user.streakDays ?? 0}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-muted/30 border border-border/50">
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", user.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30')} />
                                                    <span className={user.isActive !== false ? 'text-emerald-500' : 'text-muted-foreground/30'}>
                                                        {user.isActive !== false ? 'Hoạt động' : 'Bị khóa'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex justify-end gap-2">
                                                    <Link to={`/users/${user.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                                                            <Eye className="h-4.5 w-4.5" />
                                                        </Button>
                                                    </Link>
                                                    <Link to={`/users/edit/${user.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-all">
                                                            <Edit className="h-4.5 w-4.5" />
                                                        </Button>
                                                    </Link>
                                                    {canDeleteUser && (
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all" onClick={() => handleDeleteUser(user.id, user.username)}>
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

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-8 px-2">
                        <p className="text-xs font-black text-muted-foreground/30 uppercase tracking-widest">
                            Hiển thị {page * 10 + 1}-{Math.min((page + 1) * 10, totalElements)} / {totalElements}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 text-muted-foreground/40 bg-background hover:bg-muted" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button className="h-10 w-10 rounded-xl font-black bg-primary shadow-lg shadow-primary/20">{page+1}</Button>
                            {page + 1 < totalPages && <Button variant="ghost" className="h-10 w-10 rounded-xl font-black text-muted-foreground/40 hover:bg-muted" onClick={() => setPage(page + 1)}>{page + 2}</Button>}
                            {page + 2 < totalPages && <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold text-muted-foreground" onClick={() => setPage(page + 2)}>{page + 3}</Button>}
                            {totalPages > 4 && <span className="px-1 text-muted-foreground/30">...</span>}
                            {totalPages > 1 && page < totalPages - 3 && <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold text-muted-foreground" onClick={() => setPage(totalPages - 1)}>{totalPages}</Button>}
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
