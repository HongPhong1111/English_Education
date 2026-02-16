/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
                    400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
                    800: '#1e40af', 900: '#1e3a8a',
                },
                success: {
                    50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669',
                },
                amber: {
                    50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706',
                },
                violet: {
                    50: '#f5f3ff', 100: '#ede9fe', 500: '#8b5cf6', 600: '#7c3aed',
                },
                secondary: {
                    50: '#f0fdf4', 100: '#dcfce7', 500: '#10b981', 600: '#059669',
                },
            },
            fontFamily: {
                sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
            },
            transitionDuration: {
                DEFAULT: '250ms',
                fast: '200ms',
                normal: '250ms',
                slow: '300ms',
            },
            boxShadow: {
                card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
                'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
            },
        },
    },
    plugins: [],
}
