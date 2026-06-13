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
          hover:   '#E87800',
          light:   '#FFB54F',
          bg:      '#FFF4DF',
        },
        accent: {
          DEFAULT: '#00B8D9',
          hover:   '#00A2C0',
          light:   '#E8FBFF',
        },
        ink:       '#231815',
        'slate-t': '#6E6258',
        'border-t':'#F1DECA',
        surface:   '#FFF8ED',
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'pop':     { '0%': { scale: '0' }, '80%': { scale: '1.08' }, '100%': { scale: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'pop':     'pop 0.4s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}

export default config
