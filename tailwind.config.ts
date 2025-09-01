import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'selector',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
	'./node_modules/@uploadthing/react/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1rem',
  			sm: '1.5rem',
  			lg: '2rem'
  		},
  		screens: {
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1200px'
  		}
  	},
  	extend: {
  		screens: {
  			xs: '320px',
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1200px',
  			'2xl': '1400px'
  		},
  		fontFamily: {
  			sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
  			eczar: ['var(--font-eczar)', 'serif']
  		}
  	}
  },
  plugins: [],
};

export default config;