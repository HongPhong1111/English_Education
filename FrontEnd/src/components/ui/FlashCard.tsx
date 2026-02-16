import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'

interface FlashCardProps {
    front: ReactNode
    back: ReactNode
    onFlip?: (isFlipped: boolean) => void
}

export default function FlashCard({ front, back, onFlip }: FlashCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)

    const handleFlip = () => {
        const next = !isFlipped
        setIsFlipped(next)
        onFlip?.(next)
    }

    return (
        <motion.div
            className="w-full cursor-pointer select-none"
            style={{ perspective: '1200px' }}
            onClick={handleFlip}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="relative w-full"
                style={{ minHeight: '260px', transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            >
                <div
                    className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center border shadow-card-hover"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                    }}
                >
                    <div className="text-center">{front}</div>
                    <p className="mt-6 text-xs tracking-wide uppercase opacity-70 text-[var(--color-text-secondary)]">
                        Chạm để lật thẻ
                    </p>
                </div>
                <div
                    className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center border shadow-card-hover"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text)',
                    }}
                >
                    <div className="text-center">{back}</div>
                    <p className="mt-6 text-xs tracking-wide uppercase opacity-70 text-[var(--color-text-secondary)]">
                        Chạm để xem từ
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}
