/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: '#5b8cfa',
        accent: '#153e75',
        muted: '#6b7280',
        surface: '#ffffff',
        bg: '#f6f9ff',
        text: '#0f1724',
        warm: '#ffd580'
      },
      borderRadius: {
        lg: '12px'
      },
      boxShadow: {
        'soft': '0 6px 18px rgba(15,23,42,0.06)'
      }
    }
  },
  plugins: []
}
