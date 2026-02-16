import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
    variant?: ButtonVariant
    size?: ButtonSize
    children: ReactNode
    className?: string
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-primary-500 text-white hover:brightness-110 active:scale-[0.98]',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.98]',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 active:scale-[0.98]',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98]',
}

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', children, className = '', disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`
                    font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${variantClasses[variant]}
                    ${sizeClasses[size]}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${className}
                `}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'

export default Button
