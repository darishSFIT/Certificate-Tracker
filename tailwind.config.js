/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107',
        'samsung-blue': '#0085ff',
        'samsung-blue-light': '#5aafff',
        'samsung-blue-dark': '#0070dd',
        dark: {
          primary: '#000000', // AMOLED black
          secondary: '#121212', // Samsung OneUI card color
          accent: '#1F1F1F', // Samsung OneUI hover/active state
          text: {
            primary: '#FFFFFF',
            secondary: '#E0E0E0',
            muted: '#A0A0A0',
            accent: '#5aafff' // Samsung OneUI accent text
          }
        }
      },
      backgroundColor: {
        'dark-card': '#121212',
        'dark-hover': '#1A1A1A'
      },
      borderColor: {
        'dark-border': '#1A1A1A'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      borderRadius: {
        'oneui': '1.5rem',
      }
    },
  },
  plugins: [],
} 