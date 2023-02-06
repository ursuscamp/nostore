/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./Shared*/**/*.{html,js}'],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/forms')],
};
