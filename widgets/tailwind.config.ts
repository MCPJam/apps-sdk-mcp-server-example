import type { Config } from 'tailwindcss';

export default {
  content: [
    './tasks/**/*.{ts,tsx,html}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
