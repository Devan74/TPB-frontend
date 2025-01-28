/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // flowbite-svelte
        primary: {
          '50': '#eff9ff',
        '100': '#dcf0fd',
        '200': '#c0e6fd',
        '300': '#95d7fb',
        '400': '#63bff7',
        '500': '#3fa2f2',
        '600': '#2382e6',
        '700': '#216fd4',
        '800': '#215aac',
        '900': '#204d88',
        '950': '#183053',
      }
      }
    }
  },
  plugins: [require('flowbite/plugin')],
  darkMode: 'class',
}
 