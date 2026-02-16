import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Languages, FileText, Trophy, Flame, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '../services/api/axios'

const features = [
    { icon: BookOpen, title: 'Bài học phong phú', description: 'Hàng trăm bài học từ cơ bản đến nâng cao', color: 'text-primary-500' },
    { icon: Languages, title: 'Từ vựng đa dạng', description: 'Flashcard và bài tập giúp ghi nhớ lâu hơn', color: 'text-success-500' },
    { icon: FileText, title: 'Bài thi trực tuyến', description: 'Kiểm tra kiến thức với hệ thống chống gian lận', color: 'text-amber-500' },
    { icon: Trophy, title: 'Bảng xếp hạng', description: 'Cạnh tranh và thi đua cùng bạn bè', color: 'text-violet-500' },
    { icon: Flame, title: 'Nhiệm vụ hàng ngày', description: 'Duy trì streak để nhận thưởng mỗi ngày', color: 'text-amber-500' },
    { icon: Award, title: 'Huy hiệu thành tích', description: 'Đạt huy hiệu khi hoàn thành thử thách', color: 'text-violet-500' },
]

interface PublicStats {
    studentCount: number
    lessonCount: number
    vocabularyCount: number
}

const statsFallback = [
    { value: '1000+', label: 'Học sinh', color: 'text-primary-500' },
    { value: '200+', label: 'Bài học', color: 'text-success-500' },
    { value: '5000+', label: 'Từ vựng', color: 'text-amber-500' },
]

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
}

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
}

export default function Home() {
    const [stats, setStats] = useState<{ value: string; label: string; color: string }[] | null>(null)

    useEffect(() => {
        api.get<{ data: { data: PublicStats } }>('/public/stats')
            .then((res) => {
                const d = res.data?.data
                if (d) {
                    setStats([
                        { value: d.studentCount.toLocaleString(), label: 'Học sinh', color: 'text-primary-500' },
                        { value: d.lessonCount.toLocaleString(), label: 'Bài học', color: 'text-success-500' },
                        { value: d.vocabularyCount.toLocaleString(), label: 'Từ vựng', color: 'text-amber-500' },
                    ])
                } else {
                    setStats(statsFallback)
                }
            })
            .catch(() => setStats(statsFallback))
    }, [])

    const statsToShow = stats ?? statsFallback

    return (
        <div className="min-h-screen">
            {/* Hero - Flat design, decorative blobs */}
            <section className="relative py-24 lg:py-36 overflow-hidden bg-[var(--color-bg-secondary)]">
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-100/50 dark:bg-primary-900/20 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-success-100/50 dark:bg-success-900/20 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6" style={{ color: 'var(--color-text)' }}>
                        Học Tiếng Anh
                        <br />
                        <span className="text-primary-500">Thông Minh</span>
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        Nền tảng học tiếng Anh trực tuyến hiện đại. Học từ vựng, luyện thi, theo dõi tiến độ và thi đua cùng bạn bè.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-block text-center">
                            Bắt đầu học
                        </Link>
                        <Link to="/login" className="btn-secondary text-lg px-8 py-4 inline-block text-center">
                            Đăng nhập
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features - Fade-in on scroll, flat icons */}
            <section id="features" className="py-20" style={{ background: 'var(--color-bg)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                            Tính năng nổi bật
                        </h2>
                        <p className="max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                            Trải nghiệm học tập toàn diện với các công cụ hiện đại
                        </p>
                    </motion.div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                    >
                        {features.map((f, i) => {
                            const Icon = f.icon
                            return (
                                <motion.div key={i} variants={item} className="card p-6 group">
                                    <div className={`w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 ${f.color}`}>
                                        <Icon className="w-6 h-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-500 transition-colors duration-200" style={{ color: 'var(--color-text)' }}>
                                        {f.title}
                                    </h3>
                                    <p style={{ color: 'var(--color-text-secondary)' }}>{f.description}</p>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20" style={{ background: 'var(--color-bg-secondary)' }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                    >
                        {statsToShow.map((s, i) => (
                            <div key={i} className="card p-8 text-center">
                                <div className={`text-4xl md:text-5xl font-extrabold mb-2 ${s.color}`}>{s.value}</div>
                                <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20" style={{ background: 'var(--color-bg)' }}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="card p-12 border border-[var(--color-border)]"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                            Sẵn sàng bắt đầu?
                        </h2>
                        <p className="mb-8 max-w-lg mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
                            Đăng ký miễn phí ngay hôm nay và bắt đầu hành trình chinh phục tiếng Anh!
                        </p>
                        <Link to="/register" className="btn-primary text-lg px-8 py-4 inline-block">
                            Đăng ký ngay
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
