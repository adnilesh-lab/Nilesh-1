import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import TestApp from "@/TestApp";
import { Toaster } from "sonner";

const root = ReactDOM.createRoot(document.getElementById("root"));
// Temporarily use TestApp to verify the app is working
// Change back to <App /> once the black screen issue is resolved
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
);
