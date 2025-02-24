/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          800: '#4A3427',
          900: '#362821',
        },
        peach: {
          100: '#F5C7A9',
          200: '#E5B799',
        }
      },
      fontFamily: {
        'fuzzy': ['"Fuzzy Bubbles"', 'cursive'],
      },
      boxShadow: {
        'banner': '0 4px 60px -15px rgba(0, 0, 0, 0.1)',
      },
      textStroke: {
        'brown': '2px #6F4E37',
      },
      screens: {
        'xs': '375px',
        'ipad-mini': '768px',    // iPad Mini
        'ipad-air': '820px',     // iPad Air
        'ipad-pro': '1024px',    // iPad Pro
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-stroke-brown': {
          '-webkit-text-stroke': '2px #6F4E37',
          'text-stroke': '2px #6F4E37',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}