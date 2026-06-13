import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F28C00',
          hover: '#FFAA33',
          active: '#D97706',
          light: '#FFD08A',
          bg: '#FFF6E8',
        },

        accent: {
          DEFAULT: '#00B8D9',
          hover: '#00A2C0',
          light: '#E8FAFD',
        },

        ink: '#111111',
        'slate-t': '#4A4A4A',
        'border-t': '#E5E5E5',
        surface: '#FFFFFF',
        background: '#FAFAFA',

        success: '#16A34A',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#00B8D9',
      },

      fontFamily: {
        sans: ['Noto Sans TC', 'Inter', 'sans-serif'],
      },

      boxShadow: {
        sm: '0 2px 8px rgba(0,0,0,0.06)',
        md: '0 6px 20px rgba(0,0,0,0.08)',
        lg: '0 12px 30px rgba(0,0,0,0.12)',
      },

      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
