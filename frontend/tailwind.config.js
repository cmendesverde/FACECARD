/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#050505',
        stone: '#ffffff',
        mist: '#f3f4f6',
        fog: '#d0d0d0',
        smoke: '#4f545a',
        accent: '#001a66',
        midnight: '#0b1020',
      },
      letterSpacing: {
        editorial: '0.15em',
      },
    },
  },
  plugins: [],
}
