import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { StudentProvider } from "./context/StudentContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GroupProvider } from "./context/GroupContext";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <StudentProvider>
        <ThemeProvider>
          <GroupProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </GroupProvider>
        </ThemeProvider>
      </StudentProvider>
    </AuthProvider>
  </React.StrictMode>
);
