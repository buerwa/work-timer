/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 确保这个路径是正确的
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"], // 添加 Inter 字体
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // 添加表单插件
  ],
};
