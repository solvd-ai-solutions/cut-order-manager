/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'solv-teal': '#4FB3A6',
        'solv-coral': '#F29E8E',
        'solv-lavender': '#C5A3E0',
        'solv-black': '#000000',
        'solv-white': '#FFFFFF',
      },
      fontFamily: {
        'solv': ['Inter', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'solv-h1': ['28px', { lineHeight: '36px' }],
        'solv-h2': ['20px', { lineHeight: '28px' }],
        'solv-body': ['16px', { lineHeight: '24px' }],
        'solv-small': ['14px', { lineHeight: '20px' }],
      },
      spacing: {
        'solv-container': '24px',
        'solv-component': '16px',
        'solv-grid': '16px',
      },
      borderRadius: {
        'solv': '8px',
      },
      borderWidth: {
        'solv': '2px',
      },
    },
  },
  plugins: [],
} 