/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{njk,html,md,js}"],
  theme: {
    extend: {
      fontFamily: {
        mak:       ['"MAK"', "Georgia", "serif"],
        sans:      ['"Montserrat"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        page:  "var(--color-page)",
        ink:   "var(--color-ink)",
        muted: "var(--color-muted)",
        brand: {
          primary:   "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)",
          accent:    "var(--color-brand-accent)",
        },
      },
    },
  },
  plugins: [],
};

