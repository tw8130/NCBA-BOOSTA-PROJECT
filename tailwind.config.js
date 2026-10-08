/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Remapped existing tokens (Step 1 requirement)
        boosta: {
          navy: '#39302D',       // remapped to Cocoa
          blue: '#3AB3E5',       // remapped to Sky
          teal: '#00A8A9',       // remapped to Mediterranean
          sky: '#EBF7FC',        // remapped to Light Sky tint
          cocoa: '#39302D',
          sun: '#F8E200',
          coral: '#E4032C',
          passion: '#9F197E',
          'sky-hover': '#2A9ED0',
          'sky-dark': '#2188B5',
        },
        // Authoritative brand tokens (A5)
        cocoa: {
          DEFAULT: '#39302D',
          dark: '#2A2321',
          light: '#4E433F',
        },
        sky: {
          DEFAULT: '#3AB3E5',
          hover: '#2A9ED0',
          dark: '#2188B5',
          tint: '#EBF7FC',
        },
        sun: {
          DEFAULT: '#F8E200',
          dark: '#E0CB00',
          tint: '#FEFDE6',
        },
        mediterranean: {
          DEFAULT: '#00A8A9',
          hover: '#008E8F',
          tint: '#E6F7F7',
        },
        coral: {
          DEFAULT: '#E4032C',
          hover: '#C70226',
          tint: '#FDE6E9',
        },
        passion: {
          DEFAULT: '#9F197E',
          tint: '#F6E8F3',
        },
        // Surfaces for light and dark modes
        surface: {
          light: '#F7F8FA',
          paper: '#FFFFFF',
          border: '#EDF2F7',
          'dark-bg': '#0D1117',
          'dark-paper': '#161B22',
          'dark-border': '#30363D',
        },
        // Semantic text tokens
        text: {
          'light-primary': '#39302D',
          'light-secondary': '#525252',
          'light-muted': '#9AA0A6',
          'dark-primary': '#F0F6FC',
          'dark-secondary': '#C9D1D9',
          'dark-muted': '#8B949E',
        },
      },
      fontFamily: {
        sans: ['"Century Gothic"', 'CenturyGothic', 'AppleGothic', 'Questrial', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        input: '4px',
        btn: '4px',
        chip: '4px',
        card: '6px',
        badge: '20px',
      },
      boxShadow: {
        none: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
      },
      letterSpacing: {
        tightest: '-0.02em',
        'header-track': '0.5px',
      },
      fontSize: {
        'page-title': ['18px', { lineHeight: '24px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'section-title': ['15px', { lineHeight: '20px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'card-title': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'table-header': ['9px', { lineHeight: '12px', letterSpacing: '0.5px', fontWeight: '600' }],
        'caption-sm': ['10px', { lineHeight: '14px', fontWeight: '400' }],
        'badge-sm': ['10px', { lineHeight: '14px', fontWeight: '500' }],
      },
      width: {
        'sidebar-desktop': '195px',
        'sidebar-collapsed': '50px',
      },
      height: {
        navbar: '42px',
        input: '38px',
        button: '38px',
      },
      minHeight: {
        touch: '44px',
        input: '38px',
        button: '38px',
      },
    },
  },
  plugins: [],
}
