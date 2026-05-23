/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B111E', // Very deep navy background
        surface: '#151D30',    // Slate/navy surface card color
        surfaceLight: '#1E2942', // Lighter slate navy for focus states
        border: '#2C3A5A',      // Accessible subtle slate borders
        
        primary: {
          DEFAULT: '#00F0FF',   // Neon cyan accent
          hover: '#00D8E6',
        },
        danger: {
          DEFAULT: '#FF3B30',   // Emergency red highlight
          hover: '#E02D22',
        },
        warning: {
          DEFAULT: '#FF9500',   // Amber warning indicator
          hover: '#E08200',
        },
        success: {
          DEFAULT: '#34C759',   // High-contrast emerald green
          hover: '#28A745',
        },
        muted: '#8A99AD',       // Soft accessibility-compliant grey for descriptions
        
        // --- Arogya Bandhu PWA Colors ---
        pwa: {
          bg: '#0B1C17',          // Darker forest green background
          surface: '#173026',     // Lighter card surface
          surfaceLight: '#234438', // Even lighter for selected states
          primary: '#A2D7C5',     // Soft mint green
          accent: '#FF6B57',      // Coral red/orange
          text: '#FFFFFF',        // White text
          muted: '#8BACA1',       // Muted text
          border: '#2A4A3D',      // Border line
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        display: ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      keyframes: {
        pulseBorder: {
          '0%, 100%': { borderColor: 'rgba(0, 240, 255, 0.4)' },
          '50%': { borderColor: 'rgba(0, 240, 255, 1)' },
        },
        pingRed: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '70%, 100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
      animation: {
        'border-glow': 'pulseBorder 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-red': 'pingRed 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
