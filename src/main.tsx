import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// 确保这一行没有被删除
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
