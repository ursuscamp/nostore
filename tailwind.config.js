/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./Shared (Extension)/Resources/*.{html,js}'],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/forms')],
};
