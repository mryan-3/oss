const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
    corePlugins: {
        preflight: false,
        container: false
    },
    darkMode: ['class', '[data-theme="dark"]'],
    content: ['./src/**/*.{jsx,tsx,html}'],
    theme: {
        extend: {
            fontFamily: {
                pressStart: ['"Press Start 2P"', ...fontFamily.sans],
                sans: ['"Inter"', ...fontFamily.sans],
                jakarta: ['"Plus Jakarta Sans"', ...fontFamily.sans],
                mono: ['"Fira Code"', ...fontFamily.mono]
            },
            colors: {
                zenetra: '#5171ff',
                main: '#88aaee',
                secondary: '#a388ee',
                secondaryAccent: '#e3dff2',
                overlay: 'rgba(0,0,0,0.8)',
                // light mode
                bg: '#dfe5f2',
                text: '#000',
                border: '#000',

                // dark mode
                darkBg: '#272933',
                darkText: '#eeefe9',
                darkBorder: '#000',
                secondaryBlack: '#1b1b1b'
            }
        }
    },
    plugins: []
}
