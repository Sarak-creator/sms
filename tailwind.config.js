/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        khmer: ["'Kantumruy Pro'", "'Battambang'", "system-ui", "sans-serif"],
        heading: ["'Kantumruy Pro'", "'Battambang'", "sans-serif"],
      },
      colors: {
        primary: {
          50: 'rgb(var(--color-primary-50, 239 246 255) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100, 219 234 254) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200, 191 219 254) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300, 147 197 253) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400, 96 165 250) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500, 59 130 246) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600, 37 99 235) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700, 29 78 216) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800, 30 64 175) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900, 30 58 138) / <alpha-value>)',
          950: 'rgb(var(--color-primary-950, 23 37 84) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-primary-600, 37 99 235) / <alpha-value>)',
        },
        blue: {
          50: 'rgb(var(--color-primary-50, 239 246 255) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100, 219 234 254) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200, 191 219 254) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300, 147 197 253) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400, 96 165 250) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500, 59 130 246) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600, 37 99 235) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700, 29 78 216) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800, 30 64 175) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900, 30 58 138) / <alpha-value>)',
          950: 'rgb(var(--color-primary-950, 23 37 84) / <alpha-value>)',
        },
        moeys: {
          50: 'rgb(var(--color-primary-50, 239 246 255) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100, 219 234 254) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200, 191 219 254) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300, 147 197 253) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400, 96 165 250) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500, 59 130 246) / <alpha-value>)',
          600: 'rgb(var(--color-primary-600, 37 99 235) / <alpha-value>)',
          700: 'rgb(var(--color-primary-700, 29 78 216) / <alpha-value>)',
          800: 'rgb(var(--color-primary-800, 30 64 175) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900, 30 58 138) / <alpha-value>)',
          950: 'rgb(var(--color-primary-950, 23 37 84) / <alpha-value>)',
        },
        gold: {
          400: 'rgb(var(--color-accent-400, 251 191 36) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500, 245 158 11) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600, 217 119 6) / <alpha-value>)',
        },
        accent: {
          400: 'rgb(var(--color-accent-400, 251 191 36) / <alpha-value>)',
          500: 'rgb(var(--color-accent-500, 245 158 11) / <alpha-value>)',
          600: 'rgb(var(--color-accent-600, 217 119 6) / <alpha-value>)',
        },
      },
    },
  },
  plugins: [],
};
