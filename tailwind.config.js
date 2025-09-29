module.exports = {
  content: [
    './*.html',
    './js/**/*.js',
    './data/**/*.json'
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          600: '#9333ea',
          700: '#7c3aed',
          900: '#581c87'
        },
        teal: {
          500: '#14b8a6'
        }
      }
    }
  },
  plugins: []
};
