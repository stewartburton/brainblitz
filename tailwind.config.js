/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Frenchie Trivia Brand Palette
        primary: {
          DEFAULT: '#6C5CE7',
          light: '#A29BFE',
          dark: '#4A3CB5',
        },
        secondary: {
          DEFAULT: '#FDA085',
          light: '#FEC4A8',
          dark: '#E87D5C',
        },
        accent: {
          DEFAULT: '#00CEC9',
          light: '#55EFC4',
          dark: '#00A89D',
        },
        correct: '#00B894',
        wrong: '#E17055',
        streak: '#FDCB6E',
        bg: {
          DEFAULT: '#1A1035',
          card: 'rgba(30, 20, 60, 0.85)',
          elevated: '#2D1F5E',
        },
      },
      fontFamily: {
        heading: ['System'],
        body: ['System'],
      },
    },
  },
  plugins: [],
};
