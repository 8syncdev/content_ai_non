const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      // use colors only specified
      white: colors.white,
      black: colors.black,
      gray: colors.gray,
      slate: colors.slate,
      blue: colors.blue,
      indigo: colors.indigo,
      green: colors.green,
      emerald: colors.emerald,
      red: colors.red,
      yellow: colors.yellow,
      orange: colors.orange,
      purple: colors.purple,
      pink: colors.pink,
      transparent: 'transparent',
      current: 'currentColor',
    },
    extend: {},
  },
  plugins: [],
}
