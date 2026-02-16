import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import NotificationComponent from '../notifications/Notification'
import ThemeToggle from '../ui/ThemeToggle'
import Badge from '../ui/Badge'

const Header = () => {
    const { user, isAuthenticated, logout } = useAuthStore()
    const { roleLabel } = useRole()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-[250ms]"
            style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <span className="text-xl font-bold text-primary-500">
                            EnglishLearn
                        </span>
                    </Link>

                    {!isAuthenticated && (
                        <nav className="hidden md:flex items-center space-x-8">
                            <Link
                                to="/"
                                className="hover:text-primary-500 transition-colors duration-200"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Trang chủ
                            </Link>
                            <a
                                href="#features"
                                className="hover:text-primary-500 transition-colors duration-200"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Tính năng
                            </a>
                        </nav>
                    )}

                    <div className="flex items-center space-x-3">
                        <ThemeToggle />
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-3">
                                {user?.id && <NotificationComponent userId={user.id} />}
                                <Badge variant="info">{roleLabel}</Badge>
                                <Link
                                    to="/profile"
                                    className="text-sm font-medium hover:text-primary-500 transition-colors duration-200"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    {user?.fullName}
                                </Link>
                                <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="text-sm hover:text-primary-500 transition-colors duration-200"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
