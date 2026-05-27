/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#E8EBF2',
          100: '#C5CCDD',
          200: '#9FAAC4',
          300: '#7888AC',
          400: '#52679A',
          500: '#324B7E',
          600: '#1F3766',
          700: '#152A52',
          800: '#0F2042',
          900: '#0A1A3D',
          950: '#06122E',
        },
        revs: {
          50: '#FCE7EB',
          100: '#F8C4CB',
          200: '#F099A4',
          300: '#E76E7D',
          400: '#DD4358',
          500: '#C8102E',
          600: '#A40D26',
          700: '#7F0A1E',
          800: '#5B0716',
          900: '#36040D',
        },
        ink: {
          50: '#F7F8FA',
          100: '#EEF0F4',
          200: '#DCDFE7',
          300: '#B8BECC',
          400: '#8A92A6',
          500: '#5A6378',
          600: '#3E4658',
          700: '#2A303E',
          800: '#1B202A',
          900: '#0F1218',
        },
      },
      fontFamily: {
        display: [
          'Inter Tight',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10, 26, 61, 0.04), 0 8px 28px -8px rgba(10, 26, 61, 0.18)',
        glow: '0 0 0 1px rgba(200, 16, 46, 0.25), 0 8px 32px -8px rgba(200, 16, 46, 0.4)',
        inner: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
