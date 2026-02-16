import { useEffect, useState, useCallback } from 'react'
import {
    Layers,
    List,
    ChevronLeft,
    ChevronRight,
    Search,
    Volume2,
    BookmarkPlus,
    AlertCircle,
    Shuffle,
    Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { vocabularyApi, VocabularyResponse } from '../../services/api/vocabularyApi'
import { mistakeApi } from '../../services/api/mistakeApi'
import FlashCard from '../../components/ui/FlashCard'
import DataTable from '../../components/ui/DataTable'
import PageHero from '../../components/ui/PageHero'
import Skeleton from '../../components/ui/Skeleton'

type ViewMode = 'flashcard' | 'list'

export default function VocabularyPage() {
    const user = useAuthStore((s) => s.user)
    const [mode, setMode] = useState<ViewMode>('flashcard')

    const [flashcards, setFlashcards] = useState<VocabularyResponse[]>([])
    const [flashcardIndex, setFlashcardIndex] = useState(0)
    const [flashcardLoading, setFlashcardLoading] = useState(true)
    const [flashcardError, setFlashcardError] = useState<string | null>(null)
    const [addingMistake, setAddingMistake] = useState(false)
    const [mistakeAdded, setMistakeAdded] = useState<Set<number>>(new Set())

    const [listVocab, setListVocab] = useState<VocabularyResponse[]>([])
    const [listLoading, setListLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

    const fetchFlashcards = useCallback(async () => {
        setFlashcardLoading(true)
        setFlashcardError(null)
        try {
            const data = await vocabularyApi.getRandomFlashcards(20)
            setFlashcards(data)
            setFlashcardIndex(0)
            setMistakeAdded(new Set())
        } catch (err) {
            console.error('Failed to fetch flashcards:', err)
            setFlashcardError('Không thể tải flashcard. Vui lòng thử lại.')
        } finally {
            setFlashcardLoading(false)
        }
    }, [])

    const fetchVocabList = useCallback(async (keyword: string) => {
        setListLoading(true)
        try {
            const data = await vocabularyApi.search(keyword)
            setListVocab(data)
        } catch (err) {
            console.error('Failed to search vocabulary:', err)
        } finally {
            setListLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchFlashcards()
    }, [fetchFlashcards])

    useEffect(() => {
        if (mode === 'list') {
            fetchVocabList(searchTerm)
        }
    }, [mode]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        if (searchTimeout) clearTimeout(searchTimeout)
        const timeout = setTimeout(() => {
            fetchVocabList(value)
        }, 400)
        setSearchTimeout(timeout)
    }

    const playAudio = (url: string) => {
        const audio = new Audio(url)
        audio.play().catch(() => {})
    }

    const handleAddMistake = async (vocabId: number) => {
        if (!user?.id || addingMistake || mistakeAdded.has(vocabId)) return
        setAddingMistake(true)
        try {
            await mistakeApi.addMistake({ vocabularyId: vocabId })
            setMistakeAdded((prev) => new Set(prev).add(vocabId))
        } catch (err) {
            console.error('Failed to add mistake:', err)
        } finally {
            setAddingMistake(false)
        }
    }

    const currentCard = flashcards[flashcardIndex]
    const progressPercent = flashcards.length > 0 ? ((flashcardIndex + 1) / flashcards.length) * 100 : 0

    const tableColumns = [
        {
            key: 'word',
            label: 'Từ vựng',
            render: (item: Record<string, unknown>) => {
                const vocab = item as unknown as VocabularyResponse
                return (
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-[var(--color-text)]">{vocab.word}</span>
                        {vocab.audioUrl && (
                            <button
                                onClick={() => playAudio(vocab.audioUrl!)}
                                className="p-1.5 rounded-lg hover:bg-primary-500/15 text-primary-500 transition-all duration-200 hover:scale-110"
                                title="Phát âm"
                            >
                                <Volume2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )
            },
        },
        {
            key: 'meaning',
            label: 'Nghĩa',
            render: (item: Record<string, unknown>) => {
                const vocab = item as unknown as VocabularyResponse
                return <span className="text-[var(--color-text)]">{vocab.meaning}</span>
            },
        },
        {
            key: 'pronunciation',
            label: 'Phiên âm',
            render: (item: Record<string, unknown>) => {
                const vocab = item as unknown as VocabularyResponse
                return (
                    <span className="italic text-sm text-[var(--color-text-secondary)]">
                        {vocab.pronunciation ? `/${vocab.pronunciation}/` : '—'}
                    </span>
                )
            },
        },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <PageHero
                title="Từ vựng"
                subtitle="Ôn tập flashcard và tra cứu từ vựng"
                icon={<Layers className="w-7 h-7" />}
                iconBg="violet"
            >
                <div
                    className="flex gap-1 p-1.5 rounded-xl w-fit"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                >
                    <motion.button
                        onClick={() => setMode('flashcard')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            mode === 'flashcard' ? 'bg-violet-500 text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                        }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Layers className="w-4 h-4" />
                        Flashcard
                    </motion.button>
                    <motion.button
                        onClick={() => setMode('list')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            mode === 'list' ? 'bg-violet-500 text-white shadow-md' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                        }`}
                        whileTap={{ scale: 0.98 }}
                    >
                        <List className="w-4 h-4" />
                        Danh sách
                    </motion.button>
                </div>
            </PageHero>

            {mode === 'flashcard' && (
                <div>
                    {flashcardLoading ? (
                        <div className="max-w-lg mx-auto space-y-6">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-16 rounded" />
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                            <Skeleton className="h-2 w-full rounded-full" />
                            <Skeleton className="h-[260px] w-full rounded-2xl" />
                            <div className="flex justify-between">
                                <Skeleton className="h-10 w-24 rounded-xl" />
                                <Skeleton className="h-10 w-32 rounded-xl" />
                                <Skeleton className="h-10 w-24 rounded-xl" />
                            </div>
                        </div>
                    ) : flashcardError ? (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-16 rounded-2xl bg-[var(--color-bg-secondary)]"
                        >
                            <AlertCircle className="w-14 h-14 text-red-400 mb-4" />
                            <p className="font-medium text-[var(--color-text)] mb-4">{flashcardError}</p>
                            <button onClick={fetchFlashcards} className="btn-primary">
                                Thử lại
                            </button>
                        </motion.div>
                    ) : flashcards.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="card p-12 text-center rounded-2xl"
                        >
                            <Sparkles className="w-12 h-12 text-violet-500/60 mx-auto mb-4" />
                            <p className="text-[var(--color-text-secondary)]">
                                Chưa có từ vựng nào. Hãy học bài để mở khóa từ vựng!
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-lg mx-auto space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <motion.p
                                    key={flashcardIndex}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-sm font-medium text-[var(--color-text-secondary)]"
                                >
                                    <span className="font-bold text-primary-500">{flashcardIndex + 1}</span>
                                    <span className="mx-1">/</span>
                                    {flashcards.length}
                                </motion.p>
                                <motion.button
                                    onClick={fetchFlashcards}
                                    className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-violet-500/15 hover:text-violet-500 transition-all duration-200"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Shuffle className="w-4 h-4" />
                                    Trộn lại
                                </motion.button>
                            </div>

                            <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--color-bg-secondary)]">
                                <motion.div
                                    className="h-full rounded-full bg-primary-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                {currentCard && (
                                    <motion.div
                                        key={currentCard.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <FlashCard
                                            front={
                                                <div>
                                                    <p className="text-3xl font-bold mb-3 text-[var(--color-text)]">
                                                        {currentCard.word}
                                                    </p>
                                                    {currentCard.audioUrl && (
                                                        <motion.button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                playAudio(currentCard.audioUrl!)
                                                            }}
                                                            className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-primary-500/15 text-primary-500 hover:bg-primary-500/25 transition-colors"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Volume2 className="w-4 h-4" />
                                                            Phát âm
                                                        </motion.button>
                                                    )}
                                                </div>
                                            }
                                            back={
                                                <div className="space-y-2 text-left">
                                                    <p className="text-xl font-semibold text-[var(--color-text)]">
                                                        {currentCard.meaning}
                                                    </p>
                                                    {currentCard.pronunciation && (
                                                        <p className="text-sm italic text-[var(--color-text-secondary)]">
                                                            /{currentCard.pronunciation}/
                                                        </p>
                                                    )}
                                                    {currentCard.exampleSentence && (
                                                        <p className="text-sm mt-3 text-[var(--color-text-secondary)]">
                                                            "{currentCard.exampleSentence}"
                                                        </p>
                                                    )}
                                                </div>
                                            }
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center justify-between">
                                <motion.button
                                    onClick={() => setFlashcardIndex((i) => Math.max(0, i - 1))}
                                    disabled={flashcardIndex === 0}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-500/15 hover:text-primary-500 transition-colors duration-200"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Trước
                                </motion.button>

                                {currentCard && (
                                    <motion.button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleAddMistake(currentCard.id)
                                        }}
                                        disabled={addingMistake || mistakeAdded.has(currentCard.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed ${
                                            mistakeAdded.has(currentCard.id)
                                                ? 'bg-success-500/15 text-success-500'
                                                : 'bg-red-500/15 text-red-500 hover:bg-red-500/25'
                                        }`}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <BookmarkPlus className="w-4 h-4" />
                                        {mistakeAdded.has(currentCard.id) ? 'Đã thêm' : 'Thêm sổ lỗi'}
                                    </motion.button>
                                )}

                                <motion.button
                                    onClick={() =>
                                        setFlashcardIndex((i) => Math.min(flashcards.length - 1, i + 1))
                                    }
                                    disabled={flashcardIndex >= flashcards.length - 1}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--color-bg-tertiary)] text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-500/15 hover:text-primary-500 transition-colors duration-200"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Sau
                                    <ChevronRight className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {mode === 'list' && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                        <input
                            type="text"
                            placeholder="Tìm từ vựng..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <DataTable
                        columns={tableColumns}
                        data={listVocab as unknown as Record<string, unknown>[]}
                        loading={listLoading}
                        emptyMessage={
                            searchTerm
                                ? `Không tìm thấy từ cho "${searchTerm}"`
                                : 'Nhập từ khóa để tìm kiếm.'
                        }
                    />
                </motion.div>
            )}
        </div>
    )
}
