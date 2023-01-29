/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./Shared (Extension)/**/*.{html,js}'],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/forms')],
};
