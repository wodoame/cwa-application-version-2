/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix:'tw-',
  important:true,
  corePlugins:{
    preflight:false, 
  }, 
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors:{
        'project-blue':'#6054cf',
        'project-green':'#56969e',
        'project-gray':'#7286D3',
        'project-lightgray':'#e2e8ef',
        'project-white':'#f6f7f9',
      },
    },
  },
  plugins: [],
}


/*
npx tailwindcss -i ./dist/input.css -o ./dist/output.css --watch
*/