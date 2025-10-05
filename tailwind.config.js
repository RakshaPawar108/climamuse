/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--cm-color-primary-600)",
        primary700: "var(--cm-color-primary-700)",
        secondary: "var(--cm-color-secondary-500)",
        bgcanvas: "var(--cm-bg-canvas)",
        bgcard: "var(--cm-bg-card)",
        text: {
          primary: "var(--cm-text-primary)",
          secondary: "var(--cm-text-secondary)",
          muted: "var(--cm-text-muted)",
        },
      },
      boxShadow: {
        sm: "var(--cm-shadow-sm)",
        md: "var(--cm-shadow-md)",
      },
      borderRadius: {
        sm: "var(--cm-radius-sm)",
        md: "var(--cm-radius-md)",
        lg: "var(--cm-radius-lg)",
        pill: "var(--cm-radius-pill)",
      },
    },
  },
  plugins: [],
};
