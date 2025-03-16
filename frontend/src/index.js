import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import AppTheme from "./shared-theme/AppTheme";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider theme={AppTheme}>
    <App />
  </ThemeProvider>
);
